"""Import ChatGPT JSON/ZIP exports into a private, source-preserving corpus.

Only the Python standard library is used. Nothing in this module sends network
requests, evaluates archive content, extracts archive paths, or publishes data.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path, PurePosixPath
import platform
import re
import stat
import sys
from typing import Any
import uuid
import zipfile

VERSION = "1.0.1"
REPOSITORY = Path(__file__).resolve().parents[1]


class ImportLimitError(ValueError):
    """A hard limit prevents claiming a complete import."""


@dataclass(frozen=True)
class Limits:
    max_source_bytes: int = 512 * 1024 * 1024
    max_total_source_bytes: int = 2 * 1024 * 1024 * 1024
    max_json_bytes: int = 128 * 1024 * 1024
    max_zip_entries: int = 20000
    max_zip_uncompressed_bytes: int = 2 * 1024 * 1024 * 1024
    max_compression_ratio: int = 200
    max_conversations: int = 50000
    max_nodes: int = 500000
    max_messages: int = 250000
    max_json_depth: int = 100


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def write_json(path: Path, value: Any) -> None:
    with path.open("x", encoding="utf-8", newline="\n") as stream:
        json.dump(value, stream, ensure_ascii=True, indent=2, allow_nan=False)
        stream.write("\n")


def append_json(stream: Any, value: Any) -> None:
    stream.write(canonical(value).decode("utf-8") + "\n")


def default_output() -> Path:
    base = Path(os.environ.get("LOCALAPPDATA", str(Path.home() / ".local" / "share")))
    return base / "I-AM-Research" / "private-archive"


def private_output_base(path: Path) -> Path:
    resolved = path.expanduser().resolve()
    if resolved == REPOSITORY or REPOSITORY in resolved.parents:
        raise ValueError("Private output must be outside the repository, including ignored directories.")
    if any(part.casefold() == "web" for part in resolved.parts):
        raise ValueError("Private output cannot be placed in a WEB directory.")
    return resolved


def observed_time(value: Any) -> dict[str, Any]:
    result = {"raw": value, "utc": None, "source_timezone": None, "status": "MISSING" if value is None else "UNSUPPORTED"}
    try:
        if isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value):
            moment = datetime.fromtimestamp(value, timezone.utc)
            result.update(utc=moment.isoformat(), status="EPOCH_SECONDS", source_timezone="UTC epoch reference; author's local timezone unknown")
        elif isinstance(value, str):
            moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if moment.tzinfo is None:
                result["status"] = "TIMEZONE_UNKNOWN"
            else:
                result.update(utc=moment.astimezone(timezone.utc).isoformat(), status="EXPLICIT_OFFSET", source_timezone=str(moment.utcoffset()))
    except (ValueError, TypeError, OverflowError, OSError):
        result["status"] = "INVALID_OR_OUT_OF_RANGE"
    return result


def json_document(data: bytes, limits: Limits) -> tuple[Any, list[str]]:
    if len(data) > limits.max_json_bytes:
        raise ImportLimitError("JSON byte limit exceeded.")
    # Bound nesting before json.loads, including arrays. Braces inside strings do not count.
    text = data.decode("utf-8-sig")
    depth = 0
    quoted = escaped = False
    for char in text:
        if quoted:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                quoted = False
        elif char == '"':
            quoted = True
        elif char in "[{":
            depth += 1
            if depth > limits.max_json_depth:
                raise ImportLimitError("JSON nesting limit exceeded.")
        elif char in "]}":
            depth -= 1
    duplicate_keys: list[str] = []

    def object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        value = {}
        for key, item in pairs:
            if key in value:
                duplicate_keys.append(key)
            value[key] = item
        return value

    def reject_constant(value: str) -> None:
        raise ValueError("Non-standard JSON numeric constant: " + value)

    value = json.loads(text, object_pairs_hook=object_pairs, parse_constant=reject_constant)
    return value, duplicate_keys


def conversation_items(document: Any) -> tuple[list[tuple[str, Any, Any]], str]:
    """Return pointer, map-key hint, raw item. Unknown items remain reportable."""
    if isinstance(document, list):
        return [(f"/{i}", None, item) for i, item in enumerate(document)], "LIST"
    if not isinstance(document, dict):
        return [("", None, document)], "UNSUPPORTED"
    if "mapping" in document or "messages" in document:
        return [("", None, document)], "SINGLE_CONVERSATION"
    for wrapper in ("conversations", "items", "data"):
        if wrapper in document and isinstance(document[wrapper], (list, dict)):
            items, shape = conversation_items(document[wrapper])
            return [("/" + wrapper + pointer, hint, item) for pointer, hint, item in items], wrapper.upper() + "/" + shape
    if document and all(isinstance(item, dict) for item in document.values()):
        return [("/" + key.replace("~", "~0").replace("/", "~1"), key, item) for key, item in document.items()], "ID_MAP"
    return [("", None, document)], "UNSUPPORTED"


def safe_member(name: str) -> bool:
    # ZIP names are never used as disk destinations, but reject unsafe paths anyway.
    normalized = name.replace("\\", "/")
    path = PurePosixPath(normalized)
    return bool(normalized) and not path.is_absolute() and not re.match(r"^[a-zA-Z]:", normalized) and "\x00" not in normalized and ".." not in path.parts and ":" not in normalized


def attachment_references(message: dict[str, Any], inventory: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    references = []
    key_names = {"asset_pointer", "file_id", "attachment_id", "file_name", "filename", "download_url", "image_url"}

    def visit(value: Any, pointer: str) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                child = pointer + "/" + key.replace("~", "~0").replace("/", "~1")
                if key in key_names and isinstance(item, str):
                    references.append({"json_pointer": child, "key": key, "value": item})
                if key == "attachments" and isinstance(item, list):
                    for index, attachment in enumerate(item):
                        if isinstance(attachment, str):
                            references.append({"json_pointer": child + f"/{index}", "key": "attachments", "value": attachment})
                visit(item, child)
        elif isinstance(value, list):
            for index, item in enumerate(value):
                visit(item, pointer + f"/{index}")

    visit(message, "")
    files = [member for member in (inventory or []) if not member["is_directory"]]
    for ref in references:
        value = ref["value"]
        if re.match(r"https?://", value, re.I):
            ref.update(status="EXTERNAL_REFERENCE_NOT_FETCHED", candidate_members=[])
            continue
        if inventory is None:
            ref.update(status="ATTACHMENT_FILES_NOT_PROVIDED", candidate_members=[])
            continue
        exact = [m["entry_index"] for m in files if m["name"] == value]
        token = value.removeprefix("file-service://").removeprefix("sediment://")
        candidate = [m["entry_index"] for m in files if PurePosixPath(m["name"]).name == token or (len(token) >= 8 and PurePosixPath(m["name"]).name.startswith(token + "-"))]
        ref.update(status="MATCHED_EXACT_MEMBER" if exact else "CANDIDATE_FILENAME_OR_ID_MATCH" if candidate else "NOT_FOUND_IN_PROVIDED_ARCHIVE", candidate_members=exact or candidate)
    return references


def strings_in_content(value: Any):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings_in_content(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings_in_content(item)


def branch_view(mapping: dict[str, Any], current: Any) -> dict[str, Any]:
    issues = []
    reverse_path = []
    visited = set()
    cursor = current
    while cursor is not None:
        if not isinstance(cursor, str) or cursor not in mapping:
            issues.append({"kind": "CURRENT_ANCESTRY_DANGLING", "node": cursor})
            break
        if cursor in visited:
            issues.append({"kind": "CURRENT_ANCESTRY_CYCLE", "node": cursor})
            break
        visited.add(cursor)
        reverse_path.append(cursor)
        node = mapping[cursor]
        if not isinstance(node, dict):
            issues.append({"kind": "INVALID_NODE", "node": cursor})
            break
        cursor = node.get("parent")
    branches = []
    # Build reciprocal indexes once: a high-degree root must not cause O(n^2)
    # membership searches when validating every child's declared parent.
    child_indexes = {key: {child for child in node["children"] if isinstance(child, str)}
                     for key, node in mapping.items()
                     if isinstance(node, dict) and isinstance(node.get("children"), list)}
    for key, node in mapping.items():
        if not isinstance(node, dict):
            continue
        parent = node.get("parent")
        children = node.get("children")
        if parent is not None and (not isinstance(parent, str) or parent not in mapping):
            issues.append({"kind": "DANGLING_PARENT", "node": key, "parent": parent})
        elif isinstance(parent, str) and parent in child_indexes and key not in child_indexes[parent]:
            issues.append({"kind": "PARENT_CHILD_DISAGREEMENT", "node": parent, "child": key,
                           "detail": "Child declares parent but is absent from parent's explicit children list."})
        if isinstance(children, list):
            if len(children) > 1:
                branches.append({"node": key, "children": children})
            for child in children:
                if not isinstance(child, str) or child not in mapping:
                    issues.append({"kind": "DANGLING_CHILD", "node": key, "child": child})
                elif isinstance(mapping[child], dict) and mapping[child].get("parent") != key:
                    issues.append({"kind": "PARENT_CHILD_DISAGREEMENT", "node": key, "child": child})
        elif children is not None:
            issues.append({"kind": "INVALID_CHILDREN", "node": key})
    # Current-ancestry inspection alone misses malformed alternative branches.
    # Each parent chain is traversed at most once; every cyclic component is
    # recorded, while no alternate branch is discarded or repaired.
    resolved: set[str] = set()
    for start in mapping:
        trail: list[str] = []
        positions: dict[str, int] = {}
        cursor = start
        while isinstance(cursor, str) and cursor in mapping and cursor not in resolved:
            if cursor in positions:
                issues.append({"kind": "GRAPH_PARENT_CYCLE", "nodes": trail[positions[cursor]:]})
                break
            positions[cursor] = len(trail)
            trail.append(cursor)
            node = mapping[cursor]
            if not isinstance(node, dict):
                break
            cursor = node.get("parent")
        resolved.update(trail)
    return {"current_node": current, "current_ancestry_root_to_leaf": list(reversed(reverse_path)),
            "current_ancestry_complete": current is not None and not any(i["kind"].startswith("CURRENT_") or i["kind"] == "INVALID_NODE" for i in issues),
            "branch_points": branches, "issues": issues,
            "interpretation": "All nodes retained. Branches can represent edits or regenerations; neither cause nor authorship is inferred."}


class Corpus:
    def __init__(self, directory: Path, limits: Limits, keywords: list[str], as_of: datetime):
        self.directory, self.limits, self.keywords, self.as_of = directory, limits, keywords, as_of
        self.counts = Counter()
        self.unknown = Counter()
        self.roles = Counter()
        self.attachment_statuses = Counter()
        self.sources: list[dict[str, Any]] = []
        self.issues: list[dict[str, Any]] = []
        self.versions: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
        self.message_versions: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
        self.dates: list[tuple[str, str, str]] = []
        self.undated: list[str] = []
        self.streams = {name: (directory / (name + ".jsonl")).open("x", encoding="utf-8", newline="\n") for name in ("conversations", "messages", "unsupported", "keyword-candidates", "attachments")}

    def close(self) -> None:
        for stream in self.streams.values():
            stream.close()

    def bump(self, name: str, maximum: int) -> None:
        self.counts[name] += 1
        if self.counts[name] > maximum:
            raise ImportLimitError(name + " count limit exceeded; this run is incomplete.")

    def document(self, data: bytes, source: dict[str, Any], entry: dict[str, Any], inventory: list[dict[str, Any]] | None) -> None:
        provenance = {"source_id": source["source_id"], "source_filename": source["source_filename"], "source_sha256": source["sha256"],
                      "entry_name": entry.get("name"), "entry_index": entry.get("entry_index"), "document_sha256": digest(data)}
        try:
            document, duplicate_keys = json_document(data, self.limits)
        except ImportLimitError:
            raise
        except (ValueError, UnicodeError, RecursionError) as error:
            self.issues.append({**provenance, "kind": "UNREADABLE_JSON", "error_type": type(error).__name__, "raw_preserved": True})
            return
        if duplicate_keys:
            self.issues.append({**provenance, "kind": "DUPLICATE_JSON_OBJECT_KEYS", "keys": duplicate_keys,
                               "normalization": "Last value is used in parsed JSON; exact original bytes retain every occurrence."})
        selected = document
        selected_pointer = ""
        while isinstance(selected, dict) and "mapping" not in selected and "messages" not in selected:
            wrappers = [key for key in ("conversations", "items", "data") if isinstance(selected.get(key), (list, dict))]
            if not wrappers:
                break
            if len(wrappers) > 1:
                self.issues.append({**provenance, "kind": "MULTIPLE_CONVERSATION_CONTAINERS", "json_pointer": selected_pointer,
                                    "containers": wrappers, "normalization": "First recognized wrapper normalized; additional containers remain in exact original source bytes."})
            selected_pointer += "/" + wrappers[0]
            selected = selected[wrappers[0]]
        items, shape = conversation_items(document)
        entry.update(shape=shape, document_sha256=provenance["document_sha256"])
        for pointer, hint, raw in items:
            ref = {**provenance, "json_pointer": pointer}
            if not isinstance(raw, dict) or not (isinstance(raw.get("mapping"), dict) or isinstance(raw.get("messages"), (dict, list))):
                append_json(self.streams["unsupported"], {"source": ref, "raw": raw, "reason": "No recognized mapping/messages container"})
                self.counts["unsupported_records"] += 1
                self.issues.append({"kind": "UNSUPPORTED_CONVERSATION_RECORD", "source": ref})
                continue
            self.conversation(raw, hint, ref, inventory)

    def conversation(self, raw: dict[str, Any], hint: Any, ref: dict[str, Any], inventory: list[dict[str, Any]] | None) -> None:
        self.bump("conversations", self.limits.max_conversations)
        instance = "conversation:" + digest(canonical(ref))
        version = digest(canonical(raw))
        logical = raw.get("conversation_id", raw.get("id", hint))
        identity = canonical(logical).decode("utf-8") if logical is not None else "unknown-payload:" + version
        self.versions[identity][version].append(instance)
        mapping = raw.get("mapping")
        if isinstance(mapping, dict) and self.counts["nodes"] + len(mapping) > self.limits.max_nodes:
            raise ImportLimitError("nodes count limit exceeded before graph inspection; this run is incomplete.")
        if isinstance(mapping, dict) and isinstance(raw.get("messages"), (dict, list)):
            self.issues.append({"kind": "MULTIPLE_MESSAGE_CONTAINERS", "conversation_instance_id": instance,
                                "normalization": "mapping normalized; additional messages container retained in raw conversation."})
        graph = branch_view(mapping, raw.get("current_node")) if isinstance(mapping, dict) else {
            "current_node": raw.get("current_node"), "current_ancestry_root_to_leaf": [], "current_ancestry_complete": False,
            "branch_points": [], "issues": [], "interpretation": "Flat message container: graph topology is unknown and is not synthesized."}
        graph_nodes = []
        messages = []
        if isinstance(mapping, dict):
            for key, node in mapping.items():
                self.bump("nodes", self.limits.max_nodes)
                graph_nodes.append({"mapping_key": key, "node_id": node.get("id") if isinstance(node, dict) else None,
                                    "parent": node.get("parent") if isinstance(node, dict) else None,
                                    "children": node.get("children") if isinstance(node, dict) else None,
                                    "raw": node})
                if isinstance(node, dict) and isinstance(node.get("message"), dict):
                    messages.append((key, node["message"]))
                elif isinstance(node, dict) and node.get("message") is not None:
                    self.issues.append({"kind": "UNSUPPORTED_MESSAGE_VALUE", "conversation_instance_id": instance, "node_key": key})
                elif not isinstance(node, dict):
                    self.issues.append({"kind": "UNSUPPORTED_NODE_VALUE", "conversation_instance_id": instance, "node_key": key})
        else:
            container = raw.get("messages")
            iterator = container.items() if isinstance(container, dict) else enumerate(container)
            for key, value in iterator:
                if isinstance(value, dict):
                    messages.append((str(key), value))
                else:
                    self.issues.append({"kind": "UNSUPPORTED_MESSAGE_VALUE", "conversation_instance_id": instance, "message_key": key})
        normalized = {"conversation_instance_id": instance, "conversation_id": logical, "conversation_id_source": "conversation_id" if "conversation_id" in raw else "id" if "id" in raw else "map_key" if hint is not None else "UNKNOWN",
                      "version_sha256": version, "source": ref, "title": raw.get("title"),
                      "create_time": observed_time(raw.get("create_time")), "update_time": observed_time(raw.get("update_time")),
                      "graph": graph, "nodes": graph_nodes, "raw": raw}
        append_json(self.streams["conversations"], normalized)
        if logical is None:
            self.unknown["conversation_id"] += 1
        if raw.get("current_node") is None:
            self.unknown["current_node"] += 1
        self.counts["graph_issues"] += len(graph["issues"])
        if graph["issues"]:
            self.issues.append({"kind": "GRAPH_STRUCTURE_ISSUES", "conversation_instance_id": instance, "issues": graph["issues"]})
        self.candidates(instance, None, "title", [raw.get("title")] if isinstance(raw.get("title"), str) else [])
        for node_key, message in messages:
            self.message(instance, identity, node_key, message, ref, graph, inventory)

    def message(self, conversation: str, identity: str, node: str, raw: dict[str, Any], ref: dict[str, Any], graph: dict[str, Any], inventory: list[dict[str, Any]] | None) -> None:
        self.bump("messages", self.limits.max_messages)
        instance = conversation + ":message:" + digest(node.encode("utf-8", errors="surrogatepass"))
        author = raw.get("author")
        role = author.get("role") if isinstance(author, dict) else raw.get("role")
        metadata = raw.get("metadata") if isinstance(raw.get("metadata"), dict) else {}
        model = metadata.get("model_slug", raw.get("model"))
        if not isinstance(model, str) or not model:
            model = None
        language = metadata.get("language", raw.get("language"))
        created, updated = observed_time(raw.get("create_time")), observed_time(raw.get("update_time"))
        version = digest(canonical(raw))
        if raw.get("id") is not None:
            self.message_versions[canonical([identity, raw["id"]]).decode("utf-8")][version].append(instance)
        references = attachment_references(raw, inventory)
        for attachment in references:
            self.attachment_statuses[attachment["status"]] += 1
            append_json(self.streams["attachments"], {"message_instance_id": instance, "source": ref, **attachment})
        observed = {"message_instance_id": instance, "conversation_instance_id": conversation, "node_key": node,
                    "message_id": raw.get("id"), "version_sha256": version, "role": role, "author": author,
                    "create_time": created, "update_time": updated, "model": model, "model_status": "EXPLICIT_METADATA" if model else "UNKNOWN",
                    "declared_default_model": metadata.get("default_model_slug"), "language": language,
                    "language_status": "EXPLICIT_METADATA" if language is not None else "UNKNOWN",
                    "on_current_ancestry": node in graph["current_ancestry_root_to_leaf"] if graph["current_node"] is not None and graph["current_ancestry_complete"] else None,
                    "content": raw.get("content"), "attachment_references": references, "source": ref, "raw": raw}
        append_json(self.streams["messages"], observed)
        self.roles[str(role) if isinstance(role, str) else "UNKNOWN"] += 1
        for name, value in (("message_id", raw.get("id")), ("author_field", author), ("role", role), ("model", model), ("language", language)):
            if value is None:
                self.unknown[name] += 1
        if not isinstance(author, dict) or not isinstance(author.get("name"), str) or not author["name"].strip():
            self.unknown["declared_author_name"] += 1
        if created["utc"]:
            self.dates.append((created["utc"], instance, conversation))
        else:
            self.undated.append(instance)
            self.unknown["message_creation_time_utc"] += 1
        self.candidates(conversation, instance, "content", strings_in_content(raw.get("content")))

    def candidates(self, conversation: str, message: str | None, field: str, texts: Any) -> None:
        if not self.keywords:
            return
        matches = set()
        for text in texts:
            for keyword in self.keywords:
                if keyword.casefold() in text.casefold():
                    matches.add(keyword)
        if matches:
            append_json(self.streams["keyword-candidates"], {"conversation_instance_id": conversation, "message_instance_id": message,
                        "field": field, "keywords": sorted(matches), "status": "DISCOVERY_CANDIDATE_ONLY", "author_inference": None})
            self.counts["keyword_candidate_records"] += 1

    def reports(self) -> dict[str, Any]:
        duplicate = {"conversations": [], "messages": []}
        conflict = {"conversations": [], "messages": []}
        for name, index in (("conversations", self.versions), ("messages", self.message_versions)):
            for identity, versions in index.items():
                for version, instances in versions.items():
                    if len(instances) > 1:
                        duplicate[name].append({"identity": identity, "version_sha256": version, "instances": instances})
                if len(versions) > 1:
                    conflict[name].append({"identity": identity, "versions": dict(versions), "status": "SAME_ID_DIFFERENT_PAYLOAD", "resolution": "All preserved; no preferred or latest version selected."})
        write_json(self.directory / "duplicates.json", duplicate)
        write_json(self.directory / "conflicting-versions.json", conflict)
        valid = sorted(self.dates)
        views = {"as_of_utc": self.as_of.isoformat(), "basis": "Message create_time only, all branches; inclusive calendar-year bounds; no conversation-time substitution.", "unknown_date_message_instances": self.undated}
        for years in (2, 3):
            try:
                cutoff = self.as_of.replace(year=self.as_of.year - years)
            except ValueError:
                cutoff = self.as_of.replace(year=self.as_of.year - years, day=28)
            selected = [(instant, message, conversation) for instant, message, conversation in valid if cutoff <= datetime.fromisoformat(instant) <= self.as_of]
            views[f"last_{years}_years"] = {"start_inclusive_utc": cutoff.isoformat(), "end_inclusive_utc": self.as_of.isoformat(),
                "message_count": len(selected), "message_instances": [i[1] for i in selected], "conversation_instances": sorted({i[2] for i in selected})}
        write_json(self.directory / "date-views.json", views)
        coverage = {"counts": dict(self.counts), "count_unit": "Source occurrences; duplicates and conflicting versions remain included.",
                    "unknown_metadata": dict(self.unknown), "roles": dict(self.roles), "attachment_reference_statuses": dict(self.attachment_statuses),
                    "message_dates": {"minimum_utc": valid[0][0] if valid else None, "maximum_utc": valid[-1][0] if valid else None,
                                      "known_count": len(valid), "unknown_count": len(self.undated), "future_relative_to_as_of": sum(datetime.fromisoformat(i[0]) > self.as_of for i in valid),
                                      "observed_utc_months": dict(sorted(Counter(i[0][:7] for i in valid).items()))},
                    "duplicate_groups": {key: len(value) for key, value in duplicate.items()}, "conflicting_identity_groups": {key: len(value) for key, value in conflict.items()},
                    "issues": self.issues, "coverage_limitations": ["Coverage describes supplied sources only, not an account's complete history.",
                        "Source bytes are retained exactly; normalized JSON preserves parsed values, not whitespace, number spelling or duplicate object keys.",
                        "Attachment matching uses metadata only; candidate filenames are not verified file identity or readable content.",
                        "Author identity, missing language, local timezone, model and regeneration cause are never inferred.",
                        "Two-year and three-year views are indexes; the full corpus is never filtered by dates or keywords."]}
        write_json(self.directory / "coverage.json", coverage)
        return coverage


def copy_source(path: Path, destination: Path, maximum: int) -> tuple[str, int]:
    hasher = hashlib.sha256()
    size = 0
    with path.open("rb") as source, destination.open("xb") as target:
        while chunk := source.read(1024 * 1024):
            size += len(chunk)
            if size > maximum:
                raise ImportLimitError("Source byte limit exceeded.")
            hasher.update(chunk)
            target.write(chunk)
    return hasher.hexdigest(), size


def ingest_source(corpus: Corpus, path: Path, ordinal: int) -> None:
    path = path.expanduser().resolve(strict=True)
    if not path.is_file():
        raise ValueError("Each input must be a JSON or ZIP file.")
    if path.stat().st_size > corpus.limits.max_source_bytes:
        raise ImportLimitError("Source byte limit exceeded.")
    if sum(source["bytes"] for source in corpus.sources) + path.stat().st_size > corpus.limits.max_total_source_bytes:
        raise ImportLimitError("Total source byte limit exceeded.")
    source_id = f"source-{ordinal:04d}"
    source_directory = corpus.directory / "sources" / source_id
    source_directory.mkdir(parents=True, exist_ok=False)
    suffix = path.suffix.casefold()
    preserved = source_directory / ("original" + suffix if suffix in (".json", ".zip") else "original.bin")
    remaining_source_bytes = corpus.limits.max_total_source_bytes - sum(source["bytes"] for source in corpus.sources)
    checksum, size = copy_source(path, preserved, min(corpus.limits.max_source_bytes, remaining_source_bytes))
    source = {"source_id": source_id, "source_filename": path.name, "source_path": str(path), "sha256": checksum, "bytes": size,
              "preserved_copy": preserved.relative_to(corpus.directory).as_posix(), "entries": []}
    corpus.sources.append(source)
    if suffix not in (".json", ".zip"):
        corpus.issues.append({"kind": "UNSUPPORTED_SOURCE_FORMAT", "source_id": source_id, "extension": suffix, "raw_preserved": True})
        return
    if path.suffix.casefold() == ".zip":
        try:
            with zipfile.ZipFile(preserved) as archive:
                infos = archive.infolist()
                if len(infos) > corpus.limits.max_zip_entries:
                    raise ImportLimitError("ZIP entry count limit exceeded.")
                if sum(i.file_size for i in infos) > corpus.limits.max_zip_uncompressed_bytes:
                    raise ImportLimitError("ZIP total uncompressed byte limit exceeded.")
                for index, info in enumerate(infos):
                    if not safe_member(info.filename) or stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1:
                        raise ValueError("Unsafe path, symbolic link or encrypted ZIP member rejected.")
                    if info.file_size / max(1, info.compress_size) > corpus.limits.max_compression_ratio:
                        raise ImportLimitError("ZIP compression ratio limit exceeded.")
                    source["entries"].append({"entry_index": index, "name": info.filename, "bytes": info.file_size, "compressed_bytes": info.compress_size,
                                              "crc32": f"{info.CRC:08x}", "is_directory": info.is_dir(), "zip_local_time_raw": list(info.date_time),
                                              "timestamp_note": "ZIP member clock has no timezone; not a conversation timestamp."})
                candidates = [(index, info) for index, info in enumerate(infos) if PurePosixPath(info.filename.replace("\\", "/")).name.casefold() == "conversations.json" and not info.is_dir()]
                if not candidates:
                    corpus.issues.append({"kind": "NO_CONVERSATIONS_JSON_IN_ZIP", "source_id": source_id})
                for index, info in candidates:
                    if info.file_size > corpus.limits.max_json_bytes:
                        raise ImportLimitError("ZIP JSON member byte limit exceeded.")
                    with archive.open(info) as stream:
                        data = stream.read(corpus.limits.max_json_bytes + 1)
                    corpus.document(data, source, source["entries"][index], source["entries"])
        except ImportLimitError:
            raise
        except (ValueError, OSError, zipfile.BadZipFile, NotImplementedError) as error:
            corpus.issues.append({"kind": "REJECTED_ZIP", "source_id": source_id, "reason": str(error), "raw_preserved": True})
    else:
        entry = {"name": path.name, "entry_index": None}
        source["entries"].append(entry)
        with preserved.open("rb") as stream:
            data = stream.read(corpus.limits.max_json_bytes + 1)
        corpus.document(data, source, entry, None)


def import_archive(inputs: list[Path], output: Path | None = None, *, keywords: list[str] | None = None, limits: Limits | None = None, as_of: datetime | None = None) -> Path:
    if not inputs:
        raise ValueError("Supply at least one export file.")
    if len(inputs) > 100:
        raise ImportLimitError("At most 100 source files may be imported in one run.")
    limits = limits or Limits()
    if any(value < 1 for value in asdict(limits).values()):
        raise ValueError("All limits must be positive.")
    keywords = list(dict.fromkeys(keywords or []))
    if len(keywords) > 100 or any(not k.strip() or len(k) > 200 for k in keywords):
        raise ValueError("Use at most 100 nonempty keywords, each at most 200 characters.")
    now = datetime.now(timezone.utc)
    as_of = as_of or now
    if as_of.tzinfo is None:
        raise ValueError("The as-of timestamp must include an explicit timezone.")
    as_of = as_of.astimezone(timezone.utc)
    base = private_output_base(output or default_output())
    directory = base / (now.strftime("import-%Y%m%dT%H%M%S-%fZ-") + uuid.uuid4().hex[:8])
    directory.mkdir(parents=True, exist_ok=False, mode=0o700)
    corpus = Corpus(directory, limits, keywords, as_of)
    manifest = {"schema_version": 1, "importer_version": VERSION, "started_at_utc": now.isoformat(), "python": platform.python_version(),
                "platform": platform.system(), "limits": asdict(limits), "keywords": keywords, "as_of_utc": as_of.isoformat(),
                "network_requests": 0, "source_mutations": 0, "zip_extraction": False, "scientific_claim_validation": "NOT PERFORMED",
                "privacy": "Local sensitive corpus, not encrypted. Inherits filesystem permissions on Windows. Do not publish or sync.", "status": "RUNNING"}
    failure = None
    try:
        for ordinal, path in enumerate(inputs, 1):
            ingest_source(corpus, Path(path), ordinal)
        coverage = corpus.reports()
        manifest["status"] = "COMPLETE_WITH_REPORTED_GAPS" if corpus.issues else "COMPLETE"
        manifest["counts"] = coverage["counts"]
    except Exception as error:
        failure = error
        manifest.update(status="FAILED_INCOMPLETE", error_type=type(error).__name__, error=str(error), counts=dict(corpus.counts))
    finally:
        corpus.close()
        manifest["finished_at_utc"] = datetime.now(timezone.utc).isoformat()
        manifest["sources"] = corpus.sources
        write_json(directory / "manifest.json", manifest)
        (directory / "PRIVATE-DO-NOT-PUBLISH.txt").write_text("PRIVATE ARCHIVE\nContains original conversation data and possibly personal information or secrets.\nDo not copy into WEB, Git, public search indexes or cloud services.\n", encoding="utf-8")
    if failure:
        raise ImportLimitError("Import incomplete; inspect the private manifest at " + str(directory / "manifest.json")) from failure
    return directory


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path, help="Explicitly supplied JSON files or ZIP exports; no directory search")
    parser.add_argument("--output", type=Path, help="Private external output parent; each run creates a unique child")
    parser.add_argument("--keyword", action="append", default=[], help="Case-insensitive literal discovery candidate; never filters the corpus")
    parser.add_argument("--as-of", help="Timezone-aware ISO timestamp for reproducible calendar-year views")
    for name, value in asdict(Limits()).items():
        parser.add_argument("--" + name.replace("_", "-"), type=int, default=value)
    args = parser.parse_args(argv)
    try:
        as_of = datetime.fromisoformat(args.as_of.replace("Z", "+00:00")) if args.as_of else None
        directory = import_archive(args.inputs, args.output, keywords=args.keyword, limits=Limits(**{key: getattr(args, key) for key in asdict(Limits())}), as_of=as_of)
        print("Private import written to: " + str(directory))
        manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
        print("Status: " + manifest["status"])
        return 0 if manifest["status"] == "COMPLETE" else 2
    except (ValueError, OSError) as error:
        print("Import not completed: " + str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

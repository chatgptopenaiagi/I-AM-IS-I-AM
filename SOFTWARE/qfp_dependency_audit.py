"""Validate and inspect the QFP scientific-object dependency registry.

Standard-library only. This utility reports dependency impact; it never edits
the registry or changes an object's epistemic status.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import deque
from pathlib import Path
from typing import Any


DEFAULT_REGISTRY = Path(__file__).resolve().parents[1] / "00_FOUNDATION" / "qfp_claim_registry.json"

ID_PATTERN = re.compile(r"^QFP-(A|C|DEF|D|S|M|N|NOT)[0-9]{3}$")
ALLOWED_OBJECT_TYPES = {
    "DEFINITION", "ASSUMPTION", "ANSATZ", "SCHEMA", "NOTATION", "WORKING MODEL"
}
ALLOWED_EPISTEMIC_STATUSES = {
    "ESTABLISHED", "DERIVED", "HYPOTHESIS", "CONJECTURE", "SPECULATIVE",
    "NUMERICAL RESULT", "FALSIFIED", "SUPERSEDED",
}
ALLOWED_DOMAIN_VALUES = {
    "LOCAL", "GLOBAL", "ASYMPTOTIC", "PERTURBATIVE", "NUMERICAL-DOMAIN",
    "COORDINATE-PATCH", "REGULAR-CENTER", "STATIC-SPHERICAL", "LARGE-R",
}
PREFIX_OBJECT_TYPES = {
    "A": {"ASSUMPTION", "ANSATZ"},
    "C": {"DEFINITION"},
    "DEF": {"DEFINITION"},
    "S": {"SCHEMA"},
    "M": {"WORKING MODEL"},
    "NOT": {"NOTATION"},
}
REQUIRED_OBJECT_FIELDS = {"id", "name", "domain", "depends_on", "provenance"}


class RegistryError(ValueError):
    """Raised when registry structure or dependency semantics are invalid."""


def load_registry(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise RegistryError(f"Cannot load registry {path}: {exc}") from exc
    validate_registry_root(data)
    return data


def validate_registry_root(registry: Any) -> None:
    if not isinstance(registry, dict):
        raise RegistryError("Registry root must be an object")
    if not isinstance(registry.get("protocol_version"), str):
        raise RegistryError("Registry root must contain a string protocol_version")
    if not isinstance(registry.get("registry_scope"), str):
        raise RegistryError("Registry root must contain a string registry_scope")
    if not isinstance(registry.get("objects"), list):
        raise RegistryError("Registry root must contain an 'objects' array")


def id_prefix(object_id: str) -> str:
    match = ID_PATTERN.fullmatch(object_id)
    if not match:
        if re.fullmatch(r"QFP-[A-Z]+[0-9]{3}", object_id):
            raise RegistryError(f"Unknown ID prefix: {object_id}")
        raise RegistryError(f"Malformed object ID: {object_id}")
    return match.group(1)


def validate_string_array(item: dict[str, Any], object_id: str, field: str) -> list[str]:
    value = item.get(field)
    if not isinstance(value, list) or not all(isinstance(entry, str) for entry in value):
        raise RegistryError(f"{object_id}: {field} must be an array of strings")
    return value


def validate_object(item: Any, position: int) -> str:
    if not isinstance(item, dict):
        raise RegistryError(f"Object at index {position} must be an object")
    missing = sorted(REQUIRED_OBJECT_FIELDS - item.keys())
    if missing:
        raise RegistryError(f"Object at index {position} missing required fields: {', '.join(missing)}")
    object_id = item["id"]
    if not isinstance(object_id, str):
        raise RegistryError(f"Object at index {position} has no string ID")
    prefix = id_prefix(object_id)
    if not isinstance(item["name"], str) or not item["name"].strip():
        raise RegistryError(f"{object_id}: name must be a non-empty string")

    object_type = item.get("object_type")
    status = item.get("epistemic_status")
    if object_type is None and status is None:
        raise RegistryError(f"{object_id}: object_type or epistemic_status is required")
    if object_type is not None:
        if not isinstance(object_type, str) or object_type not in ALLOWED_OBJECT_TYPES:
            raise RegistryError(f"{object_id}: invalid object_type")
        compatible = PREFIX_OBJECT_TYPES.get(prefix)
        if compatible is not None and object_type not in compatible:
            raise RegistryError(f"{object_id}: prefix/object_type mismatch")
    if status is not None and (
        not isinstance(status, str) or status not in ALLOWED_EPISTEMIC_STATUSES
    ):
        raise RegistryError(f"{object_id}: invalid epistemic_status")

    domain = validate_string_array(item, object_id, "domain")
    invalid_domains = sorted(set(domain) - ALLOWED_DOMAIN_VALUES)
    if invalid_domains:
        raise RegistryError(f"{object_id}: invalid domain values: {', '.join(invalid_domains)}")
    validate_string_array(item, object_id, "depends_on")
    provenance = validate_string_array(item, object_id, "provenance")
    if not provenance:
        raise RegistryError(f"{object_id}: provenance must not be empty")

    for field in ("expression", "presentation_qualifier"):
        if field in item and not isinstance(item[field], str):
            raise RegistryError(f"{object_id}: {field} must be a string")
    if "expansion" in item and (
        not isinstance(item["expansion"], list)
        or not all(isinstance(value, str) for value in item["expansion"])
    ):
        raise RegistryError(f"{object_id}: expansion must be an array of strings")
    if "validation" in item:
        validation = item["validation"]
        if not isinstance(validation, list) or not all(isinstance(value, dict) for value in validation):
            raise RegistryError(f"{object_id}: validation must be an array of objects")
        for record in validation:
            if not isinstance(record.get("method"), str):
                raise RegistryError(f"{object_id}: each validation record requires a string method")
            if not all(isinstance(value, str) for value in record.values()):
                raise RegistryError(f"{object_id}: validation record values must be strings")
    return object_id


def index_objects(registry: dict[str, Any]) -> dict[str, dict[str, Any]]:
    validate_registry_root(registry)
    index: dict[str, dict[str, Any]] = {}
    duplicates: set[str] = set()
    for position, item in enumerate(registry["objects"]):
        object_id = validate_object(item, position)
        if object_id in index:
            duplicates.add(object_id)
        index[object_id] = item
    if duplicates:
        raise RegistryError("Duplicate object IDs: " + ", ".join(sorted(duplicates)))
    return index


def dependency_graph(index: dict[str, dict[str, Any]]) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = {}
    missing: list[str] = []
    for object_id, item in index.items():
        dependencies = item.get("depends_on", [])
        if not isinstance(dependencies, list) or not all(isinstance(dep, str) for dep in dependencies):
            raise RegistryError(f"{object_id}: depends_on must be an array of strings")
        graph[object_id] = dependencies
        for dependency in dependencies:
            if dependency not in index:
                missing.append(f"{object_id} -> {dependency}")
    if missing:
        raise RegistryError("Missing dependency IDs: " + ", ".join(sorted(missing)))
    return graph


def detect_cycles(graph: dict[str, list[str]]) -> None:
    state = {node: 0 for node in graph}
    stack: list[str] = []

    def visit(node: str) -> None:
        state[node] = 1
        stack.append(node)
        for dependency in graph[node]:
            if state[dependency] == 0:
                visit(dependency)
            elif state[dependency] == 1:
                start = stack.index(dependency)
                cycle = stack[start:] + [dependency]
                raise RegistryError("Dependency cycle: " + " -> ".join(cycle))
        stack.pop()
        state[node] = 2

    for node in sorted(graph):
        if state[node] == 0:
            visit(node)


def validate_registry(registry: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], dict[str, list[str]]]:
    index = index_objects(registry)
    graph = dependency_graph(index)
    detect_cycles(graph)
    return index, graph


def downstream_dependents(graph: dict[str, list[str]], changed: str) -> tuple[list[str], list[str]]:
    if changed not in graph:
        raise RegistryError(f"Unknown object ID: {changed}")
    reverse = {node: [] for node in graph}
    for node, dependencies in graph.items():
        for dependency in dependencies:
            reverse[dependency].append(node)
    direct = sorted(reverse[changed])
    visited = set(direct)
    queue = deque(direct)
    while queue:
        node = queue.popleft()
        for dependent in reverse[node]:
            if dependent not in visited:
                visited.add(dependent)
                queue.append(dependent)
    return direct, sorted(visited - set(direct))


def dependency_chains(graph: dict[str, list[str]], selected: str) -> list[list[str]]:
    if selected not in graph:
        raise RegistryError(f"Unknown object ID: {selected}")
    chains: list[list[str]] = []

    def walk(node: str, path: list[str]) -> None:
        if not graph[node]:
            chains.append(path)
            return
        for dependency in sorted(graph[node]):
            walk(dependency, path + [dependency])

    walk(selected, [selected])
    return chains


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    parser.add_argument("--chain", metavar="QFP-ID", help="print all dependency chains for an object")
    parser.add_argument("--changed", metavar="QFP-ID", help="report downstream objects requiring re-audit")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        registry = load_registry(args.registry)
        index, graph = validate_registry(registry)
        print(f"PASS: {len(index)} unique object IDs; all dependencies resolve; graph is acyclic.")
        if args.chain:
            print(f"DEPENDENCY CHAINS: {args.chain}")
            for chain in dependency_chains(graph, args.chain):
                print("  " + " -> ".join(chain))
        if args.changed:
            direct, transitive = downstream_dependents(graph, args.changed)
            print(f"CHANGED: {args.changed}")
            if not direct and not transitive:
                print("UNAFFECTED: no downstream dependents")
            else:
                print("RE-AUDIT REQUIRED")
                for object_id in direct:
                    print(f"DIRECT DEPENDENT: {object_id}")
                for object_id in transitive:
                    print(f"TRANSITIVE DEPENDENT: {object_id}")
                print("Epistemic statuses are unchanged pending scientific re-audit.")
    except RegistryError as exc:
        print(f"FAIL: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

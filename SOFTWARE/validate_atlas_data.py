"""Deterministic, offline structural/fidelity audit of the public research atlas.

This validates records and source locations, not scientific truth, historical
authorship, working remote URLs, or the adequacy of an empirical protocol.
No network, Git commands, file writes or package dependencies are used.
Run: python -B SOFTWARE/validate_atlas_data.py
"""
from __future__ import annotations

import argparse
from collections import Counter, deque
from datetime import date
import json
import math
from pathlib import Path, PurePosixPath
import re
from typing import Any
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = "WEB/qfp-lab/data/research.json"
REGISTRY = "00_FOUNDATION/qfp_claim_registry.json"
OBJECT_TYPES = {"DEFINITION", "ASSUMPTION", "ANSATZ", "SCHEMA", "NOTATION", "WORKING MODEL"}
STATUSES = {"ESTABLISHED", "DERIVED", "HYPOTHESIS", "CONJECTURE", "SPECULATIVE", "NUMERICAL RESULT", "FALSIFIED", "SUPERSEDED"}
FORMAL_EDGES = {"canonical-dependency", "editorial-dependency"}
EDGE_TYPES = FORMAL_EDGES | {"interpretive-connection", "open-research-question", "owner-reported-continuity"}
RELATION_TYPES = {"definition", "assumption", "deduction", "analogy", "critique", "proposed relation", "historical revision"}
UNIT_STATUSES = {"CANONICAL_CONVENTION", "DECLARED_MODEL_UNITS", "NOT_FORMULATED", "NOT_APPLICABLE", "PARTIAL", "REFERENCE_SCALE_DEFINED"}
PHYSICAL_FIELDS = ("prediction", "comparison", "protocol", "uncertainty", "failure_criterion")
ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.:-]*\Z")


def load_json(path: Path) -> Any:
    if path.stat().st_size > 8*1024*1024:
        raise ValueError("Public atlas input exceeds the 8 MiB validation budget")
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("Duplicate JSON object key")
            result[key] = value
        return result
    def reject(_):
        raise ValueError("Nonstandard JSON numeric constant")
    def finite_float(value):
        parsed = float(value)
        if not math.isfinite(parsed): raise ValueError("Unrepresentable finite JSON number")
        return parsed
    return json.loads(path.read_text(encoding="utf-8-sig"), object_pairs_hook=unique, parse_constant=reject, parse_float=finite_float)


def validate(data: Any, registry: Any, root: Path = ROOT) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    root = root.resolve()
    def issue(code, location, message):
        issues.append({"code": code, "location": location, "message": message})
    def nonempty(value):
        return isinstance(value, str) and bool(value.strip())
    def strings(value):
        return isinstance(value, list) and all(nonempty(x) for x in value)
    def date_value(value, location):
        if value is None:
            return
        try:
            if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                raise ValueError()
            date.fromisoformat(value)
        except ValueError:
            issue("INVALID_DATE", location, "Use an ISO calendar date or explicit null; retain date basis separately.")
    def source_path(value, location):
        if not nonempty(value):
            issue("INVALID_SOURCE_PATH", location, "A source path must be a nonempty repository-relative string.")
            return None
        parsed = urlsplit(value)
        decoded = unquote(parsed.path)
        if parsed.scheme or parsed.netloc or parsed.query or "\\" in decoded or ":" in decoded or "\x00" in decoded or PurePosixPath(decoded).is_absolute() or ".." in PurePosixPath(decoded).parts:
            issue("UNSAFE_SOURCE_PATH", location, "Source paths must stay inside the repository and contain no filesystem/URL credentials.")
            return None
        path = (root/decoded).resolve()
        if root not in path.parents or not path.is_file():
            issue("MISSING_SOURCE_PATH", location, "Referenced repository file is missing or resolves outside the repository.")
            return None
        if parsed.fragment and path.suffix.lower() == ".md":
            if path.stat().st_size > 1024*1024:
                issue("ANCHOR_NOT_CHECKED", location, "Markdown source exceeds the 1 MiB anchor-check budget.")
            else:
                text = path.read_text(encoding="utf-8-sig")
                anchors = set(re.findall(r'<(?:a|h[1-6])\b[^>]*\bid=["\']([^"\']+)', text, re.I))
                counts = Counter()
                for heading in re.findall(r"^#{1,6}\s+(.+?)\s*#*\s*$", text, re.M):
                    heading = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", heading)
                    slug = re.sub(r"[^\w\- ]", "", heading.lower()).replace(" ", "-")
                    count = counts[slug]
                    counts[slug] += 1
                    anchors.add(slug if count == 0 else slug+"-"+str(count))
                if unquote(parsed.fragment) not in anchors:
                    issue("MISSING_SOURCE_ANCHOR", location, "Referenced Markdown anchor is absent (standard heading/explicit-id subset).")
        return decoded
    def source_url(value, location, expected_path=None, expected_ref=None):
        if not nonempty(value):
            issue("INVALID_SOURCE_URL", location, "A URL must be a nonempty HTTPS reference.")
            return
        try:
            parsed = urlsplit(value)
            if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.port not in (None,443) or any(ord(c)<33 for c in value):
                raise ValueError()
            if parsed.hostname.lower() == "github.com":
                parts = [unquote(p) for p in parsed.path.strip("/").split("/")]
                if len(parts) < 5 or parts[2] not in ("blob", "tree") or not all(parts) or any(p in (".","..") or "/" in p or "\\" in p for p in parts):
                    raise ValueError()
                if expected_path is not None:
                    if parts[:2] != ["chatgptopenaiagi","I-AM-IS-I-AM"] or parts[2] != "blob" or "/".join(parts[4:]) != expected_path:
                        issue("SOURCE_URL_PATH_MISMATCH", location, "GitHub source URL must identify the paired repository file.")
                if expected_ref is not None and parts[3] != expected_ref:
                    issue("CANONICAL_SOURCE_REF_CHANGED", location, "Canonical source URL does not use the declared snapshot.")
            if any(key in parsed.query.lower() for key in ("token=", "password=", "api_key=", "signature=")):
                raise ValueError()
        except ValueError:
            issue("UNSAFE_SOURCE_URL", location, "Invalid HTTPS/source URL syntax or credential-bearing URL; remote availability is not tested.")
    def references(item, location, sources):
        ids = item.get("source_ids")
        if not strings(ids) or not ids:
            issue("MISSING_SOURCE_IDS", location, "Each public record needs at least one explicit source ID.")
        elif len(ids) != len(set(ids)) or any(x not in sources for x in ids):
            issue("INVALID_SOURCE_IDS", location, "Source IDs must be unique and resolve to declared sources.")
    def index(records, location):
        found = {}
        if not isinstance(records, list):
            issue("INVALID_COLLECTION", location, "Expected a list of records.")
            return found
        for n, record in enumerate(records):
            place = f"{location}[{n}]"
            if not isinstance(record, dict) or not isinstance(record.get("id"),str) or not ID.fullmatch(record["id"]):
                issue("INVALID_ID", place, "Record requires a stable, syntactically valid ID.")
            elif record["id"] in found:
                issue("DUPLICATE_ID", place, "Record ID occurs more than once.")
            else:
                found[record["id"]] = record
        return found
    if not isinstance(data,dict) or not isinstance(registry,dict):
        return [{"code":"INVALID_DOCUMENT","location":"$","message":"Atlas and registry must be JSON objects."}]
    if data.get("schema_version") != "1.0":
        issue("SCHEMA_VERSION", "metadata", "This validator supports schema_version 1.0 only.")
    metadata = data.get("metadata", {})
    if not isinstance(metadata,dict):
        metadata = {}
        issue("INVALID_METADATA", "metadata", "Metadata must be an object.")
    if metadata.get("canonical_registry_path") != REGISTRY:
        issue("REGISTRY_PATH", "metadata", "Canonical registry path differs from the explicit audit input.")
    snapshot = metadata.get("canonical_snapshot")
    if not isinstance(snapshot,str) or not re.fullmatch(r"[a-fA-F0-9]{7,40}",snapshot):
        issue("INVALID_SNAPSHOT", "metadata", "Canonical snapshot must be an explicit commit identifier.")
    branches = index(data.get("branches"), "branches")
    claims = index(data.get("claims"), "claims")
    sources = index(data.get("sources"), "sources")
    canonical = index(registry.get("objects"), "registry.objects")
    for source_id, record in sources.items():
        place = "sources."+source_id
        for field in ("title","type","date_basis","speaker"):
            if not nonempty(record.get(field)):
                issue("SOURCE_METADATA",place+"."+field,"Explicit source attribution/date basis is required; unknown must remain stated.")
        date_value(record.get("date"),place+".date")
        if not strings(record.get("limitations")) or not record["limitations"]:
            issue("SOURCE_LIMITATIONS",place,"Source coverage limitations must be explicit.")
        local = source_path(record["path"],place+".path") if record.get("path") is not None else None
        if record.get("url") is not None:
            source_url(record["url"],place+".url",local,snapshot if record.get("type")=="canonical repository record" else None)
        if record.get("path") is None and record.get("url") is None:
            issue("SOURCE_LOCATION_MISSING",place,"A source requires an inspectable public path or URL.")
    actual_canonical = {key for key,value in claims.items() if value.get("label")=="canonical"}
    if actual_canonical != set(canonical):
        issue("CANONICAL_MEMBERSHIP", "claims", "Canonical adapter IDs must exactly match registry objects; ID prefixes confer no status.")
    expected_edges = set()
    canonical_fields = {"id","name","object_type","epistemic_status","domain","depends_on","expression","expansion","validation","provenance","presentation_qualifier"}
    for claim_id, claim in claims.items():
        place = "claims."+claim_id
        for field in ("title","label","statement","speaker","date_basis","revision"):
            if not nonempty(claim.get(field)):
                issue("CLAIM_METADATA",place+"."+field,"Claim text, source attribution, revision and date basis must be explicit.")
        if not isinstance(claim.get("branch"),str) or claim["branch"] not in branches:
            issue("UNKNOWN_BRANCH",place,"Claim refers to an undeclared branch.")
        if claim.get("object_type") is not None and (not isinstance(claim["object_type"],str) or claim["object_type"] not in OBJECT_TYPES):
            issue("OBJECT_TYPE",place,"Object type is outside governance vocabulary.")
        if claim.get("epistemic_status") is not None and (not isinstance(claim["epistemic_status"],str) or claim["epistemic_status"] not in STATUSES):
            issue("EPISTEMIC_STATUS",place,"Epistemic status is outside governance vocabulary.")
        if claim.get("object_type") is None and claim.get("epistemic_status") is None:
            issue("UNCLASSIFIED_CLAIM",place,"Scientific record requires an object type or a claim status.")
        for field in ("domain","depends_on","assumptions","definitions","equations","limitations"):
            if not strings(claim.get(field)):
                issue("CLAIM_LIST",place+"."+field,"Expected a list of explicit strings (possibly empty).")
        if not claim.get("limitations"):
            issue("CLAIM_LIMITATIONS",place,"Claim limitations must be explicit.")
        references(claim,place,sources)
        date_value(claim.get("source_date"),place+".source_date")
        original = claim.get("original_wording")
        if original is not None and (not nonempty(original) or claim.get("editorial_paraphrase") is not False):
            issue("QUOTATION_ATTRIBUTION",place,"Original wording must be explicitly distinguished from an editorial paraphrase.")
        if original is None and claim.get("editorial_paraphrase") is not True:
            issue("PARAPHRASE_ATTRIBUTION",place,"Absent original wording requires an explicit editorial-paraphrase flag.")
        deps = claim.get("depends_on",[])
        if strings(deps):
            if len(deps)!=len(set(deps)) or any(dep not in claims for dep in deps):
                issue("UNKNOWN_OR_DUPLICATE_DEPENDENCY",place,"Dependencies must be unique declared claim IDs.")
            expected_edges.update((dep,claim_id,"canonical-dependency" if claim_id in canonical else "editorial-dependency") for dep in deps)
        evidence = claim.get("evidence")
        evidence_paths = []
        if not isinstance(evidence,list) or not evidence:
            issue("MISSING_EVIDENCE",place,"Claim requires explicit source evidence records.")
        else:
            for n, ref in enumerate(evidence):
                target = f"{place}.evidence[{n}]"
                if not isinstance(ref,dict):
                    issue("INVALID_EVIDENCE",target,"Evidence must be a reference object.")
                    continue
                local = source_path(ref["path"],target+".path") if ref.get("path") is not None else None
                if local: evidence_paths.append(local)
                if ref.get("url") is not None: source_url(ref["url"],target+".url",local,snapshot if claim_id in canonical else None)
                if ref.get("path") is None and ref.get("url") is None: issue("EVIDENCE_LOCATION_MISSING",target,"Evidence requires a repository path or HTTPS URL.")
        validation = claim.get("validation")
        if not isinstance(validation,list):
            issue("VALIDATION_METADATA",place,"Validation must be a list, not a replacement epistemic status.")
        else:
            for entry in validation:
                if not isinstance(entry,dict) or not nonempty(entry.get("method")):
                    issue("VALIDATION_METADATA",place,"Validation entries require a named method.")
                elif "record" in entry and (not isinstance(entry["record"],str) or entry["record"] not in sources):
                    issue("VALIDATION_SOURCE",place,"Validation record must resolve to a declared source ID.")
                if isinstance(entry,dict):
                    local = source_path(entry["path"],place+".validation.path") if entry.get("path") is not None else None
                    if entry.get("url") is not None: source_url(entry["url"],place+".validation.url",local)
        units = claim.get("units")
        if not isinstance(units,dict) or any(not nonempty(k) or not nonempty(v) for k,v in units.items()):
            issue("UNITS_FORMAT",place,"Units must be an explicit dictionary, possibly empty with an explanatory status.")
        if not isinstance(claim.get("units_status"),str) or claim["units_status"] not in UNIT_STATUSES or not nonempty(claim.get("units_note")):
            issue("UNIT_AMBIGUITY",place,"Provide units_status and units_note distinguishing unknown, not applicable and declared dimensions.")
        if units == {} and claim.get("units_status") not in ("NOT_FORMULATED","NOT_APPLICABLE","PARTIAL"):
            issue("EMPTY_DECLARED_UNITS",place,"Empty units cannot claim a fully declared convention.")
        if claim_id in canonical:
            base = canonical[claim_id]
            if set(base)-canonical_fields: issue("UNMAPPED_CANONICAL_FIELD",place,"Registry acquired a field that needs an explicit adapter fidelity rule.")
            fields = {"title":base["name"],"object_type":base.get("object_type"),"epistemic_status":base.get("epistemic_status"),"domain":base.get("domain",[]),"depends_on":base.get("depends_on",[]),"validation":base.get("validation",[])}
            fields["equations"] = [base["expression"]] if "expression" in base else base.get("expansion",[])
            fields["statement"] = base.get("expression", "; ".join(base["expansion"]) if "expansion" in base else base["name"])
            if "presentation_qualifier" in base: fields["presentation_qualifier"] = base["presentation_qualifier"]
            if "expression" in base: fields["original_wording"] = base["expression"]
            for field, expected in fields.items():
                if claim.get(field) != expected: issue("CANONICAL_FIELD_CHANGED",place+"."+field,"Canonical scientific content must match the registry exactly; no type/status inference from ID prefixes.")
            if evidence_paths != base.get("provenance",[]): issue("CANONICAL_PROVENANCE_CHANGED",place,"Canonical evidence paths must preserve ordered registry provenance.")
            for name, expected in {"Phi":"M","F":"M^2","H":"1","alpha":"1","V":"M^4","R":"M^2","G":"M^4","m":"M^-1","m3":"M^2","delta2":"M^2","Phi2":"M^3"}.items():
                if isinstance(units,dict) and name in units and units[name]!=expected: issue("CANONICAL_UNIT_CHANGED",place+".units."+name,"Unit differs from canonical mass-dimension convention.")
        else:
            physical = claim.get("physical_validation")
            if not isinstance(physical,dict) or not all(field in physical for field in PHYSICAL_FIELDS):
                issue("PHYSICAL_VALIDATION_MISSING",place,"Noncanonical claims need explicit prediction/comparison/protocol/uncertainty/failure fields or NOT FORMULATED.")
            elif physical.get("status")=="NOT FORMULATED":
                if any(physical[field] is not None for field in PHYSICAL_FIELDS) or not nonempty(physical.get("note")):
                    issue("PHYSICAL_VALIDATION_CONTRADICTION",place,"NOT FORMULATED retains null fields and explains the lack of an operational protocol.")
            elif physical.get("status")=="FORMULATED":
                if not all(nonempty(physical[field]) for field in PHYSICAL_FIELDS): issue("PHYSICAL_VALIDATION_INCOMPLETE",place,"A formulated protocol must describe all five fields; adequacy is not machine-verified.")
            else: issue("PHYSICAL_VALIDATION_STATUS",place,"Physical validation status must be FORMULATED or NOT FORMULATED.")
    edges = data.get("edges")
    formal = set()
    seen = set()
    if not isinstance(edges,list): issue("INVALID_EDGES","edges","Expected a list of typed edges.")
    else:
        for n,edge in enumerate(edges):
            place = f"edges[{n}]"
            if not isinstance(edge,dict) or not isinstance(edge.get("type"),str) or edge["type"] not in EDGE_TYPES:
                issue("EDGE_TYPE",place,"Every relationship must use an explicit supported type.")
                continue
            if "relation_type" in edge and (not isinstance(edge["relation_type"],str) or edge["relation_type"] not in RELATION_TYPES):
                issue("RELATION_TYPE",place,"Optional relation labels must use the declared vocabulary; they do not change formal dependency semantics.")
            key = (edge.get("from"),edge.get("to"),edge["type"])
            if not all(isinstance(x,str) for x in key) or key[0] not in claims or key[1] not in claims:
                issue("UNKNOWN_EDGE_ENDPOINT",place,"Both relationship endpoints must be declared claim IDs.")
                continue
            if key in seen: issue("DUPLICATE_EDGE",place,"Identical typed edge appears twice.")
            seen.add(key)
            if key[2] in FORMAL_EDGES: formal.add(key)
        if formal != expected_edges: issue("FORMAL_DEPENDENCY_MISMATCH","edges","Formal input→dependent edges must match explicit depends_on and canonical membership; interpretive connections are separate.")
    adjacency = {key:set() for key in claims}
    indegree = dict.fromkeys(claims,0)
    for start,end,_ in expected_edges:
        if start in claims and end in claims and end not in adjacency[start]:
            adjacency[start].add(end); indegree[end]+=1
    queue = deque(sorted(key for key in claims if indegree[key]==0))
    visited = 0
    while queue:
        current = queue.popleft(); visited+=1
        for target in sorted(adjacency[current]):
            indegree[target]-=1
            if indegree[target]==0: queue.append(target)
    if visited!=len(claims): issue("FORMAL_DEPENDENCY_CYCLE","claims.depends_on","Formal dependency graph has a cycle; interpretive/continuity/question edges are intentionally excluded.")
    for collection in ("timeline","glossary","questions"):
        for key,item in index(data.get(collection),collection).items():
            place=collection+"."+key
            references(item,place,sources)
            if not isinstance(item.get("branch"),str) or item["branch"] not in branches: issue("UNKNOWN_BRANCH",place,"Record refers to an undeclared branch.")
            if collection=="timeline":
                date_value(item.get("date"),place+".date")
                if not nonempty(item.get("date_basis")): issue("TIMELINE_DATE_BASIS",place,"Timeline dates require explicit metadata/owner/source basis.")
            if collection=="questions" and (not nonempty(item.get("text")) or not nonempty(item.get("text_ro"))):
                issue("QUESTION_TRANSLATION",place,"Questions require explicit English and Romanian wording.")
    corpus = data.get("corpus",{})
    if not isinstance(corpus,dict) or not isinstance(corpus.get("source_counts"),dict) or corpus["source_counts"].get("canonical_registry_records")!=len(canonical):
        issue("CANONICAL_COVERAGE_COUNT","corpus","Declared canonical record count differs from the actual registry.")
    return sorted(issues,key=lambda x:(x["location"],x["code"],x["message"]))


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data",type=Path,default=ROOT/DATA)
    parser.add_argument("--registry",type=Path,default=ROOT/REGISTRY)
    args=parser.parse_args(argv)
    try:
        data,registry=load_json(args.data),load_json(args.registry)
        issues=validate(data,registry)
    except (OSError,ValueError,RecursionError) as error:
        print(json.dumps({"valid":False,"error_type":type(error).__name__,"scope":"Input could not be structurally validated."},sort_keys=True))
        return 2
    print(json.dumps({"valid":not issues,"claims":len(data.get("claims",[])),"canonical_records":len(registry.get("objects",[])),"sources":len(data.get("sources",[])),"issues":issues,"scope":"Offline structure, fidelity, source-path and URL-syntax checks only; no scientific/empirical/authorship or remote-availability certification."},ensure_ascii=False,indent=2,sort_keys=True))
    return 1 if issues else 0


if __name__=="__main__":
    raise SystemExit(main())

from __future__ import annotations

import sys
import unittest
from pathlib import Path


SOFTWARE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SOFTWARE_DIR))

import qfp_dependency_audit as audit


def registry(objects: list[dict[str, object]]) -> dict[str, object]:
    return {"protocol_version": "test", "registry_scope": "Synthetic test registry", "objects": objects}


def obj(
    object_id: str,
    *,
    depends_on: list[str] | None = None,
    object_type: str | None = None,
    epistemic_status: str | None = None,
    domain: list[str] | None = None,
) -> dict[str, object]:
    item: dict[str, object] = {
        "id": object_id,
        "name": f"Synthetic {object_id}",
        "domain": [] if domain is None else domain,
        "depends_on": [] if depends_on is None else depends_on,
        "provenance": ["synthetic-test"],
    }
    if object_type is not None:
        item["object_type"] = object_type
    if epistemic_status is not None:
        item["epistemic_status"] = epistemic_status
    return item


class DependencyAuditTests(unittest.TestCase):
    def test_duplicate_id_rejection(self) -> None:
        data = registry([obj("QFP-A001", object_type="ASSUMPTION"), obj("QFP-A001", object_type="ASSUMPTION")])
        with self.assertRaisesRegex(audit.RegistryError, "Duplicate object IDs"):
            audit.validate_registry(data)

    def test_missing_dependency_rejection(self) -> None:
        data = registry([obj("QFP-D001", depends_on=["QFP-A999"], epistemic_status="DERIVED")])
        with self.assertRaisesRegex(audit.RegistryError, "Missing dependency IDs"):
            audit.validate_registry(data)

    def test_cycle_detection(self) -> None:
        data = registry([
            obj("QFP-A001", depends_on=["QFP-D001"], object_type="ASSUMPTION"),
            obj("QFP-D001", depends_on=["QFP-A001"], epistemic_status="DERIVED"),
        ])
        with self.assertRaisesRegex(audit.RegistryError, "Dependency cycle"):
            audit.validate_registry(data)

    def test_direct_and_transitive_discovery(self) -> None:
        data = registry([
            obj("QFP-A001", object_type="ASSUMPTION"),
            obj("QFP-D001", depends_on=["QFP-A001"], epistemic_status="DERIVED"),
            obj("QFP-D002", depends_on=["QFP-D001"], epistemic_status="DERIVED"),
            obj("QFP-S001", object_type="SCHEMA"),
        ])
        _, graph = audit.validate_registry(data)
        direct, transitive = audit.downstream_dependents(graph, "QFP-A001")
        self.assertEqual(direct, ["QFP-D001"])
        self.assertEqual(transitive, ["QFP-D002"])

    def test_unaffected_object_behavior(self) -> None:
        data = registry([obj("QFP-A001", object_type="ASSUMPTION"), obj("QFP-S001", object_type="SCHEMA")])
        _, graph = audit.validate_registry(data)
        self.assertEqual(audit.downstream_dependents(graph, "QFP-S001"), ([], []))

    def test_valid_registry_passes(self) -> None:
        data = registry([
            obj("QFP-A001", object_type="ASSUMPTION"),
            obj("QFP-D001", depends_on=["QFP-A001"], epistemic_status="DERIVED"),
        ])
        index, graph = audit.validate_registry(data)
        self.assertEqual(set(index), {"QFP-A001", "QFP-D001"})
        self.assertEqual(graph["QFP-D001"], ["QFP-A001"])

    def test_malformed_id_rejection(self) -> None:
        with self.assertRaisesRegex(audit.RegistryError, "Malformed object ID"):
            audit.validate_registry(registry([obj("qfp-A001", object_type="ASSUMPTION")]))

    def test_unknown_prefix_rejection(self) -> None:
        with self.assertRaisesRegex(audit.RegistryError, "Unknown ID prefix"):
            audit.validate_registry(registry([obj("QFP-X001", object_type="ASSUMPTION")]))

    def test_prefix_object_type_mismatch_rejection(self) -> None:
        with self.assertRaisesRegex(audit.RegistryError, "prefix/object_type mismatch"):
            audit.validate_registry(registry([obj("QFP-NOT001", object_type="DEFINITION")]))

    def test_valid_notation_object_acceptance(self) -> None:
        index, _ = audit.validate_registry(registry([obj("QFP-NOT001", object_type="NOTATION")]))
        self.assertIn("QFP-NOT001", index)

    def test_invalid_domain_rejection(self) -> None:
        with self.assertRaisesRegex(audit.RegistryError, "invalid domain values"):
            audit.validate_registry(registry([obj("QFP-S001", object_type="SCHEMA", domain=["SCHEMATIC"])]))

    def test_empty_domain_acceptance(self) -> None:
        index, _ = audit.validate_registry(registry([obj("QFP-S001", object_type="SCHEMA", domain=[])]))
        self.assertEqual(index["QFP-S001"]["domain"], [])

    def test_missing_required_field_rejection(self) -> None:
        item = obj("QFP-S001", object_type="SCHEMA")
        del item["provenance"]
        with self.assertRaisesRegex(audit.RegistryError, "missing required fields"):
            audit.validate_registry(registry([item]))

    def test_dependency_array_type_rejection(self) -> None:
        item = obj("QFP-S001", object_type="SCHEMA")
        item["depends_on"] = "QFP-A001"
        with self.assertRaisesRegex(audit.RegistryError, "depends_on must be an array of strings"):
            audit.validate_registry(registry([item]))


if __name__ == "__main__":
    unittest.main()

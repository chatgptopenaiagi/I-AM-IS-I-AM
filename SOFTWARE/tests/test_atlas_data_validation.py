"""Public-data mutation tests: structure checks are not empirical validation."""
import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest

SPEC=importlib.util.spec_from_file_location("atlas_validator",Path(__file__).resolve().parents[1]/"validate_atlas_data.py")
validator=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class AtlasDataValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline=validator.load_json(validator.ROOT/validator.DATA)
        cls.registry=validator.load_json(validator.ROOT/validator.REGISTRY)

    def setUp(self):
        self.data=copy.deepcopy(self.baseline)

    def claim(self,identity):
        return next(c for c in self.data["claims"] if c["id"]==identity)

    def codes(self):
        return {x["code"] for x in validator.validate(self.data,self.registry)}

    def test_current_public_data_is_valid_and_validation_is_deterministic(self):
        first=validator.validate(self.data,self.registry)
        self.assertEqual([],first,first)
        self.assertEqual(first,validator.validate(copy.deepcopy(self.data),copy.deepcopy(self.registry)))
        self.assertEqual(13,len(self.registry["objects"]))

    def test_every_canonical_scientific_field_is_compared(self):
        mutations=[("QFP-D001","object_type","DEFINITION"),("QFP-D001","epistemic_status","ESTABLISHED"),("QFP-D001","domain",["GLOBAL"]),("QFP-D001","validation",[]),("QFP-A003","equations",["m(r)=0"]),("QFP-S001","presentation_qualifier","EXACT"),("QFP-D001","statement","different equation"),("QFP-D001","original_wording","invented quotation")]
        for identity,field,value in mutations:
            with self.subTest(identity=identity,field=field):
                self.data=copy.deepcopy(self.baseline)
                self.claim(identity)[field]=value
                self.assertIn("CANONICAL_FIELD_CHANGED",self.codes())

    def test_prefix_does_not_assign_canonical_membership_or_type(self):
        claim=copy.deepcopy(self.claim("ATLAS-BEING"))
        claim["id"]="QFP-PREFIX-ONLY"
        self.data["claims"].append(claim)
        self.assertEqual(set(),self.codes())
        claim["label"]="canonical"
        self.assertIn("CANONICAL_MEMBERSHIP",self.codes())

    def test_dependency_adapter_cannot_silently_drop_registry_inputs(self):
        self.claim("QFP-D005")["depends_on"].remove("QFP-D004")
        self.data["edges"]=[e for e in self.data["edges"] if not(e["from"]=="QFP-D004" and e["to"]=="QFP-D005")]
        self.assertIn("CANONICAL_FIELD_CHANGED",self.codes())

    def test_only_formal_dependencies_are_cycle_checked(self):
        self.data["edges"].extend([{"from":"ATLAS-BEING","to":"ATLAS-ACCESS","type":"open-research-question"},{"from":"ATLAS-ACCESS","to":"ATLAS-BEING","type":"interpretive-connection"}])
        self.assertEqual(set(),self.codes())
        self.claim("ATLAS-BEING")["depends_on"]=["ATLAS-ACCESS"]
        self.claim("ATLAS-ACCESS")["depends_on"]=["ATLAS-BEING"]
        self.data["edges"].extend([{"from":"ATLAS-BEING","to":"ATLAS-ACCESS","type":"editorial-dependency"},{"from":"ATLAS-ACCESS","to":"ATLAS-BEING","type":"editorial-dependency"}])
        self.assertIn("FORMAL_DEPENDENCY_CYCLE",self.codes())

    def test_typed_edges_and_unknown_endpoints_are_checked(self):
        self.data["edges"].append({"from":"missing","to":"ATLAS-BEING","type":"editorial-dependency"})
        self.assertIn("UNKNOWN_EDGE_ENDPOINT",self.codes())
        self.data["edges"].append({"from":"ATLAS-BEING","to":"ATLAS-ACCESS","type":"supports"})
        self.assertIn("EDGE_TYPE",self.codes())

    def test_source_ids_and_repo_paths_resolve(self):
        self.claim("ATLAS-BEING")["source_ids"]=["missing-source"]
        self.claim("QFP-D001")["evidence"][0]["path"]="02_MATHEMATICS/missing-file.md"
        codes=self.codes()
        self.assertIn("INVALID_SOURCE_IDS",codes)
        self.assertIn("MISSING_SOURCE_PATH",codes)

    def test_optional_relation_labels_use_declared_vocabulary(self):
        edge=self.data["edges"][0]
        edge.pop("relation_type",None)
        self.assertEqual(set(),self.codes())
        for value in sorted(validator.RELATION_TYPES):
            with self.subTest(value=value):
                edge["relation_type"]=value
                self.assertEqual(set(),self.codes())
        for value in ("proves physical reality",None,{"bad":"shape"}):
            with self.subTest(value=value):
                edge["relation_type"]=value
                self.assertIn("RELATION_TYPE",self.codes())

    def test_public_refs_reject_private_paths_and_credential_urls(self):
        self.data["sources"][0]["path"]="../private/archive.json"
        self.data["sources"][1]["url"]="https://synthetic-user:synthetic-secret@example.invalid/source"
        self.assertIn("UNSAFE_SOURCE_PATH",self.codes())
        self.assertIn("UNSAFE_SOURCE_URL",self.codes())

    def test_github_snapshot_and_paired_path_are_checked_offline(self):
        self.data["sources"][0]["url"]="https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/blob/main/README.md"
        codes=self.codes()
        self.assertIn("CANONICAL_SOURCE_REF_CHANGED",codes)
        self.assertIn("SOURCE_URL_PATH_MISMATCH",codes)

    def test_canonical_provenance_and_presentation_qualifier_survive(self):
        self.claim("QFP-D005")["evidence"].reverse()
        del self.claim("QFP-S001")["presentation_qualifier"]
        self.assertIn("CANONICAL_PROVENANCE_CHANGED",self.codes())
        self.assertIn("CANONICAL_FIELD_CHANGED",self.codes())

    def test_quotes_attribution_and_date_basis_are_not_invented(self):
        claim=self.claim("ATLAS-BEING")
        claim["original_wording"]="synthetic purported quotation"
        claim["source_date"]="not-a-date"
        claim["date_basis"]=""
        codes=self.codes()
        self.assertIn("QUOTATION_ATTRIBUTION",codes)
        self.assertIn("INVALID_DATE",codes)
        self.assertIn("CLAIM_METADATA",codes)

    def test_unknown_units_are_not_silently_dimensionless(self):
        self.claim("ATLAS-BEING").pop("units_status")
        self.claim("QFP-M001")["units"]["alpha"]="M^-2"
        codes=self.codes()
        self.assertIn("UNIT_AMBIGUITY",codes)
        self.assertIn("CANONICAL_UNIT_CHANGED",codes)

    def test_physical_protocol_must_be_complete_or_explicitly_not_formulated(self):
        physical=self.claim("ATLAS-AGI-TOPOLOGY")["physical_validation"]
        physical["prediction"]="unsupported placeholder prediction"
        self.assertIn("PHYSICAL_VALIDATION_CONTRADICTION",self.codes())
        physical["status"]="FORMULATED"
        self.assertIn("PHYSICAL_VALIDATION_INCOMPLETE",self.codes())

    def test_duplicate_ids_missing_questions_and_validation_paths(self):
        self.data["claims"].append(copy.deepcopy(self.data["claims"][0]))
        self.data["questions"][0]["source_ids"]=["missing"]
        self.claim("ATLAS-METRIC-REVIEW")["validation"].append({"method":"test","path":"SOFTWARE/does-not-exist.py"})
        codes=self.codes()
        self.assertIn("DUPLICATE_ID",codes)
        self.assertIn("INVALID_SOURCE_IDS",codes)
        self.assertIn("MISSING_SOURCE_PATH",codes)

    def test_malformed_field_types_return_issues_instead_of_a_traceback(self):
        self.claim("ATLAS-BEING")["object_type"]={"bad":"shape"}
        self.claim("ATLAS-BEING")["branch"]=["being"]
        self.data["edges"].append({"type":{},"from":"ATLAS-BEING","to":"ATLAS-ACCESS"})
        self.assertTrue({"OBJECT_TYPE","UNKNOWN_BRANCH","EDGE_TYPE"}.issubset(self.codes()))

    def test_json_duplicate_keys_and_nonfinite_overflow_are_rejected(self):
        with tempfile.TemporaryDirectory(prefix="atlas-data-synthetic-") as temporary:
            path=Path(temporary)/"fixture.json"
            for content in ('{"id":1,"id":2}','{"value":NaN}','{"value":1e999}'):
                path.write_text(content,encoding="utf-8")
                with self.assertRaises(ValueError): validator.load_json(path)


if __name__=="__main__":
    unittest.main(verbosity=2)

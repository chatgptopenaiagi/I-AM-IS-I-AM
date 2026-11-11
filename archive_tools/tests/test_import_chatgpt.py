"""Synthetic-only tests. No account exports, network, providers or credentials."""
import copy
from dataclasses import replace
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile

from archive_tools.import_chatgpt import (
    ImportLimitError, Limits, REPOSITORY, import_archive, main,
    observed_time, private_output_base, copy_source,
)

FIXTURE = Path(__file__).parent / "fixtures" / "synthetic_conversations.json"
AS_OF = datetime(2026, 11, 11, tzinfo=timezone.utc)


def rows(run, filename):
    return [json.loads(line) for line in (run / filename).read_text(encoding="utf-8").splitlines()]


def document(run, filename):
    return json.loads((run / filename).read_text(encoding="utf-8"))


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="iam-archive-synthetic-")
        self.directory = Path(self.temp.name)
        self.output = self.directory / "private"
        self.fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def tearDown(self):
        self.temp.cleanup()

    def source(self, value=None, name="conversations.json"):
        path = self.directory / name
        path.write_text(json.dumps(self.fixture if value is None else value, ensure_ascii=False), encoding="utf-8")
        return path

    def run_import(self, paths=None, **kwargs):
        return import_archive(paths or [self.source()], self.output, as_of=AS_OF, **kwargs)

    def test_exact_source_and_all_branches_preserved(self):
        source = self.source()
        original = source.read_bytes()
        run = self.run_import([source], keywords=["QFP"])
        manifest = document(run, "manifest.json")
        copied = run / manifest["sources"][0]["preserved_copy"]
        self.assertEqual(original, copied.read_bytes())
        self.assertEqual(original, source.read_bytes())
        self.assertEqual(hashlib.sha256(original).hexdigest(), manifest["sources"][0]["sha256"])
        conversation = rows(run, "conversations.jsonl")[0]
        self.assertEqual(self.fixture[0], conversation["raw"])
        self.assertEqual(5, len(conversation["nodes"]))
        self.assertEqual(["root", "user", "new", "tail"], conversation["graph"]["current_ancestry_root_to_leaf"])
        messages = rows(run, "messages.jsonl")
        self.assertEqual(4, len(messages))
        old = next(m for m in messages if m["node_key"] == "old")
        self.assertFalse(old["on_current_ancestry"])
        self.assertEqual(self.fixture[0]["mapping"]["user"]["message"]["content"], messages[0]["content"])
        self.assertLess(len(rows(run, "keyword-candidates.jsonl")), len(messages))
        self.assertEqual(4, document(run, "coverage.json")["counts"]["messages"])

    def test_current_branch_follows_mutated_parent_not_order_or_latest_time(self):
        value = copy.deepcopy(self.fixture)
        mapping = value[0]["mapping"]
        mapping["tail"]["parent"] = "old"
        mapping["old"]["children"] = ["tail"]
        mapping["new"]["children"] = []
        run = self.run_import([self.source(value)])
        graph = rows(run, "conversations.jsonl")[0]["graph"]
        self.assertEqual(["root", "user", "old", "tail"], graph["current_ancestry_root_to_leaf"])
        self.assertTrue(graph["current_ancestry_complete"])
        messages = {m["node_key"]: m for m in rows(run, "messages.jsonl")}
        self.assertTrue(messages["old"]["on_current_ancestry"])
        self.assertFalse(messages["new"]["on_current_ancestry"])

    def test_graph_cycle_reports_uncertain_ancestry_without_discarding_nodes(self):
        value = copy.deepcopy(self.fixture)
        value[0]["mapping"]["new"]["parent"] = "tail"
        run = self.run_import([self.source(value)])
        graph = rows(run, "conversations.jsonl")[0]["graph"]
        self.assertFalse(graph["current_ancestry_complete"])
        self.assertIn("CURRENT_ANCESTRY_CYCLE", [issue["kind"] for issue in graph["issues"]])
        self.assertEqual(4, len(rows(run, "messages.jsonl")))
        self.assertTrue(all(m["on_current_ancestry"] is None for m in rows(run, "messages.jsonl")))
        self.assertEqual("COMPLETE_WITH_REPORTED_GAPS", document(run, "manifest.json")["status"])
        self.assertIn("GRAPH_STRUCTURE_ISSUES", [x["kind"] for x in document(run,"coverage.json")["issues"]])

    def test_alternative_branch_cycle_is_reported_with_valid_current_ancestry(self):
        value = copy.deepcopy(self.fixture)
        mapping = value[0]["mapping"]
        mapping["detached-a"] = {"parent":"detached-b","children":["detached-b"],"message":{"id":"a","content":"synthetic cycle a"}}
        mapping["detached-b"] = {"parent":"detached-a","children":["detached-a"],"message":{"id":"b","content":"synthetic cycle b"}}
        run = self.run_import([self.source(value)])
        graph = rows(run, "conversations.jsonl")[0]["graph"]
        self.assertTrue(graph["current_ancestry_complete"])
        self.assertEqual(1,len([issue for issue in graph["issues"] if issue["kind"] == "GRAPH_PARENT_CYCLE"]))
        self.assertEqual(6,len(rows(run,"messages.jsonl")))
        self.assertEqual("COMPLETE_WITH_REPORTED_GAPS",document(run,"manifest.json")["status"])

    def test_child_declared_parent_missing_reciprocal_link_is_a_gap(self):
        value = copy.deepcopy(self.fixture)
        value[0]["mapping"]["root"]["children"] = []
        run = self.run_import([self.source(value)])
        self.assertEqual("COMPLETE_WITH_REPORTED_GAPS",document(run,"manifest.json")["status"])
        graph = rows(run,"conversations.jsonl")[0]["graph"]
        self.assertTrue(any(x["kind"]=="PARENT_CHILD_DISAGREEMENT" and x["child"]=="user" for x in graph["issues"]))

    def test_multiple_wrappers_preserve_source_and_report_unindexed_container(self):
        source = self.source({"data":{"conversations":self.fixture,"items":[{"id":"extra","messages":[]}]}})
        run = self.run_import([source])
        issue = next(x for x in document(run,"coverage.json")["issues"] if x["kind"]=="MULTIPLE_CONVERSATION_CONTAINERS")
        self.assertEqual("/data",issue["json_pointer"])
        self.assertEqual(["conversations","items"],issue["containers"])
        self.assertEqual(source.read_bytes(),(run/"sources/source-0001/original.json").read_bytes())
        self.assertEqual("COMPLETE_WITH_REPORTED_GAPS",document(run,"manifest.json")["status"])

    def test_wrapper_and_id_map_variants(self):
        for index, value in enumerate([self.fixture[0], {"conversations": self.fixture}, {"conversations": {"outer-id": self.fixture[0]}}, {"data": {"conversations": self.fixture}}, {"outer-id": self.fixture[0]}]):
            with self.subTest(index=index):
                run = self.run_import([self.source(value, f"shape-{index}.json")])
                self.assertEqual(4, len(rows(run, "messages.jsonl")))
                self.assertEqual("synthetic-001", rows(run, "conversations.jsonl")[0]["conversation_id"])

    def test_flat_messages_have_no_invented_graph_or_metadata(self):
        value = {"id": "flat", "messages": [{"id": "m", "content": {"parts": ["I am an assistant speaking German"]}}]}
        run = self.run_import([self.source(value)])
        message = rows(run, "messages.jsonl")[0]
        for key in ("role", "author", "language", "model", "on_current_ancestry"):
            self.assertIsNone(message[key])
        self.assertFalse(rows(run, "conversations.jsonl")[0]["graph"]["current_ancestry_complete"])
        unknown = document(run,"coverage.json")["unknown_metadata"]
        self.assertEqual(1,unknown["author_field"])
        self.assertEqual(1,unknown["declared_author_name"])
        self.assertEqual(1,unknown["current_node"])

    def test_duplicates_and_conflicting_versions_keep_every_occurrence(self):
        changed = copy.deepcopy(self.fixture)
        changed[0]["mapping"]["user"]["message"]["content"]["parts"] = ["A conflicting synthetic revision"]
        paths = [self.source(name="first.json"), self.source(name="duplicate.json"), self.source(changed, "revision.json")]
        run = self.run_import(paths)
        self.assertEqual(3, len(rows(run, "conversations.jsonl")))
        self.assertEqual(12, len(rows(run, "messages.jsonl")))
        self.assertEqual(12, len({m["message_instance_id"] for m in rows(run, "messages.jsonl")}))
        self.assertEqual(1, len(document(run, "duplicates.json")["conversations"]))
        conflict = document(run, "conflicting-versions.json")
        self.assertEqual(1, len(conflict["conversations"]))
        self.assertEqual(1, len(conflict["messages"]))
        self.assertEqual(2, len(conflict["conversations"][0]["versions"]))

    def test_calendar_views_boundaries_and_default_model_is_not_actual_model(self):
        run = self.run_import()
        views = document(run, "date-views.json")
        self.assertEqual(2, views["last_2_years"]["message_count"])
        self.assertEqual(4, views["last_3_years"]["message_count"])
        messages = {m["node_key"]: m for m in rows(run, "messages.jsonl")}
        self.assertIsNone(messages["new"]["model"])
        self.assertEqual("UNKNOWN", messages["new"]["model_status"])
        self.assertIsNotNone(messages["new"]["declared_default_model"])
        self.assertEqual("synthetic-model-a", messages["old"]["model"])
        self.assertEqual("2024-11-11T00:00:00+00:00", messages["new"]["update_time"]["utc"])

    def test_unknown_naive_and_actual_epoch_timestamps(self):
        self.assertEqual("1970-01-01T00:00:00+00:00", observed_time(0)["utc"])
        self.assertEqual("1969-12-31T23:59:59+00:00", observed_time(-1)["utc"])
        self.assertIsNone(observed_time("2024-05-06T12:00:00")["utc"])
        self.assertEqual("TIMEZONE_UNKNOWN", observed_time("2024-05-06T12:00:00")["status"])
        self.assertIsNone(observed_time(True)["utc"])
        self.assertIsNone(observed_time(10**100)["utc"])
        value = {"id": "undated", "create_time": 100, "messages": [{"content": "No date"}]}
        run = self.run_import([self.source(value)])
        self.assertEqual(1, document(run, "coverage.json")["message_dates"]["unknown_count"])
        self.assertEqual(0, document(run, "date-views.json")["last_3_years"]["message_count"])

    def zip_source(self, members):
        path = self.directory / "export.zip"
        with zipfile.ZipFile(path, "w") as archive:
            for name, content in members:
                archive.writestr(name, content)
        return path

    def test_zip_attachment_inventory_and_missing_references(self):
        path = self.zip_source([("conversations.json", json.dumps(self.fixture)), ("synthetic-image.png", b"synthetic-not-a-real-image")])
        run = self.run_import([path])
        refs = rows(run, "attachments.jsonl")
        self.assertEqual("MATCHED_EXACT_MEMBER", next(ref for ref in refs if ref["value"] == "synthetic-image.png")["status"])
        self.assertTrue(any(ref["status"] == "NOT_FOUND_IN_PROVIDED_ARCHIVE" for ref in refs))
        self.assertFalse(any(p.name == "synthetic-image.png" for p in run.rglob("*")))
        manifest = document(run, "manifest.json")
        self.assertEqual(path.read_bytes(), (run / manifest["sources"][0]["preserved_copy"]).read_bytes())
        self.assertFalse(manifest["zip_extraction"])

    def test_zip_duplicate_member_names_preserve_both_documents(self):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            path = self.zip_source([("conversations.json", json.dumps(self.fixture)), ("conversations.json", json.dumps(self.fixture))])
        run = self.run_import([path])
        self.assertEqual(2, len(rows(run, "conversations.jsonl")))
        self.assertEqual({0, 1}, {c["source"]["entry_index"] for c in rows(run, "conversations.jsonl")})

    def test_zip_traversal_and_symlink_rejected_without_extraction(self):
        for bad_name in ("../outside.txt", "C:/outside.txt", "/outside.txt", "..\\outside.txt"):
            with self.subTest(name=bad_name):
                path = self.zip_source([("conversations.json", json.dumps(self.fixture)), (bad_name, "unsafe")])
                run = self.run_import([path])
                self.assertEqual([], rows(run, "conversations.jsonl"))
                self.assertEqual("REJECTED_ZIP", document(run, "coverage.json")["issues"][0]["kind"])
                self.assertFalse((self.directory / "outside.txt").exists())
        info = zipfile.ZipInfo("linked")
        info.create_system = 3
        info.external_attr = (stat.S_IFLNK | 0o777) << 16
        run = self.run_import([self.zip_source([(info, "../../secret")])])
        self.assertEqual("REJECTED_ZIP", document(run, "coverage.json")["issues"][0]["kind"])

    def test_hard_limits_fail_incomplete_instead_of_silent_truncation(self):
        with self.assertRaises(ImportLimitError):
            self.run_import(limits=replace(Limits(), max_messages=1))
        manifests = list(self.output.glob("*/manifest.json"))
        self.assertEqual("FAILED_INCOMPLETE", json.loads(manifests[0].read_text())["status"])
        path = self.zip_source([("conversations.json", json.dumps(self.fixture))])
        with self.assertRaises(ImportLimitError):
            self.run_import([path], limits=replace(Limits(), max_zip_uncompressed_bytes=10))
        with self.assertRaises(ImportLimitError):
            self.run_import([self.source()], limits=replace(Limits(), max_json_depth=2))

    def test_source_growth_cannot_bypass_total_copy_budget(self):
        source = self.source([], "growing.json")
        def grow_before_copy(path, destination, maximum):
            path.write_bytes(path.read_bytes() + b" "*20)
            return copy_source(path, destination, maximum)
        with patch("archive_tools.import_chatgpt.copy_source",side_effect=grow_before_copy):
            with self.assertRaises(ImportLimitError):
                self.run_import([source],limits=replace(Limits(),max_source_bytes=100,max_total_source_bytes=10))
        manifests = list(self.output.glob("*/manifest.json"))
        self.assertEqual("FAILED_INCOMPLETE",document(manifests[0].parent,"manifest.json")["status"])

    def test_unsupported_and_duplicate_json_keys_are_reported_and_source_retained(self):
        path = self.directory / "odd.json"
        path.write_bytes(b'{"id":"first", "id":"last", "messages":[]}')
        run = self.run_import([path])
        self.assertEqual("COMPLETE_WITH_REPORTED_GAPS", document(run, "manifest.json")["status"])
        self.assertEqual("DUPLICATE_JSON_OBJECT_KEYS", document(run, "coverage.json")["issues"][0]["kind"])
        self.assertEqual(path.read_bytes(), (run / "sources/source-0001/original.json").read_bytes())
        for value in (42, {"mapping": []}, {"unrecognized": "data"}):
            run = self.run_import([self.source(value)])
            self.assertEqual(1, len(rows(run, "unsupported.jsonl")))
            self.assertEqual("COMPLETE_WITH_REPORTED_GAPS", document(run, "manifest.json")["status"])
        path.write_bytes(b'{not valid JSON')
        run = self.run_import([path])
        self.assertEqual("UNREADABLE_JSON", document(run, "coverage.json")["issues"][0]["kind"])

    def test_output_boundaries_unique_runs_and_no_timezone_guess(self):
        for path in (REPOSITORY, REPOSITORY / ".private", REPOSITORY / "WEB" / "private", self.directory / "WEB" / "archive"):
            with self.subTest(path=path), self.assertRaises(ValueError):
                private_output_base(path)
        with patch("archive_tools.import_chatgpt.REPOSITORY", self.directory / "repo"):
            (self.directory / "repo").mkdir()
            try:
                (self.directory / "alias").symlink_to(self.directory / "repo", target_is_directory=True)
            except OSError:
                pass  # Windows symlink privilege may be unavailable; resolved-path policy still tested above.
            else:
                with self.assertRaises(ValueError):
                    private_output_base(self.directory / "alias" / "leak")
        source = self.source()
        first, second = self.run_import([source]), self.run_import([source])
        self.assertNotEqual(first, second)
        self.assertTrue((first / "manifest.json").exists())
        with self.assertRaises(ValueError):
            import_archive([source], self.output, as_of=datetime(2026, 1, 1))

    def test_cli_returns_nonzero_for_gaps_without_printing_message_content(self):
        import io
        source = self.source({"not": "a recognized export"})
        with patch("sys.stdout", new_callable=io.StringIO) as stdout:
            code = main([str(source), "--output", str(self.output)])
        self.assertEqual(2, code)
        self.assertNotIn("recognized export", stdout.getvalue())


if __name__ == "__main__":
    unittest.main()

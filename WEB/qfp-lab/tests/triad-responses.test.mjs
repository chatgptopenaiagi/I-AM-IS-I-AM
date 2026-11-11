import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { makeResearchModel } from "../js/research-interface.js";
import { runExperiment } from "../js/research-experiments.js";
import {
  readBoundedJSON,
  checkExplanation,
  checkWolfram,
} from "../js/triad-responses.js";
const model = makeResearchModel(
  JSON.parse(
    await readFile(new URL("../data/research.json", import.meta.url), "utf8"),
  ),
);
test("gateway JSON is bounded while streaming including untrusted content lengths", async () => {
  assert.deepEqual(await readBoundedJSON(new Response('{"ok":true}')), {
    ok: true,
  });
  await assert.rejects(
    readBoundedJSON(new Response("x".repeat(20)), 10),
    /too large/,
  );
  await assert.rejects(
    readBoundedJSON(
      new Response("{}", { headers: { "content-length": "600000" } }),
    ),
    /too large/,
  );
  await assert.rejects(readBoundedJSON(new Response("not JSON")));
});
test("synthetic explanation fixtures cannot claim execution, change context or cite unrelated records", () => {
  const id = "QFP-D005",
    answer = {
      schema_version: "1.0",
      status: "AVAILABLE",
      provider_status: "AI_RESPONSE",
      verification: "UNVERIFIED_AI_OUTPUT",
      claim_id: id,
      source_revision: model.source_revision,
      answer: "Synthetic test response, not live inference",
      basis: ["AI_GENERATED_REASONING"],
      source_ids: model.objects.find((o) => o.id === id).source_ids,
      computation_executed: false,
    };
  assert.equal(checkExplanation(answer, model, id), answer);
  for (const patch of [
    { claim_id: "QFP-S001" },
    { source_revision: "foreign" },
    { computation_executed: true },
    { basis: {} },
    { source_ids: ["SRC-HIST-TOPOLOGY"] },
    { answer: 42 },
  ])
    assert.throws(() => checkExplanation({ ...answer, ...patch }, model, id));
});
test("synthetic Wolfram response fixtures require matching execution identity and honest comparison", () => {
  const reference = runExperiment(model, {
    claim_id: "ATLAS-LOG-SCALE",
    experiment_id: "log-scale",
    parameters: { q: 3, l0: 2 },
  });
  const fixture = {
    ...structuredClone(reference),
    engine: "wolfram",
    status: "COMPUTED",
    runtime: { version: "SYNTHETIC TEST ONLY", system: "synthetic" },
    validation: {
      empirical_support: false,
      comparison: { pass: true },
      independent_engine: "AGREES_WITH_JAVASCRIPT",
    },
  };
  assert.equal(checkWolfram(fixture, model, reference), fixture);
  for (const patch of [
    { engine: "javascript" },
    { runtime: null },
    { input: { claim_id: "foreign" } },
    { source_revision: "foreign" },
    { output: { ...reference.output, length: 999 } },
  ])
    assert.throws(() =>
      checkWolfram({ ...fixture, ...patch }, model, reference),
    );
  const disagreement = structuredClone(fixture);
  disagreement.output.length = 999;
  disagreement.validation.comparison.pass = false;
  disagreement.validation.independent_engine = "DISAGREES_WITH_JAVASCRIPT";
  assert.equal(checkWolfram(disagreement, model, reference), disagreement);
});
test("unavailable Wolfram records must not claim an executed engine", () => {
  const reference = runExperiment(model, {
    claim_id: "ATLAS-BALL-PROJECTION",
    experiment_id: "ball-projection",
  });
  const unavailable = {
    schema_version: "1.0",
    source_revision: model.source_revision,
    input: reference.input,
    status: "UNAVAILABLE",
    engine: null,
  };
  assert.equal(checkWolfram(unavailable, model, reference), unavailable);
  assert.throws(() =>
    checkWolfram({ ...unavailable, engine: "wolfram" }, model, reference),
  );
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { makeResearchModel } from "../js/research-interface.js";
import { runExperiment } from "../js/research-experiments.js";
import {
  TOPICS,
  cleanTriadState,
  encodeTriadState,
  decodeTriadState,
  importExperiment,
  gatewayURL,
} from "../js/triad-state.js";
const model = makeResearchModel(
  JSON.parse(
    await readFile(new URL("../data/research.json", import.meta.url), "utf8"),
  ),
);
test("all shared research IDs have a selectable topic without changing the corpus", () => {
  assert.equal(new Set(Object.values(TOPICS).flat()).size, 34);
  for (const o of model.objects)
    assert.ok(Object.values(TOPICS).flat().includes(o.id));
});
test("Triad state roundtrips with one canonical context and no service credentials", () => {
  const state = cleanTriadState(
    { topic: "scale", language: "ro", parameters: { q: 7, l0: 2 } },
    model,
  );
  assert.deepEqual(
    decodeTriadState(encodeTriadState(state, model), model),
    state,
  );
  assert.equal(state.claim_id, "ATLAS-LOG-SCALE");
  assert.throws(
    () => cleanTriadState({ ...state, token: "synthetic-credential" }, model),
    /Unknown/,
  );
});
test("invalid version, nonfinite values and unknown claim cannot mutate shared state", () => {
  for (const input of [
    { version: 9 },
    { topic: "qfp", claim_id: "QFP-S001" },
    { parameters: { m3: Infinity } },
    { topic: "scale", parameters: { q: "3" } },
    { topic: "identity", parameters: { q: 1 } },
    { topic: "__proto__" },
  ])
    assert.throws(() => cleanTriadState(input, model));
  assert.equal(cleanTriadState({}, model).claim_id, "QFP-D005");
});
test("large and malformed URL fragments are rejected", () => {
  assert.throws(() => decodeTriadState("#triad=%QQ", model));
  assert.throws(() => decodeTriadState("#triad=" + "x".repeat(15000), model));
});
test("experiment import recomputes actual outputs and rejects altered evidence", () => {
  const result = runExperiment(model, {
    claim_id: "ATLAS-LOG-SCALE",
    experiment_id: "log-scale",
    parameters: { q: 3, l0: 2 },
  });
  assert.equal(importExperiment(result, model).parameters.q, 3);
  for (const field of ["output", "validation", "process", "limitations"]) {
    const edited = structuredClone(result);
    edited[field] = { fabricated: true };
    assert.throws(() => importExperiment(edited, model), /differs/);
  }
  const foreign = structuredClone(result);
  foreign.source_revision = "unknown";
  assert.throws(() => importExperiment(foreign, model), /matching-version/);
});
test("Wolfram output cannot impersonate a locally reproduced browser record", () => {
  const r = runExperiment(model, {
    claim_id: "ATLAS-BALL-PROJECTION",
    experiment_id: "ball-projection",
    parameters: { s: 1 },
  });
  assert.throws(
    () => importExperiment({ ...r, engine: "wolfram" }, model),
    /browser experiment/,
  );
});
test("gateway address rejects credentials and non-loopback HTTP without touching private configuration", () => {
  assert.equal(gatewayURL("http://127.0.0.1:4318"), "http://127.0.0.1:4318");
  assert.equal(
    gatewayURL("https://research.example"),
    "https://research.example",
  );
  for (const url of [
    "http://example.com",
    "https://u:p@example.com",
    "https://example.com/?token=bad",
    "https://example.com/path",
    "javascript:alert(1)",
    "file:///C:/private",
  ])
    assert.throws(() => gatewayURL(url));
});

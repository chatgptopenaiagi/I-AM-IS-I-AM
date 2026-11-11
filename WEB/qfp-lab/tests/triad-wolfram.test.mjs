// Synthetic protocol tests only. No fixture here is evidence of Wolfram execution.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeResearchModel } from "../js/research-interface.js";
import { runExperiment } from "../js/research-experiments.js";
import {
  inspectWolframAvailability,
  runWolframExperiment,
  parseWolframOutput,
  compareEngineOutputs,
} from "../../../services/wolfram/adapter.mjs";
const model = makeResearchModel(
  JSON.parse(
    readFileSync(new URL("../data/research.json", import.meta.url), "utf8"),
  ),
);
const req = {
  claim_id: "ATLAS-LOG-SCALE",
  experiment_id: "log-scale",
  parameters: { q: 0, l0: 1 },
};
const js = runExperiment(model, req);
const synthetic = () => ({
  schema_version: "1.0",
  engine: "wolfram",
  source_revision: model.source_revision,
  input: structuredClone(js.input),
  output: structuredClone(js.output),
  runtime: {
    version: "SYNTHETIC PARSER FIXTURE; NOT A WOLFRAM RUN",
    system: "SYNTHETIC",
  },
});
test("Missing local Wolfram configuration reports unavailable without pretending to execute", async () => {
  assert.equal(
    (await inspectWolframAvailability({ executable: "" })).status,
    "UNAVAILABLE",
  );
  const result = await runWolframExperiment(model, req, { executable: "" });
  assert.equal(result.status, "UNAVAILABLE");
  assert.equal(result.engine, null);
  assert.equal(result.validation.independent_engine, "NOT_RUN");
  assert.equal(result.output, undefined);
});
test("Wolfram executable options reject relative paths and other program names", async () => {
  for (const executable of [
    "wolframscript",
    "https://example.invalid/kernel",
    "C:\\Windows\\System32\\cmd.exe",
  ])
    assert.equal(
      (await inspectWolframAvailability({ executable })).status,
      "UNAVAILABLE",
    );
  await assert.rejects(
    () =>
      runWolframExperiment(model, req, { executable: "", timeoutMs: 30001 }),
    RangeError,
  );
});
test("Synthetic parser fixture requires exact source and input identity, finite outputs and runtime metadata", () => {
  assert.equal(
    parseWolframOutput(
      JSON.stringify(synthetic()),
      js.input,
      model.source_revision,
      js.output,
    ).runtime.system,
    "SYNTHETIC",
  );
  for (const mutate of [
    (x) => (x.source_revision = "wrong"),
    (x) => (x.input.claim_id = "ATLAS-BEING"),
    (x) => (x.output.length = "Run[bad]"),
    (x) => delete x.runtime,
    (x) => (x.output.extra = 1),
  ]) {
    const raw = synthetic();
    mutate(raw);
    assert.throws(() =>
      parseWolframOutput(
        JSON.stringify(raw),
        js.input,
        model.source_revision,
        js.output,
      ),
    );
  }
  assert.throws(() =>
    parseWolframOutput("not JSON", js.input, model.source_revision, js.output),
  );
  assert.throws(() =>
    parseWolframOutput(
      " ".repeat(65537),
      js.input,
      model.source_revision,
      js.output,
    ),
  );
});
test("Synthetic cross-engine comparison detects tiny positive length changes without a masking absolute floor", () => {
  assert.equal(
    compareEngineOutputs({ length: 1e-21 }, { length: 1e-21 }).pass,
    true,
  );
  assert.equal(
    compareEngineOutputs({ length: 1e-21 }, { length: 0 }).pass,
    false,
  );
  assert.equal(
    compareEngineOutputs({ value: 1 }, { value: 1 + 1e-12 }).pass,
    true,
  );
  assert.equal(compareEngineOutputs({ value: 1 }, { value: 1.1 }).pass, false);
});
test("Fixed Wolfram files exist and contain explicit numeric JSON entry points, not string evaluation", () => {
  const script = readFileSync(
    new URL("../../../services/wolfram/run-experiment.wls", import.meta.url),
    "utf8",
  );
  const models = readFileSync(
    new URL("../../../services/wolfram/TriadModels.wl", import.meta.url),
    "utf8",
  );
  assert.match(script, /ImportString\[\$ScriptInputString, "RawJSON"\]/);
  assert.match(script, /TimeConstrained/);
  assert.match(models, /TriadValidateInput/);
  assert.doesNotMatch(
    script + models,
    /ToExpression|CloudDeploy|URLExecute|RunProcess/,
  );
});

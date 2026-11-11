import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  makeResearchModel,
  getResearchObject,
  validateResearchModel,
  stableResearchJSON,
} from "../js/research-interface.js";
import {
  listExperiments,
  runExperiment,
  normalizeExperimentRequest,
} from "../js/research-experiments.js";
const data = JSON.parse(
  readFileSync(new URL("../data/research.json", import.meta.url), "utf8"),
);
const model = makeResearchModel(data),
  clone = (value) => JSON.parse(JSON.stringify(value));
const request = (claim_id, experiment_id, parameters = {}) => ({
  claim_id,
  experiment_id,
  parameters,
});

test("Triad adapter preserves every source ID, record and five epistemic axes without mutation", () => {
  assert.equal(model.objects.length, 34);
  assert.deepEqual(model.objects, data.claims);
  assert.deepEqual(model.branches, data.branches);
  assert.deepEqual(model.relationships, data.edges);
  for (const claim of data.claims)
    for (const axis of [
      "object_type",
      "epistemic_status",
      "domain",
      "depends_on",
      "validation",
    ])
      assert.deepEqual(getResearchObject(model, claim.id)[axis], claim[axis]);
  assert.ok(Object.isFrozen(model.objects[0]));
  assert.throws(() => {
    model.objects[0].epistemic_status = "ESTABLISHED";
  });
  assert.equal(getResearchObject(model, "unknown"), null);
});
test("Triad revision is deterministic and object-key ordering is irrelevant", () => {
  const reverse = (value) =>
    Array.isArray(value)
      ? value.map(reverse)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.keys(value)
              .reverse()
              .map((key) => [key, reverse(value[key])]),
          )
        : value;
  assert.equal(
    makeResearchModel(reverse(data)).source_revision,
    model.source_revision,
  );
  assert.equal(
    stableResearchJSON(model),
    stableResearchJSON(makeResearchModel(data)),
  );
});
test("Imported model is compared with trusted source, not authenticated by its own fingerprint", () => {
  const changed = clone(data);
  changed.claims[0].epistemic_status = "ESTABLISHED";
  const forged = makeResearchModel(changed);
  assert.equal(validateResearchModel(forged).trust, "STRUCTURAL_ONLY");
  assert.equal(validateResearchModel(forged, model).valid, false);
  assert.ok(
    validateResearchModel(forged, model).errors.some(
      (e) => e.code === "TRUSTED_SOURCE_MISMATCH",
    ),
  );
  assert.equal(validateResearchModel(clone(model), model).valid, true);
  const stale = clone(model);
  stale.objects[0].domain = ["GLOBAL"];
  assert.ok(
    validateResearchModel(stale).errors.some(
      (e) => e.code === "SOURCE_REVISION",
    ),
  );
});
test("Malformed IDs, dependencies, axes, cycles and nonfinite data are rejected", () => {
  for (const mutate of [
    (d) => d.claims.push(clone(d.claims[0])),
    (d) => delete d.claims[0].validation,
    (d) => (d.claims[0].depends_on = ["unknown"]),
    (d) => (d.claims[0].depends_on = [d.claims[0].id]),
    (d) => (d.claims[0].domain = NaN),
  ]) {
    const changed = clone(data);
    mutate(changed);
    assert.throws(() => makeResearchModel(changed));
  }
});
test("Only four implemented experiment bindings exist; philosophy cannot borrow a computation", () => {
  assert.equal(listExperiments(model).length, 4);
  assert.throws(
    () => runExperiment(model, request("ATLAS-BEING", "ball-projection")),
    /No implemented/,
  );
  assert.throws(
    () => runExperiment(model, request("QFP-D005", "log-scale")),
    /No implemented/,
  );
  assert.ok(
    listExperiments(model)
      .find((x) => x.claim_id === "QFP-D005")
      .dependencies.includes("QFP-M001"),
  );
});
test("Numeric request boundary rejects strings, expressions, unknown keys, fractional counts and range overflow", () => {
  const ball = request("ATLAS-BALL-PROJECTION", "ball-projection");
  for (const parameters of [
    { s: "0" },
    { s: "Run[command]" },
    { s: Infinity },
    { s: NaN },
    { s: 1.21 },
    { s: 0, code: 2 },
    JSON.parse('{"__proto__":1}'),
  ])
    assert.throws(() =>
      normalizeExperimentRequest(model, { ...ball, parameters }),
    );
  assert.throws(() =>
    normalizeExperimentRequest(model, { ...ball, engine: "wolfram" }),
  );
  assert.throws(() =>
    runExperiment(
      model,
      request("ATLAS-INTEGER-ACCESS", "integer-access", { n: 1.5 }),
    ),
  );
  assert.throws(() =>
    runExperiment(model, request("ATLAS-LOG-SCALE", "log-scale", { l0: 0 })),
  );
});
test("Ball experiment distinguishes exterior, boundary and interior slices from fixed projection", () => {
  for (const [s, kind] of [
    [-1.2, "empty"],
    [-1, "point"],
    [0, "disk"],
    [1, "point"],
    [1.2, "empty"],
  ]) {
    const result = runExperiment(
      model,
      request("ATLAS-BALL-PROJECTION", "ball-projection", { s }),
    );
    assert.equal(result.output.slice.kind, kind);
    assert.equal(result.output.projection.radius, 1);
    assert.ok(result.validation.checks.every((x) => x.pass));
  }
});
test("Integer state transition is independent of center and window width", () => {
  const first = runExperiment(
    model,
    request("ATLAS-INTEGER-ACCESS", "integer-access", {
      n: 10,
      center: 0,
      width: 2,
    }),
  );
  const second = runExperiment(
    model,
    request("ATLAS-INTEGER-ACCESS", "integer-access", {
      n: 10,
      center: 10,
      width: 8,
    }),
  );
  assert.equal(first.output.next, second.output.next);
  assert.equal(first.output.state_visible, false);
  assert.equal(second.output.state_visible, true);
  assert.ok(second.validation.checks.every((x) => x.pass));
});
test("Log scale computes finite positive extremes and relative reciprocal checks", () => {
  for (const q of [-12, 0, 12])
    for (const l0 of [1e-9, 1, 1e9]) {
      const result = runExperiment(
        model,
        request("ATLAS-LOG-SCALE", "log-scale", { q, l0 }),
      );
      assert.ok(result.output.length > 0);
      assert.ok(result.validation.checks.every((x) => x.pass));
      if (q === 0) assert.equal(result.output.length, l0);
    }
});
test("QFP exact local identities preserve signs, scalar closure and reference classification", () => {
  for (const Lambda of [-3, 0, 3]) {
    const result = runExperiment(
      model,
      request("QFP-D005", "qfp-local", { m3: Lambda / 6, delta2: 0, Lambda }),
    );
    assert.equal(result.output.R0, 4 * Lambda);
    assert.equal(result.output.GB0, (8 * Lambda ** 2) / 3);
    assert.equal(result.output.reference_check.pass, true);
    assert.equal(
      result.output.reference_class,
      Lambda < 0
        ? "anti-de Sitter-type"
        : Lambda > 0
          ? "de Sitter"
          : "Minkowski",
    );
    const closed = runExperiment(
      model,
      request("QFP-D005", "qfp-local", {
        m3: Lambda / 6,
        delta2: 0,
        Lambda,
        Phi2: result.output.solvedPhi2,
      }),
    );
    assert.ok(Math.abs(closed.output.scalarResidual) < 1e-10);
  }
});
test("Experiment provenance preserves assumptions and boundaries; results are deterministic and not empirical", () => {
  for (const descriptor of listExperiments(model)) {
    const req = request(descriptor.claim_id, descriptor.experiment_id),
      result = runExperiment(model, req),
      claim = getResearchObject(model, descriptor.claim_id);
    assert.deepEqual(result, runExperiment(model, req));
    assert.equal(result.engine, "javascript");
    assert.equal(result.validation.empirical_support, false);
    assert.equal(result.validation.independent_engine, "NOT_RUN");
    assert.deepEqual(result.process.assumptions, claim.assumptions);
    assert.deepEqual(result.process.definitions, claim.definitions);
    assert.equal(result.source_revision, model.source_revision);
  }
});

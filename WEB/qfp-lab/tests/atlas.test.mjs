import test from "node:test";
import assert from "node:assert/strict";
import {
  ballSlice,
  projectXY,
  lengthAt,
  logAt,
  successor,
  visibleIntegers,
} from "../js/atlas-math.js";
import {
  cleanState,
  encodeState,
  decodeState,
  downstream,
} from "../js/atlas-state.js";
test("solid ball slice boundaries include points and empty exterior", () => {
  assert.equal(ballSlice(0).radius, 1);
  for (const s of [-1, 1])
    assert.deepEqual(ballSlice(s), { kind: "point", radius: 0, area: 0 });
  assert.equal(ballSlice(1.01).kind, "empty");
  assert.equal(ballSlice(-1.01).kind, "empty");
  assert.equal(ballSlice(0.6).radius, 0.8);
  assert.throws(() => ballSlice(NaN));
});
test("projection discards z and has distinct preimages inside ball", () =>
  assert.deepEqual(projectXY([0.3, 0.2, 0.5]), projectXY([0.3, 0.2, -0.5])));
test("positive logarithmic conversion and reflection round trip", () => {
  for (const l0 of [1e-9, 1, 1e9])
    for (const q of [-12, -3, 0, 3, 12]) {
      assert.ok(Math.abs(logAt(lengthAt(q, l0), l0) - q) < 1e-12);
      assert.ok(
        Math.abs((lengthAt(q, l0) * lengthAt(-q, l0)) / l0 ** 2 - 1) < 1e-12,
      );
    }
  for (const x of [0, -1, Infinity, NaN]) assert.throws(() => logAt(x, 1));
  assert.throws(() => lengthAt(1, 0));
  assert.throws(() => lengthAt(400, 1));
});
test("view movement and width do not change model successor", () => {
  const state = cleanState();
  const changed = cleanState({
    ...state,
    access: { ...state.access, center: 20, width: 10 },
  });
  assert.equal(changed.access.n, state.access.n);
  assert.equal(successor(changed.access.n), 1);
  assert.equal(visibleIntegers(20, 10).length, 21);
  assert.throws(() => successor(Number.MAX_SAFE_INTEGER));
});
test("state selects known keys, rejects versions, clamps finite numbers and restores", () => {
  const state = cleanState({
    projection: { s: 99 },
    qfp: { m3: Infinity, Phi0: "evil" },
    scale: { l0: 0, q: -900 },
    access: { n: 4.2 },
  });
  assert.equal(state.projection.s, 1.2);
  assert.equal(state.scale.q, -12);
  assert.equal(state.scale.l0, 1e-9);
  assert.equal(state.access.n, 4);
  assert.deepEqual(decodeState(encodeState(state)), state);
  for (const raw of [[], null, "<script>"])
    assert.deepEqual(cleanState(raw), cleanState());
  assert.throws(() => cleanState({ version: 9 }));
  assert.throws(() => decodeState("#atlas=%ZZ"));
  assert.throws(() => decodeState("#atlas=" + "x".repeat(12001)));
});
test("dependency impact follows transitive edges, not ID prefixes, without mutation", () => {
  const c = [
    { id: "a", epistemic_status: "DERIVED" },
    { id: "b", depends_on: ["a"] },
    { id: "c", depends_on: ["b"] },
    { id: "d", depends_on: [] },
  ];
  assert.deepEqual(downstream(c, "a"), ["b", "c"]);
  assert.equal(c[0].epistemic_status, "DERIVED");
});

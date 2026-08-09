import assert from 'node:assert/strict';
import { massAtRadius, deltaAtRadius, phiAtRadius, NAtRadius, hasNZeroCrossing, boxPhi0, ricci0, gaussBonnet0, scalarResidual, deSitterCheck } from '../js/qfp-math.js';
import { DEFAULTS, LIMITS, createState, createDeSitterPresetState } from '../js/qfp-model.js';

assert.equal(boxPhi0(2.5), 15);
assert.equal(ricci0(0.5, 0.25), 9);
assert.equal(gaussBonnet0(0.5, 0.25), 12);
assert.ok(Math.abs(NAtRadius(2, 0.1) - 0.2) < 1e-14);
assert.equal(scalarResidual({ Phi2: 1, Vp0: 2, Fp0: 3, alpha: 0.5, Hp0: 2, m3: 0.5, delta2: 0.25 }), 43);
for (const Lambda of [-1.2, 0, 2.4]) { const check = deSitterCheck({ Lambda, m3: Lambda / 6, delta2: 0 }, 1e-12); assert.equal(check.pass, true); assert.ok(Math.abs(check.actual.R0 - 4 * Lambda) < 1e-12); assert.ok(Math.abs(check.actual.GB0 - 8 * Lambda ** 2 / 3) < 1e-12); }
const state = createState(DEFAULTS); assert.ok(Object.values(state).every(Number.isFinite));
for (const [key, [min, max]] of Object.entries(LIMITS)) for (const value of [min, max]) { const p = createState({ ...DEFAULTS, [key]: value }); const values = [massAtRadius(p.rMax,p.m3),deltaAtRadius(p.rMax,p.delta0,p.delta2),phiAtRadius(p.rMax,p.Phi0,p.Phi2),NAtRadius(p.rMax,p.m3),boxPhi0(p.Phi2),ricci0(p.m3,p.delta2),gaussBonnet0(p.m3,p.delta2),scalarResidual(p)]; assert.ok(values.every(Number.isFinite), `${key} boundary produced non-finite output`); }
assert.throws(() => ricci0(Infinity, 0), RangeError);
assert.equal(hasNZeroCrossing(-0.150, 2), false);
assert.equal(hasNZeroCrossing(0.150, 2), true);
assert.equal(hasNZeroCrossing(0.125, 2), true);
assert.equal(hasNZeroCrossing(0.124, 2), false);
const resetState = createState(DEFAULTS); assert.equal(hasNZeroCrossing(resetState.m3, resetState.rMax), false);
const presetState = createDeSitterPresetState({ ...DEFAULTS, Lambda: 3, rMax: 2 }); assert.equal(presetState.m3, 0.5); assert.equal(presetState.delta2, 0); assert.equal(hasNZeroCrossing(presetState.m3, presetState.rMax), true);
assert.throws(() => hasNZeroCrossing(0.1, -1), RangeError);
console.log('QFP math tests: 12 test groups passed.');

// Supplemental atlas review checks. No renderer, network, ODE solver or claims of
// global validity. The mixed tolerance is tested in reference-mass-scaled units.
import assert from 'node:assert/strict';
import { ricci0, gaussBonnet0, deSitterCheck, hasNZeroCrossing, scalarResidual } from '../js/qfp-math.js';

for (const Lambda of [-3, 0, 3]) {
  const p = { Lambda, m3: Lambda / 6, delta2: 0 };
  assert.equal(deSitterCheck(p, 1e-12).pass, true);
  assert.equal(Math.sign(ricci0(p.m3, 0)), Math.sign(Lambda));
  assert.ok(gaussBonnet0(p.m3, 0) >= 0);
  // Passing algebra at negative/zero Lambda does not make a de Sitter spacetime.
}
const tolerance = 1e-10;
assert.equal(deSitterCheck({ Lambda: 0, m3: 0, delta2: -tolerance / 24 }, tolerance).pass, true);
assert.equal(deSitterCheck({ Lambda: 0, m3: 0, delta2: -tolerance / 6 }, tolerance).pass, false);
assert.equal(deSitterCheck({ Lambda: 0, m3: 0, delta2: -tolerance / 24 }, 0).pass, false);
assert.equal(hasNZeroCrossing(0.5, 1), true);
assert.equal(hasNZeroCrossing(0.5, 0.999), false);
assert.equal(hasNZeroCrossing(-0.5, 3), false);
const p = { Phi2: 0.2, Vp0: 0.3, Fp0: 0.4, alpha: -0.1, Hp0: 0.5, m3: 0.1, delta2: 0.05 };
for (const mu of [0.1, 1, 10]) {
  const scaled = { ...p, Phi2: mu ** 3 * p.Phi2, Vp0: mu ** 3 * p.Vp0, Fp0: mu * p.Fp0, Hp0: p.Hp0 / mu, m3: mu ** 2 * p.m3, delta2: mu ** 2 * p.delta2 };
  const expected = mu ** 3 * scalarResidual(p);
  assert.ok(Math.abs(scalarResidual(scaled) - expected) <= 1e-12 * Math.max(1, Math.abs(expected)));
}
assert.throws(() => deSitterCheck({ Lambda: 1, m3: 1/6, delta2: 0 }, -1), RangeError);
assert.throws(() => deSitterCheck({ Lambda: Infinity, m3: 0, delta2: 0 }), RangeError);
console.log('Atlas math review: 6 supplemental groups passed (sign branches, absolute floor, zero tolerance, chart boundary, dimensional scaling, invalid inputs).');

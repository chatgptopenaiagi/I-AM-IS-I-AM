const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
};

export function massAtRadius(r, m3) { return finite(m3, 'm3') * finite(r, 'r') ** 3; }
export function deltaAtRadius(r, delta0, delta2) { return finite(delta0, 'delta0') + finite(delta2, 'delta2') * finite(r, 'r') ** 2; }
export function phiAtRadius(r, Phi0, Phi2) { return finite(Phi0, 'Phi0') + finite(Phi2, 'Phi2') * finite(r, 'r') ** 2; }
export function NAtRadius(r, m3) { return 1 - 2 * finite(m3, 'm3') * finite(r, 'r') ** 2; }
export function hasNZeroCrossing(m3, rMax) {
  finite(m3, 'm3');
  finite(rMax, 'rMax');
  if (rMax < 0) throw new RangeError('rMax must be non-negative');
  return m3 > 0 && NAtRadius(rMax, m3) <= 0;
}
export function boxPhi0(Phi2) { return 6 * finite(Phi2, 'Phi2'); }
export function ricci0(m3, delta2) { return 24 * finite(m3, 'm3') - 12 * finite(delta2, 'delta2'); }
export function gaussBonnet0(m3, delta2) { return 96 * finite(m3, 'm3') * (finite(m3, 'm3') - finite(delta2, 'delta2')); }

export function scalarResidual(params) {
  const { Phi2, Vp0, Fp0, alpha, Hp0, m3, delta2 } = params;
  return boxPhi0(Phi2) - finite(Vp0, 'Vp0') + ricci0(m3, delta2) * finite(Fp0, 'Fp0')
    + finite(alpha, 'alpha') * gaussBonnet0(m3, delta2) * finite(Hp0, 'Hp0');
}

export function deSitterExpected(Lambda) {
  finite(Lambda, 'Lambda');
  return { R0: 4 * Lambda, GB0: 8 * Lambda ** 2 / 3 };
}

export function deSitterCheck(params, tolerance = 1e-10) {
  const Lambda = finite(params.Lambda, 'Lambda');
  finite(tolerance, 'tolerance');
  if (tolerance < 0) throw new RangeError('tolerance must be non-negative');
  const actual = { R0: ricci0(params.m3, params.delta2), GB0: gaussBonnet0(params.m3, params.delta2) };
  const expected = deSitterExpected(Lambda);
  const close = (a, b) => Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
  return { pass: close(actual.R0, expected.R0) && close(actual.GB0, expected.GB0), actual, expected, tolerance };
}

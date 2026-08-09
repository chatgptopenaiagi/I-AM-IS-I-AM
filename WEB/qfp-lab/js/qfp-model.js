export const LIMITS = {
  m3: [-1, 1], delta0: [-2, 2], delta2: [-1, 1], Phi0: [-2, 2], Phi2: [-1, 1],
  alpha: [-2, 2], Fp0: [-2, 2], Hp0: [-2, 2], Vp0: [-5, 5], rMax: [0.2, 3], Lambda: [-3, 3]
};
export const DEFAULTS = Object.freeze({ m3: 0.12, delta0: 0, delta2: 0.04, Phi0: 0, Phi2: 0.18, alpha: 0.1, Fp0: 0.2, Hp0: 0.1, Vp0: 0, rMax: 2, Lambda: 0.6 });
export const MODES = Object.freeze(['regular', 'scalar', 'metric', 'curvature']);

export function sanitize(name, value) {
  const range = LIMITS[name];
  const number = Number(value);
  if (!range || !Number.isFinite(number)) return DEFAULTS[name];
  return Math.min(range[1], Math.max(range[0], number));
}
export function createState(values = {}) {
  return Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, sanitize(key, values[key] ?? DEFAULTS[key])]));
}
export function createDeSitterPresetState(values = {}) {
  const state = createState(values);
  return createState({ ...state, delta2: 0, m3: state.Lambda / 6 });
}

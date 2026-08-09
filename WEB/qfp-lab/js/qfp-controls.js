import { DEFAULTS, LIMITS, createState, createDeSitterPresetState, sanitize } from './qfp-model.js';

const LABELS = { m3: 'm₃', delta0: 'δ₀', delta2: 'δ₂', Phi0: 'Φ₀', Phi2: 'Φ₂', alpha: 'α', Fp0: "F′(Φ₀)", Hp0: "H′(Φ₀)", Vp0: "V′(Φ₀)", rMax: 'r maximum', Lambda: 'Λ (preset)' };

export function mountControls(root, initial, onChange, onPreset) {
  let state = createState(initial);
  const fields = {};
  for (const [name, [min, max]] of Object.entries(LIMITS)) {
    const wrap = document.createElement('div'); wrap.className = 'control';
    const label = document.createElement('label'); label.htmlFor = `control-${name}`; label.textContent = LABELS[name];
    const output = document.createElement('output'); output.htmlFor = `control-${name}`;
    const input = document.createElement('input');
    input.type = 'range'; input.id = `control-${name}`; input.min = min; input.max = max;
    input.step = name === 'rMax' ? '0.05' : '0.01'; input.value = state[name];
    const update = () => { state[name] = sanitize(name, input.value); output.value = state[name].toFixed(3); onChange({ ...state }); };
    input.addEventListener('input', update); fields[name] = { input, output };
    wrap.append(label, output, input); root.append(wrap); output.value = state[name].toFixed(3);
  }
  const sync = () => Object.entries(fields).forEach(([key, f]) => { f.input.value = state[key]; f.output.value = state[key].toFixed(3); });
  document.querySelector('#reset').addEventListener('click', () => { state = createState(DEFAULTS); sync(); onChange({ ...state }); onPreset(false); });
  document.querySelector('#de-sitter').addEventListener('click', () => { state = createDeSitterPresetState(state); sync(); onChange({ ...state }); onPreset(true); });
  return () => ({ ...state });
}

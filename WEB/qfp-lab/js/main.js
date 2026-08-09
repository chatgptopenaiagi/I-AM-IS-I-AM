import { DEFAULTS } from './qfp-model.js';
import { mountControls } from './qfp-controls.js';
import { boxPhi0, ricci0, gaussBonnet0, scalarResidual, deSitterCheck, hasNZeroCrossing } from './qfp-math.js';

let scene = null, mode = 'regular', presetActive = false;
const fmt = (n) => Number.isFinite(n) ? n.toPrecision(7) : 'INVALID';
function render(state) {
  const R0 = ricci0(state.m3, state.delta2), GB0 = gaussBonnet0(state.m3, state.delta2), box = boxPhi0(state.Phi2), residual = scalarResidual(state);
  document.querySelector('#out-r').textContent = fmt(R0); document.querySelector('#out-gb').textContent = fmt(GB0);
  document.querySelector('#out-box').textContent = fmt(box); document.querySelector('#out-residual').textContent = fmt(residual);
  document.querySelector('#equations-live').innerHTML = `
    <p>m(r) = ${fmt(state.m3)} r³; δ(r) = ${fmt(state.delta0)} + ${fmt(state.delta2)} r²</p>
    <p>Φ(r) = ${fmt(state.Phi0)} + ${fmt(state.Phi2)} r²; N(r) = 1 − 2(${fmt(state.m3)})r²</p>
    <p>□Φ(0) = 6(${fmt(state.Phi2)}) = <strong>${fmt(box)}</strong></p>
    <p>R(0) = 24(${fmt(state.m3)}) − 12(${fmt(state.delta2)}) = <strong>${fmt(R0)}</strong></p>
    <p>𝒢(0) = 96(${fmt(state.m3)})[${fmt(state.m3)} − ${fmt(state.delta2)}] = <strong>${fmt(GB0)}</strong></p>
    <p>Residual = 6(${fmt(state.Phi2)}) − ${fmt(state.Vp0)} + (${fmt(R0)})(${fmt(state.Fp0)}) + (${fmt(state.alpha)})(${fmt(GB0)})(${fmt(state.Hp0)}) = <strong>${fmt(residual)}</strong></p>`;
  const localWarning = hasNZeroCrossing(state.m3, state.rMax);
  document.querySelector('#domain-warning').hidden = !localWarning;
  const check = deSitterCheck(state, 1e-10), checkEl = document.querySelector('#ds-check');
  checkEl.textContent = presetActive ? `DE SITTER CHECK: ${check.pass ? 'PASS' : 'FAIL'} — calculated R₀ ${fmt(check.actual.R0)} vs 4Λ ${fmt(check.expected.R0)}; calculated 𝒢₀ ${fmt(check.actual.GB0)} vs 8Λ²/3 ${fmt(check.expected.GB0)} (relative tolerance 1e−10).` : 'De Sitter check inactive. Apply the preset to set δ₂ = 0 and m₃ = Λ/6.';
  checkEl.className = presetActive ? (check.pass ? 'pass' : 'fail') : '';
  scene?.update(state, mode);
}
const getState = mountControls(document.querySelector('#controls'), DEFAULTS, render, (active) => { presetActive = active; render(getState()); });
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); render(getState()); }));
render(DEFAULTS);
import('./qfp-scene.js').then(({ createScene }) => { scene = createScene(document.querySelector('#scene')); scene.update(getState(), mode); document.querySelector('#webgl-status').textContent = 'WebGL scene ready. Mouse: orbit/rotate, wheel: zoom, right-drag: pan.'; }).catch((error) => { console.error(error); document.querySelector('#webgl-status').textContent = '3D scene unavailable. The equations, controls, results, and scientific status remain operational.'; });

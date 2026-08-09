import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { massAtRadius, deltaAtRadius, phiAtRadius, NAtRadius } from './qfp-math.js';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x071018);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100); camera.position.set(4, 3, 5);
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.screenSpacePanning = true;
  scene.add(new THREE.HemisphereLight(0xaadfff, 0x17202b, 2.2));
  const axes = new THREE.AxesHelper(2.6); scene.add(axes);
  const grid = new THREE.GridHelper(6, 12, 0x31546b, 0x172b38); scene.add(grid);
  const origin = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); scene.add(origin);
  const group = new THREE.Group(); scene.add(group);
  function clear() { while (group.children.length) { const o = group.children.pop(); o.geometry?.dispose(); o.material?.dispose(); } }
  function curve(fn, color, scale = 1) {
    const points = Array.from({ length: 121 }, (_, i) => { const r = i / 120; return new THREE.Vector3((r * 2 - 1) * 2.2, fn(Math.abs(r * 2 - 1)) * scale, 0); });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color })));
  }
  function shell(radius, color, opacity) { group.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 20), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity }))); }
  function update(state, mode) {
    clear(); const rm = state.rMax;
    if (mode === 'regular') {
      [0.25, .5, .75, 1].forEach((f, i) => shell(2.2 * f, 0x2ca8c2, .12 + i * .05));
      curve((x) => massAtRadius(x * rm, state.m3), 0xffb454, .9);
      curve((x) => deltaAtRadius(x * rm, state.delta0, state.delta2), 0x8edb75, .7);
      curve((x) => phiAtRadius(x * rm, state.Phi0, state.Phi2), 0xc7a5ff, .7);
      curve((x) => NAtRadius(x * rm, state.m3), 0xf1728d, .7);
    } else if (mode === 'scalar') {
      for (let i = 1; i <= 12; i++) { const f = i / 12; const variation = state.Phi2 * (f * rm) ** 2; shell(f * 2.2, variation >= 0 ? 0xc7a5ff : 0xffb454, .08 + .3 * Math.min(1, Math.abs(variation))); }
    } else if (mode === 'metric') {
      curve((x) => NAtRadius(x * rm, state.m3), 0xf1728d, 1.2); [0.33, .66, 1].forEach(f => shell(f * 2.2, 0xf1728d, .12));
    } else { [0.3, .55, .8, 1].forEach((f, i) => shell(f * 2.2, [0x2ca8c2,0x8edb75,0xc7a5ff,0xffb454][i], .2)); }
  }
  function resize() { const box = canvas.getBoundingClientRect(); renderer.setSize(box.width, box.height, false); camera.aspect = box.width / Math.max(1, box.height); camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
  return { update };
}

# QFP Interactive Geometry Laboratory v0.1

Static browser visualization of the independently derived local regular-center sector. It is a mathematical companion, not experimental validation and not a literal spacetime embedding.

## Run and test

From the repository root, serve files over HTTP, for example with `python -m http.server 8000`, then open `http://localhost:8000/WEB/qfp-lab/`. Run the pure-mathematics tests with `node --test WEB/qfp-lab/tests/math.test.mjs`.

The browser dependency is pinned to **Three.js 0.160.0**, loaded as ES modules from jsDelivr; OrbitControls comes from the matching `examples/jsm` distribution. No dependency tree is vendored. If the CDN or WebGL is unavailable, the textual equations, controls, outputs, provenance, and scientific-status content remain usable; only the 3D mapping is unavailable.

## Architecture and mappings

- `qfp-math.js`: pure canonical calculations.
- `qfp-model.js`: defaults, finite ranges, and clamping.
- `qfp-controls.js`: accessible parameter controls.
- `qfp-scene.js`: optional Three.js scene consuming math functions.
- `main.js`: live outputs, substitutions, warnings, and de Sitter check.

Regular-center curves map the truncated functions to line height; scalar mode maps `Phi(r) - Phi0 = Phi2 r^2` to shell color/opacity; metric mode maps `N(r)` to a curve and reference shells; curvature mode supplies visual reference shells while the exact center quantities remain textual. These encodings are visualization choices, not physical extra dimensions, measurements, or Euclidean embeddings.

Allowed ranges are finite and intended only for visualization. A warning appears when `m3 > 0` and `N(rMax) = 1 - 2 m3 rMax^2 <= 0`, signaling that the displayed local interval contains a zero of the truncated lapse function. The de Sitter comparison uses relative tolerance `1e-10` and calculates both sides independently.

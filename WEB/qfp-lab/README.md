# I-AM-IS-I-AM Research Atlas v0.2

The static atlas integrates the QFP local-center calculation with projection/slice, integer access and logarithmic-scale experiments, plus bilingual concepts, history, claims, dependencies and sources. The retained v0.1 geometry laboratory is at `geometry.html`. Its canonical mathematics is unchanged.

## Run and test

From the repository root run `npm ci`, `npm test`, `npm run build` and `npm run serve`, then open `http://127.0.0.1:4173/I-AM-IS-I-AM/`. `npm run test:browser` verifies the actual `dist` bundle at the same project base on port 4174. Windows tests use installed Chrome; on other systems run `npx playwright install chromium` first. No Node or Python runtime is needed by the hosted public page.

The optional browser renderer remains pinned to **Three.js 0.160.0** with matching OrbitControls, now served from `vendor/three/` rather than a CDN. Only the two required modules and distribution notice are copied. Essential graphs use SVG and mathematical outputs remain available without WebGL. Rendering is event-driven, without a continuous animation loop. No credentials, microphone, cloud AI or external runtime are required.

## Architecture and mappings

- `atlas-math.js`: explicit teaching constructions, separate from QFP mathematics.
- `atlas-state.js`: version 1 bounded state and dependency traversal; no private transcript state.
- `atlas.js`, `atlas-i18n.js`: accessible UI orchestration and Romanian visitor translations.
- `data/research.json`: compatible public adapter for 13 canonical objects plus attributed historical/review/explanatory records. Original source quotations remain unchanged.

- `qfp-math.js`: pure canonical calculations.
- `qfp-model.js`: defaults, finite ranges, and clamping.
- `qfp-controls.js`: accessible parameter controls.
- `qfp-scene.js`: optional Three.js scene consuming math functions.
- `main.js`: live outputs, substitutions, warnings, and de Sitter check.

Regular-center curves map the truncated functions to line height; scalar mode maps `Phi(r) - Phi0 = Phi2 r^2` to shell color/opacity; metric mode maps `N(r)` to a curve and reference shells; curvature mode supplies visual reference shells while the exact center quantities remain textual. These encodings are visualization choices, not physical extra dimensions, measurements, or Euclidean embeddings.

Allowed ranges are finite and intended only for visualization. A warning appears when `m3 > 0` and `N(rMax) = 1 - 2 m3 rMax^2 <= 0`, signaling that the displayed local interval contains a zero of the truncated lapse function. The reference comparison calculates both sides independently using the existing **mixed absolute/relative** condition `|a-b| <= 1e-10 * max(1, |a|, |b|)`; the old description as purely relative was imprecise. Positive Λ is de Sitter, zero is Minkowski and negative Λ is AdS-type. These curvature checks do not solve the scalar or metric system.

The atlas gives coefficients in an arbitrary reference mass μ; see the [mathematical review](../../12_VALIDATION/Atlas_Mathematical_Review.md). No finite validity radius or truncation-error estimate is established. Curvature-mode horizontal lines are references to center values, not a radial curvature solution.

## Delivery and privacy

`SOFTWARE/build-atlas.mjs` uses a public asset allowlist. The sole Pages workflow tests PRs without deployment; main pushes and manual dispatches validate and deploy `dist`. The existing site-root route is preserved, along with `geometry.html` and a compatibility link at `WEB/qfp-lab/`.

Source links use actual repository paths; the historical `../../` links could not resolve in an artifact containing only the lab. Raw exports and private full draft extracts are kept outside the repository. The private importer and coverage limits are documented in [archive_tools](../../archive_tools/README.md) and [Corpus_Coverage.md](../../10_REFERENCES/Corpus_Coverage.md).

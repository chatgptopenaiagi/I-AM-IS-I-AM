# 2026-08-09 — QFP Interactive Geometry Laboratory v0.1

- **Date:** 2026-08-09
- **Purpose:** Create a static interactive mathematical companion for the independently derived and audited local regular-center sector.
- **Scientific sources:** `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`, `12_VALIDATION/regularity/Scalar_Regular_Center_Test.md`, and `02_MATHEMATICS/Conventions_and_Notation.md`.
- **Object type: WORKING MODEL.** The laboratory consumes the protected scalar-tensor-Gauss-Bonnet working action; it does not modify it.
- **Object type: ANSATZ.** The displayed radial functions use `m=m3 r^3`, `delta=delta0+delta2 r^2`, `Phi=Phi0+Phi2 r^2`, and `N=1-2m3 r^2` at the stated truncation order.
- **Status: DERIVED.** The consumed center results are `Box Phi(0)=6 Phi2`, `R(0)=24m3-12delta2`, `G(0)=96m3(m3-delta2)`, and the canonical central scalar relation with independent inputs `Fp0`, `Hp0`, and `Vp0`.
- **Architecture:** Static semantic HTML and responsive CSS; pure ES-module mathematics; separate state validation, controls, orchestration, and optional Three.js rendering; Node built-in assertion tests; no backend or stored user data.
- **Visualization mappings:** Regular-center curves map equation values to line height; scalar variation maps to shell color and opacity; the metric function maps to a line and reference shells; curvature mode uses reference shells while exact invariants remain numerical text. Shell radius, height, color, and opacity are visualization mappings, not literal physical dimensions or a spacetime embedding.
- **Mathematical/visual distinction:** The application states explicitly, “Visualization mapping, not a literal spacetime embedding.” It makes no claim that the rendered surface is a Euclidean embedding of the four-dimensional metric.
- **Dependency:** Three.js 0.160.0 and the matching OrbitControls ES module, pinned through jsDelivr. No dependency directory is generated or committed.
- **Tests:** `WEB/qfp-lab/tests/math.test.mjs` exercises the center formulas, scalar residual, de Sitter identities, finite default state, allowed-range boundaries, and rejection of non-finite mathematical input. Browser/static and repository audits are recorded in the implementation handoff.
- **De Sitter check:** The preset sets `delta2=0` and `m3=Lambda/6`; calculated invariants are compared with `4 Lambda` and `8 Lambda^2/3` using relative tolerance `1e-10`. PASS is computed, not hard-coded. This is a consistency check, not empirical confirmation.
- **Known limitations:** Local truncated series only; no higher-order terms, field-equation integration, global solution, stability analysis, observational data, experimental evidence, or demonstrated projection mechanism. Three.js loading requires network access unless separately vendored in a future reviewed change.
- **Pages deployment:** `.github/workflows/qfp-pages.yml` uploads only `WEB/qfp-lab` and deploys through the `github-pages` environment using minimum required permissions. Repository settings are not changed by this work.
- **Scientific consequence:** No new physical result was derived. No foundational equation, coefficient, sign, convention, assumption, or epistemic status was changed.
- **Unresolved issues:** Independent browser/device accessibility review, offline dependency strategy, and any future extension beyond the audited local center sector.

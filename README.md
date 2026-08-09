# I-AM-IS-I-AM

Canonical research repository for QFP, a developing theoretical research framework. QFP is not established physics. This repository is designed to preserve definitions and intellectual history while subjecting mathematical models and physical claims to explicit attempts at falsification.

## Scientific status

Important foundational objects are labeled by type: `DEFINITION`, `ASSUMPTION`, `ANSATZ`, `SCHEMA`, `NOTATION`, or `WORKING MODEL`. Scientific claims about validity or support use one epistemic status:

`ESTABLISHED`, `DERIVED`, `HYPOTHESIS`, `CONJECTURE`, `SPECULATIVE`, `NUMERICAL RESULT`, `FALSIFIED`, or `SUPERSEDED`.

These labels describe epistemic status; they are not decorative. In particular, mathematical consistency and numerical output do not constitute empirical confirmation.

## Current research schemas

**Object type: SCHEMA.** The Continuum-Projection Ontology is currently represented by

```text
C -> Sigma
C_4D -> Sigma_3D
Observer in Sigma
```

These are research schemas. No physical projection mechanism is presently claimed to have been demonstrated.

**Object type: ASSUMPTION.** The coupling functions `F(Phi)` and `H(Phi)` are kept independent unless a derivation establishes a relation.

**Object type: WORKING MODEL.** The scalar-tensor-Gauss-Bonnet gravitational investigation currently uses the action

```text
S = integral d^4x sqrt(-g) [
    F(Phi) R
    - 1/2 grad(Phi).grad(Phi)
    - V(Phi)
    + alpha H(Phi) G
]
```

**Object type: ANSATZ.** The static spherical metric is

```text
ds^2 = -e^(2 delta(r)) N(r) dt^2 + dr^2 / N(r) + r^2 dOmega^2
```

**Object type: DEFINITION.** The mass function is defined through

```text
N(r) = 1 - 2 m(r)/r
```

**Object type: ANSATZ.** The regular-center expansion under investigation is

```text
m(r) = m3 r^3 + O(r^5)
delta(r) = delta0 + delta2 r^2 + O(r^4)
Phi(r) = Phi0 + Phi2 r^2 + O(r^4)
```

**Status: DERIVED.** Within the adopted static spherical regular-center expansion and canonical curvature convention, the Gauss-Bonnet central expression is

```text
G(0) = 96 m3 (m3 - delta2)
```

The associated working de Sitter substitution is

```text
delta2 = 0
m3 = Lambda/6
G(0) = 8 Lambda^2 / 3
```

Provenance: `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`, with the independent validation record in `12_VALIDATION/regularity/Scalar_Regular_Center_Test.md`. The substitution is algebraically consistent with the derived central expression and supplies a de Sitter check; it does not extend the result beyond the adopted local ansatz and curvature convention.

**Status: DERIVED.**

**Equation qualifier: EXACT local regular-center consequence of the derived covariant scalar equation, within the protected working model, canonical conventions, and regular-center ansatz.** The current central scalar relation is

```text
6 Phi2
- V'(Phi0)
+ (24 m3 - 12 delta2) F'(Phi0)
+ 96 alpha m3 (m3 - delta2) H'(Phi0)
= 0
```

Provenance: `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`, independently checked in `12_VALIDATION/regularity/Scalar_Regular_Center_Test.md`. This is a local result within the stated assumptions; it does not establish a global solution, global regularity, stability, observational validity, or experimental support.

## Repository map

- `00_FOUNDATION/`: definitions, scope, assumptions, and governance-adjacent scientific foundations.
- `01_THEORY/`: conceptual and physical theory development.
- `02_MATHEMATICS/`: notation, definitions, derivations, and boundary conditions.
- `03_QFP_MODELS/`: explicit QFP model families.
- `04_HYPOTHESES/`: testable hypotheses, conjectures, predictions, and failure criteria.
- `05_SIMULATIONS/`: computational studies and generated numerical results.
- `06_EXPERIMENTS/`: proposed experiments, measurements, and observational tests.
- `07_FIGURES/`: diagrams and reproducible quantitative plots.
- `08_PAPERS/`: manuscripts and supplementary material.
- `09_PORTFOLIO/`: cross-project indexes and research-program views.
- `10_REFERENCES/`: verified bibliographic material and reference notes.
- `11_RESEARCH_LOG/`: dated records of major conceptual and mathematical changes.
- `12_VALIDATION/`: attempts to find contradictions and falsify models.
- `SOFTWARE/`: reusable scientific software and its tests.
- `ARCHIVE/`: failed, superseded, and historically useful approaches.

See [AGENTS.md](AGENTS.md) for the binding repository governance and contribution rules.

## QFP Interactive Geometry Laboratory

The static laboratory in [`WEB/qfp-lab/`](WEB/qfp-lab/) interactively visualizes the independently derived local regular-center model. It is a visualization and mathematical consistency companion, not experimental validation of QFP and not a literal spacetime embedding.

## Validation principle

Validation does not aim to prove QFP correct. It asks whether a claim survives mathematical, dimensional, limiting-case, regularity, asymptotic, numerical, observational, and falsifiability tests.

## Current stage

The repository is in its foundation and formalization stage. The next scientific milestone is a complete, independently checkable derivation of the field equations and central expansion, including conventions, assumptions, dimensions, boundary conditions, and known-physics limits.

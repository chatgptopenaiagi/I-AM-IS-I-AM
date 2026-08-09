# QFP Repository Governance

This file governs all work in this repository. QFP is a developing theoretical research framework, not established physics.

## Scientific object type and claim status

Keep two classification axes distinct.

An **object type** answers: "What kind of scientific object is this?" Use one of the following labels for a scientifically important object that is introduced or used without, by that fact alone, asserting its truth or empirical validity:

- **DEFINITION**: a stipulated meaning or relation used within the framework.
- **ASSUMPTION**: a premise imposed for a model, derivation, or investigation.
- **ANSATZ**: a chosen mathematical form used to restrict or explore a problem.
- **SCHEMA**: a conceptual or structural representation not yet specified as a complete mathematical mechanism.
- **NOTATION**: a symbol or naming convention.
- **WORKING MODEL**: a provisional model selected as the current basis for investigation.

An **epistemic status** answers: "What is being claimed about this statement's validity, derivation, support, or failure?" Classify every important scientific claim as exactly one of:

- **ESTABLISHED**: accepted mathematics or experimentally supported physics. Cite a verifiable source whenever the statement depends on external mathematics, physics, observations, experiments, or historical attribution rather than a definition or derivation reproduced in the repository.
- **DERIVED**: obtained from stated definitions and assumptions through an inspectable derivation.
- **HYPOTHESIS**: proposed physical mechanism or claim awaiting empirical testing.
- **CONJECTURE**: proposition whose proof or derivation is incomplete.
- **SPECULATIVE**: exploratory idea lacking sufficient mathematical or empirical support.
- **NUMERICAL RESULT**: computational output from a specified model and reproducible configuration.
- **FALSIFIED**: contradicted by valid mathematics, computation, or reliable evidence.
- **SUPERSEDED**: retained historical formulation replaced by a documented later one.

Never invent experimental support, observations, citations, proofs, or historical priority. Never present a numerical result as an observation or empirical confirmation.

An **important scientific object** is a definition, notation, assumption, ansatz, schema, or working model that materially structures QFP mathematics or interpretation. Label it with an object type. Introducing such an object does not by itself require an epistemic status.

An **important scientific claim** asserts something about derivation, physical truth, uniqueness, mathematical necessity, empirical validity, predictive success, observational support, or failure. Label it with exactly one epistemic status. For example, using a metric as an ansatz is not a truth claim; asserting that it is the unique regular geometry allowed by QFP is a claim and requires an epistemic status.

Directory descriptions, workflow instructions, and clearly identified questions require neither label. A paragraph or displayed equation may carry one object-type label and, when it also makes a claim, one epistemic-status label. Do not use an epistemic status merely because a definition, model choice, or schema exists.

### Classification examples

- **Object type: DEFINITION.** `N(r) = 1 - 2 m(r)/r` stipulates the mass-function convention used here.
- **Object type: ANSATZ.** A static spherical metric is selected for investigation; selection alone does not claim uniqueness or physical validity.
- **Object type: SCHEMA.** `C -> Sigma` represents a research structure whose mathematical mechanism remains unspecified.
- **Status: CONJECTURE.** A proposed equation awaiting a complete derivation makes a claim not yet established.
- **Status: DERIVED.** A result obtained from stated definitions and assumptions through an inspectable derivation makes a derivational claim.

Object type and epistemic status are different axes: the first identifies what an item is within the research record, while the second evaluates what is claimed about its validity or support.

## Scientific record

Do not change a foundational QFP definition merely because another formulation is more conventional. If a formulation appears wrong or inconsistent:

1. preserve the original;
2. identify the problem explicitly;
3. propose any correction separately;
4. explain the mathematical reason;
5. record a major change in `11_RESEARCH_LOG/`;
6. archive failed or superseded work when historically useful.

A **major change** alters a protected or foundational definition, equation, assumption, claim status, physical interpretation, validation conclusion, or the documented direction of the research program. Pure spelling, formatting, link, and directory-maintenance changes are not major unless they change scientific meaning.

Work is **historically useful** when it records a previously active formulation, a failed test or approach, the provenance of a current formulation, or reasoning needed to understand why the project changed direction. Such material should be archived when removing it from active documents; incidental duplication and non-scientific formatting need not be archived.

Do not silently rewrite intellectual history. Keep the following categories distinct: concept, mathematical definition, assumption, derivation, numerical calculation, physical prediction, observation, and experimental evidence.

## Mathematical physics standard

For mathematical physics work:

- preserve notation consistently and define every symbol;
- state conventions and assumptions;
- distinguish exact equations from schematic equations;
- perform dimensional checks where applicable;
- identify boundary and initial conditions;
- test limiting and special cases;
- search actively for contradictions and singular behavior;
- distinguish local from global results;
- distinguish mathematical consistency from empirical confirmation.

Derivations should be reproducible line by line or by supplied symbolic code. Any use of computer algebra must record the software, version, assumptions, conventions, and simplifications.

## Protected working formulations

**Object type: ASSUMPTION.** For scalar-tensor-Gauss-Bonnet gravitational work, keep `F(Phi)` and `H(Phi)` as independent coupling functions unless a derivation explicitly establishes a relation.

**Object type: WORKING MODEL.** The current working action is

```text
S = integral d^4x sqrt(-g) [
    F(Phi) R
    - 1/2 grad(Phi).grad(Phi)
    - V(Phi)
    + alpha H(Phi) G
]
```

**Object type: ANSATZ.** The current static spherical metric is

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

Provenance: `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`, with the independent validation record in `12_VALIDATION/regularity/Scalar_Regular_Center_Test.md`. The displayed substitution is algebraically consistent with the derived central expression and supplies a de Sitter check; it does not extend the result beyond the adopted local ansatz and curvature convention.

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

## Continuum-Projection Ontology

**Object type: SCHEMA.** Treat `C -> Sigma`, the conceptual form `C_4D -> Sigma_3D`, and `Observer in Sigma` as research schemas. Do not claim a physical projection mechanism has been demonstrated. Before deriving consequences, specify what `C`, `Sigma`, the arrow, dimensional labels, and observer embedding mean mathematically.

## Validation

Validation aims to determine whether QFP survives attempts at falsification, not to prove it correct. Maintain explicit tests, where applicable, for:

- mathematical and dimensional consistency;
- Einstein, Schwarzschild, and de Sitter limits;
- regular-center and asymptotic behavior;
- numerical convergence and stability;
- observational compatibility;
- clear falsifiability conditions.

Record failures as results. Do not tune away or omit adverse cases without documentation.

## Research log and archive

Major conceptual or mathematical changes require a dated entry under `11_RESEARCH_LOG/YYYY/` recording:

- date;
- question;
- previous formulation;
- proposed formulation;
- reason for change;
- consequences;
- unresolved issues.

Move historically useful failed approaches to `ARCHIVE/failed_approaches/` and replaced formulations to `ARCHIVE/superseded/`. Include a note explaining status, failure mode or replacement, and provenance.

## Reproducible software

Scientific programs must record each item that can affect reproducibility: Python and package versions, parameters, initial and boundary conditions, solver and method, tolerances, random seeds, input data provenance, and output files. An item may be omitted only when the program does not use it or it cannot affect the reported result; note non-obvious omissions. Generated results belong in an identified run directory or reproducible artifact path; do not commit credentials or private data.

## References and evidence

Use primary sources where possible. Verify citations before adding them. Clearly separate a source's result from a QFP interpretation. Record enough bibliographic information to locate the source and do not cite a source that has not been inspected.

## Git safety

- Do not push unless explicitly instructed.
- Do not modify remotes, delete branches, or rewrite history.
- Do not commit unless explicitly instructed.
- Never commit credentials, tokens, API keys, passwords, secrets, or sensitive data.
- Preserve user changes and inspect the worktree before editing.

## Document expectations

Use concise placeholder documents until substantive work exists. Mature scientific documents should normally state: status, question, definitions, assumptions, conventions, derivation or method, boundary/initial conditions, dimensions, limiting cases, results, failure criteria, open issues, and references as applicable.

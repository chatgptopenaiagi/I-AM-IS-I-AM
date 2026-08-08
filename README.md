# I-AM-IS-I-AM
QFP theory repository: foundational principles, mathematical formulations, derivations, models, simulations, figures, research notes, and manuscript development.
# I-AM-IS-I-AM

## QFP Research Repository

**QFP** is a developing theoretical research framework concerned with projection, spacetime structure, observers, gravitation, scalar fields, compact objects, and the relationship between an underlying continuum and the physically observed world.

This repository is the primary structured archive for the development of QFP.

It contains:

* foundational definitions and principles;
* mathematical formulations;
* derivations and consistency checks;
* projection models;
* spacetime and gravitational models;
* scalar-field models;
* black-hole and regular-core investigations;
* hypotheses and predictions;
* falsifiability criteria;
* numerical simulations;
* visualizations;
* proposed experiments;
* research papers;
* development history;
* validation attempts;
* failed or superseded models.

> **Scientific status:** QFP is a research framework under development.
> Parts of the repository use established mathematics and established physical theories as starting points, while QFP-specific interpretations, mechanisms, extensions, and predictions must be treated as hypotheses unless independently demonstrated.

---

# 1. Purpose

The purpose of **I-AM-IS-I-AM** is to maintain a transparent and reproducible record of the evolution of QFP.

The repository is designed around five questions:

1. **What exactly does QFP claim?**
2. **Can those claims be expressed mathematically?**
3. **Are the equations internally consistent?**
4. **Do they reproduce known physics in appropriate limits?**
5. **Can any QFP-specific prediction be experimentally distinguished from existing theories?**

The repository therefore contains not only proposed models, but also attempts to falsify them.

A result that fails a consistency test should remain documented rather than silently disappearing.

---

# 2. Central Research Direction

One of the central ideas investigated in QFP is a **Continuum-Projection Ontology**.

In its current conceptual form, the framework considers the possibility that the physically experienced world may be described as a projection or effective representation of a more fundamental continuum.

A schematic representation is:

```text
Underlying continuum
        │
        │ projection / reduction
        ▼
Observable spacetime structure
        │
        ▼
Matter, fields and observers
        │
        ▼
Measured physical phenomena
```

The observer is not assumed to stand outside this process.

Instead, the observer is itself part of the resulting physical description.

This immediately raises several research questions:

* What mathematical object represents the underlying continuum?
* What constitutes a projection?
* Which quantities survive projection?
* Which quantities are emergent?
* What determines dimensionality?
* How does causal structure arise?
* How do fields behave under projection?
* Can gravitational dynamics emerge or be modified?
* What is the role of the observer?
* Can the framework produce measurable predictions?

These questions are treated as research problems rather than established conclusions.

---

# 3. Scientific Methodology

QFP development follows a layered methodology.

## Layer 1 — Concept

A physical or ontological idea is stated clearly.

Example:

```text
A higher-dimensional or more fundamental continuum may admit
an effective lower-dimensional physical representation.
```

At this stage the statement is conceptual.

---

## Layer 2 — Mathematical schema

The concept must be translated into mathematical objects.

Examples may include:

* manifolds;
* fields;
* mappings;
* projection operators;
* metrics;
* tensors;
* differential equations;
* boundary conditions;
* conserved quantities.

A conceptual statement that cannot yet be mathematically expressed remains explicitly marked as conceptual.

---

## Layer 3 — Internal consistency

Candidate equations are tested for:

* dimensional consistency;
* mathematical closure;
* regularity;
* covariance where required;
* boundary consistency;
* conservation laws;
* singular behavior;
* hidden assumptions.

---

## Layer 4 — Known-physics limits

Any proposed extension must be compared against established results.

Examples include:

* General Relativity;
* Schwarzschild spacetime;
* de Sitter spacetime;
* scalar-field theory;
* weak-field behavior;
* asymptotic limits.

Failure to recover an expected physical limit must be documented.

---

## Layer 5 — Prediction

A useful physical theory must eventually produce consequences that are not merely reinterpretations of known results.

A candidate QFP prediction should ideally specify:

```text
observable
+
predicted value or behavior
+
experimental conditions
+
difference from standard theory
+
uncertainty
```

---

## Layer 6 — Falsification

Every sufficiently developed hypothesis should answer:

> **What observation would show that this hypothesis is wrong?**

A model without a conceivable failure condition remains speculative.

---

# 4. QFP Research Classification

Every significant claim should eventually receive one of the following labels.

### ESTABLISHED

Result already supported by accepted mathematics or experimentally supported physics.

### DERIVED

Result mathematically derived from explicitly stated assumptions.

### HYPOTHESIS

Proposed physical mechanism or interpretation that has not been experimentally demonstrated.

### CONJECTURE

Mathematical or physical proposition for which a derivation or proof is incomplete.

### SPECULATIVE

Exploratory idea currently lacking sufficient mathematical or experimental support.

### NUMERICAL RESULT

Result obtained computationally from a stated model.

### FALSIFIED

Hypothesis or model contradicted by its own mathematics, numerical results, or reliable observations.

### SUPERSEDED

Earlier formulation replaced by a more complete model.

This classification is intended to prevent hypotheses from gradually acquiring the appearance of established facts simply through repetition.

---

# 5. Current Major Research Areas

## 5.1 Continuum-Projection Ontology

The Continuum-Projection Ontology investigates the conceptual relationship

```text
C → Σ
```

where:

* `C` represents a more fundamental continuum;
* `Σ` represents an observable effective structure;
* the arrow represents a projection, reduction, mapping, or emergence mechanism whose exact mathematical definition remains a subject of research.

One conceptual form previously considered is:

```text
C₄D → Σ₃D
```

This notation should currently be understood as a research schema rather than an established physical transformation.

The repository will investigate whether such a projection can be defined rigorously and whether it can generate testable consequences.

---

# 6. Observer Inside the Projection

A central conceptual restriction of the framework is that the observer is not placed outside the physical system.

The observer belongs to the observable structure.

Therefore:

```text
Observer ∈ Σ
```

rather than:

```text
Observer ∉ Σ
```

This distinction matters because an observer embedded in the projected system only has access to measurements available within that system.

Possible consequences for measurement, geometry, dimensional interpretation, and information remain open research questions.

---

# 7. Gravitation and Compact Objects

QFP research also explores gravitational models compatible with known relativistic constraints.

One active mathematical direction uses a scalar-tensor theory containing an independent Ricci coupling and Gauss-Bonnet coupling.

A working action has the structure:

```text
S = ∫ d⁴x √(-g)
    [
        F(Φ) R
        - ½ ∇Φ·∇Φ
        - V(Φ)
        + α H(Φ) G
    ]
```

where:

* `g` is the determinant of the spacetime metric;
* `R` is the Ricci scalar;
* `Φ` is a scalar field;
* `V(Φ)` is a scalar potential;
* `F(Φ)` couples the scalar to curvature;
* `H(Φ)` couples the scalar to the Gauss-Bonnet invariant;
* `α` controls the strength of the Gauss-Bonnet contribution;
* `G` denotes the Gauss-Bonnet invariant.

The distinction

```text
F(Φ) ≠ H(Φ)
```

is maintained explicitly.

The two coupling functions should not be conflated without a mathematical reason.

---

# 8. Static Spherical Geometry

One metric ansatz currently used for compact-object investigations is:

```text
ds² =
-e^(2δ(r)) N(r) dt²
+ dr²/N(r)
+ r² dΩ²
```

with

```text
N(r) = 1 - 2m(r)/r
```

where:

* `m(r)` is the radial mass function;
* `δ(r)` controls the temporal redshift structure;
* `dΩ²` is the metric of the unit two-sphere.

This form provides a basis for studying:

* black holes;
* regular compact objects;
* de Sitter-like cores;
* scalarized configurations;
* horizon structure;
* asymptotic behavior.

---

# 9. Regular-Center Expansion

For models intended to avoid a singular center, a local expansion around `r = 0` can be considered.

A working regular expansion is:

```text
m(r) = m₃ r³ + O(r⁵)

δ(r) = δ₀ + δ₂ r² + O(r⁴)

Φ(r) = Φ₀ + Φ₂ r² + O(r⁴)
```

Regularity requires the absence of terms that would generate divergent curvature invariants at the center.

One derived invariant currently used as a consistency check is:

```text
G(0) = 96 m₃ (m₃ - δ₂)
```

For the de Sitter-core limit

```text
δ₂ = 0
m₃ = Λ/6
```

this produces

```text
G(0) = 8Λ²/3
```

which matches the expected de Sitter Gauss-Bonnet invariant.

This provides an important limiting-case check.

---

# 10. Central Scalar Constraint

A current schematic central scalar relation is:

```text
6Φ₂
- V′(Φ₀)
+ (24m₃ - 12δ₂) F′(Φ₀)
+ 96α m₃(m₃ - δ₂) H′(Φ₀)
= 0
```

This relation represents part of the local closure problem near the regular center.

The full system still requires consistent derivation of the independent gravitational field equations before a complete global solution can be claimed.

---

# 11. Required Consistency Tests

Every gravitational QFP model should eventually pass a common test suite.

## Constant scalar limit

If:

```text
Φ = constant
```

the resulting theory must behave consistently with the remaining gravitational sector.

---

## Constant Gauss-Bonnet coupling

If:

```text
H(Φ) = constant
```

the four-dimensional Gauss-Bonnet contribution should reduce appropriately because a constant coupling gives only the topological Gauss-Bonnet term.

---

## Einstein limit

Under appropriate constant-field and coupling limits, the equations should recover General Relativity.

---

## Schwarzschild check

Vacuum solutions should be tested against Schwarzschild behavior where the assumptions demand it.

---

## de Sitter check

Regular-core solutions should be tested against known de Sitter curvature invariants.

---

## Dimensional analysis

Every equation must be dimensionally consistent.

---

## Center regularity

Curvature invariants should remain finite wherever a regular center is claimed.

---

## Asymptotic behavior

The intended large-radius geometry must be specified and tested.

Examples:

```text
asymptotically flat
asymptotically de Sitter
asymptotically anti-de Sitter
```

---

# 12. Time Research

QFP also contains exploratory work concerning the physical interpretation of time.

Current investigations distinguish carefully between:

* established relativistic time dilation;
* coordinate-time effects;
* proper time;
* causal structure;
* speculative mechanisms involving deeper geometric or projection dynamics.

Conceptual models involving forward or backward transformations must not be interpreted as demonstrated time-travel mechanisms unless supported by a complete physical model.

Speculative concepts are preserved for investigation but remain explicitly separated from validated physics.

---

# 13. Repository Structure

```text
I-AM-IS-I-AM/
│
├── README.md
├── LICENSE
├── CITATION.cff
├── CHANGELOG.md
├── CONTRIBUTING.md
│
├── 00_FOUNDATION/
│   ├── QFP_Overview.md
│   ├── Core_Principles.md
│   ├── Definitions.md
│   ├── Terminology.md
│   ├── Assumptions.md
│   └── Scope_and_Limits.md
│
├── 01_THEORY/
│   ├── Continuum_Projection_Ontology.md
│   ├── Projection_Framework.md
│   ├── Observer_Model.md
│   ├── Space_Model.md
│   ├── Time_Model.md
│   ├── Matter_Model.md
│   └── Gravity_Model.md
│
├── 02_MATHEMATICS/
│   ├── Notation.md
│   ├── Definitions/
│   ├── Equations/
│   ├── Derivations/
│   ├── Operators/
│   ├── Boundary_Conditions/
│   └── Consistency_Checks/
│
├── 03_QFP_MODELS/
│   ├── Projection_Models/
│   ├── Black_Hole_Model/
│   ├── De_Sitter_Core/
│   ├── Scalar_Field_Model/
│   ├── Time_Models/
│   └── Cosmological_Models/
│
├── 04_HYPOTHESES/
│   ├── Active_Hypotheses.md
│   ├── Predictions.md
│   ├── Falsifiability.md
│   └── Open_Questions.md
│
├── 05_SIMULATIONS/
│   ├── python/
│   ├── notebooks/
│   ├── numerical/
│   ├── visualization/
│   └── results/
│
├── 06_EXPERIMENTS/
│   ├── Proposed_Experiments.md
│   ├── Measurement_Strategies.md
│   ├── Observable_Signatures.md
│   └── Constraints.md
│
├── 07_FIGURES/
│   ├── diagrams/
│   ├── plots/
│   ├── geometry/
│   └── conceptual/
│
├── 08_PAPERS/
│   ├── QFP_Main_Paper/
│   ├── Black_Hole_Paper/
│   ├── Projection_Ontology_Paper/
│   └── supplementary_material/
│
├── 09_PORTFOLIO/
│   ├── Framework_Index.md
│   ├── Theory_Relationships.md
│   └── Evidence_Control_Projection/
│
├── 10_REFERENCES/
│   ├── bibliography.bib
│   ├── Papers.md
│   ├── Books.md
│   └── External_References.md
│
├── 11_RESEARCH_LOG/
│   ├── 2026/
│   ├── decisions/
│   └── discarded_ideas/
│
├── 12_VALIDATION/
│   ├── dimensional_analysis/
│   ├── limiting_cases/
│   ├── known_physics_tests/
│   ├── numerical_tests/
│   └── peer_critique/
│
├── SOFTWARE/
│   ├── qfp-core/
│   ├── qfp-simulator/
│   └── qfp-visualizer/
│
└── ARCHIVE/
    ├── early_drafts/
    ├── obsolete_models/
    └── historical_versions/
```

---

# 14. Evidence Architecture

QFP should distinguish three fundamentally different objects.

```text
IDEA
  ↓
MATHEMATICAL MODEL
  ↓
EMPIRICAL EVIDENCE
```

These are not interchangeable.

A mathematically elegant construction is not automatically physically real.

A physical interpretation is not automatically a mathematical derivation.

A numerical solution is not automatically experimental evidence.

For that reason, each mature QFP document should ideally contain sections titled:

```text
Assumptions
Derivation
Known Results
QFP-Specific Claims
Tests
Failure Conditions
Open Problems
```

---

# 15. Validation Philosophy

The `12_VALIDATION` directory is intended to become one of the most important parts of this repository.

Its purpose is not to defend QFP.

Its purpose is to attack it.

Tests should attempt to identify:

* contradictions;
* hidden assumptions;
* invalid approximations;
* dimensional errors;
* singularities;
* unstable solutions;
* incorrect limits;
* observational disagreement;
* redundant parameters;
* unfalsifiable claims.

A failed model is scientifically useful when the reason for failure is understood and preserved.

---

# 16. Reproducibility

Where numerical calculations are involved, every published result should ideally contain:

* source code;
* software version;
* dependency versions;
* initial conditions;
* boundary conditions;
* parameter values;
* solver configuration;
* numerical tolerances;
* generated data;
* plotting code.

A numerical figure without the information required to reproduce it should be considered incomplete.

---

# 17. Research Log

Major conceptual and mathematical decisions should be recorded chronologically.

Example:

```text
11_RESEARCH_LOG/
└── 2026/
    ├── 2026-08-08_repository_created.md
    ├── 2026-08-09_projection_definition.md
    └── ...
```

A research-log entry should record:

```text
Date
Question
Previous formulation
New formulation
Reason for change
Consequences
Remaining problems
```

Git itself preserves version history, while the research log preserves the reasoning behind important changes.

---

# 18. Open Problems

Current high-priority research questions include:

### Mathematical definition of projection

What exactly is the operator or mapping represented by:

```text
C → Σ
```

?

---

### Dimensional emergence

Can effective dimensionality emerge mathematically rather than being assumed?

---

### Observer structure

What mathematical role does an observer embedded in `Σ` play?

---

### Dynamical equations

What governs the evolution of the underlying continuum and projected structure?

---

### Matter

How should matter and quantum fields be represented within the framework?

---

### Gravitation

Can gravitational dynamics emerge from projection, or must gravity remain an independent geometric field?

---

### Regular compact objects

Can the scalar-tensor-Gauss-Bonnet model generate globally regular configurations satisfying appropriate physical constraints?

---

### Field-equation closure

The complete `tt`, `rr`, and scalar equations must be derived consistently.

---

### Numerical shooting problem

Once the local equations are closed, regular central data must be connected to acceptable asymptotic solutions.

---

### Observable predictions

What measurable prediction distinguishes QFP from existing theories?

This is ultimately one of the most important questions in the project.

---

# 19. Development Roadmap

## Phase 0 — Foundation

* [x] Create central repository
* [x] Establish directory architecture
* [x] Define research methodology
* [ ] Freeze core terminology
* [ ] Define QFP formally
* [ ] Create notation standard
* [ ] Establish claim-classification system

## Phase 1 — Projection Mathematics

* [ ] Define continuum `C`
* [ ] Define observable structure `Σ`
* [ ] Define projection operator
* [ ] Determine mathematical invariants
* [ ] Investigate dimensional reduction
* [ ] Define observer embedding

## Phase 2 — Gravitational Sector

* [ ] Derive complete field equations
* [ ] Verify Einstein limit
* [ ] Verify constant-coupling limits
* [ ] Verify Schwarzschild limit
* [ ] Verify de Sitter limit
* [ ] Establish regular-center closure

## Phase 3 — Numerical Models

* [ ] Implement symbolic calculations
* [ ] Implement ODE system
* [ ] Implement shooting solver
* [ ] Search parameter space
* [ ] Test stability
* [ ] Generate reproducible figures

## Phase 4 — Predictions

* [ ] Identify QFP-specific observables
* [ ] Compare against General Relativity
* [ ] Compare against alternative gravity models
* [ ] Determine experimental constraints
* [ ] Establish falsification criteria

## Phase 5 — Publication

* [ ] Main QFP formal paper
* [ ] Projection ontology paper
* [ ] Compact-object paper
* [ ] Numerical-method supplement
* [ ] Public reproducibility package

---

# 20. Versioning Philosophy

Major conceptual changes should not erase earlier versions.

Instead:

```text
current model
      │
      ├── active
      │
      └── superseded
             │
             ▼
          ARCHIVE/
```

This allows the intellectual development of the theory to remain inspectable.

---

# 21. Contributions and Criticism

Constructive criticism is valuable, particularly criticism involving:

* mathematical errors;
* missing assumptions;
* known counterexamples;
* incompatible observations;
* incorrect physical interpretation;
* alternative derivations;
* numerical instability;
* equivalent existing theories.

A strong objection supported by evidence is more valuable than agreement without analysis.

---

# 22. Citation

A formal `CITATION.cff` file will be added when the first stable public research version is released.

Until then, repository commits and tagged releases provide the chronological development record.

---

# 23. License

No license has yet been selected.

Until a license is explicitly added, the presence of material in this repository should not be interpreted as granting general permission to copy, redistribute, modify, or commercially reuse the work.

Software and theoretical manuscripts may eventually use different licensing arrangements.

---

# 24. Repository Principle

The governing principle of this repository is:

> **Clearly separate what is imagined, what is defined, what is derived, what is calculated, what is observed, and what is demonstrated.**

QFP succeeds scientifically only where those distinctions remain visible.

---

# 25. I-AM-IS-I-AM

The repository name **I-AM-IS-I-AM** serves as the umbrella identity for the QFP research program.

The scientific content of the repository does not depend upon philosophical interpretation of the title.

Within the research itself, propositions must stand or fall according to their definitions, mathematics, internal consistency, predictive power, and relationship to observation.

---

## Repository Status

```text
Project:        QFP
Repository:     I-AM-IS-I-AM
Status:         Active Research
Stage:          Foundational / Formalization
Primary focus:  Projection framework + gravitational mathematics
Created:        August 2026
```

**Current objective:**

```text
Concept
   ↓
Formal definition
   ↓
Mathematical derivation
   ↓
Consistency
   ↓
Numerical solution
   ↓
Prediction
   ↓
Experiment
```

That chain is the path from an idea to a physical theory.

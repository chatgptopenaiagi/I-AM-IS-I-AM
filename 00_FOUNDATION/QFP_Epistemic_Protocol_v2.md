# QFP Epistemic Protocol v2

This protocol extends the repository governance for a developing theoretical framework. It organizes claims and their auditability; it does not establish QFP as physics. Root `AGENTS.md` remains authoritative.

## 1. Five-axis record

For each new major scientific object, and each active canonical object deliberately migrated, record the applicable axes:

1. **Scientific Object Type:** exactly one of `DEFINITION`, `ASSUMPTION`, `ANSATZ`, `SCHEMA`, `NOTATION`, or `WORKING MODEL`. This answers what the object is.
2. **Epistemic Status:** exactly one of `ESTABLISHED`, `DERIVED`, `HYPOTHESIS`, `CONJECTURE`, `SPECULATIVE`, `NUMERICAL RESULT`, `FALSIFIED`, or `SUPERSEDED` when the record makes an important scientific claim. This answers what is claimed about support or validity. A stipulated object need not acquire a status merely by existing.
3. **Domain / Scope:** the region or approximation in which the statement is asserted.
4. **Explicit Dependencies:** stable IDs of scientific inputs actually required by the object.
5. **Validation / Computational Metadata:** methods and run facts that characterize checks without changing epistemic status automatically.

Object type and epistemic status remain independent. An `ANSATZ` is not thereby true or false; a `DERIVED` equation may depend on a `WORKING MODEL` without establishing that model physically.

## 2. Domain and truncation semantics

Canonical domain tags are `LOCAL`, `GLOBAL`, `ASYMPTOTIC`, `PERTURBATIVE`, `NUMERICAL-DOMAIN`, and `COORDINATE-PATCH`. Qualifiers may be added after a vertical bar, for example `LOCAL | REGULAR-CENTER` or `ASYMPTOTIC | LARGE-R`. Tags state scope; they do not supply existence, uniqueness, regularity, or empirical support.

The machine-readable `domain` array may be empty when a scientific object, such as a purely conceptual schema, has no meaningful physical or spacetime validity region. An empty array means domain is not applicable; it does not mean `GLOBAL` and must not be replaced by a presentation qualifier such as `SCHEMATIC`. Presentation qualifiers belong in a separate field.

Truncated series must state their retained expansion and remainder, for example

```text
Domain: LOCAL | REGULAR-CENTER
Expansion: m(r) = m3 r^3 + O(r^5)
```

Do not assign a numerical radius of validity or asymptotic error bound unless derived or established. `GLOBAL` may be used only when the claim and its prerequisites genuinely cover the full stated mathematical domain.

## 3. Stable IDs and dependencies

Registry IDs have the form `QFP-<CLASS><NNN>` and are unique, stable, path-independent identifiers:

- `QFP-Axxx`: assumptions and ansätze; `object_type` disambiguates them.
- `QFP-Cxxx`: convention objects represented as definitions.
- `QFP-DEFxxx`: definitions. This explicit prefix avoids confusing definitions with `QFP-Dxxx` derived claims.
- `QFP-Dxxx`: derived results.
- `QFP-Sxxx`: schemas.
- `QFP-Mxxx`: working models.
- `QFP-Nxxx`: numerical outputs.
- `QFP-NOTxxx`: notation objects.

IDs are never reused. File moves do not change an ID. `Depends-On` contains registry IDs, not file paths or descriptive substitutes when an ID exists. A dependency means the downstream object's derivation, interpretation, or stated scope materially relies on that input; mere proximity, citation, or use as an independent check is insufficient.

When a dependency changes, direct and transitive dependents become `RE-AUDIT REQUIRED`. This is a workflow flag only. It does not automatically alter an epistemic status, and it never implies `FALSIFIED` or `SUPERSEDED`. Re-audit determines whether the dependency change is irrelevant, requires re-derivation, changes scope, or supports a separately documented status change. Historical versions and prior audit conclusions remain intact.

## 4. Validation and computational metadata

Allowed method vocabulary includes `ANALYTIC DERIVATION`, `SYMBOLIC COMPUTATION`, `NUMERICAL INTEGRATION`, `LIMITING-CASE TEST`, `DIMENSIONAL CHECK`, `INDEPENDENT AUDIT`, `EXTERNAL COMPARISON`, `OBSERVATIONAL TEST`, and `EXPERIMENTAL TEST`. A method records what was done, not that the result is physically established.

For numerical results, retain `Epistemic Status: NUMERICAL RESULT` and separately record supported quality metadata:

```text
Numerical Role: EXPLORATORY | PRODUCTION
Convergence: UNTESTED | PARTIAL | CONVERGED
Error Characterization: UNKNOWN | ESTIMATED | BOUNDED
Independent Check: NONE | INTERNAL | INDEPENDENT
Reproducibility: PARTIAL | REPRODUCIBLE
Solver: actual name/version
Precision: actual precision
Tolerance: actual values
Grid: actual values
Numerical Domain: actual domain
Boundary Conditions: actual conditions
```

Omit unsupported optional fields; never fabricate solver properties, tolerances, grids, errors, bounds, convergence, or reproducibility. `VERIFIED`, `EXPLORATORY`, and `BOUNDED` are not replacements for `NUMERICAL RESULT`: they concern role or quality and are not a single truth state.

Computer algebra is not numerical integration. A SymPy curvature calculation is normally recorded as `Method: SYMBOLIC COMPUTATION` with a role such as `INDEPENDENT CROSS-CHECK`; it does not become a `NUMERICAL RESULT` merely because software executed it. Finite-grid ODE/PDE integration may be a `NUMERICAL RESULT` and must carry the actual numerical configuration.

## 5. Registry and historical provenance

`qfp_claim_registry.json` is the machine-readable index of selected canonical objects, not a catalogue of every sentence. Each entry records its ID, name, object type, optional epistemic status, domain, dependencies, provenance, and supported validation metadata. Equations are included only to identify already-canonical objects; the derivation documents remain the scientific sources.

Protocol v2 is prospective. Old records remain valid historical records and are not invalidated by missing v2 fields. Deliberate migration must preserve former formulations, statuses, provenance, and promotion history. Major changes still require a dated research-log entry and applicable archival handling under `AGENTS.md`.

## 6. Current canonical examples

`QFP-M001` is the protected scalar-tensor-Gauss-Bonnet working action. `QFP-D001` is the derived covariant scalar Euler-Lagrange equation and depends on that action and the canonical convention package. The local center results `QFP-D002` (`Box Phi(0)`), `QFP-D003` (`R(0)`), and `QFP-D004` (`G(0)`) depend on the static spherical and regular-center ansätze and relevant definitions/conventions. `QFP-D005`, the exact local central scalar relation, depends on the covariant scalar equation and all three center results.

Accordingly, a simulated change to `QFP-A003`, the regular-center ansatz, identifies the center results and central scalar relation for re-audit. It does not change their `DERIVED` status unless a separate scientific audit warrants and records such a change.

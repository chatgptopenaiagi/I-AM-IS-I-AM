# QFP Epistemic Protocol v2

- **Date:** 2026-08-09
- **Question:** How can QFP add explicit scope, dependency, and computational-quality records without collapsing its existing object-type and epistemic-status distinction or rewriting scientific history?
- **Previous formulation:** Root governance required separate scientific object types and epistemic statuses, scientific provenance, scope discipline, and reproducible software, but it did not define a canonical machine-readable claim registry, stable scientific-object IDs, dependency-impact semantics, or structured numerical-quality metadata.
- **Proposed formulation:** Adopt `00_FOUNDATION/QFP_Epistemic_Protocol_v2.md` as a prospective five-axis extension and initialize `00_FOUNDATION/qfp_claim_registry.json` with selected canonical objects.

## Motivation and methodological input

An external Manus proposal supplied methodological suggestions concerning numerical-result granularity, dependency tracking, truncation/domain qualifiers, future numerical integration, and global/asymptotic analysis. It was treated as proposal input, not canonical authority. No proposal draft existed at `08_PAPERS/drafts/Epistemic_Protocol_Optimizations.md` during this milestone, so no proposal document was altered.

Adopted recommendations are explicit domain qualification, stable path-independent IDs, machine-readable dependency edges, downstream impact analysis, structured validation metadata, and stronger separation of local, asymptotic, global, symbolic, and numerical claims. The proposal's numerical granularity was modified: `NUMERICAL RESULT` remains an epistemic status, while exploratory/production role, convergence, error characterization, independent checking, reproducibility, solver, precision, tolerance, grid, numerical domain, and boundary conditions are separate metadata. These attributes are not mutually exclusive truth states and must be populated only from actual computation records.

## Changes introduced

- The existing object-type and epistemic-status vocabularies remain unchanged and separate.
- Domain tags now prevent local or perturbative results from silently becoming global claims. Truncated expansions retain their explicit orders and remainders; no numerical radius of validity was invented.
- Stable identifiers use `QFP-Axxx`, `QFP-Cxxx`, `QFP-DEFxxx`, `QFP-Dxxx`, `QFP-Sxxx`, `QFP-Mxxx`, `QFP-Nxxx`, and `QFP-NOTxxx`. `QFP-DEFxxx` distinguishes definitions from derived results unambiguously, while `QFP-NOTxxx` identifies notation objects.
- The independent pre-commit audit separated the composite initial convention entry: `QFP-C001` retains the canonical curvature definitions, and `QFP-NOT001` identifies scalar d'Alembertian notation. The same audit moved `SCHEMATIC` from the Continuum-Projection domain to a presentation qualifier, restored all protected schema forms, and removed non-material dependencies from the static spherical metric ansatz.
- `Depends-On` edges record material scientific inputs using stable IDs. A changed input marks downstream objects `RE-AUDIT REQUIRED`; it does not automatically mark them `FALSIFIED` or `SUPERSEDED`, and it does not mutate their epistemic status.
- `SOFTWARE/qfp_dependency_audit.py` validates IDs and dependency references, rejects cycles, prints dependency chains, and distinguishes direct from transitive downstream impact.
- Symbolic computation is explicitly separated from numerical integration. The existing SymPy center calculation is an independent symbolic cross-check, not a numerical result.

## Consequences and backward compatibility

Protocol v2 applies prospectively to new major scientific objects and to active canonical objects when deliberately migrated. Existing historical records remain valid and are not required to be mass-rewritten. IDs survive file moves; historical status changes and provenance remain intact. The registry is deliberately selective and does not catalogue every statement.

This governance milestone changes no physical QFP claim, protected equation, coefficient, sign, convention, ansatz, status-promotion history, Continuum-Projection classification, or unaudited metric-equation artifact. It supplies organization and impact-analysis machinery only.

## Unresolved issues

- Extend the registry only as additional active canonical objects are deliberately audited and migrated.
- Define branch-specific global and asymptotic domains when actual boundary-value analyses exist.
- Populate numerical metadata only when future integrations have specified configurations and reproducible outputs.
- Independently audit the initial dependency graph and determine whether future registry schema versioning needs stricter field validation.

# 2026-08-09 — Independent Regular-Center Scalar Reduction

## Date

2026-08-09

## Question

Does an independent center reduction of the already-derived covariant scalar equation reproduce the stored conjectural central Gauss-Bonnet expression and scalar relation?

## Previous formulation

**Status: CONJECTURE.** The active record stored

\[
\mathcal G(0)=96m_3(m_3-\delta_2)
\]

and the schematic working relation

\[
6\Phi_2-V'(\Phi_0)
+(24m_3-12\delta_2)F'(\Phi_0)
+96\alpha m_3(m_3-\delta_2)H'(\Phi_0)=0.
\]

Their conjectural historical status is preserved here.

## Proposed formulation

**Equation qualifier: LOCAL EXPANSION. Status: DERIVED.** Independent reduction of

\[
\Box\Phi+F'(\Phi)R-V'(\Phi)+\alpha H'(\Phi)\mathcal G=0
\]

gives

\[
\Box\Phi(0)=6\Phi_2,\qquad
R(0)=24m_3-12\delta_2,\qquad
\mathcal G(0)=96m_3(m_3-\delta_2),
\]

and therefore exactly the displayed historical central scalar relation.

## Reason for change

The calculation in `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md` derives the scalar d'Alembertian from its determinant definition and derives the center curvature invariants from the metric with the adopted curvature convention. It does not use the historical conjecture until after freezing the independent result. The comparison classification is **EXACT MATCH**.

## Consequences

- The historical conjecture is independently reproduced, not falsified or superseded.
- The active canonical central scalar relation and central Gauss-Bonnet expression are suitable for a separately recorded promotion from **CONJECTURE** to **DERIVED**.
- This entry does not itself edit `02_MATHEMATICS/Conventions_and_Notation.md`; historical evidence remains intact.
- The de Sitter checks give \(R=4\Lambda\) and \(\mathcal G=8\Lambda^2/3\).
- No change is made to the working action or to the independence of \(F(\Phi)\) and \(H(\Phi)\).

## Unresolved issues

- The supplied tensor calculation was executed with Python 3.14.7 and SymPy 1.14.0 and agreed exactly with the analytic center limits.
- A later governance change should decide whether and where to apply the recommended canonical status promotion while retaining this provenance.
- No metric field equations, global solutions, numerical shooting, stability result, or empirical validation follow from this local calculation.

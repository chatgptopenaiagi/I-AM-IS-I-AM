# Mathematical review for the research atlas

Review date: 2026-11-11. Scope: independent review of the protected action, scalar-only variation, local center algebra, software presentation and units. This document does not change the canonical registry, protected equations or their promotion history. QFP remains a developing theoretical research framework.

Methods: ANALYTIC DERIVATION, SYMBOLIC COMPUTATION, DIMENSIONAL CHECK, LIMITING-CASE TEST, INDEPENDENT AUDIT. Dependencies: `QFP-M001`, `QFP-C001`, `QFP-A001`, `QFP-A002`, `QFP-DEF001`, `QFP-A003`, `QFP-NOT001`, and the existing results `QFP-D001`–`QFP-D005` being reviewed. No numerical integration, global solution, observational test or empirical confirmation is reported.

## 1. Inputs and scalar variation

**Object type: WORKING MODEL.** The reviewed action is exactly

\[
S=\int d^4x\sqrt{-g}\,[F(\Phi)R-\tfrac12(\nabla\Phi)^2-V(\Phi)+\alpha H(\Phi)\mathcal G].
\]

**Object type: ASSUMPTION.** The dimension is four; signature is \((-+++)\); the connection is Levi-Civita; curvature and contractions follow [Conventions and Notation](../02_MATHEMATICS/Conventions_and_Notation.md). \(F,H\) remain independent functions. Variations have compact support. This last assumption removes local variation surface integrals without asserting a complete boundary action or global variational problem.

**Status: DERIVED.** Holding the metric fixed gives

\[
\delta_\Phi S=\int\sqrt{-g}\,[F'R-V'+\alpha H'\mathcal G]\delta\Phi
-\int\sqrt{-g}\,\nabla^\mu\Phi\,\nabla_\mu\delta\Phi.
\]

The second integrand is
\(-\nabla_\mu(\nabla^\mu\Phi\,\delta\Phi)+(\Box\Phi)\delta\Phi\).
After displaying and removing that divergence under the stated support assumption,

\[
E_\Phi=\Box\Phi-V'(\Phi)+F'(\Phi)R+\alpha H'(\Phi)\mathcal G=0.
\]

All signs in the protected scalar result survive this independent check. This is a scalar variation only: \(\delta g^{\mu\nu}=0\), so neither a variation of \(\mathcal G\) nor a metric field equation is implied. The separate [metric review draft](Atlas_Metric_Bulk_Variation_Draft.md) records that calculation without promoting it into the canonical registry.

**Status: DERIVED.** In local flat coordinates the same kinetic sign yields \(\Box\Phi=-\partial_t^2\Phi+\nabla^2\Phi\). With constant couplings the equation is \(\Box\Phi-V'=0\). The supplemental symbolic test derives the signs from a two-coordinate Euler–Lagrange calculation, rather than testing only an inserted expected residual.

## 2. Local center verification

**Object type: ANSATZ.** Use precisely
\(m=m_3r^3+O(r^5)\), \(\delta=\delta_0+\delta_2r^2+O(r^4)\), and \(\Phi=\Phi_0+\Phi_2r^2+O(r^4)\), with \(N=1-2m/r\). Remainders and the repository's smoothness assumptions are essential; the displayed polynomials are not global solutions.

**Status: DERIVED.** The exact radial scalar operator within the static ansatz is

\[
\Box\Phi=\frac{1}{e^\delta r^2}\partial_r(e^\delta r^2N\Phi_{,r})
=N\Phi_{,rr}+(N_{,r}+2N/r+N\delta_{,r})\Phi_{,r}.
\]

Its central limit is \(6\Phi_2\). Keeping arbitrary \(m_5,\delta_4,\Phi_4\) in an additional symbolic check does not change that limit.

**Status: DERIVED.** An independent contraction of the six central sectional components, with \(a=2(m_3-\delta_2)\), \(b=2m_3\), gives

\[
R=6(a+b),\quad R_{\mu\nu}R^{\mu\nu}=12(a^2+ab+b^2),\quad
R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}=12(a^2+b^2).
\]

Thus \(\mathcal G=24ab\), and

\[
R(0)=24m_3-12\delta_2,\qquad \mathcal G(0)=96m_3(m_3-\delta_2).
\]

**Status: DERIVED.** Substitution into the scalar equation reproduces

\[
6\Phi_2-V'_0+(24m_3-12\delta_2)F'_0
+96\alpha m_3(m_3-\delta_2)H'_0=0.
\]

The existing coordinate-metric SymPy calculation was also rerun successfully. Its computed curvature is constructed from the connection and the specified Riemann convention; the central target formulas are not inserted as outputs.

## 3. Units and a declared display scale

**Review ID: `ATLAS-REFERENCE-MASS`. Object type: DEFINITION.** Choose an arbitrary positive reference mass \(\mu\), with no assigned measured value. Hatted quantities below are dimensionless display variables. This is a proposed atlas convention, not a modification of canonical physical dimensions or a new coupling relation.

Domain: LOCAL | REGULAR-CENTER and the plotted coordinate patch. Depends-On: `QFP-C001`, `QFP-M001`, `QFP-A003`. Validation: DIMENSIONAL CHECK and exact symbolic rescaling of the scalar residual. No numerical radius of validity is supplied.

| Physical quantity | Canonical dimension | Dimensionless display value |
|---|---|---|
| \(r,m\) | \(M^{-1}\) | \(\hat r=\mu r,\ \hat m=\mu m\) |
| \(m_3,\delta_2,\Lambda\) | \(M^2\) | divide by \(\mu^2\) |
| \(\Phi,\Phi_0,F'_0\) | \(M\) | divide by \(\mu\) |
| \(\Phi_2,V'_0,E_\Phi\) | \(M^3\) | divide by \(\mu^3\) |
| \(H'_0\) | \(M^{-1}\) | \(\widehat{H'_0}=\mu H'_0\) |
| \(F,V\) | \(M^2,M^4\) | \(\hat F=F/\mu^2,\ \hat V=V/\mu^4\) |
| \(R,\mathcal G\) | \(M^2,M^4\) | \(\hat R=R/\mu^2,\ \hat{\mathcal G}=\mathcal G/\mu^4\) |
| \(\delta,\delta_0,N,H,\alpha\) | \(1\) | unchanged |

**Status: DERIVED.** These definitions preserve the algebraic form of the center equations. For example \(m_3r^2=\hat m_3\hat r^2\), \(\Phi_2r^2/\mu=\hat\Phi_2\hat r^2\), and the whole scalar residual is \(\mu^3\) times its hatted version. There is no reason to label the canonical \(\alpha\) as a length squared: this repository assigns it dimension one (mass exponent zero), unlike some differently normalized actions.

**Status: DERIVED.** Coordinate-component dimensions require care. The canonical shorthand \([g_{\mu\nu}]=1\) is appropriate when all coordinate differentials carry length, or for orthonormal components. In the spherical chart \(\theta,\varphi\) are dimensionless while \(g_{\theta\theta}=r^2\) carries \(M^{-2}\). This is a component-unit clarification, not a change to invariant curvature dimensions. The atlas should label invariant results and reference-mass-scaled parameters explicitly.

## 4. What the interface may conclude

**Status: DERIVED.** A small scalar residual verifies only one algebraic central relation for the supplied values. The independently adjustable \(F'_0,H'_0,V'_0\) are local jets; without specified functions they do not define a complete theory. Residual zero does not establish the metric equations, a local solution to all orders, a global solution, stability, causal structure or observational agreement.

**Status: DERIVED.** The substitution \(\delta_2=0,m_3=\Lambda/6\) gives \(R(0)=4\Lambda\) and \(\mathcal G(0)=8\Lambda^2/3\). Positive \(\Lambda\) is the de Sitter sign, negative \(\Lambda\) the anti-de Sitter sign, and zero the flat sign for a constant-curvature reference. Matching these two central invariants leaves higher radial coefficients undetermined; it does not prove that the plotted field or a full solution is maximally symmetric. In particular, nonzero \(\Phi_2\) is not a constant scalar background.

**Status: DERIVED.** The current `deSitterCheck` comparison is
\(\lvert a-b\rvert\le\mathrm{tol}\max(1,\lvert a\rvert,\lvert b\rvert)\).
It is a mixed absolute/relative tolerance with an absolute floor near zero, not a pure relative error. Apply it to dimensionless quantities, or declare a separate dimensional scale for each invariant. Its tolerance is a software acceptance rule, not a truncation-error estimate. Supplemental tests explicitly exercise \(\Lambda=0\), both signs, and the absolute floor.

**Status: DERIVED.** For the retained polynomial \(N=1-2m_3r^2\), a positive \(m_3\) gives a zero at \(r=1/\sqrt{2m_3}\). That extrapolated zero must trigger a chart/truncation warning. It is not evidence for a physical event horizon or a singularity: the unknown higher-order terms and global extension have not been solved. For \(N\le0\), the static timelike interpretation of \(t\) is unavailable in this chart. Neither \(N>0\) nor small \(r\) supplies a rigorous series error bound.

## 5. Reproducibility and limits

Run date: 2026-11-11. Existing environment: Python **3.14.7**, SymPy **1.14.0**, Node.js **26.12.0**; no package installation. Exact symbolic arithmetic; real symbols unless explicitly marked positive. Compact-support boundary assumption; no initial data, solver, grid, random seed or tolerance in the symbolic runs.

```text
python -B SOFTWARE/regular_center_scalar_reduction.py
python -B SOFTWARE/tests/test_atlas_variation_review.py
node WEB/qfp-lab/tests/atlas-math-review.test.mjs
```

The executed Python path was `C:\AI\pytorch-cu132\Scripts\python.exe`; this is environment provenance, not a required project path. Any compatible Python/SymPy environment may run the same files. The existing curvature script completed in about 6.5 seconds. The supplemental suite passed **8/8** exact symbolic tests; the JavaScript supplement passed **6** groups. The existing **12** JavaScript math groups and **14** dependency-audit tests also passed on this review run. JavaScript tests use IEEE-754 numbers and explicitly written comparison tolerances; they are not numerical integrations. The first supplemental run exposed a test's structural expanded-versus-factored equality mismatch; replacing that assertion with an exact zero-difference check passed without changing mathematical formulas.

Fresh coordinate-script outputs:

```text
BoxPhi(0) = 6*phi2
R(0) = 12*(-delta2 + 2*m3)
RicciSquared(0) = 48*(delta2**2 - 3*delta2*m3 + 3*m3**2)
RiemannSquared(0) = 48*(delta2**2 - 2*delta2*m3 + 2*m3**2)
GaussBonnet(0) = 96*m3*(-delta2 + m3)
```

The review has not established a full metric ODE reduction, well-posed boundary action, global existence/uniqueness, center convergence radius, horizon extension, hyperbolicity, perturbative stability, observational fit or physical projection mechanism. The metric review's symbolic tensor sample and lapse check supplement an analytic derivation; they are not a completely independent arbitrary-metric functional-variation implementation.

Primary external sources inspected for the separate metric/sign review are cited at the points of use in [that draft](Atlas_Metric_Bulk_Variation_Draft.md). The scalar and center claims above have their derivations reproduced here and in the linked repository derivations, and do not depend on an uninspected external citation.

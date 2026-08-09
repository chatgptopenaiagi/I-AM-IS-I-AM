# Scalar Regular-Center Test

## Test identity and scope

Date: 2026-08-09

Question: Does an independent regular-center reduction of the **DERIVED** covariant scalar equation reproduce the historical QFP central conjecture?

Primary record: `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`.

This validation separates analytic derivation, computational verification, and consistency checks. None is observation or empirical evidence.

## 1. Box Phi center test

- Method: analytic derivation from \(\Box\Phi=(\sqrt{-g})^{-1}\partial_\mu(\sqrt{-g}g^{\mu\nu}\partial_\nu\Phi)\).
- Result: \(\Box\Phi(0)=6\Phi_2\).
- Regularity: \((2N/r)\Phi_{,r}=4\Phi_2+O(r^2)\); the apparent \(1/r\) cancels because smooth spherical symmetry requires \(\Phi_{,r}=O(r)\). All other terms are finite.
- Outcome: PASS.
- **Status: DERIVED.**

## 2. Ricci-scalar center test

- Method: analytic contraction of independently calculated orthonormal Riemann components.
- Result: \(R(0)=24m_3-12\delta_2\).
- Independent consistency route: direct scalar-curvature formula in \(\nu,\lambda\) variables gives the same limit.
- Outcome: PASS.
- **Status: DERIVED.**

## 3. Gauss-Bonnet center test

- Method: separate analytic evaluation of \(R^2\), \(R_{\mu\nu}R^{\mu\nu}\), and \(R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}\).
- Center component parameters: \(a=2(m_3-\delta_2)\), \(b=2m_3\).
- Intermediate results: \(R=6(a+b)\), \(R_{\mu\nu}R^{\mu\nu}=12(a^2+ab+b^2)\), and \(R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}=12(a^2+b^2)\).
- Result: \(\mathcal G(0)=24ab=96m_3(m_3-\delta_2)\).
- Outcome: PASS.
- **Status: DERIVED.**

## 4. De Sitter limit

Input: \(\delta_2=0\), \(m_3=\Lambda/6\).

- \(R(0)=4\Lambda\), agreeing with the four-dimensional de Sitter value under the adopted Riemann convention.
- \(\mathcal G(0)=8\Lambda^2/3\), agreeing with the constant-curvature invariant calculation.
- Outcome: PASS.

These are mathematical consistency checks, not empirical confirmation.

## 5. Dimensional consistency

The independently assembled equation is

\[
6\Phi_2-V'(\Phi_0)
+(24m_3-12\delta_2)F'(\Phi_0)
+96\alpha m_3(m_3-\delta_2)H'(\Phi_0)=0.
\]

Every term has canonical mass dimension \(M^3\). Outcome: PASS.

## 6. Historical-conjecture comparison

The independent result was frozen before the historical relation was retrieved. Coefficient, sign, and dimension comparisons all agree:

- \(\Phi_2\): \(+6\), exact;
- potential: negative sign, exact;
- \(F'(\Phi_0)\): \(24m_3-12\delta_2\), exact;
- \(H'(\Phi_0)\): \(96\alpha m_3(m_3-\delta_2)\), exact;
- dimensions: \(M^3\) term by term, exact.

**Classification: EXACT MATCH.**

The result does not falsify or supersede the historical conjecture. It independently reproduces it. The active canonical central scalar relation and central Gauss-Bonnet expression now carry **Status: DERIVED**, while their former **CONJECTURE** status remains preserved in the historical research record.

## 7. Computational verification

Artifact: `SOFTWARE/regular_center_scalar_reduction.py`.

- Intended method: SymPy construction from the coordinate metric through Christoffel, Riemann, Ricci, scalar, quadratic invariants, and determinant-divergence definitions.
- Inputs: the stated center truncations \(N=1-2m_3r^2\), \(\delta=\delta_0+\delta_2r^2\), and \(\Phi=\Phi_0+\Phi_2r^2\).
- Convention: \((-+++ )\) and the repository Riemann definition, printed by the program.
- Solver, tolerances, random seeds, and external data: not used.
- Output path: standard output; no generated result file.
- Executed environment: Python 3.14.7 and SymPy 1.14.0, installed temporarily in the workspace for this run.
- Outputs: \(\Box\Phi(0)=6\Phi_2\), \(R(0)=12(2m_3-\delta_2)\), and \(\mathcal G(0)=96m_3(m_3-\delta_2)\). The intermediate Ricci- and Riemann-square outputs also reproduce the analytic contractions.
- De Sitter outputs: \(R=4\Lambda\), \(R_{\mu\nu}R^{\mu\nu}=4\Lambda^2\), \(R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}=8\Lambda^2/3\), and \(\mathcal G=8\Lambda^2/3\).
- Outcome: PASS. The computational result agrees exactly with the analytic derivation and is not empirical evidence.

## Overall conclusion and audit state

The analytic reduction, computational verification, and analytic consistency checks pass, with an **EXACT MATCH** to the historical conjecture. The result is ready for independent audit.

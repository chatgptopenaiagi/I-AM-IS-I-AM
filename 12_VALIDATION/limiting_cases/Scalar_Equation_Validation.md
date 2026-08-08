# Scalar Equation Validation

## Scope

This document records algebraic checks of the independently derived local scalar equation in `02_MATHEMATICS/derivations/Scalar_Euler_Lagrange_Derivation.md`. These checks test internal consistency. They are not observations, experiments, empirical confirmation, or evidence that the QFP working model describes nature.

**Equation qualifier: EXACT local bulk equation within the protected working model and adopted assumptions.**

**Status: DERIVED.** The equation under test is

\[
\Box\Phi+F'(\Phi)R-V'(\Phi)
+\alpha H'(\Phi)\mathcal G=0.
\]

## 1. Dimensional test

The canonical dimensions give

| Term | Calculation | Result |
|---|---:|---:|
| \(\Box\Phi\) | \(M^2M\) | \(M^3\) |
| \(F'(\Phi)R\) | \(M\,M^2\) | \(M^3\) |
| \(V'(\Phi)\) | \(M^3\) | \(M^3\) |
| \(\alpha H'(\Phi)\mathcal G\) | \(1\,M^{-1}M^4\) | \(M^3\) |

**Status: DERIVED. Result: PASS.** All terms have mass dimension three. This does not test or establish the numerical coefficients or empirical validity of the equation.

## 2. Constant-\(F\) limit

For \(F'(\Phi)=0\),

\[
\Box\Phi-V'(\Phi)+\alpha H'(\Phi)\mathcal G=0.
\]

**Status: DERIVED. Result: PASS.** The direct Ricci coupling drops out of the scalar variation, while the Gauss-Bonnet scalar coupling may remain.

## 3. Constant-\(H\) limit

For \(H'(\Phi)=0\),

\[
\Box\Phi+F'(\Phi)R-V'(\Phi)=0.
\]

**Status: DERIVED. Result: PASS.** The constant Gauss-Bonnet coupling has no scalar variation. This check makes no claim about its metric variation.

## 4. Minimally coupled scalar limit

For \(F'(\Phi)=H'(\Phi)=0\),

\[
\Box\Phi-V'(\Phi)=0.
\]

**Status: DERIVED. Result: PASS.** This is the scalar equation obtained directly from the remaining kinetic and potential terms with the adopted signature and d'Alembertian convention. It does not independently validate the metric sector.

## 5. Constant-scalar limit

For \(\Phi(x)=\Phi_0\), \(\Box\Phi_0=0\), and the remaining necessary pointwise condition is

\[
F'(\Phi_0)R-V'(\Phi_0)
+\alpha H'(\Phi_0)\mathcal G=0.
\]

**Status: DERIVED. Result: PASS AS A REDUCTION.** A constant scalar is not automatically a solution. If \(F'(\Phi_0)=H'(\Phi_0)=0\), it additionally requires \(V'(\Phi_0)=0\). Whether a metric exists that satisfies this condition together with the future metric equations is unresolved.

## 6. Independent kinetic-sign check

The direct variation gives

\[
\delta\mathcal L_{\mathrm{kin}}
=-\nabla^\mu\Phi\nabla_\mu(\delta\Phi).
\]

Using

\[
\nabla_\mu(\delta\Phi\nabla^\mu\Phi)
=\nabla_\mu(\delta\Phi)\nabla^\mu\Phi
+\delta\Phi\Box\Phi
\]

independently yields

\[
\delta S_{\mathrm{kin}}
=\int_{\mathcal M}d^4x\sqrt{-g}\,
(\Box\Phi)\delta\Phi
-\int_{\partial\mathcal M}d\Sigma_\mu\,
\delta\Phi\nabla^\mu\Phi.
\]

**Status: DERIVED. Result: PASS.** The independent identity reproduces the \(+\Box\Phi\) bulk sign and the negative boundary flux exactly. Compact support or suitable boundary-vanishing variation removes the flux for the local equation.

## Validation summary

| Test | Outcome |
|---|---|
| Dimensional homogeneity | PASS |
| Constant \(F\) | PASS |
| Constant \(H\) | PASS |
| Minimally coupled scalar | PASS |
| Constant scalar | PASS AS A REDUCTION; additional algebraic condition required |
| Independent kinetic sign | PASS |

No check in this document constitutes empirical evidence or observational validation.

## NEXT TEST

The next task will substitute

\[
m(r)=m_3r^3+O(r^5),\qquad
\delta(r)=\delta_0+\delta_2r^2+O(r^4),
\qquad
\Phi(r)=\Phi_0+\Phi_2r^2+O(r^4)
\]

into the independently derived scalar equation. The purpose will be to determine whether the existing conjectural central scalar relation is reproduced exactly, reproduced with different coefficients, reproduced with different signs, incomplete, or falsified. No outcome is presumed, and no regular-center reduction is performed here.

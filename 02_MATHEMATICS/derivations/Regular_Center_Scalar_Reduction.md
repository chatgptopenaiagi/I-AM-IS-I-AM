# Regular-Center Scalar Reduction

## Scope and frozen input

This document independently reduces the already-derived local bulk scalar equation at the regular center. The historical conjectural center relation was not used as an input, coefficient target, or sign guide in Sections 1--7. It is retrieved only in Section 8, after the independent result is boxed and frozen.

**Equation qualifier: EXACT local bulk equation within the protected working model and adopted assumptions.**

**Status: DERIVED.**

\[
\Box\Phi+F'(\Phi)R-V'(\Phi)+\alpha H'(\Phi)\mathcal G=0.
\]

The signature is \((-+++ )\), and the curvature definitions are those in `02_MATHEMATICS/Conventions_and_Notation.md`. No metric field equation is used.

**Object type: ANSATZ.**

\[
ds^2=-e^{2\delta(r)}N(r)dt^2+\frac{dr^2}{N(r)}+r^2d\Omega^2,
\]
\[
m=m_3r^3+O(r^5),\quad
\delta=\delta_0+\delta_2r^2+O(r^4),\quad
\Phi=\Phi_0+\Phi_2r^2+O(r^4).
\]

**Object type: DEFINITION.** Since \(N=1-2m/r\),

\[
N=1-2m_3r^2+O(r^4),\quad
N_{,r}=-4m_3r+O(r^3),\quad
N_{,rr}=-4m_3+O(r^2).
\]

The calculation is local. The working \(C^4\) center regularity convention supplies the differentiability required by the displayed remainders and curvature limits. No global boundary condition is needed.

## 1. Scalar d'Alembertian from the determinant definition

In coordinates \((t,r,\theta,\varphi)\),

\[
g_{\mu\nu}=\operatorname{diag}
\left(-e^{2\delta}N,N^{-1},r^2,r^2\sin^2\theta\right),
\]
\[
g=-e^{2\delta}r^4\sin^2\theta,
\qquad \sqrt{-g}=e^\delta r^2\sin\theta,
\qquad g^{rr}=N.
\]

For a static spherical scalar, only \(\partial_r\Phi\) is nonzero. Direct substitution into the defining divergence gives

\[
\begin{aligned}
\Box\Phi
&=\frac{1}{\sqrt{-g}}\partial_\mu
  \left(\sqrt{-g}\,g^{\mu\nu}\partial_\nu\Phi\right)\\
&=\frac{1}{e^\delta r^2\sin\theta}
  \partial_r\left(e^\delta r^2\sin\theta\,N\Phi_{,r}\right)\\
&=\frac{1}{e^\delta r^2}
  \partial_r\left(e^\delta r^2N\Phi_{,r}\right)\\
&=N\Phi_{,rr}+\left(N_{,r}+N\delta_{,r}+\frac{2N}{r}\right)\Phi_{,r}.
\end{aligned}
\]

This formula has therefore been derived rather than imported. The center series give

\[
\Phi_{,r}=2\Phi_2r+O(r^3),\quad
\Phi_{,rr}=2\Phi_2+O(r^2),\quad
\delta_{,r}=2\delta_2r+O(r^3).
\]

The apparently singular term is explicitly regular:

\[
\frac{2N}{r}\Phi_{,r}
=\frac{2[1-2m_3r^2+O(r^4)]}{r}
 [2\Phi_2r+O(r^3)]
=4\Phi_2+O(r^2).
\]

The remaining pieces are

\[
N\Phi_{,rr}=2\Phi_2+O(r^2),
\]
\[
N_{,r}\Phi_{,r}=O(r^2),\qquad
N\delta_{,r}\Phi_{,r}=O(r^2).
\]

Thus all inverse powers cancel against the required \(\Phi_{,r}=O(r)\), and the limit is finite.

**Equation qualifier: LOCAL EXPANSION. Status: DERIVED.**

\[
\boxed{\Box\Phi\big|_{r=0}=6\Phi_2.}
\]

## 2. Curvature preparation

Write the metric temporarily as

\[
ds^2=-e^{2\nu(r)}dt^2+e^{2\lambda(r)}dr^2+r^2d\Omega^2,
\qquad
\nu=\delta+\frac12\ln N,\quad
\lambda=-\frac12\ln N.
\]

The center expansions are

\[
\nu=\delta_0+(\delta_2-m_3)r^2+O(r^4),\qquad
\lambda=m_3r^2+O(r^4),
\]
\[
\nu_{,r}=2(\delta_2-m_3)r+O(r^3),\quad
\nu_{,rr}=2(\delta_2-m_3)+O(r^2),\quad
\lambda_{,r}=2m_3r+O(r^3).
\]

Use the orthonormal coframe

\[
e^{\hat0}=e^\nu dt,\quad e^{\hat1}=e^\lambda dr,
\quad e^{\hat2}=r\,d\theta,\quad
e^{\hat3}=r\sin\theta\,d\varphi.
\]

Direct evaluation of the Levi-Civita connection and the repository Riemann definition gives the independent lowered orthonormal components

\[
R_{\hat0\hat1\hat0\hat1}
=e^{-2\lambda}(\nu_{,rr}+\nu_{,r}^2-\nu_{,r}\lambda_{,r}),
\]
\[
R_{\hat0\hat2\hat0\hat2}
=R_{\hat0\hat3\hat0\hat3}
=e^{-2\lambda}\frac{\nu_{,r}}r,
\]
\[
R_{\hat1\hat2\hat1\hat2}
=R_{\hat1\hat3\hat1\hat3}
=e^{-2\lambda}\frac{\lambda_{,r}}r,
\qquad
R_{\hat2\hat3\hat2\hat3}
=\frac{1-e^{-2\lambda}}{r^2}.
\]

For inspectability, the first formula follows, for example, from the coordinate component

\[
R_{trtr}=e^{2\nu}
(\nu_{,rr}+\nu_{,r}^2-\nu_{,r}\lambda_{,r})
\]

and multiplication by the four inverse frame factors. The angular formulas follow analogously from \(R_{t\theta t\theta}\), \(R_{r\theta r\theta}\), and \(R_{\theta\varphi\theta\varphi}\). No field equation enters.

Taking the center limit gives

\[
R_{\hat0\hat i\hat0\hat i}(0)=-a\quad(i=1,2,3),
\qquad
R_{\hat i\hat j\hat i\hat j}(0)=b\quad(i<j),
\]
where

\[
a\equiv2(m_3-\delta_2),\qquad b\equiv2m_3.
\]

The equal radial and tangential limits explicitly show local isotropy of the retained center curvature and the absence of a curvature singularity at this order.

## 3. Ricci scalar at the center

Contracting the six center components with \(\eta_{\hat a\hat b}=\operatorname{diag}(-1,1,1,1)\) gives

\[
R_{\hat0\hat0}=-3a,
\qquad R_{\hat i\hat i}=a+2b,
\]
and hence

\[
R(0)=-R_{\hat0\hat0}+\sum_{i=1}^3R_{\hat i\hat i}
=6(a+b).
\]

**Equation qualifier: LOCAL EXPANSION. Status: DERIVED.**

\[
\boxed{R(0)=24m_3-12\delta_2.}
\]

As an independent analytic check, direct contraction before taking the limit yields

\[
R=-2e^{-2\lambda}
\left[\nu_{,rr}+\nu_{,r}^2-\nu_{,r}\lambda_{,r}
+\frac{2(\nu_{,r}-\lambda_{,r})}{r}\right]
+\frac{2(1-e^{-2\lambda})}{r^2},
\]

which gives the same center value after inserting the series.

For \(\delta_2=0\) and \(m_3=\Lambda/6\),

\[
R(0)=24\frac{\Lambda}{6}=4\Lambda.
\]

This agrees with the standard four-dimensional de Sitter value in the adopted curvature convention. The required sign checkpoint therefore passes.

## 4. Gauss-Bonnet invariant at the center

The center Ricci components above give

\[
R_{\mu\nu}R^{\mu\nu}\big|_0
=(-3a)^2+3(a+2b)^2
=12(a^2+ab+b^2).
\]

Counting the four symmetry-related occurrences of each of the six independent sectional components gives

\[
R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}\big|_0
=12(a^2+b^2).
\]

Since \(R(0)=6(a+b)\), the independently constructed invariant is

\[
\begin{aligned}
\mathcal G(0)
&=36(a+b)^2-48(a^2+ab+b^2)+12(a^2+b^2)\\
&=24ab.
\end{aligned}
\]

**Equation qualifier: LOCAL EXPANSION. Status: DERIVED.**

\[
\boxed{\mathcal G(0)=96m_3(m_3-\delta_2).}
\]

For the de Sitter specialization, \(a=b=\Lambda/3\), so

\[
\mathcal G(0)=24\left(\frac{\Lambda}{3}\right)^2
=\frac{8\Lambda^2}{3}.
\]

Equivalently, constant curvature has \(R=4\Lambda\), \(R_{\mu\nu}R^{\mu\nu}=4\Lambda^2\), and \(R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}=8\Lambda^2/3\), whose defining combination gives the same result. This is a consistency check, not empirical evidence.

## 5. Potential and coupling limits

Assuming the already-required differentiability of \(F,H,V\) near \(\Phi_0\), Taylor expansion gives

\[
F'(\Phi)=F'(\Phi_0)+F''(\Phi_0)\Phi_2r^2+O(r^4),
\]
\[
H'(\Phi)=H'(\Phi_0)+H''(\Phi_0)\Phi_2r^2+O(r^4),
\]
\[
V'(\Phi)=V'(\Phi_0)+V''(\Phi_0)\Phi_2r^2+O(r^4).
\]

Therefore \(\Phi\to\Phi_0\), \(F'\to F'(\Phi_0)\), \(H'\to H'(\Phi_0)\), and \(V'\to V'(\Phi_0)\). All displayed corrections proportional to \(r^2\), as well as higher powers contained in the remainders, vanish as \(r\to0\).

## 6. Independently assembled center equation

Insert only the results of Sections 1, 3, 4, and 5 into the derived covariant equation:

**Equation qualifier: LOCAL EXPANSION. Status: DERIVED.**

\[
\boxed{
6\Phi_2
-V'(\Phi_0)
+(24m_3-12\delta_2)F'(\Phi_0)
+96\alpha m_3(m_3-\delta_2)H'(\Phi_0)=0.}
\]

This box freezes the independent result before historical comparison.

## 7. Dimensional check

With \([r]=M^{-1}\), the center ansatz gives

\[
[\Phi_2]=M^3,\quad[m_3]=[\delta_2]=M^2.
\]

Using \([F']=M\), \([V']=M^3\), \([H']=M^{-1}\), and \([\alpha]=1\),

\[
[6\Phi_2]=M^3,
\quad[V']=M^3,
\quad[(24m_3-12\delta_2)F']=M^3,
\]
\[
[96\alpha m_3(m_3-\delta_2)H']=M^3.
\]

**Status: DERIVED.** The center equation is dimensionally homogeneous. This does not provide empirical confirmation.

## 8. Comparison with the historical conjecture

Only after freezing Section 6 was the stored conjecture retrieved:

\[
6\Phi_2-V'(\Phi_0)
+(24m_3-12\delta_2)F'(\Phi_0)
+96\alpha m_3(m_3-\delta_2)H'(\Phi_0)=0.
\]

The comparison is exact term by term:

| Item | Independent result | Historical conjecture | Comparison |
|---|---|---|---|
| \(\Phi_2\) coefficient | \(+6\) | \(+6\) | exact |
| potential sign | \(-V'(\Phi_0)\) | \(-V'(\Phi_0)\) | exact |
| \(F'(\Phi_0)\) coefficient | \(24m_3-12\delta_2\) | same | exact |
| \(H'(\Phi_0)\) coefficient | \(96\alpha m_3(m_3-\delta_2)\) | same | exact |
| all signs | \(+,-,+,+\) | \(+,-,+,+\) | exact |
| dimensions | every term \(M^3\) | every term \(M^3\) | exact |

**Classification: EXACT MATCH.**

**Status consequence.** The historical conjecture was independently reproduced from the DERIVED covariant scalar equation and independently calculated center invariants. The active canonical central scalar relation and central Gauss-Bonnet expression now carry **Status: DERIVED**; the separately recorded promotion preserves their earlier **CONJECTURE** status in the historical research record.

## 9. Computational verification boundary

`SOFTWARE/regular_center_scalar_reduction.py` constructs the coordinate metric, Christoffel symbols, Riemann tensor, Ricci tensor, scalar invariants, and scalar d'Alembertian from definitions using SymPy. It does not encode the boxed expected center values as calculation outputs. The analytic derivation above remains primary.

The check was executed with Python 3.14.7 and a temporary workspace-local installation of SymPy 1.14.0. It returned

\[
\Box\Phi(0)=6\Phi_2,
\quad R(0)=12(2m_3-\delta_2),
\quad \mathcal G(0)=96m_3(m_3-\delta_2),
\]

together with

\[
R_{\mu\nu}R^{\mu\nu}\big|_0
=48(\delta_2^2-3\delta_2m_3+3m_3^2),
\]
\[
R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}\big|_0
=48(\delta_2^2-2\delta_2m_3+2m_3^2).
\]

The de Sitter output was \(R=4\Lambda\), \(R_{\mu\nu}R^{\mu\nu}=4\Lambda^2\), \(R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}=8\Lambda^2/3\), and \(\mathcal G=8\Lambda^2/3\). These outputs agree exactly with the analytic derivation. This is computational verification, not empirical evidence.

## Failure criteria and open issues

The reduction would fail if an independent implementation using the stated convention produced different center invariants or if omitted higher-order coefficients affected the \(r^0\) limits. The analytic power counting shows that the latter do not, and the executed computational check found no conflict. No global solution, metric field equation, numerical shooting result, observation, or empirical support is claimed.

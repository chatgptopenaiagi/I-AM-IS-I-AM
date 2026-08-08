# Scalar Euler-Lagrange Derivation

## Scope and inputs

This document derives only the local covariant scalar equation from the protected QFP working action. It does not vary the metric, derive any metric field equation, or use the conjectural regular-center scalar relation.

**Object type: WORKING MODEL.** The input action is

\[
S=\int_{\mathcal M}d^4x\,\sqrt{-g}\left[
F(\Phi)R
-\frac12 g^{\mu\nu}(\nabla_\mu\Phi)(\nabla_\nu\Phi)
-V(\Phi)
+\alpha H(\Phi)\mathcal G
\right].
\]

**Object type: ASSUMPTION.** The scalar variation is \(\delta\Phi\), while \(g_{\mu\nu}\), \(g^{\mu\nu}\), \(\sqrt{-g}\), the Levi-Civita connection, \(R\), and \(\mathcal G\) are held fixed. The variation is compactly supported in \(\mathcal M\), or obeys boundary conditions that make the displayed boundary flux vanish. The adopted signature is \((-+++)\), and \(\Box\Phi=\nabla_\mu\nabla^\mu\Phi\).

## 1. Scalar-dependent terms

The four contributions depend on \(\Phi\) as follows:

1. \(F(\Phi)R\): only \(F\) depends on \(\Phi\) during scalar-only variation; \(R\) is fixed.
2. \(-\tfrac12 g^{\mu\nu}\nabla_\mu\Phi\nabla_\nu\Phi\): \(\Phi\) enters through both differentiated scalar factors; the metric and connection are fixed.
3. \(-V(\Phi)\): \(\Phi\) enters through \(V\).
4. \(\alpha H(\Phi)\mathcal G\): only \(H\) depends on \(\Phi\); \(\alpha\) and \(\mathcal G\) are fixed.

Because the metric is fixed,

\[
\delta g^{\mu\nu}=0,\qquad
\delta\sqrt{-g}=0,
\qquad \delta\Gamma^\rho{}_{\mu\nu}=0.
\]

## 2. Variation of \(F(\Phi)R\)

Apply the product rule:

\[
\delta\!\left[F(\Phi)R\right]
=\delta F(\Phi)\,R+F(\Phi)\,\delta R.
\]

The curvature scalar is constructed from the fixed metric and its fixed Levi-Civita connection, so \(\delta R=0\) in this scalar-only variation. Since

\[
\delta F(\Phi)=F'(\Phi)\,\delta\Phi,
\]

the contribution is

\[
\boxed{\delta\!\left[F(\Phi)R\right]
=F'(\Phi)R\,\delta\Phi.}
\]

## 3. Variation of the scalar kinetic term

Let

\[
\mathcal L_{\mathrm{kin}}
=-\frac12g^{\mu\nu}(\nabla_\mu\Phi)(\nabla_\nu\Phi).
\]

With the metric and connection fixed, variation commutes with the covariant derivative on a scalar:

\[
\delta(\nabla_\mu\Phi)=\nabla_\mu(\delta\Phi).
\]

The initial variation is therefore

\[
\delta\mathcal L_{\mathrm{kin}}
=-\frac12g^{\mu\nu}\left[
\nabla_\mu(\delta\Phi)\nabla_\nu\Phi
+\nabla_\mu\Phi\nabla_\nu(\delta\Phi)
\right].
\]

Rename \(\mu\leftrightarrow\nu\) in the first term and use \(g^{\mu\nu}=g^{\nu\mu}\). The two terms are equal, so the factor \(1/2\) cancels their sum:

\[
\delta\mathcal L_{\mathrm{kin}}
=-g^{\mu\nu}\nabla_\mu\Phi\nabla_\nu(\delta\Phi)
=-\nabla^\mu\Phi\nabla_\mu(\delta\Phi).
\]

Use the covariant product rule

\[
\nabla_\mu\!\left(\delta\Phi\,\nabla^\mu\Phi\right)
=\nabla_\mu(\delta\Phi)\nabla^\mu\Phi
+\delta\Phi\,\nabla_\mu\nabla^\mu\Phi.
\]

Solving this identity for the negative derivative product gives

\[
-\nabla^\mu\Phi\nabla_\mu(\delta\Phi)
=-\nabla_\mu\!\left(\delta\Phi\,\nabla^\mu\Phi\right)
+(\Box\Phi)\delta\Phi.
\]

Thus

\[
\boxed{
\delta\mathcal L_{\mathrm{kin}}
=(\Box\Phi)\delta\Phi
-\nabla_\mu\!\left(\delta\Phi\,\nabla^\mu\Phi\right).}
\]

After multiplication by \(\sqrt{-g}\) and integration, the total divergence is

\[
-\int_{\mathcal M}d^4x\sqrt{-g}\,
\nabla_\mu\!\left(\delta\Phi\,\nabla^\mu\Phi\right).
\]

Define the directed boundary element \(d\Sigma_\mu\) by

\[
\int_{\mathcal M}d^4x\sqrt{-g}\,\nabla_\mu A^\mu
=\int_{\partial\mathcal M}d\Sigma_\mu A^\mu.
\]

The boundary flux is therefore

\[
B_{\mathrm{kin}}
=-\int_{\partial\mathcal M}d\Sigma_\mu\,
\nabla^\mu\Phi\,\delta\Phi.
\]

For a non-null boundary this directed element can be expressed using the induced metric and an appropriately oriented unit normal. Compact support of \(\delta\Phi\), or the boundary condition \(\delta\Phi|_{\partial\mathcal M}=0\), makes the flux vanish. This is the precise assumption used to remove it from the local bulk equation; no claim of a complete globally well-posed boundary action follows.

The kinetic contribution to the bulk coefficient is therefore \(+\Box\Phi\). In particular, the sign is positive after integration by parts.

## 4. Variation of the potential

The chain rule gives

\[
\delta[-V(\Phi)]
=-\delta V(\Phi)
=-V'(\Phi)\delta\Phi.
\]

Hence

\[
\boxed{\delta[-V(\Phi)]=-V'(\Phi)\delta\Phi.}
\]

## 5. Variation of the Gauss-Bonnet coupling

With \(\alpha\) fixed,

\[
\delta[\alpha H(\Phi)\mathcal G]
=\alpha H'(\Phi)\mathcal G\,\delta\Phi
+\alpha H(\Phi)\delta\mathcal G.
\]

The invariant \(\mathcal G\) is constructed entirely from the fixed metric and its fixed Levi-Civita curvature in this variation. Therefore \(\delta\mathcal G=0\), and

\[
\boxed{\delta[\alpha H(\Phi)\mathcal G]
=\alpha H'(\Phi)\mathcal G\,\delta\Phi.}
\]

No metric variation of the Gauss-Bonnet sector has been performed.

## 6. Combined scalar variation

Combining the four contributions before discarding the boundary term gives

\[
\begin{aligned}
\delta_\Phi S
={}&\int_{\mathcal M}d^4x\sqrt{-g}\,
\left[
\Box\Phi+F'(\Phi)R-V'(\Phi)
+\alpha H'(\Phi)\mathcal G
\right]\delta\Phi\\
&-\int_{\mathcal M}d^4x\sqrt{-g}\,
\nabla_\mu\!\left(\delta\Phi\,\nabla^\mu\Phi\right).
\end{aligned}
\]

Equivalently, when a non-null boundary representation is applicable,

\[
\delta_\Phi S
=\int_{\mathcal M}d^4x\sqrt{-g}\,
\left[
\Box\Phi+F'(\Phi)R-V'(\Phi)
+\alpha H'(\Phi)\mathcal G
\right]\delta\Phi
+B_{\mathrm{kin}}.
\]

For compactly supported variations, or suitable variations vanishing at the boundary, \(B_{\mathrm{kin}}=0\). Arbitrariness of \(\delta\Phi\) in the bulk then requires the coefficient to vanish.

**Equation qualifier: EXACT local bulk equation within the protected working model and adopted assumptions.**

**Status: DERIVED.**

\[
\boxed{
\Box\Phi+F'(\Phi)R-V'(\Phi)
+\alpha H'(\Phi)\mathcal G=0.}
\]

This status means that the equation follows from the displayed action through the inspectable scalar-only variation above. It is not a claim of empirical support, global existence, uniqueness, or observational validity.

## 7. Dimensional check

Under \(c=\hbar=1\), the adopted dimensions are

\[
[\Phi]=M,\quad [\nabla_\mu]=M,\quad [R]=M^2,
\quad [\mathcal G]=M^4,
\]
\[
[F']=M,\quad [V']=M^3,\quad [H']=M^{-1},
\quad [\alpha]=1.
\]

Each term in the derived equation has mass dimension three:

\[
[\Box\Phi]=M^2M=M^3,
\]
\[
[F'R]=M\,M^2=M^3,
\]
\[
[V']=M^3,
\]
\[
[\alpha H'\mathcal G]
=1\cdot M^{-1}\cdot M^4=M^3.
\]

**Status: DERIVED.** The derived scalar equation is dimensionally homogeneous under the adopted canonical dimensions. This algebraic consistency check does not verify its coefficients empirically or establish the working model physically.

## 8. Limit checks

**Status: DERIVED.** These are algebraic limits of the derived equation, not empirical validation.

### A. \(F'(\Phi)=0\)

If \(F\) is constant on the field range under consideration, the direct Ricci-scalar source disappears:

\[
\Box\Phi-V'(\Phi)+\alpha H'(\Phi)\mathcal G=0.
\]

This does not require \(H\) to be constant and does not eliminate the metric dependence of \(\Box\) or \(\mathcal G\).

### B. \(H'(\Phi)=0\)

If \(H\) is constant on the field range under consideration, the Gauss-Bonnet source in the scalar equation disappears:

\[
\Box\Phi+F'(\Phi)R-V'(\Phi)=0.
\]

The term \(\alpha H\mathcal G\) remains in the action, but its scalar-only variation vanishes. No statement about its metric variation is made here.

### C. \(F'(\Phi)=H'(\Phi)=0\)

When both couplings are constant with respect to \(\Phi\), the scalar equation becomes

\[
\Box\Phi-V'(\Phi)=0.
\]

This is the minimally coupled scalar limit of the scalar equation within the protected sign convention. It does not by itself establish the gravitational metric equation or an Einstein limit.

### D. Constant \(\Phi\)

For \(\Phi(x)=\Phi_0\), one has \(\nabla_\mu\Phi_0=0\) and \(\Box\Phi_0=0\). A constant scalar is a solution only if the pointwise algebraic condition

\[
F'(\Phi_0)R-V'(\Phi_0)
+\alpha H'(\Phi_0)\mathcal G=0
\]

holds on the spacetime under consideration. Thus constancy of \(\Phi\) alone is insufficient. If both coupling derivatives also vanish at \(\Phi_0\), the condition reduces to \(V'(\Phi_0)=0\).

## 9. Independent kinetic-sign check

Start independently from the exact identity

\[
\nabla_\mu\!\left(\delta\Phi\nabla^\mu\Phi\right)
=\delta\Phi\Box\Phi
+\nabla_\mu(\delta\Phi)\nabla^\mu\Phi.
\]

Integrating this identity over \(\mathcal M\) gives

\[
\int_{\mathcal M}d^4x\sqrt{-g}\,
\nabla_\mu(\delta\Phi)\nabla^\mu\Phi
=\int_{\partial\mathcal M}d\Sigma_\mu\,
\delta\Phi\nabla^\mu\Phi
-\int_{\mathcal M}d^4x\sqrt{-g}\,
\delta\Phi\Box\Phi.
\]

The direct kinetic variation contains the negative of the left-hand side. Therefore

\[
\delta S_{\mathrm{kin}}
=\int_{\mathcal M}d^4x\sqrt{-g}\,
\delta\Phi\Box\Phi
-\int_{\partial\mathcal M}d\Sigma_\mu\,
\delta\Phi\nabla^\mu\Phi.
\]

The independently obtained bulk sign is again \(+\Box\Phi\), and the boundary flux has the same negative sign as in Section 3. The two calculations agree exactly.

## Independence from the central conjecture

The existing schematic regular-center scalar relation was not used as an input, expected answer, sign guide, coefficient constraint, or correction mechanism anywhere in this derivation. It remains logically downstream of the covariant equation derived here.

## NEXT TEST

The next task is to substitute the protected local ansatz

\[
m(r)=m_3r^3+O(r^5),\qquad
\delta(r)=\delta_0+\delta_2r^2+O(r^4),
\qquad
\Phi(r)=\Phi_0+\Phi_2r^2+O(r^4)
\]

into the independently derived scalar equation. That future calculation must determine, without prejudgment, whether the existing conjectural central scalar relation is reproduced exactly, reproduced with different coefficients, reproduced with different signs, incomplete, or falsified. No regular-center reduction is performed here.

## Open issues

- The metric field equations have not been derived.
- The full Gauss-Bonnet metric variation has not been performed.
- A globally complete boundary action has not been constructed.
- The derived equation has not yet been reduced in the static spherical sector or at the regular center.
- No global existence, uniqueness, stability, numerical, or empirical claim follows from this local variation.

# QFP Conventions and Notation

This document establishes the canonical mathematical language for subsequent QFP work. It does not derive any complete gravitational or scalar field equation. Decisions QFP-MATH-D001 through QFP-MATH-D010 were resolved on 2026-08-09; their former OPEN state is retained in the decision register.

## 1. Spacetime

**Object type: NOTATION.** The gravitational working model is four-dimensional because its protected action uses `d^4x`, and the static spherical ansatz uses one time, one radial, and two angular coordinates. Write

\[
x^\mu=(x^0,x^1,x^2,x^3), \qquad x^\mu=(t,r,\theta,\varphi)
\]

in the static spherical chart. Greek indices \(\mu,\nu,\rho,\sigma,\ldots\) range over \(0,1,2,3\). The spacetime metric and inverse are \(g_{\mu\nu}\) and \(g^{\mu\nu}\), with \(g^{\mu\rho}g_{\rho\nu}=\delta^\mu{}_\nu\). The determinant is

\[
g\equiv\det(g_{\mu\nu}),
\]

and the oriented coordinate volume element used in the action is \(d^4x\sqrt{-g}\). The protected static ansatz fixes the Lorentzian signature to \((-+++ )\) wherever that ansatz is used. This document adopts the same signature repository-wide so that the protected kinetic term has one unambiguous reading.

Lowercase Latin indices \(i,j,k,\ldots\) range over \(1,2,3\) only when an explicitly spatial decomposition is being used. They must not be used ambiguously; outside such a decomposition, their meaning and range must be separately declared or another notation used.

The coordinate orientation is \((t,r,\theta,\varphi)\), with

\[
\epsilon_{tr\theta\varphi}=+\sqrt{-g}.
\]

Every future dual-tensor definition must state this convention explicitly.

## 2. Curvature conventions

**Object type: DEFINITION.** The canonical curvature convention is

\[
(\nabla_\mu\nabla_\nu-\nabla_\nu\nabla_\mu)V^\rho
=R^\rho{}_{\sigma\mu\nu}V^\sigma,
\]
\[
R^\rho{}_{\sigma\mu\nu}
=\partial_\mu\Gamma^\rho{}_{\nu\sigma}
-\partial_\nu\Gamma^\rho{}_{\mu\sigma}
+\Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma}
-\Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}.
\]

The associated contractions are

\[
R_{\sigma\nu}=R^\rho{}_{\sigma\rho\nu},
\qquad R=g^{\mu\nu}R_{\mu\nu},
\qquad G_{\mu\nu}=R_{\mu\nu}-\frac12 g_{\mu\nu}R.
\]

These formulas are definitions, not derived curvature results. Formulas using the opposite Riemann sign must not be mixed with this package.

**Object type: NOTATION.** The metric-compatible, torsion-free Levi-Civita covariant derivative determined by \(g_{\mu\nu}\) is written \(\nabla_\mu\). For a scalar, \(\nabla_\mu\Phi=\partial_\mu\Phi\). The d'Alembertian notation is

\[
\Box\Phi\equiv\nabla_\mu\nabla^\mu\Phi
=g^{\mu\nu}\nabla_\mu\nabla_\nu\Phi.
\]

QFP uses the metric formalism for this working model; the connection is not independently varied. A future Palatini or metric-affine branch must be introduced and labeled separately.

## 3. Gauss-Bonnet sector

**Object type: DEFINITION.** Throughout active QFP gravitational work, \(\mathcal G\) denotes the four-dimensional Gauss-Bonnet invariant

\[
\mathcal G
=R^2-4R_{\mu\nu}R^{\mu\nu}
+R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}.
\]

Plain-text protected equations write this symbol as `G`; \(\mathcal G\) is its typographical form and is not the Einstein tensor \(G_{\mu\nu}\). The definition depends on using one internally consistent curvature convention, although the fully contracted quadratic combination is unchanged under a simultaneous reversal of the Riemann, Ricci, and scalar signs. No metric variation of \(\mathcal G\) is performed here.

## 4. Scalar sector

**Object type: NOTATION.** \(\Phi\) is the scalar field. Define

\[
\operatorname{grad}(\Phi)_\mu\equiv\nabla_\mu\Phi,
\qquad
(\operatorname{grad}\Phi)^2
\equiv\nabla_\mu\Phi\nabla^\mu\Phi
=g^{\mu\nu}\partial_\mu\Phi\partial_\nu\Phi.
\]

The functions \(V(\Phi)\), \(F(\Phi)\), and \(H(\Phi)\) are respectively the scalar potential, Ricci coupling, and Gauss-Bonnet coupling. A prime on one of these functions means differentiation with respect to its argument:

\[
V'(\Phi)=\frac{dV}{d\Phi},\qquad
F'(\Phi)=\frac{dF}{d\Phi},\qquad
H'(\Phi)=\frac{dH}{d\Phi}.
\]

This functional-prime notation is distinct from radial differentiation, defined below.

**Object type: ASSUMPTION.** \(F(\Phi)\) and \(H(\Phi)\) are independent coupling functions unless an inspectable derivation explicitly establishes a relation. No relation between them is introduced here.

## 5. Current gravitational working model

**Object type: WORKING MODEL.** The protected action, preserved in mathematical meaning, is

\[
S=\int d^4x\,\sqrt{-g}\left[
F(\Phi)R
-\frac12\nabla_\mu\Phi\nabla^\mu\Phi
-V(\Phi)
+\alpha H(\Phi)\mathcal G
\right].
\]

The action is dimensionless in natural units \(c=\hbar=1\), with \(G_N\) kept explicit and \(G_N\neq1\) by convention. The function \(F(\Phi)\) contains the gravitational normalization; no additional Einstein-Hilbert normalization is placed outside the protected action. The required Einstein/constant-scalar validation limit is

\[
F(\Phi_0)\longrightarrow\frac{1}{16\pi G_N}
=\frac{\bar M_{\mathrm{Pl}}^2}{2},
\]

where \(\bar M_{\mathrm{Pl}}\) is the reduced Planck mass. Recovery of this limit is a future validation test, not a demonstrated QFP result.

For local bulk variation, the independent variations are \(\delta g^{\mu\nu}\) and \(\delta\Phi\). The Levi-Civita connection is determined by the metric and is not varied independently. Variations are compactly supported, or satisfy boundary conditions that make the relevant boundary contributions vanish. Every derivation must identify total-divergence terms before discarding them and state the boundary assumption used. This local convention does not establish a globally well-posed variational principle; construction of a complete gravitational, scalar, and Gauss-Bonnet boundary action remains a separate problem if required.

## 6. Static spherical sector

**Object type: ANSATZ.** Preserve

\[
ds^2=-e^{2\delta(r)}N(r)\,dt^2
+\frac{dr^2}{N(r)}+r^2d\Omega^2.
\]

Here \(r\) is the areal-radius coordinate: symmetry two-spheres have area \(4\pi r^2\), contingent on the unit-two-sphere convention

\[
d\Omega^2=d\theta^2+\sin^2\theta\,d\varphi^2,
\qquad 0\leq\theta\leq\pi,
\quad 0\leq\varphi<2\pi.
\]

**Object type: DEFINITION.** The mass function is defined by

\[
N(r)=1-\frac{2m(r)}{r}.
\]

**Object type: NOTATION.** For a radial function \(f(r)\), \(f_{,r}=df/dr\); after this section, an unambiguous prime on a radial function may also mean \(df/dr\). Primes on \(F,H,V\) always mean \(d/d\Phi\).

A candidate Killing horizon in this coordinate chart occurs at \(r=r_h>0\) where \(N(r_h)=0\), provided the remaining metric behavior permits a regular extension. Thus \(N=0\) is a horizon condition to investigate, not by itself proof of a regular event horizon. A nondegenerate candidate additionally has \(N_{,r}(r_h)\neq0\); extremal cases require separate treatment.

Local center regularity requires at minimum \(m(r)=O(r^3)\), finite \(\delta(r)\) and \(\Phi(r)\), vanishing first radial derivatives for smooth rotationally invariant scalars, and finite curvature invariants. The local time rescaling encoded by \(\delta_0\) is not fixed here.

There is no universal QFP asymptotic geometry. Separate branches are maintained for asymptotically flat, asymptotically de Sitter, and asymptotically anti-de Sitter behavior. Other branches require later justification and explicit boundary data.

Before boundary normalization, an additive constant in \(\delta\) is coordinate freedom corresponding to a constant rescaling of \(t\). In the asymptotically flat branch, the canonical time normalization is

\[
\lim_{r\to\infty}\delta(r)=0.
\]

De Sitter and anti-de Sitter branches must state their corresponding time normalization separately.

## 7. Regular-center expansion

**Object type: ANSATZ.** Preserve

\[
m(r)=m_3r^3+O(r^5),
\qquad
\delta(r)=\delta_0+\delta_2r^2+O(r^4),
\qquad
\Phi(r)=\Phi_0+\Phi_2r^2+O(r^4).
\]

For fields smooth at the origin in local Cartesian coordinates and invariant under spatial rotations, scalar functions of position are smooth functions of \(r^2\), motivating even powers for \(\delta\) and \(\Phi\) and excluding singular terms and linear terms. Since \(N=1-2m/r\), a locally regular center with \(N=1+O(r^2)\) requires \(m=O(r^3)\); the displayed odd-power series is compatible with a smooth even-power expansion of \(m(r)/r^3\). These are local smoothness assumptions built into the ansatz. At least sufficient \(C^2\) regularity is required for the classical local field equations; \(C^4\) is the working smoothness class for regular-center series, symbolic curvature calculations, and the initial numerical program unless a later analysis proves weaker regularity sufficient. The \(C^4\) choice is a working mathematical convention, not a physical law. The expansion does not prove that a solution exists, that field equations enforce the coefficients, that curvature invariants remain finite beyond the retained order, or that the spacetime is globally regular.

## 8. Derived local center relations

**Status: DERIVED.** Within the adopted static spherical regular-center expansion and canonical curvature convention, preserve the central Gauss-Bonnet expression

\[
\mathcal G(0)=96m_3(m_3-\delta_2).
\]

Preserve the associated de Sitter substitution used as a consistency check:

\[
\delta_2=0,\qquad m_3=\frac{\Lambda}{6},
\qquad \mathcal G(0)=\frac{8\Lambda^2}{3}.
\]

The last equality follows algebraically from the displayed derived central expression after the displayed substitution. It is a de Sitter consistency check and does not extend the local center result beyond the adopted ansatz or curvature convention.

Provenance: `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`, with the independent validation record in `12_VALIDATION/regularity/Scalar_Regular_Center_Test.md`.

**Status: DERIVED.**

**Equation qualifier: EXACT local regular-center consequence of the derived covariant scalar equation, within the protected working model, canonical conventions, and regular-center ansatz.** Preserve

\[
6\Phi_2
-V'(\Phi_0)
+(24m_3-12\delta_2)F'(\Phi_0)
+96\alpha m_3(m_3-\delta_2)H'(\Phi_0)
=0.
\]

Provenance: `02_MATHEMATICS/derivations/Regular_Center_Scalar_Reduction.md`, independently checked in `12_VALIDATION/regularity/Scalar_Regular_Center_Test.md`. This local consequence must not be cited as a complete global field-equation solution and does not establish global existence, global regularity, stability, observational validity, or experimental support.

## 9. Units and dimensions

**Object type: ASSUMPTION.** The canonical unit convention is \(c=\hbar=1\), the action is dimensionless, and mass dimension is the canonical dimensional language. Newton's constant remains explicit: \(G_N\) is not set to one and has mass dimension \(-2\).

| Quantity | Canonical mass dimension |
|---|---:|
| \(x^\mu\) | \(M^{-1}\) |
| \(r\) | \(M^{-1}\) |
| \(g_{\mu\nu}\) | \(1\) |
| \(N\) | \(1\) |
| \(\delta\) | \(1\) |
| \(\Phi\) | \(M\) |
| \(R\) | \(M^2\) |
| \(\mathcal G\) | \(M^4\) |
| \(F(\Phi)\) | \(M^2\) |
| \(H(\Phi)\) | \(1\) |
| \(V(\Phi)\) | \(M^4\) |
| \(\alpha\) | \(1\) |
| \(\alpha H(\Phi)\) | \(1\) |
| \(m(r)\) | \(M^{-1}\) |
| \(m_3\) | \(M^2\) |
| \(\delta_2\) | \(M^2\) |
| \(\Phi_0\) | \(M\) |
| \(\Phi_2\) | \(M^3\) |
| \(\Lambda\) | \(M^2\) |
| \(F'(\Phi)\) | \(M\) |
| \(H'(\Phi)\) | \(M^{-1}\) |
| \(V'(\Phi)\) | \(M^3\) |

The action itself fixes only \([\alpha H]=1\). The separate assignments \([H]=1\) and \([\alpha]=1\) define the initial canonical parameterization; dimensions may later be redistributed between \(\alpha\) and \(H\) by a declared reparameterization without changing physical content.

**Dimensional check of the derived central scalar relation.** Its terms have dimensions

\[
[\Phi_2]=M^3,\qquad [V']=M^3,
\qquad [m_3F']=M^2M=M^3,
\]
\[
[\alpha m_3(m_3-\delta_2)H']
=1\cdot M^2\cdot M^2\cdot M^{-1}=M^3.
\]

The relation is therefore dimensionally homogeneous. **Status: DERIVED.** Dimensional consistency is a check on, not the source of, the independently derived numerical coefficients and signs, and it provides no empirical confirmation or global validity.

## 10. Variational conventions

**Object type: ASSUMPTION.** The canonical formalism is metric variation with independent bulk variations

\[
\delta g^{\mu\nu},\qquad \delta\Phi.
\]

The Levi-Civita connection is determined by \(g_{\mu\nu}\) and is not independently varied. Palatini variation is excluded from this working model unless a future QFP branch explicitly introduces it.

For derivation of local bulk equations, variations are compactly supported or obey suitable vanishing boundary conditions. Total divergences must be displayed before removal, together with the boundary assumption that permits removal. This does not claim that the complete variational problem is globally well posed. Full gravitational, scalar, joint, asymptotic, horizon, and Gauss-Bonnet boundary contributions remain a separate future problem where relevant.

At least sufficient \(C^2\) regularity is required for the classical local equations. The working \(C^4\) convention applies to regular-center series, symbolic curvature calculations, and the initial numerical program. Branch-specific scalar boundary conditions remain to be supplied with each global boundary-value problem.

## 11. Exact versus schematic mathematics

The following labels are canonical presentation qualifiers. They do not replace the governance object-type and epistemic-status axes.

- **EXACT:** an equality intended without truncation or approximation within its explicitly stated domain and assumptions. Exactness does not by itself mean **DERIVED** or empirically valid.
- **SCHEMATIC:** structural content only; coefficients, terms, normalization, domain, or derivational completeness may be unresolved. It must never be used as a field equation for calculation without an explicit upgrade supported by a derivation.
- **LOCAL EXPANSION:** a series about a specified point with its order, regularity assumptions, and remainder shown; it makes no global claim.
- **ANSATZ:** the governance object type for a chosen mathematical form restricting an investigation.
- **DEFINITION:** the governance object type for a stipulated meaning or relation.
- **WORKING MODEL:** the governance object type for the provisional model currently investigated.
- **DERIVED RESULT:** a claim carrying **Status: DERIVED**, supported by an inspectable derivation from stated inputs. It must also say whether it is exact, approximate, or local.
- **CONJECTURAL RESULT:** a claim carrying **Status: CONJECTURE**, whose proof or derivation is incomplete. It must not be called a field equation without the qualifier "conjectural" or "schematic," as applicable.

Every future displayed field equation shall carry, immediately adjacent to it: (1) `Equation qualifier: EXACT`, `SCHEMATIC`, or `LOCAL EXPANSION`; (2) any applicable object type; and (3) exactly one epistemic status when it makes an important scientific claim. In particular, `SCHEMATIC` and `Status: DERIVED` are not interchangeable.

## 12. Validation hooks

| Convention or choice | Later inconsistency detector |
|---|---|
| Signature and scalar kinetic contraction | flat-space kinetic sign; Einstein limit; covariance |
| Riemann/Ricci contraction package | Schwarzschild Ricci-flat limit; de Sitter curvature signs; Bianchi identity |
| Gauss-Bonnet definition | de Sitter limit; independent curvature-invariant calculation |
| Connection and independent variables | covariance; contracted Bianchi identity; equivalence or inequivalence of formulations |
| Action normalization and dimensions | dimensional consistency; Einstein limit |
| Independence and dimensions of \(F,H\) | dimensional consistency; constant-coupling and Einstein limits |
| Areal-radius and unit-sphere convention | sphere area; Schwarzschild limit; center regularity |
| Horizon criterion | horizon regularity in nonsingular coordinates; curvature invariants |
| Center series and parity assumptions | center regularity; field-equation order-by-order residuals |
| Asymptotic class and time normalization | asymptotic behavior; conserved-charge definitions |
| Boundary terms and boundary data | well-posed first variation; on-shell boundary residuals |
| Derived local central relations | independent symbolic verification; dimensional consistency; de Sitter limit |

# DECISION REGISTER

## QFP-MATH-D001

- **Question:** Which Riemann and Ricci sign/contraction package is canonical?
- **Available choices:** the package displayed in Section 2; its overall Riemann-sign reverse with consistent contractions; another fully explicit package.
- **Consequences:** changes signs of \(R_{\mu\nu}\), \(R\), Einstein-equation formulas, de Sitter curvature relations, and intermediate scalar-coupling terms.
- **Affected QFP equations:** the action's \(F R\) term, all future metric equations, curvature limits, and checks of the derived local central relations.
- **Former recommendation:** the explicit commutator convention displayed in Section 2.
- **Adopted choice:** the commutator, component definition, Ricci contraction, Ricci scalar, and Einstein tensor displayed in Section 2.
- **Reason:** it provides an executable and internally consistent convention package.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED

## QFP-MATH-D002

- **Question:** What do lowercase Latin indices denote?
- **Available choices:** spatial coordinate indices; hypersurface indices; orthonormal-frame indices; reserved/locally declared only.
- **Consequences:** controls later 3+1, tetrad, and boundary notation.
- **Affected QFP equations:** future decompositions and boundary geometry; none of the protected equations presently.
- **Former recommendation:** reserve them until a 3+1 or frame formalism is selected.
- **Adopted choice:** \(i,j,k,\ldots=1,2,3\) only in an explicitly spatial decomposition; no ambiguous Latin-index use.
- **Reason:** fixes spatial notation while preventing collisions with frame or other index families.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED

## QFP-MATH-D003

- **Question:** What is the unit and action-normalization convention?
- **Available choices:** geometrized dimensionless-scalar convention; \(c=\hbar=1\) dimensionless-action convention; explicit SI-like constants; Planck units only if separately justified.
- **Consequences:** fixes dimensions of \(\Phi,F,H,V,\alpha\), the meaning of the scalar kinetic coefficient, and the dimensional interpretation of the derived local central scalar relation.
- **Affected QFP equations:** the full action and every field equation, especially the central scalar relation.
- **Former recommendation:** provisionally use a geometrized dimensionless-scalar alternative.
- **Adopted choice:** \(c=\hbar=1\), dimensionless action, canonical mass dimensions, explicit \(G_N\neq1\), and initial parameterization \([H]=[\alpha]=1\).
- **Reason:** this fixes the scalar's canonical four-dimensional mass dimension while keeping gravitational normalization explicit.
- **Historical status:** OPEN before 2026-08-09; the former recommendation was not adopted.
- **Status:** RESOLVED

## QFP-MATH-D004

- **Question:** What is the overall gravitational normalization, and does \(F(\Phi)\) contain the Einstein-Hilbert coefficient?
- **Available choices:** coefficient absorbed into \(F\); an explicit overall factor; another declared normalization.
- **Consequences:** fixes the Einstein limit, dimensions, effective gravitational coupling, and comparison with standard field equations.
- **Affected QFP equations:** the action, all metric equations, and Einstein/Schwarzschild/de Sitter limits.
- **Former recommendation:** keep normalization explicit in any proposed revision.
- **Adopted choice:** \(F(\Phi)\) contains the gravitational normalization, with required validation limit \(F(\Phi_0)\to(16\pi G_N)^{-1}=\bar M_{\mathrm{Pl}}^2/2\); no outside Einstein-Hilbert factor is added.
- **Reason:** it preserves the protected action and makes its Einstein/constant-scalar limit precise.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED

## QFP-MATH-D005

- **Question:** Which variables and connection are independently varied?
- **Available choices:** metric variation with Levi-Civita connection; inverse-metric variation with Levi-Civita connection; tetrad variation; metric-affine variation.
- **Consequences:** changes the variational calculus and, for an independent connection, potentially the dynamics.
- **Affected QFP equations:** every gravitational field equation and boundary term.
- **Former recommendation:** metric variation with \(g^{\mu\nu}\) and Levi-Civita connection.
- **Adopted choice:** metric formalism with independent bulk variations \(\delta g^{\mu\nu}\) and \(\delta\Phi\); the Levi-Civita connection is not independently varied.
- **Reason:** it specifies the variational formalism for the present working model; Palatini formulations require a separate future branch.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED

## QFP-MATH-D006

- **Question:** What boundary terms and boundary conditions define a well-posed variation?
- **Available choices:** compactly supported variations for local bulk equations; explicit finite-boundary completion; asymptotic completion; horizon/null-boundary completion.
- **Consequences:** determines which integrations by parts are valid and whether the variational principle and on-shell action are well posed.
- **Affected QFP equations:** action variation, boundary equations, charges, and Gauss-Bonnet sector.
- **Former recommendation:** derive local bulk equations using compactly supported variations and postpone a boundary-completed action.
- **Adopted choice:** compactly supported variations, or suitable variations vanishing at the boundary; identify every total divergence and its removal assumption; treat the full boundary action separately.
- **Reason:** it supports local bulk derivation without claiming global well-posedness.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED FOR BULK EQUATION DERIVATION

## QFP-MATH-D007

- **Question:** Which asymptotic class and time normalization are imposed?
- **Available choices:** asymptotically flat; de Sitter; anti-de Sitter; another specified falloff; separate branches.
- **Consequences:** fixes boundary conditions, allowed potentials, mass interpretation, time normalization, and global solution space.
- **Affected QFP equations:** static solutions, boundary data, conserved quantities, and limiting-case validation.
- **Former recommendation:** retain separate named asymptotic branches.
- **Adopted choice:** separate asymptotically flat, de Sitter, and anti-de Sitter branches; any other branch requires later justification.
- **Reason:** the local ansatz does not select a unique asymptotic geometry.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED AS A BRANCH-DEPENDENT CONVENTION

## QFP-MATH-D008

- **Question:** How is the residual constant time rescaling, equivalently the additive constant in \(\delta\), fixed?
- **Available choices:** \(\delta\to0\) at a flat or AdS infinity; normalization at a chosen center; normalization at another reference boundary; de Sitter static-patch convention.
- **Consequences:** changes coordinate-time normalization but not local invariant geometry.
- **Affected QFP equations:** boundary conditions for \(\delta\), surface gravity, and comparisons of time-dependent observables.
- **Former recommendation:** fix the additive constant at the selected asymptotic or reference boundary.
- **Adopted choice:** before normalization it is coordinate freedom; for asymptotically flat solutions impose \(\lim_{r\to\infty}\delta(r)=0\); define de Sitter and anti-de Sitter normalizations separately.
- **Reason:** physical time normalization is boundary-condition dependent.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED

## QFP-MATH-D009

- **Question:** What orientation and Levi-Civita-tensor sign convention are used?
- **Available choices:** choose \(dt\wedge dr\wedge d\theta\wedge d\varphi\) positive with an explicit tensor-density convention; choose the reverse; defer until needed.
- **Consequences:** affects dual tensors and oriented boundary/topological formulas, but not the current scalar definition of \(\mathcal G\).
- **Affected QFP equations:** future dual-curvature and oriented Gauss-Bonnet boundary expressions.
- **Former recommendation:** adopt the displayed coordinate orientation when oriented objects first enter.
- **Adopted choice:** \(\epsilon_{tr\theta\varphi}=+\sqrt{-g}\); every dual-tensor definition must restate it.
- **Reason:** explicit component normalization prevents density/tensor sign ambiguity.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED

## QFP-MATH-D010

- **Question:** What differentiability and scalar boundary conditions are required?
- **Available choices:** compactly supported smooth variations; Dirichlet, Neumann, or mixed scalar data; regular-horizon and asymptotic falloffs appropriate to each branch.
- **Consequences:** controls integrations by parts, admissible solutions, and whether \(F',H',V'\) and higher derivatives exist where used.
- **Affected QFP equations:** scalar variation, central expansion, horizon conditions, and asymptotic solutions.
- **Former recommendation:** require enough differentiability for each derivation and specify boundary data branch by branch.
- **Adopted choice:** at least sufficient \(C^2\) regularity for classical local equations and working \(C^4\) smoothness for center series, symbolic curvature, and the initial numerical program.
- **Reason:** the stronger working class supports the planned calculations without being asserted as a physical law; global scalar boundary data remain branch-specific.
- **Historical status:** OPEN before 2026-08-09.
- **Status:** RESOLVED AS A WORKING MATHEMATICAL REGULARITY CONVENTION

# Separate draft: metric bulk variation

Date: 2026-11-11. Review ID: `ATLAS-METRIC-REVIEW`. **Object type: WORKING MODEL.** This is a review representation of the metric bulk equations associated with the existing protected action, not a new action. **Status: DERIVED.** The derivation is conditional on the stated action/conventions and compactly supported variations. Workflow status: REVIEW DRAFT, NOT CANONICALLY PROMOTED. No canonical registry entries, protected equations or historical statuses are changed.

Domain: LOCAL | SMOOTH FOUR-DIMENSIONAL LORENTZIAN PATCH. No radial truncation is used for the covariant equation. Depends-On: `QFP-M001`, `QFP-C001`, `QFP-A001`, plus the review tensor `ATLAS-P-TENSOR`. Methods: ANALYTIC DERIVATION, SYMBOLIC COMPUTATION, DIMENSIONAL CHECK, LIMITING-CASE TEST, EXTERNAL COMPARISON. The new review IDs are document identifiers, not canonical `QFP-*` registry IDs.

## 1. Independent variables and normalization

**Object type: ASSUMPTION.** Vary \(g^{\mu\nu}\) with \(\Phi\) held fixed, keeping \((-+++)\), the repository Riemann convention and the Levi-Civita connection. Let \(f=\alpha H(\Phi)\), with constant \(\alpha\); \(\delta_g F=\delta_g f=\delta_g V=0\). These functions can still have nonzero spacetime derivatives. Variations have compact support, so displayed divergences integrate to zero. No complete finite-boundary action is constructed.

**Object type: DEFINITION.** Define the metric Euler coefficient and the minimally coupled scalar stress tensor by

\[
\delta_g S=\int\sqrt{-g}\,E_{\mu\nu}\delta g^{\mu\nu}+\hbox{boundary},\qquad
T^{(\Phi)}_{\mu\nu}=\nabla_\mu\Phi\nabla_\nu\Phi
-g_{\mu\nu}[\tfrac12(\nabla\Phi)^2+V].
\]

**Status: DERIVED.** The elementary terms give

\[
\delta\sqrt{-g}=-\tfrac12\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu},\qquad
E^{(\Phi)}_{\mu\nu}=-\tfrac12 T^{(\Phi)}_{\mu\nu},
\]
\[
E^{(FR)}_{\mu\nu}=F G_{\mu\nu}+(g_{\mu\nu}\Box-\nabla_\mu\nabla_\nu)F.
\]

For the last equality, use
\(\delta R=R_{\mu\nu}\delta g^{\mu\nu}+g_{\mu\nu}\Box\delta g^{\mu\nu}-\nabla_\mu\nabla_\nu\delta g^{\mu\nu}\), then integrate twice by parts. With the action's coefficient \(F\), the constant-coupling equation is \(FG_{\mu\nu}=T_{\mu\nu}/2\), not \(FG_{\mu\nu}=T_{\mu\nu}\). Thus \(F=1/(16\pi G_N)\) gives the expected \(G_{\mu\nu}=8\pi G_NT_{\mu\nu}\) normalization.

## 2. Explicit curvature tensor and the Gauss–Bonnet variation

**Review ID: `ATLAS-P-TENSOR`. Object type: DEFINITION.** Define algebraically, avoiding an unstated Hodge-dual sign convention,

\[
P_{abcd}=R_{abcd}+g_{ad}R_{bc}-g_{ac}R_{bd}
+g_{bc}R_{ad}-g_{bd}R_{ac}
+\tfrac R2(g_{ac}g_{bd}-g_{ad}g_{bc}).
\]

Domain: LOCAL | FOUR DIMENSIONS. Depends-On: `QFP-C001`. Validation: explicit contraction, Lovelock cancellation on a non-diagonal exact algebraic curvature sample, and constant-curvature checks. This definition fixes every index order; no assertion about an independently defined dual is needed.

**Status: DERIVED.** Its Riemann symmetries and the contracted Bianchi identity give \(\nabla^aP_{abcd}=0\). Direct differentiation of the curvature polynomial at fixed metric gives
\(\partial\mathcal G/\partial R_{abcd}=2P^{abcd}\), with the derivative respecting curvature symmetries. The undifferentiated metric variation is the Lovelock tensor

\[
L_{\mu\nu}=2(RR_{\mu\nu}-2R_{\mu\rho}R_\nu{}^\rho
-2R^{\rho\sigma}R_{\mu\rho\nu\sigma}
+R_\mu{}^{\rho\sigma\lambda}R_{\nu\rho\sigma\lambda})
-\tfrac12g_{\mu\nu}\mathcal G.
\]

**Status: DERIVED.** In exactly four dimensions \(L_{\mu\nu}\equiv0\): its equivalent generalized-Kronecker-delta expression is proportional to
\(\delta^{\mu a_1a_2a_3a_4}_{\nu b_1b_2b_3b_4}R^{b_1b_2}{}_{a_1a_2}R^{b_3b_4}{}_{a_3a_4}\), which antisymmetrizes over five indices in dimension four. The assertion is a bulk algebraic identity, not a claim that boundary or topology-dependent contributions vanish.

**Status: DERIVED.** Integrating the curvature variation twice by parts contributes
\(-4\nabla^\rho\nabla^\sigma(fP_{\mu\rho\sigma\nu})\).
Use the last-pair antisymmetry and divergence freedom, obtaining

\[
E^{(f\mathcal G)}_{\mu\nu}=fL_{\mu\nu}
+4P_{\mu\rho\nu\sigma}\nabla^\rho\nabla^\sigma f
=4P_{\mu\rho\nu\sigma}\nabla^\rho\nabla^\sigma f.
\]

The boundary structure and twice-integrated curvature variation follow the inspected general variational construction in Iyer and Wald, *Some Properties of Noether Charge and a Proposal for Dynamical Black Hole Entropy*, equations (31)–(39), [arXiv:gr-qc/9403028](https://arxiv.org/pdf/gr-qc/9403028). Index conversion here is explicitly to inverse-metric variation.

For inspectability, set \(h_{bc}=\delta g_{bc}=-g_{b\mu}g_{c\nu}\delta g^{\mu\nu}\),
\(Q^{abcd}=\tfrac F2(g^{ac}g^{bd}-g^{ad}g^{bc})+2fP^{abcd}\).
The combined curvature boundary term can be written

\[
\partial_a(\sqrt{-g}\Theta^a),\quad
\Theta^a=2Q^{abcd}\nabla_dh_{bc}-2(\nabla_dQ^{abcd})h_{bc}.
\]

Scalar variation has its separate boundary current \(-\nabla^a\Phi\,\delta\Phi\). Compact support removes these terms. Merely fixing the metric values on a finite boundary need not remove the derivatives of \(h\); that would require a separate boundary analysis.

## 3. Result and expanded sign check

**Status: DERIVED. Equation qualifier: EXACT LOCAL BULK, conditional on the protected working action.**

\[
\boxed{F G_{\mu\nu}+(g_{\mu\nu}\Box-\nabla_\mu\nabla_\nu)F
-\tfrac12T^{(\Phi)}_{\mu\nu}
+4\alpha P_{\mu\rho\nu\sigma}\nabla^\rho\nabla^\sigma H=0.}
\]

Equivalently, \(2FG_{\mu\nu}=T^{(\Phi)}_{\mu\nu}
+2(\nabla_\mu\nabla_\nu-g_{\mu\nu}\Box)F
-8P_{\mu\rho\nu\sigma}\nabla^\rho\nabla^\sigma f\).
The factors **+4** in the Euler coefficient and **−8** on the effective-stress side describe the same equation. They must not be interchanged without also moving the term and multiplying the equation.

**Status: DERIVED.** Let \(S_{\mu\nu}=\nabla_\mu\nabla_\nu f\). Expanding the final term gives

\[
4R_{\mu\rho\nu\sigma}S^{\rho\sigma}
+4R_\nu{}^\rho S_{\mu\rho}+4R_\mu{}^\rho S_{\nu\rho}
-4g_{\mu\nu}R^{\rho\sigma}S_{\rho\sigma}
-4R_{\mu\nu}\Box f+2Rg_{\mu\nu}\Box f-2RS_{\mu\nu}.
\]

Also \(\nabla_\mu\nabla_\nu f=\alpha[H'\nabla_\mu\nabla_\nu\Phi+H''\nabla_\mu\Phi\nabla_\nu\Phi]\). Neither \(H'\) nor \(H''\) is set equal to a derivative of \(F\).

## 4. Independent lapse test of the difficult coefficient

**Object type: ANSATZ.** For a sign/normalization check only, take spatially flat FLRW with an unfixed lapse,
\(ds^2=-n(t)^2dt^2+a(t)^2d\mathbf x^2\), and homogeneous \(f(t)\). This is not a QFP cosmological solution or a replacement for the static spherical research ansatz. Write \(\mathscr H=\dot a/a\) after setting \(n=1\), to avoid confusing it with the coupling \(H(\Phi)\).

**Status: DERIVED.** Per unit coordinate spatial volume,

\[
na^3\mathcal G=24\frac{\dot a^2\ddot a}{n^3}-24\frac{\dot a^3\dot n}{n^4}
=8\frac{d}{dt}\left(\frac{\dot a^3}{n^3}\right).
\]

Consequently \(L_{GB}\) differs from \(-8\dot f\dot a^3/n^3\) by \(d(8f\dot a^3/n^3)/dt\). Vary the lapse before fixing it: \(\delta g^{00}=2\delta n/n^3\), so

\[
E^{GB}_{00}=\frac{n^2}{2a^3}\frac{\delta L_{GB}}{\delta n}
=12\frac{\dot f\dot a^3}{a^3n^2}
\xrightarrow{n=1}12\mathscr H^3\dot f.
\]

At unit lapse \(P_{0i0j}=-a^2\mathscr H^2\delta_{ij}\) and \(S^{ij}=-\mathscr H\dot f\delta^{ij}/a^2\). Thus \(4P_{0i0j}S^{ij}=12\mathscr H^3\dot f\), independently fixing the sign and coefficient. The supplemental script varies both the unreduced and integrated-by-parts lapse Lagrangians and checks their equality.

**Status: DERIVED.** Including \(FR\) and the scalar gives
\(3F\mathscr H^2+3\mathscr H\dot F-\dot\Phi^2/4-V/2+12\mathscr H^3\dot f=0\).
For constant \(F=1/(2\kappa^2)\), this becomes
\(0=-3\mathscr H^2/\kappa^2+\dot\Phi^2/2+V-24\mathscr H^3\dot f\), agreeing with the inspected equation (9) for \(\gamma=1\) and action (2) in Nojiri, Odintsov and Sasaki, *Gauss-Bonnet dark energy*, [arXiv:hep-th/0504052v2](https://arxiv.org/pdf/hep-th/0504052). This comparison checks normalization and GB sign; the source's cosmological interpretations are not imported into QFP.

## 5. Consistency checks and remaining work

**Status: DERIVED.** With the canonical units, every metric term has mass dimension four: \([FG]=M^4\), \([\nabla\nabla F]=M^4\), \([T]=M^4\), and \([P\nabla\nabla f]=M^2M^2\). Every scalar-equation term instead has mass dimension three. The equations are distinct variations with distinct tensor ranks and dimensions.

**Status: DERIVED.** Constant \(f\) removes the bulk GB metric contribution; constant \(F\) removes its derivative contribution. Constant scalar does not automatically satisfy the scalar equation. A constant-curvature branch with \(R_{\mu\nu}=\Lambda g_{\mu\nu}\) and \(F_0\ne0\) must satisfy both

\[
\Lambda=V_0/(2F_0),\qquad
-V'_0+4\Lambda F'_0+\tfrac83\alpha\Lambda^2H'_0=0.
\]

These are necessary algebraic conditions under the chosen constant-field ansatz, not a proof of a global branch for arbitrary functions. In the Ricci-flat, \(V_0=0\), constant-coupling limit the metric equation reduces to vacuum Einstein. Retaining a nonzero \(H'_0\) can still obstruct a constant scalar on a geometry with spatially varying \(\mathcal G\).

**Status: DERIVED.** An algebraic trace check is
\(g^{\mu\nu}P_{\mu\rho\nu\sigma}=-G_{\rho\sigma}\), hence the GB trace is \(-4G_{\rho\sigma}S^{\rho\sigma}\). The supplemental test verifies this, the expanded tensor equality, and the four-dimensional Lovelock cancellation on an exact non-diagonal algebraic curvature sample. A finite sample does not constitute a proof for all tensors; the preceding analytic antisymmetrization and variation supply the general argument.

Fresh validation: Python 3.14.7 / SymPy 1.14.0, 2026-11-11; **8/8** tests passed in `SOFTWARE/tests/test_atlas_variation_review.py`. Exact arithmetic, no ODE/PDE solver, grid, seed, boundary-value integration or floating tolerance. The existing coordinate-center computation separately reproduced all protected invariants. See [review run record](Atlas_Mathematical_Review.md#5-reproducibility-and-limits).

Not independently completed: a second arbitrary-metric functional-variation implementation; the full covariant divergence identity as a component computer-algebra calculation; complete spherical metric equations and constraint propagation; all center metric constraints; a finite-boundary action; global solutions; stability/hyperbolicity; empirical tests. None of those missing checks is supplied by passing the scalar residual or the FLRW special-case test. Canonical promotion would require the repository's separate research-log and audit workflow.

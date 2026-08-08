# Mathematical Conventions Resolved

- **Date:** 2026-08-09
- **Question:** Which canonical conventions are required before formal QFP field-equation derivations begin?
- **Previous formulation:** Decisions QFP-MATH-D001 through QFP-MATH-D010 in `02_MATHEMATICS/Conventions_and_Notation.md` were OPEN. The document listed alternatives and nonbinding recommendations for curvature signs, index use, units, gravitational normalization, variational variables, bulk boundary assumptions, asymptotic branches, time normalization, orientation, and differentiability.
- **Proposed formulation:** Adopt the explicitly recorded resolutions for D001-D010: the stated Riemann convention; spatial-only Latin indices; \(c=\hbar=1\) with dimensionless action and explicit \(G_N\); normalization contained in \(F\); metric variation in \(g^{\mu\nu}\) and \(\Phi\); compactly supported or boundary-vanishing variations for local bulk derivations; branch-dependent asymptotics; asymptotically flat \(\delta\to0\); positive \((t,r,\theta,\varphi)\) orientation; and \(C^4\) working smoothness with at least sufficient \(C^2\) local regularity.
- **Reason for change:** Formal derivations require an unambiguous sign, dimensional, normalization, differential, and variational language.
- **Consequences:** The scalar Euler-Lagrange equation can now be derived unambiguously as a local bulk equation, provided all integrations by parts and boundary assumptions are displayed. The Einstein limit is a future validation requirement, not an established result. Global boundary-value problems still require branch-specific scalar, metric, and boundary-action data.
- **Unresolved issues:** Construction of a globally well-posed boundary action; de Sitter and anti-de Sitter time normalizations; branch-specific falloffs and scalar boundary data; whether weaker than \(C^4\) regularity suffices for later center, symbolic, or numerical work.

## Protected-formulation check

No protected action, static spherical ansatz, mass-function definition, regular-center expansion, Gauss-Bonnet central conjecture, de Sitter substitution, central scalar conjecture, or independence assumption for \(F(\Phi)\) and \(H(\Phi)\) was changed. No conjectural relation was upgraded to **DERIVED**.

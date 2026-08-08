# Scalar Euler-Lagrange Derivation

- **Date:** 2026-08-09
- **Question:** What local covariant scalar Euler-Lagrange equation follows directly from the protected QFP working action under scalar-only variation?
- **Previous formulation:** The repository contained a protected schematic conjectural central scalar relation but no canonical, inspectable covariant scalar variation from which to test it.
- **Action used:**

  \[
  S=\int d^4x\sqrt{-g}\left[
  F(\Phi)R-\frac12\nabla_\mu\Phi\nabla^\mu\Phi
  -V(\Phi)+\alpha H(\Phi)\mathcal G
  \right].
  \]

- **Conventions used:** Signature \((-+++)\); \(\Box=\nabla_\mu\nabla^\mu\); the adopted QFP curvature convention; metric formalism; scalar-only variation \(\delta\Phi\) with the metric and Levi-Civita connection fixed; compactly supported or boundary-vanishing scalar variations; \(c=\hbar=1\), dimensionless action, and canonical mass dimensions.
- **Proposed formulation:** Use the independently derived local scalar equation as the canonical covariant equation downstream of the working action and upstream of any static or regular-center reduction.
- **Result:**

  **Equation qualifier: EXACT local bulk equation within the protected working model and adopted assumptions.**

  **Status: DERIVED.**

  \[
  \Box\Phi+F'(\Phi)R-V'(\Phi)
  +\alpha H'(\Phi)\mathcal G=0.
  \]

- **Reason for change:** Formal QFP validation requires the central conjecture to be tested against an independently derived covariant equation rather than used as an input.
- **Checks passed:** All terms have mass dimension \(M^3\); constant-\(F\), constant-\(H\), minimally coupled, and constant-scalar reductions are algebraically consistent; a second covariant integration-by-parts calculation exactly reproduces the \(+\Box\Phi\) kinetic bulk sign and negative boundary flux.
- **Checks failed:** None in the scope of this local scalar-only derivation.
- **Consequences:** The scalar equation is ready for independent audit and subsequent static spherical and regular-center reduction. This derivation does not establish any metric equation, global solution, or empirical validity.
- **Unresolved questions:** Whether the conjectural central scalar relation is reproduced; the complete metric variation; the Gauss-Bonnet metric contribution; globally complete boundary terms; branch-specific boundary data; global existence, uniqueness, and stability.

## Protected-formulation check

The action, coupling independence, static spherical ansatz, mass-function definition, regular-center expansion, central Gauss-Bonnet conjecture, de Sitter substitution, and schematic central scalar conjecture were not changed. The central conjecture was not used to guide the derivation and retains **Status: CONJECTURE**.

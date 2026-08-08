"""Independent symbolic check of the QFP regular-center scalar reduction.

Run with Python and SymPy. The program constructs curvature from the coordinate
metric and the repository Riemann convention; expected center expressions are
not inserted as calculation outputs.
"""

from __future__ import annotations

import platform

import sympy as sp


def main() -> None:
    print(f"Python: {platform.python_version()}")
    print(f"SymPy: {sp.__version__}")
    print("Signature: (-,+,+,+)")
    print("Riemann: R^rho_{ sigma mu nu} = d_mu Gamma^rho_{nu sigma} - d_nu Gamma^rho_{mu sigma} + ...")

    t, r, theta, varphi = sp.symbols("t r theta varphi", real=True)
    m3, delta0, delta2, phi0, phi2 = sp.symbols(
        "m3 delta0 delta2 phi0 phi2", real=True
    )
    coordinates = (t, r, theta, varphi)
    dimension = len(coordinates)

    # These are the center series truncated only after terms capable of
    # contributing to an r^0 curvature or Box(Phi) limit.
    n_function = 1 - 2 * m3 * r**2
    delta = delta0 + delta2 * r**2
    phi = phi0 + phi2 * r**2
    metric = sp.diag(
        -sp.exp(2 * delta) * n_function,
        1 / n_function,
        r**2,
        r**2 * sp.sin(theta) ** 2,
    )
    inverse_metric = sp.simplify(metric.inv())

    gamma = [[[
        sp.simplify(
            sum(
                inverse_metric[a, d]
                * (
                    sp.diff(metric[d, c], coordinates[b])
                    + sp.diff(metric[d, b], coordinates[c])
                    - sp.diff(metric[b, c], coordinates[d])
                )
                for d in range(dimension)
            )
            / 2
        )
        for c in range(dimension)] for b in range(dimension)] for a in range(dimension)]

    # R^a_{ b c d} with exactly the convention printed above.
    riemann_up = [[[[] for _ in range(dimension)] for _ in range(dimension)] for _ in range(dimension)]
    for a in range(dimension):
        for b in range(dimension):
            for c in range(dimension):
                for d in range(dimension):
                    value = sp.diff(gamma[a][d][b], coordinates[c]) - sp.diff(
                        gamma[a][c][b], coordinates[d]
                    )
                    value += sum(
                        gamma[a][c][e] * gamma[e][d][b]
                        - gamma[a][d][e] * gamma[e][c][b]
                        for e in range(dimension)
                    )
                    riemann_up[a][b][c].append(sp.simplify(value))

    ricci = sp.MutableDenseMatrix.zeros(dimension, dimension)
    for b in range(dimension):
        for d in range(dimension):
            ricci[b, d] = sp.simplify(
                sum(riemann_up[a][b][a][d] for a in range(dimension))
            )
    scalar_r = sp.simplify(
        sum(inverse_metric[a, b] * ricci[a, b] for a in range(dimension) for b in range(dimension))
    )
    ricci_squared = sp.simplify(
        sum(
            inverse_metric[a, c] * inverse_metric[b, d] * ricci[a, b] * ricci[c, d]
            for a in range(dimension)
            for b in range(dimension)
            for c in range(dimension)
            for d in range(dimension)
        )
    )

    riemann_down = [[[[
        sp.simplify(sum(metric[a, e] * riemann_up[e][b][c][d] for e in range(dimension)))
        for d in range(dimension)] for c in range(dimension)] for b in range(dimension)] for a in range(dimension)]
    kretschmann = sp.simplify(
        sum(
            riemann_down[a][b][c][d]
            * inverse_metric[a, e]
            * inverse_metric[b, f]
            * inverse_metric[c, g]
            * inverse_metric[d, h]
            * riemann_down[e][f][g][h]
            for a in range(dimension)
            for b in range(dimension)
            for c in range(dimension)
            for d in range(dimension)
            for e in range(dimension)
            for f in range(dimension)
            for g in range(dimension)
            for h in range(dimension)
        )
    )
    gauss_bonnet = sp.simplify(scalar_r**2 - 4 * ricci_squared + kretschmann)

    sqrt_minus_g = sp.sqrt(-sp.det(metric))
    box_phi = sp.simplify(
        sum(
            sp.diff(
                sqrt_minus_g
                * inverse_metric[a, b]
                * sp.diff(phi, coordinates[b]),
                coordinates[a],
            )
            for a in range(dimension)
            for b in range(dimension)
        )
        / sqrt_minus_g
    )

    center = {
        "BoxPhi(0)": sp.simplify(sp.limit(box_phi, r, 0, dir="+")),
        "R(0)": sp.simplify(sp.limit(scalar_r, r, 0, dir="+")),
        "RicciSquared(0)": sp.simplify(sp.limit(ricci_squared, r, 0, dir="+")),
        "RiemannSquared(0)": sp.simplify(sp.limit(kretschmann, r, 0, dir="+")),
        "GaussBonnet(0)": sp.simplify(sp.limit(gauss_bonnet, r, 0, dir="+")),
    }
    for name, value in center.items():
        print(f"{name} = {sp.factor(value)}")

    cosmological_constant = sp.symbols("Lambda", real=True)
    de_sitter = {
        name: sp.factor(value.subs({delta2: 0, m3: cosmological_constant / 6}))
        for name, value in center.items()
    }
    print("de Sitter substitution delta2=0, m3=Lambda/6:")
    for name, value in de_sitter.items():
        print(f"{name} = {value}")


if __name__ == "__main__":
    main()

"""Independent, exact checks for the atlas mathematical review (not a solver).

Run: python -B SOFTWARE/tests/test_atlas_variation_review.py
Requires existing SymPy. No network, file writes, random input, or integration.
Conventions: four dimensions, (-+++), repository Riemann sign, inverse-metric
variation, compactly supported variations. See the two new review documents.
"""

import platform
import unittest

import sympy as s


class AtlasVariationReview(unittest.TestCase):
    def test_scalar_euler_lagrange_signs(self):
        t, x = s.symbols("t x", real=True)
        phi = s.Function("phi")(t, x)
        F, V, H = (s.Function(name) for name in ("F", "V", "H"))
        R, GB, alpha = s.symbols("R GB alpha", real=True)
        lagrangian = s.diff(phi, t)**2 / 2 - s.diff(phi, x)**2 / 2 - V(phi) + F(phi)*R + alpha*H(phi)*GB
        euler = s.diff(lagrangian, phi) - s.diff(s.diff(lagrangian, s.diff(phi, t)), t) - s.diff(s.diff(lagrangian, s.diff(phi, x)), x)
        expected = -s.diff(phi, t, 2) + s.diff(phi, x, 2) - s.diff(V(phi), phi) + R*s.diff(F(phi), phi) + alpha*GB*s.diff(H(phi), phi)
        self.assertEqual(s.simplify(euler - expected), 0)

    def test_center_box_keeps_unfixed_higher_coefficients(self):
        r = s.symbols("r", positive=True)
        m3, m5, d2, d4, p0, p2, p4 = s.symbols("m3 m5 d2 d4 p0 p2 p4", real=True)
        N = 1 - 2*m3*r**2 - 2*m5*r**4
        delta, phi = d2*r**2 + d4*r**4, p0 + p2*r**2 + p4*r**4
        box = N*s.diff(phi, r, 2) + (s.diff(N, r) + 2*N/r + N*s.diff(delta, r))*s.diff(phi, r)
        self.assertEqual(s.limit(box, r, 0), 6*p2)

    def test_center_invariants_from_sectional_curvatures(self):
        a, b, m3, d2 = s.symbols("a b m3 d2", real=True)
        R = 6*(a+b)
        ricci2, riemann2 = 12*(a*a+a*b+b*b), 12*(a*a+b*b)
        GB = s.expand(R*R-4*ricci2+riemann2)
        self.assertEqual(GB, 24*a*b)
        self.assertEqual(s.expand(GB.subs({a: 2*(m3-d2), b: 2*m3}) - 96*m3*(m3-d2)), 0)

    def test_flrw_lapse_variation_fixes_gauss_bonnet_sign_and_factor(self):
        t = s.symbols("t", real=True)
        a, n, f = (s.Function(name)(t) for name in ("a", "n", "f"))
        ad, nd = s.diff(a, t), s.diff(n, t)
        # Exact flat-FLRW GB density, retaining the lapse before variation.
        density = 24*ad**2*s.diff(a,t,2)/n**3 - 24*ad**3*nd/n**4
        boundary_primitive = 8*ad**3/n**3
        self.assertEqual(s.simplify(density-s.diff(boundary_primitive,t)), 0)
        original = f*density
        euler_n = s.diff(original,n)-s.diff(s.diff(original,nd),t)
        reduced = -8*s.diff(f,t)*ad**3/n**3
        self.assertEqual(s.simplify(euler_n-s.diff(reduced,n)),0)
        # delta g^{00}=2 delta n/n^3, sqrt(-g)=n*a^3.
        E00 = s.simplify(n**2*euler_n/(2*a**3))
        self.assertEqual(s.simplify(E00-12*s.diff(f,t)*(ad/a)**3/n**2),0)
        # At n=1, P_0i0j=-a^2 Hubble^2 delta_ij;
        # Hessian(f)^{ij}=-Hubble*fdot/a^2 delta^{ij}.
        hubble, fdot, coefficient = s.symbols("hubble fdot coefficient")
        candidate = coefficient*3*hubble**3*fdot
        self.assertEqual(s.solve(candidate-12*hubble**3*fdot,coefficient),[4])

    def test_fr_lapse_variation_fixes_einstein_normalization(self):
        t = s.symbols("t", real=True)
        a, n, F, phi, V = (s.Function(name)(t) for name in ("a", "n", "F", "phi", "V"))
        ad, nd = s.diff(a,t),s.diff(n,t)
        R = 6*(s.diff(a,t,2)/(a*n**2)+ad**2/(a**2*n**2)-ad*nd/(a*n**3))
        L = n*a**3*(F*R+s.diff(phi,t)**2/(2*n**2)-V)
        lapse_variation = s.diff(L,n)-s.diff(s.diff(L,nd),t)
        E00 = s.simplify((n**2*lapse_variation/(2*a**3)).subs({n:1,nd:0}))
        expected = 3*F*(ad/a)**2+3*(ad/a)*s.diff(F,t)-s.diff(phi,t)**2/4-V/2
        self.assertEqual(s.simplify(E00-expected),0)

    def test_general_algebraic_curvature_lovelock_and_P_contractions(self):
        # Exact non-diagonal algebraic curvature sample (Kulkarni-Nomizu product).
        # The sample is a check, not a proof of the all-tensor identity.
        eta = (-1,1,1,1)
        g = s.diag(*eta)
        U = s.Matrix([[2,1,3,0],[1,-1,2,4],[3,2,5,1],[0,4,1,3]])
        W = s.Matrix([[1,2,0,1],[2,3,1,-1],[0,1,-2,2],[1,-1,2,4]])
        R = lambda a,b,c,d: U[a,c]*W[b,d]+U[b,d]*W[a,c]-U[a,d]*W[b,c]-U[b,c]*W[a,d]
        ric = s.Matrix(4,4,lambda b,d:sum(eta[a]*R(a,b,a,d) for a in range(4)))
        scalar = sum(eta[a]*ric[a,a] for a in range(4))
        ric2 = sum(eta[a]*eta[b]*ric[a,b]**2 for a in range(4) for b in range(4))
        kret = sum(eta[a]*eta[b]*eta[c]*eta[d]*R(a,b,c,d)**2 for a in range(4) for b in range(4) for c in range(4) for d in range(4))
        GB = scalar**2-4*ric2+kret
        P = lambda a,b,c,d: R(a,b,c,d)+g[a,d]*ric[b,c]-g[a,c]*ric[b,d]+g[b,c]*ric[a,d]-g[b,d]*ric[a,c]+scalar*(g[a,c]*g[b,d]-g[a,d]*g[b,c])/2
        S = s.Matrix(4,4,lambda a,b:s.Symbol(f"S{min(a,b)}{max(a,b)}"))
        box = sum(eta[a]*S[a,a] for a in range(4))
        ricS = sum(eta[a]*eta[b]*ric[a,b]*S[a,b] for a in range(4) for b in range(4))
        for mu in range(4):
            for nu in range(4):
                lovelock = 2*(scalar*ric[mu,nu]-2*sum(eta[a]*ric[mu,a]*ric[nu,a] for a in range(4))-2*sum(eta[a]*eta[b]*ric[a,b]*R(mu,a,nu,b) for a in range(4) for b in range(4))+sum(eta[a]*eta[b]*eta[c]*R(mu,a,b,c)*R(nu,a,b,c) for a in range(4) for b in range(4) for c in range(4)))-g[mu,nu]*GB/2
                self.assertEqual(lovelock,0)
                self.assertEqual(sum(eta[a]*P(a,mu,a,nu) for a in range(4)),-ric[mu,nu]+g[mu,nu]*scalar/2)
                compact = 4*sum(eta[a]*eta[b]*P(mu,a,nu,b)*S[a,b] for a in range(4) for b in range(4))
                expanded = 4*sum(eta[a]*eta[b]*R(mu,a,nu,b)*S[a,b] for a in range(4) for b in range(4))+4*sum(eta[a]*(ric[a,nu]*S[mu,a]+ric[mu,a]*S[nu,a]) for a in range(4))-4*g[mu,nu]*ricS-4*ric[mu,nu]*box+2*scalar*g[mu,nu]*box-2*scalar*S[mu,nu]
                self.assertEqual(s.expand(compact-expanded),0)

    def test_reference_mass_scaling_preserves_scalar_equation(self):
        mu = s.symbols("mu", positive=True)
        m,d,p,v,Fp,Hp,alpha = s.symbols("m d p v Fp Hp alpha")
        residual = lambda m,d,p,v,Fp,Hp: 6*p-v+(24*m-12*d)*Fp+96*alpha*m*(m-d)*Hp
        physical = residual(mu**2*m,mu**2*d,mu**3*p,mu**3*v,mu*Fp,Hp/mu)
        self.assertEqual(s.expand(physical-mu**3*residual(m,d,p,v,Fp,Hp)),0)

    def test_constant_curvature_sign_branches_and_false_positive_warning(self):
        for cosmological_constant in (-s.Integer(3),s.Integer(0),s.Integer(3)):
            m3 = cosmological_constant/6
            self.assertEqual(24*m3,4*cosmological_constant)
            self.assertEqual(96*m3**2,8*cosmological_constant**2/3)
        # Matching both center invariants fixes these two leading coefficients.
        Lambda,m,d = s.symbols("Lambda m d",real=True)
        solutions = s.solve([24*m-12*d-4*Lambda,96*m*(m-d)-8*Lambda**2/3],(m,d))
        self.assertEqual(set(solutions),{(Lambda/6,0)})
        # Even the exact center coefficients do not fix higher radial orders.
        r,c4 = s.symbols("r c4",real=True)
        self.assertEqual(s.limit(s.diff(c4*r**4,r,2),r,0),0)


if __name__ == "__main__":
    print(f"Python: {platform.python_version()}; SymPy: {s.__version__}")
    print("Exact symbolic checks; no solver, random seed, grid or tolerance.")
    unittest.main(verbosity=2)

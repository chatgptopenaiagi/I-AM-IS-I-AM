# Laboratory explanatory models

Date: 2026-11-11. These are present teaching constructions, not recovered historical formulations, canonical QFP objects or physical predictions. Their stable atlas IDs are recorded in [research.json](../WEB/qfp-lab/data/research.json). The mathematical domains and the finite browser domains are distinct.

The source implementation is [atlas-math.js](../WEB/qfp-lab/js/atlas-math.js), with import/UI bounds in [atlas-state.js](../WEB/qfp-lab/js/atlas-state.js) and inspectable test assertions in [atlas.test.mjs](../WEB/qfp-lab/tests/atlas.test.mjs). Test execution is documented in the integration validation record; the existence of an assertion alone is not a passing run.

## ATLAS-BALL-PROJECTION

**Object type: WORKING MODEL.** In normalized Euclidean coordinates choose the solid unit ball

```text
B^3 = {(x,y,z) in R^3 : x^2+y^2+z^2 <= 1}.
pi(x,y,z) = (x,y).
```

Coordinates and slice height are dimensionless. If a physical radius were introduced later, it would be a separate scaling assumption.

**Status: DERIVED.** For every point of the ball, `x^2+y^2 <= 1`; therefore its image lies in the unit disk. Conversely, every point of that disk has the preimage `(x,y,0)` in the ball. Hence the image is exactly the unit disk.

**Status: DERIVED.** Fixing `z=s` instead gives `x^2+y^2 <= 1-s^2`. It is a disk of radius `sqrt(1-s^2)` for `|s|<1`, a single point for `|s|=1`, and empty for `|s|>1`. Its normalized area in the nonempty case is `pi(1-s^2)`.

The map `R^3 -> R^2` has a rectangular matrix. Writing its square as `P^2=P` is not type-correct. An endomorphism that projects within `R^3`, such as `(x,y,z)->(x,y,0)`, is a different typed map. [MIT's projection reference](https://www.ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/projections-onto-subspaces/) supplies the linear-algebra context; the ball-versus-slice calculation above is reproduced here.

Implementation: `ballSlice` and `projectXY`. The UI permits `-1.2 <= s <= 1.2` so exterior, boundary and interior cases can all be seen. Inputs must be finite. The mathematical slice formula is not an asserted physical mechanism for `C -> Sigma`.

## ATLAS-INTEGER-ACCESS

**Object type: DEFINITION.** Stipulate a state space and transition map

```text
n in Z
T: Z -> Z
T(n) = n+1.
```

Separately define a finite viewing interval

```text
W(c,w) = {n in Z : |n-c| <= w}, with integer c and nonnegative integer w.
```

The labels and window widths are integer counts, not time, energy or measures of consciousness.

**Status: DERIVED.** Changing `c` or `w` in the viewing rule does not change `T` or the stored state `n`, because neither parameter appears in the transition definition. The browser tests check that separation in the implementation.

A different logical distinction can be inspected without an ontology claim. On integer observer/address labels, let `Access(o,a)` mean `o=a`. **Status: DERIVED.** Every address has some observer who accesses it, while no single observer accesses all addresses. This explicit counterexample shows why `forall address exists observer` does not imply `exists observer forall address`.

Implementation: `successor` and `visibleIntegers`, with `cleanState` importing initial state/center in `[-1000000,1000000]` and half-width in `[2,10]`. The successor function additionally rejects values outside JavaScript safe integer arithmetic. The finite implementation does not enumerate all integers or demonstrate universal access.

## ATLAS-LOG-SCALE

**Object type: DEFINITION.** For positive lengths `l` and `l0` in the same units, define

```text
q = log10(l/l0)
l(q) = l0 * 10^q.
```

The interface labels the lengths in metres. Their ratio and `q` are dimensionless. The reference `l0` is chosen, not measured or inferred from QFP.

**Status: DERIVED.** Reflection of the logarithmic coordinate obeys

```text
l(q) l(-q) = (l0 10^q)(l0 10^-q) = l0^2.
```

This follows from the positive-real logarithm and power laws; see [NIST DLMF §4.2](https://dlmf.nist.gov/4.2). It is a selected reciprocal correspondence, not an established physical micro/macro duality.

At `q=0`, `l=l0`. This point is not zero length, zero kelvin, a vacuum, zero energy or a demonstrated ontological ground. Negative `q` still gives a positive length.

Implementation: `lengthAt` and `logAt`. The UI bounds are `-12 <= q <= 12` and `10^-9 <= l0 <= 10^9 m`; functions reject nonpositive or nonrepresentable values where applicable. Finite endpoints and continuation arrows are not reachable infinities. No filament-generation mechanism is implemented.

## Romanian orientation

Aceste trei construcții sunt exemple explicative prezente. Proiecția bilei și secțiunea ei sunt operații diferite. Fereastra de observare a numerelor întregi este separată de legea de tranziție. Reflexia logaritmică este o corespondență definită, nu o dualitate fizică demonstrată. Niciun exemplu nu este atribuit retrospectiv autorului și nici nu promovează o afirmație în registrul QFP canonic.

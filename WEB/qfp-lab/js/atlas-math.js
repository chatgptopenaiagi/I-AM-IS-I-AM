// Explanatory models, not new physical claims or canonical QFP equations.
const finite = (x) => {
  if (typeof x !== "number" || !Number.isFinite(x))
    throw new RangeError("Expected a finite number");
  return x;
};
export function ballSlice(s) {
  finite(s);
  return Math.abs(s) > 1
    ? { kind: "empty", radius: 0, area: 0 }
    : {
        kind: Math.abs(s) === 1 ? "point" : "disk",
        radius: Math.sqrt(Math.max(0, 1 - s * s)),
        area: Math.PI * Math.max(0, 1 - s * s),
      };
}
export function projectXY(point) {
  if (!Array.isArray(point) || point.length !== 3)
    throw new TypeError("Three coordinates required");
  point.forEach(finite);
  return point.slice(0, 2);
}
export function lengthAt(q, l0) {
  finite(q);
  finite(l0);
  if (l0 <= 0) throw new RangeError("Reference length must be positive");
  const result = l0 * 10 ** q;
  if (!Number.isFinite(result) || result <= 0)
    throw new RangeError("Outside representable positive lengths");
  return result;
}
export function logAt(length, l0) {
  finite(length);
  finite(l0);
  if (length <= 0 || l0 <= 0) throw new RangeError("Lengths must be positive");
  return Math.log10(length) - Math.log10(l0);
}
export function successor(n) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(n + 1))
    throw new RangeError("Outside the browser safe-integer range");
  return n + 1;
}
export function visibleIntegers(center, width) {
  if (
    !Number.isSafeInteger(center) ||
    !Number.isInteger(width) ||
    width < 1 ||
    width > 15
  )
    throw new RangeError("Invalid finite window");
  return Array.from({ length: width * 2 + 1 }, (_, i) => center - width + i);
}

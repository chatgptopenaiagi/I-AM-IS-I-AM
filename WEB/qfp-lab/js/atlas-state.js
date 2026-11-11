import { createState } from "./qfp-model.js";
export const VERSION = 1;
const object = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : {};
const bounded = (v, min, max, fallback, integer = false) => {
  const n = typeof v === "number" ? v : NaN;
  const valid = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  return integer ? Math.round(valid) : valid;
};
export function cleanState(raw = {}) {
  raw = object(raw);
  if (raw.version !== undefined && raw.version !== VERSION)
    throw new RangeError("Unsupported experiment version");
  const p = object(raw.projection),
    a = object(raw.access),
    s = object(raw.scale),
    q = object(raw.qfp);
  // Select known properties only. Imported prose and prototype keys never become DOM content.
  return {
    version: VERSION,
    language: raw.language === "ro" ? "ro" : "en",
    route: ["explore", "understand", "examine"].includes(raw.route)
      ? raw.route
      : "explore",
    module: ["qfp", "projection", "access", "scale"].includes(raw.module)
      ? raw.module
      : "qfp",
    projection: { s: bounded(p.s, -1.2, 1.2, 0.45) },
    access: {
      n: bounded(a.n, -1000000, 1000000, 0, true),
      center: bounded(a.center, -1000000, 1000000, 0, true),
      width: bounded(a.width, 2, 10, 5, true),
    },
    scale: { q: bounded(s.q, -12, 12, -3), l0: bounded(s.l0, 1e-9, 1e9, 1) },
    qfp: createState(
      Object.fromEntries(
        Object.keys(createState()).map((k) => [
          k,
          typeof q[k] === "number" ? q[k] : undefined,
        ]),
      ),
    ),
    qfpMode: ["regular", "scalar", "metric", "curvature"].includes(raw.qfpMode)
      ? raw.qfpMode
      : "regular",
  };
}
export function encodeState(state) {
  return "#atlas=" + encodeURIComponent(JSON.stringify(cleanState(state)));
}
export function decodeState(fragment) {
  if (!fragment || !fragment.startsWith("#atlas=")) return cleanState();
  if (fragment.length > 12000)
    throw new RangeError("Experiment link is too large");
  return cleanState(JSON.parse(decodeURIComponent(fragment.slice(7))));
}
export function downstream(claims, id) {
  const found = new Set(),
    queue = [id];
  while (queue.length) {
    const target = queue.shift();
    for (const item of claims)
      if (
        (item.depends_on || []).includes(target) &&
        item.id !== id &&
        !found.has(item.id)
      ) {
        found.add(item.id);
        queue.push(item.id);
      }
  }
  return [...found].sort();
}

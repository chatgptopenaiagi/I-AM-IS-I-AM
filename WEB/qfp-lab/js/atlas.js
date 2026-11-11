import { DEFAULTS, LIMITS, createDeSitterPresetState } from "./qfp-model.js";
import {
  massAtRadius,
  deltaAtRadius,
  phiAtRadius,
  NAtRadius,
  ricci0,
  gaussBonnet0,
  boxPhi0,
  scalarResidual,
  deSitterCheck,
  hasNZeroCrossing,
} from "./qfp-math.js";
import {
  ballSlice,
  lengthAt,
  successor,
  visibleIntegers,
} from "./atlas-math.js";
import {
  cleanState,
  encodeState,
  decodeState,
  downstream,
} from "./atlas-state.js";
import { ro } from "./atlas-i18n.js";

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const el = (tag, text, cls) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = String(text);
  if (cls) node.className = cls;
  return node;
};
const show = (selector, text) => {
  $(selector).textContent = text;
};
const fmt = (n) => (n === 0 ? "0" : Number(n.toPrecision(6)).toString());
let state,
  scene = null,
  data = null,
  currentClaim = null,
  notice = "";
try {
  state = decodeState(location.hash);
} catch {
  state = cleanState();
  notice = "Invalid experiment link; restored safe defaults.";
}
const tr = (en, romanian) => (state.language === "ro" ? romanian : en);
const localized = (item, key) =>
  state.language === "ro" && item[key + "_ro"] ? item[key + "_ro"] : item[key];
const english = new Map();
$$("[data-i18n]").forEach((n) => english.set(n, n.textContent));
english.set(
  $('[data-i18n="hero"]'),
  "A question of being.\nA place to explore.",
);
const ariaEnglish = new Map();
$$("[data-label]").forEach((n) =>
  ariaEnglish.set(n, n.getAttribute("aria-label")),
);
function translate() {
  document.documentElement.lang = state.language;
  for (const [n, text] of english)
    n.textContent = state.language === "ro" ? ro[n.dataset.i18n] || text : text;
  for (const [n, text] of ariaEnglish)
    n.setAttribute(
      "aria-label",
      state.language === "ro" ? ro[n.dataset.label] || text : text,
    );
  $("#language").value = state.language;
}
function publishState() {
  try {
    history.replaceState(null, "", encodeState(state));
  } catch {
    notice = tr(
      "State cannot be stored in this address. Export JSON instead.",
      "Starea nu poate fi păstrată în această adresă. Exportă JSON.",
    );
  }
}
function change(fn) {
  fn(state);
  state = cleanState(state);
  render();
  publishState();
}
function svgNode(tag, attrs = {}, text) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = String(text);
  return n;
}
function plot(id, title) {
  const n = $(id);
  n.replaceChildren(
    svgNode(
      "title",
      { id: n.getAttribute("aria-labelledby").split(" ")[0] },
      title,
    ),
  );
  return n;
}
const line = (p, x1, y1, x2, y2, attrs = {}) =>
  p.append(svgNode("line", { x1, y1, x2, y2, class: "axis", ...attrs }));
const text = (p, x, y, s, attrs = {}) =>
  p.append(svgNode("text", { x, y, ...attrs }, s));
const circle = (p, cx, cy, r, attrs = {}) =>
  p.append(svgNode("circle", { cx, cy, r, ...attrs }));
const colors = ["#e7b86e", "#9fddd1", "#c6b7ec", "#f4a18a"];
const labels = {
  m3: "m₃ / μ²",
  delta0: "δ₀",
  delta2: "δ₂ / μ²",
  Phi0: "Φ₀ / μ",
  Phi2: "Φ₂ / μ³",
  alpha: "α",
  Fp0: "F′ / μ",
  Hp0: "μ H′",
  Vp0: "V′ / μ³",
  rMax: "μ r max",
  Lambda: "Λ / μ²",
};
for (const [key, range] of Object.entries(LIMITS)) {
  const wrap = el("div", undefined, "parameter"),
    label = el("label"),
    output = el("output");
  label.htmlFor = "param-" + key;
  label.append(el("span", labels[key]), output);
  output.htmlFor = "param-" + key;
  const input = el("input");
  Object.assign(input, {
    id: "param-" + key,
    type: "range",
    min: range[0],
    max: range[1],
    step: key === "rMax" ? 0.05 : 0.01,
  });
  input.addEventListener("input", () =>
    change((s) => (s.qfp[key] = Number(input.value))),
  );
  wrap.append(label, input);
  $("#qfp-controls").append(wrap);
}
function renderQFP() {
  const p = state.qfp,
    R = ricci0(p.m3, p.delta2),
    G = gaussBonnet0(p.m3, p.delta2),
    box = boxPhi0(p.Phi2),
    residual = scalarResidual(p);
  for (const key of Object.keys(LIMITS)) {
    const input = $("#param-" + key);
    input.value = p[key];
    input.previousElementSibling.querySelector("output").value = fmt(p[key]);
  }
  $("#qfp-mode").value = state.qfpMode;
  const all = [
    { name: "μ m(r)", fn: (r) => massAtRadius(r, p.m3) },
    { name: "δ(r)", fn: (r) => deltaAtRadius(r, p.delta0, p.delta2) },
    { name: "Φ(r) / μ", fn: (r) => phiAtRadius(r, p.Phi0, p.Phi2) },
    { name: "N(r)", fn: (r) => NAtRadius(r, p.m3) },
  ];
  let selected =
    state.qfpMode === "scalar"
      ? [2]
      : state.qfpMode === "metric"
        ? [3]
        : [0, 1, 2, 3];
  if (state.qfpMode === "curvature") {
    all.splice(
      0,
      all.length,
      { name: "R(0) / μ²", fn: () => R },
      { name: "𝒢(0) / μ⁴", fn: () => G },
      { name: "□Φ(0) / μ³", fn: () => box },
    );
    selected = [0, 1, 2];
  }
  const samples = selected.map((i) =>
    Array.from({ length: 121 }, (_, j) => all[i].fn((j * p.rMax) / 120)),
  );
  let low = Math.min(0, ...samples.flat()),
    high = Math.max(0, ...samples.flat());
  if (high - low < 0.01) {
    high += 0.5;
    low -= 0.5;
  }
  const pad = (high - low) * 0.12;
  low -= pad;
  high += pad;
  const x = (r) => 60 + (600 * r) / p.rMax,
    y = (v) => 285 - ((v - low) / (high - low)) * 245;
  const svg = plot(
    "#qfp-plot",
    tr(
      "Local QFP expansion, dimensionless coefficients",
      "Dezvoltare QFP locală, coeficienți adimensionali",
    ),
  );
  for (let i = 0; i <= 4; i++) {
    const v = low + ((high - low) * i) / 4;
    line(svg, 60, y(v), 660, y(v), { class: "grid" });
    text(svg, 50, y(v) + 4, fmt(v), { "text-anchor": "end" });
    const r = (p.rMax * i) / 4;
    line(svg, x(r), 40, x(r), 285, { class: "grid" });
    text(svg, x(r), 312, fmt(r), { "text-anchor": "middle" });
  }
  line(svg, 60, y(0), 660, y(0));
  text(svg, 660, 338, "μ r", { "text-anchor": "end" });
  text(svg, 60, 22, tr("Scaled numerical values", "Valori numerice scalate"));
  selected.forEach((i, j) =>
    svg.append(
      svgNode("polyline", {
        points: samples[j]
          .map((v, k) => `${x((k * p.rMax) / 120)},${y(v)}`)
          .join(" "),
        fill: "none",
        stroke: colors[i],
        "stroke-width": 2.5,
        "stroke-dasharray": i === 1 ? "7 4" : i === 2 ? "2 4" : "none",
      }),
    ),
  );
  const legend = $("#qfp-legend");
  legend.replaceChildren();
  for (const i of selected) {
    const item = el("span"),
      swatch = el("i");
    swatch.style.background = colors[i];
    item.append(swatch, el("span", all[i].name));
    legend.append(item);
  }
  show(
    "#qfp-description",
    state.qfpMode === "curvature"
      ? tr(
          "Horizontal lines are references to values at r = 0 only. They do not compute curvature away from the center.",
          "Liniile orizontale sunt repere pentru valorile la r = 0. Nu calculează curbura în afara centrului.",
        )
      : tr(
          `r = 0 to ${fmt(p.rMax)} in reference units; N(r max) = ${fmt(NAtRadius(p.rMax, p.m3))}. Auto-scaled common numeric axis; quantities retain their separate dimensions.`,
          `r = 0 până la ${fmt(p.rMax)} în unități de referință; N(r max) = ${fmt(NAtRadius(p.rMax, p.m3))}. Axă numerică comună autoscalată; mărimile își păstrează dimensiunile distincte.`,
        ),
  );
  const quantities = [
    ["R(0) / μ²", R, "QFP-D003"],
    ["𝒢(0) / μ⁴", G, "QFP-D004"],
    ["□Φ(0) / μ³", box, "QFP-D002"],
    [tr("Scalar residual / μ³", "Reziduu scalar / μ³"), residual, "QFP-D005"],
  ];
  $("#qfp-readouts").replaceChildren(
    ...quantities.map(([name, value, id]) => {
      const card = el("div", undefined, "readout");
      card.append(el("span", name), el("output", fmt(value)), el("small", id));
      return card;
    }),
  );
  $("#qfp-equations").replaceChildren(
    ...[
      `R₀ = 24m₃ − 12δ₂ = ${fmt(R)}`,
      `𝒢₀ = 96m₃(m₃ − δ₂) = ${fmt(G)}`,
      `□Φ₀ = 6Φ₂ = ${fmt(box)}`,
      `6Φ₂ − V′ + R₀F′ + α𝒢₀H′ = ${fmt(residual)}`,
    ].map((t) => el("p", t, "equation")),
  );
  const warning = hasNZeroCrossing(p.m3, p.rMax);
  $("#qfp-warning").hidden = !warning;
  show(
    "#qfp-warning",
    tr(
      "N reaches or crosses zero in this displayed polynomial. Restrict the interval; no global horizon is established.",
      "N atinge sau traversează zero în polinomul afișat. Restrânge intervalul; nu este stabilit un orizont global.",
    ),
  );
  const check = deSitterCheck(p),
    name = p.Lambda > 0 ? "de Sitter" : p.Lambda < 0 ? "AdS-type" : "Minkowski";
  show(
    "#preset-check",
    check.pass
      ? tr(
          `${name} curvature check: PASS. R₀ = 4Λ = ${fmt(check.expected.R0)}, 𝒢₀ = 8Λ²/3 = ${fmt(check.expected.GB0)}. Mixed absolute/relative tolerance 10⁻¹⁰.`,
          `${name}: verificare curbură REUȘITĂ. R₀ = 4Λ = ${fmt(check.expected.R0)}, 𝒢₀ = 8Λ²/3 = ${fmt(check.expected.GB0)}. Toleranță mixtă absolută/relativă 10⁻¹⁰.`,
        )
      : tr(
          "Reference comparison differs. Apply the Λ preset for δ₂ = 0, m₃ = Λ/6.",
          "Comparația de referință diferă. Aplică presetarea Λ pentru δ₂ = 0, m₃ = Λ/6.",
        ),
  );
  $("#preset-check").className = check.pass ? "pass" : "";
  scene?.update(p, state.qfpMode);
}
function renderProjection() {
  const s = state.projection.s,
    b = ballSlice(s);
  $("#slice").value = s;
  $("#slice-value").value = fmt(s);
  const svg = plot(
    "#projection-plot",
    tr(
      "Projection and cross-section of the solid unit ball",
      "Proiecția și secțiunea bilei unitare solide",
    ),
  );
  for (const x of [185, 535]) {
    line(svg, x - 128, 185, x + 128, 185, { class: "grid" });
    line(svg, x, 57, x, 313, { class: "grid" });
    circle(svg, x, 185, 104, {
      fill: "none",
      stroke: "#658478",
      "stroke-dasharray": "4 5",
    });
  }
  circle(svg, 185, 185, 104, {
    fill: "#9fddd126",
    stroke: "#9fddd1",
    "stroke-width": 2,
  });
  circle(svg, 216.2, 164.2, 5, { fill: "#e7b86e" });
  text(svg, 185, 37, tr("PROJECTION", "PROIECȚIE"), {
    "text-anchor": "middle",
  });
  text(svg, 185, 329, tr("Radius = 1", "Rază = 1"), {
    "text-anchor": "middle",
  });
  if (b.kind === "disk")
    circle(svg, 535, 185, 104 * b.radius, {
      fill: "#c6b7ec33",
      stroke: "#c6b7ec",
      "stroke-width": 2,
    });
  if (b.kind === "point") circle(svg, 535, 185, 3, { fill: "#e7b86e" });
  if (b.kind === "empty")
    text(svg, 535, 190, "∅", {
      "text-anchor": "middle",
      style: "font-size:42px",
    });
  text(svg, 535, 37, tr("SLICE AT z = ", "SECȚIUNE LA z = ") + fmt(s), {
    "text-anchor": "middle",
  });
  text(
    svg,
    535,
    329,
    b.kind === "empty"
      ? tr("Empty outside |s| ≤ 1", "Vid în afara |s| ≤ 1")
      : b.kind === "point"
        ? tr("One point · zero area", "Un punct · arie nulă")
        : `ρ = ${fmt(b.radius)}`,
    { "text-anchor": "middle" },
  );
  const kind = tr(
    b.kind,
    { disk: "disc", point: "punct", empty: "mulțime vidă" }[b.kind],
  );
  show(
    "#projection-description",
    tr(
      `Projection radius = 1. Slice: ${kind}; radius ${fmt(b.radius)}, area ${fmt(b.area)}. The point marker is enlarged for visibility.`,
      `Raza proiecției = 1. Secțiune: ${kind}; rază ${fmt(b.radius)}, arie ${fmt(b.area)}. Marcajul punctului este mărit pentru vizibilitate.`,
    ),
  );
}
function renderAccess() {
  const a = state.access;
  $("#window-center").value = a.center;
  $("#window-width").value = a.width;
  show("#access-n", a.n);
  $("#advance").disabled = a.n >= 1000000;
  $("#advance").title = tr(
    "Display bound: n ≤ 1,000,000. The mathematical successor still exists.",
    "Limită de afișare: n ≤ 1.000.000. Succesorul matematic există în continuare.",
  );
  const values = visibleIntegers(a.center, a.width),
    svg = plot(
      "#access-plot",
      tr(
        "Separate model state and finite viewing window",
        "Starea modelului și fereastra finită sunt distincte",
      ),
    );
  text(svg, 360, 55, "n ∈ ℤ      T(n) = n + 1", {
    "text-anchor": "middle",
    style: "font-size:23px",
  });
  line(svg, 35, 180, 685, 180);
  text(svg, 20, 185, "←");
  text(svg, 690, 185, "→");
  const narrow = matchMedia("(max-width:760px)").matches;
  values.forEach((n, i) => {
    const x = 60 + (i * 600) / (values.length - 1),
      active = n === a.n;
    circle(svg, x, 180, active ? 10 : 4, {
      fill: active ? "#e7b86e" : "#9fddd1",
    });
    if (!narrow || active || i % (values.length > 15 ? 5 : 3) === 0)
      text(svg, x, 215, n, { "text-anchor": "middle" });
    if (active)
      text(svg, x, 150, tr("STATE", "STARE"), {
        "text-anchor": "middle",
        style: "fill:#e7b86e",
      });
  });
  const visible = values.includes(a.n);
  text(
    svg,
    360,
    280,
    visible
      ? tr("State inside window", "Stare în fereastră")
      : tr(`n = ${a.n} outside window`, `n = ${a.n} în afara ferestrei`),
    { "text-anchor": "middle" },
  );
  show(
    "#access-description",
    tr(
      `Showing ${values.length} integers [${values[0]}, ${values.at(-1)}]. State ${a.n}; unique next state ${a.n + 1}. The infinite set is defined mathematically, not stored in the browser.`,
      `Sunt afișate ${values.length} numere întregi [${values[0]}, ${values.at(-1)}]. Starea ${a.n}; unicul succesor ${a.n + 1}. Mulțimea infinită este definită matematic, nu stocată în browser.`,
    ),
  );
}
function renderScale() {
  const { q, l0 } = state.scale,
    a = lengthAt(q, l0),
    b = lengthAt(-q, l0);
  $("#scale-q").value = q;
  $("#reference-length").value = l0;
  $("#q-value").value = fmt(q);
  const svg = plot(
      "#scale-plot",
      tr("Logarithmic scale and reflection", "Scară logaritmică și reflexie"),
    ),
    x = (n) => 60 + (n + 12) * 25;
  line(svg, 40, 190, 680, 190);
  for (let n = -12; n <= 12; n += 3) {
    line(svg, x(n), 180, x(n), 200);
    text(svg, x(n), 225, n, { "text-anchor": "middle" });
  }
  text(svg, 25, 265, "q → −∞");
  text(svg, 695, 265, "q → +∞", { "text-anchor": "end" });
  line(svg, x(0), 90, x(0), 235, { "stroke-dasharray": "4 4" });
  text(svg, x(0), 65, "q = 0 · ℓ = ℓ₀", { "text-anchor": "middle" });
  circle(svg, x(q), 150, 10, { fill: "#e7b86e" });
  line(svg, x(q), 160, x(q), 190, { stroke: "#e7b86e" });
  circle(svg, x(-q), 120, 8, { fill: "#c6b7ec" });
  line(svg, x(-q), 128, x(-q), 190, { stroke: "#c6b7ec" });
  text(svg, 60, 320, `ℓ(q)`, { style: "fill:#e7b86e" });
  text(svg, 660, 320, `ℓ(−q)`, { "text-anchor": "end", style: "fill:#c6b7ec" });
  show(
    "#scale-values",
    `ℓ = ${a.toExponential(5)} m; ℓ(−q) = ${b.toExponential(5)} m; ℓ · ℓ(−q) = ${(a * b).toExponential(5)} m².`,
  );
  show(
    "#scale-description",
    tr(
      `Horizontal position represents q, not physical distance. Reference ℓ₀ = ${fmt(l0)} m. Product/reference² = ${fmt((a * b) / l0 ** 2)}: an identity of this map.`,
      `Poziția orizontală reprezintă q, nu distanța fizică. Referință ℓ₀ = ${fmt(l0)} m. Produs/referință² = ${fmt((a * b) / l0 ** 2)}: o identitate a acestei aplicații.`,
    ),
  );
}
function render() {
  translate();
  $$("[data-route]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.route === state.route)),
  );
  $$(".route").forEach((n) => (n.hidden = n.id !== "route-" + state.route));
  $$("[data-module]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.module === state.module)),
  );
  $$(".experiment").forEach(
    (n) => (n.hidden = n.id !== "module-" + state.module),
  );
  renderQFP();
  renderProjection();
  renderAccess();
  renderScale();
  if (data) {
    renderResearch();
    renderClaims();
    renderImpact();
  }
  show("#app-status", notice);
}
function download(name, obj) {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }),
    ),
    a = el("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$$("[data-route]").forEach(
  (b) => (b.onclick = () => change((s) => (s.route = b.dataset.route))),
);
$$("[data-module]").forEach(
  (b) => (b.onclick = () => change((s) => (s.module = b.dataset.module))),
);
$("#language").onchange = (e) => change((s) => (s.language = e.target.value));
$("#qfp-mode").onchange = (e) => change((s) => (s.qfpMode = e.target.value));
$("#de-sitter").onclick = () =>
  change((s) => (s.qfp = createDeSitterPresetState(s.qfp)));
$("#close-scalar").onclick = () => {
  const p = state.qfp,
    value =
      (p.Vp0 -
        ricci0(p.m3, p.delta2) * p.Fp0 -
        p.alpha * gaussBonnet0(p.m3, p.delta2) * p.Hp0) /
      6;
  if (value < LIMITS.Phi2[0] || value > LIMITS.Phi2[1]) {
    notice = tr(
      "The required Φ₂ is outside this display range; parameters were not changed.",
      "Φ₂ necesar este în afara intervalului afișat; parametrii nu au fost schimbați.",
    );
    render();
  } else change((s) => (s.qfp.Phi2 = value));
};
$("#slice").oninput = (e) =>
  change((s) => (s.projection.s = Number(e.target.value)));
for (const [id, value] of [
  ["#slice-center", 0],
  ["#slice-boundary", 1],
  ["#slice-outside", 1.2],
])
  $(id).onclick = () => change((s) => (s.projection.s = value));
$("#advance").onclick = () =>
  change((s) => (s.access.n = successor(s.access.n)));
$("#follow-state").onclick = () =>
  change((s) => (s.access.center = s.access.n));
$("#window-center").onchange = (e) =>
  change(
    (s) =>
      (s.access.center = e.target.value === "" ? NaN : Number(e.target.value)),
  );
$("#window-width").oninput = (e) =>
  change((s) => (s.access.width = Number(e.target.value)));
$("#scale-q").oninput = (e) =>
  change((s) => (s.scale.q = Number(e.target.value)));
$("#reference-length").onchange = (e) =>
  change(
    (s) => (s.scale.l0 = e.target.value === "" ? NaN : Number(e.target.value)),
  );
$("#reflect").onclick = () => change((s) => (s.scale.q = -s.scale.q));
$("#reset-all").onclick = () => {
  const fresh = cleanState();
  change((s) => {
    s[s.module === "qfp" ? "qfp" : s.module] =
      fresh[s.module === "qfp" ? "qfp" : s.module];
    if (s.module === "qfp") s.qfpMode = "regular";
  });
  notice = "";
  show("#app-status", "");
};
$("#export-state").onclick = () =>
  download("i-am-experiment-v1.json", cleanState(state));
$("#import-state").onchange = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 12000) throw new Error("too large");
    const raw = JSON.parse(await file.text());
    if (raw?.version !== 1) throw new Error("version required");
    state = cleanState(raw);
    notice = tr(
      "Experiment restored. Only known, bounded numerical state was imported.",
      "Experiment restaurat. Au fost importate doar valori numerice cunoscute și limitate.",
    );
    render();
    publishState();
  } catch {
    notice = tr(
      "Import rejected. Choose a valid version 1 experiment JSON (maximum 12 KB).",
      "Import respins. Alege un JSON de experiment valid, versiunea 1 (maximum 12 KB).",
    );
    render();
  } finally {
    e.target.value = "";
  }
};
$("#share").onclick = async () => {
  try {
    if (!["http:", "https:"].includes(location.protocol)) throw new Error();
    publishState();
    await navigator.clipboard.writeText(
      location.origin + location.pathname + encodeState(state),
    );
    notice =
      location.hostname === "127.0.0.1" || location.hostname === "localhost"
        ? tr(
            "Local link copied. Other people need a hosted copy; export JSON to transfer this state.",
            "Link local copiat. Alte persoane au nevoie de o versiune găzduită; exportă JSON pentru transfer.",
          )
        : tr(
            "Public experiment link copied.",
            "Linkul public al experimentului a fost copiat.",
          );
  } catch {
    notice = tr(
      "Clipboard unavailable. Copy the address bar on a hosted copy, or export JSON.",
      "Clipboard indisponibil. Copiază adresa unei versiuni găzduite sau exportă JSON.",
    );
  }
  show("#app-status", notice);
};
$(".skip").onclick = (e) => {
  e.preventDefault();
  $("#main").tabIndex = -1;
  $("#main").focus();
};
window.addEventListener("hashchange", () => {
  if (!location.hash.startsWith("#atlas=")) return;
  try {
    state = decodeState(location.hash);
    notice = "";
    render();
  } catch {
    notice = tr(
      "Malformed experiment link ignored.",
      "Link de experiment incorect ignorat.",
    );
    show("#app-status", notice);
  }
});
$("#load-3d").onclick = async () => {
  const button = $("#load-3d");
  button.disabled = true;
  try {
    const { createScene } = await import("./qfp-scene.js");
    $("#optional-3d").dataset.loaded = "true";
    scene = createScene($("#atlas-scene"));
    scene.update(state.qfp, state.qfpMode);
    show(
      "#webgl-status",
      tr(
        "Local WebGL ready. Drag to orbit; scroll to zoom. The graph above is the keyboard-accessible equivalent.",
        "WebGL local pregătit. Trage pentru orbită; derulează pentru zoom. Graficul de mai sus este echivalentul accesibil prin tastatură.",
      ),
    );
  } catch {
    show(
      "#webgl-status",
      tr(
        "3D unavailable. All calculations and the static graph remain operational.",
        "3D indisponibil. Toate calculele și graficul static rămân funcționale.",
      ),
    );
  }
};

function safeLink(source) {
  const url =
    source.url ||
    (source.path
      ? `https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/blob/e753c6d5b0c28066bb12a3e2f0c2d4f86a16c751/${source.path}`
      : null);
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}
function sourceReference(id) {
  const source = data.sources.find((s) => s.id === id),
    link = source && safeLink(source);
  const item = el("span");
  if (!source) {
    item.textContent = id;
    return item;
  }
  if (link) {
    const a = el("a", source.title);
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener";
    item.append(a);
  } else item.append(el("span", source.title));
  return item;
}
function claimButton(id) {
  const b = el("button", id);
  b.onclick = () => openClaim(id);
  return b;
}
function renderResearch() {
  for (const b of data.branches) {
    const option = $("#branch-filter").querySelector(`option[value="${b.id}"]`);
    if (option) option.textContent = localized(b, "title");
  }
  for (const c of data.claims) {
    const option = $("#impact-select").querySelector(`option[value="${c.id}"]`);
    if (option) option.textContent = `${c.id} · ${localized(c, "title")}`;
  }
  $("#branch-cards").replaceChildren(
    ...data.branches.map((b, i) => {
      const card = el("button", undefined, "branch-card");
      card.append(
        el("span", "0" + (i + 1), "number"),
        el("h3", localized(b, "title")),
        el(
          "p",
          localized(b, "summary") ||
            tr(
              "Open this branch’s records →",
              "Deschide fișele acestei ramuri →",
            ),
        ),
      );
      card.onclick = () => {
        change((s) => (s.route = "examine"));
        $("#branch-filter").value = b.id;
        renderClaims();
      };
      return card;
    }),
  );
  renderTimeline();
  $("#glossary").replaceChildren();
  for (const g of data.glossary) {
    $("#glossary").append(
      el("dt", localized(g, "term")),
      el("dd", localized(g, "definition")),
    );
  }
  const questions = data.metadata.open_questions || [
    "How can a static continuum coexist with generative language?",
    "When does projection mean a map, and when is a slice intended?",
    "Can a timeless account also assign a physical speed to folding?",
    "What distinguishes ontological totality from a set-theoretic domain?",
    "Does access by some observer at each address imply access by one observer everywhere?",
  ];
  const questionsRo = data.metadata.open_questions_ro || [
    "Cum coexistă un continuu static cu un limbaj generativ?",
    "Când proiecția înseamnă o aplicație și când este vorba despre o secțiune?",
    "Poate o descriere atemporală să atribuie o viteză fizică plierii?",
    "Ce distinge totalitatea ontologică de un domeniu al teoriei mulțimilor?",
    "Accesul unui observator la fiecare adresă implică accesul unui singur observator pretutindeni?",
  ];
  $("#open-questions").replaceChildren(
    ...(data.questions?.length
      ? data.questions.map((q) => localized(q, "text"))
      : state.language === "ro"
        ? questionsRo
        : questions
    ).map((q) => el("li", typeof q === "string" ? q : q.question)),
  );
  const c = data.corpus;
  $("#corpus-summary").replaceChildren(
    el(
      "p",
      tr(
        `${c.saved_documents_inspected} saved candidate documents inspected; ${c.recovered_conversation_count} complete conversations and ${c.recovered_message_count} original message records recovered. Document metadata is not conversation chronology.`,
        `${c.saved_documents_inspected} documente candidate salvate examinate; ${c.recovered_conversation_count} conversații complete și ${c.recovered_message_count} înregistrări originale de mesaje recuperate. Metadatele documentelor nu reprezintă cronologia conversațiilor.`,
      ),
    ),
    el(
      "p",
      tr(
        "Known generating models: none established. Original conversation identifiers and message dates remain unknown. The complete archive and named preview were not found in bounded searches.",
        "Modele generatoare cunoscute: niciunul stabilit. Identificatorii conversațiilor și datele mesajelor rămân necunoscute. Arhiva completă și prototipul numit nu au fost găsite în căutările limitate.",
      ),
    ),
  );
}
function renderTimeline() {
  const since =
    $("#timeline-window").value === "2" ? "2024-11-11" : "2023-11-11";
  const items = data.timeline
    .filter(
      (t) => t.date && t.date >= since && t.date.slice(0, 10) <= "2026-11-11",
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  $("#timeline-list").replaceChildren(
    ...items.map((t) => {
      const li = el("li"),
        when = el("div"),
        body = el("div");
      when.append(el("time", t.date), el("small", t.date_basis));
      body.append(
        el("h4", localized(t, "title")),
        el("p", localized(t, "summary")),
      );
      for (const id of t.source_ids) body.append(sourceReference(id), el("br"));
      li.append(when, body);
      return li;
    }),
  );
}
$("#timeline-window").onchange = renderTimeline;
function populateFilters() {
  for (const b of data.branches) {
    const o = el("option", localized(b, "title"));
    o.value = b.id;
    $("#branch-filter").append(o);
  }
  for (const v of [
    ...new Set(
      data.claims
        .flatMap((c) => [c.object_type, c.epistemic_status])
        .filter(Boolean),
    ),
  ].sort()) {
    const o = el("option", v);
    o.value = v;
    $("#status-filter").append(o);
  }
  for (const v of [...new Set(data.sources.map((s) => s.type))].sort()) {
    const o = el("option", v);
    o.value = v;
    $("#source-filter").append(o);
  }
  for (const c of data.claims) {
    const o = el("option", `${c.id} · ${c.title}`);
    o.value = c.id;
    $("#impact-select").append(o);
  }
  $("#impact-select").value = "QFP-A003";
}
function renderClaims() {
  const q = $("#claim-search").value.toLocaleLowerCase(),
    branch = $("#branch-filter").value,
    status = $("#status-filter").value,
    source = $("#source-filter").value,
    date = $("#date-filter").value;
  const claims = data.claims.filter(
    (c) =>
      (!q ||
        `${c.id} ${c.title} ${c.title_ro || ""} ${c.statement} ${c.statement_ro || ""}`
          .toLocaleLowerCase()
          .includes(q)) &&
      (!branch || c.branch === branch) &&
      (!status || c.object_type === status || c.epistemic_status === status) &&
      (!source ||
        c.source_ids.some(
          (id) => data.sources.find((s) => s.id === id)?.type === source,
        )) &&
      (!date || (c.source_date && c.source_date >= date)),
  );
  show(
    "#claim-count",
    tr(
      `${claims.length} public records. Filter dates refer to source dates, not idea inception.`,
      `${claims.length} fișe publice. Filtrul de dată se referă la sursă, nu la apariția ideii.`,
    ),
  );
  $("#claim-list").replaceChildren(
    ...claims.map((c) => {
      const card = el("button", undefined, "claim-card");
      card.append(
        el("span", c.id, "claim-code"),
        el("h3", localized(c, "title")),
        el("p", localized(c, "statement")),
        el(
          "span",
          [c.object_type, c.epistemic_status].filter(Boolean).join(" · ") ||
            c.label,
          "badge",
        ),
      );
      card.onclick = () => openClaim(c.id);
      return card;
    }),
  );
  if (!claims.length)
    $("#claim-list").append(
      el(
        "p",
        tr(
          "No matching records. Try fewer filters.",
          "Nicio fișă găsită. Încearcă mai puține filtre.",
        ),
      ),
    );
}
for (const id of [
  "claim-search",
  "branch-filter",
  "status-filter",
  "source-filter",
  "date-filter",
])
  $("#" + id).addEventListener(
    id === "claim-search" ? "input" : "change",
    renderClaims,
  );
function renderImpact() {
  const id = $("#impact-select").value,
    affected = downstream(data.claims, id);
  $("#impact-results").replaceChildren(
    el(
      "p",
      tr(
        `${affected.length} downstream records require re-audit if ${id} changes.`,
        `${affected.length} fișe dependente necesită un nou audit dacă ${id} se schimbă.`,
      ),
    ),
  );
  const pills = el("div", undefined, "impact-pills");
  pills.append(...affected.map(claimButton));
  $("#impact-results").append(pills);
  $("#dependency-edges").replaceChildren(
    ...data.edges.map((edge) => {
      const row = el(
        "div",
        undefined,
        "edge-row" +
          (affected.includes(edge.to) && [id, ...affected].includes(edge.from)
            ? " affected"
            : ""),
      );
      row.append(
        claimButton(edge.from),
        el(
          "span",
          `— ${edge.relation_type || edge.type} (${edge.type}) →`,
          "edge-type",
        ),
        claimButton(edge.to),
      );
      return row;
    }),
  );
}
$("#impact-select").onchange = renderImpact;
function detailSection(root, title, value) {
  root.append(el("h3", title));
  if (Array.isArray(value)) {
    if (!value.length) {
      root.append(el("p", tr("None recorded.", "Niciuna înregistrată.")));
      return;
    }
    const ul = el("ul");
    ul.append(
      ...value.map((v) => {
        const li = el("li");
        if (v && typeof v === "object" && (v.path || v.url)) {
          const url = safeLink(v);
          li.append(el("span", (v.kind || "") + " "));
          if (url) {
            const a = el("a", v.path || v.url);
            a.href = url;
            li.append(a);
          } else li.append(el("span", v.path || v.url));
        } else li.textContent = typeof v === "string" ? v : JSON.stringify(v);
        return li;
      }),
    );
    root.append(ul);
  } else
    root.append(
      el(
        "p",
        value === null || value === undefined || value === ""
          ? tr("Not recorded.", "Neînregistrat.")
          : typeof value === "object"
            ? JSON.stringify(value)
            : value,
      ),
    );
}
function openClaim(id) {
  if (!data) return;
  const c = data.claims.find((c) => c.id === id);
  if (!c) return;
  currentClaim = c;
  show("#claim-id", c.id);
  show("#claim-title", localized(c, "title"));
  const root = $("#claim-detail");
  root.replaceChildren();
  const meta = el("div", undefined, "detail-meta");
  for (const text of [c.object_type, c.epistemic_status, ...c.domain].filter(
    Boolean,
  ))
    meta.append(el("span", text, "badge"));
  root.append(meta, el("p", localized(c, "statement")));
  root.append(
    el(
      "h3",
      tr(
        "Original wording · unchanged source language",
        "Formulare originală · limba sursei, neschimbată",
      ),
    ),
  );
  root.append(
    c.original_wording
      ? el("blockquote", c.original_wording)
      : el(
          "p",
          tr(
            "No verbatim passage is included in this record. See the attributed summary and source limitations.",
            "Această fișă nu include un pasaj textual original. Consultă rezumatul atribuit și limitele sursei.",
          ),
        ),
  );
  detailSection(
    root,
    tr(
      "Editorial paraphrase / attribution",
      "Parafrază editorială / atribuire",
    ),
    typeof c.editorial_paraphrase === "string"
      ? localized(c, "editorial_paraphrase")
      : c.editorial_paraphrase
        ? localized(c, "statement")
        : tr(
            "Source expression reproduced; no separate paraphrase recorded.",
            "Expresia sursei este reprodusă; nu este înregistrată o parafrază separată.",
          ),
  );
  detailSection(
    root,
    tr("Speaker and date basis", "Vorbitor și baza datării"),
    `${c.speaker} · ${c.source_date || "UNKNOWN"} · ${c.date_basis}`,
  );
  for (const [label, key] of [
    [tr("Definitions", "Definiții"), "definitions"],
    [tr("Assumptions", "Ipoteze"), "assumptions"],
    [tr("Equations", "Ecuații"), "equations"],
    [tr("Units", "Unități"), "units"],
    [tr("Evidence / computation", "Dovezi / calcul"), "evidence"],
    [tr("Validation metadata", "Metadate de validare"), "validation"],
    [tr("Limitations", "Limitări"), "limitations"],
  ])
    detailSection(root, label, c[key]);
  if (c.units_note)
    detailSection(
      root,
      tr("Unit interpretation", "Interpretarea unităților"),
      `${c.units_status}: ${c.units_note}`,
    );
  if (c.bounds)
    detailSection(
      root,
      tr("Display / model bounds", "Limite de afișare / model"),
      c.bounds,
    );
  if (c.presentation_qualifier)
    detailSection(
      root,
      tr("Presentation qualifier", "Calificator de prezentare"),
      c.presentation_qualifier,
    );
  if (c.physical_validation) {
    const v = c.physical_validation;
    detailSection(
      root,
      tr("Physical test program", "Program de testare fizică"),
      `${v.status}: ${v.note || ""}`,
    );
    for (const [key, en, romanian] of [
      ["prediction", "Observable prediction", "Predicție observabilă"],
      ["comparison", "Comparison model", "Model de comparație"],
      ["protocol", "Test protocol", "Protocol de testare"],
      ["uncertainty", "Uncertainty", "Incertitudine"],
      [
        "failure_criterion",
        "Possible failure result",
        "Rezultat posibil de infirmare",
      ],
    ])
      detailSection(
        root,
        tr(en, romanian),
        v[key] ?? tr("Not formulated.", "Neformulat."),
      );
  }
  root.append(
    el("h3", tr("Dependencies", "Dependențe")),
    ...c.depends_on.map(claimButton),
  );
  if (!c.depends_on.length)
    root.append(
      el(
        "p",
        tr(
          "No formal dependencies registered.",
          "Nu sunt înregistrate dependențe formale.",
        ),
      ),
    );
  for (const key of [
    "observable_prediction",
    "comparison_model",
    "test_protocol",
    "uncertainty",
    "failure_result",
    "empirical_prediction",
  ])
    if (c[key] !== undefined)
      detailSection(root, key.replaceAll("_", " "), c[key]);
  root.append(el("h3", tr("Sources", "Surse")));
  for (const id of c.source_ids) root.append(sourceReference(id), el("br"));
  detailSection(root, tr("Revision", "Revizie"), c.revision);
  if (!$("#claim-dialog").open) $("#claim-dialog").showModal();
  $("#claim-dialog").scrollTop = 0;
  $("#claim-title").tabIndex = -1;
  $("#claim-title").focus({ preventScroll: true });
}
$$("[data-claim]").forEach(
  (b) => (b.onclick = () => openClaim(b.dataset.claim)),
);
$("#close-claim").onclick = () => $("#claim-dialog").close();
$("#export-claim").onclick = () =>
  currentClaim &&
  download(`${currentClaim.id}.json`, {
    schema_version: data.schema_version,
    claim: currentClaim,
    sources: data.sources.filter((s) => currentClaim.source_ids.includes(s.id)),
  });
function renderSources() {
  const root = $("#source-list");
  root.replaceChildren(
    ...data.sources.map((s) => {
      const item = el("article", undefined, "source-item");
      item.append(
        el("code", s.id),
        el("br"),
        sourceReference(s.id),
        el(
          "small",
          `${s.type} · ${s.date || "UNKNOWN"} · ${s.date_basis || ""}`,
        ),
      );
      if (s.limitations)
        item.append(
          el(
            "p",
            Array.isArray(s.limitations)
              ? s.limitations.join(" ")
              : s.limitations,
          ),
        );
      return item;
    }),
  );
}
render();
try {
  const response = await fetch("./data/research.json");
  if (!response.ok) throw new Error("data unavailable");
  data = await response.json();
  if (
    data.schema_version !== "1.0" ||
    !Array.isArray(data.claims) ||
    !Array.isArray(data.sources)
  )
    throw new Error("invalid schema");
  populateFilters();
  renderSources();
  render();
} catch {
  notice = tr(
    "Source explorer could not load. Local experiments still work; use the repository for provenance.",
    "Exploratorul de surse nu s-a încărcat. Experimentele locale funcționează; consultă depozitul pentru proveniență.",
  );
  show("#app-status", notice);
}

$("#import-button").onclick = () => $("#import-state").click();
for (const [module, id] of [
  ["projection", "ATLAS-BALL-PROJECTION"],
  ["access", "ATLAS-INTEGER-ACCESS"],
  ["scale", "ATLAS-LOG-SCALE"],
]) {
  const strip = el("div", undefined, "source-strip");
  strip.append(claimButton(id));
  $("#module-" + module).append(strip);
}

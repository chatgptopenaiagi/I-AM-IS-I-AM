import { makeResearchModel, getResearchObject } from "./research-interface.js";
import {
  readBoundedJSON,
  checkExplanation,
  checkWolfram,
} from "./triad-responses.js";
import { listExperiments, runExperiment } from "./research-experiments.js";
import {
  TOPICS,
  cleanTriadState,
  encodeTriadState,
  decodeTriadState,
  importExperiment,
  topicFor,
  gatewayURL,
} from "./triad-state.js";
import { RO, TOPIC_LABELS, QUESTIONS, BASIS } from "./triad-i18n.js";
import { NAtRadius, phiAtRadius } from "./qfp-math.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const text = (s, v) => {
  const e = typeof s === "string" ? $(s) : s;
  e.textContent = v ?? "";
  return e;
};
function el(tag, value, cls) {
  const e = document.createElement(tag);
  if (value !== undefined) e.textContent = value;
  if (cls) e.className = cls;
  return e;
}
const english = new Map($$("[data-t]").map((e) => [e, e.textContent.trim()]));
english.set($("[data-t=hero]"), "Follow one idea.\nSee three perspectives.");
const tools = [
  "research_list_concepts",
  "research_get_claim",
  "research_get_equations",
  "research_get_sources",
  "research_get_dependencies",
  "research_get_validation",
  "research_run_experiment",
  "research_compare_models",
  "research_export_experiment",
];
let model,
  state,
  experiments,
  result = null,
  connected = null,
  generation = 0,
  connectionGeneration = 0,
  answerGeneration = 0;
const tr = (en, ro) => (state?.language === "ro" ? ro : en);
const fmt = (n) =>
  typeof n === "number"
    ? Number.isInteger(n) && Math.abs(n) < 1e6
      ? String(n)
      : Number(n.toPrecision(6)).toString()
    : String(n);
const title = (o) =>
  state.language === "ro" ? o.title_ro || o.title : o.title;
function notice(en, ro = en) {
  text("#triad-status", tr(en, ro));
}
function download(name, value) {
  const a = el("a");
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function setState(next) {
  state = cleanTriadState(next, model);
  generation++;
  history.replaceState(null, "", encodeTriadState(state, model));
  text("#agent-answer", "");
  $("#disclosure-consent").checked = false;
  render();
}
function selectClaim(id) {
  const topic = TOPICS[state.topic].includes(id) ? state.topic : topicFor(id);
  if (topic)
    setState({ version: 1, language: state.language, topic, claim_id: id });
}
function badge(selector, prefix, status) {
  const known = [
    "AVAILABLE",
    "UNAVAILABLE",
    "NOT CONFIGURED",
    "ERROR",
    "DETECTED_NOT_VERIFIED",
    "CONFIGURED_UNTESTED",
  ];
  status = known.includes(status) ? status : "ERROR";
  const labels = {
    AVAILABLE: "DISPONIBIL",
    UNAVAILABLE: "INDISPONIBIL",
    "NOT CONFIGURED": "NECONFIGURAT",
    ERROR: "EROARE",
    DETECTED_NOT_VERIFIED: "DETECTAT · NEVERIFICAT",
    CONFIGURED_UNTESTED: "CONFIGURAT · NETESTAT",
  };
  const e = text(
    selector,
    prefix +
      " · " +
      (state.language === "ro" ? labels[status] : status.replaceAll("_", " ")),
  );
  e.className =
    "cap" +
    (status === "AVAILABLE"
      ? " available"
      : status === "ERROR"
        ? " error"
        : "");
}
function capabilities() {
  badge(
    "#wolfram-status",
    "Wolfram",
    connected?.capabilities?.wolfram?.status || "NOT CONFIGURED",
  );
  badge(
    "#microsoft-status",
    "Microsoft AI",
    connected?.capabilities?.microsoft?.provider_status ===
      "CONFIGURED_UNTESTED"
      ? "CONFIGURED_UNTESTED"
      : connected?.capabilities?.microsoft?.status || "NOT CONFIGURED",
  );
  badge(
    "#mcp-status",
    "MCP",
    connected?.capabilities?.mcp?.status || "NOT CONFIGURED",
  );
  $("#run-wolfram").disabled =
    !result ||
    !["AVAILABLE", "DETECTED_NOT_VERIFIED"].includes(
      connected?.capabilities?.wolfram?.status,
    );
  $("#ask-agent").disabled =
    connected?.capabilities?.microsoft?.status !== "AVAILABLE" ||
    !$("#disclosure-consent").checked ||
    !$("#research-question").value.trim();
}
function translate() {
  document.documentElement.lang = state.language;
  for (const [e, en] of english)
    text(e, state.language === "ro" ? RO[e.dataset.t] || en : en);
  $("#triad-language").value = state.language;
  $("#research-question").placeholder = tr(
    "Which premises support this claim?",
    "Ce premise susțin această afirmație?",
  );
}
function list(container, values) {
  container.replaceChildren(...values.map((v) => el("li", v)));
}
function sourceLink(s) {
  try {
    const u = new URL(
      s.url ||
        `https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/blob/8c9308c7bedca16d1c2818bfc1b512b9d16d571d/${s.path || ""}`,
    );
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}
function render() {
  translate();
  const object = getResearchObject(model, state.claim_id);
  const exp = experiments.find((e) => e.claim_id === state.claim_id);
  $("#topic-tabs").replaceChildren(
    ...Object.entries(TOPIC_LABELS[state.language]).map(([key, label]) => {
      const b = el("button", label);
      b.dataset.topic = key;
      b.setAttribute("aria-pressed", String(state.topic === key));
      b.onclick = () =>
        setState({ version: 1, language: state.language, topic: key });
      return b;
    }),
  );
  $("#triad-object").replaceChildren(
    ...TOPICS[state.topic]
      .filter((id) => getResearchObject(model, id))
      .map((id) => {
        const o = el("option", title(getResearchObject(model, id)));
        o.value = id;
        return o;
      }),
  );
  $("#triad-object").value = state.claim_id;
  text("#selected-id", state.claim_id);
  text(
    "#selected-classification",
    [object.object_type, object.epistemic_status].filter(Boolean).join(" · "),
  );
  text("#selected-title", title(object));
  text(
    "#selected-summary",
    state.language === "ro"
      ? object.paraphrase_ro || object.statement_ro || object.statement
      : object.statement,
  );
  $$(".context-id").forEach((e) => text(e, state.claim_id));
  $("#experiment-controls").replaceChildren();
  $("#experiment-controls").className = "parameter-grid";
  if (exp) {
    const labels =
      exp.experiment_id === "qfp-local"
        ? {
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
          }
        : { l0: "ℓ₀ / m" };
    for (const [key, spec] of Object.entries(exp.parameters.properties)) {
      const label = el("label", labels[key] || key);
      const input = el("input");
      input.type = "number";
      input.name = key;
      input.id = "triad-param-" + key;
      input.min = spec.minimum;
      input.max = spec.maximum;
      input.step = spec.type === "integer" ? "1" : "any";
      input.value = state.parameters[key];
      input.setAttribute("aria-label", labels[key] || key);
      input.onchange = () => parameter(key, input.value, spec);
      label.append(
        input,
        el("small", `${spec.minimum} ≤ ${key} ≤ ${spec.maximum}`),
      );
      $("#experiment-controls").append(label);
    }
    if (["ball-projection", "log-scale"].includes(exp.experiment_id)) {
      const key = exp.experiment_id === "ball-projection" ? "s" : "q",
        spec = exp.parameters.properties[key],
        label = el("label", tr("Move " + key, "Modifică " + key)),
        range = el("input");
      range.id = "triad-slider";
      range.type = "range";
      range.min = spec.minimum;
      range.max = spec.maximum;
      range.step = key === "s" ? ".01" : ".1";
      range.value = state.parameters[key];
      range.setAttribute("aria-label", tr("Adjust " + key, "Ajustează " + key));
      range.oninput = () => parameter(key, range.value, spec, true);
      label.append(range);
      $("#experiment-controls").append(label);
    }
    result = runExperiment(model, {
      claim_id: state.claim_id,
      experiment_id: exp.experiment_id,
      parameters: state.parameters,
    });
  } else result = null;
  $("#experiment-actions").hidden = !result;
  $("#triad-export").disabled = !result;
  const oldPreset = $("#triad-de-sitter");
  if (oldPreset) oldPreset.remove();
  if (exp?.experiment_id === "qfp-local") {
    const b = el(
      "button",
      tr(
        "de Sitter / constant-curvature preset",
        "Presetare de Sitter / curbură constantă",
      ),
    );
    b.id = "triad-de-sitter";
    b.onclick = () =>
      setState({
        ...state,
        parameters: {
          ...state.parameters,
          delta2: 0,
          m3: state.parameters.Lambda / 6,
        },
      });
    $("#experiment-actions").append(b);
  }
  text(
    "#experiment-record",
    result
      ? JSON.stringify(result, null, 2)
      : tr(
          "No numerical implementation is associated with this object. No computation was performed.",
          "Acest obiect nu are o implementare numerică asociată. Nu a fost efectuat un calcul.",
        ),
  );
  text(
    "#computation-notice",
    result
      ? tr(
          "Executed now in JavaScript. A Wolfram comparison has not been run for these parameters.",
          "Calcul executat acum în JavaScript. Comparația Wolfram nu a fost rulată pentru acești parametri.",
        )
      : tr(
          "No executable experiment is attached to this record; no numerical result is claimed.",
          "Fișa nu are un experiment executabil asociat; nu se revendică un rezultat numeric.",
        ),
  );
  renderPlot(exp);
  renderReadouts();
  $("#math-equations").replaceChildren(
    el(
      "p",
      tr(
        "Equations and assumptions from the curated research record:",
        "Ecuații și ipoteze din fișa de cercetare curatoriată:",
      ),
    ),
    ...(object.equations || []).map((e) =>
      el("pre", typeof e === "string" ? e : JSON.stringify(e)),
    ),
    ...(object.assumptions || []).map((a) => el("p", a)),
    el("p", tr("Units: ", "Unități: ") + JSON.stringify(object.units || {})),
    el(
      "p",
      (object.editorial_paraphrase
        ? tr("Editorial paraphrase. ", "Parafrază editorială. ")
        : "") +
        [object.speaker, object.source_date, object.date_basis]
          .filter(Boolean)
          .join(" · "),
    ),
    ...(object.original_wording
      ? [el("blockquote", object.original_wording)]
      : []),
  );
  const guide = $("#guide-question").value || "establish";
  $("#guide-question").replaceChildren(
    ...Object.entries(QUESTIONS[state.language]).map(([v, t]) => {
      const o = el("option", t);
      o.value = v;
      return o;
    }),
  );
  $("#guide-question").value = guide;
  renderGuide();
  list($("#basis-guide"), BASIS[state.language]);
  renderDisclosure();
  $("#triad-sources").replaceChildren(
    ...object.source_ids.map((id) => {
      const s = model.sources.find((x) => x.id === id),
        d = el("div", undefined, "source-card");
      d.append(el("small", id));
      const href = sourceLink(s);
      const a = el(href ? "a" : "span", s.title || s.name || id);
      if (href) {
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      d.append(
        a,
        el("small", [s.date, s.type || s.kind].filter(Boolean).join(" · ")),
      );
      return d;
    }),
  );
  $("#triad-dependencies").replaceChildren();
  if (!object.depends_on.length)
    $("#triad-dependencies").append(
      el(
        "p",
        tr(
          "No formal dependency is registered. This is not proof that the object needs no assumptions.",
          "Nu este înregistrată o dependență formală. Aceasta nu dovedește lipsa ipotezelor.",
        ),
      ),
    );
  for (const id of object.depends_on) {
    const b = el("button", id, "dependency-chip");
    b.title = title(getResearchObject(model, id));
    b.onclick = () => selectClaim(id);
    $("#triad-dependencies").append(b);
  }
  list($("#triad-limitations"), object.limitations);
  text("#object-record", JSON.stringify(object, null, 2));
  list($("#tool-list"), tools);
  const chosen = $("#tool-select").value;
  $("#tool-select").replaceChildren(
    ...tools.map((t) => {
      const o = el("option", t);
      o.value = t;
      return o;
    }),
  );
  if (tools.includes(chosen)) $("#tool-select").value = chosen;
  renderTool();
  capabilities();
}
function parameter(key, value, spec, slider = false) {
  const n = Number(value);
  if (value.trim() === "" || !Number.isFinite(n)) {
    notice(
      "Enter a finite number. The last valid experiment is preserved.",
      "Introdu un număr finit. Ultimul experiment valid este păstrat.",
    );
    render();
    return;
  }
  const bounded = Math.min(
    spec.maximum,
    Math.max(spec.minimum, spec.type === "integer" ? Math.round(n) : n),
  );
  const focused = slider ? "#triad-slider" : "#triad-param-" + key;
  setState({ ...state, parameters: { ...state.parameters, [key]: bounded } });
  if (bounded !== n)
    notice(
      "Input adjusted to the displayed bounds/integer domain.",
      "Intrarea a fost ajustată la limitele afișate/domeniul întreg.",
    );
  $(focused)?.focus({ preventScroll: true });
}
function svgElement(tag, attrs = {}, value) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (value !== undefined) e.textContent = value;
  return e;
}
function renderPlot(exp) {
  const holder = $("#math-plot");
  holder.replaceChildren();
  if (!result) {
    holder.append(
      el(
        "p",
        tr(
          "A question to examine.\nNo executable numerical model.",
          "O întrebare de examinat.\nNiciun model numeric executabil.",
        ),
      ),
    );
    text(
      "#plot-description",
      tr(
        "Interpretation is kept separate from computation.",
        "Interpretarea rămâne separată de calcul.",
      ),
    );
    return;
  }
  const svg = svgElement("svg", {
      viewBox: "0 0 400 220",
      "aria-hidden": "true",
    }),
    color = "#dbe995",
    secondary = "#9fddd1",
    p = state.parameters,
    o = result.output;
  const label = (x, y, t, c = "#e3ecde", size = 11) =>
    svg.append(
      svgElement(
        "text",
        { x, y, fill: c, "font-size": size, "text-anchor": "middle" },
        t,
      ),
    );
  const line = (x1, y1, x2, y2, c = "#567067") =>
    svg.append(svgElement("line", { x1, y1, x2, y2, stroke: c }));
  const circle = (cx, cy, r, c, fill = "none") =>
    svg.append(
      svgElement("circle", { cx, cy, r, stroke: c, fill, "stroke-width": 2 }),
    );
  if (exp.experiment_id === "ball-projection") {
    circle(105, 106, 65, secondary, "#244d42");
    circle(295, 106, 65, "#466359");
    if (o.slice.kind === "disk")
      circle(295, 106, 65 * o.slice.radius, color, "#556342");
    if (o.slice.kind === "point") circle(295, 106, 3, color, color);
    label(105, 28, tr("Projection: unit disk", "Proiecție: disc unitar"));
    label(295, 28, tr("Slice at z = ", "Secțiune la z = ") + fmt(p.s));
    label(105, 198, "(x,y,z) → (x,y)");
    label(295, 198, `${o.slice.kind} · r = ${fmt(o.slice.radius)}`);
    text(
      "#plot-description",
      tr(
        "The projection stays fixed. The slice becomes a point at |s| = 1 and is empty outside. z is discarded; two different source heights can have the same image.",
        "Proiecția rămâne fixă. Secțiunea devine punct la |s| = 1 și este vidă în exterior. Coordonata z se pierde; două înălțimi diferite pot avea aceeași imagine.",
      ),
    );
  }
  if (exp.experiment_id === "integer-access") {
    line(20, 110, 380, 110);
    const vals = o.window;
    vals.forEach((n, i) => {
      const x = 25 + (i * 350) / (vals.length - 1);
      circle(
        x,
        110,
        n === p.n ? 8 : 3,
        n === p.n ? color : secondary,
        n === p.n ? color : secondary,
      );
      label(x, 140, String(n), "#e3ecde", vals.length > 15 ? 9 : 11);
    });
    label(200, 45, `T(${p.n}) = ${o.next}`, color, 19);
    label(
      200,
      190,
      tr(
        "Finite view of ℤ; one successor at every state",
        "Vedere finită a lui ℤ; un succesor pentru fiecare stare",
      ),
    );
    text(
      "#plot-description",
      tr(
        "Changing the viewing center or width leaves n and T(n) unchanged. A finite viewport is not a measurement of consciousness.",
        "Schimbarea centrului sau lățimii ferestrei nu schimbă n și T(n). O fereastră finită nu măsoară conștiința.",
      ),
    );
  }
  if (exp.experiment_id === "log-scale") {
    line(30, 105, 370, 105);
    for (const q of [-12, -6, 0, 6, 12]) {
      const x = 200 + q * 14;
      line(x, 98, x, 112);
      label(x, 135, String(q));
    }
    circle(200 + p.q * 14, 105, 8, color, color);
    circle(200 - p.q * 14, 105, 5, secondary, secondary);
    label(200, 40, "q ↔ −q", color, 22);
    label(200, 175, "ℓ(q) × ℓ(−q) = ℓ₀²");
    label(
      200,
      202,
      tr(
        "Finite displayed interval: −12 ≤ q ≤ 12",
        "Interval finit afișat: −12 ≤ q ≤ 12",
      ),
    );
    text(
      "#plot-description",
      tr(
        "Positive lengths in metres. q = 0 is the chosen reference length. Finite endpoints are not infinity; this is a chosen reciprocal map.",
        "Lungimi pozitive în metri. q = 0 este lungimea de referință aleasă. Capetele finite nu sunt infinitul; aceasta este o transformare reciprocă aleasă.",
      ),
    );
  }
  if (exp.experiment_id === "qfp-local") {
    const vals = Array.from({ length: 61 }, (_, i) => {
      const r = (p.rMax * i) / 60;
      return [r, NAtRadius(r, p.m3), phiAtRadius(r, p.Phi0, p.Phi2)];
    });
    let lo = Math.min(0, ...vals.flatMap((v) => v.slice(1))),
      hi = Math.max(1, ...vals.flatMap((v) => v.slice(1)));
    const y = (n) => 180 - ((n - lo) / (hi - lo)) * 140;
    line(35, 180, 375, 180);
    line(35, 40, 35, 180);
    for (const [j, c] of [
      [1, color],
      [2, secondary],
    ]) {
      svg.append(
        svgElement("polyline", {
          points: vals
            .map((v) => `${35 + (v[0] / p.rMax) * 340},${y(v[j])}`)
            .join(" "),
          fill: "none",
          stroke: c,
          "stroke-width": 2,
        }),
      );
    }
    label(200, 23, "N(r) · Φ(r) / μ", color, 13);
    label(35, 199, "0");
    label(365, 199, fmt(p.rMax));
    label(205, 217, "μ r");
    label(18, 48, fmt(hi));
    label(18, 177, fmt(lo));
    text(
      "#plot-description",
      tr(
        "Yellow: truncated N(r). Cyan: scalar field in reference units. Common numerical axis; different dimensions. Visualization mapping, not a literal spacetime embedding.",
        "Galben: N(r) trunchiat. Turcoaz: câmpul scalar în unități de referință. Axă numerică comună, dimensiuni diferite. Reprezentare vizuală, nu încorporare literală a spațiului-timp.",
      ),
    );
  }
  holder.append(svg);
  holder.setAttribute("aria-label", $("#plot-description").textContent);
}
function renderReadouts() {
  const d = $("#experiment-readouts");
  d.replaceChildren();
  if (!result) return;
  const o = result.output;
  const rows =
    result.input.experiment_id === "ball-projection"
      ? [
          [tr("slice radius", "raza secțiunii"), o.slice.radius],
          [tr("slice area", "aria secțiunii"), o.slice.area],
        ]
      : result.input.experiment_id === "integer-access"
        ? [
            ["n", o.state],
            ["T(n)", o.next],
          ]
        : result.input.experiment_id === "log-scale"
          ? [
              ["ℓ(q) / m", o.length],
              ["ℓ(−q) / m", o.reflected_length],
              ["ℓ(q)ℓ(−q) / m²", o.product],
              ["ℓ₀² / m²", o.reference_squared],
            ]
          : [
              ["R₀ / μ²", o.R0],
              ["𝒢₀ / μ⁴", o.GB0],
              ["□Φ₀ / μ³", o.boxPhi0],
              [
                tr("scalar residual / μ³", "reziduu scalar / μ³"),
                o.scalarResidual,
              ],
              ["N(r max)", o.N_at_rMax],
              [
                tr("Reference check", "Verificare de referință"),
                o.reference_check.pass
                  ? tr("PASS", "VALIDAT")
                  : tr("NOT MATCHED", "FĂRĂ POTRIVIRE"),
              ],
            ];
  for (const [k, v] of rows) {
    const item = el("div");
    item.append(el("dt", k), el("dd", fmt(v)));
    d.append(item);
  }
  if (o.hasNZeroCrossing)
    d.append(
      el(
        "p",
        tr(
          "The truncated N reaches or crosses zero in this interval. Local validity and global continuation are not established; this is not a proven horizon.",
          "N trunchiat atinge sau traversează zero în acest interval. Validitatea locală și continuarea globală nu sunt stabilite; acesta nu este un orizont demonstrat.",
        ),
        "crossing-warning",
      ),
    );
}
function renderGuide() {
  const o = getResearchObject(model, state.claim_id),
    kind = $("#guide-question").value,
    box = $("#local-answer");
  box.replaceChildren();
  const p = (v) => box.append(el("p", v));
  const source = tr(
    "Curated record wording is preserved below; attribution is in the public record.",
    "Formularea fișei curatoriate este păstrată mai jos; atribuirea se află în fișa publică.",
  );
  if (kind === "establish") {
    p(
      state.language === "ro"
        ? o.paraphrase_ro || o.statement_ro || o.statement
        : o.statement,
    );
    p(
      tr("Recorded classification: ", "Clasificare înregistrată: ") +
        [o.object_type, o.epistemic_status].filter(Boolean).join(" / "),
    );
    p(o.limitations[0] || "");
  }
  if (kind === "assumptions") {
    p(source);
    o.assumptions.forEach(p);
    if (!o.assumptions.length)
      p(
        tr(
          "No assumptions are enumerated in this record; that is an evidence gap, not unconditional validity.",
          "Fișa nu enumeră ipoteze; aceasta este o lacună, nu validitate necondiționată.",
        ),
      );
  }
  if (kind === "validation") {
    p(
      result
        ? tr(
            "This panel just executed the identified JavaScript calculation. See the full record for inputs and limitations. Wolfram and LLM execution are separate.",
            "Acest panou a executat calculul JavaScript identificat. Vezi fișa integrală pentru intrări și limite. Execuțiile Wolfram și LLM sunt separate.",
          )
        : tr(
            "There is no executable numerical experiment attached to this object.",
            "Acest obiect nu are un experiment numeric executabil asociat.",
          ),
    );
    p(
      tr(
        "Recorded validation metadata (not a new test run):",
        "Metadate de validare înregistrate (nu o nouă rulare):",
      ),
    );
    box.append(el("pre", JSON.stringify(o.validation, null, 2)));
  }
  if (kind === "premises") {
    p(
      tr("Explicit dependency IDs: ", "ID-urile dependențelor explicite: ") +
        (o.depends_on.join(", ") ||
          tr("none recorded", "niciunul înregistrat")),
    );
    p(
      tr(
        "Dependencies identify premises to inspect; their presence does not prove a deduction. Source status and local scope remain unchanged.",
        "Dependențele identifică premisele de inspectat; prezența lor nu demonstrează o deducție. Statutul sursei și domeniul local rămân neschimbate.",
      ),
    );
  }
  if (kind === "compare") {
    p(
      tr(
        "Compare definitions, domains, premises and possible failure results before comparing conclusions. A visual analogy does not establish equivalence between theories or traditions.",
        "Compară definițiile, domeniile, premisele și rezultatele care ar infirma o afirmație înainte de concluzii. O analogie vizuală nu stabilește echivalența teoriilor sau tradițiilor.",
      ),
    );
    p(
      tr(
        "Advaita, Ajata, Kashmir Shaivism, Buddhism and Biblical self-reference have distinct histories and claims. This record does not provide a textual basis for declaring them identical.",
        "Advaita, Ajata, șivaismul cașmirian, budismul și autoreferința biblică au istorii și afirmații distincte. Această fișă nu oferă o bază textuală pentru a le declara identice.",
      ),
    );
  }
  if (kind === "experiment")
    p(
      result
        ? tr(
            "Change one parameter, export the actual result, then import it to recompute and compare the complete deterministic record. An independent Wolfram comparison requires a working runtime.",
            "Schimbă un parametru, exportă rezultatul real, apoi importă-l pentru recalcularea și compararea fișei deterministe. Comparația Wolfram independentă necesită un runtime funcțional.",
          )
        : tr(
            "First specify a mathematical domain, an operation, assumptions and a possible failure result. No numerical experiment is attached to this research object.",
            "Mai întâi specifică domeniul matematic, operația, ipotezele și un posibil rezultat de infirmare. Acest obiect de cercetare nu are un experiment numeric asociat.",
          ),
    );
  p(tr("Source IDs: ", "ID-urile surselor: ") + o.source_ids.join(", "));
}
function renderDisclosure() {
  const request = {
    claim_id: state.claim_id,
    question: $("#research-question").value.trim(),
    language: state.language,
  };
  text(
    "#disclosure-body",
    JSON.stringify(
      { request, public_context: getResearchObject(model, state.claim_id) },
      null,
      2,
    ),
  );
  capabilities();
}
function toolRequest() {
  const name = $("#tool-select").value;
  let args = { claim_id: state.claim_id };
  if (name === "research_list_concepts") args = {};
  if (name === "research_compare_models")
    args = {
      claim_ids: [
        state.claim_id,
        state.claim_id === "QFP-S001" ? "ATLAS-BALL-PROJECTION" : "QFP-S001",
      ].filter((v, i, a) => a.indexOf(v) === i),
    };
  if (["research_run_experiment", "research_export_experiment"].includes(name))
    args = result ? result.input : null;
  if (args === null) return null;
  return { method: "tools/call", params: { name, arguments: args } };
}
function renderTool() {
  const request = toolRequest();
  $("#copy-tool").disabled = !request;
  text(
    "#tool-preview",
    request
      ? JSON.stringify(request, null, 2)
      : tr(
          "No executable experiment is attached to this object.",
          "Acest obiect nu are un experiment executabil asociat.",
        ),
  );
}
async function requestGateway(path, body, connection = connected) {
  if (!connection) throw new Error("NOT CONFIGURED");
  const response = await fetch(connection.url + path, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + connection.token,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.any([
      connection.controller.signal,
      AbortSignal.timeout(body ? 45000 : 10000),
    ]),
    redirect: "error",
    credentials: "omit",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Gateway HTTP ${response.status}`);
  return readBoundedJSON(response);
}
async function copy(value) {
  try {
    await navigator.clipboard.writeText(value);
    notice("Copied.", "Copiat.");
  } catch {
    notice(
      "Clipboard unavailable. Use JSON export or select the visible request text.",
      "Clipboard indisponibil. Folosește exportul JSON sau selectează cererea afișată.",
    );
  }
}
async function start() {
  const response = await fetch("./data/research.json");
  if (!response.ok) throw new Error("Research data unavailable");
  model = makeResearchModel(await response.json());
  experiments = listExperiments(model);
  try {
    state = decodeTriadState(location.hash, model);
  } catch {
    state = cleanTriadState({}, model);
    notice(
      "Invalid experiment link. Default research context loaded.",
      "Link invalid. Contextul implicit a fost încărcat.",
    );
  }
  render();
  $("#triad-object").onchange = (e) => selectClaim(e.target.value);
  $("#triad-language").onchange = (e) =>
    setState({ ...state, language: e.target.value });
  $("#triad-reset").onclick = () => setState({ ...state, parameters: {} });
  $("#run-browser").onclick = () => setState(state);
  $("#triad-share").onclick = () =>
    copy(location.origin + location.pathname + encodeTriadState(state, model));
  $("#guide-question").onchange = renderGuide;
  $("#research-question").oninput = () => {
    answerGeneration++;
    text("#agent-answer", "");
    $("#disclosure-consent").checked = false;
    renderDisclosure();
  };
  $("#disclosure-consent").onchange = capabilities;
  $("#tool-select").onchange = renderTool;
  $("#copy-tool").onclick = () => copy(JSON.stringify(toolRequest(), null, 2));
  $("#triad-export").onclick = () => {
    if (result) download(state.claim_id + "-experiment.json", result);
  };
  $("#export-object").onclick = () =>
    download(state.claim_id + "-record.json", {
      schema_version: model.schema_version,
      source_revision: model.source_revision,
      object: getResearchObject(model, state.claim_id),
    });
  $("#triad-import-button").onclick = () => $("#triad-import").click();
  $("#triad-import").onchange = async (e) => {
    try {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 100000) throw new Error("Export exceeds 100 KB limit");
      const next = importExperiment(
        JSON.parse(await f.text()),
        model,
        state.language,
      );
      setState(next);
      notice(
        "Imported result reproduced exactly by the current browser implementation.",
        "Rezultatul importat a fost reprodus exact de implementarea actuală.",
      );
    } catch (err) {
      notice(
        "Import rejected: " + err.message,
        "Import respins: " + err.message,
      );
    } finally {
      e.target.value = "";
    }
  };
  $("#gateway-form").onsubmit = async (e) => {
    e.preventDefault();
    const attempt = ++connectionGeneration;
    connected?.controller.abort();
    connected = null;
    capabilities();
    try {
      const url = gatewayURL($("#gateway-url").value),
        token = $("#gateway-token").value;
      if (!/^[\x21-\x7E]{32,256}$/.test(token))
        throw new Error("A 32–256 character gateway access token is required");
      const candidate = {
        url,
        token,
        capabilities: {},
        controller: new AbortController(),
      };
      connected = candidate;
      const caps = await requestGateway(
        "/api/capabilities",
        undefined,
        candidate,
      );
      if (attempt !== connectionGeneration) return;
      if (caps.source_revision !== model.source_revision)
        throw new Error("Gateway research revision differs from this page");
      if (
        caps.schema_version !== "1.0" ||
        !caps.mcp ||
        !caps.microsoft ||
        !caps.wolfram
      )
        throw new Error("Unexpected capability response");
      connected.capabilities = caps;
      text(
        "#gateway-result",
        tr(
          "Gateway checked. Availability describes the connected service, not a public ChatGPT installation.",
          "Gateway verificat. Disponibilitatea descrie serviciul conectat, nu o instalare ChatGPT publică.",
        ),
      );
      capabilities();
    } catch (err) {
      if (attempt !== connectionGeneration) return;
      connected?.controller.abort();
      connected = null;
      text(
        "#gateway-result",
        tr("Connection unavailable: ", "Conexiune indisponibilă: ") +
          err.message,
      );
      capabilities();
    }
  };
  $("#disconnect-gateway").onclick = () => {
    connectionGeneration++;
    connected?.controller.abort();
    connected = null;
    text("#agent-answer", "");
    $("#gateway-token").value = "";
    $("#disclosure-consent").checked = false;
    text("#gateway-result", tr("Disconnected.", "Deconectat."));
    capabilities();
  };
  $("#ask-agent").onclick = async () => {
    if (!$("#disclosure-consent").checked) return;
    const mark = generation,
      connectionMark = connectionGeneration,
      answerMark = ++answerGeneration,
      claim = state.claim_id,
      question = $("#research-question").value.trim();
    if (!question) return;
    $("#disclosure-consent").checked = false;
    capabilities();
    text(
      "#agent-answer",
      tr(
        "Waiting for the configured provider…",
        "Se așteaptă furnizorul configurat…",
      ),
    );
    try {
      const answer = await requestGateway("/api/explain", {
        claim_id: claim,
        question,
        language: state.language,
      });
      if (
        mark !== generation ||
        connectionMark !== connectionGeneration ||
        answerMark !== answerGeneration
      )
        return;
      if (answer.status !== "AVAILABLE")
        throw new Error(answer.status || "ERROR");
      checkExplanation(answer, model, claim);
      $("#agent-answer").replaceChildren(
        el(
          "p",
          tr(
            "AI-GENERATED REASONING · NOT A VERIFIED COMPUTATION",
            "RAȚIONAMENT GENERAT DE AI · NU ESTE UN CALCUL VERIFICAT",
          ),
          "answer-label",
        ),
        el("p", answer.answer || ""),
      );
      for (const basis of answer.basis || [])
        $("#agent-answer").append(el("span", basis, "basis-tag"));
      for (const id of answer.source_ids || [])
        if (model.sources.some((s) => s.id === id))
          $("#agent-answer").append(el("p", id));
    } catch (err) {
      if (
        mark === generation &&
        connectionMark === connectionGeneration &&
        answerMark === answerGeneration
      )
        text(
          "#agent-answer",
          tr("Assistant unavailable: ", "Asistent indisponibil: ") +
            err.message,
        );
    }
  };
  $("#run-wolfram").onclick = async () => {
    if (!result) return;
    const mark = generation,
      connectionMark = connectionGeneration,
      request = result.input;
    $("#run-wolfram").disabled = true;
    text(
      "#computation-notice",
      tr(
        "Waiting for the fixed Wolfram experiment…",
        "Se așteaptă experimentul Wolfram definit…",
      ),
    );
    try {
      const answer = await requestGateway("/api/experiment", {
        ...request,
        engine: "wolfram",
      });
      if (mark !== generation || connectionMark !== connectionGeneration)
        return;
      checkWolfram(answer, model, result);
      text("#computation-notice", JSON.stringify(answer, null, 2));
    } catch (err) {
      if (mark === generation && connectionMark === connectionGeneration)
        text(
          "#computation-notice",
          tr(
            "Wolfram execution unavailable: ",
            "Execuție Wolfram indisponibilă: ",
          ) + err.message,
        );
    } finally {
      capabilities();
    }
  };
  addEventListener("hashchange", () => {
    if (!location.hash.startsWith("#triad=")) return;
    try {
      setState(decodeTriadState(location.hash, model));
    } catch {
      notice(
        "Invalid experiment link; current context preserved.",
        "Link invalid; contextul actual a fost păstrat.",
      );
    }
  });
}
start().catch(() =>
  text(
    "#triad-status",
    "Research interface unavailable. The original atlas remains accessible. / Interfață indisponibilă. Atlasul original rămâne accesibil.",
  ),
);

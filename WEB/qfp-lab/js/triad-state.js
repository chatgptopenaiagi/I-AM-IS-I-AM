import { getResearchObject, stableResearchJSON } from "./research-interface.js";
import {
  listExperiments,
  normalizeExperimentRequest,
  runExperiment,
} from "./research-experiments.js";
export const TOPICS = {
  projection: [
    "ATLAS-BALL-PROJECTION",
    "QFP-S001",
    "ATLAS-EMBEDDED-OBSERVER",
    "ATLAS-INFINITE-SHEET",
    "ATLAS-TOPOLOGY-LAYERS",
    "ATLAS-CURVE-FAMILY",
    "ATLAS-TUBE-OVERLAP",
    "ATLAS-CENTER-UNIQUENESS",
    "ATLAS-DENSITY",
    "ATLAS-FOLD-CURVATURE",
  ],
  observer: [
    "ATLAS-INTEGER-ACCESS",
    "ATLAS-ACCESS",
    "ATLAS-EMBEDDED-OBSERVER",
    "ATLAS-AGI-TOPOLOGY",
  ],
  scale: ["ATLAS-LOG-SCALE", "ATLAS-SCALE-POLARITY", "ATLAS-SELF-REFERENCE"],
  qfp: [
    "QFP-D005",
    "QFP-M001",
    "QFP-A001",
    "QFP-C001",
    "QFP-NOT001",
    "QFP-A002",
    "QFP-DEF001",
    "QFP-A003",
    "QFP-D001",
    "QFP-D002",
    "QFP-D003",
    "QFP-D004",
    "ATLAS-METRIC-REVIEW",
    "ATLAS-P-TENSOR",
    "ATLAS-REFERENCE-MASS",
    "ATLAS-GRAVITY-EXTRAPOLATION",
  ],
  time: ["ATLAS-CAUSAL-ORDER", "ATLAS-ACCESS"],
  identity: ["ATLAS-BEING", "ATLAS-SELF-REFERENCE"],
};
export function cleanTriadState(raw, model) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new TypeError("Expected an experiment state");
  if (
    Object.keys(raw).some(
      (k) =>
        !["version", "language", "topic", "claim_id", "parameters"].includes(k),
    )
  )
    throw new TypeError("Unknown state property");
  if (raw.version !== undefined && raw.version !== 1)
    throw new RangeError("Unsupported state version");
  const topic = raw.topic ?? "qfp",
    language = raw.language ?? "en";
  if (!Object.hasOwn(TOPICS, topic) || !["en", "ro"].includes(language))
    throw new RangeError("Unknown topic or language");
  const claim_id = raw.claim_id ?? TOPICS[topic][0];
  if (!TOPICS[topic].includes(claim_id) || !getResearchObject(model, claim_id))
    throw new RangeError("Unknown research object in this topic");
  const experiment = listExperiments(model).find(
    (x) => x.claim_id === claim_id,
  );
  let parameters = {};
  if (experiment)
    parameters = normalizeExperimentRequest(model, {
      claim_id,
      experiment_id: experiment.experiment_id,
      parameters: raw.parameters ?? {},
    }).parameters;
  else if (
    raw.parameters &&
    (typeof raw.parameters !== "object" ||
      Array.isArray(raw.parameters) ||
      Object.keys(raw.parameters).length)
  )
    throw new RangeError("No numerical experiment exists for this object");
  return { version: 1, language, topic, claim_id, parameters };
}
export function encodeTriadState(state, model) {
  return (
    "#triad=" +
    encodeURIComponent(JSON.stringify(cleanTriadState(state, model)))
  );
}
export function decodeTriadState(hash, model) {
  if (!hash || !hash.startsWith("#triad=")) return cleanTriadState({}, model);
  if (hash.length > 14000) throw new RangeError("State link too large");
  return cleanTriadState(JSON.parse(decodeURIComponent(hash.slice(7))), model);
}
export function topicFor(id) {
  return Object.keys(TOPICS).find((k) => TOPICS[k].includes(id));
}
export function importExperiment(record, model, language = "en") {
  if (
    !record ||
    typeof record !== "object" ||
    record.schema_version !== "1.0" ||
    record.source_revision !== model.source_revision ||
    record.engine !== "javascript"
  )
    throw new RangeError(
      "Only a matching-version browser experiment can be reproduced here",
    );
  const recomputed = runExperiment(model, record.input);
  for (const key of ["input", "process", "output", "validation", "limitations"])
    if (stableResearchJSON(record[key]) !== stableResearchJSON(recomputed[key]))
      throw new RangeError(
        "Imported record differs from its reproducible calculation: " + key,
      );
  return cleanTriadState(
    {
      version: 1,
      language,
      topic: topicFor(record.input.claim_id),
      claim_id: record.input.claim_id,
      parameters: record.input.parameters,
    },
    model,
  );
}
export function gatewayURL(value) {
  const u = new URL(value);
  if (u.username || u.password || u.search || u.hash || u.pathname !== "/")
    throw new RangeError(
      "Use only the gateway origin without a path, credentials or query",
    );
  if (
    u.protocol !== "https:" &&
    !(
      u.protocol === "http:" &&
      ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname)
    )
  )
    throw new RangeError("Gateway requires HTTPS or loopback HTTP");
  return u.origin;
}

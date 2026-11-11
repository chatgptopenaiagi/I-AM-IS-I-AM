// One deterministic adapter over research.json, shared by browser and local services.
// A fingerprint detects changes; it is NOT a signature or canonical authentication.
export const RESEARCH_SCHEMA_VERSION = "1.0";
const axes = ["object_type", "epistemic_status", "domain", "depends_on", "validation"];
const objectTypes = new Set([null, "DEFINITION", "ASSUMPTION", "ANSATZ", "SCHEMA", "NOTATION", "WORKING MODEL"]);
const statuses = new Set([null, "ESTABLISHED", "DERIVED", "HYPOTHESIS", "CONJECTURE", "SPECULATIVE", "NUMERICAL RESULT", "FALSIFIED", "SUPERSEDED"]);
const payloadKeys = ["metadata", "branches", "objects", "relationships", "sources"];
const record = value => value !== null && typeof value === "object" && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));

export function stableResearchJSON(value) {
  const seen = new Set();
  function serialize(item, depth) {
    if (depth > 64) throw new RangeError("Research data nesting exceeds 64 levels");
    if (item === null || typeof item === "boolean" || typeof item === "string") return JSON.stringify(item);
    if (typeof item === "number" && Number.isFinite(item)) return JSON.stringify(item);
    if (!Array.isArray(item) && !record(item)) throw new TypeError("Research data must contain finite JSON values only");
    if (seen.has(item)) throw new TypeError("Research data cannot contain cycles");
    seen.add(item);
    const result = Array.isArray(item)
      ? "[" + item.map(x => serialize(x, depth + 1)).join(",") + "]"
      : "{" + Object.keys(item).sort().map(key => JSON.stringify(key) + ":" + serialize(item[key], depth + 1)).join(",") + "}";
    seen.delete(item);
    return result;
  }
  const text = serialize(value, 0);
  if (text.length > 2_000_000) throw new RangeError("Research data exceeds the two-million-character bound");
  return text;
}
const clone = value => JSON.parse(stableResearchJSON(value));
function freeze(value) {
  if (value !== null && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function payload(model) { return Object.fromEntries(payloadKeys.map(key => [key, model[key]])); }
function fingerprint(model) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(stableResearchJSON(payload(model)))) hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  return "atlas-fnv1a32:" + hash.toString(16).padStart(8, "0");
}

export function validateResearchModel(model, expectedModel = null) {
  const errors = [], issue = (code, path, message) => errors.push({code, path, message});
  try { stableResearchJSON(model); } catch (error) { return {valid:false, errors:[{code:"JSON_DATA",path:"model",message:error.message}],trust:"STRUCTURAL_ONLY"}; }
  if (!record(model)) return {valid:false,errors:[{code:"MODEL_TYPE",path:"model",message:"Expected a model object"}],trust:"STRUCTURAL_ONLY"};
  if (model.schema_version !== RESEARCH_SCHEMA_VERSION) issue("SCHEMA_VERSION", "schema_version", "Unsupported model version");
  if (!record(model.metadata)) issue("METADATA", "metadata", "Source metadata is required");
  const indexes = {};
  for (const key of ["objects", "branches", "sources"]) {
    indexes[key] = new Map();
    if (!Array.isArray(model[key]) || model[key].length > 10000) { issue("COLLECTION", key, "Expected a bounded array"); continue; }
    for (const [i, item] of model[key].entries()) {
      if (!record(item) || typeof item.id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(item.id)) { issue("ID", `${key}[${i}]`, "Stable ID is required"); continue; }
      if (indexes[key].has(item.id)) issue("DUPLICATE_ID", `${key}[${i}]`, "Duplicate stable ID");
      indexes[key].set(item.id, item);
    }
  }
  for (const item of indexes.objects.values()) {
    for (const axis of axes) if (!Object.hasOwn(item, axis)) issue("MISSING_AXIS", item.id + "." + axis, "All five epistemic axes must survive the adapter");
    if (!objectTypes.has(item.object_type)) issue("OBJECT_TYPE", item.id, "Invalid scientific object type");
    if (!statuses.has(item.epistemic_status)) issue("EPISTEMIC_STATUS", item.id, "Invalid epistemic status");
    if (!Array.isArray(item.domain) || !Array.isArray(item.validation)) issue("AXIS_SHAPE", item.id, "Domain and validation must remain arrays");
    if (!indexes.branches.has(item.branch)) issue("BRANCH", item.id, "Unknown branch");
    if (!Array.isArray(item.depends_on) || item.depends_on.some(id => typeof id !== "string" || !indexes.objects.has(id))) issue("DEPENDENCY", item.id, "Unknown or malformed explicit dependency");
    if (!Array.isArray(item.source_ids) || item.source_ids.some(id => !indexes.sources.has(id))) issue("SOURCE", item.id, "Unknown or malformed source ID");
  }
  if (!Array.isArray(model.relationships)) issue("RELATIONSHIPS", "relationships", "Expected explicit relationship records");
  else for (const [i, edge] of model.relationships.entries()) if (!record(edge) || !indexes.objects.has(edge.from) || !indexes.objects.has(edge.to) || typeof edge.type !== "string") issue("RELATIONSHIP", `relationships[${i}]`, "Relationship endpoints/type are required");
  // Only explicit formal dependencies are acyclic; analogy/continuity edges may cycle.
  const done = new Set(), visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) { issue("DEPENDENCY_CYCLE", id, "Formal dependency cycle"); return; }
    if (done.has(id)) return;
    visiting.add(id);
    const deps = indexes.objects.get(id)?.depends_on;
    if (Array.isArray(deps)) for (const dep of deps) if (indexes.objects.has(dep)) visit(dep);
    visiting.delete(id); done.add(id);
  }
  for (const id of indexes.objects.keys()) visit(id);
  try { if (model.source_revision !== fingerprint(model)) issue("SOURCE_REVISION", "source_revision", "Payload no longer matches its source fingerprint"); }
  catch { issue("SOURCE_PAYLOAD", "model", "Incomplete source payload"); }
  if (expectedModel !== null) {
    try {
      if (model.schema_version !== expectedModel.schema_version || model.source_revision !== expectedModel.source_revision || stableResearchJSON(payload(model)) !== stableResearchJSON(payload(expectedModel))) issue("TRUSTED_SOURCE_MISMATCH", "model", "Imported data differs from the supplied trusted atlas; no canonical promotion is allowed");
    } catch { issue("TRUSTED_SOURCE_MISMATCH", "model", "Invalid trusted comparison model"); }
  }
  return {valid:errors.length === 0, errors, trust:expectedModel === null ? "STRUCTURAL_ONLY" : "COMPARED_WITH_SUPPLIED_MODEL"};
}

export function makeResearchModel(atlasData) {
  if (!record(atlasData) || atlasData.schema_version !== "1.0") throw new TypeError("Expected research.json schema 1.0");
  const model = clone({schema_version:RESEARCH_SCHEMA_VERSION,metadata:atlasData.metadata,branches:atlasData.branches,objects:atlasData.claims,relationships:atlasData.edges,sources:atlasData.sources});
  model.source_revision = fingerprint(model);
  const validation = validateResearchModel(model);
  if (!validation.valid) throw new TypeError("Invalid atlas model: " + validation.errors.map(e => e.code).join(", "));
  return freeze(model);
}

export function getResearchObject(model, id) {
  if (typeof id !== "string" || !Array.isArray(model?.objects)) return null;
  return model.objects.find(item => item.id === id) ?? null;
}

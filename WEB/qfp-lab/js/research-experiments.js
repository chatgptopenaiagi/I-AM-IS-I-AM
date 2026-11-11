import {getResearchObject, validateResearchModel} from "./research-interface.js";
import {ballSlice, lengthAt, logAt, successor, visibleIntegers} from "./atlas-math.js";
import {DEFAULTS, LIMITS} from "./qfp-model.js";
import {ricci0, gaussBonnet0, boxPhi0, scalarResidual, NAtRadius, hasNZeroCrossing, deSitterCheck} from "./qfp-math.js";

const numeric = (minimum, maximum, value, type = "number") => ({type,minimum,maximum,default:value});
const schema = properties => ({type:"object",properties,additionalProperties:false});
const descriptors = [
  {experiment_id:"ball-projection",claim_id:"ATLAS-BALL-PROJECTION",title:"Unit-ball projection and slice",parameters:schema({s:numeric(-1.2,1.2,0.45)}),method:"Closed-form Euclidean ball image and fixed-height cross-section",functions:["ballSlice"],module:"atlas-math.js",limitations:["A mathematical teaching construction, not a physical continuum-projection mechanism.","Projection is the full unit disk; a slice is a different operation."]},
  {experiment_id:"integer-access",claim_id:"ATLAS-INTEGER-ACCESS",title:"Integer transition and independent viewing window",parameters:schema({n:numeric(-1e6,1e6,0,"integer"),center:numeric(-1e6,1e6,0,"integer"),width:numeric(2,10,5,"integer")}),method:"Exact bounded safe-integer successor and finite-window enumeration",functions:["successor","visibleIntegers"],module:"atlas-math.js",limitations:["Finite safe-integer software bounds do not limit the mathematical integers.","Window movement does not change the transition definition or state.","No universal-access or consciousness claim is computed."]},
  {experiment_id:"log-scale",claim_id:"ATLAS-LOG-SCALE",title:"Positive logarithmic length and reciprocal reflection",parameters:schema({q:numeric(-12,12,-3),l0:numeric(1e-9,1e9,1)}),method:"Positive-real power and logarithm evaluation",functions:["lengthAt","logAt"],module:"atlas-math.js",limitations:["The chosen reference length is in metres; q is dimensionless.","Reflection is a stipulated reciprocal map, not a demonstrated physical micro/macro duality.","q=0 means the chosen reference length, not zero length, zero kelvin or ontological ground."]},
  {experiment_id:"qfp-local",claim_id:"QFP-D005",title:"Conditional QFP regular-center calculation",parameters:schema(Object.fromEntries(Object.keys(DEFAULTS).map(key => [key,numeric(...LIMITS[key],DEFAULTS[key])]))),method:"Protected closed-form local-center identities; no differential-equation solver",functions:["ricci0","gaussBonnet0","boxPhi0","scalarResidual","deSitterCheck"],module:"qfp-math.js",limitations:["Conditional on the protected action, independent F and H, curvature convention and regular-center ansatz.","Zero scalar residual does not solve the metric equations or establish global existence, stability or empirical validity.","N zero-crossing concerns the truncated polynomial on the chosen finite interval, not a proven horizon.","Parameters are dimensionless coefficients in arbitrary reference mass mu; no measured physical scale is assumed."]},
];
const copy = value => JSON.parse(JSON.stringify(value));
function assertModel(model) {
  const result = validateResearchModel(model);
  if (!result.valid) throw new TypeError("Invalid research model: " + result.errors.map(x => x.code).join(", "));
}
function dependencies(model, id) {
  const found = new Set();
  function collect(current) { for (const dep of getResearchObject(model,current).depends_on) if (!found.has(dep)) { found.add(dep); collect(dep); } }
  collect(id); return [...found].sort();
}
export function listExperiments(model) {
  assertModel(model);
  return descriptors.filter(item => getResearchObject(model,item.claim_id)).map(item => ({...copy(item),dependencies:dependencies(model,item.claim_id)}));
}
export function normalizeExperimentRequest(model, request) {
  assertModel(model);
  if (!request || typeof request !== "object" || Array.isArray(request) || Object.keys(request).some(key => !["claim_id","experiment_id","parameters"].includes(key))) throw new TypeError("Expected only claim_id, experiment_id and parameters");
  const descriptor = descriptors.find(item => item.experiment_id === request.experiment_id && item.claim_id === request.claim_id && getResearchObject(model,item.claim_id));
  if (!descriptor) throw new RangeError("No implemented experiment for this exact claim/experiment pair");
  const supplied = request.parameters ?? {};
  if (!supplied || typeof supplied !== "object" || Array.isArray(supplied) || ![Object.prototype,null].includes(Object.getPrototypeOf(supplied))) throw new TypeError("Parameters must be a numeric JSON object");
  const properties = descriptor.parameters.properties;
  if (Object.keys(supplied).some(key => !Object.hasOwn(properties,key))) throw new RangeError("Unknown experiment parameter");
  const parameters = {};
  for (const [key,field] of Object.entries(properties)) {
    const value = Object.hasOwn(supplied,key) ? supplied[key] : field.default;
    if (typeof value !== "number" || !Number.isFinite(value) || value < field.minimum || value > field.maximum || (field.type === "integer" && !Number.isSafeInteger(value))) throw new RangeError("Parameter outside declared numeric domain: " + key);
    parameters[key] = value;
  }
  return {claim_id:descriptor.claim_id,experiment_id:descriptor.experiment_id,parameters};
}
export function runExperiment(model, request) {
  const input = normalizeExperimentRequest(model,request), p = input.parameters;
  const descriptor = descriptors.find(item => item.experiment_id === input.experiment_id), claim = getResearchObject(model,input.claim_id);
  let output;
  switch (input.experiment_id) {
    case "ball-projection": output = {projection:{kind:"disk",radius:1,area:Math.PI},slice:ballSlice(p.s)}; break;
    case "integer-access": output = {state:p.n,next:successor(p.n),window:visibleIntegers(p.center,p.width),state_visible:Math.abs(p.n-p.center)<=p.width}; break;
    case "log-scale": { const length=lengthAt(p.q,p.l0), reflected=lengthAt(-p.q,p.l0); output={length,reflected_length:reflected,product:length*reflected,reference_squared:p.l0*p.l0,recovered_q:logAt(length,p.l0)}; break; }
    case "qfp-local": output={R0:ricci0(p.m3,p.delta2),GB0:gaussBonnet0(p.m3,p.delta2),boxPhi0:boxPhi0(p.Phi2),scalarResidual:scalarResidual(p),solvedPhi2:(p.Vp0-ricci0(p.m3,p.delta2)*p.Fp0-p.alpha*gaussBonnet0(p.m3,p.delta2)*p.Hp0)/6,N_at_rMax:NAtRadius(p.rMax,p.m3),hasNZeroCrossing:hasNZeroCrossing(p.m3,p.rMax),reference_class:p.Lambda>0?"de Sitter":p.Lambda<0?"anti-de Sitter-type":"Minkowski",reference_check:deSitterCheck(p)}; break;
  }
  const close = (a,b) => Math.abs(a-b) <= 1e-10*Math.max(1,Math.abs(a),Math.abs(b));
  const checks = input.experiment_id === "ball-projection" ? [{name:"Slice squared radius",pass:close(output.slice.radius**2,Math.max(0,1-p.s**2))},{name:"Slice area",pass:close(output.slice.area,Math.PI*output.slice.radius**2)},{name:"Projection disk radius",pass:output.projection.radius===1}]
    : input.experiment_id === "integer-access" ? [{name:"Exact successor",pass:output.next-p.n===1},{name:"Window bounds and count",pass:output.window.length===2*p.width+1&&output.window[0]===p.center-p.width&&output.window.at(-1)===p.center+p.width}]
    : input.experiment_id === "log-scale" ? [{name:"Reciprocal product (relative tolerance)",pass:Math.abs(output.product-output.reference_squared)<=1e-10*Math.max(Math.abs(output.product),Math.abs(output.reference_squared))},{name:"Recovered logarithmic coordinate",pass:close(output.recovered_q,p.q)}]
    : [{name:"Scalar closure after solving Phi2 only",pass:close(scalarResidual({...p,Phi2:output.solvedPhi2}),0)}];
  return {schema_version:"1.0",source_revision:model.source_revision,engine:"javascript",input,
    process:{method:descriptor.method,module:descriptor.module,functions:[...descriptor.functions],dependencies:dependencies(model,claim.id),domain:copy(claim.domain),assumptions:copy(claim.assumptions),definitions:copy(claim.definitions),units:copy(claim.units),units_status:claim.units_status,precision:input.experiment_id==="integer-access"?"Exact safe-integer operations":"IEEE-754 binary64",solver:null,random_seed:null,boundary_conditions:"No global boundary-value problem is solved",numerical_role:"Evaluation of stated mathematical definitions/conditional identities",source_ids:[...claim.source_ids]},
    output,validation:{status:"COMPUTED",input_domain:"PASSED",checks,empirical_support:false,independent_engine:"NOT_RUN",tolerance:{absolute:1e-10,relative:1e-10,rule:"abs(a-b) <= 1e-10 * max(1,abs(a),abs(b)); reciprocal product uses relative-only tolerance",scope:"Declared algebraic/reference comparisons only; not empirical error or a convergence estimate"}},
    limitations:[...descriptor.limitations,...claim.limitations]};
}

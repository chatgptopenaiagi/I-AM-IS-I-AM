// Explicit optional real-runtime check; UNAVAILABLE is not a passing Wolfram test.
import {readFile} from "node:fs/promises";
import {makeResearchModel} from "../../WEB/qfp-lab/js/research-interface.js";
import {listExperiments} from "../../WEB/qfp-lab/js/research-experiments.js";
import {inspectWolframAvailability,runWolframExperiment} from "./adapter.mjs";
const availability=await inspectWolframAvailability();
if(availability.status==="UNAVAILABLE") {console.log(JSON.stringify(availability,null,2));process.exitCode=2;}
else {
  const model=makeResearchModel(JSON.parse(await readFile(new URL("../../WEB/qfp-lab/data/research.json",import.meta.url),"utf8")));
  const results=[];
  for(const descriptor of listExperiments(model))results.push(await runWolframExperiment(model,{claim_id:descriptor.claim_id,experiment_id:descriptor.experiment_id,parameters:{}}));
  console.log(JSON.stringify({scope:"Actual local Wolfram runs only; no empirical validation",results},null,2));
  if(results.some(x=>x.status!=="COMPUTED"||!x.validation.comparison?.pass))process.exitCode=1;
}

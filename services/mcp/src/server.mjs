import {readFile} from 'node:fs/promises';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {registerAppResource, registerAppTool, RESOURCE_MIME_TYPE} from '@modelcontextprotocol/ext-apps/server';
import {z} from 'zod';
import {getResearchObject, validateResearchModel} from '../../../WEB/qfp-lab/js/research-interface.js';
import {listExperiments, runExperiment} from '../../../WEB/qfp-lab/js/research-experiments.js';
import {loadPublicModel} from './model.mjs';

export const APP_URI = 'ui://triad/research-lab/v1.html';
const annotations = {readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false};
const outputSchema = z.object({schema_version:z.literal('1.0'),source_revision:z.string(),data:z.record(z.string(),z.unknown())});
const short = c => ({id:c.id,title:c.title,title_ro:c.title_ro,branch:c.branch,object_type:c.object_type,epistemic_status:c.epistemic_status,domain:c.domain,depends_on:c.depends_on,source_ids:c.source_ids});

export function traceDependencies(model, id) {
  const found = new Set(), queue = [id], edges = [];
  while (queue.length) {
    const current = queue.shift();
    for (const dep of getResearchObject(model,current).depends_on) {
      edges.push({from:current,to:dep,type:'depends_on'});
      if (!found.has(dep)) {found.add(dep); queue.push(dep);}
    }
  }
  return {claim_id:id,formal_dependencies:[...found].sort(),formal_edges:edges,
    typed_relationships:model.relationships.filter(e => e.from === id || e.to === id),
    distinction:'Typed analogy/continuity relationships are not formal dependencies or evidence of equivalence.'};
}

export async function createResearchServer(model = null) {
  model ??= await loadPublicModel();
  if (!validateResearchModel(model).valid) throw new Error('Invalid fixed public model');
  const server = new McpServer({name:'triad-research-engine',version:'1.0.0'},{instructions:'Read-only public research atlas. Preserve object type, epistemic status, domain, dependencies and validation. Computation is conditional model evaluation, not empirical confirmation. Use exact claim/experiment pairs and cite source IDs. No private corpus, shell or arbitrary file access.'});
  const id = z.enum(model.objects.map(c => c.id));
  const claimInput = z.strictObject({claim_id:id});
  const descriptors = listExperiments(model);
  const experimentInput = z.strictObject({claim_id:id,experiment_id:z.enum(descriptors.map(e => e.experiment_id)),parameters:z.record(z.string().max(48),z.number().finite()).optional()});
  const claim = claim_id => getResearchObject(model,claim_id);
  const sources = claim_id => model.sources.filter(s => !claim_id || claim(claim_id).source_ids.includes(s.id));
  const envelope = data => ({schema_version:'1.0',source_revision:model.source_revision,data});
  const result = data => { const structuredContent = outputSchema.parse(envelope(data)); return {structuredContent,content:[{type:'text',text:JSON.stringify(structuredContent)}]}; };
  function tool(name,title,description,inputSchema,handler,app = false) {
    const config = {title,description,inputSchema,outputSchema,annotations,...(app ? {_meta:{ui:{resourceUri:APP_URI}}} : {})};
    const callback = async args => {
      try { return result(await handler(args)); }
      catch { return {isError:true,content:[{type:'text',text:'Request rejected: use a supported claim/experiment pair and numeric parameters within the published schema. No computation result was produced.'}]}; }
    };
    if (app) registerAppTool(server,name,config,callback); else server.registerTool(name,config,callback);
  }
  tool('research_capabilities','Research capabilities','Inspect fixed public corpus counts, scientific limitations, and all supported experiment parameter schemas.',z.strictObject({}),() => ({object_count:model.objects.length,source_count:model.sources.length,branches:model.branches,experiments:descriptors,model_validation:validateResearchModel(model),execution:'Fixed in-process JavaScript mathematics only; no arbitrary code or private data.',empirical_validation:false}));
  tool('research_list_concepts','List research concepts','Find public objects by branch. Summaries retain independent scientific object type and epistemic status.',z.strictObject({branch:z.enum(model.branches.map(b => b.id)).optional()}),({branch}) => ({objects:model.objects.filter(c => !branch || c.branch === branch).map(short)}));
  tool('research_get_claim','Read a research claim','Read the complete source-backed public object, five axes, citations and available experiments. Unknown IDs are rejected.',claimInput,({claim_id}) => ({object:claim(claim_id),sources:sources(claim_id),experiments:descriptors.filter(e => e.claim_id === claim_id)}));
  tool('research_get_equations','Read recorded equations','Read recorded equations, definitions, assumptions and units without executing equation strings or promoting claim status.',claimInput,({claim_id}) => {const c=claim(claim_id);return {claim_id,equations:c.equations,definitions:c.definitions,assumptions:c.assumptions,units:c.units,units_status:c.units_status,units_note:c.units_note,object_type:c.object_type,epistemic_status:c.epistemic_status,presentation_qualifier:c.presentation_qualifier??null,source_ids:c.source_ids};});
  tool('research_get_sources','Read public source records','Read source provenance; optionally limit to one claim. Does not fetch remote URLs or read source files.',z.strictObject({claim_id:id.optional()}),({claim_id}) => ({sources:sources(claim_id)}));
  tool('research_get_dependencies','Trace explicit dependencies','Trace transitive formal dependencies and separately return immediate typed relationships. An analogy is not a formal proof.',claimInput,({claim_id}) => traceDependencies(model,claim_id));
  tool('research_get_validation','Read recorded validation','Read validation evidence and limitations. Presence of a record is not a new test execution or empirical confirmation.',claimInput,({claim_id}) => {const c=claim(claim_id);return {claim_id,validation:c.validation,evidence:c.evidence,limitations:c.limitations,physical_validation:c.physical_validation??null,epistemic_status:c.epistemic_status,new_tests_executed:false};});
  tool('research_run_experiment','Run a bounded experiment','Evaluate one of four fixed JavaScript mathematical models with declared numeric bounds. No arbitrary expression, code, filesystem or network execution.',experimentInput,request => ({experiment:runExperiment(model,request)}));
  tool('research_compare_models','Compare recorded models','Place two to four distinct object records side by side. Returns explicit domains, assumptions and source records, not an automated claim of scientific equivalence.',z.strictObject({claim_ids:z.array(id).min(2).max(4).refine(v => new Set(v).size===v.length,'IDs must be distinct')}),({claim_ids}) => ({objects:claim_ids.map(x => claim(x)),relationships:model.relationships.filter(e => claim_ids.includes(e.from)&&claim_ids.includes(e.to)),interpretation:'Side-by-side records only. No equivalence, proof or empirical comparison is inferred.'}));
  tool('research_export_experiment','Export a reproducible experiment','Recompute a fixed experiment and return a versioned JSON record for the client to save. Does not write a file or launch a process.',experimentInput,request => ({format:'application/json',suggested_filename:'triad-experiment.json',record:runExperiment(model,request),storage:'Returned to client only; server writes no file.'}));
  tool('research_open_lab','Open the interactive research lab','Render the MCP App for selecting public objects and intentionally running bounded experiments. Tools also work without a UI.',z.strictObject({claim_id:id.optional()}),({claim_id}) => ({objects:model.objects.map(short),selected:claim(claim_id??'ATLAS-BALL-PROJECTION'),experiments:descriptors}),true);
  registerAppResource(server,'triad-research-lab',APP_URI,{mimeType:RESOURCE_MIME_TYPE},async () => ({contents:[{uri:APP_URI,mimeType:RESOURCE_MIME_TYPE,text:await readFile(new URL('../dist/mcp-app.html',import.meta.url),'utf8'),_meta:{ui:{prefersBorder:true,csp:{connectDomains:[],resourceDomains:[]}}}}]}));
  return server;
}

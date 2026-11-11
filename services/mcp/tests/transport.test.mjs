import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {request as httpRequest} from 'node:http';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {startGateway,DEFAULT_ORIGINS,unavailableWolframResult} from '../src/http.mjs';
import {APP_URI} from '../src/server.mjs';
import {loadPublicModel} from '../src/model.mjs';
import {checkWolfram} from '../../../WEB/qfp-lab/js/triad-responses.js';
import {runExperiment} from '../../../WEB/qfp-lab/js/research-experiments.js';

const token='test-only-not-a-real-credential-0123456789';
const authorization='Bearer '+token;
const publicModel=await loadPublicModel();
const names=['research_capabilities','research_list_concepts','research_get_claim','research_get_equations','research_get_sources','research_get_dependencies','research_get_validation','research_run_experiment','research_compare_models','research_export_experiment','research_open_lab'];
const ball={claim_id:'ATLAS-BALL-PROJECTION',experiment_id:'ball-projection',parameters:{s:0}};
test('missing-adapter fallback preserves identity and claims no executed engine',()=>{
  const fallback=unavailableWolframResult(publicModel,ball);
  assert.equal(fallback.status,'UNAVAILABLE');assert.equal(fallback.engine,null);
  assert.equal(fallback.source_revision,publicModel.source_revision);
  assert.equal(fallback.output,undefined);assert.equal(fallback.runtime,undefined);
  assert.equal(checkWolfram(fallback,publicModel,runExperiment(publicModel,ball)),fallback);
});
async function contract(client){
  const listed=await client.listTools();
  assert.deepEqual(listed.tools.map(t=>t.name).sort(),names.toSorted());
  for(const tool of listed.tools){assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.annotations.openWorldHint,false);assert.equal(tool.inputSchema.additionalProperties,false);assert.equal(tool.outputSchema.type,'object');}
  const capabilities=(await client.callTool({name:'research_capabilities',arguments:{}})).structuredContent;
  assert.equal(capabilities.schema_version,'1.0');assert.equal(capabilities.data.object_count,34);assert.equal(capabilities.data.experiments.length,4);
  const concepts=(await client.callTool({name:'research_list_concepts',arguments:{}})).structuredContent.data.objects;
  assert.deepEqual(concepts.map(x=>x.id).sort(),publicModel.objects.map(x=>x.id).sort());
  const claim=(await client.callTool({name:'research_get_claim',arguments:{claim_id:'QFP-S001'}})).structuredContent.data.object;
  assert.deepEqual(claim,publicModel.objects.find(x=>x.id==='QFP-S001'));assert.equal(claim.presentation_qualifier,'SCHEMATIC');
  const equations=(await client.callTool({name:'research_get_equations',arguments:{claim_id:'QFP-D005'}})).structuredContent.data;assert.ok(equations.equations.length);
  const sources=(await client.callTool({name:'research_get_sources',arguments:{claim_id:'ATLAS-BALL-PROJECTION'}})).structuredContent.data.sources;assert.ok(sources.length);
  const deps=(await client.callTool({name:'research_get_dependencies',arguments:{claim_id:'QFP-D005'}})).structuredContent.data;assert.ok(deps.formal_dependencies.length);assert.ok(Array.isArray(deps.typed_relationships));
  const validation=(await client.callTool({name:'research_get_validation',arguments:{claim_id:'QFP-D005'}})).structuredContent.data;assert.equal(validation.new_tests_executed,false);
  const calculated=(await client.callTool({name:'research_run_experiment',arguments:ball})).structuredContent.data.experiment;
  assert.equal(calculated.output.slice.radius,1);assert.equal(calculated.engine,'javascript');assert.equal(calculated.validation.empirical_support,false);assert.ok(calculated.limitations.length);
  const exported=(await client.callTool({name:'research_export_experiment',arguments:ball})).structuredContent.data;assert.deepEqual(exported.record,calculated);
  const comparison=(await client.callTool({name:'research_compare_models',arguments:{claim_ids:['QFP-D005','ATLAS-BALL-PROJECTION']}})).structuredContent.data;assert.equal(comparison.objects.length,2);
  const app=(await client.callTool({name:'research_open_lab',arguments:{}})).structuredContent.data;assert.equal(app.objects.length,34);assert.equal(app.selected.id,'ATLAS-BALL-PROJECTION');
  const resource=await client.readResource({uri:APP_URI});assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');assert.match(resource.contents[0].text,/Run fixed experiment/);assert.match(resource.contents[0].text,/ui\/initialize/);assert.deepEqual(resource.contents[0]._meta.ui.csp.connectDomains,[]);
  assert.equal(listed.tools.find(x=>x.name==='research_open_lab')._meta.ui.resourceUri,APP_URI);
  for(const args of [{...ball,parameters:{s:2}},{...ball,parameters:{s:'0'}},{...ball,parameters:{command:1}},{...ball,claim_id:'ATLAS-BEING'},{...ball,path:'../../private'}]){
    const result=await client.callTool({name:'research_run_experiment',arguments:args});assert.equal(result.isError,true);assert.equal(result.structuredContent,undefined);
  }
  assert.equal((await client.callTool({name:'research_get_claim',arguments:{claim_id:'../../private'}})).isError,true);
  assert.equal((await client.callTool({name:'research_compare_models',arguments:{claim_ids:['QFP-D005','QFP-D005']}})).isError,true);
}

test('real SDK stdio handshake, all tools, schema boundaries and MCP App resource',{timeout:20_000},async()=>{
  const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../src/stdio.mjs',import.meta.url))],stderr:'pipe'});
  const client=new Client({name:'triad-stdio-test',version:'1.0.0'});
  try{await client.connect(transport);await contract(client);}finally{await client.close();}
});
test('real SDK Streamable HTTP handshake and same research contract',{timeout:20_000},async()=>{
  const gateway=await startGateway({token});const client=new Client({name:'triad-http-test',version:'1.0.0'});
  try{await client.connect(new StreamableHTTPClientTransport(new URL(gateway.url+'/mcp'),{requestInit:{headers:{authorization}}}));await contract(client);}finally{await client.close();await gateway.close();}
});
test('loopback API rejects auth/origin/host/body/schema violations and returns actual calculations',{timeout:20_000},async()=>{
  const gateway=await startGateway({token});
  const send=(path,body,headers={})=>fetch(gateway.url+path,{method:'POST',headers:{authorization,'content-type':'application/json',...headers},body:JSON.stringify(body)});
  try{
    assert.equal((await fetch(gateway.url+'/api/capabilities')).status,401);
    assert.equal((await fetch(gateway.url+'/api/capabilities',{headers:{authorization,origin:'https://attacker.example'}})).status,403);
    assert.equal((await fetch(gateway.url+'/api/capabilities',{headers:{authorization,origin:'null'}})).status,403);
    const cap=await fetch(gateway.url+'/api/capabilities',{headers:{authorization,origin:DEFAULT_ORIGINS[0]}});assert.equal(cap.status,200);assert.equal(cap.headers.get('access-control-allow-origin'),DEFAULT_ORIGINS[0]);assert.equal((await cap.json()).mcp.tool_count,11);
    const badHost=await new Promise((resolve,reject)=>{const req=httpRequest(gateway.url+'/api/capabilities',{headers:{authorization,host:'attacker.example'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});req.on('error',reject);req.end();});assert.equal(badHost,403);
    assert.equal((await send('/api/experiment',{...ball,engine:'javascript',path:'anything'})).status,400);
    assert.equal((await send('/api/experiment',{...ball,engine:'javascript',parameters:{s:999}})).status,400);
    assert.equal((await send('/api/experiment',{...ball,engine:'javascript',parameters:{s:'0'}})).status,400);
    assert.equal((await send('/api/experiment',{...ball,engine:'javascript',padding:'x'.repeat(33000)})).status,413);
    assert.equal((await send('/api/experiment',{...ball,engine:'javascript'},{'content-type':'text/plain'})).status,415);
    assert.equal((await send('/api/explain',{claim_id:'ATLAS-BEING',question:'x',language:'en',executable:'evil'})).status,400);
    const computed=await (await send('/api/experiment',{...ball,engine:'javascript'})).json();assert.equal(computed.output.slice.radius,1);assert.equal(computed.validation.empirical_support,false);
    const unavailable=await (await send('/api/experiment',{...ball,engine:'wolfram'})).json();assert.equal(unavailable.status,'UNAVAILABLE');assert.notEqual(unavailable.engine,'wolfram');
    assert.equal((await fetch(gateway.url+'/api/capabilities?token=bad',{headers:{authorization}})).status,400);
  }finally{await gateway.close();}
});

import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {z} from 'zod';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {createResearchServer} from './server.mjs';
import {loadPublicModel} from './model.mjs';
import {listExperiments,runExperiment,normalizeExperimentRequest} from '../../../WEB/qfp-lab/js/research-experiments.js';
import {microsoftAvailability,explainWithMicrosoft} from './microsoft.mjs';

export const DEFAULT_ORIGINS=['https://chatgptopenaiagi.github.io','http://127.0.0.1:4173','http://127.0.0.1:4174'];
const MAX_BODY=32768;
function reply(res,status,value){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));}
const error=status=>({schema_version:'1.0',error:status});
function authorized(value,token){const expected=Buffer.from('Bearer '+token),actual=Buffer.from(value??'');return actual.length===expected.length&&timingSafeEqual(actual,expected);}
function readJSON(req){
  return new Promise((resolve,reject)=>{
    let size=0,chunks=[],failed=false;
    req.on('data',chunk=>{if(failed)return;size+=chunk.length;if(size>MAX_BODY){failed=true;chunks=[];reject(Object.assign(new Error(),{status:413}));}else chunks.push(chunk);});
    req.on('end',()=>{if(failed)return;try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(Object.assign(new Error(),{status:400}));}});
    req.on('error',()=>reject(Object.assign(new Error(),{status:400})));
  });
}
async function wolframAdapter(){try{return await import('../../wolfram/adapter.mjs');}catch{return null;}}
export function unavailableWolframResult(model,request){
  return {schema_version:'1.0',source_revision:model.source_revision,status:'UNAVAILABLE',engine:null,input:normalizeExperimentRequest(model,request),reason:'The optional Wolfram adapter could not be loaded.',validation:{independent_engine:'NOT_RUN',empirical_support:false},limitations:['No Wolfram process ran and no Wolfram computation result is claimed.']};
}

export async function startGateway({token,port=0,origins=DEFAULT_ORIGINS,wolframExecutable=undefined}={}){
  if(typeof token!=='string'||token.length<32||token.length>256||/[^\x21-\x7E]/.test(token))throw new Error('Set a 32–256 character local bearer token; it is never logged.');
  if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Invalid local port');
  for(const origin of origins){const url=new URL(origin);if(url.origin!==origin||!['http:','https:'].includes(url.protocol))throw new Error('Origins must be exact HTTP(S) origins');}
  const allowedOrigins=new Set(origins),model=await loadPublicModel(),claimId=z.enum(model.objects.map(x=>x.id));
  const explainSchema=z.strictObject({claim_id:claimId,question:z.string().trim().min(1).max(2000),language:z.enum(['en','ro'])});
  const experimentSchema=z.strictObject({claim_id:claimId,experiment_id:z.string().max(64),parameters:z.record(z.string().max(48),z.number().finite()).optional(),engine:z.enum(['javascript','wolfram'])});
  let active=0,explanationActive=false;
  const server=createServer(async(req,res)=>{
    const actualPort=server.address()?.port;
    const allowedHosts=new Set([`127.0.0.1:${actualPort}`,`localhost:${actualPort}`]);
    if(!allowedHosts.has(req.headers.host))return reply(res,403,error('HOST_REJECTED'));
    const origin=req.headers.origin;
    if(origin!==undefined&&!allowedOrigins.has(origin))return reply(res,403,error('ORIGIN_REJECTED'));
    if(origin){res.setHeader('access-control-allow-origin',origin);res.setHeader('vary','Origin');}
    if(req.method==='OPTIONS'){
      if(!origin)return reply(res,403,error('ORIGIN_REQUIRED'));
      res.setHeader('access-control-allow-methods','GET, POST, OPTIONS');
      res.setHeader('access-control-allow-headers','Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id');
      res.setHeader('access-control-max-age','600');res.writeHead(204);return res.end();
    }
    if(!authorized(req.headers.authorization,token))return reply(res,401,error('AUTH_REQUIRED'));
    if(active>=4)return reply(res,429,error('BUSY'));
    active++;
    try{
      const url=new URL(req.url,'http://127.0.0.1');
      if(url.search)return reply(res,400,error('QUERY_NOT_SUPPORTED'));
      if(req.method==='GET'&&url.pathname==='/api/capabilities'){
        const adapter=await wolframAdapter();
        return reply(res,200,{schema_version:'1.0',source_revision:model.source_revision,mcp:{status:'AVAILABLE',transport:'Streamable HTTP',path:'/mcp',tool_count:11},javascript:{status:'AVAILABLE',experiments:listExperiments(model)},wolfram:adapter?await adapter.inspectWolframAvailability({executable:wolframExecutable}):{status:'UNAVAILABLE'},microsoft:await microsoftAvailability()});
      }
      if(req.method==='GET'&&url.pathname==='/api/microsoft/status')return reply(res,200,{schema_version:'1.0',...await microsoftAvailability()});
      if(!['/mcp','/api/experiment','/api/explain','/api/microsoft/explain'].includes(url.pathname))return reply(res,404,error('NOT_FOUND'));
      if(req.method!=='POST'){res.setHeader('allow','POST');return reply(res,405,error('METHOD_NOT_ALLOWED'));}
      if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??''))return reply(res,415,error('JSON_REQUIRED'));
      if(Number(req.headers['content-length']??0)>MAX_BODY)return reply(res,413,error('BODY_TOO_LARGE'));
      const body=await readJSON(req);
      if(url.pathname==='/mcp'){
        // A fresh stateless SDK server per request: no shared sessions or cross-client state.
        const mcp=await createResearchServer(model),transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
        res.on('close',()=>{transport.close().catch(()=>{});mcp.close().catch(()=>{});});
        await mcp.connect(transport);await transport.handleRequest(req,res,body);return;
      }
      if(url.pathname==='/api/experiment'){
        const parsed=experimentSchema.parse(body),{engine,...request}=parsed;
        normalizeExperimentRequest(model,request); // Validate before any optional process is launched.
        if(engine==='javascript')return reply(res,200,runExperiment(model,request));
        const adapter=await wolframAdapter();
        return reply(res,200,adapter?await adapter.runWolframExperiment(model,request,{executable:wolframExecutable,timeoutMs:10_000}):unavailableWolframResult(model,request));
      }
      const request=explainSchema.parse(body);
      if(explanationActive)return reply(res,429,error('AGENT_BUSY'));
      explanationActive=true;
      try{return reply(res,200,{schema_version:'1.0',...await explainWithMicrosoft(request)});}finally{explanationActive=false;}
    }catch(e){if(!res.headersSent)reply(res,e.status??400,error(e.status===413?'BODY_TOO_LARGE':'REQUEST_REJECTED'));else res.end();}
    finally{active--;}
  });
  server.headersTimeout=10_000;server.requestTimeout=15_000;server.timeout=75_000;server.maxHeadersCount=40;
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return {server,model,url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeIdleConnections();})};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const gateway=await startGateway({token:process.env.TRIAD_LOCAL_TOKEN,port:Number(process.env.TRIAD_PORT??4318),origins:process.env.TRIAD_ALLOWED_ORIGINS?process.env.TRIAD_ALLOWED_ORIGINS.split(','):DEFAULT_ORIGINS,wolframExecutable:process.env.TRIAD_WOLFRAMSCRIPT});
    process.stderr.write(`TRIAD loopback gateway listening at ${gateway.url}. Bearer token required.\n`);
    let closing=false;const close=async()=>{if(closing)return;closing=true;await gateway.close();};
    process.once('SIGINT',close);process.once('SIGTERM',close);
  }catch{process.stderr.write('TRIAD gateway could not start. Check local token, port, public atlas and dependencies.\n');process.exitCode=1;}
}

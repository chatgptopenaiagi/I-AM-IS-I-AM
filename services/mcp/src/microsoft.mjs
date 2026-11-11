import {stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const directory=new URL('../../microsoft/',import.meta.url);
const python=new URL(process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python',directory);
const worker=new URL('worker.py',directory);
async function runtimeAvailable(){
  try {if(!(await stat(python)).isFile()||!(await stat(worker)).isFile())throw new Error();}
  catch{return false;}
  return true;
}
export function normalizeMicrosoftResult(value){
  // AVAILABLE in capabilities means ready to attempt a user-requested call,
  // never a verified model. Preserve the original provider status explicitly.
  if(value.status==='CONFIGURED_UNTESTED')return {...value,provider_status:value.status,status:'AVAILABLE',model_verified:false};
  // A returned model response remains unverified AI wording, not computation.
  if(value.status==='AI_RESPONSE')return {...value,provider_status:value.status,status:'AVAILABLE',verification:'UNVERIFIED_AI_OUTPUT'};
  return value;
}
export async function microsoftAvailability(){return normalizeMicrosoftResult(await invokeWorker({operation:'status'},8_000));}
export async function explainWithMicrosoft(request){return normalizeMicrosoftResult(await invokeWorker({operation:'explain',...request,approved:true},45_000));}
async function invokeWorker(request,timeout){
  if(!await runtimeAvailable())return {status:'UNAVAILABLE',answer:'',computation_executed:false};
  return new Promise(resolve=>{
    let stdout='',size=0,settled=false,timedOut=false;
    const child=spawn(fileURLToPath(python),['-B',fileURLToPath(worker)],{shell:false,windowsHide:true,stdio:['pipe','pipe','pipe'],cwd:fileURLToPath(directory)});
    const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);resolve(value);};
    const failure=status=>({status,answer:'',computation_executed:false,reason:'The configured provider did not return a valid bounded response.'});
    const timer=setTimeout(()=>{timedOut=true;child.kill();},timeout);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data',chunk=>{size+=Buffer.byteLength(chunk,'utf8');if(size>262_144){timedOut=true;child.kill();}else stdout+=chunk;});
    // Provider diagnostics may contain secrets. Deliberately consume without forwarding.
    child.stderr.on('data',()=>{});
    child.on('error',()=>finish(failure('UNAVAILABLE')));
    child.on('close',code=>{
      if(timedOut||code!==0)return finish(failure(timedOut?'TIMEOUT':'ERROR'));
      try{
        const value=JSON.parse(stdout);
        if(typeof value.status!=='string'||(request.operation!=='status'&&(typeof value.answer!=='string'||value.answer.length>100_000)))throw new Error();
        // Only the documented public fields cross the boundary. No stderr, paths or env diagnostics.
        const safe=Object.fromEntries(['status','answer','claim_id','source_revision','source_sha256','source_ids','basis','provider','model','computation_executed','limitations','label','verification','statements','provider_contacted','model_verified','sdk_versions','supported_providers','basis_categories','reason'].filter(k=>Object.hasOwn(value,k)).map(k=>[k,value[k]]));
        finish(safe);
      }catch{finish(failure('ERROR'));}
    });
    child.stdin.on('error',()=>{});
    child.stdin.end(JSON.stringify(request)+'\n');
  });
}

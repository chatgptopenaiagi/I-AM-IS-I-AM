// Optional LOCAL fixed-script execution. No cloud, arbitrary evaluation, shell or packages.
import {spawn} from "node:child_process";
import {stat,realpath} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {normalizeExperimentRequest,runExperiment} from "../../WEB/qfp-lab/js/research-experiments.js";
import {stableResearchJSON} from "../../WEB/qfp-lab/js/research-interface.js";
const script = fileURLToPath(new URL("./run-experiment.wls",import.meta.url));
const MAX_OUTPUT = 65536;

export async function inspectWolframAvailability({executable=process.env.WOLFRAMSCRIPT_PATH}={}) {
  // Explicit operator configuration only; never consult a request-supplied path.
  if (!executable) return {status:"UNAVAILABLE",reason:"No explicit local wolframscript executable is configured; no installation or cloud fallback is attempted."};
  if (typeof executable!=="string" || !path.isAbsolute(executable) || !/^wolframscript(?:\.exe)?$/i.test(path.basename(executable))) return {status:"UNAVAILABLE",reason:"Configure an absolute local wolframscript executable path."};
  try {
    const resolved=await realpath(executable);
    if (!(await stat(resolved)).isFile()) return {status:"UNAVAILABLE",reason:"Configured executable is not a regular file."};
    return {status:"DETECTED_NOT_VERIFIED",reason:"Local executable exists; runtime/activation has not been tested.",executable:resolved};
  } catch { return {status:"UNAVAILABLE",reason:"Configured executable could not be accessed."}; }
}

function execute(executable, input, timeoutMs) {
  return new Promise((resolve,reject) => {
    const child=spawn(executable,["-local","-file",script,"-timeout",String(Math.max(1,Math.floor(timeoutMs/1000)-1)),"-charset","UTF8"],{shell:false,windowsHide:true,detached:process.platform!=="win32",stdio:["pipe","pipe","pipe"]});
    let stdout="",bytes=0,settled=false;
    const finish=(error,result) => {if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(result);};
    const stop = () => {
      if (!child.pid) return;
      if(process.platform==="win32") {
        // Kill only this newly spawned process tree, never a named/global kernel.
        const taskkill=spawn(path.join(process.env.SystemRoot||"C:\\Windows","System32","taskkill.exe"),["/PID",String(child.pid),"/T","/F"],{windowsHide:true,shell:false,stdio:"ignore"});
        taskkill.on("error",()=>child.kill()); taskkill.unref();
      } else {try{process.kill(-child.pid,"SIGKILL");}catch{child.kill("SIGKILL");}}
    };
    const timer=setTimeout(()=>{stop();finish(new Error("Wolfram execution exceeded the configured deadline"));},timeoutMs);
    child.stdout.on("data",chunk=>{if(settled)return;bytes+=chunk.length;if(bytes>MAX_OUTPUT){stop();finish(new Error("Wolfram output exceeded the bounded protocol"));}else stdout+=chunk.toString("utf8");});
    child.stderr.on("data",chunk=>{if(settled)return;bytes+=chunk.length;if(bytes>MAX_OUTPUT){stop();finish(new Error("Wolfram diagnostics exceeded the bounded protocol"));}});
    child.on("error",()=>finish(new Error("Local Wolfram process could not start")));
    child.on("close",code=>finish(code===0?null:new Error("Local Wolfram process failed; no result is accepted"),stdout));
    child.stdin.on("error",()=>{});
    child.stdin.end(JSON.stringify(input));
  });
}

export function parseWolframOutput(text, expectedInput, sourceRevision, expectedOutput) {
  if(typeof text!=="string"||Buffer.byteLength(text)>MAX_OUTPUT)throw new TypeError("Invalid bounded Wolfram output");
  const raw=JSON.parse(text.trim());
  if(!raw||raw.schema_version!=="1.0"||raw.engine!=="wolfram"||raw.source_revision!==sourceRevision||stableResearchJSON(raw.input)!==stableResearchJSON(expectedInput))throw new TypeError("Wolfram result identity does not match the requested experiment");
  if(typeof raw.runtime?.version!=="string"||raw.runtime.version.length>500||typeof raw.runtime?.system!=="string"||raw.runtime.system.length>200)throw new TypeError("Missing Wolfram runtime evidence");
  function shape(actual,expected) {
    if(typeof expected==="number") {if(typeof actual!=="number"||!Number.isFinite(actual))throw new TypeError("Expected finite numerical output");return;}
    if(expected===null||typeof expected!=="object") {if(typeof actual!==typeof expected)throw new TypeError("Output type mismatch");return;}
    if(!actual||typeof actual!=="object"||Array.isArray(actual)!==Array.isArray(expected)||Object.keys(actual).sort().join("\0")!==Object.keys(expected).sort().join("\0"))throw new TypeError("Output structure mismatch");
    for(const key of Object.keys(expected))shape(actual[key],expected[key]);
  }
  shape(raw.output,expectedOutput);
  return raw;
}

export function compareEngineOutputs(reference, actual) {
  const checks=[];
  function walk(a,b,where) {
    if(typeof a==="number") {
      const tolerance=1e-10*Math.max(Math.abs(a),Math.abs(b));
      checks.push({path:where,pass:Math.abs(a-b)<=tolerance,absolute_error:Math.abs(a-b),allowed_error:tolerance});
    } else if(a!==null&&typeof a==="object") {for(const key of Object.keys(a))walk(a[key],b[key],where+"."+key);}
    else checks.push({path:where,pass:a===b});
  }
  walk(reference,actual,"output");
  return {pass:checks.every(x=>x.pass),checks,tolerance:{relative:1e-10,absolute:0,rule:"abs(a-b) <= 1e-10 * max(abs(a),abs(b)); strings/booleans/zero are exact"},scope:"Independent implementation agreement, not empirical validation"};
}

export async function runWolframExperiment(model, request, options={}) {
  const input=normalizeExperimentRequest(model,request), timeoutMs=options.timeoutMs??10000;
  if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>30000)throw new RangeError("Timeout must be 1000–30000 ms");
  const availability=await inspectWolframAvailability(options);
  if(availability.status==="UNAVAILABLE")return {schema_version:"1.0",source_revision:model.source_revision,status:"UNAVAILABLE",engine:null,input,reason:availability.reason,validation:{independent_engine:"NOT_RUN",empirical_support:false},limitations:["No Wolfram result, graphic, version or cross-engine agreement was measured."]};
  const reference=runExperiment(model,input);
  try {
    const text=await execute(availability.executable,{schema_version:"1.0",source_revision:model.source_revision,...input},timeoutMs);
    const raw=parseWolframOutput(text,input,model.source_revision,reference.output);
    const comparison=compareEngineOutputs(reference.output,raw.output);
    return {...reference,engine:"wolfram",status:"COMPUTED",output:raw.output,runtime:raw.runtime,process:{...reference.process,module:"services/wolfram/TriadModels.wl",functions:["TriadExperiment"],precision:"Wolfram machine arithmetic; actual version recorded in runtime",method:"Independent fixed Wolfram Language implementation of declared formulas"},validation:{status:"COMPUTED",input_domain:"PASSED",empirical_support:false,independent_engine:comparison.pass?"AGREES_WITH_JAVASCRIPT":"DISAGREES_WITH_JAVASCRIPT",comparison},limitations:[...reference.limitations,"Agreement compares two implementations of the same formulas; it does not prove the formulas or physical interpretation."]};
  }catch(error){return {schema_version:"1.0",source_revision:model.source_revision,status:"FAILED",engine:null,input,reason:error instanceof SyntaxError?"Wolfram returned invalid JSON":error.message,validation:{independent_engine:"NOT_VERIFIED",empirical_support:false},limitations:["No successful Wolfram result is claimed."]};}
}

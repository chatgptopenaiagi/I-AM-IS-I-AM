import {App} from '@modelcontextprotocol/ext-apps';
const app = new App({name:'TRIAD research lab',version:'1.0.0'});
const el=id=>document.getElementById(id);
let current=null, descriptors=[], revision=null, generation=0;
const showStatus=text=>{el('status').textContent=text;};
const unpack=result=>{
  if(result.isError) throw new Error('The server rejected this request.');
  const envelope=result.structuredContent;
  if(envelope?.schema_version!=='1.0'||!envelope.data)throw new Error('Unsupported research response.');
  revision=envelope.source_revision;return envelope.data;
};
async function call(name,args){return unpack(await app.callServerTool({name,arguments:args}));}
function selectOptions(select,records,label,value){select.replaceChildren(...records.map(item=>{const option=document.createElement('option');option.value=item[value];option.textContent=item[label];return option;}));}
function renderParameters(){
  const descriptor=descriptors.find(d=>d.experiment_id===el('experiment').value);
  el('parameters').replaceChildren();
  for(const [name,schema] of Object.entries(descriptor?.parameters.properties??{})){
    const label=document.createElement('label');label.textContent=name;
    const input=document.createElement('input');input.type='number';input.name=name;input.min=schema.minimum;input.max=schema.maximum;input.step=schema.type==='integer'?'1':'any';input.value=schema.default;input.required=true;label.append(document.createElement('br'),input);el('parameters').append(label);
  }
  el('run').disabled=!descriptor;el('experiment').disabled=!descriptor;
}
function renderObject(object,experiments){
  current=object;descriptors=experiments.filter(d=>d.claim_id===object.id);
  el('title').textContent=object.title;el('statement').textContent=object.statement;
  el('axes').replaceChildren(...[object.object_type??'Object type not assigned',object.epistemic_status??'No truth claim status'].map(value=>{const tag=document.createElement('span');tag.className='axis';tag.textContent=value;return tag;}));
  el('record').textContent=JSON.stringify({id:object.id,domain:object.domain,depends_on:object.depends_on,assumptions:object.assumptions,units:object.units,units_status:object.units_status,validation:object.validation,limitations:object.limitations,source_ids:object.source_ids},null,2);
  selectOptions(el('experiment'),descriptors,'title','experiment_id');renderParameters();el('context').disabled=false;
  el('result').textContent=descriptors.length?'No computation has run for this selection.':'No implemented experiment for this object. Its philosophical or scientific statement has not been computed.';
}
function initial(data){
  if(!data.objects||!data.selected)return;
  generation++;
  selectOptions(el('object'),data.objects.map(o=>({...o,option:`${o.id} · ${o.title}`})),'option','id');el('object').value=data.selected.id;el('object').disabled=false;
  renderObject(data.selected,data.experiments);showStatus(`Public source revision: ${revision}`);
}
app.ontoolresult=result=>{try{initial(unpack(result));}catch{showStatus('Could not read the research response.');}};
el('object').addEventListener('change',async()=>{const mark=++generation;el('run').disabled=true;el('context').disabled=true;try{showStatus('Reading source record…');const data=await call('research_get_claim',{claim_id:el('object').value});if(mark!==generation)return;renderObject(data.object,data.experiments);showStatus(`Public source revision: ${revision}`);}catch{if(mark===generation)showStatus('The selected record could not be loaded.');}});
el('experiment').addEventListener('change',renderParameters);
el('parameters').addEventListener('input',()=>{generation++;el('result').textContent='Parameters changed. No computation has run for these inputs.';el('run').disabled=!descriptors.length;showStatus('Ready to run the changed parameters.');});
el('run').addEventListener('click',async()=>{
  const inputs=[...el('parameters').querySelectorAll('input')];if(inputs.some(input=>!input.reportValidity()))return;
  const mark=generation;
  el('run').disabled=true;showStatus('Computing the bounded model…');
  try{const data=await call('research_run_experiment',{claim_id:current.id,experiment_id:el('experiment').value,parameters:Object.fromEntries(inputs.map(input=>[input.name,Number(input.value)]))});if(mark!==generation)return;el('result').textContent=JSON.stringify(data.experiment,null,2);showStatus('Calculation returned. Review its assumptions and limitations.');}catch{if(mark===generation)showStatus('Calculation rejected or unavailable. No result is claimed.');}finally{if(mark===generation)el('run').disabled=false;}
});
el('context').addEventListener('click',async()=>{try{await app.updateModelContext({content:[{type:'text',text:JSON.stringify({claim_id:current.id,source_revision:revision,object_type:current.object_type,epistemic_status:current.epistemic_status,source_ids:current.source_ids})}]});showStatus('Selection shared with the host conversation.');}catch{showStatus('This host could not accept selection context.');}});
try{await app.connect();if(!current)showStatus('Connected. Waiting for the research tool result…');}catch{showStatus('Open this resource in an MCP Apps compatible host. No standalone backend connection is attempted.');}

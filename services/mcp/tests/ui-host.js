// Test-only host: actual official MCP Apps bridge; tool calls go to a real SDK client.
import {AppBridge,PostMessageTransport} from '@modelcontextprotocol/ext-apps/app-bridge';
const frame=document.getElementById('lab');
const bridge=new AppBridge(null,{name:'TRIAD browser validation host',version:'1.0.0'},{serverTools:{},updateModelContext:{}});
bridge.oncalltool=async params=>window.testToolCall(params);
bridge.onupdatemodelcontext=async params=>{window.receivedContext=params;return {};};
bridge.oninitialized=async()=>{
  await bridge.sendToolInput({arguments:{}});
  await bridge.sendToolResult(await window.testToolCall({name:'research_open_lab',arguments:{}}));
};
await bridge.connect(new PostMessageTransport(frame.contentWindow,frame.contentWindow));
frame.srcdoc=await window.testReadApp();

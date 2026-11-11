import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {chromium} from 'playwright'; // Existing root development dependency; no second browser download.
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {startGateway} from '../src/http.mjs';
import {APP_URI} from '../src/server.mjs';

test('actual MCP App bridge renders and invokes real SDK tools in Chromium',{timeout:30_000},async()=>{
  const token='browser-test-only-credential-0123456789';
  const gateway=await startGateway({token});const client=new Client({name:'triad-browser-test',version:'1.0.0'});
  let browser,host;
  try{
    await client.connect(new StreamableHTTPClientTransport(new URL(gateway.url+'/mcp'),{requestInit:{headers:{authorization:'Bearer '+token}}}));
    const bundle=await build({entryPoints:[fileURLToPath(new URL('./ui-host.js',import.meta.url))],bundle:true,format:'esm',platform:'browser',write:false});
    const html='<!doctype html><html><body><iframe id="lab" title="TRIAD research lab" sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe><script type="module">'+bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script></body></html>';
    host=createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(html);});await new Promise(r=>host.listen(0,'127.0.0.1',r));
    browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})});
    const page=await browser.newPage({viewport:{width:980,height:1100}});const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.exposeFunction('testToolCall',params=>client.callTool(params));
    await page.exposeFunction('testReadApp',async()=>(await client.readResource({uri:APP_URI})).contents[0].text);
    await page.goto(`http://127.0.0.1:${host.address().port}`);
    const frame=page.frameLocator('#lab');
    await frame.locator('#object:not([disabled])').waitFor({timeout:8000}).catch(async e=>{console.error('MCP App page errors:',errors);console.error('MCP App visible status:',await frame.locator('#status').textContent().catch(()=>null));throw e;});
    assert.equal(await frame.locator('#object option').count(),34);
    await frame.locator('#parameters input[name=s]').fill('0');await frame.locator('#run').click();
    await frame.locator('#result').filter({hasText:'"empirical_support": false'}).waitFor();
    const result=JSON.parse(await frame.locator('#result').innerText());assert.equal(result.output.slice.radius,1);
    await frame.locator('#object').selectOption('ATLAS-BEING');await frame.locator('#result').filter({hasText:'No implemented experiment'}).waitFor();assert.equal(await frame.locator('#run').isDisabled(),true);
    await frame.locator('#context').click();await page.waitForFunction(()=>window.receivedContext?.content?.length>0);
    assert.equal(JSON.parse((await page.evaluate(()=>window.receivedContext)).content[0].text).claim_id,'ATLAS-BEING');
    assert.deepEqual(errors,[]);
  }finally{await browser?.close();if(host)await new Promise(r=>host.close(r));await client.close();await gateway.close();}
});

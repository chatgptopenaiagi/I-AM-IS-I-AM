import {test,expect} from '@playwright/test';
import {startGateway} from '../../../../services/mcp/src/http.mjs';

const token='triad-browser-fixture-only-not-a-real-secret-012345';
let gateway,previousProvider;
test.beforeAll(async()=>{
  // Process-local test configuration, never a workstation/system environment change.
  // A real isolated worker checks this deliberately unconfigured provider.
  previousProvider=process.env.TRIAD_MICROSOFT_PROVIDER;
  process.env.TRIAD_MICROSOFT_PROVIDER='';
  gateway=await startGateway({token,wolframExecutable:''});
});
test.afterAll(async()=>{
  try{await gateway?.close();}finally{
    if(previousProvider===undefined)delete process.env.TRIAD_MICROSOFT_PROVIDER;
    else process.env.TRIAD_MICROSOFT_PROVIDER=previousProvider;
  }
});

test('real local gateway connects, computes, reports optional services honestly, and disconnects',async({page})=>{
  const errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>requests.push(request.url()));
  await page.goto('./triad.html');
  await expect(page.locator('#selected-id')).toHaveText('QFP-D005');
  expect(requests.some(url=>url.startsWith(gateway.url))).toBeFalsy();
  await page.locator('#gateway-url').fill(gateway.url);
  await page.locator('#gateway-token').fill(token);
  await page.locator('#connect-gateway').click();
  await expect(page.locator('#gateway-result')).toContainText('Gateway checked');
  await expect(page.locator('#mcp-status')).toContainText('AVAILABLE');
  await expect(page.locator('#microsoft-status')).toContainText('NOT CONFIGURED');
  await expect(page.locator('#wolfram-status')).toContainText('UNAVAILABLE');
  await expect(page.locator('#ask-agent')).toBeDisabled();
  await expect(page.locator('#run-wolfram')).toBeDisabled();

  // A genuine same-browser cross-origin request: real CORS/auth/shared JS computation.
  const computation=await page.evaluate(async({url,token})=>{
    const response=await fetch(url+'/api/experiment',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({claim_id:'ATLAS-BALL-PROJECTION',experiment_id:'ball-projection',parameters:{s:0},engine:'javascript'})});
    return {status:response.status,record:await response.json()};
  },{url:gateway.url,token});
  expect(computation.status).toBe(200);
  expect(computation.record.engine).toBe('javascript');
  expect(computation.record.input.claim_id).toBe('ATLAS-BALL-PROJECTION');
  expect(computation.record.output.slice.radius).toBe(1);
  expect(computation.record.validation.empirical_support).toBe(false);

  await page.locator('[data-topic="projection"]').click();
  await page.locator('#triad-param-s').fill('0');
  await page.locator('#triad-param-s').blur();
  const local=JSON.parse(await page.locator('#experiment-record').textContent());
  expect(computation.record).toEqual(local);
  expect(page.url()).not.toContain(token);
  const storage=await page.evaluate(()=>({local:JSON.stringify(localStorage),session:JSON.stringify(sessionStorage)}));
  expect(storage.local).not.toContain(token);expect(storage.session).not.toContain(token);
  await page.locator('#disconnect-gateway').click();
  await expect(page.locator('#gateway-token')).toHaveValue('');
  await expect(page.locator('#mcp-status')).toContainText('NOT CONFIGURED');
  await expect(page.locator('#ask-agent')).toBeDisabled();
  await page.locator('#run-browser').click();
  await expect(page.locator('#experiment-record')).toContainText('"engine": "javascript"');
  expect(errors).toEqual([]);
});

// Local end-to-end verification. The preview uses real SQLite and the Worker,
// but notification delivery is mocked and must never be called production proof.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AFFORDIA_PLAYWRIGHT_PATH || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.AFFORDIA_BROWSER_PATH});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4173';
try {
  for(const width of [320,360,375,390,414,768,1280]){
    await page.setViewportSize({width,height:844});
    for(const locale of ['','/de','/es','/zh-CN']) {
      for(const route of ['/','/services/','/contact/','/book-a-free-consultation/']){
        await page.goto(base+locale+route,{waitUntil:'load'});
        const dimensions=await page.evaluate(()=>({viewport:innerWidth,actual:document.documentElement.scrollWidth}));
        assert(dimensions.actual<=dimensions.viewport+1,`${width}px ${locale}${route}: overflow ${dimensions.actual}`);
      }
      if(width<=1440){await page.locator('.mobile-menu summary').click();assert(await page.locator('.mobile-menu').evaluate(e=>e.open));}
    }
  }
  await page.setViewportSize({width:390,height:844});
  const scenarios=[
    {locale:'de',country:'Deutschland',service:'eye',contacts:[['whatsapp','+49 151 23456789'],['email','person@example.invalid']]},
    {locale:'de',country:'Schweiz',service:'post-treatment',contacts:[['telephone','+41 44 555 01 02'],['whatsapp','+41 79 123 45 67'],['wechat','demo_wechat']]},
    {locale:'es',country:'Canadá',service:'aesthetic',contacts:[['whatsapp','+1 416 555 0123']]},
    {locale:'zh-CN',country:'Singapore',service:'unsure',contacts:[['email','person@example.invalid']]},
    {locale:'en',country:'Germany',service:'medical',contacts:[['email','person@example.invalid']]},
  ];
  for(const scenario of scenarios){
    const prefix=scenario.locale==='en'?'':`/${scenario.locale}`;
    await page.goto(`${base}${prefix}/book-a-free-consultation/`,{waitUntil:'load'});
    const form=page.locator('.consultation-form');
    await form.locator('input[autocomplete="name"]').fill('Example Person');
    await form.locator('input[autocomplete="country-name"]').fill(scenario.country);
    await form.locator(':scope > label > select').selectOption(scenario.service);
    for(let i=0;i<scenario.contacts.length;i++){
      if(i) await form.locator(':scope > fieldset > button').click();
      const row=form.locator(':scope > fieldset > fieldset').nth(i);
      await row.locator('select').selectOption(scenario.contacts[i][0]);
      await row.locator('input:not([type=radio])').fill(scenario.contacts[i][1]);
    }
    if(scenario.contacts.length>1) await form.locator(':scope > fieldset > fieldset').last().locator('input[type=radio]').check();
    await form.locator('textarea').first().fill('I would like to understand the available coordination and travel options.');
    await form.locator('textarea').last().fill('What are the next steps and likely costs?');
    await form.locator('input[type=checkbox]').check();
    const responsePromise=page.waitForResponse(r=>r.url()===`${base}/api/consultation` && r.request().method()==='POST');
    await form.locator('button[type=submit]').click();
    const response=await responsePromise; assert.equal(response.status(),201,scenario.locale);
    const submitted=response.request().postDataJSON(); assert.equal(submitted.contacts.length,scenario.contacts.length);
    assert.equal(submitted.contacts.filter(c=>c.preferred).length,1); assert.equal(submitted.contacts.find(c=>c.preferred).type,scenario.contacts[scenario.contacts.length-1][0]);
    const body=await response.json(); assert.equal(body.notification,'sent'); assert(body.reference);
    assert(await page.locator('.form-success').isVisible());
  }
  await page.request.post(`${base}/__test/notification?fail=1`);
  await page.goto(`${base}/book-a-free-consultation/`,{waitUntil:'load'});
  const failedForm=page.locator('.consultation-form');
  await failedForm.locator('input[autocomplete="name"]').fill('Notification Test');
  await failedForm.locator('input[autocomplete="country-name"]').fill('Germany');
  await failedForm.locator(':scope > fieldset > fieldset input:not([type=radio])').fill('person@example.invalid');
  await failedForm.locator('input[type=checkbox]').check();
  const failedResponse=page.waitForResponse(r=>r.url()===`${base}/api/consultation` && r.request().method()==='POST');
  await failedForm.locator('button[type=submit]').click();
  assert.equal((await (await failedResponse).json()).notification,'failed');
  assert((await page.locator('.form-success').innerText()).includes('could not confirm notification delivery'));
  await page.request.post(`${base}/__test/notification?fail=0`);
  await page.goto(`${base}/book-a-free-consultation/`,{waitUntil:'load'});
  const form=page.locator('.consultation-form');
  await form.locator('input[autocomplete="name"]').focus(); await page.keyboard.press('Tab');
  assert(await form.locator('input[autocomplete="country-name"]').evaluate(e=>e===document.activeElement));
  const addContact=form.locator(':scope > fieldset > button'); await addContact.focus(); await page.keyboard.press('Space');
  assert.equal(await form.locator(':scope > fieldset > fieldset').count(),2);
  await form.locator(':scope > fieldset > fieldset').last().locator('input[type=radio]').check();
  await form.locator(':scope > fieldset > fieldset').last().locator('button').click();
  assert(await form.locator(':scope > fieldset > fieldset').first().locator('input[type=radio]').isChecked());
  await form.locator('button[type=submit]').click(); assert(await form.locator('[role=alert]').isVisible());
  await form.locator('input[autocomplete="name"]').fill('Test Retention');
  await form.locator('input[autocomplete="country-name"]').fill('Germany');
  await form.locator(':scope > fieldset > fieldset input:not([type=radio])').fill('person@example.invalid');
  await form.locator('input[type=checkbox]').check();
  await page.route('**/api/consultation',route=>route.abort());
  await form.locator('button[type=submit]').click(); await form.locator('[role=alert]').waitFor();
  assert.equal(await form.locator('input[autocomplete="name"]').inputValue(),'Test Retention');
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const fallback=await noJs.newPage(); await fallback.goto(`${base}/book-a-free-consultation/`,{waitUntil:'load'});
  assert(!(await fallback.locator('.consultation-form').isVisible()));
  assert(await fallback.locator('a[href="mailto:affordiahealth@gmail.com"]').first().isVisible());
  await noJs.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: 7 widths x 4 routes x 4 locales, mobile menu, five browser journeys, validation and preserved inputs on network failure. Local in-memory storage; mocked notification.');
} finally {await browser.close();}

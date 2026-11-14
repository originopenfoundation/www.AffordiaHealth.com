import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AFFORDIA_PLAYWRIGHT_PATH || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.AFFORDIA_BROWSER_PATH});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=`http://127.0.0.1:${process.env.AFFORDIA_PREVIEW_PORT||4173}`;
try {
  for(const width of [320,360,390,428,768,1024,1280,1920]) {
    await page.setViewportSize({width,height:900});
    for(const locale of ['', '/de', '/es', '/zh-CN']) {
      for(const route of ['/','/services/','/faq/','/contact/','/book-a-free-consultation/']) {
        await page.goto(`${base}${locale}${route}`);
        const [viewport,actual]=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
        assert(actual<=viewport+1,`Overflow ${width} ${locale}${route}: ${actual}`);
        if(route==='/faq/') assert.equal(await page.locator('.faq-additions article').count(),28,`${locale} FAQ count`);
      }
      const visible=page.locator('.language-switcher:visible');
      assert.equal(await visible.count(),1);
      await visible.locator('summary').click(); assert(await visible.evaluate(el=>el.open));
      for(const [language,expected] of [['en','/book-a-free-consultation/'],['de','/de/book-a-free-consultation/'],['es','/es/book-a-free-consultation/'],['zh-CN','/zh-CN/book-a-free-consultation/']]) assert.equal(await visible.locator(`a[lang="${language}"]`).getAttribute('href'),expected);
      const target=visible.locator('a[lang="es"]');
      assert.equal(await target.getAttribute('href'),'/es/book-a-free-consultation/');
      await target.click();assert.equal(new URL(page.url()).pathname,'/es/book-a-free-consultation/');
      const copy=page.locator('.copy-email button');await copy.click();
      assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'affordiahealth@gmail.com');
      assert((await page.locator('.copy-email [role=status]').innerText()).length>0);
      assert.equal(await page.locator('.consultation-form').count(),0);
      const menu=page.locator('.language-switcher:visible'); await menu.locator('summary').focus(); await page.keyboard.press('Enter');
      assert(await menu.evaluate(el=>el.open)); await page.keyboard.press('Escape'); assert(!(await menu.evaluate(el=>el.open)));
    }
  }
  await page.goto(`${base}/contact/`);
  const social=page.locator('a[href="https://x.com/AffordiaHealth"]');assert.equal(await social.count(),2);
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await noJs.newPage();
  await staticPage.goto(`${base}/de/services/`);const staticMenu=staticPage.locator('.language-switcher:visible');await staticMenu.locator('summary').click();
  assert.equal(await staticMenu.locator('a[lang="zh-CN"]').getAttribute('href'),'/zh-CN/services/');
  await staticPage.goto(`${base}/contact/`);assert(!(await staticPage.locator('.copy-email').isVisible()));assert(await staticPage.locator('a[href="mailto:affordiahealth@gmail.com"]').first().isVisible());await noJs.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: 8 viewports, 4 locales, 5 routes, actual locale switch, clipboard and social links. Email delivery not tested.');
} finally { await browser.close(); }

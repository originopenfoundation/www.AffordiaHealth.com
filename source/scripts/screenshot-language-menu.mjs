import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.AFFORDIA_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.AFFORDIA_BROWSER_PATH});
try{const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});await page.goto('http://127.0.0.1:4173/');await page.locator('.language-switcher:visible summary').click();await page.screenshot({path:'../tmp/pdfs/affordia-language-menu-mobile.png'});}finally{await browser.close();}

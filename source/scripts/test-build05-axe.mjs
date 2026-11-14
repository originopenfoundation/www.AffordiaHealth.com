import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.AFFORDIA_PLAYWRIGHT_PATH||'playwright');const axe=require.resolve('axe-core/axe.min.js');
const browser=await chromium.launch({headless:true,executablePath:process.env.AFFORDIA_BROWSER_PATH});const page=await browser.newPage();const results=[];
const base=`http://127.0.0.1:${process.env.AFFORDIA_PREVIEW_PORT||4173}`;
try{for(const width of [390,1280]){await page.setViewportSize({width,height:900});for(const locale of ['','/de','/es','/zh-CN'])for(const route of ['/','/services/','/faq/','/contact/','/book-a-free-consultation/']){
 await page.goto(`${base}${locale}${route}`);await page.addScriptTag({path:axe});
 const v=await page.evaluate(async()=>{const x=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return x.violations.map(z=>({id:z.id,impact:z.impact,nodes:z.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
 if(v.length)results.push({width,locale:locale||'/en',route,violations:v});
}}
const unique={};for(const r of results)for(const v of r.violations)for(const n of v.nodes){const k=`${v.id}: ${n.target.join(' ')}`;unique[k]??={impact:v.impact,summary:n.summary};}
console.log(JSON.stringify({tested:40,failedPages:results.length,unique},null,2));if(results.length)process.exitCode=1;
}finally{await browser.close();}

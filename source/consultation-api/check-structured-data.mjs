import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const xml=fs.readFileSync('out/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,160);
let breadcrumbs=0,services=0,organizations=0;
for(const url of urls){
  const pathname=new URL(url).pathname;
  const html=fs.readFileSync(path.join('out',pathname,'index.html'),'utf8');
  const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const graph=blocks.flatMap(x=>x['@graph']||[]);
  const isHome=/^\/(?:de\/|es\/|zh-CN\/)?$/.test(pathname);
  if(isHome){assert(graph.some(x=>x['@type']==='Organization'));organizations++;}
  else {const crumb=graph.find(x=>x['@type']==='BreadcrumbList');assert(crumb,`missing breadcrumb ${url}`);assert.equal(crumb.itemListElement[1].item,url);breadcrumbs++;}
  if(/\/services\/$/.test(pathname)){assert(graph.some(x=>x['@type']==='Service'&&x.url===url));services++;}
}
console.log(JSON.stringify({pages:urls.length,breadcrumbs,servicePages:services,organizationPages:organizations,result:'passed'}));

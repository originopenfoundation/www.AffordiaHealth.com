import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root=path.resolve('out');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const hash=s=>createHash('sha256').update(s).digest('hex');
const snapshot={urls:[],titles:{},documents:{},protectedSource:{}};
for(const url of urls){
  const u=new URL(url);const file=path.join(root,decodeURIComponent(u.pathname),'index.html');const h=fs.readFileSync(file,'utf8');
  snapshot.urls.push(url);
  const title=h.match(/<title>(.*?)<\/title>/)?.[1]; if(title)(snapshot.titles[title]??=[]).push(url);
  const body=h.match(/<div class="document-body">([\s\S]*?)<\/div>/)?.[1]; if(body)snapshot.documents[url]=hash(body);
}
for(const file of ['app/pdf-library.generated.json','app/site-data.ts','app/i18n/de.json','app/i18n/es.json','app/i18n/zh-CN.json'])snapshot.protectedSource[file]=hash(fs.readFileSync(file));
const out=process.argv[2];if(out)fs.writeFileSync(out,JSON.stringify(snapshot,null,2));
const groups=Object.values(snapshot.titles).filter(v=>v.length>1);
console.log(JSON.stringify({urls:urls.length,documentVersions:Object.keys(snapshot.documents).length,duplicateGroups:groups.length,duplicatePages:groups.reduce((n,g)=>n+g.length,0)}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out');const domain='https://affordiahealth.com';
const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,160);assert.equal(new Set(urls).size,urls.length);
const urlset=new Set(urls);const titles=new Map();let checked=0;
for(const url of urls) {
  const pathname=new URL(url).pathname;const file=path.join(root,decodeURIComponent(pathname),'index.html');
  const h=fs.readFileSync(file,'utf8');const links=[...h.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
  const title=h.match(/<title>([^<]+)<\/title>/i)?.[1];
  assert(title,`missing title: ${url}`);
  assert(!titles.has(title),`duplicate title on ${titles.get(title)} and ${url}`);
  titles.set(title,url);
  const canon=links.filter(x=>/rel="canonical"/i.test(x));assert.equal(canon.length,1,url);
  assert(canon[0].includes(`href="${url}"`),`canonical mismatch: ${url}`);
  assert(!/<meta[^>]+name="robots"[^>]+noindex/i.test(h),`noindex: ${url}`);
  const prefix=pathname.match(/^\/(de|es|zh-CN)\//)?.[0]??'/';
  const canonicalPath=prefix==='/'?pathname:'/'+pathname.slice(prefix.length);
  const targets={en:domain+canonicalPath,de:domain+'/de'+canonicalPath,es:domain+'/es'+canonicalPath,'zh-CN':domain+'/zh-CN'+canonicalPath,'x-default':domain+canonicalPath};
  for(const [lang,target] of Object.entries(targets)) {
    const matches=links.filter(x=>new RegExp(`hrefLang="${lang}"`,'i').test(x));
    assert.equal(matches.length,1,`hreflang ${lang} count: ${url}`);
    assert(matches[0].includes(`href="${target}"`),`hreflang ${lang} target: ${url}`);
    assert(urlset.has(target),`hreflang target missing from sitemap: ${target}`);
  }
  assert(/<main id="main-content"/.test(h),`missing semantic main: ${url}`);checked++;
}
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');assert(robots.includes('Sitemap: '+domain+'/sitemap.xml'));
console.log(JSON.stringify({pages:checked,sitemap:urls.length,uniqueTitles:titles.size,selfCanonical:true,reciprocalHreflang:true,xDefaultEnglish:true,noindex:false,result:'passed'}));

// Release gate for a separately prepared, unpublished locale. Never generates or deploys pages.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const [manifestPath,exportDirectory]=process.argv.slice(2);
if(!manifestPath||!exportDirectory)throw new Error('Usage: node scripts/check-locale-candidate.mjs manifest.json isolated-export-directory');
const m=JSON.parse(await readFile(manifestPath,'utf8'));
const locale=Intl.getCanonicalLocales(m.locale)[0];
assert(locale && !['en','de','es','zh-CN'].includes(locale),'Candidate must be a new valid locale.');
assert.equal(m.ownerApproved,true,'Owner approval is required.');
assert.equal(m.specialistReviewed,true,'Independent review of sensitive content is required.');
assert.equal(m.contactSupportVerified,true,'Customer support and safe handling must be verified.');
assert.equal(m.manualComponentsReviewed,true,'Manually maintained copy outside the main catalog must be reviewed.');
assert(typeof m.reviewEvidence==='string' && m.reviewEvidence.trim().length>=10,'Reference the review evidence.');
const sourceBytes=await readFile(new URL('../app/i18n/source.json',import.meta.url));
assert.equal(m.canonicalSourceSha256,createHash('sha256').update(sourceBytes).digest('hex'),'Canonical source changed after review.');
const manualFiles=['faq-additions.tsx','local-coordination.tsx','consultation-email-fallback.tsx','copy-email.tsx'];
const manualHash=createHash('sha256');for(const file of manualFiles){manualHash.update(file+'\0');manualHash.update(await readFile(new URL(`../app/${file}`,import.meta.url)));}
assert.equal(m.manualSourceSha256,manualHash.digest('hex'),'Manually maintained source changed after review.');
const source=JSON.parse(sourceBytes);const catalog=JSON.parse(await readFile(path.resolve(path.dirname(manifestPath),m.catalog),'utf8'));
for(const item of source)assert(typeof catalog[item.id]==='string' && catalog[item.id].trim().length>0,`Missing translation ${item.id}`);
const base=JSON.parse(await readFile(new URL('../app/pdf-library.generated.json',import.meta.url)));assert(base.length===24,'Expected document library not found.');
const root=path.resolve(exportDirectory);const xml=await readFile(path.join(root,'sitemap.xml'),'utf8');
const prefix=`/${locale}/`;const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]).filter(x=>new URL(x).pathname.startsWith(prefix));
assert.equal(urls.length,40,'A candidate needs all 40 expected locale routes in an isolated export.');assert.equal(new Set(urls).size,urls.length);
const baselineXml=await readFile(new URL('../out/sitemap.xml',import.meta.url),'utf8');
const english=[...baselineXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>new URL(x[1]).pathname).filter(p=>!/^\/(de|es|zh-CN)\//.test(p));
assert.equal(english.length,40,'The current baseline must contain 40 English routes.');
const expected=new Set(english.map(p=>`https://affordiahealth.com/${locale}${p}`));
assert(urls.every(u=>expected.has(u)),'Candidate paths differ from the baseline routes.');
for(const url of urls){const u=new URL(url);assert.equal(u.origin,'https://affordiahealth.com');const f=path.resolve(root,'.'+decodeURIComponent(u.pathname),'index.html');assert(f.startsWith(root+path.sep),'Invalid page path');const h=await readFile(f,'utf8');assert(h.includes('<main id="main-content"'),`Missing main: ${url}`);assert(h.includes(`rel="canonical" href="${url}"`),`Missing self-canonical: ${url}`);assert(h.includes('hreflang="x-default"')||h.includes('hrefLang="x-default"'),`Missing x-default: ${url}`);}
console.log(JSON.stringify({locale,pages:urls.length,strings:source.length,result:'candidate-structural-gate-passed',notice:'A structural gate is not proof of translation quality, actual delivery, accessibility or production approval.'}));

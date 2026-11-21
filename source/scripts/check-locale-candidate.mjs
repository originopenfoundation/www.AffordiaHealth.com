// Release gate for a separately prepared, unpublished locale. Never generates or deploys pages.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { applicationSourceHash } from './locale-source-hash.mjs';
const [manifestPath,exportDirectory]=process.argv.slice(2);
if(!manifestPath||!exportDirectory)throw new Error('Usage: node scripts/check-locale-candidate.mjs manifest.json isolated-export-directory');
const m=JSON.parse(await readFile(manifestPath,'utf8'));
const locale=Intl.getCanonicalLocales(m.locale)[0];
assert(locale && !['en','de','es','zh-CN'].includes(locale),'Candidate must be a new valid locale.');
const registered=JSON.parse(await readFile(new URL('../app/i18n/approved-locales.json',import.meta.url)));
const localeSpec=registered.find(item=>item.code===locale && item.active===false);
assert(localeSpec,'Candidate must be an approved, inactive locale.');
assert.equal(m.ownerApproved,true,'Owner approval is required.');
assert.equal(m.specialistReviewed,true,'Independent review of sensitive content is required.');
assert.equal(m.contactSupportVerified,true,'Customer support and safe handling must be verified.');
assert.equal(m.manualComponentsReviewed,true,'Manually maintained copy outside the main catalog must be reviewed.');
assert(typeof m.reviewEvidence==='string' && m.reviewEvidence.trim().length>=10,'Reference the review evidence.');
const sourceBytes=await readFile(new URL('../app/i18n/source.json',import.meta.url));
assert.equal(m.canonicalSourceSha256,createHash('sha256').update(sourceBytes).digest('hex'),'Canonical source changed after review.');
assert.equal(m.applicationSourceSha256,await applicationSourceHash(),'Application source changed after review.');
const source=JSON.parse(sourceBytes);
assert(typeof m.catalog==='string' && m.catalog.length>0,'A reviewed catalog is required.');
const catalogBytes=await readFile(path.resolve(path.dirname(manifestPath),m.catalog));
assert.equal(m.reviewedCatalogSha256,createHash('sha256').update(catalogBytes).digest('hex'),'Catalog changed after review.');
const catalog=JSON.parse(catalogBytes);
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
function exportedFile(url) {
  const u = new URL(url); assert.equal(u.origin,'https://affordiahealth.com');
  const file = path.resolve(root,'.'+decodeURIComponent(u.pathname),'index.html');
  assert(file.startsWith(root+path.sep),'Invalid page path'); return file;
}
function alternateLinks(html) {
  const links=new Map();
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attributes=Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)].map(match=>[match[1].toLowerCase(),match[3]]));
    if(attributes.rel?.toLowerCase()!=='alternate' || !attributes.hreflang)continue;
    const code=attributes.hreflang.toLowerCase();
    assert(!links.has(code),`Duplicate alternate language ${code}`);
    links.set(code,attributes.href);
  }
  return links;
}
for(const url of urls){
  const u=new URL(url); const h=await readFile(exportedFile(url),'utf8');
  const htmlTag=h.match(/<html\b[^>]*>/i)?.[0]??'';
  assert(new RegExp(`\\blang=["']${locale}["']`,'i').test(htmlTag),`Missing document language: ${url}`);
  assert(new RegExp(`\\bdir=["']${localeSpec.direction}["']`,'i').test(htmlTag),`Incorrect document direction: ${url}`);
  assert(h.includes('<main id="main-content"'),`Missing main: ${url}`);
  assert(h.includes(`rel="canonical" href="${url}"`),`Missing self-canonical: ${url}`);
  const segment=u.pathname.slice(locale.length+1);
  const variants=Object.fromEntries(['en','de','es','zh-CN',locale].map(code=>[code,`https://affordiahealth.com${code==='en'?'':`/${code}`}${segment}`]));
  const links=alternateLinks(h);
  for(const [code,href] of Object.entries(variants)) assert.equal(links.get(code.toLowerCase()),href,`Missing or incorrect ${code} alternate: ${url}`);
  assert.equal(links.get('x-default'),variants.en,`Incorrect x-default: ${url}`);
  for(const [code,href] of Object.entries(variants)) {
    if(code===locale)continue;
    const other=await readFile(exportedFile(href),'utf8');
    assert.equal(alternateLinks(other).get(locale.toLowerCase()),url,`Missing reciprocal ${locale} alternate: ${href}`);
  }
}
console.log(JSON.stringify({locale,pages:urls.length,strings:source.length,result:'candidate-structural-gate-passed',notice:'A structural gate is not proof of translation quality, actual delivery, accessibility or production approval.'}));

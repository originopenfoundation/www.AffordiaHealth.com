import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,mkdir} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
const dir=await mkdtemp(path.join(tmpdir(),'affordia-locale-gate-'));const manifest=path.join(dir,'candidate.json');
await writeFile(manifest,JSON.stringify({locale:'fr',ownerApproved:false}));
let result=spawnSync(process.execPath,['scripts/check-locale-candidate.mjs',manifest,dir],{encoding:'utf8'});
assert.notEqual(result.status,0);assert(result.stderr.includes('Owner approval is required'));
await writeFile(manifest,JSON.stringify({locale:'en',ownerApproved:true}));
result=spawnSync(process.execPath,['scripts/check-locale-candidate.mjs',manifest,dir],{encoding:'utf8'});
assert.notEqual(result.status,0);assert(result.stderr.includes('Candidate must be a new valid locale'));
const before=await readFile('app/i18n/source.json','utf8');const catalog=Object.fromEntries(JSON.parse(before).map(x=>[x.id,'synthetic test fixture']));await writeFile(path.join(dir,'catalog.json'),JSON.stringify(catalog));
const manualHash=createHash('sha256');for(const file of ['faq-additions.tsx','local-coordination.tsx','consultation-email-fallback.tsx','copy-email.tsx']){manualHash.update(file+'\0');manualHash.update(await readFile(path.join('app',file)));}
const candidate={locale:'fr',ownerApproved:true,specialistReviewed:true,contactSupportVerified:true,manualComponentsReviewed:true,reviewEvidence:'synthetic fixture only',canonicalSourceSha256:createHash('sha256').update(before).digest('hex'),manualSourceSha256:manualHash.digest('hex'),catalog:'catalog.json'};
await writeFile(manifest,JSON.stringify(candidate));let xml='<urlset>';
const baseline=await readFile('out/sitemap.xml','utf8');const english=[...baseline.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>new URL(x[1]).pathname).filter(p=>!/^\/(de|es|zh-CN)\//.test(p));assert.equal(english.length,40);
for(const segment of english){const url=`https://affordiahealth.com/fr${segment}`;xml+=`<url><loc>${url}</loc></url>`;const folder=path.join(dir,'fr','.'+segment);await mkdir(folder,{recursive:true});await writeFile(path.join(folder,'index.html'),`<link rel="canonical" href="${url}"><link hrefLang="x-default"><main id="main-content">synthetic fixture</main>`);}
await writeFile(path.join(dir,'sitemap.xml'),xml+'</urlset>');
result=spawnSync(process.execPath,['scripts/check-locale-candidate.mjs',manifest,dir],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
candidate.canonicalSourceSha256='stale';await writeFile(manifest,JSON.stringify(candidate));
result=spawnSync(process.execPath,['scripts/check-locale-candidate.mjs',manifest,dir],{encoding:'utf8'});assert.notEqual(result.status,0);assert(result.stderr.includes('Canonical source changed'));
console.log('PASS: synthetic structural fixture accepted; unapproved, already-live and stale-source candidates rejected. No real locale approved or published.');

// Dry-run by default. Only submit genuinely changed, published canonical URLs.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const host='affordiahealth.com';
const key='c4532a0187f54992027ae83a6a500ebb'; // Public ownership-verification key, not a credential for a private account.
const location=`https://${host}/${key}.txt`;
const urls=process.argv.slice(2).filter(x=>x!=='--submit');
if(!urls.length || urls.length>10000) throw new Error('Provide 1-10000 genuinely changed public URLs.');
if(new Set(urls).size!==urls.length) throw new Error('Duplicate URLs are not allowed.');
for(const item of urls){const u=new URL(item);if(u.protocol!=='https:'||u.host!==host||u.username||u.password||u.hash||u.search)throw new Error(`Invalid canonical URL: ${item}`);}
if((await readFile(new URL(`../public/${key}.txt`,import.meta.url),'utf8')).trim()!==key)throw new Error('Local public verification key is missing or mismatched.');
const body={host,key,keyLocation:location,urlList:urls};
if(!process.argv.includes('--submit')) {console.log(JSON.stringify({dryRun:true,keyLocation:location,urls},null,2));process.exit(0);}
if(process.env.AFFORDIA_INDEXNOW_APPROVED!=='1')throw new Error('Set AFFORDIA_INDEXNOW_APPROVED=1 only after the live release is authorized and verified.');
const verification=await fetch(location,{redirect:'error',signal:AbortSignal.timeout(15000)});
if(!verification.ok || (await verification.text()).trim()!==key) throw new Error('Published ownership key could not be verified; no URL submission was made.');
const ledgerFile=new URL('../.indexnow-ledger.json',import.meta.url);
let ledger={};try{ledger=JSON.parse(await readFile(ledgerFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const hashes={};for(const item of urls){const r=await fetch(item,{redirect:'error',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(`Published URL is not available: ${item} (${r.status})`);const h=createHash('sha256').update(await r.text()).digest('hex');if(ledger[item]?.hash===h)throw new Error(`URL has not changed since the last recorded submission: ${item}`);hashes[item]=h;}
const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
if(response.ok){for(const item of urls)ledger[item]={hash:hashes[item],submittedAt:new Date().toISOString(),status:response.status};await writeFile(ledgerFile,JSON.stringify(ledger,null,2)+'\n');}
console.log(JSON.stringify({status:response.status,accepted:response.ok,urls,notice:'Acceptance is not proof of indexing. Do not resubmit unchanged URLs.'},null,2));
if(!response.ok)process.exitCode=1;

import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './worker.mjs';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
const DB = { prepare(sql) { return { bind(...values) { return { sql, values, async first() { return sqlite.prepare(sql).get(...values) ?? null; }, async run() { return sqlite.prepare(sql).run(...values); } }; } }; }, async batch(statements) { sqlite.exec('BEGIN'); try { const result=statements.map(s=>sqlite.prepare(s.sql).run(...s.values)); sqlite.exec('COMMIT'); return result; } catch(e) {sqlite.exec('ROLLBACK'); throw e;} } };
const env = { DB, TOKEN_SECRET:'token-secret-'.repeat(5), RATE_SECRET:'rate-secret-'.repeat(5), ENCRYPTION_KEY:Buffer.alloc(32, 7).toString('base64url'), ADMIN_TOKEN:'admin-secret-'.repeat(5), GMAIL_CLIENT_ID:'test-client', GMAIL_CLIENT_SECRET:'test-secret', GMAIL_REFRESH_TOKEN:'test-refresh', SITE_ORIGIN:'https://affordiahealth.com' };
const originalFetch = globalThis.fetch;
let failNotification = false;
const notifications = [];
globalThis.fetch = async (url, init) => { if(String(url).includes('oauth2.googleapis.com')) return Response.json({access_token:'mock-access'}); const raw=JSON.parse(init.body).raw; notifications.push(Buffer.from(raw,'base64url').toString('utf8')); return new Response('', { status:failNotification ? 503 : 200 }); };
const token = async (ip='203.0.113.9') => { const r=await worker.fetch(new Request('https://affordiahealth.com/api/consultation/token',{headers:{'CF-Connecting-IP':ip}}),env); assert.equal(r.status,200); return (await r.json()).token; };
const base = () => ({name:'Example Person',country:'Germany',service:'eye',contacts:[{type:'whatsapp',value:'+49 151 23456789',preferred:true},{type:'email',value:'example@example.invalid',preferred:false}],help:'Questions about travel and costs',questions:'How does coordination work? 你好',privacy:true,locale:'de',website:''});
async function post(body, key=crypto.randomUUID(), ip='203.0.113.9', origin='https://affordiahealth.com') {
  const response=await worker.fetch(new Request('https://affordiahealth.com/api/consultation',{method:'POST',headers:{'Origin':origin,'CF-Connecting-IP':ip,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(body)}),env);
  return {status:response.status,body:await response.json()};
}
try {
  const first={...base(),token:await token()}; const key=crypto.randomUUID();
  const a=await post(first,key); assert.equal(a.status,201); assert.equal(a.body.notification,'sent');
  assert(notifications[0].includes('To: affordiahealth@gmail.com'));
  const message=Buffer.from(notifications[0].split('\r\n\r\n')[1].replace(/\r\n/g,''),'base64').toString('utf8');
  for(const value of [a.body.reference, first.name, first.country, 'Eye care and vision surgery', first.contacts[0].value, first.contacts[1].value, '(preferred)', first.help, first.questions, 'Privacy notice acknowledged: Yes']) assert(message.includes(value), `Missing email content: ${value}`);
  const duplicate=await post(first,key); assert.equal(duplicate.status,200); assert.equal(duplicate.body.reference,a.body.reference); assert.equal(notifications.length,1);
  assert.equal((await post({...first,help:'Changed'},key)).status,409);
  assert.equal((await post(first)).status,403); // token replay with a different idempotency key
  const stored=sqlite.prepare('SELECT * FROM requests WHERE reference=?').get(a.body.reference);
  assert(!stored.encrypted_payload.includes('Example Person')); assert.equal(stored.suspicious,1); // Fast completion is flagged, not rejected.
  const admin=await worker.fetch(new Request(`https://affordiahealth.com/api/admin/requests/${a.body.reference}`,{headers:{Authorization:`Bearer ${env.ADMIN_TOKEN}`,'CF-Connecting-IP':'203.0.113.9'}}),env);
  assert.equal(admin.status,200); assert.equal((await admin.json()).request.contacts.length,2);
  const unauthorized=await worker.fetch(new Request(`https://affordiahealth.com/api/admin/requests/${a.body.reference}`,{headers:{'CF-Connecting-IP':'203.0.113.9'}}),env); assert.equal(unauthorized.status,401);
  const deleted=await worker.fetch(new Request(`https://affordiahealth.com/api/admin/requests/${a.body.reference}`,{method:'DELETE',headers:{Authorization:`Bearer ${env.ADMIN_TOKEN}`,'CF-Connecting-IP':'203.0.113.9'}}),env); assert.equal(deleted.status,200);
  assert.equal((await post(first)).status,403); // Deleting the record must not make its form token reusable.
  const swiss={...base(),country:'Switzerland',service:'post-treatment',locale:'de',contacts:[{type:'telephone',value:'+41 44 555 01 02',preferred:false},{type:'whatsapp',value:'+41 79 123 45 67',preferred:true},{type:'wechat',value:'sample_wechat',preferred:false}],token:await token()};
  const swissResponse=await post(swiss); assert.equal(swissResponse.status,201);
  const swissMessage=Buffer.from(notifications[1].split('\r\n\r\n')[1].replace(/\r\n/g,''),'base64').toString('utf8');
  for(const c of swiss.contacts) assert(swissMessage.includes(`${c.type}${c.preferred ? ' (preferred)' : ''}: ${c.value}`));
  const swissRead=await worker.fetch(new Request(`https://affordiahealth.com/api/admin/requests/${swissResponse.body.reference}`,{headers:{Authorization:`Bearer ${env.ADMIN_TOKEN}`,'CF-Connecting-IP':'203.0.113.9'}}),env);
  const swissStored=(await swissRead.json()).request.contacts; assert.equal(swissStored.length,3); assert.equal(swissStored.filter(c=>c.preferred).length,1); assert.equal(swissStored.find(c=>c.preferred).type,'whatsapp');
  const overseas={...base(),country:'Canada',service:'aesthetic',locale:'en',contacts:[{type:'whatsapp',value:'+1 416 555 0123',preferred:true}],token:await token()};
  assert.equal((await post(overseas)).status,201);
  const unsure={...base(),service:'unsure',help:'Please help me find an option',token:await token()}; assert.equal((await post(unsure)).status,201);
  assert.equal((await post({...base(),website:'spam',token:await token()})).status,403);
  assert.equal((await post({...base(),contacts:[],token:await token()})).status,400);
  assert.equal((await post({...base(),token:await token()},crypto.randomUUID(),'203.0.113.9','https://evil.example')).status,403);
  assert.equal((await post({...base(),help:'x'.repeat(70000),token:await token()})).status,413);
  failNotification=true; const failed=await post({...base(),token:await token()}); assert.equal(failed.status,201); assert.equal(failed.body.notification,'failed');
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM requests WHERE reference=?').get(failed.body.reference).n,1);
  for(let i=0;i<8;i++) assert.equal((await post({...base(),name:`Shared User ${i}`,token:await token('198.51.100.5')},crypto.randomUUID(),'198.51.100.5')).status,201);
  for(let i=0;i<30;i++) assert.equal((await post({...base(),name:`Rate Test ${i}`,token:await token('192.0.2.20')},crypto.randomUUID(),'192.0.2.20')).status,201);
  assert.equal((await post({...base(),token:await token('192.0.2.20')},crypto.randomUUID(),'192.0.2.20')).status,429);
  const unconfigured=await worker.fetch(new Request('https://affordiahealth.com/api/consultation/token'),{}); assert.equal(unconfigured.status,503);
  console.log('PASS: local SQLite integration, encryption, four synthetic journeys, contacts, idempotency, replay, honeypot, origin, size, shared IP, admin and mocked notification failure. Real provider: NOT_RUN.');
} finally { globalThis.fetch=originalFetch; sqlite.close(); }

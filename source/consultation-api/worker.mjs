// Optional same-origin Cloudflare Worker API. Do not deploy before completing
// the operational, privacy and security acceptance checks in README.md.
const encoder = new TextEncoder();
const services = new Set(['medical','eye','aesthetic','plastic','dental','screening','rehabilitation','post-treatment','travel','insurance','other','unsure']);
const serviceLabels = { medical:'Medical treatment and hospital coordination', eye:'Eye care and vision surgery', aesthetic:'Cosmetic and aesthetic procedures', plastic:'Plastic surgery coordination', dental:'Dental care and implants', screening:'Preventive health screening', rehabilitation:'Rehabilitation and recovery', 'post-treatment':'Post-treatment and post-surgery rehabilitation', travel:'Travel, accommodation and medical logistics', insurance:'Insurance-related administrative assistance', other:'Other — Tell Us What You Need', unsure:'Not sure - help me find the right option' };
const locales = new Set(['en','de','es','zh-CN']);
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
const b64 = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const unb64 = str => Uint8Array.from(atob(str.replaceAll('-','+').replaceAll('_','/')), c => c.charCodeAt(0));
const hmacKey = secret => crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign','verify']);
const sign = async (secret, text) => b64(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(text))));
const verify = async (secret, text, signature) => { try { return await crypto.subtle.verify('HMAC', await hmacKey(secret), unb64(signature), encoder.encode(text)); } catch { return false; } };
function configured(env) { return env.DB && env.TOKEN_SECRET?.length >= 32 && env.RATE_SECRET?.length >= 32 && env.ENCRYPTION_KEY && env.ADMIN_TOKEN?.length >= 32 && env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN && env.SITE_ORIGIN?.startsWith('https://'); }
function validContact(c) {
  if (!c || typeof c.value !== 'string' || typeof c.preferred !== 'boolean') return false;
  const value = c.value.trim();
  if (c.type === 'email') return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
  if (c.type === 'wechat') return value.length >= 2 && value.length <= 100 && !/[\r\n]/u.test(value);
  if (c.type !== 'whatsapp' && c.type !== 'telephone') return false;
  const phone = value.replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{4,14}$/.test(phone);
}
function validPayload(x) {
  return x && typeof x === 'object' && typeof x.name === 'string' && x.name.trim().length >= 2 && x.name.length <= 120 &&
    typeof x.country === 'string' && x.country.trim().length >= 2 && x.country.length <= 100 && services.has(x.service) && locales.has(x.locale) &&
    typeof x.help === 'string' && x.help.length <= 6000 && typeof x.questions === 'string' && x.questions.length <= 6000 && x.privacy === true &&
    Array.isArray(x.contacts) && x.contacts.length > 0 && x.contacts.every(validContact) && x.contacts.filter(c => c.preferred).length === 1 &&
    ['', 'expertise', 'balance', 'affordable', 'availability'].includes(x.priority ?? '') && typeof (x.budget ?? '') === 'string' && (x.budget ?? '').length <= 120 &&
    ['', 'medical', 'journey', 'unsure'].includes(x.budgetScope ?? '') && ['', 'yes', 'no', 'unsure'].includes(x.insurance ?? '') &&
    typeof x.website === 'string' && x.website.length <= 200 && typeof x.token === 'string' && x.token.length <= 1000;
}
async function rate(env, bucket, now, limit) {
  const period = Math.floor(now / 3600000);
  const row = await env.DB.prepare('INSERT INTO rate_limits(bucket,period,count) VALUES(?,?,1) ON CONFLICT(bucket,period) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,period).first();
  return row.count <= limit;
}
async function encryptionKey(env) { const raw = unb64(env.ENCRYPTION_KEY); if (raw.length !== 32) throw new Error('invalid key'); return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt','decrypt']); }
async function issueToken(env, now) {
  const payload = b64(encoder.encode(JSON.stringify({ id: crypto.randomUUID(), issued: now, expires: now + 7200000 })));
  return `${payload}.${await sign(env.TOKEN_SECRET, payload)}`;
}
async function readToken(env, value, now) {
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra || !(await verify(env.TOKEN_SECRET, payload, signature))) return null;
  try { const token = JSON.parse(new TextDecoder().decode(unb64(payload))); return typeof token.id === 'string' && Number.isInteger(token.issued) && token.issued <= now + 30000 && token.expires >= now && token.expires - token.issued === 7200000 ? token : null; } catch { return null; }
}
async function notify(env, reference, record) {
  try {
    const params = new URLSearchParams({client_id:env.GMAIL_CLIENT_ID,client_secret:env.GMAIL_CLIENT_SECRET,refresh_token:env.GMAIL_REFRESH_TOKEN,grant_type:'refresh_token'});
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params.toString()});
    if (!tokenResponse.ok) return false;
    const token = await tokenResponse.json(); if (typeof token.access_token !== 'string') return false;
    const contactLines = record.contacts.map((c, i) => `${i + 1}. ${c.type}${c.preferred ? ' (preferred)' : ''}: ${c.value}`).join('\r\n');
    const message = `A consultation request was recorded.\r\nReference: ${reference}\r\n\r\nName: ${record.name}\r\nCountry: ${record.country}\r\nService: ${serviceLabels[record.service]}\r\nLanguage: ${record.locale}\r\nHealthcare priority: ${record.priority || '(not provided)'}\r\nEstimated budget: ${record.budget || '(not provided)'}\r\nBudget scope: ${record.budgetScope || '(not provided)'}\r\nInsurance: ${record.insurance || '(not provided)'}\r\n\r\nContact methods:\r\n${contactLines}\r\n\r\nHow can we help?\r\n${record.help || '(not provided)'}\r\n\r\nQuestions:\r\n${record.questions || '(not provided)'}\r\n\r\nPrivacy notice acknowledged: Yes\r\n`;
    const messageBase64 = btoa(String.fromCharCode(...encoder.encode(message))).match(/.{1,76}/g)?.join('\r\n') || '';
    const raw = b64(encoder.encode(`To: affordiahealth@gmail.com\r\nSubject: New Affordia Health consultation request\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${messageBase64}\r\n`));
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method:'POST', redirect:'error', signal:AbortSignal.timeout(10000), headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token.access_token}` }, body:JSON.stringify({ raw }) });
    return response.ok;
  } catch { return false; }
}
async function handle(request, env) {
  const url = new URL(request.url);
  if (!configured(env)) return reply({ error:'service_unavailable' }, 503);
  if (url.pathname === '/api/consultation/token' && request.method === 'GET') {
    const ip = request.headers.get('CF-Connecting-IP'); if (!ip) return reply({error:'service_unavailable'},503);
    const now = Date.now(); const bucket = await sign(env.RATE_SECRET, `${Math.floor(now/3600000)}:${ip}`);
    if (!(await rate(env, `token:${bucket}`, now, 120))) return reply({error:'rate_limited'},429);
    return reply({ token: await issueToken(env, now) });
  }
  if (url.pathname.startsWith('/api/admin/requests/') && ['GET','DELETE'].includes(request.method)) {
    const ip = request.headers.get('CF-Connecting-IP'); if (!ip) return reply({error:'service_unavailable'},503);
    const now = Date.now(); const bucket = await sign(env.RATE_SECRET, `${Math.floor(now/3600000)}:${ip}`);
    if (!(await rate(env, `admin:${bucket}`, now, 30))) return reply({error:'rate_limited'},429);
    const auth = request.headers.get('Authorization') || '';
    if (!(await verify(env.ADMIN_TOKEN, 'admin', auth.startsWith('Bearer ') ? await sign(auth.slice(7), 'admin') : ''))) {
      await env.DB.prepare('INSERT INTO audit_log(created_at,event,reference,outcome) VALUES(?,?,?,?)').bind(now,'admin',null,'denied').run();
      return reply({ error:'unauthorized' }, 401);
    }
    const ref = url.pathname.slice('/api/admin/requests/'.length);
    if (!/^[A-Za-z0-9_-]{22,32}$/.test(ref)) return reply({ error:'not_found' }, 404);
    const row = await env.DB.prepare('SELECT * FROM requests WHERE reference=?').bind(ref).first();
    if (!row) return reply({ error:'not_found' }, 404);
    if(request.method==='DELETE') {
      await env.DB.prepare('DELETE FROM requests WHERE reference=?').bind(ref).run();
      await env.DB.prepare('INSERT INTO audit_log(created_at,event,reference,outcome) VALUES(?,?,?,?)').bind(now,'delete',ref,'success').run();
      return reply({ deleted:true });
    }
    const clear = await crypto.subtle.decrypt({ name:'AES-GCM', iv:unb64(row.iv) }, await encryptionKey(env), unb64(row.encrypted_payload));
    await env.DB.prepare('INSERT INTO audit_log(created_at,event,reference,outcome) VALUES(?,?,?,?)').bind(now,'read',ref,'success').run();
    return reply({ reference:row.reference, created_at:row.created_at, suspicious:!!row.suspicious, notification:row.notification, request:JSON.parse(new TextDecoder().decode(clear)) });
  }
  if (url.pathname !== '/api/consultation' || request.method !== 'POST') return reply({ error:'not_found' }, 404);
  if (request.headers.get('Origin') !== env.SITE_ORIGIN || !/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) return reply({ error:'forbidden' }, 403);
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 65536) return reply({ error:'payload_too_large' }, 413);
  const reader = request.body?.getReader(); if (!reader) return reply({ error:'invalid' }, 400);
  const chunks=[]; let size=0;
  for (;;) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>65536){ await reader.cancel(); return reply({error:'payload_too_large'},413); } chunks.push(value); }
  const bytes=new Uint8Array(size); let pos=0; for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
  let x; try { x=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)); } catch { return reply({error:'invalid'},400); }
  const idem=request.headers.get('Idempotency-Key') || '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idem) || !validPayload(x)) return reply({error:'invalid'},400);
  const now=Date.now();
  const ip=request.headers.get('CF-Connecting-IP');
  if (!ip) return reply({error:'service_unavailable'},503);
  const period=Math.floor(now/3600000);
  const bucket=await sign(env.RATE_SECRET, `${period}:${ip}`);
  if (!(await rate(env,`ip:${bucket}`,now,30)) || !(await rate(env,'global',now,3000))) return reply({error:'rate_limited'},429);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM used_tokens WHERE expires_at < ?').bind(now),
    env.DB.prepare('DELETE FROM rate_limits WHERE period < ?').bind(period-24)
  ]);
  const record = {name:x.name.trim(),country:x.country.trim(),service:x.service,contacts:x.contacts.map(c=>({type:c.type,value:c.value.trim(),preferred:c.preferred})),help:x.help.trim(),questions:x.questions.trim(),priority:x.priority ?? '',budget:(x.budget ?? '').trim(),budgetScope:x.budgetScope ?? '',insurance:x.insurance ?? '',privacy:true,locale:x.locale};
  const payload=JSON.stringify(record); const hash=await sign(env.TOKEN_SECRET,payload);
  const existing=await env.DB.prepare('SELECT reference,payload_hash,notification FROM requests WHERE idempotency_key=?').bind(idem).first();
  if(existing) return existing.payload_hash===hash ? reply({reference:existing.reference,notification:existing.notification}) : reply({error:'idempotency_conflict'},409);
  const token=await readToken(env,x.token,now); if (!token || x.website.trim()) return reply({error:'verification_failed'},403);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await encryptionKey(env),encoder.encode(payload));
  const reference=b64(crypto.getRandomValues(new Uint8Array(18)));
  try { await env.DB.batch([
    env.DB.prepare('INSERT INTO used_tokens(token_id,expires_at) VALUES(?,?)').bind(token.id,token.expires),
    env.DB.prepare('INSERT INTO requests(reference,idempotency_key,payload_hash,token_id,encrypted_payload,iv,created_at,suspicious,notification) VALUES(?,?,?,?,?,?,?,?,?)').bind(reference,idem,hash,token.id,b64(new Uint8Array(encrypted)),b64(iv),now,now-token.issued<1500?1:0,'pending')
  ]); }
  catch { const duplicate=await env.DB.prepare('SELECT reference,payload_hash,notification FROM requests WHERE idempotency_key=?').bind(idem).first(); return duplicate && duplicate.payload_hash===hash ? reply({reference:duplicate.reference,notification:duplicate.notification}) : reply({error:'verification_failed'},403); }
  const sent=await notify(env,reference,record); const notification=sent?'sent':'failed';
  await env.DB.prepare('UPDATE requests SET notification=? WHERE reference=?').bind(notification,reference).run();
  return reply({reference,notification},201);
}
const worker = { async fetch(request,env) { try { return await handle(request,env); } catch { return reply({error:'service_unavailable'},503); } } };
export default worker;

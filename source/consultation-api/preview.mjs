// Local, loopback-only test harness: in-memory SQLite and mocked notifications.
// It is not a production server and deliberately loses all data on shutdown.
import http from 'node:http';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import worker from './worker.mjs';

const port=Number(process.env.AFFORDIA_PREVIEW_PORT || 4173);
const root=path.resolve('out');
const db=new DatabaseSync(':memory:'); db.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
const DB={prepare(sql){return{bind(...args){return{sql,args,async first(){return db.prepare(sql).get(...args) ?? null;},async run(){return db.prepare(sql).run(...args);}}}}},async batch(statements){db.exec('BEGIN');try{const result=statements.map(s=>db.prepare(s.sql).run(...s.args));db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}};
const env={DB,TOKEN_SECRET:crypto.randomUUID()+crypto.randomUUID(),RATE_SECRET:crypto.randomUUID()+crypto.randomUUID(),ENCRYPTION_KEY:Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url'),ADMIN_TOKEN:crypto.randomUUID()+crypto.randomUUID(),GMAIL_CLIENT_ID:'mock-client',GMAIL_CLIENT_SECRET:'mock-secret',GMAIL_REFRESH_TOKEN:'mock-refresh',SITE_ORIGIN:'https://affordiahealth.com'};
let failNotification=false;
globalThis.fetch=async url=>String(url).includes('oauth2.googleapis.com')?Response.json({access_token:'mock-access'}):new Response(null,{status:failNotification?503:204});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,`http://127.0.0.1:${port}`);
    if(url.pathname==='/__test/notification' && req.method==='POST'){failNotification=url.searchParams.get('fail')==='1';res.writeHead(204).end();return;}
    if(url.pathname.startsWith('/api/consultation')){
      const parts=[]; for await(const part of req){parts.push(part); if(parts.reduce((n,p)=>n+p.length,0)>70000){res.writeHead(413).end();return;}}
      const headers=new Headers(req.headers); headers.set('CF-Connecting-IP','127.0.0.1');
      if(headers.get('Origin')===`http://127.0.0.1:${port}`) headers.set('Origin',env.SITE_ORIGIN);
      const opts={method:req.method,headers}; if(parts.length){opts.body=Buffer.concat(parts);opts.duplex='half';}
      const response=await worker.fetch(new Request(`https://affordiahealth.com${url.pathname}`,opts),env);
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    let relative=decodeURIComponent(url.pathname).replace(/^\/+/, ''); if(!relative||relative.endsWith('/'))relative+='index.html';
    const file=path.resolve(root,relative); if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  } catch {res.writeHead(404).end();}
}).listen(port,'127.0.0.1',()=>console.log(`Local test preview: http://127.0.0.1:${port}/ (mock notifications; memory-only database)`));

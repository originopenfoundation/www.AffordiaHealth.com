// Technical route fixture only. Never import these files into the application,
// sitemap, deployment artifact or production website.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const [locale, requestedParent] = process.argv.slice(2);
const registry = JSON.parse(await readFile(new URL('../app/i18n/approved-locales.json',import.meta.url)));
const selected = registry.find(item => item.code === locale && item.active === false);
if (!selected) throw new Error('Choose a registered, inactive locale.');
const parent = path.resolve(requestedParent || '../translation-work/route-fixtures');
const root = path.resolve(parent, locale);
const project = path.resolve('.');
if (root === project || root.startsWith(project + path.sep)) throw new Error('The fixture must be outside the application checkout.');
if (path.dirname(root) !== parent) throw new Error('Invalid fixture destination.');
const baseline = await readFile(new URL('../out/sitemap.xml',import.meta.url),'utf8');
const pages = [...baseline.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(match => new URL(match[1]))
  .filter(url => url.origin === 'https://affordiahealth.com' && !/^\/(de|es|zh-CN)\//.test(url.pathname))
  .map(url => url.pathname);
if (pages.length !== 40 || new Set(pages).size !== 40 || pages.some(p=>!/^\/(?:[a-z0-9-]+\/)*$/.test(p))) throw new Error('The source export must contain the expected 40 safe English paths.');
// Refuse to overwrite even an older fixture; it may contain reviewer edits.
await mkdir(parent,{recursive:true}); await mkdir(root);
const heading='UNTRANSLATED TECHNICAL PREVIEW — NOT FOR PUBLICATION';
const menu=pages.map(p=>`<li><a href="/${locale}${p}">${p}</a></li>`).join('');
for (const page of pages) {
  const directory = path.resolve(root, '.'+page);
  if (directory !== root && !directory.startsWith(root+path.sep)) throw new Error('Invalid path');
  await mkdir(directory,{recursive:true});
  const html=`<!doctype html><html lang="${locale}" dir="${selected.direction}"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title><style>body{font:16px system-ui;max-width:60rem;margin:auto;padding:2rem;line-height:1.6}header{background:#fee8c7;padding:1rem;border:2px solid #aa4800}a{color:#075466}li{overflow-wrap:anywhere}</style></head><body><header lang="en" dir="ltr"><strong>${heading}</strong><p>This page is a routing and direction fixture. It contains no translated website content and must not be published.</p></header><main><h1 lang="en" dir="ltr">Route: ${page}</h1><nav aria-label="Test routes" lang="en" dir="ltr"><ul>${menu}</ul></nav></main></body></html>`;
  await writeFile(path.join(directory,'index.html'),html,{flag:'wx'});
}
await writeFile(path.join(root,'robots.txt'),'User-agent: *\nDisallow: /\n',{flag:'wx'});
console.log(JSON.stringify({locale,direction:selected.direction,pages:pages.length,root,notice:heading}));

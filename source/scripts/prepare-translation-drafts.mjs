// Offline draft preparation only. The website never contacts this service.
// Review drafts and apply editorial overrides before importing a release catalog.
import fs from 'node:fs';
import path from 'node:path';
const source = JSON.parse(fs.readFileSync('app/i18n/source.json', 'utf8'));
const work = path.resolve('../translation-work');
fs.mkdirSync(path.join(work, 'drafts'), { recursive: true });
const locales = process.argv.slice(2).length ? process.argv.slice(2) : ['de', 'es', 'zh-CN'];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function translate(items, locale) {
  const query = items.length === 1 ? items[0].text : items.map(item => `⟦${item.id}⟧\n${item.text}`).join('\n\n');
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  for (const [key, value] of Object.entries({ client: 'gtx', sl: 'en', tl: locale, dt: 't', q: query })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Draft service returned ${response.status}; stopped without changing published translations.`);
  const data = await response.json();
  const text = data[0].map(part => part[0] ?? '').join('');
  if (items.length === 1) {
    if (!text.trim()) throw new Error(`Empty draft: ${items[0].id}`);
    return { [items[0].id]: text.trim() };
  }
  const matches = [...text.matchAll(/⟦\s*(s[a-f0-9]{12})\s*⟧/gi)];
  const result = {};
  for (let i = 0; i < matches.length; i++) result[matches[i][1].toLowerCase()] = text.slice(matches[i].index + matches[i][0].length, matches[i + 1]?.index ?? text.length).trim();
  if (matches.length !== items.length || items.some(item => !result[item.id])) {
    const middle = Math.ceil(items.length / 2);
    await pause(350);
    const first = await translate(items.slice(0, middle), locale);
    await pause(350);
    return { ...first, ...await translate(items.slice(middle), locale) };
  }
  return result;
}
for (const locale of locales) {
  const output = path.join(work, 'drafts', `${locale}.json`);
  const draft = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {};
  const remaining = source.filter(item => !draft[item.id]);
  let batch = [], size = 0, count = 0;
  const batches = [];
  for (const item of remaining) {
    if (size + item.text.length + 24 > 3500 && batch.length) { batches.push(batch); batch = []; size = 0; }
    batch.push(item); size += item.text.length + 24;
  }
  if (batch.length) batches.push(batch);
  for (const items of batches) {
    Object.assign(draft, await translate(items, locale));
    fs.writeFileSync(output, JSON.stringify(draft, null, 2) + '\n');
    count++;
    if (count % 10 === 0 || count === batches.length) console.log(`${locale}: ${Object.keys(draft).length}/${source.length} draft entries (${count}/${batches.length} batches)`);
    await pause(350);
  }
}

import fs from 'node:fs';
import assert from 'node:assert/strict';

const locale = process.argv[2];
const asset = process.argv[3];
assert(['de', 'es', 'zh-CN'].includes(locale), 'Expected de, es or zh-CN');
assert(asset, 'Expected a reviewed translation JSON asset path');
const source = JSON.parse(fs.readFileSync('app/i18n/source.json', 'utf8'));
const sourceById = new Map(source.map(item => [item.id, item]));
const raw = fs.readFileSync(asset, 'utf8');
const corrections = JSON.parse(raw);
const keys = [...raw.matchAll(/"(s[0-9a-f]{12})"\s*:/g)].map(match => match[1]);
assert.equal(new Set(keys).size, keys.length, 'Duplicate correction IDs');
assert.equal(keys.length, Object.keys(corrections).length, 'Unexpected correction key format');
for (const [id, text] of Object.entries(corrections)) {
  const item = sourceById.get(id);
  assert(item, `Unknown source ID ${id}`);
  assert(typeof text === 'string' && text.trim(), `Empty correction ${id}`);
  assert(!/[⟦⟧]|undefined|\[object Object\]/.test(text), `Invalid correction ${id}`);
  for (const email of item.text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? []) {
    assert(text.includes(email), `Contact email changed in ${id}`);
  }
}
const target = `app/i18n/reviewed-${locale}.json`;
const existing = JSON.parse(fs.readFileSync(target, 'utf8'));
const merged = { ...existing, ...corrections };
fs.writeFileSync(target, JSON.stringify(merged, null, 2) + '\n');
console.log(JSON.stringify({ locale, corrections: keys.length, totalLanguageOverrides: Object.keys(merged).length }));

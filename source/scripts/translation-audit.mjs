import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const source = JSON.parse(fs.readFileSync('app/i18n/source.json', 'utf8'));
const editorial = JSON.parse(fs.readFileSync('app/i18n/editorial-overrides.json', 'utf8'));
const commonUnchanged = new Set(['Affordia Health', 'Affordia Care', 'WeChat:', 'WhatsApp', 'affordiahealth@gmail.com', 'Hromadu 819/19', '972 12 Nedožery-Brezany', 'Wearables.']);
const findings = [];
for (const locale of ['de', 'es', 'zh-CN']) {
  const catalog = JSON.parse(fs.readFileSync(`app/i18n/${locale}.json`, 'utf8'));
  const reviewed = JSON.parse(fs.readFileSync(`app/i18n/reviewed-${locale}.json`, 'utf8'));
  assert.equal(Object.keys(catalog).length, source.length);
  for (const item of source) {
    const text = catalog[item.id];
    assert(typeof text === 'string' && text.trim(), `${locale} missing ${item.id}`);
    assert(!/[⟦⟧]|undefined|\[object Object\]/.test(text), `${locale} invalid ${item.id}`);
    if (text.toLowerCase() === item.text.toLowerCase() && !commonUnchanged.has(item.text) && !(locale === 'es' && ['No', 'No.'].includes(item.text))) findings.push({ locale, id: item.id, kind: 'unchanged', source: item.text, text });
    if (locale === 'zh-CN' && /\b(?:Affordia|Travel|Network|Clear)\b/.test(text.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, ''))) findings.push({ locale, id: item.id, kind: 'residual-English', source: item.text, text });
    // Grade 3A is conventionally written 三甲 in Chinese. Check all other
    // numbers, including those elsewhere in a paragraph mentioning Grade 3A.
    const numbers = value => (value.replace(/\b3A\b/gi, '').match(/\d+/g) ?? []).sort().join(',');
    const reviewedNumberWords = locale === 'de' && item.text === 'Within 1 month' && text === 'Innerhalb eines Monats';
    if (numbers(item.text) !== numbers(text) && !reviewedNumberWords) findings.push({ locale, id: item.id, kind: 'numbers', source: item.text, text });
    // Do not exempt reviewed text from factual-number checks. Negation wording
    // can legitimately change in the explicitly reviewed editorial entries.
    if (editorial[item.id] || reviewed[item.id]) continue;
    const negation = { de: /nicht|kein|\bnie\b|niemals|ohne|unmöglich|untersagt/i, es: /\bno\b|\bsin\b|nunca|ning[uú]n|imposible|\bni\b|tampoco/i, 'zh-CN': /不|无|未|没有|并非|禁止|不能|非|勿/ }[locale];
    if (/\bnot\b|\bcannot\b|\bnever\b/.test(item.text) && !negation.test(text)) findings.push({ locale, id: item.id, kind: 'negation-review', source: item.text, text });
  }
  console.log(`${locale}: ${source.length}/${source.length} entries present`);
}
fs.writeFileSync(path.resolve('../translation-work/audit-findings.json'), JSON.stringify(findings, null, 2) + '\n');
console.log(JSON.stringify(findings, null, 2));
assert(!findings.some(f => ['unchanged', 'residual-English'].includes(f.kind)), 'Untranslated English remains');
assert(!findings.some(f => f.kind === 'numbers'), 'Numeric translation discrepancy needs review');

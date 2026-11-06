import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const source = JSON.parse(fs.readFileSync('app/i18n/source.json', 'utf8'));
const editorial = JSON.parse(fs.readFileSync('app/i18n/editorial-overrides.json', 'utf8'));
const ids = new Set(source.map(item => item.id));
for (const id of Object.keys(editorial)) assert(ids.has(id), `Unknown editorial key ${id}`);
const locales = ['de', 'es', 'zh-CN'];
const report = {};
for (const [index, locale] of locales.entries()) {
  const draft = JSON.parse(fs.readFileSync(path.resolve(`../translation-work/drafts/${locale}.json`), 'utf8'));
  const reviewed = JSON.parse(fs.readFileSync(`app/i18n/reviewed-${locale}.json`, 'utf8'));
  for (const id of Object.keys(reviewed)) assert(ids.has(id), `Unknown reviewed key ${id}`);
  const catalog = {};
  for (const item of source) {
    let text = draft[item.id];
    assert(text?.trim(), `Missing ${locale} draft ${item.id}`);
    if (locale === 'de') {
      text = text.replace(/Affordia Gesundheit/g, 'Affordia Health')
        .replace(/medizinischen Reisen/g, 'Behandlungsreisen').replace(/medizinische Reisen/g, 'Behandlungsreisen')
        .replace(/medizinisch(?:en|e|er) Reise\b/g, 'Behandlungsreise').replace(/Gesundheitsreisen/g, 'Behandlungsreisen').replace(/Gesundheitsreise\b/g, 'Behandlungsreise')
        .replace(/Pay[- ]As[- ]You[- ]Go/gi, 'Schrittweise Zahlung nach Bedarf')
        .replace(/Unabhängig durch Design/g, 'Unabhängigkeit als Grundprinzip.')
        .replace(/Persönlich durch Design/g, 'Persönlich auf Sie abgestimmt')
        .replace(/\bKlienten\b/g, 'Kunden').replace(/\bKlient\b/g, 'Kunde')
        .replace(/Privacy-First/g, 'Datenschutz zuerst')
        .replace(/Versicherungs- und Versicherungspartner/g, 'Partner für Versicherung und Kostenübernahme');
      if (/recover/i.test(item.text)) text = text.replace(/Wiederherstellung/g, 'Genesung');
      if (/examination/i.test(item.text)) text = text.replace(/Prüfungen/g, 'Untersuchungen').replace(/Prüfung\b/g, 'Untersuchung');
      if (/supplements/i.test(item.text)) text = text.replace(/Ergänzungen/g, 'Nahrungsergänzungsmittel');
    } else if (locale === 'es') {
      text = text.replace(/Affordia Salud/g, 'Affordia Health').replace(/\bsoporte\b/g, 'apoyo').replace(/\bSoporte\b/g, 'Apoyo')
        .replace(/recorrido médico/g, 'viaje médico').replace(/\bestadía\b/g, 'estancia')
        .replace(/Pay[- ]As[- ]You[- ]Go/gi, 'pago por servicios según sus necesidades')
        .replace(/Privacy-First/g, 'privacidad ante todo')
        .replace(/navegar por China/g, 'orientarse en China').replace(/navegar su viaje médico/g, 'gestionar su viaje médico');
    } else {
      text = text.replace(/Affordia\s+Health\b/gi, '阿福迪亚健康').replace(/Affordia\s+Care\b/gi, '阿福迪亚关怀')
        .replace(/阿福迪亚护理/g, '阿福迪亚关怀').replace(/\bAffordia\b/g, '阿福迪亚')
        .replace(/医疗保健专业人员/g, '医疗专业人员').replace(/医疗保健提供者/g, '医疗服务提供方')
        .replace(/医疗保健服务/g, '医疗服务').replace(/医疗旅程/g, '就医行程').replace(/医疗之旅/g, '就医行程')
        .replace(/Pay[- ]As[- ]You[- ]Go/gi, '按需使用，分步付费').replace(/Privacy-First/gi, '隐私优先')
        .replace(/\bWeChat\b/g, '微信').replace(/\bTier 3A\b/gi, '三级甲等').replace(/\bGrade 3A\b/gi, '三级甲等')
        .replace(/独立设计/g, '以独立性为原则').replace(/你们/g, '各位').replace(/你/g, '您');
      if (/partner/i.test(item.text)) text = text.replace(/合伙企业/g, '合作关系').replace(/合伙人/g, '合作伙伴').replace(/合伙协议/g, '合作协议');
      text = text.replace(/([\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])/g, '$1');
    }
    const emails = item.text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? [];
    const translatedEmails = text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? [];
    if (emails.length === translatedEmails.length) translatedEmails.forEach((email, i) => { text = text.replace(email, emails[i]); });
    if (item.text.includes('Hromadu')) text = text.replace(/Hromad[auy]/gi, 'Hromadu');
    if (item.text.includes('Nedožery-Brezany')) text = text.replace(/Nedo[zž]ery\s*[-–]\s*Brezany/gi, 'Nedožery-Brezany');
    text = reviewed[item.id] ?? editorial[item.id]?.[index] ?? text;
    assert(text.trim(), `Empty translation ${locale} ${item.id}`);
    assert(!/[⟦⟧]/.test(text), `Alignment marker in ${locale} ${item.id}`);
    for (const email of emails) assert(text.includes(email), `Email changed: ${locale} ${item.id}`);
    catalog[item.id] = text;
  }
  fs.writeFileSync(`app/i18n/${locale}.json`, JSON.stringify(catalog, null, 2) + '\n');
  report[locale] = { total: source.length, translated: Object.keys(catalog).length, editorialEntries: new Set([...Object.keys(editorial), ...Object.keys(reviewed)]).size };
}
fs.writeFileSync(path.resolve('../translation-work/coverage.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));

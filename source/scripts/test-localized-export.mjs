import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const source = JSON.parse(fs.readFileSync('app/i18n/source.json', 'utf8'));
const docs = JSON.parse(fs.readFileSync('app/pdf-library.generated.json', 'utf8'));
const sourceIds = new Map(source.map(item => [item.text, item.id]));
const locales = ['en', 'de', 'es', 'zh-CN'];
const normalize = s => s.replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16))).replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const sitemap = fs.readFileSync('out/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
assert.equal(urls.length, 160, 'Expected 40 routes in each of four languages');
let documentBlocks = 0, internalLinks = 0;
for (const url of urls) {
  const pathname = new URL(url).pathname;
  const locale = locales.find(code => code !== 'en' && pathname.startsWith(`/${code}/`)) ?? 'en';
  const canonicalPath = locale === 'en' ? pathname : pathname.slice(locale.length + 1);
  const html = fs.readFileSync(path.join('out', pathname, 'index.html'), 'utf8');
  assert(html.includes(`<html lang="${locale}"`), `html language: ${url}`);
  assert(html.includes(`rel="canonical" href="${url}"`), `canonical: ${url}`);
  assert(!/translate\.google|goog-te|googleTranslateElement|affordia-google-translate/.test(html), `external translator: ${url}`);
  assert(html.includes('f0205897117b464ca80e1c8dda859654'), `analytics: ${url}`);
  for (const target of locales) {
    const href = target === 'en' ? canonicalPath : `/${target}${canonicalPath}`;
    assert(html.includes(`href="${href}"`), `Language switch does not preserve path: ${url} to ${target}`);
    assert(html.includes(`hrefLang="${target}"`) || html.includes(`hreflang="${target}"`), `Missing language alternate ${url}`);
  }
  const body = html.slice(html.indexOf('<body'), html.indexOf('</body>')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  for (const match of body.matchAll(/<a\b([^>]*?)href="([^"]+)"([^>]*)>/g)) {
    const href = decode(match[2]);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    assert(fs.existsSync(path.join('out', href, 'index.html')), `Broken page link ${url} → ${href}`);
    if (!/hrefLang|hreflang/.test(match[0])) {
      assert(locale === 'en' ? !/^\/(de|es|zh-CN)\//.test(href) : href.startsWith(`/${locale}/`), `Cross-language internal link ${url} → ${href}`);
    }
    internalLinks++;
  }
  const catalog = locale === 'en' ? null : JSON.parse(fs.readFileSync(`app/i18n/${locale}.json`, 'utf8'));
  const t = text => catalog ? catalog[sourceIds.get(normalize(text))] : text;
  assert(html.includes(`name="application-name" content="${t('Affordia Health')}"`), `Application brand language: ${url}`);
  if (canonicalPath.startsWith('/library/') && canonicalPath !== '/library/') {
    const doc = docs.find(doc => canonicalPath === `/library/${doc.slug}/`);
    assert(doc, `Unexpected document ${url}`);
    const documentHtml = body.slice(body.indexOf('<div class="document-body">'), body.indexOf('</article>'));
    const blocks = [...documentHtml.matchAll(/<(p|h2)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)].map(match => normalize(decode(match[2].replace(/<[^>]*>/g, ''))));
    assert.deepEqual(blocks, doc.blocks.map(block => normalize(t(block.text))), `Missing or reordered PDF content: ${url}`);
    documentBlocks += blocks.length;
  }
  if (canonicalPath === '/book-a-free-consultation/') {
    assert(body.includes('class="consultation-form"'), `Missing consultation form: ${url}`);
    assert(body.includes('type="email"') && body.includes('<textarea'), `Missing contact or question fields: ${url}`);
    assert(body.includes('href="mailto:affordiahealth@gmail.com"'), `Missing accessible email fallback: ${url}`);
    assert(!body.includes('https://mail.google.com/mail/'), `Gmail-specific contact remains: ${url}`);
    assert(!body.includes('&amp;body=') && !body.includes('&body='), `Consultation email URL must not contain personal or health data: ${url}`);
  }
  assert(body.includes('<main id="main-content"'), `Missing main landmark: ${url}`);
  assert(body.includes('class="skip-link" href="#main-content"'), `Missing skip link: ${url}`);
  assert(body.includes('<details class="nav-group" name="desktop-navigation"'), `Navigation must be present without JavaScript: ${url}`);
}
assert(fs.existsSync('out/favicon.png'));
console.log(JSON.stringify({ pages: urls.length, languages: locales.length, documents: docs.length * locales.length, documentBlocks, internalLinks, noJsNavigation: true, privacySafeConsultation: true, result: 'passed' }, null, 2));

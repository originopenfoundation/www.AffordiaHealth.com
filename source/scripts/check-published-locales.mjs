import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// Read-only HTTP checks, not browser/interaction testing.
const urls = [...fs.readFileSync('out/sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
let next = 0;
let completed = 0;
const failures = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < urls.length) {
    const url = urls[next++];
    try {
      assert.equal(new URL(url).origin, 'https://affordiahealth.com');
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const html = await response.text();
      const locale = new URL(url).pathname.match(/^\/(de|es|zh-CN)\//)?.[1] ?? 'en';
      assert.equal(response.status, 200, 'HTTP status');
      assert(html.includes(`<html lang="${locale}"`), 'HTML language');
      assert(html.includes(`rel="canonical" href="${url}"`), 'canonical URL');
      assert(/<main(?:\s[^>]*)?>/.test(html), 'page content');
      assert(!/translate\.google|googleTranslateElement|goog-te/.test(html), 'external translator');
      const expected = fs.readFileSync(path.join('out', new URL(url).pathname, 'index.html'), 'utf8');
      // Script hashes/analytics may differ at the CDN, but the published page
      // text and links must match this exact validated language release.
      const main = value => value.match(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/)?.[0].replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
      assert(main(html) === main(expected), 'Published content does not match the validated release');
    } catch (error) {
      failures.push({ url, error: error.message });
    }
    completed++;
    if (completed % 40 === 0) console.log(`Checked ${completed}/${urls.length} published pages`);
  }
}));
console.log(JSON.stringify({ pages: urls.length, failures }, null, 2));
assert.equal(failures.length, 0, 'Published route checks failed');

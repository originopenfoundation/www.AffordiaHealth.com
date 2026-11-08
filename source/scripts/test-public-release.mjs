import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.AFFORDIA_PLAYWRIGHT_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.AFFORDIA_BROWSER_PATH });
const page = await browser.newPage();
const errors = []; page.on('pageerror', error => errors.push(error.message));
try {
  for (const width of [320, 360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const locale of ['', '/de', '/es', '/zh-CN']) {
      for (const route of ['/', '/services/', '/contact/', '/book-a-free-consultation/']) {
        await page.goto(`http://127.0.0.1:4173${locale}${route}`);
        const size = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
        assert(size[1] <= size[0] + 1, `Horizontal overflow ${width} ${locale}${route}: ${size}`);
      }
      assert.equal(await page.locator('.consultation-form').count(), 0);
      assert(await page.locator('a[href="mailto:affordiahealth@gmail.com"]').first().isVisible());
      const gmail = page.locator('a[href^="https://mail.google.com/mail/"]');
      assert(await gmail.isVisible());
      assert((await gmail.getAttribute('href')).includes('affordiahealth%40gmail.com'));
    }
  }
  assert.deepEqual(errors, []);
  console.log('PASS: 5 screen widths, 4 locales, 4 routes; no horizontal overflow; email and Gmail compose options visible; no unavailable form.');
} finally { await browser.close(); }

# Affordia Health - Build 03 working report

Status: local working copy only. No production deployment or real email was performed.

## Implemented locally

- Added a Shenyang-focused explanation of independent consulting, third-party medical responsibility, fees, direct third-party payments, individually assessed inquiries and the six-step process in English, German, Spanish and Simplified Chinese. Existing document text was not edited.
- Expanded the consultation prototype with an open non-medical inquiry category and optional healthcare priority, estimated budget, budget scope and insurance questions. International telephone numbers are supported.
- Updated the prototype API to validate, encrypt and include the optional values in the simulated notification. Existing working email link remains available independently of the form.

## Verification evidence

- `npm run build`: pass, static export generated.
- `node scripts/test-localized-export.mjs`: pass, 160 routes, four locales, 96 document-language versions, 9,308 document blocks, 12,480 internal links.
- `node consultation-api/check-structured-data.mjs`: pass, 160 pages, 156 breadcrumbs, four service and four organization pages. This checks markup, not indexing or search/AI visibility.
- `node consultation-api/test.mjs`: pass against in-memory SQLite and simulated Gmail, including optional values in encrypted storage and email, empty request rejection and invalid optional values. No real Gmail delivery.
- `node consultation-api/browser-test.mjs`: pass for 320, 360, 375, 390, 414, 768 and 1280 px across four routes and four languages, eight synthetic request scenarios, empty-form validation, mobile, navigation, and failed-network input preservation. The local server uses an in-memory database and simulated Gmail; this is not production E2E evidence.
- Before/after Git blob hashes of `app/pdf-library.generated.json`, `app/i18n/de.json`, `app/i18n/es.json`, `app/i18n/zh-CN.json`, `app/site-data.ts` and `app/pdf-library.ts` match. This is not a full audit of all protected content or metadata.

## Not completed or not verified

- Real Cloudflare D1/Worker deployment, Gmail authorization, actual notification delivery and all production end-to-end tests. Cloudflare access and Gmail authorization are required; privacy, retention and operational controls also need approval and implementation before production.
- The ten specified scenarios have only been simulated locally, not tested through the real receiving workflow. Existing browser scenarios use mocked delivery.
- Independent full WCAG 2.2 AA and screen-reader audit, professional review of translations, Core Web Vitals field measurements, all redirects/external links, real indexing, search visibility and AI citations remain unverified.
- Commercially licensed Shenyang photography has not been obtained. Existing generic imagery has not been independently license-verified.
- A full page-by-page protected-text and metadata baseline comparison has not been completed. Appendix A was referred to by the PDF but was not included in the supplied document.
- User-provided WhatsApp/WeChat labels have not been verified as contact identifiers; no number, link, ID or QR code was invented.
- Existing production content and functionality were not changed by this local work. Production must not be deployed without authorization, as required by the brief.

## Competitive context (8 November 2026)

Public service descriptions were reviewed for context, not copied and not independently audited. [China CarePath](https://chinacarepath.com/services) describes independent coordination and direct hospital payment; [SinoCareHub](https://www.sinocarehub.com/en) discusses bilingual coordination and documenting scope and fees; [Shanghai Connect](https://connectshanghai.com/en/medicaltourism) describes tiered medical-tourism assistance. These examples show that coordination and fee transparency are not exclusive to Affordia. The added copy instead combines locally focused Shenyang assistance, individual scope, independent consulting and clear conditions without claiming uniqueness or guaranteed savings.

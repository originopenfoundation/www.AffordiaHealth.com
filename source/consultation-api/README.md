# Affordia consultation: implementation and handover

Status: **local prototype only, not production-ready or deployed**. The public site remains on GitHub Pages. This directory proposes a separate same-origin Cloudflare Worker API because GitHub Pages cannot execute server-side code. `preview.mjs` is strictly a loopback, memory-only test harness, and Gmail responses are simulated there.

## What is implemented locally

- Responsive four-language form, dynamic repeated contact types, exactly one preferred contact, accessible labels and error summary, sensitive-health-information warning, privacy notice link, and preservation of form state on failure.
- Worker validates origin, content type, bounded request body and all fields; creates a signed short-lived form token, rate-limits token issuance and submissions, evaluates a honeypot, flags rather than blocks unusually fast completion, and uses transactional single-use tokens and idempotency keys.
- Requests are encrypted with AES-256-GCM before insertion into D1. A random request reference is generated. A protected, bearer-authenticated read/delete API records minimal administrative access events. IP addresses are keyed-hashed by hour for abuse counters; expired tokens and old counters are cleaned during submissions.
- At the owner's request, the Gmail API notification sends the request details, contact methods and random reference to affordiahealth@gmail.com. It is sent as a UTF-8 plain-text message. Gmail API success means provider acceptance, not confirmed inbox delivery. A failed notification leaves the encrypted record and returns its reference with the actual notification status. The form warns visitors not to send health information, but unexpected sensitive information can still be submitted and would be included in the email; mailbox access, retention and privacy safeguards must be reviewed before deployment.
- Existing pages, document groups, canonical links and language routes are retained. Source pages are generated with `npm run build` using Next.js static export; the earlier `vinext build` failed on 308 redirects. Semantic breadcrumb and service structured data have been added to applicable pages.

## Acceptance status and known gaps

| Area | Status | Evidence / remaining work |
| --- | --- | --- |
| Static export and 160 routes | PASS locally | `npm run build`, `node scripts/test-localized-export.mjs` |
| Mobile and browser journeys | PASS locally, CONDITIONAL overall | `browser-test.mjs`: 320, 360, 375, 390, 414, 768 and 1280 px; four routes in four locales; five synthetic journeys. No real production deployment, device lab, or screen reader test. |
| Local backend and abuse controls | CONDITIONAL | `node consultation-api/test.mjs` uses in-memory SQLite and mocked Gmail. No independent security review, distributed-load test, or Cloudflare D1 deployment has been completed. |
| Gmail delivery | BLOCKED | A real Gmail/Google Workspace OAuth client, authorized sending account, refresh token and an authorized test are not available. Mocks are not production verification. |
| Storage and production routing | BLOCKED | The Cloudflare account is not authenticated in this environment; no D1 database, Worker or same-origin route has been provisioned or verified. A Worker route must be compatible with the existing GitHub Pages origin without making unauthorized DNS changes. |
| Administration | CONDITIONAL | A bearer-protected JSON read/delete endpoint and minimal audit records exist. A user-friendly protected administrative view, named operator identities, access policies and independent access-control review are still needed. Cloudflare Access or another approved identity layer should protect administrative endpoints. |
| Data governance | BLOCKED | Confirm the actual data controller, notice, retention and deletion schedule for the database and mailbox, access logging retention, encryption-key custody and backup/recovery. Inquiries may unexpectedly contain sensitive information and are sent to Gmail at the owner's request. Automated expiration of customer requests has deliberately not been invented. Obtain appropriate legal/privacy review for GDPR, Swiss FADP and international transfers. |
| Notifications after failure | CONDITIONAL | A failed notification is recorded and shown to the customer, but a production retry queue and monitoring/escalation process are not yet implemented. |
| Translations | CONDITIONAL | All form strings exist for EN/DE/ES/zh-CN; native/professional review has not been performed. |
| Accessibility | CONDITIONAL | Keyboard and structural checks were exercised locally. WCAG 2.2 AA, contrast, complete assistive-technology and screen-reader verification are NOT_RUN. |
| Search/discovery | CONDITIONAL | Sitemap, canonical/hreflang tests and local JSON-LD parsing are checked. External structured-data validator, indexing, search traffic and actual crawler indexing are NOT_RUN. |

## Local tests

From the project root, use Node 24 or later:

```text
npm run build
node scripts/test-localized-export.mjs
node scripts/translation-audit.mjs
node consultation-api/check-structured-data.mjs
node consultation-api/test.mjs
node consultation-api/preview.mjs
```

Run `browser-test.mjs` against the preview using Playwright and a locally installed browser. `AFFORDIA_PLAYWRIGHT_PATH` and `AFFORDIA_BROWSER_PATH` may point to the bundled Playwright package and a browser executable. The preview runs only on `127.0.0.1:4173`, stores records in memory and mocks Gmail; never expose it publicly or use real customer data.

## Required staging/production configuration

1. Confirm legal controller and contact, data categories, retention/deletion rules, authorized staff, incident process, data region/transfers, approved provider and production security review. Obtain explicit production-deployment authorization separately.
2. Use `wrangler.example.toml` only as a template for a separate staging Worker and staging D1 database. No account IDs, live route or database are included. Configure a same-origin `/api/consultation*` and protected `/api/admin/requests/*` route only after inspecting the actual Cloudflare/GitHub Pages arrangement. Do not change live DNS without explicit authorization.
3. Bind D1 as `DB` and apply `schema.sql` to the approved database. Set `SITE_ORIGIN` exactly to the approved HTTPS origin. Worker secrets: `TOKEN_SECRET`, `RATE_SECRET`, `ENCRYPTION_KEY` (32 random bytes, base64url encoded), `ADMIN_TOKEN`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN`. Use the hosting provider's secret store; do not commit secrets or paste them into chat. `TOKEN_SECRET`, `RATE_SECRET` and `ADMIN_TOKEN` must each be high-entropy and at least 32 characters. Key rotation, encrypted backups and restricted access require an operational plan before real requests are accepted.
4. Enable Gmail API and obtain OAuth authorization from the owner of the sending account with the least-privilege `gmail.send` scope. Sender identity, token lifecycle, revocation, quotas, authorization and provider policy require verification. An OAuth app in testing may issue a refresh token that expires after seven days. See the [Gmail send API](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send), [server-side authorization](https://developers.google.com/workspace/gmail/api/auth/web-server), and [OAuth token lifecycle](https://developers.google.com/identity/protocols/oauth2/).
5. Implement and review a protected administrative interface, per-user authentication/access logging, approved retention cleanup, and reliable notification retry/monitoring. Test actual D1, Gmail delivery, browser accessibility, anti-abuse controls, cross-border handling and rollback in staging. Do not treat a successful build or mock as production acceptance.

## Deployment and rollback

No deployment has been performed. After all blockers are resolved, reviewed and explicitly authorized, deploy the Worker to a nonproduction route first, verify real delivery with an authorized test, then publish a matching static build and the approved Worker route together. Record exact previous GitHub commit, Worker version, routing configuration, database and secret revisions. Roll back static GitHub Pages to the recorded prior commit and restore the prior Worker route/version; do not delete the D1 database or encryption keys as part of rollback. Verify the live consultation path and contact fallback after rollback. Preserve user data and follow the approved retention process.

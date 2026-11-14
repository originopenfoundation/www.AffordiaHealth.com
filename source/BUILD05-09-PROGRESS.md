# Affordia Health - Build 05-09 progress and evidence

Updated: 2026-11-14. Status: partial release candidate; publication authorized for completed changes, without new languages or an automated form. Baseline GitHub Pages main1 commit: b7aadd270a2027bb8d2d0350ea0e69b59ffcd7be. Check the GitHub Pages deployment status for actual publication. No claim of final acceptance is made.

## Implemented and verified locally

- Document page titles now use locale-specific information labels, distinguishing them from corresponding regular pages. No page-body text was intentionally changed.
- Added copy-email controls to contact and consultation pages with visible success/error feedback and preserved mailto and Gmail compose links.
- Added the user-specified X profile in footer and contact page. A direct request on 2026-11-14 returned HTTP 200 at the specified URL, but profile contents and ownership were not independently verified; no verified-official claim or `sameAs` schema entry was added.
- Appended 28 localized FAQ question-and-answer pairs to the existing FAQ in all four current locales. `FAQ-COVERAGE.md` maps the 35 requested topics to existing or added answers; some answers cover multiple topics. This is an editorial self-check, not independent medical/legal/language review.
- Replaced the four always-visible language buttons with a compact openable menu inspired by the public OOF language selector. The current page path remains the same when switching between available locales; menu operation and Escape were tested. New locale pages were not added.
- Added `scripts/test-build05-seo.mjs`: all 160 local pages passed self-canonical, full reciprocal hreflang, English x-default, sitemap membership and noindex checks.
- Prepared a public IndexNow ownership key and a dry-run-first helper. Successful dry run, invalid-host rejection and refusal to submit without explicit flag were tested locally. The public key is intentionally not a secret. No URLs were submitted and live hosting of the key has not been verified.
- Created `LANGUAGE-MARKET-RESEARCH.md`: sources for Russia, Mongolia, Central Asia and regional facilities, a 30-country candidate inventory and preliminary 15-operator evidence sample. This is not an approved score or a complete systematic assessment.
- Added `LOCALIZATION-RELEASE-PLAN.md` and a structural `scripts/check-locale-candidate.mjs` gate for isolated future locale exports. It compares all 40 candidate paths to the existing English baseline and checks hashes for both the main source catalog and explicitly listed manually maintained copy. `scripts/test-locale-gate.mjs` exercised one synthetic passing fixture and verified that unapproved, already-live and stale-source candidates are rejected. This structural check does not authenticate a review or make a new translation complete.
- Added `scripts/audit-competitors.mjs` and a dated read-only snapshot of 15 competitor pages. All 15 returned HTTP success in this single-location run; the HTML indicators do not demonstrate working translations or business performance. Thirty country entries now have a research-triage table with explicitly identified missing evidence, but the final language ranking remains unverified.
- The owner confirmed the team can respond in English and Chinese. Updated the consultation contact copy in four existing locales and Organization ContactPoint language data accordingly. Other-language customer support remains unverified, and this does not establish independent language or medical interpreting certification.
- Preserved the existing production email fallback; the prototype form remains inactive.
- `npm run build` passed. `scripts/test-localized-export.mjs` passed for 160 pages, 96 document-language versions, 9,308 document blocks, and 12,476 local internal links. `consultation-api/check-structured-data.mjs` passed for 160 pages, 156 breadcrumb pages, 4 service and 4 organization pages.
- Before/after snapshots produced by `scripts/build05-snapshot.mjs` showed identical URL inventory, 96 document body hashes, and hashes for the protected source files explicitly listed in the script. This is not proof that every byte of every existing page body is unchanged.
- Exact duplicate title groups changed from 55 (115 URLs) to 1 (3 URLs). The remaining title is `Affordia Care | Affordia Health` on English, German and Spanish versions of the same branded page; this is an intentional cross-language brand name exception, not a reason to suppress a page.
- `scripts/test-build05-browser.mjs` passed 320, 360, 390, 428, 768, 1024, 1280 and 1920 px, in four locales across five route types. It exercised an actual language switch, menu open/keyboard Escape, clipboard copy and X-link presence. A JavaScript-disabled check also verified the menu links and hiding the non-functional copy button while preserving the email link. It did not verify real mailbox delivery or screen-reader behavior.
- `scripts/test-build05-axe.mjs` initially reported color-contrast failures. Adjusted text colors, rebuilt and retested 40 local page/language/viewport combinations (390 and 1280 px; five routes; four languages): zero violations in the configured automated WCAG rule tags. This is not a complete WCAG 2.2 AA audit or screen-reader verification.

## Live evidence

- On 2026-11-13, requests from this network to the live homepage with the user-agent strings Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot and Baiduspider returned HTTP 200 and included the Shenyang-positioning text. These are spoofed user-agent tests, not proof of access by real verified crawlers, actual visits, indexing, or regional accessibility.
- Public `robots.txt` from the previous audit permits all agents. No change was made to AI training permissions. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) distinguishes search, user actions and training; [Google verification guidance](https://developers.google.com/search/docs/crawling-indexing/googlebot) explains that user-agent strings alone are insufficient.
- On 2026-11-14, OOF's public `header.js` was inspected and found to implement an openable language-selector panel. Affordia's local selector now uses a compact expandable menu; it does not copy the full OOF modal or its full set of languages.
- On 2026-11-14, an external web search for `"Affordia Health" "Shenyang" consultation` returned no results in this search tool. A small set of non-brand English, German, Spanish and Chinese searches returned other providers, official pages or guides. These are limited, non-representative search-tool observations, not verified Google/Bing rankings, external AI answers, index coverage, or proof that the brand never appears in other searches.

## Blocked / not run / incomplete

- BLOCKED: real receipt and response from the authorized Gmail mailbox. The user explicitly deferred Gmail/Cloudflare backend work. No real customer or test email was sent, and no form was enabled.
- BLOCKED: Search Console/Bing Webmaster property verification, sitemap submission, indexing coverage, analytics/event verification and real field Core Web Vitals; no authorized account data was accessed. IndexNow was not submitted.
- NOT RUN: actual external AI discovery, independent blinded 50-question comprehension and hallucination tests, confirmed crawler log/IP verification, real multi-region probes, full screen-reader/WCAG and professional translation review, Lighthouse, and authenticated security/privacy assessment. A limited automated axe-core check is reported above and does not substitute for these.
- INCOMPLETE: Build 07's independent FAQ review and platform matrix, and Build 08's country-by-country evidence assessment, complete competitor comparison, 20+ language scoring, sensitivity analysis and ranked ten-language recommendation. The preliminary research inventory is not enough to select languages confidently. No additional language URLs were generated or deployed.
- X account ownership is unverified. No follower counts, paid endorsements, or social posts were created.
- RELEASE STATUS: the owner authorized publication of the prepared four-language changes without new locales or the automated form. Verify GitHub Pages deployment and the live website separately; the evidence above is primarily local.

## Next practical steps

1. Complete research from country-specific and primary sources, document gaps, then present the language ranking for user approval before translating or publishing new locales.
2. Complete FAQ coverage, independently review sensitive content and translations, and test actual accessibility with assistive technology.
3. When the user chooses to revisit it, establish authorized test delivery and privacy controls before enabling the server-side inquiry form.
4. Complete external account-dependent checks with the relevant owner, and request explicit approval for any later expanded-language or backend release.

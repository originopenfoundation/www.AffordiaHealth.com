# Affordia Health language content

English is preserved as the source. German, Spanish and Simplified Chinese are
stored, versioned translations, rendered into static HTML at build time. There is
no external translation widget, DOM rewriting or untranslated-English fallback.

- `source.json`: 2,481 unique source strings with stable content-derived IDs and document origins.
- `de.json`, `es.json`, `zh-CN.json`: complete release catalogs used by the site.
- `editorial-overrides.json`: shared editorial corrections; columns are DE, ES, ZH.
- `reviewed-*.json`: language-specific corrections, applied last.
- `locale.ts`: language identifiers and URL routing.
- `catalog.ts`: server-side lookup; a missing entry fails the production build.

The initial long-document drafts were prepared offline with Google translation,
then revised for terminology, forms, navigation, brand names, tone and identified
meaning errors. On 4 September 2026, a parallel AI-assisted review against the
English source was completed across all 2,481 entries in each target language.
Interrupted review ranges were resumed from saved checkpoints; Chinese was
split between a language reviewer and the site owner for the final range.
The site owner integrated the corrections and checked protected contact details,
numbers, complete document content and language routing. This was an AI review,
not human specialist proofreading or independent verification of source claims.
The published site does not call the draft translation service. Coverage checks
are not certification that every medical or legal translation is error-free.
Independent specialist proofreading is still recommended before relying on the
translated policy wording in legal or clinical decisions. No new governing-law
or English-prevails clause has been added to the user's texts.

## Validation

Run `node scripts/translation-audit.mjs`, `npx next build` and
`node scripts/test-localized-export.mjs`. Tests verify complete catalogs, missing
English translations, numeric/negation review flags, language-preserving links,
all 24 documents in each language in the original block order, form options,
HTML language, canonical/hreflang metadata and retention of analytics.

After publishing, `node scripts/check-published-locales.mjs` checks all 160
public URLs and compares each page's main content with the validated export.
This is an HTTP/content check, not a browser interaction or visual test.

The URL selects the language: `/` (EN), `/de/`, `/es/`, `/zh-CN/`. Language links
keep the same subpage. No cookie, local storage or external script is required.
Brand names, contact details, currency abbreviations and language self-names can
remain unchanged where appropriate. Chinese brand labels are localized.

For future text changes, update the English source, run the extractor, supply and
review all three new translations, then run the validation commands. Release
catalogs are sufficient for a normal build; draft-generation tools are optional
and never run as part of building or serving the website.

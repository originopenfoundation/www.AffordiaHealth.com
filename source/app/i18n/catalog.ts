import source from './source.json';
import de from './de.json';
import es from './es.json';
import zh from './zh-CN.json';
import { normalizeText, type Locale } from './locale';
import type { SitePage } from '../site-data';

const ids = new Map(source.map(item => [item.text, item.id]));
const catalogs: Record<Exclude<Locale, 'en'>, Record<string, string>> = { de, es, 'zh-CN': zh };

// Missing translations fail the build. Never silently mix English into a locale.
export function translator(locale: Locale) {
  return (original: string): string => {
    if (locale === 'en' || !original.trim()) return original;
    const text = normalizeText(original);
    if (!/[a-zA-Z\u4e00-\u9fff]/.test(text)) return original;
    const id = ids.get(text);
    const translation = id && catalogs[locale][id];
    if (!translation?.trim()) throw new Error(`Missing ${locale} translation: ${text}`);
    return translation;
  };
}
export function translatePage(page: SitePage, locale: Locale): SitePage {
  const t = translator(locale);
  return { ...page, eyebrow: t(page.eyebrow), title: t(page.title), intro: t(page.intro),
    sections: page.sections.map(section => ({ ...section, title: t(section.title),
      eyebrow: section.eyebrow ? t(section.eyebrow) : undefined, body: section.body?.map(t),
      quote: section.quote ? t(section.quote) : undefined,
      cards: section.cards?.map(card => ({ title: t(card.title), body: card.body ? t(card.body) : undefined })),
    })),
  };
}

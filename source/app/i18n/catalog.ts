import candidate0 from './ru.json';
import candidate1 from './ar.json';
import candidate2 from './fr.json';
import candidate3 from './bn.json';
import candidate4 from './hi.json';
import candidate5 from './pt-BR.json';
import candidate6 from './id.json';
import candidate7 from './ko.json';
import candidate8 from './ja.json';
import candidate9 from './vi.json';
import source from './source.json';
import de from './de.json';
import es from './es.json';
import zh from './zh-CN.json';
import { normalizeText, type Locale } from './locale';
import type { SitePage } from '../site-data';

const ids = new Map(source.map(item => [item.text, item.id]));
const catalogs: Record<Exclude<Locale, 'en'>, Record<string, string>> = { de, es, 'zh-CN': zh, "ru": candidate0, "ar": candidate1, "fr": candidate2, "bn": candidate3, "hi": candidate4, "pt-BR": candidate5, "id": candidate6, "ko": candidate7, "ja": candidate8, "vi": candidate9 };

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

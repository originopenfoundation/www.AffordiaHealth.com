export const locales = ['en', 'de', 'es', 'zh-CN'] as const;
export type Locale = (typeof locales)[number];
export const languageOptions = [
  { code: 'en', shortLabel: 'EN', name: 'English' },
  { code: 'de', shortLabel: 'DE', name: 'Deutsch' },
  { code: 'es', shortLabel: 'ES', name: 'Español' },
  { code: 'zh-CN', shortLabel: '中文', name: '简体中文' },
] as const;
export function localizePath(locale: Locale, path = '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
  return locale === 'en' ? normalized : `/${locale}${normalized}`;
}
export function normalizeText(text: string) { return text.replace(/\s+/g, ' ').trim(); }

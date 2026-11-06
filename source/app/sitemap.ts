import type { MetadataRoute } from 'next';
import { pdfDocuments } from './pdf-library';
import { canonicalUrl, SEO_UPDATED_AT } from './seo';
import { pages } from './site-data';
import { locales, localizePath } from './i18n/locale';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const primaryPaths = [
    '/',
    ...Object.keys(pages).map((slug) => `/${slug}`),
    '/book-a-free-consultation',
    '/library',
  ];
  const libraryPaths = pdfDocuments.map(({ slug }) => `/library/${slug}`);

  return [...new Set([...primaryPaths, ...libraryPaths])].flatMap((path) => locales.map(locale => ({
    url: canonicalUrl(localizePath(locale, path)),
    alternates: { languages: Object.fromEntries(locales.map(code => [code, canonicalUrl(localizePath(code, path))])) },
    lastModified: SEO_UPDATED_AT,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/library' ? 0.7 : path.startsWith('/library/') ? 0.6 : 0.8,
  })));
}

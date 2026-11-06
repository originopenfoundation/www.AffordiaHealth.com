import { localizePath, type Locale } from './i18n/locale';
import { translator } from './i18n/catalog';
import { canonicalUrl } from './seo';

export function PageStructuredData({ locale, path, title, description, service = false }: { locale: Locale; path: string; title: string; description?: string; service?: boolean }) {
  const url = canonicalUrl(localizePath(locale, path));
  const home = canonicalUrl(localizePath(locale, '/'));
  const graph: Record<string, unknown>[] = [{
    '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: translator(locale)('Affordia Health'), item: home },
      { '@type': 'ListItem', position: 2, name: title, item: url },
    ],
  }];
  if (service && description) graph.push({ '@type': 'Service', name: title, description, url, provider: { '@type': 'Organization', '@id': `${canonicalUrl('/')}#organization` } });
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

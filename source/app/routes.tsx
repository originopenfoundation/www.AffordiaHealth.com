import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Home from './home-page';
import { ContentPage, CtaBand, SiteFooter, SiteHeader } from './site-components';
import { ConsultationContact } from './consultation-form';
import { formText } from './form-data';
import { pages } from './site-data';
import { menuGroups, pdfDocuments, pdfDocumentBySlug } from './pdf-library';
import { translator } from './i18n/catalog';
import { locales, localizePath, type Locale } from './i18n/locale';
import { canonicalUrl } from './seo';
import { PageStructuredData } from './structured-data';

export const allPaths = ['/', ...Object.keys(pages).map(slug => `/${slug}`), '/book-a-free-consultation', '/library', ...pdfDocuments.map(doc => `/library/${doc.slug}`)];
export type RouteProps = { params: Promise<{ path?: string[] }> };
export function staticPaths() { return allPaths.map(path => ({ path: path.split('/').filter(Boolean) })); }
export function pathFrom(parts?: string[]) { return parts?.length ? '/' + parts.join('/') : '/'; }
function linkEmail(text: string) {
  const parts = text.split(/(affordiahealth@gmail\.com)/gi);
  return parts.map((part, index) => part.toLowerCase() === 'affordiahealth@gmail.com'
    ? <a key={index} href="mailto:affordiahealth@gmail.com">{part}</a> : part);
}

export function routeMetadata(locale: Locale, path: string): Metadata {
  const t = translator(locale);
  const slug = path.slice(1);
  const doc = path.startsWith('/library/') ? pdfDocumentBySlug.get(path.slice(9)) : undefined;
  const page = pages[slug];
  let heading = 'Affordia Health', description = 'Access high-quality healthcare in China with professional coordination, flexible services and reliable local support.';
  if (doc) { heading = doc.title; description = doc.summary; }
  else if (page) { heading = page.eyebrow; description = page.intro; }
  else if (slug === 'book-a-free-consultation') { heading = 'Book a Free Consultation'; description = "Tell Us What You Need. Let's Explore Your Options."; }
  else if (slug === 'library') { heading = 'Affordia Health Information'; description = 'Explore Affordia Health services, healthcare information, partner opportunities and important policies.'; }
  const title = path === '/' ? `${t('Affordia Health')} | ${t('Affordable Healthcare Solutions Worldwide.')}` : `${t(heading)} | ${t('Affordia Health')}`;
  const url = canonicalUrl(localizePath(locale, path));
  const languages = Object.fromEntries(locales.map(code => [code, canonicalUrl(localizePath(code, path))]));
  const image = path === '/' ? '/og.png' : page?.image?.replace('.webp', '.png');
  return { title, applicationName: t('Affordia Health'), description: t(description), alternates: { canonical: url, languages: { ...languages, 'x-default': languages.en } },
    openGraph: { title, description: t(description), url, siteName: t('Affordia Health'), locale: { en: 'en_US', de: 'de_DE', es: 'es_ES', 'zh-CN': 'zh_CN' }[locale], type: doc ? 'article' : 'website', images: image ? [image] : [] },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description: t(description), images: image ? [image] : [] },
  };
}

export function RenderRoute({ locale, path }: { locale: Locale; path: string }) {
  const t = translator(locale);
  const l = (href: string) => localizePath(locale, href);
  if (path === '/') return <Home locale={locale} />;
  if (path === '/book-a-free-consultation') {
    return <><SiteHeader locale={locale} path={path} /><main id="main-content"><PageStructuredData locale={locale} path={path} title={t('Book a Free Consultation')} /><section className="consultation-page"><div className="consultation-intro"><p className="kicker">{t('Book a Free Consultation')}</p><h1>{t("Tell Us What You Need. Let's Explore Your Options.")}</h1><p>{t('Your first consultation with Affordia Health is free. You do not need to prepare extensive medical documentation or make any commitment before speaking with us.')}</p><p>{t('No commitment. No upfront payment. Start with a conversation.')}</p></div><ConsultationContact locale={locale} copy={Object.fromEntries(formText.map(text => [text, t(text)]))} /></section><SiteFooter locale={locale} /></main></>;
  }
  if (path === '/library') return <><SiteHeader locale={locale} path={path} /><main id="main-content"><PageStructuredData locale={locale} path={path} title={t('Explore Your Options')} />
    <section className="library-hero"><p className="kicker">{t('Affordia Health')}</p><h1>{t('Explore Your Options')}</h1><p>{t('Start with one service. Add only what you need.')}</p></section>
    <section className="library-groups">{menuGroups.map(group => <div className="library-group" key={group.label}><h2>{t(group.label)}</h2><div className="library-links">{group.documents.map(doc => <a href={l(`/library/${doc.slug}`)} key={doc.slug}><span>{t(doc.title)}</span><b aria-hidden="true">→</b></a>)}</div></div>)}</section><CtaBand locale={locale} /><SiteFooter locale={locale} /></main></>;
  if (path.startsWith('/library/')) {
    const doc = pdfDocumentBySlug.get(path.slice(9));
    if (!doc) notFound();
    return <><SiteHeader locale={locale} path={path} /><main id="main-content"><PageStructuredData locale={locale} path={path} title={t(doc.title)} /><article className="document-page"><header className="document-hero"><p className="kicker">{t(doc.category)}</p><h1>{t(doc.title)}</h1><p>{t('Affordable Healthcare Solutions Worldwide.')}</p><a className="button button-secondary" href={l('/library')}>{t('Explore Your Options')}</a></header>
      <div className="document-body">{doc.blocks.map((block, index) => block.type === 'heading' ? <h2 key={index}>{linkEmail(t(block.text))}</h2> : <p key={index} className={block.type === 'list' ? 'document-list-item' : undefined}>{linkEmail(t(block.text))}</p>)}</div>
    </article><CtaBand locale={locale} /><SiteFooter locale={locale} /></main></>;
  }
  const page = pages[path.slice(1)];
  if (!page) notFound();
  return <ContentPage page={page} locale={locale} />;
}

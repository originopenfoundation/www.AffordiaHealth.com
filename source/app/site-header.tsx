import { LanguageSwitcher } from './language-switcher';
import { localizePath, type Locale } from './i18n/locale';
import Image from 'next/image';

export type NavigationGroup = { id: string; label: string; documents: { slug: string; title: string }[] };
export type HeaderCopy = { brand: string; slogan: string; home: string; navigation: string; menu: string; consultation: string; language: string };

const skipLabels: Record<Locale, string> = {
  en: 'Skip to content',
  de: 'Zum Inhalt springen',
  es: 'Saltar al contenido',
  'zh-CN': '跳至主要内容',
};

export function SiteNavigation({ locale, path, groups, copy }: { locale: Locale; path: string; groups: NavigationGroup[]; copy: HeaderCopy }) {
  const l = (href: string) => localizePath(locale, href);
  return <>
    <a className="skip-link" href="#main-content">{skipLabels[locale]}</a>
    <header className="site-header">
      <a className="brand brand-lockup" href={l('/')} aria-label={copy.home}>
        <span className="brand-mark" aria-hidden="true"><Image src="/images/affordia-health-logo.webp" alt="" width={105} height={105} /></span>
        <span className="brand-copy"><strong>{copy.brand}</strong><small>{copy.slogan}</small></span>
      </a>
      <nav className="desktop-nav" aria-label={copy.navigation}>
        {groups.map(group => <details className="nav-group" name="desktop-navigation" key={group.id}>
          <summary>{group.label}<span aria-hidden="true" /></summary>
          <div className="nav-dropdown">{group.documents.map(doc => <a href={l(doc.slug === 'contact' ? '/contact' : doc.slug === 'book-a-free-consultation' ? '/book-a-free-consultation' : `/library/${doc.slug}`)} key={doc.slug}>{doc.title}</a>)}</div>
        </details>)}
        <LanguageSwitcher locale={locale} path={path} label={copy.language} />
        <a className="header-cta" href={l('/book-a-free-consultation')}>{copy.consultation}</a>
      </nav>
      <div className="mobile-header-actions">
        <LanguageSwitcher locale={locale} path={path} label={copy.language} />
        <details className="mobile-menu">
          <summary className="mobile-menu-trigger"><span>{copy.menu}</span><i aria-hidden="true" /></summary>
          <nav className="mobile-menu-panel" aria-label={copy.navigation}>
            <div className="mobile-menu-scroll">{groups.map(group => <section key={group.id}><h2>{group.label}</h2>{group.documents.map(doc => <a href={l(doc.slug === 'contact' ? '/contact' : doc.slug === 'book-a-free-consultation' ? '/book-a-free-consultation' : `/library/${doc.slug}`)} key={doc.slug}>{doc.title}</a>)}</section>)}</div>
            <a className="header-cta" href={l('/book-a-free-consultation')}>{copy.consultation}</a>
          </nav>
        </details>
      </div>
    </header>
  </>;
}

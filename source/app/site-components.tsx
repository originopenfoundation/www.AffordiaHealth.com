import { translator, translatePage } from './i18n/catalog';
import { localizePath, type Locale } from './i18n/locale';
import Image from 'next/image';
import { type SitePage } from './site-data';
import { SiteNavigation } from './site-header';
import { menuGroups } from './pdf-library';
import { PageStructuredData } from './structured-data';
export function SiteFooter({ locale = 'en' }: {
    locale?: Locale;
}) {
    const t = translator(locale);
    const l = (href: string) => localizePath(locale, href);
    return (<footer className="site-footer">
      <div className="footer-brand">
        <a className="brand brand-lockup footer-lockup" href={l("/")} aria-label={t("Affordia Health \u2014 home")}>
          <span className="brand-mark" aria-hidden="true"><Image src="/images/affordia-health-logo.webp" alt="" width={136} height={136}/></span>
          <span className="brand-copy">
            <strong>{t("Affordia Health")}</strong>
            <small>{t("Affordable Healthcare Solutions Worldwide.")}</small>
          </span>
        </a>
        <a className="button button-gold" href={l("/book-a-free-consultation")}>{t("Book a Free Consultation")}</a>
      </div>
      <div>
        <h2>{t("Explore Your Options")}</h2>
        <a href={l("/services")}>{t("Our Services")}</a>
        <a href={l("/how-it-works")}>{t("How It Works")}</a>
        <a href={l("/why-china")}>{t("Why China?")}</a>
        <a href={l("/pricing")}>{t("Pricing")}</a>
        <a href={l("/faq")}>{t("Frequently Asked Questions")}</a>
        <a href={l("/library")}>{t("Explore Your Options")}</a>
      </div>
      <div>
        <h2>{t("Affordia Health")}</h2>
        <a href={l("/affordia-care")}>{t("Affordia Care")}</a>
        <a href={l("/partner-network")}>{t("Partner Network")}</a>
        <a href={l("/about-us")}>{t("About Us")}</a>
        <a href={l("/contact")}>{t("Contact")}</a>
      </div>
      <div>
        <h2>{t("Clear Roles. Clear Responsibilities.")}</h2>
        <a href={l("/terms-and-conditions")}>{t("Terms & Conditions")}</a>
        <a href={l("/data-protection-medical-privacy")}>{t("Data Protection & Medical Privacy")}</a>
        <a href={l("/cancellation-refund-policy")}>{t("Cancellation & Refund Policy")}</a>
        <a href={l("/medical-responsibility-liability")}>{t("Medical Responsibility & Liability")}</a>
      </div>
      <div className="footer-bottom"><span>{t("Affordia Health")}</span><span>{t("Healthcare in China. Made More Accessible.")}</span></div>
    </footer>);
}
export function PageHero({ page, locale = 'en' }: {
    page: SitePage;
    locale?: Locale;
}) {
    const t = translator(locale);
    const l = (href: string) => localizePath(locale, href);
    const imageClass = page.image?.includes('tablet')
        ? 'image-tablet'
        : page.image?.includes('airport')
            ? 'image-airport'
            : 'image-hospital';
    return (<section className={`page-hero ${page.image ? '' : 'page-hero-no-image'}`}>
      <div className="page-hero-copy">
        <p className="kicker">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={l("/book-a-free-consultation")}>{t("Free Initial Consultation")}</a>
          <a className="button button-secondary" href={l("/services")}>{t("Explore Your Options")}</a>
        </div>
      </div>
      {page.image && <div className={`page-hero-image ${imageClass}`}><Image src={page.image} alt={page.title} fill priority sizes="(max-width: 1120px) 100vw, 46vw"/><span /></div>}
    </section>);
}
export function ContentPage({ page: original, locale = 'en' }: {
    page: SitePage;
    locale?: Locale;
}) {
    const page = translatePage(original, locale);
    return (<><SiteHeader locale={locale} path={`/${page.slug}`}/><main id="main-content"><PageStructuredData locale={locale} path={`/${page.slug}`} title={page.eyebrow} description={page.intro} service={page.slug === 'services'} />
      <PageHero page={page} locale={locale}/>
      <div className="content-sections">
        {page.sections.map((section, sectionIndex) => (<section className={`content-section ${sectionIndex % 2 ? 'content-section-tint' : ''}`} key={`${section.title}-${sectionIndex}`}>
            <div className="content-heading">
              {section.eyebrow && <p className="kicker">{section.eyebrow}</p>}
              <h2>{section.title}</h2>
              {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.cards && <div className={`content-grid ${section.cards.length > 8 ? 'content-grid-steps' : ''}`}>
              {section.cards.map((card, index) => (<article key={`${card.title}-${index}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{card.title}</h3>
                  {card.body && <p>{card.body}</p>}
                </article>))}
            </div>}
            {section.quote && <blockquote>{section.quote}</blockquote>}
          </section>))}
      </div>
      {page.slug === 'contact' && <ContactPanel locale={locale}/>}
      <CtaBand locale={locale}/>
      <SiteFooter locale={locale}/>
    </main></>);
}
function ContactPanel({ locale = 'en' }: {
    locale?: Locale;
}) {
    const t = translator(locale);
    return (<section className="contact-panel">
      <div><p className="kicker">{t("Contact")}</p><h2>{t("Start With a Conversation")}</h2><p>{t("You do not need to know exactly which service you need before contacting us. Tell us what you are trying to solve. We will listen first.")}</p></div>
      <div className="contact-card"><h3>{t("Email")}</h3><a href="mailto:affordiahealth@gmail.com">{t("affordiahealth@gmail.com")}</a><h3>{t("Postal Address")}</h3><p>{t("Hromadu 819/19")}<br />{t("972 12 Nedo\u017Eery-Brezany")}<br />{t("Slovakia")}</p></div>
    </section>);
}
export function CtaBand({ locale = 'en' }: {
    locale?: Locale;
}) {
    const t = translator(locale);
    const l = (href: string) => localizePath(locale, href);
    return (<section className="cta-band">
      <div><p className="kicker">{t("Start With a Free Consultation")}</p><h2>{t("Tell us what you need. We will help you understand what may be possible.")}</h2></div>
      <a className="button button-gold" href={l("/book-a-free-consultation")}>{t("BOOK MY FREE CONSULTATION")}</a>
    </section>);
}
export function SiteHeader({ locale = 'en', path = '/' }: {
    locale?: Locale;
    path?: string;
}) {
    const t = translator(locale);
    return <SiteNavigation locale={locale} path={path} groups={menuGroups.map((group, index) => ({
            id: String(index), label: t(group.label), documents: group.documents.map(doc => ({ slug: doc.slug, title: t(doc.title) }))
        }))} copy={{ brand: t('Affordia Health'), slogan: t('Affordable Healthcare Solutions Worldwide.'), home: t('Affordia Health — home'), navigation: t('Primary navigation'), menu: t('Menu'), consultation: t('Free Initial Consultation'), language: t('Language selection') }}/>;
}

import { translator } from './i18n/catalog';
import { localizePath, type Locale } from './i18n/locale';
import Image from 'next/image';
import { CtaBand, SiteFooter, SiteHeader } from './site-components';
import { canonicalUrl } from './seo';
const services = [
    'Hospital & Clinic Selection',
    'Medical Coordination',
    'Travel & Visa Assistance',
    'Airport Pickup',
    'Accommodation Assistance',
    'Interpreter Service',
    'Local Support',
];
const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': `${canonicalUrl('/')}#organization`,
            name: 'Affordia Health',
            url: canonicalUrl('/'),
            logo: canonicalUrl('/images/affordia-health-logo.png'),
            email: 'affordiahealth@gmail.com',
            description: 'Access high-quality healthcare in China with professional coordination, flexible services and reliable local support.',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Hromadu 819/19',
                postalCode: '972 12',
                addressLocality: 'Nedožery-Brezany',
                addressCountry: 'SK',
            },
        },
        {
            '@type': 'WebSite',
            '@id': `${canonicalUrl('/')}#website`,
            name: 'Affordia Health',
            url: canonicalUrl('/'),
            publisher: { '@id': `${canonicalUrl('/')}#organization` },
            inLanguage: 'en',
        },
    ],
};
export default function Home({ locale = 'en' }: {
    locale?: Locale;
}) {
    const t = translator(locale);
    const l = (href: string) => localizePath(locale, href);
    return (<><SiteHeader locale={locale} path="/"/><main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...organizationJsonLd, '@graph': organizationJsonLd['@graph'].map(item => ({ ...item, name: t('Affordia Health'), ...(item.description ? { description: t(item.description) } : {}), ...(item.inLanguage ? { inLanguage: locale, url: canonicalUrl(l('/')) } : {}) })) }) }}/>

      <section className="home-hero">
        <div className="hero-collage" aria-label={t("Affordia Health support")}>
          <div className="photo photo-main"><Image src="/images/hospital-welcome.webp" alt={t("An international patient welcomed by an Affordia Health coordinator")} fill priority sizes="(max-width: 800px) 100vw, 48vw"/></div>
          <div className="photo photo-detail"><Image src="/images/tablet-consultation.webp" alt={t("A patient reviewing healthcare options with a coordinator")} fill priority sizes="(max-width: 800px) 100vw, 32vw"/></div>
        </div>
        <div className="hero-copy">
          <p className="kicker">{t("Affordia Health")}</p>
          <h1>{t("Affordable Healthcare Solutions Worldwide.")}</h1>
          <h2>{t("Healthcare in China. Made More Accessible.")}</h2>
          <p>{t("Access high-quality healthcare in China with professional coordination, flexible services and reliable local support.")}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={l("/book-a-free-consultation")}>{t("Free Initial Consultation")}</a>
            <a className="button button-secondary" href={l("/services")}>{t("Explore Your Options")}</a>
          </div>
        </div>
      </section>

      <section className="service-preview">
        <article className="journey-card">
          <span className="round-icon">◎</span>
          <h2>{t("Complete Medical Journey")}</h2>
          <p>{t("Your Journey. Your Choice.")}</p>
          <p>{t("Start with one service. Add only what you need.")}</p>
        </article>
        <div className="service-panel">
          <div className="section-label"><span />{t("Choose Only What You Need")}<span /></div>
          <div className="service-grid">
            {services.map((service, index) => (<article key={service}><span className="service-icon">{String(index + 1).padStart(2, '0')}</span><h3>{t(service)}</h3></article>))}
          </div>
        </div>
      </section>

      <section className="value-strip">
        <span>{t("Independent by Design")}</span>
        <span>{t("Pay As You Go")}</span>
        <span>{t("Your Journey. Your Choice.")}</span>
      </section>

      <section className="home-feature">
        <div className="home-feature-copy"><p className="kicker">{t("How It Works")}</p><h2>{t("Your Medical Journey, Step by Step")}</h2><p>{t("Travelling to another country for healthcare can seem complicated. Affordia Health makes the process easier by helping you research, organise and coordinate your medical journey in China while keeping you in control of your decisions and expenses.")}</p><a className="button button-secondary" href={l("/how-it-works")}>{t("See How It Works")}</a></div>
        <div className="home-feature-steps"><article><span>01</span><h3>{t("Tell Us What You Need")}</h3></article><article><span>02</span><h3>{t("We Explore Your Options")}</h3></article><article><span>03</span><h3>{t("You Decide")}</h3></article><article><span>04</span><h3>{t("We Coordinate")}</h3></article></div>
      </section>

      <section className="home-feature home-feature-image">
        <div className="feature-photo"><Image src="/images/airport-arrival.webp" alt={t("Affordia Health airport arrival support")} fill sizes="(max-width: 800px) 100vw, 48vw"/></div>
        <div className="home-feature-copy"><p className="kicker">{t("Local Support Makes the Difference")}</p><h2>{t("International Access. Local Support.")}</h2><p>{t("Within the regions we support, local assistance can accompany your journey through airport pickup, transportation, interpretation, hospital navigation and practical support.")}</p><p>{t("You may travel far for healthcare. You do not have to navigate the journey alone.")}</p><a className="button button-primary" href={l("/services")}>{t("View All Services")}</a></div>
      </section>

      <section className="care-home"><div><p className="kicker">{t("Affordia Care")}</p><h2>{t("Global Online Prevention & Long-Term Health Support")}</h2><p>{t("You Don't Have to Travel to China to Access Affordia Care.")}</p><a className="button button-gold" href={l("/affordia-care")}>{t("Affordia Care")}</a></div><div className="care-home-photo"><Image src="/images/tablet-consultation.webp" alt={t("Affordia Care online support")} fill sizes="(max-width: 800px) 100vw, 48vw"/></div></section>

      <CtaBand locale={locale}/>
      <SiteFooter locale={locale}/>
    </main></>);
}

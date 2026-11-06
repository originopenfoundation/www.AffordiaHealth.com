import { Fragment } from 'react';
import { languageOptions, localizePath, type Locale } from './i18n/locale';

export function LanguageSwitcher({ locale, path, label }: { locale: Locale; path: string; label: string }) {
  return <div className="language-switcher" role="group" aria-label={label}>
    {languageOptions.map((option, index) => <Fragment key={option.code}>
      <a href={localizePath(option.code, path)} lang={option.code} hrefLang={option.code}
        className={locale === option.code ? 'is-active' : ''}
        aria-label={option.name} aria-current={locale === option.code ? 'true' : undefined}
        title={option.name}>{option.shortLabel}</a>
      {index < languageOptions.length - 1 && <span aria-hidden="true" />}
    </Fragment>)}
  </div>;
}

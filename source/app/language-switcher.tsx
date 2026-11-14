'use client';

import { useEffect, useRef } from 'react';
import { languageOptions, localizePath, type Locale } from './i18n/locale';

export function LanguageSwitcher({ locale, path, label }: { locale: Locale; path: string; label: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const current = languageOptions.find(option => option.code === locale) ?? languageOptions[0];
  useEffect(() => {
    function outside(event: PointerEvent) { if (details.current?.open && !details.current.contains(event.target as Node)) details.current.open = false; }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape' && details.current?.open) { details.current.open = false; details.current.querySelector('summary')?.focus(); } }
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);
  return <details className="language-switcher" ref={details}>
    <summary aria-label={`${label}: ${current.name}`}><span aria-hidden="true">◎</span><span>{current.shortLabel}</span><span className="language-chevron" aria-hidden="true" /></summary>
    <div className="language-options" aria-label={label}>
      {languageOptions.map(option => <a key={option.code} href={localizePath(option.code, path)} lang={option.code} hrefLang={option.code}
        className={locale === option.code ? 'is-active' : ''} aria-current={locale === option.code ? 'page' : undefined}>
        <span>{option.name}</span>{locale === option.code && <span aria-hidden="true">✓</span>}
      </a>)}
    </div>
  </details>;
}

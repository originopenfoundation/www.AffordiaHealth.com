import type { Locale } from './i18n/locale';
const label: Record<Locale, string> = { en: 'Affordia Health on X', de: 'Affordia Health auf X', es: 'Affordia Health en X', 'zh-CN': 'Affordia Health 的 X 主页' };
export function SocialLink({ locale }: { locale: Locale }) {
  return <a href="https://x.com/AffordiaHealth" target="_blank" rel="noopener noreferrer" aria-label={label[locale]}><span aria-hidden="true">𝕏</span> {label[locale]}</a>;
}

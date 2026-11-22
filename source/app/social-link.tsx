import type { Locale } from './i18n/locale';
const label: Record<Locale, string> = { en: 'Affordia Health on X', de: 'Affordia Health auf X', es: 'Affordia Health en X', 'zh-CN': 'Affordia Health 的 X 主页' ,
 "ru": "Аффордия Здоровье на X",
 "ar": "أفورديا هيلث على X",
 "fr": "Affordia Santé sur X",
 "bn": "অ্যাফোর্ডিয়া হেলথ অন এক্স",
 "hi": "एक्स पर अफोर्डिया हेल्थ",
 "pt-BR": "Affordia Saúde no X",
 "id": "Affordia Kesehatan di X",
 "ko": "X의 아포디아 헬스",
 "ja": "X 上のアフォーディア ヘルス",
 "vi": "Afordia Health trên X"
};
export function SocialLink({ locale }: { locale: Locale }) {
  return <a href="https://x.com/AffordiaHealth" target="_blank" rel="noopener noreferrer" aria-label={label[locale]}><span aria-hidden="true">𝕏</span> {label[locale]}</a>;
}

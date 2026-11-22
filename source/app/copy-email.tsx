'use client';
import { useState } from 'react';
import type { Locale } from './i18n/locale';
const messages: Record<Locale, { copy: string; copied: string; failed: string }> = {
  en: { copy: 'Copy email address', copied: 'Email address copied.', failed: 'Could not copy. Please select the email address above.' },
  de: { copy: 'E-Mail-Adresse kopieren', copied: 'E-Mail-Adresse kopiert.', failed: 'Kopieren fehlgeschlagen. Bitte markieren Sie die E-Mail-Adresse oben.' },
  es: { copy: 'Copiar dirección de correo', copied: 'Dirección de correo copiada.', failed: 'No se pudo copiar. Seleccione la dirección de correo de arriba.' },
  'zh-CN': { copy: '复制电子邮箱', copied: '电子邮箱已复制。', failed: '无法复制，请选择上方的电子邮箱地址。' },

 "ru": { copy: "Скопировать адрес электронной почты", copied: "Адрес электронной почты скопирован.", failed: "Не удалось скопировать. Пожалуйста, выберите адрес электронной почты выше." },
 "ar": { copy: "انسخ عنوان البريد الإلكتروني", copied: "تم نسخ عنوان البريد الإلكتروني.", failed: "لا يمكن النسخ. الرجاء تحديد عنوان البريد الإلكتروني أعلاه." },
 "fr": { copy: "Copier l'adresse e-mail", copied: "Adresse e-mail copiée.", failed: "Impossible de copier. Veuillez sélectionner l'adresse e-mail ci-dessus." },
 "bn": { copy: "ইমেল ঠিকানা কপি করুন", copied: "ইমেল ঠিকানা অনুলিপি করা হয়েছে.", failed: "কপি করা যায়নি। উপরে ইমেল ঠিকানা নির্বাচন করুন." },
 "hi": { copy: "ईमेल पता कॉपी करें", copied: "ईमेल पता कॉपी किया गया.", failed: "प्रतिलिपि नहीं बनाई जा सकी. कृपया उपरोक्त ईमेल पता चुनें." },
 "pt-BR": { copy: "Copiar endereço de e-mail", copied: "Endereço de e-mail copiado.", failed: "Não foi possível copiar. Selecione o endereço de e-mail acima." },
 "id": { copy: "Salin alamat email", copied: "Alamat email disalin.", failed: "Tidak dapat menyalin. Silakan pilih alamat email di atas." },
 "ko": { copy: "이메일 주소 복사", copied: "이메일 주소가 복사되었습니다.", failed: "복사할 수 없습니다. 위의 이메일 주소를 선택해주세요." },
 "ja": { copy: "メールアドレスをコピーする", copied: "メールアドレスがコピーされました。", failed: "コピーできませんでした。上記のメールアドレスを選択してください。" },
 "vi": { copy: "Sao chép địa chỉ email", copied: "Đã sao chép địa chỉ email.", failed: "Không thể sao chép. Vui lòng chọn địa chỉ email ở trên." }
};
export function CopyEmail({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState(''); const text = messages[locale];
  async function copy() { try { await navigator.clipboard.writeText('affordiahealth@gmail.com'); setStatus(text.copied); } catch { setStatus(text.failed); } }
  return <><noscript><style>{'.copy-email{display:none}'}</style></noscript><div className="copy-email"><button type="button" className="text-button" onClick={copy}>{text.copy}</button><span role="status" aria-live="polite">{status}</span></div></>;
}

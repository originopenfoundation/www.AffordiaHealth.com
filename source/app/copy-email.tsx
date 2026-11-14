'use client';
import { useState } from 'react';
import type { Locale } from './i18n/locale';
const messages: Record<Locale, { copy: string; copied: string; failed: string }> = {
  en: { copy: 'Copy email address', copied: 'Email address copied.', failed: 'Could not copy. Please select the email address above.' },
  de: { copy: 'E-Mail-Adresse kopieren', copied: 'E-Mail-Adresse kopiert.', failed: 'Kopieren fehlgeschlagen. Bitte markieren Sie die E-Mail-Adresse oben.' },
  es: { copy: 'Copiar dirección de correo', copied: 'Dirección de correo copiada.', failed: 'No se pudo copiar. Seleccione la dirección de correo de arriba.' },
  'zh-CN': { copy: '复制电子邮箱', copied: '电子邮箱已复制。', failed: '无法复制，请选择上方的电子邮箱地址。' },
};
export function CopyEmail({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState(''); const text = messages[locale];
  async function copy() { try { await navigator.clipboard.writeText('affordiahealth@gmail.com'); setStatus(text.copied); } catch { setStatus(text.failed); } }
  return <><noscript><style>{'.copy-email{display:none}'}</style></noscript><div className="copy-email"><button type="button" className="text-button" onClick={copy}>{text.copy}</button><span role="status" aria-live="polite">{status}</span></div></>;
}

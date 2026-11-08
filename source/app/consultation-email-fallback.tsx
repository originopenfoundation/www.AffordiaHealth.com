import type { Locale } from './i18n/locale';

const copy: Record<Locale, { title: string; intro: string; warning: string; gmail: string; email: string }> = {
  en: { title: 'Request a free initial consultation', intro: 'The free initial consultation is an introductory discussion with Affordia Health, not a medical appointment. Tell us what you need, your country and your preferred way to be contacted. Email communication is in English.', warning: 'Please do not send diagnoses, medical history, medical records or other sensitive health information in your initial inquiry.', gmail: 'Write using Gmail', email: 'Open your email app' },
  de: { title: 'Kostenlose Erstberatung anfragen', intro: 'Die kostenlose Erstberatung ist ein Einführungsgespräch mit Affordia Health und kein medizinischer Termin. Teilen Sie uns Ihr Anliegen, Ihr Land und Ihre bevorzugte Kontaktmöglichkeit mit. Die Kommunikation per E-Mail erfolgt auf Englisch.', warning: 'Bitte senden Sie in Ihrer ersten Anfrage keine Diagnosen, Krankengeschichte, Krankenunterlagen oder andere sensible Gesundheitsdaten.', gmail: 'Mit Gmail schreiben', email: 'E-Mail-Programm öffnen' },
  es: { title: 'Solicitar una consulta inicial gratuita', intro: 'La consulta inicial gratuita es una conversación introductoria con Affordia Health, no una cita médica. Indíquenos qué necesita, su país y cómo prefiere que le contactemos. La comunicación por correo electrónico es en inglés.', warning: 'No envíe diagnósticos, historial médico, documentos clínicos ni otros datos sensibles de salud en su primera consulta.', gmail: 'Escribir con Gmail', email: 'Abrir aplicación de correo' },
  'zh-CN': { title: '申请免费初次咨询', intro: '免费初次咨询是与 Affordia Health 的初步沟通，并非医疗问诊。请告诉我们您的需求、所在国家或地区以及首选联系方式。电子邮件沟通语言为英语。', warning: '首次咨询时，请勿发送诊断结果、病史、病历或其他敏感健康信息。', gmail: '使用 Gmail 写邮件', email: '打开电子邮件应用' },
};

export function ConsultationEmailFallback({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <section className="consultation-contact" aria-labelledby={`consultation-contact-${locale}`}>
    <div className="form-heading"><h2 id={`consultation-contact-${locale}`}>{c.title}</h2><p>{c.intro}</p></div>
    <p className="consultation-safety-note"><strong>{c.warning}</strong></p>
    <p><a className="button button-primary" href="https://mail.google.com/mail/?view=cm&fs=1&to=affordiahealth%40gmail.com" target="_blank" rel="noopener noreferrer">{c.gmail}</a></p>
    <p><a className="button button-secondary" href="mailto:affordiahealth@gmail.com">{c.email}</a></p>
    <a className="consultation-email" href="mailto:affordiahealth@gmail.com">affordiahealth@gmail.com</a>
  </section>;
}

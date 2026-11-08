'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Locale } from './i18n/locale';
import { localizePath } from './i18n/locale';
import { consultationCopy, contactTypes, serviceIds, extraConsultationCopy } from './consultation-copy';

type ContactType = (typeof contactTypes)[number];
type Contact = { id: number; type: ContactType; value: string };
function validContact(type: ContactType, input: string) {
  const value = input.trim();
  if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value) && value.length <= 254;
  if (type === 'wechat') return value.length >= 2 && value.length <= 100 && !/[\r\n]/u.test(value);
  const phone = value.replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{4,14}$/.test(phone);
}

export function ConsultationContact({ locale }: { copy: Record<string, string>; locale: Locale }) {
  const t = consultationCopy[locale];
  const extra = extraConsultationCopy[locale];
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [service, setService] = useState<string>('unsure');
  const [contacts, setContacts] = useState<Contact[]>([{ id: 1, type: 'email', value: '' }]);
  const [preferred, setPreferred] = useState(1);
  const [help, setHelp] = useState('');
  const [questions, setQuestions] = useState('');
  const [priority, setPriority] = useState('');
  const [budget, setBudget] = useState('');
  const [budgetScope, setBudgetScope] = useState('');
  const [insurance, setInsurance] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [website, setWebsite] = useState('');
  const [token, setToken] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; notified: boolean } | null>(null);
  const nextId = useRef(2);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const [attempted, setAttempted] = useState(false);

  useEffect(() => { fetch('/api/consultation/token', { cache: 'no-store', credentials: 'same-origin' }).then(async r => r.ok ? await r.json() as { token?: unknown } : null).then(data => { if (typeof data?.token === 'string') setToken(data.token); }).catch(() => {}); }, []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== 'idle') return;
    setAttempted(true);
    if (name.trim().length < 2 || country.trim().length < 2 || !privacy || !contacts.length) { setError(t.required); return; }
    if (!contacts.some(c => c.id === preferred) || contacts.some(c => !validContact(c.type, c.value))) { setError(t.contactError); return; }
    const values = { name: name.trim(), country: country.trim(), service, contacts: contacts.map(c => ({ type: c.type, value: c.value.trim(), preferred: c.id === preferred })), help: help.trim(), questions: questions.trim(), priority, budget: budget.trim(), budgetScope, insurance, privacy, locale, website };
    const payload = JSON.stringify(values);
    if (!submission.current || submission.current.payload !== payload) submission.current = { payload, key: crypto.randomUUID() };
    setError(''); setState('sending');
    try {
      let activeToken = token;
      if (!activeToken) {
        const tokenResponse = await fetch('/api/consultation/token', { cache: 'no-store', credentials: 'same-origin' });
        const tokenData = await tokenResponse.json().catch(() => ({})) as { token?: unknown };
        if (!tokenResponse.ok || typeof tokenData.token !== 'string') throw new Error('Token unavailable');
        activeToken = tokenData.token; setToken(activeToken);
      }
      const send = (currentToken: string) => fetch('/api/consultation', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submission.current!.key }, credentials: 'same-origin', body: JSON.stringify({ ...values, token: currentToken }) });
      let response = await send(activeToken);
      let data = await response.json().catch(() => ({})) as { reference?: unknown; notification?: unknown; error?: unknown };
      if (response.status === 403 && data.error === 'verification_failed' && !website.trim()) {
        const tokenResponse = await fetch('/api/consultation/token', { cache: 'no-store', credentials: 'same-origin' });
        const tokenData = await tokenResponse.json().catch(() => ({})) as { token?: unknown };
        if (tokenResponse.ok && typeof tokenData.token === 'string') { activeToken = tokenData.token; setToken(activeToken); response = await send(activeToken); data = await response.json().catch(() => ({})) as { reference?: unknown; notification?: unknown; error?: unknown }; }
      }
      if (!response.ok || typeof data.reference !== 'string') {
        setError(response.status === 429 ? t.rate : response.status === 403 ? t.suspicious : t.unavailable);
        setState('idle'); return;
      }
      setResult({ reference: data.reference, notified: data.notification === 'sent' }); setState('sent');
    } catch { setError(t.unavailable); setState('idle'); }
  }

  return <section className="consultation-contact" aria-labelledby={`consultation-contact-${locale}`}>
    <div className="form-heading"><h2 id={`consultation-contact-${locale}`}>{t.title}</h2><p>{t.intro}</p></div>
    <p className="consultation-safety-note"><strong>{t.warning}</strong></p>
    {result ? <div className="form-success" role="status"><p>{t.accepted} <strong>{result.reference}</strong></p>{!result.notified && <p>{t.recorded}</p>}</div> :
    <form className="consultation-form" onSubmit={submit} noValidate>
      {error && <div ref={errorRef} role="alert" tabIndex={-1} className="form-error">{error}</div>}
      <p>{t.requiredHint}</p>
      <label>{t.name} * <input autoComplete="name" required aria-invalid={attempted && name.trim().length < 2} maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>{t.country} * <input autoComplete="country-name" required aria-invalid={attempted && country.trim().length < 2} maxLength={100} value={country} onChange={e => setCountry(e.target.value)} /></label>
      <label>{t.service} <select value={service} onChange={e => setService(e.target.value)}>{serviceIds.map((id, i) => <option key={id} value={id}>{id === 'other' ? extra.other : t.services[i]}</option>)}</select><span className="selected-service" aria-hidden="true">{service === 'other' ? extra.other : t.services[serviceIds.indexOf(service as (typeof serviceIds)[number])]}</span></label>
      <fieldset><legend>{t.contacts}</legend>{contacts.map((contact, index) => <fieldset key={contact.id}><legend>{t.contact} {index + 1}</legend>
        <label>{t.type}<select value={contact.type} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? { ...c, type: e.target.value as ContactType } : c))}>{contactTypes.map((type, i) => <option value={type} key={type}>{t.methods[i]}</option>)}</select></label>
        <label>{t.value} *<input required aria-invalid={attempted && !validContact(contact.type, contact.value)} maxLength={254} type={contact.type === 'email' ? 'email' : 'text'} inputMode={contact.type === 'whatsapp' || contact.type === 'telephone' ? 'tel' : undefined} value={contact.value} onChange={e => setContacts(cs => cs.map(c => c.id === contact.id ? { ...c, value: e.target.value } : c))} /></label>
        <label className="inline-check"><input type="radio" name="preferred" checked={preferred === contact.id} onChange={() => setPreferred(contact.id)} /> {t.preferred}</label>
        {contacts.length > 1 && <button type="button" className="text-button" onClick={() => { const remaining = contacts.filter(c => c.id !== contact.id); setContacts(remaining); if (preferred === contact.id) setPreferred(remaining[0].id); setAnnouncement(`${t.remove} ${remaining.length}`); }}>{t.remove}</button>}
      </fieldset>)}<button type="button" className="text-button" onClick={() => { const id = nextId.current++; setContacts(cs => [...cs, { id, type: 'email', value: '' }]); setAnnouncement(`${t.add} ${id}`); }}>{t.add}</button><span className="sr-only" aria-live="polite">{announcement}</span></fieldset>
      <p>{t.prompts}</p>
      <label>{t.help} ({t.optional})<textarea maxLength={6000} value={help} onChange={e => setHelp(e.target.value)} /></label>
      <label>{t.questions} ({t.optional})<textarea maxLength={6000} value={questions} onChange={e => setQuestions(e.target.value)} /></label>
      <label>{extra.priority}<select value={priority} onChange={e => setPriority(e.target.value)}>{['', 'expertise', 'balance', 'affordable', 'availability'].map((value, i) => <option key={value} value={value}>{extra.priorities[i]}</option>)}</select></label>
      <label>{extra.budget}<input maxLength={120} value={budget} onChange={e => setBudget(e.target.value)} /></label>
      <label>{extra.scope}<select value={budgetScope} onChange={e => setBudgetScope(e.target.value)}>{['', 'medical', 'journey', 'unsure'].map((value, i) => <option key={value} value={value}>{extra.scopes[i]}</option>)}</select></label>
      <label>{extra.insurance}<select value={insurance} onChange={e => setInsurance(e.target.value)}>{['', 'yes', 'no', 'unsure'].map((value, i) => <option key={value} value={value}>{extra.insuranceOptions[i]}</option>)}</select></label>
      <p>{t.emailNotice}</p>
      <div className="inline-check"><input id={`privacy-${locale}`} type="checkbox" required aria-invalid={attempted && !privacy} checked={privacy} onChange={e => setPrivacy(e.target.checked)} /> <label htmlFor={`privacy-${locale}`}>{t.privacy} *</label></div>
      <a className="privacy-link" href={localizePath(locale, '/data-protection-medical-privacy')} target="_blank" rel="noopener noreferrer">{t.privacyLink}</a>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label></div>
      <button className="button button-primary" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t.loading : t.submit}</button>
    </form>}
    <noscript><style>{'.consultation-form{display:none}'}</style><p>{t.noscript} <a href="mailto:affordiahealth@gmail.com">affordiahealth@gmail.com</a></p></noscript>
    <a className="consultation-email" href="mailto:affordiahealth@gmail.com">affordiahealth@gmail.com</a>
  </section>;
}

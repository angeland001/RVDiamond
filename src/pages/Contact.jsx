import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import EmergencyNote from '../components/EmergencyNote';
import EmailLink from '../components/EmailLink';
import { SITE } from '../config/site';

export default function Contact() {
  usePageMeta(
    'Contact — Stag: Mobile RV Tech | Request Mobile RV Service',
    'Call, text or send a service request to Stag: Mobile RV Tech. Mobile RV repair across central Arkansas, Mon–Fri 9 am – 5 pm.'
  );

  // idle | sending | sent | error
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.marketingOptIn = form.elements.marketingOptIn.checked;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  const headRef = useReveal();
  const cardRef = useReveal();
  const formRef = useReveal();

  return (
    <section className="section" aria-labelledby="contact-heading">
      <div className="section-head reveal" ref={headRef}>
        <span className="eyebrow">Get in touch</span>
        <h1 id="contact-heading">Want Stag on the Job?</h1>
        <p>Calling is quickest — most calls get a real-time quote and a slot inside the week. Prefer to write? Send the form and our team will get back to you the same business day.</p>
      </div>

      <div className="contact-inner">
        <div className="contact-card reveal" ref={cardRef}>
          <h2>Reach Stag</h2>

          <div className="contact-row">
            <span className="icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
            </span>
            <div>
              <span className="label">Phone · Text</span>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </div>
          </div>

          <div className="contact-row">
            <span className="icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <div>
              <span className="label">Email</span>
              <EmailLink />
            </div>
          </div>

          <div className="contact-row">
            <span className="icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M12 22s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <div>
              <span className="label">Service Area</span>
              <p>Headquartered in Beebe, AR · Mobile across central Arkansas</p>
            </div>
          </div>

          <div className="contact-row">
            <span className="icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
            </span>
            <div>
              <span className="label">Hours</span>
              <p>{SITE.hours}</p>
              <EmergencyNote className="emergency-note--card" />
            </div>
          </div>

          <div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={SITE.phoneHref} aria-label={`Call ${SITE.name} now`}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              Call now
            </a>
            <a className="btn btn-ghost" href={SITE.smsHref} aria-label={`Text ${SITE.name}`}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M4 5h16v11H8l-4 4z" />
              </svg>
              Text
            </a>
          </div>
        </div>

        <form
          className="contact-form reveal"
          ref={formRef}
          onSubmit={handleSubmit}
          aria-labelledby="form-heading"
        >
          <h2 id="form-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 4px', lineHeight: 1 }}>Send a service request</h2>
          <p style={{ margin: '0 0 8px', color: 'var(--ink-2)', fontSize: 14 }}>No account, no spam. Just the basics.</p>

          <div className="form-row two">
            <div>
              <label htmlFor="f-name">Name</label>
              <input id="f-name" name="name" type="text" autoComplete="name" required placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="f-phone">Phone</label>
              <input id="f-phone" name="phone" type="tel" autoComplete="tel" required placeholder="(501) 555-0123" />
            </div>
          </div>

          <div className="form-row two">
            <div>
              <label htmlFor="f-email">Email</label>
              <input id="f-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="f-city">City / Town</label>
              <input id="f-city" name="city" type="text" autoComplete="address-level2" placeholder="e.g. Cabot" />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="f-service">Service needed</label>
              <select id="f-service" name="service">
                <option value="">Pick one…</option>
                <option>HVAC repair</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Winterizing</option>
                <option>De-winterizing</option>
                <option>Pre-purchase inspection</option>
                <option>Other / not sure</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="f-msg">What's going on?</label>
            <textarea id="f-msg" name="message" rows={5} placeholder="Year, make, model of the rig, and a short description of the issue." />
          </div>

          {/* Honeypot — hidden from people; bots fill it in and get dropped server-side */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="f-website">Website</label>
            <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="optin-row">
            <input id="f-optin" name="marketingOptIn" type="checkbox" />
            <label htmlFor="f-optin">
              Yes, email me seasonal maintenance reminders, specials and deals from {SITE.name}.
              Optional — unsubscribe anytime with one click.
            </label>
          </div>

          <p className="form-legal">
            We'll only use your details to respond to this request unless you opt in above.
            See our <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <div className="submit-row">
            <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M3 20 21 12 3 4l4 8-4 8z" />
              </svg>
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </button>
          </div>

          <div aria-live="polite">
            {status === 'sent' && (
              <p className="form-status form-status--ok">
                Request received — check your inbox for a confirmation. Our team will be in touch the same business day.
              </p>
            )}
          </div>
          {status === 'error' && (
            <p className="form-status form-status--err" role="alert">
              Something went wrong sending your request. Please call or text us at{' '}
              <a href={SITE.phoneHref}>{SITE.phone}</a>.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

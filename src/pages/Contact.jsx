import { useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';

export default function Contact() {
  useEffect(() => {
    document.title = "Contact — Woody's Mobile RV Tech | Beebe, AR";
  }, []);

  const headRef = useReveal();
  const cardRef = useReveal();
  const formRef = useReveal();

  return (
    <section className="section" aria-labelledby="contact-heading">
      <div className="section-head reveal" ref={headRef}>
        <span className="eyebrow">Get in touch</span>
        <h1 id="contact-heading">Quickest is to call.</h1>
        <p>Most calls get a real-time quote and a slot inside the week. Prefer to write? Send the form and I'll get back the same day.</p>
      </div>

      <div className="contact-inner">
        <div className="contact-card reveal" ref={cardRef}>
          <h2>Reach Woody</h2>

          <div className="contact-row">
            <span className="icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
            </span>
            <div>
              <span className="label">Phone · Text</span>
              <a href="tel:+15015550199">(501) 555-0199</a>
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
              <a href="mailto:woody@woodysrv.example">woody@woodysrv.example</a>
            </div>
          </div>

          <div className="contact-row">
            <span className="icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M12 22s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <div>
              <span className="label">Base</span>
              <p>Beebe, AR · Mobile across central Arkansas</p>
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
              <p>Mon – Fri · 9 am – 5 pm</p>
            </div>
          </div>

          <div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody now">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              Call now
            </a>
            <a className="btn btn-ghost" href="sms:+15015550199" aria-label="Text Woody">
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
          action="mailto:woody@woodysrv.example"
          method="post"
          encType="text/plain"
          aria-labelledby="form-heading"
        >
          <h2 id="form-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 4px', lineHeight: 1 }}>Send a job</h2>
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
              <label htmlFor="f-city">City / Town</label>
              <input id="f-city" name="city" type="text" autoComplete="address-level2" placeholder="e.g. Cabot" />
            </div>
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

          <div className="submit-row">
            <button className="btn btn-primary" type="submit">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M3 20 21 12 3 4l4 8-4 8z" />
              </svg>
              Send to Woody
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

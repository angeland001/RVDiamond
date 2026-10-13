import { usePageMeta } from '../hooks/usePageMeta';
import { clearConsent } from '../lib/consent';
import { SITE } from '../config/site';

const EFFECTIVE_DATE = 'October 13, 2026';

export default function Privacy() {
  usePageMeta(
    'Privacy Policy — Stag: Mobile RV Tech',
    'How Stag: Mobile RV Tech collects, uses and protects your information, including email preferences and cookies.'
  );

  return (
    <section className="section legal" aria-labelledby="privacy-heading">
      <div className="section-head">
        <span className="eyebrow">Legal</span>
        <h1 id="privacy-heading">Privacy Policy</h1>
        <p>Effective {EFFECTIVE_DATE}</p>
      </div>

      <div className="legal-body">
        <p>
          {SITE.name} ("Stag," "we," "us") provides mobile RV repair services in central Arkansas.
          This policy explains what information we collect through this website, how we use it,
          and the choices you have.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Service requests.</strong> When you submit our contact form we collect your name, phone number, email address, city or town, the service you need, and anything you write about your RV.</li>
          <li><strong>Email preferences.</strong> If you check the opt-in box, we record that you agreed to receive marketing email, along with the date and time.</li>
          <li><strong>Calls and texts.</strong> If you call or text us, we receive your phone number and whatever you share with us.</li>
          <li><strong>Technical data.</strong> Our hosting provider automatically logs basic request data (such as IP address, browser type and pages requested) for security and reliability.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To respond to your request, quote, schedule and perform service.</li>
          <li>To send transactional messages about your request, such as a confirmation email.</li>
          <li>To send seasonal maintenance reminders, specials and deals — <strong>only if you opted in</strong>.</li>
          <li>To protect the site against spam and abuse.</li>
        </ul>
        <p>We do not sell or rent your personal information, and we do not share it for third-party advertising.</p>

        <h2>Marketing email &amp; unsubscribing</h2>
        <p>
          Marketing email is strictly opt-in and is never a condition of service. Every marketing
          email identifies us as the sender, includes our postal address, and contains a one-click
          unsubscribe link. Unsubscribe requests take effect immediately and are always honored.
          You can also unsubscribe by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          Unsubscribing from marketing does not stop messages about a service request you made.
        </p>

        <h2>Cookies &amp; similar technologies</h2>
        <p>
          We use your browser's local storage to remember your cookie choice. We do not use
          advertising or tracking cookies. With your permission, our Coverage page loads an
          interactive map from Google Maps, which may set its own cookies under
          {' '}<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
          If you choose "Essential only," the map is not loaded.
        </p>
        <p>
          <button type="button" className="btn btn-ghost" onClick={clearConsent}>Change cookie settings</button>
        </p>

        <h2>Service providers</h2>
        <p>We share information only with vendors that help us run the business, under terms that limit their use of it:</p>
        <ul>
          <li><strong>Vercel</strong> — website hosting.</li>
          <li><strong>Resend</strong> — delivery of confirmation and marketing email.</li>
          <li><strong>Google</strong> — interactive map (only with your consent).</li>
        </ul>
        <p>We may also disclose information if required by law or to protect our rights and safety.</p>

        <h2>Retention &amp; security</h2>
        <p>
          We keep service request information for as long as needed to serve you and meet our
          business, warranty and legal obligations. Marketing contacts are kept until you
          unsubscribe, after which we keep only what's needed to make sure you aren't emailed again.
          We use reasonable safeguards, but no method of transmission or storage is 100% secure.
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask us to access, correct or delete the personal information we hold about you by
          emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or calling{' '}
          <a href={SITE.phoneHref}>{SITE.phone}</a>. We'll respond within a reasonable time.
        </p>

        <h2>Children</h2>
        <p>This site is not directed to children under 13, and we do not knowingly collect their information.</p>

        <h2>Changes</h2>
        <p>If we update this policy we'll change the effective date above. Material changes will be noted on this page.</p>

        <h2>Contact</h2>
        <p>
          {SITE.name} · {SITE.city}, {SITE.region}<br />
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · <a href={SITE.phoneHref}>{SITE.phone}</a>
        </p>
      </div>
    </section>
  );
}

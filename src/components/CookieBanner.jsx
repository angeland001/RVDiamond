import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent, onConsentChange } from '../lib/consent';

export default function CookieBanner() {
  const [choice, setChoice] = useState(() => getConsent());

  useEffect(() => onConsentChange(setChoice), []);

  if (choice) return null;

  return (
    <section className="prefs-bar" role="region" aria-labelledby="prefs-title">
      <div className="prefs-copy">
        <h2 id="prefs-title" className="prefs-title">Cookies on this site</h2>
        <p>
          We use essential storage to run the site. With your OK, Google Maps loads on our
          Coverage page and may set cookies. We never sell your data.{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
      <div className="prefs-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setConsent('essential')}>
          Essential only
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setConsent('all')}>
          Accept all
        </button>
      </div>
    </section>
  );
}

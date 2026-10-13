// Cookie consent state. 'all' = optional third-party embeds (Google Maps) allowed,
// 'essential' = only what the site needs to function. null = not chosen yet.
const KEY = 'stag_cookie_consent';
const EVENT = 'consentchange';

export function getConsent() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value); } catch { /* storage blocked — consent lasts this page view */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function clearConsent() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
}

export function onConsentChange(fn) {
  const handler = e => fn(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

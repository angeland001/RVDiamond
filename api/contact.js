// POST /api/contact — receives the Contact page form.
//  1. Emails the service request to the business.
//  2. Sends the customer a transactional confirmation.
//  3. If (and only if) the customer ticked the opt-in box, adds them to the
//     marketing segment that the seasonal campaigns in /api/seasonal send to.
import { env, BRAND, resend, escapeHtml, layout } from './_email.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 120, phone: 40, email: 254, city: 120, service: 80, message: 4000 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});

  // Honeypot filled in → almost certainly a bot. Pretend success, send nothing.
  if (body.website) return res.status(200).json({ ok: true });

  const f = {};
  for (const key of Object.keys(MAX_LEN)) {
    f[key] = String(body[key] ?? '').trim().slice(0, MAX_LEN[key]);
  }
  const optIn = body.marketingOptIn === true;

  if (!f.name || !f.phone || !EMAIL_RE.test(f.email)) {
    return res.status(400).json({ error: 'Name, phone and a valid email are required.' });
  }
  if (!env.apiKey || !env.from || !env.businessEmail) {
    console.error('[contact] Missing RESEND_API_KEY, EMAIL_FROM or BUSINESS_EMAIL');
    return res.status(500).json({ error: 'Email is not configured.' });
  }

  const consentAt = new Date().toISOString();
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();

  try {
    // 1. Notify the business. Reply-To lets staff answer the customer directly.
    //    The consent line doubles as a record of when and where opt-in happened.
    await resend('/emails', {
      from: env.from,
      to: [env.businessEmail],
      reply_to: f.email,
      subject: `New service request: ${f.service || 'General'} — ${f.name}`,
      html: layout(`
        <h2 style="margin:0 0 12px">New service request</h2>
        <p><strong>Name:</strong> ${escapeHtml(f.name)}<br>
        <strong>Phone:</strong> ${escapeHtml(f.phone)}<br>
        <strong>Email:</strong> ${escapeHtml(f.email)}<br>
        <strong>City:</strong> ${escapeHtml(f.city || '—')}<br>
        <strong>Service:</strong> ${escapeHtml(f.service || '—')}</p>
        <p><strong>Details:</strong><br>${escapeHtml(f.message || '—').replace(/\n/g, '<br>')}</p>
        <p style="font-size:13px;color:#5a4634"><strong>Marketing opt-in:</strong> ${optIn
          ? `YES — checked on the website contact form at ${consentAt}${ip ? ` from IP ${escapeHtml(ip)}` : ''}`
          : 'No'}</p>`,
        'Internal notification from the website contact form.'),
    });

    // 2. Transactional confirmation to the customer (no promotional content).
    await resend('/emails', {
      from: env.from,
      to: [f.email],
      reply_to: env.businessEmail,
      subject: `We received your service request — ${BRAND.name}`,
      html: layout(`
        <p>Hi ${escapeHtml(f.name.split(' ')[0])},</p>
        <p>Thanks for reaching out to ${BRAND.name}. We've received your request${f.service ? ` for <strong>${escapeHtml(f.service)}</strong>` : ''} and our team will contact you the same business day (Mon–Fri, 9 am – 5 pm).</p>
        <p>Need us sooner? Call or text <a href="tel:${BRAND.tel}" style="color:#8a3614">${BRAND.phone}</a>.
        <strong>Weekend and after-5 pm emergency calls carry a $250 emergency fee.</strong></p>
        ${optIn ? '<p style="font-size:14px;color:#5a4634">You also chose to receive seasonal maintenance reminders and specials. Every one of those emails includes a one-click unsubscribe link.</p>' : ''}`,
        `You're receiving this one-time message because you submitted a service request on our website.<br>${BRAND.name}${env.postalAddress ? ` · ${escapeHtml(env.postalAddress)}` : ''}`),
    });
  } catch (err) {
    console.error('[contact]', err);
    return res.status(502).json({ error: 'Could not send right now.' });
  }

  // 3. Marketing list — only with explicit opt-in. A failure here must not
  //    fail the customer's service request, so it is logged and swallowed.
  if (optIn && env.segmentId) {
    const [firstName, ...rest] = f.name.split(' ');
    try {
      await resend('/contacts', {
        email: f.email,
        first_name: firstName,
        last_name: rest.join(' '),
        unsubscribed: false,
        segments: [{ id: env.segmentId }],
      });
    } catch (err) {
      console.error('[contact] Could not add marketing contact', err);
    }
  }

  return res.status(200).json({ ok: true });
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return {}; }
}

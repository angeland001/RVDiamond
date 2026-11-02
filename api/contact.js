// POST /api/contact — receives the Contact page form.
//  1. Emails the service request to the business.
//  2. Sends the customer a transactional confirmation.
//  3. If (and only if) the customer ticked the opt-in box, adds them to the
//     marketing segment that the seasonal campaigns in /api/seasonal send to.
import { env, BRAND, COLOR, resend, escapeHtml, htmlToText, layout, eyebrow, heading, buttons } from './_email.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 120, phone: 40, email: 254, city: 120, service: 80, message: 4000 };
const MIN_FILL_MS = 3000; // no human fills name, phone and email in under 3 s
const SERVICES = ['HVAC repair', 'Plumbing', 'Electrical', 'Winterizing', 'De-winterizing', 'Pre-purchase inspection', 'Other / not sure'];
const ALLOWED_ORIGINS = ['https://www.stagmobilervtech.com', 'https://stagmobilervtech.com'];
const FIRST_NAME_RE = /^[\p{L}'’-]{1,30}$/u;

// Best-effort limits. Each serverless instance keeps its own counts, so these
// slow down abuse from one source rather than setting an exact global cap.
const LIMITS = { ip: { max: 5, ms: 15 * 60 * 1000 }, email: { max: 3, ms: 60 * 60 * 1000 } };
const hits = new Map();

function overLimit(kind, key) {
  const { max, ms } = LIMITS[kind];
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const id = `${kind}:${key}`;
  const recent = (hits.get(id) || []).filter(t => now - t < ms);
  recent.push(now);
  hits.set(id, recent);
  return recent.length > max;
}

// Cloudflare Turnstile runs only once TURNSTILE_SECRET_KEY is set.
async function passesTurnstile(token, ip) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    return (await res.json()).success === true;
  } catch (err) {
    console.error('[contact] Turnstile check failed', err);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Browsers always send Origin on this request; other sites' pages can't use the form.
  if (!ALLOWED_ORIGINS.includes(req.headers.origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});

  // Honeypot filled in, or submitted too fast → almost certainly a bot.
  // Pretend success and send nothing, so bots don't learn to adapt.
  const elapsed = Number(body.elapsedMs);
  if (body.website || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return res.status(200).json({ ok: true });
  }

  const f = {};
  for (const key of Object.keys(MAX_LEN)) {
    f[key] = String(body[key] ?? '').trim().slice(0, MAX_LEN[key]);
  }
  const optIn = body.marketingOptIn === true;
  // The confirmation goes to whatever address was typed in, so keep free text out of it.
  if (!SERVICES.includes(f.service)) f.service = '';
  const firstName = f.name.split(' ')[0];
  const greeting = FIRST_NAME_RE.test(firstName) ? `Thanks, ${escapeHtml(firstName)}.` : 'Thanks.';

  if (!f.name || !f.phone || !EMAIL_RE.test(f.email)) {
    return res.status(400).json({ error: 'Name, phone and a valid email are required.' });
  }
  if (!env.apiKey || !env.from || !env.businessEmail) {
    console.error('[contact] Missing RESEND_API_KEY, EMAIL_FROM or BUSINESS_EMAIL');
    return res.status(500).json({ error: 'Email is not configured.' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (overLimit('ip', ip) || overLimit('email', f.email.toLowerCase())) {
    return res.status(429).json({ error: 'Too many requests. Please call or text us instead.' });
  }
  if (!await passesTurnstile(body['cf-turnstile-response'], ip)) {
    return res.status(403).json({ error: 'Could not verify this request.' });
  }

  const consentAt = new Date().toISOString();
  const receivedAt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date());
  const telHref = 'tel:' + f.phone.replace(/[^\d+]/g, '');

  try {
    // 1. Notify the business. Reply-To lets staff answer the customer directly.
    //    The consent line doubles as a record of when and where opt-in happened.
    const staffHtml = layout(`
        ${eyebrow('New service request')}
        ${heading(escapeHtml(f.name))}
        <p style="margin:0 0 18px;font-size:13px;color:${COLOR.inkSoft}">Received ${escapeHtml(receivedAt)} (Central) · Reply to this email to answer the customer.</p>
        ${buttons([
          { label: 'Call customer', href: escapeHtml(telHref) },
          { label: 'Email customer', href: `mailto:${escapeHtml(f.email)}`, tone: 'ghost' },
        ])}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;margin-top:20px">
          ${row('Phone', `<a href="${escapeHtml(telHref)}" style="color:${COLOR.rustDeep}">${escapeHtml(f.phone)}</a>`)}
          ${row('Email', `<a href="mailto:${escapeHtml(f.email)}" style="color:${COLOR.rustDeep}">${escapeHtml(f.email)}</a>`)}
          ${row('City', escapeHtml(f.city || '—'))}
          ${row('Service', escapeHtml(f.service || '—'))}
        </table>
        <h3 style="margin:20px 0 6px;font-size:16px">Details</h3>
        <p style="margin:0;padding:12px 14px;background:${COLOR.cream};border-left:3px solid ${COLOR.rust};white-space:pre-wrap">${escapeHtml(f.message || '—')}</p>
        <p style="margin:18px 0 0;font-size:13px;color:${COLOR.inkSoft}"><strong>Marketing opt-in:</strong> ${optIn
          ? `YES — checked on the website contact form at ${consentAt}${ip ? ` from IP ${escapeHtml(ip)}` : ''}`
          : 'No'}</p>`,
        'Internal notification from the website contact form.');

    await resend('/emails', {
      from: env.from,
      to: [env.businessEmail],
      reply_to: f.email,
      subject: `New service request: ${f.service || 'General'} - ${f.name}`,
      html: staffHtml,
      text: htmlToText(staffHtml),
    });

    // 2. Transactional confirmation to the customer (no promotional content).
    const customerHtml = layout(`
        ${eyebrow('Request received')}
        ${heading(`${greeting} We've got it.`)}
        <p style="margin:0 0 20px">We've received your request${f.service ? ` for <strong>${escapeHtml(f.service)}</strong>` : ''}. Here's what happens next:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${step(1, 'Our team reviews your request.')}
          ${step(2, 'We contact you within one business day (Mon–Fri, 9 am – 5 pm).')}
          ${step(3, 'We set a time and come to you. No tow.')}
        </table>
        ${optIn ? `<p style="margin:18px 0 0;font-size:14px;color:${COLOR.inkSoft}">You also chose to receive seasonal maintenance reminders and specials. Every one of those emails includes a one-click unsubscribe link.</p>` : ''}`,
        `You're receiving this one-time message because you submitted a service request on our website.<br>${BRAND.name}${env.postalAddress ? ` · ${escapeHtml(env.postalAddress)}` : ''}`,
        {
          preview: `We've received your request and will contact you within one business day.`,
          hero: { file: 'hero-confirmation.jpg', alt: 'Illustration of a vintage travel trailer' },
          cta: {
            title: 'Need us sooner?',
            note: 'Call or text us. Weekend and after-5 pm emergency calls carry a $250 emergency fee.',
          },
        });

    await resend('/emails', {
      from: env.from,
      to: [f.email],
      reply_to: env.businessEmail,
      subject: `We received your service request - ${BRAND.name}`,
      html: customerHtml,
      text: htmlToText(customerHtml),
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

function row(label, valueHtml) {
  return `<tr>
    <td style="padding:8px 12px 8px 0;border-bottom:1px solid ${COLOR.rule};width:90px;font-weight:bold;vertical-align:top">${label}</td>
    <td data-value style="padding:8px 0;border-bottom:1px solid ${COLOR.rule}">${valueHtml}</td>
  </tr>`;
}

function step(number, text) {
  return `<tr>
    <td width="44" style="width:44px;padding:0 0 12px;vertical-align:top"><span style="display:inline-block;width:30px;line-height:30px;background:${COLOR.ink};color:${COLOR.cream};font-size:14px;font-weight:bold;text-align:center">${number}</span></td>
    <td data-value style="padding:4px 0 12px;vertical-align:top">${text}</td>
  </tr>`;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return {}; }
}

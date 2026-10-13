// GET /api/seasonal — run daily by Vercel Cron (see vercel.json).
// Sends the matching campaign from _campaigns.js to the opt-in segment as a
// Resend Broadcast. Resend fills in {{{RESEND_UNSUBSCRIBE_URL}}} per recipient
// and automatically skips anyone who has unsubscribed.
//
// Manual send (e.g. to test):  GET /api/seasonal?campaign=summer-ac
// with header  Authorization: Bearer <CRON_SECRET>
import { env, BRAND, resend, escapeHtml, layout } from './_email.js';
import { CAMPAIGNS } from './_campaigns.js';

export default async function handler(req, res) {
  // Vercel Cron sends "Authorization: Bearer $CRON_SECRET" automatically.
  if (!env.cronSecret || req.headers.authorization !== `Bearer ${env.cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!env.apiKey || !env.from || !env.segmentId || !env.postalAddress) {
    console.error('[seasonal] Missing RESEND_API_KEY, EMAIL_FROM, RESEND_SEGMENT_ID or BUSINESS_POSTAL_ADDRESS');
    return res.status(500).json({ error: 'Email is not configured.' });
  }

  const requested = req.query?.campaign;
  const campaign = requested
    ? CAMPAIGNS.find(c => c.id === requested)
    : todaysCampaign();

  if (!campaign) return res.status(200).json({ sent: false, reason: 'No campaign scheduled today.' });

  const footer = `
    You're receiving this because you opted in to seasonal tips and specials when you requested service from ${BRAND.name}.<br>
    ${BRAND.name} · ${escapeHtml(env.postalAddress)}<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#8a3614">Unsubscribe</a> — one click, no login required.`;

  const html = layout(`
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(campaign.preview)}</div>
    ${campaign.body}
    <p style="margin:20px 0 0"><a href="tel:${BRAND.tel}" style="display:inline-block;background:#b14a1f;color:#faf3e2;text-decoration:none;font-weight:bold;padding:12px 20px">Call ${BRAND.phone}</a></p>
    <p style="font-size:13px;color:#5a4634">Mon–Fri, 9 am – 5 pm. Weekend and after-5 pm emergency calls carry a $250 emergency fee.</p>`,
    footer);

  try {
    const broadcast = await resend('/broadcasts', {
      segment_id: env.segmentId,
      from: env.from,
      subject: campaign.subject,
      name: `${campaign.id}-${new Date().getFullYear()}`,
      html,
      send: true,
    });
    return res.status(200).json({ sent: true, campaign: campaign.id, broadcast: broadcast.id });
  } catch (err) {
    console.error('[seasonal]', err);
    return res.status(502).json({ error: 'Broadcast failed.' });
  }
}

function todaysCampaign() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date());
  const month = Number(parts.find(p => p.type === 'month').value);
  const day = Number(parts.find(p => p.type === 'day').value);
  return CAMPAIGNS.find(c => c.month === month && c.day === day);
}

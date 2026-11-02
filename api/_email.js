// Shared helpers for the email functions. Files starting with "_" are not
// exposed as routes by Vercel.

export const env = {
  apiKey:        process.env.RESEND_API_KEY,
  segmentId:     process.env.RESEND_SEGMENT_ID,      // marketing list (Resend "Segment")
  from:          process.env.EMAIL_FROM,             // e.g. "Stag: Mobile RV Tech <service@yourdomain.com>"
  businessEmail: process.env.BUSINESS_EMAIL,         // where new service requests are delivered
  postalAddress: process.env.BUSINESS_POSTAL_ADDRESS, // required in every marketing email (CAN-SPAM)
  cronSecret:    process.env.CRON_SECRET,
};

export const BRAND = {
  name:  'Stag: Mobile RV Tech',
  phone: '(501) 466-7786',
  tel:   '+15014667786',
  url:   'https://www.stagmobilervtech.com',
};

// Same palette as src/styles/tokens.css. Email clients need literal values.
export const COLOR = {
  cream:    '#f1e7d1',
  paper:    '#faf3e2',
  ink:      '#1f1610',
  inkSoft:  '#5a4634',
  rust:     '#b14a1f',
  rustDeep: '#8a3614',
  rule:     '#d9c9a8',
};

// Web fonts load in Apple Mail and a few others. Gmail and Outlook use the fallbacks.
const FONT = {
  display: "'Alfa Slab One',Georgia,'Times New Roman',serif",
  body:    "'Inter',Arial,Helvetica,sans-serif",
  mono:    "'JetBrains Mono','Courier New',Courier,monospace",
};

const SERVICES = ['HVAC repair', 'Plumbing', 'Electrical', 'Winterizing', 'Inspections'];

export async function resend(path, body, method = 'POST') {
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Resend ${path} failed: ${res.status} ${data.message || ''}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Plain-text alternative for multipart emails. HTML-only mail scores worse
// with spam filters, so every send includes a text part.
export function htmlToText(html = '') {
  return String(html)
    .replace(/<head[\s\S]*?<\/head>/i, '')
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/td>\s*<td[^>]*data-value[^>]*>/gi, ': ')
    .replace(/<\/(p|h[1-6]|tr|td|div)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/^[ \t]+/gm, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function eyebrow(text) {
  return `<p style="margin:0 0 8px;font-family:${FONT.mono};font-size:12px;line-height:1.4;letter-spacing:2px;text-transform:uppercase;color:${COLOR.rustDeep}">${text}</p>`;
}

export function heading(text) {
  return `<h1 class="email-title" style="margin:0 0 14px;font-family:${FONT.display};font-size:30px;line-height:1.15;font-weight:bold;font-synthesis:none;color:${COLOR.ink}">${text}</h1>`;
}

// Matches .btn-primary on the site. tone "ink" is for use on the rust band.
export function buttons(items) {
  const cells = items.map(({ label, href, tone = 'primary' }) => {
    const bg = tone === 'ink' ? COLOR.ink : tone === 'ghost' ? COLOR.paper : COLOR.rust;
    const edge = tone === 'ink' ? '#000000' : tone === 'ghost' ? COLOR.ink : COLOR.rustDeep;
    const fg = tone === 'ghost' ? COLOR.ink : COLOR.cream;
    return `<td bgcolor="${bg}" style="background:${bg};border:1px solid ${edge};border-bottom:4px solid ${edge}"><a href="${href}" style="display:inline-block;padding:12px 20px;font-family:${FONT.body};font-size:15px;line-height:1.2;font-weight:bold;color:${fg};text-decoration:none">${label}</a></td>`;
  }).join('<td width="10" style="width:10px;font-size:0;line-height:0">&nbsp;</td>');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`;
}

// Shared wrapper so every email looks like it came from the same company.
// Options: preview (inbox snippet), hero ({ file, alt } from /assets/email),
// strip (service list band), cta ({ title, note } rust call-to-action band).
export function layout(innerHtml, footerHtml, { preview, hero, strip, cta } = {}) {
  const img = file => `${BRAND.url}/assets/email/${file}`;
  const altStyle = `font-family:${FONT.body};font-size:16px;color:${COLOR.cream}`;
  const imageStyle = `display:block;width:100%;max-width:600px;height:auto;border:0;${altStyle}`;

  return `<!doctype html><html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]><style>td,p,a,h1,h2,h3{font-family:Arial,Helvetica,sans-serif!important}.email-title{font-family:Georgia,serif!important}</style><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Inter:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
    @media (max-width:480px){
      .email-pad{padding-left:18px!important;padding-right:18px!important}
      .email-title{font-size:26px!important}
    }
  </style>
</head><body style="margin:0;background:${COLOR.cream};font-family:${FONT.body};color:${COLOR.ink}">
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.cream}" style="background:${COLOR.cream};padding:24px 8px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.paper}" style="max-width:600px;width:100%;background:${COLOR.paper};border:2px solid ${COLOR.ink}">
        <tr><td bgcolor="${COLOR.ink}" style="background:${COLOR.ink};border-bottom:3px solid ${COLOR.rust};font-size:0;line-height:0"><img src="${img('header.png')}" width="596" alt="${BRAND.name}" style="${imageStyle}"></td></tr>
        ${hero ? `<tr><td bgcolor="${COLOR.ink}" style="background:${COLOR.ink};font-size:0;line-height:0"><img src="${img(hero.file)}" width="596" alt="${escapeHtml(hero.alt)}" style="${imageStyle}"></td></tr>` : ''}
        ${strip ? `<tr><td align="center" bgcolor="${COLOR.ink}" style="background:${COLOR.ink};border-top:3px solid ${COLOR.rust};border-bottom:3px solid ${COLOR.rust};padding:10px 16px;font-family:${FONT.mono};font-size:11px;line-height:1.7;letter-spacing:1px;text-transform:uppercase;color:${COLOR.cream}">${SERVICES.join(' &nbsp;·&nbsp; ')}</td></tr>` : ''}
        <tr><td class="email-pad" style="padding:28px 32px;font-family:${FONT.body};font-size:16px;line-height:1.6;color:${COLOR.ink}">${innerHtml}</td></tr>
        ${cta ? `<tr><td class="email-pad" align="center" bgcolor="${COLOR.rust}" style="background:${COLOR.rust};border-top:3px solid ${COLOR.rustDeep};border-bottom:3px solid ${COLOR.rustDeep};padding:26px 32px;color:${COLOR.cream};text-align:center">
          <h2 style="margin:0 0 6px;font-family:${FONT.display};font-size:24px;line-height:1.15;font-weight:bold;font-synthesis:none;color:${COLOR.cream}">${cta.title}</h2>
          <p style="margin:0 0 16px;font-family:${FONT.mono};font-size:12px;line-height:1.5;letter-spacing:1px;text-transform:uppercase;color:${COLOR.cream}">Mon–Fri · 9 am – 5 pm</p>
          <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr><td>${buttons([{ label: `Call ${BRAND.phone}`, href: `tel:${BRAND.tel}`, tone: 'ink' }])}</td></tr></table>
          <p style="margin:14px 0 0;font-family:${FONT.body};font-size:14px;line-height:1.5;color:${COLOR.cream}">${cta.note}</p>
        </td></tr>` : ''}
        <tr><td class="email-pad" style="padding:20px 32px;${cta ? '' : `border-top:1px solid ${COLOR.rule};`}font-family:${FONT.body};font-size:12px;line-height:1.6;color:${COLOR.inkSoft}">
          <img src="${BRAND.url}/assets/logo/stag-badge-128.png" width="44" height="44" alt="" style="display:block;border:0;margin:0 0 10px">
          ${footerHtml}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

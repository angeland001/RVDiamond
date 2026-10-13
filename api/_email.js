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
  phone: '(501) 555-0199',
  tel:   '+15015550199',
};

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

// Shared wrapper so every email looks like it came from the same company.
export function layout(innerHtml, footerHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f1e7d1;font-family:Arial,Helvetica,sans-serif;color:#1f1610">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1e7d1;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#faf3e2;border:2px solid #1f1610">
        <tr><td style="background:#1f1610;color:#f1e7d1;padding:18px 24px;font-size:20px;font-weight:bold;border-bottom:3px solid #b14a1f">${BRAND.name}</td></tr>
        <tr><td style="padding:24px;font-size:16px;line-height:1.55">${innerHtml}</td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #d9c9a8;font-size:12px;line-height:1.5;color:#5a4634">${footerHtml}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

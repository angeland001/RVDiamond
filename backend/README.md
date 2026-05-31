# Backend

Reserved for server-side code: contact-form handler, lead routing, scheduling, etc.

Empty for now. When the site moves to React (Next.js / Vite), API routes or a small
Express/Hono service belong here, behind `/api/*` from the frontend.

## Likely first additions

- `POST /api/contact` — accept form submissions from `frontend/contact.html`, forward
  to Woody by email/SMS, drop a copy in storage.
- Spam protection (Turnstile / hCaptcha) before email send.
- `GET /api/availability` — open slots for the contact-form date picker.

Keep secrets in a `.env` at this folder's root; never commit them.

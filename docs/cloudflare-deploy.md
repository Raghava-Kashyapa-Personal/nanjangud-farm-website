# Cloudflare Deployment Guide

This project is deployed as:
- Static site (HTML/CSS/JS) on Cloudflare Pages
- API on Cloudflare Workers + D1

## 1) Deploy static website to Pages

From repo root:

```powershell
npx wrangler pages project create dirgha-farms-site
npx wrangler pages deploy . --project-name dirgha-farms-site
```

## 2) Deploy API worker

From `worker/`:

```powershell
npm install
npx wrangler d1 create dirgha_farms
# put returned database id into worker/wrangler.toml
npm run db:migrate
npm run db:seed-content
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
npm run deploy
```

## 3) Route API under same domain (recommended)

After setting custom domain for Pages, add a Worker route in Cloudflare dashboard:
- Route: `https://<your-domain>/api/*`
- Service: `dirgha-farms-api`

This keeps frontend form calls (`/api/...`) on the same origin.

## 4) Optional bot hardening

- Add Cloudflare Turnstile to forms.
- Set `TURNSTILE_SECRET_KEY` as Worker secret.

## 5) Post-deploy checks

- `GET /api/health` returns `{ "ok": true }`
- Produce waitlist submission stores a row in `leads`
- Lead magnet submission sends a Resend email and logs `lead_events`
- Newsletter signup stores lead and event rows

# Dirgha Farms Worker API

Cloudflare Worker backend for lead capture, event logging, and lead magnet email delivery.

## Endpoints
- `POST /api/leads/produce-waitlist`
- `POST /api/leads/lead-magnet`
- `POST /api/leads/newsletter`
- `GET /api/health`

## Required Bindings
- `DB` (D1)

## Secrets
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TURNSTILE_SECRET_KEY` (optional)

## Vars
- `ALLOWED_ORIGIN`
- `RATE_LIMIT_PER_MINUTE`
- `LEAD_MAGNET_URL`

## Commands
```powershell
npm install
npm run db:migrate
npm run db:seed-content
npm test
npm run dev
npm run deploy
```

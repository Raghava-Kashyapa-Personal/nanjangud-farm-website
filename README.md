# Dirgha Farms Website

Dirgha Farms is a 3-page trust-first website and lead platform centered on longevity, produce engagement, and transparent farm operations.

## What Changed
- Full rebrand from Income Farms to Dirgha Farms.
- Narrative shift from ROI-first to biological-infrastructure-first.
- New site architecture:
  - `index.html` - Home (brand story, trust framework, model overview)
  - `produce.html` - Produce program + primary waitlist conversion
  - `resources.html` - Lead magnet, content hub, newsletter
  - `resource.html` - Dynamic detail page for content items
- Netlify form dependency removed.
- Cloudflare Worker API added for secure form handling with D1 and Resend.

## Project Structure

```text
FarmMarketing/
|- index.html
|- produce.html
|- resources.html
|- resource.html
|- styles.css
|- script.js
|- assets/
|  |- managed-farmland-checklist.pdf
|- data/
|  |- content-items.json
|  |- resource-bodies.json
|- images/
|  |- gallery/
|  |- team/
|  |- concepts/
|- worker/
|  |- src/index.js
|  |- src/validation.js
|  |- migrations/001_init.sql
|  |- tests/api.test.mjs
|  |- wrangler.toml
|  |- package.json
|- docs/
|  |- image-generation-plan.md
|  |- imagegen-prompts.jsonl
```

## Local Frontend Preview
Serve the site from a local static server (recommended for JSON fetch support):

```powershell
python -m http.server 8080
```

Then open:
- `http://localhost:8080/index.html`
- `http://localhost:8080/produce.html`
- `http://localhost:8080/resources.html`

## Worker Setup (Cloudflare + D1 + Resend)

1. Install worker dependencies:

```powershell
cd worker
npm install
```

2. Authenticate with Cloudflare:

```powershell
npx wrangler login
npx wrangler whoami
```

3. Create D1 database (once):

```powershell
npx wrangler d1 create dirgha_farms
```

4. Update `worker/wrangler.toml` with the returned `database_id`.

5. Run migration:

```powershell
npm run db:migrate
```

6. Seed the content table (optional but recommended):

```powershell
npm run db:seed-content
```

7. Set secrets:

```powershell
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
# Optional bot verification
npx wrangler secret put TURNSTILE_SECRET_KEY
```

8. Optional vars in `wrangler.toml`:
- `ALLOWED_ORIGIN`
- `RATE_LIMIT_PER_MINUTE`
- `LEAD_MAGNET_URL`

9. Run locally:

```powershell
npm run dev
```

10. Deploy:

```powershell
npm run deploy
```

## API Endpoints
- `POST /api/leads/produce-waitlist`
- `POST /api/leads/lead-magnet`
- `POST /api/leads/newsletter`
- `GET /api/health`

## Data Model (D1)
- `leads`
- `lead_events`
- `content_items`
- `rate_limits`

## Testing
Run worker validation tests:

```powershell
cd worker
npm test
```

## Image Pipeline
- Concept visuals currently shipped as SVG in `images/concepts/`.
- AI image generation runbook and prompts are included in:
  - `docs/image-generation-plan.md`
  - `docs/imagegen-prompts.jsonl`

## Notes
- This phase prioritizes produce waitlist conversions and trust-based lead nurturing.
- Plot and investment details remain selective and are shared post-qualification.

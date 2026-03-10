# API Contract

## POST `/api/leads/produce-waitlist`

Payload:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "household_size": 3,
  "box_preference": "essentials|seasonal-mix|fruit-forward",
  "frequency_preference": "weekly|bi-weekly|monthly",
  "whatsapp_opt_in": true,
  "consent": true,
  "source": "produce-page-waitlist",
  "turnstile_token": "optional"
}
```

Response:
```json
{
  "success": true,
  "lead_id": "uuid"
}
```

## POST `/api/leads/lead-magnet`

Payload:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "consent": true,
  "whatsapp_opt_in": false,
  "source": "resources-lead-magnet",
  "turnstile_token": "optional"
}
```

Response:
```json
{
  "success": true,
  "lead_id": "uuid",
  "delivery_status": "sent|failed|skipped",
  "download_url": "https://.../managed-farmland-checklist.pdf"
}
```

## POST `/api/leads/newsletter`

Payload:
```json
{
  "email": "string",
  "name": "optional string",
  "interests": "optional string",
  "consent": true,
  "source": "resources-newsletter",
  "turnstile_token": "optional"
}
```

Response:
```json
{
  "success": true,
  "lead_id": "uuid"
}
```

## Error responses
- `400` invalid request format or failed bot verification
- `422` validation errors
- `429` rate-limited
- `500` server-side failure

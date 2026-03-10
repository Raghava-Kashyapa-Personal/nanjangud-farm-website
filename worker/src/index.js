import {
  normalizeString,
  parseBoolean,
  validateLeadMagnet,
  validateNewsletter,
  validateProduceWaitlist
} from './validation.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'dirgha-api' }, 200, env);
    }

    if (!url.pathname.startsWith('/api/leads/')) {
      return json({ error: 'Not found' }, 404, env);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, env);
    }

    try {
      const body = await parseJson(request);
      const endpoint = url.pathname;

      if (await isRateLimited(request, endpoint, env)) {
        return json({ error: 'Too many requests. Please wait a minute and retry.' }, 429, env);
      }

      if (await shouldBlockByTurnstile(body, request, env)) {
        return json({ error: 'Bot verification failed' }, 400, env);
      }

      if (endpoint === '/api/leads/produce-waitlist') {
        return await handleProduceWaitlist(body, request, env);
      }

      if (endpoint === '/api/leads/lead-magnet') {
        return await handleLeadMagnet(body, request, env);
      }

      if (endpoint === '/api/leads/newsletter') {
        return await handleNewsletter(body, request, env);
      }

      return json({ error: 'Not found' }, 404, env);
    } catch (error) {
      return json({ error: error.message || 'Invalid request' }, 400, env);
    }
  }
};

async function handleProduceWaitlist(payload, request, env) {
  const validation = validateProduceWaitlist(payload);
  if (!validation.valid) {
    return json({ error: validation.error }, 422, env);
  }

  const lead = {
    lead_type: 'produce_waitlist',
    name: normalizeString(payload.name),
    email: normalizeString(payload.email).toLowerCase(),
    phone: normalizeString(payload.phone),
    city: normalizeString(payload.city),
    household_size: Number(payload.household_size),
    box_preference: normalizeString(payload.box_preference),
    frequency_preference: normalizeString(payload.frequency_preference),
    whatsapp_opt_in: parseBoolean(payload.whatsapp_opt_in),
    consent: parseBoolean(payload.consent),
    source: normalizeString(payload.source)
  };

  const leadId = await insertLead(lead, request, env);
  return json({ success: true, lead_id: leadId }, 200, env);
}

async function handleLeadMagnet(payload, request, env) {
  const validation = validateLeadMagnet(payload);
  if (!validation.valid) {
    return json({ error: validation.error }, 422, env);
  }

  const lead = {
    lead_type: 'lead_magnet',
    name: normalizeString(payload.name),
    email: normalizeString(payload.email).toLowerCase(),
    phone: normalizeString(payload.phone),
    city: normalizeString(payload.city),
    household_size: null,
    box_preference: null,
    frequency_preference: null,
    whatsapp_opt_in: parseBoolean(payload.whatsapp_opt_in),
    consent: parseBoolean(payload.consent),
    source: normalizeString(payload.source)
  };

  const leadId = await insertLead(lead, request, env);
  const delivery = await sendLeadMagnetEmail(lead, leadId, request, env);

  return json(
    {
      success: true,
      lead_id: leadId,
      delivery_status: delivery.status,
      download_url: delivery.downloadUrl
    },
    200,
    env
  );
}

async function handleNewsletter(payload, request, env) {
  const validation = validateNewsletter(payload);
  if (!validation.valid) {
    return json({ error: validation.error }, 422, env);
  }

  const lead = {
    lead_type: 'newsletter',
    name: normalizeString(payload.name),
    email: normalizeString(payload.email).toLowerCase(),
    phone: null,
    city: null,
    household_size: null,
    box_preference: normalizeString(payload.interests),
    frequency_preference: null,
    whatsapp_opt_in: false,
    consent: parseBoolean(payload.consent),
    source: normalizeString(payload.source)
  };

  const leadId = await insertLead(lead, request, env);
  return json({ success: true, lead_id: leadId }, 200, env);
}

async function insertLead(lead, request, env) {
  if (!env.DB) {
    throw new Error('D1 binding DB is not configured');
  }

  const leadId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO leads (
      id, lead_type, name, email, phone, city, household_size,
      box_preference, frequency_preference, whatsapp_opt_in,
      consent, source, created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)`
  )
    .bind(
      leadId,
      lead.lead_type,
      lead.name,
      lead.email,
      lead.phone,
      lead.city,
      lead.household_size,
      lead.box_preference,
      lead.frequency_preference,
      lead.whatsapp_opt_in ? 1 : 0,
      lead.consent ? 1 : 0,
      lead.source,
      nowIso
    )
    .run();

  await logLeadEvent(leadId, 'form_submitted', request, env, {
    endpoint: new URL(request.url).pathname,
    lead_type: lead.lead_type,
    source: lead.source
  });

  return leadId;
}

async function sendLeadMagnetEmail(lead, leadId, request, env) {
  const downloadUrl = env.LEAD_MAGNET_URL || `${new URL(request.url).origin}/assets/managed-farmland-checklist.pdf`;

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    await logLeadEvent(leadId, 'email_skipped_missing_config', request, env, { reason: 'missing_resend_config' });
    return { status: 'skipped', downloadUrl };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2a1d;">
      <h2>Managed Farmland Due Diligence Checklist</h2>
      <p>Hi ${escapeHtml(lead.name || 'there')},</p>
      <p>Thank you for your interest in Dirgha Farms. You can download the checklist using the link below.</p>
      <p><a href="${downloadUrl}">Download Checklist (PDF)</a></p>
      <p>If you want to plan a farm day after reviewing it, just reply to this email.</p>
      <p>Dirgha Farms</p>
    </div>
  `;

  const payload = {
    from: env.RESEND_FROM_EMAIL,
    to: [lead.email],
    subject: 'Your Managed Farmland Due Diligence Checklist',
    html
  };

  const resendResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resendResp.ok) {
    const errorBody = await resendResp.text();
    await logLeadEvent(leadId, 'email_failed', request, env, { status: resendResp.status, body: errorBody.slice(0, 800) });
    return { status: 'failed', downloadUrl };
  }

  await logLeadEvent(leadId, 'email_sent', request, env, { provider: 'resend' });
  return { status: 'sent', downloadUrl };
}

async function shouldBlockByTurnstile(payload, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return false;

  const token = normalizeString(payload.turnstile_token);
  if (!token) return true;

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  if (ip) formData.append('remoteip', ip);

  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  });

  if (!verify.ok) return true;
  const result = await verify.json();
  return !result.success;
}

async function isRateLimited(request, endpoint, env) {
  if (!env.DB) return false;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await sha256(ip);
  const now = Date.now();
  const windowStart = now - 60_000;
  const limit = Number(env.RATE_LIMIT_PER_MINUTE || 20);

  await env.DB.prepare('INSERT INTO rate_limits (ip_hash, endpoint, created_at_ms) VALUES (?1, ?2, ?3)')
    .bind(ipHash, endpoint, now)
    .run();

  const row = await env.DB.prepare(
    'SELECT COUNT(*) as req_count FROM rate_limits WHERE ip_hash = ?1 AND endpoint = ?2 AND created_at_ms > ?3'
  )
    .bind(ipHash, endpoint, windowStart)
    .first();

  if (Math.random() < 0.05) {
    await env.DB.prepare('DELETE FROM rate_limits WHERE created_at_ms < ?1').bind(now - 86_400_000).run();
  }

  return Number(row?.req_count || 0) > limit;
}

async function logLeadEvent(leadId, eventType, request, env, meta = {}) {
  if (!env.DB) return;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || '';

  await env.DB.prepare(
    `INSERT INTO lead_events (lead_id, event_type, endpoint, payload_json, ip_hash, user_agent, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  )
    .bind(
      leadId,
      eventType,
      new URL(request.url).pathname,
      JSON.stringify(meta),
      await sha256(ip),
      userAgent.slice(0, 500),
      new Date().toISOString()
    )
    .run();
}

function handleOptions(request, env) {
  const headers = corsHeaders(request, env);
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(null, { status: 204, headers });
}

function json(payload, status, env, request) {
  const headers = new Headers(JSON_HEADERS);
  const cors = corsHeaders(request || null, env);
  cors.forEach((value, key) => headers.set(key, value));
  return new Response(JSON.stringify(payload), { status, headers });
}

function corsHeaders(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || '*';
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Vary', 'Origin');
  return headers;
}

async function parseJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Content-Type must be application/json');
  }
  return request.json();
}

async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

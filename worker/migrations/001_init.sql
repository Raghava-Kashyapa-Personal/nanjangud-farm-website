CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  lead_type TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  household_size INTEGER,
  box_preference TEXT,
  frequency_preference TEXT,
  whatsapp_opt_in INTEGER NOT NULL DEFAULT 0,
  consent INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  payload_json TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE INDEX IF NOT EXISTS idx_events_lead_id ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON lead_events(created_at);

CREATE TABLE IF NOT EXISTS content_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  pillar TEXT NOT NULL,
  summary TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_content_pillar ON content_items(pillar);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);

CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(ip_hash, endpoint, created_at_ms);

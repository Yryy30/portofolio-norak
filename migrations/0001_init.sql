CREATE TABLE site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'text'
             CHECK (type IN ('text', 'textarea', 'url', 'number')),
  group_name TEXT NOT NULL,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_site_content_group ON site_content (group_name, sort_order);

CREATE TABLE projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech        TEXT NOT NULL DEFAULT '[]',   -- JSON array, mis. ["Svelte","Hono"]
  url         TEXT,
  image_key   TEXT,                         -- key objek R2
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_order ON projects (published, sort_order);

CREATE TABLE skills (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  level      INTEGER CHECK (level BETWEEN 0 AND 100),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE contact_links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  label      TEXT NOT NULL,            -- "Email", "GitHub", "WhatsApp"
  value      TEXT NOT NULL,
  url        TEXT,                     -- mailto:, tel:, https://...
  icon       TEXT NOT NULL DEFAULT '🔗',
  sort_order INTEGER NOT NULL DEFAULT 0
);

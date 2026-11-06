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
  summary     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tech        TEXT NOT NULL DEFAULT '[]',
  features    TEXT NOT NULL DEFAULT '[]',
  role        TEXT NOT NULL DEFAULT '',
  year        INTEGER,
  status      TEXT NOT NULL DEFAULT 'completed'
              CHECK (status IN ('completed', 'in-progress', 'archived')),
  url         TEXT,
  repo_url    TEXT,
  image_key   TEXT,
  featured    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_order ON projects (published, sort_order);

CREATE TABLE project_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_key  TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_project_images ON project_images (project_id, sort_order);

CREATE TABLE skills (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  level      INTEGER CHECK (level BETWEEN 0 AND 100),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE contact_links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  label      TEXT NOT NULL,
  value      TEXT NOT NULL,
  url        TEXT,
  icon       TEXT NOT NULL DEFAULT '🔗',
  sort_order INTEGER NOT NULL DEFAULT 0
);

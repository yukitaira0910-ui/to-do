CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS requests (
  reference TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  token_id TEXT NOT NULL UNIQUE,
  encrypted_payload TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  suspicious INTEGER NOT NULL DEFAULT 0,
  notification TEXT NOT NULL DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT NOT NULL,
  period INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY(bucket, period)
);
CREATE TABLE IF NOT EXISTS audit_log (
  created_at INTEGER NOT NULL,
  event TEXT NOT NULL,
  reference TEXT,
  outcome TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS used_tokens (
  token_id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS used_tokens_expiry ON used_tokens(expires_at);
CREATE INDEX IF NOT EXISTS rate_limits_period ON rate_limits(period);

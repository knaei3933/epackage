-- Add token-based access columns to designer_task_assignments
-- This enables token-based access to designer order pages without authentication

ALTER TABLE designer_task_assignments
  ADD COLUMN IF NOT EXISTS access_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS access_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

-- Create index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_designer_task_assignments_token
  ON designer_task_assignments(access_token_hash)
  WHERE access_token_hash IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN designer_task_assignments.access_token_hash IS
  'SHA-256 hash of access token for token-based order access (no auth required)';
COMMENT ON COLUMN designer_task_assignments.access_token_expires_at IS
  'Token expiration timestamp (default 30 days from creation)';
COMMENT ON COLUMN designer_task_assignments.last_accessed_at IS
  'Last time the token was used to access the order';

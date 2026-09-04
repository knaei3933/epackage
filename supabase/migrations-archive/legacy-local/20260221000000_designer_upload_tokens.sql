-- =====================================================
-- Designer Upload Tokens Migration
-- Created: 2026-02-21
-- Description: Creates secure token-based upload system for external designers
-- Tokens expire after 30 days from creation
-- =====================================================

-- =====================================================
-- 1. DESIGNER_UPLOAD_TOKENS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS designer_upload_tokens (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Token security fields
  token_hash TEXT NOT NULL UNIQUE,                -- SHA-256 hash of the actual token
  token_prefix TEXT NOT NULL,                      -- First 8 characters for identification

  -- Association fields
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assignment_id UUID,                              -- Optional: references external assignment

  -- Status management
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'used', 'expired', 'revoked')),

  -- Expiration: 30 days from creation (NOT 7 days)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

  -- Timestamp tracking
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  -- Usage tracking
  access_count INTEGER NOT NULL DEFAULT 0,
  upload_count INTEGER NOT NULL DEFAULT 0,

  -- Revocation
  revoke_reason TEXT,

  -- Creator tracking
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Designer information for display
  designer_name TEXT,                              -- Display name for comments
  designer_email TEXT                              -- Contact email
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

-- Index for token lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_designer_upload_tokens_token_hash
  ON designer_upload_tokens(token_hash);

-- Index for order-based queries
CREATE INDEX IF NOT EXISTS idx_designer_upload_tokens_order_id
  ON designer_upload_tokens(order_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_designer_upload_tokens_status
  ON designer_upload_tokens(status);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_designer_upload_tokens_expires_at
  ON designer_upload_tokens(expires_at);

-- Composite index for active tokens query (order + status + expiration)
CREATE INDEX IF NOT EXISTS idx_designer_upload_tokens_active_tokens
  ON designer_upload_tokens(order_id, status, expires_at)
  WHERE status = 'active';

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE designer_upload_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view tokens
CREATE POLICY IF NOT EXISTS "Only admins can view upload tokens"
  ON designer_upload_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Only admins can insert tokens
CREATE POLICY IF NOT EXISTS "Only admins can create upload tokens"
  ON designer_upload_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Only admins can update tokens
CREATE POLICY IF NOT EXISTS "Only admins can update upload tokens"
  ON designer_upload_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Only admins can delete tokens
CREATE POLICY IF NOT EXISTS "Only admins can delete upload tokens"
  ON designer_upload_tokens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- 4. TOKEN EXPIRATION FUNCTION
-- =====================================================

-- Function to mark expired tokens as 'expired'
CREATE OR REPLACE FUNCTION expire_designer_upload_tokens()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update all active tokens that have passed their expiration time
  UPDATE designer_upload_tokens
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. AUTOMATIC EXPIRATION TRIGGER
-- =====================================================

-- Trigger function to check expiration on access
CREATE OR REPLACE FUNCTION check_token_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If token is being accessed and is expired, mark it
  IF NEW.status = 'active' AND NEW.expires_at < NOW() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for automatic expiration check
DROP TRIGGER IF EXISTS trigger_check_designer_token_expiration
  ON designer_upload_tokens;

CREATE TRIGGER trigger_check_designer_token_expiration
  BEFORE UPDATE ON designer_upload_tokens
  FOR EACH ROW
  EXECUTE FUNCTION check_token_expiration();

-- =====================================================
-- 6. UPDATE TRACKING FUNCTION
-- =====================================================

-- Function to update access statistics
CREATE OR REPLACE FUNCTION update_token_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_accessed_at and increment access_count on any update
  NEW.last_accessed_at := NOW();
  NEW.access_count := COALESCE(OLD.access_count, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for access tracking
DROP TRIGGER IF EXISTS trigger_update_token_access
  ON designer_upload_tokens;

CREATE TRIGGER trigger_update_token_access
  BEFORE UPDATE ON designer_upload_tokens
  FOR EACH ROW
  WHEN (OLD.status = 'active' OR OLD.status = 'used')
  EXECUTE FUNCTION update_token_access();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON designer_upload_tokens TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION expire_designer_upload_tokens() TO authenticated;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to validate a token and return its details
CREATE OR REPLACE FUNCTION validate_upload_token(p_token_hash TEXT)
RETURNS TABLE (
  token_id UUID,
  order_id UUID,
  designer_id UUID,
  designer_name TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if token is valid (active and not expired)
  RETURN QUERY
  SELECT
    t.id,
    t.order_id,
    t.designer_id,
    t.designer_name,
    t.status,
    t.expires_at
  FROM designer_upload_tokens t
  WHERE t.token_hash = p_token_hash
    AND t.status = 'active'
    AND t.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION mark_upload_token_used(p_token_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update token status to used
  UPDATE designer_upload_tokens
  SET
    status = 'used',
    used_at = NOW()
  WHERE id = p_token_id AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE designer_upload_tokens IS 'Secure tokens for external designer file uploads. Tokens expire 30 days after creation.';

COMMENT ON COLUMN designer_upload_tokens.token_hash IS 'SHA-256 hash of the actual token (never store plaintext)';
COMMENT ON COLUMN designer_upload_tokens.token_prefix IS 'First 8 characters for display/identification purposes';
COMMENT ON COLUMN designer_upload_tokens.expires_at IS 'Token expiration timestamp (30 days from creation)';
COMMENT ON COLUMN designer_upload_tokens.status IS 'Token status: active, used, expired, or revoked';
COMMENT ON COLUMN designer_upload_tokens.access_count IS 'Number of times the token was accessed';
COMMENT ON COLUMN designer_upload_tokens.upload_count IS 'Number of files uploaded using this token';
COMMENT ON COLUMN designer_upload_tokens.designer_name IS 'Display name for the designer (used in comments)';
COMMENT ON COLUMN designer_upload_tokens.designer_email IS 'Designer contact email';
COMMENT ON COLUMN designer_upload_tokens.assignment_id IS 'Optional reference to external assignment system';

COMMENT ON FUNCTION expire_designer_upload_tokens() IS 'Marks all expired tokens as expired status. Returns count of expired tokens.';
COMMENT ON FUNCTION validate_upload_token(TEXT) IS 'Validates a token hash and returns details if active and not expired.';
COMMENT ON FUNCTION mark_upload_token_used(UUID) IS 'Marks a token as used after file upload. Returns true if successful.';

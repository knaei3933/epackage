-- =====================================================
-- Migration: Timestamp Tokens & Audit Logs Tables
-- Purpose: Japanese Electronic Signature Law Compliance
-- Created: 2024-12-30
-- Legal References:
--   - 電子署名法 (Law No. 102 of 2000)
--   - 電子文書法 (Law No. 43 of 2004)
--   - 個人情報保護法 (APPI)
-- =====================================================

-- =====================================================
-- 1. Timestamp Tokens Table
-- =====================================================
-- 타임스탬프 토큰을 저장하는 테이블
-- 일본 전자서명법 제4조 준수

CREATE TABLE IF NOT EXISTS timestamp_tokens (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Timestamp Information
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_hash TEXT NOT NULL,
  document_type VARCHAR(100),

  -- TSA (Timestamp Authority) Information
  tsa_name TEXT NOT NULL,
  tsa_url TEXT,
  tsa_certificate TEXT,

  -- Algorithm Information
  hash_algorithm VARCHAR(20) NOT NULL DEFAULT 'SHA-256',
  signature_algorithm VARCHAR(50),

  -- Signature (Integrity)
  signature TEXT NOT NULL,

  -- Verification
  verification_status VARCHAR(20) NOT NULL DEFAULT 'valid',
  verified_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- User Information (for audit trail)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  ip_validation_result JSONB,

  -- Retention Policy (7 years per e-Document Law)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 years'),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 years'),

  -- Japanese Jurisdiction
  jurisdiction VARCHAR(10) NOT NULL DEFAULT 'JP',

  -- Indexes
  CONSTRAINT timestamp_tokens_document_hash_key UNIQUE (document_hash)
);

-- Indexes for Performance and Compliance
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_timestamp ON timestamp_tokens(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_document_hash ON timestamp_tokens(document_hash);
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_user_id ON timestamp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_ip_address ON timestamp_tokens(ip_address);
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_expires_at ON timestamp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_verification_status ON timestamp_tokens(verification_status);

-- GIN Index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_timestamp_tokens_metadata ON timestamp_tokens USING GIN (metadata);

-- Comment for Documentation
COMMENT ON TABLE timestamp_tokens IS 'Timestamp tokens for Japanese electronic signature law compliance';
COMMENT ON COLUMN timestamp_tokens.document_hash IS 'SHA-256 hash of the document content';
COMMENT ON COLUMN timestamp_tokens.signature IS 'HMAC signature for integrity verification';
COMMENT ON COLUMN timestamp_tokens.expires_at IS 'Retention period per e-Document Law (7 years)';
COMMENT ON COLUMN timestamp_tokens.ip_validation_result IS 'IP validation metadata for audit trail';

-- =====================================================
-- 2. Audit Logs Table
-- =====================================================
-- 시스템 감사 로그를 저장하는 테이블
-- 일본 전자서명법 및 개인정보보호법 준수

CREATE TABLE IF NOT EXISTS audit_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event Information
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,

  -- User Information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT, -- Masked for privacy

  -- IP Tracking (Japanese e-Sign Law Requirement)
  ip_address INET,
  ip_validation_result JSONB,

  -- Session & Request Tracking
  session_id TEXT,
  request_id TEXT,
  user_agent TEXT,

  -- Operation Result
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('success', 'failure', 'partial')),

  -- Detailed Information
  details JSONB DEFAULT '{}',
  error_message TEXT,

  -- Jurisdiction & Compliance
  jurisdiction VARCHAR(10) NOT NULL DEFAULT 'JP',

  -- Retention Policy
  retention_period_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT audit_logs_resource_check CHECK (
    resource_type IN (
      'timestamp_token',
      'signature',
      'contract',
      'user',
      'system',
      'ip_validation',
      'other'
    )
  )
);

-- Indexes for Performance and Compliance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_outcome ON audit_logs(outcome);
CREATE INDEX IF NOT EXISTS idx_audit_logs_scheduled_deletion ON audit_logs(scheduled_deletion_at);

-- Composite Index for Common Queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_timestamp ON audit_logs(resource_type, resource_id, timestamp DESC);

-- GIN Index for JSONB details queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_details ON audit_logs USING GIN (details);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_validation ON audit_logs USING GIN (ip_validation_result);

-- Comment for Documentation
COMMENT ON TABLE audit_logs IS 'System audit logs for Japanese electronic signature law compliance';
COMMENT ON COLUMN audit_logs.ip_validation_result IS 'IP validation metadata including trust level, source, and warnings';
COMMENT ON COLUMN audit_logs.retention_period_days IS 'Retention period based on event type (7 years for e-signatures, 3 years for security events)';
COMMENT ON COLUMN audit_logs.scheduled_deletion_at IS 'Automatic deletion date based on retention policy';

-- =====================================================
-- 3. IP Validation Logs Table (Optional, for detailed tracking)
-- =====================================================
-- IP 검증 상세 로그를 별도로 저장하는 테이블
-- x-forwarded-for 헤더 스푸핑 방지 및 추적

CREATE TABLE IF NOT EXISTS ip_validation_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- IP Information
  client_ip INET NOT NULL,
  trust_level VARCHAR(20) NOT NULL CHECK (trust_level IN ('trusted', 'verified', 'suspicious', 'untrusted')),
  source VARCHAR(50) NOT NULL,

  -- Raw Headers (for forensic analysis)
  raw_headers JSONB NOT NULL DEFAULT '{}',

  -- Proxy Chain
  proxy_chain TEXT[],

  -- IP Version & Type
  ip_version VARCHAR(10) NOT NULL CHECK (ip_version IN ('IPv4', 'IPv6')),
  is_private BOOLEAN NOT NULL DEFAULT false,

  -- Warnings
  warnings TEXT[],

  -- Related Resource
  resource_type VARCHAR(50),
  resource_id UUID,

  -- User Context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  request_id TEXT,

  -- Timestamp
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ip_validation_logs_client_ip ON ip_validation_logs(client_ip);
CREATE INDEX IF NOT EXISTS idx_ip_validation_logs_trust_level ON ip_validation_logs(trust_level);
CREATE INDEX IF NOT EXISTS idx_ip_validation_logs_validated_at ON ip_validation_logs(validated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_validation_logs_user_id ON ip_validation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_validation_logs_resource ON ip_validation_logs(resource_type, resource_id);

-- Comment for Documentation
COMMENT ON TABLE ip_validation_logs IS 'Detailed IP validation logs for security audit and forensic analysis';
COMMENT ON COLUMN ip_validation_logs.raw_headers IS 'Original headers (cf-connecting-ip, x-forwarded-for, x-real-ip)';
COMMENT ON COLUMN ip_validation_logs.proxy_chain IS 'Complete proxy chain from x-forwarded-for header';
COMMENT ON COLUMN ip_validation_logs.trust_level IS 'Confidence level in the IP address authenticity';

-- =====================================================
-- 4. RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE timestamp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_validation_logs ENABLE ROW LEVEL SECURITY;

-- Timestamp Tokens Policies
-- Service role can access all
CREATE POLICY "Service role can access all timestamp_tokens"
  ON timestamp_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only read their own timestamp tokens
CREATE POLICY "Users can read own timestamp_tokens"
  ON timestamp_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Audit Logs Policies
-- Service role can access all
CREATE POLICY "Service role can access all audit_logs"
  ON audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only read their own audit logs
CREATE POLICY "Users can read own audit_logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- IP Validation Logs Policies
-- Service role can access all
CREATE POLICY "Service role can access all ip_validation_logs"
  ON ip_validation_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin users can read IP validation logs
CREATE POLICY "Admins can read ip_validation_logs"
  ON ip_validation_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- 5. Functions & Triggers for Automatic Cleanup
-- =====================================================

-- Function to update scheduled_deletion_at for timestamp_tokens
CREATE OR REPLACE FUNCTION timestamp_tokens_set_deletion_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.scheduled_deletion_at := NEW.created_at + INTERVAL '7 years';
  NEW.expires_at := NEW.created_at + INTERVAL '7 years';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timestamp_tokens_set_deletion_trigger
  BEFORE INSERT ON timestamp_tokens
  FOR EACH ROW
  EXECUTE FUNCTION timestamp_tokens_set_deletion_date();

-- Function to set scheduled_deletion_at for audit_logs based on retention_period_days
CREATE OR REPLACE FUNCTION audit_logs_set_deletion_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.scheduled_deletion_at := NEW.created_at + (NEW.retention_period_days || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_set_deletion_trigger
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION audit_logs_set_deletion_date();

-- =====================================================
-- 6. Helper Functions for Compliance
-- =====================================================

-- Function to check timestamp token validity
CREATE OR REPLACE FUNCTION check_timestamp_validity(p_token_id UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  is_expired BOOLEAN,
  expires_at TIMESTAMPTZ,
  days_until_expiration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (verification_status = 'valid') AND (expires_at > NOW()) AS is_valid,
    (expires_at <= NOW()) AS is_expired,
    expires_at,
    EXTRACT(DAY FROM (expires_at - NOW()))::INTEGER AS days_until_expiration
  FROM timestamp_tokens
  WHERE id = p_token_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get audit log summary for compliance reporting
CREATE OR REPLACE FUNCTION get_audit_summary(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_events BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  security_alerts BIGINT,
  unique_ips BIGINT,
  timestamp_created_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_events,
    SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END)::BIGINT AS success_count,
    SUM(CASE WHEN outcome = 'failure' THEN 1 ELSE 0 END)::BIGINT AS failure_count,
    SUM(CASE WHEN event_type = 'security_alert' THEN 1 ELSE 0 END)::BIGINT AS security_alerts,
    COUNT(DISTINCT ip_address)::BIGINT AS unique_ips,
    SUM(CASE WHEN event_type = 'timestamp_created' THEN 1 ELSE 0 END)::BIGINT AS timestamp_created_count
  FROM audit_logs
  WHERE
    (p_start_date IS NULL OR timestamp >= p_start_date)
    AND (p_end_date IS NULL OR timestamp <= p_end_date)
    AND (p_user_id IS NULL OR user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Views for Common Queries
-- =====================================================

-- View: Active timestamp tokens (not expired)
CREATE OR REPLACE VIEW active_timestamp_tokens AS
SELECT
  id,
  timestamp,
  document_hash,
  document_type,
  user_id,
  ip_address,
  verification_status,
  created_at,
  expires_at,
  (expires_at > NOW()) AS is_active,
  EXTRACT(DAY FROM (expires_at - NOW()))::INTEGER AS days_until_expiration
FROM timestamp_tokens
WHERE expires_at > NOW()
  AND verification_status = 'valid';

COMMENT ON VIEW active_timestamp_tokens IS 'View of active (non-expired) timestamp tokens';

-- View: Security audit logs (security-related events)
CREATE OR REPLACE VIEW security_audit_logs AS
SELECT
  id,
  timestamp,
  event_type,
  resource_type,
  resource_id,
  user_id,
  ip_address,
  ip_validation_result,
  outcome,
  details,
  error_message
FROM audit_logs
WHERE event_type IN (
  'security_alert',
  'ip_validation',
  'user_login',
  'user_logout',
  'signature_created',
  'signature_verified'
)
ORDER BY timestamp DESC;

COMMENT ON VIEW security_audit_logs IS 'View of security-related audit events';

-- View: User activity timeline
CREATE OR REPLACE VIEW user_activity_timeline AS
SELECT
  user_id,
  timestamp,
  event_type,
  resource_type,
  resource_id,
  ip_address,
  outcome
FROM audit_logs
WHERE user_id IS NOT NULL
ORDER BY timestamp DESC;

COMMENT ON VIEW user_activity_timeline IS 'Chronological view of user activities';

-- =====================================================
-- 8. Grant Permissions
-- =====================================================

-- Grant access to service role
GRANT ALL ON timestamp_tokens TO service_role;
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON ip_validation_logs TO service_role;
GRANT ALL ON active_timestamp_tokens TO service_role;
GRANT ALL ON security_audit_logs TO service_role;
GRANT ALL ON user_activity_timeline TO service_role;

-- Grant access to authenticated users (read-only for their own data)
GRANT SELECT ON timestamp_tokens TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON active_timestamp_tokens TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION check_timestamp_validity TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_summary TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully. Tables created:';
  RAISE NOTICE '  - timestamp_tokens (Japanese electronic signature law compliance)';
  RAISE NOTICE '  - audit_logs (System audit trail)';
  RAISE NOTICE '  - ip_validation_logs (Detailed IP validation tracking)';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - active_timestamp_tokens';
  RAISE NOTICE '  - security_audit_logs';
  RAISE NOTICE '  - user_activity_timeline';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - check_timestamp_validity()';
  RAISE NOTICE '  - get_audit_summary()';
END $$;

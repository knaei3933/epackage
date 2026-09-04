-- =====================================================
-- Audit Logs Table (電子署名法・個人情報保護法準拠 監査ログ)
-- 電子署名/契約/IP検証/管理者操作の監査ログ蓄積
-- 保存期間: 2555日（7年・audit-logger.ts AUDIT_LOG_RETENTION_PERIODS.E_SIGNATURE 準拠）
-- スキーマ: database.ts L1181-1206 + AC-1a.2 改善（event_type/resource_type は TEXT 無 CHECK）
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  user_id TEXT,
  user_email TEXT,
  ip_address TEXT,
  ip_validation JSONB,
  session_id TEXT,
  user_agent TEXT,
  request_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'partial')),
  details JSONB,
  error_message TEXT,
  jurisdiction TEXT NOT NULL DEFAULT 'JP' CHECK (jurisdiction IN ('JP', 'OTHER')),
  retention_period_days INTEGER NOT NULL DEFAULT 2555,
  scheduled_deletion_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2555 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs("timestamp" DESC);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
-- cleanupExpiredAuditLogs が .lt('scheduled_deletion_at', now) で検索するため追加
CREATE INDEX idx_audit_logs_scheduled_deletion_at ON audit_logs(scheduled_deletion_at);

-- =====================================================
-- Row Level Security (RLS)
-- service role は RLS bypass で INSERT 可能（auth.uid() IS NULL でも明示的に許可・二重护栏）
-- =====================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- INSERT: service role (auth.uid() IS NULL) または管理者のみ
CREATE POLICY "System and admins can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- SELECT: 管理者のみ（一般ユーザーは監査ログ不可読）
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Grants
-- anon には一切権限付与しない（監査ログは外部不可読）
-- authenticated には SELECT/INSERT を付与（RLS ポリシーが管理者以外を弾く）
-- =====================================================
GRANT SELECT, INSERT ON audit_logs TO authenticated;;

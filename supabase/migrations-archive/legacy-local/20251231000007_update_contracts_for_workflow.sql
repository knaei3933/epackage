-- =====================================================
-- Update Contracts Table for Workflow Management
-- 契約ワークフロー管理のための契約テーブル更新
-- =====================================================

-- Add sent_at and expires_at columns if they don't exist
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Update contract status enum to match workflow requirements
-- First, we need to add new status values
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'PENDING_SIGNATURE';
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'SIGNED';
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'COMPLETED';

-- Create index for expiring contracts
CREATE INDEX IF NOT EXISTS idx_contracts_expires_at ON contracts(expires_at);
CREATE INDEX IF NOT EXISTS idx_contracts_sent_at ON contracts(sent_at);

-- =====================================================
-- Contract Reminder History Table
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_reminder_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

  -- リマインダー送信先 (Sent to)
  sent_to TEXT NOT NULL,

  -- メッセージ内容 (Message content)
  message TEXT NOT NULL,

  -- 送信日時 (Sent at)
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- 送信結果 (Send result - success/failure)
  send_result TEXT, -- 'SUCCESS', 'FAILED', 'PENDING'

  -- エラー詳細 (Error details if failed)
  error_details TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for reminder history
CREATE INDEX idx_contract_reminder_history_contract_id ON contract_reminder_history(contract_id);
CREATE INDEX idx_contract_reminder_history_sent_at ON contract_reminder_history(sent_at DESC);

-- RLS for reminder history
ALTER TABLE contract_reminder_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view reminder history
CREATE POLICY "Admins can view reminder history"
  ON contract_reminder_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can insert reminder history
CREATE POLICY "Admins can insert reminder history"
  ON contract_reminder_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Helper Functions for Contract Workflow
-- =====================================================

-- Function to get contracts expiring soon (within N days)
CREATE OR REPLACE FUNCTION get_expiring_contracts(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  contract_id UUID,
  contract_number TEXT,
  company_id UUID,
  customer_name TEXT,
  status contract_status,
  expires_at TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.contract_number,
    c.company_id,
    c.customer_name,
    c.status,
    c.expires_at,
    EXTRACT(DAY FROM (c.expires_at - NOW()))::INTEGER AS days_until_expiry
  FROM contracts c
  WHERE c.expires_at IS NOT NULL
    AND c.expires_at <= NOW() + (days_ahead || ' days')::INTERVAL
    AND c.status IN ('SENT', 'PENDING_SIGNATURE')
  ORDER BY c.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if reminder should be sent (not sent in last N days)
CREATE OR REPLACE FUNCTION should_send_reminder(
  contract_uuid UUID,
  days_since_last_reminder INTEGER DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
  last_reminder_sent TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MAX(sent_at) INTO last_reminder_sent
  FROM contract_reminder_history
  WHERE contract_id = contract_uuid;

  RETURN last_reminder_sent IS NULL
    OR last_reminder_sent < NOW() - (days_since_last_reminder || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending signature contracts count
CREATE OR REPLACE FUNCTION get_pending_signature_count()
RETURNS INTEGER AS $$
DECLARE
  pending_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM contracts
  WHERE status IN ('SENT', 'PENDING_SIGNATURE');

  RETURN pending_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT SELECT ON contract_reminder_history TO authenticated;
GRANT ALL ON contract_reminder_history TO authenticated;

GRANT EXECUTE ON FUNCTION get_expiring_contracts TO authenticated;
GRANT EXECUTE ON FUNCTION should_send_reminder TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_signature_count TO authenticated;

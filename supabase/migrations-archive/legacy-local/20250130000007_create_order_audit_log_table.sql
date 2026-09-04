-- =====================================================
-- Epackage Lab Order Audit Log Table
--監査ログ管理 (Comprehensive Audit Logging)
-- Tracks ALL changes to orders and related tables
-- =====================================================

-- Audit Action Enum
CREATE TYPE audit_action AS ENUM (
  'INSERT',  -- 新規作成 (New record created)
  'UPDATE',  -- 更新 (Record updated)
  'DELETE'   -- 削除 (Record deleted)
);

-- =====================================================
-- Order Audit Log Table
-- Comprehensive audit trail for compliance and debugging
-- =====================================================

CREATE TABLE order_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Table Information
  table_name TEXT NOT NULL,  -- Which table was affected
  record_id UUID NOT NULL,   -- ID of the affected record

  -- Action
  action audit_action NOT NULL,

  -- Data Changes (stores full row data)
  old_data JSONB,   -- Data before change (NULL for INSERT)
  new_data JSONB,   -- Data after change (NULL for DELETE)

  -- Changed by (誰が変更したか)
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Request Information (for security)
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamp
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_order_audit_log_table_name ON order_audit_log(table_name);
CREATE INDEX idx_order_audit_log_record_id ON order_audit_log(record_id);
CREATE INDEX idx_order_audit_log_action ON order_audit_log(action);
CREATE INDEX idx_order_audit_log_changed_by ON order_audit_log(changed_by);
CREATE INDEX idx_order_audit_log_changed_at ON order_audit_log(changed_at DESC);
CREATE INDEX idx_order_audit_log_table_record ON order_audit_log(table_name, record_id);
CREATE INDEX idx_order_audit_log_record_action ON order_audit_log(record_id, changed_at DESC);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE order_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON order_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only service role can insert audit logs (trigger-based)
CREATE POLICY "Service role can insert audit logs"
  ON order_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- Generic Audit Trigger Function
-- =====================================================

-- Generic function to audit changes to any table
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  user_ip TEXT;
  user_ua TEXT;
BEGIN
  -- Try to get IP and user agent from the request
  -- Note: These may be NULL in trigger context
  user_ip := current_setting('request.headers', true);
  user_ua := current_setting('request.headers', true);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'INSERT',
      NULL::jsonb,
      row_to_json(NEW)::jsonb - 'updated_at' - 'created_at',
      auth.uid()
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO order_audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'UPDATE',
      row_to_json(OLD)::jsonb - 'updated_at' - 'created_at',
      row_to_json(NEW)::jsonb - 'updated_at' - 'created_at',
      auth.uid()
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO order_audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      row_to_json(OLD)::jsonb - 'updated_at' - 'created_at',
      NULL::jsonb,
      auth.uid()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION get_audit_trail(table_name_text TEXT, record_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  trail_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'audit_id', id,
      'action', action,
      'old_data', old_data,
      'new_data', new_data,
      'changed_by', changed_by,
      'changed_at', changed_at,
      'ip_address', ip_address
    ) ORDER BY changed_at ASC
  ) INTO trail_data
  FROM order_audit_log
  WHERE table_name = table_name_text AND record_id = record_uuid;

  RETURN COALESCE(trail_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all changes by a specific user
CREATE OR REPLACE FUNCTION get_user_audit_history(user_uuid UUID, since_date TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  history_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'audit_id', id,
      'table_name', table_name,
      'action', action,
      'record_id', record_id,
      'changed_at', changed_at
    ) ORDER BY changed_at DESC
  ) INTO history_data
  FROM order_audit_log
  WHERE changed_by = user_uuid
    AND (since_date IS NULL OR changed_at >= since_date);

  RETURN COALESCE(history_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent audit activity
CREATE OR REPLACE FUNCTION get_recent_audit_activity(limit_count INTEGER DEFAULT 100)
RETURNS JSONB AS $$
DECLARE
  activity_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'audit_id', id,
      'table_name', table_name,
      'action', action,
      'record_id', record_id,
      'changed_by', changed_by,
      'changed_at', changed_at
    ) ORDER BY changed_at DESC
  ) INTO activity_data
  FROM (
    SELECT * FROM order_audit_log
    ORDER BY changed_at DESC
    LIMIT limit_count
  ) sub;

  RETURN COALESCE(activity_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON order_audit_log TO authenticated;

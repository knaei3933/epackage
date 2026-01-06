-- =====================================================
-- Epackage Lab Production Logs Table
--生産進捗ログ管理 (Production Progress Logging)
-- =====================================================

-- Production Sub-Status Enum (9 stages)
CREATE TYPE production_sub_status AS ENUM (
  'design_received',    -- デザインデータ受領 (Design data received)
  'work_order_created', -- 作業標準書作成完了 (Work order created)
  'material_prepared',  -- 資材準備完了 (Materials prepared)
  'printing',           -- 印刷中 (Printing in progress)
  'lamination',         -- ラミネート加工中 (Lamination in progress)
  'slitting',           -- スリット加工中 (Slitting in progress)
  'pouch_making',       -- パウチ成形中 (Pouch forming in progress)
  'qc_passed',          -- 品質検査合格 (Quality inspection passed)
  'packaged'            -- 包装完了 (Packaging complete)
);

-- =====================================================
-- Production Logs Table
-- Each log entry represents a progress update during production
-- =====================================================

CREATE TABLE production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,

  -- Sub-status (one of 9 production stages)
  sub_status production_sub_status NOT NULL,

  -- Progress Percentage (0-100)
  progress_percentage INTEGER NOT NULL DEFAULT 0,

  -- Assigned Operator (担当者)
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Photo URL (作業写真)
  photo_url TEXT,

  -- Notes/Comments (作業メモ)
  notes TEXT,

  -- Logged at (記録日時)
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT progress_percentage_valid CHECK (
    progress_percentage >= 0 AND progress_percentage <= 100
  )
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_production_logs_order_id ON production_logs(order_id);
CREATE INDEX idx_production_logs_sub_status ON production_logs(sub_status);
CREATE INDEX idx_production_logs_assigned_to ON production_logs(assigned_to);
CREATE INDEX idx_production_logs_logged_at ON production_logs(logged_at DESC);
CREATE INDEX idx_production_logs_order_sub_status ON production_logs(order_id, sub_status);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;

-- Operators and admins can view all production logs
CREATE POLICY "Operators and admins can view production logs"
  ON production_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Customers can view production logs for their orders
CREATE POLICY "Customers can view own production logs"
  ON production_logs FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Only admins and operators can insert production logs
CREATE POLICY "Admins and operators can insert production logs"
  ON production_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins and operators can update production logs
CREATE POLICY "Admins and operators can update production logs"
  ON production_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins can delete production logs
CREATE POLICY "Admins can delete production logs"
  ON production_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get latest production log for an order
CREATE OR REPLACE FUNCTION get_latest_production_log(order_uuid UUID)
RETURNS production_logs AS $$
DECLARE
  latest_log production_logs;
BEGIN
  SELECT * INTO latest_log
  FROM production_logs
  WHERE order_id = order_uuid
  ORDER BY logged_at DESC
  LIMIT 1;

  RETURN latest_log;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get production progress for an order
CREATE OR REPLACE FUNCTION get_production_progress(order_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  progress_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'sub_status', sub_status,
      'progress_percentage', progress_percentage,
      'logged_at', logged_at,
      'notes', notes
    ) ORDER BY logged_at
  ) INTO progress_data
  FROM production_logs
  WHERE order_id = order_uuid;

  RETURN COALESCE(progress_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate current production stage
CREATE OR REPLACE FUNCTION get_current_production_stage(order_uuid UUID)
RETURNS production_sub_status AS $$
DECLARE
  current_stage production_sub_status;
BEGIN
  SELECT sub_status INTO current_stage
  FROM production_logs
  WHERE order_id = order_uuid
  ORDER BY logged_at DESC
  LIMIT 1;

  RETURN current_stage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON production_logs TO authenticated;
GRANT ALL ON production_logs TO authenticated;

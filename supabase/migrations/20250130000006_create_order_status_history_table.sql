-- =====================================================
-- Epackage Lab Order Status History Table
--注文ステータス履歴管理 (Order Status Change History)
-- =====================================================

-- =====================================================
-- Order Status History Table
-- Tracks all status changes for orders
-- =====================================================

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,

  -- Status Transition
  from_status TEXT,   -- Previous status (NULL for first status)
  to_status TEXT NOT NULL, -- New status

  -- Changed by (誰が変更したか)
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Reason for change (変更理由)
  reason TEXT,

  -- Additional metadata (追加情報)
  metadata JSONB,  -- Stores: { notes: [], attachments: [], etc. }

  -- Timestamp
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_to_status ON order_status_history(to_status);
CREATE INDEX idx_order_status_history_changed_by ON order_status_history(changed_by);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at DESC);
CREATE INDEX idx_order_status_history_order_changed_at ON order_status_history(order_id, changed_at DESC);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view status history for their own orders
CREATE POLICY "Users can view own order status history"
  ON order_status_history FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admins can view all status history
CREATE POLICY "Admins can view all order status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only system or admins can insert status history
CREATE POLICY "System and admins can insert status history"
  ON order_status_history FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR  -- Service role
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Trigger: Auto-log status changes
-- =====================================================

-- Function to log status changes automatically
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log on status updates
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NULL);
  END IF;

  -- For new orders, log initial status
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
    VALUES (NEW.id, NULL, NEW.status, NEW.user_id, 'Initial status');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on orders table to auto-log status changes
-- Note: This will be added when orders table is created/updated
-- CREATE TRIGGER orders_status_change_log
--   AFTER INSERT OR UPDATE OF status ON orders
--   FOR EACH ROW
--   EXECUTE FUNCTION log_order_status_change();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get full status timeline for an order
CREATE OR REPLACE FUNCTION get_order_status_timeline(order_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  timeline_data JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'history_id', id,
      'from_status', from_status,
      'to_status', to_status,
      'changed_by', changed_by,
      'changed_at', changed_at,
      'reason', reason,
      'metadata', metadata
    ) ORDER BY changed_at ASC
  ) INTO timeline_data
  FROM order_status_history
  WHERE order_id = order_uuid;

  RETURN COALESCE(timeline_data, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current status of an order (from history)
CREATE OR REPLACE FUNCTION get_current_order_status(order_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  current_status TEXT;
BEGIN
  SELECT to_status INTO current_status
  FROM order_status_history
  WHERE order_id = order_uuid
  ORDER BY changed_at DESC
  LIMIT 1;

  RETURN current_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get status duration (how long in current status)
CREATE OR REPLACE FUNCTION get_status_duration(order_uuid UUID)
RETURNS INTERVAL AS $$
DECLARE
  duration INTERVAL;
  last_change TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT changed_at INTO last_change
  FROM order_status_history
  WHERE order_id = order_uuid
  ORDER BY changed_at DESC
  LIMIT 1;

  IF last_change IS NOT NULL THEN
    duration := NOW() - last_change;
  END IF;

  RETURN duration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON order_status_history TO authenticated, anon;

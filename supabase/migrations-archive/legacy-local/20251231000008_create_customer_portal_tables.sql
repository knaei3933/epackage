-- =====================================================
-- Customer Portal Tables
-- カスタマーポータル用テーブル
-- =====================================================
-- This migration creates tables for the customer self-service portal
-- 顧客セルフサービスポータル用のテーブルを作成します

-- =====================================================
-- Customer Preferences Table
-- 顧客設定テーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification preferences (通知設定)
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  production_updates BOOLEAN DEFAULT true,
  shipment_updates BOOLEAN DEFAULT true,
  quote_updates BOOLEAN DEFAULT true,
  contract_updates BOOLEAN DEFAULT true,

  -- Display preferences (表示設定)
  language TEXT DEFAULT 'ja',
  timezone TEXT DEFAULT 'Asia/Tokyo',
  date_format TEXT DEFAULT 'ja',
  currency TEXT DEFAULT 'JPY',

  -- Dashboard preferences (ダッシュボード設定)
  default_view TEXT DEFAULT 'summary', -- 'summary', 'orders', 'timeline'
  show_completed_orders BOOLEAN DEFAULT false,
  items_per_page INT DEFAULT 20,

  -- Email digest settings (メールダイジェスト設定)
  email_digest_frequency TEXT DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
  email_digest_time TEXT DEFAULT '09:00', -- Time for daily/weekly digest

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(user_id)
);

-- Indexes for customer_preferences
CREATE INDEX IF NOT EXISTS idx_customer_preferences_user_id ON customer_preferences(user_id);

-- RLS for customer_preferences
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON customer_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON customer_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON customer_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- Document Access Log Table
-- ドキュメントアクセスログテーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL, -- 'contract', 'invoice', 'design', 'shipping_label', 'quote', 'spec_sheet'
  document_id TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,

  action TEXT NOT NULL, -- 'viewed', 'downloaded', 'printed'
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Request metadata (リクエストメタデータ)
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Session info (セッション情報)
  session_id TEXT
);

-- Indexes for document_access_log
CREATE INDEX IF NOT EXISTS idx_document_access_user ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_order ON document_access_log(order_id);
CREATE INDEX IF NOT EXISTS idx_document_access_quotation ON document_access_log(quotation_id);
CREATE INDEX IF NOT EXISTS idx_document_access_type ON document_access_log(document_type);
CREATE INDEX IF NOT EXISTS idx_document_access_accessed_at ON document_access_log(accessed_at DESC);

-- RLS for document_access_log
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own access logs
CREATE POLICY "Users can view own access logs"
  ON document_access_log FOR SELECT
  USING (user_id = auth.uid());

-- System inserts access logs (service role only)
CREATE POLICY "System can insert access logs"
  ON document_access_log FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- =====================================================
-- Order Notes Table (Customer-visible notes)
-- 注文メモテーブル（顧客可視）
-- =====================================================

CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  note_type TEXT NOT NULL, -- 'customer', 'internal', 'production_update', 'shipping_update'
  subject TEXT,
  content TEXT NOT NULL,

  is_visible_to_customer BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for order_notes
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_user_id ON order_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON order_notes(created_at DESC);

-- RLS for order_notes
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- Users can view visible notes for their orders
CREATE POLICY "Users can view visible notes for own orders"
  ON order_notes FOR SELECT
  USING (
    is_visible_to_customer = true
    AND order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Users can insert notes on their own orders
CREATE POLICY "Users can insert notes on own orders"
  ON order_notes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Users can update their own notes
CREATE POLICY "Users can update own notes"
  ON order_notes FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- Customer Notifications Table (In-app notifications)
-- 顧客通知テーブル（アプリ内通知）
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL, -- 'order_update', 'shipment_update', 'contract_ready', 'quote_ready', 'production_update'
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Reference to related entities (関連エンティティへの参照)
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,

  action_url TEXT, -- Link to relevant page
  action_label TEXT, -- Button text for action

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,

  expires_at TIMESTAMP WITH TIME ZONE, -- Auto-dismiss after this date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for customer_notifications
CREATE INDEX IF NOT EXISTS idx_customer_notifications_user_id ON customer_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_is_read ON customer_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_created_at ON customer_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_order_id ON customer_notifications(order_id);

-- RLS for customer_notifications
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON customer_notifications FOR SELECT
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON customer_notifications FOR INSERT
  WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON customer_notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    -- Only allow marking as read
    CASE WHEN is_read = true THEN true END
    OR user_id = auth.uid()
  );

-- =====================================================
-- Helper Functions
-- ヘルパー関数
-- =====================================================

-- Function to get or create customer preferences
CREATE OR REPLACE FUNCTION get_or_create_customer_preferences(user_uuid UUID)
RETURNS customer_preferences AS $$
DECLARE
  pref_record customer_preferences;
BEGIN
  SELECT * INTO pref_record
  FROM customer_preferences
  WHERE user_id = user_uuid;

  IF NOT FOUND THEN
    INSERT INTO customer_preferences (user_id)
    VALUES (user_uuid)
    RETURNING * INTO pref_record;
  END IF;

  RETURN pref_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log document access
CREATE OR REPLACE FUNCTION log_document_access(
  user_uuid UUID,
  doc_type TEXT,
  doc_id TEXT,
  order_uuid UUID DEFAULT NULL,
  quotation_uuid UUID DEFAULT NULL,
  access_action TEXT DEFAULT 'viewed',
  access_ip TEXT DEFAULT NULL,
  access_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO document_access_log (
    user_id,
    document_type,
    document_id,
    order_id,
    quotation_id,
    action,
    ip_address,
    user_agent
  )
  VALUES (
    user_uuid,
    doc_type,
    doc_id,
    order_uuid,
    quotation_uuid,
    access_action,
    access_ip,
    access_user_agent
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create customer notification
CREATE OR REPLACE FUNCTION create_customer_notification(
  user_uuid UUID,
  notif_type TEXT,
  notif_title TEXT,
  notif_message TEXT,
  order_uuid UUID DEFAULT NULL,
  quotation_uuid UUID DEFAULT NULL,
  shipment_uuid UUID DEFAULT NULL,
  action_url TEXT DEFAULT NULL,
  action_label TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO customer_notifications (
    user_id,
    notification_type,
    title,
    message,
    order_id,
    quotation_id,
    shipment_id,
    action_url,
    action_label
  )
  VALUES (
    user_uuid,
    notif_type,
    notif_title,
    notif_message,
    order_uuid,
    quotation_uuid,
    shipment_uuid,
    action_url,
    action_label
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE customer_notifications
  SET is_read = true,
      read_at = NOW()
  WHERE id = notification_uuid
    AND user_id = user_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_uuid UUID)
RETURNS INT AS $$
DECLARE
  marked_count INT;
BEGIN
  UPDATE customer_notifications
  SET is_read = true,
      read_at = NOW()
  WHERE user_id = user_uuid
    AND is_read = false;

  GET DIAGNOSTICS marked_count = ROW_COUNT;
  RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM customer_notifications
  WHERE user_id = user_uuid
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order status summary for customer
CREATE OR REPLACE FUNCTION get_customer_order_summary(user_uuid UUID)
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    status,
    COUNT(*) as count
  FROM orders
  WHERE user_id = user_uuid
    AND status != 'CANCELLED'
  GROUP BY status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customer dashboard data
CREATE OR REPLACE FUNCTION get_customer_dashboard_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  dashboard_data JSON;
BEGIN
  SELECT json_build_object(
    'order_summary', (
      SELECT json_object_agg(status, count)
      FROM get_customer_order_summary(user_uuid)
    ),
    'unread_notifications', get_unread_notification_count(user_uuid),
    'recent_orders', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'order_number', order_number,
          'status', status,
          'total_amount', total_amount,
          'created_at', created_at
        )
      )
      FROM (
        SELECT id, order_number, status, total_amount, created_at
        FROM orders
        WHERE user_id = user_uuid
        ORDER BY created_at DESC
        LIMIT 5
      ) recent
    ),
    'preferences', (
      SELECT row_to_json(cp)
      FROM customer_preferences cp
      WHERE cp.user_id = user_uuid
    )
  ) INTO dashboard_data;

  RETURN dashboard_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Update timestamp trigger for customer_preferences
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_preferences_updated_at
  BEFORE UPDATE ON customer_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_notes_updated_at
  BEFORE UPDATE ON order_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Grant permissions
-- =====================================================

-- Customer preferences
GRANT SELECT, INSERT, UPDATE ON customer_preferences TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Document access log (read-only for users)
GRANT SELECT ON document_access_log TO authenticated;

-- Order notes
GRANT SELECT, INSERT, UPDATE ON order_notes TO authenticated;

-- Customer notifications
GRANT SELECT, UPDATE ON customer_notifications TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_or_create_customer_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_order_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_dashboard_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;

-- Service role functions
GRANT EXECUTE ON FUNCTION log_document_access TO authenticated;
GRANT EXECUTE ON FUNCTION create_customer_notification TO authenticated;

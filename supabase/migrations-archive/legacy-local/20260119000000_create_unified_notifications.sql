-- =====================================================
-- Unified Notifications Table Migration
-- =====================================================
-- 統合通知テーブル作成
-- 会員・管理者共通の通知システムを提供します

-- =====================================================
-- Create Unified Notifications Table
-- =====================================================

CREATE TABLE IF NOT EXISTS unified_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('member', 'admin')),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  channels JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_recipient CHECK (recipient_type = 'admin' OR recipient_id IS NOT NULL)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_unified_notifications_recipient ON unified_notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_type ON unified_notifications(type);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_created ON unified_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_is_read ON unified_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_related ON unified_notifications(related_id, related_type);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_unified_notifications_recipient_unread ON unified_notifications(recipient_id, recipient_type, is_read)
  WHERE is_read = false;

-- RLS (Row Level Security)
ALTER TABLE unified_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON unified_notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON unified_notifications
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (
    -- Only allow marking as read
    CASE WHEN is_read = true THEN true END
    OR recipient_id = auth.uid()
  );

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON unified_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- System (service role) can insert notifications
CREATE POLICY "System can insert notifications"
  ON unified_notifications
  FOR INSERT
  WITH CHECK (true);

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON unified_notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
    OR recipient_id = auth.uid()
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to create unified notification
CREATE OR REPLACE FUNCTION create_unified_notification(
  p_recipient_id UUID,
  p_recipient_type TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_metadata JSONB DEFAULT '{}',
  p_channels JSONB DEFAULT '{}',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO unified_notifications (
    recipient_id,
    recipient_type,
    type,
    title,
    message,
    related_id,
    related_type,
    priority,
    metadata,
    channels,
    action_url,
    action_label,
    expires_at
  )
  VALUES (
    p_recipient_id,
    p_recipient_type,
    p_type,
    p_title,
    p_message,
    p_related_id,
    p_related_type,
    p_priority,
    p_metadata,
    p_channels,
    p_action_url,
    p_action_label,
    p_expires_at
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_unified_notification_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE unified_notifications
  SET is_read = true,
      read_at = NOW()
  WHERE id = notification_uuid
    AND recipient_id = user_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_unified_notifications_read(user_uuid UUID, user_type TEXT)
RETURNS INT AS $$
DECLARE
  marked_count INT;
BEGIN
  UPDATE unified_notifications
  SET is_read = true,
      read_at = NOW()
  WHERE recipient_id = user_uuid
    AND recipient_type = user_type
    AND is_read = false;

  GET DIAGNOSTICS marked_count = ROW_COUNT;
  RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unified_notification_count(user_uuid UUID, user_type TEXT)
RETURNS INT AS $$
DECLARE
  unread_count INT;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM unified_notifications
  WHERE recipient_id = user_uuid
    AND recipient_type = user_type
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old notifications (30+ days read)
CREATE OR REPLACE FUNCTION cleanup_old_unified_notifications()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM unified_notifications
  WHERE is_read = true
    AND read_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Authenticated users can access notifications
GRANT SELECT, UPDATE ON unified_notifications TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_unified_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_unified_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_unified_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unified_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_unified_notifications TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE unified_notifications IS 'Unified notifications for members and admins';
COMMENT ON COLUMN unified_notifications.recipient_id IS 'User ID who receives the notification';
COMMENT ON COLUMN unified_notifications.recipient_type IS 'Type of recipient: member or admin';
COMMENT ON COLUMN unified_notifications.type IS 'Notification type (order_update, shipment_update, etc.)';
COMMENT ON COLUMN unified_notifications.priority IS 'Notification priority level';
COMMENT ON COLUMN unified_notifications.channels IS 'Notification channels sent (email, sms)';
COMMENT ON COLUMN unified_notifications.related_id IS 'Related entity ID (order, quotation, etc.)';
COMMENT ON COLUMN unified_notifications.related_type IS 'Related entity type (orders, quotations, etc.)';

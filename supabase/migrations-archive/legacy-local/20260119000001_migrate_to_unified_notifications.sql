-- =====================================================
-- Migrate to Unified Notifications
-- =====================================================
-- 既存の通知テーブルからunified_notificationsへのデータ移行
-- customer_notifications と admin_notifications の統合

-- =====================================================
-- Step 1: Migrate customer_notifications
-- =====================================================

-- Insert customer notifications into unified_notifications
INSERT INTO unified_notifications (
  id,
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
  is_read,
  read_at,
  action_url,
  action_label,
  expires_at,
  created_at
)
SELECT
  cn.id,
  cn.user_id,
  'member'::TEXT,
  cn.notification_type,
  cn.title,
  cn.message,
  COALESCE(cn.order_id, cn.quotation_id, cn.shipment_id),
  CASE
    WHEN cn.order_id IS NOT NULL THEN 'orders'
    WHEN cn.quotation_id IS NOT NULL THEN 'quotations'
    WHEN cn.shipment_id IS NOT NULL THEN 'shipments'
    ELSE NULL
  END,
  'normal'::TEXT,
  '{}'::JSONB,
  jsonb_build_object(
    'email', cn.sent_via_email,
    'sms', cn.sent_via_sms
  ),
  cn.is_read,
  cn.read_at,
  cn.action_url,
  cn.action_label,
  cn.expires_at,
  cn.created_at
FROM customer_notifications cn
ON CONFLICT (id) DO NOTHING;

-- Log migration count
DO $$
DECLARE
  migrated_count INT;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM (
    SELECT 1 FROM customer_notifications
    EXCEPT
    SELECT 1 FROM unified_notifications WHERE recipient_type = 'member'
  ) AS remaining;

  RAISE NOTICE 'Migrated customer notifications: % rows', (
    SELECT COUNT(*) FROM unified_notifications WHERE recipient_type = 'member'
  );
END $$;

-- =====================================================
-- Step 2: Migrate admin_notifications
-- =====================================================

-- Insert admin notifications into unified_notifications
INSERT INTO unified_notifications (
  id,
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
  is_read,
  read_at,
  action_url,
  action_label,
  expires_at,
  created_at
)
SELECT
  an.id,
  COALESCE(an.user_id, (SELECT id FROM profiles WHERE role = 'ADMIN' ORDER BY created_at LIMIT 1)),
  'admin'::TEXT,
  an.type,
  an.title,
  an.message,
  an.related_id,
  an.related_type,
  an.priority,
  COALESCE(an.metadata, '{}'::JSONB),
  '{}'::JSONB,
  an.is_read,
  an.read_at,
  an.action_url,
  an.action_label,
  an.expires_at,
  an.created_at
FROM admin_notifications an
ON CONFLICT (id) DO NOTHING;

-- Log migration count
DO $$
BEGIN
  RAISE NOTICE 'Migrated admin notifications: % rows', (
    SELECT COUNT(*) FROM unified_notifications WHERE recipient_type = 'admin'
  );
END $$;

-- =====================================================
-- Step 3: Create Views for Backward Compatibility
-- =====================================================

-- Create view for customer_notifications (backward compatibility)
CREATE OR REPLACE VIEW customer_notifications_view AS
SELECT
  id,
  recipient_id AS user_id,
  type AS notification_type,
  title,
  message,
  related_id->>'order_id'::UUID AS order_id,
  related_id->>'quotation_id'::UUID AS quotation_id,
  related_id->>'shipment_id'::UUID AS shipment_id,
  action_url,
  action_label,
  is_read,
  read_at,
  channels->>'email'::BOOLEAN AS sent_via_email,
  channels->>'sms'::BOOLEAN AS sent_via_sms,
  expires_at,
  created_at
FROM unified_notifications
WHERE recipient_type = 'member';

-- Create view for admin_notifications (backward compatibility)
CREATE OR REPLACE VIEW admin_notifications_view AS
SELECT
  id,
  recipient_id AS user_id,
  type,
  title,
  message,
  related_id,
  related_type,
  priority,
  metadata,
  is_read,
  read_at,
  action_url,
  action_label,
  expires_at,
  created_at
FROM unified_notifications
WHERE recipient_type = 'admin';

-- =====================================================
-- Step 4: Create Triggers to Sync Old Tables
-- =====================================================

-- Trigger function to sync new customer_notifications to unified_notifications
CREATE OR REPLACE FUNCTION sync_customer_notification_to_unified()
RETURNS TRIGGER AS $$
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
    is_read,
    read_at,
    action_url,
    action_label,
    expires_at,
    created_at
  )
  VALUES (
    NEW.user_id,
    'member',
    NEW.notification_type,
    NEW.title,
    NEW.message,
    COALESCE(NEW.order_id, NEW.quotation_id, NEW.shipment_id),
    CASE
      WHEN NEW.order_id IS NOT NULL THEN 'orders'
      WHEN NEW.quotation_id IS NOT NULL THEN 'quotations'
      WHEN NEW.shipment_id IS NOT NULL THEN 'shipments'
      ELSE NULL
    END,
    'normal',
    '{}'::JSONB,
    jsonb_build_object(
      'email', NEW.sent_via_email,
      'sms', NEW.sent_via_sms
    ),
    NEW.is_read,
    NEW.read_at,
    NEW.action_url,
    NEW.action_label,
    NEW.expires_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    is_read = EXCLUDED.is_read,
    read_at = EXCLUDED.read_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to sync new admin_notifications to unified_notifications
CREATE OR REPLACE FUNCTION sync_admin_notification_to_unified()
RETURNS TRIGGER AS $$
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
    is_read,
    read_at,
    action_url,
    action_label,
    expires_at,
    created_at
  )
  VALUES (
    COALESCE(NEW.user_id, (SELECT id FROM profiles WHERE role = 'ADMIN' ORDER BY created_at LIMIT 1)),
    'admin',
    NEW.type,
    NEW.title,
    NEW.message,
    NEW.related_id,
    NEW.related_type,
    NEW.priority,
    COALESCE(NEW.metadata, '{}'::JSONB),
    '{}'::JSONB,
    NEW.is_read,
    NEW.read_at,
    NEW.action_url,
    NEW.action_label,
    NEW.expires_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    is_read = EXCLUDED.is_read,
    read_at = EXCLUDED.read_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (disabled by default, enable when ready for full sync)
-- DROP TRIGGER IF EXISTS sync_customer_notification_insert ON customer_notifications;
-- CREATE TRIGGER sync_customer_notification_insert
--   AFTER INSERT ON customer_notifications
--   FOR EACH ROW
--   EXECUTE FUNCTION sync_customer_notification_to_unified();

-- DROP TRIGGER IF EXISTS sync_admin_notification_insert ON admin_notifications;
-- CREATE TRIGGER sync_admin_notification_insert
--   AFTER INSERT ON admin_notifications
--   FOR EACH ROW
--   EXECUTE FUNCTION sync_admin_notification_to_unified();

-- =====================================================
-- Step 5: Validation Queries
-- =====================================================

-- Verify migration
DO $$
DECLARE
  customer_count INT;
  admin_count INT;
  total_count INT;
BEGIN
  SELECT COUNT(*) INTO customer_count
  FROM unified_notifications
  WHERE recipient_type = 'member';

  SELECT COUNT(*) INTO admin_count
  FROM unified_notifications
  WHERE recipient_type = 'admin';

  total_count := customer_count + admin_count;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Migration Summary';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Member notifications migrated: %', customer_count;
  RAISE NOTICE 'Admin notifications migrated: %', admin_count;
  RAISE NOTICE 'Total notifications: %', total_count;
  RAISE NOTICE '====================================';
END $$;

-- Check for any data inconsistencies
DO $$
DECLARE
  orphaned_count INT;
BEGIN
  -- Check for notifications with non-existent recipients
  SELECT COUNT(*) INTO orphaned_count
  FROM unified_notifications un
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = un.recipient_id
  );

  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % notifications with non-existent recipients', orphaned_count;
  ELSE
    RAISE NOTICE 'No orphaned notifications found';
  END IF;
END $$;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON MIGRATION IS 'Migrate customer_notifications and admin_notifications to unified_notifications table';

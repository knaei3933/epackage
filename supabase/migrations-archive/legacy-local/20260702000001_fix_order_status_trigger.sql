-- ============================================================
-- Fix: order status update trigger referencing non-existent table
-- 修正: 注文ステータス更新トリガーが存在しないテーブルを参照している問題
-- ============================================================
-- Problem: The live trigger function `log_order_status_change()` inserted into
-- `order_status_logs` (non-existent), causing ALL order status UPDATEs to fail:
--   ERROR: relation "order_status_logs" does not exist (42P01)
--
-- Root cause: Old trigger function used `order_status_logs` + `CURRENT_USER`.
-- The actual table is `order_status_history` with columns:
--   order_id, from_status(TEXT), to_status(TEXT), changed_by(TEXT), reason(TEXT)
--
-- Also: `orders.status` is an enum (b2b_order_status), so it must be cast to
-- TEXT before inserting into from_status/to_status. OLD.status can be NULL on
-- first insert, handled by the IS DISTINCT FROM guard.
--
-- Also removed duplicate trigger `log_order_status_change_trigger`.

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_at, reason)
    VALUES (
      NEW.id,
      OLD.status::text,
      NEW.status::text,
      NEW.user_id::text,
      NOW(),
      'Status auto-logged by trigger'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old duplicate trigger
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;

-- Re-attach canonical trigger
DROP TRIGGER IF EXISTS orders_status_change_log ON orders;
CREATE TRIGGER orders_status_change_log
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Verify
COMMENT ON FUNCTION log_order_status_change() IS
  'Logs status changes to order_status_history. Fixed 2026-07-02: was referencing non-existent order_status_logs table and duplicate trigger removed.';

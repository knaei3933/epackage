-- ============================================================
-- Enable Order Status History Trigger
-- 주문 스테이터스 변경 시 자동으로 이력 기록 트리거 활성화
-- Migration: 20260202000001_enable_order_status_history_trigger
-- ============================================================

-- 트리거 활성화: orders 테이블에서 status가 변경되면 자동으로 기록
DROP TRIGGER IF EXISTS orders_status_change_log ON orders;

CREATE TRIGGER orders_status_change_log
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ============================================================
-- 기존 주문들에 대해 초기 스테이터스 이력 생성 (backfill)
-- ============================================================

-- 기존 주문들의 현재 스테이터스를 이력으로 기록
-- 주문 생성일을 기준으로 과거 시점에 기록
INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_at, reason)
SELECT
  o.id AS order_id,
  NULL AS from_status,
  o.status AS to_status,
  o.user_id AS changed_by,
  o.created_at AS changed_at,
  'Initial status (backfilled)' AS reason
FROM orders o
WHERE NOT EXISTS (
  -- 이미 이력이 있는 주문은 제외
  SELECT 1 FROM order_status_history osh WHERE osh.order_id = o.id
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 검증 쿼리
-- ============================================================

-- 생성된 이력 수 확인
-- SELECT COUNT(*) FROM order_status_history;

-- 특정 주문의 이력 확인
-- SELECT * FROM order_status_history WHERE order_id = '06eb05e8-f205-4771-a13e-ba746dacaab4' ORDER BY changed_at;

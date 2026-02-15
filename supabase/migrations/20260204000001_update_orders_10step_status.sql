-- ============================================================
-- Ordersテーブルの10段階ワークフロー対応
-- Migration: 20260204000001_update_orders_10step_status
-- ============================================================

-- 新しい10段階ワークフロー用のステータスENUMを作成
CREATE TYPE order_status_10step AS ENUM (
  'QUOTATION_PENDING',         -- 1. 견적 승인 대기
  'QUOTATION_APPROVED',        -- 2. 견적 승인
  'DATA_UPLOAD_PENDING',       -- 3. 데이터 입고 대기
  'DATA_UPLOADED',             -- 4. 데이터 입고 완료
  'CORRECTION_IN_PROGRESS',    -- 5. 교정 작업중
  'CORRECTION_COMPLETED',      -- 6. 교정 완료
  'CUSTOMER_APPROVAL_PENDING', -- 7. 고객 승인 대기
  'PRODUCTION',                -- 8. 제조중
  'READY_TO_SHIP',             -- 9. 출하 예정
  'SHIPPED',                   -- 10. 출하 완료
  'CANCELLED'                  -- 취소
);

-- =====================================================
-- ordersテーブルのstatusカラムを新しいENUM型に変更
-- =====================================================

-- 1. 既存のステータス値を新しい10段階ワークフローにマッピング
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_10step order_status_10step;

-- 既存データのマイグレーション（レガシーステータスから10段階ワークフローへ）
UPDATE orders
SET status_10step = CASE status
  -- 新しい10段階ステータス（既に存在する場合）
  WHEN 'QUOTATION_PENDING' THEN 'QUOTATION_PENDING'::order_status_10step
  WHEN 'QUOTATION_APPROVED' THEN 'QUOTATION_APPROVED'::order_status_10step
  WHEN 'DATA_UPLOAD_PENDING' THEN 'DATA_UPLOAD_PENDING'::order_status_10step
  WHEN 'DATA_UPLOADED' THEN 'DATA_UPLOADED'::order_status_10step
  WHEN 'CORRECTION_IN_PROGRESS' THEN 'CORRECTION_IN_PROGRESS'::order_status_10step
  WHEN 'CORRECTION_COMPLETED' THEN 'CORRECTION_COMPLETED'::order_status_10step
  WHEN 'CUSTOMER_APPROVAL_PENDING' THEN 'CUSTOMER_APPROVAL_PENDING'::order_status_10step
  WHEN 'READY_TO_SHIP' THEN 'READY_TO_SHIP'::order_status_10step
  WHEN 'SHIPPED' THEN 'SHIPPED'::order_status_10step
  WHEN 'CANCELLED' THEN 'CANCELLED'::order_status_10step
  -- レガシーステータスからのマッピング
  WHEN 'PENDING' THEN 'QUOTATION_PENDING'::order_status_10step
  WHEN 'QUOTATION' THEN 'QUOTATION_APPROVED'::order_status_10step
  WHEN 'DATA_RECEIVED' THEN 'DATA_UPLOADED'::order_status_10step
  WHEN 'WORK_ORDER' THEN 'DATA_UPLOADED'::order_status_10step
  WHEN 'CONTRACT_SENT' THEN 'DATA_UPLOAD_PENDING'::order_status_10step
  WHEN 'CONTRACT_SIGNED' THEN 'DATA_UPLOAD_PENDING'::order_status_10step
  WHEN 'PRODUCTION' THEN 'PRODUCTION'::order_status_10step
  WHEN 'STOCK_IN' THEN 'READY_TO_SHIP'::order_status_10step
  WHEN 'DELIVERED' THEN 'SHIPPED'::order_status_10step
  -- デフォルト
  ELSE 'QUOTATION_PENDING'::order_status_10step
END;

-- 2. 古いstatusカラムを削除し、新しいカラムに置き換え
ALTER TABLE orders DROP COLUMN IF EXISTS status;
ALTER TABLE orders RENAME COLUMN status_10step TO status;

-- 3. NOT NULL制約を追加
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;

-- 4. デフォルト値を設定
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'QUOTATION_PENDING';

-- =====================================================
-- quotationsテーブルのstatusカラムも更新
-- =====================================================

-- 見積用のステータスENUM
CREATE TYPE quotation_status_10step AS ENUM (
  'QUOTATION_PENDING',
  'QUOTATION_APPROVED',
  'REJECTED',
  'EXPIRED',
  'CONVERTED'
);

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS status_10step quotation_status_10step;

-- 既存データのマイグレーション
UPDATE quotations
SET status_10step = CASE UPPER(status)
  WHEN 'DRAFT' THEN 'QUOTATION_PENDING'::quotation_status_10step
  WHEN 'SENT' THEN 'QUOTATION_PENDING'::quotation_status_10step
  WHEN 'PENDING' THEN 'QUOTATION_PENDING'::quotation_status_10step
  WHEN 'APPROVED' THEN 'QUOTATION_APPROVED'::quotation_status_10step
  WHEN 'REJECTED' THEN 'REJECTED'::quotation_status_10step
  WHEN 'EXPIRED' THEN 'EXPIRED'::quotation_status_10step
  WHEN 'CONVERTED' THEN 'CONVERTED'::quotation_status_10step
  ELSE 'QUOTATION_PENDING'::quotation_status_10step
END;

ALTER TABLE quotations DROP COLUMN IF EXISTS status;
ALTER TABLE quotations RENAME COLUMN status_10step TO status;
ALTER TABLE quotations ALTER COLUMN status SET NOT NULL;
ALTER TABLE quotations ALTER COLUMN status SET DEFAULT 'QUOTATION_PENDING';

-- =====================================================
-- order_status_historyテーブルの更新
-- =====================================================

-- history用のステータスタイプ（すべてのステータスを含む）
CREATE TYPE order_history_status AS ENUM (
  'QUOTATION_PENDING',
  'QUOTATION_APPROVED',
  'DATA_UPLOAD_PENDING',
  'DATA_UPLOADED',
  'CORRECTION_IN_PROGRESS',
  'CORRECTION_COMPLETED',
  'CUSTOMER_APPROVAL_PENDING',
  'PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED',
  'CONVERTED'
);

-- old_statusカラムの更新
ALTER TABLE order_status_history ALTER COLUMN old_status TYPE order_history_status
  USING CASE
    WHEN old_status IS NULL THEN NULL
    WHEN old_status = 'PENDING' THEN 'QUOTATION_PENDING'::order_history_status
    WHEN old_status = 'QUOTATION' THEN 'QUOTATION_APPROVED'::order_history_status
    WHEN old_status = 'DATA_RECEIVED' THEN 'DATA_UPLOADED'::order_history_status
    WHEN old_status = 'WORK_ORDER' THEN 'DATA_UPLOADED'::order_history_status
    WHEN old_status = 'CONTRACT_SENT' THEN 'DATA_UPLOAD_PENDING'::order_history_status
    WHEN old_status = 'CONTRACT_SIGNED' THEN 'DATA_UPLOAD_PENDING'::order_history_status
    WHEN old_status = 'STOCK_IN' THEN 'READY_TO_SHIP'::order_history_status
    WHEN old_status = 'DELIVERED' THEN 'SHIPPED'::order_history_status
    ELSE old_status::order_history_status
  END;

-- new_statusカラムの更新
ALTER TABLE order_status_history ALTER COLUMN new_status TYPE order_history_status
  USING CASE
    WHEN new_status = 'PENDING' THEN 'QUOTATION_PENDING'::order_history_status
    WHEN new_status = 'QUOTATION' THEN 'QUOTATION_APPROVED'::order_history_status
    WHEN new_status = 'DATA_RECEIVED' THEN 'DATA_UPLOADED'::order_history_status
    WHEN new_status = 'WORK_ORDER' THEN 'DATA_UPLOADED'::order_history_status
    WHEN new_status = 'CONTRACT_SENT' THEN 'DATA_UPLOAD_PENDING'::order_history_status
    WHEN new_status = 'CONTRACT_SIGNED' THEN 'DATA_UPLOAD_PENDING'::order_history_status
    WHEN new_status = 'STOCK_IN' THEN 'READY_TO_SHIP'::order_history_status
    WHEN new_status = 'DELIVERED' THEN 'SHIPPED'::order_history_status
    ELSE new_status::order_history_status
  END;

-- =====================================================
-- 不要なENUM型の削除（オプション）
-- =====================================================

-- DO $$
-- BEGIN
--   DROP TYPE IF EXISTS b2b_order_status CASCADE;
--   RAISE NOTICE 'Dropped legacy b2b_order_status enum';
-- END $$;
-- =====================================================

-- 移行完了メッセージ
DO $$
BEGIN
  RAISE NOTICE 'Ordersテーブルが10段階ワークフローに正常に更新されました。';
  RAISE NOTICE '新しいステータス値:';
  RAISE NOTICE '  1. QUOTATION_PENDING - 견적 승인 대기';
  RAISE NOTICE '  2. QUOTATION_APPROVED - 견적 승인';
  RAISE NOTICE '  3. DATA_UPLOAD_PENDING - 데이터 입고 대기';
  RAISE NOTICE '  4. DATA_UPLOADED - 데이터 입고 완료';
  RAISE NOTICE '  5. CORRECTION_IN_PROGRESS - 교정 작업중';
  RAISE NOTICE '  6. CORRECTION_COMPLETED - 교정 완료';
  RAISE NOTICE '  7. CUSTOMER_APPROVAL_PENDING - 고객 승인 대기';
  RAISE NOTICE '  8. PRODUCTION - 제조중';
  RAISE NOTICE '  9. READY_TO_SHIP - 출하 예정';
  RAISE NOTICE '  10. SHIPPED - 출하 완료';
  RAISE NOTICE '  + CANCELLED - 취소';
END $$;

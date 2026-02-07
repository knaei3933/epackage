-- ============================================================
-- 10段階ワークフロー自動状態遷移システム
-- Migration: 20260204000000_add_10step_workflow_transitions
-- ============================================================

-- 10段階ワークフロー:
-- 1. QUOTATION_PENDING - 견적 승인 대기
-- 2. QUOTATION_APPROVED - 견적 승인
-- 3. DATA_UPLOAD_PENDING - 데이터 입고 대기
-- 4. DATA_UPLOADED - 데이터 입고 완료
-- 5. CORRECTION_IN_PROGRESS - 교정 작업중
-- 6. CORRECTION_COMPLETED - 교정 완료
-- 7. CUSTOMER_APPROVAL_PENDING - 고객 승인 대기
-- 8. PRODUCTION - 제조중
-- 9. READY_TO_SHIP - 출하 예정
-- 10. SHIPPED - 출하 완료

-- ============================================================
-- 1. 出荷作成時の自動遷移: PRODUCTION → READY_TO_SHIP
-- ============================================================

CREATE OR REPLACE FUNCTION auto_ready_to_ship_on_shipment_create()
RETURNS TRIGGER AS $$
BEGIN
  -- 出荷レコード作成時、注文ステータスをREADY_TO_SHIPに変更
  UPDATE orders
  SET status = 'READY_TO_SHIP',
      production_status = 'ready_to_ship',
      updated_at = NOW()
  WHERE id = NEW.order_id
    AND status = 'PRODUCTION';

  -- 履歴記録
  INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
  SELECT NEW.order_id, 'PRODUCTION', 'READY_TO_SHIP', 'SYSTEM', NOW()
  WHERE EXISTS (
    SELECT 1 FROM orders
    WHERE id = NEW.order_id AND status = 'PRODUCTION'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_shipment_create_ready_to_ship ON shipments;
CREATE TRIGGER trigger_shipment_create_ready_to_ship
AFTER INSERT ON shipments
FOR EACH ROW
EXECUTE FUNCTION auto_ready_to_ship_on_shipment_create();

-- ============================================================
-- 2. 配送開始時の自動遷移: READY_TO_SHIP → SHIPPED
-- ============================================================

CREATE OR REPLACE FUNCTION auto_shipped_on_tracking_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 配送ステータスが 'picked_up' または 'in_transit' に変更された場合
  IF (NEW.status = 'picked_up' OR NEW.status = 'in_transit') AND
     (OLD.status IS NULL OR OLD.status NOT IN ('picked_up', 'in_transit')) THEN

    -- 出荷に関連する注文を取得
    DECLARE
      v_order_id UUID;
      v_order_status VARCHAR(50);
    BEGIN
      SELECT order_id INTO v_order_id
      FROM shipments
      WHERE id = NEW.shipment_id;

      IF v_order_id IS NOT NULL THEN
        -- 現在の注文ステータスを確認
        SELECT status INTO v_order_status
        FROM orders
        WHERE id = v_order_id;

        -- READY_TO_SHIP から SHIPPED に変更
        IF v_order_status = 'READY_TO_SHIP' THEN
          UPDATE orders
          SET status = 'SHIPPED',
              shipped_at = NOW(),
              updated_at = NOW()
          WHERE id = v_order_id;

          -- 履歴記録
          INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
          VALUES (v_order_id, 'READY_TO_SHIP', 'SHIPPED', 'SYSTEM', NOW());
        END IF;
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tracking_update_shipped ON shipment_tracking_events;
CREATE TRIGGER trigger_tracking_update_shipped
AFTER INSERT ON shipment_tracking_events
FOR EACH ROW
EXECUTE FUNCTION auto_shipped_on_tracking_update();

-- ============================================================
-- 3. 既存の自動遷移トリガーの更新（10段階ワークフロー対応）
-- ============================================================

-- ファイルアップロード完了 → DATA_UPLOADED → CORRECTION_IN_PROGRESS
-- 注: これはAPIレベルで実装済み（src/app/api/member/orders/[id]/data-receipt/route.ts）

-- 教正完了 → CUSTOMER_APPROVAL_PENDING
-- 注: これはAPIレベルで実装済み（src/app/api/admin/orders/[id]/correction/route.ts）

-- 顧客承認 → PRODUCTION
-- 注: これはAPIレベルで実装済み（src/app/api/member/orders/[id]/spec-approval/route.ts）

-- ============================================================
-- 4. 注文ステータス履歴の自動記録トリガー（更新版）
-- ============================================================

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- ステータスが変更された場合のみ履歴を記録
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.updated_by, 'SYSTEM'),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_status_change_log ON orders;
CREATE TRIGGER orders_status_change_log
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- ============================================================
-- 5. 10段階ワークフロー検証関数
-- ============================================================

CREATE OR REPLACE FUNCTION validate_10step_transition(
  p_order_id UUID,
  p_new_status VARCHAR(50)
) RETURNS TABLE (
  is_valid BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_current_status VARCHAR(50);
BEGIN
  -- 現在のステータスを取得
  SELECT status INTO v_current_status
  FROM orders
  WHERE id = p_order_id;

  -- 有効な遷移ルール
  IF v_current_status = 'QUOTATION_PENDING' AND p_new_status = 'QUOTATION_APPROVED' THEN
    RETURN QUERY SELECT true, 'Valid transition: QUOTATION_PENDING → QUOTATION_APPROVED';
  ELSIF v_current_status = 'QUOTATION_APPROVED' AND p_new_status = 'DATA_UPLOAD_PENDING' THEN
    RETURN QUERY SELECT true, 'Valid transition: QUOTATION_APPROVED → DATA_UPLOAD_PENDING';
  ELSIF v_current_status = 'DATA_UPLOAD_PENDING' AND p_new_status = 'DATA_UPLOADED' THEN
    RETURN QUERY SELECT true, 'Valid transition: DATA_UPLOAD_PENDING → DATA_UPLOADED';
  ELSIF v_current_status = 'DATA_UPLOADED' AND p_new_status = 'CORRECTION_IN_PROGRESS' THEN
    RETURN QUERY SELECT true, 'Valid transition: DATA_UPLOADED → CORRECTION_IN_PROGRESS (auto)';
  ELSIF v_current_status = 'CORRECTION_IN_PROGRESS' AND p_new_status = 'CORRECTION_COMPLETED' THEN
    RETURN QUERY SELECT true, 'Valid transition: CORRECTION_IN_PROGRESS → CORRECTION_COMPLETED';
  ELSIF v_current_status = 'CORRECTION_COMPLETED' AND p_new_status = 'CUSTOMER_APPROVAL_PENDING' THEN
    RETURN QUERY SELECT true, 'Valid transition: CORRECTION_COMPLETED → CUSTOMER_APPROVAL_PENDING (auto)';
  ELSIF v_current_status = 'CUSTOMER_APPROVAL_PENDING' AND p_new_status = 'PRODUCTION' THEN
    RETURN QUERY SELECT true, 'Valid transition: CUSTOMER_APPROVAL_PENDING → PRODUCTION';
  ELSIF v_current_status = 'PRODUCTION' AND p_new_status = 'READY_TO_SHIP' THEN
    RETURN QUERY SELECT true, 'Valid transition: PRODUCTION → READY_TO_SHIP (auto on shipment create)';
  ELSIF v_current_status = 'READY_TO_SHIP' AND p_new_status = 'SHIPPED' THEN
    RETURN QUERY SELECT true, 'Valid transition: READY_TO_SHIP → SHIPPED (auto on tracking update)';
  ELSIF p_new_status = 'CANCELLED' THEN
    RETURN QUERY SELECT true, 'Valid transition: Any status → CANCELLED';
  ELSE
    RETURN QUERY SELECT false, 'Invalid transition: ' || v_current_status || ' → ' || p_new_status;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 移行完了メッセージ
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '10段階ワークフロー自動状態遷移システムが正常にインストールされました。';
  RAISE NOTICE '有効な自動遷移:';
  RAISE NOTICE '  - 出荷作成: PRODUCTION → READY_TO_SHIP';
  RAISE NOTICE '  - 配送開始: READY_TO_SHIP → SHIPPED';
  RAISE NOTICE '  - ファイルアップロード: DATA_UPLOADED → CORRECTION_IN_PROGRESS (API)';
  RAISE NOTICE '  - 教正完了: CORRECTION_COMPLETED → CUSTOMER_APPROVAL_PENDING (API)';
  RAISE NOTICE '  - 顧客承認: CUSTOMER_APPROVAL_PENDING → PRODUCTION (API)';
END $$;

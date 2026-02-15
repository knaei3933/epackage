-- ============================================================
-- 自動ステータス転換システム (Automatic Status Transition System)
-- Migration: 20260202000000_add_auto_status_transitions
-- ============================================================

-- 1. ファイルアップロード完了 → DATA_RECEIVED
-- order_files テーブルにファイル追加時に自動転換
CREATE OR REPLACE FUNCTION auto_update_status_on_file_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- すべての必須ファイルがアップロードされたか確認
  IF EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = NEW.order_id
    AND o.status = 'QUOTATION'
    AND (
      -- 必須ファイル条件（注文により異なる）
      -- 基本的に3つ以上のファイルがアップロードされた場合に自動転送
      SELECT COUNT(*) >= 3 FROM order_files WHERE order_id = NEW.order_id
    )
  ) THEN
    UPDATE orders
    SET status = 'DATA_RECEIVED',
        updated_at = NOW()
    WHERE id = NEW.order_id;

    -- 履歴記録
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
    VALUES (NEW.order_id, 'QUOTATION', 'DATA_RECEIVED', 'SYSTEM', NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_file_upload_status ON order_files;
CREATE TRIGGER trigger_file_upload_status
AFTER INSERT ON order_files
FOR EACH ROW
EXECUTE FUNCTION auto_update_status_on_file_upload();

-- 2. 最終検査完了 → STOCK_IN
-- production_orders テーブルの final_inspection = true
CREATE OR REPLACE FUNCTION auto_update_status_on_final_inspection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.final_inspection = true AND OLD.final_inspection = false THEN
    -- 注文ステータスをSTOCK_INに変更
    UPDATE orders
    SET status = 'STOCK_IN',
        updated_at = NOW()
    WHERE id = NEW.order_id;

    -- 履歴記録
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
    VALUES (
      NEW.order_id,
      'PRODUCTION',
      'STOCK_IN',
      'SYSTEM',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_final_inspection_status ON production_orders;
CREATE TRIGGER trigger_final_inspection_status
AFTER UPDATE OF final_inspection ON production_orders
FOR EACH ROW
EXECUTE FUNCTION auto_update_status_on_final_inspection();

-- 3. 契約署名完了 → PRODUCTION (Webhook処理)
-- signature_webhooks テーブルでwebhook受信時
-- 注意: この機能はsignature_webhooksテーブルが存在する場合のみ有効
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'signature_webhooks') THEN
    CREATE OR REPLACE FUNCTION auto_start_production_on_signature()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.event_type = 'signature_completed' AND NEW.processed = false THEN
        -- 該当注文をPRODUCTIONステータスに変更
        UPDATE orders
        SET status = 'PRODUCTION',
            updated_at = NOW()
        WHERE id = NEW.order_id;

        -- 履歴記録
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
        VALUES (
          NEW.order_id,
          'CONTRACT_SIGNED',
          'PRODUCTION',
          'SYSTEM',
          NOW()
        );

        -- webhook処理完了表示
        UPDATE signature_webhooks
        SET processed = true
        WHERE id = NEW.id;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_signature_webhook_status ON signature_webhooks;
    CREATE TRIGGER trigger_signature_webhook_status
    AFTER INSERT ON signature_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION auto_start_production_on_signature();
  END IF;
END $$;

-- 4. 入庫処理確認 → STOCK_IN
-- stock_in_requests テーブル承認時
-- 注意: この機能はstock_in_requestsテーブルが存在する場合のみ有効
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_in_requests') THEN
    CREATE OR REPLACE FUNCTION auto_update_status_on_stock_in()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        UPDATE orders
        SET status = 'STOCK_IN',
            updated_at = NOW()
        WHERE id = NEW.order_id;

        -- 履歴記録
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
        VALUES (
          NEW.order_id,
          (SELECT status FROM orders WHERE id = NEW.order_id),
          'STOCK_IN',
          'SYSTEM',
          NOW()
        );
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_stock_in_status ON stock_in_requests;
    CREATE TRIGGER trigger_stock_in_status
    AFTER UPDATE OF status ON stock_in_requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_status_on_stock_in();
  END IF;
END $$;

-- ============================================================
-- トラッキング用ヘルパー関数
-- ============================================================

-- ステータス転送履歴を取得する関数
CREATE OR REPLACE FUNCTION get_status_transition_history(order_id UUID)
RETURNS TABLE (
  changed_at TIMESTAMPTZ,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by VARCHAR(100),
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    osh.changed_at,
    osh.old_status,
    osh.new_status,
    osh.changed_by,
    osh.notes
  FROM order_status_history osh
  WHERE osh.order_id = get_status_transition_history.order_id
    AND osh.changed_by = 'SYSTEM'  -- 自動転送のみ
  ORDER BY osh.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 移行完了メッセージ
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '自動ステータス転換システムが正常にインストールされました。';
  RAISE NOTICE '有効なトリガー:';
  RAISE NOTICE '  - ファイルアップロード完了 → DATA_RECEIVED';
  RAISE NOTICE '  - 最終検査完了 → STOCK_IN';
  RAISE NOTICE '  - 契約署名完了 → PRODUCTION (signature_webhooksがある場合)';
  RAISE NOTICE '  - 入庫承認 → STOCK_IN (stock_in_requestsがある場合)';
END $$;

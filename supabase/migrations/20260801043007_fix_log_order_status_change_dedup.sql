-- Bug4: order_status_history の二重記録防止
-- 現状: API明示INSERT + DBトリガー(orders_status_change_log) の両方が走り、
-- 1遷移で2レコード生成されていた（実機検証: 明示INSERT の1秒後にトリガー記録が追記）。
-- 改良: 同一注文で同じ from→to 遷移が過去10秒以内に既に記録済みの場合は
-- トリガー記録をスキップする。API明示INSERT（changed_by=実際の操作者/SYSTEM・
-- reason=具体値）を優先。API明示INSERT が無い経路（bulk-status等）は
-- トリガーがフォールバックとして記録し網羅性を維持する。
-- 10秒ウィンドウは実データの「明示INSERT→トリガー発火」遅延（約1秒）を十分カバー。
-- 同一 from→to のみ対象なので、連続する別遷移（PRODUCTION→READY_TO_SHIP 等）は影響しない。
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT EXISTS (
      SELECT 1 FROM order_status_history
      WHERE order_id = NEW.id
        AND from_status IS NOT DISTINCT FROM OLD.status::text
        AND to_status IS NOT DISTINCT FROM NEW.status::text
        AND changed_at > NOW() - INTERVAL '10 seconds'
    ) THEN
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
  END IF;
  RETURN NEW;
END;
$function$;;

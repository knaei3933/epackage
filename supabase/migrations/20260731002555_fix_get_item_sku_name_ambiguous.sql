CREATE OR REPLACE FUNCTION public.get_item_sku_name(item_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_sku_name TEXT;
BEGIN
  -- 変数名とカラム名の衝突を回避するため v_sku_name にリネーム + テーブルエイリアス修飾
  SELECT oi.sku_name INTO v_sku_name
  FROM order_items oi
  WHERE oi.id = item_id;

  RETURN v_sku_name;
END;
$function$;;

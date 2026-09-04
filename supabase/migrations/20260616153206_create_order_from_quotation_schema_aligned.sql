-- =====================================================
-- RPC Function: create_order_from_quotation (Task #20 revision)
-- Schema-aligned with production orders/order_items and the
-- proven customer-facing convert route initial values.
-- =====================================================
CREATE OR REPLACE FUNCTION create_order_from_quotation(
  p_quotation_id UUID,
  p_user_id UUID,
  p_order_number VARCHAR(50)
)
RETURNS TABLE (
  success BOOLEAN,
  order_id UUID,
  order_number VARCHAR(50),
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_quotation RECORD;
  v_existing_order_id UUID;
  v_new_order_id UUID;
  v_order_number VARCHAR(50);
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_status_upper TEXT;
BEGIN
  success := false;
  order_id := NULL;
  order_number := NULL;
  error_message := NULL;

  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = p_quotation_id;

  IF NOT FOUND THEN
    error_message := '見積が見つかりません。';
    RETURN NEXT;
    RETURN;
  END IF;

  -- UPPER-normalize: accept 'approved'/'APPROVED'/'QUOTATION_APPROVED'
  v_status_upper := UPPER(v_quotation.status::text);
  IF v_status_upper NOT IN ('APPROVED', 'QUOTATION_APPROVED') THEN
    error_message := '承認済みの見積のみ注文に変換できます。';
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT id INTO v_existing_order_id
  FROM orders
  WHERE quotation_id = p_quotation_id
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    success := true;
    order_id := v_existing_order_id;
    order_number := (SELECT order_number FROM orders WHERE id = v_existing_order_id);
    error_message := '既に注文が作成された見積です。';
    RETURN NEXT;
    RETURN;
  END IF;

  IF p_order_number IS NULL OR p_order_number = '' THEN
    v_order_number := 'ORD-' || v_year || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSE
    v_order_number := p_order_number;
  END IF;

  BEGIN
    INSERT INTO orders (
      user_id,
      quotation_id,
      order_number,
      status,
      current_stage,
      total_amount,
      customer_name,
      customer_email,
      skip_contract,
      created_at
    ) VALUES (
      v_quotation.user_id,
      p_quotation_id,
      v_order_number,
      'DATA_UPLOAD_PENDING',
      'AWAITING_DATA',
      v_quotation.total_amount,
      v_quotation.customer_name,
      v_quotation.customer_email,
      true,
      NOW()
    )
    RETURNING id INTO v_new_order_id;

    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      total_price,
      specifications
    )
    SELECT
      v_new_order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      total_price,
      specifications
    FROM quotation_items
    WHERE quotation_id = p_quotation_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION '見積アイテムが見つかりません（見積ID: %）', p_quotation_id;
    END IF;

    UPDATE quotations
    SET status = 'converted',
        updated_at = NOW()
    WHERE id = p_quotation_id;

    INSERT INTO order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      reason,
      changed_at
    ) VALUES (
      v_new_order_id,
      NULL,
      'DATA_UPLOAD_PENDING',
      p_user_id::text,
      '注文作成（見積から変換・初期ステータス）',
      NOW()
    );

    success := true;
    order_id := v_new_order_id;
    order_number := v_order_number;

  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      order_id := NULL;
      order_number := NULL;
      error_message := SQLERRM;
      RAISE WARNING 'create_order_from_quotation failed for quotation %: %',
                    p_quotation_id, SQLERRM;
      RETURN NEXT;
      RETURN;
  END;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION create_order_from_quotation TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_from_quotation TO service_role;

CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);;

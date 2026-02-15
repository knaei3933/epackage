-- =====================================================
-- Migration: Transaction-Safe Order Creation
-- Purpose: Replace manual rollback with proper ACID transaction
-- Created: 2024-12-30
-- =====================================================
-- This function creates an order from an approved quotation
-- with proper transaction handling (BEGIN/COMMIT/ROLLBACK)
--
-- Operations wrapped in transaction:
-- 1. Create order record
-- 2. Create order items (from quotation items)
-- 3. Update quotation status to CONVERTED
-- 4. Create order status history entry
--
-- If any operation fails, the entire transaction is rolled back.

-- =====================================================
-- RPC Function: create_order_from_quotation
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
BEGIN
  -- Start with default values
  success := false;
  order_id := NULL;
  order_number := NULL;
  error_message := NULL;

  -- =====================================================
  -- Validation Phase (outside transaction)
  -- =====================================================

  -- Check if quotation exists and is approved
  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = p_quotation_id;

  IF NOT FOUND THEN
    error_message := '견적을 찾을 수 없습니다.';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_quotation.status != 'APPROVED' THEN
    error_message := '승인된 견적만 주문으로 전환할 수 있습니다.';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check if order already exists for this quotation
  SELECT id INTO v_existing_order_id
  FROM orders
  WHERE quotation_id = p_quotation_id
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    success := true;  -- Order already exists, not an error
    order_id := v_existing_order_id;
    order_number := (SELECT order_number FROM orders WHERE id = v_existing_order_id);
    error_message := '이미 주문이 생성된 견적입니다.';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Generate order number if not provided
  IF p_order_number IS NULL OR p_order_number = '' THEN
    v_order_number := 'ORD-' || v_year || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSE
    v_order_number := p_order_number;
  END IF;

  -- =====================================================
  -- Transaction Phase
  -- =====================================================
  -- All operations from here are atomic - all succeed or all fail

  BEGIN
    -- 1. Create order record
    INSERT INTO orders (
      user_id,
      company_id,
      quotation_id,
      order_number,
      status,
      current_state,
      total_amount,
      customer_name,
      customer_email,
      created_at
    ) VALUES (
      v_quotation.user_id,
      v_quotation.company_id,
      p_quotation_id,
      v_order_number,
      'QUOTATION',
      'quotation_approved',
      v_quotation.total_amount,
      v_quotation.customer_name,
      v_quotation.customer_email,
      NOW()
    )
    RETURNING id INTO v_new_order_id;

    -- 2. Create order items from quotation items
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_code,
      category,
      quantity,
      unit_price,
      specifications,
      notes
    )
    SELECT
      v_new_order_id,
      product_id,
      product_name,
      product_code,
      category,
      quantity,
      unit_price,
      specifications,
      notes
    FROM quotation_items
    WHERE quotation_id = p_quotation_id;

    -- Validate that at least one order item was created
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No quotation items found for quotation %', p_quotation_id;
    END IF;

    -- 3. Update quotation status to CONVERTED
    UPDATE quotations
    SET status = 'CONVERTED',
        updated_at = NOW()
    WHERE id = p_quotation_id;

    -- 4. Create order status history entry
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
      'QUOTATION',
      p_user_id,
      '주문 생성 (견적에서 전환)',
      NOW()
    );

    -- Commit implicit - PostgreSQL auto-commits on successful completion

    -- Set return values
    success := true;
    order_id := v_new_order_id;
    order_number := v_order_number;

  EXCEPTION
    WHEN OTHERS THEN
      -- ROLLBACK is automatic in PostgreSQL when exception is raised
      success := false;
      order_id := NULL;
      order_number := NULL;
      error_message := SQLERRM;

      -- Log error for debugging
      RAISE WARNING 'create_order_from_quotation failed for quotation %: %',
                    p_quotation_id, SQLERRM;

      RETURN NEXT;
      RETURN;
  END;

  -- Return success result
  RETURN NEXT;

END;
$$;

-- =====================================================
-- Security: Grant Execute Permission
-- =====================================================
GRANT EXECUTE ON FUNCTION create_order_from_quotation TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_from_quotation TO service_role;

-- =====================================================
-- Indexes for Performance
-- =====================================================
-- Add index for quotation_id lookup in orders
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders(quotation_id);

-- Add index for order_number lookup
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- =====================================================
-- Helper Function: Validate Order Integrity
-- =====================================================
CREATE OR REPLACE FUNCTION validate_order_integrity(p_order_id UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  issues TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_items_count INTEGER;
  v_quotation_items_count INTEGER;
  v_order_exists BOOLEAN;
  v_issues TEXT[] := '{}';
BEGIN
  -- Check if order exists
  SELECT EXISTS(
    SELECT 1 FROM orders WHERE id = p_order_id
  ) INTO v_order_exists;

  IF NOT v_order_exists THEN
    v_issues := array_append(v_issues, 'Order does not exist');
    is_valid := false;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check order items count
  SELECT COUNT(*) INTO v_order_items_count
  FROM order_items
  WHERE order_id = p_order_id;

  -- Check corresponding quotation items count
  SELECT COUNT(*) INTO v_quotation_items_count
  FROM quotation_items
  WHERE quotation_id = (
    SELECT quotation_id FROM orders WHERE id = p_order_id
  );

  IF v_order_items_count != v_quotation_items_count THEN
    v_issues := array_append(v_issues,
      'Order items count (' || v_order_items_count ||
      ') does not match quotation items count (' || v_quotation_items_count || ')');
  END IF;

  -- Check if quotation status is CONVERTED
  IF EXISTS (
    SELECT 1 FROM orders o
    JOIN quotations q ON o.quotation_id = q.id
    WHERE o.id = p_order_id AND q.status != 'CONVERTED'
  ) THEN
    v_issues := array_append(v_issues, 'Quotation status is not CONVERTED');
  END IF;

  -- Check if status history exists
  IF NOT EXISTS (
    SELECT 1 FROM order_status_history
    WHERE order_id = p_order_id
  ) THEN
    v_issues := array_append(v_issues, 'No status history found');
  END IF;

  -- Set validity
  is_valid := array_length(v_issues, 1) IS NULL;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_order_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION validate_order_integrity TO service_role;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Transaction-safe order creation';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - create_order_from_quotation()';
  RAISE NOTICE '  - validate_order_integrity()';
END $$;

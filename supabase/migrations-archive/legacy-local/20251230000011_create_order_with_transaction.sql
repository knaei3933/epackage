-- =====================================================
-- Migration: Transaction-Safe Order Creation
-- Purpose: Replace manual rollback with proper ACID transaction
-- Created: 2024-12-30
-- Revised: 2026-06-17 (Task #20)
-- =====================================================
-- This function creates an order from an approved quotation
-- with proper transaction handling (BEGIN/COMMIT/ROLLBACK)
--
-- Operations wrapped in transaction:
-- 1. Create order record
-- 2. Create order items (from quotation items)
-- 3. Update quotation status to 'converted'
-- 4. Create order status history entry
--
-- If any operation fails, the entire transaction is rolled back.
--
-- =====================================================
-- Task #20 Revision (2026-06-17) — schema alignment + bug fixes
-- =====================================================
-- Previous version referenced non-existent columns and never matched
-- the actual production schema, so the function was never applied
-- (confirmed absent from pg_proc) and every admin/operator order
-- creation RPC failed.
--
-- This revision aligns the function with:
--   (a) The real production schema (orders / order_items columns)
--   (b) The working customer-facing convert flow at
--       src/app/api/member/quotations/[id]/convert/route.ts,
--       which is the proven source of truth for initial order values:
--         status        = 'DATA_UPLOAD_PENDING'
--         current_stage = 'AWAITING_DATA'
--         skip_contract = true
--         to_status     = 'DATA_UPLOAD_PENDING' (history)
--         quotation     = 'converted' (lowercase)
--
-- Schema fixes:
--   - orders.company_id     : removed (column does not exist on orders)
--   - orders.current_state  : removed (actual column is current_stage)
--   - order_items.product_code / category / notes : removed (non-existent)
--   - order_items.total_price : added explicitly (NOT NULL, sourced from
--     quotation_items.total_price to avoid constraint violation)
--   - order_status_history.changed_by : p_user_id::text (column is text)
--   - status approval check : UPPER-normalized + QUOTATION_APPROVED to
--     match the convert route (approved/APPROVED/QUOTATION_APPROVED)
--   - check ordering : existing-order check moved BEFORE approval check,
--     mirroring the convert route (idempotent for already-converted rows)
--   - ambiguous column fix : table aliases (o / qi) disambiguate the
--     RETURNS TABLE output column `order_number` from orders.order_number
--     in the existing-order lookup subquery (prevents SQLSTATE 42702)
--
-- Error messages localized to Japanese to match the caller
-- (src/app/api/member/orders/route.ts), which string-matches
-- '既に注文が作成' and '見つかりません'.
--
-- NOTE: validate_order_integrity() from the original migration was removed.
-- It was never applied to production and had the same schema drift.
-- It can be re-introduced separately once re-aligned.

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
  v_status_upper TEXT;
BEGIN
  -- Start with default values
  success := false;
  order_id := NULL;
  order_number := NULL;
  error_message := NULL;

  -- =====================================================
  -- Validation Phase (outside transaction)
  -- =====================================================

  -- Check if quotation exists
  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = p_quotation_id;

  IF NOT FOUND THEN
    error_message := '見積が見つかりません。';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Existing-order check FIRST (idempotent for already-converted quotations,
  -- matches the convert route ordering). Returns the existing order regardless
  -- of current quotation status. Alias `o` avoids ambiguity between the
  -- RETURNS TABLE output column `order_number` and orders.order_number.
  SELECT o.id INTO v_existing_order_id
  FROM orders o
  WHERE o.quotation_id = p_quotation_id
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    success := true;  -- Order already exists, not an error
    order_id := v_existing_order_id;
    order_number := (SELECT o.order_number FROM orders o WHERE o.id = v_existing_order_id);
    error_message := '既に注文が作成された見積です。';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Approval check (only reached when no order exists yet).
  -- UPPER-normalize to accept both legacy lowercase ('approved') and
  -- uppercase ('APPROVED'), plus the new-workflow value ('QUOTATION_APPROVED').
  -- This mirrors the customer-facing convert route approval check and
  -- avoids blocking the mixed-case rows tracked in Task #9.
  v_status_upper := UPPER(v_quotation.status::text);
  IF v_status_upper NOT IN ('APPROVED', 'QUOTATION_APPROVED') THEN
    error_message := '承認済みの見積のみ注文に変換できます。';
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
    --    Schema-aligned: company_id / current_state removed;
    --    initial values match the proven convert route.
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

    -- 2. Create order items from quotation items
    --    product_code / category / notes removed (non-existent on order_items);
    --    total_price added explicitly (NOT NULL) sourced from quotation_items.
    --    Alias `qi` keeps column references unambiguous.
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
      qi.product_id,
      qi.product_name,
      qi.quantity,
      qi.unit_price,
      qi.total_price,
      qi.specifications
    FROM quotation_items qi
    WHERE qi.quotation_id = p_quotation_id;

    -- Validate that at least one order item was created
    IF NOT FOUND THEN
      RAISE EXCEPTION '見積アイテムが見つかりません（見積ID: %）', p_quotation_id;
    END IF;

    -- 3. Update quotation status to 'converted' (lowercase, matching convert route)
    UPDATE quotations
    SET status = 'converted',
        updated_at = NOW()
    WHERE id = p_quotation_id;

    -- 4. Create order status history entry
    --    changed_by is a text column; cast the UUID argument.
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
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Transaction-safe order creation (Task #20 schema-aligned revision)';
  RAISE NOTICE 'Function created:';
  RAISE NOTICE '  - create_order_from_quotation()';
END $$;

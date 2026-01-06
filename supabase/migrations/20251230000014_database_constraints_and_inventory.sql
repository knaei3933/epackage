-- =====================================================
-- Migration: Database Constraints and Inventory Management
-- Purpose: Add constraints for data integrity and inventory management
-- Created: 2024-12-30
-- =====================================================
-- This migration adds:
-- 1. Inventory management RPC function (create_order_with_inventory)
-- 2. Check constraints for data integrity
-- 3. Unique constraints
-- 4. Version fields for optimistic locking
-- 5. Data consistency check functions

-- =====================================================
-- 1. Add Version Fields for Optimistic Locking
-- =====================================================

-- Add version field to products table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'version'
  ) THEN
    ALTER TABLE products ADD COLUMN version INTEGER DEFAULT 1 NOT NULL;
    RAISE NOTICE 'Added version column to products table';
  END IF;
END $$;

-- Add version field to orders table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'version'
  ) THEN
    ALTER TABLE orders ADD COLUMN version INTEGER DEFAULT 1 NOT NULL;
    RAISE NOTICE 'Added version column to orders table';
  END IF;
END $$;

-- =====================================================
-- 2. Add Check Constraints
-- =====================================================

-- Ensure stock_quantity is never negative (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_stock_nonnegative'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT check_stock_nonnegative
      CHECK (stock_quantity >= 0);
    RAISE NOTICE 'Added check_stock_nonnegative constraint to products table';
  END IF;
END $$;

-- Ensure order totals are non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_order_total_nonnegative'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT check_order_total_nonnegative
      CHECK (total_amount >= 0);
    RAISE NOTICE 'Added check_order_total_nonnegative constraint to orders table';
  END IF;
END $$;

-- Ensure item quantities are positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_order_item_quantity_positive'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT check_order_item_quantity_positive
      CHECK (quantity > 0);
    RAISE NOTICE 'Added check_order_item_quantity_positive constraint to order_items table';
  END IF;
END $$;

-- =====================================================
-- 3. Add Unique Constraints
-- =====================================================

-- Ensure order numbers are unique (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_order_number'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT unique_order_number
      UNIQUE (order_number);
    RAISE NOTICE 'Added unique_order_number constraint to orders table';
  END IF;
END $$;

-- =====================================================
-- 4. Create Indexes for Performance
-- =====================================================

-- Index on products stock_quantity for inventory queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Index on products version for optimistic locking
CREATE INDEX IF NOT EXISTS idx_products_version ON products(version);

-- Index on orders version for optimistic locking
CREATE INDEX IF NOT EXISTS idx_orders_version ON orders(version);

-- =====================================================
-- 5. RPC Function: Create Order with Inventory Check
-- =====================================================
CREATE OR REPLACE FUNCTION create_order_with_inventory(
  p_quotation_id UUID,
  p_user_id UUID,
  p_order_number VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  order_id UUID,
  order_number VARCHAR(50),
  stock_updated BOOLEAN,
  error_message TEXT,
  insufficient_stock JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_quotation RECORD;
  v_existing_order_id UUID;
  v_new_order_id UUID;
  v_order_number VARCHAR(50);
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_stock_insufficient JSONB := '[]'::jsonb;
  v_product_needs_stock RECORD;
  v_current_stock INTEGER;
BEGIN
  -- Initialize return values
  success := false;
  order_id := NULL;
  order_number := NULL;
  stock_updated := false;
  error_message := NULL;
  insufficient_stock := '[]'::jsonb;

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

  -- Check if order already exists
  SELECT id INTO v_existing_order_id
  FROM orders
  WHERE quotation_id = p_quotation_id
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    success := true;
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
  -- Inventory Check Phase (before transaction)
  -- =====================================================

  -- Check stock availability for all items
  FOR v_product_needs_stock IN
    SELECT
      product_id,
      product_name,
      SUM(quantity) AS total_quantity
    FROM quotation_items
    WHERE quotation_id = p_quotation_id
    GROUP BY product_id, product_name
  LOOP
    -- Get current stock
    SELECT stock_quantity INTO v_current_stock
    FROM products
    WHERE id = v_product_needs_stock.product_id;

    IF v_current_stock IS NULL THEN
      -- Product doesn't exist, skip stock check
      CONTINUE;
    END IF;

    IF v_current_stock < v_product_needs_stock.total_quantity THEN
      -- Insufficient stock
      v_stock_insufficient := jsonb_set(
        v_stock_insufficient,
        ARRAY_LENGTH(v_stock_insufficient::text[], 1)::text,
        jsonb_build_object(
          'product_id', v_product_needs_stock.product_id,
          'product_name', v_product_needs_stock.product_name,
          'requested', v_product_needs_stock.total_quantity,
          'available', v_current_stock,
          'shortage', v_product_needs_stock.total_quantity - v_current_stock
        )
      );
    END IF;
  END LOOP;

  -- If stock is insufficient, return error with details
  IF jsonb_array_length(v_stock_insufficient) > 0 THEN
    error_message := '재고가 부족합니다.';
    insufficient_stock := v_stock_insufficient;
    RETURN NEXT;
    RETURN;
  END IF;

  -- =====================================================
  -- Transaction Phase
  -- =====================================================

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
      version,
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
      1,
      NOW()
    )
    RETURNING id INTO v_new_order_id;

    IF v_new_order_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create order';
    END IF;

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

    -- 5. Update product stock (optional, based on business rules)
    -- Note: This is typically done after order confirmation, not at order creation
    -- Uncomment if you want to reserve stock at order creation:
    /*
    UPDATE products p
    SET stock_quantity = stock_quantity - qi.total_quantity,
        version = version + 1,
        updated_at = NOW()
    FROM (
      SELECT product_id, SUM(quantity) AS total_quantity
      FROM quotation_items
      WHERE quotation_id = p_quotation_id
      GROUP BY product_id
    ) qi
    WHERE p.id = qi.product_id;
    */

    -- Commit implicit - PostgreSQL auto-commits on successful completion

    -- Set return values
    success := true;
    order_id := v_new_order_id;
    order_number := v_order_number;
    stock_updated := false;  -- Set to true if stock is reserved

  EXCEPTION
    WHEN OTHERS THEN
      -- ROLLBACK is automatic in PostgreSQL when exception is raised
      success := false;
      order_id := NULL;
      order_number := NULL;
      stock_updated := false;
      error_message := SQLERRM;

      -- Log error for debugging
      RAISE WARNING 'create_order_with_inventory failed for quotation %: %',
                    p_quotation_id, SQLERRM;

      insufficient_stock := '[]'::jsonb;
      RETURN NEXT;
      RETURN;
  END;

  -- Return success result
  RETURN NEXT;

END;
$$;

-- =====================================================
-- 6. Data Consistency Check Functions
-- =====================================================

-- Check order items consistency
CREATE OR REPLACE FUNCTION check_order_items_consistency()
RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR(50),
  items_count INTEGER,
  total_value NUMERIC,
  issues TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.order_number,
    COUNT(oi.id) AS items_count,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_value,
    CASE
      WHEN COUNT(oi.id) = 0 THEN ARRAY['No order items found']::TEXT[]
      WHEN COUNT(oi.id) != (SELECT COUNT(*) FROM quotation_items WHERE quotation_id = o.quotation_id)
        THEN ARRAY['Order items count does not match quotation items count']::TEXT[]
      ELSE NULL::TEXT[]
    END AS issues
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.id, o.order_number
  HAVING COUNT(oi.id) = 0 OR COUNT(oi.id) != (SELECT COUNT(*) FROM quotation_items WHERE quotation_id = o.quotation_id);
END;
$$;

-- Check products with negative stock (should be prevented by constraint)
CREATE OR REPLACE FUNCTION check_products_negative_stock()
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  stock_quantity INTEGER,
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    id AS product_id,
    name AS product_name,
    stock_quantity,
    'Negative stock detected'::TEXT AS issue
  FROM products
  WHERE stock_quantity < 0
  ORDER BY stock_quantity ASC;
END;
$$;

-- Check order integrity
CREATE OR REPLACE FUNCTION check_order_integrity(p_order_id UUID DEFAULT NULL)
RETURNS TABLE (
  is_valid BOOLEAN,
  issues TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order RECORD;
  v_items_count INTEGER;
  v_quotation_items_count INTEGER;
  v_issues TEXT[] := '{}';
BEGIN
  -- If specific order_id provided, check that order
  IF p_order_id IS NOT NULL THEN
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
      v_issues := array_append(v_issues, 'Order does not exist');
      is_valid := false;
      RETURN NEXT;
      RETURN;
    END IF;

    -- Check order items count matches quotation items count
    SELECT COUNT(*) INTO v_items_count
    FROM order_items
    WHERE order_id = p_order_id;

    SELECT COUNT(*) INTO v_quotation_items_count
    FROM quotation_items
    WHERE quotation_id = v_order.quotation_id;

    IF v_items_count != v_quotation_items_count THEN
      v_issues := array_append(v_issues,
        'Order items count (' || v_items_count ||
        ') does not match quotation items count (' || v_quotation_items_count || ')');
    END IF;
  ELSE
    -- Check all orders for consistency issues
    FOR v_order IN
      SELECT id FROM orders
    LOOP
      SELECT COUNT(*) INTO v_items_count
      FROM order_items
      WHERE order_id = v_order.id;

      SELECT COUNT(*) INTO v_quotation_items_count
      FROM quotation_items
      WHERE quotation_id = v_order.quotation_id;

      IF v_items_count != v_quotation_items_count THEN
        v_issues := array_append(v_issues,
          'Order ' || v_order.order_number ||
          ': items count mismatch (' || v_items_count ||
          ' vs ' || v_quotation_items_count || ')');
      END IF;
    END LOOP;
  END IF;

  -- Check for negative stock products
  IF EXISTS (SELECT 1 FROM products WHERE stock_quantity < 0) THEN
    v_issues := array_append(v_issues, 'Products with negative stock detected');
  END IF;

  -- Set validity
  is_valid := array_length(v_issues, 1) IS NULL;

  RETURN NEXT;
END;
$$;

-- =====================================================
-- 7. Security and Permissions
-- =====================================================

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_order_with_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_with_inventory TO service_role;

GRANT EXECUTE ON FUNCTION check_order_items_consistency TO authenticated;
GRANT EXECUTE ON FUNCTION check_order_items_consistency TO service_role;
GRANT EXECUTE ON FUNCTION check_order_items_consistency TO anon;

GRANT EXECUTE ON FUNCTION check_products_negative_stock TO authenticated;
GRANT EXECUTE ON FUNCTION check_products_negative_stock TO service_role;
GRANT EXECUTE ON FUNCTION check_products_negative_stock TO anon;

GRANT EXECUTE ON FUNCTION check_order_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION check_order_integrity TO service_role;
GRANT EXECUTE ON FUNCTION check_order_integrity TO anon;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Database constraints and inventory management';
  RAISE NOTICE 'Constraints added:';
  RAISE NOTICE '  - check_stock_nonnegative (products.stock_quantity >= 0)';
  RAISE NOTICE '  - check_order_total_nonnegative (orders.total_amount >= 0)';
  RAISE NOTICE '  - check_order_item_quantity_positive (order_items.quantity > 0)';
  RAISE NOTICE '  - unique_order_number (orders.order_number)';
  RAISE NOTICE 'Version columns added:';
  RAISE NOTICE '  - products.version';
  RAISE NOTICE '  - orders.version';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - create_order_with_inventory()';
  RAISE NOTICE '  - check_order_items_consistency()';
  RAISE NOTICE '  - check_products_negative_stock()';
  RAISE NOTICE '  - check_order_integrity()';
END $$;

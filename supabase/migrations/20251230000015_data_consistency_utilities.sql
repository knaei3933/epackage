-- =====================================================
-- Migration: Data Consistency Check Utilities
-- Purpose: Add orphaned records check and utility wrapper
-- Created: 2024-12-30
-- =====================================================
-- This migration adds:
-- 1. check_orphaned_records() - Detect orphaned records across tables
-- 2. validateDataConsistency() - Utility wrapper for all consistency checks
-- 3. Additional consistency checks for referential integrity

-- =====================================================
-- 1. Orphaned Records Check Functions
-- =====================================================

-- Check for orphaned order_items (no matching order)
CREATE OR REPLACE FUNCTION check_orphaned_order_items()
RETURNS TABLE (
  order_item_id UUID,
  order_id UUID,
  product_name VARCHAR(255),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.id AS order_item_id,
    oi.order_id,
    oi.product_name,
    'Order item references non-existent order'::TEXT AS issue
  FROM order_items oi
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = oi.order_id
  );
END;
$$;

-- Check for orphaned order_items (no matching product, if product_id is set)
CREATE OR REPLACE FUNCTION check_orphaned_order_items_products()
RETURNS TABLE (
  order_item_id UUID,
  product_id UUID,
  product_name VARCHAR(255),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.id AS order_item_id,
    oi.product_id,
    oi.product_name,
    'Order item references non-existent product'::TEXT AS issue
  FROM order_items oi
  WHERE oi.product_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM products p WHERE p.id = oi.product_id
    );
END;
$$;

-- Check for orphaned quotation_items (no matching quotation)
CREATE OR REPLACE FUNCTION check_orphaned_quotation_items()
RETURNS TABLE (
  quotation_item_id UUID,
  quotation_id UUID,
  product_name VARCHAR(255),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qi.id AS quotation_item_id,
    qi.quotation_id,
    qi.product_name,
    'Quotation item references non-existent quotation'::TEXT AS issue
  FROM quotation_items qi
  WHERE NOT EXISTS (
    SELECT 1 FROM quotations q WHERE q.id = qi.quotation_id
  );
END;
$$;

-- Check for orphaned sample_items (no matching sample_request)
CREATE OR REPLACE FUNCTION check_orphaned_sample_items()
RETURNS TABLE (
  sample_item_id UUID,
  sample_request_id UUID,
  product_name VARCHAR(255),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id AS sample_item_id,
    si.sample_request_id,
    si.product_name,
    'Sample item references non-existent sample request'::TEXT AS issue
  FROM sample_items si
  WHERE NOT EXISTS (
    SELECT 1 FROM sample_requests sr WHERE sr.id = si.sample_request_id
  );
END;
$$;

-- Check for orphaned orders (no matching quotation, if quotation_id is set)
CREATE OR REPLACE FUNCTION check_orphaned_orders_quotation()
RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR(50),
  quotation_id UUID,
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.order_number,
    o.quotation_id,
    'Order references non-existent quotation'::TEXT AS issue
  FROM orders o
  WHERE o.quotation_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM quotations q WHERE q.id = o.quotation_id
    );
END;
$$;

-- Check for orphaned order_status_history (no matching order)
CREATE OR REPLACE FUNCTION check_orphaned_order_status_history()
RETURNS TABLE (
  history_id UUID,
  order_id UUID,
  from_status VARCHAR(50),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    osh.id AS history_id,
    osh.order_id,
    osh.from_status,
    'Status history references non-existent order'::TEXT AS issue
  FROM order_status_history osh
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = osh.order_id
  );
END;
$$;

-- Check for orphaned contracts (no matching order)
CREATE OR REPLACE FUNCTION check_orphaned_contracts()
RETURNS TABLE (
  contract_id UUID,
  order_id UUID,
  contract_status VARCHAR(50),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS contract_id,
    c.order_id,
    c.status AS contract_status,
    'Contract references non-existent order'::TEXT AS issue
  FROM contracts c
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = c.order_id
  );
END;
$$;

-- Check for orphaned signatures (no matching contract)
CREATE OR REPLACE FUNCTION check_orphaned_signatures()
RETURNS TABLE (
  signature_id UUID,
  contract_id UUID,
  signer_type VARCHAR(20),
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS signature_id,
    s.contract_id,
    s.signer_type,
    'Signature references non-existent contract'::TEXT AS issue
  FROM contract_signatures s
  WHERE NOT EXISTS (
    SELECT 1 FROM contracts c WHERE c.id = s.contract_id
  );
END;
$$;

-- =====================================================
-- 2. Master Orphaned Records Check Function
-- =====================================================

CREATE OR REPLACE FUNCTION check_orphaned_records()
RETURNS TABLE (
  table_name TEXT,
  record_id UUID,
  parent_id UUID,
  issue TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check orphaned order_items (no matching order)
  RETURN QUERY
  SELECT
    'order_items'::TEXT AS table_name,
    oi.id AS record_id,
    oi.order_id AS parent_id,
    'Order item references non-existent order'::TEXT AS issue
  FROM order_items oi
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = oi.order_id
  )

  UNION ALL

  -- Check orphaned order_items (no matching product)
  SELECT
    'order_items'::TEXT,
    oi.id AS record_id,
    oi.product_id AS parent_id,
    'Order item references non-existent product'::TEXT
  FROM order_items oi
  WHERE oi.product_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM products p WHERE p.id = oi.product_id
    )

  UNION ALL

  -- Check orphaned quotation_items
  SELECT
    'quotation_items'::TEXT,
    qi.id AS record_id,
    qi.quotation_id AS parent_id,
    'Quotation item references non-existent quotation'::TEXT
  FROM quotation_items qi
  WHERE NOT EXISTS (
    SELECT 1 FROM quotations q WHERE q.id = qi.quotation_id
  )

  UNION ALL

  -- Check orphaned sample_items
  SELECT
    'sample_items'::TEXT,
    si.id AS record_id,
    si.sample_request_id AS parent_id,
    'Sample item references non-existent sample request'::TEXT
  FROM sample_items si
  WHERE NOT EXISTS (
    SELECT 1 FROM sample_requests sr WHERE sr.id = si.sample_request_id
  )

  UNION ALL

  -- Check orphaned orders (quotation reference)
  SELECT
    'orders'::TEXT,
    o.id AS record_id,
    o.quotation_id AS parent_id,
    'Order references non-existent quotation'::TEXT
  FROM orders o
  WHERE o.quotation_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM quotations q WHERE q.id = o.quotation_id
    )

  UNION ALL

  -- Check orphaned order_status_history
  SELECT
    'order_status_history'::TEXT,
    osh.id AS record_id,
    osh.order_id AS parent_id,
    'Status history references non-existent order'::TEXT
  FROM order_status_history osh
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = osh.order_id
  )

  UNION ALL

  -- Check orphaned contracts
  SELECT
    'contracts'::TEXT,
    c.id AS record_id,
    c.order_id AS parent_id,
    'Contract references non-existent order'::TEXT
  FROM contracts c
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = c.order_id
  )

  UNION ALL

  -- Check orphaned signatures
  SELECT
    'contract_signatures'::TEXT,
    s.id AS record_id,
    s.contract_id AS parent_id,
    'Signature references non-existent contract'::TEXT
  FROM contract_signatures s
  WHERE NOT EXISTS (
    SELECT 1 FROM contracts c WHERE c.id = s.contract_id
  );
END;
$$;

-- =====================================================
-- 3. Utility Wrapper: validateDataConsistency
-- =====================================================

CREATE OR REPLACE FUNCTION validateDataConsistency(
  p_check_type VARCHAR(50) DEFAULT 'all'
)
RETURNS TABLE (
  check_name TEXT,
  is_valid BOOLEAN,
  issues_found INTEGER,
  details JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_check_type VARCHAR(50);
BEGIN
  v_check_type := LOWER(p_check_type);

  -- All checks
  IF v_check_type = 'all' THEN
    -- 1. Order items consistency
    RETURN QUERY
    SELECT
      'order_items_consistency'::TEXT AS check_name,
      CASE WHEN COUNT(*) = 0 THEN true ELSE false END AS is_valid,
      COUNT(*) AS issues_found,
      jsonb_agg(
        jsonb_build_object(
          'order_id', order_id,
          'order_number', order_number,
          'items_count', items_count,
          'total_value', total_value,
          'issues', issues
        )
      ) AS details
    FROM check_order_items_consistency()

    UNION ALL

    -- 2. Products negative stock
    SELECT
      'products_negative_stock'::TEXT,
      CASE WHEN COUNT(*) = 0 THEN true ELSE false END,
      COUNT(*),
      jsonb_agg(
        jsonb_build_object(
          'product_id', product_id,
          'product_name', product_name,
          'stock_quantity', stock_quantity,
          'issue', issue
        )
      )
    FROM check_products_negative_stock()

    UNION ALL

    -- 3. Orphaned records
    SELECT
      'orphaned_records'::TEXT,
      CASE WHEN COUNT(*) = 0 THEN true ELSE false END,
      COUNT(*),
      jsonb_agg(
        jsonb_build_object(
          'table_name', table_name,
          'record_id', record_id,
          'parent_id', parent_id,
          'issue', issue
        )
      )
    FROM check_orphaned_records();

  -- Specific checks
  ELSIF v_check_type = 'order_items' THEN
    RETURN QUERY
    SELECT
      'order_items_consistency'::TEXT,
      CASE WHEN COUNT(*) = 0 THEN true ELSE false END,
      COUNT(*),
      jsonb_agg(
        jsonb_build_object(
          'order_id', order_id,
          'order_number', order_number,
          'items_count', items_count,
          'total_value', total_value,
          'issues', issues
        )
      )
    FROM check_order_items_consistency();

  ELSIF v_check_type = 'negative_stock' THEN
    RETURN QUERY
    SELECT
      'products_negative_stock'::TEXT,
      CASE WHEN COUNT(*) = 0 THEN true ELSE false END,
      COUNT(*),
      jsonb_agg(
        jsonb_build_object(
          'product_id', product_id,
          'product_name', product_name,
          'stock_quantity', stock_quantity,
          'issue', issue
        )
      )
    FROM check_products_negative_stock();

  ELSIF v_check_type = 'orphaned_records' THEN
    RETURN QUERY
    SELECT
      'orphaned_records'::TEXT,
      CASE WHEN COUNT(*) = 0 THEN true ELSE false END,
      COUNT(*),
      jsonb_agg(
        jsonb_build_object(
          'table_name', table_name,
          'record_id', record_id,
          'parent_id', parent_id,
          'issue', issue
        )
      )
    FROM check_orphaned_records();

  ELSE
    -- Invalid check type
    RAISE EXCEPTION 'Invalid check_type: %. Valid values are: all, order_items, negative_stock, orphaned_records', v_check_type;
  END IF;
END;
$$;

-- =====================================================
-- 4. Grant Permissions
-- =====================================================

-- Grant execute on orphaned record check functions
GRANT EXECUTE ON FUNCTION check_orphaned_order_items TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_order_items TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_order_items TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_order_items_products TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_order_items_products TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_order_items_products TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_quotation_items TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_quotation_items TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_quotation_items TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_sample_items TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_sample_items TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_sample_items TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_orders_quotation TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_orders_quotation TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_orders_quotation TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_order_status_history TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_order_status_history TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_order_status_history TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_contracts TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_contracts TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_contracts TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_signatures TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_signatures TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_signatures TO anon;

GRANT EXECUTE ON FUNCTION check_orphaned_records TO authenticated;
GRANT EXECUTE ON FUNCTION check_orphaned_records TO service_role;
GRANT EXECUTE ON FUNCTION check_orphaned_records TO anon;

-- Grant execute on utility wrapper
GRANT EXECUTE ON FUNCTION validateDataConsistency TO authenticated;
GRANT EXECUTE ON FUNCTION validateDataConsistency TO service_role;
GRANT EXECUTE ON FUNCTION validateDataConsistency TO anon;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Data consistency check utilities';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - check_orphaned_order_items()';
  RAISE NOTICE '  - check_orphaned_order_items_products()';
  RAISE NOTICE '  - check_orphaned_quotation_items()';
  RAISE NOTICE '  - check_orphaned_sample_items()';
  RAISE NOTICE '  - check_orphaned_orders_quotation()';
  RAISE NOTICE '  - check_orphaned_order_status_history()';
  RAISE NOTICE '  - check_orphaned_contracts()';
  RAISE NOTICE '  - check_orphaned_signatures()';
  RAISE NOTICE '  - check_orphaned_records() (master function)';
  RAISE NOTICE '  - validateDataConsistency() (utility wrapper)';
END $$;

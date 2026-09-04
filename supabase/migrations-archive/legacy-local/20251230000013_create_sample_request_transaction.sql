-- =====================================================
-- Migration: Transaction-Safe Sample Request Creation
-- Purpose: Replace manual rollback with proper ACID transaction
-- Created: 2024-12-30
-- =====================================================
-- This function handles sample request creation with proper transaction handling
--
-- Operations wrapped in transaction:
-- 1. Create sample_requests record
-- 2. Create sample_items records (1-5 items)
-- 3. Generate unique request number
--
-- If any operation fails, the entire transaction is rolled back.

-- =====================================================
-- RPC Function: create_sample_request_transaction
-- =====================================================
CREATE OR REPLACE FUNCTION create_sample_request_transaction(
  p_user_id UUID DEFAULT NULL,
  p_request_number VARCHAR(50) DEFAULT NULL,
  p_notes TEXT,
  p_sample_items JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  sample_request_id UUID,
  request_number VARCHAR(50),
  items_created INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_request_id UUID;
  v_final_request_number VARCHAR(50);
  v_items_count INTEGER;
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Initialize return values
  success := false;
  sample_request_id := NULL;
  request_number := NULL;
  items_created := 0;
  error_message := NULL;

  -- Validate sample_items JSONB array
  IF p_sample_items IS NULL OR jsonb_array_length(p_sample_items) = 0 THEN
    error_message := '少なくとも1つのサンプルを選択してください';
    RETURN NEXT;
    RETURN;
  END IF;

  IF jsonb_array_length(p_sample_items) > 5 THEN
    error_message := 'サンプルは最大5点までです';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Generate request number if not provided
  IF p_request_number IS NULL OR p_request_number = '' THEN
    v_final_request_number := 'SMP-' || TO_TIMESTAMP(NOW())::TEXT || '-' || UPPER(SUBSTR(ENCODE(GEN_RANDOM_BYTES(2), 'HEX'), 1, 4));
  ELSE
    v_final_request_number := p_request_number;
  END IF;

  -- =====================================================
  -- Transaction Phase
  -- =====================================================

  BEGIN
    -- 1. Create sample request record
    INSERT INTO sample_requests (
      user_id,
      request_number,
      status,
      delivery_address_id,
      tracking_number,
      notes,
      shipped_at,
      created_at
    ) VALUES (
      p_user_id,
      v_final_request_number,
      'received',
      NULL,
      NULL,
      p_notes,
      NULL,
      NOW()
    )
    RETURNING id INTO v_new_request_id;

    IF v_new_request_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create sample request';
    END IF;

    -- 2. Create sample items (bulk insert)
    INSERT INTO sample_items (
      sample_request_id,
      product_id,
      product_name,
      category,
      quantity
    )
    SELECT
      v_new_request_id,
      (item->>'productId')::UUID,
      item->>'productName',
      COALESCE(item->>'productCategory', 'other'),
      (item->>'quantity')::INTEGER
    FROM jsonb_array_elements(p_sample_items) AS item;

    -- Get count of inserted items
    SELECT COUNT(*) INTO v_items_count
    FROM sample_items
    WHERE sample_request_id = v_new_request_id;

    IF v_items_count = 0 THEN
      RAISE EXCEPTION 'No sample items were created';
    END IF;

    -- Commit implicit - PostgreSQL auto-commits on successful completion

    -- Set return values
    success := true;
    sample_request_id := v_new_request_id;
    request_number := v_final_request_number;
    items_created := v_items_count;

  EXCEPTION
    WHEN OTHERS THEN
      -- ROLLBACK is automatic in PostgreSQL when exception is raised
      success := false;
      sample_request_id := NULL;
      request_number := NULL;
      items_created := 0;
      error_message := SQLERRM;

      -- Log error for debugging
      RAISE WARNING 'create_sample_request_transaction failed: %', SQLERRM;

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
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO service_role;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO anon;

-- =====================================================
-- Helper Function: Validate Sample Request Integrity
-- =====================================================
CREATE OR REPLACE FUNCTION validate_sample_request_integrity(p_sample_request_id UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  issues TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_request_exists BOOLEAN;
  v_items_count INTEGER;
  v_issues TEXT[] := '{}';
BEGIN
  -- Check if sample request exists
  SELECT EXISTS(
    SELECT 1 FROM sample_requests WHERE id = p_sample_request_id
  ) INTO v_request_exists;

  IF NOT v_request_exists THEN
    v_issues := array_append(v_issues, 'Sample request does not exist');
    is_valid := false;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check if sample request has items
  SELECT COUNT(*) INTO v_items_count
  FROM sample_items
  WHERE sample_request_id = p_sample_request_id;

  IF v_items_count = 0 THEN
    v_issues := array_append(v_issues, 'No sample items found for request');
  END IF;

  IF v_items_count > 5 THEN
    v_issues := array_append(v_issues, 'More than 5 sample items found');
  END IF;

  -- Check request number format
  IF NOT EXISTS (
    SELECT 1 FROM sample_requests
    WHERE id = p_sample_request_id
    AND request_number ~ '^SMP-'
  ) THEN
    v_issues := array_append(v_issues, 'Invalid request number format');
  END IF;

  -- Check status is valid
  IF NOT EXISTS (
    SELECT 1 FROM sample_requests
    WHERE id = p_sample_request_id
    AND status IN ('received', 'processing', 'shipped', 'completed', 'cancelled')
  ) THEN
    v_issues := array_append(v_issues, 'Invalid status');
  END IF;

  -- Set validity
  is_valid := array_length(v_issues, 1) IS NULL;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_sample_request_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION validate_sample_request_integrity TO service_role;
GRANT EXECUTE ON FUNCTION validate_sample_request_integrity TO anon;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Transaction-safe sample request creation';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - create_sample_request_transaction()';
  RAISE NOTICE '  - validate_sample_request_integrity()';
END $$;

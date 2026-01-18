-- =====================================================
-- Migration: Fix RPC Function Schema Issue
-- Purpose: Add SET search_path = public to RPC function
-- Created: 2025-01-12
-- =====================================================
-- Fixes: relation "sample_requests" does not exist error
-- Cause: RPC function was created without explicit schema
-- Solution: Add SET search_path = public to function definition
-- =====================================================

-- Drop old function
DROP FUNCTION IF EXISTS create_sample_request_transaction CASCADE;

-- Create new function with SET search_path = public
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
SET search_path = public  -- <-- FIX: Explicitly set search_path
AS $$
DECLARE
  v_new_request_id UUID;
  v_final_request_number VARCHAR(50);
  v_items_count INTEGER;
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

  -- Transaction Phase
  BEGIN
    -- 1. Create sample request record (public schema implied by search_path)
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

    -- 2. Create sample items
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

    -- Set return values
    success := true;
    sample_request_id := v_new_request_id;
    request_number := v_final_request_number;
    items_created := v_items_count;

  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      sample_request_id := NULL;
      request_number := NULL;
      items_created := 0;
      error_message := SQLERRM;
      RAISE WARNING 'create_sample_request_transaction failed: %', SQLERRM;
      RETURN NEXT;
      RETURN;
  END;

  RETURN NEXT;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO service_role;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO anon;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Fixed RPC function schema issue';
  RAISE NOTICE 'Function create_sample_request_transaction now uses SET search_path = public';
END $$;

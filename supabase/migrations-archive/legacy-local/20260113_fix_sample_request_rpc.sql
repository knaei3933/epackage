-- Fix RPC function to return explicit value without ambiguity
-- This fixes the "column reference sample_request_id is ambiguous" error

CREATE OR REPLACE FUNCTION create_sample_request_transaction(
  p_notes TEXT,
  p_sample_items JSONB,
  p_user_id UUID DEFAULT NULL,
  p_request_number VARCHAR(50) DEFAULT NULL
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_request_id VARCHAR(50);
  v_new_request_id UUID;
  v_sample_items_count INT;
BEGIN
  -- Generate request number if not provided
  v_request_id := COALESCE(p_request_number, 'SMP-' || UPPER(substr(gen_random_uuid()::text, 1, 8)));

  -- Calculate sample items count
  v_sample_items_count := jsonb_array_length(p_sample_items);

  -- Validate sample items
  IF v_sample_items_count IS NULL OR v_sample_items_count = 0 THEN
    RAISE EXCEPTION 'No sample items provided';
  END IF;

  IF v_sample_items_count > 5 THEN
    RAISE EXCEPTION 'Maximum 5 sample items allowed';
  END IF;

  -- Create the sample request
  INSERT INTO sample_requests (
    request_id,
    user_id,
    status,
    items_count,
    notes,
    created_at
  ) VALUES (
    v_request_id,
    p_user_id,
    'pending',
    v_sample_items_count,
    p_notes,
    NOW()
  ) RETURNING sample_requests.id INTO v_new_request_id;

  -- Insert sample items with proper UUID handling
  INSERT INTO sample_items (
    sample_request_id, product_id, product_name, category, quantity
  )
  SELECT
    v_new_request_id,
    -- Check if productId is a valid UUID format, otherwise use NULL
    CASE
      WHEN (item->>'productId') IS NULL THEN NULL
      WHEN (item->>'productId') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN (item->>'productId')::UUID
      ELSE NULL
    END,
    item->>'productName',
    COALESCE(item->>'productCategory', 'other'),
    (item->>'quantity')::INTEGER
  FROM jsonb_array_elements(p_sample_items) AS item;

  -- Return success with explicit table reference (using AS to disambiguate)
  RETURN jsonb_build_object(
    'success', true,
    'sample_request_id', sample_requests.id,  -- Explicit table reference
    'request_number', v_request_id
  );
END;
$$;

/**
 * Fix Sample RPC Function - Manual SQL Execution
 *
 * This script outputs the SQL needed to fix the RPC function
 * and provides instructions for manual execution in Supabase SQL Editor.
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl?.split('//')[1];

const SQL = `-- =====================================================
-- Fix Sample RPC Function Schema Issue
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/${projectRef}/sql
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
  success := false;
  sample_request_id := NULL;
  request_number := NULL;
  items_created := 0;
  error_message := NULL;

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

  IF p_request_number IS NULL OR p_request_number = '' THEN
    v_final_request_number := 'SMP-' || TO_TIMESTAMP(NOW())::TEXT || '-' || UPPER(SUBSTR(ENCODE(GEN_RANDOM_BYTES(2), 'HEX'), 1, 4));
  ELSE
    v_final_request_number := p_request_number;
  END IF;

  BEGIN
    INSERT INTO sample_requests (
      user_id, request_number, status, delivery_address_id,
      tracking_number, notes, shipped_at, created_at
    ) VALUES (
      p_user_id, v_final_request_number, 'received', NULL,
      NULL, p_notes, NULL, NOW()
    ) RETURNING id INTO v_new_request_id;

    IF v_new_request_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create sample request';
    END IF;

    INSERT INTO sample_items (
      sample_request_id, product_id, product_name, category, quantity
    )
    SELECT
      v_new_request_id,
      (item->>'productId')::UUID,
      item->>'productName',
      COALESCE(item->>'productCategory', 'other'),
      (item->>'quantity')::INTEGER
    FROM jsonb_array_elements(p_sample_items) AS item;

    SELECT COUNT(*) INTO v_items_count
    FROM sample_items
    WHERE sample_request_id = v_new_request_id;

    IF v_items_count = 0 THEN
      RAISE EXCEPTION 'No sample items were created';
    END IF;

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
`;

console.log('=== Sample RPC Function Fix ===\n');
console.log('INSTRUCTIONS:');
console.log('1. Go to Supabase SQL Editor:');
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql`);
console.log('2. Copy and paste the SQL below');
console.log('3. Click "Run" to execute\n');
console.log('='.repeat(60));
console.log(SQL);
console.log('='.repeat(60));
console.log('\nAfter running this SQL, the sample request form should work.');

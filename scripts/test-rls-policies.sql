-- =====================================================
-- RLS Policy Test Script
-- Purpose: Test RLS policies and nested queries
-- Run in Supabase SQL Editor
-- =====================================================

-- Set a test user ID (replace with actual user ID from your database)
\set TEST_USER_ID '\'your-test-user-id-here\''

DO $$
DECLARE
  v_user_id uuid := :'TEST_USER_ID';
  sample_count integer;
  items_count integer;
  has_rls boolean;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS Policy Test for sample_items';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test User ID: %', v_user_id;
  RAISE NOTICE '';

  -- Check if RLS is enabled on sample_items
  SELECT relrowsecurity INTO has_rls
  FROM pg_class
  WHERE relname = 'sample_items';

  IF has_rls THEN
    RAISE NOTICE '✓ RLS is ENABLED on sample_items table';
  ELSE
    RAISE NOTICE '✗ RLS is NOT ENABLED on sample_items table';
  END IF;

  RAISE NOTICE '';

  -- Test 1: Check if service role policy exists
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'sample_items'
    AND policyname = 'Service role full access sample_items'
  ) THEN
    RAISE NOTICE '✓ Service role policy EXISTS on sample_items';
  ELSE
    RAISE NOTICE '✗ Service role policy MISSING on sample_items';
    RAISE NOTICE '  → This will cause nested queries to fail!';
  END IF;

  RAISE NOTICE '';

  -- Test 2: Count sample_requests for user
  SELECT COUNT(*) INTO sample_count
  FROM sample_requests
  WHERE user_id = v_user_id;

  RAISE NOTICE 'Sample requests for user: %', sample_count;

  -- Test 3: Count sample_items (via nested query simulation)
  -- This simulates what happens when you do .select('*, sample_items (*)')
  SELECT COUNT(*) INTO items_count
  FROM sample_items si
  INNER JOIN sample_requests sr ON si.sample_request_id = sr.id
  WHERE sr.user_id = v_user_id;

  RAISE NOTICE 'Sample items for user: %', items_count;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test completed';
  RAISE NOTICE '========================================';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Display all RLS policies on sample_items
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'sample_items'
ORDER BY policyname;

-- Display sample_requests with sample_items count
SELECT
  sr.id,
  sr.request_number,
  sr.status,
  COUNT(si.id) as item_count
FROM sample_requests sr
LEFT JOIN sample_items si ON si.sample_request_id = sr.id
WHERE sr.user_id = :'TEST_USER_ID'
GROUP BY sr.id, sr.request_number, sr.status
ORDER BY sr.created_at DESC
LIMIT 5;

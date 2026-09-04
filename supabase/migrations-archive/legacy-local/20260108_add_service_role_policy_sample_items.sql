-- =====================================================
-- Migration: Add Service Role Policy to sample_items Table
-- Purpose: Fix nested query failures in dashboard
-- Created: 2026-01-08
-- Issue: Dashboard crashes when sample_items nested query returns null
-- =====================================================
--
-- Problem:
-- When fetching sample_requests with nested sample_items:
--   .select('*, sample_items (*)')
--
-- The sample_items table lacks an explicit service role policy,
-- causing nested queries to return null instead of an empty array.
--
-- This causes the dashboard to crash when trying to access
-- sample.samples.length where samples is undefined.
--
-- Solution:
-- Add explicit service role policy to sample_items table,
-- matching the pattern used by other core tables (orders, quotations, etc.)
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role full access sample_items" ON sample_items;

-- Create service role policy
CREATE POLICY "Service role full access sample_items"
  ON sample_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Verification
-- =====================================================

-- Verify policy was created
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'sample_items'
  AND policyname = 'Service role full access sample_items';

  IF policy_count > 0 THEN
    RAISE NOTICE '✓ Service role policy created successfully for sample_items table';
  ELSE
    RAISE EXCEPTION '✗ Failed to create service role policy for sample_items table';
  END IF;
END $$;

-- Display all policies on sample_items table
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE 'Current policies on sample_items table:';
  RAISE NOTICE '======================================';

  FOR policy_record IN
    SELECT policyname, cmd, roles
    FROM pg_policies
    WHERE tablename = 'sample_items'
    ORDER BY policyname
  LOOP
    RAISE NOTICE '- % (Command: %, Roles: %)',
      policy_record.policyname,
      policy_record.cmd,
      policy_record.roles;
  END LOOP;
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================

RAISE NOTICE '========================================';
RAISE NOTICE 'Migration completed successfully!';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Restart your development server';
RAISE NOTICE '2. Login and test the dashboard at /member/dashboard';
RAISE NOTICE '3. Verify sample requests display without errors';

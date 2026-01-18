-- =====================================================
-- Migration: Add Service Role Policies to All Child Tables
-- Purpose: Ensure all child tables have explicit service role policies
-- Created: 2026-01-08
-- Related: Fix for sample_items nested query failures
-- =====================================================
--
-- Child tables (order_items, quotation_items, etc.) need explicit
-- service role policies to ensure nested queries work correctly.
--
-- Without these policies, nested queries like:
--   .select('*, order_items (*)')
-- may return null instead of empty arrays, causing application crashes.
-- =====================================================

-- =====================================================
-- 1. order_items Table
-- =====================================================

DROP POLICY IF EXISTS "Service role full access order_items" ON order_items;

CREATE POLICY "Service role full access order_items"
  ON order_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. quotation_items Table
-- =====================================================

DROP POLICY IF EXISTS "Service role full access quotation_items" ON quotation_items;

CREATE POLICY "Service role full access quotation_items"
  ON quotation_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Verification
-- =====================================================

DO $$
DECLARE
  table_name text;
  policy_count integer;
  total_policies integer := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Service Role Policies for Child Tables';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('order_items', 'quotation_items', 'sample_items')
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = table_name
    AND policyname LIKE 'Service role full access%';

    IF policy_count > 0 THEN
      RAISE NOTICE '✓ %: Service role policy exists', table_name;
      total_policies := total_policies + 1;
    ELSE
      RAISE NOTICE '✗ %: Service role policy MISSING', table_name;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total policies created: % / 3', total_policies;

  IF total_policies = 3 THEN
    RAISE NOTICE '✓ All child tables have service role policies!';
  ELSE
    RAISE NOTICE '⚠ Some tables are missing policies';
  END IF;

  RAISE NOTICE '========================================';
END $$;

-- Display all policies on child tables
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Current policies on child tables:';
  RAISE NOTICE '==================================';

  FOR policy_record IN
    SELECT
      tablename,
      policyname,
      cmd,
      roles
    FROM pg_policies
    WHERE tablename IN ('order_items', 'quotation_items', 'sample_items')
    ORDER BY tablename, policyname
  LOOP
    RAISE NOTICE '%.% (%)',
      policy_record.tablename,
      policy_record.policyname,
      policy_record.roles;
  END LOOP;
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE 'Migration completed successfully!';
RAISE NOTICE '========================================';

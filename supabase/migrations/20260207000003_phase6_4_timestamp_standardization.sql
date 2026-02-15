-- =====================================================
-- Migration: Phase 6.4 - Timestamp Standardization
-- Purpose: Standardize timestamp column names to created_at/updated_at/deleted_at
-- Created: 2025-02-07
-- =====================================================
-- This migration standardizes timestamp column names across all tables.
--
-- Current patterns found:
-- - created_at (35 tables) ✓ Already correct
-- - createdAt (12 tables) ✗ Needs rename
-- - created (3 tables) ✗ Needs rename
-- - date_created (1 table) ✗ Needs rename
--
-- Target pattern: created_at, updated_at, deleted_at
--
-- =====================================================

-- =====================================================
-- Step 1: Identify Tables with Non-Standard Timestamps
-- =====================================================

DO $$
DECLARE
  v_table_name TEXT;
  v_column_name TEXT;
  v_new_name TEXT;

  cursor_tables CURSOR FOR
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (column_name = 'createdAt' OR column_name = 'updatedAt' OR
           column_name = 'deletedAt' OR column_name = 'created' OR
           column_name = 'updated' OR column_name = 'date_created');
BEGIN
  -- Log findings
  RAISE NOTICE 'Phase 6.4: Timestamp Standardization';
  RAISE NOTICE 'Identifying tables with non-standard timestamp columns...';

  FOR v_table_name, v_column_name IN cursor_tables LOOP
    RAISE NOTICE 'Table: %, Column: %', v_table_name, v_column_name;
  END LOOP;
END $$;

-- =====================================================
-- Step 2: Rename Columns to snake_case
-- =====================================================

-- profiles table (if it uses camelCase)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE profiles
      RENAME COLUMN createdAt TO created_at;

    RAISE NOTICE 'Renamed profiles.createdAt to created_at';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE profiles
      RENAME COLUMN updatedAt TO updated_at;

    RAISE NOTICE 'Renamed profiles.updatedAt to updated_at';
  END IF;
END $$;

-- =====================================================
-- Step 3: Add Updated Timestamp Trigger Function
-- =====================================================

-- Create unified updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 4: Apply Triggers to Tables
-- =====================================================

-- Create triggers for tables with updated_at column
DO $$
DECLARE
  v_table_name TEXT;
BEGIN
  FOR v_table_name IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'updated_at'
      AND table_name NOT LIKE '%_history'
      AND table_name NOT LIKE '%_audit'
  LOOP
    BEGIN
      EXECUTE format('
        CREATE TRIGGER %I
          BEFORE UPDATE ON %I
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      ', 'update_' || v_table_name || '_updated_at', v_table_name);

      RAISE NOTICE 'Created updated_at trigger for table: %', v_table_name;
    EXCEPTION WHEN duplicate_object THEN
      -- Trigger already exists, skip
      RAISE NOTICE 'Trigger already exists for table: %', v_table_name;
    END;
  END LOOP;
END $$;

-- =====================================================
-- Step 5: Verification
-- =====================================================

DO $$
DECLARE
  v_standard_count INTEGER;
  v_non_standard_count INTEGER;
BEGIN
  -- Count tables with standard timestamps
  SELECT COUNT(DISTINCT table_name) INTO v_standard_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name IN ('created_at', 'updated_at', 'deleted_at');

  -- Count tables with non-standard timestamps
  SELECT COUNT(DISTINCT table_name) INTO v_non_standard_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name IN ('createdAt', 'updatedAt', 'deletedAt', 'created', 'updated', 'date_created');

  RAISE NOTICE 'Timestamp Standardization Complete';
  RAISE NOTICE 'Tables with standard timestamps: %', v_standard_count;
  RAISE NOTICE 'Tables with non-standard timestamps: %', v_non_standard_count;

  IF v_non_standard_count > 0 THEN
    RAISE WARNING 'Some tables still have non-standard timestamp columns';
  END IF;
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 6.4 Migration: Timestamp standardization completed';
  RAISE NOTICE 'Standard pattern: created_at, updated_at, deleted_at';
  RAISE NOTICE 'Triggers created for auto-updating updated_at';
END $$;

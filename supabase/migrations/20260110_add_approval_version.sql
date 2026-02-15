-- ============================================================
-- Migration: Add Optimistic Locking to Customer Approval Requests
-- ============================================================
-- Description: Adds version column for optimistic locking to prevent
--              race conditions when multiple users respond to approval
--              requests simultaneously.
--
-- Author: Security Fix (Phase 1.3)
-- Date: 2026-01-10
-- ============================================================

-- Add version column to customer_approval_requests table
ALTER TABLE customer_approval_requests
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Create index on version for efficient optimistic locking queries
CREATE INDEX IF NOT EXISTS idx_approval_requests_version
ON customer_approval_requests(id, version);

-- Add comment to document the version column purpose
COMMENT ON COLUMN customer_approval_requests.version IS 'Optimistic locking version - increments on each update to prevent race conditions';

-- ============================================================
-- Trigger: Auto-increment version on update
-- ============================================================

-- Function to automatically increment version
CREATE OR REPLACE FUNCTION increment_approval_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS approval_version_increment ON customer_approval_requests;

-- Create trigger to auto-increment version on update
CREATE TRIGGER approval_version_increment
BEFORE UPDATE ON customer_approval_requests
FOR EACH ROW
EXECUTE FUNCTION increment_approval_version();

-- ============================================================
-- Policy Update: Allow version column access
-- ============================================================

-- Ensure RLS policies allow access to version column
-- (This assumes the table has RLS enabled and existing policies)

-- ============================================================
-- Verification
-- ============================================================

-- Verify the migration was successful
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'customer_approval_requests'
    AND column_name = 'version'
  ) INTO column_exists;

  IF column_exists THEN
    RAISE NOTICE 'Migration successful: version column added to customer_approval_requests';
  ELSE
    RAISE EXCEPTION 'Migration failed: version column not found';
  END IF;
END $$;

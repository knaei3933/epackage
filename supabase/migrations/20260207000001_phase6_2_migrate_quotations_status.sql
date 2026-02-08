-- =====================================================
-- Migration: Phase 6.2 - Migrate Quotations Table to Unified Status
-- Purpose: Convert quotations.status from quotation_status to workflow_status
-- Created: 2025-02-07
-- Depends: 20260207000000_phase6_1_workflow_status_enum.sql
-- =====================================================
-- This migration converts the quotations table to use the new
-- unified workflow_status enum type.
--
-- IMPORTANT: This migration is reversible.
--
-- =====================================================
-- Step 1: Create Backup of Original Type
-- =====================================================

-- Create backup type for rollback
CREATE TYPE quotation_status_backup AS ENUM (
  'DRAFT',
  'SENT',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CONVERTED'
);

COMMENT ON TYPE quotation_status_backup IS 'Backup of original quotation_status enum for rollback purposes';

-- =====================================================
-- Step 2: Add New Column with workflow_status Type
-- =====================================================

-- Add new column (nullable initially)
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS status_new workflow_status;

-- Copy data from old column to new column
UPDATE quotations
  SET status_new = map_quotation_to_workflow_status(status);

-- Make new column NOT NULL
ALTER TABLE quotations
  ALTER COLUMN status_new SET NOT NULL;

-- =====================================================
-- Step 3: Update Dependent Objects
-- =====================================================

-- Update RLS policies that reference status column
DROP POLICY IF EXISTS "Users can update own draft quotations" ON quotations;
CREATE POLICY "Users can update own draft quotations"
  ON quotations FOR UPDATE
  USING (user_id = auth.uid() AND status_new = 'draft')
  WITH CHECK (user_id = auth.uid() AND status_new = 'draft');

-- Update trigger function that references status
CREATE OR REPLACE FUNCTION update_quotation_status_timestamps_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sent_at when status changes to sent
  IF NEW.status_new = 'sent' AND OLD.status_new IS DISTINCT FROM NEW.status_new THEN
    NEW.sent_at := NOW();
  END IF;

  -- Update approved_at when status changes to approved
  IF NEW.status_new = 'approved' AND OLD.status_new IS DISTINCT FROM NEW.status_new THEN
    NEW.approved_at := NOW();
  END IF;

  -- Update rejected_at when status changes to rejected
  IF NEW.status_new = 'rejected' AND OLD.status_new IS DISTINCT FROM NEW.status_new THEN
    NEW.rejected_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 4: Rename Columns and Drop Old Column
-- =====================================================

-- Rename old column to backup
ALTER TABLE quotations
  RENAME COLUMN status TO status_old;

-- Rename new column to status
ALTER TABLE quotations
  RENAME COLUMN status_new TO status;

-- Update trigger to use new function
DROP TRIGGER IF EXISTS quotation_update_status_timestamps ON quotations;
CREATE TRIGGER quotation_update_status_timestamps
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_quotation_status_timestamps_v2();

-- =====================================================
-- Step 5: Create Index on New Status Column
-- =====================================================

CREATE INDEX idx_quotations_workflow_status ON quotations(status);

-- =====================================================
-- Step 6: Update Helper Functions
-- =====================================================

-- Update is_quotation_expired function to use new status
CREATE OR REPLACE FUNCTION is_quotation_expired(quotation_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  valid_until_time TIMESTAMP WITH TIME ZONE;
  current_status workflow_status;
BEGIN
  SELECT valid_until, status INTO valid_until_time, current_status
  FROM quotations
  WHERE id = quotation_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found', quotation_uuid;
  END IF;

  -- Expired if valid_until has passed and status is not approved/converted/rejected
  RETURN valid_until_time < NOW() AND current_status NOT IN ('approved', 'converted', 'rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update convert_quotation_to_order function to use new status
CREATE OR REPLACE FUNCTION convert_quotation_to_order(quotation_uuid UUID)
RETURNS UUID AS $$
DECLARE
  order_id UUID;
  quotation_data quotations;
BEGIN
  -- Get quotation data
  SELECT * INTO quotation_data
  FROM quotations
  WHERE id = quotation_uuid AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found or not approved', quotation_uuid;
  END IF;

  -- Check if already converted
  IF EXISTS (
    SELECT 1 FROM orders WHERE quotation_id = quotation_uuid
  ) THEN
    RAISE EXCEPTION 'Order already exists for quotation %', quotation_uuid;
  END IF;

  -- Create order
  INSERT INTO orders (
    user_id,
    quotation_id,
    order_number,
    status,
    total_amount,
    customer_name,
    customer_email
  )
  VALUES (
    quotation_data.user_id,
    quotation_uuid,
    'ORD-TEMP', -- Will be auto-generated by trigger
    'pending',
    quotation_data.total_amount,
    quotation_data.customer_name,
    quotation_data.customer_email
  )
  RETURNING id INTO order_id;

  -- Update quotation status
  UPDATE quotations
  SET status = 'converted',
      updated_at = NOW()
  WHERE id = quotation_uuid;

  RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Step 7: Verification
-- =====================================================

-- Verify all records have valid status
DO $$
DECLARE
  v_invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_invalid_count
  FROM quotations
  WHERE status IS NULL;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % quotations have NULL status', v_invalid_count;
  END IF;

  RAISE NOTICE 'Quotations table migrated successfully to workflow_status';
  RAISE NOTICE 'Total quotations: %', (SELECT COUNT(*) FROM quotations);
END $$;

-- Show status distribution
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM quotations
GROUP BY status
ORDER BY count DESC;

-- =====================================================
-- Rollback Instructions (if needed)
-- =====================================================

/*
-- To rollback this migration, run:

BEGIN;

-- Restore original status column
ALTER TABLE quotations
  RENAME COLUMN status TO status_new;

ALTER TABLE quotations
  RENAME COLUMN status_old TO status;

-- Update trigger function
DROP TRIGGER quotation_update_status_timestamps ON quotations;
CREATE TRIGGER quotation_update_status_timestamps
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_quotation_status_timestamps();

-- Drop new column
ALTER TABLE quotations DROP COLUMN IF EXISTS status_new;

COMMIT;

*/

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 6.2 Migration: Quotations table migrated to workflow_status';
  RAISE NOTICE 'Old status column: status_old (quotation_status)';
  RAISE NOTICE 'New status column: status (workflow_status)';
  RAISE NOTICE 'Rollback instructions available in comments';
END $$;

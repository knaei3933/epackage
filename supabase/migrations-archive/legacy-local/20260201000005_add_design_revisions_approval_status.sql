-- =====================================================
-- Migration: Add approval_status column to design_revisions
-- Description: Fix missing approval_status column
-- Created: 2025-02-01
-- =====================================================

-- Add approval_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'design_revisions'
    AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE design_revisions
    ADD COLUMN approval_status TEXT
    CHECK (approval_status IN ('pending', 'approved', 'rejected'))
    DEFAULT 'pending';

    -- Create index for approval_status if it doesn't exist
    CREATE INDEX IF NOT EXISTS idx_design_revisions_approval_status
    ON design_revisions(approval_status);

    -- Create index for pending revisions if it doesn't exist
    CREATE INDEX IF NOT EXISTS idx_design_revisions_pending
    ON design_revisions(approval_status)
    WHERE approval_status = 'pending';
  END IF;
END $$;

-- Add approved_by and approved_at columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'design_revisions'
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE design_revisions ADD COLUMN approved_by UUID REFERENCES profiles(id);
    CREATE INDEX IF NOT EXISTS idx_design_revisions_approved_by ON design_revisions(approved_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'design_revisions'
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE design_revisions ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

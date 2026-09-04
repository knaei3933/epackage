-- =====================================================
-- Migration: Spec Sheet Revisions Table
-- Purpose: Track customer revision requests for spec sheets
-- Created: 2025-12-31
-- =====================================================

-- Create spec_sheet_revisions table
CREATE TABLE IF NOT EXISTS spec_sheet_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  spec_sheet_id UUID NOT NULL REFERENCES spec_sheets(id) ON DELETE CASCADE,

  -- Request info
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  requested_changes TEXT[] DEFAULT '{}',

  -- Resolution
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'rejected')
  ),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

-- Indexes
CREATE INDEX idx_spec_sheet_revisions_spec_sheet_id ON spec_sheet_revisions(spec_sheet_id);
CREATE INDEX idx_spec_sheet_revisions_requested_by ON spec_sheet_revisions(requested_by);
CREATE INDEX idx_spec_sheet_revisions_status ON spec_sheet_revisions(status);

-- Update timestamp trigger
CREATE TRIGGER spec_sheet_revisions_updated_at
  BEFORE UPDATE ON spec_sheet_revisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE spec_sheet_revisions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view revisions for their spec sheets"
  ON spec_sheet_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spec_sheets
      WHERE spec_sheets.id = spec_sheet_revisions.spec_sheet_id
        AND EXISTS (
          SELECT 1 FROM work_orders
          WHERE work_orders.id = spec_sheets.work_order_id
            AND work_orders.customer_id = auth.uid()
        )
    )
  );

CREATE POLICY "Admins can view all revisions"
  ON spec_sheet_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can create revisions"
  ON spec_sheet_revisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spec_sheets
      WHERE spec_sheets.id = spec_sheet_revisions.spec_sheet_id
        AND EXISTS (
          SELECT 1 FROM work_orders
          WHERE work_orders.id = spec_sheets.work_order_id
            AND work_orders.customer_id = auth.uid()
        )
    )
  );

CREATE POLICY "Admins can update revisions"
  ON spec_sheet_revisions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON spec_sheet_revisions TO authenticated;
GRANT ALL ON spec_sheet_revisions TO authenticated;

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Spec Sheet Revisions table';
END $$;

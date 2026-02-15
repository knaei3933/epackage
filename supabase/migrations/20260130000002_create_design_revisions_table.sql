-- =====================================================
-- Migration: Create design_revisions table
-- Description: B2B workflow - Store design correction revisions
-- Created: 2025-01-30
-- =====================================================

-- Create design_revisions table
CREATE TABLE IF NOT EXISTS design_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order reference
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Revision information
  revision_number INTEGER NOT NULL,

  -- Files (JSONB structure)
  customer_files JSONB DEFAULT '{}',
  corrected_files JSONB DEFAULT '{}',

  -- File URLs (Supabase Storage)
  preview_image_url TEXT,
  original_file_url TEXT,

  -- Comments
  customer_comment TEXT,
  partner_comment TEXT,

  -- Approval status
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',

  -- Approval metadata
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_order_revision UNIQUE(order_id, revision_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_design_revisions_order_id ON design_revisions(order_id);
CREATE INDEX IF NOT EXISTS idx_design_revisions_approval_status ON design_revisions(approval_status);
CREATE INDEX IF NOT EXISTS idx_design_revisions_approved_by ON design_revisions(approved_by);
CREATE INDEX IF NOT EXISTS idx_design_revisions_created_at ON design_revisions(created_at DESC);

-- Create index for pending revisions (admin view)
CREATE INDEX IF NOT EXISTS idx_design_revisions_pending ON design_revisions(approval_status)
  WHERE approval_status = 'pending';

-- Add comments for documentation
COMMENT ON TABLE design_revisions IS 'Design correction revisions for B2B workflow';
COMMENT ON COLUMN design_revisions.order_id IS 'Reference to orders table';
COMMENT ON COLUMN design_revisions.revision_number IS 'Sequential revision number per order';
COMMENT ON COLUMN design_revisions.customer_files IS 'Customer uploaded design files (JSONB)';
COMMENT ON COLUMN design_revisions.corrected_files IS 'Korea partner corrected design files (JSONB)';
COMMENT ON COLUMN design_revisions.preview_image_url IS 'Supabase Storage URL for preview image (JPG)';
COMMENT ON COLUMN design_revisions.original_file_url IS 'Supabase Storage URL for original design file (AI/PDF/PSD)';
COMMENT ON COLUMN design_revisions.customer_comment IS 'Customer comment on revision (if rejected)';
COMMENT ON COLUMN design_revisions.partner_comment IS 'Korea partner comment/correction notes';
COMMENT ON COLUMN design_revisions.approval_status IS 'pending: awaiting customer approval, approved: customer approved, rejected: customer requested changes';
COMMENT ON COLUMN design_revisions.approved_by IS 'User who approved this revision';
COMMENT ON COLUMN design_revisions.approved_at IS 'Timestamp when revision was approved';

-- Enable Row Level Security
ALTER TABLE design_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can do everything, users can read their own order's revisions
CREATE POLICY "Admins can view all design revisions"
  ON design_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert design revisions"
  ON design_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update design revisions"
  ON design_revisions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own order design revisions"
  ON design_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = design_revisions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_design_revisions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER design_revisions_updated_at
  BEFORE UPDATE ON design_revisions
  FOR EACH ROW
  EXECUTE FUNCTION update_design_revisions_updated_at();

-- Function to get next revision number for an order
CREATE OR REPLACE FUNCTION get_next_revision_number(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO v_next_number
  FROM design_revisions
  WHERE order_id = p_order_id;

  RETURN v_next_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON design_revisions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE design_revisions_id_seq TO authenticated;

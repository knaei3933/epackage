-- =====================================================
-- Design Revision Workflow v2 Migration
-- =====================================================
-- Description: Customer file submission tracking with
--              replacement chain, revision notifications,
--              and enhanced design_revisions table
-- Created: 2025-02-22
-- =====================================================

-- =====================================================
-- Table: customer_file_submissions
-- =====================================================
-- Tracks customer file uploads with submission numbering
-- and replacement chain for audit trail

CREATE TABLE IF NOT EXISTS customer_file_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  submission_number INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  replaced_at TIMESTAMPTZ,
  replaced_by UUID REFERENCES profiles(id),
  previous_submission_id UUID REFERENCES customer_file_submissions(id),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_order_submission UNIQUE(order_id, submission_number)
);

-- Enable Row Level Security
ALTER TABLE customer_file_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_file_submissions

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON customer_file_submissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = customer_file_submissions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins/Operators/Sales can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON customer_file_submissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'OPERATOR', 'SALES')
    )
  );

-- Authenticated users can insert submissions
CREATE POLICY "Authenticated users can insert submissions"
  ON customer_file_submissions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins/Operators can update submissions
CREATE POLICY "Admins can update submissions"
  ON customer_file_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Indexes for customer_file_submissions
CREATE INDEX idx_customer_file_submissions_order_id ON customer_file_submissions(order_id);
CREATE INDEX idx_customer_file_submissions_order_item_id ON customer_file_submissions(order_item_id);
CREATE INDEX idx_customer_file_submissions_uploaded_by ON customer_file_submissions(uploaded_by);
CREATE INDEX idx_customer_file_submissions_is_current ON customer_file_submissions(is_current);
CREATE INDEX idx_customer_file_submissions_previous_id ON customer_file_submissions(previous_submission_id);

-- =====================================================
-- Add columns to design_revisions table
-- =====================================================

-- Customer file tracking columns
ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS original_customer_filename TEXT;

ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS generated_correction_filename TEXT;

ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS customer_submission_id UUID REFERENCES customer_file_submissions(id);

-- Rejection tracking columns
ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id);

-- Indexes for new design_revisions columns
CREATE INDEX IF NOT EXISTS idx_design_revisions_customer_submission_id
  ON design_revisions(customer_submission_id);

CREATE INDEX IF NOT EXISTS idx_design_revisions_rejected_by
  ON design_revisions(rejected_by);

-- =====================================================
-- Table: revision_notifications
-- =====================================================
-- Tracks notifications sent for revision events

CREATE TABLE IF NOT EXISTS revision_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID NOT NULL REFERENCES design_revisions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL
    CHECK (notification_type IN ('uploaded', 'approved', 'rejected', 'reminder')),
  recipient_email TEXT NOT NULL,
  recipient_role TEXT NOT NULL
    CHECK (recipient_role IN ('customer', 'designer', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  subject TEXT,
  body_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE revision_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revision_notifications

-- Users can view notifications for their own order revisions
CREATE POLICY "Users can view own revision notifications"
  ON revision_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM design_revisions
      JOIN orders ON orders.id = design_revisions.order_id
      WHERE design_revisions.id = revision_notifications.revision_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins/Operators/Designers can view all notifications
CREATE POLICY "Staff can view all revision notifications"
  ON revision_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'OPERATOR', 'KOREA_DESIGNER')
    )
  );

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON revision_notifications FOR INSERT TO service_role
  WITH CHECK (true);

-- Service role can update notifications
CREATE POLICY "Service role can update notifications"
  ON revision_notifications FOR UPDATE TO service_role
  USING (true);

-- Indexes for revision_notifications
CREATE INDEX idx_revision_notifications_revision_id ON revision_notifications(revision_id);
CREATE INDEX idx_revision_notifications_status ON revision_notifications(status);
CREATE INDEX idx_revision_notifications_type ON revision_notifications(notification_type);
CREATE INDEX idx_revision_notifications_recipient ON revision_notifications(recipient_email);

-- =====================================================
-- Helper Functions for Filename Generation
-- =====================================================

-- Function: Generate correction filename based on submission metadata
CREATE OR REPLACE FUNCTION generate_correction_filename(
  p_order_number TEXT,
  p_sku_name TEXT DEFAULT NULL,
  p_revision_number INTEGER DEFAULT 1
) RETURNS TEXT AS $$
DECLARE
  v_base_filename TEXT;
  v_extension TEXT := '_correction.ai';
BEGIN
  -- Build base filename: ORD-001_SkuName_R1_correction.ai
  IF p_sku_name IS NOT NULL AND p_sku_name != '' THEN
    v_base_filename := p_order_number || '_' || p_sku_name || '_R' || p_revision_number;
  ELSE
    v_base_filename := p_order_number || '_R' || p_revision_number;
  END IF;

  RETURN v_base_filename || v_extension;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get next submission number for an order
CREATE OR REPLACE FUNCTION get_next_submission_number(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  -- Get the maximum submission number for this order and increment
  SELECT COALESCE(MAX(submission_number), 0) + 1
  INTO v_next_number
  FROM customer_file_submissions
  WHERE order_id = p_order_id;

  RETURN v_next_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger: Auto-set submission number
-- =====================================================

-- Function to set submission number on insert
CREATE OR REPLACE FUNCTION set_submission_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if not provided (allows manual override if needed)
  IF NEW.submission_number IS NULL OR NEW.submission_number = 1 THEN
    NEW.submission_number := get_next_submission_number(NEW.order_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set submission number
CREATE TRIGGER trigger_set_submission_number
  BEFORE INSERT ON customer_file_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_submission_number();

-- =====================================================
-- Trigger: Handle submission replacement
-- =====================================================

-- Function to handle replacement chain when marking as non-current
CREATE OR REPLACE FUNCTION handle_submission_replacement()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_current is being set to FALSE, record replacement info
  IF OLD.is_current = TRUE AND (NEW.is_current = FALSE OR NEW.is_current IS NULL) THEN
    NEW.replaced_at := NOW();
    NEW.replaced_by := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for replacement tracking
CREATE TRIGGER trigger_handle_submission_replacement
  BEFORE UPDATE ON customer_file_submissions
  FOR EACH ROW
  WHEN (OLD.is_current IS DISTINCT FROM NEW.is_current)
  EXECUTE FUNCTION handle_submission_replacement();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE customer_file_submissions IS
'Tracks customer file uploads with submission numbering and replacement chain for design revision workflow v2';

COMMENT ON COLUMN customer_file_submissions.submission_number IS
'Sequential submission number per order (1, 2, 3, ...)';

COMMENT ON COLUMN customer_file_submissions.is_current IS
'Flag indicating if this is the active submission (FALSE means replaced)';

COMMENT ON COLUMN customer_file_submissions.previous_submission_id IS
'Link to previous submission for replacement chain audit trail';

COMMENT ON TABLE revision_notifications IS
'Tracks notifications sent for revision events (uploaded, approved, rejected, reminder)';

COMMENT ON COLUMN revision_notifications.notification_type IS
'Type of notification: uploaded (customer file), approved (revision approved), rejected (needs changes), reminder (pending review)';

COMMENT ON COLUMN revision_notifications.recipient_role IS
'Role of recipient: customer (order owner), designer (KOREA_DESIGNER), admin (ADMIN/OPERATOR)';

COMMENT ON FUNCTION generate_correction_filename IS
'Generates standardized correction filename: ORD-001_SkuName_R1_correction.ai';

COMMENT ON FUNCTION get_next_submission_number IS
'Calculates next sequential submission number for an order';

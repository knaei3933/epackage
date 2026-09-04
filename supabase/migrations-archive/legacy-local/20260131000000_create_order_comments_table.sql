-- =====================================================
-- Order Comments Table Migration
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp/sql
-- =====================================================

-- Create order_comments table
CREATE TABLE IF NOT EXISTS order_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general' CHECK (comment_type IN ('general', 'production', 'shipping', 'billing', 'correction', 'internal')),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL CHECK (author_role IN ('customer', 'admin', 'production')),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  parent_comment_id UUID REFERENCES order_comments(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_comments_order_id ON order_comments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_comments_author_id ON order_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_order_comments_parent_comment_id ON order_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_order_comments_created_at ON order_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_comments_is_internal ON order_comments(is_internal);
CREATE INDEX IF NOT EXISTS idx_order_comments_deleted_at ON order_comments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_order_comments_order_created ON order_comments(order_id, created_at DESC) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view non-internal comments on own orders"
  ON order_comments FOR SELECT
  USING (
    is_internal = false
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_comments.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all order comments"
  ON order_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert comments on own orders"
  ON order_comments FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_comments.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can insert internal comments"
  ON order_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY IF NOT EXISTS "Users can update own comments"
  ON order_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    AND deleted_at IS NULL
  );

CREATE POLICY IF NOT EXISTS "Users can soft delete own comments"
  ON order_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Create trigger function
CREATE OR REPLACE FUNCTION update_order_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS update_order_comments_updated_at_trigger ON order_comments;
CREATE TRIGGER update_order_comments_updated_at_trigger
  BEFORE UPDATE ON order_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_order_comments_updated_at();

-- =====================================================
-- Customer Approval Requests Table
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('spec_approval', 'design_approval', 'correction_request')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  response_comment TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_approval_requests_order_id ON customer_approval_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_approval_requests_status ON customer_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_customer_approval_requests_requested_by ON customer_approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_customer_approval_requests_created_at ON customer_approval_requests(created_at DESC);

-- Enable RLS
ALTER TABLE customer_approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view approval requests on own orders"
  ON customer_approval_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = customer_approval_requests.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create approval requests on own orders"
  ON customer_approval_requests FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders WHERE orders.id = customer_approval_requests.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all approval requests"
  ON customer_approval_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage all approval requests"
  ON customer_approval_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Apply trigger
DROP TRIGGER IF EXISTS update_customer_approval_requests_updated_at_trigger ON customer_approval_requests;
CREATE TRIGGER update_customer_approval_requests_updated_at_trigger
  BEFORE UPDATE ON customer_approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_order_comments_updated_at();

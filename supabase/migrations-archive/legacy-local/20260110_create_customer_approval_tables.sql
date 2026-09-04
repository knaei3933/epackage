-- ============================================================
-- Migration: Customer Approval Requests System
-- ============================================================
-- Description: Creates the customer approval requests system
--              for order corrections, spec changes, and approvals.
--
-- Author: Phase 1.3 Security Fixes
-- Date: 2026-01-10
-- ============================================================

-- ============================================================
-- Table: customer_approval_requests
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customer_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  korea_correction_id UUID REFERENCES public.korea_corrections(id) ON DELETE SET NULL,

  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('correction', 'spec_change', 'price_adjustment', 'delay', 'other')),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  response_notes TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

  -- Requester info
  requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata for flexible data storage
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Optimistic locking version (added by 20260110_add_approval_version.sql)
  version INTEGER DEFAULT 1 NOT NULL,

  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for customer_approval_requests
CREATE INDEX IF NOT EXISTS idx_approval_requests_order_id ON public.customer_approval_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.customer_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_expires_at ON public.customer_approval_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON public.customer_approval_requests(requested_by);

-- Comments and full-text search
COMMENT ON TABLE public.customer_approval_requests IS 'Customer approval requests for order corrections and changes';
COMMENT ON COLUMN public.customer_approval_requests.approval_type IS 'Type of approval: correction, spec_change, price_adjustment, delay, other';
COMMENT ON COLUMN public.customer_approval_requests.status IS 'Current status: pending, approved, rejected, cancelled';
COMMENT ON COLUMN public.customer_approval_requests.expires_at IS 'When the approval request expires (default 7 days)';
COMMENT ON COLUMN public.customer_approval_requests.metadata IS 'Flexible JSON storage for additional request data';

-- ============================================================
-- Table: approval_request_files
-- ============================================================

CREATE TABLE IF NOT EXISTS public.approval_request_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES public.customer_approval_requests(id) ON DELETE CASCADE,

  -- File details
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_category TEXT CHECK (file_category IN ('specification', 'quote', 'contract', 'image', 'document', 'other')),

  -- Upload tracking
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for approval_request_files
CREATE INDEX IF NOT EXISTS idx_approval_files_request_id ON public.approval_request_files(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_files_category ON public.approval_request_files(file_category);

COMMENT ON TABLE public.approval_request_files IS 'Files attached to customer approval requests';

-- ============================================================
-- Table: approval_request_comments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.approval_request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES public.customer_approval_requests(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Author tracking
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  author_role TEXT CHECK (author_role IN ('admin', 'member', 'system')),

  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for approval_request_comments
CREATE INDEX IF NOT EXISTS idx_approval_comments_request_id ON public.approval_request_comments(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_author_id ON public.approval_request_comments(author_id);

-- Comments and full-text search
COMMENT ON TABLE public.approval_request_comments IS 'Comments on customer approval requests';

-- ============================================================
-- Trigger: Auto-update updated_at
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_approval_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS customer_approval_requests_updated_at ON public.customer_approval_requests;
CREATE TRIGGER customer_approval_requests_updated_at
BEFORE UPDATE ON public.customer_approval_requests
FOR EACH ROW
EXECUTE FUNCTION update_approval_updated_at();

DROP TRIGGER IF EXISTS approval_request_comments_updated_at ON public.approval_request_comments;
CREATE TRIGGER approval_request_comments_updated_at
BEFORE UPDATE ON public.approval_request_comments
FOR EACH ROW
EXECUTE FUNCTION update_approval_updated_at();

-- ============================================================
-- RLS (Row Level Security) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.customer_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_request_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_request_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policy: customer_approval_requests
-- ============================================================

-- Service role can do everything
CREATE POLICY "Service role has full access to customer_approval_requests"
ON public.customer_approval_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all approval requests
CREATE POLICY "Admins can view all customer_approval_requests"
ON public.customer_approval_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

-- Members can view approval requests for their orders
CREATE POLICY "Members can view their customer_approval_requests"
ON public.customer_approval_requests
FOR SELECT
TO authenticated
USING (
  order_id IN (SELECT id FROM public.orders WHERE orders.user_id = auth.uid())
);

-- Members can insert approval requests for their orders
CREATE POLICY "Members can insert customer_approval_requests"
ON public.customer_approval_requests
FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE orders.user_id = auth.uid())
);

-- Members can update their own approval requests
CREATE POLICY "Members can update their customer_approval_requests"
ON public.customer_approval_requests
FOR UPDATE
TO authenticated
USING (
  requested_by = auth.uid()
)
WITH CHECK (
  requested_by = auth.uid()
);

-- ============================================================
-- Policy: approval_request_files
-- ============================================================

-- Service role full access
CREATE POLICY "Service role has full access to approval_request_files"
ON public.approval_request_files
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view files for their accessible approval requests
CREATE POLICY "Users can view approval_request_files"
ON public.approval_request_files
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_approval_requests
    WHERE customer_approval_requests.id = approval_request_files.approval_request_id
    AND (
      customer_approval_requests.requested_by = auth.uid()
      OR customer_approval_requests.order_id IN (
        SELECT id FROM public.orders WHERE orders.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
    )
  )
);

-- ============================================================
-- Policy: approval_request_comments
-- ============================================================

-- Service role full access
CREATE POLICY "Service role has full access to approval_request_comments"
ON public.approval_request_comments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view comments for their accessible approval requests
CREATE POLICY "Users can view approval_request_comments"
ON public.approval_request_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_approval_requests
    WHERE customer_approval_requests.id = approval_request_comments.approval_request_id
    AND (
      customer_approval_requests.requested_by = auth.uid()
      OR customer_approval_requests.order_id IN (
        SELECT id FROM public.orders WHERE orders.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
    )
  )
);

-- Users can insert comments for their accessible approval requests
CREATE POLICY "Users can insert approval_request_comments"
ON public.approval_request_comments
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.customer_approval_requests
    WHERE customer_approval_requests.id = approval_request_comments.approval_request_id
    AND (
      customer_approval_requests.requested_by = auth.uid()
      OR customer_approval_requests.order_id IN (
        SELECT id FROM public.orders WHERE orders.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
    )
  )
);

-- ============================================================
-- Verification
-- ============================================================

DO $$
DECLARE
  tables_created INT;
BEGIN
  SELECT COUNT(*) INTO tables_created
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('customer_approval_requests', 'approval_request_files', 'approval_request_comments');

  IF tables_created = 3 THEN
    RAISE NOTICE 'Migration successful: All customer approval tables created';
  ELSE
    RAISE EXCEPTION 'Migration failed: Only % of 3 tables created', tables_created;
  END IF;
END $$;

-- ============================================================
-- Composite Indexes for Performance Optimization (CORRECTED)
-- Created: 2026-01-02
-- Purpose: Fix N+1 query issues with actual schema
-- ============================================================

-- quotations table composite index
-- quotation_status enum: draft, sent, approved, rejected, expired
CREATE INDEX IF NOT EXISTS idx_quotations_user_status_created
  ON quotations(user_id, status, created_at DESC);

-- orders table composite index
-- order_status enum: pending, processing, manufacturing, ready, shipped, delivered, cancelled
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created
  ON orders(user_id, status, created_at DESC)
  WHERE status != 'cancelled';

-- sample_requests composite index
CREATE INDEX IF NOT EXISTS idx_sample_requests_user_status_created
  ON sample_requests(user_id, status, created_at DESC);

-- Priority 2: N+1 query optimization

-- quotation_items for N+1 query fix
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id
  ON quotation_items(quotation_id);

-- order_items for N+1 query fix
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

-- sample_items for N+1 query fix
CREATE INDEX IF NOT EXISTS idx_sample_items_request_id
  ON sample_items(sample_request_id);

-- ============================================================
-- Rollback Commands (if needed)
-- ============================================================

-- DROP INDEX IF EXISTS idx_quotations_user_status_created;
-- DROP INDEX IF EXISTS idx_orders_user_status_created;
-- DROP INDEX IF EXISTS idx_sample_requests_user_status_created;
-- DROP INDEX IF EXISTS idx_quotation_items_quotation_id;
-- DROP INDEX IF EXISTS idx_order_items_order_id;
-- DROP INDEX IF EXISTS idx_sample_items_request_id;

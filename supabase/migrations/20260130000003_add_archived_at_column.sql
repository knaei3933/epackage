-- =====================================================
-- Migration: Add archived_at column to orders table
-- Description: Support soft-delete/archive functionality
-- Created: 2025-01-30
-- =====================================================

-- Add archived_at column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create partial index for archived orders (performance)
-- This index only includes rows where archived_at is NOT NULL
CREATE INDEX IF NOT EXISTS idx_orders_archived_at
  ON orders(archived_at DESC)
  WHERE archived_at IS NOT NULL;

-- Create index for non-archived orders (active orders)
-- This index only includes rows where archived_at is NULL
CREATE INDEX IF NOT EXISTS idx_orders_active
  ON orders(created_at DESC)
  WHERE archived_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN orders.archived_at IS 'Timestamp when order was archived (soft-delete). NULL means active order.';

-- Add RLS policy for archived_at (admins can view all, users can view own)
DROP POLICY IF EXISTS "Users can view own orders including archived" ON orders;
CREATE POLICY "Users can view own orders including archived"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- =====================================================
-- Rollback Migration (for reference)
-- =====================================================
/*
-- To rollback this migration:
DROP INDEX IF EXISTS idx_orders_active;
DROP INDEX IF EXISTS idx_orders_archived_at;
ALTER TABLE orders DROP COLUMN IF EXISTS archived_at;
*/

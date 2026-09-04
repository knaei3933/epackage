-- =====================================================
-- Migration: Phase 6.3 - Migrate Orders Table to Unified Status
-- Purpose: Convert orders.status from order_status to workflow_status
-- Created: 2025-02-07
-- Depends: 20260207000000_phase6_1_workflow_status_enum.sql
-- =====================================================

-- =====================================================
-- Step 1: Add New Column with workflow_status Type
-- =====================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status_new workflow_status;

-- Copy data from old column to new column
UPDATE orders
  SET status_new = map_order_to_workflow_status(status::TEXT);

-- Make new column NOT NULL
ALTER TABLE orders
  ALTER COLUMN status_new SET NOT NULL;

-- =====================================================
-- Step 2: Update Dependent Objects
-- =====================================================

-- Update order status history table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_tables WHERE table_name = 'order_status_history') THEN
    ALTER TABLE order_status_history
      ADD COLUMN IF NOT EXISTS from_status_new workflow_status;

    ALTER TABLE order_status_history
      ADD COLUMN IF NOT EXISTS to_status_new workflow_status;

    UPDATE order_status_history
      SET
        from_status_new = map_order_to_workflow_status(from_status::TEXT),
        to_status_new = map_order_to_workflow_status(to_status::TEXT);

    ALTER TABLE order_status_history
      ALTER COLUMN from_status_new SET NOT NULL;

    ALTER TABLE order_status_history
      ALTER COLUMN to_status_new SET NOT NULL;
  END IF;
END $$;

-- =====================================================
-- Step 3: Rename Columns and Drop Old Column
-- =====================================================

ALTER TABLE orders
  RENAME COLUMN status TO status_old;

ALTER TABLE orders
  RENAME COLUMN status_new TO status;

-- =====================================================
-- Step 4: Create Index on New Status Column
-- =====================================================

CREATE INDEX idx_orders_workflow_status ON orders(status);

-- =====================================================
-- Step 5: Verification
-- =====================================================

DO $$
DECLARE
  v_invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_invalid_count
  FROM orders
  WHERE status IS NULL;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % orders have NULL status', v_invalid_count;
  END IF;

  RAISE NOTICE 'Orders table migrated successfully to workflow_status';
  RAISE NOTICE 'Total orders: %', (SELECT COUNT(*) FROM orders);
END $$;

-- Show status distribution
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM orders
GROUP BY status
ORDER BY count DESC;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 6.3 Migration: Orders table migrated to workflow_status';
END $$;

-- =====================================================
-- Migration: Phase 6.1 - Create Unified Workflow Status Enum
-- Purpose: Unify status enums across quotations, orders, contracts
-- Created: 2025-02-07
-- =====================================================
-- This migration creates a unified workflow_status enum type
-- that can be used across all business entities.
--
-- Current State (Before Migration):
-- - quotations: quotation_status (DRAFT, SENT, APPROVED, REJECTED, EXPIRED, CONVERTED)
-- - orders: order_status (PENDING, QUOTATION, DATA_RECEIVED, etc.)
-- - contracts: contract_status (DRAFT, PENDING, ACTIVE, etc.)
--
-- Target State (After Migration):
-- - All tables use workflow_status enum
-- - Consistent status values across entities
-- - Easier status transitions and reporting
--
-- =====================================================
-- Step 1: Create Unified Workflow Status Enum
-- =====================================================

CREATE TYPE workflow_status AS ENUM (
  'draft',           -- 初期状態 (Initial state)
  'pending',         -- 承認待ち (Awaiting approval)
  'approved',        -- 承認済み (Approved)
  'rejected',        -- 拒否 (Rejected)
  'active',          -- アクティブ (Active)
  'in_progress',     -- 進行中 (In progress)
  'completed',       -- 完了 (Completed)
  'cancelled',       -- キャンセル済み (Cancelled)
  'converted',       -- 変換済み（見積→注文など） (Converted)
  'ready',          -- 準備完了 (Ready)
  'shipped',        -- 出荷済み (Shipped)
  'delivered',      -- 配送完了 (Delivered)
  'expired',        -- 有効期限切れ (Expired)
  'sent',           -- 送信済み (Sent)
  'quotation'       -- 見積段階 (Quotation phase)
);

COMMENT ON TYPE workflow_status IS 'Unified workflow status across all business entities';

-- =====================================================
-- Step 2: Create Migration Mapping Functions
-- =====================================================

-- Function to map quotation_status to workflow_status
CREATE OR REPLACE FUNCTION map_quotation_to_workflow_status(old_status quotation_status)
RETURNS workflow_status AS $$
BEGIN
  CASE old_status::text
    WHEN 'DRAFT' THEN RETURN 'draft';
    WHEN 'SENT' THEN RETURN 'sent';
    WHEN 'APPROVED' THEN RETURN 'approved';
    WHEN 'REJECTED' THEN RETURN 'rejected';
    WHEN 'EXPIRED' THEN RETURN 'expired';
    WHEN 'CONVERTED' THEN RETURN 'converted';
    ELSE RETURN 'draft';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to map order_status to workflow_status
CREATE OR REPLACE FUNCTION map_order_to_workflow_status(old_status TEXT)
RETURNS workflow_status AS $$
BEGIN
  CASE UPPER(old_status)
    WHEN 'PENDING' THEN RETURN 'pending';
    WHEN 'QUOTATION' THEN RETURN 'quotation';
    WHEN 'DATA_RECEIVED' THEN RETURN 'in_progress';
    WHEN 'IN_PRODUCTION' THEN RETURN 'in_progress';
    WHEN 'PRODUCTION_COMPLETE' THEN RETURN 'ready';
    WHEN 'READY_TO_SHIP' THEN RETURN 'ready';
    WHEN 'SHIPPED' THEN RETURN 'shipped';
    WHEN 'DELIVERED' THEN RETURN 'delivered';
    WHEN 'CANCELLED' THEN RETURN 'cancelled';
    WHEN 'APPROVED' THEN RETURN 'approved';
    WHEN 'REJECTED' THEN RETURN 'rejected';
    ELSE RETURN 'pending';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to map contract_status to workflow_status
CREATE OR REPLACE FUNCTION map_contract_to_workflow_status(old_status TEXT)
RETURNS workflow_status AS $$
BEGIN
  CASE UPPER(old_status)
    WHEN 'DRAFT' THEN RETURN 'draft';
    WHEN 'PENDING' THEN RETURN 'pending';
    WHEN 'ACTIVE' THEN RETURN 'active';
    WHEN 'COMPLETED' THEN RETURN 'completed';
    WHEN 'CANCELLED' THEN RETURN 'cancelled';
    ELSE RETURN 'draft';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Step 3: Verification Functions
-- =====================================================

-- Function to verify status migration
CREATE OR REPLACE FUNCTION verify_workflow_status_migration()
RETURNS TABLE (
  table_name TEXT,
  old_values TEXT[],
  new_values workflow_status[],
  migration_status TEXT
) AS $$
BEGIN
  -- Verify quotations table
  RETURN QUERY
  SELECT
    'quotations'::TEXT,
    ARRAY_AGG(DISTINCT status::TEXT ORDER BY status::TEXT),
    ARRAY_AGG(DISTINCT map_quotation_to_workflow_status(status) ORDER BY map_quotation_to_workflow_status(status)),
    'needs_migration'::TEXT
  FROM quotations
  UNION ALL
  -- Verify orders table
  SELECT
    'orders'::TEXT,
    ARRAY_AGG(DISTINCT status::TEXT ORDER BY status::TEXT),
    ARRAY_AGG(DISTINCT map_order_to_workflow_status(status) ORDER BY map_order_to_workflow_status(status)),
    'needs_migration'::TEXT
  FROM orders
  UNION ALL
  -- Verify contracts table
  SELECT
    'contracts'::TEXT,
    ARRAY_AGG(DISTINCT status::TEXT ORDER BY status::TEXT),
    ARRAY_AGG(DISTINCT map_contract_to_workflow_status(status) ORDER BY map_contract_to_workflow_status(status)),
    'needs_migration'::TEXT
  FROM contracts;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 4: Create Rollback Functions
-- =====================================================

-- Function to rollback workflow_status to original type (for quotations)
CREATE OR REPLACE FUNCTION rollback_quotations_status()
RETURNS VOID AS $$
BEGIN
  -- This function will be used in rollback migration
  -- Implementation in separate rollback migration file
  RAISE NOTICE 'Rollback function for quotations status created';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 6.1 Migration: Unified Workflow Status Enum';
  RAISE NOTICE 'Created: workflow_status enum type';
  RAISE NOTICE 'Created: Mapping functions for status conversion';
  RAISE NOTICE 'Created: Verification functions';
  RAISE NOTICE 'Next: Apply migrations to individual tables';
END $$;

-- Run verification to show current state
SELECT * FROM verify_workflow_status_migration();

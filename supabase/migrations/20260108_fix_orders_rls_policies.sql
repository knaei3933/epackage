-- =====================================================
-- Migration: Fix Orders RLS Policies and Indexes - Column Name Mismatch
-- Purpose: Fix RLS policies and indexes to use correct column name (user_id instead of customer_id)
-- Created: 2026-01-08
-- =====================================================
--
-- The 20260104000001_enable_rls_on_core_tables.sql and 20260103000000_add_performance_indexes.sql
-- migrations incorrectly referenced customer_id instead of user_id in the orders table.
-- This migration fixes the policies and indexes to use the correct column name.
-- =====================================================

-- =====================================================
-- 1. Fix RLS Policies
-- =====================================================

-- Drop incorrect policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Recreate policies with correct column name (user_id)
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 2. Fix Performance Indexes
-- =====================================================

-- Drop incorrect indexes that reference customer_id
DROP INDEX IF EXISTS idx_orders_customer_status_created;
DROP INDEX IF EXISTS idx_orders_customer_created;

-- Recreate indexes with correct column name (user_id)
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created
  ON orders(user_id, status, created_at DESC)
  WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders(user_id, created_at DESC)
  WHERE status NOT IN ('DELETED', 'CANCELLED');

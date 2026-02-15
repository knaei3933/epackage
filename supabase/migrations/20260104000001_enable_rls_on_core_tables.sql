-- =====================================================
-- Migration: Enable Row Level Security (RLS) on Core Tables
-- Purpose: Database Security Enhancement
-- Created: 2026-01-04
-- Phase: 3 - Code Quality & Security
-- =====================================================
--
-- This migration enables RLS on all core business tables
-- that previously had RLS disabled or had incomplete policies.
--
-- RLS Policies follow these principles:
-- 1. Service role has full access (for backend operations)
-- 2. Admin users can read/write all data
-- 3. Regular users can only access their own data
-- 4. Authenticated users have read access to shared data
-- 5. Public access is restricted to necessary tables only
-- =====================================================

-- =====================================================
-- 1. Orders Table RLS
-- =====================================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;

-- Create new policies
CREATE POLICY "Service role full access orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- =====================================================
-- 2. Quotations Table RLS
-- =====================================================

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quotations" ON quotations;
DROP POLICY IF EXISTS "Admins can view all quotations" ON quotations;
DROP POLICY IF EXISTS "Service role full access quotations" ON quotations;

CREATE POLICY "Service role full access quotations"
  ON quotations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all quotations"
  ON quotations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view own quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create own quotations"
  ON quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- =====================================================
-- 3. Production Jobs Table RLS
-- =====================================================

ALTER TABLE production_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage production jobs" ON production_jobs;

CREATE POLICY "Service role full access production_jobs"
  ON production_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all production_jobs"
  ON production_jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view production_jobs for own orders"
  ON production_jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = production_jobs.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- =====================================================
-- 4. Shipments Table RLS
-- =====================================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access shipments"
  ON shipments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all shipments"
  ON shipments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view shipments for own orders"
  ON shipments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = shipments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- =====================================================
-- 5. Inventory Items Table RLS
-- =====================================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access inventory_items"
  ON inventory_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all inventory_items"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Authenticated users can view inventory_items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 6. Sample Requests Table RLS
-- =====================================================

ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access sample_requests"
  ON sample_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all sample_requests"
  ON sample_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view own sample_requests"
  ON sample_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sample_requests"
  ON sample_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 7. Contracts Table RLS
-- =====================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access contracts"
  ON contracts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all contracts"
  ON contracts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view own contracts"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can sign own contracts"
  ON contracts
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- =====================================================
-- 8. Contact Submissions Table RLS
-- =====================================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access contact_submissions"
  ON contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all contact_submissions"
  ON contact_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Authenticated users can create contact_submissions"
  ON contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 9. Products Table RLS (Public Read)
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Public and authenticated users can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- 10. Notifications Table RLS
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access notifications"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_name text;
  rls_enabled bool;
  count int := 0;
BEGIN
  RAISE NOTICE 'RLS Status for Core Tables:';
  RAISE NOTICE '================================';

  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('orders', 'quotations', 'production_jobs', 'shipments',
                      'inventory_items', 'sample_requests', 'contracts',
                      'contact_submissions', 'products', 'notifications')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;

    IF rls_enabled THEN
      RAISE NOTICE '✓ %: RLS ENABLED', table_name;
      count := count + 1;
    ELSE
      RAISE NOTICE '✗ %: RLS NOT ENABLED', table_name;
    END IF;
  END LOOP;

  RAISE NOTICE '================================';
  RAISE NOTICE 'Total tables with RLS enabled: %', count;
  RAISE NOTICE 'Migration completed successfully!';
END $$;

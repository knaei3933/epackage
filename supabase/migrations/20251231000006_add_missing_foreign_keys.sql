-- =====================================================
-- Migration: Add Missing Foreign Keys (Phase 6)
-- Purpose: Add missing foreign key relationships
-- Created: 2025-12-31
-- =====================================================
-- This migration adds:
-- 1. Foreign key from orders to companies
-- 2. Foreign key from quotations to companies
-- 3. Foreign key from order_items to products
-- 4. Foreign key from quotation_items to products
-- 5. Associated indexes for performance

-- =====================================================
-- 1. Add Company Foreign Key to Orders Table
-- =====================================================

-- Add company_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN company_id UUID;

    RAISE NOTICE 'Added company_id column to orders table';
  END IF;
END $$;

-- Create foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'orders'
    AND constraint_name = 'orders_company_id_fkey'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_company_id_fkey
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE SET NULL;

    RAISE NOTICE 'Added foreign key constraint: orders.company_id -> companies.id';
  END IF;
END $$;

-- Create index for company_id
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id)
  WHERE company_id IS NOT NULL;

-- =====================================================
-- 2. Add Company Foreign Key to Quotations Table
-- =====================================================

-- Add company_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'quotations'
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE quotations ADD COLUMN company_id UUID;

    RAISE NOTICE 'Added company_id column to quotations table';
  END IF;
END $$;

-- Create foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'quotations'
    AND constraint_name = 'quotations_company_id_fkey'
  ) THEN
    ALTER TABLE quotations
    ADD CONSTRAINT quotations_company_id_fkey
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE SET NULL;

    RAISE NOTICE 'Added foreign key constraint: quotations.company_id -> companies.id';
  END IF;
END $$;

-- Create index for company_id
CREATE INDEX IF NOT EXISTS idx_quotations_company_id ON quotations(company_id)
  WHERE company_id IS NOT NULL;

-- =====================================================
-- 3. Add Product Foreign Key to Order Items Table
-- =====================================================

-- Note: product_id already exists as TEXT, need to ensure it's properly typed
-- For now, we'll create a constraint that validates the product_id exists

-- Create a check function for product_id validation
CREATE OR REPLACE FUNCTION validate_order_item_product_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If product_id is not null, verify it exists in products table
  IF NEW.product_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM products WHERE id::TEXT = NEW.product_id
    ) THEN
      RAISE EXCEPTION 'Product ID % does not exist in products table', NEW.product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_order_item_product_id_trigger ON order_items;
CREATE TRIGGER validate_order_item_product_id_trigger
  BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_item_product_id();

-- Note: We keep product_id as TEXT to avoid breaking existing data
-- but the trigger ensures referential integrity

-- =====================================================
-- 4. Add Product Foreign Key to Quotation Items Table
-- =====================================================

-- Create validation trigger for quotation_items
CREATE OR REPLACE FUNCTION validate_quotation_item_product_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If product_id is not null, verify it exists in products table
  IF NEW.product_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM products WHERE id::TEXT = NEW.product_id
    ) THEN
      RAISE EXCEPTION 'Product ID % does not exist in products table', NEW.product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_quotation_item_product_id_trigger ON quotation_items;
CREATE TRIGGER validate_quotation_item_product_id_trigger
  BEFORE INSERT OR UPDATE ON quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_quotation_item_product_id();

-- =====================================================
-- 5. Create Composite Indexes for Common Queries
-- =====================================================

-- Orders by company and status
CREATE INDEX IF NOT EXISTS idx_orders_company_status
  ON orders(company_id, status)
  WHERE company_id IS NOT NULL;

-- Quotations by company and status
CREATE INDEX IF NOT EXISTS idx_quotations_company_status
  ON quotations(company_id, status)
  WHERE company_id IS NOT NULL;

-- Order items with product lookup
CREATE INDEX IF NOT EXISTS idx_order_items_product_lookup
  ON order_items(product_id)
  WHERE product_id IS NOT NULL;

-- Quotation items with product lookup
CREATE INDEX IF NOT EXISTS idx_quotation_items_product_lookup
  ON quotation_items(product_id)
  WHERE product_id IS NOT NULL;

-- =====================================================
-- 6. Add Helper Functions for Relationship Queries
-- =====================================================

-- Function: Get orders by company
CREATE OR REPLACE FUNCTION get_orders_by_company(
  p_company_id UUID,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  status TEXT,
  total_amount NUMERIC,
  customer_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.order_number,
    o.status,
    o.total_amount,
    o.customer_name,
    o.created_at
  FROM orders o
  WHERE o.company_id = p_company_id
    AND (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC;
END;
$$;

-- Function: Get quotations by company
CREATE OR REPLACE FUNCTION get_quotations_by_company(
  p_company_id UUID,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  quotation_id UUID,
  quotation_number TEXT,
  status TEXT,
  total_amount NUMERIC,
  customer_name TEXT,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id AS quotation_id,
    q.quotation_number,
    q.status,
    q.total_amount,
    q.customer_name,
    q.valid_until,
    q.created_at
  FROM quotations q
  WHERE q.company_id = p_company_id
    AND (p_status IS NULL OR q.status = p_status)
  ORDER BY q.created_at DESC;
END;
$$;

-- Function: Link company to order (if user has company profile)
CREATE OR REPLACE FUNCTION link_company_to_order(p_order_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  company_id UUID,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order orders;
  v_user_profiles profiles;
BEGIN
  -- Get order and user profile
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Order not found'::TEXT;
    RETURN;
  END IF;

  -- Skip if already linked
  IF v_order.company_id IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, v_order.company_id,
      'Order already linked to company'::TEXT;
    RETURN;
  END IF;

  -- Get user's company
  SELECT * INTO v_user_profiles
  FROM profiles
  WHERE id = v_order.user_id
    AND business_type = 'CORPORATION'
    AND company_name IS NOT NULL;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID,
      'User does not have a company profile'::TEXT;
    RETURN;
  END IF;

  -- Find or create company record
  -- (This assumes company_name matching - you may want to add corporate_number)
  -- For now, we'll link by company name

  -- Update order with company_id
  -- Note: In real implementation, you'd match by corporate_number
  UPDATE orders
  SET company_id = (
    SELECT id FROM companies
    WHERE name = v_user_profiles.company_name
    LIMIT 1
  )
  WHERE id = p_order_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, (
      SELECT company_id FROM orders WHERE id = p_order_id
    ), 'Company linked to order'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::UUID,
      'Company not found in companies table'::TEXT;
  END IF;
END;
$$;

-- =====================================================
-- 7. Grant Permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION validate_order_item_product_id TO authenticated;
GRANT EXECUTE ON FUNCTION validate_quotation_item_product_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_by_company TO authenticated;
GRANT EXECUTE ON FUNCTION get_quotations_by_company TO authenticated;
GRANT EXECUTE ON FUNCTION link_company_to_order TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Add Missing Foreign Keys';
  RAISE NOTICE 'Foreign keys added:';
  RAISE NOTICE '  - orders.company_id -> companies.id';
  RAISE NOTICE '  - quotations.company_id -> companies.id';
  RAISE NOTICE '  - order_items.product_id (validation trigger)';
  RAISE NOTICE '  - quotation_items.product_id (validation trigger)';
  RAISE NOTICE 'Indexes created: 6 indexes';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - validate_order_item_product_id() (trigger function)';
  RAISE NOTICE '  - validate_quotation_item_product_id() (trigger function)';
  RAISE NOTICE '  - get_orders_by_company()';
  RAISE NOTICE '  - get_quotations_by_company()';
  RAISE NOTICE '  - link_company_to_order()';
END $$;

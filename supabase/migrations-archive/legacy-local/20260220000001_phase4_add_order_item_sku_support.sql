-- =====================================================
-- Migration: Phase 4 - Add order_item_id and sku_name support
-- Description: Link design revisions and files to order items, display SKU names
-- Created: 2026-02-20
-- =====================================================

-- =====================================================
-- Part 1: Add sku_name to order_items table
-- =====================================================

-- Add sku_name column to order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS sku_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN order_items.sku_name IS 'SKU name for the product item (e.g., EPAC-001)';

-- Create index for sku_name queries
CREATE INDEX IF NOT EXISTS idx_order_items_sku_name ON order_items(sku_name);

-- =====================================================
-- Part 2: Add order_item_id to design_revisions table
-- =====================================================

-- Add order_item_id column to design_revisions
ALTER TABLE design_revisions
ADD COLUMN IF NOT EXISTS order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL;

-- Add sku_name snapshot column (denormalized for performance)
ALTER TABLE design_revisions
ADD COLUMN IF NOT EXISTS sku_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN design_revisions.order_item_id IS 'Reference to order_items table (links revision to specific item)';
COMMENT ON COLUMN design_revisions.sku_name IS 'SKU name snapshot (denormalized for performance)';

-- Create index for order_item_id queries
CREATE INDEX IF NOT EXISTS idx_design_revisions_order_item_id ON design_revisions(order_item_id);

-- =====================================================
-- Part 3: Add order_item_id to files table
-- =====================================================

-- Add order_item_id column to files
ALTER TABLE files
ADD COLUMN IF NOT EXISTS order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL;

-- Add sku_name snapshot column (denormalized for performance)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS sku_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN files.order_item_id IS 'Reference to order_items table (links file to specific item)';
COMMENT ON COLUMN files.sku_name IS 'SKU name snapshot (denormalized for performance)';

-- Create index for order_item_id queries
CREATE INDEX IF NOT EXISTS idx_files_order_item_id ON files(order_item_id);

-- =====================================================
-- Part 4: Update RLS policies to handle order_item_id
-- =====================================================

-- Drop existing policies for design_revisions
DROP POLICY IF EXISTS "Users can view own order design revisions" ON design_revisions;

-- Recreate policy to allow viewing through order_item relationship
CREATE POLICY "Users can view own order design revisions"
  ON design_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = design_revisions.order_id
      AND orders.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = design_revisions.order_item_id
      AND o.user_id = auth.uid()
    )
  );

-- =====================================================
-- Part 5: Helper function to get SKU name from order_item
-- =====================================================

-- Function to get SKU name for an order item
CREATE OR REPLACE FUNCTION get_item_sku_name(item_id UUID)
RETURNS TEXT AS $$
DECLARE
  sku_name TEXT;
BEGIN
  SELECT sku_name INTO sku_name
  FROM order_items
  WHERE id = item_id;

  RETURN sku_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Part 6: Trigger to auto-populate sku_name snapshot
-- =====================================================

-- Trigger function for design_revisions
CREATE OR REPLACE FUNCTION populate_design_revision_sku_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate sku_name from order_item if not provided
  IF NEW.order_item_id IS NOT NULL AND (NEW.sku_name IS NULL OR NEW.sku_name = '') THEN
    NEW.sku_name := get_item_sku_name(NEW.order_item_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for design_revisions
DROP TRIGGER IF EXISTS trigger_populate_design_revision_sku_name ON design_revisions;
CREATE TRIGGER trigger_populate_design_revision_sku_name
  BEFORE INSERT OR UPDATE OF order_item_id ON design_revisions
  FOR EACH ROW
  EXECUTE FUNCTION populate_design_revision_sku_name();

-- Trigger function for files
CREATE OR REPLACE FUNCTION populate_file_sku_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate sku_name from order_item if not provided
  IF NEW.order_item_id IS NOT NULL AND (NEW.sku_name IS NULL OR NEW.sku_name = '') THEN
    NEW.sku_name := get_item_sku_name(NEW.order_item_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for files
DROP TRIGGER IF EXISTS trigger_populate_file_sku_name ON files;
CREATE TRIGGER trigger_populate_file_sku_name
  BEFORE INSERT OR UPDATE OF order_item_id ON files
  FOR EACH ROW
  EXECUTE FUNCTION populate_file_sku_name();

-- =====================================================
-- Part 7: Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON order_items TO authenticated;

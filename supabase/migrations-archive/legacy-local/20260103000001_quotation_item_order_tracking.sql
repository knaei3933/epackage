-- Migration: Quotation Item to Order Tracking
-- Description: Add order_id column to quotation_items to track which items have been converted to orders
-- Date: 2026-01-03

-- Add order_id column to quotation_items table
-- This allows us to track which quotation items have been ordered
-- and prevent duplicate orders from being created
ALTER TABLE quotation_items
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN quotation_items.order_id IS 'Reference to the order created from this quotation item. NULL if item has not been ordered yet.';

-- Create index for efficient lookups of ordered items
-- Partial index only includes items that have been ordered (order_id IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_quotation_items_order
ON quotation_items(order_id)
WHERE order_id IS NOT NULL;

-- Create unique index to prevent duplicate orders
-- This ensures a quotation item can only be ordered once
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotation_items_unique_order
ON quotation_items(id)
WHERE order_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON INDEX idx_quotation_items_order IS 'Index for efficient lookup of quotation items that have been converted to orders';
COMMENT ON INDEX idx_quotation_items_unique_order IS 'Prevents duplicate orders from the same quotation item';

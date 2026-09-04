-- =====================================================
-- Add Manual Discount Columns to Orders Table
-- =====================================================
-- 手動割引機能用カラムの追加
-- 管理者が注文に対して手動で割引率(%)を適用できるようにする

-- Add manual discount columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS manual_discount_percentage DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN orders.manual_discount_percentage IS 'Manual discount percentage (0-100) applied by admin';
COMMENT ON COLUMN orders.manual_discount_amount IS 'Calculated manual discount amount based on percentage';

-- Create index for orders with manual discounts (useful for reporting)
CREATE INDEX IF NOT EXISTS idx_orders_manual_discount ON orders(manual_discount_percentage)
WHERE manual_discount_percentage > 0;

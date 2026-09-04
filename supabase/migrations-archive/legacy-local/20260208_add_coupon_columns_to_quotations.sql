-- =====================================================
-- Add Coupon Columns to Quotations Table
-- =====================================================
-- Purpose: Support coupon application on quotations
-- Features: Track applied coupon, discount amount, and discount type

-- Add coupon-related columns to quotations table
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping'));

-- Add index for coupon lookups
CREATE INDEX IF NOT EXISTS idx_quotations_coupon_id ON quotations(coupon_id);

-- Add comments
COMMENT ON COLUMN quotations.coupon_id IS 'Applied coupon reference (NULL if no coupon used)';
COMMENT ON COLUMN quotations.discount_amount IS 'Total discount amount applied (in JPY)';
COMMENT ON COLUMN quotations.discount_type IS 'Type of discount applied: percentage, fixed_amount, or free_shipping';

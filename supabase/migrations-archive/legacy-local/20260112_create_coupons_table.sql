-- ============================================
-- Coupons Table
-- ============================================
-- Purpose: Manage discount coupons for quotations and orders
-- Features: Percentage, fixed amount, and free shipping coupons

-- Create enums
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE coupon_status AS ENUM ('active', 'inactive', 'expired', 'scheduled');

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ja TEXT,
  description TEXT,
  description_ja TEXT,
  type coupon_type NOT NULL DEFAULT 'percentage',
  value NUMERIC NOT NULL,
  minimum_order_amount NUMERIC DEFAULT 0,
  maximum_discount_amount NUMERIC,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  max_uses_per_customer INTEGER DEFAULT 1,
  status coupon_status DEFAULT 'active',
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  applicable_customers UUID[] DEFAULT NULL,
  applicable_customer_types TEXT[] DEFAULT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_type ON coupons(type);
CREATE INDEX idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX idx_coupons_applicable_customers ON coupons USING GIN(applicable_customers);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins manage, customers view only active coupons
CREATE POLICY "Anyone can view active coupons by code"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can view all coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert coupons"
  ON coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete coupons"
  ON coupons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant access to service role
GRANT ALL ON coupons TO service_role;

-- Add comments
COMMENT ON TABLE coupons IS 'Discount coupons for quotations and orders';
COMMENT ON COLUMN coupons.code IS 'Unique coupon code entered by customers';
COMMENT ON COLUMN coupons.type IS 'percentage: % discount, fixed_amount: fixed JPY amount, free_shipping: free delivery';
COMMENT ON COLUMN coupons.applicable_customers IS 'Array of customer UUIDs who can use this coupon (NULL = all customers)';
COMMENT ON COLUMN coupons.max_uses_per_customer IS 'Maximum times a single customer can use this coupon';

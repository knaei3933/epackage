-- ============================================
-- Coupon Usage Tracking Table
-- ============================================
-- Purpose: Track coupon usage for analytics and fraud prevention
-- Features: Links to quotations and orders, stores discount amounts

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  discount_amount NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  final_amount NUMERIC NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quotation_id)
);

-- Add indexes for analytics and queries
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_order_id ON coupon_usage(order_id);
CREATE INDEX idx_coupon_usage_quotation_id ON coupon_usage(quotation_id);
CREATE INDEX idx_coupon_usage_used_at ON coupon_usage(used_at);

-- Enable RLS
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users see their own usage, admins see all
CREATE POLICY "Users can view their own coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert coupon usage"
  ON coupon_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Application logic controls this

-- Grant access to service role
GRANT ALL ON coupon_usage TO service_role;

-- Add comments
COMMENT ON TABLE coupon_usage IS 'Track when coupons are used and by whom';
COMMENT ON COLUMN coupon_usage.discount_amount IS 'Amount discounted (in JPY)';
COMMENT ON COLUMN coupon_usage.original_amount IS 'Original amount before discount';
COMMENT ON COLUMN coupon_usage.final_amount IS 'Final amount after discount';

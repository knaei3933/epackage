-- Add customer snapshot columns to orders table
-- These columns store customer information at the time of order

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN orders.customer_name IS 'Customer name snapshot at order time';
COMMENT ON COLUMN orders.customer_email IS 'Customer email snapshot at order time';
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone number snapshot at order time';
COMMENT ON COLUMN orders.subtotal IS 'Order subtotal before tax';
COMMENT ON COLUMN orders.tax_amount IS 'Consumption tax amount (10%)';

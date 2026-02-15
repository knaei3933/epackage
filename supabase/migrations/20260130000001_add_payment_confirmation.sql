-- Add payment confirmation columns to orders table
-- This migration adds fields to track when payment is confirmed and the amount

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50); -- 'bank_transfer', 'credit_card', etc.

-- Add comment for documentation
COMMENT ON COLUMN orders.payment_confirmed_at IS 'Timestamp when payment was confirmed by admin';
COMMENT ON COLUMN orders.payment_amount IS 'Amount of payment received';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used (bank_transfer, credit_card, etc.)';

-- Create index for filtering orders by payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_confirmed ON orders(payment_confirmed_at)
WHERE payment_confirmed_at IS NOT NULL;

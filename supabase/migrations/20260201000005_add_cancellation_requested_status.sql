-- Add cancellation_requested status to orders
-- This allows customers to request cancellation, requiring admin approval

-- Add new status to the check constraint if it exists
DO $$
BEGIN
    -- Check if the orders table has a check constraint for status
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'orders_status_check'
    ) THEN
        -- Drop the old constraint
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    END IF;
END $$;

-- Add new check constraint with cancellation_requested
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN (
    'pending',
    'quotation',
    'data_received',
    'work_order',
    'contract_sent',
    'manufacturing',
    'ready',
    'shipped',
    'delivered',
    'cancelled',
    'cancellation_requested'
));

-- Add column to track cancellation request details
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cancellation_requested_by UUID REFERENCES profiles(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT DEFAULT NULL;

-- Add index for faster queries of cancellation requests
CREATE INDEX IF NOT EXISTS idx_orders_cancellation_requested
ON orders(status)
WHERE status = 'cancellation_requested';

-- Add comment
COMMENT ON COLUMN orders.status IS 'Order status: pending, quotation, data_received, work_order, contract_sent, manufacturing, ready, shipped, delivered, cancelled, cancellation_requested';
COMMENT ON COLUMN orders.cancellation_requested_at IS 'Timestamp when cancellation was requested by customer';
COMMENT ON COLUMN orders.cancellation_requested_by IS 'User ID who requested the cancellation';
COMMENT ON COLUMN orders.cancellation_reason IS 'Reason for cancellation request';

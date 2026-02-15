-- =====================================================
-- Epackage Lab Orders Table - B2B Extension
-- 주문 테이블 B2B 확장 (Orders Table Extension for B2B)
-- =====================================================

-- First, create new order status enum for B2B workflow
CREATE TYPE b2b_order_status AS ENUM (
  'PENDING',           -- 대기중 (Pending)
  'QUOTATION',         -- 견적 중 (Quotation phase)
  'DATA_RECEIVED',     -- 데이터 수령 완료 (Data received)
  'WORK_ORDER',        -- 작업표준서 생성 완료 (Work order created)
  'CONTRACT_SENT',     -- 계약서 송부 완료 (Contract sent)
  'CONTRACT_SIGNED',   -- 계약서 서명 완료 (Contract signed)
  'PRODUCTION',        -- 생산 중 (In production)
  'STOCK_IN',          -- 입고 완료 (Stocked in)
  'SHIPPED',           -- 출하 완료 (Shipped)
  'DELIVERED',         -- 배송 완료 (Delivered)
  'CANCELLED'          -- 취소됨 (Cancelled)
);

-- =====================================================
-- Add new columns to orders table
-- =====================================================

-- Add company_id foreign key
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Add quotation_id foreign key (link to approved quotation)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL;

-- Add customer snapshot data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT NOT NULL DEFAULT '';

-- Add state machine columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS current_state TEXT DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state_metadata JSONB;

-- Add index for company_id
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);

-- Add index for quotation_id
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders(quotation_id);

-- Add index for current_state
CREATE INDEX IF NOT EXISTS idx_orders_current_state ON orders(current_state);

-- =====================================================
-- Update existing orders to use new status type
-- =====================================================

-- Migrate existing status values to new B2B status enum
-- This requires rebuilding the status column

-- Step 1: Add new column with new type
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_new b2b_order_status;

-- Step 2: Migrate data from old status to new status
UPDATE orders
SET status_new = status::text::b2b_order_status;

-- Step 3: Drop old status column and rename new one
ALTER TABLE orders DROP COLUMN IF EXISTS status;
ALTER TABLE orders RENAME COLUMN status_new TO status;

-- =====================================================
-- Helper Functions for B2B Order Workflow
-- =====================================================

-- Function to advance order state
CREATE OR REPLACE FUNCTION advance_order_state(
  order_uuid UUID,
  new_state TEXT,
  metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET current_state = new_state,
      state_metadata = COALESCE(metadata, '{}'::jsonb),
      updated_at = NOW()
  WHERE id = order_uuid;

  -- Log status change
  INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
  SELECT order_uuid, current_state, new_state, auth.uid(), NULL
  FROM orders
  WHERE id = order_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create order from approved quotation
CREATE OR REPLACE FUNCTION create_order_from_quotation(quotation_uuid UUID)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  quotation_data quotations;
  order_number_text TEXT;
BEGIN
  -- Get quotation data
  SELECT * INTO quotation_data
  FROM quotations
  WHERE id = quotation_uuid AND status = 'APPROVED';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found or not approved', quotation_uuid;
  END IF;

  -- Check if order already exists
  SELECT id INTO new_order_id FROM orders WHERE quotation_id = quotation_uuid;
  IF new_order_id IS NOT NULL THEN
    RAISE EXCEPTION 'Order already exists for quotation %', quotation_uuid;
  END IF;

  -- Generate order number (ORD-YYYY-NNNN format)
  order_number_text := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Create order
  INSERT INTO orders (
    user_id,
    company_id,
    quotation_id,
    order_number,
    status,
    current_state,
    total_amount,
    customer_name,
    customer_email
  )
  VALUES (
    quotation_data.user_id,
    quotation_data.company_id,
    quotation_uuid,
    order_number_text,
    'QUOTATION',
    'quotation_approved',
    quotation_data.total_amount,
    quotation_data.customer_name,
    quotation_data.customer_email
  )
  RETURNING id INTO new_order_id;

  -- Update quotation status
  UPDATE quotations
  SET status = 'CONVERTED'
  WHERE id = quotation_uuid;

  -- Copy quotation items to order items
  INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, specifications)
  SELECT new_order_id, product_id, product_name, quantity, unit_price, specifications
  FROM quotation_items
  WHERE quotation_id = quotation_uuid;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order timeline
CREATE OR REPLACE FUNCTION get_order_timeline(order_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  timeline JSONB;
BEGIN
  SELECT jsonb_build_object(
    'order_id', id,
    'order_number', order_number,
    'status', status,
    'current_state', current_state,
    'state_metadata', state_metadata,
    'created_at', created_at,
    'updated_at', updated_at,
    'status_history', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'from_status', from_status,
          'to_status', to_status,
          'changed_at', changed_at,
          'reason', reason
        ) ORDER BY changed_at ASC
      )
      FROM order_status_history
      WHERE order_id = order_uuid
    )
  ) INTO timeline
  FROM orders
  WHERE id = order_uuid;

  RETURN timeline;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON orders TO authenticated;
GRANT ALL ON orders TO authenticated;

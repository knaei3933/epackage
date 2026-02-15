-- =====================================================
-- Migration: External Order Receipt & Payment Confirmation
-- Purpose: API endpoints for receiving external orders and payment confirmations
-- Created: 2026-01-05
-- =====================================================
-- This migration creates RPC functions for:
-- 1. create_external_order - Create order from external source
-- 2. Payment confirmation records table (if not exists)
--
-- These functions support the P2-12 and P2-13 tasks for
-- order data receipt and payment confirmation APIs.

-- =====================================================
-- Table: payment_confirmations (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'paypal', 'square', 'stripe', 'sb_payment', 'other')),
  payment_gateway VARCHAR(50) NOT NULL CHECK (payment_gateway IN ('square', 'stripe', 'paypal', 'sb_payment', 'manual', 'none')),
  payment_date TIMESTAMPTZ NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'JPY',
  reference_number VARCHAR(255),
  transaction_id VARCHAR(255),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund')),
  gateway_response JSONB,
  notes TEXT,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for payment_confirmations
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_order_id ON payment_confirmations(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_quotation_id ON payment_confirmations(quotation_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_transaction_id ON payment_confirmations(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_reference_number ON payment_confirmations(reference_number) WHERE reference_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status_date ON payment_confirmations(status, payment_date DESC);

-- Add updated_at trigger
CREATE TRIGGER update_payment_confirmations_updated_at
  BEFORE UPDATE ON payment_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RPC Function: create_external_order
-- =====================================================

CREATE OR REPLACE FUNCTION create_external_order(
  p_order_number VARCHAR(50),
  p_user_id UUID,
  p_company_id UUID DEFAULT NULL,
  p_quotation_id UUID DEFAULT NULL,
  p_customer_name VARCHAR(255),
  p_customer_email VARCHAR(255),
  p_payment_term VARCHAR(20) CHECK (p_payment_term IN ('credit', 'advance')),
  p_subtotal NUMERIC(12, 2),
  p_tax_amount NUMERIC(12, 2),
  p_total_amount NUMERIC(12, 2),
  p_shipping_address JSONB DEFAULT NULL,
  p_billing_address JSONB DEFAULT NULL,
  p_requested_delivery_date TIMESTAMPTZ DEFAULT NULL,
  p_delivery_notes TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  order_id UUID,
  order_number VARCHAR(50),
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_order_id UUID;
  v_new_order_id UUID;
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_item JSONB;
BEGIN
  -- Initialize return values
  success := false;
  order_id := NULL;
  order_number := NULL;
  error_message := NULL;

  -- =====================================================
  -- Validation Phase
  -- =====================================================

  -- Check if order number already exists
  SELECT id INTO v_existing_order_id
  FROM orders
  WHERE order_number = p_order_number
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    success := true;
    order_id := v_existing_order_id;
    order_number := p_order_number;
    error_message := '이미 주문이 존재합니다.';
    RETURN NEXT;
    RETURN;
  END IF;

  -- =====================================================
  -- Transaction Phase
  -- =====================================================

  BEGIN
    -- 1. Create order record
    INSERT INTO orders (
      user_id,
      company_id,
      quotation_id,
      order_number,
      status,
      payment_term,
      subtotal,
      tax_amount,
      total_amount,
      customer_name,
      customer_email,
      shipping_address,
      billing_address,
      requested_delivery_date,
      delivery_notes,
      notes,
      current_state,
      state_metadata
    ) VALUES (
      p_user_id,
      p_company_id,
      p_quotation_id,
      p_order_number,
      'PENDING',
      p_payment_term,
      p_subtotal,
      p_tax_amount,
      p_total_amount,
      p_customer_name,
      p_customer_email,
      p_shipping_address,
      p_billing_address,
      p_requested_delivery_date,
      p_delivery_notes,
      p_notes,
      'PENDING',
      '{"source": "external_api"}'::JSONB
    )
    RETURNING id INTO v_new_order_id;

    -- 2. Create order items
    IF jsonb_array_length(p_items) > 0 THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
      LOOP
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications,
          notes
        ) VALUES (
          v_new_order_id,
          v_item->>'product_id',
          v_item->>'product_name',
          (v_item->>'quantity')::INTEGER,
          (v_item->>'unit_price')::NUMERIC(12,2),
          (v_item->>'total_price')::NUMERIC(12,2),
          v_item->'specifications',
          v_item->>'notes'
        );
      END LOOP;
    END IF;

    -- 3. Create order status history entry
    INSERT INTO order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      changed_at,
      reason,
      metadata
    ) VALUES (
      v_new_order_id,
      NULL,
      'PENDING',
      p_user_id,
      NOW(),
      'External order received via API',
      '{"source": "external_api"}'::JSONB
    );

    -- If all succeeded, set success to true
    success := true;
    order_id := v_new_order_id;
    order_number := p_order_number;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback happens automatically
      success := false;
      error_message := SQLERRM;
      RAISE NOTICE 'Error creating external order: %', SQLERRM;
  END;

  RETURN NEXT;
  RETURN;
END;
$$;

-- =====================================================
-- Helper Function: Update Order Status on Payment
-- =====================================================

CREATE OR REPLACE FUNCTION update_order_status_on_payment(
  p_order_id UUID,
  p_payment_status VARCHAR(50)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_status VARCHAR(50);
BEGIN
  -- Get current order status
  SELECT status INTO v_current_status
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update order status based on payment status
  IF p_payment_status = 'completed' AND v_current_status = 'PENDING' THEN
    UPDATE orders
    SET
      status = 'QUOTATION',
      current_state = 'QUOTATION',
      updated_at = NOW()
    WHERE id = p_order_id;

    -- Create status history entry
    INSERT INTO order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      changed_at,
      reason
    ) VALUES (
      p_order_id,
      v_current_status,
      'QUOTATION',
      'SYSTEM',
      NOW(),
      'Payment confirmed'
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- =====================================================
-- Trigger: Auto-update order status when payment confirmed
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_order_payment_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if payment is completed and order_id exists
  IF NEW.status = 'completed' AND NEW.order_id IS NOT NULL THEN
    PERFORM update_order_status_on_payment(NEW.order_id, NEW.status);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER order_payment_confirmation_trigger
  AFTER INSERT ON payment_confirmations
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trigger_order_payment_confirmation();

-- =====================================================
-- Grant permissions
-- =====================================================

-- Allow authenticated service role to execute functions
GRANT EXECUTE ON FUNCTION create_external_order TO service_role;
GRANT EXECUTE ON FUNCTION update_order_status_on_payment TO service_role;

-- Allow anon/authenticated roles to create payment confirmations (for webhooks)
GRANT INSERT ON payment_confirmations TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION update_order_status_on_payment TO anon;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON FUNCTION create_external_order IS 'Creates an order from external API source with transaction-safe handling';
COMMENT ON FUNCTION update_order_status_on_payment IS 'Updates order status when payment is confirmed';
COMMENT ON TABLE payment_confirmations IS 'Stores payment confirmation records from payment gateways';
COMMENT ON TRIGGER order_payment_confirmation_trigger ON payment_confirmations IS 'Automatically updates order status when payment is completed';

-- =====================================================
-- Migration: Create purchase_orders table
-- Created: 2026-07-05
-- Purpose: Audit trail for manufacturer purchase-order emails sent on order conversion.
--          Stores manufacturer cost (원가×1.4 + international shipping) and full payload,
--          so PO emails are verifiable and re-sendable. Sales price is NEVER stored here.
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Manufacturer destination (placeholder; real address configured in code)
  manufacturer_email TEXT NOT NULL,

  -- Manufacturer cost snapshot (JPY). manufacturer_amount = baseCost×1.4 + international shipping.
  -- Domestic-JP shipping (1600 JPY/box) is intentionally excluded from the PO amount.
  manufacturer_amount_jpy NUMERIC(12, 2) NOT NULL DEFAULT 0,
  base_cost_jpy NUMERIC(12, 2) NOT NULL DEFAULT 0,
  manufacturing_margin_jpy NUMERIC(12, 2) NOT NULL DEFAULT 0,
  intl_shipping_jpy NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Full email payload (specs + calculation formulas) for audit / resend
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Send tracking
  sent_at TIMESTAMPTZ,
  send_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_quotation_id ON purchase_orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_id ON purchase_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_sent_at ON purchase_orders(sent_at);

-- updated_at trigger (reuse pattern from other tables if a shared trigger exists; else inline)
CREATE OR REPLACE FUNCTION set_purchase_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_purchase_orders_updated_at();

-- Row Level Security
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Users can see POs for their own quotations/orders
CREATE POLICY "Users can view own purchase orders"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotations q
      WHERE q.id = purchase_orders.quotation_id
      AND q.user_id = auth.uid()
    )
  );

-- Service role bypasses RLS (used by the convert API)

COMMENT ON TABLE purchase_orders IS 'Manufacturer purchase-order audit log. Stores manufacturer cost (not sales price) and email payload for each order conversion.';
COMMENT ON COLUMN purchase_orders.manufacturer_amount_jpy IS 'Manufacturer cost = base_cost × 1.4 + international shipping. Domestic JP shipping excluded.';
COMMENT ON COLUMN purchase_orders.payload IS 'Full email payload: product specs + every calculation formula (film width, print meters, columns, unit prices, margins, duty, shipping).';

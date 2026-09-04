-- =====================================================
-- Shipment Processing System Migration
-- For Epackage Lab Japanese B2B System
-- =====================================================

-- Carrier types enum
CREATE TYPE carrier_type AS ENUM (
  'yamato',      -- ヤマト運輸 (宅急便)
  'sagawa',      -- 佐川急便
  'jp_post',     -- 日本郵便
  'seino'        -- 西濃運輸
);

-- Shipment status enum
CREATE TYPE shipment_status AS ENUM (
  'pending',           -- 待機中 (awaiting pickup)
  'picked_up',         -- 引渡済み (carrier picked up)
  'in_transit',        -- 輸送中 (on the way)
  'out_for_delivery',  -- 配達中 (out for delivery)
  'delivered',         -- 配達完了 (delivered)
  'failed',            -- 配達失敗 (delivery failed)
  'returned'           -- 返品 (returned)
);

-- Service types for Japanese carriers
CREATE TYPE shipping_service_type AS ENUM (
  'cool',        -- クール宅急便 (refrigerated)
  'takkyubin',   -- 宅急便 (regular room temperature)
  'regular',     -- 通常便
  'mail'         -- メール便 (small packet)
);

-- Delivery time slots (Japanese business requirement)
CREATE TYPE delivery_time_slot AS ENUM (
  'none',        -- 指定なし (no preference)
  'morning',     -- 午前 (8-12)
  '12_14',       -- 12-14時
  '14_16',       -- 14-16時
  '16_18',       -- 16-18時
  '18_20',       -- 18-20時
  '19_21'        -- 19-21時
);

-- Main shipments table
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,

  -- Order reference
  order_id UUID REFERENCES orders(id) NOT NULL,

  -- Carrier information
  carrier carrier_type NOT NULL,
  service_type shipping_service_type NOT NULL DEFAULT 'takkyubin',
  tracking_number TEXT,

  -- Package details
  package_count INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC(6,2),
  dimensions_cm JSONB, -- {length: number, width: number, height: number}

  -- Delivery preferences
  delivery_time_slot delivery_time_slot DEFAULT 'none',
  delivery_date_request DATE, -- Requested delivery date

  -- Addresses
  shipping_address JSONB NOT NULL, -- {name, postal_code, prefecture, city, address, building, phone}

  -- Sender information
  sender_address JSONB NOT NULL, -- Warehouse/sender address

  -- Dates
  pickup_scheduled_for TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Status
  status shipment_status NOT NULL DEFAULT 'pending',

  -- Tracking data
  tracking_data JSONB DEFAULT '{}', -- Store carrier API responses

  -- Documents
  shipping_label_url TEXT,
  commercial_invoice_url TEXT,
  pickup_slip_url TEXT,

  -- Pricing
  shipping_cost NUMERIC(10,2),
  cod_amount NUMERIC(10,2), -- Cash on delivery amount if applicable

  -- Notes
  internal_notes TEXT,
  customer_notes TEXT,
  carrier_notes TEXT, -- Notes from carrier

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validation constraints
  CONSTRAINT valid_weight CHECK (weight_kg IS NULL OR weight_kg > 0),
  CONSTRAINT valid_package_count CHECK (package_count > 0),
  CONSTRAINT valid_status_transition CHECK (
    (status = 'pending' AND picked_up_at IS NULL) OR
    (status = 'picked_up' AND picked_up_at IS NOT NULL) OR
    (status IN ('in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'))
  )
);

-- Indexes for performance
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_carrier ON shipments(carrier);
CREATE INDEX idx_shipments_pickup_scheduled ON shipments(pickup_scheduled_for);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);

-- Tracking events history table
CREATE TABLE shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,

  -- Event details
  event_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL, -- Carrier-specific status code
  location TEXT,

  -- Localized descriptions
  description_ja TEXT,
  description_en TEXT,

  -- Raw data from carrier API
  raw_data JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tracking events
CREATE INDEX idx_tracking_events_shipment_id ON shipment_tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_event_time ON shipment_tracking_events(event_time DESC);

-- Shipment notifications log (optional, for customer notifications)
CREATE TABLE shipment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL, -- 'created', 'picked_up', 'in_transit', 'delivered', etc.
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'pending'

  -- Error details if failed
  error_message TEXT,

  -- Provider (SendGrid, etc.)
  provider_message_id TEXT
);

CREATE INDEX idx_shipment_notifications_shipment_id ON shipment_notifications(shipment_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_shipments_updated_at();

-- Function to generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Get next sequence number for this year
  SELECT LPAD(COALESCE(COUNT(*) + 1, 1)::TEXT, 4, '0')
  INTO seq_part
  FROM shipments
  WHERE TO_CHAR(created_at, 'YYYY') = year_part;

  RETURN 'SH-' || year_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate shipment number on insert
CREATE OR REPLACE FUNCTION set_shipment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
    NEW.shipment_number := generate_shipment_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate shipment number
CREATE TRIGGER trigger_set_shipment_number
BEFORE INSERT ON shipments
FOR EACH ROW
EXECUTE FUNCTION set_shipment_number();

-- Row Level Security (RLS) Policies
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_notifications ENABLE ROW LEVEL SECURITY;

-- Admin users can do everything
CREATE POLICY "Admins have full access to shipments"
ON shipments
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Admins have full access to tracking events"
ON shipment_tracking_events
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Admins have full access to notifications"
ON shipment_notifications
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Service role (from API) has full access
CREATE POLICY "Service role can manage shipments"
ON shipments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage tracking events"
ON shipment_tracking_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage notifications"
ON shipment_notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Helper view for shipment with order details
CREATE VIEW shipments_with_order_details AS
SELECT
  s.*,
  o.order_number,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.total_amount as order_total,
  o.payment_status,
  o.production_status
FROM shipments s
LEFT JOIN orders o ON s.order_id = o.id;

-- Helper view for tracking summary
CREATE VIEW shipment_tracking_summary AS
SELECT
  s.id as shipment_id,
  s.shipment_number,
  s.status,
  s.tracking_number,
  s.carrier,
  s.estimated_delivery,
  (SELECT json_agg(
    json_build_object(
      'event_time', se.event_time,
      'status', se.status,
      'location', se.location,
      'description_ja', se.description_ja,
      'description_en', se.description_en
    ) ORDER BY se.event_time DESC
  ) FROM shipment_tracking_events se WHERE se.shipment_id = s.id) as tracking_history
FROM shipments s;

-- Grant access to views
GRANT SELECT ON shipments_with_order_details TO service_role;
GRANT SELECT ON shipment_tracking_summary TO service_role;

-- Comments for documentation
COMMENT ON TABLE shipments IS '配送管理テーブル (Shipment management table)';
COMMENT ON TABLE shipment_tracking_events IS '配送追跡イベント履歴 (Tracking event history)';
COMMENT ON TABLE shipment_notifications IS '配送通知履歴 (Shipment notification log)';

COMMENT ON COLUMN shipments.shipment_number IS '配送番号 (Shipment number) - Format: SH-YYYY-####';
COMMENT ON COLUMN shipments.carrier IS '配送業者 (Carrier)';
COMMENT ON COLUMN shipments.service_type IS 'サービス種別 (Service type)';
COMMENT ON COLUMN shipments.tracking_number IS '追跡番号 (Tracking number)';
COMMENT ON COLUMN shipments.delivery_time_slot IS '配達時間帯指定 (Delivery time slot)';
COMMENT ON COLUMN shipments.pickup_scheduled_for IS '集荷予定日時 (Scheduled pickup time)';
COMMENT ON COLUMN shipments.estimated_delivery IS '配達予定日時 (Estimated delivery)';
COMMENT ON COLUMN shipments.status IS '配送ステータス (Shipment status)';

COMMENT ON TYPE carrier_type IS '配送業者種別';
COMMENT ON TYPE shipment_status IS '配送ステータス';
COMMENT ON TYPE shipping_service_type IS '配送サービス種別';
COMMENT ON TYPE delivery_time_slot IS '配達時間帯';

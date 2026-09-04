-- =====================================================
-- Migration: Shipments & Tracking Tables (Phase 5)
-- Purpose: Create shipping management and tracking tables
-- Created: 2025-12-31
-- =====================================================
-- This migration creates:
-- 1. shipments table - Shipment management
-- 2. shipment_tracking table - Delivery tracking events
-- 3. Carrier integration support
-- 4. RLS policies for shipping staff
-- 5. Helper functions for shipment operations

-- =====================================================
-- 1. Create Shipments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,

  -- Shipment identification
  shipment_number TEXT NOT NULL UNIQUE,
  tracking_number TEXT UNIQUE,

  -- Carrier information
  carrier_name TEXT NOT NULL,                -- e.g., "Yamato Transport", "Sagawa Express"
  carrier_code TEXT,                         -- e.g., "YTO", "SGE"
  service_level TEXT,                        -- e.g., "EXPRESS", "STANDARD", "ECONOMY"

  -- Shipping details
  shipping_method TEXT NOT NULL CHECK (
    shipping_method IN ('ground', 'air', 'sea', 'rail', 'courier')
  ),

  -- Costs
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  currency TEXT DEFAULT 'JPY' CHECK (currency IN ('JPY', 'USD', 'EUR')),

  -- Package details (JSONB for flexibility)
  package_details JSONB DEFAULT '{}',
  -- Example structure:
  -- {
  --   "packages_count": 2,
  --   "total_weight_kg": 5.5,
  --   "dimensions": {
  --     "length_cm": 30,
  --     "width_cm": 20,
  --     "height_cm": 15
  --   },
  --   "package_type": "cardboard_box",
  --   "special_handling": ["fragile", "keep_upright"]
  -- }

  -- Tracking
  tracking_url TEXT,
  estimated_delivery_date DATE,

  -- Status and progress
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',          -- Awaiting pickup
      'picked_up',        -- Picked up by carrier
      'in_transit',       -- In transit
      'out_for_delivery', -- Out for delivery
      'delivered',        -- Delivered
      'failed',           -- Delivery failed
      'returned',         -- Returned to sender
      'cancelled'         -- Cancelled
    )
  ),

  -- Timestamps
  shipped_at TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Delivery confirmation
  delivered_to TEXT,                           -- Person who received
  delivery_signature_url TEXT,
  delivery_photo_url TEXT,

  -- Notes
  shipping_notes TEXT,
  delivery_notes TEXT,

  -- Constraints
  CONSTRAINT shipment_number_format CHECK (
    shipment_number ~ '^SHP-\d{8}-\d{4}$'  -- SHP-YYYYMMDD-NNNN
  ),
  CONSTRAINT delivery_date_order CHECK (
    delivered_at IS NULL OR
    shipped_at IS NULL OR
    delivered_at >= shipped_at
  )
);

-- =====================================================
-- 2. Create Shipment Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,

  -- Tracking event details
  status_code TEXT NOT NULL,                  -- Carrier status code
  status_description TEXT NOT NULL,           -- Human-readable description
  location TEXT,                             -- Current location
  facility_name TEXT,                        -- Facility where event occurred

  -- Additional event data (JSONB)
  event_data JSONB DEFAULT '{}',
  -- Example structure:
  -- {
  --   "latitude": 35.6762,
  --   "longitude": 139.6503,
  --   "carrier_specific": { ... }
  -- }

  -- Timestamp
  event_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Source
  source TEXT DEFAULT 'api',                  -- 'api', 'manual', 'webhook'

  -- Constraints
  CONSTRAINT event_data_valid CHECK (
    jsonb_typeof(event_data) = 'object' OR event_data = '{}'::jsonb
  )
);

-- =====================================================
-- 3. Create Indexes
-- =====================================================

-- Shipments indexes
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_delivery_address_id ON shipments(delivery_address_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_carrier_code ON shipments(carrier_code);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_shipped_at ON shipments(shipped_at);
CREATE INDEX idx_shipments_estimated_delivery ON shipments(estimated_delivery_date);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);

-- Composite index for active shipments
CREATE INDEX idx_shipments_active ON shipments(status, shipped_at)
  WHERE status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery');

-- Shipment tracking indexes
CREATE INDEX idx_shipment_tracking_shipment_id ON shipment_tracking(shipment_id);
CREATE INDEX idx_shipment_tracking_event_at ON shipment_tracking(event_at DESC);
CREATE INDEX idx_shipment_tracking_status_code ON shipment_tracking(status_code);
CREATE INDEX idx_shipment_tracking_location ON shipment_tracking(location);

-- Composite index for latest tracking
CREATE INDEX idx_shipment_tracking_latest ON shipment_tracking(shipment_id, event_at DESC);

-- =====================================================
-- 4. Create Triggers
-- =====================================================

-- Update updated_at trigger
CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'SHP';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_part TEXT;
  max_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(shipment_number FROM 13 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM shipments
  WHERE shipment_number LIKE 'SHP-' || date_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  RETURN prefix || '-' || date_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_generate_number
  BEFORE INSERT ON shipments
  FOR EACH ROW
  WHEN (NEW.shipment_number IS NULL OR NEW.shipment_number = '')
  EXECUTE FUNCTION generate_shipment_number();

-- Auto-update order status when delivered
CREATE OR REPLACE FUNCTION update_order_delivery_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If shipment is delivered, update order status
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE orders
    SET status = 'DELIVERED',
        delivered_at = NEW.delivered_at,
        updated_at = NOW()
    WHERE id = NEW.order_id;

    -- Create order status history entry
    INSERT INTO order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      reason,
      changed_at
    ) VALUES (
      NEW.order_id,
      'SHIPPED',
      'DELIVERED',
      auth.uid(),
      'Shipment delivered: ' || NEW.shipment_number,
      COALESCE(NEW.delivered_at, NOW())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipment_update_order_status
  AFTER UPDATE ON shipments
  FOR EACH ROW
  WHEN (NEW.status = 'delivered' AND OLD.status != 'delivered')
  EXECUTE FUNCTION update_order_delivery_status();

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking ENABLE ROW LEVEL SECURITY;

-- Customers can view their own shipments
CREATE POLICY "Customers can view own shipments"
  ON shipments FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Shipping staff can view all shipments
CREATE POLICY "Shipping staff can view all shipments"
  ON shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins can manage shipments
CREATE POLICY "Admins can manage shipments"
  ON shipments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Shipment tracking follows same policies
CREATE POLICY "Customers can view own shipment tracking"
  ON shipment_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_tracking.shipment_id
        AND shipments.order_id IN (
          SELECT id FROM orders WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Shipping staff can view all tracking"
  ON shipment_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function: Get latest tracking event for shipment
CREATE OR REPLACE FUNCTION get_latest_tracking(p_shipment_id UUID)
RETURNS shipment_tracking
LANGUAGE plpgsql
AS $$
DECLARE
  v_tracking shipment_tracking;
BEGIN
  SELECT * INTO v_tracking
  FROM shipment_tracking
  WHERE shipment_id = p_shipment_id
  ORDER BY event_at DESC
  LIMIT 1;

  RETURN v_tracking;
END;
$$;

-- Function: Get shipment tracking history
CREATE OR REPLACE FUNCTION get_shipment_history(p_shipment_id UUID)
RETURNS TABLE (
  event_at TIMESTAMPTZ,
  status_code TEXT,
  status_description TEXT,
  location TEXT,
  facility_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.event_at,
    st.status_code,
    st.status_description,
    st.location,
    st.facility_name
  FROM shipment_tracking st
  WHERE st.shipment_id = p_shipment_id
  ORDER BY st.event_at DESC;
END;
$$;

-- Function: Update shipment status with tracking
CREATE OR REPLACE FUNCTION update_shipment_tracking(
  p_shipment_id UUID,
  p_status_code TEXT,
  p_status_description TEXT,
  p_location TEXT DEFAULT NULL,
  p_facility_name TEXT DEFAULT NULL,
  p_event_at TIMESTAMPTZ DEFAULT NOW(),
  p_source TEXT DEFAULT 'api'
)
RETURNS TABLE (
  success BOOLEAN,
  tracking_id UUID,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_shipment shipments;
  v_tracking_id UUID;
BEGIN
  -- Get shipment
  SELECT * INTO v_shipment
  FROM shipments
  WHERE id = p_shipment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Shipment not found'::TEXT;
    RETURN;
  END IF;

  -- Create tracking entry
  INSERT INTO shipment_tracking (
    shipment_id,
    status_code,
    status_description,
    location,
    facility_name,
    event_at,
    source
  ) VALUES (
    p_shipment_id,
    p_status_code,
    p_status_description,
    p_location,
    p_facility_name,
    p_event_at,
    p_source
  )
  RETURNING id INTO v_tracking_id;

  -- Update shipment status based on tracking
  UPDATE shipments
  SET status = CASE
    WHEN p_status_code IN ('delivered', 'delivery_confirmed') THEN 'delivered'
    WHEN p_status_code IN ('out_for_delivery') THEN 'out_for_delivery'
    WHEN p_status_code IN ('in_transit', 'arrived_at_facility') THEN 'in_transit'
    WHEN p_status_code IN ('picked_up') THEN 'picked_up'
    ELSE status
  END,
  updated_at = NOW(),
  delivered_at = CASE
    WHEN p_status_code IN ('delivered', 'delivery_confirmed') THEN p_event_at
    ELSE delivered_at
  END
  WHERE id = p_shipment_id;

  success := TRUE;
  tracking_id := v_tracking_id;
  message := 'Tracking updated successfully';

  RETURN NEXT;
END;
$$;

-- Function: Get active shipments
CREATE OR REPLACE FUNCTION get_active_shipments()
RETURNS TABLE (
  shipment_id UUID,
  shipment_number TEXT,
  order_number TEXT,
  carrier_name TEXT,
  tracking_number TEXT,
  status TEXT,
  shipped_at TIMESTAMPTZ,
  estimated_delivery_date DATE,
  customer_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS shipment_id,
    s.shipment_number,
    o.order_number,
    s.carrier_name,
    s.tracking_number,
    s.status,
    s.shipped_at,
    s.estimated_delivery_date,
    o.customer_name
  FROM shipments s
  JOIN orders o ON s.order_id = o.id
  WHERE s.status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery')
  ORDER BY s.shipped_at ASC;
END;
$$;

-- Function: Get shipment statistics
CREATE OR REPLACE FUNCTION get_shipment_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  carrier_name TEXT,
  total_shipments INTEGER,
  delivered_shipments INTEGER,
  failed_shipments INTEGER,
  avg_delivery_time_hours NUMERIC,
  on_time_delivery_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.carrier_name,
    COUNT(*) AS total_shipments,
    COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_shipments,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_shipments,
    AVG(EXTRACT(EPOCH FROM (delivered_at - shipped_at)) / 3600) AS avg_delivery_time_hours,
    CASE
      WHEN COUNT(*) FILTER (WHERE status = 'delivered') > 0 THEN
        (COUNT(*) FILTER (
          WHERE status = 'delivered' AND
          delivered_at <= estimated_delivery_at
        )::NUMERIC / COUNT(*) FILTER (WHERE status = 'delivered') * 100)
      ELSE NULL
    END AS on_time_delivery_rate
  FROM shipments s
  WHERE s.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY s.carrier_name
  ORDER BY total_shipments DESC;
END;
$$;

-- =====================================================
-- 7. Grant Permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON shipments TO authenticated, anon;
GRANT SELECT ON shipment_tracking TO authenticated, anon;
GRANT ALL ON shipments TO authenticated;
GRANT ALL ON shipment_tracking TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_latest_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION get_shipment_history TO authenticated;
GRANT EXECUTE ON FUNCTION update_shipment_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_shipments TO authenticated;
GRANT EXECUTE ON FUNCTION get_shipment_stats TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Shipments & Tracking tables';
  RAISE NOTICE 'Tables created: shipments, shipment_tracking';
  RAISE NOTICE 'Indexes created: 12 indexes';
  RAISE NOTICE 'Policies created: 7 RLS policies';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - generate_shipment_number()';
  RAISE NOTICE '  - update_order_delivery_status() (trigger function)';
  RAISE NOTICE '  - get_latest_tracking()';
  RAISE NOTICE '  - get_shipment_history()';
  RAISE NOTICE '  - update_shipment_tracking()';
  RAISE NOTICE '  - get_active_shipments()';
  RAISE NOTICE '  - get_shipment_stats()';
END $$;

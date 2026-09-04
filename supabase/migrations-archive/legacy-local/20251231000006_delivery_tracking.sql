-- =====================================================
-- Migration: Delivery Tracking Table
-- Purpose: Track delivery numbers and shipping dates for orders
-- Created: 2025-12-31
-- =====================================================

-- Create delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to order
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Approval date (base date for calculation)
  approval_date TIMESTAMPTZ NOT NULL,

  -- Tracking information
  tracking_number TEXT,
  carrier TEXT CHECK (
    carrier IN ('ems', 'surface_mail', 'sea_freight', 'air_freight', 'other')
  ),
  shipping_date TIMESTAMPTZ,

  -- Estimated dates
  estimated_production_complete_date TIMESTAMPTZ,
  estimated_tracking_available_date TIMESTAMPTZ,
  estimated_delivery_date_min TIMESTAMPTZ,
  estimated_delivery_date_max TIMESTAMPTZ,

  -- Actual delivery
  actual_delivery_date TIMESTAMPTZ,

  -- Progress (calculated from approval date)
  business_days_total INTEGER DEFAULT 20,
  business_days_passed INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'in_production' CHECK (
    status IN (
      'in_production',       -- 생산 중
      'tracking_assigned',   -- 송장번호 발급
      'shipped',             -- 발송 완료
      'delivered',           -- 배송 완료
      'delayed'              -- 지연
    )
  ),

  -- Admin notes
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  CONSTRAINT order_id_unique UNIQUE (order_id)
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_tracking_status ON delivery_tracking(status);
CREATE INDEX idx_delivery_tracking_shipping_date ON delivery_tracking(shipping_date);
CREATE INDEX idx_delivery_tracking_estimated_delivery ON delivery_tracking(estimated_delivery_date_max);

-- =====================================================
-- Triggers
-- =====================================================

-- Update timestamp trigger
CREATE TRIGGER delivery_tracking_updated_at
  BEFORE UPDATE ON delivery_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update progress when tracking is assigned
CREATE OR REPLACE FUNCTION update_delivery_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate business days passed from approval date
  UPDATE delivery_tracking
  SET
    business_days_passed = (
      SELECT COUNT(*)
      FROM generate_series(
        DATE_TRUNC('day', NEW.approval_date)::DATE + INTERVAL '1 day',
        DATE_TRUNC('day', NOW())::DATE,
        INTERVAL '1 day'
      ) AS d
      WHERE EXTRACT(ISODOW FROM d) IN (1, 2, 3, 4, 5)  -- Mon-Fri
        AND NOT EXISTS (
          SELECT 1 FROM (
            SELECT '2025-01-01'::DATE AS holiday UNION ALL
            SELECT '2025-01-12' UNION ALL
            SELECT '2025-02-11' UNION ALL
            SELECT '2025-02-23' UNION ALL
            SELECT '2025-02-24' UNION ALL
            SELECT '2025-03-20' UNION ALL
            SELECT '2025-04-29' UNION ALL
            SELECT '2025-05-03' UNION ALL
            SELECT '2025-05-04' UNION ALL
            SELECT '2025-05-05' UNION ALL
            SELECT '2025-05-06' UNION ALL
            SELECT '2025-07-21' UNION ALL
            SELECT '2025-08-11' UNION ALL
            SELECT '2025-08-12' UNION ALL
            SELECT '2025-09-15' UNION ALL
            SELECT '2025-09-23' UNION ALL
            SELECT '2025-10-13' UNION ALL
            SELECT '2025-11-03' UNION ALL
            SELECT '2025-11-23' UNION ALL
            SELECT '2025-11-24' UNION ALL
            SELECT '2025-12-25'
          ) AS holidays
          WHERE d.date = holidays.holiday
        )
    ),
    progress_percentage = LEAST(
      ROUND((business_days_passed * 100.0 / business_days_total)),
      100
    ),
    -- Update status based on tracking number
    status = CASE
      WHEN NEW.actual_delivery_date IS NOT NULL THEN 'delivered'
      WHEN NEW.shipping_date IS NOT NULL THEN 'shipped'
      WHEN NEW.tracking_number IS NOT NULL THEN 'tracking_assigned'
      ELSE 'in_production'
    END
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delivery_tracking_auto_update_progress
  AFTER INSERT OR UPDATE ON delivery_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_progress();

-- =====================================================
-- Helper Functions
// =====================================================

-- Function: Create or update delivery tracking for an order
CREATE OR REPLACE FUNCTION create_delivery_tracking(
  p_order_id UUID,
  p_approval_date TIMESTAMPTZ,
  p_custom_days INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_tracking_id UUID;
  v_production_days INTEGER := COALESCE(p_custom_days, 20);
BEGIN
  -- Try to update existing record
  UPDATE delivery_tracking
  SET
    approval_date = p_approval_date,
    estimated_production_complete_date = p_approval_date + (v_production_days || ' days')::INTERVAL,
    estimated_tracking_available_date = p_approval_date + (15 || ' days')::INTERVAL,
    estimated_delivery_date_min = p_approval_date + ((v_production_days + 4) || ' days')::INTERVAL,
    estimated_delivery_date_max = p_approval_date + ((v_production_days + 5) || ' days')::INTERVAL
  WHERE order_id = p_order_id
  RETURNING id INTO v_tracking_id;

  -- If no existing record, create new one
  IF NOT FOUND THEN
    INSERT INTO delivery_tracking (
      order_id,
      approval_date,
      estimated_production_complete_date,
      estimated_tracking_available_date,
      estimated_delivery_date_min,
      estimated_delivery_date_max
    )
    VALUES (
      p_order_id,
      p_approval_date,
      p_approval_date + (v_production_days || ' days')::INTERVAL,
      p_approval_date + (15 || ' days')::INTERVAL,
      p_approval_date + ((v_production_days + 4) || ' days')::INTERVAL,
      p_approval_date + ((v_production_days + 5) || ' days')::INTERVAL
    )
    RETURNING id INTO v_tracking_id;
  END IF;

  RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS)
// =====================================================

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Customers can view delivery tracking for their orders
CREATE POLICY "Customers can view own delivery tracking"
  ON delivery_tracking FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all delivery tracking
CREATE POLICY "Admins can manage delivery tracking"
  ON delivery_tracking FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Grant Permissions
// =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON delivery_tracking TO authenticated;
GRANT ALL ON delivery_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION create_delivery_tracking TO authenticated;

-- =====================================================
-- Migration Complete
// =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Delivery Tracking table';
  RAISE NOTICE 'Table created: delivery_tracking';
  RAISE NOTICE 'Indexes created: 4 indexes';
  RAISE NOTICE 'Triggers created: 2 triggers';
  RAISE NOTICE 'Functions created: create_delivery_tracking, update_delivery_progress';
END $$;

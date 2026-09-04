-- =====================================================
-- Epackage Lab Work Orders Table
--作業標準書管理 (Work Order / SOP Management)
-- =====================================================

-- Work Order Status Enum
CREATE TYPE work_order_status AS ENUM (
  'DRAFT',        -- ドラフト (Draft)
  'GENERATED',    -- 生成済み (Generated from order)
  'APPROVED',     -- 承認済み (Approved by admin)
  'IN_PRODUCTION',-- 生産中 (In production)
  'COMPLETED'     -- 完了 (Completed)
);

-- =====================================================
-- Work Orders Table
-- 作業標準書には、パウチの製造方法が明示されます
-- (Work order specifies pouch manufacturing methods)
-- =====================================================

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 作業標準書番号 (Work Order Number - WO-YYYY-NNNN format)
  work_order_number TEXT NOT NULL UNIQUE,

  -- Foreign Keys
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,

  -- 製造仕様書 (Manufacturing Specifications)
  specifications JSONB NOT NULL,  -- { dimensions, materials, printing, lamination, pouch_type, etc. }
  production_flow JSONB NOT NULL,  -- Step-by-step production process
  quality_standards JSONB NOT NULL,  -- QC requirements and standards

  -- PDF URL (作業標準書PDF)
  pdf_url TEXT,

  -- ステータス (Status)
  status work_order_status NOT NULL DEFAULT 'DRAFT',

  -- Notes (製造に関するメモ)
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT work_order_number_format CHECK (
    work_order_number ~ '^WO-\d{4}-\d{4}$'
  ),
  CONSTRAINT specifications_not_empty CHECK (
    jsonb_array_length(specifications) > 0 OR specifications != '{}'::jsonb
  )
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_work_orders_work_order_number ON work_orders(work_order_number);
CREATE INDEX idx_work_orders_order_id ON work_orders(order_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at DESC);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================

CREATE TRIGGER work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Trigger: Auto-generate work order number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  new_number TEXT;
  max_seq INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get the highest sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM 9 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM work_orders
  WHERE work_order_number LIKE 'WO-' || year_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  new_number := 'WO-' || year_part || '-' || seq_part;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_order_generate_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  WHEN (NEW.work_order_number IS NULL OR NEW.work_order_number = '')
  EXECUTE FUNCTION generate_work_order_number();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Operators and admins can view work orders
CREATE POLICY "Operators and admins can view work orders"
  ON work_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins and operators can insert work orders
CREATE POLICY "Admins and operators can insert work orders"
  ON work_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins and operators can update work orders
CREATE POLICY "Admins and operators can update work orders"
  ON work_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins can delete work orders
CREATE POLICY "Admins can delete work orders"
  ON work_orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get work order by order ID
CREATE OR REPLACE FUNCTION get_work_order_by_order(order_uuid UUID)
RETURNS work_orders AS $$
DECLARE
  work_order_record work_orders;
BEGIN
  SELECT * INTO work_order_record
  FROM work_orders
  WHERE order_id = order_uuid;

  RETURN work_order_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate work order from order data
CREATE OR REPLACE FUNCTION generate_work_order_from_order(order_uuid UUID)
RETURNS UUID AS $$
DECLARE
  new_work_order_id UUID;
  order_data orders;
BEGIN
  -- Get order data
  SELECT * INTO order_data FROM orders WHERE id = order_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', order_uuid;
  END IF;

  -- Create work order
  INSERT INTO work_orders (order_id, specifications, production_flow, quality_standards, status)
  VALUES (
    order_uuid,
    '{"pouch_type": "standup", "dimensions": "custom"}'::jsonb,
    '["printing", "lamination", "slitting", "pouch_making"]'::jsonb,
    '{"visual_inspection": true, "dimension_tolerance": "±2mm"}'::jsonb,
    'GENERATED'
  )
  RETURNING id INTO new_work_order_id;

  RETURN new_work_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON work_orders TO authenticated;
GRANT ALL ON work_orders TO authenticated;

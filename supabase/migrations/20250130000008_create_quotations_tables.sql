-- =====================================================
-- Epackage Lab Quotations System
-- 견적 관리 시스템 (Quotation Management System)
-- =====================================================

-- Quotation Status Enum
CREATE TYPE quotation_status AS ENUM (
  'DRAFT',     -- 드래프트 (Draft)
  'SENT',      -- 송부됨 (Sent to customer)
  'APPROVED',  -- 승인됨 (Approved by customer)
  'REJECTED',  -- 거부됨 (Rejected by customer)
  'EXPIRED',   -- 만료됨 (Expired)
  'CONVERTED'  -- 주문으로 전환됨 (Converted to order)
);

-- =====================================================
-- Quotations Table
-- =====================================================

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 견적 번호 (Quotation Number - QT-YYYY-NNNN format)
  quotation_number TEXT NOT NULL UNIQUE,

  -- Foreign Keys
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- 고객 정보 (Customer Information - snapshot)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- 견적 정보 (Quotation Details)
  status quotation_status NOT NULL DEFAULT 'DRAFT',

  -- 금액 (Amount in JPY)
  subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- 유효기간 (Valid Until - default 30 days from creation)
  valid_until TIMESTAMP WITH TIME ZONE,

  -- 메모 (Notes)
  notes TEXT,

  -- PDF URL (견적서 PDF)
  pdf_url TEXT,

  -- 관리자 메모 (Internal admin notes - not visible to customer)
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT quotation_number_format CHECK (
    quotation_number ~ '^QT-\d{4}-\d{4}$'
  ),
  CONSTRAINT amounts_non_negative CHECK (
    subtotal_amount >= 0 AND tax_amount >= 0 AND total_amount >= 0
  ),
  CONSTRAINT valid_after_created CHECK (
    valid_until IS NULL OR valid_until > created_at
  )
);

-- =====================================================
-- Quotation Items Table
-- =====================================================

CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,

  -- 제품 정보 (Product Information)
  product_id UUID,  -- References products table if available
  product_name TEXT NOT NULL,
  product_code TEXT,

  -- 카테고리 (Category)
  category TEXT,

  -- 수량 및 단가 (Quantity and Unit Price)
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,

  -- 금액 (Item Total)
  total_price NUMERIC(12, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- 사양 (Specifications - JSON format for flexibility)
  specifications JSONB,  -- { size, material, printing, post_processing, etc. }

  -- 메모 (Item-specific notes)
  notes TEXT,

  -- 정렬 순서 (Display order)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT quantity_positive CHECK (quantity > 0),
  CONSTRAINT unit_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT display_order_non_negative CHECK (display_order >= 0)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Quotations indexes
CREATE INDEX idx_quotations_quotation_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_company_id ON quotations(company_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_valid_until ON quotations(valid_until);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX idx_quotations_customer_email ON quotations(customer_email);

-- Quotation items indexes
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product_id ON quotation_items(product_id);
CREATE INDEX idx_quotation_items_display_order ON quotation_items(quotation_id, display_order);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================

CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Trigger: Auto-generate quotation number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  new_number TEXT;
  max_seq INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get the highest sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 8 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM quotations
  WHERE quotation_number LIKE 'QT-' || year_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  new_number := 'QT-' || year_part || '-' || seq_part;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotation_generate_number
  BEFORE INSERT ON quotations
  FOR EACH ROW
  WHEN (NEW.quotation_number IS NULL OR NEW.quotation_number = '')
  EXECUTE FUNCTION generate_quotation_number();

-- =====================================================
-- Trigger: Auto-set valid_until to 30 days from creation
-- =====================================================

CREATE TRIGGER quotation_set_valid_until
  BEFORE INSERT ON quotations
  FOR EACH ROW
  WHEN (NEW.valid_until IS NULL)
  EXECUTE FUNCTION (
    NEW.valid_until := NOW() + INTERVAL '30 days'
  );

-- =====================================================
-- Trigger: Auto-update quotation timestamps on status change
-- =====================================================

CREATE OR REPLACE FUNCTION update_quotation_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sent_at when status changes to SENT
  IF NEW.status = 'SENT' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.sent_at := NOW();
  END IF;

  -- Update approved_at when status changes to APPROVED
  IF NEW.status = 'APPROVED' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.approved_at := NOW();
  END IF;

  -- Update rejected_at when status changes to REJECTED
  IF NEW.status = 'REJECTED' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.rejected_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotation_update_status_timestamps
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_quotation_status_timestamps();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own quotations
CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own quotations
CREATE POLICY "Users can insert own quotations"
  ON quotations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own quotations (only draft status)
CREATE POLICY "Users can update own draft quotations"
  ON quotations FOR UPDATE
  USING (user_id = auth.uid() AND status = 'DRAFT')
  WITH CHECK (user_id = auth.uid() AND status = 'DRAFT');

-- Admins can view all quotations
CREATE POLICY "Admins can view all quotations"
  ON quotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update all quotations
CREATE POLICY "Admins can update all quotations"
  ON quotations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Quotation items RLS
CREATE POLICY "Users can view items for own quotations"
  ON quotation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
        AND quotations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items for own quotations"
  ON quotation_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
        AND quotations.user_id = auth.uid()
        AND quotations.status = 'DRAFT'
    )
  );

CREATE POLICY "Users can update items for own draft quotations"
  ON quotation_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_items.quotation_id
        AND quotations.user_id = auth.uid()
        AND quotations.status = 'DRAFT'
    )
  );

CREATE POLICY "Admins can manage all quotation items"
  ON quotation_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to calculate quotation totals
CREATE OR REPLACE FUNCTION calculate_quotation_totals(quotation_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  subtotal NUMERIC;
  tax_rate NUMERIC := 0.10; -- 10% Japanese consumption tax
  tax NUMERIC;
  total NUMERIC;
BEGIN
  -- Calculate subtotal from items
  SELECT COALESCE(SUM(total_price), 0)
  INTO subtotal
  FROM quotation_items
  WHERE quotation_id = quotation_uuid;

  -- Calculate tax (10%)
  tax := subtotal * tax_rate;

  -- Calculate total
  total := subtotal + tax;

  -- Update quotation
  UPDATE quotations
  SET subtotal_amount = subtotal,
      tax_amount = tax,
      total_amount = total
  WHERE id = quotation_uuid;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-calculate totals when items change
CREATE OR REPLACE FUNCTION trigger_calculate_quotation_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM calculate_quotation_totals(NEW.quotation_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM calculate_quotation_totals(NEW.quotation_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM calculate_quotation_totals(OLD.quotation_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotation_items_recalculate_totals
  AFTER INSERT OR UPDATE OR DELETE ON quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_quotation_totals();

-- Function to get quotation with items
CREATE OR REPLACE FUNCTION get_quotation_with_items(quotation_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  quotation_data JSONB;
  items_data JSONB;
  result JSONB;
BEGIN
  -- Get quotation data
  SELECT row_to_json(q)::jsonb INTO quotation_data
  FROM quotations q
  WHERE q.id = quotation_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found', quotation_uuid;
  END IF;

  -- Get items data
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'product_name', product_name,
      'product_code', product_code,
      'category', category,
      'quantity', quantity,
      'unit_price', unit_price,
      'total_price', total_price,
      'specifications', specifications,
      'notes', notes
    ) ORDER BY display_order
  ) INTO items_data
  FROM quotation_items
  WHERE quotation_id = quotation_uuid;

  -- Combine
  result := quotation_data || jsonb_build_object('items', COALESCE(items_data, '[]'::jsonb));

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if quotation is expired
CREATE OR REPLACE FUNCTION is_quotation_expired(quotation_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  valid_until_time TIMESTAMP WITH TIME ZONE;
  current_status TEXT;
BEGIN
  SELECT valid_until, status INTO valid_until_time, current_status
  FROM quotations
  WHERE id = quotation_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found', quotation_uuid;
  END IF;

  -- Expired if valid_until has passed and status is not APPROVED/CONVERTED/REJECTED
  RETURN valid_until_time < NOW() AND current_status NOT IN ('APPROVED', 'CONVERTED', 'REJECTED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert approved quotation to order
CREATE OR REPLACE FUNCTION convert_quotation_to_order(quotation_uuid UUID)
RETURNS UUID AS $$
DECLARE
  order_id UUID;
  quotation_data quotations;
BEGIN
  -- Get quotation data
  SELECT * INTO quotation_data
  FROM quotations
  WHERE id = quotation_uuid AND status = 'APPROVED';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation % not found or not approved', quotation_uuid;
  END IF;

  -- Check if already converted
  IF EXISTS (
    SELECT 1 FROM orders WHERE quotation_id = quotation_uuid
  ) THEN
    RAISE EXCEPTION 'Order already exists for quotation %', quotation_uuid;
  END IF;

  -- Create order
  INSERT INTO orders (
    user_id,
    quotation_id,
    order_number,
    status,
    total_amount,
    customer_name,
    customer_email
  )
  VALUES (
    quotation_data.user_id,
    quotation_uuid,
    'ORD-TEMP', -- Will be auto-generated by trigger
    'PENDING',
    quotation_data.total_amount,
    quotation_data.customer_name,
    quotation_data.customer_email
  )
  RETURNING id INTO order_id;

  -- Update quotation status
  UPDATE quotations
  SET status = 'CONVERTED'
  WHERE id = quotation_uuid;

  RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON quotations TO authenticated, anon;
GRANT ALL ON quotations TO authenticated;
GRANT SELECT ON quotation_items TO authenticated, anon;
GRANT ALL ON quotation_items TO authenticated;

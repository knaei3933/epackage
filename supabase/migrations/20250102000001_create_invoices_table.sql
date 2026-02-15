-- =====================================================
-- Epackage Lab Invoices System
-- 請求書管理システム (Invoice Management System)
-- =====================================================

-- Invoice Status Enum
CREATE TYPE invoice_status AS ENUM (
  'DRAFT',      -- 드래프트 (Draft)
  'SENT',       -- 송부됨 (Sent to customer)
  'VIEWED',     -- 확인됨 (Viewed by customer)
  'OVERDUE',    -- 지연됨 (Overdue)
  'PAID',       -- 지불됨 (Paid)
  'PARTIAL',    -- 부분 지불 (Partially paid)
  'CANCELLED',  -- 취소됨 (Cancelled)
  'REFUNDED'    -- 환불됨 (Refunded)
);

-- =====================================================
-- Invoices Table
-- =====================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 청구서 번호 (Invoice Number - INV-YYYY-NNNN format)
  invoice_number TEXT NOT NULL UNIQUE,

  -- Foreign Keys
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- 고객 정보 (Customer Information - snapshot)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- 회사 정보 (Company Information - snapshot)
  company_name TEXT,
  company_address TEXT,

  -- 청구서 정보 (Invoice Details)
  status invoice_status NOT NULL DEFAULT 'DRAFT',

  -- 금액 (Amount in JPY)
  subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- 기한 정보 (Dates)
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- 결제 정보 (Payment Information)
  payment_method TEXT,
  payment_terms TEXT,
  bank_account JSONB,  -- { bank_name, branch_name, account_type, account_number, account_holder }

  -- 메모 (Notes)
  notes TEXT,
  customer_notes TEXT,

  -- PDF URL (청구서 PDF)
  pdf_url TEXT,

  -- 관리자 메모 (Internal admin notes - not visible to customer)
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT invoice_number_format CHECK (
    invoice_number ~ '^INV-\d{4}-\d{4}$'
  ),
  CONSTRAINT amounts_non_negative CHECK (
    subtotal_amount >= 0 AND
    tax_amount >= 0 AND
    discount_amount >= 0 AND
    total_amount >= 0 AND
    paid_amount >= 0
  ),
  CONSTRAINT paid_amount_not_exceed_total CHECK (
    paid_amount <= total_amount
  ),
  CONSTRAINT due_date_after_issue_date CHECK (
    due_date >= issue_date
  )
);

-- =====================================================
-- Invoice Items Table
-- =====================================================

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,

  -- 제품/서비스 정보 (Product/Service Information)
  product_id UUID,  -- References products table if available
  product_name TEXT NOT NULL,
  product_code TEXT,
  description TEXT,

  -- 수량 및 단가 (Quantity and Unit Price)
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT '個', -- 個, 枚, 式, etc.
  unit_price NUMERIC(12, 2) NOT NULL,

  -- 금액 (Item Total)
  total_price NUMERIC(12, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- 세금 (Tax)
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00, -- 10% Japanese consumption tax
  tax_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price * tax_rate / 100) STORED,

  -- 메모 (Item-specific notes)
  notes TEXT,

  -- 정렬 순서 (Display order)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT quantity_positive CHECK (quantity > 0),
  CONSTRAINT unit_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT display_order_non_negative CHECK (display_order >= 0),
  CONSTRAINT tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100)
);

-- =====================================================
-- Invoice Payments Table (결제 내역)
-- =====================================================

CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- 결제 정보 (Payment Details)
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'bank_transfer', 'credit_card', 'cash', 'other'

  -- 참조 정보 (Reference)
  transaction_id TEXT,
  reference_number TEXT,
  notes TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Invoices indexes
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_customer_email ON invoices(customer_email);

-- Invoice items indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX idx_invoice_items_display_order ON invoice_items(invoice_id, display_order);

-- Invoice payments indexes
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_payment_date ON invoice_payments(payment_date);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Trigger: Auto-generate invoice number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  new_number TEXT;
  max_seq INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get the highest sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  new_number := 'INV-' || year_part || '-' || seq_part;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_generate_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- Trigger: Auto-update invoice timestamps on status change
-- =====================================================

CREATE OR REPLACE FUNCTION update_invoice_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sent_at when status changes to SENT
  IF NEW.status = 'SENT' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.sent_at := NOW();
  END IF;

  -- Update viewed_at when status changes to VIEWED
  IF NEW.status = 'VIEWED' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.viewed_at := NOW();
  END IF;

  -- Update paid_at when status changes to PAID
  IF NEW.status = 'PAID' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.paid_at IS NULL THEN
    NEW.paid_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_update_status_timestamps
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_invoice_status_timestamps();

-- =====================================================
-- Function: Calculate invoice totals from items
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  subtotal NUMERIC;
  tax_rate NUMERIC := 10; -- 10% Japanese consumption tax
  tax NUMERIC;
  discount NUMERIC;
  total NUMERIC;
BEGIN
  -- Calculate subtotal from items
  SELECT COALESCE(SUM(total_price), 0)
  INTO subtotal
  FROM invoice_items
  WHERE invoice_id = invoice_uuid;

  -- Calculate tax (10%)
  tax := subtotal * tax_rate / 100;

  -- Get discount from invoice
  SELECT COALESCE(discount_amount, 0)
  INTO discount
  FROM invoices
  WHERE id = invoice_uuid;

  -- Calculate total
  total := subtotal + tax - discount;

  -- Update invoice
  UPDATE invoices
  SET subtotal_amount = subtotal,
      tax_amount = tax,
      total_amount = total
  WHERE id = invoice_uuid;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-calculate totals when items change
CREATE OR REPLACE FUNCTION trigger_calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM calculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_items_recalculate_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_invoice_totals();

-- =====================================================
-- Function: Update paid amount from payments
-- =====================================================

CREATE OR REPLACE FUNCTION update_invoice_paid_amount(invoice_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_paid NUMERIC;
  invoice_total NUMERIC;
  new_status invoice_status;
BEGIN
  -- Calculate total paid
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = invoice_uuid;

  -- Get invoice total
  SELECT total_amount
  INTO invoice_total
  FROM invoices
  WHERE id = invoice_uuid;

  -- Update paid amount
  UPDATE invoices
  SET paid_amount = total_paid
  WHERE id = invoice_uuid;

  -- Update status based on payment
  IF total_paid >= invoice_total THEN
    new_status := 'PAID';
  ELSIF total_paid > 0 THEN
    new_status := 'PARTIAL';
  ELSE
    -- Don't change status if no payments
    RETURN total_paid;
  END IF;

  -- Update status
  UPDATE invoices
  SET status = new_status
  WHERE id = invoice_uuid AND status != 'PAID';

  RETURN total_paid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update paid amount when payments change
CREATE OR REPLACE FUNCTION trigger_update_invoice_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_invoice_paid_amount(NEW.invoice_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM update_invoice_paid_amount(NEW.invoice_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_invoice_paid_amount(OLD.invoice_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_payments_update_paid_amount
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_invoice_paid_amount();

-- =====================================================
-- Function: Create invoice from order
-- =====================================================

CREATE OR REPLACE FUNCTION create_invoice_from_order(
  order_uuid UUID,
  issue_date_input DATE DEFAULT NULL,
  payment_terms_days INTEGER DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
  new_invoice_id UUID;
  order_data RECORD;
  due_date_calc DATE;
BEGIN
  -- Get order data
  SELECT
    o.*,
    c.name as company_name,
    c.address as company_address
  INTO order_data
  FROM orders o
  LEFT JOIN companies c ON o.company_id = c.id
  WHERE o.id = order_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', order_uuid;
  END IF;

  -- Set dates
  IF issue_date_input IS NULL THEN
    issue_date_input := CURRENT_DATE;
  END IF;

  due_date_calc := issue_date_input + payment_terms_days;

  -- Create invoice
  INSERT INTO invoices (
    user_id,
    company_id,
    order_id,
    customer_name,
    customer_email,
    company_name,
    company_address,
    status,
    issue_date,
    due_date,
    payment_terms,
    subtotal_amount,
    tax_amount,
    total_amount
  )
  SELECT
    order_data.user_id,
    order_data.company_id,
    order_data.id,
    order_data.customer_name,
    order_data.customer_email,
    order_data.company_name,
    order_data.company_address,
    'DRAFT',
    issue_date_input,
    due_date_calc,
    '請求書発行日より' || payment_terms_days || '日以内',
    0, -- Will be calculated from items
    0,
    0
  RETURNING id INTO new_invoice_id;

  -- Copy order items to invoice items
  INSERT INTO invoice_items (
    invoice_id,
    product_id,
    product_name,
    product_code,
    description,
    quantity,
    unit,
    unit_price,
    display_order
  )
  SELECT
    new_invoice_id,
    oi.product_id,
    oi.product_name,
    oi.product_code,
    oi.notes,
    oi.quantity,
    COALESCE(oi.unit, '個'),
    oi.unit_price,
    oi.display_order
  FROM order_items oi
  WHERE oi.order_id = order_uuid
  ORDER BY oi.display_order;

  -- Recalculate totals (trigger will update invoice)
  PERFORM calculate_invoice_totals(new_invoice_id);

  RETURN new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: Get overdue invoices
-- =====================================================

CREATE OR REPLACE FUNCTION get_overdue_invoices()
RETURNS TABLE (
  invoice_id UUID,
  invoice_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  due_date DATE,
  days_overdue INTEGER,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  outstanding_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id as invoice_id,
    i.invoice_number,
    i.customer_name,
    i.customer_email,
    i.due_date,
    EXTRACT(DAY FROM CURRENT_DATE - i.due_date)::INTEGER as days_overdue,
    i.total_amount,
    i.paid_amount,
    (i.total_amount - i.paid_amount) as outstanding_amount
  FROM invoices i
  WHERE i.status IN ('SENT', 'VIEWED', 'PARTIAL', 'OVERDUE')
    AND i.due_date < CURRENT_DATE
    AND (i.paid_amount < i.total_amount OR i.paid_amount IS NULL)
  ORDER BY i.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own invoices (if needed)
CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own invoices (only draft status)
CREATE POLICY "Users can update own draft invoices"
  ON invoices FOR UPDATE
  USING (user_id = auth.uid() AND status = 'DRAFT')
  WITH CHECK (user_id = auth.uid() AND status = 'DRAFT');

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update all invoices
CREATE POLICY "Admins can update all invoices"
  ON invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Invoice items RLS
CREATE POLICY "Users can view items for own invoices"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items for own invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
        AND invoices.status = 'DRAFT'
    )
  );

CREATE POLICY "Users can update items for own draft invoices"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
        AND invoices.status = 'DRAFT'
    )
  );

CREATE POLICY "Admins can manage all invoice items"
  ON invoice_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Invoice payments RLS
CREATE POLICY "Users can view payments for own invoices"
  ON invoice_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for own invoices"
  ON invoice_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all invoice payments"
  ON invoice_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get invoice with items
CREATE OR REPLACE FUNCTION get_invoice_with_items(invoice_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  invoice_data JSONB;
  items_data JSONB;
  payments_data JSONB;
  result JSONB;
BEGIN
  -- Get invoice data
  SELECT row_to_json(i)::jsonb INTO invoice_data
  FROM invoices i
  WHERE i.id = invoice_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found', invoice_uuid;
  END IF;

  -- Get items data
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'product_name', product_name,
      'product_code', product_code,
      'description', description,
      'quantity', quantity,
      'unit', unit,
      'unit_price', unit_price,
      'total_price', total_price,
      'tax_rate', tax_rate,
      'tax_amount', tax_amount,
      'notes', notes
    ) ORDER BY display_order
  ) INTO items_data
  FROM invoice_items
  WHERE invoice_id = invoice_uuid;

  -- Get payments data
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'payment_date', payment_date,
      'amount', amount,
      'payment_method', payment_method,
      'transaction_id', transaction_id,
      'reference_number', reference_number,
      'notes', notes
    ) ORDER BY payment_date DESC
  ) INTO payments_data
  FROM invoice_payments
  WHERE invoice_id = invoice_uuid;

  -- Combine
  result := invoice_data ||
    jsonb_build_object(
      'items', COALESCE(items_data, '[]'::jsonb),
      'payments', COALESCE(payments_data, '[]'::jsonb)
    );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if invoice is overdue
CREATE OR REPLACE FUNCTION is_invoice_overdue(invoice_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  due_date_input DATE;
  current_status invoice_status;
  paid_amount_input NUMERIC;
  total_amount_input NUMERIC;
BEGIN
  SELECT due_date, status, paid_amount, total_amount
  INTO due_date_input, current_status, paid_amount_input, total_amount_input
  FROM invoices
  WHERE id = invoice_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found', invoice_uuid;
  END IF;

  -- Overdue if due date has passed and not fully paid
  RETURN due_date_input < CURRENT_DATE
    AND current_status NOT IN ('PAID', 'CANCELLED', 'REFUNDED')
    AND (paid_amount_input < total_amount_input OR paid_amount_input IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON invoices TO authenticated, anon;
GRANT ALL ON invoices TO authenticated;
GRANT SELECT ON invoice_items TO authenticated, anon;
GRANT ALL ON invoice_items TO authenticated;
GRANT SELECT ON invoice_payments TO authenticated, anon;
GRANT ALL ON invoice_payments TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_invoice_from_order TO authenticated;
GRANT EXECUTE ON FUNCTION get_invoice_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION get_overdue_invoices TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_invoice_totals TO service_role;
GRANT EXECUTE ON FUNCTION update_invoice_paid_amount TO service_role;

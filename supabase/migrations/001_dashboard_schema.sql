-- =====================================================
-- Dashboard System Schema Migration
-- =====================================================
-- 会員ダッシュボードシステム用のテーブル定義
-- 注文、納品先、請求先、見積、サンプル、お問い合わせ

-- =====================================================
-- Order Status Enum
-- =====================================================

CREATE TYPE order_status AS ENUM (
  'pending',       -- 受付待
  'processing',    -- 処理中
  'manufacturing', -- 製造中
  'ready',         -- 発送待
  'shipped',       -- 発送完了
  'delivered',     -- 配送完了
  'cancelled'      -- キャンセル
);

-- =====================================================
-- Orders Table
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- 住所参照
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  billing_address_id UUID REFERENCES billing_addresses(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- =====================================================
-- Order Items Table
-- =====================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- 仕様（JSONB）
  specifications JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- Delivery Addresses Table
-- =====================================================

CREATE TABLE delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 納品先名（会社名・施設名など）
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL, -- 番地
  building TEXT, -- 建物名
  phone TEXT NOT NULL,
  contact_person TEXT, -- 担当者名
  is_default BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_delivery_addresses_user_id ON delivery_addresses(user_id);
CREATE INDEX idx_delivery_addresses_is_default ON delivery_addresses(user_id, is_default);

-- =====================================================
-- Billing Addresses Table
-- =====================================================

CREATE TABLE billing_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL, -- 請求先会社名
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  building TEXT,
  tax_number TEXT, -- 法人番号
  email TEXT,
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_billing_addresses_user_id ON billing_addresses(user_id);
CREATE INDEX idx_billing_addresses_is_default ON billing_addresses(user_id, is_default);

-- =====================================================
-- Quotation Status Enum
-- =====================================================

CREATE TYPE quotation_status AS ENUM (
  'draft',    -- 作成中
  'sent',     -- 送信済
  'approved', -- 承認済
  'rejected', -- 却下
  'expired'   -- 期限切れ
);

-- =====================================================
-- Quotations Table
-- =====================================================

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quotation_number TEXT NOT NULL UNIQUE,
  status quotation_status NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);

-- =====================================================
-- Quotation Items Table
-- =====================================================

CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  specifications JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);

-- =====================================================
-- Sample Request Status Enum
-- =====================================================

CREATE TYPE sample_request_status AS ENUM (
  'received',   -- 受付済
  'processing', -- 処理中
  'shipped',    -- 発送済
  'delivered',  -- 配送完了
  'cancelled'   -- キャンセル
);

-- =====================================================
-- Sample Requests Table
-- =====================================================

CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL UNIQUE,
  status sample_request_status NOT NULL DEFAULT 'received',

  -- 配送情報
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  tracking_number TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_sample_requests_user_id ON sample_requests(user_id);
CREATE INDEX idx_sample_requests_status ON sample_requests(status);
CREATE INDEX idx_sample_requests_created_at ON sample_requests(created_at DESC);

-- =====================================================
-- Sample Items Table
-- =====================================================

CREATE TABLE sample_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_request_id UUID NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sample_items_request_id ON sample_items(sample_request_id);

-- =====================================================
-- Inquiry Type Enum
-- =====================================================

CREATE TYPE inquiry_type AS ENUM (
  'product',   -- 商品に関するお問い合わせ
  'quotation', -- 見積に関するお問い合わせ
  'sample',    -- サンプルに関するお問い合わせ
  'order',     -- 注文に関するお問い合わせ
  'billing',   -- 請求に関するお問い合わせ
  'other'      -- その他
);

-- =====================================================
-- Inquiry Status Enum
-- =====================================================

CREATE TYPE inquiry_status AS ENUM (
  'open',      -- 未対応
  'responded', -- 返信済
  'resolved',  -- 完了
  'closed'     -- クローズ
);

-- =====================================================
-- Inquiries Table
-- =====================================================

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inquiry_number TEXT NOT NULL UNIQUE,
  type inquiry_type NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'open',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_type ON inquiries(type);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- =====================================================
-- Announcements Table
-- =====================================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'update', 'notice', 'promotion')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_published BOOLEAN NOT NULL DEFAULT false,

  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_announcements_is_published ON announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_category ON announcements(category);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Order Items: Users can only see items from their own orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Delivery Addresses: Users can only manage their own addresses
CREATE POLICY "Users can view own delivery addresses"
  ON delivery_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own delivery addresses"
  ON delivery_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own delivery addresses"
  ON delivery_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own delivery addresses"
  ON delivery_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Billing Addresses: Users can only manage their own addresses
CREATE POLICY "Users can view own billing addresses"
  ON billing_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing addresses"
  ON billing_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing addresses"
  ON billing_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own billing addresses"
  ON billing_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Quotations: Users can only manage their own quotations
CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotations"
  ON quotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotations"
  ON quotations FOR UPDATE
  USING (auth.uid() = user_id);

-- Quotation Items: Users can only see items from their own quotations
CREATE POLICY "Users can view own quotation items"
  ON quotation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()
    )
  );

-- Sample Requests: Users can only manage their own requests
CREATE POLICY "Users can view own sample requests"
  ON sample_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sample requests"
  ON sample_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sample requests"
  ON sample_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Sample Items: Users can only see items from their own requests
CREATE POLICY "Users can view own sample items"
  ON sample_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sample_requests WHERE sample_requests.id = sample_items.sample_request_id AND sample_requests.user_id = auth.uid()
    )
  );

-- Inquiries: Users can only manage their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inquiries"
  ON inquiries FOR UPDATE
  USING (auth.uid() = user_id);

-- Announcements: All authenticated users can view published announcements
CREATE POLICY "Anyone can view published announcements"
  ON announcements FOR SELECT
  USING (is_published = true);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Updated At trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_addresses_updated_at
  BEFORE UPDATE ON delivery_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_addresses_updated_at
  BEFORE UPDATE ON billing_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sample_requests_updated_at
  BEFORE UPDATE ON sample_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'ORD';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part TEXT := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
BEGIN
  RETURN prefix || date_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Generate unique quotation number
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'QT';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part TEXT := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
BEGIN
  RETURN prefix || date_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Generate unique sample request number
CREATE OR REPLACE FUNCTION generate_sample_request_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'SMP';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part TEXT := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
BEGIN
  RETURN prefix || date_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Generate unique inquiry number
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'INQ';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part TEXT := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
BEGIN
  RETURN prefix || date_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Auto-generate quotation numbers
CREATE TRIGGER generate_quotation_number_trigger
  BEFORE INSERT ON quotations
  FOR EACH ROW
  WHEN (NEW.quotation_number IS NULL)
  EXECUTE FUNCTION generate_quotation_number();

-- Auto-generate sample request numbers
CREATE TRIGGER generate_sample_request_number_trigger
  BEFORE INSERT ON sample_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL)
  EXECUTE FUNCTION generate_sample_request_number();

-- Auto-generate inquiry numbers
CREATE TRIGGER generate_inquiry_number_trigger
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  WHEN (NEW.inquiry_number IS NULL)
  EXECUTE FUNCTION generate_inquiry_number();

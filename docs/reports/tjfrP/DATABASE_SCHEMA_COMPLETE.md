# Complete Database Schema Documentation
**Epackage Lab Web - B2B Packaging Management System**

Generated: 2026-01-06
Database: PostgreSQL (Supabase)
Total Tables: 33 public tables

---

## Table of Contents

1. [Customer Management](#customer-management)
2. [Order & Quotation Management](#order--quotation-management)
3. [Production & Workflow](#production--workflow)
4. [Inventory & Products](#inventory--products)
5. [Shipping & Delivery](#shipping--delivery)
6. [Customer Service](#customer-service)
7. [Billing & Payments](#billing--payments)
8. [Admin & Notifications](#admin--notifications)
9. [File Management](#file-management)
10. [Security & Authentication](#security--authentication)
11. [Korea Integration](#korea-integration)
12. [Enums & Data Types](#enums--data-types)
13. [Indexes](#indexes)
14. [Foreign Keys](#foreign-keys)
15. [Triggers](#triggers)

---

## Customer Management

### profiles (ユーザープロフィール)

User profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,

  -- Names (Japanese)
  kanji_last_name TEXT NOT NULL,
  kanji_first_name TEXT NOT NULL,
  kana_last_name TEXT NOT NULL,
  kana_first_name TEXT NOT NULL,

  -- Contact
  corporate_phone TEXT,
  personal_phone TEXT,

  -- Business Info
  business_type business_type NOT NULL, -- INDIVIDUAL or CORPORATION
  company_name TEXT,
  legal_entity_number TEXT, -- 13-digit Japanese corporate number
  position TEXT,
  department TEXT,
  company_url TEXT,

  -- Product Category
  product_category product_category NOT NULL,
  acquisition_channel TEXT,

  -- Address
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  street TEXT,

  -- Role & Status
  role user_role NOT NULL, -- ADMIN or MEMBER
  status user_status NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, SUSPENDED, DELETED

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_profiles_id` (id)
- `idx_profiles_pending_approval` (created_at DESC) WHERE status = 'PENDING'

---

### delivery_addresses (納品先住所)

Customer delivery addresses for shipments.

```sql
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

  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_delivery_addresses_user_default` (user_id, is_default, created_at DESC)

---

### billing_addresses (請求先住所)

Customer billing addresses for invoices.

```sql
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

  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_billing_addresses_user_default` (user_id, is_default, created_at DESC)

---

### companies (企業情報)

Japanese company information with legal entity types.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  corporate_number TEXT NOT NULL UNIQUE, -- 法人番号 (13 digits)
  name TEXT NOT NULL, -- 登記上の正式名称
  name_kana TEXT NOT NULL, -- カタカナ表記

  legal_entity_type legal_entity_type NOT NULL, -- KK, GK, GKDK, TK, KKK, Other
  industry TEXT NOT NULL,

  payment_terms TEXT, -- 支払条件 (e.g., "月末払い", "60日サイト")

  status company_status NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, INACTIVE

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Constraints:**
- `corporate_number_format`: corporate_number ~ '^\d{13}$'
- `name_kana_katakana`: name_kana ~ '^[\u30A0-\u30FF\s]+$'

**Indexes:**
- `idx_companies_corporate_number` (corporate_number)
- `idx_companies_name` (name)
- `idx_companies_status` (status)
- `idx_companies_industry` (industry)

---

## Order & Quotation Management

### orders (注文)

Customer orders for packaging products.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  order_number TEXT NOT NULL UNIQUE, -- ORD-YYYYMMDD-NNNN
  status order_status NOT NULL DEFAULT 'pending',

  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,

  -- Address references
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  billing_address_id UUID REFERENCES billing_addresses(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_orders_user_status_created` (user_id, status, created_at DESC) WHERE status != 'cancelled'
- `idx_orders_active` (user_id, created_at DESC) WHERE status != 'cancelled'
- `idx_orders_admin_dashboard` (status, created_at DESC) INCLUDE (total_amount, order_number, user_id)
- `idx_orders_recent` (created_at DESC)

---

### order_items (注文項目)

Individual items within an order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id TEXT,
  product_name TEXT NOT NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  specifications JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_order_items_order_product` (order_id, product_id) WHERE product_id IS NOT NULL

---

### order_status_history (注文ステータス履歴)

Audit trail for order status changes.

```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  from_status order_status NOT NULL,
  to_status order_status NOT NULL,

  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,

  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_order_status_history_order_changed_at` (order_id, changed_at DESC)

---

### quotations (見積書)

Price quotations for customers (can be for guests too).

```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for guest quotes

  quotation_number TEXT NOT NULL UNIQUE, -- QUO-YYYYMMDD-NNNN
  status quotation_status NOT NULL DEFAULT 'draft',

  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_quotations_user_status_created` (user_id, status, created_at DESC) WHERE user_id IS NOT NULL AND status != 'expired'
- `idx_quotations_active` (user_id, created_at DESC) WHERE user_id IS NOT NULL AND status NOT IN ('expired', 'rejected')
- `idx_quotations_member_list` (user_id, status, created_at DESC) INCLUDE (quotation_number, total_amount, valid_until) WHERE user_id IS NOT NULL
- `idx_quotations_expired` (valid_until, status) WHERE status IN ('sent', 'approved') AND valid_until IS NOT NULL
- `idx_quotations_recent` (created_at DESC)

---

### quotation_items (見積項目)

Individual items within a quotation.

```sql
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,

  product_id TEXT,
  product_name TEXT NOT NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  specifications JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_quotation_items_quotation_created` (quotation_id, created_at)

---

### contracts (契約書)

B2B contracts with electronic signature support.

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  contract_number TEXT NOT NULL UNIQUE, -- CTR-YYYY-NNNN

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE SET NULL,

  customer_name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

  status contract_status NOT NULL DEFAULT 'DRAFT',

  -- Electronic signatures
  customer_signed_at TIMESTAMPTZ,
  admin_signed_at TIMESTAMPTZ,
  signature_data JSONB,

  pdf_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Constraints:**
- `valid_signature_flow`: Ensures proper signature order

**Indexes:**
- `idx_contracts_contract_number` (contract_number)
- `idx_contracts_order_id` (order_id)
- `idx_contracts_work_order_id` (work_order_id)
- `idx_contracts_company_id` (company_id)
- `idx_contracts_status` (status)
- `idx_contracts_created_at` (created_at DESC)

---

### contract_reminders (契約リマインダー)

Contract expiration and signature reminders.

```sql
CREATE TABLE contract_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

  reminder_type TEXT NOT NULL, -- 'signature', 'expiration', 'renewal'
  scheduled_for TIMESTAMPTZ NOT NULL,

  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Production & Workflow

### production_orders (生産注文)

Production workflow tracking with 9-stage process.

```sql
CREATE TABLE production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  current_stage production_stage NOT NULL,
  stage_data JSONB NOT NULL DEFAULT '{}', -- Data for all 9 stages

  started_at TIMESTAMPTZ,
  estimated_completion_date DATE,
  actual_completion_date TIMESTAMPTZ,

  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  priority TEXT, -- low, normal, high, urgent

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_production_orders_stage_completion` (current_stage, estimated_completion_date) WHERE current_stage IN ('data_received', 'inspection', 'design', 'plate_making')

---

### stage_action_history (ステージアクション履歴)

Audit log for production stage transitions.

```sql
CREATE TABLE stage_action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

  stage production_stage NOT NULL,
  action VARCHAR NOT NULL,

  performed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_stage_action_history_production_created` (production_order_id, performed_at DESC)

---

### design_revisions (デザインリビジョン)

Design revision tracking for orders.

```sql
CREATE TABLE design_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,

  revision_number INTEGER NOT NULL,
  revision_name TEXT NOT NULL,
  status TEXT NOT NULL,

  revision_reason TEXT,
  revision_description TEXT,

  -- AI & Korea workflow
  change_summary JSONB,
  ai_extracted_data JSONB,
  ai_extraction_confidence NUMERIC,
  korean_corrected_data JSONB,
  correction_notes TEXT,
  data_diff JSONB,

  changed_fields TEXT[],
  original_files TEXT[],
  corrected_files TEXT[],
  spec_sheet_url TEXT,

  -- Workflow
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,

  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_decision TEXT,
  review_notes TEXT,

  customer_action TEXT,
  customer_action_at TIMESTAMPTZ,
  customer_notes TEXT,

  priority TEXT,
  estimated_completion_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_design_revisions_order_created` (order_id, created_at DESC) WHERE order_id IS NOT NULL

---

### work_orders (作業指示)

Work order management for production tasks.

```sql
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,

  work_order_number TEXT NOT NULL UNIQUE, -- WO-YYYYMMDD-NNNN
  type TEXT NOT NULL, -- 'production', 'design', 'shipping', etc.

  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',

  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  instructions JSONB,

  scheduled_start_date TIMESTAMPTZ,
  scheduled_completion_date TIMESTAMPTZ,
  actual_start_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,

  estimated_hours NUMERIC,
  actual_hours NUMERIC,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Inventory & Products

### products (製品)

Product catalog with specifications and pricing.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_code TEXT NOT NULL UNIQUE, -- PRD-YYYYMMDD-NNNN
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ja TEXT,
  description_en TEXT,

  category TEXT NOT NULL, -- flat_3_side, stand_up, gusset, box, etc.
  material_type TEXT NOT NULL, -- PET, AL, CPP, PE, NY, PAPER, OTHER

  specifications JSONB NOT NULL DEFAULT '{}',
  pricing_formula JSONB DEFAULT '{}',

  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'JPY',

  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_level INTEGER DEFAULT 10 CHECK (reorder_level >= 0),
  min_order_quantity INTEGER NOT NULL DEFAULT 100 CHECK (min_order_quantity > 0),

  lead_time_days INTEGER NOT NULL DEFAULT 14 CHECK (lead_time_days > 0),

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  image_url TEXT,
  meta_keywords TEXT[],
  meta_description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  version INTEGER NOT NULL DEFAULT 1
);
```

**Indexes:**
- `idx_products_product_code` (product_code)
- `idx_products_category` (category)
- `idx_products_material_type` (material_type)
- `idx_products_is_active` (is_active) WHERE is_active = TRUE
- `idx_products_catalog` (category, is_active, sort_order) WHERE is_active = TRUE
- `idx_products_stock_quantity` (stock_quantity)
- `idx_products_reorder_check` (stock_quantity, reorder_level) WHERE is_active = TRUE

---

### inventory (在庫)

Stock levels by location.

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  warehouse_location TEXT NOT NULL DEFAULT 'MAIN', -- MAIN, TOKYO, OSAKA, etc.
  bin_location TEXT, -- A-01-15, BIN-42, etc.

  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_allocated INTEGER NOT NULL DEFAULT 0 CHECK (quantity_allocated >= 0),

  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,

  reorder_point INTEGER DEFAULT 10 CHECK (reorder_point >= 0),
  max_stock_level INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT inventory_location_unique UNIQUE (product_id, warehouse_location, bin_location)
);
```

**Indexes:**
- `idx_inventory_product_id` (product_id)
- `idx_inventory_warehouse_location` (warehouse_location)
- `idx_inventory_bin_location` (bin_location)
- `idx_inventory_reorder_check` (product_id, quantity_available) WHERE quantity_available <= reorder_point

---

### inventory_transactions (在庫トランザクション)

Stock movement history.

```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  transaction_type TEXT NOT NULL, -- receipt, issue, adjustment, transfer, return, production_in, production_out
  quantity INTEGER NOT NULL,

  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,

  reference_number TEXT,
  reference_type TEXT,
  reason TEXT,
  notes TEXT,

  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  transaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_inventory_transactions_product_id` (product_id)
- `idx_inventory_transactions_inventory_id` (inventory_id)
- `idx_inventory_transactions_order_id` (order_id)
- `idx_inventory_transactions_transaction_type` (transaction_type)
- `idx_inventory_transactions_transaction_at` (transaction_at DESC)
- `idx_inventory_transactions_audit` (product_id, transaction_type, transaction_at DESC)

---

## Shipping & Delivery

### shipments (配送)

Shipping information for orders.

```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,

  shipment_number TEXT NOT NULL UNIQUE, -- SHP-YYYYMMDD-NNNN
  tracking_number TEXT UNIQUE,

  carrier_name TEXT NOT NULL, -- Yamato Transport, Sagawa Express, etc.
  carrier_code TEXT, -- YTO, SGE, etc.
  service_level TEXT, -- EXPRESS, STANDARD, ECONOMY

  shipping_method TEXT NOT NULL, -- ground, air, sea, rail, courier

  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'JPY',

  package_details JSONB DEFAULT '{}',

  tracking_url TEXT,
  estimated_delivery_date DATE,

  status TEXT NOT NULL DEFAULT 'pending', -- pending, picked_up, in_transit, out_for_delivery, delivered, failed, returned, cancelled

  shipped_at TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  delivered_to TEXT,
  delivery_signature_url TEXT,
  delivery_photo_url TEXT,

  shipping_notes TEXT,
  delivery_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_shipments_tracking_status` (tracking_number, status) WHERE tracking_number IS NOT NULL
- `idx_shipments_order_id` (order_id)
- `idx_shipments_status` (status)
- `idx_shipments_shipped_at` (shipped_at)
- `idx_shipments_active` (status, shipped_at) WHERE status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery')

---

### shipment_tracking_events (配送追跡イベント)

Shipment tracking event history.

```sql
CREATE TABLE shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,

  status TEXT NOT NULL,
  event_time TIMESTAMPTZ,
  location TEXT,
  description TEXT,
  raw_data JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_shipment_tracking_events_shipment_created` (shipment_id, event_time DESC) WHERE shipment_id IS NOT NULL

---

### deliveries (納品)

Delivery tracking information.

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,

  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,

  scheduled_delivery_date DATE,
  actual_delivery_date DATE,

  delivery_time_window TEXT, -- e.g., "9:00-12:00"

  status TEXT NOT NULL DEFAULT 'pending', -- pending, scheduled, out_for_delivery, delivered, failed

  recipient_name TEXT,
  recipient_signature TEXT,
  delivery_photo_url TEXT,

  delivery_notes TEXT,
  failure_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Customer Service

### inquiries (お問い合わせ)

Contact form submissions and customer inquiries.

```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  inquiry_number TEXT NOT NULL UNIQUE, -- INQ-YYYYMMDD-NNNN

  type inquiry_type NOT NULL, -- product, quotation, sample, order, billing, other, general, technical, sales, support
  status inquiry_status NOT NULL DEFAULT 'open', -- open, responded, resolved, closed, pending, in_progress

  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,

  request_number TEXT, -- For linking to orders/quotations/samples

  -- Customer info (snapshot)
  customer_name TEXT NOT NULL,
  customer_name_kana TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  fax TEXT,

  -- Address
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  street TEXT,

  -- Priority
  urgency TEXT, -- low, medium, high, urgent
  preferred_contact TEXT,

  privacy_consent BOOLEAN NOT NULL,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_inquiries_type_status_created` (type, status, created_at DESC)
- `idx_inquiries_active` (type, created_at DESC) WHERE status IN ('open', 'pending', 'in_progress')
- `idx_inquiries_search` USING gin(to_tsvector('simple', subject || ' ' || message || ' ' || customer_name || ' ' || COALESCE(company_name, '')))

---

### contact_submissions (コンタクトフォーム)

General contact form submissions (public access).

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  submission_number TEXT NOT NULL UNIQUE, -- CON-YYYYMMDD-NNNN

  type TEXT NOT NULL, -- inquiry, quote_request, support, other
  status TEXT NOT NULL DEFAULT 'new', -- new, processing, resolved, closed

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,

  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  response TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);
```

---

### sample_requests (サンプルリクエスト)

Sample product requests from customers.

```sql
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  request_number TEXT NOT NULL UNIQUE, -- SAM-YYYYMMDD-NNNN
  status sample_request_status NOT NULL DEFAULT 'received', -- received, processing, shipped, delivered, cancelled

  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  tracking_number TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_sample_requests_user_created` (user_id, created_at DESC) WHERE user_id IS NOT NULL

---

### sample_items (サンプル項目)

Individual items within a sample request (max 5).

```sql
CREATE TABLE sample_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_request_id UUID NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,

  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_sample_items_request_created` (sample_request_id, created_at)

---

### announcements (お知らせ)

System announcements for users.

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  content TEXT NOT NULL,

  category TEXT NOT NULL CHECK (category IN ('maintenance', 'update', 'notice', 'promotion')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',

  is_published BOOLEAN NOT NULL DEFAULT FALSE,

  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_announcements_published` (is_published, published_at DESC) WHERE is_published = true

---

## Billing & Payments

### invoices (請求書)

Customer invoices with payment tracking.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  invoice_number TEXT NOT NULL UNIQUE, -- INV-YYYY-NNNN

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Customer snapshot
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Company snapshot
  company_name TEXT,
  company_address TEXT,

  status invoice_status NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, VIEWED, OVERDUE, PAID, PARTIAL, CANCELLED, REFUNDED

  -- Amounts
  subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,

  -- Payment info
  payment_method TEXT,
  payment_terms TEXT,
  bank_account JSONB, -- { bank_name, branch_name, account_type, account_number, account_holder }

  notes TEXT,
  customer_notes TEXT,
  admin_notes TEXT,

  pdf_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_invoices_invoice_number` (invoice_number)
- `idx_invoices_user_id` (user_id)
- `idx_invoices_company_id` (company_id)
- `idx_invoices_order_id` (order_id)
- `idx_invoices_status` (status)
- `idx_invoices_issue_date` (issue_date)
- `idx_invoices_due_date` (due_date)

---

### invoice_items (請求項目)

Line items for invoices.

```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  product_id UUID,
  product_name TEXT NOT NULL,
  product_code TEXT,
  description TEXT,

  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT '個', -- 個, 枚, 式, etc.
  unit_price NUMERIC(12, 2) NOT NULL,

  total_price NUMERIC(12, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,

  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00, -- 10% Japanese consumption tax
  tax_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price * tax_rate / 100) STORED,

  notes TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_invoice_items_invoice_id` (invoice_id)
- `idx_invoice_items_display_order` (invoice_id, display_order)

---

### invoice_payments (請求支払い)

Payment records for invoices.

```sql
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- bank_transfer, credit_card, cash, other

  transaction_id TEXT,
  reference_number TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_invoice_payments_invoice_id` (invoice_id)
- `idx_invoice_payments_payment_date` (payment_date)

---

### payment_confirmations (支払い確認)

Payment confirmation records.

```sql
CREATE TABLE payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,

  confirmation_number TEXT NOT NULL UNIQUE, -- PAY-YYYYMMDD-NNNN

  payment_method TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, failed

  transaction_id TEXT,
  gateway_response JSONB,

  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Admin & Notifications

### admin_notifications (管理者通知)

Internal admin notifications and alerts.

```sql
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type TEXT NOT NULL, -- order, quotation, production, shipping, inventory, system, alert
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  action_required BOOLEAN NOT NULL DEFAULT FALSE,
  action_link TEXT,

  -- Targeting
  target_role TEXT, -- ADMIN, OPERATOR, etc.
  target_user UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Reference
  reference_id UUID,
  reference_type TEXT, -- orders, quotations, productions, etc.

  -- Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Dismissal
  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_admin_notifications_target_read_created` (target_user, is_read, created_at DESC)
- `idx_admin_notifications_type_status` (type, is_dismissed, created_at DESC)
- `idx_admin_notifications_reference` (reference_type, reference_id)

---

### notifications (通知)

User notifications for customers.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- order, shipment, payment, quotation, sample, announcement
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  action_link TEXT,

  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_notifications_user_read_created` (user_id, is_read, created_at DESC)
- `idx_notifications_type` (type)

---

### password_reset_tokens (パスワードリセットトークン)

Password reset tokens for authentication.

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  token TEXT NOT NULL UNIQUE,

  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_password_reset_tokens_token` (token)
- `idx_password_reset_tokens_user_id` (user_id)
- `idx_password_reset_tokens_expires_at` (expires_at)

---

## File Management

### files (ファイル)

File attachments for orders and quotations.

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,

  file_type file_type NOT NULL, -- AI, PDF, PSD, PNG, JPG, EXCEL, OTHER
  original_filename TEXT NOT NULL,

  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,

  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT TRUE,

  validation_status file_validation_status NOT NULL DEFAULT 'PENDING', -- PENDING, VALID, INVALID
  validation_results JSONB,

  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  validated_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_files_order_quotation` (order_id, quotation_id, is_latest) WHERE is_latest = true
- `idx_files_uploaded_by_created` (uploaded_by, uploaded_at DESC) WHERE uploaded_by IS NOT NULL

---

### signatures (署名)

Electronic signature records for contracts and orders.

```sql
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  document_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,

  provider TEXT NOT NULL, -- docusign, hellosign, local
  envelope_id TEXT UNIQUE,

  status TEXT NOT NULL DEFAULT 'pending', -- pending, viewed, signed, delivered, cancelled, expired, declined
  signature_type TEXT, -- handwritten, hanko, mixed

  signers JSONB NOT NULL DEFAULT '[]',
  signature_data JSONB,

  subject TEXT,
  message TEXT,

  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  cancel_reason TEXT,

  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  metadata JSONB DEFAULT '{}'
);
```

**Indexes:**
- `idx_signatures_document_id` (document_id)
- `idx_signatures_order_id` (order_id)
- `idx_signatures_contract_id` (contract_id)
- `idx_signatures_envelope_id` (envelope_id)
- `idx_signatures_status` (status)
- `idx_signatures_provider` (provider)
- `idx_signatures_created_by` (created_by)
- `idx_signatures_signed_at` (signed_at DESC)

---

### signature_events (署名イベント)

Audit trail for signature events.

```sql
CREATE TABLE signature_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  envelope_id TEXT NOT NULL,
  provider TEXT NOT NULL,

  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_signature_events_envelope_id` (envelope_id)
- `idx_signature_events_provider` (provider)
- `idx_signature_events_created_at` (created_at DESC)

---

### hanko_images (判子画像)

Japanese seal (hanko) images for signatures.

```sql
CREATE TABLE hanko_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  hanko_name TEXT NOT NULL, -- 代表者印, 角印, etc.
  image_url TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,

  is_default BOOLEAN DEFAULT FALSE,

  validation_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_hanko_images_user_id` (user_id)
- `idx_hanko_images_is_default` (is_default)

---

## Korea Integration

### korea_corrections (韓国修正)

Korea correction workflow tracking.

```sql
CREATE TABLE korea_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,

  correction_source correction_source NOT NULL, -- email, phone, portal, manual
  correction_reference TEXT,

  correction_date TIMESTAMPTZ NOT NULL,

  issue_description TEXT,
  issue_category TEXT,
  urgency TEXT NOT NULL,

  corrected_data JSONB,
  correction_notes TEXT,

  assigned_to UUID,
  status correction_status NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, rejected

  admin_notes TEXT,
  corrected_files TEXT[],

  customer_notified BOOLEAN NOT NULL DEFAULT FALSE,
  customer_notification_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_korea_corrections_status_urgency` (status, urgency, created_at) WHERE status IN ('pending', 'in_progress')

---

### korea_transfer_log (韓国転送ログ)

Korea transfer tracking log.

```sql
CREATE TABLE korea_transfer_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  sent_to TEXT NOT NULL, -- Recipient
  files_count INTEGER NOT NULL,
  urgency TEXT NOT NULL,

  message_id TEXT,
  status TEXT NOT NULL, -- pending, sent, failed

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Enums & Data Types

### order_status (注文ステータス)
```
pending, processing, manufacturing, ready, shipped, delivered, cancelled
```
Japanese: 受付待, 処理中, 製造中, 発送待, 発送完了, 配送完了, キャンセル

### quotation_status (見積ステータス)
```
draft, sent, approved, rejected, expired
```
Japanese: 作成中, 送信済, 承認済, 却下, 期限切れ

### production_stage (生産ステージ)
```
data_received, inspection, design, plate_making, printing,
surface_finishing, die_cutting, lamination, final_inspection
```
Japanese: データ受領, 検品, デザイン, 版作成, 印刷, 表面加工, ダイカット, ラミネート, 最終検品

### sample_request_status (サンプルリクエストステータス)
```
received, processing, shipped, delivered, cancelled
```
Japanese: 受付済, 処理中, 発送済, 配送完了, キャンセル

### inquiry_type (お問い合わせ種類)
```
product, quotation, sample, order, billing, other, general,
technical, sales, support
```

### inquiry_status (お問い合わせステータス)
```
open, responded, resolved, closed, pending, in_progress
```
Japanese: 未対応, 返信済, 完了, クローズ, 保留, 対応中

### user_role (ユーザーロール)
```
ADMIN, MEMBER
```
Japanese: 管理者, メンバー

### user_status (ユーザーステータス)
```
PENDING, ACTIVE, SUSPENDED, DELETED
```
Japanese: 承認待, 有効, 停止中, 削除済

### business_type (ビジネス種類)
```
INDIVIDUAL, CORPORATION
```
Japanese: 個人, 法人

### product_category (製品カテゴリー)
```
COSMETICS, CLOTHING, ELECTRONICS, KITCHEN, FURNITURE, OTHER
```
Japanese: 化粧品, 衣類, 電子機器, キッチン, 家具, その他

### file_type (ファイル種類)
```
AI, PDF, PSD, PNG, JPG, EXCEL, OTHER
```

### file_validation_status (ファイル検証ステータス)
```
PENDING, VALID, INVALID
```
Japanese: 検証待, 有効, 無効

### correction_source (修正ソース)
```
email, phone, portal, manual
```
Japanese: メール, 電話, ポータル, 手動

### correction_status (修正ステータス)
```
pending, in_progress, completed, rejected
```
Japanese: 保留中, 対応中, 完了, 却下

### contract_status (契約ステータス)
```
DRAFT, SENT, CUSTOMER_SIGNED, ADMIN_SIGNED, ACTIVE, CANCELLED
```
Japanese: ドラフト, 送付済み, 顧客署名済, 管理者署名済, 有効, キャンセル

### invoice_status (請求ステータス)
```
DRAFT, SENT, VIEWED, OVERDUE, PAID, PARTIAL, CANCELLED, REFUNDED
```
Japanese: ドラフト, 送付済, 確認済, 延滞, 支払済, 一部支払, キャンセル, 返金

### legal_entity_type (法人種類)
```
KK (Kabushiki Kaisha - 株式会社)
GK (Godo Kaisha - 合同会社)
GKDK (Gomei Kaisha - 合名会社)
TK (Goshi Kaisha - 合資会社)
KKK (Sogo Kaisha - 相互会社)
Other
```

### company_status (会社ステータス)
```
ACTIVE, SUSPENDED, INACTIVE
```
Japanese: 有効, 停止中, 無効

---

## Indexes

### Priority 1: Core Query Patterns (5 indexes)
- `idx_quotations_user_status_created` on quotations(user_id, status, created_at DESC)
- `idx_orders_user_status_created` on orders(user_id, status, created_at DESC)
- `idx_production_orders_stage_completion` on production_orders(current_stage, estimated_completion_date)
- `idx_shipments_tracking_status` on shipments(tracking_number, status)

### Priority 2: N+1 Query Prevention (5 indexes)
- `idx_quotation_items_quotation_created` on quotation_items(quotation_id, created_at)
- `idx_order_items_order_product` on order_items(order_id, product_id)
- `idx_sample_requests_user_created` on sample_requests(user_id, created_at DESC)
- `idx_inquiries_type_status_created` on inquiries(type, status, created_at DESC)

### Priority 3: Monitoring & Alerting (5 indexes)
- `idx_quotations_expired` on quotations(valid_until, status)
- `idx_orders_recent` on orders(created_at DESC)
- `idx_quotations_recent` on quotations(created_at DESC)
- `idx_design_revisions_order_created` on design_revisions(order_id, created_at DESC)

### Priority 4: Partial Indexes (4 indexes)
- `idx_quotations_active` on quotations(user_id, created_at DESC) WHERE status NOT IN ('expired', 'rejected')
- `idx_orders_active` on orders(user_id, created_at DESC) WHERE status != 'cancelled'
- `idx_profiles_pending_approval` on profiles(created_at DESC) WHERE status = 'PENDING'
- `idx_inquiries_active` on inquiries(type, created_at DESC) WHERE status IN ('open', 'pending', 'in_progress')

### Covering Indexes (2 indexes)
- `idx_orders_admin_dashboard` on orders(status, created_at DESC) INCLUDE (total_amount, order_number, user_id)
- `idx_quotations_member_list` on quotations(user_id, status, created_at DESC) INCLUDE (quotation_number, total_amount, valid_until)

### Full-Text Search (1 index)
- `idx_inquiries_search` on inquiries USING gin(to_tsvector('simple', subject || ' ' || message || ' ' || customer_name || ' ' || COALESCE(company_name, '')))

---

## Foreign Keys

**Total: 19+ Foreign Key Relationships**

| From Table | From Column | To Table | To Column | On Delete |
|------------|-------------|----------|-----------|-----------|
| design_revisions | order_id | orders | id | - |
| design_revisions | quotation_id | quotations | id | - |
| design_revisions | reviewed_by | profiles | id | - |
| design_revisions | submitted_by | profiles | id | - |
| files | order_id | orders | id | - |
| files | quotation_id | quotations | id | - |
| files | uploaded_by | profiles | id | - |
| korea_corrections | order_id | orders | id | - |
| korea_corrections | quotation_id | quotations | id | - |
| order_items | order_id | orders | id | CASCADE |
| production_orders | order_id | orders | id | - |
| quotation_items | quotation_id | quotations | id | - |
| sample_items | sample_request_id | sample_requests | id | - |
| sample_requests | delivery_address_id | delivery_addresses | id | - |
| shipments | order_id | orders | id | - |
| stage_action_history | performed_by | profiles | id | - |
| stage_action_history | production_order_id | production_orders | id | - |

---

## Triggers

**Total: 19+ Database Triggers**

| Trigger | Table | Event | Function | Purpose |
|---------|-------|-------|----------|---------|
| update_announcements_updated_at | announcements | UPDATE | update_updated_at_column() | Auto-update timestamp |
| update_billing_addresses_updated_at | billing_addresses | UPDATE | update_updated_at_column() | Auto-update timestamp |
| update_delivery_addresses_updated_at | delivery_addresses | UPDATE | update_updated_at_column() | Auto-update timestamp |
| generate_inquiry_number_trigger | inquiries | INSERT | set_inquiry_number() | Auto-generate inquiry number |
| update_inquiries_updated_at | inquiries | UPDATE | update_updated_at_column() | Auto-update timestamp |
| korea_corrections_updated_at | korea_corrections | UPDATE | update_korea_corrections_updated_at() | Auto-update timestamp |
| generate_order_number_trigger | orders | INSERT | set_order_number() | Auto-generate order number |
| update_orders_updated_at | orders | UPDATE | update_updated_at_column() | Auto-update timestamp |
| trigger_auto_update_progress | production_orders | INSERT/UPDATE | auto_update_progress_percentage() | Auto-calculate progress |
| trigger_initialize_stage_data | production_orders | INSERT | initialize_production_stage_data() | Initialize stage data |
| trigger_log_stage_actions | production_orders | UPDATE | log_stage_action() | Log stage changes |
| update_production_orders_updated_at | production_orders | UPDATE | update_updated_at_column() | Auto-update timestamp |
| profiles_updated_at | profiles | UPDATE | update_updated_at_column() | Auto-update timestamp |
| generate_quotation_number_trigger | quotations | INSERT | set_quotation_number() | Auto-generate quotation number |
| update_quotations_updated_at | quotations | UPDATE | update_updated_at_column() | Auto-update timestamp |
| generate_sample_request_number_trigger | sample_requests | INSERT | set_sample_request_number() | Auto-generate request number |
| update_sample_requests_updated_at | sample_requests | UPDATE | update_updated_at_column() | Auto-update timestamp |

---

## Key Features

### Security
- **Row Level Security (RLS)** enabled on all tables
- User-based access control with role policies
- File upload security validation
- Password reset tokens with expiration

### Audit Trail
- Automatic timestamp tracking (created_at, updated_at)
- Order status history tracking
- Production stage action logging
- Inventory transaction history
- Shipment tracking event history

### Performance
- 28+ composite and partial indexes
- Covering indexes to prevent table lookups
- Full-text search for Japanese text
- Optimistic locking with version columns

### Integration
- Electronic signature support (DocuSign, HelloSign, Local)
- Japanese hanko (seal) image storage
- Korea correction workflow
- Shipment carrier tracking (Yamato, Sagawa, Japan Post)
- AI-powered data extraction from files

### Business Logic
- Auto-generation of reference numbers (ORD-, QUO-, INV-, etc.)
- Automatic invoice total calculation
- Payment tracking and status updates
- Production progress calculation
- Inventory reorder alerts
- Contract signature workflow

---

## Database Statistics

- **Total Tables**: 33 public tables
- **Total Indexes**: 50+ indexes
- **Foreign Keys**: 19+ constraints
- **Triggers**: 19+ triggers
- **Enums**: 15+ custom types
- **RLS Policies**: 100+ security policies

---

**Last Updated**: 2026-01-06
**Schema Version**: v2.0
**Database**: PostgreSQL 15+ (Supabase)

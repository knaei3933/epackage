# Database Schema Documentation

Complete database schema documentation for Epackage Lab Web.

## Table of Contents

- [Overview](#overview)
- [Core Tables](#core-tables)
- [Enums](#enums)
- [Indexes](#indexes)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Migration History](#migration-history)
- [Relationships](#relationships)
- [Database Functions](#database-functions)

## Overview

The database is built on Supabase (PostgreSQL) with the following design principles:

- **Normalization**: Third normal form (3NF)
- **Security**: Row Level Security (RLS) on all tables
- **Audit Trail**: Timestamps and user tracking on all records
- **Performance**: Optimized indexes for common queries
- **Integrity**: Foreign keys and constraints

## Core Tables

### profiles

User profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'production', 'shipment')),
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  corporate_number TEXT, -- Japanese corporate number (法人番号)
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- Comments
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.corporate_number IS 'Japanese corporate number (法人番号)';
COMMENT ON COLUMN profiles.role IS 'User role: customer, admin, production, or shipment';
```

### products

Product catalog for packaging materials.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ja TEXT, -- Japanese name
  description TEXT,
  description_ja TEXT, -- Japanese description
  category TEXT NOT NULL CHECK (category IN ('envelope', 'box', 'bag', 'packaging', 'other')),
  subcategory TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece', -- piece, set, box
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER DEFAULT 10000,
  weight NUMERIC(10, 2), -- in grams
  dimensions JSONB, -- {length, width, height} in cm
  material TEXT,
  material_ja TEXT,
  color TEXT,
  size TEXT,
  images TEXT[], -- Array of image URLs
  is_active BOOLEAN DEFAULT TRUE,
  is_custom BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  specifications JSONB, -- Additional specifications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('japanese', name || ' ' || COALESCE(description, '')));
```

### orders

Customer orders for packaging products.

```sql
CREATE TYPE order_status AS ENUM (
  'pending_approval', 'approved', 'in_production', 'ready_for_shipment',
  'shipped', 'delivered', 'cancelled', 'on_hold'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT generate_order_number(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending_approval',

  -- Pricing
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Addresses
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,

  -- Additional info
  customer_notes TEXT,
  internal_notes TEXT,
  special_instructions TEXT,

  -- Approval
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timeline
  estimated_delivery_date DATE,
  actual_delivery_date DATE,

  -- Metadata
  source TEXT DEFAULT 'web', -- web, email, phone, other
  utm_params JSONB, -- Marketing parameters

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_delivery ON orders(estimated_delivery_date) WHERE status IN ('approved', 'in_production');
```

### order_items

Individual items within an order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_name_ja TEXT,

  -- Specifications
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Custom specifications
  specifications JSONB, -- {size, material, color, printing, etc.}
  post_processing JSONB, -- [{type: 'window', position: 'bottom-left'}, ...]

  -- Pricing details
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### production_orders

Production orders for manufacturing.

```sql
CREATE TYPE production_stage AS ENUM (
  'pending', 'scheduled', 'printing', 'cutting', 'folding',
  'assembly', 'quality_check', 'completed'
);

CREATE TABLE production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_number TEXT NOT NULL UNIQUE DEFAULT generate_production_number(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_id UUID REFERENCES order_items(id),

  status production_stage NOT NULL DEFAULT 'pending',
  stage production_stage NOT NULL DEFAULT 'pending',

  -- Scheduling
  scheduled_date DATE,
  start_date TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  actual_completion TIMESTAMPTZ,

  -- Production details
  quantity_to_produce INTEGER NOT NULL,
  quantity_produced INTEGER DEFAULT 0,
  quantity_rejected INTEGER DEFAULT 0,

  -- Quality
  quality_check_passed BOOLEAN DEFAULT FALSE,
  quality_check_notes TEXT,

  -- Resources
  assigned_to UUID REFERENCES profiles(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Timeline
  production_hours DECIMAL(5, 2),
  material_used JSONB, -- Track materials used

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_production_orders_order ON production_orders(order_id);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_production_orders_scheduled ON production_orders(scheduled_date) WHERE status = 'scheduled';
```

### shipments

Shipping information for orders.

```sql
CREATE TYPE shipment_status AS ENUM (
  'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'
);

CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT NOT NULL UNIQUE DEFAULT generate_shipment_number(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  production_order_id UUID REFERENCES production_orders(id),

  -- Carrier info
  carrier TEXT NOT NULL CHECK (carrier IN ('yamato', 'sagawa', 'jp_post', 'seino')),
  tracking_number TEXT UNIQUE,
  service_type TEXT, -- standard, express, etc.

  status shipment_status NOT NULL DEFAULT 'pending',

  -- Addresses
  ship_from JSONB NOT NULL,
  ship_to JSONB NOT NULL,

  -- Schedule
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  delivery_attempts INTEGER DEFAULT 0,

  -- Package details
  packages JSONB, -- [{weight, dimensions, tracking_number}, ...]
  total_weight DECIMAL(10, 2),
  shipping_fee DECIMAL(10, 2),

  -- Documents
  shipping_label_url TEXT,
  commercial_invoice_url TEXT,

  tracking_history JSONB, -- [{status, location, timestamp, description}, ...]

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
```

### documents

Generated documents (quotations, invoices, etc.).

```sql
CREATE TYPE document_type AS ENUM (
  'quotation', 'invoice', 'delivery_slip', 'receipt', 'other'
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT NOT NULL UNIQUE,
  type document_type NOT NULL,

  -- Relations
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- File info
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  file_type TEXT NOT NULL DEFAULT 'application/pdf',

  -- Status
  is_signed BOOLEAN DEFAULT FALSE,
  signature_id UUID, -- DocuSign envelope ID
  signature_status TEXT,

  -- Validity
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,

  -- Amounts (for quotations and invoices)
  subtotal DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_documents_order ON documents(order_id);
CREATE INDEX idx_documents_customer ON documents(customer_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_number ON documents(document_number);
```

### contact_submissions

Contact form submissions.

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_number TEXT NOT NULL UNIQUE DEFAULT generate_submission_number(),

  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,

  subject TEXT,
  inquiry_type TEXT CHECK (inquiry_type IN ('general', 'technical', 'sales', 'support')),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  preferred_contact TEXT CHECK (preferred_contact IN ('email', 'phone')),

  message TEXT NOT NULL,

  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'closed')),

  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);
```

### sample_requests

Sample product requests.

```sql
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE DEFAULT generate_sample_number(),

  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Address
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,

  -- Samples
  samples JSONB NOT NULL, -- [{product_id, product_name, quantity, specifications}, ...]

  -- Project info
  project_details TEXT,
  intended_use TEXT,
  annual_volume INTEGER,

  -- Consent
  privacy_consent BOOLEAN NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),

  assigned_to UUID REFERENCES profiles(id),
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sample_requests_status ON sample_requests(status);
CREATE INDEX idx_sample_requests_email ON sample_requests(email);
```

## Enums

### order_status

```sql
CREATE TYPE order_status AS ENUM (
  'pending_approval', -- Order awaiting admin approval
  'approved',          -- Order approved, ready for production
  'in_production',     -- Order in production
  'ready_for_shipment',-- Production complete, awaiting shipment
  'shipped',           -- Order shipped
  'delivered',         -- Order delivered
  'cancelled',         -- Order cancelled
  'on_hold'           -- Order on hold
);
```

### production_stage

```sql
CREATE TYPE production_stage AS ENUM (
  'pending',        -- Production order created, not started
  'scheduled',      -- Production scheduled
  'printing',       -- Printing in progress
  'cutting',        -- Cutting in progress
  'folding',        -- Folding in progress
  'assembly',       -- Assembly in progress
  'quality_check',  -- Quality check in progress
  'completed'       -- Production complete
);
```

### shipment_status

```sql
CREATE TYPE shipment_status AS ENUM (
  'pending',          -- Awaiting carrier pickup
  'picked_up',        -- Carrier has picked up
  'in_transit',       -- In transit to destination
  'out_for_delivery', -- Out for final delivery
  'delivered',        -- Delivered successfully
  'failed',           -- Delivery failed
  'returned'          -- Returned to sender
);
```

### document_type

```sql
CREATE TYPE document_type AS ENUM (
  'quotation',     -- Sales quotation
  'invoice',       -- Invoice
  'delivery_slip', -- Delivery slip (納品書)
  'receipt',       -- Payment receipt
  'other'          -- Other document types
);
```

## Indexes

### Performance Indexes

```sql
-- Full-text search on products
CREATE INDEX idx_products_search ON products
USING GIN(to_tsvector('japanese', name || ' ' || COALESCE(description, '')));

-- Order lookup by customer and status
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Production scheduling
CREATE INDEX idx_production_scheduling ON production_orders(scheduled_date, status)
WHERE status IN ('pending', 'scheduled');

-- Shipment tracking
CREATE INDEX idx_shipments_tracking_status ON shipments(tracking_number, status)
WHERE tracking_number IS NOT NULL;

-- Recent documents
CREATE INDEX idx_documents_recent ON documents(created_at DESC)
WHERE created_at > NOW() - INTERVAL '90 days';
```

### Composite Indexes

```sql
-- Orders by date and status
CREATE INDEX idx_orders_date_status ON orders(created_at DESC, status);

-- Production orders by priority and date
CREATE INDEX idx_production_priority_date ON production_orders(priority, scheduled_date)
WHERE status IN ('pending', 'scheduled');

-- Shipments by carrier and date
CREATE INDEX idx_shipments_carrier_date ON shipments(carrier, created_at DESC);
```

## Row Level Security (RLS)

### Enable RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### profiles

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### orders

```sql
-- Customers can view own orders
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (auth.uid() = customer_id);

-- Customers can create orders
CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
ON orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### production_orders

```sql
-- Production staff can view production orders
CREATE POLICY "Production staff can view production orders"
ON production_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'production')
  )
);

-- Production staff can update production orders
CREATE POLICY "Production staff can update production orders"
ON production_orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'production')
  )
);
```

#### documents

```sql
-- Customers can view own documents
CREATE POLICY "Customers can view own documents"
ON documents FOR SELECT
USING (auth.uid() = customer_id);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Migration History

### Migration 001: Initial Schema

```sql
-- Create core tables
CREATE TABLE profiles (...);
CREATE TABLE products (...);
CREATE TABLE orders (...);
CREATE TYPE order_status AS ENUM (...);
```

### Migration 002: Production System

```sql
-- Create production tables
CREATE TABLE production_orders (...);
CREATE TYPE production_stage AS ENUM (...);
```

### Migration 003: Shipping System

```sql
-- Create shipping tables
CREATE TABLE shipments (...);
CREATE TYPE shipment_status AS ENUM (...);
```

### Migration 004: Document System

```sql
-- Create document tables
CREATE TABLE documents (...);
CREATE TYPE document_type AS ENUM (...);
```

### Migration 005: RLS and Security

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles ...;
-- ... etc
```

## Relationships

### Entity Relationship Diagram

```
profiles (1) ──────< (N) orders
  │                     │
  │                     │
  │                     └───────< (N) order_items ──< products
  │
  └─────> documents

orders (1) ──────< (N) production_orders
  │
  └─────< (1) shipments
```

## Database Functions

### generate_order_number()

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

### generate_production_number()

```sql
CREATE OR REPLACE FUNCTION generate_production_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PRD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('production_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

### generate_shipment_number()

```sql
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SHP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('shipment_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

### update_updated_at()

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

For database administration:
- Supabase Dashboard: https://supabase.com/dashboard
- PostgreSQL Documentation: https://www.postgresql.org/docs/

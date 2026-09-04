-- =====================================================
-- Migration: Products Table (Phase 1 - Foundation)
-- Purpose: Create products table for B2B workflow
-- Created: 2025-12-31
-- =====================================================
-- This migration creates the products table with:
-- 1. Product identification (code, names, category)
-- 2. Specifications (JSONB for flexibility)
-- 3. Pricing and inventory
-- 4. Lead times and display order
-- 5. Full indexing for performance
-- 6. RLS policies for security

-- =====================================================
-- 1. Create Products Table
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product identification
  product_code TEXT NOT NULL UNIQUE,
  name_ja TEXT NOT NULL,              -- Japanese product name
  name_en TEXT NOT NULL,              -- English product name
  description_ja TEXT,                -- Japanese description
  description_en TEXT,                -- English description

  -- Categorization
  category TEXT NOT NULL CHECK (
    category IN (
      'flat_3_side',      -- Flat pouch 3-side seal
      'stand_up',         -- Stand-up pouch
      'gusset',           -- Gusset bag
      'box',              -- Box-type pouch
      'flat_with_zip',    -- Flat pouch with zipper
      'special',          -- Special shape
      'soft_pouch',       -- Soft pouch
      'spout_pouch',      -- Spout pouch
      'roll_film'         -- Roll film
    )
  ),
  material_type TEXT NOT NULL CHECK (
    material_type IN (
      'PET',              -- Polyethylene terephthalate
      'AL',               -- Aluminum
      'CPP',              -- Cast polypropylene
      'PE',               -- Polyethylene
      'NY',               -- Nylon
      'PAPER',            -- Paper
      'OTHER'
    )
  ),

  -- Specifications (JSONB for flexible structure)
  specifications JSONB NOT NULL DEFAULT '{}',
  -- Example structure:
  -- {
  --   "dimensions": {
  --     "width_mm": 200,
  --     "height_mm": 300,
  --     "gusset_mm": 80
  --   },
  --   "thickness": {
  --     "total_microns": 120,
  --     "layers": ["PET/AL/CPP"]
  --   },
  --   "features": ["zipper", "valve", "hang_hole"],
  --   "print_type": "gravure",
  --   "max_print_colors": 9
  -- }

  -- Pricing
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'JPY' CHECK (currency IN ('JPY', 'USD', 'EUR')),

  -- Pricing formula (JSONB for complex calculations)
  pricing_formula JSONB DEFAULT '{}',
  -- Example structure:
  -- {
  --   "type": "area_based",
  --   "base_rate": 150,  // JPY per square meter
  --   "material_multiplier": 1.2,
  --   "print_cost_per_color": 5000,
  --   "setup_cost": 10000,
  --   "min_order_qty": 1000
  -- }

  -- Inventory management
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_level INTEGER DEFAULT 10 CHECK (reorder_level >= 0),
  min_order_quantity INTEGER NOT NULL DEFAULT 100 CHECK (min_order_quantity > 0),

  -- Lead times (in business days)
  lead_time_days INTEGER NOT NULL DEFAULT 14 CHECK (lead_time_days > 0),

  -- Display and visibility
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  -- Media
  image_url TEXT,

  -- SEO and marketing
  meta_keywords TEXT[],
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optimistic locking for concurrent updates
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraints
  CONSTRAINT name_ja_not_empty CHECK (length(trim(name_ja)) > 0),
  CONSTRAINT name_en_not_empty CHECK (length(trim(name_en)) > 0),
  CONSTRAINT product_code_format CHECK (
    product_code ~ '^PRD-\d{8}-\d{4}$'  -- PRD-YYYYMMDD-NNNN
  ),
  CONSTRAINT specifications_not_empty CHECK (
    jsonb_array_length(specifications) > 0 OR specifications != '{}'::jsonb
  )
);

-- =====================================================
-- 2. Create Indexes for Performance
-- =====================================================

-- Primary lookup indexes
CREATE INDEX idx_products_product_code ON products(product_code);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_material_type ON products(material_type);

-- Filtering and sorting indexes
CREATE INDEX idx_products_is_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_sort_order ON products(sort_order);

-- Composite index for catalog queries
CREATE INDEX idx_products_catalog ON products(category, is_active, sort_order)
  WHERE is_active = TRUE;

-- Inventory management indexes
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX idx_products_reorder_check ON products(stock_quantity, reorder_level)
  WHERE is_active = TRUE;

-- Search indexes
CREATE INDEX idx_products_name_ja_trgm ON products USING gin(name_ja gin_trgm_ops);
CREATE INDEX idx_products_name_en_trgm ON products USING gin(name_en gin_trgm_ops);

-- Optimistic locking index
CREATE INDEX idx_products_version ON products(version);

-- =====================================================
-- 3. Create Triggers
-- =====================================================

-- Update updated_at timestamp
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate product code
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'PRD';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_part TEXT;
  max_seq INTEGER;
  new_code TEXT;
BEGIN
  -- Get the highest sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(product_code FROM 15 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM products
  WHERE product_code LIKE 'PRD-' || date_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  new_code := prefix || '-' || date_part || '-' || seq_part;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_generate_code
  BEFORE INSERT ON products
  FOR EACH ROW
  WHEN (NEW.product_code IS NULL OR NEW.product_code = '')
  EXECUTE FUNCTION generate_product_code();

-- =====================================================
-- 4. Row Level Security (RLS)
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view active products (catalog)
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Authenticated users can view all active products
CREATE POLICY "Authenticated can view active products"
  ON products FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Admins can view all products (including inactive)
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can update products
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- 5. Helper Functions
-- =====================================================

-- Function to check if product is available for order quantity
CREATE OR REPLACE FUNCTION check_product_availability(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS TABLE (
  available BOOLEAN,
  current_stock INTEGER,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_product products;
BEGIN
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Product not found'::TEXT;
    RETURN;
  END IF;

  IF NOT v_product.is_active THEN
    RETURN QUERY SELECT FALSE, v_product.stock_quantity, 'Product is not active'::TEXT;
    RETURN;
  END IF;

  IF p_quantity < v_product.min_order_quantity THEN
    RETURN QUERY SELECT FALSE, v_product.stock_quantity,
      'Quantity below minimum order quantity (' || v_product.min_order_quantity || ')'::TEXT;
    RETURN;
  END IF;

  IF v_product.stock_quantity < p_quantity THEN
    RETURN QUERY SELECT FALSE, v_product.stock_quantity,
      'Insufficient stock (available: ' || v_product.stock_quantity || ', requested: ' || p_quantity || ')'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_product.stock_quantity, 'Product available'::TEXT;
END;
$$;

-- Function to get products by category
CREATE OR REPLACE FUNCTION get_products_by_category(
  p_category TEXT,
  p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS SETOF products
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE category = p_category
    AND (p_include_inactive = TRUE OR is_active = TRUE)
  ORDER BY sort_order ASC, name_ja ASC;
END;
$$;

-- Function to search products
CREATE OR REPLACE FUNCTION search_products(
  p_search_term TEXT,
  p_category TEXT DEFAULT NULL
)
RETURNS SETOF products
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE is_active = TRUE
    AND (p_category IS NULL OR category = p_category)
    AND (
      name_ja ILIKE '%' || p_search_term || '%' OR
      name_en ILIKE '%' || p_search_term || '%' OR
      description_ja ILIKE '%' || p_search_term || '%' OR
      description_en ILIKE '%' || p_search_term || '%'
    )
  ORDER BY sort_order ASC;
END;
$$;

-- =====================================================
-- 6. Grant Permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON products TO authenticated, anon;
GRANT ALL ON products TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION check_product_availability TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION search_products TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Products table';
  RAISE NOTICE 'Table created: products';
  RAISE NOTICE 'Indexes created: 10 indexes';
  RAISE NOTICE 'Policies created: 7 RLS policies';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - generate_product_code()';
  RAISE NOTICE '  - check_product_availability()';
  RAISE NOTICE '  - get_products_by_category()';
  RAISE NOTICE '  - search_products()';
END $$;

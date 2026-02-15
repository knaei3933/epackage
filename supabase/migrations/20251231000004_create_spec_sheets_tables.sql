-- =====================================================
-- Migration: Specification Sheets Tables (Phase 4)
-- Purpose: Create product specification management tables
-- Created: 2025-12-31
-- =====================================================
-- This migration creates:
-- 1. spec_sheets table - Product specification sheets
-- 2. spec_sections table - Spec sheet sections/sections
-- 3. Version control for specifications
-- 4. RLS policies for spec management
-- 5. Helper functions for spec operations

-- =====================================================
-- 1. Create Spec Sheets Table
-- =====================================================

CREATE TABLE IF NOT EXISTS spec_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,

  -- Identification
  spec_number TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL DEFAULT '1.0',

  -- Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,                            -- e.g., "material", "dimension", "print"

  -- Specification data (JSONB for flexibility)
  specifications JSONB NOT NULL DEFAULT '{}',
  -- Example structure:
  -- {
  --   "material_composition": ["PET12", "AL9", "CPP70"],
  --   "total_thickness": "91 microns",
  --   "dimensions": {
  --     "width": 200,
  --     "height": 300,
  --     "gusset": 80,
  --     "tolerance": "±2mm"
  --   },
  --   "print_specifications": {
  --     "type": "gravure",
  --     "max_colors": 9,
  --     "resolution": "150 lpi"
  --   },
  --   "barrier_properties": {
  --     "oxygen_transmission_rate": "≤1 cc/m²/day",
  --     "water_vapor_transmission": "≤0.5 g/m²/day"
  --   },
  --   "seal_properties": {
  --     "seal_strength": "≥10 N/15mm",
  --     "seal_temperature": "140-160°C"
  --   }
  -- }

  -- PDF document
  pdf_url TEXT,

  -- Status and lifecycle
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',           -- Work in progress
      'pending_review',  -- Awaiting approval
      'active',          -- Approved and active
      'deprecated',      -- Replaced by newer version
      'archived'         -- No longer used
    )
  ),

  -- Lifecycle dates
  effective_at TIMESTAMPTZ,                  -- When spec becomes active
  expires_at TIMESTAMPTZ,                    -- Optional expiration

  -- Approval workflow
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,

  -- Parent spec (for versioning)
  parent_spec_id UUID REFERENCES spec_sheets(id) ON DELETE SET NULL,
  is_latest_version BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT spec_number_format CHECK (
    spec_number ~ '^SPEC-\d{8}-\d{4}$'  -- SPEC-YYYYMMDD-NNNN
  ),
  CONSTRAINT version_format CHECK (
    version ~ '^\d+\.\d+$'  -- e.g., "1.0", "2.1"
  ),
  CONSTRAINT effective_before_expiry CHECK (
    expires_at IS NULL OR
    effective_at IS NULL OR
    expires_at >= effective_at
  )
);

-- =====================================================
-- 2. Create Spec Sections Table
-- =====================================================

CREATE TABLE IF NOT EXISTS spec_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  spec_sheet_id UUID NOT NULL REFERENCES spec_sheets(id) ON DELETE CASCADE,

  -- Section identification
  section_number TEXT NOT NULL,              -- e.g., "1.0", "2.1", "3.2.1"
  section_title TEXT NOT NULL,
  section_type TEXT CHECK (
    section_type IN (
      'general',         -- General information
      'materials',       -- Material specifications
      'dimensions',      -- Dimension requirements
      'printing',        -- Printing specifications
      'barrier',         -- Barrier properties
      'mechanical',      -- Mechanical properties
      'visual',          -- Visual/appearance requirements
      'packaging',       -- Packaging specifications
      'testing',         -- Testing requirements
      'other'            -- Other sections
    )
  ),

  -- Content
  section_content TEXT NOT NULL,            -- Detailed content
  section_data JSONB DEFAULT '{}',          -- Structured data
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Optional subsection support
  parent_section_id UUID REFERENCES spec_sections(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,                  -- 1 = top level, 2 = subsection, etc.

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  CONSTRAINT spec_section_unique UNIQUE (spec_sheet_id, section_number)
);

-- =====================================================
-- 3. Create Indexes
-- =====================================================

-- Spec sheets indexes
CREATE INDEX idx_spec_sheets_product_id ON spec_sheets(product_id);
CREATE INDEX idx_spec_sheets_work_order_id ON spec_sheets(work_order_id);
CREATE INDEX idx_spec_sheets_status ON spec_sheets(status);
CREATE INDEX idx_spec_sheets_version ON spec_sheets(version);
CREATE INDEX idx_spec_sheets_parent_spec_id ON spec_sheets(parent_spec_id);
CREATE INDEX idx_spec_sheets_effective_at ON spec_sheets(effective_at);
CREATE INDEX idx_spec_sheets_is_latest ON spec_sheets(is_latest_version)
  WHERE is_latest_version = TRUE;

-- Spec sections indexes
CREATE INDEX idx_spec_sections_spec_sheet_id ON spec_sections(spec_sheet_id);
CREATE INDEX idx_spec_sections_section_number ON spec_sections(section_number);
CREATE INDEX idx_spec_sections_parent_section_id ON spec_sections(parent_section_id);
CREATE INDEX idx_spec_sections_display_order ON spec_sections(spec_sheet_id, display_order);
CREATE INDEX idx_spec_sections_section_type ON spec_sections(section_type);

-- =====================================================
-- 4. Create Triggers
-- =====================================================

-- Update updated_at triggers
CREATE TRIGGER spec_sheets_updated_at
  BEFORE UPDATE ON spec_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER spec_sections_updated_at
  BEFORE UPDATE ON spec_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate spec number
CREATE OR REPLACE FUNCTION generate_spec_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'SPEC';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_part TEXT;
  max_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(spec_number FROM 14 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM spec_sheets
  WHERE spec_number LIKE 'SPEC-' || date_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  RETURN prefix || '-' || date_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spec_sheet_generate_number
  BEFORE INSERT ON spec_sheets
  FOR EACH ROW
  WHEN (NEW.spec_number IS NULL OR NEW.spec_number = '')
  EXECUTE FUNCTION generate_spec_number();

-- Create new version trigger
CREATE OR REPLACE FUNCTION create_new_spec_version()
RETURNS TRIGGER AS $$
BEGIN
  -- When a spec is updated and is active, create a new version
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.parent_spec_id IS NULL THEN
    -- Mark previous versions as not latest
    UPDATE spec_sheets
    SET is_latest_version = FALSE
    WHERE product_id = NEW.product_id
      AND id != NEW.id
      AND is_latest_version = TRUE;

    -- Set new spec as latest
    NEW.is_latest_version = TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spec_sheet_version_trigger
  BEFORE UPDATE ON spec_sheets
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND OLD.status != 'active')
  EXECUTE FUNCTION create_new_spec_version();

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

ALTER TABLE spec_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_sections ENABLE ROW LEVEL SECURITY;

-- Public can view active specs (limited info)
CREATE POLICY "Public can view active spec sheets"
  ON spec_sheets FOR SELECT
  USING (status = 'active');

-- Authenticated users can view active specs
CREATE POLICY "Authenticated can view active spec sheets"
  ON spec_sheets FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'active');

-- Production staff can view all specs
CREATE POLICY "Production staff can view all spec sheets"
  ON spec_sheets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins can manage specs
CREATE POLICY "Admins can manage spec sheets"
  ON spec_sheets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Spec sections follow same policies as spec sheets
CREATE POLICY "Anyone can view spec sections for active specs"
  ON spec_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spec_sheets
      WHERE spec_sheets.id = spec_sections.spec_sheet_id
        AND spec_sheets.status = 'active'
    )
  );

CREATE POLICY "Production staff can view all spec sections"
  ON spec_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spec_sheets
      WHERE spec_sheets.id = spec_sections.spec_sheet_id
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
        )
    )
  );

CREATE POLICY "Admins can manage spec sections"
  ON spec_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function: Get active spec for product
CREATE OR REPLACE FUNCTION get_active_product_spec(p_product_id UUID)
RETURNS spec_sheets
LANGUAGE plpgsql
AS $$
DECLARE
  v_spec spec_sheets;
BEGIN
  SELECT * INTO v_spec
  FROM spec_sheets
  WHERE product_id = p_product_id
    AND status = 'active'
    AND is_latest_version = TRUE
    AND (effective_at IS NULL OR effective_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY effective_at DESC NULLS LAST
  LIMIT 1;

  RETURN v_spec;
END;
$$;

-- Function: Get spec with sections
CREATE OR REPLACE FUNCTION get_spec_with_sections(p_spec_id UUID)
RETURNS TABLE (
  spec_id UUID,
  spec_number TEXT,
  version TEXT,
  title TEXT,
  status TEXT,
  section_id UUID,
  section_number TEXT,
  section_title TEXT,
  section_content TEXT,
  display_order INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id AS spec_id,
    ss.spec_number,
    ss.version,
    ss.title,
    ss.status,
    scts.id AS section_id,
    scts.section_number,
    scts.section_title,
    scts.section_content,
    scts.display_order
  FROM spec_sheets ss
  LEFT JOIN spec_sections scts ON ss.id = scts.spec_sheet_id
  WHERE ss.id = p_spec_id
  ORDER BY scts.display_order ASC, scts.section_number ASC;
END;
$$;

-- Function: Create new spec version
CREATE OR REPLACE FUNCTION create_spec_version(
  p_old_spec_id UUID,
  p_changes TEXT,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_spec_id UUID;
  v_old_spec spec_sheets;
  v_new_version TEXT;
BEGIN
  -- Get old spec
  SELECT * INTO v_old_spec
  FROM spec_sheets
  WHERE id = p_old_spec_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spec sheet % not found', p_old_spec_id;
  END IF;

  -- Calculate new version number
  v_new_version := (
    SELECT (SPLIT_PART(version, '.', 1)::INTEGER + 1) || '.0'
    FROM spec_sheets
    WHERE parent_spec_id = v_old_spec.parent_spec_id
      OR id = v_old_spec.parent_spec_id
    ORDER BY SPLIT_PART(version, '.', 1)::INTEGER DESC
    LIMIT 1
  );

  IF v_new_version IS NULL THEN
    v_new_version := '2.0';
  END IF;

  -- Create new version
  INSERT INTO spec_sheets (
    product_id,
    work_order_id,
    version,
    title,
    description,
    specifications,
    status,
    parent_spec_id,
    is_latest_version,
    created_by
  ) VALUES (
    v_old_spec.product_id,
    v_old_spec.work_order_id,
    v_new_version,
    v_old_spec.title,
    'New version: ' || p_changes,
    v_old_spec.specifications,
    'draft',
    v_old_spec.parent_spec_id,
    FALSE,  -- Will be set to TRUE when approved
    p_created_by
  )
  RETURNING id INTO v_new_spec_id;

  -- Copy sections
  INSERT INTO spec_sections (
    spec_sheet_id,
    section_number,
    section_title,
    section_type,
    section_content,
    section_data,
    display_order,
    parent_section_id,
    level
  )
  SELECT
    v_new_spec_id,
    section_number,
    section_title,
    section_type,
    section_content,
    section_data,
    display_order,
    parent_section_id,
    level
  FROM spec_sections
  WHERE spec_sheet_id = p_old_spec_id;

  RETURN v_new_spec_id;
END;
$$;

-- =====================================================
-- 7. Grant Permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON spec_sheets TO authenticated, anon;
GRANT SELECT ON spec_sections TO authenticated, anon;
GRANT ALL ON spec_sheets TO authenticated;
GRANT ALL ON spec_sections TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_active_product_spec TO authenticated;
GRANT EXECUTE ON FUNCTION get_spec_with_sections TO authenticated;
GRANT EXECUTE ON FUNCTION create_spec_version TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Specification Sheets tables';
  RAISE NOTICE 'Tables created: spec_sheets, spec_sections';
  RAISE NOTICE 'Indexes created: 13 indexes';
  RAISE NOTICE 'Policies created: 9 RLS policies';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - generate_spec_number()';
  RAISE NOTICE '  - create_new_spec_version() (trigger function)';
  RAISE NOTICE '  - get_active_product_spec()';
  RAISE NOTICE '  - get_spec_with_sections()';
  RAISE NOTICE '  - create_spec_version()';
END $$;

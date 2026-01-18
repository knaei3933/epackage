-- ============================================
-- SKU Cost Tracking Migration (Fixed v3)
-- ============================================
-- Description: Add SKU-based cost calculation support
--              - Track cost breakdown per SKU
--              - Fixed loss meters (400m)
--              - Minimum secured quantities (1 SKU: 500m, 2+ SKUs: 300m)
-- Created: 2026-01-13
-- ============================================

-- ============================================
-- 1. Add SKU cost tracking columns to quotations table
-- ============================================

ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS sku_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_meters NUMERIC,
ADD COLUMN IF NOT EXISTS loss_meters NUMERIC,
ADD COLUMN IF NOT EXISTS total_cost_breakdown JSONB DEFAULT '{
  "materialCost": 0,
  "printingCost": 0,
  "laminationCost": 0,
  "slitterCost": 0,
  "pouchProcessingCost": 0,
  "duty": 0,
  "delivery": 0,
  "totalCost": 0
}'::jsonb;

-- Update loss_meters to default 400 for NULL values
UPDATE quotations SET loss_meters = 400 WHERE loss_meters IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN quotations.sku_count IS 'Number of SKUs (designs) in quotation';
COMMENT ON COLUMN quotations.total_meters IS 'Total film meters including loss';
COMMENT ON COLUMN quotations.loss_meters IS 'Fixed loss meters (default 400m)';
COMMENT ON COLUMN quotations.total_cost_breakdown IS 'Complete cost breakdown for all SKUs';

-- ============================================
-- 2. Add cost breakdown column to quotation_items table
-- ============================================

ALTER TABLE quotation_items
ADD COLUMN IF NOT EXISTS sku_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS theoretical_meters NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS secured_meters NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS loss_meters NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS total_meters NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS cost_breakdown JSONB DEFAULT '{
  "materialCost": 0,
  "printingCost": 0,
  "laminationCost": 0,
  "slitterCost": 0,
  "pouchProcessingCost": 0,
  "duty": 0,
  "delivery": 0,
  "totalCost": 0
}'::jsonb;

-- Add comments
COMMENT ON COLUMN quotation_items.sku_index IS 'SKU index (0-based) for multi-SKU quotes';
COMMENT ON COLUMN quotation_items.theoretical_meters IS 'Theoretical meters required for this SKU';
COMMENT ON COLUMN quotation_items.secured_meters IS 'Secured meters (min 500m for 1 SKU, 300m for 2+ SKUs)';
COMMENT ON COLUMN quotation_items.loss_meters IS 'Loss meters allocated to this SKU';
COMMENT ON COLUMN quotation_items.total_meters IS 'Total meters (secured + loss) for this SKU';
COMMENT ON COLUMN quotation_items.cost_breakdown IS 'Cost breakdown for this SKU item';

-- ============================================
-- 3. Create sku_quotes table for detailed SKU tracking
-- ============================================

CREATE TABLE IF NOT EXISTS sku_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  sku_index INTEGER NOT NULL,
  sku_code TEXT NOT NULL,
  quantity INTEGER NOT NULL,

  -- Meter calculations
  theoretical_meters NUMERIC(10,2),
  secured_meters NUMERIC(10,2),
  loss_meters NUMERIC(10,2) DEFAULT 400,
  total_meters NUMERIC(10,2),

  -- Cost breakdown (detailed)
  cost_breakdown JSONB NOT NULL DEFAULT '{
    "materialCost": 0,
    "printingCost": 0,
    "laminationCost": 0,
    "slitterCost": 0,
    "pouchProcessingCost": 0,
    "duty": 0,
    "delivery": 0,
    "totalCost": 0
  }'::jsonb,

  -- Specifications as JSONB for flexibility
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE sku_quotes IS 'Detailed SKU-level cost tracking for quotations';
COMMENT ON COLUMN sku_quotes.sku_code IS 'Unique SKU identifier (e.g., SKU-001)';
COMMENT ON COLUMN sku_quotes.specifications IS 'SKU specifications (dimensions, material, thickness, etc.)';

-- ============================================
-- 4. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sku_quotes_quote_id ON sku_quotes(quote_id);
CREATE INDEX IF NOT EXISTS idx_sku_quotes_quote_sku_index ON sku_quotes(quote_id, sku_index);
CREATE INDEX IF NOT EXISTS idx_sku_quotes_cost_breakdown ON sku_quotes USING GIN (cost_breakdown);
CREATE INDEX IF NOT EXISTS idx_quotations_cost_breakdown ON quotations USING GIN (total_cost_breakdown);
CREATE INDEX IF NOT EXISTS idx_quotation_items_cost_breakdown ON quotation_items USING GIN (cost_breakdown);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quote_sku ON quotation_items(quotation_id, sku_index);

-- ============================================
-- 5. Add check constraints for data integrity (using DO block)
-- ============================================

DO $$
BEGIN
    -- quotations table constraints
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_quotations_sku_count_positive'
    ) THEN
        ALTER TABLE quotations
        ADD CONSTRAINT chk_quotations_sku_count_positive
        CHECK (sku_count >= 1);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_quotations_loss_meters_positive'
    ) THEN
        ALTER TABLE quotations
        ADD CONSTRAINT chk_quotations_loss_meters_positive
        CHECK (loss_meters IS NULL OR loss_meters > 0);
    END IF;

    -- quotation_items table constraints
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_quotation_items_sku_index_valid'
    ) THEN
        ALTER TABLE quotation_items
        ADD CONSTRAINT chk_quotation_items_sku_index_valid
        CHECK (sku_index >= 0);
    END IF;

    -- sku_quotes table constraints
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_sku_quotes_quantity_positive'
    ) THEN
        ALTER TABLE sku_quotes
        ADD CONSTRAINT chk_sku_quotes_quantity_positive
        CHECK (quantity > 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_sku_quotes_sku_index_valid'
    ) THEN
        ALTER TABLE sku_quotes
        ADD CONSTRAINT chk_sku_quotes_sku_index_valid
        CHECK (sku_index >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_sku_quotes_loss_meters'
    ) THEN
        ALTER TABLE sku_quotes
        ADD CONSTRAINT chk_sku_quotes_loss_meters
        CHECK (loss_meters > 0);
    END IF;
END $$;

-- ============================================
-- 6. Create trigger for updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sku_quotes_updated_at ON sku_quotes;
CREATE TRIGGER update_sku_quotes_updated_at
BEFORE UPDATE ON sku_quotes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE sku_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to sku_quotes" ON sku_quotes;
DROP POLICY IF EXISTS "Users can read sku_quotes for own quotations" ON sku_quotes;
DROP POLICY IF EXISTS "Admins can read all sku_quotes" ON sku_quotes;

CREATE POLICY "Service role has full access to sku_quotes"
ON sku_quotes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can read sku_quotes for own quotations"
ON sku_quotes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotations
    WHERE quotations.id = sku_quotes.quote_id
    AND quotations.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can read all sku_quotes"
ON sku_quotes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- ============================================
-- 8. Create helper function for SKU cost aggregation
-- ============================================

CREATE OR REPLACE FUNCTION get_quotation_sku_costs(p_quote_id UUID)
RETURNS TABLE (
  sku_index INTEGER,
  quantity INTEGER,
  theoretical_meters NUMERIC,
  secured_meters NUMERIC,
  loss_meters NUMERIC,
  total_meters NUMERIC,
  cost_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sq.sku_index,
    sq.quantity,
    sq.theoretical_meters,
    sq.secured_meters,
    sq.loss_meters,
    sq.total_meters,
    sq.cost_breakdown
  FROM sku_quotes sq
  WHERE sq.quote_id = p_quote_id
  ORDER BY sq.sku_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_quotation_sku_costs IS 'Aggregate SKU costs for a quotation';

-- ============================================
-- 9. Create view for quotation summary with SKU costs
-- ============================================

CREATE OR REPLACE VIEW quotation_sku_summary AS
SELECT
  q.id AS quotation_id,
  q.quotation_number,
  q.sku_count,
  q.total_meters,
  q.loss_meters,
  q.total_cost_breakdown,
  q.total_amount,
  COUNT(sq.id) AS actual_sku_count,
  SUM(sq.total_meters) AS calculated_total_meters,
  jsonb_agg(
    jsonb_build_object(
      'skuIndex', sq.sku_index,
      'skuCode', sq.sku_code,
      'quantity', sq.quantity,
      'theoreticalMeters', sq.theoretical_meters,
      'securedMeters', sq.secured_meters,
      'lossMeters', sq.loss_meters,
      'totalMeters', sq.total_meters,
      'costBreakdown', sq.cost_breakdown
    ) ORDER BY sq.sku_index
  ) AS sku_details
FROM quotations q
LEFT JOIN sku_quotes sq ON q.id = sq.quote_id
GROUP BY q.id, q.quotation_number, q.sku_count, q.total_meters, q.loss_meters,
         q.total_cost_breakdown, q.total_amount;

COMMENT ON VIEW quotation_sku_summary IS 'Summary view of quotations with SKU cost details';

-- ============================================
-- Migration complete
-- ============================================

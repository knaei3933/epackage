-- =====================================================
-- Migration: Add film_cost_details to quotation_items
-- Created: 2025-03-27
-- Purpose: Add film_cost_details JSONB column for storing
--          detailed material layer cost calculations
-- =====================================================

-- Add film_cost_details column to quotation_items
ALTER TABLE quotation_items
ADD COLUMN IF NOT EXISTS film_cost_details JSONB DEFAULT '{
  "materialCost": 0,
  "laminationCost": 0,
  "slitterCost": 0,
  "surfaceTreatmentCost": 0,
  "materialLayerDetails": [],
  "totalCostKRW": 0,
  "costJPY": 0,
  "totalWeight": 0,
  "totalMeters": 0,
  "materialWidthMM": 0,
  "areaM2": 0
}'::jsonb;

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_quotation_items_film_cost_details
ON quotation_items USING GIN (film_cost_details);

-- Add comment for documentation
COMMENT ON COLUMN quotation_items.film_cost_details IS 'Detailed film cost breakdown including material layer calculations (meters, weight, cost per layer)';

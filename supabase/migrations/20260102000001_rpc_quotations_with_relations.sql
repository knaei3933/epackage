-- ============================================================
-- RPC Function: get_quotations_with_relations (CORRECTED)
-- Purpose: Fix N+1 query problem by fetching related data in single query
-- Created: 2026-01-02
-- Schema: quotations joins profiles, quotation_items aggregated as JSONB
-- ============================================================

CREATE OR REPLACE FUNCTION get_quotations_with_relations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  quotation_number TEXT,
  status TEXT,
  total_amount NUMERIC,
  valid_until TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  company_name TEXT,
  quotation_items JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.user_id,
    q.quotation_number,
    q.status::text,
    q.total_amount,
    q.valid_until,
    q.notes,
    q.created_at,
    q.updated_at,
    q.sent_at,
    q.approved_at,
    p.company_name,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', qi.id,
          'quotation_id', qi.quotation_id,
          'product_id', qi.product_id,
          'product_name', qi.product_name,
          'quantity', qi.quantity,
          'unit_price', qi.unit_price,
          'total_price', qi.total_price,
          'specifications', qi.specifications
        )
      )
      FROM quotation_items qi
      WHERE qi.quotation_id = q.id
    ) AS quotation_items
  FROM quotations q
  LEFT JOIN profiles p ON q.user_id = p.id
  WHERE q.user_id = p_user_id
    AND (p_status IS NULL OR q.status::text = p_status)
  ORDER BY q.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================================
-- Usage Example:
-- SELECT * FROM get_quotations_with_relations(
--   'user-uuid'::UUID,
--   20,
--   0,
--   'draft'
-- );

-- ============================================================
-- Rollback Command (if needed):
-- DROP FUNCTION IF EXISTS get_quotations_with_relations;

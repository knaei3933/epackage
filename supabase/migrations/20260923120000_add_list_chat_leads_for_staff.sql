-- =====================================================
-- Staff lead list RPC
-- Returns safe columns only (no contact PII).
-- Requires active ADMIN/OPERATOR/SALES actor.
-- =====================================================

CREATE OR REPLACE FUNCTION public.list_chat_leads_for_staff(
  p_actor_user_id UUID,
  p_status public.chat_lead_status DEFAULT NULL,
  p_intent public.chat_lead_intent DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 20,
  p_request_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_count BIGINT,
  leads JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_actor_role TEXT;
  v_actor_status TEXT;
  v_offset INTEGER;
  v_safe_limit INTEGER;
  v_safe_page INTEGER;
  v_total BIGINT;
  v_rows JSONB;
BEGIN
  -- Verify active staff role
  SELECT role, status INTO v_actor_role, v_actor_status
  FROM public.profiles
  WHERE id = p_actor_user_id;

  IF v_actor_status IS NULL OR v_actor_status != 'ACTIVE' OR
     v_actor_role NOT IN ('ADMIN', 'OPERATOR', 'SALES') THEN
    RAISE EXCEPTION 'Unauthorized: staff role required'
      USING ERRCODE = 'P0002';
  END IF;

  -- Validate pagination
  v_safe_page := GREATEST(1, LEAST(1000, COALESCE(p_page, 1)));
  v_safe_limit := GREATEST(1, LEAST(100, COALESCE(p_limit, 20)));
  v_offset := (v_safe_page - 1) * v_safe_limit;

  -- Count total with filters
  SELECT COUNT(*) INTO v_total
  FROM public.chat_leads
  WHERE (p_status IS NULL OR status = p_status)
    AND (p_intent IS NULL OR intent = p_intent);

  -- Return safe columns only — NO contact PII
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT
      l.id,
      l.chat_session_id,
      l.member_user_id,
      l.member_linkage_state,
      l.intent,
      l.route_family,
      l.status,
      l.outcome,
      l.handoff_state,
      l.created_at,
      l.updated_at,
      l.closed_at,
      c.contact_channel,
      c.disposition AS contact_disposition
    FROM public.chat_leads l
    LEFT JOIN public.chat_lead_contacts c ON c.lead_id = l.id
    WHERE (p_status IS NULL OR l.status = p_status)
      AND (p_intent IS NULL OR l.intent = p_intent)
    ORDER BY l.created_at DESC
    LIMIT v_safe_limit OFFSET v_offset
  ) t;

  RETURN QUERY SELECT v_total, v_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.list_chat_leads_for_staff(
  UUID, public.chat_lead_status, public.chat_lead_intent, INTEGER, INTEGER, UUID
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_chat_leads_for_staff(
  UUID, public.chat_lead_status, public.chat_lead_intent, INTEGER, INTEGER, UUID
) TO service_role;

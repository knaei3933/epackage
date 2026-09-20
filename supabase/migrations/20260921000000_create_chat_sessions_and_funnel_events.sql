-- =====================================================
-- Non-PII chat analytics storage
-- Deliberately excludes leads/contact tables until privacy,
-- consent, audit, retention, and Architect gates pass.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience TEXT NOT NULL CHECK (audience IN ('public', 'member', 'staff', 'designer')),
  initial_route_family TEXT NOT NULL CHECK (length(initial_route_family) > 0 AND length(initial_route_family) <= 80),
  last_route_family TEXT CHECK (length(last_route_family) > 0 AND length(last_route_family) <= 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.chat_funnel_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'suggestions_shown',
    'suggestion_selected',
    'answer_completed',
    'lead_form_shown',
    'contact_submitted',
    'contact_skipped',
    'linkage_accepted',
    'linkage_declined',
    'handoff_requested',
    'chat_closed'
  )),
  route_family TEXT NOT NULL CHECK (length(route_family) > 0 AND length(route_family) <= 80),
  suggestion_id VARCHAR(128) CHECK (suggestion_id IS NULL OR (suggestion_id ~ '^[a-z0-9.-]+$' AND length(suggestion_id) <= 128)),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_funnel_events_session_time
  ON public.chat_funnel_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_chat_funnel_events_type_time
  ON public.chat_funnel_events(event_type, occurred_at);
CREATE INDEX IF NOT EXISTS idx_chat_funnel_events_occurred_at
  ON public.chat_funnel_events(occurred_at);

COMMENT ON TABLE public.chat_sessions IS
  'Server-issued non-PII chat session. Prohibits user IDs, raw paths, IP/User-Agent, fingerprints, and transcripts.';
COMMENT ON TABLE public.chat_funnel_events IS
  'Aggregate enum-only chat funnel events. Contains no message text, contact data, form values, or raw paths.';

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_funnel_events ENABLE ROW LEVEL SECURITY;

-- No direct anon/authenticated policies or grants are intentional.
-- The server-side service-role API is the sole write path.
REVOKE ALL ON public.chat_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.chat_funnel_events FROM PUBLIC, anon, authenticated;

-- The server-side analytics API uses the existing Supabase service role.
-- Grants are explicit so hosted migrations do not depend on default ACLs.
GRANT SELECT, INSERT, UPDATE ON public.chat_sessions TO service_role;
GRANT SELECT, INSERT ON public.chat_funnel_events TO service_role;

CREATE OR REPLACE FUNCTION public.purge_expired_chat_analytics(
  p_retention_days INTEGER DEFAULT 180,
  p_batch_limit INTEGER DEFAULT 5000
)
RETURNS TABLE(deleted_events BIGINT, deleted_sessions BIGINT, cutoff TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_deleted_events BIGINT := 0;
  v_deleted_sessions BIGINT := 0;
BEGIN
  IF p_retention_days < 1 OR p_retention_days > 365 OR p_batch_limit < 1 OR p_batch_limit > 50000 THEN
    RAISE EXCEPTION 'Invalid chat analytics retention parameters';
  END IF;

  v_cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;

  WITH stale_events AS (
    SELECT id FROM public.chat_funnel_events
    WHERE occurred_at < v_cutoff
    ORDER BY occurred_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.chat_funnel_events e
  USING stale_events
  WHERE e.id = stale_events.id;
  GET DIAGNOSTICS v_deleted_events = ROW_COUNT;

  WITH stale_sessions AS (
    SELECT s.id FROM public.chat_sessions s
    WHERE s.created_at < v_cutoff
      AND s.expires_at < NOW()
      AND NOT EXISTS (
        SELECT 1 FROM public.chat_funnel_events e
        WHERE e.session_id = s.id
      )
    ORDER BY s.created_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.chat_sessions s
  USING stale_sessions
  WHERE s.id = stale_sessions.id;
  GET DIAGNOSTICS v_deleted_sessions = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_events, v_deleted_sessions, v_cutoff;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_chat_analytics(INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_chat_analytics(INTEGER, INTEGER)
  TO service_role;

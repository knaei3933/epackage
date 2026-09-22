-- =====================================================
-- Local consent-gated chat lead schema.
-- DO NOT apply to production until privacy/retention
-- approval and rollout authorization are recorded.
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.chat_lead_intent AS ENUM
    ('quote', 'sample', 'technical', 'general', 'human');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_lead_status AS ENUM
    ('new', 'contacted', 'qualified', 'in_progress', 'closed_won', 'closed_lost', 'invalid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_lead_outcome AS ENUM
    ('pending', 'self_resolved', 'human_followup', 'converted', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_lead_handoff_state AS ENUM
    ('none', 'requested', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_contact_channel AS ENUM ('email', 'phone');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_preferred_channel AS ENUM ('email', 'phone', 'any');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_contact_window AS ENUM
    ('unspecified', 'weekday_daytime', 'weekday_evening', 'weekend');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_contact_disposition AS ENUM
    ('active', 'completed', 'redacted', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_lead_audit_action AS ENUM
    ('lead_created', 'contact_revealed', 'contact_reveal_denied', 'lead_updated',
     'contact_redacted', 'requirements_redacted', 'lead_deleted',
     'linkage_accepted', 'linkage_declined', 'linkage_removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_redaction_reason AS ENUM
    ('retention', 'user_request', 'privacy_approval');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_rate_limit_action AS ENUM
    ('guest_lead_submit', 'member_lead_submit', 'contact_reveal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_consent_locale AS ENUM ('ja');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_linkage_state AS ENUM
    ('not_applicable', 'linked', 'declined', 'unlinked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.chat_legacy_resolution AS ENUM
    ('unresolved', 'disabled', 'replaced', 'approved_exception');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.chat_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID UNIQUE REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_linkage_state public.chat_linkage_state NOT NULL DEFAULT 'not_applicable',
  member_linkage_consented_at TIMESTAMPTZ,
  member_linkage_consent_version INTEGER,
  member_linkage_updated_at TIMESTAMPTZ,
  intent public.chat_lead_intent NOT NULL,
  contents_description VARCHAR(400),
  quantity_description VARCHAR(200),
  size_spec_state VARCHAR(300),
  material_printing_needs VARCHAR(300),
  deadline_text VARCHAR(100),
  requirements_redacted_at TIMESTAMPTZ,
  route_family VARCHAR(80) NOT NULL,
  status public.chat_lead_status NOT NULL DEFAULT 'new',
  outcome public.chat_lead_outcome NOT NULL DEFAULT 'pending',
  handoff_state public.chat_lead_handoff_state NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  CONSTRAINT chat_leads_no_email_requirements CHECK (
    contents_description NOT LIKE '%@%'
    AND quantity_description NOT LIKE '%@%'
    AND size_spec_state NOT LIKE '%@%'
    AND material_printing_needs NOT LIKE '%@%'
    AND deadline_text NOT LIKE '%@%'
  ),
  CONSTRAINT chat_leads_no_digit_run_requirements CHECK (
    contents_description !~ '[0-9]{9,}'
    AND quantity_description !~ '[0-9]{9,}'
    AND size_spec_state !~ '[0-9]{9,}'
    AND material_printing_needs !~ '[0-9]{9,}'
    AND deadline_text !~ '[0-9]{9,}'
  ),
  CONSTRAINT chat_leads_requirements_redacted CHECK (
    requirements_redacted_at IS NULL OR (
      contents_description IS NULL AND quantity_description IS NULL
      AND size_spec_state IS NULL AND material_printing_needs IS NULL
      AND deadline_text IS NULL
    )
  ),
  CONSTRAINT chat_leads_linkage_linked CHECK (
    (member_linkage_state <> 'linked'
      OR (member_user_id IS NOT NULL
      AND member_linkage_consented_at IS NOT NULL
      AND member_linkage_consent_version IS NOT NULL))
  ),
  CONSTRAINT chat_leads_linkage_declined CHECK (
    member_linkage_state <> 'declined' OR (
      member_user_id IS NULL AND member_linkage_consented_at IS NOT NULL
      AND member_linkage_consent_version IS NOT NULL
      AND member_linkage_updated_at IS NOT NULL
    )
  ),
  CONSTRAINT chat_leads_linkage_unlinked CHECK (
    member_linkage_state <> 'unlinked' OR (
      member_user_id IS NULL AND member_linkage_consented_at IS NOT NULL
      AND member_linkage_consent_version IS NOT NULL
      AND member_linkage_updated_at IS NOT NULL
    )
  ),
  CONSTRAINT chat_leads_linkage_not_applicable CHECK (
    member_linkage_state <> 'not_applicable' OR (
      member_user_id IS NULL AND member_linkage_consented_at IS NULL
      AND member_linkage_consent_version IS NULL
      AND member_linkage_updated_at IS NULL
    )
  ),
  CONSTRAINT chat_leads_closed_terminal CHECK (
    closed_at IS NULL
    OR status IN ('closed_won', 'closed_lost', 'invalid')
  )
);

CREATE INDEX IF NOT EXISTS idx_chat_leads_member_updated
  ON public.chat_leads(member_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_leads_status_updated
  ON public.chat_leads(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_leads_created_at
  ON public.chat_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_leads_outcome_updated
  ON public.chat_leads(outcome, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_lead_contacts (
  lead_id UUID PRIMARY KEY REFERENCES public.chat_leads(id) ON DELETE CASCADE,
  contact_channel public.chat_contact_channel NOT NULL,
  email VARCHAR(254),
  phone VARCHAR(32),
  company_name VARCHAR(200),
  contact_name VARCHAR(100),
  preferred_channel public.chat_preferred_channel NOT NULL,
  contact_window public.chat_contact_window NOT NULL,
  contact_consent BOOLEAN NOT NULL,
  privacy_consent BOOLEAN NOT NULL,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  contact_consented_at TIMESTAMPTZ NOT NULL,
  privacy_consented_at TIMESTAMPTZ NOT NULL,
  marketing_consented_at TIMESTAMPTZ,
  consent_version INTEGER NOT NULL CHECK (consent_version > 0),
  privacy_policy_version INTEGER NOT NULL CHECK (privacy_policy_version > 0),
  consent_locale public.chat_consent_locale NOT NULL DEFAULT 'ja',
  retention_due_at TIMESTAMPTZ NOT NULL,
  disposition public.chat_contact_disposition NOT NULL DEFAULT 'active',
  contact_data_redacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chat_lead_contacts_required_consent CHECK (
    contact_consent AND privacy_consent
  ),
  CONSTRAINT chat_lead_contacts_marketing_iff_timestamp CHECK (
    marketing_consent = (marketing_consented_at IS NOT NULL)
  ),
  CONSTRAINT chat_lead_contacts_retention_future CHECK (
    retention_due_at > created_at
  ),
  CONSTRAINT chat_lead_contacts_pre_redaction_channel CHECK (
    contact_data_redacted_at IS NOT NULL OR (
      (contact_channel = 'email' AND email IS NOT NULL AND phone IS NULL) OR
      (contact_channel = 'phone' AND phone IS NOT NULL AND email IS NULL)
    )
  ),
  CONSTRAINT chat_lead_contacts_redacted_values CHECK (
    contact_data_redacted_at IS NULL OR (
      email IS NULL AND phone IS NULL
      AND company_name IS NULL AND contact_name IS NULL
    )
  ),
  CONSTRAINT chat_lead_contacts_redaction_disposition CHECK (
    (disposition = 'redacted')
    = (contact_data_redacted_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.chat_lead_audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id UUID NOT NULL,
  actor_user_id UUID,
  action public.chat_lead_audit_action NOT NULL,
  request_id UUID NOT NULL,
  from_status public.chat_lead_status,
  to_status public.chat_lead_status,
  from_outcome public.chat_lead_outcome,
  to_outcome public.chat_lead_outcome,
  from_disposition public.chat_contact_disposition,
  to_disposition public.chat_contact_disposition,
  from_handoff_state public.chat_lead_handoff_state,
  to_handoff_state public.chat_lead_handoff_state,
  from_linkage_state public.chat_linkage_state,
  to_linkage_state public.chat_linkage_state,
  redaction_reason public.chat_redaction_reason,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_lead_audit_lead_time
  ON public.chat_lead_audit_events(lead_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_lead_audit_actor_time
  ON public.chat_lead_audit_events(actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_lead_audit_action_time
  ON public.chat_lead_audit_events(action, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_lead_audit_created_at
  ON public.chat_lead_audit_events(created_at);

CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  identifier_hash UUID NOT NULL,
  action public.chat_rate_limit_action NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier_hash, action)
);

CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_expires_at
  ON public.chat_rate_limits(expires_at);

CREATE TABLE IF NOT EXISTS public.chat_lead_privacy_readiness (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  privacy_approval_record UUID NOT NULL,
  privacy_policy_version INTEGER NOT NULL CHECK (privacy_policy_version > 0),
  consent_version INTEGER NOT NULL CHECK (consent_version > 0),
  contact_retention_days INTEGER NOT NULL CHECK (contact_retention_days BETWEEN 1 AND 365),
  summary_consent_retention_days INTEGER NOT NULL
    CHECK (summary_consent_retention_days BETWEEN 30 AND 2555),
  audit_retention_days INTEGER NOT NULL CHECK (audit_retention_days BETWEEN 30 AND 2555),
  legacy_resolution public.chat_legacy_resolution NOT NULL DEFAULT 'unresolved',
  legacy_approval_record UUID,
  legacy_replacement_version INTEGER,
  approved_at TIMESTAMPTZ NOT NULL,
  schema_version INTEGER NOT NULL CHECK (schema_version > 0),
  CONSTRAINT chat_lead_readiness_order CHECK (
    contact_retention_days <= summary_consent_retention_days
    AND summary_consent_retention_days <= audit_retention_days
  ),
  CONSTRAINT chat_lead_legacy_exception_record CHECK (
    legacy_resolution <> 'approved_exception' OR legacy_approval_record IS NOT NULL
  ),
  CONSTRAINT chat_lead_legacy_replaced_version CHECK (
    legacy_resolution <> 'replaced' OR legacy_replacement_version IS NOT NULL
  )
);

ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_lead_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_lead_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_lead_privacy_readiness ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own linked lead status" ON public.chat_leads;
CREATE POLICY "Members can view own linked lead status"
  ON public.chat_leads FOR SELECT
  TO authenticated
  USING (
    member_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status = 'ACTIVE'
    )
  );

REVOKE ALL ON public.chat_leads FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.chat_lead_contacts FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.chat_lead_audit_events FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.chat_rate_limits FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.chat_lead_privacy_readiness FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT (id, member_user_id, status, outcome, updated_at)
  ON public.chat_leads TO authenticated;

-- =====================================================
-- Service-role-only transactional RPCs
-- =====================================================

CREATE OR REPLACE FUNCTION public.submit_chat_lead(
  p_chat_session_id UUID,
  p_member_user_id UUID,
  p_linkage_consent BOOLEAN,
  p_intent public.chat_lead_intent,
  p_contents_description VARCHAR(400),
  p_quantity_description VARCHAR(200),
  p_size_spec_state VARCHAR(300),
  p_material_printing_needs VARCHAR(300),
  p_deadline_text VARCHAR(100),
  p_route_family VARCHAR(80),
  p_contact_channel public.chat_contact_channel,
  p_email VARCHAR(254),
  p_phone VARCHAR(32),
  p_company_name VARCHAR(200),
  p_contact_name VARCHAR(100),
  p_preferred_channel public.chat_preferred_channel,
  p_contact_window public.chat_contact_window,
  p_contact_consent BOOLEAN,
  p_privacy_consent BOOLEAN,
  p_marketing_consent BOOLEAN,
  p_consent_version INTEGER,
  p_privacy_policy_version INTEGER,
  p_contact_retention_days INTEGER,
  p_request_id UUID
)
RETURNS TABLE(lead_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_lead_id UUID;
  v_session chat_sessions;
  v_linkage_state public.chat_linkage_state;
  v_now TIMESTAMPTZ := NOW();
  v_audit_action public.chat_lead_audit_action;
BEGIN
  IF p_contact_retention_days < 1 OR p_contact_retention_days > 365 THEN
    RAISE EXCEPTION 'Invalid contact retention' USING ERRCODE = 'P0001';
  END IF;
  IF NOT p_contact_consent OR NOT p_privacy_consent THEN
    RAISE EXCEPTION 'Contact and privacy consent are required' USING ERRCODE = 'P0001';
  END IF;
  IF p_marketing_consent IS NULL THEN
    RAISE EXCEPTION 'Marketing consent must be explicit' USING ERRCODE = 'P0001';
  END IF;
  IF p_contents_description LIKE '%@%' OR p_quantity_description LIKE '%@%'
     OR p_size_spec_state LIKE '%@%' OR p_material_printing_needs LIKE '%@%'
     OR p_deadline_text LIKE '%@%' THEN
    RAISE EXCEPTION 'Requirement fields cannot contain contact data' USING ERRCODE = 'P0001';
  END IF;
  IF p_contents_description ~ '[0-9]{9,}' OR p_quantity_description ~ '[0-9]{9,}'
     OR p_size_spec_state ~ '[0-9]{9,}'
     OR p_material_printing_needs ~ '[0-9]{9,}'
     OR p_deadline_text ~ '[0-9]{9,}' THEN
    RAISE EXCEPTION 'Requirement fields cannot contain phone-like digit runs' USING ERRCODE = 'P0001';
  END IF;
  IF p_contents_description IS NULL AND p_quantity_description IS NULL
     AND p_size_spec_state IS NULL AND p_material_printing_needs IS NULL
     AND p_deadline_text IS NULL THEN
    RAISE EXCEPTION 'At least one structured requirement is required' USING ERRCODE = 'P0001';
  END IF;
  IF (p_contact_channel = 'email' AND (p_email IS NULL OR p_phone IS NOT NULL))
     OR (p_contact_channel = 'phone' AND (p_phone IS NULL OR p_email IS NOT NULL)) THEN
    RAISE EXCEPTION 'Exactly one contact channel value is required' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_session FROM public.chat_sessions
  WHERE id = p_chat_session_id AND expires_at > NOW() AND closed_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat session not found or expired' USING ERRCODE = 'P0003';
  END IF;

  IF p_member_user_id IS NOT NULL AND p_linkage_consent THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = p_member_user_id
        AND profiles.role = 'MEMBER'
        AND profiles.status = 'ACTIVE'
    ) THEN
      RAISE EXCEPTION 'Active member required for linkage' USING ERRCODE = 'P0002';
    END IF;
    v_linkage_state := 'linked';
  ELSIF p_member_user_id IS NOT NULL AND NOT p_linkage_consent THEN
    v_linkage_state := 'declined';
  ELSE
    v_linkage_state := 'not_applicable';
  END IF;

  INSERT INTO public.chat_leads(
    chat_session_id, member_user_id, member_linkage_state,
    member_linkage_consented_at, member_linkage_consent_version,
    member_linkage_updated_at, intent, contents_description,
    quantity_description, size_spec_state, material_printing_needs,
    deadline_text, route_family
  ) VALUES (
    p_chat_session_id,
    CASE WHEN v_linkage_state = 'linked' THEN p_member_user_id ELSE NULL END,
    v_linkage_state,
    CASE WHEN v_linkage_state IN ('linked','declined') THEN v_now ELSE NULL END,
    CASE WHEN v_linkage_state IN ('linked','declined') THEN p_consent_version ELSE NULL END,
    CASE WHEN v_linkage_state = 'declined' THEN v_now ELSE NULL END,
    p_intent, p_contents_description, p_quantity_description,
    p_size_spec_state, p_material_printing_needs, p_deadline_text,
    p_route_family
  ) RETURNING id INTO v_lead_id;

  INSERT INTO public.chat_lead_contacts(
    lead_id, contact_channel, email, phone, company_name, contact_name,
    preferred_channel, contact_window, contact_consent, privacy_consent,
    marketing_consent, contact_consented_at, privacy_consented_at,
    marketing_consented_at, consent_version, privacy_policy_version,
    retention_due_at
  ) VALUES (
    v_lead_id, p_contact_channel, lower(p_email), p_phone, p_company_name,
    p_contact_name, p_preferred_channel, p_contact_window, p_contact_consent,
    p_privacy_consent, p_marketing_consent, v_now, v_now,
    CASE WHEN p_marketing_consent THEN v_now ELSE NULL END,
    p_consent_version, p_privacy_policy_version,
    v_now + (p_contact_retention_days || ' days')::INTERVAL
  );

  INSERT INTO public.chat_lead_audit_events(
    lead_id, actor_user_id, action, request_id, to_linkage_state
  ) VALUES (
    v_lead_id,
    CASE WHEN v_linkage_state = 'linked' THEN p_member_user_id ELSE NULL END,
    'lead_created', p_request_id, v_linkage_state
  );

  v_audit_action := CASE
    WHEN v_linkage_state = 'linked' THEN 'linkage_accepted'::public.chat_lead_audit_action
    WHEN v_linkage_state = 'declined' THEN 'linkage_declined'::public.chat_lead_audit_action
    ELSE NULL
  END;
  IF v_audit_action IS NOT NULL THEN
    INSERT INTO public.chat_lead_audit_events(
      lead_id, actor_user_id, action, request_id, to_linkage_state
    ) VALUES (
      v_lead_id,
      CASE WHEN v_linkage_state = 'linked' THEN p_member_user_id ELSE NULL END,
      v_audit_action, p_request_id, v_linkage_state
    );
  END IF;

  RETURN QUERY SELECT v_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reveal_chat_lead_contact(
  p_lead_id UUID,
  p_actor_user_id UUID,
  p_request_id UUID
)
RETURNS TABLE(
  lead_id UUID,
  contact_channel public.chat_contact_channel,
  email VARCHAR(254),
  phone VARCHAR(32),
  company_name VARCHAR(200),
  contact_name VARCHAR(100),
  preferred_channel public.chat_preferred_channel,
  contact_window public.chat_contact_window,
  was_redacted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_contact public.chat_lead_contacts;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = p_actor_user_id
      AND profiles.role IN ('ADMIN','OPERATOR','SALES')
      AND profiles.status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Chat lead staff authorization required' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_contact FROM public.chat_lead_contacts
  WHERE public.chat_lead_contacts.lead_id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat lead contact not found' USING ERRCODE = 'P0003';
  END IF;

  IF v_contact.contact_data_redacted_at IS NOT NULL THEN
    INSERT INTO public.chat_lead_audit_events(
      lead_id, actor_user_id, action, request_id, redaction_reason
    ) VALUES (
      p_lead_id, p_actor_user_id, 'contact_reveal_denied', p_request_id,
      CASE WHEN v_contact.disposition = 'redacted' THEN 'privacy_approval' ELSE 'retention' END
    );
    RETURN QUERY SELECT p_lead_id, v_contact.contact_channel, NULL::VARCHAR(254),
      NULL::VARCHAR(32), NULL::VARCHAR(200), NULL::VARCHAR(100),
      v_contact.preferred_channel, v_contact.contact_window, TRUE;
    RETURN;
  END IF;

  INSERT INTO public.chat_lead_audit_events(
    lead_id, actor_user_id, action, request_id
  ) VALUES (p_lead_id, p_actor_user_id, 'contact_revealed', p_request_id);

  RETURN QUERY SELECT p_lead_id, v_contact.contact_channel, v_contact.email,
    v_contact.phone, v_contact.company_name, v_contact.contact_name,
    v_contact.preferred_channel, v_contact.contact_window, FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_lead_workflow(
  p_lead_id UUID,
  p_actor_user_id UUID,
  p_status public.chat_lead_status,
  p_outcome public.chat_lead_outcome,
  p_handoff_state public.chat_lead_handoff_state,
  p_request_id UUID
)
RETURNS TABLE(
  lead_id UUID,
  status public.chat_lead_status,
  outcome public.chat_lead_outcome,
  handoff_state public.chat_lead_handoff_state
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_lead public.chat_leads;
  v_old_lead public.chat_leads;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = p_actor_user_id
      AND profiles.role IN ('ADMIN','OPERATOR','SALES')
      AND profiles.status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Chat lead staff authorization required' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_old_lead FROM public.chat_leads WHERE id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat lead not found' USING ERRCODE = 'P0003';
  END IF;

  UPDATE public.chat_leads SET
    status = COALESCE(p_status, public.chat_leads.status),
    outcome = COALESCE(p_outcome, public.chat_leads.outcome),
    handoff_state = COALESCE(p_handoff_state, public.chat_leads.handoff_state),
    updated_at = NOW(),
    closed_at = CASE
      WHEN COALESCE(p_status, public.chat_leads.status)::TEXT
        IN ('closed_won','closed_lost','invalid') THEN NOW()
      ELSE public.chat_leads.closed_at
    END
  WHERE public.chat_leads.id = p_lead_id
  RETURNING * INTO v_lead;

  INSERT INTO public.chat_lead_audit_events(
    lead_id, actor_user_id, action, request_id,
    from_status, to_status, from_outcome, to_outcome,
    from_handoff_state, to_handoff_state
  ) VALUES (
    p_lead_id, p_actor_user_id, 'lead_updated', p_request_id,
    v_old_lead.status, v_lead.status, v_old_lead.outcome, v_lead.outcome,
    v_old_lead.handoff_state, v_lead.handoff_state
  );

  RETURN QUERY SELECT p_lead_id, v_lead.status, v_lead.outcome, v_lead.handoff_state;
END;
$$;

CREATE OR REPLACE FUNCTION public.redact_chat_lead_contact(
  p_lead_id UUID,
  p_actor_user_id UUID,
  p_request_id UUID,
  p_reason public.chat_redaction_reason
)
RETURNS TABLE(
  lead_id UUID,
  disposition public.chat_contact_disposition,
  member_linkage_state public.chat_linkage_state
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_lead public.chat_leads;
  v_contact public.chat_lead_contacts;
  v_authorize_failure BOOLEAN := FALSE;
  v_is_staff BOOLEAN := FALSE;
  v_is_owner BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_lead FROM public.chat_leads WHERE id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat lead not found' USING ERRCODE = 'P0003';
  END IF;
  SELECT * INTO v_contact FROM public.chat_lead_contacts
  WHERE public.chat_lead_contacts.lead_id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat lead contact not found' USING ERRCODE = 'P0003';
  END IF;

  v_is_staff := p_actor_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = p_actor_user_id
      AND profiles.role IN ('ADMIN','OPERATOR','SALES')
      AND profiles.status = 'ACTIVE'
  );
  v_is_owner := p_actor_user_id IS NOT NULL
    AND v_lead.member_user_id = p_actor_user_id;

  IF p_reason = 'retention' THEN
    v_authorize_failure := p_actor_user_id IS NOT NULL;
  ELSIF p_reason = 'privacy_approval' THEN
    v_authorize_failure := p_actor_user_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = p_actor_user_id
        AND profiles.role IN ('ADMIN','OPERATOR','SALES')
        AND profiles.status = 'ACTIVE'
    );
  ELSIF p_reason = 'user_request' THEN
    v_authorize_failure := p_actor_user_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = p_actor_user_id AND profiles.status = 'ACTIVE'
    ) OR (NOT v_is_staff AND NOT v_is_owner);
  END IF;

  IF v_authorize_failure THEN
    RAISE EXCEPTION 'Redaction authorization failed' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.chat_lead_contacts SET
    email = NULL,
    phone = NULL,
    company_name = NULL,
    contact_name = NULL,
    disposition = 'redacted',
    contact_data_redacted_at = NOW(),
    updated_at = NOW()
  WHERE public.chat_lead_contacts.lead_id = p_lead_id;

  UPDATE public.chat_leads SET
    contents_description = NULL,
    quantity_description = NULL,
    size_spec_state = NULL,
    material_printing_needs = NULL,
    deadline_text = NULL,
    requirements_redacted_at = NOW(),
    member_user_id = NULL,
    member_linkage_state = CASE
      WHEN public.chat_leads.member_linkage_state = 'linked'
        THEN 'unlinked'::public.chat_linkage_state
      ELSE public.chat_leads.member_linkage_state
    END,
    member_linkage_updated_at = CASE
      WHEN public.chat_leads.member_linkage_state = 'linked' THEN NOW()
      ELSE public.chat_leads.member_linkage_updated_at
    END,
    updated_at = NOW()
  WHERE public.chat_leads.id = p_lead_id
  RETURNING * INTO v_lead;

  INSERT INTO public.chat_lead_audit_events(
    lead_id, actor_user_id, action, request_id,
    from_disposition, to_disposition, redaction_reason
  ) VALUES (
    p_lead_id, p_actor_user_id, 'contact_redacted', p_request_id,
    v_contact.disposition, 'redacted', p_reason
  );
  INSERT INTO public.chat_lead_audit_events(
    lead_id, actor_user_id, action, request_id, redaction_reason
  ) VALUES (
    p_lead_id, p_actor_user_id, 'requirements_redacted', p_request_id, p_reason
  );
  IF v_lead.member_linkage_state = 'unlinked' THEN
    INSERT INTO public.chat_lead_audit_events(
      lead_id, actor_user_id, action, request_id,
      from_linkage_state, to_linkage_state, redaction_reason
    ) VALUES (
      p_lead_id, p_actor_user_id, 'linkage_removed', p_request_id,
      'linked', 'unlinked', p_reason
    );
  END IF;

  RETURN QUERY SELECT p_lead_id, 'redacted'::public.chat_contact_disposition,
    v_lead.member_linkage_state;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_chat_lead_member_status(
  p_lead_id UUID,
  p_actor_user_id UUID,
  p_request_id UUID
)
RETURNS TABLE(
  lead_id UUID,
  status public.chat_lead_status,
  outcome public.chat_lead_outcome,
  handoff_state public.chat_lead_handoff_state,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_lead public.chat_leads;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = p_actor_user_id
      AND profiles.role = 'MEMBER'
      AND profiles.status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Active member authorization required' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_lead FROM public.chat_leads
  WHERE id = p_lead_id AND member_user_id = p_actor_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked chat lead not found' USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY SELECT p_lead_id, v_lead.status, v_lead.outcome,
    v_lead.handoff_state, v_lead.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.redact_and_unlink_chat_leads_for_member(
  p_member_user_id UUID,
  p_request_id UUID,
  p_batch_limit INTEGER DEFAULT 10000
)
RETURNS TABLE(unlinked_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_lead RECORD;
  v_count BIGINT := 0;
  v_batch_count INTEGER := 0;
  v_safety INTEGER := 0;
BEGIN
  IF p_batch_limit < 1 OR p_batch_limit > 10000 THEN
    RAISE EXCEPTION 'Invalid batch limit' USING ERRCODE = 'P0001';
  END IF;

  LOOP
    v_batch_count := 0;
    FOR v_lead IN
      SELECT id FROM public.chat_leads
      WHERE member_user_id = p_member_user_id
        AND member_linkage_state = 'linked'
      ORDER BY created_at
      LIMIT p_batch_limit
      FOR UPDATE
    LOOP
      PERFORM public.redact_chat_lead_contact(
        v_lead.id, p_member_user_id, p_request_id, 'user_request'
      );
      v_count := v_count + 1;
      v_batch_count := v_batch_count + 1;
    END LOOP;

    EXIT WHEN v_batch_count = 0;
    v_safety := v_safety + 1;
    IF v_safety > 100000 THEN
      RAISE EXCEPTION 'Too many chat lead unlink batches' USING ERRCODE = 'P0005';
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM public.chat_leads
    WHERE member_user_id = p_member_user_id
      AND member_linkage_state = 'linked'
  ) THEN
    RAISE EXCEPTION 'Linked chat leads remain after unlink lifecycle' USING ERRCODE = 'P0005';
  END IF;

  RETURN QUERY SELECT v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_chat_lead_rate_limiter()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_identifier UUID := gen_random_uuid();
  v_allowed BOOLEAN;
BEGIN
  PERFORM public.purge_expired_chat_rate_limits(10000, 100000);
  INSERT INTO public.chat_rate_limits(
    identifier_hash, action, window_started_at, count, expires_at
  ) VALUES (
    v_identifier, 'guest_lead_submit', NOW(), 1, NOW() + INTERVAL '60 seconds'
  );

  UPDATE public.chat_rate_limits
  SET count = count + 1
  WHERE identifier_hash = v_identifier AND action = 'guest_lead_submit';

  SELECT count >= 2 INTO v_allowed FROM public.chat_rate_limits
  WHERE identifier_hash = v_identifier AND action = 'guest_lead_submit';

  DELETE FROM public.chat_rate_limits
  WHERE identifier_hash = v_identifier AND action = 'guest_lead_submit';

  RETURN v_allowed IS TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_expired_chat_rate_limits(
  p_batch_limit INTEGER DEFAULT 10000,
  p_maximum_rows INTEGER DEFAULT 100000
)
RETURNS TABLE(
  deleted_expired BIGINT,
  deleted_overflow BIGINT,
  remaining_rows BIGINT,
  more_work_remaining BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_deleted_expired BIGINT := 0;
  v_deleted_overflow BIGINT := 0;
  v_remaining BIGINT := 0;
BEGIN
  IF p_batch_limit < 1 OR p_batch_limit > 10000
     OR p_maximum_rows < 1 OR p_maximum_rows > 100000 THEN
    RAISE EXCEPTION 'Invalid rate limit cleanup configuration' USING ERRCODE = 'P0001';
  END IF;

  WITH candidates AS (
    SELECT identifier_hash, action
    FROM public.chat_rate_limits
    WHERE expires_at < NOW()
    ORDER BY expires_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED
  ),
  expired AS (
    DELETE FROM public.chat_rate_limits limit_row
    USING candidates
    WHERE limit_row.identifier_hash = candidates.identifier_hash
      AND limit_row.action = candidates.action
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted_expired FROM expired;

  SELECT count(*) INTO v_remaining FROM public.chat_rate_limits;

  IF v_remaining > p_maximum_rows THEN
    WITH overflow AS (
      SELECT identifier_hash, action
      FROM public.chat_rate_limits
      ORDER BY expires_at ASC
      LIMIT LEAST(p_batch_limit, v_remaining - p_maximum_rows)
      FOR UPDATE SKIP LOCKED
    )
    DELETE FROM public.chat_rate_limits limit_row
    USING overflow
    WHERE limit_row.identifier_hash = overflow.identifier_hash
      AND limit_row.action = overflow.action;

    GET DIAGNOSTICS v_deleted_overflow = ROW_COUNT;
  END IF;

  SELECT count(*) INTO v_remaining FROM public.chat_rate_limits;
  RETURN QUERY SELECT
    v_deleted_expired,
    v_deleted_overflow,
    v_remaining,
    EXISTS (
      SELECT 1 FROM public.chat_rate_limits
      WHERE expires_at < NOW()
    ) OR v_remaining > p_maximum_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_chat_lead_rate_limit(
  p_identifier_hash UUID,
  p_action public.chat_rate_limit_action,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(
  allowed BOOLEAN,
  event_count INTEGER,
  remaining INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_count INTEGER;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF p_limit < 1 OR p_limit > 1000
     OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit configuration' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.chat_rate_limits AS limit_row(
    identifier_hash, action, window_started_at, count, expires_at
  ) VALUES (
    p_identifier_hash, p_action, NOW(), 1, NOW() + (p_window_seconds || ' seconds')::INTERVAL
  )
  ON CONFLICT (identifier_hash, action) DO UPDATE SET
    window_started_at = CASE
      WHEN limit_row.expires_at <= NOW() THEN NOW()
      ELSE limit_row.window_started_at
    END,
    count = CASE
      WHEN limit_row.expires_at <= NOW() THEN 1
      ELSE limit_row.count + 1
    END,
    expires_at = CASE
      WHEN limit_row.expires_at <= NOW()
        THEN NOW() + (p_window_seconds || ' seconds')::INTERVAL
      ELSE limit_row.expires_at
    END
  RETURNING count, expires_at INTO v_count, v_expires_at;

  RETURN QUERY SELECT
    v_count <= p_limit,
    v_count,
    GREATEST(0, p_limit - v_count),
    GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_expires_at - NOW())))::INTEGER);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_chat_lead_readiness()
RETURNS TABLE(
  ready BOOLEAN,
  privacy_approval_record UUID,
  privacy_policy_version INTEGER,
  consent_version INTEGER,
  contact_retention_days INTEGER,
  summary_consent_retention_days INTEGER,
  audit_retention_days INTEGER,
  legacy_resolution public.chat_legacy_resolution,
  legacy_approval_record UUID,
  legacy_replacement_version INTEGER,
  schema_version INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_ready public.chat_lead_privacy_readiness;
  v_limiter_ready BOOLEAN;
BEGIN
  SELECT * INTO v_ready FROM public.chat_lead_privacy_readiness WHERE id = 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::INTEGER, NULL::INTEGER,
      NULL::INTEGER, NULL::INTEGER, NULL::INTEGER,
      NULL::public.chat_legacy_resolution, NULL::UUID, NULL::INTEGER,
      NULL::INTEGER;
    RETURN;
  END IF;

  v_limiter_ready := public.verify_chat_lead_rate_limiter();
  RETURN QUERY SELECT
    v_limiter_ready AND v_ready.legacy_resolution <> 'unresolved',
    v_ready.privacy_approval_record,
    v_ready.privacy_policy_version,
    v_ready.consent_version,
    v_ready.contact_retention_days,
    v_ready.summary_consent_retention_days,
    v_ready.audit_retention_days,
    v_ready.legacy_resolution,
    v_ready.legacy_approval_record,
    v_ready.legacy_replacement_version,
    v_ready.schema_version;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_expired_chat_lead_data(
  p_batch_limit INTEGER DEFAULT 10000
)
RETURNS TABLE(
  redacted_contacts BIGINT,
  deleted_leads BIGINT,
  deleted_audit_events BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_ready public.chat_lead_privacy_readiness;
  v_redacted BIGINT := 0;
  v_deleted_leads BIGINT := 0;
  v_deleted_audit BIGINT := 0;
  v_contact RECORD;
  v_lead RECORD;
BEGIN
  IF p_batch_limit < 1 OR p_batch_limit > 10000 THEN
    RAISE EXCEPTION 'Invalid purge batch limit' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_ready FROM public.chat_lead_privacy_readiness WHERE id = 1;
  IF NOT FOUND OR v_ready.legacy_resolution = 'unresolved' THEN
    RAISE EXCEPTION 'Chat lead readiness is invalid' USING ERRCODE = 'P0005';
  END IF;

  FOR v_contact IN
    SELECT lead_id FROM public.chat_lead_contacts
    WHERE contact_data_redacted_at IS NULL
      AND retention_due_at < NOW()
    ORDER BY retention_due_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED
  LOOP
    PERFORM public.redact_chat_lead_contact(
      v_contact.lead_id, NULL, gen_random_uuid(), 'retention'
    );
    v_redacted := v_redacted + 1;
  END LOOP;

  FOR v_lead IN
    SELECT id FROM public.chat_leads
    WHERE created_at < NOW() - (v_ready.summary_consent_retention_days || ' days')::INTERVAL
    ORDER BY created_at
    LIMIT p_batch_limit
    FOR UPDATE SKIP LOCKED
  LOOP
    INSERT INTO public.chat_lead_audit_events(
      lead_id, actor_user_id, action, request_id, redaction_reason
    ) VALUES (
      v_lead.id, NULL, 'lead_deleted', gen_random_uuid(), 'retention'
    );
    DELETE FROM public.chat_leads WHERE id = v_lead.id;
    v_deleted_leads := v_deleted_leads + 1;
  END LOOP;

  WITH deleted AS (
    DELETE FROM public.chat_lead_audit_events
    WHERE created_at < NOW() - (v_ready.audit_retention_days || ' days')::INTERVAL
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted_audit FROM deleted;

  RETURN QUERY SELECT v_redacted, v_deleted_leads, v_deleted_audit;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_chat_lead(
  UUID, UUID, BOOLEAN, public.chat_lead_intent, VARCHAR, VARCHAR, VARCHAR,
  VARCHAR, VARCHAR, VARCHAR, public.chat_contact_channel, VARCHAR, VARCHAR,
  VARCHAR, VARCHAR, public.chat_preferred_channel, public.chat_contact_window,
  BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, INTEGER, INTEGER, UUID
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_chat_lead(
  UUID, UUID, BOOLEAN, public.chat_lead_intent, VARCHAR, VARCHAR, VARCHAR,
  VARCHAR, VARCHAR, VARCHAR, public.chat_contact_channel, VARCHAR, VARCHAR,
  VARCHAR, VARCHAR, public.chat_preferred_channel, public.chat_contact_window,
  BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, INTEGER, INTEGER, UUID
) TO service_role;

REVOKE ALL ON FUNCTION public.reveal_chat_lead_contact(UUID, UUID, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_chat_lead_contact(UUID, UUID, UUID)
  TO service_role;

REVOKE ALL ON FUNCTION public.update_chat_lead_workflow(
  UUID, UUID, public.chat_lead_status, public.chat_lead_outcome,
  public.chat_lead_handoff_state, UUID
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_chat_lead_workflow(
  UUID, UUID, public.chat_lead_status, public.chat_lead_outcome,
  public.chat_lead_handoff_state, UUID
) TO service_role;

REVOKE ALL ON FUNCTION public.redact_chat_lead_contact(
  UUID, UUID, UUID, public.chat_redaction_reason
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redact_chat_lead_contact(
  UUID, UUID, UUID, public.chat_redaction_reason
) TO service_role;

REVOKE ALL ON FUNCTION public.get_chat_lead_member_status(UUID, UUID, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_lead_member_status(UUID, UUID, UUID)
  TO service_role;

REVOKE ALL ON FUNCTION public.redact_and_unlink_chat_leads_for_member(UUID, UUID, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redact_and_unlink_chat_leads_for_member(UUID, UUID, INTEGER)
  TO service_role;

REVOKE ALL ON FUNCTION public.verify_chat_lead_rate_limiter()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_chat_lead_rate_limiter()
  TO service_role;

REVOKE ALL ON FUNCTION public.check_chat_lead_rate_limit(
  UUID, public.chat_rate_limit_action, INTEGER, INTEGER
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_chat_lead_rate_limit(
  UUID, public.chat_rate_limit_action, INTEGER, INTEGER
) TO service_role;

REVOKE ALL ON FUNCTION public.purge_expired_chat_rate_limits(INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_chat_rate_limits(INTEGER, INTEGER)
  TO service_role;

REVOKE ALL ON FUNCTION public.verify_chat_lead_readiness()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_chat_lead_readiness()
  TO service_role;

REVOKE ALL ON FUNCTION public.purge_expired_chat_lead_data(INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_chat_lead_data(INTEGER)
  TO service_role;

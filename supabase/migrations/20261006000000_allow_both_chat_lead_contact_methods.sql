-- Allow chat leads to store both email and phone while retaining one primary channel.
-- Application policy requires both contact methods and company/contact names.

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
  IF p_contact_channel NOT IN ('email', 'phone')
     OR p_email IS NULL OR p_phone IS NULL THEN
    RAISE EXCEPTION 'Email and phone are required' USING ERRCODE = 'P0001';
  END IF;
  IF p_company_name IS NULL OR p_contact_name IS NULL THEN
    RAISE EXCEPTION 'Company name and contact name are required' USING ERRCODE = 'P0001';
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

ALTER TABLE public.chat_lead_contacts
  DROP CONSTRAINT chat_lead_contacts_pre_redaction_channel;

ALTER TABLE public.chat_lead_contacts
  ADD CONSTRAINT chat_lead_contacts_pre_redaction_channel CHECK (
    contact_data_redacted_at IS NOT NULL OR (
      (
        email IS NOT NULL AND phone IS NOT NULL AND
        (contact_channel = 'email' OR contact_channel = 'phone')
      ) OR (
        email IS NOT NULL AND phone IS NULL AND contact_channel = 'email'
      ) OR (
        phone IS NOT NULL AND email IS NULL AND contact_channel = 'phone'
      )
    )
  );

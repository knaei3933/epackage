import 'server-only';

import { createHmac } from 'node:crypto';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import type { ChatLeadSubmission } from '@/lib/chat/lead-schema';
import type { ChatPageContext } from '@/lib/chat/page-context';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const leadClient = () => createAuthenticatedServiceClient({
  operation: 'submit_chat_lead',
  route: '/api/chat/lead',
});

const rateLimitClient = () => createAuthenticatedServiceClient({
  operation: 'chat_lead_rate_limit',
  route: '/api/chat/lead',
});

function uuidFromDigest(digest: string): string {
  return [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `4${digest.slice(13, 16)}`,
    ((Number.parseInt(digest.slice(16, 17), 16) & 0x3) | 0x8).toString(16) +
      digest.slice(17, 20),
    digest.slice(20, 32),
  ].join('-');
}

function routeFamily(pathname: string): string {
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
  if (normalized === '/') return 'home';
  if (normalized.startsWith('/admin')) return 'admin';
  if (normalized.startsWith('/member')) return 'member';
  if (normalized.startsWith('/designer')) return 'designer';
  if (normalized.startsWith('/quote-simulator')) return 'quote-simulator';
  if (normalized.startsWith('/blog/')) return 'blog';
  if (normalized.startsWith('/catalog/')) return 'catalog';
  return normalized.split('/')[1] ?? 'general';
}

export interface ChatLeadRateLimit {
  readonly allowed: boolean;
}

export async function checkChatLeadRateLimit({
  memberUserId,
  sessionId,
  forwardedFor,
}: {
  memberUserId?: string;
  sessionId: string;
  forwardedFor: string;
}): Promise<ChatLeadRateLimit | null> {
  const pepper = process.env.CHAT_LEAD_RATE_LIMIT_PEPPER;
  if (!pepper) return null;

  const identity = memberUserId
    ? `member:${memberUserId}`
    : `session:${sessionId}:ip:${forwardedFor}`;
  const identifierHash = uuidFromDigest(
    createHmac('sha256', pepper).update(identity).digest('hex'),
  );
  const action = memberUserId ? 'member_lead_submit' : 'guest_lead_submit';

  try {
    const client = rateLimitClient();
    const { data, error } = await client.rpc('check_chat_lead_rate_limit', {
      p_identifier_hash: identifierHash,
      p_action: action,
      p_limit: memberUserId ? 10 : 5,
      p_window_seconds: 3600,
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (typeof row !== 'object' || row === null || typeof row.allowed !== 'boolean') {
      return null;
    }
    return { allowed: row.allowed };
  } catch {
    return null;
  }
}

export interface SubmitChatLeadResult {
  readonly accepted: boolean;
  readonly leadId?: string;
}

export async function submitChatLead({
  lead,
  pageContext,
  memberUserId,
}: {
  lead: ChatLeadSubmission;
  pageContext: ChatPageContext;
  memberUserId?: string;
}): Promise<SubmitChatLeadResult | null> {
  const consentVersion = Number.parseInt(
    process.env.CHAT_LEAD_CONSENT_VERSION ?? '',
    10,
  );
  const privacyPolicyVersion = Number.parseInt(
    process.env.CHAT_LEAD_PRIVACY_POLICY_VERSION ?? '',
    10,
  );
  const contactRetentionDays = Number.parseInt(
    process.env.CHAT_LEAD_CONTACT_RETENTION_DAYS ?? '',
    10,
  );
  if (
    !Number.isSafeInteger(consentVersion) || consentVersion < 1 ||
    !Number.isSafeInteger(privacyPolicyVersion) || privacyPolicyVersion < 1 ||
    !Number.isSafeInteger(contactRetentionDays) ||
    contactRetentionDays < 1 || contactRetentionDays > 365
  ) {
    return null;
  }

  try {
    const client = leadClient();
    const { data, error } = await client.rpc('submit_chat_lead', {
      p_chat_session_id: lead.sessionId,
      p_member_user_id: memberUserId ?? null,
      p_linkage_consent: Boolean(memberUserId && lead.consent.memberLinkage),
      p_intent: lead.intent,
      p_contents_description: lead.requirements.contentsDescription ?? null,
      p_quantity_description: lead.requirements.quantityDescription ?? null,
      p_size_spec_state: lead.requirements.sizeSpecState ?? null,
      p_material_printing_needs: lead.requirements.materialPrintingNeeds ?? null,
      p_deadline_text: lead.requirements.deadlineText ?? null,
      p_route_family: routeFamily(pageContext.pathname),
      p_contact_channel: lead.contact.channel,
      p_email: lead.contact.email ?? null,
      p_phone: lead.contact.phone ?? null,
      p_company_name: lead.contact.companyName ?? null,
      p_contact_name: lead.contact.contactName ?? null,
      p_preferred_channel: lead.contact.preferredChannel,
      p_contact_window: lead.contact.contactWindow,
      p_contact_consent: lead.consent.contact,
      p_privacy_consent: lead.consent.privacy,
      p_marketing_consent: lead.consent.marketing,
      p_consent_version: consentVersion,
      p_privacy_policy_version: privacyPolicyVersion,
      p_contact_retention_days: contactRetentionDays,
      p_request_id: crypto.randomUUID(),
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    const leadId = row?.lead_id;
    return typeof leadId === 'string'
      ? { accepted: true, leadId }
      : { accepted: false };
  } catch {
    return null;
  }
}

export function isValidChatLeadRequestUUID(value: string): boolean {
  return UUID_PATTERN.test(value);
}

import 'server-only';

import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidLeadUUID = (value: string): boolean =>
  UUID_PATTERN.test(value);

const adminClient = () => createAuthenticatedServiceClient({
  operation: 'chat_lead_admin',
  route: '/api/admin/leads',
});

// ============================================================
// List leads via staff RPC (safe columns, no PII)
// ============================================================

export interface ChatLeadListItem {
  readonly id: string;
  readonly chatSessionId: string | null;
  readonly memberUserId: string | null;
  readonly memberLinkageState: string;
  readonly intent: string;
  readonly routeFamily: string;
  readonly status: string;
  readonly outcome: string;
  readonly handoffState: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt: string | null;
  readonly contactChannel: string | null;
  readonly contactDisposition: string | null;
}

export interface ChatLeadListResult {
  readonly leads: readonly ChatLeadListItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export async function listChatLeadsForStaff({
  actorUserId,
  page = 1,
  limit = 20,
  status,
  intent,
}: {
  actorUserId: string;
  page?: number;
  limit?: number;
  status?: string;
  intent?: string;
}): Promise<ChatLeadListResult | null> {
  if (!isValidLeadUUID(actorUserId)) return null;

  try {
    const client = adminClient();
    const { data, error } = await client.rpc('list_chat_leads_for_staff', {
      p_actor_user_id: actorUserId,
      p_status: status || null,
      p_intent: intent || null,
      p_page: page,
      p_limit: limit,
      p_request_id: crypto.randomUUID(),
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (typeof row !== 'object' || row === null) return null;

    const total = (row as Record<string, unknown>).total_count as number;
    const rawLeads = (row as Record<string, unknown>).leads as unknown[];
    const safePage = Math.max(1, Math.min(1000, page));
    const safeLimit = Math.max(1, Math.min(100, limit));

    const leads = (rawLeads ?? []).map((item: unknown) => {
      const r = item as Record<string, unknown>;
      return {
        id: r.id as string,
        chatSessionId: (r.chat_session_id as string | null) ?? null,
        memberUserId: (r.member_user_id as string | null) ?? null,
        memberLinkageState: r.member_linkage_state as string,
        intent: r.intent as string,
        routeFamily: r.route_family as string,
        status: r.status as string,
        outcome: r.outcome as string,
        handoffState: r.handoff_state as string,
        createdAt: r.created_at as string,
        updatedAt: r.updated_at as string,
        closedAt: (r.closed_at as string | null) ?? null,
        contactChannel: (r.contact_channel as string | null) ?? null,
        contactDisposition: (r.contact_disposition as string | null) ?? null,
      };
    });

    return {
      leads,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  } catch {
    return null;
  }
}

// ============================================================
// Update lead workflow via audited RPC
// ============================================================

export interface ChatLeadWorkflowUpdate {
  readonly accepted: boolean;
  readonly lead?: {
    readonly id: string;
    readonly status: string;
    readonly outcome: string;
    readonly handoffState: string;
    readonly updatedAt: string;
  };
}

export async function updateChatLeadWorkflow({
  leadId,
  actorUserId,
  status,
  outcome,
  handoffState,
}: {
  leadId: string;
  actorUserId: string;
  status: string;
  outcome: string;
  handoffState: string;
}): Promise<ChatLeadWorkflowUpdate | null> {
  if (!isValidLeadUUID(leadId) || !isValidLeadUUID(actorUserId)) return null;

  try {
    const client = adminClient();
    const { data, error } = await client.rpc('update_chat_lead_workflow', {
      p_lead_id: leadId,
      p_actor_user_id: actorUserId,
      p_status: status,
      p_outcome: outcome,
      p_handoff_state: handoffState,
      p_request_id: crypto.randomUUID(),
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (typeof row !== 'object' || row === null) return { accepted: false };

    return {
      accepted: true,
      lead: {
        id: (row as Record<string, unknown>).lead_id as string,
        status: (row as Record<string, unknown>).status as string,
        outcome: (row as Record<string, unknown>).outcome as string,
        handoffState: (row as Record<string, unknown>).handoff_state as string,
        updatedAt: (row as Record<string, unknown>).updated_at as string,
      },
    };
  } catch {
    return null;
  }
}

// ============================================================
// Reveal contact PII via audited RPC
// ============================================================

export interface ChatLeadContactReveal {
  readonly redacted: boolean;
  readonly contact?: {
    readonly contactChannel: string;
    readonly email: string | null;
    readonly phone: string | null;
    readonly companyName: string | null;
    readonly contactName: string | null;
    readonly preferredChannel: string;
    readonly contactWindow: string;
  };
}

export async function revealChatLeadContact({
  leadId,
  actorUserId,
}: {
  leadId: string;
  actorUserId: string;
}): Promise<ChatLeadContactReveal | null> {
  if (!isValidLeadUUID(leadId) || !isValidLeadUUID(actorUserId)) return null;

  try {
    const client = adminClient();
    const { data, error } = await client.rpc('reveal_chat_lead_contact', {
      p_lead_id: leadId,
      p_actor_user_id: actorUserId,
      p_request_id: crypto.randomUUID(),
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (typeof row !== 'object' || row === null) return null;

    const r = row as Record<string, unknown>;
    if (r.was_redacted === true) {
      return { redacted: true };
    }

    return {
      redacted: false,
      contact: {
        contactChannel: r.contact_channel as string,
        email: (r.email as string | null) ?? null,
        phone: (r.phone as string | null) ?? null,
        companyName: (r.company_name as string | null) ?? null,
        contactName: (r.contact_name as string | null) ?? null,
        preferredChannel: r.preferred_channel as string,
        contactWindow: r.contact_window as string,
      },
    };
  } catch {
    return null;
  }
}

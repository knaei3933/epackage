import { getJson, postJson, patchJson } from '@/lib/api-fetch';

// ============================================================
// Types matching /api/admin/leads response
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

export interface ChatLeadListResponse {
  readonly success: boolean;
  readonly data: readonly ChatLeadListItem[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface ChatLeadUpdateResponse {
  readonly success: boolean;
  readonly data: {
    readonly id: string;
    readonly status: string;
    readonly outcome: string;
    readonly handoffState: string;
    readonly updatedAt: string;
  };
}

export interface ChatLeadRevealResponse {
  readonly success: boolean;
  readonly redacted: boolean;
  readonly contact: {
    readonly contactChannel: string;
    readonly email: string | null;
    readonly phone: string | null;
    readonly companyName: string | null;
    readonly contactName: string | null;
    readonly preferredChannel: string;
    readonly contactWindow: string;
  } | null;
}

// ============================================================
// API functions
// ============================================================

export async function fetchLeads(params?: {
  page?: number;
  limit?: number;
  status?: string;
  intent?: string;
}): Promise<ChatLeadListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.intent) searchParams.set('intent', params.intent);
  const qs = searchParams.toString();
  return getJson<ChatLeadListResponse>(`/api/admin/leads${qs ? `?${qs}` : ''}`);
}

export async function updateLeadStatus(
  leadId: string,
  data: { status: string; outcome: string; handoffState: string },
): Promise<ChatLeadUpdateResponse> {
  return patchJson<ChatLeadUpdateResponse>(`/api/admin/leads/${leadId}`, data);
}

export async function revealLeadContact(
  leadId: string,
): Promise<ChatLeadRevealResponse> {
  return postJson<ChatLeadRevealResponse>(`/api/admin/leads/${leadId}/reveal`, {});
}

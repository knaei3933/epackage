import 'server-only';

import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

const purgeClient = () => createAuthenticatedServiceClient({
  operation: 'purge_chat_lead_data',
  route: '/api/cron/purge-chat-leads',
});

export interface ChatLeadPurgeResult {
  readonly redactedContacts: number;
  readonly deletedLeads: number;
  readonly deletedAuditEvents: number;
}

export async function purgeExpiredChatLeadData({
  batchLimit = 5000,
}: {
  batchLimit?: number;
} = {}): Promise<ChatLeadPurgeResult | null> {
  if (batchLimit < 1 || batchLimit > 10000) return null;

  try {
    const client = purgeClient();
    const { data, error } = await client.rpc('purge_expired_chat_lead_data', {
      p_batch_limit: batchLimit,
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (typeof row !== 'object' || row === null) return null;

    return {
      redactedContacts: (row as Record<string, unknown>).redacted_contacts as number,
      deletedLeads: (row as Record<string, unknown>).deleted_leads as number,
      deletedAuditEvents: (row as Record<string, unknown>).deleted_audit_events as number,
    };
  } catch {
    return null;
  }
}

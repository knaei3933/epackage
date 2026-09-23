import 'server-only';

import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { isValidLeadUUID } from '@/lib/chat/lead-admin';

const memberClient = () => createAuthenticatedServiceClient({
  operation: 'chat_lead_member_status',
  route: '/api/chat/lead/status',
});

export interface ChatLeadMemberStatus {
  readonly id: string;
  readonly status: string;
  readonly outcome: string;
  readonly handoffState: string;
  readonly updatedAt: string;
}

export async function getChatLeadMemberStatus({
  leadId,
  memberUserId,
}: {
  leadId: string;
  memberUserId: string;
}): Promise<ChatLeadMemberStatus | null> {
  if (!isValidLeadUUID(leadId) || !isValidLeadUUID(memberUserId)) return null;

  try {
    const client = memberClient();
    const { data, error } = await client.rpc('get_chat_lead_member_status', {
      p_lead_id: leadId,
      p_actor_user_id: memberUserId,
      p_request_id: crypto.randomUUID(),
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (typeof row !== 'object' || row === null) return null;

    const r = row as Record<string, unknown>;
    return {
      id: r.lead_id as string,
      status: r.status as string,
      outcome: r.outcome as string,
      handoffState: r.handoff_state as string,
      updatedAt: r.updated_at as string,
    };
  } catch {
    return null;
  }
}

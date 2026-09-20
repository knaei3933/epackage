import 'server-only';

import type { NextRequest } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import type { ChatSuggestionAudience } from '@/lib/chat/chat-suggestion-types';

export interface ChatParticipant {
  userId?: string;
  role?: string;
  status?: string;
  audience: ChatSuggestionAudience;
}

const audienceForProfile = (
  role?: string,
  status?: string,
): ChatSuggestionAudience => {
  if (status !== 'ACTIVE' || !role) return 'public';
  if (role === 'MEMBER') return 'member';
  if (role === 'ADMIN' || role === 'OPERATOR' || role === 'SALES') return 'staff';
  if (role === 'KOREA_DESIGNER') return 'designer';
  return 'public';
};

/**
 * Resolve chat participation from the verified server session. Chat APIs are
 * public, so caller-supplied identity headers are deliberately ignored.
 */
export async function resolveChatParticipant(
  request: Request,
): Promise<ChatParticipant | null> {
  try {
    const { client } = await createSupabaseSSRClient(request as NextRequest);
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;

    const { data: profile } = await client
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    const role = (profile as { role?: string } | null)?.role;
    const status = (profile as { status?: string } | null)?.status;
    return {
      userId: user.id,
      role,
      status,
      audience: audienceForProfile(role, status),
    };
  } catch {
    return null;
  }
}

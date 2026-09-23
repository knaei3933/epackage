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

export type StrictChatParticipantRole =
  | 'MEMBER'
  | 'ADMIN'
  | 'OPERATOR'
  | 'SALES'
  | 'KOREA_DESIGNER';

export type StrictChatParticipantResolution =
  | { status: 'anonymous' }
  | {
      status: 'active';
      userId: string;
      role: StrictChatParticipantRole;
    }
  | { status: 'inactive' }
  | { status: 'infrastructure-error' };

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

/**
 * Strict identity resolution for privacy-sensitive chat flows.
 * Unlike the non-PII suggestion fallback, infrastructure failures never
 * silently downgrade an authenticated user to a guest.
 */
export async function resolveChatParticipantStrict(
  request: Request,
): Promise<StrictChatParticipantResolution> {
  try {
    const { client } = await createSupabaseSSRClient(request as NextRequest);
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    // Auth session errors (no session, expired JWT) mean the user is
    // anonymous, not that infrastructure is broken. Only treat thrown
    // exceptions (network failures, config errors) as infrastructure issues.
    if (authError && !user) return { status: 'anonymous' };
    if (!user) return { status: 'anonymous' };

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) return { status: 'infrastructure-error' };

    const role = (profile as { role?: string } | null)?.role;
    const status = (profile as { status?: string } | null)?.status;
    if (
      status !== 'ACTIVE' ||
      !role ||
      !['MEMBER', 'ADMIN', 'OPERATOR', 'SALES', 'KOREA_DESIGNER'].includes(role)
    ) {
      return { status: 'inactive' };
    }

    return {
      status: 'active',
      userId: user.id,
      role: role as StrictChatParticipantRole,
    };
  } catch {
    return { status: 'infrastructure-error' };
  }
}

export function isChatLeadStaffParticipant(
  participant: StrictChatParticipantResolution,
): participant is {
  status: 'active';
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'SALES';
} {
  return (
    participant.status === 'active' &&
    ['ADMIN', 'OPERATOR', 'SALES'].includes(participant.role)
  );
}

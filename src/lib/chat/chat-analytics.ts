import 'server-only';

import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import type { ChatSuggestionAudience } from '@/lib/chat/chat-suggestion-types';

export const CHAT_FUNNEL_EVENT_TYPES = [
  'suggestions_shown',
  'suggestion_selected',
  'answer_completed',
  'lead_form_shown',
  'contact_submitted',
  'contact_skipped',
  'linkage_accepted',
  'linkage_declined',
  'handoff_requested',
  'chat_closed',
] as const;

export type ChatFunnelEventType = (typeof CHAT_FUNNEL_EVENT_TYPES)[number];

export interface ChatFunnelEventInput {
  readonly eventType: ChatFunnelEventType;
  readonly suggestionId?: string;
}

const SUGGESTION_ID_PATTERN = /^[a-z0-9.-]{1,128}$/;
const ROUTE_FAMILY_PATTERN = /^[a-z0-9-]{1,80}$/;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isValidChatFunnelEvent = (value: unknown): value is ChatFunnelEventInput =>
  isRecord(value) &&
  Object.keys(value).every((key) => key === 'eventType' || key === 'suggestionId') &&
  CHAT_FUNNEL_EVENT_TYPES.includes(value.eventType as ChatFunnelEventType) &&
  (
    value.suggestionId === undefined ||
    (typeof value.suggestionId === 'string' && SUGGESTION_ID_PATTERN.test(value.suggestionId))
  );

const analyticsClient = () => createAuthenticatedServiceClient({
  operation: 'chat_funnel_event',
  route: '/api/chat/events',
});

export interface EnsureChatSessionInput {
  audience: ChatSuggestionAudience;
  routeFamily: string;
  existingSessionId?: string;
}

export async function ensureChatSession({
  audience,
  routeFamily,
  existingSessionId,
}: EnsureChatSessionInput): Promise<string | null> {
  if (!ROUTE_FAMILY_PATTERN.test(routeFamily)) return null;

  try {
    const client = analyticsClient();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    if (existingSessionId) {
      const { data: existing, error: selectError } = await client
        .from('chat_sessions')
        .update({
          audience,
          last_route_family: routeFamily,
          last_seen_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existingSessionId)
        .gt('expires_at', now.toISOString())
        .is('closed_at', null)
        .select('id')
        .maybeSingle();

      if (!selectError && existing?.id) return existing.id;
    }

    const { data: created, error } = await client
      .from('chat_sessions')
      .insert({
        audience,
        initial_route_family: routeFamily,
        last_route_family: routeFamily,
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    return error ? null : created?.id ?? null;
  } catch {
    return null;
  }
}

export async function recordChatFunnelEvents(
  sessionId: string,
  events: readonly ChatFunnelEventInput[],
): Promise<boolean> {
  if (
    events.length === 0 ||
    events.length > 20 ||
    !events.every(isValidChatFunnelEvent)
  ) {
    return false;
  }

  try {
    const client = analyticsClient();
    const now = new Date().toISOString();
    const { data: session, error: sessionError } = await client
      .from('chat_sessions')
      .select('id,expires_at,closed_at,initial_route_family,last_route_family')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) return false;
    if (new Date(session.expires_at).getTime() <= Date.now() || session.closed_at) {
      return false;
    }

    const routeFamily = session.last_route_family ?? session.initial_route_family;
    if (!ROUTE_FAMILY_PATTERN.test(routeFamily)) return false;

    const { error: insertError } = await client
      .from('chat_funnel_events')
      .insert(events.map((event) => ({
        session_id: sessionId,
        event_type: event.eventType,
        route_family: routeFamily,
        suggestion_id: event.suggestionId ?? null,
        occurred_at: now,
      })));

    if (insertError) return false;
    await client
      .from('chat_sessions')
      .update({ last_seen_at: now })
      .eq('id', sessionId);
    return true;
  } catch {
    return false;
  }
}

export interface ChatAnalyticsPurgeResult {
  readonly deletedEvents: number;
  readonly deletedSessions: number;
  readonly cutoff: string;
}

export async function purgeExpiredChatAnalytics({
  retentionDays = 180,
  batchLimit = 5000,
}: {
  retentionDays?: number;
  batchLimit?: number;
} = {}): Promise<ChatAnalyticsPurgeResult | null> {
  if (retentionDays < 1 || retentionDays > 365 || batchLimit < 1 || batchLimit > 50000) {
    return null;
  }

  try {
    const client = createAuthenticatedServiceClient({
      operation: 'purge_chat_analytics',
      route: '/api/cron/purge-chat-analytics',
    });
    const { data, error } = await client.rpc('purge_expired_chat_analytics', {
      p_retention_days: retentionDays,
      p_batch_limit: batchLimit,
    });
    if (error || !data) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (
      typeof row !== 'object' ||
      row === null ||
      typeof (row as { deleted_events?: unknown }).deleted_events !== 'number' ||
      typeof (row as { deleted_sessions?: unknown }).deleted_sessions !== 'number' ||
      typeof (row as { cutoff?: unknown }).cutoff !== 'string'
    ) {
      return null;
    }

    return {
      deletedEvents: (row as { deleted_events: number }).deleted_events,
      deletedSessions: (row as { deleted_sessions: number }).deleted_sessions,
      cutoff: (row as { cutoff: string }).cutoff,
    };
  } catch {
    return null;
  }
}

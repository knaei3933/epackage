import type { ChatSuggestionView } from '@/lib/chat/chat-suggestion-types';

/**
 * Client-safe fallback only. Detailed and role-specific suggestions are authored
 * and authenticated by `/api/chat/suggestions`.
 */
export const PUBLIC_CHAT_FALLBACK_SUGGESTIONS: readonly ChatSuggestionView[] = [
  {
    id: 'public.fallback.selection',
    labelJa: '製品選択',
    questionJa: '包装材の種類はどう選べばよいですか？',
    audience: 'public',
  },
  {
    id: 'public.fallback.quote',
    labelJa: '見積 flow',
    questionJa: '見積もりはどのように進めればよいですか？',
    audience: 'public',
  },
  {
    id: 'public.fallback.contact',
    labelJa: '担当者相談',
    questionJa: '担当者に確認したいことはどう伝えればよいですか？',
    audience: 'public',
  },
] as const;

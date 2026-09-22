import type { ChatPageContext } from '@/lib/chat/page-context';

export type ChatSuggestionAudience = 'public' | 'member' | 'staff' | 'designer';
export type ChatQuoteStep = NonNullable<ChatPageContext['quoteStep']>;
export type ChatSuggestionLeadIntent =
  | 'quote' | 'sample' | 'technical' | 'human';

export type ChatSuggestionGrounding =
  | { kind: 'knowledge'; ids: readonly string[] }
  | { kind: 'quoteField'; step: ChatQuoteStep; fieldId: string }
  | { kind: 'contact' }
  | { kind: 'navigation' };

export interface ChatSuggestionView {
  id: string;
  labelJa: string;
  questionJa: string;
  audience: ChatSuggestionAudience;
  leadIntent?: ChatSuggestionLeadIntent;
}

export interface ResolvedChatPage {
  routePattern: string;
  routeFamily: string;
}

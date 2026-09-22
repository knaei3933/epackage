import 'server-only';

import { QUOTE_FIELD_HELP } from '@/lib/chat/quote-field-help';
import type {
  ChatSuggestionAudience,
  ChatSuggestionGrounding,
  ChatSuggestionView,
} from '@/lib/chat/chat-suggestion-types';
import type { ChatSuggestionLeadIntent } from '@/lib/chat/chat-suggestion-types';
import type { ChatPageContext } from '@/lib/chat/page-context';

type SuggestionTarget =
  | { type: 'route'; routePattern: string; priority: 0 | 1 }
  | { type: 'family'; routeFamily: string; priority: 0 | 1 }
  | { type: 'any'; priority: 2 };

export interface ServerChatSuggestion extends ChatSuggestionView {
  target: SuggestionTarget;
  quoteStep?: string;
  fieldId?: string;
  leadIntent?: ChatSuggestionLeadIntent;
  grounding: ChatSuggestionGrounding;
}

export interface ResolveChatPageSuggestionsInput {
  pathname: string;
  locale: string;
  audience: ChatSuggestionAudience;
  quoteStep?: ChatPageContext['quoteStep'];
  fieldId?: string;
}

export interface ChatPageSuggestionResolution {
  routePattern: string;
  routeFamily: string;
  suggestions: readonly ServerChatSuggestion[];
}

export type ChatSuggestionValidationFailure =
  | { reason: 'unknown-suggestion' }
  | { reason: 'route-mismatch' }
  | { reason: 'audience-mismatch' }
  | { reason: 'quote-step-mismatch' }
  | { reason: 'quote-field-mismatch' };

const DYNAMIC_ROUTE_PREFIXES: readonly [string, string][] = [
  ['/blog/category/', '/blog/category/[category]'],
  ['/blog/tag/', '/blog/tag/[tag]'],
  ['/blog/', '/blog/[slug]'],
  ['/catalog/', '/catalog/[slug]'],
  ['/designer-order/', '/designer-order/[token]'],
  ['/designer/orders/', '/designer/orders/[id]'],
  ['/upload/', '/upload/[token]'],
];

const normalizePathname = (pathname: string): string => {
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return normalized === '' ? '/' : normalized;
};

const resolveRoute = (pathname: string): { routePattern: string; routeFamily: string } => {
  const normalized = normalizePathname(pathname);
  const dynamicRoute = DYNAMIC_ROUTE_PREFIXES
    .find(([prefix]) => normalized.startsWith(prefix));
  if (dynamicRoute) {
    return {
      routePattern: dynamicRoute[1],
      routeFamily: normalized.split('/')[1] ?? 'general',
    };
  }

  if (normalized.startsWith('/admin')) {
    return { routePattern: '/admin', routeFamily: 'admin' };
  }
  if (normalized.startsWith('/member')) {
    return { routePattern: '/member', routeFamily: 'member' };
  }
  if (normalized.startsWith('/designer')) {
    return { routePattern: '/designer', routeFamily: 'designer' };
  }

  return {
    routePattern: normalized,
    routeFamily: normalized === '/' ? 'home' : normalized.split('/')[1] ?? 'general',
  };
};

const suggestion = (
  id: string,
  labelJa: string,
  questionJa: string,
  audience: ChatSuggestionAudience,
  target: SuggestionTarget,
  grounding: ChatSuggestionGrounding,
): ServerChatSuggestion => ({
  id,
  labelJa,
  questionJa,
  audience,
  target,
  grounding,
});

const leadSuggestion = (
  id: string,
  labelJa: string,
  questionJa: string,
  audience: ChatSuggestionAudience,
  target: SuggestionTarget,
  grounding: ChatSuggestionGrounding,
  leadIntent: ChatSuggestionLeadIntent,
): ServerChatSuggestion => ({
  ...suggestion(id, labelJa, questionJa, audience, target, grounding),
  leadIntent,
});

const quoteFieldSuggestions: readonly ServerChatSuggestion[] = QUOTE_FIELD_HELP.map((item) => ({
  id: item.id,
  labelJa: item.labelJa,
  questionJa: `${item.labelJa}はどのように決めればよいですか？`,
  audience: 'public',
  target: { type: 'route', routePattern: '/quote-simulator', priority: 1 },
  quoteStep: item.step,
  fieldId: item.fieldId,
  grounding: { kind: 'quoteField', step: item.step, fieldId: item.fieldId },
}));

const STATIC_SUGGESTIONS: readonly ServerChatSuggestion[] = [
  suggestion(
    'public.home.selection',
    '製品選択',
    '包装材の種類はどう選べばよいですか？',
    'public',
    { type: 'route', routePattern: '/', priority: 0 },
    { kind: 'knowledge', ids: ['09-product-selection-guide'] },
  ),
  suggestion(
    'public.home.quote',
    '見積 flow',
    '見積もりはどのように進めればよいですか？',
    'public',
    { type: 'route', routePattern: '/', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  leadSuggestion(
    'public.home.consultation',
    '相談',
    '要件を整理して相談したいです。',
    'public',
    { type: 'route', routePattern: '/', priority: 1 },
    { kind: 'contact' },
    'human',
  ),
  suggestion(
    'public.quote-simulator.start',
    '見積準備',
    '見積もりに必要な項目を教えてください。',
    'public',
    { type: 'route', routePattern: '/quote-simulator', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  leadSuggestion(
    'public.quote-simulator.consultation',
    '見積相談',
    '見積条件を相談したいです。',
    'public',
    { type: 'route', routePattern: '/quote-simulator', priority: 1 },
    { kind: 'contact' },
    'quote',
  ),
  suggestion(
    'public.pricing.cost-factors',
    '価格条件',
    '価格はどのような条件で変わりますか？',
    'public',
    { type: 'route', routePattern: '/pricing', priority: 0 },
    { kind: 'knowledge', ids: ['12-pricing-tips'] },
  ),
  suggestion(
    'public.catalog.selection',
    '製品比較',
    '包装材の種類はどう選べばよいですか？',
    'public',
    { type: 'route', routePattern: '/catalog', priority: 0 },
    { kind: 'knowledge', ids: ['09-product-selection-guide'] },
  ),
  suggestion(
    'public.catalog-item.selection',
    '製品適性',
    'この用途に合う包装材はどう選べばよいですか？',
    'public',
    { type: 'route', routePattern: '/catalog/[slug]', priority: 0 },
    { kind: 'knowledge', ids: ['09-product-selection-guide'] },
  ),
  suggestion(
    'public.compare.selection',
    '比較ポイント',
    '包装材を比較するときの基準を教えてください。',
    'public',
    { type: 'route', routePattern: '/compare', priority: 0 },
    { kind: 'knowledge', ids: ['09-product-selection-guide'] },
  ),
  suggestion(
    'public.samples.flow',
    'サンプル',
    'サンプル依頼はどのように進めればよいですか？',
    'public',
    { type: 'route', routePattern: '/samples', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  leadSuggestion(
    'public.samples.consultation',
    'サンプル相談',
    'サンプル依頼について相談したいです。',
    'public',
    { type: 'route', routePattern: '/samples', priority: 1 },
    { kind: 'contact' },
    'sample',
  ),
  suggestion(
    'public.contact.staff',
    '担当者相談',
    '担当者に確認したいことはどう伝えればよいですか？',
    'public',
    { type: 'route', routePattern: '/contact', priority: 0 },
    { kind: 'contact' },
  ),
  leadSuggestion(
    'public.contact.consultation',
    '担当者相談',
    '担当者に要件を相談したいです。',
    'public',
    { type: 'route', routePattern: '/contact', priority: 1 },
    { kind: 'contact' },
    'human',
  ),
  suggestion(
    'public.inquiry.staff',
    '詳細相談',
    '詳細な相談内容はどのように整理すればよいですか？',
    'public',
    { type: 'route', routePattern: '/inquiry/detailed', priority: 0 },
    { kind: 'contact' },
  ),
  suggestion(
    'public.guide.data',
    '入稿データ',
    '入稿データの基本条件を教えてください。',
    'public',
    { type: 'family', routeFamily: 'guide', priority: 0 },
    { kind: 'knowledge', ids: ['10-printing-guide'] },
  ),
  suggestion(
    'public.data-templates.guide',
    'データテンプレート',
    'データテンプレートはどう使えばよいですか？',
    'public',
    { type: 'route', routePattern: '/data-templates', priority: 0 },
    { kind: 'knowledge', ids: ['10-printing-guide'] },
  ),
  suggestion(
    'public.industry.selection',
    '業種別選定',
    '業種に合わせた包装材はどう選べばよいですか？',
    'public',
    { type: 'family', routeFamily: 'industry', priority: 0 },
    { kind: 'knowledge', ids: ['09-product-selection-guide'] },
  ),
  suggestion(
    'public.cart.flow',
    '手続き',
    'この後の流れはどうなりますか？',
    'public',
    { type: 'route', routePattern: '/cart', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'public.auth.flow',
    '会員機能',
    '会員登録後はどのような機能を利用できますか？',
    'public',
    { type: 'family', routeFamily: 'auth', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'public.fallback.selection',
    '製品選択',
    '包装材の種類はどう選べばよいですか？',
    'public',
    { type: 'any', priority: 2 },
    { kind: 'knowledge', ids: ['09-product-selection-guide'] },
  ),
  suggestion(
    'public.fallback.quote',
    '見積 flow',
    '見積もりはどのように進めればよいですか？',
    'public',
    { type: 'any', priority: 2 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'public.fallback.contact',
    '担当者相談',
    '担当者に確認したいことはどう伝えればよいですか？',
    'public',
    { type: 'any', priority: 2 },
    { kind: 'contact' },
  ),
  suggestion(
    'member.dashboard.overview',
    'マイページ基本',
    '会員ページで確認できる基本機能を教えてください。',
    'member',
    { type: 'family', routeFamily: 'member', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'member.account.flow',
    'アカウント（内部案内）',
    'マイページでは何を確認できますか？',
    'member',
    { type: 'family', routeFamily: 'member', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'member.order.flow',
    '注文 flow',
    '注文後の流れはどう確認すればよいですか？',
    'member',
    { type: 'family', routeFamily: 'member', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'staff.workflow.escalation',
    '内部確認',
    '担当者確認が必要な業務フローはどう整理すればよいですか？',
    'staff',
    { type: 'family', routeFamily: 'admin', priority: 0 },
    { kind: 'knowledge', ids: ['11-user-flows'] },
  ),
  suggestion(
    'staff.quote-policy',
    '見積条件',
    '見積条件の確認ポイントを教えてください。',
    'staff',
    { type: 'family', routeFamily: 'admin', priority: 0 },
    { kind: 'knowledge', ids: ['12-pricing-tips'] },
  ),
  suggestion(
    'designer.data.submit',
    '入稿確認',
    '入稿データの確認ポイントを教えてください。',
    'designer',
    { type: 'family', routeFamily: 'designer', priority: 0 },
    { kind: 'knowledge', ids: ['10-printing-guide'] },
  ),
  suggestion(
    'designer.workflow.confirm',
    '作業確認',
    '制作データを確認するときの基本条件を教えてください。',
    'designer',
    { type: 'family', routeFamily: 'designer', priority: 0 },
    { kind: 'knowledge', ids: ['10-printing-guide'] },
  ),
];

export const CHAT_PAGE_SUGGESTIONS: readonly ServerChatSuggestion[] = [
  ...STATIC_SUGGESTIONS,
  ...quoteFieldSuggestions,
];

const audienceAllowed = (
  suggestionAudience: ChatSuggestionAudience,
  participantAudience: ChatSuggestionAudience,
): boolean =>
  suggestionAudience === 'public' || suggestionAudience === participantAudience;

const matchesTarget = (
  item: ServerChatSuggestion,
  route: { routePattern: string; routeFamily: string },
): boolean => {
  if (item.target.type === 'any') return true;
  if (item.target.type === 'route') return item.target.routePattern === route.routePattern;
  return item.target.routeFamily === route.routeFamily;
};

const targetPriority = (item: ServerChatSuggestion): number => {
  if (item.target.type === 'any') return item.target.priority;
  return item.target.priority;
};

export const resolveChatPageSuggestions = ({
  pathname,
  audience,
  quoteStep,
  fieldId,
}: ResolveChatPageSuggestionsInput): ChatPageSuggestionResolution => {
  const route = resolveRoute(pathname);
  const matchingSuggestions = CHAT_PAGE_SUGGESTIONS
    .filter((item) => audienceAllowed(item.audience, audience))
    .filter((item) => matchesTarget(item, route));
  const hasSpecificMatch = matchingSuggestions.some(
    (item) => item.target.type !== 'any',
  );
  const candidates = (
    hasSpecificMatch
      ? matchingSuggestions.filter((item) => item.target.type !== 'any')
      : matchingSuggestions
  )
    .filter((item) => !item.quoteStep || !quoteStep || item.quoteStep === quoteStep)
    .map((item) => {
      let priority = targetPriority(item);
      if (
        quoteStep &&
        fieldId &&
        item.quoteStep === quoteStep &&
        item.fieldId === fieldId
      ) {
        priority = -1;
      }
      return { item, priority };
    })
    .sort((left, right) => left.priority - right.priority)
    .map(({ item }) => item);

  return {
    routePattern: route.routePattern,
    routeFamily: route.routeFamily,
    suggestions: candidates.slice(0, 8),
  };
};

const suggestionById = new Map<string, ServerChatSuggestion>(
  CHAT_PAGE_SUGGESTIONS.map((item) => [item.id, item]),
);

export const getChatSuggestion = (
  id: string,
): ServerChatSuggestion | undefined => suggestionById.get(id);

export const validateChatSuggestionForContext = (
  id: string,
  context: ChatPageContext,
  audience: ChatSuggestionAudience,
): ChatSuggestionValidationFailure | undefined => {
  const item = suggestionById.get(id);
  if (!item) return { reason: 'unknown-suggestion' };
  if (!audienceAllowed(item.audience, audience)) {
    return { reason: 'audience-mismatch' };
  }

  const route = resolveRoute(context.pathname);
  if (!matchesTarget(item, route)) return { reason: 'route-mismatch' };
  if (item.quoteStep && context.quoteStep && item.quoteStep !== context.quoteStep) {
    return { reason: 'quote-step-mismatch' };
  }
  if (
    item.quoteStep &&
    context.quoteStep &&
    item.fieldId &&
    context.fieldId &&
    item.fieldId !== context.fieldId
  ) {
    return { reason: 'quote-field-mismatch' };
  }
  return undefined;
};

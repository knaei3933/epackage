/**
 * ChatWidget Component
 *
 * チャットボットウィジェットコンポーネント
 * Floating chat interface for LM Studio AI chatbot
 */

'use client';

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageCircle, X, Send, Minimize2, Loader2, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '@/lib/markdown-renderer';
import { parseChatPageContext, type ChatLocale, type ChatPageContext } from '@/lib/chat/page-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChatDrawer } from '@/contexts/ChatDrawerContext';
import { getPhoneNumberError, HANDOFF_TRIGGER_KEYWORDS } from '@/lib/validation';
import { validateChatMessages } from '@/lib/chat/chat-messages';
import { PUBLIC_CHAT_FALLBACK_SUGGESTIONS } from '@/lib/chat/public-chat-suggestions';
import type { ChatSuggestionView } from '@/lib/chat/chat-suggestion-types';
import type { ChatLeadSubmission } from '@/lib/chat/lead-schema';
import { ChatLeadForm } from '@/components/chat/ChatLeadForm';
import type { ChatLeadIntent } from '@/lib/chat/lead-schema';

// ============================================================
// Types
// ============================================================

type ConnectionStatus = 'checking' | 'online' | 'offline' | 'maintenance';

const HEALTH_POLL_INTERVAL_MS = 60000;
const CHAT_HISTORY_STORAGE_KEY = 'epackage-lab-chat-history-v1';
const VISIBLE_SUGGESTION_COUNT = 3;
const CHAT_FUNNEL_EVENT_TYPES = [
  'suggestions_shown',
  'suggestion_selected',
  'lead_form_shown',
  'contact_submitted',
  'contact_skipped',
  'answer_completed',
  'chat_closed',
  'handoff_requested',
] as const;

type ClientChatFunnelEventType = (typeof CHAT_FUNNEL_EVENT_TYPES)[number];

const loadChatHistory = (): UIMessage[] => {
  if (typeof window === 'undefined') return [];

  try {
    const serialized = window.sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!serialized) return [];

    const parsed = JSON.parse(serialized);
    const validated = validateChatMessages(parsed);
    if (validated.success) return validated.messages;
    window.sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    return [];
  } catch (error) {
    console.warn('Failed to restore chat history:', error);
    return [];
  }
};

const saveChatHistory = (messages: UIMessage[]) => {
  if (typeof window === 'undefined') return;

  try {
    if (messages.length === 0) {
      window.sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('Failed to persist chat history:', error);
  }
};

// ============================================================
// Component
// ============================================================

export function ChatWidget() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { isOpen, open: setIsOpenTrue, close: setIsOpenFalse, toggle: setIsOpenToggle } = useChatDrawer();
  const setIsOpen = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') { setIsOpenToggle(); } else { val ? setIsOpenTrue() : setIsOpenFalse(); }
  }, [setIsOpenTrue, setIsOpenFalse, setIsOpenToggle]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [renderedHtml, setRenderedHtml] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<readonly ChatSuggestionView[]>(
    PUBLIC_CHAT_FALLBACK_SUGGESTIONS,
  );
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
  const [legacyHandoffEnabled, setLegacyHandoffEnabled] = useState(false);
  const [leadConsentVersion, setLeadConsentVersion] = useState<number | null>(null);
  const [leadPrivacyPolicyVersion, setLeadPrivacyPolicyVersion] = useState<number | null>(null);
  const [memberLinkageAvailable, setMemberLinkageAvailable] = useState(false);
  const [leadCaptureIntent, setLeadCaptureIntent] = useState<ChatLeadIntent | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);
  const initialMessagesRef = useRef<UIMessage[]>(loadChatHistory());
  const selectedSuggestionRef = useRef<string | null>(null);
  const loadedSuggestionKeyRef = useRef('');
  const analyticsSessionIdRef = useRef<string | null>(null);
  const loadedCapabilityKeyRef = useRef('false:false:false');
  const previousStatusRef = useRef<typeof status | null>(null);
  // 有人切り替え関連の状態
  const [showHandoffButton, setShowHandoffButton] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [handoffSuccess, setHandoffSuccess] = useState(false);
  const languageRef = useRef<ChatLocale>(language === 'ja' ? 'ja' : 'ja');
  const focusedFieldIdRef = useRef<string | null>(null);

  // ページ文脈はリクエスト時にのみ DOM から解決し、入力値は一切読まない。
  const buildPageContext = useCallback((): ChatPageContext => {
    const quoteStep = document
      .querySelector('[data-quote-step]')
      ?.getAttribute('data-quote-step') ?? undefined;
    const fieldId = focusedFieldIdRef.current ?? undefined;
    const result = parseChatPageContext({
      pathname,
      locale: languageRef.current,
      quoteStep,
      fieldId,
    });

    return result.success
      ? result.context
      : { pathname: '/', locale: 'ja' };
  }, [language, pathname]);

  // useChat は初回 transport を保持するため、callback は ref 経由で常に最新文脈を読む。
  const buildPageContextRef = useRef(buildPageContext);
  buildPageContextRef.current = buildPageContext;
  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);
  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport<UIMessage>({
      api: '/api/chat',
      prepareSendMessagesRequest: (options) => ({
        body: {
          id: options.id,
          messages: options.messages,
          trigger: options.trigger,
          messageId: options.messageId,
          pageContext: buildPageContextRef.current(),
          suggestionId: selectedSuggestionRef.current ?? undefined,
        },
      }),
    });
  }

  // チャットフック（AI SDK v6 - DefaultChatTransport）
  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: 'epackage-lab-site-chat',
    messages: initialMessagesRef.current,
    transport: transportRef.current,
  });

  // App Router の画面遷移やウィジェット再マウントでも、同一タブ内の会話を保持する。
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // ステータスからローディング状態を判定
  const isLoading = status === 'submitted' || status === 'streaming';

  // メッセージ送信ハンドラー
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading) return;

    selectedSuggestionRef.current = null;
    sendMessage({ text: input });
    setInput('');
  };

  const submitLead = useCallback(async (
    intent: ChatLeadIntent,
    lead: Omit<ChatLeadSubmission, 'sessionId'>,
  ): Promise<boolean> => {
    const sessionId = analyticsSessionIdRef.current;
    if (!sessionId) return false;

    setLeadSubmitting(true);
    setLeadError('');
    try {
      const response = await fetch('/api/chat/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          sessionId,
          pageContext: buildPageContextRef.current(),
        }),
      });
      const accepted = response.ok;
      if (accepted) {
        setLeadSubmitted(true);
        setLeadCaptureIntent(null);
        void recordFunnelEvent('contact_submitted');
      } else {
        setLeadError('ただいま保存できませんでした。');
      }
      return accepted;
    } catch {
      setLeadError('ただいま保存できませんでした。');
      return false;
    } finally {
      setLeadSubmitting(false);
    }
  }, [recordFunnelEvent]);

  const handleSuggestionSelect = (suggestion: ChatSuggestionView) => {
    if (connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading) return;

    if (leadCaptureEnabled && suggestion.leadIntent) {
      setLeadCaptureIntent(suggestion.leadIntent);
      setLeadSubmitted(false);
      setLeadError('');
      void recordFunnelEvent('lead_form_shown');
      return;
    }

    selectedSuggestionRef.current = suggestion.id;
    void recordFunnelEvent('suggestion_selected', suggestion.id);
    sendMessage({ text: suggestion.questionJa });
  };

  const skipLeadForm = () => {
    void recordFunnelEvent('contact_skipped');
    setLeadCaptureIntent(null);
  };

  async function recordFunnelEvent(
    eventType: ClientChatFunnelEventType,
    suggestionId?: string,
  ) {
    const sessionId = analyticsSessionIdRef.current;
    if (!sessionId) return;

    try {
      const response = await fetch('/api/chat/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          events: [{ eventType, ...(suggestionId ? { suggestionId } : {}) }],
        }),
      });
      if (!response.ok) return;
    } catch {
      // Analytics is best-effort and must never interfere with chat help.
    }
  }

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;
    if (previousStatus === 'streaming' && status === 'ready') {
      void recordFunnelEvent('answer_completed');
    }
  }, [recordFunnelEvent, status]);

  useEffect(() => {
    focusedFieldIdRef.current = null;
    setFocusedFieldId(null);
  }, [pathname]);

  useEffect(() => {
    languageRef.current = language === 'ja' ? 'ja' : 'ja';
  }, [language]);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

    const field = target.closest('[data-chat-field]');
    const nextFieldId = field?.getAttribute('data-chat-field') ?? null;
    focusedFieldIdRef.current = nextFieldId;
    setFocusedFieldId(nextFieldId);
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const context = buildPageContext();
    const loadSuggestions = async () => {
      try {
        const response = await fetch('/api/chat/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...context,
          sessionId: analyticsSessionIdRef.current ?? undefined,
        }),
        });
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType?.includes('application/json')) {
          throw new Error('suggestions unavailable');
        }
        const payload: unknown = await response.json();
        if (
          typeof payload === 'object' &&
          payload !== null &&
          typeof (payload as { sessionId?: unknown }).sessionId === 'string'
        ) {
          analyticsSessionIdRef.current = (payload as { sessionId: string }).sessionId;
        }
        const nextLeadCaptureEnabled =
          typeof payload === 'object' &&
          payload !== null &&
          (payload as { leadCaptureEnabled?: unknown }).leadCaptureEnabled === true;
        const nextLegacyHandoffEnabled =
          typeof payload === 'object' &&
          payload !== null &&
          (payload as { legacyHandoffEnabled?: unknown }).legacyHandoffEnabled === true;
        const capability = payload as {
          consentVersion?: unknown;
          leadIntents?: unknown;
          memberLinkageAvailable?: unknown;
          privacyPolicyVersion?: unknown;
        };
        const validCapability = nextLeadCaptureEnabled &&
          Number.isSafeInteger(capability.consentVersion) &&
          Number.isSafeInteger(capability.privacyPolicyVersion) &&
          Array.isArray(capability.leadIntents);
        const nextLeadCaptureAccepted = validCapability;
        const nextConsentVersion = nextLeadCaptureAccepted
          ? capability.consentVersion as number
          : null;
        const nextPrivacyPolicyVersion = nextLeadCaptureAccepted
          ? capability.privacyPolicyVersion as number
          : null;
        const nextMemberLinkageAvailable = nextLeadCaptureAccepted &&
          capability.memberLinkageAvailable === true;
        const capabilityKey = `${nextLeadCaptureAccepted}:${nextLegacyHandoffEnabled}:${nextMemberLinkageAvailable}`;
        if (loadedCapabilityKeyRef.current !== capabilityKey) {
          loadedCapabilityKeyRef.current = capabilityKey;
          setLeadCaptureEnabled(nextLeadCaptureAccepted);
          setLegacyHandoffEnabled(nextLegacyHandoffEnabled);
          setLeadConsentVersion(nextConsentVersion);
          setLeadPrivacyPolicyVersion(nextPrivacyPolicyVersion);
          setMemberLinkageAvailable(nextMemberLinkageAvailable);
        }
        const rows = typeof payload === 'object' && payload !== null && Array.isArray(
          (payload as { suggestions?: unknown }).suggestions
        )
          ? (payload as { suggestions: unknown[] }).suggestions
          : [];
        const validSuggestions = rows.flatMap((row) => {
          if (
            typeof row !== 'object' ||
            row === null ||
            typeof (row as { id?: unknown }).id !== 'string' ||
            typeof (row as { labelJa?: unknown }).labelJa !== 'string' ||
            typeof (row as { questionJa?: unknown }).questionJa !== 'string'
          ) {
            return [];
          }
          return [{
            id: (row as { id: string }).id,
            labelJa: (row as { labelJa: string }).labelJa,
            questionJa: (row as { questionJa: string }).questionJa,
            audience: 'public' as const,
            leadIntent: typeof (row as { leadIntent?: unknown }).leadIntent === 'string'
              ? (row as { leadIntent: string }).leadIntent as ChatSuggestionView['leadIntent']
              : undefined,
          }];
        });
        if (!cancelled) {
          const nextSuggestions = validSuggestions.slice(0, 8).length > 0
            ? validSuggestions.slice(0, 8)
            : PUBLIC_CHAT_FALLBACK_SUGGESTIONS;
          const nextKey = nextSuggestions.map((suggestion) => suggestion.id).join('\n');
          if (loadedSuggestionKeyRef.current !== nextKey) {
            loadedSuggestionKeyRef.current = nextKey;
            setSuggestions(nextSuggestions);
            setShowAllSuggestions(false);
          }
          void recordFunnelEvent('suggestions_shown');
        }
      } catch {
        if (!cancelled) {
          if (loadedCapabilityKeyRef.current !== 'false:false:false') {
            loadedCapabilityKeyRef.current = 'false:false:false';
            setLeadCaptureEnabled(false);
            setLegacyHandoffEnabled(false);
            setLeadConsentVersion(null);
            setLeadPrivacyPolicyVersion(null);
            setMemberLinkageAvailable(false);
          }
          const nextKey = PUBLIC_CHAT_FALLBACK_SUGGESTIONS
            .map((suggestion) => suggestion.id)
            .join('\n');
          if (loadedSuggestionKeyRef.current !== nextKey) {
            loadedSuggestionKeyRef.current = nextKey;
            setSuggestions(PUBLIC_CHAT_FALLBACK_SUGGESTIONS);
            setShowAllSuggestions(false);
          }
        }
      }
    };

    void loadSuggestions();
    return () => {
      cancelled = true;
    };
  }, [isOpen, focusedFieldId, buildPageContext, recordFunnelEvent]);

  useEffect(() => {
    if (error) {
      setConnectionStatus('offline');
    }
  }, [error]);

  // 自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // メンテナンスチェック（ウィジェットが開いている間のみ60秒ごとにポーリング）
  useEffect(() => {
    if (!isOpen) return;

    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/config');

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return false; // Not JSON, assume not in maintenance mode
        }

        const data = await response.json();
        if (data.success && data.data?.maintenance_mode?.enabled) {
          setConnectionStatus('maintenance');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Maintenance check failed:', error);
        return false;
      }
    };

    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          setConnectionStatus('offline');
          return;
        }

        const data = await response.json();
        setConnectionStatus(data.status === 'ok' ? 'online' : 'offline');
      } catch (error) {
        console.error('Health check failed:', error);
        setConnectionStatus('offline');
      }
    };

    // 初回チェック後、同一チェーンで60秒ごとに確認する（重複リクエストを防ぐ）。
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let polling = false;

    const scheduleNext = () => {
      if (!cancelled) {
        timeoutId = setTimeout(() => {
          void poll();
        }, HEALTH_POLL_INTERVAL_MS);
      }
    };

    const poll = async () => {
      if (polling || cancelled) return;
      polling = true;

      try {
        const isMaintenance = await checkMaintenance();
        if (isMaintenance) {
          return;
        }
        await checkHealth();
      } finally {
        polling = false;
        scheduleNext();
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen]);

  // メッセージが更新されたらHTMLを生成
  useEffect(() => {
    const generateHtml = async () => {
      const htmlMap: Record<string, string> = {};

      for (const message of messages) {
        if (message.role === 'assistant') {
          const content = getMessageContent(message);
          htmlMap[message.id] = await markdownToHtml(content);
        }
      }

      setRenderedHtml(htmlMap);
    };

    generateHtml();
  }, [messages]);

  // 有人切り替えボタン表示ロジック
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const content = getMessageContent(lastMessage);
      const shouldShow = HANDOFF_TRIGGER_KEYWORDS.some(kw => content.includes(kw));
      setShowHandoffButton(shouldShow);
    }
  }, [messages]);

  // 有人切り替え送信ハンドラー
  const handleHandoffSubmit = async () => {
    setPhoneError('');

    // 共通関数を使用
    const error = getPhoneNumberError(phoneNumber);
    if (error) {
      setPhoneError(error);
      return;
    }

    try {
      const response = await fetch('/api/chat/human-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        void recordFunnelEvent('handoff_requested');
        setHandoffSuccess(true);
        setShowPhoneInput(false);
      } else {
        setPhoneError(data.error || 'エラーが発生しました');
      }
    } catch {
      setPhoneError('エラーが発生しました。しばらく待ってから再試行してください。');
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setRenderedHtml({});
    setShowHandoffButton(false);
    setShowPhoneInput(false);
    setHandoffSuccess(false);
  };

  const handleClose = () => {
    void recordFunnelEvent('chat_closed');
    setIsOpen(false);
  };

  // 接続ステータスの色
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // 接続ステータスのテキスト
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online':
        return 'オンライン';
      case 'offline':
        return 'オフライン';
      case 'maintenance':
        return 'メンテナンス中';
      default:
        return '確認中...';
    }
  };

  // メッセージの内容を取得（parts 配列からテキストを抽出）
  const getMessageContent = (message: { role: string; parts?: Array<{ type: string; text?: string }> }) => {
    // AI SDK v6: parts 配列からテキストを抽出
    if (message.parts && Array.isArray(message.parts)) {
      return message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join('');
    }
    return '';
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
      {/* フローティングボタン（閉じている時） */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brixa text-white rounded-full shadow-lg hover:bg-brixa-600 hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="チャットを開く"
        >
          <MessageCircle className="w-6 h-6" />
          <span
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-white`}
            aria-label={getStatusText()}
          />
        </button>
      )}

      {/* チャットドロアパネル */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
            lg:top-16 lg:bottom-0 lg:right-0 lg:w-[400px] lg:rounded-none lg:border-l
            max-lg:inset-0 max-lg:border-l-0
            ${isMinimized ? 'lg:h-14' : ''}`}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-brixa text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">カスタマーサポート</span>
              {/* 接続ステータス */}
              <div className="flex items-center gap-1 ml-2">
                <span
                  className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                  aria-label={getStatusText()}
                />
                <span className="text-xs opacity-80" data-testid="connection-status">{getStatusText()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="会話を削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label={isMinimized ? '展開' : '最小化'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* チャットエリア（最小化時は非表示） */}
          {!isMinimized && (
            <>
              {/* メッセージリスト */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ウェルカムメッセージ */}
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>こんにちは！Epackage Labです。</p>
                    <p className="text-sm mt-2">
                      包装材料や製品についてのお問い合わせをご相談ください。
                    </p>
                  </div>
                )}

                {/* メッセージ */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      data-testid={
                        message.role === 'assistant'
                          ? 'assistant-message'
                          : undefined
                      }
                      className={`max-w-[85%] px-4 py-3 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-brixa text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div
                          className="prose prose-sm max-w-none text-[15px]"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(renderedHtml[message.id] || '', {
                              ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'span'],
                              ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                            })
                          }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{getMessageContent(message)}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* ローディング */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brixa" />
                      <span className="text-sm text-gray-600">入力中...</span>
                    </div>
                  </div>
                )}

                {/* エラー表示 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    <p>{error.message || 'エラーが発生しました'}</p>
                  </div>
                )}

                {/* オフライン時のメッセージ */}
                {connectionStatus === 'offline' && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm">
                    <p>
                      現在チャットサービスは利用できません。お急ぎの場合は、
                      <a href="/contact" className="text-brixa hover:underline">お問い合わせフォーム</a>
                      または
                      <a href="tel:050-1793-6500" className="text-brixa hover:underline">お電話（050-1793-6500）</a>
                      でご連絡ください。
                    </p>
                  </div>
                )}

                {/* メンテナンス時のメッセージ */}
                {connectionStatus === 'maintenance' && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
                    <p className="font-medium mb-3">
                      現在メンテナンス中です。復旧までしばらくお待ちください。
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href="/contact"
                        className="text-brixa hover:underline inline-flex items-center gap-1"
                      >
                        お問い合わせフォームはこちら
                      </a>
                      <a
                        href="/products"
                        className="text-brixa hover:underline inline-flex items-center gap-1"
                      >
                        製品ページはこちら
                      </a>
                    </div>
                  </div>
                )}

                {/* 有人切り替えボタン */}
                {showHandoffButton && legacyHandoffEnabled && !handoffSuccess && !showPhoneInput && (
                  <div className="flex justify-start">
                    <button
                      onClick={() => setShowPhoneInput(true)}
                      className="px-4 py-2 bg-brixa text-white rounded-lg hover:bg-brixa-600 transition-colors"
                    >
                      担当者に相談する
                    </button>
                  </div>
                )}

                {/* 同意つきリードフォーム（サーバー機能が有効な場合のみ） */}
                {leadCaptureEnabled && leadCaptureIntent && !leadSubmitted && !showPhoneInput && (
                  <ChatLeadForm
                    intent={leadCaptureIntent}
                    disabled={leadSubmitting || connectionStatus !== 'online'}
                    consentVersion={leadConsentVersion}
                    privacyPolicyVersion={leadPrivacyPolicyVersion}
                    memberLinkageAvailable={memberLinkageAvailable}
                    onSubmit={async (lead) => await submitLead(leadCaptureIntent, lead)}
                    onSkip={() => {
                      void recordFunnelEvent('contact_skipped');
                      setLeadCaptureIntent(null);
                    }}
                  />
                )}

                {leadError && (
                  <div className="mx-4 mb-3 text-sm text-red-600">{leadError}</div>
                )}

                {leadSubmitted && (
                  <div className="mx-4 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    承知いたしました。担当者より確認いたします。
                  </div>
                )}

                {/* 電話番号入力フォーム */}
                {showPhoneInput && !handoffSuccess && (
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">電話番号をご入力ください（例: 050-1793-6500）</p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="050-1793-6500"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa"
                      />
                      <button
                        onClick={handleHandoffSubmit}
                        className="px-4 py-2 bg-brixa text-white rounded-lg hover:bg-brixa-600"
                      >
                        送信
                      </button>
                      <button
                        onClick={() => {
                          setShowPhoneInput(false);
                          setPhoneNumber('');
                          setPhoneError('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        キャンセル
                      </button>
                    </div>
                    {phoneError && (
                      <p className="text-red-600 text-sm mt-2">{phoneError}</p>
                    )}
                  </div>
                )}

                {/* 送信成功メッセージ */}
                {handoffSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
                    承知いたしました。担当者より折り返しご連絡いたします。
                  </div>
                )}

                {/* 有人切り替え完了後の終了ボタン */}
                {handoffSuccess && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ページ別の質問提案。自由入力は常に併用する。 */}
              <div
                data-lead-capture-enabled={leadCaptureEnabled}
                className="px-4 pt-3 border-t border-gray-200 bg-gray-50"
              >
                <p className="text-sm text-gray-500 mb-2">
                  このページのよくある質問（自由に入力しても構いません）
                </p>
                <div className="flex flex-wrap gap-2">
                  {(showAllSuggestions
                    ? suggestions
                    : suggestions.slice(0, VISIBLE_SUGGESTION_COUNT)
                  ).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      disabled={connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-brixa hover:bg-brixa/5 hover:text-brixa disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {suggestion.questionJa}
                    </button>
                  ))}
                  {suggestions.length > VISIBLE_SUGGESTION_COUNT && (
                    <button
                      type="button"
                      onClick={() => setShowAllSuggestions((current) => !current)}
                      className="px-3 py-1.5 text-sm rounded-full text-brixa hover:underline"
                    >
                      {showAllSuggestions ? '閉じる' : `他${suggestions.length - VISIBLE_SUGGESTION_COUNT}件`}
                    </button>
                  )}
                </div>
              </div>

              {/* 入力エリア */}
              <form
                data-testid="chat-form"
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    data-testid="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="メッセージを入力..."
                    disabled={connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading}
                    className="px-4 py-2 bg-brixa text-white rounded-lg hover:bg-brixa-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="送信"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

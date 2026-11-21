/**
 * ChatWidget Component
 *
 * チャットボットウィジェットコンポーネント
 * Floating chat interface for LM Studio AI chatbot
 */

'use client';

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import type React from 'react';
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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
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

  // 開いたら中へ、閉じたらボタンへフォーカスを移す
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const input = inputRef.current;
      (input && !input.disabled ? input : panelRef.current)?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      openButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handleClose();
    }
  };

  // 接続ステータスの色
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online':
        return 'bg-success';
      case 'offline':
        return 'bg-error';
      case 'maintenance':
        return 'bg-warning';
      default:
        return 'bg-warning';
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
        return '接続中...';
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
          ref={openButtonRef}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(1.5rem+var(--cookie-banner-h,0px))] right-6 z-50 w-14 h-14 bg-brand text-on-brand rounded-full shadow-med hover:bg-brand-hover transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label="チャットを開く"
        >
          <MessageCircle className="w-6 h-6" />
          <span
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-bg-primary`}
            aria-hidden="true"
          />
        </button>
      )}

      {/* チャットドロアパネル */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="カスタマーサポートのチャット"
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          className={`fixed z-50 focus:outline-none bg-bg-primary shadow-high border-l border-border-medium flex flex-col transition-transform duration-300 ease-in-out
            lg:top-16 lg:bottom-0 lg:right-0 lg:w-[400px] lg:rounded-none lg:border-l
            max-lg:inset-0 max-lg:border-l-0
            ${isMinimized ? 'lg:h-14' : ''}`}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-medium bg-brand text-on-brand">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">カスタマーサポート</span>
              {/* 接続ステータス */}
              <div className="flex items-center gap-1 ml-2">
                <span
                  className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                  aria-hidden="true"
                />
                <span className="text-xs" data-testid="connection-status">{getStatusText()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  className="p-1 hover:bg-brand-hover rounded transition-colors"
                  aria-label="会話を削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-brand-hover rounded transition-colors"
                aria-label={isMinimized ? '展開' : '最小化'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-brand-hover rounded transition-colors"
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
                  <div className="text-center text-text-muted py-8">
                    <p>こんにちは！Epackage Labです。</p>
                    <p className="text-sm mt-1">この窓口は、AIによる自動応答です。</p>
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
                      className={`max-w-[85%] px-4 py-3 rounded-container ${
                        message.role === 'user'
                          ? 'bg-brand text-on-brand'
                          : 'bg-bg-secondary text-text-primary'
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
                    <div className="bg-bg-secondary px-4 py-2 rounded-container flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span className="text-sm text-text-secondary">入力中...</span>
                    </div>
                  </div>
                )}

                {/* エラー表示 */}
                {error && (
                  <div className="bg-error-muted border border-border-medium text-on-error-muted px-4 py-2 rounded-container text-sm">
                    <p>{error.message || 'エラーが発生しました'}</p>
                  </div>
                )}

                {/* オフライン時のメッセージ */}
                {connectionStatus === 'offline' && (
                  <div className="bg-warning-muted border border-border-medium text-on-warning-muted px-4 py-2 rounded-container text-sm">
                    <p>
                      現在チャットサービスは利用できません。お急ぎの場合は、
                      <a href="/contact" className="text-brand hover:underline">お問い合わせフォーム</a>
                      または
                      <a href="tel:050-3613-9673" className="text-brand hover:underline">お電話（050-3613-9673）</a>
                      でご連絡ください。
                    </p>
                  </div>
                )}

                {/* メンテナンス時のメッセージ */}
                {connectionStatus === 'maintenance' && (
                  <div className="bg-warning-muted border border-border-medium text-on-warning-muted px-4 py-3 rounded-container text-sm">
                    <p className="font-medium mb-3">
                      現在メンテナンス中です。復旧までしばらくお待ちください。
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href="/contact"
                        className="text-brand hover:underline inline-flex items-center gap-1"
                      >
                        お問い合わせフォームはこちら
                      </a>
                      <a
                        href="/products"
                        className="text-brand hover:underline inline-flex items-center gap-1"
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
                      className="px-4 py-2 bg-brand text-on-brand rounded-md hover:bg-brand-hover transition-colors"
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
                  <div className="mx-4 mb-3 text-sm text-error">{leadError}</div>
                )}

                {leadSubmitted && (
                  <div className="mx-4 mb-3 p-3 bg-success-muted border border-border-medium rounded-container text-sm text-on-success-muted">
                    承知いたしました。担当者より確認いたします。
                  </div>
                )}

                {/* 電話番号入力フォーム */}
                {showPhoneInput && !handoffSuccess && (
                  <div className="bg-bg-secondary px-4 py-3 rounded-container">
                    <p className="text-sm text-text-secondary mb-2">電話番号をご入力ください（例: 050-3613-9673）</p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="050-3613-9673"
                        className="flex-1 px-3 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <button
                        onClick={handleHandoffSubmit}
                        className="px-4 py-2 bg-brand text-on-brand rounded-md hover:bg-brand-hover"
                      >
                        送信
                      </button>
                      <button
                        onClick={() => {
                          setShowPhoneInput(false);
                          setPhoneNumber('');
                          setPhoneError('');
                        }}
                        className="px-4 py-2 border border-border-strong bg-bg-primary text-text-primary rounded-md hover:bg-bg-secondary"
                      >
                        キャンセル
                      </button>
                    </div>
                    {phoneError && (
                      <p className="text-error text-sm mt-2">{phoneError}</p>
                    )}
                  </div>
                )}

                {/* 送信成功メッセージ */}
                {handoffSuccess && (
                  <div className="bg-success-muted border border-border-medium text-on-success-muted px-4 py-2 rounded-container text-sm">
                    承知いたしました。担当者より折り返しご連絡いたします。
                  </div>
                )}

                {/* 有人切り替え完了後の終了ボタン */}
                {handoffSuccess && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 border border-border-strong bg-bg-primary text-text-primary rounded-md hover:bg-bg-secondary transition-colors"
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
                className="px-4 pt-3 border-t border-border-medium bg-bg-secondary"
              >
                <p className="text-sm text-text-muted mb-2">
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
                      className="w-full text-left px-3 py-2.5 text-sm rounded-md border border-border-medium bg-bg-primary text-text-secondary hover:border-brand hover:bg-brand-subtle hover:text-brand disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {suggestion.questionJa}
                    </button>
                  ))}
                  {suggestions.length > VISIBLE_SUGGESTION_COUNT && (
                    <button
                      type="button"
                      onClick={() => setShowAllSuggestions((current) => !current)}
                      className="px-3 py-1.5 text-sm rounded-md text-brand hover:underline"
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
                className="p-4 border-t border-border-medium bg-bg-secondary"
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    data-testid="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="メッセージを入力..."
                    disabled={connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading}
                    className="flex-1 px-4 py-2 border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading}
                    className="px-4 py-2 bg-brand text-on-brand rounded-md hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

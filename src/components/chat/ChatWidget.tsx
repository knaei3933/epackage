/**
 * ChatWidget Component
 *
 * チャットボットウィジェットコンポーネント
 * Floating chat interface for LM Studio AI chatbot
 */

'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import { markdownToHtml } from '@/lib/markdown-renderer';
import { getPhoneNumberError, HANDOFF_TRIGGER_KEYWORDS } from '@/lib/validation';

// ============================================================
// Types
// ============================================================

type ConnectionStatus = 'checking' | 'online' | 'offline' | 'maintenance';

// ============================================================
// Component
// ============================================================

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [renderedHtml, setRenderedHtml] = useState<Record<string, string>>({});
  // 有人切り替え関連の状態
  const [showHandoffButton, setShowHandoffButton] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [handoffSuccess, setHandoffSuccess] = useState(false);

  // チャットフック（AI SDK v6 - DefaultChatTransport）
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  // ステータスからローディング状態を判定
  const isLoading = status === 'submitted' || status === 'streaming';

  // メッセージ送信ハンドラー
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || connectionStatus === 'offline' || connectionStatus === 'maintenance' || isLoading) return;

    sendMessage({ text: input });
    setInput('');
  };

  // 自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // メンテナンスチェック（30秒ごとにポーリング）
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/config');
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
        const data = await response.json();
        setConnectionStatus(data.status === 'ok' ? 'online' : 'offline');
      } catch (error) {
        console.error('Health check failed:', error);
        setConnectionStatus('offline');
      }
    };

    // 初回チェック
    const initializeStatus = async () => {
      const isMaintenance = await checkMaintenance();
      if (!isMaintenance) {
        await checkHealth();
      }
    };

    initializeStatus();

    // 30秒ごとにメンテナンス状態をチェック
    const intervalId = setInterval(async () => {
      const isMaintenance = await checkMaintenance();
      if (isMaintenance) {
        setConnectionStatus('maintenance');
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

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
        setHandoffSuccess(true);
        setShowPhoneInput(false);
      } else {
        setPhoneError(data.error || 'エラーが発生しました');
      }
    } catch (error) {
      setPhoneError('エラーが発生しました。しばらく待ってから再試行してください。');
    }
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
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-brixa text-white rounded-full shadow-lg hover:bg-brixa-600 transition-all flex items-center justify-center group"
          aria-label="チャットを開く"
        >
          <MessageCircle className="w-6 h-6" />
          {/* 接続ステータスインジケーター */}
          <span
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-white`}
            aria-label={getStatusText()}
          />
        </button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-2rem)] max-w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all ${
            isMinimized ? 'h-14' : 'h-[500px]'
          }`}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-brixa text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">カスタマーサポート</span>
              {/* 接続ステータス */}
              <div className="flex items-center gap-1 ml-2">
                <span
                  className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                  aria-label={getStatusText()}
                />
                <span className="text-xs opacity-80">{getStatusText()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label={isMinimized ? '展開' : '最小化'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
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
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-brixa text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderedHtml[message.id] || '' }}
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
                      現在チャットサービスは利用できません。しばらく待ってから再試行してください。
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
                {showHandoffButton && !handoffSuccess && !showPhoneInput && (
                  <div className="flex justify-start">
                    <button
                      onClick={() => setShowPhoneInput(true)}
                      className="px-4 py-2 bg-brixa text-white rounded-lg hover:bg-brixa-600 transition-colors"
                    >
                      担当者に相談する
                    </button>
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
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
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

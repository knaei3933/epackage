/**
 * Chat API Route for LM Studio
 *
 * LM Studio用チャットAPIルート
 * Handles chat completions using local LM Studio via Cloudflare Tunnel
 */

import { streamText, type UIMessage, type CoreMessage } from 'ai';
import { getChatModelWithFailover, getSystemPrompt } from '@/lib/ai/providers';
import { getRelevantKnowledge } from '@/lib/ai/knowledge-base';
import { loggers } from '@/lib/logger';

const logger = loggers.api('/api/chat');

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * UIMessageを標準的なメッセージ形式に変換
 * Convert UIMessage to standard message format for OpenAI-compatible APIs
 */
function convertToStandardMessages(messages: UIMessage[]): Array<{ role: string; content: string }> {
  return messages.map((message) => {
    let content = '';
    if (message.parts && Array.isArray(message.parts)) {
      content = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join('');
    }
    return { role: message.role, content };
  });
}

/**
 * エラーメッセージ取得（環境対応）
 * Get environment-aware error message
 */
function getErrorMessage(error: unknown, isLocal: boolean): string {
  if (error instanceof Error) {
    // 接続エラー
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      if (isLocal) {
        return 'AIサーバーに接続できません。LM Studioが起動しているか確認してください。';
      }
      return 'AIサービスに接続できません。しばらく待ってから再試行してください。';
    }

    // タイムアウト
    if (error.message.includes('timeout') || error.message.includes('ABORT_ERR')) {
      return 'リクエストがタイムアウトしました。もう一度お試しください。';
    }
  }

  // 汎用エラー
  return 'エラーが発生しました。しばらく待ってから再試行してください。';
}

/**
 * POST /api/chat
 * チャットメッセージを処理
 */
export async function POST(req: Request) {
  // エラーハンドリング用にスコープ外で宣言
  let isLocal = false;

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // メッセージバリデーション
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'メッセージが必要です' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // チャットモデル設定を取得（フェイルオーバー対応）
    const modelConfig = await getChatModelWithFailover({
      sessionId: crypto.randomUUID(),
      logFailover: true
    });
    isLocal = !modelConfig.isFailover && modelConfig.baseURL.includes('localhost');

    // ユーザーの最新メッセージからナレッジベースを取得
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage?.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text || '')
      .join('') || '';

    const relevantKnowledge = getRelevantKnowledge(userQuery);

    // システムプロンプト取得（フェイルオーバー時は短縮版）
    const systemPrompt = getSystemPrompt(modelConfig.isFailover);

    // ナレッジベースをシステムプロンプトに追加（フェイルオーバー時は追加しない）
    const finalSystemPrompt = relevantKnowledge && !modelConfig.isFailover
      ? `${systemPrompt}\n\n${relevantKnowledge}`
      : systemPrompt;

    // 標準的なメッセージ形式に変換
    const standardMessages = convertToStandardMessages(messages);

    // システムプロンプトを先頭に追加
    const allMessages: CoreMessage[] = [
      { role: 'system', content: finalSystemPrompt },
      ...standardMessages,
    ];

    // ストリーミングレスポンス生成（型安全なCoreMessage[]を使用）
    const result = streamText({
      model: modelConfig.provider(modelConfig.modelId),
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 800,
      stop: [],
    });

    // UIメッセージストリームレスポンスを返す（AI SDK v6）
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId: () => crypto.randomUUID(),
    });

  } catch (error) {
    logger.error('Chat API error', { error });
    const errorMessage = getErrorMessage(error, isLocal);

    // エラーレスポンス
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

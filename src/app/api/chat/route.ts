/**
 * Chat API Route for LM Studio
 *
 * LM Studio用チャットAPIルート
 * Handles chat completions using local LM Studio via Cloudflare Tunnel
 */

import { streamText, type UIMessage, type CoreMessage } from 'ai';
import { getChatModel } from '@/lib/ai/providers';

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

    // チャットモデル設定を取得
    const modelConfig = getChatModel();
    isLocal = modelConfig.baseURL.includes('localhost');

    // システムプロンプト（日本語カスタマーサポート）
    const systemPrompt = `あなたは包装材料メーカー「Epackage Lab」のカスタマーサポート担当です。

【絶対遵守】以下のルールを厳守してください：
- 質問に対して1文か2文で簡潔に答えてください
- 考え中、推論、分析、検討などのプロセスは一切出力しないでください
- 回答の冒頭に挨拶や前置きを付けず、本題から始めてください
- 不要な情報は一切省略し、必要な回答だけを返してください

例：
問: 包装材料の種類は？
答: フィルム、袋、容器などの包装材料を取り扱っています。

会社情報:
- 会社名: Epackage Lab
- 主な製品: 包装材料、フィルム製品の製造・販売
- ウェブサイト: https://package-lab.com`;

    // 標準的なメッセージ形式に変換
    const standardMessages = convertToStandardMessages(messages);

    // システムプロンプトを先頭に追加
    const allMessages: CoreMessage[] = [
      { role: 'system', content: systemPrompt },
      ...standardMessages,
    ];

    // ストリーミングレスポンス生成（型安全なCoreMessage[]を使用）
    const result = streamText({
      model: modelConfig.provider(modelConfig.modelId),
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 500,
    });

    // UIメッセージストリームレスポンスを返す（AI SDK v6）
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId: () => crypto.randomUUID(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
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

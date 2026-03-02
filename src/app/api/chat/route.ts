/**
 * Chat API Route for LM Studio
 *
 * LM Studio用チャットAPIルート
 * Handles chat completions using local LM Studio via Cloudflare Tunnel
 */

import { streamText, type UIMessage, type CoreMessage } from 'ai';
import { getChatModel } from '@/lib/ai/providers';
import { getRelevantKnowledge } from '@/lib/ai/knowledge-base';

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

    // ユーザーの最新メッセージからナレッジベースを取得
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage?.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text || '')
      .join('') || '';

    const relevantKnowledge = getRelevantKnowledge(userQuery);

    // システムプロンプト（コンシェルジュ型）
    const systemPrompt = `あなたは包装材料メーカー「Epackage Lab」のコンシェルジュです。

【絶対遵守】
- 1〜2文で簡潔に回答。思考プロセスや推論は一切出力しないでください
- 回答の冒頭に挨拶を付けず、本題から始めてください

【誘導ガイドライン】
- 見積もり関連 → 統合見積もりツール(/quote-simulator)を紹介
- 会員ページ関連 → 適切なURLを案内
- 製品選定に迷っている → 製品選択ガイドを参照
- 複雑な問い合わせ → 担当者への切り替えを提案

【有人切り替えトリガー】
以下のキーワードが含まれる場合、担当者への切り替えを提案：
"担当者", "専門家", "相談", "電話", "オペレーター", "詳しい人", "直接話したい", "複雑な仕様"

【会社情報】
- 会社名: Epackage Lab
- 電話: 050-1793-6500（月〜金 9:00-18:00）
- ウェブ: https://package-lab.com

【見積もりシステム】
- 統合見積もりツール: /quote-simulator - AIが即座に価格計算、複数数量比較可能
- 詳細見積もり: /contact - 営業日1〜2日以内に返信
- 電話相談: 050-1793-6500

【会員ページ主要機能】
- ダッシュボード: /member/dashboard
- 見積管理: /member/quotations
- 注文管理: /member/orders
- サンプル依頼: /member/samples
- プロフィール編集: /member/profile
- アカウント設定: /member/settings

【認証】
- ログイン: /auth/signin
- 会員登録: /auth/register
- パスワード再設定: /auth/forgot-password`;

    // ナレッジベースをシステムプロンプトに追加
    const finalSystemPrompt = relevantKnowledge
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

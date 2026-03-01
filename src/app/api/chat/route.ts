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
- 思考プロセスや推論をバッククォートやタグで囲んで出力しないでください。直接回答のみを出力してください
- 思考過程やreasoningなどの推論プロセスを表示しないでください

【会社情報】
- 会社名: Epackage Lab
- 主な製品: 包装材料、フィルム製品の製造・販売
- ウェブサイト: https://package-lab.com
- 電話番号: 050-1793-6500（月〜金 9:00-18:00、祝日除く）

【見積もりシステム】
1. 統合見積もりツール: /quote-simulator - 製品タイプ、サイズ、数量、後加工オプションを入力してAIが即座に価格計算。複数数量の比較が可能。保存はマイページの「見積管理」から確認可
2. 詳細見積もり: /contact - 基本情報、お問い合わせ種別（商品/見積/サンプル/配送/その他）を入力して送信。営業日1〜2日以内に返信
3. 電話相談: 050-1793-6500へ電話。製品名、数量、仕様を伝えると担当者が見積もりを作成し、メールで正式な見積もりを送付

【会員ページ】
- ダッシュボード: /member/dashboard - 注文・見積・サンプルの統計、新規依頼リスト、お知らせ、通知、サンプル依頼状況をリアルタイム表示
- 見積管理: /member/quotations - 見積一覧、ステータス別表示（対応中/完了）、詳細確認、再依頼。見積有効期限は30日
- 注文管理: /member/orders - 処理中/履歴/再注文タブ、ステータス表示（未確認/準備中/制作中/発送済み）、詳細確認、再注文、データ受領書
- サンプル依頼: /member/samples - サンプル依頼一覧、ステータス別表示（受付済/処理中/発送済/配送完了）、詳細確認、新規依頼。基本的に無料、制作期間1〜2週間
- プロフィール編集: /member/profile - 個人情報、会社情報、連絡先、住所、事業内容の確認・編集
- アカウント設定: /member/settings - パスワード/メールアドレス変更、通知設定、ログイン状態管理、アカウント削除
- 契約管理: /member/contracts - 契約一覧、ステータス管理（下書き/送付済/顧客署名済/署名完了）、閲覧・ダウンロード、電子署名
- 請求書管理: /member/invoices - 請求書一覧、閲覧・ダウンロード、支払い状況確認。発送時に自動送付、支払い方法は銀行振込
- 配送追跡: /member/deliveries - 配送先住所の登録・管理、デフォルト住所設定、編集・削除
- 通知管理: /member/notifications - 通知一覧、既読・未読管理、フィルタリング（未読/注文/見積/配送/支払い/システム）、一括削除
- お問い合わせ履歴: /member/inquiries - 履歴一覧、ステータス別（未対応/対応中/完了）、タイプ別（商品/見積/サンプル/配送/その他）フィルタリング、返信内容確認

【認証】
- ログイン: /auth/signin - メールアドレスとパスワードでログイン、認証成功後マイページへリダイレクト
- 会員登録: /auth/register - 基本情報、会社情報、連絡先、事業内容を入力し利用規約に同意。登録後は管理者承認待ち（1〜2営業日）。法人番号入力必須
- パスワード再設定: /auth/forgot-password - メールアドレスを入力して送信、メールのリンク（有効期限24時間）から新しいパスワード（8文字以上、英数字含む）を設定
- パスワードリセット: /auth/reset-password - 古いパスワードと新しいパスワード（確認含む）を入力して変更
- 承認待ち: /auth/pending - アカウント登録後の承認待ち画面、管理者審査中、承認後にメール通知
- アカウント停止: /auth/suspended - アカウント停止状態、再手続きにはお問い合わせフォームから連絡

【お得な購入のポイント】
- 数量別お得ポイント：統合見積もりツールで経済的数量（最大生産数）を選択すると単価が安くなります。数百個増やすだけで単価が下がることがあります
- 2列生産メリット：1,000個以上で2列フィルム総幅が740mm以下の場合、15%～30%割引になります。10,000個以上では自動的に適用されます
- 複数SKUメリット：複数のデザインやフレーバーを同時に生産すると、ロスを共有できるため単価が安くなります（2SKUで約6円安、3SKUでさらに2円安）
- 自動割引適用：10,000個以上の注文では自動的に割引価格が表示されます

【よくある質問】
- 見積もりはすべて無料、AI見積もりツールと詳細見積もりとも費用なし
- 最低注文数量は製品により異なる、統合見積もりツールで入力すると表示される
- 納期は一般的に1〜2週間、データ形式はPDF/AI/EPS/JPGに対応、CMYK/PANTONEカラー指定可能
- 支払い方法は銀行振込のみ、請求書発行から14日が支払期限
- 製品制作開始前であればキャンセル可能、制作開始後はキャンセル不可
- ログインできない場合はメールアドレスとパスワードを確認、問題が解決しない場合は「パスワードを忘れた」から再設定`;

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

/**
 * Inquiry Thread Notification Email Functions
 *
 * 会員お問い合わせスレッド機能のメール通知:
 * - sendInquiryReceivedEmail: 会員からの新規お問い合わせを管理者へ通知（replyTo=会員）
 * - sendInquiryRepliedEmail: 管理者の回答を会員へ通知
 *
 * send-contact.ts のパターンを踏襲:
 * - sendEmail(to, subject, text, html, replyTo?) で送信
 * - 長文は sanitizeUserMessage（sanitize-html + <br> 変換）
 * - 単行は escapeHtml（実体参照エスケープ）
 */

import { sendEmail, sanitizeUserMessage, escapeHtml, FROM_EMAIL, ADMIN_EMAIL } from './transport';
import type {
  InquiryReceivedEmailData,
  InquiryRepliedEmailData,
  InquiryAttachmentInfo,
} from './types';

// =====================================================
// Helpers
// =====================================================

/**
 * 添付ファイルサイズを人間が読みやすい形式に整形
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 添付ファイルリストのプレーンテキスト表現を生成
 */
function formatAttachmentsText(attachments?: InquiryAttachmentInfo[]): string {
  if (!attachments || attachments.length === 0) return '添付ファイル: なし';
  const list = attachments
    .map((a, i) => `  ${i + 1}. ${a.file_name} (${a.mime_type}, ${formatFileSize(a.file_size)})`)
    .join('\n');
  return `添付ファイル:\n${list}`;
}

/**
 * 添付ファイルリストの HTML 表現を生成
 */
function formatAttachmentsHtml(attachments?: InquiryAttachmentInfo[]): string {
  if (!attachments || attachments.length === 0) {
    return '<div class="label">添付ファイル</div><div class="value">なし</div>';
  }
  const items = attachments
    .map(
      (a) => `
      <div class="attach-item">
        <strong>${escapeHtml(a.file_name)}</strong>
        <span style="color:#666;font-size:13px;">${escapeHtml(a.mime_type)} / ${escapeHtml(formatFileSize(a.file_size))}</span>
      </div>`
    )
    .join('');
  return `<div class="label">添付ファイル</div>${items}`;
}

// =====================================================
// 注文番号表示（注文のお問い合わせ場合のみ・AC-ROB-4）
// =====================================================

/**
 * 注文番号のプレーンテキスト表現を生成
 * - orderNumber が未指定（一般 inquiry）の場合は空文字（余分な空行を出さない）
 * - 指定時は末尾に改行付きの「【注文番号】xxx」行を返す
 */
function formatOrderNumberText(orderNumber?: string): string {
  return orderNumber ? `【注文番号】${orderNumber}\n` : '';
}

/**
 * 注文番号の HTML 表現を生成（info-box 内の label/value ペア）
 * - orderNumber が未指定の場合は空文字（DOM に出力しない）
 */
function formatOrderNumberHtml(orderNumber?: string): string {
  if (!orderNumber) return '';
  return `
      <div class="label">注文番号</div>
      <div class="value"><code>${escapeHtml(orderNumber)}</code></div>`;
}

// =====================================================
// お問い合わせ種別の日本語表示
// =====================================================

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  product: '商品について',
  quotation: '見積りについて',
  sample: 'サンプルについて',
  order: '注文について',
  billing: '請求について',
  other: 'その他',
  general: '一般',
  technical: '技術',
  sales: '営業',
  support: 'サポート',
};

function getInquiryTypeLabel(type: string): string {
  return INQUIRY_TYPE_LABELS[type] || type;
}

// =====================================================
// 受付通知メール（管理者へ）
// =====================================================

/**
 * 会員からの新規お問い合わせを管理者へ通知
 * - 宛先: ADMIN_EMAIL
 * - replyTo: 会員のメールアドレス（管理者が「返信」で会員へ直接返信できるよう）
 */
export async function sendInquiryReceivedEmail(
  data: InquiryReceivedEmailData
): Promise<{ success: boolean; error?: string; messageId?: string; previewUrl?: string }> {
  const inquiryTypeLabel = getInquiryTypeLabel(data.inquiryType);

  const text = `
新しいお問い合わせを受け付けました。

================================
お問い合わせ情報
================================

【お問い合わせ番号】${data.inquiryNumber}
${formatOrderNumberText(data.orderNumber)}【お問い合わせ種別】${inquiryTypeLabel}
【件名】${data.subject}

--------------------------------
お客様情報
--------------------------------
【お名前】${data.memberName}
【メールアドレス】${data.memberEmail}

--------------------------------
お問い合わせ内容
--------------------------------
${sanitizeUserMessage(data.messageBody)}

--------------------------------
${formatAttachmentsText(data.attachments)}
--------------------------------

================================
このメールに直接返信すると、お客様 (${data.memberEmail}) へ返信できます。
管理画面からもスレッドへ回答可能です。
================================
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .attach-item { background: #f3f4f6; padding: 8px 12px; margin: 5px 0; border-radius: 4px; font-size: 14px; }
    .message-body { white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>新規お問い合わせ通知</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">お問い合わせ情報</h3>
      <div class="label">お問い合わせ番号</div>
      <div class="value"><code>${escapeHtml(data.inquiryNumber)}</code></div>
      ${formatOrderNumberHtml(data.orderNumber)}
      <div class="label">お問い合わせ種別</div>
      <div class="value">${escapeHtml(inquiryTypeLabel)}</div>

      <div class="label">件名</div>
      <div class="value"><strong>${escapeHtml(data.subject)}</strong></div>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">お客様情報</h3>
      <div class="label">お名前</div>
      <div class="value">${escapeHtml(data.memberName)}</div>

      <div class="label">メールアドレス</div>
      <div class="value"><a href="mailto:${escapeHtml(data.memberEmail)}">${escapeHtml(data.memberEmail)}</a></div>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">お問い合わせ内容</h3>
      <div class="message-body">${sanitizeUserMessage(data.messageBody)}</div>
    </div>

    <div class="info-box">
      ${formatAttachmentsHtml(data.attachments)}
    </div>

    <p style="font-size: 13px; color: #666; margin-top: 25px;">
      このメールに直接返信すると、お客様へ返信できます。<br>
      管理画面からもスレッドへ回答可能です。
    </p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(
    ADMIN_EMAIL,
    `【新規お問い合わせ】${data.subject} - ${data.memberName} (${data.inquiryNumber})`,
    text,
    html,
    data.memberEmail // replyTo: 管理者が返信すると会員へ直接届く
  );
}

// =====================================================
// 回答通知メール（会員へ）
// =====================================================

/**
 * 管理者の回答を会員へ通知
 * - 宛先: 会員のメールアドレス
 */
export async function sendInquiryRepliedEmail(
  data: InquiryRepliedEmailData
): Promise<{ success: boolean; error?: string; messageId?: string; previewUrl?: string }> {
  const text = `
${data.memberName} 様

お問い合わせいただきありがとうございます。
担当者より回答が届きました。

================================
お問い合わせ情報
================================

【お問い合わせ番号】${data.inquiryNumber}
${formatOrderNumberText(data.orderNumber)}【件名】${data.subject}

--------------------------------
回答内容
--------------------------------
${sanitizeUserMessage(data.adminReply)}

--------------------------------
${formatAttachmentsText(data.attachments)}
--------------------------------

================================
ご不明な点がございましたら、マイページのお問い合わせ履歴より
追加でご質問いただけます。
================================

Epackage Lab
https://epackage-lab.com

※このメールはシステムによる自動送信です。
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .label { color: #666; font-size: 14px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; margin-bottom: 15px; }
    .message-body { white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 4px; }
    .attach-item { background: #f3f4f6; padding: 8px 12px; margin: 5px 0; border-radius: 4px; font-size: 14px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">お問い合わせへの回答</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;">
        <strong>${escapeHtml(data.memberName)}</strong> 様
      </p>
      <p>お問い合わせいただきありがとうございます。<br>担当者より回答が届きました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">お問い合わせ情報</h3>
        <div class="label">お問い合わせ番号</div>
        <div class="value"><code>${escapeHtml(data.inquiryNumber)}</code></div>
        ${formatOrderNumberHtml(data.orderNumber)}
        <div class="label">件名</div>
        <div class="value">${escapeHtml(data.subject)}</div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">回答内容</h3>
        <div class="message-body">${sanitizeUserMessage(data.adminReply)}</div>
      </div>

      <div class="info-box">
        ${formatAttachmentsHtml(data.attachments)}
      </div>

      <p style="text-align: center; color: #667eea;">
        ご不明な点がございましたら、マイページのお問い合わせ履歴より<br>
        追加でご質問いただけます。
      </p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
      <p style="font-size: 11px; color: #999;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // 会員への通知: FROM_EMAIL から会員へ。replyTo は設定しない（FROM_EMAIL への返信＝管理者）
  return sendEmail(
    data.memberEmail,
    `【Epackage Lab】お問い合わせへの回答 - ${data.subject} (${data.inquiryNumber})`,
    text,
    html
  );
}

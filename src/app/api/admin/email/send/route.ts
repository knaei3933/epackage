/**
 * Admin Email Send API Route
 *
 * 管理者用メール送信API
 * - 顧客管理向けメール送信
 * - テンプレートベースのメール送信
 * - カスタムHTML/テキストメール送信
 * - 一括送信対応
 *
 * POST /api/admin/email/send
 *
 * @module api/admin/email/send
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/api-auth';
import { epackMailer, type EpackAttachment } from '@/lib/email/epack-mailer';
import type { EpackTemplateId, EpackEmailData } from '@/lib/email/epack-templates';

// ============================================================
// Request Schemas
// ============================================================

/**
 * メール送信リクエストスキーマ（カスタムコンテンツ）
 */
const customEmailSchema = z.object({
  type: z.literal('custom'),
  to: z.union([
    z.string().email(),
    z.array(z.string().email()),
    z.array(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
  ]),
  cc: z.union([
    z.string().email(),
    z.array(z.string().email()),
    z.array(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
  ]).optional(),
  subject: z.string().min(1, '件名を入力してください。'),
  html: z.string().optional(),
  text: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // Base64 encoded
    type: z.string(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
});

/**
 * テンプレートメール送信リクエストスキーマ
 */
const templateEmailSchema = z.object({
  type: z.literal('template'),
  template: z.enum([
    'quoteReady',
    'quoteApproved',
    'dataUploadRequest',
    'dataReceived',
    'modificationRequest',
    'modificationApproved',
    'modificationRejected',
    'correctionReady',
    'approvalRequest',
    'productionStarted',
    'readyToShip',
    'shipped',
    'orderCancelled',
    'koreaCorrectionRequest',
  ] as const),
  to: z.union([
    z.string().email(),
    z.array(z.string().email()),
    z.array(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
  ]),
  data: z.object({
    customer_name: z.string(),
    customer_email: z.string().email(),
    company_name: z.string().optional(),
    order_id: z.string().optional(),
    order_number: z.string().optional(),
    quotation_id: z.string().optional(),
    quotation_number: z.string().optional(),
    product_name: z.string().optional(),
    view_url: z.string().url(),
    total_amount: z.number().optional(),
    valid_until: z.string().optional(),
    upload_deadline: z.string().optional(),
    approval_deadline: z.string().optional(),
    estimated_completion: z.string().optional(),
    estimated_delivery: z.string().optional(),
    file_name: z.string().optional(),
    quantity: z.string().optional(),
    modification_details: z.string().optional(),
    correction_details: z.string().optional(),
    rejection_reason: z.string().optional(),
    refund_amount: z.number().optional(),
    refund_method: z.string().optional(),
    cancellation_reason: z.string().optional(),
    tracking_number: z.string().optional(),
    carrier: z.string().optional(),
    tracking_url: z.string().optional(),
  }),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    type: z.string(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
});

/**
 * バッチ送信リクエストスキーマ
 */
const batchEmailSchema = z.object({
  type: z.literal('batch'),
  template: z.enum([
    'quoteReady',
    'quoteApproved',
    'dataUploadRequest',
    'dataReceived',
    'modificationRequest',
    'modificationApproved',
    'modificationRejected',
    'correctionReady',
    'approvalRequest',
    'productionStarted',
    'readyToShip',
    'shipped',
    'orderCancelled',
    'koreaCorrectionRequest',
  ] as const),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).min(1, '少なくとも1人の受信者が必要です。'),
  baseData: z.object({
    customer_name: z.string(),
    company_name: z.string().optional(),
    order_id: z.string().optional(),
    order_number: z.string().optional(),
    quotation_id: z.string().optional(),
    quotation_number: z.string().optional(),
    product_name: z.string().optional(),
    view_url: z.string().url(),
    total_amount: z.number().optional(),
    valid_until: z.string().optional(),
    upload_deadline: z.string().optional(),
    approval_deadline: z.string().optional(),
    estimated_completion: z.string().optional(),
    estimated_delivery: z.string().optional(),
    file_name: z.string().optional(),
    quantity: z.string().optional(),
    modification_details: z.string().optional(),
    correction_details: z.string().optional(),
    rejection_reason: z.string().optional(),
    refund_amount: z.number().optional(),
    refund_method: z.string().optional(),
    cancellation_reason: z.string().optional(),
    tracking_number: z.string().optional(),
    carrier: z.string().optional(),
    tracking_url: z.string().optional(),
  }),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    type: z.string(),
    disposition: z.enum(['attachment', 'inline']).optional(),
  })).optional(),
});

/**
 * 統合リクエストスキーマ
 */
const emailSendSchema = z.discriminatedUnion('type', [
  customEmailSchema,
  templateEmailSchema,
  batchEmailSchema,
]);

// ============================================================
// Type Definitions
// ============================================================

type EmailSendRequest = z.infer<typeof emailSendSchema>;

interface EmailSendResponse {
  success: boolean;
  message: string;
  messageId?: string;
  results?: Array<{
    recipient: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  error?: string;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * 受信者を標準フォーマットに変換
 */
function normalizeRecipients(
  to: string | string[] | Array<{ email: string; name?: string }>
): Array<{ email: string; name?: string }> {
  if (typeof to === 'string') {
    return [{ email: to }];
  }
  if (Array.isArray(to)) {
    if (to.length === 0) {
      return [];
    }
    if (typeof to[0] === 'string') {
      return (to as string[]).map(email => ({ email }));
    }
    return to as Array<{ email: string; name?: string }>;
  }
  return [{ email: to as string }];
}

/**
 * 添付ファイルを標準フォーマットに変換
 */
function normalizeAttachments(
  attachments?: Array<{ filename: string; content: string; type: string; disposition?: 'attachment' | 'inline' }>
): EpackAttachment[] | undefined {
  if (!attachments || attachments.length === 0) {
    return undefined;
  }
  return attachments
    .filter(att => att.filename && att.content && att.type)
    .map(att => ({
      filename: att.filename,
      content: att.content,
      type: att.type,
      disposition: att.disposition || 'attachment',
    }));
}

// ============================================================
// Route Handlers
// ============================================================

/**
 * POST /api/admin/email/send
 *
 * メール送信API
 */
export const POST = withAdminAuth(async (
  request: NextRequest,
  auth
): Promise<NextResponse<EmailSendResponse>> => {
  try {
    // リクエストボディの解析
    const body = await request.json();

    // バリデーション
    const validationResult = emailSendSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('[Email API] Validation error:', validationResult.error.errors);
      return NextResponse.json({
        success: false,
        message: 'リクエストデータが無効です。',
        error: validationResult.error.errors[0]?.message || 'Validation error',
      }, { status: 400 });
    }

    const data = validationResult.data;

    console.log('[Email API] Email send request:', {
      type: data.type,
      userId: auth.userId,
    });

    // カスタムメール送信
    if (data.type === 'custom') {
      return await handleCustomEmail(data);
    }

    // テンプレートメール送信
    if (data.type === 'template') {
      return await handleTemplateEmail(data);
    }

    // バッチ送信
    if (data.type === 'batch') {
      return await handleBatchEmail(data);
    }

    return NextResponse.json({
      success: false,
      message: '未対応のリクエストタイプです。',
    }, { status: 400 });

  } catch (error) {
    console.error('[Email API] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      message: 'メール送信中にエラーが発生しました。',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
});

/**
 * カスタムメールの処理
 */
async function handleCustomEmail(
  data: z.infer<typeof customEmailSchema>
): Promise<NextResponse<EmailSendResponse>> {
  const recipients = normalizeRecipients(data.to);
  const ccRecipients = data.cc ? normalizeRecipients(data.cc) : undefined;
  const attachments = normalizeAttachments(data.attachments);

  // カスタムメール送信（複数宛先対応）
  const result = await epackMailer.sendCustom(
    recipients,
    data.subject,
    {
      html: data.html,
      text: data.text,
    },
    attachments,
    ccRecipients
  );

  // 成功した場合は個別の結果を生成
  if (result.success) {
    const results = recipients.map(r => ({
      recipient: r.email,
      success: true,
      messageId: result.messageId,
    }));

    return NextResponse.json({
      success: true,
      message: 'メールを送信しました。',
      messageId: result.messageId,
      results,
    });
  }

  // 失敗した場合
  const results = recipients.map(r => ({
    recipient: r.email,
    success: false,
    error: result.error,
  }));

  return NextResponse.json({
    success: false,
    message: 'メールの送信に失敗しました。',
    error: result.error,
    results,
  });
}

/**
 * テンプレートメールの処理
 */
async function handleTemplateEmail(
  data: z.infer<typeof templateEmailSchema>
): Promise<NextResponse<EmailSendResponse>> {
  const recipients = normalizeRecipients(data.to);
  const attachments = normalizeAttachments(data.attachments);

  // 複数受信者の場合
  if (recipients.length > 1) {
    // バッチ送信を使用
    const batchResults = await epackMailer.sendBatch(
      data.template,
      recipients.map(r => ({
        email: r.email,
        name: r.name || data.data.customer_name,
      })),
      { ...data.data, customer_email: '', customer_name: '' }, // バッチ用に空文字列を設定
      attachments
    );

    const results = recipients.map((recipient, index) => ({
      recipient: recipient.email,
      success: batchResults[index].success,
      messageId: batchResults[index].messageId,
      error: batchResults[index].error,
    }));

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount === results.length,
      message: successCount === results.length
        ? 'メールを送信しました。'
        : `${successCount}/${results.length}件のメールを送信しました。`,
      results,
    });
  }

  // 単一受信者の場合
  const emailData: EpackEmailData = {
    ...data.data,
    customer_email: recipients[0].email,
    customer_name: recipients[0].name || data.data.customer_name,
  };

  const result = await epackMailer.send(data.template, emailData, attachments);

  return NextResponse.json({
    success: result.success,
    message: result.success
      ? 'メールを送信しました。'
      : 'メールの送信に失敗しました。',
    messageId: result.messageId,
    error: result.error,
  });
}

/**
 * バッチメールの処理
 */
async function handleBatchEmail(
  data: z.infer<typeof batchEmailSchema>
): Promise<NextResponse<EmailSendResponse>> {
  const attachments = normalizeAttachments(data.attachments);

  const batchResults = await epackMailer.sendBatch(
    data.template,
    data.recipients,
    { ...data.baseData, customer_email: '', customer_name: '' },
    attachments
  );

  const results = data.recipients.map((recipient, index) => ({
    recipient: recipient.email,
    success: batchResults[index].success,
    messageId: batchResults[index].messageId,
    error: batchResults[index].error,
  }));

  const successCount = results.filter(r => r.success).length;

  return NextResponse.json({
    success: successCount === results.length,
    message: successCount === results.length
      ? `${results.length}件のメールを送信しました。`
      : `${successCount}/${results.length}件のメールを送信しました。`,
    results,
  });
}

// ============================================================
// Configuration
// ============================================================

/**
 * エラーハンドリング設定
 */
export const config = {
  api: {
    bodyParser: true,
  },
};

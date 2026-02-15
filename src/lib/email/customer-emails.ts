/**
 * Customer Management Email Templates
 *
 * 顧客管理専用メールテンプレート
 * - ウェルカムメール
 * - 見積フォローアップ
 * - 一般顧客通信
 *
 * @module lib/email/customer-emails
 */

import { epackMailer, type EpackAttachment } from './epack-mailer';
import type { EpackEmailData, EpackTemplateId } from './epack-templates';

// ============================================================
// Type Definitions
// ============================================================

export interface CustomerWelcomeData {
  customer_email: string;
  customer_name: string;
  company_name?: string;
  login_url: string;
  member_dashboard_url?: string;
}

export interface QuoteFollowUpData {
  customer_email: string;
  customer_name: string;
  company_name?: string;
  quotation_number: string;
  quotation_id: string;
  total_amount?: number;
  valid_until: string;
  view_url: string;
}

export interface CustomerCommunicationData {
  to: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>;
  subject: string;
  content: {
    html?: string;
    text?: string;
  };
  attachments?: EpackAttachment[];
}

// ============================================================
// Customer Welcome Email
// ============================================================

/**
 * 顧客ウェルカムメール送信
 *
 * 新規登録顧客へウェルカムメールを送信
 */
export async function sendCustomerWelcomeEmail(
  data: CustomerWelcomeData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending welcome email to:', data.customer_email);

  // 見積テンプレートをベースにカスタマイズ
  const emailData: EpackEmailData = {
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    company_name: data.company_name,
    quotation_number: 'WELCOME',
    view_url: data.member_dashboard_url || data.login_url,
    total_amount: 0,
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'),
  };

  return epackMailer.send('quoteReady', emailData);
}

// ============================================================
// Quote Follow-up Email
// ============================================================

/**
 * 見積フォローアップメール送信
 *
 * 見積作成後のフォローアップメールを送信
 */
export async function sendQuoteFollowUpEmail(
  data: QuoteFollowUpData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending quote follow-up to:', data.customer_email);

  const emailData: EpackEmailData = {
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    company_name: data.company_name,
    quotation_id: data.quotation_id,
    quotation_number: data.quotation_number,
    total_amount: data.total_amount,
    valid_until: data.valid_until,
    view_url: data.view_url,
  };

  return epackMailer.send('quoteReady', emailData);
}

// ============================================================
// Batch Customer Communications
// ============================================================

/**
 * 複数顧客へ一括メール送信（見積フォローアップ）
 */
export async function sendBatchQuoteFollowUp(
  recipients: Array<{ email: string; name?: string; company_name?: string }>,
  commonData: Omit<QuoteFollowUpData, 'customer_email' | 'customer_name' | 'company_name'>
): Promise<Array<{ recipient: string; success: boolean; messageId?: string; error?: string }>> {
  console.log('[CustomerEmail] Sending batch quote follow-up to:', recipients.length, 'recipients');

  const results = await epackMailer.sendBatch(
    'quoteReady',
    recipients.map(r => ({
      email: r.email,
      name: r.name || r.email,
    })),
    {
      ...commonData,
      customer_email: '',
      customer_name: '',
      company_name: '',
    }
  );

  return recipients.map((recipient, index) => ({
    recipient: recipient.email,
    success: results[index].success,
    messageId: results[index].messageId,
    error: results[index].error,
  }));
}

/**
 * 未回答見積へのリマインダーメール送信
 */
export async function sendQuoteReminderEmail(
  data: QuoteFollowUpData & { days_until_expiry: number }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending quote reminder to:', data.customer_email);

  // 通常の見積フォローアップと同じテンプレートを使用
  // 必要に応じてカスタムテンプレートを作成可能
  return sendQuoteFollowUpEmail(data);
}

// ============================================================
// Customer Status Update Emails
// ============================================================

/**
 * 顧客ステータス更新通知メール
 */
export async function sendCustomerStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  status: 'approved' | 'suspended' | 'deleted',
  reason?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending status update to:', customerEmail, 'status:', status);

  // 既存テンプレートを活用
  let template: EpackTemplateId;
  const emailData: EpackEmailData = {
    customer_name: customerName,
    customer_email: customerEmail,
    view_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://epackage-lab.com'}/member`,
    order_number: `STATUS-${status.toUpperCase()}`,
  };

  switch (status) {
    case 'approved':
      template = 'quoteApproved';
      break;
    case 'suspended':
      template = 'modificationRequest';
      (emailData as any).modification_details = reason || 'アカウントが停止されました。';
      break;
    case 'deleted':
      template = 'orderCancelled';
      (emailData as any).cancellation_reason = reason || 'アカウントが削除されました。';
      break;
    default:
      return {
        success: false,
        error: 'Invalid status',
      };
  }

  return epackMailer.send(template, emailData);
}

// ============================================================
// General Customer Communication
// ============================================================

/**
 * 一般顧客通信用メール送信（カスタムHTML）
 *
 * 注意: この関数はepack-mailerのテンプレート機能を使用しません。
 * カスタムHTMLを送信する場合は、直接nodemailerを使用する必要があります。
 * 現在の実装では、既存のテンプレートをベースに近似したメールを送信します。
 */
export async function sendGeneralCustomerEmail(
  to: string | { email: string; name?: string },
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending general customer email to:', typeof to === 'string' ? to : to.email);

  // TODO: カスタムHTML送信の実装
  // 現在はconsoleログのみ
  console.log('[CustomerEmail] General email (not implemented):', {
    to,
    subject,
    hasHtml: !!htmlContent,
    hasText: !!textContent,
  });

  return {
    success: false,
    error: 'カスタムメール送信は現在サポートされていません。テンプレートを使用してください。',
  };
}

// ============================================================
// Template-based Communications
// ============================================================

/**
 * 注文状況更新メール送信
 */
export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  productName: string,
  status: 'production_started' | 'ready_to_ship' | 'shipped',
  trackingInfo?: {
    tracking_number?: string;
    carrier?: string;
    tracking_url?: string;
    estimated_delivery?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending order status update to:', customerEmail);

  let template: EpackTemplateId;
  const emailData: EpackEmailData = {
    customer_name: customerName,
    customer_email: customerEmail,
    order_number: orderNumber,
    product_name: productName,
    view_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://epackage-lab.com'}/member/orders/${orderNumber}`,
    ...trackingInfo,
  };

  switch (status) {
    case 'production_started':
      template = 'productionStarted';
      (emailData as any).estimated_completion = trackingInfo?.estimated_delivery || '';
      break;
    case 'ready_to_ship':
      template = 'readyToShip';
      break;
    case 'shipped':
      template = 'shipped';
      break;
    default:
      return {
        success: false,
        error: 'Invalid status',
      };
  }

  return epackMailer.send(template, emailData);
}

/**
 * データ入稿依頼メール送信
 */
export async function sendDataUploadRequest(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  productName: string,
  uploadDeadline: string,
  viewUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending data upload request to:', customerEmail);

  const emailData: EpackEmailData = {
    customer_name: customerName,
    customer_email: customerEmail,
    order_number: orderNumber,
    product_name: productName,
    upload_deadline: uploadDeadline,
    view_url: viewUrl,
  };

  return epackMailer.send('dataUploadRequest', emailData);
}

/**
 * 修正依頼メール送信
 */
export async function sendModificationRequest(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  modificationDetails: string,
  viewUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[CustomerEmail] Sending modification request to:', customerEmail);

  const emailData: EpackEmailData = {
    customer_name: customerName,
    customer_email: customerEmail,
    order_number: orderNumber,
    modification_details: modificationDetails,
    view_url: viewUrl,
  };

  return epackMailer.send('modificationRequest', emailData);
}

// ============================================================
// Export Module
// ============================================================

export const customerEmails = {
  // Welcome & Onboarding
  sendWelcome: sendCustomerWelcomeEmail,

  // Quote Management
  sendQuoteFollowUp: sendQuoteFollowUpEmail,
  sendBatchQuoteFollowUp,
  sendQuoteReminder: sendQuoteReminderEmail,

  // Status Updates
  sendStatusUpdate: sendCustomerStatusUpdateEmail,
  sendOrderStatusUpdate: sendOrderStatusUpdateEmail,

  // Order Communications
  sendDataUploadRequest,
  sendModificationRequest,

  // General (not implemented)
  sendGeneral: sendGeneralCustomerEmail,
};

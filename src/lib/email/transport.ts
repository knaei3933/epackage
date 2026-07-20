/**
 * Email Transport Core
 *
 * メール送信コア（transporter, sendEmail, sendTemplatedEmail, config）
 */

import * as nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';
import {
  renderEmailTemplate,
  type EmailTemplateType,
  type EmailRecipient,
  type WelcomeEmailData,
  type ApprovalEmailData,
  type RejectionEmailData,
  type QuoteCreatedEmailData,
  type OrderStatusEmailData,
  type ShipmentEmailData,
  type KoreaDataTransferEmailData,
  type KoreaCorrectionNotificationEmailData,
  type SpecSheetApprovalEmailData,
  type SpecSheetRejectionEmailData,
  type InvoiceEmailData,
  type SampleRequestEmailData as TemplateSampleRequestEmailData,
} from '../email-templates';

// =====================================================
// Test Email Storage (for E2E testing)
// =====================================================

interface TestEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  timestamp: number;
  messageId?: string;
  previewUrl?: string;
}

// In-memory email store for testing
const emailStore: Map<string, TestEmail[]> = new Map();

/**
 * Store sent email for test retrieval
 */
function storeTestEmail(email: TestEmail) {
  const recipient = email.to;

  if (!emailStore.has(recipient)) {
    emailStore.set(recipient, []);
  }

  const emails = emailStore.get(recipient)!;
  emails.push(email);

  // Keep only the most recent 100 emails per recipient
  if (emails.length > 100) {
    emails.splice(0, emails.length - 100);
  }
}

/**
 * Get stored emails (exported for test utilities)
 */
export function getStoredEmails(recipient?: string): TestEmail[] {
  if (recipient) {
    return emailStore.get(recipient) || [];
  }

  const allEmails: TestEmail[] = [];
  for (const emails of emailStore.values()) {
    allEmails.push(...emails);
  }
  return allEmails;
}

/**
 * Clear stored emails (exported for test utilities)
 */
export function clearStoredEmails(recipient?: string): void {
  if (recipient) {
    emailStore.delete(recipient);
  } else {
    emailStore.clear();
  }
}

// =====================================================
// Security: HTML Sanitization Helper
// =====================================================

/**
 * ユーザー入力を安全にエスケープしてXSS対策
 * 改行は<br>タグに変換するが、その他のHTMLタグはすべて削除
 */
export function sanitizeUserMessage(message: string): string {
  // 1段階: すべてのHTMLタグを削除
  const clean = sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // 2段階: 改行を<br>タグに変換（エスケープ後は安全）
  return clean.replace(/\n/g, '<br>');
}

/**
 * C-16: 単行フィールド用 HTML エスケープ（contact メールの name/subject/email 等）
 * sanitizeUserMessage は長文（message）用で sanitizeHtml + <br> 変換を行うが、
 * 単行フィールドは実体参照エスケープのみで十分かつ軽量。
 * 不正入力（<script> 等）による HTML インジェクション/XSS を防ぐ。
 */
export function escapeHtml(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// =====================================================
// Configuration
// =====================================================

// Email Settings
export const FROM_EMAIL = process.env.FROM_EMAIL || 'info@package-lab.com';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@package-lab.com';

// 環境別戦略自動選択
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// =====================================================
// Transporter 생성 (환경별)
// =====================================================

export let transporter: nodemailer.Transporter | null = null;
export let transportType: 'ethereal' | 'sendgrid' | 'aws-ses' | 'xserver' | 'console' = 'console';

/**
 * 開発用: Ethereal Email Transporter
 * 実際のメールでテスト送信可能（https://ethereal.email）
 */
async function createEtherealTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('[Email] Ethereal Email initialized:', {
      user: testAccount.user,
      url: `https://ethereal.email/messages/${testAccount.user}`
    });

    return { transport, testAccount };
  } catch (error) {
    console.error('[Email] Ethereal initialization failed:', error);
    return null;
  }
}

/**
 * 本番用: SendGrid Transporter
 */
function createSendGridTransporter() {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const SENDGRID_HOST = process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net';
  const SENDGRID_PORT = parseInt(process.env.SENDGRID_SMTP_PORT || '587');

  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'SG.placeholder' || SENDGRID_API_KEY === '') {
    console.warn('[Email] SendGrid not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: SENDGRID_HOST,
    port: SENDGRID_PORT,
    secure: false,
    auth: {
      user: 'apikey',
      pass: SENDGRID_API_KEY,
    },
  });
}

/**
 * 本番用: AWS SES Transporter（バックアップ）
 */
function createAwsSesTransporter() {
  const AWS_SES_SMTP_USERNAME = process.env.AWS_SES_SMTP_USERNAME;
  const AWS_SES_SMTP_PASSWORD = process.env.AWS_SES_SMTP_PASSWORD;
  const AWS_SES_SMTP_HOST = process.env.AWS_SES_SMTP_HOST || 'email-smtp.ap-northeast-1.amazonaws.com';
  const AWS_SES_SMTP_PORT = parseInt(process.env.AWS_SES_SMTP_PORT || '587');

  if (!AWS_SES_SMTP_USERNAME || !AWS_SES_SMTP_PASSWORD ||
      AWS_SES_SMTP_USERNAME === 'AKIAIOSFODNN7EXAMPLE' ||
      AWS_SES_SMTP_PASSWORD === 'placeholder') {
    return null;
  }

  return nodemailer.createTransport({
    host: AWS_SES_SMTP_HOST,
    port: AWS_SES_SMTP_PORT,
    secure: false,
    auth: {
      user: AWS_SES_SMTP_USERNAME,
      pass: AWS_SES_SMTP_PASSWORD,
    },
  });
}

/**
 * 本番用: XServer SMTP Transporter（日本ホスティング）
 * SUPABASE_SMTP_* または XSERVER_SMTP_* 環境変数を使用
 */
function createXServerTransporter() {
  // SUPABASE_SMTP_* または XSERVER_SMTP_* のどちらかを使う
  const SMTP_HOST = process.env.SUPABASE_SMTP_HOST || process.env.XSERVER_SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SUPABASE_SMTP_PORT || process.env.XSERVER_SMTP_PORT || '587');
  const SMTP_USER = process.env.SUPABASE_SMTP_USER || process.env.XSERVER_SMTP_USER;
  const SMTP_PASSWORD = process.env.SUPABASE_SMTP_PASSWORD || process.env.XSERVER_SMTP_PASSWORD;

  // SMTP設定がない場合はnullを返す
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465ならSSL、587ならTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    // XServerはTLSを推奨
    tls: {
      rejectUnauthorized: false // 開発環境では証明書検証を緩和
    }
  });
}

// =====================================================
// 初期化（環境別自動選択）
// =====================================================

let etherealTestAccount: NonNullable<Awaited<ReturnType<typeof createEtherealTransporter>>>['testAccount'] | null = null;

async function initializeTransporter() {
  if (isDevelopment) {
    // 開発環境: XServer優先（実際のメールテスト用）
    console.log('[Email] Development mode - configuring email service');

    // 1. XServer SMTP（日本ホスティング）
    transporter = createXServerTransporter();
    if (transporter) {
      transportType = 'xserver';
      console.log('[Email] XServer SMTP initialized (development)');
      return;
    }

    // 2. Ethereal Email（バックアップ）
    console.log('[Email] XServer not configured - using Ethereal Email');
    const result = await createEtherealTransporter();
    if (result) {
      transporter = result.transport;
      etherealTestAccount = result.testAccount;
      transportType = 'ethereal';
      return;
    }

    // Fallback: Console出力
    console.warn('[Email] No email service configured - using console fallback');
    transportType = 'console';
    return;
  }

  if (isProduction) {
    // 本番: XServer優先 → SendGrid → AWS SESバックアップ
    console.log('[Email] Production mode - configuring email service');

    // 1. XServer SMTP（日本ホスティング）
    transporter = createXServerTransporter();
    if (transporter) {
      transportType = 'xserver';
      console.log('[Email] XServer SMTP initialized');
      return;
    }

    // 2. SendGrid（国際クラウド）
    transporter = createSendGridTransporter();
    if (transporter) {
      transportType = 'sendgrid';
      console.log('[Email] SendGrid initialized (fallback)');
      return;
    }

    // 3. AWS SES（国際クラウドバックアップ）
    transporter = createAwsSesTransporter();
    if (transporter) {
      transportType = 'aws-ses';
      console.log('[Email] AWS SES initialized (fallback)');
      return;
    }

    console.warn('[Email] No email service configured - using console fallback');
    transportType = 'console';
  }
}

// 初期化実行
initializeTransporter();

// =====================================================
// Email Sending Functions
// =====================================================

/**
 * メール送信（環境別自動分岐）
 *
 * @param replyTo - 返信先メールアドレス（optional・未指定時は FROM_EMAIL への返信になる）
 *                  お問い合わせ通知で管理者が「返信」ボタンを押した時に会員へ直接返信できるよう設定。
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string; messageId?: string; previewUrl?: string }> {
  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[Email] Console mode - Email content:');
    console.log('='.repeat(60));
    console.log(`To: ${to}`);
    if (replyTo) console.log(`Reply-To: ${replyTo}`);
    console.log(`Subject: ${subject}`);
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('='.repeat(60));

    return {
      success: true,
      messageId: `console-${Date.now()}`
    };
  }

  try {
    // nodemailer の sendMail オーバーロードは `charset` を標準 MailOptions に持たず
    // オーバーロード解決が失敗するため、MailOptions として明示的にキャストする。
    // 実行時の送信オプション・エンコーディング設定は一切変更しない。
    const mailOptions = {
      from: FROM_EMAIL,
      to,
      // 返信先が指定されていれば設定（お問い合わせ通知で会員へ直接返信できるよう）
      ...(replyTo ? { replyTo } : {}),
      subject,
      // Send both text and HTML parts for proper Japanese email support
      text,
      html,
      // Japanese email encoding: UTF-8 with quoted-printable for proper character display
      textEncoding: 'quoted-printable' as const,
      encoding: 'utf-8',
      charset: 'utf-8',
    };
    // sendMail は Promise<SentMessageInfo> を返すが、charset 未定義により
    // TS がコールバック版 void オーバーロードに解決してしまうため明示的に型付する。
    const info = await transporter.sendMail(mailOptions as nodemailer.SendMailOptions) as nodemailer.SentMessageInfo;

    const result: { success: boolean; error?: string; messageId?: string; previewUrl?: string } = {
      success: true,
      messageId: info.messageId
    };

    // Etherealの場合はpreview URLを提供
    let previewUrl: string | undefined;
    if (transportType === 'ethereal' && nodemailer.getTestMessageUrl) {
      // getTestMessageUrl は string | false を返すため、false を undefined に正規化
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      if (previewUrl) {
        result.previewUrl = previewUrl;
        console.log('[Email] Ethereal preview URL:', result.previewUrl);
      }
    }

    // Store email for test retrieval (in development/test environments)
    if (process.env.NODE_ENV !== 'production') {
      storeTestEmail({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        to,
        from: FROM_EMAIL,
        subject,
        text,
        html,
        timestamp: Date.now(),
        messageId: info.messageId,
        previewUrl,
      });
    }

    console.log('[Email] Email sent successfully:', {
      transportType,
      to,
      subject,
      messageId: info.messageId
    });

    return result;
  } catch (error: unknown) {
    const errObj = error as { message?: string; code?: string };
    console.error('[Email] Send error:', {
      transportType,
      message: errObj.message,
      code: errObj.code
    });

    return {
      success: false,
      error: errObj.message
    };
  }
}

/**
 * Contact Form メール送信（顧客 + 管理者）
 */

export function getEmailConfigStatus(): {
  mode: string;
  transportType: string;
  configured: boolean;
  hasXServer: boolean;
  hasSendGrid: boolean;
  hasAwsSes: boolean;
  hasFromEmail: boolean;
  hasAdminEmail: boolean;
} {
  const SMTP_HOST = process.env.SUPABASE_SMTP_HOST || process.env.XSERVER_SMTP_HOST;
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const AWS_SES_SMTP_USERNAME = process.env.AWS_SES_SMTP_USERNAME;

  return {
    mode: isDevelopment ? 'development' : isProduction ? 'production' : 'unknown',
    transportType,
    configured: !!transporter && transportType !== 'console',
    hasXServer: !!SMTP_HOST,
    hasSendGrid: !!(SENDGRID_API_KEY && SENDGRID_API_KEY !== 'SG.placeholder'),
    hasAwsSes: !!(AWS_SES_SMTP_USERNAME && AWS_SES_SMTP_USERNAME !== 'AKIAIOSFODNN7EXAMPLE'),
    hasFromEmail: !!FROM_EMAIL,
    hasAdminEmail: !!ADMIN_EMAIL
  };
}

// =====================================================
// Japanese Business Email Template Integration
// =====================================================

/**
 * Send email using Japanese business templates
 */
export async function sendTemplatedEmail(
  type: EmailTemplateType,
  data:
    | WelcomeEmailData
    | ApprovalEmailData
    | RejectionEmailData
    | QuoteCreatedEmailData
    | OrderStatusEmailData
    | ShipmentEmailData
    | KoreaDataTransferEmailData
    | KoreaCorrectionNotificationEmailData
    | SpecSheetApprovalEmailData
    | SpecSheetRejectionEmailData
    | InvoiceEmailData
    | (InvoiceEmailData & { daysOverdue?: number })
    | TemplateSampleRequestEmailData,
  recipient: EmailRecipient
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  try {
    // Add recipient to data
    const templateData = {
      ...data,
      recipient,
    } as typeof data;

    // Render template
    const template = renderEmailTemplate(type, templateData);

    // Send email
    return await sendEmail(
      recipient.email,
      template.subject,
      template.text,
      template.html
    );
  } catch (error: unknown) {
    const errObj = error as { message?: string };
    console.error('[Email] Template error:', {
      type,
      message: errObj.message,
    });

    return {
      success: false,
      error: errObj.message,
    };
  }
}

/**
 * Send welcome email to new customer
 */

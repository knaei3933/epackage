/**
 * Chatbot Email Utility
 *
 * チャットボット用メール送信ユーティリティ
 * - 有人切り替えリクエストメール送信
 * - 会話履歴のフォーマット
 */

import * as nodemailer from 'nodemailer';
import type { UIMessage } from 'ai';
import { loggers } from '@/lib/logger';

const logger = loggers.app().withContext({ module: 'chatbot-email' });

// =====================================================
// Type Definitions
// =====================================================

/**
 * 有人切り替えデータ
 */
export interface HumanHandoffData {
  phoneNumber: string;
  conversationHistory: UIMessage[];
  timestamp: Date;
}

// =====================================================
// Constants
// =====================================================

const FROM_EMAIL = process.env.FROM_EMAIL || 'info@package-lab.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@package-lab.com';

// =====================================================
// Transporter Setup
// =====================================================

let transporter: nodemailer.Transporter | null = null;
let transportType: 'ethereal' | 'sendgrid' | 'aws-ses' | 'xserver' | 'console' = 'console';

/**
 * Initialize email transporter (sync version for chatbot usage)
 */
function initializeTransporter(): void {
  if (transporter) return;

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Try XServer SMTP first (production)
  // SUPABASE_SMTP_* または XSERVER_SMTP_* のどちらかを使う
  const SMTP_HOST = process.env.SUPABASE_SMTP_HOST || process.env.XSERVER_SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SUPABASE_SMTP_PORT || process.env.XSERVER_SMTP_PORT || '587');
  const SMTP_USER = process.env.SUPABASE_SMTP_USER || process.env.XSERVER_SMTP_USER;
  const SMTP_PASSWORD = process.env.SUPABASE_SMTP_PASSWORD || process.env.XSERVER_SMTP_PASSWORD;

  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
    transportType = 'xserver';
    logger.info('Using XServer SMTP');
    return;
  }

  // Development: Use Ethereal for testing
  if (isDevelopment) {
    // Create test account for development
    nodemailer.createTestAccount().then((account) => {
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      transportType = 'ethereal';
      logger.info('Using Ethereal test account');
      logger.debug('Ethereal URL:', nodemailer.getTestMessageUrl({} as any));
    }).catch(() => {
      transportType = 'console';
      logger.warn('Failed to create Ethereal account, using console mode');
    });
    return;
  }

  // Fallback to console mode
  transportType = 'console';
  logger.info('Using console mode');
}

// =====================================================
// Conversation Formatting
// =====================================================

/**
 * Format UIMessage[] to email body
 * UIMessage[]をメール本文に変換
 */
export function formatConversationForEmail(messages: UIMessage[]): string {
  const lines: string[] = [];

  for (const message of messages) {
    const role = message.role === 'user' ? 'ユーザー' : 'AI';
    let content = '';

    // Extract text from parts array
    if (message.parts && Array.isArray(message.parts)) {
      content = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join('');
    }

    lines.push(`${role}: ${content}`);
  }

  return lines.join('\n');
}

// =====================================================
// Email Sending Functions
// =====================================================

/**
 * Send human handoff email to admin
 * 有人切り替えリクエストメールを管理者に送信
 */
export async function sendHandoffEmail(data: HumanHandoffData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  initializeTransporter();

  const emailBody = `
【有人切り替えリクエスト】

【切り替え時刻】${data.timestamp.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}
【電話番号】${data.phoneNumber}

【会話履歴】
${formatConversationForEmail(data.conversationHistory)}
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'MS Pゴシック', 'ＭＳ Ｐゴシック', sans-serif; font-size: 14px; line-height: 1.6; }
    h2 { color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #333; }
    .conversation { background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-family: 'MS Pゴシック', 'ＭＳ Ｐゴシック', sans-serif; }
  </style>
</head>
<body>
  <h2>有人切り替えリクエスト</h2>

  <div class="section">
    <span class="label">切り替え時刻：</span>${data.timestamp.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}
  </div>

  <div class="section">
    <span class="label">電話番号：</span>${data.phoneNumber}
  </div>

  <div class="section">
    <span class="label">会話履歴：</span>
    <div class="conversation">${formatConversationForEmail(data.conversationHistory).replace(/\n/g, '<br>')}</div>
  </div>
</body>
</html>
  `.trim();

  // Console mode (Fallback)
  if (transportType === 'console' || !transporter) {
    logger.info('Console mode - Email content', {
      to: ADMIN_EMAIL,
      subject: '【チャットボット】有人切り替えリクエスト',
      emailBody
    });
    return {
      success: true,
      error: undefined,
      messageId: 'console-mode',
      previewUrl: undefined,
    };
  }

  // Send email via configured transporter
  try {
    const info = await transporter!.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: '【チャットボット】有人切り替えリクエスト',
      text: emailBody,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
    };
  } catch (error: any) {
    logger.error('Send error', { error });
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

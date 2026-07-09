/**
 * Korea Workflow Email Send Functions
 *
 * 韓国ワークフロー関連メール送信関数
 */

import { sendEmail, sendTemplatedEmail, transporter, transportType, FROM_EMAIL } from './transport';
import { renderEmailTemplate } from '../email-templates';
import type { EmailRecipient } from '../email-templates';
import * as nodemailer from 'nodemailer';

import { createRecipient } from '../email-templates';
import type { KoreaDataTransferEmailData, KoreaCorrectionNotificationEmailData } from '../email-templates';

export async function sendKoreaDataTransferEmail(
  data: Omit<KoreaDataTransferEmailData, 'recipient'> & {
    recipient?: EmailRecipient;
  },
  koreaEmail: string = process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com'
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  try {
    // Create Korea partner recipient
    const recipient = data.recipient || createRecipient(
      'Korea Partner Team',
      koreaEmail,
      'Epackage Korea'
    );

    // Prepare email data with recipient
    const emailData: KoreaDataTransferEmailData = {
      ...data,
      recipient,
    };

    // Render template
    const template = renderEmailTemplate('korea_data_transfer', emailData);

    // Send email
    return await sendEmail(
      koreaEmail,
      template.subject,
      template.text,
      template.html
    );
  } catch (error: unknown) {
    const errObj = error as { message?: string };
    console.error('[Email] Korea data transfer error:', {
      message: errObj.message,
      orderId: data.orderId,
    });

    return {
      success: false,
      error: errObj.message,
    };
  }
}

/**
 * Send design data to Korea with file attachments
 *
 * ファイル添付付き韓国データ送信
 * - nodemailer attachments使用
 * - Supabase StorageからファイルURL取得して添付
 */
export async function sendKoreaDataTransferWithAttachments(
  data: Omit<KoreaDataTransferEmailData, 'recipient'> & {
    recipient?: EmailRecipient;
  },
  attachmentData: Array<{
    filename: string;
    path?: string;  // Local file path (for development)
    content?: Buffer; // File content as Buffer
    href?: string;   // Public URL (for production)
  }>,
  koreaEmail: string = process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com'
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[Email] Console mode - Korea data transfer:');
    console.log('='.repeat(60));
    console.log(`To: ${koreaEmail}`);
    console.log(`Order ID: ${data.orderId}`);
    console.log(`Quotation: ${data.quotationNumber}`);
    console.log(`Attachments: ${attachmentData.length} files`);
    console.log('AI Data:', JSON.stringify(data.aiExtractedData, null, 2));
    console.log('='.repeat(60));

    return {
      success: true,
      messageId: `console-${Date.now()}`
    };
  }

  try {
    // Create Korea partner recipient
    const recipient = data.recipient || createRecipient(
      'Korea Partner Team',
      koreaEmail,
      'Epackage Korea'
    );

    // Prepare email data
    const emailData: KoreaDataTransferEmailData = {
      ...data,
      recipient,
    };

    // Render template
    const template = renderEmailTemplate('korea_data_transfer', emailData);

    // Prepare attachments for nodemailer
    const nodemailerAttachments = attachmentData
      .filter(att => att.path || att.content || att.href)
      .map(att => {
        if (att.content) {
          return {
            filename: att.filename,
            content: att.content,
          };
        } else if (att.path) {
          return {
            filename: att.filename,
            path: att.path,
          };
        } else {
          return {
            filename: att.filename,
            href: att.href!,
          };
        }
      });

    // Send email with attachments
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: koreaEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
      attachments: nodemailerAttachments,
    });

    const result: {
      success: boolean;
      error?: string;
      messageId?: string;
      previewUrl?: string;
    } = {
      success: true,
      messageId: info.messageId
    };

    // Etherealの場合はpreview URLを提供
    if (transportType === 'ethereal' && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        result.previewUrl = previewUrl;
        console.log('[Email] Ethereal preview URL:', result.previewUrl);
      }
    }

    console.log('[Email] Korea data transfer sent successfully:', {
      transportType,
      to: koreaEmail,
      orderId: data.orderId,
      messageId: info.messageId,
      attachmentsCount: nodemailerAttachments.length,
    });

    return result;
  } catch (error: unknown) {
    const errObj = error as { message?: string; code?: string };
    console.error('[Email] Korea data transfer error:', {
      transportType,
      message: errObj.message,
      code: errObj.code,
      orderId: data.orderId,
    });

    return {
      success: false,
      error: errObj.message,
    };
  }
}

// =====================================================
// Korea Correction Notification (Customer)
// =====================================================

/**
 * Send Korea correction notification to customer
 * 韓国パートナー修正事項完了顧客通知
 */
export async function sendKoreaCorrectionNotificationEmail(
  data: Omit<KoreaCorrectionNotificationEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // If recipient is not provided, try to get it from customer email
  let recipient = data.recipient;

  if (!recipient && customerEmail) {
    recipient = createRecipient('Customer', customerEmail);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided',
    };
  }

  const emailData: KoreaCorrectionNotificationEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('korea_correction_notification', emailData, recipient);
}


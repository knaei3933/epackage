/**
 * Signature Workflow Email Send Functions
 */

import { sendTemplatedEmail } from './transport';
import { createRecipient } from '../email-templates';
import type { EmailRecipient } from '../email-templates';
import type { SignatureRequestEmailData, SignatureCompletedEmailData, SignatureDeclinedEmailData, SignatureReminderEmailData } from '../email-templates';

export async function sendSignatureRequestEmail(
  data: Omit<SignatureRequestEmailData, 'recipient'> & { recipient?: EmailRecipient },
  signerEmail: string,
  signerName: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const recipient = data.recipient || createRecipient(signerName, signerEmail);

  const emailData: SignatureRequestEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_request', emailData, recipient);
}

/**
 * Send signature completion notification to all parties
 * 署名完了通知を全関係者に送信
 */
export async function sendSignatureCompletedEmail(
  data: Omit<SignatureCompletedEmailData, 'recipient'> & { recipient?: EmailRecipient },
  recipientEmail: string,
  recipientName: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const recipient = data.recipient || createRecipient(recipientName, recipientEmail);

  const emailData: SignatureCompletedEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_completed', emailData, recipient);
}

/**
 * Send signature declined notification to admin
 * 署名拒否通知を管理者に送信
 */
export async function sendSignatureDeclinedEmail(
  data: Omit<SignatureDeclinedEmailData, 'recipient'> & { recipient?: EmailRecipient },
  adminEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  let recipient = data.recipient;

  if (!recipient) {
    if (adminEmail) {
      recipient = createRecipient('Admin', adminEmail);
    } else {
      recipient = createRecipient('Admin', process.env.ADMIN_EMAIL || 'admin@epackage-lab.com');
    }
  }

  const emailData: SignatureDeclinedEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_declined', emailData, recipient);
}

/**
 * Send signature reminder email to pending signers
 * 署名リマインダーメールを未署名者に送信
 */
export async function sendSignatureReminderEmail(
  data: Omit<SignatureReminderEmailData, 'recipient'> & { recipient?: EmailRecipient },
  signerEmail: string,
  signerName: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const recipient = data.recipient || createRecipient(signerName, signerEmail);

  const emailData: SignatureReminderEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_reminder', emailData, recipient);
}


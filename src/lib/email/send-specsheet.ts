/**
 * SpecSheet Email Send Functions
 */

import { sendTemplatedEmail } from './transport';
import { createRecipient } from '../email-templates';
import type { EmailRecipient } from '../email-templates';
import type { SpecSheetApprovalEmailData, SpecSheetRejectionEmailData } from '../email-templates';

export async function sendSpecSheetApprovalEmail(
  data: Omit<SpecSheetApprovalEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
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

  const emailData: SpecSheetApprovalEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('spec_sheet_approval', emailData, recipient);
}

// =====================================================
// Spec Sheet Rejection (Admin)
// =====================================================

/**
 * Send spec sheet rejection notification to admin
 * 仕様書却下通知管理者に送信
 */
export async function sendSpecSheetRejectionEmail(
  data: Omit<SpecSheetRejectionEmailData, 'recipient'> & { recipient?: EmailRecipient },
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

  const emailData: SpecSheetRejectionEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('spec_sheet_rejection', emailData, recipient);
}

// =====================================================

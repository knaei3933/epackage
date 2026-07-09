/**
 * Admin Email Send Functions
 *
 * 管理者向けメール送信関数
 */

import { sendTemplatedEmail } from './transport';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@package-lab.com';
import { createRecipient } from '../email-templates';
import type { OrderStatusEmailData, QuoteCreatedEmailData } from '../email-templates';

export async function sendAdminNewOrderEmail(
  orderInfo: OrderStatusEmailData['orderInfo'],
  customerInfo: {
    name: string;
    email: string;
    company?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: OrderStatusEmailData = {
    recipient: createRecipient(customerInfo.name, customerInfo.email, customerInfo.company),
    orderInfo,
    status: 'processing',
  };

  return sendTemplatedEmail('admin_new_order', data, createRecipient('Admin', ADMIN_EMAIL));
}

/**
 * Send admin notification for quote request
 */
export async function sendAdminQuoteRequestEmail(
  quoteInfo: QuoteCreatedEmailData['quoteInfo'],
  customerInfo: {
    name: string;
    email: string;
    company?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: QuoteCreatedEmailData = {
    recipient: createRecipient(customerInfo.name, customerInfo.email, customerInfo.company),
    quoteInfo,
    quoteUrl: '', // Will be filled by system
  };

  return sendTemplatedEmail('admin_quote_request', data, createRecipient('Admin', ADMIN_EMAIL));
}

// =====================================================

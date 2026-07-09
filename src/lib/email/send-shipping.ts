/**
 * Shipping Email Send Functions
 */

import { sendTemplatedEmail } from './transport';
import { createRecipient } from '../email-templates';
import type { EmailRecipient } from '../email-templates';
import type { ShippingStatusEmailData, DeliveryCompletionEmailData } from '../email-templates';

export async function sendShippingStatusEmail(
  data: Omit<ShippingStatusEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string,
  customerName?: string,
  customerCompany?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // If recipient is not provided, try to create it from customer info
  let recipient = data.recipient;

  if (!recipient && customerEmail && customerName) {
    recipient = createRecipient(customerName, customerEmail, customerCompany);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided. Please provide either recipient object or customer email/name.',
    };
  }

  const emailData: ShippingStatusEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('shipping_status', emailData, recipient);
}

/**
 * Send delivery completion notification to customer
 * 配送完了通知メールを顧客に送信
 *
 * 商品が配送完了したことをお客様にお知らせするメールを送信します
 */
export async function sendDeliveryCompletionEmail(
  data: Omit<DeliveryCompletionEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string,
  customerName?: string,
  customerCompany?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // If recipient is not provided, try to create it from customer info
  let recipient = data.recipient;

  if (!recipient && customerEmail && customerName) {
    recipient = createRecipient(customerName, customerEmail, customerCompany);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided. Please provide either recipient object or customer email/name.',
    };
  }

  const emailData: DeliveryCompletionEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('delivery_completion', emailData, recipient);
}


/**
 * Customer Email Send Functions
 *
 * 顧客向けメール送信関数
 */

import { sendTemplatedEmail } from './transport';
import { createRecipient, type EmailRecipient } from '../email-templates';
import type {
  WelcomeEmailData,
  ApprovalEmailData,
  RejectionEmailData,
  QuoteCreatedEmailData,
  OrderStatusEmailData,
  ShipmentEmailData,
} from '../email-templates';

export async function sendWelcomeEmail(
  recipient: EmailRecipient,
  options?: {
    loginUrl?: string;
    tempPassword?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: WelcomeEmailData = {
    recipient,
    ...options,
  };

  return sendTemplatedEmail('welcome_customer', data, recipient);
}

/**
 * Send approval notification
 */
export async function sendApprovalEmail(
  recipient: EmailRecipient,
  requestType: string,
  requestDetails: string,
  approvedBy: string,
  options?: {
    approvalDate?: string;
    nextSteps?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: ApprovalEmailData = {
    recipient,
    requestType,
    requestDetails,
    approvedBy,
    approvalDate: options?.approvalDate || new Date().toISOString(),
    nextSteps: options?.nextSteps,
  };

  return sendTemplatedEmail('approval_customer', data, recipient);
}

/**
 * Send rejection notification
 */
export async function sendRejectionEmail(
  recipient: EmailRecipient,
  requestType: string,
  rejectionReason: string,
  options?: {
    alternativeOptions?: string;
    contactInfo?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: RejectionEmailData = {
    recipient,
    requestType,
    rejectionReason,
    alternativeOptions: options?.alternativeOptions,
    contactInfo: options?.contactInfo,
  };

  return sendTemplatedEmail('rejection_customer', data, recipient);
}

/**
 * Send quote created notification
 */
export async function sendQuoteCreatedEmail(
  recipient: EmailRecipient,
  quoteInfo: QuoteCreatedEmailData['quoteInfo'],
  quoteUrl: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: QuoteCreatedEmailData = {
    recipient,
    quoteInfo,
    quoteUrl,
  };

  return sendTemplatedEmail('quote_created_customer', data, recipient);
}

/**
 * Send order status update
 */
export async function sendOrderStatusUpdateEmail(
  recipient: EmailRecipient,
  orderInfo: OrderStatusEmailData['orderInfo'],
  status: OrderStatusEmailData['status'],
  options?: {
    estimatedCompletion?: string;
    statusDetails?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: OrderStatusEmailData = {
    recipient,
    orderInfo,
    status,
    ...options,
  };

  return sendTemplatedEmail('order_status_update', data, recipient);
}

/**
 * Send shipment notification
 */
export async function sendShipmentNotificationEmail(
  recipient: EmailRecipient,
  orderInfo: ShipmentEmailData['orderInfo'],
  shipmentInfo: ShipmentEmailData['shipmentInfo'],
  options?: {
    trackingUrl?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: ShipmentEmailData = {
    recipient,
    orderInfo,
    shipmentInfo,
    ...options,
  };

  return sendTemplatedEmail('shipment_notification', data, recipient);
}

/**
 * Send admin notification for new order
 */

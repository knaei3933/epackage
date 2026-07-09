/**
 * Misc Email Templates
 *
 * Auto-extracted from email-templates.ts
 */

import {
  formatDateJP,
  formatCurrencyJP,
  getJapaneseEmailHeader,
  getJapaneseEmailFooter,
  sanitizeContent,
  sanitizeText,
} from './helpers';
import type {
  EmailTemplate,
  EmailTemplateType,
  WelcomeEmailData,
  ApprovalEmailData,
  RejectionEmailData,
  QuoteCreatedEmailData,
  OrderStatusEmailData,
  ShipmentEmailData,
  KoreaDataTransferEmailData,
  KoreaCorrectionNotificationEmailData,
  SpecSheetApprovalEmailData,
  SpecSheetRejectionEmailData,
  SignatureRequestEmailData,
  SignatureCompletedEmailData,
  SignatureDeclinedEmailData,
  SignatureReminderEmailData,
  ShippingStatusEmailData,
  DeliveryCompletionEmailData,
  InvoiceEmailData,
  PaymentConfirmationEmailData,
  PurchaseOrderKoreaEmailData,
  KoreaDesignerUploadCompleteEmailData,
  TranslationFailedNoticeEmailData,
  DesignerTokenUploadEmailData,
  KoreaDesignerDataNotificationEmailData,
  CorrectionReadyForReviewEmailData,
  CorrectionRejectedEmailData,
  SampleRequestEmailData,
} from './types';

import {
  getWelcomeCustomerEmail,
  getApprovalCustomerEmail,
  getRejectionCustomerEmail,
  getQuoteCreatedCustomerEmail,
  getOrderStatusUpdateEmail,
  getShipmentNotificationCustomerEmail,
} from './customer-emails';
import {
  getAdminNewOrderEmail,
  getAdminQuoteRequestEmail,
} from './admin-emails';
import {
  getKoreaDataTransferEmail,
  getKoreaCorrectionNotificationEmail,
} from './korea-emails';
import {
  getSpecSheetApprovalEmail,
  getSpecSheetRejectionEmail,
} from './specsheet-emails';
import {
  getSignatureRequestEmail,
  getSignatureCompletedEmail,
  getSignatureDeclinedEmail,
  getSignatureReminderEmail,
} from './signature-emails';
import {
  getShippingStatusEmail,
  getDeliveryCompletionEmail,
} from './shipping-emails';
import {
  getInvoiceCreatedEmail,
  getInvoiceReminderEmail,
} from './invoice-emails';
import {
  getPaymentConfirmationEmail,
  getPurchaseOrderKoreaEmail,
} from './payment-emails';
import {
  getKoreaDesignerDataNotificationEmail,
  getCorrectionReadyForReviewEmail,
  getCorrectionRejectedEmail,
  getKoreaDesignerUploadCompleteEmail,
  getDesignerTokenUploadEmail,
  getTranslationFailedNoticeEmail,
} from './designer-emails';
import {
  getSampleRequestCustomerEmail,
  getSampleRequestAdminEmail,
} from './sample-emails';
import type { EmailRecipient } from './types';


export function renderEmailTemplate(
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
    | SignatureRequestEmailData
    | SignatureCompletedEmailData
    | SignatureDeclinedEmailData
    | SignatureReminderEmailData
    | ShippingStatusEmailData
    | DeliveryCompletionEmailData
    | InvoiceEmailData
    | (InvoiceEmailData & { daysOverdue?: number })
    | PaymentConfirmationEmailData
    | PurchaseOrderKoreaEmailData
    | KoreaDesignerUploadCompleteEmailData
    | TranslationFailedNoticeEmailData
    | DesignerTokenUploadEmailData
): EmailTemplate {
  switch (type) {
    case 'welcome_customer':
      return getWelcomeCustomerEmail(data as WelcomeEmailData);

    case 'approval_customer':
      return getApprovalCustomerEmail(data as ApprovalEmailData);

    case 'rejection_customer':
      return getRejectionCustomerEmail(data as RejectionEmailData);

    case 'quote_created_customer':
      return getQuoteCreatedCustomerEmail(data as QuoteCreatedEmailData);

    case 'order_status_update':
      return getOrderStatusUpdateEmail(data as OrderStatusEmailData);

    case 'shipment_notification':
      return getShipmentNotificationCustomerEmail(data as ShipmentEmailData);

    case 'admin_new_order':
      return getAdminNewOrderEmail(data as OrderStatusEmailData);

    case 'admin_quote_request':
      return getAdminQuoteRequestEmail(data as QuoteCreatedEmailData);

    case 'korea_data_transfer':
      return getKoreaDataTransferEmail(data as KoreaDataTransferEmailData);

    case 'korea_correction_notification':
      return getKoreaCorrectionNotificationEmail(data as KoreaCorrectionNotificationEmailData);

    case 'spec_sheet_approval':
      return getSpecSheetApprovalEmail(data as SpecSheetApprovalEmailData);

    case 'spec_sheet_rejection':
      return getSpecSheetRejectionEmail(data as SpecSheetRejectionEmailData);

    case 'signature_request':
      return getSignatureRequestEmail(data as SignatureRequestEmailData);

    case 'signature_completed':
      return getSignatureCompletedEmail(data as SignatureCompletedEmailData);

    case 'signature_declined':
      return getSignatureDeclinedEmail(data as SignatureDeclinedEmailData);

    case 'signature_reminder':
      return getSignatureReminderEmail(data as SignatureReminderEmailData);

    case 'shipping_status':
      return getShippingStatusEmail(data as ShippingStatusEmailData);

    case 'delivery_completion':
      return getDeliveryCompletionEmail(data as DeliveryCompletionEmailData);

    case 'invoice_created':
      return getInvoiceCreatedEmail(data as InvoiceEmailData);

    case 'invoice_reminder':
    case 'invoice_overdue':
      return getInvoiceReminderEmail(data as InvoiceEmailData & { daysOverdue?: number });

    case 'payment_confirmation':
      return getPaymentConfirmationEmail(data as PaymentConfirmationEmailData);

    case 'purchase_order_korea':
      return getPurchaseOrderKoreaEmail(data as PurchaseOrderKoreaEmailData);

    case 'korea_designer_data_notification':
      return getKoreaDesignerDataNotificationEmail(data as KoreaDesignerDataNotificationEmailData);

    case 'correction_ready_for_review':
      return getCorrectionReadyForReviewEmail(data as CorrectionReadyForReviewEmailData);

    case 'correction_rejected':
      return getCorrectionRejectedEmail(data as CorrectionRejectedEmailData);

    case 'korea_designer_upload_complete':
      return getKoreaDesignerUploadCompleteEmail(data as KoreaDesignerUploadCompleteEmailData);

    case 'translation_failed_notice':
      return getTranslationFailedNoticeEmail(data as TranslationFailedNoticeEmailData);

    case 'designer_token_upload':
      return getDesignerTokenUploadEmail(data as DesignerTokenUploadEmailData);

    case 'sample_request_customer':
      return getSampleRequestCustomerEmail(data as SampleRequestEmailData);

    case 'sample_request_admin':
      return getSampleRequestAdminEmail(data as SampleRequestEmailData);

    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

// =====================================================
// Helper: Generate consistent recipient data
// =====================================================

/**
 * Create recipient object from basic info
 */

export function createRecipient(
  name: string,
  email: string,
  company?: string
): EmailRecipient {
  return {
    name: sanitizeContent(name),
    email: sanitizeContent(email),
    company: company ? sanitizeContent(company) : undefined,
  };
}

// =====================================================
// Payment Confirmation Email Template
// =====================================================

/**
 * 入金確認メール（顧客向け）
 * Payment Confirmation Email (Customer)
 */


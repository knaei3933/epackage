/**
 * Email Templates Barrel Export
 *
 * メールテンプレート統合エクスポート
 */

// Types — export from types.ts only
export type {
  EmailRecipient,
  OrderInfo,
  ShipmentInfo,
  QuoteInfo,
  TemplateData,
  WelcomeEmailData,
  ApprovalEmailData,
  RejectionEmailData,
  QuoteCreatedEmailData,
  OrderStatusEmailData,
  ShipmentEmailData,
  KoreaCorrectionNotificationEmailData,
  KoreaDataTransferEmailData,
  SpecSheetApprovalEmailData,
  SpecSheetRejectionEmailData,
  SignatureRequestEmailData,
  SignatureCompletedEmailData,
  SignatureDeclinedEmailData,
  SignatureReminderEmailData,
  ShippingStatusEmailData,
  DeliveryCompletionEmailData,
  SampleRequestEmailData,
  InvoiceEmailData,
  PaymentConfirmationEmailData,
  PurchaseOrderKoreaEmailData,
  KoreaDesignerDataNotificationEmailData,
  CorrectionReadyForReviewEmailData,
  CorrectionRejectedEmailData,
  KoreaDesignerUploadCompleteEmailData,
  DesignerTokenUploadEmailData,
  TranslationFailedNoticeEmailData,
  EmailTemplate,
  EmailTemplateType,
} from './types';

// Helpers
export {
  sanitizeContent,
  sanitizeText,
  formatDateJP,
  formatCurrencyJP,
  getJapaneseEmailHeader,
  getJapaneseEmailFooter,
} from './helpers';

// Template functions — explicit to avoid type re-export conflicts
export {
  getWelcomeCustomerEmail,
  getApprovalCustomerEmail,
  getRejectionCustomerEmail,
  getQuoteCreatedCustomerEmail,
  getOrderStatusUpdateEmail,
  getShipmentNotificationCustomerEmail,
} from './customer-emails';
export {
  getAdminNewOrderEmail,
  getAdminQuoteRequestEmail,
} from './admin-emails';
export {
  getKoreaDataTransferEmail,
  getKoreaCorrectionNotificationEmail,
} from './korea-emails';
export {
  getSpecSheetApprovalEmail,
  getSpecSheetRejectionEmail,
} from './specsheet-emails';
export {
  getSignatureRequestEmail,
  getSignatureCompletedEmail,
  getSignatureDeclinedEmail,
  getSignatureReminderEmail,
} from './signature-emails';
export {
  getShippingStatusEmail,
  getDeliveryCompletionEmail,
} from './shipping-emails';
export {
  getInvoiceCreatedEmail,
  getInvoiceReminderEmail,
} from './invoice-emails';
export {
  getPaymentConfirmationEmail,
  getPurchaseOrderKoreaEmail,
} from './payment-emails';
export {
  getKoreaDesignerDataNotificationEmail,
  getCorrectionReadyForReviewEmail,
  getCorrectionRejectedEmail,
  getKoreaDesignerUploadCompleteEmail,
  getDesignerTokenUploadEmail,
  getTranslationFailedNoticeEmail,
} from './designer-emails';
export {
  getSampleRequestCustomerEmail,
  getSampleRequestAdminEmail,
} from './sample-emails';
export {
  renderEmailTemplate,
  createRecipient,
} from './misc-emails';

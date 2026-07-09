/**
 * Email Templates Barrel Export
 *
 * メールテンプレート統合エクスポート
 * Re-exports everything from email-templates.ts for modular imports.
 */

export * from './types';
export * from './helpers';
export {
  renderEmailTemplate,
  createRecipient,
  getWelcomeCustomerEmail,
  getApprovalCustomerEmail,
  getRejectionCustomerEmail,
  getQuoteCreatedCustomerEmail,
  getOrderStatusUpdateEmail,
  getShipmentNotificationCustomerEmail,
  getAdminNewOrderEmail,
  getAdminQuoteRequestEmail,
  getKoreaDataTransferEmail,
  getKoreaCorrectionNotificationEmail,
  getSpecSheetApprovalEmail,
  getSpecSheetRejectionEmail,
  getSignatureRequestEmail,
  getSignatureCompletedEmail,
  getSignatureDeclinedEmail,
  getSignatureReminderEmail,
  getShippingStatusEmail,
  getDeliveryCompletionEmail,
  getInvoiceCreatedEmail,
  getInvoiceReminderEmail,
  getPaymentConfirmationEmail,
  getPurchaseOrderKoreaEmail,
  getKoreaDesignerDataNotificationEmail,
  getCorrectionReadyForReviewEmail,
  getCorrectionRejectedEmail,
  getKoreaDesignerUploadCompleteEmail,
  getDesignerTokenUploadEmail,
  getTranslationFailedNoticeEmail,
  getSampleRequestCustomerEmail,
  getSampleRequestAdminEmail,
} from '../email-templates';

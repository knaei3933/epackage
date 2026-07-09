/**
 * Email Module Barrel Export
 *
 * メール送信モジュール統合エクスポート
 */

export * from './types';
export {
  getStoredEmails,
  clearStoredEmails,
  sendEmail,
  getEmailConfigStatus,
  sendTemplatedEmail,
} from './transport';
export { createRecipient } from '../email-templates';
export {
  sendContactEmail,
  sendSampleRequestEmail,
} from './send-contact';
export { sendWorkOrderEmails } from './send-work-order';
export {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendQuoteCreatedEmail,
  sendOrderStatusUpdateEmail,
  sendShipmentNotificationEmail,
} from './send-customer';
export {
  sendAdminNewOrderEmail,
  sendAdminQuoteRequestEmail,
} from './send-admin';
export {
  sendKoreaDataTransferEmail,
  sendKoreaDataTransferWithAttachments,
  sendKoreaCorrectionNotificationEmail,
} from './send-korea';
export {
  sendSpecSheetApprovalEmail,
  sendSpecSheetRejectionEmail,
} from './send-specsheet';
export {
  sendSignatureRequestEmail,
  sendSignatureCompletedEmail,
  sendSignatureDeclinedEmail,
  sendSignatureReminderEmail,
} from './send-signature';
export {
  sendShippingStatusEmail,
  sendDeliveryCompletionEmail,
} from './send-shipping';
export { sendManufacturerOrderEmail } from './send-manufacturer';

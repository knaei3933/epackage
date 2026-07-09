/**
 * Email Template Type Definitions
 *
 * メールテンプレート型定義
 * Re-exported from email-templates.ts for modular imports.
 */

export interface EmailRecipient {
  name: string;
  email: string;
  company?: string;
}

export interface OrderInfo {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ShipmentInfo {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: string;
}

export interface QuoteInfo {
  quoteId: string;
  validUntil: string;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export interface TemplateData {
  recipient: EmailRecipient;
}

export interface WelcomeEmailData extends TemplateData {
  registrationDate: string;
  loginUrl: string;
}

export interface ApprovalEmailData extends TemplateData {
  approvalDate: string;
  loginUrl: string;
}

export interface RejectionEmailData extends TemplateData {
  rejectionDate: string;
  rejectionReason: string;
  contactUrl: string;
}

export interface QuoteCreatedEmailData extends TemplateData {
  quoteInfo: QuoteInfo;
  quoteUrl: string;
}

export interface OrderStatusEmailData extends TemplateData {
  orderInfo: OrderInfo;
  newStatus: string;
  statusMessage: string;
  orderUrl?: string;
}

export interface ShipmentEmailData extends TemplateData {
  shipmentInfo: ShipmentInfo;
  orderInfo: OrderInfo;
}

export interface KoreaCorrectionNotificationEmailData extends TemplateData {
  orderId: string;
  correctionType: string;
  correctionDetails: string;
  koreaContactUrl: string;
}

export interface SpecSheetApprovalEmailData extends TemplateData {
  specSheetId: string;
  productName: string;
  approvalDate: string;
  specSheetUrl: string;
}

export interface SpecSheetRejectionEmailData extends TemplateData {
  specSheetId: string;
  productName: string;
  rejectionDate: string;
  rejectionReason: string;
  specSheetUrl: string;
}

export interface SignatureRequestEmailData extends TemplateData {
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  expiryDate: string;
}

export interface SignatureCompletedEmailData extends TemplateData {
  documentId: string;
  documentTitle: string;
  signedDate: string;
  downloadUrl: string;
}

export interface SignatureDeclinedEmailData extends TemplateData {
  documentId: string;
  documentTitle: string;
  declinedDate: string;
  declineReason: string;
}

export interface SignatureReminderEmailData extends TemplateData {
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  expiryDate: string;
}

export interface ShippingStatusEmailData extends TemplateData {
  orderId: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number }>;
  shippingMethod: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: string;
}

export interface DeliveryCompletionEmailData extends TemplateData {
  orderId: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number }>;
  deliveryDate: string;
  reviewUrl: string;
}

export interface SampleRequestEmailData extends TemplateData {
  requestId: string;
  sampleItems: Array<{ name: string; quantity: string; notes?: string }>;
  shippingAddress: string;
  requestNotes?: string;
  adminDashboardUrl: string;
}

export interface KoreaDataTransferEmailData extends TemplateData {
  orderId: string;
  koreaContactUrl: string;
}

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export type EmailTemplateType =
  | 'welcome'
  | 'approval'
  | 'rejection'
  | 'quote_created'
  | 'order_status_update'
  | 'shipment_notification'
  | 'admin_new_order'
  | 'admin_quote_request'
  | 'korea_data_transfer'
  | 'korea_correction_notification'
  | 'specsheet_approval'
  | 'specsheet_rejection'
  | 'signature_request'
  | 'signature_completed'
  | 'signature_declined'
  | 'signature_reminder'
  | 'shipping_status'
  | 'delivery_completion'
  | 'sample_request'
  | 'invoice_created'
  | 'invoice_reminder'
  | 'payment_confirmation'
  | 'purchase_order_korea'
  | 'korea_designer_data_notification'
  | 'correction_ready_for_review'
  | 'correction_rejected'
  | 'korea_designer_upload_complete'
  | 'designer_token_upload'
  | 'translation_failed_notice';

export interface InvoiceEmailData {
  invoiceNumber: string;
  orderNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  companyName: string;
  contactPerson?: string;
  invoicePdfUrl?: string;
  paymentMethod?: string;
  remarks?: string;
}

export interface PaymentConfirmationEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  totalAmount: number;
}

export interface PurchaseOrderKoreaEmailData extends TemplateData {
  orderNumber: string;
  companyName: string;
  items: Array<{
    productName: string;
    quantity: number;
    specifications: Record<string, any>;
  }>;
  totalQuantity: number;
  estimatedDelivery: string;
  purchaseOrderPdfUrl?: string;
}

export interface KoreaDesignerDataNotificationEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  dataUploadUrl: string;
  correctionUploadUrl: string;
}

export interface CorrectionReadyForReviewEmailData extends TemplateData {
  orderNumber: string;
  revisionNumber: number;
  previewImageUrl: string;
  reviewUrl: string;
}

export interface CorrectionRejectedEmailData extends TemplateData {
  orderNumber: string;
  customerComment: string;
  correctionUploadUrl: string;
}

export interface KoreaDesignerUploadCompleteEmailData extends TemplateData {
  orderNumber: string;
  revisionNumber: number;
  previewImageUrl: string;
  reviewUrl: string;
  commentKo?: string;
  commentJa?: string;
  translationStatus: 'pending' | 'translated' | 'failed' | 'manual';
  designerName: string;
}

export interface DesignerTokenUploadEmailData extends TemplateData {
  uploadUrl: string;
  orderNumber: string;
  customerName: string;
  expiresAt: string;
  expiresInDays: number;
  designerName: string;
}

export interface TranslationFailedNoticeEmailData extends TemplateData {
  orderNumber: string;
  revisionId: string;
  originalTextKo: string;
  errorDetails: string;
  manualTranslateUrl: string;
}

/**
 * Email Template Type Definitions
 *
 * メールテンプレート型定義
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
  sender?: {
    name: string;
    email: string;
    title?: string;
  };
}


export interface WelcomeEmailData extends TemplateData {
  loginUrl?: string;
  tempPassword?: string;
}


export interface ApprovalEmailData extends TemplateData {
  requestType: string;
  requestDetails: string;
  approvedBy: string;
  approvalDate: string;
  nextSteps?: string;
}


export interface RejectionEmailData extends TemplateData {
  requestType: string;
  rejectionReason: string;
  alternativeOptions?: string;
  contactInfo?: string;
}


export interface QuoteCreatedEmailData extends TemplateData {
  quoteInfo: QuoteInfo;
  quoteUrl: string;
}


export interface OrderStatusEmailData extends TemplateData {
  orderInfo: OrderInfo;
  status: 'processing' | 'in_production' | 'quality_check' | 'ready' | 'delayed';
  estimatedCompletion?: string;
  statusDetails?: string;
}


export interface ShipmentEmailData extends TemplateData {
  orderInfo: OrderInfo;
  shipmentInfo: ShipmentInfo;
  trackingUrl?: string;
}


export interface KoreaCorrectionNotificationEmailData extends TemplateData {
  orderId: string;
  orderNumber: string;
  correctionDescription: string;
  correctedFiles: Array<{
    fileName: string;
    fileUrl: string;
  }>;
  correctionDate: string;
  notes?: string;
}


export interface SpecSheetApprovalEmailData extends TemplateData {
  specNumber: string;
  orderNumber: string;
  customerName: string;
  approvedAt: string;
  comments?: string;
}


export interface SpecSheetRejectionEmailData extends TemplateData {
  specNumber: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  requestedChanges?: string[];
  rejectedAt: string;
}

// =====================================================
// Signature Email Templates
// =====================================================


export interface SignatureRequestEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  signingUrl?: string;
  expiresAt: string;
  signers: Array<{
    name: string;
    email: string;
  }>;
  message?: string;
}


export interface SignatureCompletedEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  completedAt: string;
  signers: Array<{
    name: string;
    email: string;
    signedAt: string;
  }>;
  documentUrl?: string;
}


export interface SignatureDeclinedEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  declinedBy: string;
  declinedAt: string;
  reason?: string;
}


export interface SignatureReminderEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  signingUrl: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

/**
 * Shipping Status Email Data
 * 配送状況メールデータ
 */

export interface ShippingStatusEmailData extends TemplateData {
  orderNumber: string;
  trackingNumber: string;
  carrier: 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other';
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  message: string;
  trackingUrl?: string;
  japanPostUrl?: string;
  estimatedDelivery?: string;
  location?: string;
}

/**
 * Delivery Completion Email Data
 * 配送完了メールデータ
 */

export interface DeliveryCompletionEmailData extends TemplateData {
  orderNumber: string;
  shipmentNumber: string;
  trackingNumber: string;
  carrierName: string;
  carrier: 'yamato' | 'sagawa' | 'jp_post' | 'seino';
  deliveredAt: string;
  deliveredTo?: string;
  deliveryAddress?: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
  };
  items?: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryNoteUrl?: string;
}

/**
 * Sample Request Email Data
 * サンプルリクエストメールデータ
 */

export interface SampleRequestEmailData extends TemplateData {
  requestId: string;
  samples: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryDestinations: Array<{
    companyName?: string;
    contactPerson: string;
    phone: string;
    address: string;
  }>;
  message: string;
}


export type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};


export type EmailTemplateType =
  | 'welcome_customer'
  | 'approval_customer'
  | 'rejection_customer'
  | 'quote_created_customer'
  | 'order_status_update'
  | 'shipment_notification'
  | 'admin_new_order'
  | 'admin_quote_request'
  | 'admin_shipment_alert'
  | 'korea_data_transfer'
  | 'korea_correction_notification'
  | 'spec_sheet_approval'
  | 'spec_sheet_rejection'
  | 'signature_request'
  | 'signature_completed'
  | 'signature_declined'
  | 'signature_reminder'
  | 'shipping_status'
  | 'delivery_completion'
  | 'invoice_created'
  | 'invoice_reminder'
  | 'invoice_overdue'
  | 'payment_confirmation'
  | 'purchase_order_korea'
  | 'order_created_customer'
  | 'order_created_admin'
  | 'spec_rejected_admin'
  | 'production_started_customer'
  | 'shipping_info_customer'
  | 'archive_completed_admin'
  | 'korea_designer_data_notification'
  | 'correction_ready_for_review'
  | 'correction_rejected'
  | 'korea_designer_upload_complete'
  | 'translation_failed_notice'
  | 'designer_token_upload'
  | 'sample_request_customer'
  | 'sample_request_admin';

// =====================================================
// Welcome Email Templates
// =====================================================

export interface KoreaDataTransferEmailData extends TemplateData {
  orderId: string;
  quotationNumber: string;
  customerName: string;
  customerCompany?: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  aiExtractedData: {
    designSpecs?: Record<string, any>;
    materials?: Array<{ name: string; quantity: number }>;
    dimensions?: { width?: number; height?: number; depth?: number };
    colors?: string[];
    specialRequirements?: string;
  };
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  notes?: string;
  urgency?: 'normal' | 'urgent' | 'expedited';
}

/**
 * 韓国パートナーデータ転送メールテンプレート
 */

export interface InvoiceEmailData {
  /** 請求書番号 / Invoice number */
  invoiceNumber: string;
  /** 注文番号 / Order number */
  orderNumber: string;
  /** 発行日 / Issue date */
  issueDate: string;
  /** 支払期限 / Payment due date */
  dueDate: string;
  /** 請求金額 / Invoice amount */
  amount: number;
  /** 会社名 / Company name */
  companyName: string;
  /** 担当者名 / Contact person name */
  contactPerson?: string;
  /** 請求書PDF URL / Invoice PDF URL */
  invoicePdfUrl?: string;
  /** 支払方法 / Payment method */
  paymentMethod?: string;
  /** 備考 / Remarks */
  remarks?: string;
}

/**
 * 入金確認メールデータ
 * Payment Confirmation Email Data
 */

export interface PaymentConfirmationEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  totalAmount: number;
}

/**
 * 韓国発注書メールデータ
 * Purchase Order to Korea Email Data
 */

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

/**
 * 韓国デザイナーデータ入稿通知メールデータ
 * Korea Designer Data Notification Email Data
 */

export interface KoreaDesignerDataNotificationEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  dataUploadUrl: string;
  correctionUploadUrl: string;
}

/**
 * 教正データ完成通知メールデータ（顧客向け）
 * Correction Ready for Review Email Data
 */

export interface CorrectionReadyForReviewEmailData extends TemplateData {
  orderNumber: string;
  revisionNumber: number;
  previewImageUrl: string;
  reviewUrl: string;
}

/**
 * 教正データ差し戻し通知メールデータ（韓国デザイナー向け）
 * Correction Rejected Email Data
 */

export interface CorrectionRejectedEmailData extends TemplateData {
  orderNumber: string;
  customerComment: string;
  correctionUploadUrl: string;
}

/**
 * 韓国デザイナーアップロード完了通知メールデータ
 * Korea Designer Upload Complete Email Data
 */

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

/**
 * デザイナートークンアップロードメールデータ（韓国語）
 * Designer Token Upload Email Data (Korean)
 */

export interface DesignerTokenUploadEmailData extends TemplateData {
  uploadUrl: string;
  orderNumber: string;
  customerName: string;
  expiresAt: string;
  expiresInDays: number;
  designerName: string;
}

/**
 * 翻訳失敗通知メールデータ（管理者向け）
 * Translation Failed Notice Email Data (Admin)
 */

export interface TranslationFailedNoticeEmailData extends TemplateData {
  orderNumber: string;
  revisionId: string;
  originalTextKo: string;
  errorDetails: string;
  manualTranslateUrl: string;
}

/**
 * 請求書発行メール（顧客向け）
 * Invoice Created Email (Customer)
 */

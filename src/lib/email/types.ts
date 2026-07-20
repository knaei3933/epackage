/**
 * Email Types
 *
 * メール送信関連の型定義
 */

export interface ContactEmailData {
  name: string;
  nameKana?: string;
  email: string;
  company?: string;
  inquiryType: string;
  subject: string;
  message: string;
  urgency?: string;
  preferredContact?: string;
  phone?: string;
  fax?: string;
  postalCode?: string;
  address?: string;
}

export interface SampleRequestEmailData {
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  samples: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryType: string;
  deliveryDestinations: Array<{
    companyName?: string;
    contactPerson: string;
    phone: string;
    address: string;
  }>;
  message: string;
}

export interface AdminNotificationData {
  type: 'contact' | 'sample_request';
  requestId: string;
  timestamp: string;
  data: ContactEmailData | SampleRequestEmailData;
}

// =====================================================
// 会員お問い合わせスレッド機能（/member/inquiries）
// =====================================================

/**
 * お問い合わせ添付ファイル情報（メール本文の添付リスト表示用）
 * Storage の signed URL は期限付きのため、メールには URL ではなく
 * ファイル名・サイズのみを表示（管理者画面へのリンクを案内）
 */
export interface InquiryAttachmentInfo {
  file_name: string;
  mime_type: string;
  file_size: number;
}

/**
 * お問い合わせ受付通知メールデータ（管理者へ送信）
 * - to: ADMIN_EMAIL
 * - replyTo: 会員のメールアドレス（管理者が直接返信できるよう）
 */
export interface InquiryReceivedEmailData {
  /** お問い合わせ番号（inquiry_number） */
  inquiryNumber: string;
  /**
   * 注文番号（注文のお問い合わせ場合のみ・任意）
   * 指定時は本文に「【注文番号】」行を追加表示（AC-ROB-4）
   */
  orderNumber?: string;
  /** 件名 */
  subject: string;
  /** 会員のメールアドレス（replyTo・本文にも表示） */
  memberEmail: string;
  /** 会員の表示名（漢字） */
  memberName: string;
  /** 第1メッセージ本文 */
  messageBody: string;
  /** お問い合わせ種別（product/quotation/sample 等） */
  inquiryType: string;
  /** 添付ファイル（任意） */
  attachments?: InquiryAttachmentInfo[];
}

/**
 * お問い合わせ回答通知メールデータ（会員へ送信）
 * - to: 会員のメールアドレス
 */
export interface InquiryRepliedEmailData {
  /** お問い合わせ番号 */
  inquiryNumber: string;
  /**
   * 注文番号（注文のお問い合わせ場合のみ・任意）
   * 指定時は本文に「【注文番号】」行を追加表示（AC-ROB-4）
   */
  orderNumber?: string;
  /** 件名 */
  subject: string;
  /** 会員のメールアドレス（送信先） */
  memberEmail: string;
  /** 会員の表示名（漢字・本文の宛名用） */
  memberName: string;
  /** 管理者の回答本文 */
  adminReply: string;
  /** 添付ファイル（任意・管理者が添付した場合） */
  attachments?: InquiryAttachmentInfo[];
}

export interface WorkOrderData {
  workOrderId: string;
  workOrderNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  estimatedCompletion: string;
  productionTimeline: {
    total_days: number;
    steps: Array<{
      step: string;
      name_ja: string;
      name_en: string;
      duration_days: number;
    }>;
  };
  materialRequirements: Array<{
    material_name: string;
    quantity: number;
    unit: string;
  }>;
  items: Array<{
    product_name: string;
    quantity: number;
  }>;
}

export interface ManufacturerOrderItem {
  productName: string;
  bagType: string;
  quantity: number;
  specifications?: {
    size?: string;
    material?: string;
    printing?: string;
    spoutSize?: number;
  };
  materialCostKRW: number;
  printingCostKRW: number;
  laminationCostKRW: number;
  slitterCostKRW: number;
  pouchProcessingCostKRW: number;
  surfaceTreatmentCostKRW: number;
  postProcessingTotalKRW: number;
  baseCostKRW: number;
  manufacturerMarginRate?: number;
  manufacturerMarginKRW: number;
  manufacturingCostKRW: number;
  spoutPriceKRW?: number;
  spoutQuantity?: number;
  spoutCostKRW?: number;
  spoutRoundTripShippingKRW?: number;
  outsourcingShippingKRW?: number;
  materialMarkupRate?: number;
  laminationUnitPriceKRW?: number;
  laminationCycles?: number;
  hasALMaterial?: boolean;
  slitterUnitPriceKRW?: number;
  slitterMinCostKRW?: number;
}

export interface ManufacturerOrderEmailData {
  quoteNumber: string;
  customerName: string;
  recipientEmail: string;
  items: ManufacturerOrderItem[];
  totalManufacturingCostKRW: number;
  notes?: string;
}

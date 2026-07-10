/**
 * PDF Generator Type Definitions
 *
 * Types for Quote, Invoice, and PDF generation.
 */

/**
 * Quote data structure for PDF generation
 */
export interface QuoteData {
  /** 見積番号 / Quote number */
  quoteNumber: string;
  /** 発行日 / Issue date */
  issueDate: string;
  /** 有効期限 / Expiry date */
  expiryDate: string;
  /** 見積作成者 / Quote creator */
  quoteCreator?: string;

  // Customer information
  /** 顧客名 / Customer name */
  customerName: string;
  /** 顧客名（カナ）/ Customer name (Katakana) */
  customerNameKana?: string;
  /** 会社名 / Company name */
  companyName?: string;
  /** 郵便番号 / Postal code */
  postalCode?: string;
  /** 住所 / Address */
  address?: string;
  /** 担当者名 / Contact person */
  contactPerson?: string;
  /** 電話番号 / Phone number */
  phone?: string;
  /** メールアドレス / Email address */
  email?: string;

  // Quote items
  /** 明細アイテム / Line items */
  items: QuoteItem[];

  // ========================================
  // Phase 5: グラビア印刷オプション（オプショナル・後方互換）
  // 契約: src/lib/types/gravure-cost-breakdown.ts (GravureCostBreakdown)
  // 未設定時はデジタル扱い（既存PDF無影響）
  // ========================================
  /** 印刷方式 / Printing method ('digital' 既定 / 'gravure') */
  printingType?: 'digital' | 'gravure';
  /** グラビア原価明細（円表示用） / Gravure cost breakdown (JPY for display) */
  gravureDetails?: {
    /** 銅版費（円）/ Copper plate cost (JPY) = convertKRWtoJPY(gravureCopperPlateCostKRW) */
    copperPlateCost?: number;
    /** 原反値（円）/ Gravure film value (JPY) */
    filmValue?: number;
    /** ラミネート費（円）/ Lamination cost (JPY) */
    laminationCost?: number;
    /** 印刷費（円）/ Printing cost (JPY) */
    printingCost?: number;
    /** 原材料費（円）/ Raw material cost (JPY) */
    materialCost?: number;
    /** 製作長 (m) / Production meters (loss 500m included) */
    productionMeters?: number;
    /** 原反幅 (mm) / Material width */
    materialWidthMM?: number;
    /** 原反値（ウォン・参考）/ Gravure film value (KRW, for reference) */
    filmValueKRW?: number;
    /** 銅版費（ウォン・参考）/ Copper plate cost (KRW, for reference) */
    copperPlateCostKRW?: number;
  };

  // Product specifications (for Excel template format)
  /** 製品仕様 / Product specifications */
  specifications?: {
    specNumber?: string;
    bagType?: string;
    contents?: string;
    size?: string;
    material?: string;
    thicknessType?: string;
    printingType?: string;
    sealWidth?: string;
    sealDirection?: string;
    notchShape?: string;
    notchPosition?: string;
    hanging?: string;
    hangingPosition?: string;
    zipperPosition?: string;
    cornerR?: string;
    // スパウトパウチ用
    spoutPosition?: string;
  spoutSize?: string;
  hasGusset?: string;
    // ロールフィルム用
    rollFilmSpecs?: {
      materialWidth?: number;
      pitch?: number;  // デザインの繰り返し周期（ピッチ）
      totalLength?: number;
      rollCount?: number;
    };
  };

  // Optional processing (for Excel template format)
  /** オプション加工 / Optional processing */
  optionalProcessing?: {
    zipper?: boolean;
    notch?: boolean;
    hangingHole?: boolean;
    hangHoleSize?: '6mm' | '8mm';
    cornerProcessing?: boolean;
    gasValve?: boolean;
    easyCut?: boolean;
    dieCut?: boolean;
    surfaceFinish?: '光沢仕上げ' | 'マット仕上げ';
    zipperPositionSpecified?: boolean;
    openingPosition?: '上端' | '下端';
  };

  // Terms and conditions
  /** 支払条件 / Payment terms */
  paymentTerms: string;
  /** 納期 / Delivery date */
  deliveryDate: string;
  /** 納入場所 / Delivery location */
  deliveryLocation: string;
  /** 有効期間 / Validity period */
  validityPeriod: string;
  /** 備考 / Remarks */
  remarks?: string;

  // SKU data (optional, for multi-SKU quotes)
  /** SKUデータ / SKU data */
  skuData?: {
    /** SKU数 / Number of SKUs */
    count: number;
    /** SKU明細 / SKU items */
    items: Array<{
      /** SKU番号 / SKU number */
      skuNumber: number;
      /** 数量 / Quantity */
      quantity: number;
      /** 単価 / Unit price */
      unitPrice: number;
      /** 金額 / Amount */
      totalPrice: number;
    }>;
  };

  // Payment information
  /** 振込口座 / Bank account */
  bankInfo?: {
    /** 銀行名 / Bank name */
    bankName: string;
    /** 支店名 / Branch name */
    branchName: string;
    /** 口座種類 / Account type */
    accountType: '普通' | '当座';
    /** 口座番号 / Account number */
    accountNumber: string;
    /** 口座名義 / Account holder */
    accountHolder: string;
  };

  // Coupon information
  /** 適用されたクーポン / Applied coupon */
  appliedCoupon?: {
    /** クーポンコード / Coupon code */
    code: string;
    /** クーポン名（英語）/ Coupon name (English) */
    name: string;
    /** クーポン名（日本語）/ Coupon name (Japanese) */
    nameJa: string;
    /** クーポンタイプ / Coupon type */
    type: 'percentage' | 'fixed';
    /** クーポン値 / Coupon value */
    value: number;
    /** 割引額 / Discount amount */
    discountAmount: number;
  };
  /** 割引額 / Discount amount */
  discountAmount?: number;
  /** 調整後合計 / Adjusted total */
  adjustedTotal?: number;

  // Supplier information (optional, will use defaults if not provided)
  supplierInfo?: {
    /** 会社名 / Company name */
    name: string;
    /** サブブランド / Sub brand (optional) */
    subBrand?: string;
    /** 会社名（フル）/ Company name (full) */
    companyName?: string;
    /** 郵便番号 / Postal code */
    postalCode: string;
    /** 住所 / Address */
    address: string;
    /** 電話番号 / Phone number */
    phone: string;
    /** メールアドレス / Email address */
    email: string;
    /** 説明 / Description */
    description?: string;
    /** 代表者名 / Representative name */
    representative?: string;
    /** 登録番号 / Business registration number */
    registrationNumber?: string;
  };
}

/**
 * Quote line item
 */
export interface QuoteItem {
  /** 項目ID / Item ID */
  id: string;
  /** 商品名・サービス名 / Product/service name */
  name: string;
  /** 説明 / Description */
  description?: string;
  /** 数量 / Quantity */
  quantity: number;
  /** 単位 / Unit */
  unit: string;
  /** 単価（円）/ Unit price (JPY) */
  unitPrice: number;
  /** 金額（円）/ Amount (JPY) - calculated if not provided */
  amount?: number;
  /** SKU内訳 (optional) / SKU breakdown */
  skuBreakdown?: Array<{
    /** SKU番号 / SKU number */
    skuNumber: number;
    /** 数量 / Quantity */
    quantity: number;
  }>;
}

/**
 * Invoice data structure for PDF generation
 */
export interface InvoiceData {
  /** 請求書番号 / Invoice number */
  invoiceNumber: string;
  /** 発行日 / Issue date */
  issueDate: string;
  /** 支払期限 / Payment due date */
  dueDate: string;

  // Billing information
  /** 請求先名 / Billing name */
  billingName: string;
  /** 請求先名（カタカナ）/ Billing name (Katakana) */
  billingNameKana?: string;
  /** 会社名 / Company name */
  companyName?: string;
  /** 郵便番号 / Postal code */
  postalCode?: string;
  /** 住所 / Address */
  address?: string;
  /** 担当者名 / Contact person */
  contactPerson?: string;

  // Shipping information (optional, same as billing if not provided)
  /** 納品先名 / Shipping name */
  shippingName?: string;
  /** 納品先住所 / Shipping address */
  shippingAddress?: string;

  // Invoice items
  /** 明細アイテム / Line items */
  items: InvoiceItem[];

  // Payment information
  /** 支払方法 / Payment method */
  paymentMethod: string;
  /** 振込口座 / Bank account */
  bankInfo?: {
    /** 銀行名 / Bank name */
    bankName: string;
    /** 支店名 / Branch name */
    branchName: string;
    /** 口座種類 / Account type */
    accountType: '普通' | '当座';
    /** 口座番号 / Account number */
    accountNumber: string;
    /** 口座名義 / Account holder */
    accountHolder: string;
  };

  // Supplier information (optional, will use defaults if not provided)
  supplierInfo?: {
    /** 会社名 / Company name */
    name: string;
    /** サブブランド / Sub brand (optional) */
    subBrand?: string;
    /** 会社名（フル）/ Company name (full) */
    companyName?: string;
    /** 郵便番号 / Postal code */
    postalCode: string;
    /** 住所 / Address */
    address: string;
    /** 電話番号 / Phone number */
    phone: string;
    /** メールアドレス / Email address */
    email: string;
    /** 説明 / Description */
    description?: string;
    /** 登録番号 / Business registration number */
    registrationNumber?: string;
    /** 担当者名 / Contact person */
    contactPerson?: string;
  };

  // Coupon information
  /** 適用されたクーポン / Applied coupon */
  appliedCoupon?: {
    /** クーポンコード / Coupon code */
    code: string;
    /** クーポン名（英語）/ Coupon name (English) */
    name: string;
    /** クーポン名（日本語）/ Coupon name (Japanese) */
    nameJa: string;
    /** クーポンタイプ / Coupon type */
    type: 'percentage' | 'fixed';
    /** クーポン値 / Coupon value */
    value: number;
    /** 割引額 / Discount amount */
    discountAmount: number;
  };
  /** 割引額 / Discount amount */
  discountAmount?: number;
  /** 調整後合計 / Adjusted total */
  adjustedTotal?: number;

  /** 備考 / Remarks */
  remarks?: string;
}

/**
 * Invoice line item
 */
export interface InvoiceItem {
  /** 項目ID / Item ID */
  id: string;
  /** 商品名・サービス名 / Product/service name */
  name: string;
  /** 説明 / Description */
  description?: string;
  /** 数量 / Quantity */
  quantity: number;
  /** 単位 / Unit */
  unit: string;
  /** 単価（円）/ Unit price (JPY) */
  unitPrice: number;
  /** 金額（円）/ Amount (JPY) - calculated if not provided */
  amount?: number;
}

/**
 * PDF generation options
 */
export interface PdfGenerationOptions {
  /** 用紙サイズ / Paper size */
  format?: 'A4' | 'A3' | 'Letter';
  /** 向き / Orientation */
  orientation?: 'portrait' | 'landscape';
  /** Base64返却 / Return as base64 */
  returnBase64?: string;
  /** Buffer返却 / Return as buffer */
  returnBuffer?: boolean;
  /** 出力ファイル名 / Output filename */
  filename?: string;
  /** ウォーターマーク / Watermark text */
  watermark?: string;
  /** 言語 / Language */
  language?: 'ja' | 'en';
}

/**
 * PDF generation result
 */
export interface PdfGenerationResult {
  /** 成功フラグ / Success flag */
  success: boolean;
  /** PDFバッファ / PDF buffer (Uint8Array - works in both browser and Node.js) */
  pdfBuffer?: Uint8Array;
  /** Base64エンコードされたPDF / Base64 encoded PDF */
  base64?: string;
  /** データURL / Data URL for embedding */
  dataUrl?: string;
  /** ファイル名 / Filename */
  filename?: string;
  /** ファイルサイズ / File size in bytes */
  size?: number;
  /** エラーメッセージ / Error message (Japanese) */
  error?: string;
  /** エラーメッセージ（英語）/ Error message (English) */
  errorEn?: string;
}

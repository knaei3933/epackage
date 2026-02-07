/**
 * PDF Generator Library
 *
 * PDF生成ライブラリ
 * Comprehensive PDF generation for Japanese B2B documents:
 * - Contracts (契約書)
 * - Quotes/Quotations (見積書)
 * - Invoices (請求書)
 *
 * Features:
 * - Japanese font support (Noto Sans JP)
 * - Japanese business formatting (era dates, yen currency)
 * - Consumption tax calculation (10%)
 * - Digital signature support
 * - Company letterhead and branding
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import type {
  ContractData,
  ContractItem,
  ContractParty,
  ContractSignatory,
} from '../types/contract';

// ============================================================
// Type Definitions
// ============================================================

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

  // Product specifications (for Excel template format)
  /** 製品仕様 / Product specifications */
  specifications?: {
    specNumber?: string;
    bagType?: string;
    contents?: string;
    size?: string;
    material?: string;
    thicknessType?: string;
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
    surfaceFinish?: '光沢' | 'マット';
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

// ============================================================
// Constants
// ============================================================

/**
 * Japanese business constants
 */
const JAPANESE_CONSTANTS = {
  /** 消費税率 / Consumption tax rate */
  CONSUMPTION_TAX_RATE: 0.1,
  /** デフォルト用紙サイズ / Default paper format */
  DEFAULT_FORMAT: 'A4' as const,
  /** デフォルト向き / Default orientation */
  DEFAULT_ORIENTATION: 'portrait' as const,

  /** デフォルトの供应商情報 / Default supplier information */
  DEFAULT_SUPPLIER: {
    name: 'EPACKAGE Lab',
    subBrand: 'by kanei-trade',
    companyName: '金井貿易株式会社',
    postalCode: '〒673-0846',
    address: '兵庫県明石市上ノ丸2-11-21',
    phone: 'TEL：050-1793-6500',
    email: 'info@package-lab.com',
    description: 'オーダーメイドバッグ印刷専門',
    registrationNumber: '',
  },

  /** 見積テンプレートテキスト / Quote template text */
  QUOTE_TEMPLATES: {
    ja: {
      title: '御　見　積　書',
      quoteNumber: '見積番号',
      issueDate: '発行日',
      expiryDate: '有効期限',
      customer: 'お客様',
      companyName: '会社名',
      address: '住所',
      contactPerson: '担当者',
      phone: '電話番号',
      email: 'メールアドレス',
      items: '明細',
      no: 'No.',
      itemName: '品名',
      description: ' description',
      quantity: '数量',
      unit: '単位',
      unitPrice: '単価',
      amount: '金額',
      subtotal: '小計',
      tax: '消費税(10%)',
      total: '合計',
      paymentTerms: 'お支払条件',
      deliveryDate: '納期',
      deliveryLocation: '納入場所',
      validityPeriod: '有効期間',
      remarks: '備考',
      supplier: '発行者',
    },
    en: {
      title: 'QUOTATION',
      quoteNumber: 'Quote Number',
      issueDate: 'Issue Date',
      expiryDate: 'Expiry Date',
      customer: 'Customer',
      companyName: 'Company Name',
      address: 'Address',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      email: 'Email',
      items: 'Line Items',
      no: 'No.',
      itemName: 'Item Name',
      description: 'Description',
      quantity: 'Quantity',
      unit: 'Unit',
      unitPrice: 'Unit Price',
      amount: 'Amount',
      subtotal: 'Subtotal',
      tax: 'Consumption Tax (10%)',
      total: 'Total',
      paymentTerms: 'Payment Terms',
      deliveryDate: 'Delivery Date',
      deliveryLocation: 'Delivery Location',
      validityPeriod: 'Validity Period',
      remarks: 'Remarks',
      supplier: 'Issuer',
    },
  },

  /** 請求テンプレートテキスト / Invoice template text */
  INVOICE_TEMPLATES: {
    ja: {
      title: '請　求　書',
      invoiceNumber: '請求書番号',
      issueDate: '発行日',
      dueDate: '支払期限',
      billingTo: '請求先',
      shippingTo: '納品先',
      items: '明細',
      no: 'No.',
      itemName: '品名',
      description: ' Description',
      quantity: '数量',
      unit: '単位',
      unitPrice: '単価',
      amount: '金額',
      subtotal: '小計',
      tax: '消費税(10%)',
      total: '合計',
      paymentMethod: 'お支払方法',
      bankInfo: '振込口座',
      bankName: '銀行名',
      branchName: '支店名',
      accountType: '口座種類',
      accountNumber: '口座番号',
      accountHolder: '口座名義',
      remarks: '備考',
      supplier: '請求元',
      contactPerson: '担当者',
    },
    en: {
      title: 'INVOICE',
      invoiceNumber: 'Invoice Number',
      issueDate: 'Issue Date',
      dueDate: 'Payment Due Date',
      billingTo: 'Bill To',
      shippingTo: 'Ship To',
      items: 'Line Items',
      no: 'No.',
      itemName: 'Item Name',
      description: 'Description',
      quantity: 'Quantity',
      unit: 'Unit',
      unitPrice: 'Unit Price',
      amount: 'Amount',
      subtotal: 'Subtotal',
      tax: 'Consumption Tax (10%)',
      total: 'Total',
      paymentMethod: 'Payment Method',
      bankInfo: 'Bank Information',
      bankName: 'Bank Name',
      branchName: 'Branch Name',
      accountType: 'Account Type',
      accountNumber: 'Account Number',
      accountHolder: 'Account Holder',
      remarks: 'Remarks',
      supplier: 'Invoice From',
      contactPerson: 'Contact Person',
    },
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format date to Japanese era format (令和6年12月25日)
 *
 * 日付を和暦フォーマットに変換
 */
export function formatJapaneseDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(d.getTime())) {
    return '';
  }

  // Japanese eras (Japanese eras)
  const eras = [
    { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
    { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
    { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
    { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
    { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
  ];

  const era = eras.find((e) => d >= e.start && d <= e.end);

  if (!era) {
    // Fallback to Western calendar if era not found
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const year = d.getFullYear() - era.start.getFullYear() + 1;
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${era.name}${year}年${month}月${day}日`;
}

/**
 * Format date to Western format (2025年12月25日)
 *
 * 日付を西暦フォーマットに変換
 */
export function formatWesternDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * Format currency to Japanese yen format (¥1,000,000)
 *
 * 金額を日本円フォーマットに変換
 */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * Calculate subtotal, tax, and total from items
 *
 * 小計、消費税、合計を計算
 */
export function calculateTotals(
  items: (QuoteItem | InvoiceItem | ContractItem)[]
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const amount = item.amount || item.quantity * item.unitPrice;
    return sum + amount;
  }, 0);

  const tax = Math.round(subtotal * JAPANESE_CONSTANTS.CONSUMPTION_TAX_RATE);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

/**
 * Convert number to Japanese kanji (for amount in words)
 *
 * 数字を漢数字に変換（金額表記用）
 */
export function convertNumberToJapaneseKanji(amount: number): string {
  const units = ['', '千', '万', '億'];
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let result = '';
  let unitIndex = 0;

  while (amount > 0) {
    const chunk = amount % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      if (chunk >= 1000) chunkStr += digits[Math.floor(chunk / 1000)] + '千';
      if (chunk % 1000 >= 100)
        chunkStr += digits[Math.floor((chunk % 1000) / 100)] + '百';
      if (chunk % 100 >= 10)
        chunkStr += digits[Math.floor((chunk % 100) / 10)] + '十';
      if (chunk % 10 >= 1) chunkStr += digits[chunk % 10];
      result = chunkStr + units[unitIndex] + result;
    }
    amount = Math.floor(amount / 10000);
    unitIndex++;
  }

  return result || '零';
}

/**
 * Validate PDF generation data
 *
 * PDF生成データの検証
 */
function validatePdfData(
  data: QuoteData | InvoiceData | ContractData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if ('quoteNumber' in data) {
    // Quote validation
    const quote = data as QuoteData;
    if (!quote.quoteNumber) errors.push('見積番号が必要です');
    if (!quote.issueDate) errors.push('発行日が必要です');
    if (!quote.customerName) errors.push('顧客名が必要です');
    if (!quote.items || quote.items.length === 0) errors.push('明細が必要です');
  } else if ('invoiceNumber' in data) {
    // Invoice validation
    const invoice = data as InvoiceData;
    if (!invoice.invoiceNumber) errors.push('請求書番号が必要です');
    if (!invoice.issueDate) errors.push('発行日が必要です');
    if (!invoice.billingName) errors.push('請求先名が必要です');
    if (!invoice.items || invoice.items.length === 0) errors.push('明細が必要です');
  } else if ('contractNumber' in data) {
    // Contract validation
    const contract = data as ContractData;
    if (!contract.contractNumber) errors.push('契約番号が必要です');
    if (!contract.issueDate) errors.push('発行日が必要です');
    if (!contract.seller) errors.push('販売元情報が必要です');
    if (!contract.buyer) errors.push('購入元情報が必要です');
    if (!contract.items || contract.items.length === 0) errors.push('契約項目が必要です');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================
// Quote PDF Generation
// ============================================================

/**
 * Generate Quote PDF (Excel Template Format with CJK support)
 *
 * Excelテンプレート形式で見積書PDFを生成（CJK対応）
 *
 * @param data - Quote data
 * @param options - PDF generation options
 * @returns PDF generation result with base64 or buffer
 */
export async function generateQuotePDF(
  data: QuoteData,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  try {
    console.log('[PDF Generator] Received data:', {
      quoteNumber: data.quoteNumber,
      specifications: data.specifications,
      optionalProcessing: data.optionalProcessing
    });

    // Validate data
    const validation = validatePdfData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        errorEn: validation.errors.join(', '),
      };
    }

    // Calculate totals
    const { subtotal, tax, total } = calculateTotals(data.items);

    // Create HTML template for quote
    const html = generateQuoteHTML(data, { subtotal, tax, total });

    // Create a temporary DOM element for rendering
    if (typeof window === 'undefined') {
      // Server-side: Return error (requires browser environment)
      return {
        success: false,
        error: '見積PDF生成はブラウザ環境でサポートされている機能です',
        errorEn: 'Quote PDF generation is only supported in browser environment',
      };
    }

    // ============================================================
    // FREEZE PAGE LAYOUT - Ultimate approach to eliminate any reflow
    // ============================================================
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // Store current scroll position
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Store original styles
    const originalStyles = {
      htmlOverflow: htmlElement.style.overflow,
      htmlPosition: htmlElement.style.position,
      htmlWidth: htmlElement.style.width,
      htmlTop: htmlElement.style.top,
      htmlTransform: htmlElement.style.transform,
      bodyOverflow: bodyElement.style.overflow,
      bodyPosition: bodyElement.style.position,
      bodyWidth: bodyElement.style.width,
      bodyMinWidth: bodyElement.style.minWidth,
      bodyTransform: bodyElement.style.transform,
    };

    // Store current dimensions before freezing
    const currentBodyWidth = bodyElement.offsetWidth;

    // Apply comprehensive freeze to both HTML and Body elements
    // This prevents ANY reflow during PDF generation by fixing layout completely
    htmlElement.style.overflow = 'hidden';
    htmlElement.style.position = 'fixed';
    htmlElement.style.width = '100vw';
    htmlElement.style.top = `-${scrollY}px`;
    htmlElement.style.transform = 'scale(1)'; // Force GPU compositing

    bodyElement.style.overflow = 'hidden';
    bodyElement.style.position = 'fixed';
    bodyElement.style.width = '100vw';
    bodyElement.style.minWidth = Math.max(currentBodyWidth, window.innerWidth) + 'px';
    bodyElement.style.transform = 'translateZ(0)'; // Force GPU compositing

    try {
      // Wait for browser to apply freeze styles
      await new Promise(resolve => requestAnimationFrame(resolve));
      // Double wait to ensure browser is completely stable
      await new Promise(resolve => setTimeout(resolve, 50));

      // ============================================================
      // HIDDEN CONTAINER APPROACH - Direct DOM rendering
      // ============================================================
      // This avoids iframe/CORS issues by rendering HTML directly in a
      // hidden container within the main document. html2canvas can then
      // capture it without cross-origin restrictions.
      //
      // Advantages over iframe approach:
      // - No CORS/iframe access issues
      // - Proper UTF-8 Japanese character support
      // - Same-origin access for html2canvas
      // - Works with strict CSP headers (X-Frame-Options: DENY)

      // Create hidden container for HTML rendering
      // IMPORTANT: html2canvas requires the element to be VISIBLE (not visibility: hidden)
      // We position it far off-screen instead
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '-99999px';
      container.style.width = '210mm';
      container.style.minHeight = '297mm'; // A4 height
      container.style.zIndex = '-999999';
      // DON'T use visibility: hidden - html2canvas won't capture it
      // DON'T use display: none - html2canvas won't capture it
      // Use position off-screen instead
      container.style.background = '#ffffff';
      container.style.padding = '0';
      container.style.margin = '0';

      // Set HTML content directly (no encoding issues)
      container.innerHTML = html;

      // Append to DOM for rendering
      document.body.appendChild(container);

      // Wait for rendering and font loading
      console.log('[PDF Generator] Waiting for container to render...');
      console.log('[PDF Generator] Container dimensions:', {
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert to canvas with proper error handling
      let canvas: HTMLCanvasElement;
      try {
        console.log('[PDF Generator] Starting html2canvas capture...');
        canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: true, // Enable logging for debugging
          backgroundColor: '#ffffff',
          allowTaint: true,
          // Don't use windowHeight/windowWidth - let html2canvas detect naturally
          onclone: (clonedDoc) => {
            console.log('[PDF Generator] html2canvas onclone called');
            const clonedContainer = clonedDoc.querySelector('div[style*="-99999px"]');
            if (clonedContainer) {
              console.log('[PDF Generator] Cloned container found:', {
                scrollWidth: clonedContainer.scrollWidth,
                scrollHeight: clonedContainer.scrollHeight,
              });
            }
          },
        });

        // Debug: Check canvas dimensions
        console.log('[PDF Generator] Canvas captured successfully:', {
          width: canvas.width,
          height: canvas.height,
          dataSize: canvas.toDataURL().length,
        });

        // Validate canvas has content
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas has zero dimensions - capture failed');
        }
      } catch (canvasError) {
        // Ensure cleanup even on canvas error
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        throw new Error(`html2canvas failed: ${canvasError instanceof Error ? canvasError.message : String(canvasError)}`);
      }

      // Clean up: remove container ONLY after successful capture
      if (document.body.contains(container)) {
        console.log('[PDF Generator] Cleaning up container...');
        document.body.removeChild(container);
      }

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png', 0.95);

      // A4 dimensions in mm (210 x 297)
      const a4Width = 210;
      const a4Height = 297;

      // Margins (reduced)
      const marginTop = 10;
      const marginBottom = 10;
      const marginLeft = 15;
      const marginRight = 15;

      // Available content area
      const contentWidth = a4Width - marginLeft - marginRight; // 180mm
      const contentHeight = a4Height - marginTop - marginBottom; // 277mm

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Calculate aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const contentAspectRatio = contentWidth / contentHeight;

      let finalWidth, finalHeight, xOffset, yOffset;

      // Fit canvas to content area while maintaining aspect ratio
      if (canvasAspectRatio > contentAspectRatio) {
        // Canvas is wider - fit to width
        finalWidth = contentWidth;
        finalHeight = contentWidth / canvasAspectRatio;
        xOffset = marginLeft;
        yOffset = marginTop + (contentHeight - finalHeight) / 2; // Center vertically in content area
      } else {
        // Canvas is taller - fit to height
        finalHeight = contentHeight;
        finalWidth = contentHeight * canvasAspectRatio;
        xOffset = marginLeft + (contentWidth - finalWidth) / 2; // Center horizontally in content area
        yOffset = marginTop;
      }

      console.log('[PDF Generator] PDF dimensions:', {
        canvasSize: { width: canvas.width, height: canvas.height },
        a4Size: { width: a4Width, height: a4Height },
        margins: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight },
        contentArea: { width: contentWidth, height: contentHeight },
        finalSize: { width: finalWidth, height: finalHeight },
        offset: { x: xOffset, y: yOffset },
      });

      doc.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

      // Determine filename
      const filename = options.filename || `${data.quoteNumber}.pdf`;

      // For compatibility, also generate buffer for return value
      let pdfUint8Array: Uint8Array;
      try {
        pdfUint8Array = new Uint8Array(doc.output('arraybuffer'));
      } catch (e) {
        console.warn('[PDF Generator] Could not generate buffer for return value:', e);
        pdfUint8Array = new Uint8Array(0);
      }

      // Return based on options
      if (options.returnBase64) {
        // Convert Uint8Array to base64 (browser-compatible)
        const binaryString = ArrayFrom(pdfUint8Array, byte => String.fromCharCode(byte)).join('');
        const base64 = btoa(binaryString);
        return {
          success: true,
          base64,
          filename,
          size: pdfUint8Array.length,
        };
      }

      return {
        success: true,
        pdfBuffer: pdfUint8Array, // Return Uint8Array instead of Buffer
        filename,
        size: pdfUint8Array.length,
      };
    } finally {
      // CRITICAL: Ensure container cleanup even if error occurs
      const containers = document.querySelectorAll('div[style*="z-index: -999999"]');
      containers.forEach(container => {
        if (document.body.contains(container)) {
          try {
            document.body.removeChild(container);
            console.log('[PDF Generator] Cleaned up container in finally block');
          } catch (cleanupError) {
            console.warn('[PDF Generator] Failed to cleanup container:', cleanupError);
          }
        }
      });

      // Restore HTML element styles
      htmlElement.style.overflow = originalStyles.htmlOverflow;
      htmlElement.style.position = originalStyles.htmlPosition;
      htmlElement.style.width = originalStyles.htmlWidth;
      htmlElement.style.top = originalStyles.htmlTop;
      htmlElement.style.transform = originalStyles.htmlTransform;

      // Restore body styles
      bodyElement.style.overflow = originalStyles.bodyOverflow;
      bodyElement.style.position = originalStyles.bodyPosition;
      bodyElement.style.width = originalStyles.bodyWidth;
      bodyElement.style.minWidth = originalStyles.bodyMinWidth;
      bodyElement.style.transform = originalStyles.bodyTransform;

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF生成に失敗しました',
      errorEn: error instanceof Error ? error.message : 'PDF generation failed',
    };
  }
}

/**
 * Generate HTML for quote (Excel template format)
 *
 * Excelテンプレート形式で見積書HTMLを生成
 * Simple vertical layout matching quotation.md template
 *
 * Layout structure (simple top-to-bottom flow):
 * 1. Header: Date (left) + No (right)
 * 2. Title: 見積書
 * 3. Intro text
 * 4. Customer info (left) + Supplier info (right)
 * 5. Terms table (2 columns x 3-6 rows)
 * 6. Specs table (left) + Order table (right)
 * 7. Optional processing table
 * 8. Remarks
 */
function generateQuoteHTML(
  data: QuoteData,
  totals: { subtotal: number; tax: number; total: number }
): string {
  // 翻訳テンプレートの設定
  const templates = JAPANESE_CONSTANTS.QUOTE_TEMPLATES;
  const t = templates.ja; // 日本語テンプレートを使用

  const specs = data.specifications || {};
  let processing = data.optionalProcessing || {};

  // デバッグ: optionalProcessing の内容を確認
  console.log('[PDF HTML Generator] data.optionalProcessing:', data.optionalProcessing);
  console.log('[PDF HTML Generator] processing before:', processing);

  // ロールフィルム・スパウトパウチの場合、surfaceFinishがない場合はデフォルトで'光沢'を設定
  // ただし、既にmatteが選択されている場合はmatteを優先
  const isRollFilmOrSpout = specs.bagType === 'ロールフィルム' || specs.bagType === 'スパウトパウチ' ||
                          (specs as any).productType === 'roll_film' || (specs as any).productType === 'spout_pouch';
  if (isRollFilmOrSpout && !processing.surfaceFinish) {
    processing = { ...processing, surfaceFinish: '光沢' };
    console.log('[PDF HTML Generator] Set default surfaceFinish to 光沢 for roll_film/spout_pouch (no user selection)');
  }

  const supplier = data.supplierInfo || JAPANESE_CONSTANTS.DEFAULT_SUPPLIER;

  console.log('[PDF HTML Generator] specs FULL:', JSON.stringify(specs, null, 2));
  console.log('[PDF HTML Generator] specs.notchShape:', specs.notchShape);
  console.log('[PDF HTML Generator] specs.hanging:', specs.hanging);
  console.log('[PDF HTML Generator] specs.hangingPosition:', specs.hangingPosition);
  console.log('[PDF HTML Generator] specs.cornerR:', specs.cornerR);
  console.log('[PDF HTML Generator] specs.machiPrinting:', specs.machiPrinting, 'type:', typeof specs.machiPrinting, 'truthy:', !!specs.machiPrinting);
  console.log('[PDF HTML Generator] processing after:', processing);
  console.log('[PDF HTML Generator] processing.surfaceFinish:', processing.surfaceFinish);

  // Format currency
  const formatYen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;

  // Format date (Western calendar for display)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Check for SKU data
  const hasSKUData = data.skuData && data.skuData.count > 1;
  console.log('[PDF HTML Generator] hasSKUData:', hasSKUData);
  console.log('[PDF HTML Generator] skuData:', data.skuData);

  // Calculate totals from items (or SKU data)
  const totalQuantity = hasSKUData
    ? data.skuData!.items.reduce((sum, sku) => sum + sku.quantity, 0)
    : data.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = hasSKUData
    ? data.skuData!.items.reduce((sum, sku) => sum + sku.totalPrice, 0)
    : data.items.reduce((sum, item) => sum + (item.amount || item.unitPrice * item.quantity), 0);

  // Default remarks if not provided (matching quotation.md template)
  const defaultRemarks = `※製造工程上の都合により、実際の納品数量はご注文数量に対し最大10％程度の過不足が生じる場合がございます。
数量の完全保証はいたしかねますので、あらかじめご了承ください。
※不足分につきましては、実際に納品した数量に基づきご請求いたします。
前払いにてお支払いいただいた場合は、差額分を返金いたします。
※原材料価格の変動等により、見積有効期限経過後は価格が変更となる場合がございます。
再見積の際は、あらかじめご了承くださいますようお願いいたします。
※本見積金額には郵送費を含んでおります。
※お客様によるご確認の遅れ、その他やむを得ない事情により、納期が前後する場合がございます。
※年末年始等の長期休暇期間を挟む場合、通常より納期が延びる可能性がございます。
※天候不良、事故、交通事情等の影響により、やむを得ず納期が遅延する場合がございますので、あらかじめご了承ください。`;

  const remarks = data.remarks || defaultRemarks;

  // DEBUG: Verify template generation started
  console.log('[PDF HTML Generator] === TEMPLATE GENERATION START ===');

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積書 - ${data.quoteNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: "Hiragino Sans", "Yu Gothic", "Meiryo", "MS PGothic", sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
      background: #fff;
      padding: 5mm 7mm;
      width: 210mm;
      margin: 0 auto;
      box-sizing: border-box;
    }

    /* Common table styles - optimized for html2canvas */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      box-sizing: border-box;
    }

    /* Section spacing */
    .section {
      margin-bottom: 2mm;
    }

    .section-left {
      margin-bottom: 2mm;
    }

    /* Header row: Date (left) + No (right) */
    .header-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2mm;
      font-size: 8pt;
    }

    .header-left {
      flex: 1;
    }

    .header-right {
      display: flex;
      gap: 5mm;
    }

    .header-item {
      display: flex;
      gap: 2mm;
    }

    .header-label {
      font-weight: bold;
    }

    /* Document title */
    .doc-title {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 2mm;
      letter-spacing: 0.2em;
    }

    /* Intro text */
    .intro-text {
      margin-bottom: 2mm;
      font-size: 10pt;
    }

    /* Top section: 2 columns - Left (Customer + Terms) | Right (Supplier) */
    .top-section {
      display: flex;
      gap: 5mm;
      margin-bottom: 2mm;
    }

    .top-left {
      width: 85mm;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
    }

    .top-customer {
      flex: 1;
    }

    .top-terms {
      font-size: 7pt;
    }

    .top-supplier {
      flex: 1;
      min-width: 95mm;
    }

    /* Info boxes (customer and company) */
    .info-box {
      border: 1px solid #000;
      padding: 2mm;
      margin-bottom: 0;
      background: #fff;
      box-sizing: border-box;
      overflow: hidden;
    }

    /* Customer info box - 30mm */
    .info-box-customer {
      height: 30mm;
    }

    /* Supplier info box - 56mm */
    .info-box-supplier {
      height: 56mm;
    }

    .info-box-title {
      background: #D3E4E4;
      padding: 1mm 2mm;
      font-weight: bold;
      font-size: 11pt;
      margin: -2mm -2mm 1.5mm -2mm;
      border-bottom: 1px solid #000;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 10mm;
      line-height: 1;
      box-sizing: border-box;
    }

    .customer-name {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 2mm;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .customer-detail {
      font-size: 7pt;
      margin-bottom: 0.3mm;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .supplier-logo {
      width: 50mm;
      height: auto;
      margin-bottom: 2mm;
      margin-left: auto;
      object-fit: contain;
      display: block;
      max-width: 100%;
    }

    .info-right {
      width: 100%;
      text-align: right;
    }

    .supplier-brand {
      font-size: 9pt;
      font-weight: bold;
      color: #000;
      margin-bottom: 0.3mm;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .supplier-company {
      font-size: 9pt;
      font-weight: bold;
      margin-bottom: 0.2mm;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .supplier-detail {
      font-size: 8pt;
      margin-bottom: 0.2mm;
      line-height: 1.1;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* New 2-Column Layout for A4 */
    .two-column-row {
      display: flex;
      gap: 3mm;
      margin-bottom: 3mm;
    }

    /* 50% width for equal columns */
    .column-half {
      flex: 1;
      min-width: 0;
    }

    /* 100% width for full width columns */
    .column-full {
      flex: 1;
      min-width: 0;
    }

    /* 35% width for processing */
    .column-35 {
      flex: 0.54;
      min-width: 0;
    }

    /* 65% width for remarks */
    .column-65 {
      flex: 1;
      min-width: 0;
    }

    .content-section {
      width: 100%;
    }

    .section-title {
      background: #D3E4E4;
      padding: 2mm;
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 0;
      border: 0.1px solid #000;
      border-bottom: none;
      text-align: center;
      height: 7mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Order table title */
    .order-table-title {
      background: #D3E4E4;
      padding: 0 2mm;
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 2mm;
      border: 1px solid #000;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 7mm;
      line-height: 1;
    }

    /* Terms table - optimized for html2canvas */
    .terms-table {
      width: 100%;
      margin-bottom: 1.5mm;
      box-sizing: border-box;
    }

    .terms-table td {
      padding: 1mm;
      font-size: 8.5pt;
      line-height: 1;
      box-sizing: border-box;
      word-wrap: break-word;
      overflow-wrap: break-word;
      border-right: 0.1px solid #000;
      border-bottom: 0.1px solid #000;
      border-top: none;
      border-left: none;
      vertical-align: middle;
      height: 8mm;
      overflow: hidden;
      hyphens: auto;
    }

    .terms-table td:first-child {
      border-left: 0.1px solid #000;
    }

    .terms-table tr:first-child td {
      border-top: 0.1px solid #000;
    }

    .term-label {
      width: 22mm;
      font-weight: 600;
      background: #f9f9f9;
      font-size: 8.5pt;
      white-space: nowrap;
    }

    /* Specs table - optimized for html2canvas */
    .specs-table {
      width: 100%;
      margin-bottom: 1.5mm;
      box-sizing: border-box;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
    }

    .specs-table td {
      font-size: 8pt;
      padding: 1mm;
      line-height: 1;
      box-sizing: border-box;
      word-wrap: break-word;
      overflow-wrap: break-word;
      border-right: 0.1px solid #000;
      border-bottom: 0.1px solid #000;
      border-top: none;
      border-left: none;
      vertical-align: middle;
      height: 8mm;
      overflow: hidden;
      hyphens: auto;
    }

    .specs-table td:first-child {
      border-left: 0.1px solid #000;
    }

    .specs-table tr:first-child td {
      border-top: 0.1px solid #000;
    }

    .spec-label {
      width: 22mm;
      font-weight: 600;
      background: #f9f9f9;
      font-size: 8pt;
      white-space: nowrap;
    }

    /* Order table - html2canvas workaround */
    .order-table {
      border-collapse: separate;
      border-spacing: 0;
      width: 100%;
      table-layout: fixed;
    }

    .order-table .th {
      background: #D3E4E4;
      padding: 1mm;
      text-align: center;
      font-weight: bold;
      font-size: 9pt;
      border-right: 0.1px solid #000;
      border-bottom: 0.1px solid #000;
      border-top: 0.1px solid #000;
      border-left: none;
      vertical-align: middle;
      height: 14mm;
      box-sizing: border-box;
      overflow: hidden;
      line-height: 1;
      word-break: break-word;
    }

    .order-table .th:first-child {
      border-left: 0.1px solid #000;
    }

    .order-table td:not(.th) {
      padding: 1mm;
      text-align: center;
      border-right: 0.1px solid #000;
      border-bottom: 0.1px solid #000;
      border-top: none;
      border-left: none;
      vertical-align: middle;
      font-size: 9pt;
      height: 8mm;
      box-sizing: border-box;
      overflow: hidden;
      line-height: 1;
    }

    .order-table td:not(.th):first-child {
      border-left: 0.1px solid #000;
    }

    /* Column widths matching Excel template - adjusted for full width */
    .col-no { width: 12%; }
    .col-sku { width: 16%; }
    .col-qty { width: 16%; }
    .col-unit { width: 18%; }
    .col-disc { width: 14%; }
    .col-total { width: 24%; }

    .summary-row {
      background: #E8F5E9;
      font-weight: bold;
    }

    /* Optional processing table - html2canvas workaround */
    .processing-table {
      width: 100%;
      margin-bottom: 2mm;
      box-sizing: border-box;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
    }

    .processing-table .th {
      background: #D3E4E4;
      font-weight: bold;
      font-size: 9pt;
      text-align: center;
      height: 14mm;
      padding: 1mm;
      line-height: 1;
      border-right: 0.1px solid #000;
      border-bottom: 0.1px solid #000;
      border-top: 0.1px solid #000;
      border-left: none;
      vertical-align: middle;
      box-sizing: border-box;
      overflow: hidden;
      word-break: break-word;
    }

    .processing-table .th:first-child {
      border-left: 0.1px solid #000;
    }

    .processing-table td:not(.th) {
      font-size: 8pt;
      padding: 1mm;
      line-height: 1;
      box-sizing: border-box;
      border-right: 0.1px solid #000;
      border-bottom: 0.1px solid #000;
      border-top: none;
      border-left: none;
      vertical-align: middle;
      height: 8mm;
      overflow: hidden;
    }

    .processing-table td:not(.th):first-child {
      border-left: 0.1px solid #000;
    }

    .processing-label {
      width: 70%;
      font-weight: 500;
      white-space: nowrap;
      font-size: 8pt;
    }

    .processing-value {
      text-align: center;
      font-weight: bold;
      font-size: 8pt;
    }

    /* Remarks section - full A4 width at bottom */
    .remarks-section {
      width: 100%;
      margin-top: 1mm;
      margin-bottom: 0;
    }

    .remarks-content {
      padding: 2mm;
      border: 1px solid #000;
      font-size: 9pt;
      white-space: pre-wrap;
      word-break: break-word;
      background: #FFF9E6;
      line-height: 1.4;
      min-height: 50mm;
    }
  </style>
</head>
<body>
  <!-- Header: Date (left) and No (right) -->
  <div class="header-row">
    <div class="header-left"></div>
    <div class="header-right">
      <div class="header-item">
        <span class="header-label">見積No：</span>
        <span>${data.quoteNumber}</span>
      </div>
      <div class="header-item">
        <span class="header-label">見積日：</span>
        <span>${data.issueDate ? formatDate(data.issueDate) : ''}</span>
      </div>
      <div class="header-item">
        <span class="header-label">有効期間：</span>
        <span>${data.validityPeriod ? data.validityPeriod.split('\n')[0] : '見積日から30日間'}</span>
      </div>
    </div>
  </div>

  <!-- Document title -->
  <div class="doc-title">見　積　書</div>

  <!-- Introductory text -->
  <div class="intro-text">下記のとおり、御見積もり申し上げます。</div>

  <!-- Top section: Left (Customer + Terms) | Right (Supplier) -->
  <div class="top-section">
    <!-- Left: Customer + Terms stacked -->
    <div class="top-left">
      <!-- Customer info -->
      <div class="top-customer">
        <div class="info-box info-box-customer">
          <div class="info-box-title">【お客様情報】</div>
          ${(data.postalCode || data.address) ? `<div class="customer-detail">${data.postalCode || ''}${data.postalCode && data.address ? ' ' : ''}${data.address || ''}</div>` : ''}
          ${data.customerName ? `<div class="customer-name">${data.customerName} 御中</div>` : ''}
          ${data.contactPerson ? `<div class="customer-detail">担当: ${data.contactPerson}</div>` : ''}
        </div>
      </div>

      <!-- Terms (below customer) -->
      <div class="top-terms">
        <table class="terms-table">
        ${data.paymentTerms ? `
        <tr>
          <td class="term-label">支払い条件</td>
          <td>${data.paymentTerms}</td>
        </tr>` : ''}
        <tr>
          <td class="term-label">入稿期限</td>
          <td>指定なし</td>
        </tr>
        <tr>
          <td class="term-label">校了締切</td>
          <td>指定なし</td>
        </tr>
        <tr>
          <td class="term-label">入金締切</td>
          <td>校了前</td>
        </tr>
        ${data.deliveryDate ? `
        <tr>
          <td class="term-label">納期</td>
          <td>${data.deliveryDate}</td>
        </tr>` : ''}
        ${data.bankInfo ? `
        <tr>
          <td class="term-label">振込先</td>
          <td>${data.bankInfo.bankName} ${data.bankInfo.branchName} ${data.bankInfo.accountType} ${data.bankInfo.accountNumber}</td>
        </tr>` : ''}
      </table>
    </div>
  </div> <!-- End top-left -->

  <!-- Right: Supplier info -->
  <div class="top-supplier">
      <div class="info-box info-box-supplier">
        <div class="info-box-title">【発行者情報】</div>
    <div class="info-right">
      <img src="/epackage-logo.png"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" class="supplier-logo" alt="EPACKAGE Lab" />
      <div class="supplier-brand">金井貿易株式会社</div>
      <div class="supplier-company">EPACKAGE Lab</div>
      <div class="supplier-detail">〒${supplier.postalCode.replace('〒', '')}</div>
      <div class="supplier-detail">${supplier.address}</div>
      <div class="supplier-detail">${supplier.phone}</div>
    </div>
      </div> <!-- End info-box -->
    </div> <!-- End top-supplier -->
  </div> <!-- End top-section -->

  <!-- Row 1: Specs (50%) + Amount (50%) -->
  <div class="two-column-row">
    <!-- Left: Specs Table -->
    <div class="column-half">
      <div class="section-title">製品仕様</div>
      <table class="specs-table">
        ${specs.specNumber ? `
        <tr>
          <td class="spec-label">仕様番号</td>
          <td>${specs.specNumber}</td>
        </tr>` : ''}
        <tr>
          <td class="spec-label">袋タイプ</td>
          <td>${specs.bagType || '指定なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">内容物</td>
          <td>${specs.contents || '指定なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">サイズ</td>
          <td>${specs.size || '指定なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">素材</td>
          <td>${specs.material || '指定なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">厚さのタイプ</td>
          <td>${specs.thicknessType || '指定なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">表面処理</td>
          <td>${processing.surfaceFinish || '指定なし'}</td>
        </tr>
        ${specs.rollFilmSpecs || specs.bagType === 'ロールフィルム' ? `
        <tr>
          <td class="spec-label">シール幅</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">封入方向</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">ノッチ形状</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">ノッチ位置</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">吊り下げ加工</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">吊り下げ位置</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">チャック位置</td>
          <td>-</td>
        </tr>
        <tr>
          <td class="spec-label">角加工</td>
          <td>-</td>
        </tr>` : `
        <tr>
          <td class="spec-label">シール幅</td>
          <td>${specs.sealWidth || '指定なし'}</td>
        </tr>${(specs.machiPrinting && specs.machiPrinting !== 'なし') ? `<tr><td class="spec-label">マチ印刷</td><td>${specs.machiPrinting}</td></tr>` : ''}
        <tr>
          <td class="spec-label">封入方向</td>
          <td>${specs.sealDirection || '指定なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">ノッチ形状</td>
          <td>${specs.notchShape || '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">ノッチ位置</td>
          <td>${specs.notchPosition || '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">吊り下げ加工</td>
          <td>${specs.hanging || 'なし'}</td>
        </tr>
        <tr>
          <td class="spec-label">吊り下げ位置</td>
          <td>${specs.hangingPosition || '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">チャック位置</td>
          <td>${specs.zipperPosition || '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">角加工</td>
          <td>${specs.cornerR || '-'}</td>
        </tr>`}
        ${specs.spoutPosition ? `
        <tr>
          <td class="spec-label">スパウト位置</td>
          <td>${specs.spoutPosition}</td>
        </tr>` : ''}
        ${specs.rollFilmSpecs ? `
        <tr>
          <td class="spec-label">原反幅</td>
          <td>${specs.rollFilmSpecs.materialWidth ? `${specs.rollFilmSpecs.materialWidth}mm` : '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">ピッチ</td>
          <td>${specs.rollFilmSpecs.pitch ? `${specs.rollFilmSpecs.pitch}mm` : '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">総長さ</td>
          <td>${specs.rollFilmSpecs.totalLength ? `${specs.rollFilmSpecs.totalLength.toLocaleString('ja-JP')}m` : '-'}</td>
        </tr>
        <tr>
          <td class="spec-label">ロール数</td>
          <td>${specs.rollFilmSpecs.rollCount ? `${specs.rollFilmSpecs.rollCount}本` : '-'}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Right: Amount Table -->
    <div class="column-half">
      <div class="section-title">金額明細</div>
      <table class="order-table">
        <thead>
          <tr>
            <td class="th col-no">番号</td>
            <td class="th col-sku">商品数　(SKU)</td>
            <td class="th col-qty">合計数量</td>
            <td class="th col-unit">単価</td>
            <td class="th col-disc">割引</td>
            <td class="th col-total">合計　(税別)</td>
          </tr>
        </thead>
        <tbody>
          ${hasSKUData
            ? data.skuData!.items.map((sku, index) => `
              <tr>
                <td class="col-no">${index + 1}</td>
                <td class="col-sku">SKU ${sku.skuNumber}</td>
                <td class="col-qty">${sku.quantity.toLocaleString('ja-JP')}</td>
                <td class="col-unit">${formatYen(sku.unitPrice)}</td>
                <td class="col-disc">¥0</td>
                <td class="col-total">${formatYen(sku.totalPrice)}</td>
              </tr>
            `).join('')
            : data.items.map((item, index) => `
              <tr>
                <td class="col-no">${index + 1}</td>
                <td class="col-sku">1</td>
                <td class="col-qty">${item.quantity.toLocaleString('ja-JP')}</td>
                <td class="col-unit">${formatYen(item.unitPrice)}</td>
                <td class="col-disc">¥0</td>
                <td class="col-total">${formatYen(item.amount || item.unitPrice * item.quantity)}</td>
              </tr>
            `).join('')}
          <tr class="summary-row">
            <td colspan="2">合計</td>
            <td class="col-qty">${totalQuantity.toLocaleString('ja-JP')}</td>
            <td class="col-unit">-</td>
            <td class="col-disc">¥0</td>
            <td class="col-total">${formatYen(totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Row 2: Remarks (100%) -->
  <div class="two-column-row">
    <div class="column-full">
      <div class="section-title">備考</div>
      <div class="remarks-content">${remarks}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <!-- フッターテキスト削除 -->
  </div>
</body>
</html>
  `.trim();

  // DEBUG: Verify we reached this point
  console.log('[PDF HTML Generator] === VERIFICATION CODE START ===');

  // DEBUG: Verify machi printing is in the generated HTML
  const hasMachiPrintingRow = html.includes('マチ印刷');
  console.log('[PDF HTML Generator] machiPrinting value:', specs.machiPrinting, 'type:', typeof specs.machiPrinting);
  console.log('[PDF HTML Generator] Machi printing row in HTML:', hasMachiPrintingRow);
  if (!hasMachiPrintingRow && specs.machiPrinting && specs.machiPrinting !== 'なし') {
    console.error('[PDF HTML Generator] ERROR: machiPrinting is truthy but not in HTML!');
    // Log the specifications table section for debugging
    const specsTableStart = html.indexOf('<table class="spec-table">');
    const specsTableEnd = html.indexOf('</table>', specsTableStart) + '</table>'.length;
    if (specsTableStart >= 0 && specsTableEnd > specsTableStart) {
      const specsTable = html.substring(specsTableStart, specsTableEnd);
      console.log('[PDF HTML Generator] Specifications table HTML:', specsTable);
    }
  }

  return html;
}

// ============================================================
// Invoice PDF Generation
// ============================================================

/**
 * Generate Invoice PDF (Japanese format)
 *
 * 日本語形式で請求書PDFを生成
 *
 * @param data - Invoice data
 * @param options - PDF generation options
 * @returns PDF generation result with base64 or buffer
 */
export async function generateInvoicePDF(
  data: InvoiceData,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  try {
    // Validate data
    const validation = validatePdfData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        errorEn: validation.errors.join(', '),
      };
    }

    // Calculate totals
    const { subtotal, tax, total } = calculateTotals(data.items);

    // Create HTML template for invoice
    const html = generateInvoiceHTML(data, { subtotal, tax, total });

    // Create a temporary DOM element for rendering
    if (typeof window === 'undefined') {
      // Server-side: Return error (requires browser environment)
      return {
        success: false,
        error: '請求書PDF生成はブラウザ環境でサポートされている機能です',
        errorEn: 'Invoice PDF generation is only supported in browser environment',
      };
    }

    // Use existing PDF generation infrastructure
    const element = document.createElement('div');
    // ✅ Sanitize HTML to prevent XSS attacks
    element.innerHTML = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'div', 'span', 'p', 'br', 'strong', 'em', 'b', 'i', 'u',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'ul', 'ol', 'li',
        'a', 'img',
        'hr', 'blockquote', 'pre', 'code',
        'svg', 'path', 'rect', 'circle', 'line', 'text', 'g'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'id', 'href', 'src', 'alt', 'title', 'target',
        'colspan', 'rowspan', 'width', 'height', 'viewBox', 'd', 'fill',
        'stroke', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r'
      ],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '210mm'; // A4 width
    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
      });

      document.body.removeChild(element);

      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Return result based on options
      if (options.returnBase64 ?? false) {
        const base64 = pdf.output('datauristring');
        return {
          success: true,
          base64,
          dataUrl: base64,
        };
      }

      if (options.returnBuffer ?? false) {
        // Browser-compatible: use Uint8Array instead of Node.js Buffer
        const arrayBuffer = pdf.output('arraybuffer');
        const uint8Array = new Uint8Array(arrayBuffer);
        return {
          success: true,
          pdfBuffer: uint8Array,
        };
      }

      // Default: download
      const filename = `Invoice_${data.invoiceNumber}.pdf`;
      pdf.save(filename);

      return {
        success: true,
        filename,
      };
    } catch (canvasError) {
      document.body.removeChild(element);
      throw canvasError;
    }
  } catch (error: any) {
    console.error('[Invoice PDF] Generation error:', error);
    return {
      success: false,
      error: error.message || '請求書PDF生成中にエラーが発生しました',
      errorEn: error.message || 'Error generating invoice PDF',
    };
  }
}

/**
 * Generate Invoice HTML template
 *
 * 請求書HTMLテンプレートを生成
 */
function generateInvoiceHTML(
  data: InvoiceData,
  totals: { subtotal: number; tax: number; total: number }
): string {
  const templates = JAPANESE_CONSTANTS.INVOICE_TEMPLATES;
  const t = templates.ja; // Use Japanese template

  // Format currency
  const formatYen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // Bank account info
  const bankAccount: InvoiceData['bankInfo'] = data.bankInfo;

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      width: 210mm;
      padding: 10mm;
      background: #fff;
    }

    .header {
      text-align: center;
      margin-bottom: 10mm;
      border-bottom: 2px solid #000;
      padding-bottom: 5mm;
    }

    .title {
      font-size: 24pt;
      font-weight: bold;
      letter-spacing: 0.5em;
      margin-bottom: 2mm;
    }

    .invoice-number {
      font-size: 14pt;
      font-weight: bold;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5mm;
    }

    .info-item {
      flex: 1;
    }

    .info-label {
      font-weight: bold;
      margin-bottom: 1mm;
    }

    .info-value {
      font-size: 11pt;
    }

    .party-section {
      display: flex;
      gap: 10mm;
      margin-bottom: 10mm;
    }

    .party-box {
      flex: 1;
      border: 1px solid #ccc;
      padding: 3mm;
    }

    .party-title {
      font-weight: bold;
      background: #f0f0f0;
      padding: 1mm;
      margin: -3mm -3mm 2mm -3mm;
      text-align: center;
    }

    .party-name {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 1mm;
    }

    .party-detail {
      margin-bottom: 0.5mm;
      white-space: pre-line;
    }

    .items-table {
      width: 100%;
      margin-bottom: 10mm;
      border-collapse: separate;
      border-spacing: 0;
    }

    .items-table th,
    .items-table td {
      border: 1px solid #000;
      padding: 2mm;
      text-align: left;
    }

    .items-table th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }

    .items-table td:nth-child(3),
    .items-table td:nth-child(4),
    .items-table td:nth-child(5) {
      text-align: right;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10mm;
    }

    .totals-table {
      width: 80mm;
      border-collapse: separate;
      border-spacing: 0;
    }

    .totals-table td {
      padding: 1mm 2mm;
      border: 1px solid #000;
    }

    .totals-table td:first-child {
      font-weight: bold;
    }

    .totals-table .total-row {
      background: #f0f0f0;
      font-weight: bold;
      font-size: 12pt;
    }

    .payment-section {
      border: 1px solid #ccc;
      padding: 3mm;
      margin-bottom: 5mm;
    }

    .payment-title {
      font-weight: bold;
      margin-bottom: 2mm;
    }

    .payment-detail {
      margin-bottom: 1mm;
    }

    .remarks-section {
      border: 1px solid #ccc;
      padding: 3mm;
    }

    .remarks-title {
      font-weight: bold;
      margin-bottom: 2mm;
    }

    .remarks-content {
      white-space: pre-line;
    }

    .footer {
      margin-top: 10mm;
      padding-top: 5mm;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="title">${t.title}</div>
    <div class="invoice-number">${t.invoiceNumber}: ${data.invoiceNumber}</div>
  </div>

  <!-- Info Row -->
  <div class="info-row">
    <div class="info-item">
      <div class="info-label">${t.issueDate}</div>
      <div class="info-value">${formatDate(data.issueDate)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">${t.dueDate}</div>
      <div class="info-value">${formatDate(data.dueDate)}</div>
    </div>
  </div>

  <!-- Party Section -->
  <div class="party-section">
    <div class="party-box">
      <div class="party-title">${t.supplier}</div>
      <div class="party-name">${data.supplierInfo?.companyName || ''}</div>
      <div class="party-detail">${data.supplierInfo?.address || ''}</div>
      <div class="party-detail">${data.supplierInfo?.phone || ''}</div>
      ${data.supplierInfo?.contactPerson ? `<div class="party-detail">${t.contactPerson}: ${data.supplierInfo.contactPerson}</div>` : ''}
    </div>
    <div class="party-box">
      <div class="party-title">${t.billingTo}</div>
      <div class="party-name">${data.billingName}</div>
      <div class="party-detail">${data.address || ''}</div>
      ${data.contactPerson ? `<div class="party-detail">${t.contactPerson}: ${data.contactPerson}</div>` : ''}
    </div>
  </div>

  ${data.shippingName ? `
  <div class="party-box" style="margin-bottom: 10mm;">
    <div class="party-title">${t.shippingTo}</div>
    <div class="party-name">${data.shippingName}</div>
    <div class="party-detail">${data.shippingAddress || ''}</div>
  </div>
  ` : ''}

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 10%">${t.no}</th>
        <th style="width: 35%">${t.description}</th>
        <th style="width: 15%">${t.quantity}</th>
        <th style="width: 15%">${t.unitPrice}</th>
        <th style="width: 15%">${t.amount}</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item, index) => `
        <tr>
          <td style="text-align: center">${index + 1}</td>
          <td>
            ${item.name}
            ${item.description ? `<br><small>${item.description}</small>` : ''}
          </td>
          <td style="text-align: right">${item.quantity.toLocaleString('ja-JP')} ${item.unit || ''}</td>
          <td style="text-align: right">${formatYen(item.unitPrice)}</td>
          <td style="text-align: right">${formatYen(item.amount || item.quantity * item.unitPrice)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Totals Section -->
  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>${t.subtotal}</td>
        <td style="text-align: right">${formatYen(totals.subtotal)}</td>
      </tr>
      <tr>
        <td>${t.tax} (10%)</td>
        <td style="text-align: right">${formatYen(totals.tax)}</td>
      </tr>
      <tr class="total-row">
        <td>${t.total}</td>
        <td style="text-align: right">${formatYen(totals.total)}</td>
      </tr>
    </table>
  </div>

  <!-- Payment Section -->
  <div class="payment-section">
    <div class="payment-title">${t.paymentMethod}</div>
    <div class="payment-detail"><strong>${t.paymentMethod}:</strong> ${data.paymentMethod}</div>
    ${bankAccount?.bankName ? `
      <div class="payment-detail"><strong>${t.bankName}:</strong> ${bankAccount.bankName}</div>
    ` : ''}
    ${bankAccount?.branchName ? `
      <div class="payment-detail"><strong>${t.branchName}:</strong> ${bankAccount.branchName}</div>
    ` : ''}
    ${bankAccount?.accountType ? `
      <div class="payment-detail"><strong>${t.accountType}:</strong> ${bankAccount.accountType}</div>
    ` : ''}
    ${bankAccount?.accountNumber ? `
      <div class="payment-detail"><strong>${t.accountNumber}:</strong> ${bankAccount.accountNumber}</div>
    ` : ''}
    ${bankAccount?.accountHolder ? `
      <div class="payment-detail"><strong>${t.accountHolder}:</strong> ${bankAccount.accountHolder}</div>
    ` : ''}
  </div>

  ${data.remarks ? `
  <div class="remarks-section">
    <div class="remarks-title">${t.remarks}</div>
    <div class="remarks-content">${data.remarks}</div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <!-- フッターテキスト削除 -->
  </div>
</body>
</html>
  `.trim();

  // DEBUG: Verify we reached this point
  console.log('[PDF HTML Generator] === VERIFICATION CODE START ===');

  // DEBUG: Verify machi printing is in the generated HTML
  const hasMachiPrintingRow = html.includes('マチ印刷');
  console.log('[PDF HTML Generator] machiPrinting value:', specs.machiPrinting, 'type:', typeof specs.machiPrinting);
  console.log('[PDF HTML Generator] Machi printing row in HTML:', hasMachiPrintingRow);
  if (!hasMachiPrintingRow && specs.machiPrinting && specs.machiPrinting !== 'なし') {
    console.error('[PDF HTML Generator] ERROR: machiPrinting is truthy but not in HTML!');
    // Log the specifications table section for debugging
    const specsTableStart = html.indexOf('<table class="spec-table">');
    const specsTableEnd = html.indexOf('</table>', specsTableStart) + '</table>'.length;
    if (specsTableStart >= 0 && specsTableEnd > specsTableStart) {
      const specsTable = html.substring(specsTableStart, specsTableEnd);
      console.log('[PDF HTML Generator] Specifications table HTML:', specsTable);
    }
  }

  return html;
}


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
    sealWidth?: string;
    sealDirection?: string;
    notchShape?: string;
    notchPosition?: string;
    hanging?: string;
    hangingPosition?: string;
    zipperPosition?: string;
    cornerR?: string;
  };

  // Optional processing (for Excel template format)
  /** オプション加工 / Optional processing */
  optionalProcessing?: {
    zipper?: boolean;
    notch?: boolean;
    hangingHole?: boolean;
    cornerProcessing?: boolean;
    gasValve?: boolean;
    easyCut?: boolean;
    dieCut?: boolean;
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
  /** PDFバッファ / PDF buffer */
  pdfBuffer?: Buffer;
  /** Base64エンコードされたPDF / Base64 encoded PDF */
  base64?: string;
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
    address: '兵庫県明石市上ノ丸2-11-21-102',
    phone: 'TEL：080-6942-7235',
    email: 'info@epackage-lab.com',
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
      // IFRAME ISOLATION APPROACH - Complete DOM separation
      // ============================================================
      // This creates a completely isolated rendering environment that
      // cannot affect the main page layout in any way - no reflow possible

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-99999px';
      iframe.style.top = '-99999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.borderWidth = '0';
      iframe.style.visibility = 'hidden';
      iframe.style.zIndex = '-999999';

      // Append iframe to DOM
      document.body.appendChild(iframe);

      // Get iframe document and write HTML content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document');
      }

      // Write complete HTML document with CSS
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Wait for iframe content to fully render and fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the body element from iframe for capture
      const iframeBody = iframeDoc.body;

      // Convert to canvas
      const canvas = await html2canvas(iframeBody, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });

      // Clean up: remove iframe immediately after capture
      document.body.removeChild(iframe);

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png', 1.0);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true, // Optimize PDF file size
      });

      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate PDF buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      // Determine filename
      const filename = options.filename || `${data.quoteNumber}.pdf`;

      // Return based on options
      if (options.returnBase64) {
        return {
          success: true,
          base64: pdfBuffer.toString('base64'),
          filename,
          size: pdfBuffer.length,
        };
      }

      return {
        success: true,
        pdfBuffer,
        filename,
        size: pdfBuffer.length,
      };
    } finally {
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
 * Generate HTML for quote (PDF template format)
 *
 * 見積書HTMLを生成（PDFテンプレート形式）
 * Professional Japanese business document matching quotation.md template
 *
 * Design improvements (A4 Single Page Optimization):
 * - Reduced page margins to 10mm (top/bottom) and 15mm (left/right)
 * - Reduced all font sizes by 10-20% for better space utilization
 * - Minimized section spacing from 8mm/10mm to 4mm/5mm
 * - Enhanced "by kanei-trade" visibility with larger, bolder font
 * - Optimized layout to fit single A4 page (297mm total height)
 * - Table columns widened to prevent text wrapping
 * - Remarks section sized appropriately for content
 */
function generateQuoteHTML(
  data: QuoteData,
  totals: { subtotal: number; tax: number; total: number }
): string {
  const specs = data.specifications || {};
  const processing = data.optionalProcessing || {};
  const supplier = data.supplierInfo || JAPANESE_CONSTANTS.DEFAULT_SUPPLIER;

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

  // Calculate totals from items
  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = data.items.reduce((sum, item) => sum + (item.amount || item.unitPrice * item.quantity), 0);

  // Calculate consumption tax (10%)
  const consumptionTax = Math.round(totalAmount * 0.1);
  const grandTotal = totalAmount + consumptionTax;

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

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積書 - ${data.quoteNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif;
      font-size: 9pt; /* REDUCED from 10pt */
      line-height: 1.4; /* REDUCED from 1.5 */
      color: #000;
      background: #fff;
      /* OPTIMIZED MARGINS: 10mm top/bottom, 15mm left/right for A4 single page */
      padding: 10mm 15mm;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
    }

    /* ============================================================
       HEADER SECTION - Top Row with Date and No
       ============================================================ */

    .header-top {
      width: 180mm;
      display: flex;
      justify-content: space-between;
      margin-bottom: 5mm; /* REDUCED from 10mm */
      font-size: 10pt; /* REDUCED from 11pt */
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

    /* ============================================================
       DOCUMENT TITLE
       ============================================================ */

    .doc-title {
      text-align: center;
      font-size: 16pt; /* REDUCED from 20pt */
      font-weight: bold;
      margin-bottom: 6mm; /* REDUCED from 10mm */
      letter-spacing: 0.2em; /* REDUCED from 0.25em */
    }

    /* ============================================================
       INTRODUCTORY TEXT
       ============================================================ */

    .intro-text {
      margin-bottom: 6mm; /* REDUCED from 10mm */
      font-size: 10pt; /* REDUCED from 11pt */
    }

    /* ============================================================
       MAIN LAYOUT - Two-Column with Supplier on Right
       ============================================================ */

    .main-container {
      width: 180mm;
      display: flex;
      gap: 8mm; /* REDUCED from 10mm */
      margin-bottom: 6mm; /* REDUCED from 10mm */
    }

    .left-main {
      flex: 1;
    }

    .right-supplier {
      width: 55mm; /* REDUCED from 60mm */
      flex-shrink: 0;
      text-align: right;
    }

    /* ============================================================
       CUSTOMER SECTION (Left)
       ============================================================ */

    .customer-section {
      margin-bottom: 5mm; /* REDUCED from 8mm */
      padding-left: 2mm;
      min-height: 12mm; /* REDUCED from 15mm */
    }

    .customer-name {
      font-size: 12pt; /* REDUCED from 14pt */
      font-weight: bold;
      margin-bottom: 1.5mm; /* REDUCED from 2mm */
    }

    .customer-detail {
      font-size: 9pt; /* REDUCED from 10pt */
      margin-bottom: 0.8mm; /* REDUCED from 1mm */
    }

    /* ============================================================
       SUPPLIER SECTION (Right Column)
       ============================================================ */

    .supplier-section {
      padding-right: 2mm;
    }

    .supplier-brand {
      font-size: 12pt; /* REDUCED from 14pt */
      font-weight: bold;
      color: #008B8B;
      margin-bottom: 1.5mm; /* REDUCED from 2mm */
    }

    .supplier-subbrand {
      font-size: 11pt; /* INCREASED from 10pt - MORE VISIBLE */
      font-weight: 700; /* INCREASED from 600 - BOLDER */
      color: #000; /* CHANGED from #006666 - BETTER CONTRAST */
      margin-bottom: 1.5mm; /* REDUCED from 2mm */
      text-shadow: 0 0 1px rgba(0,0,0,0.1); /* ADDED - Subtle enhancement */
    }

    .supplier-company {
      font-size: 10pt; /* REDUCED from 11pt */
      font-weight: bold;
      margin-bottom: 0.8mm; /* REDUCED from 1mm */
    }

    .supplier-detail {
      font-size: 8pt; /* REDUCED from 9pt */
      margin-bottom: 0.8mm; /* REDUCED from 1mm */
      line-height: 1.3; /* REDUCED from 1.4 */
    }

    /* ============================================================
       TWO-COLUMN LAYOUT FOR TABLES AND TERMS
       ============================================================ */

    .content-columns {
      width: 180mm;
      display: flex;
      gap: 8mm; /* REDUCED from 10mm */
      margin-bottom: 5mm; /* REDUCED from 8mm */
    }

    .left-column {
      width: 110mm; /* INCREASED from 105mm - BETTER SPACE UTILIZATION */
      flex-shrink: 0;
    }

    .right-column {
      flex: 1;
    }

    /* ============================================================
       TABLE HEADERS
       ============================================================ */

    .section-title {
      background: #D3E4E4;
      padding: 2.5mm 3.5mm; /* REDUCED from 3mm 4mm */
      font-weight: bold;
      font-size: 9pt; /* REDUCED from 10pt */
      margin-bottom: 1.5mm; /* REDUCED from 2mm */
      border: 1px solid #999;
    }

    /* ============================================================
       TERMS TABLE
       ============================================================ */

    .terms-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt; /* REDUCED from 9pt */
      margin-bottom: 5mm; /* REDUCED from 8mm */
    }

    .terms-table td {
      padding: 2.5mm 3.5mm; /* REDUCED from 3mm 4mm */
      border: 1px solid #999;
      vertical-align: middle;
    }

    .term-label {
      width: 25mm;
      font-weight: 600;
      background: #f5f5f5;
    }

    .term-value {
      flex: 1;
    }

    /* ============================================================
       SPECIFICATIONS TABLE
       ============================================================ */

    .specs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt; /* REDUCED from 9pt */
      margin-bottom: 5mm; /* REDUCED from 8mm */
    }

    .specs-table td {
      padding: 2.5mm 3.5mm; /* REDUCED from 3mm 4mm */
      border: 1px solid #999;
      vertical-align: middle;
    }

    .spec-label {
      width: 25mm;
      font-weight: 600;
      background: #f9f9f9;
    }

    .spec-value {
      flex: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* ============================================================
       PROCESSING TABLE
       ============================================================ */

    .processing-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt; /* REDUCED from 9pt */
      margin-bottom: 5mm; /* REDUCED from 8mm */
    }

    .processing-table td {
      padding: 2.5mm 3.5mm; /* REDUCED from 3mm 4mm */
      border: 1px solid #999;
      vertical-align: middle;
    }

    .processing-label {
      width: 30mm;
      font-weight: 500;
    }

    .processing-value {
      text-align: center;
      font-weight: bold;
    }

    /* ============================================================
       ORDER TABLE - INCREASED COLUMN WIDTHS
       ============================================================ */

    .order-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt; /* REDUCED from 9pt */
      margin-bottom: 5mm; /* REDUCED from 8mm */
    }

    .order-table th {
      background: #D3E4E4;
      padding: 2.5mm 3.5mm; /* REDUCED from 3mm 4mm */
      text-align: center;
      font-weight: bold;
      border: 1px solid #999;
    }

    .order-table td {
      padding: 2.5mm 3.5mm; /* REDUCED from 3mm 4mm */
      text-align: center;
      border: 1px solid #999;
    }

    /* INCREASED COLUMN WIDTHS to prevent text wrapping */
    .col-no { width: 10mm; }
    .col-sku { width: 15mm; }
    .col-qty { width: 18mm; }
    .col-unit { width: 22mm; }
    .col-disc { width: 15mm; }
    .col-total { width: 25mm; }

    .summary-row {
      background: #E8F5E9;
      font-weight: bold;
    }

    /* ============================================================
       REMARKS SECTION - OPTIMIZED HEIGHT
       ============================================================ */

    .remarks-section {
      margin-bottom: 5mm; /* REDUCED from 8mm */
    }

    .remarks-content {
      padding: 4mm; /* REDUCED from 5mm */
      border: 1px solid #999;
      font-size: 8pt; /* REDUCED from 9pt */
      white-space: pre-wrap;
      word-break: break-word;
      background: #FFF9E6;
      line-height: 1.5; /* REDUCED from 1.7 */
      min-height: 35mm; /* OPTIMIZED from 45mm - Fits better on A4 */
      max-height: 40mm; /* ADDED - Prevent overflow */
      overflow-y: auto; /* ADDED - Handle overflow if needed */
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <!-- Header: Date (left) and No (right) -->
  <div class="header-top">
    <div class="header-left">${data.issueDate ? formatDate(data.issueDate) : ''}</div>
    <div class="header-right">
      <div class="header-item">
        <span class="header-label">No</span>
        <span>${data.quoteNumber}</span>
      </div>
    </div>
  </div>

  <!-- Document title -->
  <div class="doc-title">見　積　書</div>

  <!-- Introductory text -->
  <div class="intro-text">下記のとおり、御見積もり申し上げます。</div>

  <!-- Main layout with customer (left) and supplier (right) -->
  <div class="main-container">
    <!-- Left: Customer Information -->
    <div class="left-main">
      <div class="customer-section">
        <div class="customer-name">${data.customerName}${data.companyName && data.companyName !== data.customerName ? ` (${data.companyName})` : ''}</div>
        ${data.postalCode ? `<div class="customer-detail">${data.postalCode}</div>` : ''}
        ${data.address ? `<div class="customer-detail">${data.address}</div>` : ''}
        ${data.contactPerson ? `<div class="customer-detail">担当: ${data.contactPerson}</div>` : ''}
      </div>

      <!-- Two columns for tables and terms -->
      <div class="content-columns">
        <!-- Left Column: Specs and Processing -->
        <div class="left-column">
          <!-- Specifications -->
          <div class="section-title">仕様</div>
          <table class="specs-table">
            ${specs.specNumber ? `
            <tr>
              <td class="spec-label">仕様番号</td>
              <td class="spec-value">${specs.specNumber}</td>
            </tr>` : ''}
            ${specs.bagType ? `
            <tr>
              <td class="spec-label">袋タイプ</td>
              <td class="spec-value">${specs.bagType}</td>
            </tr>` : ''}
            ${specs.contents ? `
            <tr>
              <td class="spec-label">内容物</td>
              <td class="spec-value">${specs.contents}</td>
            </tr>` : ''}
            ${specs.size ? `
            <tr>
              <td class="spec-label">サイズ</td>
              <td class="spec-value">${specs.size}</td>
            </tr>` : ''}
            ${specs.material ? `
            <tr>
              <td class="spec-label">素材</td>
              <td class="spec-value">${specs.material}</td>
            </tr>` : ''}
            ${specs.sealWidth ? `
            <tr>
              <td class="spec-label">シール幅</td>
              <td class="spec-value">${specs.sealWidth}</td>
            </tr>` : ''}
            ${specs.sealDirection ? `
            <tr>
              <td class="spec-label">封入方向</td>
              <td class="spec-value">${specs.sealDirection}</td>
            </tr>` : ''}
            ${specs.notchShape ? `
            <tr>
              <td class="spec-label">ノッチ形状</td>
              <td class="spec-value">${specs.notchShape}</td>
            </tr>` : ''}
            ${specs.notchPosition ? `
            <tr>
              <td class="spec-label">ノッチ位置</td>
              <td class="spec-value">${specs.notchPosition}</td>
            </tr>` : ''}
            ${specs.hanging ? `
            <tr>
              <td class="spec-label">吊り下げ加工</td>
              <td class="spec-value">${specs.hanging}</td>
            </tr>` : ''}
            ${specs.hangingPosition ? `
            <tr>
              <td class="spec-label">吊り下げ位置</td>
              <td class="spec-value">${specs.hangingPosition}</td>
            </tr>` : ''}
            ${specs.zipperPosition ? `
            <tr>
              <td class="spec-label">チャック位置</td>
              <td class="spec-value">${specs.zipperPosition}</td>
            </tr>` : ''}
            ${specs.cornerR ? `
            <tr>
              <td class="spec-label">角加工</td>
              <td class="spec-value">${specs.cornerR}</td>
            </tr>` : ''}
          </table>

          <!-- Optional Processing -->
          ${Object.keys(processing).length > 0 ? `
          <div class="section-title">オプション加工</div>
          <table class="processing-table">
            ${processing.zipper !== undefined ? `
            <tr>
              <td class="processing-label">チャック</td>
              <td class="processing-value">${processing.zipper ? '〇' : '-'}</td>
            </tr>` : ''}
            ${processing.notch !== undefined ? `
            <tr>
              <td class="processing-label">ノッチ</td>
              <td class="processing-value">${processing.notch ? '〇' : '-'}</td>
            </tr>` : ''}
            ${processing.hangingHole !== undefined ? `
            <tr>
              <td class="processing-label">吊り下げ穴</td>
              <td class="processing-value">${processing.hangingHole ? '〇' : '-'}</td>
            </tr>` : ''}
            ${processing.cornerProcessing !== undefined ? `
            <tr>
              <td class="processing-label">角加工</td>
              <td class="processing-value">${processing.cornerProcessing ? '〇' : '-'}</td>
            </tr>` : ''}
            ${processing.gasValve !== undefined ? `
            <tr>
              <td class="processing-label">ガス抜きバルブ</td>
              <td class="processing-value">${processing.gasValve ? '〇' : '-'}</td>
            </tr>` : ''}
            ${processing.easyCut !== undefined ? `
            <tr>
              <td class="processing-label">Easy Cut</td>
              <td class="processing-value">${processing.easyCut ? '〇' : '-'}</td>
            </tr>` : ''}
            ${processing.dieCut !== undefined ? `
            <tr>
              <td class="processing-label">型抜き</td>
              <td class="processing-value">${processing.dieCut ? '〇' : '-'}</td>
            </tr>` : ''}
          </table>` : ''}

          <!-- Remarks -->
          <div class="remarks-section">
            <div class="section-title">備考</div>
            <div class="remarks-content">${remarks}</div>
          </div>
        </div>

        <!-- Right Column: Terms and Order Table -->
        <div class="right-column">
          <!-- Payment Terms -->
          <table class="terms-table">
            ${data.paymentTerms ? `
            <tr>
              <td class="term-label">支払い条件</td>
              <td class="term-value">${data.paymentTerms}</td>
            </tr>` : ''}
            ${data.deliveryDate ? `
            <tr>
              <td class="term-label">納期</td>
              <td class="term-value">${data.deliveryDate}</td>
            </tr>` : ''}
            ${data.deliveryLocation ? `
            <tr>
              <td class="term-label">納品場所</td>
              <td class="term-value">${data.deliveryLocation}</td>
            </tr>` : ''}
            ${data.validityPeriod ? `
            <tr>
              <td class="term-label">有効期間</td>
              <td class="term-value">${data.validityPeriod}</td>
            </tr>` : ''}
            ${data.bankInfo ? `
            <tr>
              <td class="term-label">振込先</td>
              <td class="term-value">${data.bankInfo.bankName} ${data.bankInfo.branchName}(005) ${data.bankInfo.accountType} ${data.bankInfo.accountNumber}</td>
            </tr>` : ''}
          </table>

          <!-- Order Table -->
          <table class="order-table">
            <thead>
              <tr>
                <th class="col-no">番号</th>
                <th class="col-sku">商品数<br>(SKU)</th>
                <th class="col-qty">合計数量</th>
                <th class="col-unit">単価</th>
                <th class="col-disc">割引</th>
                <th class="col-total">合計<br>(税別)</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item, index) => `
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
    </div>

    <!-- Right: Supplier Information -->
    <div class="right-supplier">
      <div class="supplier-section">
        <div class="supplier-brand">EPACKAGE Lab</div>
        <div class="supplier-subbrand">by kanei-trade</div>
        <div class="supplier-company">金井貿易株式会社</div>
        <div class="supplier-detail">〒673-0846</div>
        <div class="supplier-detail">兵庫県明石市上ノ丸2-11-21-102</div>
        <div class="supplier-detail">TEL：080-6942-7235</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

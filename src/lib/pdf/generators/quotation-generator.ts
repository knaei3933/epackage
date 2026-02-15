/**
 * Quotation PDF Generator
 *
 * 見積書PDFジェネレーター（新規）
 * - BasePdfGeneratorを継承
 * - 見積書フォーマットに対応
 */

import * as path from 'path';
import type { PdfGenerationOptions, PdfGenerationResult } from '@/types/contract';

// ============================================================
// Types
// ============================================================

/**
 * 見積書品目
 */
export interface QuotationItem {
  /** 品目ID */
  id: string;
  /** 品名 */
  name: string;
  /** 型式・仕様 */
  specification?: string;
  /** 数量 */
  quantity: number;
  /** 単位 */
  unit: string;
  /** 単価（円） */
  unitPrice: number;
  /** 金額（円） */
  amount: number;
  /** 備考 */
  remarks?: string;
}

/**
 * 見積書データ
 */
export interface QuotationData {
  /** 見積番号 */
  quoteNumber: string;
  /** 発行日 */
  issueDate: string;
  /** 有効期限 */
  validUntil: string;
  /** 見積タイトル */
  title?: string;

  /** 見積元（自社）情報 */
  issuer: {
    name: string;
    nameKana?: string;
    address: string;
    postalCode: string;
    representative: string;
    representativeTitle: string;
    contact?: {
      phone?: string;
      email?: string;
      fax?: string;
    };
    bankInfo?: {
      bankName: string;
      branchName: string;
      accountType: '普通' | '当座';
      accountNumber: string;
      accountHolder: string;
    };
  };

  /** 見積先情報 */
  recipient: {
    name: string;
    nameKana?: string;
    address: string;
    postalCode: string;
    representative?: string;
    representativeTitle?: string;
    department?: string;
    contactPerson?: string;
  };

  /** 品目リスト */
  items: QuotationItem[];

  /** 支払条件 */
  paymentTerms?: {
    method?: string;
    deadline?: string;
    depositPercentage?: number;
    depositAmount?: number;
  };

  /** 納期 */
  deliveryTerms?: {
    period?: string;
    location?: string;
  };

  /** 備考 */
  remarks?: string;

  /** 消費税率 */
  taxRate?: number;

  /** 添付ファイル */
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

/**
 * 見積書PDFオプション
 */
export interface QuotationPdfOptions extends PdfGenerationOptions {
  /** 税込み表示 */
  taxIncluded?: boolean;
  /** 備考セクションを表示 */
  showRemarks?: boolean;
  /** 振込先情報を表示 */
  showBankInfo?: boolean;
}

/**
 * 見積書PDF結果
 */
export interface QuotationPdfResult extends PdfGenerationResult {
  metadata?: {
    generatedAt: string;
    fileSize: number;
    pageCount?: number;
    quoteNumber: string;
    totalAmount: number;
    taxAmount: number;
  };
}

// ============================================================
// Configuration
// ============================================================

const QUOTATION_TEMPLATE_PATH = path.join(
  process.cwd(),
  'templet',
  'quotation_ja.html'
);

const DEFAULT_QUOTATION_OPTIONS: Required<QuotationPdfOptions> = {
  format: 'A4',
  orientation: 'portrait',
  displayHeaderFooter: false,
  printBackground: true,
  taxIncluded: true,
  showRemarks: true,
  showBankInfo: true,
  outputPath: '',
};

// ============================================================
// Quotation PDF Generator Class
// ============================================================

/**
 * 見積書PDFジェネレーター
 * Quotation PDF generator
 */
export class QuotationPdfGenerator extends BasePdfGenerator<
  QuotationData,
  QuotationPdfResult
> {
  constructor(options?: Partial<BasePdfGeneratorOptions>) {
    super({
      templatePath: QUOTATION_TEMPLATE_PATH,
      defaultPdfOptions: DEFAULT_QUOTATION_OPTIONS,
      ...options,
    });
  }

  // ============================================================
  // Abstract Method Implementations
  // ============================================================

  /**
   * 見積書データをテンプレートデータに変換
   * Convert quotation data to template data
   */
  protected prepareTemplateData(data: QuotationData): Record<string, unknown> {
    // 小計、税、合計を計算
    const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = data.taxRate || 0.1;
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    return {
      quoteNumber: data.quoteNumber,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      title: data.title || '御見積書',

      // 見積元
      issuerName: data.issuer.name,
      issuerNameKana: data.issuer.nameKana || '',
      issuerAddress: `${data.issuer.postalCode} ${data.issuer.address}`,
      issuerRepresentative: data.issuer.representative,
      issuerRepresentativeTitle: data.issuer.representativeTitle,
      issuerPhone: data.issuer.contact?.phone || '',
      issuerEmail: data.issuer.contact?.email || '',

      // 見積先
      recipientName: data.recipient.name,
      recipientNameKana: data.recipient.nameKana || '',
      recipientAddress: `${data.recipient.postalCode} ${data.recipient.address}`,
      recipientRepresentative: data.recipient.representative || '',
      recipientRepresentativeTitle: data.recipient.representativeTitle || '',
      recipientDepartment: data.recipient.department || '',
      recipientContactPerson: data.recipient.contactPerson || '',

      // 品目
      items: data.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toLocaleString('ja-JP'),
        amount: item.amount.toLocaleString('ja-JP'),
      })),

      // 金額
      subtotal: subtotal.toLocaleString('ja-JP'),
      taxRate: `${(taxRate * 100).toFixed(0)}%`,
      taxAmount: taxAmount.toLocaleString('ja-JP'),
      totalAmount: totalAmount.toLocaleString('ja-JP'),

      subtotalValue: subtotal,
      taxAmountValue: taxAmount,
      totalAmountValue: totalAmount,

      // 支払条件
      paymentMethod: data.paymentTerms?.method || '',
      paymentDeadline: data.paymentTerms?.deadline || '',
      depositPercentage: data.paymentTerms?.depositPercentage
        ? `${data.paymentTerms.depositPercentage * 100}%`
        : '',
      depositAmount: data.paymentTerms?.depositAmount
        ? `¥${data.paymentTerms.depositAmount.toLocaleString('ja-JP')}`
        : '',

      // 納期
      deliveryPeriod: data.deliveryTerms?.period || '',
      deliveryLocation: data.deliveryTerms?.location || '',

      // 振込先
      bankName: data.issuer.bankInfo?.bankName || '',
      branchName: data.issuer.bankInfo?.branchName || '',
      accountType: data.issuer.bankInfo?.accountType || '',
      accountNumber: data.issuer.bankInfo?.accountNumber || '',
      accountHolder: data.issuer.bankInfo?.accountHolder || '',

      // 備考
      remarks: data.remarks || '',

      // 添付ファイル
      hasAttachments: (data.attachments?.length || 0) > 0,
      attachments: data.attachments || [],
    };
  }

  /**
   * 見積書データをバリデート
   * Validate quotation data
   */
  protected validateData(data: QuotationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.quoteNumber) {
      errors.push('見積番号は必須です');
    }
    if (!data.issueDate) {
      errors.push('発行日は必須です');
    }
    if (!data.validUntil) {
      errors.push('有効期限は必須です');
    }
    if (!data.issuer?.name) {
      errors.push('見積元名は必須です');
    }
    if (!data.recipient?.name) {
      errors.push('見積先名は必須です');
    }
    if (!data.items?.length) {
      errors.push('少なくとも1つの品目が必要です');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * PDFサイズを見積もり
   * Estimate PDF file size
   */
  protected estimateSize(data: QuotationData): number {
    // 概算: 基本サイズ2000バイト + 品目ごとに300バイト + 添付ファイルごとに200バイト
    const baseSize = 2000;
    const itemsSize = data.items.length * 300;
    const attachmentsSize = (data.attachments?.length || 0) * 200;

    return baseSize + itemsSize + attachmentsSize;
  }

  /**
   * 成功結果を作成（見積書用にオーバーライド）
   * Create success result (overridden for quotation)
   */
  protected createSuccessResult(
    buffer: Buffer,
    filePath?: string,
    metadata?: Record<string, unknown>
  ): QuotationPdfResult {
    // 金額を計算
    const subtotal = this.calculateTotal(metadata);
    const taxRate = 0.1;
    const taxAmount = Math.round(subtotal * taxRate);

    const result: QuotationPdfResult = {
      success: true,
      buffer,
      metadata: {
        generatedAt: new Date().toISOString(),
        fileSize: buffer.length,
        quoteNumber: (metadata?.quoteNumber as string) || '',
        totalAmount: subtotal + taxAmount,
        taxAmount,
      },
    };

    if (filePath) {
      result.filePath = filePath;
    }

    return result;
  }

  private calculateTotal(metadata?: Record<string, unknown>): number {
    if (!metadata) return 0;
    const items = metadata.items as QuotationItem[];
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.amount, 0);
  }
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * 見積書PDFを生成
 * Generate quotation PDF
 */
export async function generateQuotationPdf(
  data: QuotationData,
  options: QuotationPdfOptions = {}
): Promise<QuotationPdfResult> {
  const generator = new QuotationPdfGenerator();
  return generator.generate(data, options);
}

/**
 * 見積書PDFをBase64で生成
 * Generate quotation PDF as base64
 */
export async function generateQuotationPdfBase64(
  data: QuotationData
): Promise<{ success: boolean; base64?: string; error?: string }> {
  const generator = new QuotationPdfGenerator();
  return generator.generateBase64(data);
}

/**
 * 見積書データをバリデート
 * Validate quotation data
 */
export function validateQuotationData(
  data: QuotationData
): { isValid: boolean; errors: string[] } {
  const generator = new QuotationPdfGenerator();
  return generator.validateData(data);
}

/**
 * PDFサイズを見積もり
 * Estimate PDF file size
 */
export function estimateQuotationPdfSize(data: QuotationData): number {
  const generator = new QuotationPdfGenerator();
  return generator.estimateSize(data);
}

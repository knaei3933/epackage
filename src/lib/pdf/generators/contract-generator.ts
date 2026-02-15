/**
 * Contract PDF Generator
 *
 * 契約書PDFジェネレーター（リファクタリング版）
 * - BasePdfGeneratorを継承
 * - 既存機能を維持しつつ構造を改善
 */

import * as path from 'path';
import type { ContractData } from '@/types/contract';
import type { PdfGenerationOptions, PdfGenerationResult } from '@/types/contract';
import {
  BasePdfGenerator,
  type BasePdfGeneratorOptions,
} from '../core/base';

// ============================================================
// Configuration
// ============================================================

const CONTRACT_TEMPLATE_PATH = path.join(
  process.cwd(),
  'templet',
  'contract_ja_kanei_trade_improved.html'
);

const DEFAULT_CONTRACT_PDF_OPTIONS: Required<PdfGenerationOptions> = {
  format: 'A4',
  orientation: 'portrait',
  displayHeaderFooter: false,
  printBackground: true,
  outputPath: '',
};

// ============================================================
// Contract PDF Generator Class
// ============================================================

/**
 * 契約書PDFジェネレーター
 * Contract PDF generator
 */
export class ContractPdfGenerator extends BasePdfGenerator<ContractData, PdfGenerationResult> {
  constructor(options?: Partial<BasePdfGeneratorOptions>) {
    super({
      templatePath: CONTRACT_TEMPLATE_PATH,
      defaultPdfOptions: DEFAULT_CONTRACT_PDF_OPTIONS,
      ...options,
    });
  }

  // ============================================================
  // Abstract Method Implementations
  // ============================================================

  /**
   * 契約書データをテンプレートデータに変換
   * Convert contract data to template data
   */
  protected prepareTemplateData(data: ContractData): Record<string, unknown> {
    // 買い手/売り手をクライアント/サプライヤーにマッピング
    const buyer = data.buyer;
    const seller = data.seller;

    return {
      contractNumber: data.contractNumber,
      issueDate: data.issueDate,
      effectiveDate: data.effectiveDate,
      validUntil: data.validUntil || '',
      orderNumber: data.orderNumber || '',

      // 買い手（クライアント）情報
      clientName: buyer.name,
      clientNameKana: buyer.nameKana || '',
      clientAddress: `${buyer.postalCode} ${buyer.address}`,
      clientRepresentative: buyer.representative,
      clientRepresentativeTitle: buyer.representativeTitle,
      clientPhone: buyer.contact?.phone || '',
      clientEmail: buyer.contact?.email || '',

      // 売り手（サプライヤー）情報
      supplierName: seller.name,
      supplierNameKana: seller.nameKana || '',
      supplierAddress: `${seller.postalCode} ${seller.address}`,
      supplierRepresentative: seller.representative,
      supplierRepresentativeTitle: seller.representativeTitle,

      // 契約品目
      items: data.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toLocaleString('ja-JP'),
        amount: item.amount.toLocaleString('ja-JP'),
      })),

      // 合計額計算
      totalAmount: data.items.reduce((sum, item) => sum + item.amount, 0),
      subtotalAmount: data.items
        .reduce((sum, item) => sum + item.amount, 0)
        .toLocaleString('ja-JP'),

      // 支払条件
      paymentMethod: data.terms.payment.method,
      paymentDeadline: data.terms.payment.deadline,
      depositPercentage: data.terms.payment.depositPercentage
        ? `${data.terms.payment.depositPercentage * 100}%`
        : '',
      depositAmount: data.terms.payment.depositAmount
        ? `¥${data.terms.payment.depositAmount.toLocaleString('ja-JP')}`
        : '',
      bankInfo: seller.bankInfo
        ? `${seller.bankInfo.bankName} ${seller.bankInfo.branchName} ${seller.bankInfo.accountType} ${seller.bankInfo.accountNumber}`
        : '',

      // 納品条件
      deliveryPeriod: data.terms.delivery.period,
      deliveryLocation: data.terms.delivery.location,
      deliveryConditions: data.terms.delivery.conditions,

      // 特別条項
      specialTerms: data.terms.specialTerms || [],
      hasSpecialTerms: (data.terms.specialTerms?.length || 0) > 0,

      // 備考
      remarks: data.remarks || '',

      // 署名画像（買い手=クライアント、売り手=サプライヤー）
      clientStamp: data.buyerSignatory?.stamp?.imageUrl || '',
      clientSignature: data.buyerSignatory?.signature?.imageUrl || '',
      supplierStamp: data.sellerSignatory?.stamp?.imageUrl || '',
      supplierSignature: data.sellerSignatory?.signature?.imageUrl || '',

      // 署名日
      clientSignDate: data.buyerSignatory?.date || '',
      supplierSignDate: data.sellerSignatory?.date || '',

      // 署名者名
      clientSignName: data.buyerSignatory?.name || buyer.representative,
      supplierSignName: data.sellerSignatory?.name || seller.representative,

      // 署名フラグ
      hasClientStamp: !!data.buyerSignatory?.stamp,
      hasClientSignature: !!data.buyerSignatory?.signature,
      hasSupplierStamp: !!data.sellerSignatory?.stamp,
      hasSupplierSignature: !!data.sellerSignatory?.signature,
    };
  }

  /**
   * 契約書データをバリデート
   * Validate contract data
   */
  protected validateData(data: ContractData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.contractNumber) {
      errors.push('契約番号は必須です');
    }
    if (!data.issueDate) {
      errors.push('発行日は必須です');
    }
    if (!data.effectiveDate) {
      errors.push('契約日は必須です');
    }
    if (!data.buyer?.name) {
      errors.push('買い手名は必須です');
    }
    if (!data.seller?.name) {
      errors.push('売り手名は必須です');
    }
    if (!data.items?.length) {
      errors.push('少なくとも1つの契約品目が必要です');
    }
    if (!data.terms?.payment?.method) {
      errors.push('支払方法は必須です');
    }
    if (!data.terms?.delivery?.period) {
      errors.push('納期は必須です');
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
  protected estimateSize(data: ContractData): number {
    // 概算: 基本サイズ2000バイト + 品目ごとに500バイト + 署名ごとに1000バイト
    const baseSize = 2000;
    const itemsSize = data.items.length * 500;
    const signatorySize =
      (data.buyerSignatory ? 1 : 0) * 1000 + (data.sellerSignatory ? 1 : 0) * 1000;
    const attachmentSize = (data.attachments?.length || 0) * 500;

    return baseSize + itemsSize + signatorySize + attachmentSize;
  }
}

// ============================================================
// Convenience Functions (Backward Compatibility)
// ============================================================

/**
 * 契約書PDFを生成
 * Generate contract PDF
 */
export async function generateContractPdf(
  data: ContractData,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const generator = new ContractPdfGenerator();
  return generator.generate(data, options);
}

/**
 * 契約書PDFをBase64で生成
 * Generate contract PDF as base64
 */
export async function generateContractPdfBase64(
  data: ContractData
): Promise<{ success: boolean; base64?: string; error?: string }> {
  const generator = new ContractPdfGenerator();
  return generator.generateBase64(data);
}

/**
 * 契約書データをバリデート
 * Validate contract data
 */
export function validateContractData(
  data: ContractData
): { isValid: boolean; errors: string[] } {
  const generator = new ContractPdfGenerator();
  return generator.validateData(data);
}

/**
 * PDFサイズを見積もり
 * Estimate PDF file size
 */
export function estimateContractPdfSize(data: ContractData): number {
  const generator = new ContractPdfGenerator();
  return generator.estimateSize(data);
}

/**
 * モック契約書データを作成
 * Create mock contract data for testing
 */
export function createMockContractData(): ContractData {
  return {
    contractNumber: 'CTR-2024-001',
    issueDate: '2024-04-01',
    effectiveDate: '2024-04-15',
    validUntil: '2025-04-14',
    orderNumber: 'ORD-2024-001',
    status: 'active',

    buyer: {
      name: 'テスト株式会社',
      nameKana: 'テストカブシキガイシャ',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      representative: '山田 太郎',
      representativeTitle: '代表取締役',
      contact: {
        phone: '03-1234-5678',
        email: 'test@example.com',
        fax: '03-1234-5679',
      },
    },

    seller: {
      name: 'EPACKAGE Lab株式会社',
      nameKana: 'イーパックケージラボカブシキガイシャ',
      postalCode: '673-0846',
      address: '兵庫県明石市上ノ丸2-11-21',
      representative: '金井 一郎',
      representativeTitle: '代表取締役',
      contact: {
        phone: '050-1793-6500',
        email: 'info@package-lab.com',
      },
      bankInfo: {
        bankName: 'PayPay銀行',
        branchName: 'ビジネス営業部支店',
        accountType: '普通',
        accountNumber: '5630235',
        accountHolder: '金井貿易株式会社',
      },
    },

    items: [
      {
        id: 'ITEM-001',
        name: 'オーダーメイドバッグ（スタンドパウチ）',
        specification: 'サイズ: A4、素材: PET/AL/PE、厚み: 100μm',
        quantity: 1000,
        unit: '個',
        unitPrice: 150,
        amount: 150000,
        remarks: '特別仕様',
      },
    ],

    terms: {
      payment: {
        method: '銀行振込',
        deadline: '納品後30日以内',
        depositPercentage: 0.3,
        depositAmount: 45000,
      },
      delivery: {
        period: '契約日から約30日',
        location: '貴社指定場所',
        conditions: '分割納品可能',
        partialDelivery: true,
      },
      period: {
        startDate: '2024-04-15',
        endDate: '2025-04-14',
        validity: '1年間',
      },
      specialTerms: [
        '本契約に定める以外の事項については、別途合意書により定める。',
        '本契約の有効期間は、発行日から1年間とする。',
      ],
    },

    sellerSignatory: {
      name: '金井 一郎',
      title: '代表取締役',
      date: '2024-04-01',
    },
    buyerSignatory: {
      name: '山田 太郎',
      title: '代表取締役',
      date: '2024-04-01',
    },

    remarks: 'テスト用契約書です。',
  };
}

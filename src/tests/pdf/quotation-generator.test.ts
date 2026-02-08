/**
 * Quotation PDF Generator Tests
 *
 * 見積書PDFジェネレーターテスト
 * - データ変換
 * - バリデーション
 * - サイズ見積もり
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  QuotationPdfGenerator,
} from '@/lib/pdf/generators/quotation-generator';
import type { QuotationData, QuotationItem } from '@/lib/pdf/generators/quotation-generator';

// ============================================================
// Test Helper Functions
// ============================================================

function createMockQuotationData(): QuotationData {
  const items: QuotationItem[] = [
    {
      id: 'ITEM-001',
      name: 'オーダーメイドバッグ',
      specification: 'サイズ: A4、素材: PET/AL/PE',
      quantity: 1000,
      unit: '個',
      unitPrice: 150,
      amount: 150000,
      remarks: '特別仕様',
    },
    {
      id: 'ITEM-002',
      name: 'ジッパー追加',
      specification: '上部ジッパー',
      quantity: 1000,
      unit: '個',
      unitPrice: 10,
      amount: 10000,
    },
  ];

  return {
    quoteNumber: 'QT-2024-001',
    issueDate: '2024-04-01',
    validUntil: '2024-07-01',
    title: '御見積書',

    issuer: {
      name: 'EPACKAGE Lab株式会社',
      nameKana: 'イーパックケージラボカブシキガイシャ',
      address: '兵庫県明石市上ノ丸2-11-21',
      postalCode: '673-0846',
      representative: '金井 一郎',
      representativeTitle: '代表取締役',
      contact: {
        phone: '050-1793-6500',
        email: 'info@package-lab.com',
        fax: '050-1793-6501',
      },
      bankInfo: {
        bankName: 'PayPay銀行',
        branchName: 'ビジネス営業部支店',
        accountType: '普通',
        accountNumber: '5630235',
        accountHolder: 'EPACKAGE Lab株式会社',
      },
    },

    recipient: {
      name: 'テスト株式会社',
      nameKana: 'テストカブシキガイシャ',
      address: '東京都千代田区千代田1-1-1',
      postalCode: '100-0001',
      representative: '山田 太郎',
      representativeTitle: '代表取締役',
      department: '資材調達部',
      contactPerson: '田中 次郎',
    },

    items,

    paymentTerms: {
      method: '銀行振込',
      deadline: '納品後30日以内',
      depositPercentage: 0.3,
      depositAmount: 48000,
    },

    deliveryTerms: {
      period: '受注確認後30日〜45日',
      location: '貴社指定場所',
    },

    remarks: '本見積もりは発行日から90日間有効です。',

    taxRate: 0.1,
  };
}

// ============================================================
// Tests
// ============================================================

describe('QuotationPdfGenerator', () => {
  let generator: QuotationPdfGenerator;

  beforeEach(() => {
    generator = new QuotationPdfGenerator();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(generator).toBeInstanceOf(QuotationPdfGenerator);
    });
  });

  describe('Validation', () => {
    it('should validate correct quotation data', () => {
      const data = createMockQuotationData();
      const result = generator.validateData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data without quote number', () => {
      const data = createMockQuotationData();
      data.quoteNumber = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('見積番号は必須です');
    });

    it('should reject data without issue date', () => {
      const data = createMockQuotationData();
      data.issueDate = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('発行日は必須です');
    });

    it('should reject data without valid until date', () => {
      const data = createMockQuotationData();
      data.validUntil = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('有効期限は必須です');
    });

    it('should reject data without issuer name', () => {
      const data = createMockQuotationData();
      data.issuer.name = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('見積元名は必須です');
    });

    it('should reject data without recipient name', () => {
      const data = createMockQuotationData();
      data.recipient.name = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('見積先名は必須です');
    });

    it('should reject data without items', () => {
      const data = createMockQuotationData();
      data.items = [];

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('少なくとも1つの品目が必要です');
    });
  });

  describe('Template Data Preparation', () => {
    it('should prepare template data correctly', () => {
      const data = createMockQuotationData();
      const templateData = generator.prepareTemplateData(data);

      // 基本フィールド
      expect(templateData.quoteNumber).toBe('QT-2024-001');
      expect(templateData.issueDate).toBe('2024-04-01');
      expect(templateData.validUntil).toBe('2024-07-01');
      expect(templateData.title).toBe('御見積書');

      // 見積元
      expect(templateData.issuerName).toBe('EPACKAGE Lab株式会社');
      expect(templateData.issuerRepresentative).toBe('金井 一郎');

      // 見積先
      expect(templateData.recipientName).toBe('テスト株式会社');
      expect(templateData.recipientRepresentative).toBe('山田 太郎');
      expect(templateData.recipientDepartment).toBe('資材調達部');
      expect(templateData.recipientContactPerson).toBe('田中 次郎');

      // 品目
      expect(Array.isArray(templateData.items)).toBe(true);
      expect(templateData.items.length).toBe(2);

      // 金額
      expect(templateData.subtotal).toBe('160,000');
      expect(templateData.taxRate).toBe('10%');
      expect(templateData.taxAmount).toBe('16,000');
      expect(templateData.totalAmount).toBe('176,000');

      // 支払条件
      expect(templateData.paymentMethod).toBe('銀行振込');
      expect(templateData.paymentDeadline).toBe('納品後30日以内');

      // 納期
      expect(templateData.deliveryPeriod).toBe('受注確認後30日〜45日');

      // 振込先
      expect(templateData.bankName).toBe('PayPay銀行');
      expect(templateData.branchName).toBe('ビジネス営業部支店');

      // 備考
      expect(templateData.remarks).toBe('本見積もりは発行日から90日間有効です。');
    });

    it('should calculate amounts correctly', () => {
      const data = createMockQuotationData();
      const templateData = generator.prepareTemplateData(data);

      expect(templateData.subtotalValue).toBe(160000);
      expect(templateData.taxAmountValue).toBe(16000);
      expect(templateData.totalAmountValue).toBe(176000);
    });

    it('should format item prices', () => {
      const data = createMockQuotationData();
      const templateData = generator.prepareTemplateData(data);

      const items = templateData.items as any[];
      expect(items[0].unitPrice).toBe('150');
      expect(items[0].amount).toBe('150,000');
      expect(items[1].unitPrice).toBe('10');
      expect(items[1].amount).toBe('10,000');
    });

    it('should handle optional fields', () => {
      const data = createMockQuotationData();
      data.paymentTerms = undefined;
      data.deliveryTerms = undefined;
      data.remarks = undefined;
      data.attachments = undefined;

      const templateData = generator.prepareTemplateData(data);

      expect(templateData.paymentMethod).toBe('');
      expect(templateData.paymentDeadline).toBe('');
      expect(templateData.deliveryPeriod).toBe('');
      expect(templateData.deliveryLocation).toBe('');
      expect(templateData.remarks).toBe('');
      expect(templateData.hasAttachments).toBe(false);
    });

    it('should handle attachments', () => {
      const data = createMockQuotationData();
      data.attachments = [
        {
          id: 'ATTACH-001',
          name: 'spec.pdf',
          url: 'https://example.com/spec.pdf',
        },
      ];

      const templateData = generator.prepareTemplateData(data);

      expect(templateData.hasAttachments).toBe(true);
      const attachments = templateData.attachments as any[];
      expect(attachments.length).toBe(1);
      expect(attachments[0].name).toBe('spec.pdf');
    });
  });

  describe('Size Estimation', () => {
    it('should estimate size for simple quotation', () => {
      const data = createMockQuotationData();
      data.items = [];
      data.attachments = undefined;

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(5000);
    });

    it('should estimate size for quotation with items', () => {
      const data = createMockQuotationData();
      data.items = Array(10).fill({
        id: 'ITEM',
        name: 'Test Item',
        quantity: 1,
        unit: '個',
        unitPrice: 100,
        amount: 100,
      });

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(2000);
    });

    it('should estimate size for quotation with attachments', () => {
      const data = createMockQuotationData();
      data.attachments = Array(5).fill({
        id: 'ATTACH',
        name: 'attachment.pdf',
        url: 'https://example.com/attachment.pdf',
      });

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(2000);
    });
  });

  describe('Result Creation', () => {
    it('should create success result with metadata', () => {
      const buffer = Buffer.from('test');
      const metadata = {
        quoteNumber: 'QT-001',
        items: [
          { id: '1', name: 'Item', quantity: 1, unit: '個', unitPrice: 100, amount: 100 },
        ],
      };

      const result = generator.createSuccessResult(buffer, '/path/to/file.pdf', metadata);

      expect(result.success).toBe(true);
      expect(result.buffer).toEqual(buffer);
      expect(result.filePath).toBe('/path/to/file.pdf');
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.quoteNumber).toBe('QT-001');
      expect(result.metadata!.totalAmount).toBe(110); // 100 + 10% tax
      expect(result.metadata!.taxAmount).toBe(10);
    });
  });
});

describe('QuotationPdfGenerator Edge Cases', () => {
  it('should handle zero tax rate', () => {
    const generator = new QuotationPdfGenerator();
    const data = createMockQuotationData();
    data.taxRate = 0;

    const templateData = generator.prepareTemplateData(data);

    expect(templateData.taxRate).toBe('0%');
    expect(templateData.taxAmountValue).toBe(0);
    expect(templateData.totalAmountValue).toBe(160000);
  });

  it('should handle different tax rate', () => {
    const generator = new QuotationPdfGenerator();
    const data = createMockQuotationData();
    data.taxRate = 0.08;

    const templateData = generator.prepareTemplateData(data);

    expect(templateData.taxRate).toBe('8%');
    expect(templateData.taxAmountValue).toBe(12800);
    expect(templateData.totalAmountValue).toBe(172800);
  });

  it('should handle items with zero amount', () => {
    const generator = new QuotationPdfGenerator();
    const data = createMockQuotationData();
    data.items[0].amount = 0;

    const templateData = generator.prepareTemplateData(data);

    const items = templateData.items as any[];
    expect(items[0].amount).toBe('0');
  });

  it('should handle very large amounts', () => {
    const generator = new QuotationPdfGenerator();
    const data = createMockQuotationData();
    data.items[0].amount = 999999999;

    const templateData = generator.prepareTemplateData(data);

    const items = templateData.items as any[];
    expect(items[0].amount).toBe('999,999,999');
  });
});

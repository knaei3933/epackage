/**
 * Contract PDF Generator Tests
 *
 * 契約書PDFジェネレーターテスト
 * - データ変換
 * - バリデーション
 * - サイズ見積もり
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ContractPdfGenerator,
  createMockContractData,
} from '@/lib/pdf/generators/contract-generator';
import type { ContractData } from '@/types/contract';

// ============================================================
// Tests
// ============================================================

describe('ContractPdfGenerator', () => {
  let generator: ContractPdfGenerator;

  beforeEach(() => {
    generator = new ContractPdfGenerator();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(generator).toBeInstanceOf(ContractPdfGenerator);
      expect(generator).toBeInstanceOf(Object);
    });
  });

  describe('Validation', () => {
    it('should validate correct contract data', () => {
      const data = createMockContractData();
      const result = generator.validateData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data without contract number', () => {
      const data = createMockContractData();
      data.contractNumber = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('契約番号は必須です');
    });

    it('should reject data without issue date', () => {
      const data = createMockContractData();
      data.issueDate = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('発行日は必須です');
    });

    it('should reject data without buyer name', () => {
      const data = createMockContractData();
      data.buyer.name = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('買い手名は必須です');
    });

    it('should reject data without seller name', () => {
      const data = createMockContractData();
      data.seller.name = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('売り手名は必須です');
    });

    it('should reject data without items', () => {
      const data = createMockContractData();
      data.items = [];

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('少なくとも1つの契約品目が必要です');
    });

    it('should reject data without payment method', () => {
      const data = createMockContractData();
      data.terms.payment.method = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('支払方法は必須です');
    });

    it('should reject data without delivery period', () => {
      const data = createMockContractData();
      data.terms.delivery.period = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('納期は必須です');
    });

    it('should collect multiple validation errors', () => {
      const data: Partial<ContractData> = {
        contractNumber: '',
        issueDate: '',
        buyer: { name: '', address: '', postalCode: '', representative: '', representativeTitle: '' },
        seller: { name: '', address: '', postalCode: '', representative: '', representativeTitle: '' },
        items: [],
        terms: {
          payment: { method: '', deadline: '' },
          delivery: { period: '', location: '', conditions: '' },
        },
      };

      const result = generator.validateData(data as ContractData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });

  describe('Template Data Preparation', () => {
    it('should prepare template data correctly', () => {
      const data = createMockContractData();
      const templateData = generator.prepareTemplateData(data);

      // 基本フィールド
      expect(templateData.contractNumber).toBe('CTR-2024-001');
      expect(templateData.issueDate).toBe('2024-04-01');
      expect(templateData.effectiveDate).toBe('2024-04-15');

      // 買い手情報
      expect(templateData.clientName).toBe('テスト株式会社');
      expect(templateData.clientRepresentative).toBe('山田 太郎');

      // 売り手情報
      expect(templateData.supplierName).toBe('EPACKAGE Lab株式会社');
      expect(templateData.supplierRepresentative).toBe('金井 一郎');

      // 品目情報
      expect(Array.isArray(templateData.items)).toBe(true);
      expect(templateData.items.length).toBe(1);

      // 金額フォーマット
      const firstItem = templateData.items[0] as any;
      expect(firstItem.unitPrice).toBe('150');
      expect(firstItem.amount).toBe('150,000');

      // 合計額
      expect(templateData.totalAmount).toBe(150000);
      expect(templateData.subtotalAmount).toBe('150,000');
    });

    it('should handle optional fields', () => {
      const data = createMockContractData();
      data.validUntil = undefined;
      data.orderNumber = undefined;

      const templateData = generator.prepareTemplateData(data);

      expect(templateData.validUntil).toBe('');
      expect(templateData.orderNumber).toBe('');
    });

    it('should handle signatory information', () => {
      const data = createMockContractData();
      const templateData = generator.prepareTemplateData(data);

      // 署名者情報
      expect(templateData.supplierSignName).toBe('金井 一郎');
      expect(templateData.clientSignName).toBe('山田 太郎');
    });

    it('should handle bank information', () => {
      const data = createMockContractData();
      const templateData = generator.prepareTemplateData(data);

      expect(templateData.bankInfo).toContain('PayPay銀行');
      expect(templateData.bankInfo).toContain('ビジネス営業部支店');
    });
  });

  describe('Size Estimation', () => {
    it('should estimate size for simple contract', () => {
      const data = createMockContractData();
      data.items = [];
      data.buyerSignatory = undefined;
      data.sellerSignatory = undefined;
      data.attachments = undefined;

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(5000);
    });

    it('should estimate size for contract with items', () => {
      const data = createMockContractData();
      data.items = Array(10).fill({
        id: 'ITEM',
        name: 'Test Item',
        specification: 'Spec',
        quantity: 1,
        unit: '個',
        unitPrice: 100,
        amount: 100,
      });

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(2000);
      expect(size).toBeLessThan(10000);
    });

    it('should estimate size for contract with signatories', () => {
      const data = createMockContractData();
      data.buyerSignatory = {
        name: 'Test Signer',
        title: 'Representative',
        date: '2024-04-01',
      };
      data.sellerSignatory = {
        name: 'Test Signer',
        title: 'Representative',
        date: '2024-04-01',
      };

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(2000);
    });

    it('should estimate size for contract with attachments', () => {
      const data = createMockContractData();
      data.attachments = Array(5).fill({
        id: 'ATTACH',
        name: 'attachment.pdf',
        type: 'application/pdf',
        size: 1024,
        url: 'https://example.com/attachment.pdf',
        uploadedAt: '2024-04-01',
      });

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(2000);
    });
  });

  describe('Mock Data', () => {
    it('should create valid mock contract data', () => {
      const data = createMockContractData();

      expect(data.contractNumber).toBe('CTR-2024-001');
      expect(data.buyer.name).toBe('テスト株式会社');
      expect(data.seller.name).toBe('EPACKAGE Lab株式会社');
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.terms).toBeDefined();
    });

    it('should have all required fields in mock data', () => {
      const data = createMockContractData();

      expect(data.contractNumber).toBeTruthy();
      expect(data.issueDate).toBeTruthy();
      expect(data.effectiveDate).toBeTruthy();
      expect(data.buyer.name).toBeTruthy();
      expect(data.seller.name).toBeTruthy();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.terms.payment.method).toBeTruthy();
      expect(data.terms.delivery.period).toBeTruthy();
    });
  });
});

describe('ContractPdfGenerator Integration', () => {
  it('should handle complete workflow', () => {
    const generator = new ContractPdfGenerator();
    const data = createMockContractData();

    // バリデーション
    const validation = generator.validateData(data);
    expect(validation.isValid).toBe(true);

    // テンプレートデータ準備
    const templateData = generator.prepareTemplateData(data);
    expect(templateData).toBeDefined();

    // サイズ見積もり
    const size = generator.estimateSize(data);
    expect(size).toBeGreaterThan(0);
  });

  it('should handle edge case data', () => {
    const generator = new ContractPdfGenerator();
    const data = createMockContractData();

    // 空の配列
    data.specialTerms = [];
    data.attachments = [];

    const templateData = generator.prepareTemplateData(data);
    expect(templateData.specialTerms).toEqual([]);
    expect(templateData.hasSpecialTerms).toBe(false);
  });
});

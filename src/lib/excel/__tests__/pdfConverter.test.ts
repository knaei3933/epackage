/**
 * PDF Converter Unit Tests
 *
 * PDF変換機能単体テスト
 * Unit tests for PDF generation functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  QuotationPDFDocument,
  generatePdfDocument,
  generatePdfBuffer,
  generatePdfBase64,
  validatePdfData,
  estimatePdfSize,
  isPdfSizeAcceptable,
} from '../pdfConverter';
import type { ExcelQuotationData } from '../excelDataMapper';

// ============================================================
// Test Data Helpers
// ============================================================

function createMockQuotationData(
  overrides?: Partial<ExcelQuotationData>
): ExcelQuotationData {
  return {
    clientInfo: {
      company: '株式会社テスト',
      postalCode: '100-0001',
      address: '東京都千代田区テスト1-1-1',
      contact: '山田 太郎',
    },
    supplierInfo: {
      company: 'EPACKAGE Lab',
      subBrand: 'by kanei-trade',
      companyName: '金井貿易株式会社',
      postalCode: '〒673-0846',
      address: '兵庫県明石市上ノ丸2-11-21',
      phone: 'TEL: 050-1793-6500',
      email: 'info@package-lab.com',
      description: 'オーダーメイドバッグ印刷専門',
    },
    paymentTerms: {
      quotationNumber: 'QT-2024-TEST-001',
      quotationDate: '令和6年4月1日',
      quotationExpiry: '見積日から30日間',
      paymentMethod: '先払い',
      submissionDeadline: '指定なし',
      proofDeadline: '指定なし',
      paymentDeadline: '校了前',
      constructionPeriod: '校了から約1か月',
      deliveryLocation: '御指定場所',
      deliveryDate: '校了から約1か月',
      bankInfo: 'PayPay銀行 ビジネス営業部支店(005)普通 5630235',
    },
    specifications: {
      'パウチタイプ': 'スタンドパウチ',
      '寸法': 'W150mm × H200mm × G50mm',
      '材質': 'PET12/AL7/PE80',
    },
    orderItems: [
      {
        name: 'テスト商品1',
        quantity: 1000,
        unit: '枚',
        unitPrice: '¥150',
        amount: '¥150,000',
      },
      {
        name: 'テスト商品2',
        quantity: 500,
        unit: '枚',
        unitPrice: '¥200',
        amount: '¥100,000',
      },
    ],
    processing_options: {
      'ノッチ': true,
      '吊り穴': true,
      'ジッパー': false,
    },
    ...overrides,
  };
}

// ============================================================
// Test Suites
// ============================================================

describe('validatePdfData', () => {
  it('should validate complete quotation data', () => {
    const data = createMockQuotationData();
    const result = validatePdfData(data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing client company', () => {
    const data = createMockQuotationData({
      clientInfo: {
        company: '',
        postalCode: '100-0001',
        address: '東京都',
        contact: '担当者',
      },
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Client company'))).toBe(true);
  });

  it('should detect missing postal code', () => {
    const data = createMockQuotationData({
      clientInfo: {
        company: '株式会社テスト',
        postalCode: '',
        address: '東京都',
        contact: '担当者',
      },
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('postal code'))).toBe(true);
  });

  it('should detect missing quotation number', () => {
    const data = createMockQuotationData({
      paymentTerms: {
        ...createMockQuotationData().paymentTerms,
        quotationNumber: '',
      },
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Quotation number'))).toBe(true);
  });

  it('should detect missing order items', () => {
    const data = createMockQuotationData({
      orderItems: [],
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('order item'))).toBe(true);
  });

  it('should collect all validation errors', () => {
    const data = createMockQuotationData({
      clientInfo: {
        company: '',
        postalCode: '',
        address: '東京都',
        contact: '担当者',
      },
      paymentTerms: {
        ...createMockQuotationData().paymentTerms,
        quotationNumber: '',
      },
      orderItems: [],
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('estimatePdfSize', () => {
  it('should estimate size for basic quotation', () => {
    const data = createMockQuotationData({
      orderItems: [
        {
          name: '商品1',
          quantity: 100,
          unit: '枚',
          unitPrice: '¥100',
          amount: '¥10,000',
        },
      ],
      specifications: {
        'タイプ': 'スタンドパウチ',
      },
      processing_options: {
        'ノッチ': true,
      },
    });

    const size = estimatePdfSize(data);

    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(500000); // Should be well under 500KB
  });

  it('should increase size with more items', () => {
    const smallData = createMockQuotationData({
      orderItems: [
        {
          name: '商品1',
          quantity: 100,
          unit: '枚',
          unitPrice: '¥100',
          amount: '¥10,000',
        },
      ],
    });

    const largeData = createMockQuotationData({
      orderItems: Array.from({ length: 50 }, (_, i) => ({
        name: `商品${i + 1}`,
        quantity: 100,
        unit: '枚',
        unitPrice: '¥100',
        amount: '¥10,000',
      })),
    });

    const smallSize = estimatePdfSize(smallData);
    const largeSize = estimatePdfSize(largeData);

    expect(largeSize).toBeGreaterThan(smallSize);
  });

  it('should account for specifications', () => {
    const fewSpecs = createMockQuotationData({
      specifications: {
        'タイプ': 'スタンドパウチ',
      },
    });

    const manySpecs = createMockQuotationData({
      specifications: {
        'タイプ': 'スタンドパウチ',
        '寸法': 'W150 × H200',
        '材質': 'PET12/AL7/PE80',
        '印刷': 'グラビア印刷',
        'バリア性': '高い',
      },
    });

    const fewSize = estimatePdfSize(fewSpecs);
    const manySize = estimatePdfSize(manySpecs);

    expect(manySize).toBeGreaterThan(fewSize);
  });

  it('should account for processing options', () => {
    const fewOptions = createMockQuotationData({
      processing_options: {
        'ノッチ': true,
      },
    });

    const manyOptions = createMockQuotationData({
      processing_options: {
        'ノッチ': true,
        '吊り穴': true,
        'ジッパー': true,
        'スリット': false,
        'エンボス': false,
      },
    });

    const fewSize = estimatePdfSize(fewOptions);
    const manySize = estimatePdfSize(manyOptions);

    expect(manySize).toBeGreaterThan(fewSize);
  });
});

describe('isPdfSizeAcceptable', () => {
  it('should return true for small quotations', () => {
    const data = createMockQuotationData({
      orderItems: [
        {
          name: '商品1',
          quantity: 100,
          unit: '枚',
          unitPrice: '¥100',
          amount: '¥10,000',
        },
      ],
    });

    const acceptable = isPdfSizeAcceptable(data);

    expect(acceptable).toBe(true);
  });

  it('should return true for moderate quotations', () => {
    const data = createMockQuotationData({
      orderItems: Array.from({ length: 20 }, (_, i) => ({
        name: `商品${i + 1}`,
        quantity: 100,
        unit: '枚',
        unitPrice: '¥100',
        amount: '¥10,000',
      })),
    });

    const acceptable = isPdfSizeAcceptable(data);

    expect(acceptable).toBe(true);
  });

  it('should estimate correctly for large quotations', () => {
    // Create a very large quotation
    const data = createMockQuotationData({
      orderItems: Array.from({ length: 100 }, (_, i) => ({
        name: `商品${i + 1}`,
        quantity: 100,
        unit: '枚',
        unitPrice: '¥100',
        amount: '¥10,000',
      })),
      specifications: {
        'タイプ': 'スタンドパウチ',
        '寸法': 'W150 × H200 × G50',
        '材質': 'PET12/AL7/PE80',
        '印刷': 'グラビア印刷',
        'バリア性': '高い',
        '耐熱性': 'あり',
      },
      processing_options: {
        'ノッチ': true,
        '吊り穴': true,
        'ジッパー': true,
        'スリット': true,
        'エンボス': false,
      },
    });

    const size = estimatePdfSize(data);
    const acceptable = isPdfSizeAcceptable(data);

    // Check size estimate is reasonable
    expect(size).toBeGreaterThan(0);

    // Should still be acceptable (estimate is conservative)
    expect(acceptable).toBe(true);
  });
});

describe('generatePdfBuffer', () => {
  it('should generate PDF buffer from valid data', async () => {
    const data = createMockQuotationData();

    const buffer = await generatePdfBuffer(data);

    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for PDF generation

  it('should generate PDF with Japanese text', async () => {
    const data = createMockQuotationData({
      clientInfo: {
        company: '株式会社テスト会社',
        postalCode: '100-0001',
        address: '東京都千代田区',
        contact: '山田 太郎',
      },
      orderItems: [
        {
          name: 'オーダーメイドスタンドパウチ',
          quantity: 1000,
          unit: '枚',
          unitPrice: '¥150',
          amount: '¥150,000',
        },
      ],
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);

    // Check for PDF magic number (%PDF)
    const pdfString = String.fromCharCode(...buffer.slice(0, 4));
    expect(pdfString).toBe('%PDF');
  }, 30000);

  it('should generate consistent PDF for same data', async () => {
    const data = createMockQuotationData();

    const buffer1 = await generatePdfBuffer(data);
    const buffer2 = await generatePdfBuffer(data);

    expect(buffer1.byteLength).toBe(buffer2.byteLength);
  }, 30000);
});

describe('generatePdfBase64', () => {
  it('should generate base64 string from valid data', async () => {
    const data = createMockQuotationData();

    const base64 = await generatePdfBase64(data);

    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);
  }, 30000);

  it('should generate valid base64 PDF', async () => {
    const data = createMockQuotationData();

    const base64 = await generatePdfBase64(data);

    // Base64 encoded PDF should start with specific pattern
    expect(base64).toMatch(/^JVBERi/); // %PDF in base64
  }, 30000);
});

describe('generatePdfDocument', () => {
  it('should generate PDF blob from valid data', async () => {
    const data = createMockQuotationData();

    const blob = await generatePdfDocument(data);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  }, 30000);
});

// ============================================================
// Integration Tests
// ============================================================

describe('PDF Generation Integration', () => {
  it('should handle complete workflow: validate -> generate -> check size', async () => {
    const data = createMockQuotationData();

    // 1. Validate
    const validation = validatePdfData(data);
    expect(validation.isValid).toBe(true);

    // 2. Check size estimate
    const acceptable = isPdfSizeAcceptable(data);
    expect(acceptable).toBe(true);

    // 3. Generate PDF
    const buffer = await generatePdfBuffer(data);
    expect(buffer.byteLength).toBeGreaterThan(0);

    // 4. Verify PDF structure
    const pdfString = String.fromCharCode(...buffer.slice(0, 4));
    expect(pdfString).toBe('%PDF');
  }, 30000);

  it('should handle quotation with all features', async () => {
    const data = createMockQuotationData({
      watermark: '見積書',
      clientInfo: {
        company: '株式会社フル機能テスト',
        postalCode: '123-4567',
        address: '東京都渋谷区渋谷1-2-3',
        contact: '鈴木 一郎',
      },
      specifications: {
        'パウチタイプ': 'スタンドパウチ',
        '寸法': 'W150mm × H200mm × G50mm',
        '材質': 'PET12/AL7/PE80',
        '印刷': 'グラビア8色',
        'バリア性': '高い',
      },
      orderItems: [
        {
          name: 'スタンダードタイプ',
          quantity: 1000,
          unit: '枚',
          unitPrice: '¥150',
          amount: '¥150,000',
        },
        {
          name: 'プレミアムタイプ',
          quantity: 500,
          unit: '枚',
          unitPrice: '¥200',
          amount: '¥100,000',
        },
      ],
      processing_options: {
        'ノッチ': true,
        '吊り穴': true,
        'ジッパー': true,
        'スリット': false,
        'エンボス': false,
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);

    // Verify PDF is well-formed
    const pdfHeader = String.fromCharCode(...buffer.slice(0, 4));
    expect(pdfHeader).toBe('%PDF');

    // Check for EOF marker
    const pdfFooter = String.fromCharCode(
      ...buffer.slice(-5)
    );
    expect(pdfFooter).toBe('%%EOF');
  }, 30000);

  it('should handle Japanese era dates in payment terms', async () => {
    const data = createMockQuotationData({
      paymentTerms: {
        ...createMockQuotationData().paymentTerms,
        quotationDate: '令和6年4月1日',
        quotationExpiry: '令和6年5月1日',
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);
});

describe('Edge Cases', () => {
  it('should handle quotation with single item', async () => {
    const data = createMockQuotationData({
      orderItems: [
        {
          name: '単一商品',
          quantity: 1,
          unit: '枚',
          unitPrice: '¥1,000',
          amount: '¥1,000',
        },
      ],
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle quotation with minimal specifications', async () => {
    const data = createMockQuotationData({
      specifications: {
        'タイプ': 'スタンドパウチ',
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle quotation with no processing options', async () => {
    const data = createMockQuotationData({
      processing_options: {},
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle quotation with all processing options enabled', async () => {
    const data = createMockQuotationData({
      processing_options: {
        'ノッチ': true,
        '吊り穴': true,
        'ジッパー': true,
        'スリット': true,
        'エンボス': true,
        'ダイカット': true,
        'パンチ穴': true,
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle special characters in company names', async () => {
    const data = createMockQuotationData({
      clientInfo: {
        company: '株式会社ＴＥＳＴ（テスト）',
        postalCode: '100-0001',
        address: '東京都千代田区「試験」ビル',
        contact: '山田・太郎',
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);
});

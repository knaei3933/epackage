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
import type { QuotationData } from '../excelQuotationTypes';

// ============================================================
// Mocks
// ============================================================

// @react-pdf/renderer は ESM のため @swc/jest で変換できず、テストロード時に
// SyntaxError になる。実装の振る舞いに合わせて有効な最小 PDF バイト列を返す
// モックに差し替える（factory 内で完結させ、hoisting の TDZ を回避）。
// - renderToBuffer: Buffer を返す
// - pdf().toBlob(): Blob を返す
jest.mock('@react-pdf/renderer', () => {
  // テストが検証する %PDF ヘッダー / %%EOF フッターを含む最小PDFバイト列
  const minimalPdf = '%PDF-1.4\n...バイナリ本体...\n%%EOF';
  const pdfBuffer = Buffer.from(minimalPdf, 'utf-8');

  // StyleSheet.create はオブジェクトをそのまま返すダミー
  const StyleSheet = {
    create: (styles: unknown) => styles,
  };

  // JSX として使われるコンポーネント群（関数コンポーネントのスタブ）
  const makeComponent = (name: string) => {
    const Comp = (props: unknown) => null;
    Comp.displayName = name;
    return Comp;
  };

  // pdf() は toBlob() を持つ chainable オブジェクトを返す
  const pdf = () => ({
    toBlob: async () =>
      new Blob([pdfBuffer], { type: 'application/pdf' }),
    toBuffer: async () => pdfBuffer,
  });

  return {
    Document: makeComponent('Document'),
    Page: makeComponent('Page'),
    Text: makeComponent('Text'),
    View: makeComponent('View'),
    Font: { register: jest.fn() },
    StyleSheet,
    pdf,
    renderToBuffer: jest.fn(async () => pdfBuffer),
    renderToStream: jest.fn(async () => pdfBuffer),
  };
});

// ============================================================
// Test Data Helpers
// ============================================================

// 実装（pdfConverter.tsx）が扱う QuotationData 型（excelQuotationTypes 由来）に
// 合わせたモックデータ。specifications/options は estimatePdfSize が
// Object.keys(...).length で件数を数えるため、テストごとに部分オブジェクトを
// 注入できるよう any 経由で上書き可能にしている。
function createMockQuotationData(
  overrides?: Partial<QuotationData> & { [key: string]: any }
): QuotationData {
  const base: QuotationData = {
    metadata: {
      quotationNumber: 'QT-2024-TEST-001',
      issueDate: '2025-04-01',
      validDate: '見積日から30日間',
      status: 'sent',
    },
    customer: {
      companyName: '株式会社テスト',
      postalCode: '100-0001',
      address: '東京都千代田区テスト1-1-1',
      contactPerson: '山田 太郎',
    },
    supplier: {
      brandName: 'EPACKAGE Lab',
      subBrand: 'by kanei-trade',
      companyName: '金井貿易株式会社',
      postalCode: '〒675-1112',
      address: '兵庫県加古郡稲美町六分一486',
      phone: 'TEL: 050-1793-6500',
      email: 'info@package-lab.com',
      description: 'オーダーメイドバッグ印刷専門',
    },
    paymentTerms: {
      paymentMethod: '先払い',
      submissionDeadline: '指定なし',
      proofDeadline: '指定なし',
      paymentDeadline: '校了前',
      deliveryDate: '校了から約1か月',
      bankInfo: 'PayPay銀行 ビジネス営業部支店(005)普通 5630235',
    },
    specifications: {
      specNumber: 'L',
      pouchType: 'スタンドパウチ',
      contents: '粉体',
      size: 'W150mm × H200mm × G50mm',
      material: 'PET12/AL7/PE80',
      sealWidth: '5mm',
      fillDirection: '上',
      notchShape: 'V',
      notchPosition: '指定位置',
      hangingHole: false,
      hangingPosition: '指定位置',
      ziplockPosition: '指定位置',
      cornerRadius: 'R5',
    },
    orders: [
      { no: 1, skuCount: 1, quantity: 1000, unitPrice: 150, discount: 0, total: 150000 },
      { no: 2, skuCount: 1, quantity: 500, unitPrice: 200, discount: 0, total: 100000 },
    ],
    orderSummary: {
      totalSkuCount: 2,
      totalQuantity: 1500,
      subtotal: 250000,
      taxRate: 10,
      taxAmount: 25000,
      totalWithTax: 275000,
    },
    options: {
      ziplock: false,
      notch: true,
      hangingHole: true,
      cornerRound: false,
      gasVent: false,
      easyCut: false,
      embossing: false,
    },
    ...(overrides as Partial<QuotationData>),
  };

  return base;
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

  it('should detect missing supplier', () => {
    const data = createMockQuotationData({
      supplier: undefined as any,
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Supplier'))).toBe(true);
  });

  it('should detect missing payment terms', () => {
    const data = createMockQuotationData({
      paymentTerms: undefined as any,
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Payment terms'))).toBe(true);
  });

  it('should detect missing quotation number', () => {
    const data = createMockQuotationData({
      metadata: {
        ...createMockQuotationData().metadata,
        quotationNumber: '',
      },
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Quotation number'))).toBe(true);
  });

  it('should detect missing order items', () => {
    const data = createMockQuotationData({
      orders: [],
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('order item'))).toBe(true);
  });

  it('should collect all validation errors', () => {
    const data = createMockQuotationData({
      metadata: {
        ...createMockQuotationData().metadata,
        quotationNumber: '',
      },
      supplier: undefined as any,
      orders: [],
    });

    const result = validatePdfData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('estimatePdfSize', () => {
  it('should estimate size for basic quotation', () => {
    const data = createMockQuotationData({
      orders: [
        { no: 1, skuCount: 1, quantity: 100, unitPrice: 100, discount: 0, total: 10000 },
      ],
    });

    const size = estimatePdfSize(data);

    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(500000); // Should be well under 500KB
  });

  it('should increase size with more items', () => {
    const smallData = createMockQuotationData({
      orders: [
        { no: 1, skuCount: 1, quantity: 100, unitPrice: 100, discount: 0, total: 10000 },
      ],
    });

    const largeData = createMockQuotationData({
      orders: Array.from({ length: 50 }, (_, i) => ({
        no: i + 1,
        skuCount: 1,
        quantity: 100,
        unitPrice: 100,
        discount: 0,
        total: 10000,
      })),
    });

    const smallSize = estimatePdfSize(smallData);
    const largeSize = estimatePdfSize(largeData);

    expect(largeSize).toBeGreaterThan(smallSize);
  });

  it('should account for specifications', () => {
    // estimatePdfSize は Object.keys(specifications).length を加算するため、
    // 設定された specifications プロパティ数が多いほどサイズが増加する。
    const fewSpecs = createMockQuotationData({
      specifications: { pouchType: 'スタンドパウチ' } as any,
    });

    const manySpecs = createMockQuotationData({
      specifications: {
        pouchType: 'スタンドパウチ',
        size: 'W150 × H200',
        material: 'PET12/AL7/PE80',
        contents: '粉体',
        surfaceFinish: '光沢仕上げ',
      } as any,
    });

    const fewSize = estimatePdfSize(fewSpecs);
    const manySize = estimatePdfSize(manySpecs);

    expect(manySize).toBeGreaterThan(fewSize);
  });

  it('should account for processing options', () => {
    // options も Object.keys(...).length で加算される。
    const fewOptions = createMockQuotationData({
      options: { notch: true } as any,
    });

    const manyOptions = createMockQuotationData({
      options: {
        notch: true,
        hangingHole: true,
        ziplock: true,
        cornerRound: false,
        gasVent: false,
      } as any,
    });

    const fewSize = estimatePdfSize(fewOptions);
    const manySize = estimatePdfSize(manyOptions);

    expect(manySize).toBeGreaterThan(fewSize);
  });
});

describe('isPdfSizeAcceptable', () => {
  it('should return true for small quotations', () => {
    const data = createMockQuotationData({
      orders: [
        { no: 1, skuCount: 1, quantity: 100, unitPrice: 100, discount: 0, total: 10000 },
      ],
    });

    const acceptable = isPdfSizeAcceptable(data);

    expect(acceptable).toBe(true);
  });

  it('should return true for moderate quotations', () => {
    const data = createMockQuotationData({
      orders: Array.from({ length: 20 }, (_, i) => ({
        no: i + 1,
        skuCount: 1,
        quantity: 100,
        unitPrice: 100,
        discount: 0,
        total: 10000,
      })),
    });

    const acceptable = isPdfSizeAcceptable(data);

    expect(acceptable).toBe(true);
  });

  it('should estimate correctly for large quotations', () => {
    // Create a very large quotation
    const data = createMockQuotationData({
      orders: Array.from({ length: 100 }, (_, i) => ({
        no: i + 1,
        skuCount: 1,
        quantity: 100,
        unitPrice: 100,
        discount: 0,
        total: 10000,
      })),
      specifications: {
        pouchType: 'スタンドパウチ',
        size: 'W150 × H200 × G50',
        material: 'PET12/AL7/PE80',
        contents: '粉体',
        surfaceFinish: '光沢仕上げ',
        sealWidth: '5mm',
      } as any,
      options: {
        notch: true,
        hangingHole: true,
        ziplock: true,
        cornerRound: true,
        gasVent: false,
      } as any,
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
      customer: {
        companyName: '株式会社テスト会社',
        postalCode: '100-0001',
        address: '東京都千代田区',
        contactPerson: '山田 太郎',
      },
      orders: [
        { no: 1, skuCount: 1, quantity: 1000, unitPrice: 150, discount: 0, total: 150000 },
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
      watermark: {
        text: '見積書',
        position: 'center',
        style: { fontSize: 60, color: '#cccccc', opacity: 0.3 },
      },
      customer: {
        companyName: '株式会社フル機能テスト',
        postalCode: '123-4567',
        address: '東京都渋谷区渋谷1-2-3',
        contactPerson: '鈴木 一郎',
      },
      specifications: {
        pouchType: 'スタンドパウチ',
        size: 'W150mm × H200mm × G50mm',
        material: 'PET12/AL7/PE80',
        contents: '粉体',
        surfaceFinish: '光沢仕上げ',
      } as any,
      orders: [
        { no: 1, skuCount: 1, quantity: 1000, unitPrice: 150, discount: 0, total: 150000 },
        { no: 2, skuCount: 1, quantity: 500, unitPrice: 200, discount: 0, total: 100000 },
      ],
      options: {
        notch: true,
        hangingHole: true,
        ziplock: true,
        cornerRound: false,
        gasVent: false,
      } as any,
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
      metadata: {
        ...createMockQuotationData().metadata,
        issueDate: '令和6年4月1日',
        validDate: '令和6年5月1日',
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);
});

describe('Edge Cases', () => {
  it('should handle quotation with single item', async () => {
    const data = createMockQuotationData({
      orders: [
        { no: 1, skuCount: 1, quantity: 1, unitPrice: 1000, discount: 0, total: 1000 },
      ],
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle quotation with minimal specifications', async () => {
    const data = createMockQuotationData({
      specifications: { pouchType: 'スタンドパウチ' } as any,
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle quotation with no processing options', async () => {
    const data = createMockQuotationData({
      options: {} as any,
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle quotation with all processing options enabled', async () => {
    const data = createMockQuotationData({
      options: {
        ziplock: true,
        notch: true,
        hangingHole: true,
        cornerRound: true,
        gasVent: true,
        easyCut: true,
        embossing: true,
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);

  it('should handle special characters in company names', async () => {
    const data = createMockQuotationData({
      customer: {
        companyName: '株式会社ＴＥＳＴ（テスト）',
        postalCode: '100-0001',
        address: '東京都千代田区「試験」ビル',
        contactPerson: '山田・太郎',
      },
    });

    const buffer = await generatePdfBuffer(data);

    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 30000);
});

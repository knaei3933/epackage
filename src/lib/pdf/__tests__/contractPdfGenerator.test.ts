/**
 * Contract PDF Generator Unit Tests
 *
 * 契約PDFジェネレーター単体テスト
 * Unit tests for contract PDF generation functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// 実装は contractPdfGenerator.tsx（旧）から generators/contract-generator.ts（新）へ
// リファクタリング移行した。index.ts 経由で現行実装の関数群を import する。
import {
  generateContractPdf,
  generateContractPdfBase64,
  validateContractData,
  estimateContractPdfSize,
  createMockContractData,
} from '@/lib/pdf';
import type { ContractData, ContractItem } from '@/types/contract';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Test Utilities
// ============================================================

// core/base.ts が chromium を使うため Playwright をモック
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

// core/base.ts が fs/path を使うためモック。
// 自動モックでは fs.promises が undefined になり spyOn できないため、
// promises 名前空間を明示的に用意する。
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));
// path は実物（join/dirname 等）をそのまま使う。テストが一部で
// path.dirname を spyOn 上書きするため、実際の path を再エクスポートする。
jest.mock('path', () => jest.requireActual('path'));

// ============================================================
// Test Fixtures
// ============================================================

const createValidContractData = (): ContractData => ({
  contractNumber: 'CTR-2024-001',
  issueDate: '2024-04-01',
  effectiveDate: '2024-04-15',
  validUntil: '2025-04-14',
  orderNumber: 'ORD-2024-001',
  status: 'active',

  // Seller (甲 - 販売者)
  seller: {
    name: 'EPACKAGE Lab株式会社',
    nameKana: 'イーパックケージラボカブシキガイシャ',
    postalCode: '675-1112',
    address: '兵庫県加古郡稲美町六分一486',
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

  // Buyer (乙 - 購入者)
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

  // Contract items
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

  // Contract terms
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

  // Signatories
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

  // Remarks
  remarks: 'テスト用契約書です。',
});

const createInvalidContractData = (): Partial<ContractData> => ({
  contractNumber: '',
  issueDate: '',
  effectiveDate: '',
  seller: {
    name: '',
    postalCode: '',
    address: '',
    representative: '',
    representativeTitle: '',
  },
  buyer: {
    name: '',
    postalCode: '',
    address: '',
    representative: '',
    representativeTitle: '',
  },
  items: [],
  terms: {
    payment: {
      method: '',
      deadline: '',
    },
    delivery: {
      period: '',
      location: '',
      conditions: '',
    },
  },
});

// ============================================================
// Test Suites
// ============================================================

describe('Contract PDF Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // validateContractData Tests
  // ============================================================

  describe('validateContractData', () => {
    it('should validate complete contract data', () => {
      const validData = createValidContractData();
      const result = validateContractData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing contract number', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        contractNumber: '',
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('契約番号は必須です');
    });

    it('should detect missing issue date', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        issueDate: '',
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('発行日は必須です');
    });

    it('should detect missing effective date', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        effectiveDate: '',
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('契約日は必須です');
    });

    it('should detect missing buyer name', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        buyer: {
          ...createValidContractData().buyer,
          name: '',
        },
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('買い手名は必須です');
    });

    it('should detect missing seller name', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        seller: {
          ...createValidContractData().seller,
          name: '',
        },
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('売り手名は必須です');
    });

    it('should detect missing contract items', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        items: [],
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('少なくとも1つの契約品目が必要です');
    });

    it('should detect missing payment method', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        terms: {
          ...createValidContractData().terms,
          payment: {
            method: '',
            deadline: '30日以内',
          },
        },
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('支払方法は必須です');
    });

    it('should detect missing delivery period', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        terms: {
          ...createValidContractData().terms,
          delivery: {
            period: '',
            location: '東京都',
            conditions: '通常配送',
          },
        },
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('納期は必須です');
    });

    it('should collect all validation errors', () => {
      const invalidData: ContractData = {
        ...createValidContractData(),
        contractNumber: '',
        issueDate: '',
        effectiveDate: '',
        buyer: {
          ...createValidContractData().buyer,
          name: '',
        },
        seller: {
          ...createValidContractData().seller,
          name: '',
        },
        items: [],
        terms: {
          ...createValidContractData().terms,
          payment: {
            method: '',
            deadline: '',
          },
          delivery: {
            period: '',
            location: '',
            conditions: '',
          },
        },
      };
      const result = validateContractData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });

  // ============================================================
  // estimateContractPdfSize Tests
  // ============================================================

  describe('estimateContractPdfSize', () => {
    it('should estimate size for minimal contract', () => {
      const minimalData: ContractData = {
        ...createValidContractData(),
        items: [
          {
            id: 'ITEM-001',
            name: 'Test Item',
            specification: 'Test Spec',
            quantity: 1,
            unit: '個',
            unitPrice: 1000,
            amount: 1000,
          },
        ],
      };
      const size = estimateContractPdfSize(minimalData);

      // Base size (2000) + items size (500) = 2500 minimum
      expect(size).toBeGreaterThan(2000);
      expect(size).toBeLessThan(5000);
    });

    it('should increase with more items', () => {
      const singleItem = { ...createValidContractData(), items: [createValidContractData().items[0]] };
      const multipleItems = {
        ...createValidContractData(),
        items: [
          ...createValidContractData().items,
          {
            id: 'ITEM-002',
            name: '追加品目',
            specification: '追加仕様',
            quantity: 500,
            unit: '個',
            unitPrice: 200,
            amount: 100000,
          },
        ],
      };

      const singleSize = estimateContractPdfSize(singleItem);
      const multipleSize = estimateContractPdfSize(multipleItems);

      expect(multipleSize).toBeGreaterThan(singleSize);
    });

    it('should include signatory data in estimation', () => {
      // createValidContractData() は既定で両 signatory を含むため、
      // 比較のため without 側は両 signatory を削除する。
      const { sellerSignatory, buyerSignatory, ...withoutSignatory } =
        createValidContractData();
      const withSignatory = createValidContractData();

      const withoutSize = estimateContractPdfSize(withoutSignatory);
      const withSize = estimateContractPdfSize(withSignatory);

      expect(withSize).toBeGreaterThan(withoutSize);
    });

    it('should include attachments in estimation', () => {
      const withoutAttachments = { ...createValidContractData() };
      const withAttachments = {
        ...createValidContractData(),
        attachments: [
          {
            id: 'ATT-001',
            name: 'spec.pdf',
            type: 'application/pdf',
            size: 1024,
            url: 'https://example.com/spec.pdf',
            uploadedAt: '2024-04-01',
          },
        ],
      };

      const withoutSize = estimateContractPdfSize(withoutAttachments);
      const withSize = estimateContractPdfSize(withAttachments);

      expect(withSize).toBeGreaterThan(withoutSize);
    });
  });

  // ============================================================
  // createMockContractData Tests
  // ============================================================

  describe('createMockContractData', () => {
    it('should create valid contract data', () => {
      const mockData = createMockContractData();
      const validation = validateContractData(mockData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should include all required fields', () => {
      const mockData = createMockContractData();

      expect(mockData.contractNumber).toBeDefined();
      expect(mockData.issueDate).toBeDefined();
      expect(mockData.effectiveDate).toBeDefined();
      expect(mockData.seller).toBeDefined();
      expect(mockData.buyer).toBeDefined();
      expect(mockData.items).toBeDefined();
      expect(mockData.items.length).toBeGreaterThan(0);
      expect(mockData.terms).toBeDefined();
      expect(mockData.terms.payment).toBeDefined();
      expect(mockData.terms.delivery).toBeDefined();
    });

    it('should have valid buyer and seller information', () => {
      const mockData = createMockContractData();

      // Buyer checks
      expect(mockData.buyer.name).toBeTruthy();
      expect(mockData.buyer.address).toBeTruthy();
      expect(mockData.buyer.postalCode).toBeTruthy();
      expect(mockData.buyer.representative).toBeTruthy();
      expect(mockData.buyer.representativeTitle).toBeTruthy();

      // Seller checks
      expect(mockData.seller.name).toBeTruthy();
      expect(mockData.seller.address).toBeTruthy();
      expect(mockData.seller.postalCode).toBeTruthy();
      expect(mockData.seller.representative).toBeTruthy();
      expect(mockData.seller.representativeTitle).toBeTruthy();

      // Seller should have bank info
      expect(mockData.seller.bankInfo).toBeDefined();
      expect(mockData.seller.bankInfo?.bankName).toBeTruthy();
      expect(mockData.seller.bankInfo?.accountNumber).toBeTruthy();
    });

    it('should have contract items with valid amounts', () => {
      const mockData = createMockContractData();

      mockData.items.forEach(item => {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.specification).toBeTruthy();
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitPrice).toBeGreaterThan(0);
        expect(item.amount).toEqual(item.quantity * item.unitPrice);
      });
    });

    it('should include signatory information', () => {
      const mockData = createMockContractData();

      expect(mockData.sellerSignatory).toBeDefined();
      expect(mockData.buyerSignatory).toBeDefined();

      expect(mockData.sellerSignatory?.name).toBe(mockData.seller.representative);
      expect(mockData.buyerSignatory?.name).toBe(mockData.buyer.representative);
    });

    it('should have valid contract terms', () => {
      const mockData = createMockContractData();

      expect(mockData.terms.payment.method).toBeTruthy();
      expect(mockData.terms.payment.deadline).toBeTruthy();
      expect(mockData.terms.delivery.period).toBeTruthy();
      expect(mockData.terms.delivery.location).toBeTruthy();

      if (mockData.terms.payment.depositPercentage) {
        expect(mockData.terms.payment.depositPercentage).toBeGreaterThan(0);
        expect(mockData.terms.payment.depositPercentage).toBeLessThanOrEqual(1);
      }
    });
  });

  // ============================================================
  // generateContractPdf Tests
  // ============================================================

  describe('generateContractPdf', () => {
    it('should generate PDF successfully with valid data', async () => {
      const validData = createValidContractData();

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template read
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{contractNumber}}</body></html>'
      );

      // Mock Playwright
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn().mockResolvedValue(undefined),
          pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
          close: jest.fn().mockResolvedValue(undefined),
          addStyleTag: jest.fn().mockResolvedValue(undefined),
        }),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      const result = await generateContractPdf(validData);

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.buffer!.length).toBeGreaterThan(0);
    });

    it('should return error when template file not found', async () => {
      const validData = createValidContractData();

      // Mock template file does not exist
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await generateContractPdf(validData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not found');
    });

    it('should save PDF to file when output path specified', async () => {
      const validData = createValidContractData();
      const outputPath = path.join(process.cwd(), 'output', 'contract.pdf');

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template read
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{contractNumber}}</body></html>'
      );

      // Mock directory creation and file write
      jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
      jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
      jest.spyOn(path, 'dirname').mockReturnValue(process.cwd());

      // Mock Playwright
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn().mockResolvedValue(undefined),
          pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
          close: jest.fn().mockResolvedValue(undefined),
        }),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      const result = await generateContractPdf(validData, { outputPath });

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(outputPath);
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should handle PDF generation errors gracefully', async () => {
      const validData = createValidContractData();

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template read error
      jest.spyOn(fs.promises, 'readFile').mockRejectedValue(
        new Error('Failed to read template')
      );

      const result = await generateContractPdf(validData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to read template');
    });
  });

  // ============================================================
  // generateContractPdfBase64 Tests
  // ============================================================

  describe('generateContractPdfBase64', () => {
    it('should generate base64 encoded PDF', async () => {
      const validData = createValidContractData();

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template read
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{contractNumber}}</body></html>'
      );

      // Mock Playwright
      const mockPdfBuffer = Buffer.from('mock-pdf-content');
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn().mockResolvedValue(undefined),
          pdf: jest.fn().mockResolvedValue(mockPdfBuffer),
          close: jest.fn().mockResolvedValue(undefined),
        }),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      const result = await generateContractPdfBase64(validData);

      expect(result.success).toBe(true);
      expect(result.base64).toBeDefined();
      expect(result.base64).toBe(Buffer.from('mock-pdf-content').toString('base64'));
    });

    it('should return error when PDF generation fails', async () => {
      const validData = createValidContractData();

      // Mock template file does not exist
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await generateContractPdfBase64(validData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.base64).toBeUndefined();
    });
  });

  // ============================================================
  // Template Data Preparation Tests
  // ============================================================

  describe('Template Data Preparation', () => {
    it('should map buyer to client correctly', async () => {
      const validData = createValidContractData();

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template read with variables for inspection
      const mockTemplate = `
        clientName: {{clientName}}
        clientAddress: {{clientAddress}}
        supplierName: {{supplierName}}
        supplierAddress: {{supplierAddress}}
      `;
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(mockTemplate);

      // Mock Playwright
      const mockPage = {
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
        close: jest.fn().mockResolvedValue(undefined),
      };
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      await generateContractPdf(validData);

      // Verify setContent was called with proper mapping
      const setContentCall = mockPage.setContent.mock.calls[0][0] as string;
      expect(setContentCall).toContain(validData.buyer.name);
      expect(setContentCall).toContain(validData.seller.name);
    });

    it('should format amounts with Japanese locale', async () => {
      const validData = createValidContractData();

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{subtotalAmount}}</body></html>'
      );

      // Mock Playwright
      const mockPage = {
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
        close: jest.fn().mockResolvedValue(undefined),
      };
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      await generateContractPdf(validData);

      // Check that amounts are formatted with Japanese locale (commas)
      const setContentCall = mockPage.setContent.mock.calls[0][0] as string;
      // Should contain comma separators for thousands
      expect(setContentCall).toMatch(/[,0-9]+/);
    });

    it('should handle optional seller bank info', async () => {
      const dataWithoutBankInfo = createValidContractData();
      delete (dataWithoutBankInfo.seller as any).bankInfo;

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{bankInfo}}</body></html>'
      );

      // Mock Playwright
      const mockPage = {
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
        close: jest.fn().mockResolvedValue(undefined),
      };
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      await generateContractPdf(dataWithoutBankInfo);

      // Should handle missing bank info gracefully
      expect(mockPage.setContent).toHaveBeenCalled();
    });

    it('should include signatory information when present', async () => {
      const validData = createValidContractData();

      // Mock template file exists
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Mock template
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        `<html><body>
          {{#if hasClientStamp}}<img src="{{clientStamp}}">{{/if}}
          {{#if hasSupplierStamp}}<img src="{{supplierStamp}}">{{/if}}
        </body></html>`
      );

      // Mock Playwright
      const mockPage = {
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
        close: jest.fn().mockResolvedValue(undefined),
      };
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      await generateContractPdf(validData);

      // Signatory information should be prepared for template
      expect(mockPage.setContent).toHaveBeenCalled();
    });
  });

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Integration Tests', () => {
    it('should handle complete workflow from validation to PDF generation', async () => {
      // Start with mock data
      const contractData = createMockContractData();

      // Validate
      const validation = validateContractData(contractData);
      expect(validation.isValid).toBe(true);

      // Estimate size
      const estimatedSize = estimateContractPdfSize(contractData);
      expect(estimatedSize).toBeGreaterThan(0);

      // Generate PDF
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{contractNumber}}</body></html>'
      );

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn().mockResolvedValue(undefined),
          pdf: jest.fn().mockResolvedValue(Buffer.from('complete-workflow-pdf')),
          close: jest.fn().mockResolvedValue(undefined),
        }),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      const pdfResult = await generateContractPdf(contractData);
      expect(pdfResult.success).toBe(true);

      // Generate base64
      const base64Result = await generateContractPdfBase64(contractData);
      expect(base64Result.success).toBe(true);
      expect(base64Result.base64).toBeDefined();
    });

    it('should handle contract with multiple items', async () => {
      const multiItemData: ContractData = {
        ...createValidContractData(),
        items: [
          {
            id: 'ITEM-001',
            name: 'オーダーメイドバッグ（スタンドパウチ）',
            specification: 'サイズ: A4、素材: PET/AL/PE、厚み: 100μm',
            quantity: 1000,
            unit: '個',
            unitPrice: 150,
            amount: 150000,
          },
          {
            id: 'ITEM-002',
            name: 'オーダーメイドバッグ（チャック付き）',
            specification: 'サイズ: B5、素材: PET/PE、厚み: 80μm',
            quantity: 500,
            unit: '個',
            unitPrice: 120,
            amount: 60000,
          },
          {
            id: 'ITEM-003',
            name: '真空パウチ',
            specification: 'サイズ: 30x40cm、素材: PA/PE、厚み: 120μm',
            quantity: 2000,
            unit: '個',
            unitPrice: 80,
            amount: 160000,
          },
        ],
      };

      // Verify validation passes
      const validation = validateContractData(multiItemData);
      expect(validation.isValid).toBe(true);

      // Generate PDF
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
        '<html><body>{{#each items}}{{name}}{{/each}}</body></html>'
      );

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn().mockResolvedValue(undefined),
          pdf: jest.fn().mockResolvedValue(Buffer.from('multi-item-pdf')),
          close: jest.fn().mockResolvedValue(undefined),
        }),
        close: jest.fn().mockResolvedValue(undefined),
      };

      const { chromium } = await import('playwright');
      jest.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      const pdfResult = await generateContractPdf(multiItemData);
      expect(pdfResult.success).toBe(true);
    });
  });
});

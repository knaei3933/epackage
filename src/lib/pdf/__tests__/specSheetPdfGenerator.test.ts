/**
 * Specification Sheet PDF Generator Unit Tests
 *
 * 仕様書PDFジェネレーターユニットテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals'
import {
  generateSpecSheetPdf,
  generateSpecSheetPdfBase64,
  validateSpecSheetData,
  estimateSpecSheetPdfSize,
  createMockSpecSheetData,
} from '../specSheetPdfGenerator'
import type { SpecSheetData } from '@/types/specsheet'

// ============================================================
// Mocks
// ============================================================

jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(() => ({
      newPage: jest.fn(() => ({
        setContent: jest.fn(() => Promise.resolve()),
        pdf: jest.fn(() => Promise.resolve(Buffer.from('mock-pdf-content'))),
        close: jest.fn(() => Promise.resolve()),
      })),
      close: jest.fn(() => Promise.resolve()),
    })),
  },
}))

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  promises: {
    mkdir: jest.fn(() => Promise.resolve()),
    writeFile: jest.fn(() => Promise.resolve()),
    readFile: jest.fn(() => Promise.reject(new Error('File not found'))),
  },
}))

jest.mock('handlebars', () => ({
  compile: jest.fn((template: string) => (data: unknown) => {
    // Simple mock that returns the template with data replaced
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
      const obj = data as Record<string, unknown>
      return String(obj[key] || '')
    })
  }),
}))

// ============================================================
// Test Setup
// ============================================================

describe('SpecSheetPdfGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ============================================================
  // generateSpecSheetPdf Tests
  // ============================================================

  describe('generateSpecSheetPdf', () => {
    it('should generate PDF from valid spec sheet data', async () => {
      const mockData = createMockSpecSheetData()
      const result = await generateSpecSheetPdf(mockData)

      expect(result.success).toBe(true)
      expect(result.buffer).toBeDefined()
      expect(result.metadata).toBeDefined()
      expect(result.metadata?.specNumber).toBe(mockData.specNumber)
      expect(result.metadata?.revision).toBe(mockData.revision)
    })

    it('should generate PDF with custom options', async () => {
      const mockData = createMockSpecSheetData()
      const result = await generateSpecSheetPdf(mockData, {
        format: 'A3',
        orientation: 'landscape',
        template: 'detailed',
        includePricing: true,
        includeApproval: true,
      })

      expect(result.success).toBe(true)
    })

    it('should save PDF to file when output path is specified', async () => {
      const mockFs = await import('fs')
      jest.spyOn(mockFs, 'existsSync').mockReturnValue(true)
      jest.spyOn(mockFs.promises, 'writeFile').mockResolvedValue()

      const mockData = createMockSpecSheetData()
      const result = await generateSpecSheetPdf(mockData, {
        outputPath: '/tmp/test-specsheet.pdf',
      })

      expect(result.success).toBe(true)
      expect(result.filePath).toBe('/tmp/test-specsheet.pdf')
    })

    it('should handle errors gracefully', async () => {
      const playwright = await import('playwright')
      jest.spyOn(playwright.chromium, 'launch').mockRejectedValue(new Error('Browser launch failed'))

      const mockData = createMockSpecSheetData()
      const result = await generateSpecSheetPdf(mockData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  // ============================================================
  // generateSpecSheetPdfBase64 Tests
  // ============================================================

  describe('generateSpecSheetPdfBase64', () => {
    it('should generate base64 encoded PDF', async () => {
      const mockData = createMockSpecSheetData()
      const result = await generateSpecSheetPdfBase64(mockData)

      expect(result.success).toBe(true)
      expect(result.base64).toBeDefined()
      expect(typeof result.base64).toBe('string')
    })

    it('should return error on failure', async () => {
      const playwright = await import('playwright')
      jest.spyOn(playwright.chromium, 'launch').mockRejectedValue(new Error('Generation failed'))

      const mockData = createMockSpecSheetData()
      const result = await generateSpecSheetPdfBase64(mockData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  // ============================================================
  // validateSpecSheetData Tests
  // ============================================================

  describe('validateSpecSheetData', () => {
    it('should validate complete spec sheet data', () => {
      const mockData = createMockSpecSheetData()
      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for missing required fields', () => {
      const incompleteData: Partial<SpecSheetData> = {
        specNumber: '',
        revision: '',
        issueDate: '',
        status: 'draft',
        category: 'bag',
        title: 'Test',
        customer: {
          name: '',
          contactPerson: '',
        },
        product: {
          id: '',
          name: '',
          productCode: '',
          category: 'bag',
          dimensions: {},
          materials: [],
          specifications: {},
        },
        production: {
          method: '',
          process: [],
          qualityControl: {
            inspectionStandards: [],
          },
          packaging: {
            unit: '',
            quantity: 0,
            packingSpec: '',
          },
          delivery: {
            leadTime: '',
            minLotSize: 0,
            lotUnit: '',
          },
        },
      }

      const result = validateSpecSheetData(incompleteData as SpecSheetData)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors).toContain('仕様書番号は必須です')
      expect(result.errors).toContain('版数は必須です')
      expect(result.errors).toContain('発行日は必須です')
    })

    it('should validate customer information', () => {
      const mockData = createMockSpecSheetData()
      mockData.customer.name = ''

      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('顧客名は必須です')
    })

    it('should validate product information', () => {
      const mockData = createMockSpecSheetData()
      mockData.product.name = ''

      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('製品名は必須です')
    })

    it('should validate dimensions', () => {
      const mockData = createMockSpecSheetData()
      delete mockData.product.dimensions

      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('製品寸法は必須です')
    })

    it('should validate materials', () => {
      const mockData = createMockSpecSheetData()
      mockData.product.materials = []

      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('材質構成は必須です')
    })

    it('should validate production information', () => {
      const mockData = createMockSpecSheetData()
      mockData.production.method = ''

      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('生産方法は必須です')
    })
  })

  // ============================================================
  // estimateSpecSheetPdfSize Tests
  // ============================================================

  describe('estimateSpecSheetPdfSize', () => {
    it('should estimate PDF size for basic spec sheet', () => {
      const mockData = createMockSpecSheetData()
      const size = estimateSpecSheetPdfSize(mockData)

      expect(size).toBeGreaterThan(0)
      expect(typeof size).toBe('number')
    })

    it('should account for material layers in size estimation', () => {
      const mockData = createMockSpecSheetData()
      const baseSize = estimateSpecSheetPdfSize(mockData)

      mockData.product.materials.push(
        { layer: 4, material: 'NY', thickness: 15, function: '補強層' },
        { layer: 5, material: 'CPP', thickness: 30, function: '熱密封層' }
      )

      const largerSize = estimateSpecSheetPdfSize(mockData)

      expect(largerSize).toBeGreaterThan(baseSize)
    })

    it('should account for design information in size estimation', () => {
      const mockData = createMockSpecSheetData()
      delete mockData.design

      const baseSize = estimateSpecSheetPdfSize(mockData)

      mockData.design = {
        printing: {
          method: 'gravure',
          colors: 8,
          sides: 'front',
        },
      }

      const withDesignSize = estimateSpecSheetPdfSize(mockData)

      expect(withDesignSize).toBeGreaterThan(baseSize)
    })

    it('should account for pricing information in size estimation', () => {
      const mockData = createMockSpecSheetData()
      delete mockData.pricing

      const baseSize = estimateSpecSheetPdfSize(mockData)

      mockData.pricing = {
        basePrice: {
          unitPrice: 150,
          moq: 5000,
          currency: 'JPY',
        },
        validityPeriod: '90日間',
      }

      const withPricingSize = estimateSpecSheetPdfSize(mockData)

      expect(withPricingSize).toBeGreaterThan(baseSize)
    })

    it('should account for approvals in size estimation', () => {
      const mockData = createMockSpecSheetData()
      delete mockData.approvals

      const baseSize = estimateSpecSheetPdfSize(mockData)

      mockData.approvals = [
        {
          name: '承認者1',
          title: 'マネージャー',
          status: 'approved',
          date: '2024-04-01',
        },
        {
          name: '承認者2',
          title: 'ディレクター',
          status: 'approved',
          date: '2024-04-02',
        },
      ]

      const withApprovalsSize = estimateSpecSheetPdfSize(mockData)

      expect(withApprovalsSize).toBeGreaterThan(baseSize)
    })
  })

  // ============================================================
  // createMockSpecSheetData Tests
  // ============================================================

  describe('createMockSpecSheetData', () => {
    it('should create valid mock data', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData).toBeDefined()
      expect(mockData.specNumber).toBe('B2B-SPEC-2024-001')
      expect(mockData.revision).toBe('1.0')
      expect(mockData.status).toBe('active')
      expect(mockData.category).toBe('bag')
    })

    it('should include all required fields', () => {
      const mockData = createMockSpecSheetData()
      const result = validateSpecSheetData(mockData)

      expect(result.isValid).toBe(true)
    })

    it('should have customer information', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.customer.name).toBe('テスト食品株式会社')
      expect(mockData.customer.department).toBe('資材調達部')
      expect(mockData.customer.contactPerson).toBe('山田 太郎')
      expect(mockData.customer.contact?.phone).toBe('03-1234-5678')
      expect(mockData.customer.contact?.email).toBe('yamada@test-food.co.jp')
    })

    it('should have product information with dimensions', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.product.name).toBe('オーダーメイドスタンドパウチ袋')
      expect(mockData.product.productCode).toBe('SP-A4-100')
      expect(mockData.product.dimensions.length).toBe(200)
      expect(mockData.product.dimensions.width).toBe(140)
      expect(mockData.product.dimensions.thickness).toBe(100)
    })

    it('should have material composition', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.product.materials).toHaveLength(3)
      expect(mockData.product.materials[0].material).toContain('PET')
      expect(mockData.product.materials[1].material).toContain('AL')
      expect(mockData.product.materials[2].material).toContain('PE')
    })

    it('should have specifications', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.product.specifications.application).toBe('乾燥食品・スナック菓子包装')
      expect(mockData.product.specifications.heatResistance).toBe('最高120℃')
      expect(mockData.product.specifications.waterResistance).toBe(true)
      expect(mockData.product.specifications.airTightness).toBe(true)
    })

    it('should have performance standards', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.product.performance).toBeDefined()
      expect(mockData.product.performance?.tensileStrength).toBe('40MPa以上')
      expect(mockData.product.performance?.wvtr).toBe('1g/㎡・day以下')
    })

    it('should have compliance information', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.product.compliance).toBeDefined()
      expect(mockData.product.compliance?.foodSanitationAct).toBe(true)
      expect(mockData.product.compliance?.jisStandards).toContain('Z1707')
    })

    it('should have production information', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.production.method).toContain('インフレーション成形')
      expect(mockData.production.process).toContain('フィルム押出し')
      expect(mockData.production.delivery.leadTime).toContain('30日')
      expect(mockData.production.delivery.minLotSize).toBe(5000)
    })

    it('should have design information', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.design).toBeDefined()
      expect(mockData.design?.printing?.method).toBe('gravure')
      expect(mockData.design?.printing?.colors).toBe(8)
      expect(mockData.design?.colorGuide?.spotColors).toBeDefined()
    })

    it('should have pricing information', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.pricing).toBeDefined()
      expect(mockData.pricing?.basePrice.unitPrice).toBe(150)
      expect(mockData.pricing?.basePrice.moq).toBe(5000)
      expect(mockData.pricing?.volumeDiscount).toHaveLength(2)
    })

    it('should have approval information', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.approvals).toBeDefined()
      expect(mockData.approvals).toHaveLength(2)
      expect(mockData.approvals?.[0].name).toBe('鈴木 一郎')
      expect(mockData.approvals?.[1].status).toBe('approved')
    })

    it('should have remarks', () => {
      const mockData = createMockSpecSheetData()

      expect(mockData.remarks).toBeDefined()
      expect(mockData.remarks?.length).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Integration', () => {
    it('should validate and generate PDF for valid data', async () => {
      const mockData = createMockSpecSheetData()

      // Validate first
      const validation = validateSpecSheetData(mockData)
      expect(validation.isValid).toBe(true)

      // Generate PDF
      const pdfResult = await generateSpecSheetPdf(mockData)
      expect(pdfResult.success).toBe(true)

      // Estimate size
      const estimatedSize = estimateSpecSheetPdfSize(mockData)
      expect(estimatedSize).toBeGreaterThan(0)

      // Generate base64
      const base64Result = await generateSpecSheetPdfBase64(mockData)
      expect(base64Result.success).toBe(true)
      expect(base64Result.base64).toBeDefined()
    })

    it('should fail validation and not generate PDF for invalid data', async () => {
      const invalidData: Partial<SpecSheetData> = {
        specNumber: '',
        revision: '',
        issueDate: '',
        status: 'draft',
        category: 'bag',
        title: 'Invalid',
        customer: {
          name: '',
          contactPerson: '',
        },
        product: {
          id: '',
          name: '',
          productCode: '',
          category: 'bag',
          dimensions: {},
          materials: [],
          specifications: {},
        },
        production: {
          method: '',
          process: [],
          qualityControl: {
            inspectionStandards: [],
          },
          packaging: {
            unit: '',
            quantity: 0,
            packingSpec: '',
          },
          delivery: {
            leadTime: '',
            minLotSize: 0,
            lotUnit: '',
          },
        },
      }

      const validation = validateSpecSheetData(invalidData as SpecSheetData)
      expect(validation.isValid).toBe(false)

      // PDF generation might succeed but the validation should fail
      expect(validation.errors.length).toBeGreaterThan(5)
    })
  })

  // ============================================================
  // Edge Cases
  // ============================================================

  describe('Edge Cases', () => {
    it('should handle empty optional fields', () => {
      const mockData = createMockSpecSheetData()
      delete mockData.design
      delete mockData.pricing
      delete mockData.approvals
      delete mockData.remarks

      const validation = validateSpecSheetData(mockData)
      expect(validation.isValid).toBe(true)
    })

    it('should handle minimal valid data', () => {
      const minimalData: SpecSheetData = {
        specNumber: 'TEST-001',
        revision: '1.0',
        issueDate: '2024-04-01',
        status: 'active',
        category: 'bag',
        title: 'Minimal Test',
        customer: {
          name: 'Test Customer',
          contactPerson: 'Test Person',
        },
        product: {
          id: 'PROD-001',
          name: 'Test Product',
          productCode: 'TP-001',
          category: 'bag',
          dimensions: {
            length: 100,
            width: 50,
          },
          materials: [
            {
              layer: 1,
              material: 'PE',
            },
          ],
          specifications: {},
        },
        production: {
          method: 'Test Method',
          process: ['Step 1'],
          qualityControl: {
            inspectionStandards: ['Standard 1'],
          },
          packaging: {
            unit: 'pcs',
            quantity: 100,
            packingSpec: 'Standard',
          },
          delivery: {
            leadTime: '30 days',
            minLotSize: 100,
            lotUnit: 'pcs',
          },
        },
      }

      const validation = validateSpecSheetData(minimalData)
      expect(validation.isValid).toBe(true)
    })

    it('should handle special characters in names and descriptions', () => {
      const mockData = createMockSpecSheetData()
      mockData.customer.name = '株式会社テスト①②③'
      mockData.product.name = '製品名™®©'
      mockData.remarks = '備考：〜−－∥★'

      const validation = validateSpecSheetData(mockData)
      expect(validation.isValid).toBe(true)
    })
  })
})

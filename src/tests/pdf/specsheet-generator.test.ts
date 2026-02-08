/**
 * Spec Sheet PDF Generator Tests
 *
 * 仕様書PDFジェネレーターテスト
 * - データ変換
 * - バリデーション
 * - サイズ見積もり
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  SpecSheetPdfGenerator,
  createMockSpecSheetData,
} from '@/lib/pdf/generators/specsheet-generator';
import type { SpecSheetData } from '@/types/specsheet';

// ============================================================
// Tests
// ============================================================

describe('SpecSheetPdfGenerator', () => {
  let generator: SpecSheetPdfGenerator;

  beforeEach(() => {
    generator = new SpecSheetPdfGenerator();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(generator).toBeInstanceOf(SpecSheetPdfGenerator);
    });
  });

  describe('Validation', () => {
    it('should validate correct spec sheet data', () => {
      const data = createMockSpecSheetData();
      const result = generator.validateData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data without spec number', () => {
      const data = createMockSpecSheetData();
      data.specNumber = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('仕様書番号は必須です');
    });

    it('should reject data without revision', () => {
      const data = createMockSpecSheetData();
      data.revision = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('版数は必須です');
    });

    it('should reject data without issue date', () => {
      const data = createMockSpecSheetData();
      data.issueDate = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('発行日は必須です');
    });

    it('should reject data without customer name', () => {
      const data = createMockSpecSheetData();
      data.customer.name = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('顧客名は必須です');
    });

    it('should reject data without product name', () => {
      const data = createMockSpecSheetData();
      data.product.name = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('製品名は必須です');
    });

    it('should reject data without materials', () => {
      const data = createMockSpecSheetData();
      data.product.materials = [];

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('材質構成は必須です');
    });

    it('should reject data without production method', () => {
      const data = createMockSpecSheetData();
      data.production.method = '';

      const result = generator.validateData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('生産方法は必須です');
    });
  });

  describe('Template Data Preparation', () => {
    it('should prepare template data correctly', () => {
      const data = createMockSpecSheetData();
      const templateData = generator.prepareTemplateData(data);

      // ヘッダー情報
      expect(templateData.header.companyName).toBe('EPACKAGE Lab株式会社');
      expect(templateData.header.address).toBe('兵庫県明石市上ノ丸2-11-21');

      // 仕様書情報
      expect(templateData.specSheet.specNumber).toBe('B2B-SPEC-2024-001');
      expect(templateData.specSheet.revision).toBe('1.0');
      expect(templateData.specSheet.categoryName).toBe('袋製品');

      // 顧客情報
      expect(templateData.customer.name).toBe('テスト食品株式会社');
      expect(templateData.customer.contactPerson).toBe('山田 太郎');

      // 製品情報
      expect(templateData.product.name).toBe('オーダーメイドスタンドパウチ袋');
      expect(templateData.product.productCode).toBe('SP-A4-100');

      // 寸法テーブル
      expect(Array.isArray(templateData.product.dimensionsTable)).toBe(true);
      expect(templateData.product.dimensionsTable.length).toBeGreaterThan(0);

      // 材質
      expect(templateData.product.materials.length).toBe(3);

      // 仕様
      expect(Array.isArray(templateData.product.specifications)).toBe(true);
      expect(templateData.product.specifications.length).toBeGreaterThan(0);
    });

    it('should build dimensions table correctly', () => {
      const data = createMockSpecSheetData();
      const templateData = generator.prepareTemplateData(data);

      const dimensions = templateData.product.dimensionsTable as any[];
      expect(dimensions).toBeDefined();

      const lengthDim = dimensions.find((d: any) => d.item === '長さ');
      expect(lengthDim).toBeDefined();
      expect(lengthDim.value).toBe('200');
      expect(lengthDim.unit).toBe('mm');

      const widthDim = dimensions.find((d: any) => d.item === '幅');
      expect(widthDim).toBeDefined();
      expect(widthDim.value).toBe('140');

      const thicknessDim = dimensions.find((d: any) => d.item === '厚み');
      expect(thicknessDim).toBeDefined();
      expect(thicknessDim.unit).toBe('μm');
    });

    it('should build specifications list correctly', () => {
      const data = createMockSpecSheetData();
      const templateData = generator.prepareTemplateData(data);

      const specs = templateData.product.specifications as any[];
      expect(specs).toBeDefined();

      const applicationSpec = specs.find((s: any) => s.item === '用途');
      expect(applicationSpec).toBeDefined();
      expect(applicationSpec.description).toBe('乾燥食品・スナック菓子包装');

      const waterResistanceSpec = specs.find((s: any) => s.item === '耐水性');
      expect(waterResistanceSpec).toBeDefined();
      expect(waterResistanceSpec.description).toBe('あり');
    });

    it('should handle optional design information', () => {
      const data = createMockSpecSheetData();
      const templateData = generator.prepareTemplateData(data);

      expect(templateData.design).toBeDefined();
      expect(templateData.design!.printing).toContain('グラビア印刷');
    });

    it('should handle optional pricing information', () => {
      const data = createMockSpecSheetData();
      const templateData = generator.prepareTemplateData(data);

      expect(templateData.pricing).toBeDefined();
      expect(templateData.pricing!.basePrice).toContain('¥');
    });

    it('should handle optional approvals', () => {
      const data = createMockSpecSheetData();
      const templateData = generator.prepareTemplateData(data);

      expect(templateData.approvals).toBeDefined();
      expect(templateData.approvals!.preparedBy).toBe('鈴木 一郎');
    });
  });

  describe('Size Estimation', () => {
    it('should estimate size for simple spec sheet', () => {
      const data = createMockSpecSheetData();
      data.product.materials = [];
      data.product.performance = undefined;
      data.product.compliance = undefined;
      data.design = undefined;
      data.pricing = undefined;
      data.approvals = undefined;

      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(5000);
    });

    it('should estimate size for complete spec sheet', () => {
      const data = createMockSpecSheetData();
      const size = generator.estimateSize(data);

      expect(size).toBeGreaterThan(3000);
    });

    it('should account for materials in size', () => {
      const data = createMockSpecSheetData();
      const size1 = generator.estimateSize(data);

      data.product.materials = Array(10).fill({
        layer: 1,
        material: 'TEST',
        thickness: 10,
      });

      const size2 = generator.estimateSize(data);

      expect(size2).toBeGreaterThan(size1);
    });
  });

  describe('Helper Methods', () => {
    it('should translate category names', () => {
      const generator = new SpecSheetPdfGenerator();

      // プライベートメソッドなので直接テストできない
      // テンプレートデータを通じて確認
      const data = createMockSpecSheetData();
      data.category = 'bag';
      const templateData = generator.prepareTemplateData(data);
      expect(templateData.specSheet.categoryName).toBe('袋製品');
    });

    it('should translate transparency names', () => {
      const data = createMockSpecSheetData();
      data.product.specifications.transparency = 'transparent';

      const templateData = generator.prepareTemplateData(data);
      const specs = templateData.product.specifications as any[];
      const transparencySpec = specs.find((s: any) => s.item === '透明度');

      expect(transparencySpec.description).toBe('透明');
    });

    it('should translate printing method names', () => {
      const data = createMockSpecSheetData();
      data.design!.printing!.method = 'flexo';

      const templateData = generator.prepareTemplateData(data);
      expect(templateData.design!.printing).toContain('フレキソ印刷');
    });
  });

  describe('Mock Data', () => {
    it('should create valid mock spec sheet data', () => {
      const data = createMockSpecSheetData();

      expect(data.specNumber).toBe('B2B-SPEC-2024-001');
      expect(data.revision).toBe('1.0');
      expect(data.customer.name).toBe('テスト食品株式会社');
      expect(data.product.name).toBeTruthy();
      expect(data.product.materials.length).toBeGreaterThan(0);
      expect(data.production.method).toBeTruthy();
    });

    it('should have all required fields in mock data', () => {
      const data = createMockSpecSheetData();

      expect(data.specNumber).toBeTruthy();
      expect(data.revision).toBeTruthy();
      expect(data.issueDate).toBeTruthy();
      expect(data.customer.name).toBeTruthy();
      expect(data.product.name).toBeTruthy();
      expect(data.product.productCode).toBeTruthy();
      expect(data.product.dimensions).toBeDefined();
      expect(data.product.materials.length).toBeGreaterThan(0);
      expect(data.production.method).toBeTruthy();
      expect(data.production.delivery.leadTime).toBeTruthy();
    });
  });
});

describe('SpecSheetPdfGenerator Integration', () => {
  it('should handle complete workflow', () => {
    const generator = new SpecSheetPdfGenerator();
    const data = createMockSpecSheetData();

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

  it('should handle minimal valid data', () => {
    const generator = new SpecSheetPdfGenerator();
    const data = createMockSpecSheetData();

    // オプションフィールドを削除
    data.design = undefined;
    data.pricing = undefined;
    data.approvals = undefined;
    data.product.performance = undefined;
    data.product.compliance = undefined;

    const templateData = generator.prepareTemplateData(data);

    // 必須フィールドは存在
    expect(templateData.header).toBeDefined();
    expect(templateData.specSheet).toBeDefined();
    expect(templateData.customer).toBeDefined();
    expect(templateData.product).toBeDefined();

    // オプションフィールドは存在しない可能性がある
    expect(templateData.design).toBeUndefined();
    expect(templateData.pricing).toBeUndefined();
  });
});

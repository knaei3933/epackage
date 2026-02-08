/**
 * Specification Sheet PDF Generator
 *
 * 仕様書PDFジェネレーター（リファクタリング版）
 * - BasePdfGeneratorを継承
 * - 既存機能を維持しつつ構造を改善
 */

import * as path from 'path';
import type {
  SpecSheetData,
  SpecSheetPdfOptions,
  SpecSheetPdfResult,
  SpecSheetTemplateData,
  DimensionRow,
  SpecFeature,
  PerformanceRow,
} from '@/types/specsheet';
import {
  BasePdfGenerator,
  type BasePdfGeneratorOptions,
} from '../core/base';

// ============================================================
// Configuration
// ============================================================

const SPEC_SHEET_TEMPLATE_PATH = path.join(
  process.cwd(),
  'templet',
  'specsheet_ja.html'
);

const DEFAULT_SPEC_SHEET_OPTIONS: Required<SpecSheetPdfOptions> = {
  format: 'A4',
  orientation: 'portrait',
  template: 'standard',
  language: 'ja',
  includeDiagrams: true,
  includePricing: false,
  includeApproval: false,
  outputPath: '',
};

// ============================================================
// Spec Sheet PDF Generator Class
// ============================================================

/**
 * 仕様書PDFジェネレーター
 * Specification sheet PDF generator
 */
export class SpecSheetPdfGenerator extends BasePdfGenerator<
  SpecSheetData,
  SpecSheetPdfResult
> {
  constructor(options?: Partial<BasePdfGeneratorOptions>) {
    super({
      templatePath: SPEC_SHEET_TEMPLATE_PATH,
      defaultPdfOptions: DEFAULT_SPEC_SHEET_OPTIONS,
      ...options,
    });
  }

  // ============================================================
  // Abstract Method Implementations
  // ============================================================

  /**
   * 仕様書データをテンプレートデータに変換
   * Convert spec sheet data to template data
   */
  protected prepareTemplateData(data: SpecSheetData): Record<string, unknown> {
    // 寸法テーブルを構築
    const dimensionsTable: DimensionRow[] = [];
    const dim = data.product.dimensions;

    if (dim.length !== undefined) {
      dimensionsTable.push({
        item: '長さ',
        value: dim.length.toString(),
        unit: 'mm',
      });
    }
    if (dim.width !== undefined) {
      dimensionsTable.push({
        item: '幅',
        value: dim.width.toString(),
        unit: 'mm',
      });
    }
    if (dim.height !== undefined) {
      dimensionsTable.push({
        item: '高さ/奥行き',
        value: dim.height.toString(),
        unit: 'mm',
      });
    }
    if (dim.thickness !== undefined) {
      dimensionsTable.push({
        item: '厚み',
        value: dim.thickness.toString(),
        unit: 'μm',
      });
    }
    if (dim.opening !== undefined) {
      dimensionsTable.push({
        item: '口径',
        value: dim.opening.toString(),
        unit: 'mm',
      });
    }
    if (dim.tolerance) {
      dimensionsTable.push({
        item: '許容差',
        value: dim.tolerance,
        unit: '',
      });
    }

    // 仕様リストを構築
    const specifications: SpecFeature[] = [];
    const specs = data.product.specifications;

    if (specs.application) {
      specifications.push({
        item: '用途',
        description: specs.application,
      });
    }
    if (specs.heatResistance) {
      specifications.push({
        item: '耐熱温度',
        description: specs.heatResistance,
      });
    }
    if (specs.coldResistance) {
      specifications.push({
        item: '耐冷温度',
        description: specs.coldResistance,
      });
    }
    if (specs.transparency) {
      specifications.push({
        item: '透明度',
        description: this.getTransparencyName(specs.transparency),
      });
    }
    specifications.push({
      item: '耐水性',
      description: specs.waterResistance ? 'あり' : 'なし',
    });
    specifications.push({
      item: '気密性',
      description: specs.airTightness ? 'あり' : 'なし',
    });
    specifications.push({
      item: '防湿性',
      description: specs.moistureResistance ? 'あり' : 'なし',
    });
    specifications.push({
      item: '帯電防止',
      description: specs.antistatic ? 'あり' : 'なし',
    });
    specifications.push({
      item: '紫外線カット',
      description: specs.uvProtection ? 'あり' : 'なし',
    });
    if (specs.features && specs.features.length > 0) {
      specs.features.forEach((feature, index) => {
        specifications.push({
          item: `特徴${index + 1}`,
          description: feature,
        });
      });
    }

    // 性能テーブルを構築
    const performance: PerformanceRow[] | undefined = data.product.performance
      ? [
          ...(data.product.performance.tensileStrength
            ? [{ item: '引張強度', value: data.product.performance.tensileStrength }]
            : []),
          ...(data.product.performance.tearStrength
            ? [{ item: '破裂強度', value: data.product.performance.tearStrength }]
            : []),
          ...(data.product.performance.sealStrength
            ? [{ item: '密封強度', value: data.product.performance.sealStrength }]
            : []),
          ...(data.product.performance.wvtr
            ? [{ item: '透湿度', value: data.product.performance.wvtr }]
            : []),
          ...(data.product.performance.otr
            ? [{ item: '酸素透過度', value: data.product.performance.otr }]
            : []),
        ]
      : undefined;

    // 規格準拠リストを構築
    const compliance: string[] | undefined = data.product.compliance
      ? [
          ...(data.product.compliance.foodSanitationAct ? ['食品衛生法準拠'] : []),
          ...(data.product.compliance.jisStandards || []).map((s) => `JIS: ${s}`),
          ...(data.product.compliance.isoStandards || []).map((s) => `ISO: ${s}`),
          ...(data.product.compliance.otherStandards || []),
        ]
      : undefined;

    // デザイン情報を構築
    const design = data.design
      ? {
          printing: data.design.printing
            ? `${this.getPrintingMethodName(data.design.printing.method)}、${data.design.printing.colors}色、${
                data.design.printing.sides === 'both'
                  ? '両面'
                  : data.design.printing.sides === 'front'
                    ? '表面'
                    : '裏面'
              }`
            : undefined,
          colorGuide: data.design.colorGuide
            ? [
                ...(data.design.colorGuide.baseColors || []),
                ...(data.design.colorGuide.spotColors || []),
              ]
            : undefined,
          designData: data.design.designData
            ? `${data.design.designData.format}、${data.design.designData.resolution}、${data.design.designData.colorMode}`
            : undefined,
        }
      : undefined;

    // 価格情報を構築
    const pricing = data.pricing
      ? {
          basePrice: this.formatCurrency(
            data.pricing.basePrice.unitPrice,
            data.pricing.basePrice.currency
          ),
          moq: data.pricing.basePrice.moq.toString(),
          volumeDiscount: data.pricing.volumeDiscount?.map(
            (d) => `${d.quantity}個以上: ${(d.discountRate * 100).toFixed(1)}%引き`
          ),
        }
      : undefined;

    // 承認欄を構築
    const approvals =
      data.approvals && data.approvals.length > 0
        ? {
            preparedBy: data.approvals[0]?.name,
            preparedDate: data.approvals[0]?.date,
            approver1: data.approvals[1]
              ? {
                  name: data.approvals[1].name,
                  title: data.approvals[1].title,
                  date: data.approvals[1].date,
                }
              : undefined,
            approver2: data.approvals[2]
              ? {
                  name: data.approvals[2].name,
                  title: data.approvals[2].title,
                  date: data.approvals[2].date,
                }
              : undefined,
          }
        : undefined;

    // テンプレートデータを返す
    return {
      header: {
        companyName: 'EPACKAGE Lab株式会社',
        companyNameKana: 'イーパックケージラボカブシキガイシャ',
        address: '兵庫県明石市上ノ丸2-11-21',
        phone: '050-1793-6500',
        email: 'info@package-lab.com',
        website: 'https://epackage-lab.com',
      },
      specSheet: {
        specNumber: data.specNumber,
        revision: data.revision,
        issueDate: this.formatJapaneseDate(data.issueDate),
        title: data.title,
        categoryName: this.getCategoryName(data.category),
      },
      customer: {
        name: data.customer.name,
        department: data.customer.department,
        contactPerson: data.customer.contactPerson,
      },
      product: {
        name: data.product.name,
        productCode: data.product.productCode,
        dimensionsTable,
        materials: data.product.materials,
        specifications,
        performance,
        compliance,
      },
      production: {
        method: data.production.method,
        process: data.production.process,
        qualityControl: {
          inspectionStandards: data.production.qualityControl.inspectionStandards,
          aqlStandards: data.production.qualityControl.aqlStandards,
        },
        packaging: data.production.packaging,
        delivery: data.production.delivery,
      },
      design,
      pricing,
      remarks: data.remarks,
      approvals,
    };
  }

  /**
   * 仕様書データをバリデート
   * Validate spec sheet data
   */
  protected validateData(data: SpecSheetData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.specNumber) {
      errors.push('仕様書番号は必須です');
    }
    if (!data.revision) {
      errors.push('版数は必須です');
    }
    if (!data.issueDate) {
      errors.push('発行日は必須です');
    }
    if (!data.customer?.name) {
      errors.push('顧客名は必須です');
    }
    if (!data.product?.name) {
      errors.push('製品名は必須です');
    }
    if (!data.product?.productCode) {
      errors.push('製品コードは必須です');
    }
    if (!data.product?.dimensions) {
      errors.push('製品寸法は必須です');
    }
    if (!data.product?.materials || data.product.materials.length === 0) {
      errors.push('材質構成は必須です');
    }
    if (!data.production?.method) {
      errors.push('生産方法は必須です');
    }
    if (!data.production?.delivery?.leadTime) {
      errors.push('リードタイムは必須です');
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
  protected estimateSize(data: SpecSheetData): number {
    // 概算: 基本サイズ3000バイト + 材質レイヤーごとに200バイト + 仕様ごとに500バイト
    const baseSize = 3000;
    const materialsSize = data.product.materials.length * 200;
    const specsSize = Object.keys(data.product.specifications).length * 500;
    const performanceSize = data.product.performance ? 500 : 0;
    const complianceSize = data.product.compliance ? 300 : 0;
    const designSize = data.design ? 400 : 0;
    const pricingSize = data.pricing ? 300 : 0;
    const approvalSize = data.approvals?.length ? data.approvals.length * 200 : 0;

    return (
      baseSize +
      materialsSize +
      specsSize +
      performanceSize +
      complianceSize +
      designSize +
      pricingSize +
      approvalSize
    );
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      packaging: '包装資材',
      bag: '袋製品',
      film: 'フィルム',
      container: '容器',
      label: 'ラベル',
      sealing: '封筒',
      custom: 'カスタム',
    };
    return categoryNames[category] || category;
  }

  private getTransparencyName(transparency: string): string {
    const names: Record<string, string> = {
      transparent: '透明',
      translucent: '半透明',
      opaque: '不透明',
    };
    return names[transparency] || transparency;
  }

  private getPrintingMethodName(method: string): string {
    const names: Record<string, string> = {
      gravure: 'グラビア印刷',
      flexo: 'フレキソ印刷',
      offset: 'オフセット印刷',
      digital: 'デジタル印刷',
      none: '印刷なし',
    };
    return names[method] || method;
  }
}

// ============================================================
// Convenience Functions (Backward Compatibility)
// ============================================================

/**
 * 仕様書PDFを生成
 * Generate spec sheet PDF
 */
export async function generateSpecSheetPdf(
  data: SpecSheetData,
  options: SpecSheetPdfOptions = {}
): Promise<SpecSheetPdfResult> {
  const generator = new SpecSheetPdfGenerator();
  return generator.generate(data, options);
}

/**
 * 仕様書PDFをBase64で生成
 * Generate spec sheet PDF as base64
 */
export async function generateSpecSheetPdfBase64(
  data: SpecSheetData
): Promise<{ success: boolean; base64?: string; error?: string }> {
  const generator = new SpecSheetPdfGenerator();
  return generator.generateBase64(data);
}

/**
 * 仕様書データをバリデート
 * Validate spec sheet data
 */
export function validateSpecSheetData(
  data: SpecSheetData
): { isValid: boolean; errors: string[] } {
  const generator = new SpecSheetPdfGenerator();
  return generator.validateData(data);
}

/**
 * PDFサイズを見積もり
 * Estimate PDF file size
 */
export function estimateSpecSheetPdfSize(data: SpecSheetData): number {
  const generator = new SpecSheetPdfGenerator();
  return generator.estimateSize(data);
}

/**
 * モック仕様書データを作成
 * Create mock spec sheet data for testing
 */
export function createMockSpecSheetData(): SpecSheetData {
  return {
    specNumber: 'B2B-SPEC-2024-001',
    revision: '1.0',
    issueDate: '2024-04-01',
    validUntil: '2025-04-01',
    status: 'active',
    category: 'bag',
    title: 'オーダーメイドスタンドパウチ袋仕様書',
    description: '食品包装用スタンドパウチ袋の技術仕様書',

    customer: {
      name: 'テスト食品株式会社',
      department: '資材調達部',
      contactPerson: '山田 太郎',
      contact: {
        phone: '03-1234-5678',
        email: 'yamada@test-food.co.jp',
      },
    },

    product: {
      id: 'PROD-001',
      name: 'オーダーメイドスタンドパウチ袋',
      nameKana: 'オーダーメイドスタンドパウチブクロ',
      productCode: 'SP-A4-100',
      category: 'bag',

      dimensions: {
        length: 200,
        width: 140,
        thickness: 100,
        opening: 40,
        tolerance: '±2mm',
      },

      materials: [
        {
          layer: 1,
          material: 'PET（ポリエチレンテレフタレート）',
          thickness: 12,
          function: '外層・印刷面',
        },
        {
          layer: 2,
          material: 'AL（アルミニウム箔）',
          thickness: 7,
          function: 'バリア層',
        },
        {
          layer: 3,
          material: 'PE（ポリエチレン）',
          thickness: 81,
          function: '内層・熱密封層',
        },
      ],

      specifications: {
        application: '乾燥食品・スナック菓子包装',
        heatResistance: '最高120℃',
        coldResistance: '最低-20℃',
        transparency: 'opaque',
        waterResistance: true,
        airTightness: true,
        moistureResistance: true,
        antistatic: false,
        uvProtection: false,
        features: [
          '底部ガセットによる自立性',
          'ジッパー付きによる再密封可能',
        ],
      },

      performance: {
        tensileStrength: '40MPa以上',
        tearStrength: '150N以上',
        sealStrength: '15N/15mm以上',
        wvtr: '1g/㎡・day以下',
        otr: '1cc/㎡・day以下',
      },

      compliance: {
        foodSanitationAct: true,
        jisStandards: ['Z1707'],
        isoStandards: ['9001'],
      },
    },

    production: {
      method: 'インフレーション成形・ラミネート加工',
      process: [
        'フィルム押出し',
        '印刷',
        'ラミネート',
        '製袋',
        '検査',
      ],
      equipment: ['フィルム押出し機', 'グラビア印刷機', 'ラミネート機', '製袋機'],

      qualityControl: {
        inspectionStandards: [
          '外観検査',
          '寸法検査',
          '密封強度検査',
          'バリア性能検査',
        ],
        testMethods: [
          'JIS Z 0238（密封強度試験）',
          'JIS K 7129（透湿度試験）',
        ],
        aqlStandards: 'AQL 1.5',
      },

      packaging: {
        unit: '箱',
        quantity: 1000,
        packingSpec: '段ボール箱詰め（防湿処理済）',
      },

      delivery: {
        leadTime: '受注確認後30日〜45日',
        minLotSize: 5000,
        lotUnit: '個',
      },
    },

    design: {
      printing: {
        method: 'gravure',
        colors: 8,
        sides: 'front',
        finishing: ['ニス加工', 'エンボス'],
      },
      colorGuide: {
        baseColors: ['プロセスカラー（CMYK）'],
        spotColors: ['PANTONE 186 C（赤）', 'DIC 156（青）'],
        colorCodes: {
          red: 'PANTONE 186 C',
          blue: 'DIC 156',
        },
      },
      designData: {
        format: 'PDF',
        resolution: '350dpi',
        colorMode: 'CMYK',
        fileUrl: 'https://example.com/design.pdf',
      },
    },

    pricing: {
      basePrice: {
        unitPrice: 150,
        moq: 5000,
        currency: 'JPY',
      },
      volumeDiscount: [
        { quantity: 10000, discountRate: 0.05 },
        { quantity: 50000, discountRate: 0.10 },
      ],
      options: [
        { name: 'ジッパー追加', price: 10, unit: '円/個' },
        { name: '穴あけ加工', price: 3, unit: '円/個' },
      ],
      validityPeriod: '発行日から90日間',
    },

    remarks: '本仕様書は特定の製品仕様を示すものであり、実際の製品と異なる場合があります。詳細は担当者にお問い合わせください。',

    approvals: [
      {
        name: '鈴木 一郎',
        title: '技術担当',
        date: '2024-04-01',
        status: 'approved',
      },
      {
        name: '佐藤 花子',
        title: '品質管理部長',
        date: '2024-04-02',
        status: 'approved',
        comments: '仕様確認完了',
      },
    ],
  };
}

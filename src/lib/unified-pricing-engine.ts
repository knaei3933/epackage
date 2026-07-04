import { z } from 'zod'
import type {
  FilmCostCalculator,
  FilmCostResult,
  FilmStructureLayer
} from './film-cost-calculator'
import type {
  PouchDimensions,
  SKUCostParams,
  SKUCostResult,
  SKUCostBreakdown
} from './pouch-cost-calculator'
import { determineMaterialWidth } from './material-width-selector'
import { getFilmStructureLabel } from '../constants/materialTypes'
import { processingOptionsConfig, type ProcessingOptionConfig } from '../components/quote/shared/processingConfig'
import { PRICING_CONSTANTS, PRINTING_COSTS, GRAVURE_CONSTANTS } from './pricing/core/constants'
import { calculateGravureFilmValue, calculateCopperPlateCost } from './gravure-cost-calculator'

// ========================================
// ヘルパー関数
// ========================================

/**
 * ウォン(KRW) → 円(JPY) 換算の集約ヘルパー（AC-22・Phase 1b）
 *
 * 仕様 gravure-integration-consensus.md AC-22「円変換は集約レイヤーで統一」に基づき、
 * 従来コード内に散在した `* 0.12` マジックナンバーを本関数に集約（DRY化）。
 *
 * - 唯一ソース（SSoT）: PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY（constants.ts）
 * - 計算結果は従来の `krw * 0.12` と数学的に完全一致（後方互換性維持）
 * - デジタル計算: 各計算関数は引き続き円を返す（従来通り）
 * - グラビア計算: gravure-cost-calculator.ts がウォンを返し、1c アダプタ層で本関数を呼び円変換
 *
 * @param krw ウォン金額
 * @returns 円金額（krw × 為替レート）
 */
export function convertKRWtoJPY(krw: number): number {
  return krw * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
}

/**
 * 素材IDと厚さ選択から材料構造を取得
 * @param materialId 素材ID (例: 'pet_al')
 * @param thicknessSelection 厚さ選択 (例: 'light', 'medium', 'heavy', 'ultra')
 * @returns 材料構造文字列 (例: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 60μ')
 */
export function getMaterialSpecification(
  materialId: string,
  thicknessSelection: string
): string {
  const options = MATERIAL_THICKNESS_OPTIONS[materialId]
  if (options) {
    const thickness = options.find(opt => opt.id === thicknessSelection)
    if (thickness?.specification) return thickness.specification
  }
  // フォールバック: pet_ny/kp_pe 等の旧系 MATERIAL_THICKNESS_OPTIONS 未登録素材、
  // または thicknessSelection 非該当時は materialData.ts の specificationEn
  // （getFilmStructureLabel）を参照して '-' 表示を回避する。
  return getFilmStructureLabel(materialId, thicknessSelection)
}

// ========================================
// 価格計算ログ表示ヘルパー
// ========================================

/**
 * 価格計算の詳細をユーザーに見やすく表示
 * 開発環境でのみ出力
 */
function logPriceCalculationDetail(step: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    const style = 'background: #f0f9ff; color: #0369a1; padding: 8px 12px; border-radius: 4px; font-weight: bold;';
    console.log(`%c【${step}】`, style);
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * 価格計算のサマリーを表示
 */
function logPriceSummary(summary: {
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
  breakdown: any
}) {
  if (process.env.NODE_ENV === 'development') {
    const style = 'background: #fef3c7; color: #92400e; padding: 12px 16px; border-radius: 8px; font-weight: bold; font-size: 14px;';
    console.log(`%c💰 最終価格サマリー`, style);
    console.table({
      '数量': `${summary.quantity.toLocaleString()}個`,
      '単価': `${summary.currency}${summary.unitPrice.toLocaleString()}`,
      '総額': `${summary.currency}${summary.totalPrice.toLocaleString()}`
    });
  }
}

// 統合価格エンジン用のインターフェース定義
export interface UnifiedQuoteParams {
  bagTypeId: string
  materialId: string
  width: number
  height: number
  depth?: number
  quantity: number
  thickness?: number
  thicknessSelection?: string
  thicknessMultiplier?: number
  isUVPrinting?: boolean
  postProcessingOptions?: string[]
  postProcessingMultiplier?: number
  printingType?: 'digital' | 'gravure' | 'auto' // Phase 2: 'auto' = 分岐点レコメンドで自動解決
  printingColors?: number
  doubleSided?: boolean
  deliveryLocation?: 'domestic' | 'international'
  urgency?: 'standard' | 'express'

  // 필름 원가 계산 설정 (새로운 기능)
  useFilmCostCalculation?: boolean // 필름 원가 계산 사용 여부
  markupRate?: number // 고객별 마크업율 (기본값 0.5 = 50%)
  filmLayers?: FilmStructureLayer[] // 필름 구조 레이어
  materialWidth?: number // 재료 폭 (540 또는 740mm)
  lossRate?: number // 로스율 (기본값 0.4 = 40%)

  // SKU 관련 파라미터 (새로운 기능)
  skuQuantities?: number[] // SKU별 수량 [500, 500]
  useSKUCalculation?: boolean // SKU 계산 사용 여부

  // Roll film specific parameters
  rollCount?: number // 롤 필름 시 롤 개수 (롤당 배송비 계산용)

  // Spout pouch specific parameters
  spoutSize?: 9 | 15 | 18 | 22 | 28 // スパウトサイズ（パイ径）
  spoutPosition?: 'top-left' | 'top-center' | 'top-right' // スパウト位置

  // グラビア印刷専用パラメータ（Phase 1c・printingType='gravure' 時のみ使用）
  // デジタル計算（printingType='digital'・既定）はこれらのフィールドを参照しない（後方互換性）
  gravureMaterialWidth?: number // 原反幅 (mm)。未指定時は gravure-material-width.ts で計算、または roll 仕様幅
  copperPlateType?: 'new' | 'modify' | 'none' // 銅版種別（初回=new / リピート=modify / なし=none）
  gravureProductionMeters?: number // グラビア製作長 (m)。未指定時は STANDARD_LOT(6000m) 使用
  columnCount?: number // 多列生産列数（グラビア 2/3/4列）。計画 multi-column-gravure-unification.md AC6。1=単列
}

export interface UnifiedQuoteResult {
  unitPrice: number
  totalPrice: number
  currency: string
  breakdown: {
    // 素材費（フィルム材料費のみ）
    filmCost?: number // フィルム素材費
    // ラミネーション費・スリッター費
    laminationCost?: number // ラミネーション費
    slitterCost?: number // スリッター費
    // 素材費合計（フィルム＋ラミネーション＋スリッター）
    material: number
    processing: number
    printing: number
    setup: number
    discount: number
    delivery: number
    // マージン・関税（追加）
    manufacturingMargin?: number // 製造者マージン
    duty?: number // 関税
    salesMargin?: number // 販売マージン
    // 表面処理費（追加）
    surfaceTreatmentCost?: number // 表面処理費
    subtotal: number
    total: number
    // 파우치 가공비
    pouchProcessingCost?: number
    // 기본 원가
    baseCost?: number
    // SKU追加料金（SKU数量に基づく追加料金）
    skuSurcharge?: number // SKU数による追加料金: (skuCount - 1) × ¥10,000
    // グラビア専用内訳（Phase 1c・printingType='gravure' 時のみ設定）
    gravureFilmValueKRW?: number // グラビア原反値（ウォン）= 原材+印刷+ラミ
    gravureMaterialCostKRW?: number // グラビア原材料費（ウォン）
    gravurePrintingCostKRW?: number // グラビア印刷費（ウォン）
    gravureLaminationCostKRW?: number // グラビアラミネート費（ウォン）
    gravureCopperPlateCostKRW?: number // 銅版費（ウォン・別途計上）
    gravureProductionMeters?: number // グラビア製作長 (m・ロス500m込み)
    gravureMaterialWidthMM?: number // グラビア原反幅 (mm)
  }
  leadTimeDays: number
  validUntil: Date
  minOrderQuantity: number
  // スマート見積互換性
  details?: {
    fixedCost: number
    variableCostPerUnit: number
    surcharge: number
    materialRate: number
    area: number
  }
  // 厚さ情報
  thicknessMultiplier?: number
  selectedThicknessName?: string
  // 後加工情報
  postProcessingMultiplier?: number
  // 最低価格適用フラグ
  minimumPriceApplied?: boolean
  // 필름 원가 계산 상세 (새로운 기능)
  filmCostDetails?: FilmCostResult
  // 마크업 적용 정보 (새로운 기능)
  markupApplied?: {
    rate: number // 적용된 마크업율
    baseCost: number // 마크업 전 가격
    markupAmount: number // 마크업 금액
  }
  // 병렬 생산 제안 정보
  parallelProduction?: {
    enabled?: boolean;
    optionNumber?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isRecommended: boolean;
    suggestedQuantity: number;
    savingsAmount: number;
    savingsPercentage: number;
  };
  // SKU 관련 정보 (새로운 기능)
  skuCostDetails?: SKUCostResult
  hasValidSKUData?: boolean
  skuQuantities?: number[]
  skuCount?: number
  quantity?: number
  filmUsage?: number
  skuIndex?: number
  skuNumber?: number
  isSKUMode?: boolean

  // 필름 폭 계산 정보 (검증용)
  calculatedFilmWidth?: number // 계산된 필름 폭 (mm)
  materialWidth?: 590 | 760 // 선택된 원단 폭 (mm)
  theoreticalMeters?: number // 이론 미터 수
  securedMeters?: number // 확보량
  totalMeters?: number // 총량 (로스 포함)

  // Phase 2: 印刷方式自動選択（分岐点レコメンド・AC-8/9/10）
  // printingType='auto' 解決時に推奨結果を格納。明示指定時は undefined。
  recommendation?: {
    method: 'digital' | 'gravure' // 推奨方式
    resolvedMethod: 'digital' | 'gravure' // 実際に計算に使用した方式
    breakevenQuantity: number // 分岐点数量（個・-1=計算不可）
    digitalTotalPrice: number // デジタル総額（円・-1=計算不可）
    gravureTotalPrice: number // グラビア総額（円・-1=計算不可）
    reason: string // 推奨理由
  }
}

// 厚さ設定
export interface ThicknessOption {
  id: string
  name: string
  nameJa: string
  specification: string
  weightRange: string
  multiplier: number
}

// 素材別厚さオプション (ImprovedQuotingWizard.tsxのgetFilmStructureSpecと同期)
export const MATERIAL_THICKNESS_OPTIONS: Record<string, ThicknessOption[]> = {
  'pet_al': [
    {
      id: 'light',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'standard',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'pet_vmpet': [
    {
      id: 'light',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'standard',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'pet_ldpe': [
    {
      id: 'light',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET 12μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET 12μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'standard',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'PET 12μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET 12μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET 12μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'pet_ny_al': [
    {
      id: 'light',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'standard',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'ny_lldpe': [
    {
      id: 'light',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'NY 15μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'NY 15μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'standard',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'NY 15μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'NY 15μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'NY 15μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'kraft_vmpet_lldpe': [
    {
      id: 'light_50',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'standard_70',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'heavy_90',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'ultra_100',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'maximum_110',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'kraft_pet_lldpe': [
    {
      id: 'light_50',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 50μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'standard_70',
      name: '標準タイプ (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'heavy_90',
      name: 'レギュラータイプ (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'ultra_100',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'maximum_110',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ]
}

// 定数定義
const CONSTANTS = {
  MIN_ORDER_QUANTITY: 100,
  MAX_ORDER_QUANTITY: 100000,
  SMALL_LOT_THRESHOLD: 3000,
  MINIMUM_PRICE: 0, // 最小価格を無効化（ドキュメント通りの計算のみ適用）

  // 素材コスト (円/kg)
  MATERIAL_COSTS: {
    'opp-alu-foil': 1200,
    'kraft-pe': 380,
    'alu-vapor': 900,
    'pet-transparent': 450,
    'PET': 450,
    'PP': 300,
    'PE': 250,
    'ALUMINUM': 1200,
    'PAPER_LAMINATE': 380
  } as const,

  // 素材密度 (kg/m³)
  MATERIAL_DENSITY: {
    'PET': 1.38,
    'PP': 0.90,
    'PE': 0.92,
    'ALUMINUM': 2.70,
    'PAPER_LAMINATE': 0.80
  } as const,

  // 製品タイプ別加工費 (円/個)
  PROCESSING_COSTS: {
    'flat-pouch': 15,
    'standing-pouch': 18,
    'flat_3_side': 15,
    'stand_up': 18,
    'gusset': 20,
    'box': 22,
    'flat_with_zip': 20,
    'special': 25,
    'soft_pouch': 17,
    'roll_film': 10,
    'spout_pouch': 20
  } as const,

  // 印刷設定（SSoT: pricing/core/constants.ts の PRINTING_COSTS を正とする）
  // グラビア perColorPerMeter=19₫/m は仕様§6.1準拠
  PRINTING_COSTS,

  // 配送料
  DELIVERY_COSTS: {
    domestic: {
      base: 1500,
      perKg: 150,
      freeThreshold: 50000
    },
    international: {
      base: 5000,
      perKg: 500,
      freeThreshold: 200000
    }
  } as const,

  // 小量注文手数料
  SMALL_LOT_SURCHARGE: 30000,

  // UV印刷設定
  UV_PRINTING_FIXED_COST: 15000,
  UV_PRINTING_SURCHARGE: 20000,

  // ロールフィルム設定 (M単位)
  ROLL_FILM_COST_PER_M: 100, // Mあたりの単価 (円/m)

  // 後加工乗数（デフォルト）
  DEFAULT_POST_PROCESSING_MULTIPLIER: 1.0,

  // ロールフィルム専用定数（520원/m印刷費、ラミネート・スリッター計算用）- 2026-06-27 改定
  ROLL_FILM_PRINTING_COST_PER_M: 520, // 원/m (폭 무관)（475→520 原価上昇）
  ROLL_FILM_LAMINATION_COST_PER_M_NO_AL: 65,  // 원/m（AL素材なし）
  ROLL_FILM_LAMINATION_COST_PER_M_WITH_AL: 80, // 원/m（AL素材あり）
  ROLL_FILM_SLITTER_MIN_COST: 30000,    // 원
  ROLL_FILM_SLITTER_COST_PER_M: 10,    // 원/m

  // 필름 원가 계산 설정 (새로운 기능)
  // ガイド準拠値（AC-Q6/S1.1）: pricing/core/constants.ts の PRICING_CONSTANTS を正とする
  // 製造者マージン40%・販売マージン25%（2026-06-27 改定: 販売マージン 20%→25%）
  MANUFACTURER_MARGIN: PRICING_CONSTANTS.MANUFACTURER_MARGIN, // 0.4（製造社原価に40%）
  SALES_MARGIN: PRICING_CONSTANTS.SALES_MARGIN, // 0.25（小計に25%）
  DEFAULT_MARKUP_RATE: PRICING_CONSTANTS.SALES_MARGIN, // 0.25（販売マージン）
  // 총 마진율 = (1 + 0.4) × (1 + 0.25) - 1 = 0.75 (75%)
  DEFAULT_LOSS_RATE: PRICING_CONSTANTS.DEFAULT_LOSS_RATE, // 0.4（기본 로스율 40%）
  DEFAULT_MATERIAL_WIDTH: PRICING_CONSTANTS.DEFAULT_MATERIAL_WIDTH, // 760（기본 원단 폭）

  // 파우치 가공비 계산식 (원화/cm) - 가로CM × 계수
  // 최소단가 적용: 삼방 ₩200,000, 스탠드 ₩250,000, T/M방 ₩440,000
  // 주의: 지퍼 추가는 postProcessingMultiplier로 조정 (이중과세 방지)
  POUCH_PROCESSING_COSTS: {
    'flat_3_side': { coefficient: 0.4, minimumPrice: 200000 }, // 3방파우치: 가로CM*0.4, 최소 ₩200,000
    'stand_up': { coefficient: 1.2, minimumPrice: 250000 }, // 스탠드파우치: 가로CM*1.2, 최소 ₩250,000
    't_shape': { coefficient: 1.2, minimumPrice: 440000 }, // T방파우치: 가로CM*1.2, 최소 ₩440,000
    'm_shape': { coefficient: 1.2, minimumPrice: 440000 }, // M방파우치: 가로CM*1.2, 최소 ₩440,000
    'box': { coefficient: 1.2, minimumPrice: 440000 }, // 박스형파우치: 가로CM*1.2, 최소 ₩440,000
    'other': { coefficient: 1.0, minimumPrice: 200000 } // 기타
  } as const,

  // 지퍼 추가 시 최소단가 상향 (원화)
  ZIPPER_SURCHARGE: {
    'flat_3_side': 50000,   // 200,000 → 250,000
    'stand_up': 30000,      // 250,000 → 280,000
    't_shape': 0,           // 440,000 → 440,000 (변화 없음)
    'm_shape': 0,           // 440,000 → 440,000 (변화 없음)
    'box': 0                // 440,000 → 440,000 (변화 없음)
  } as const
} as const

export class UnifiedPricingEngine {
  private cache: Map<string, UnifiedQuoteResult> = new Map()
  private settingsCache: Map<string, any> = new Map()
  private settingsCacheExpiry: number = 0
  private readonly SETTINGS_CACHE_TTL = 30 * 1000 // 30 seconds - 設定変更を素早く反映するため短縮

  // 韓国原価計算に基づく材料単価（ウォン/kg） - クラス定数
  private static readonly MATERIAL_PRICES_KRW: Record<string, { unitPrice: number; density: number }> = {
    'PET': { unitPrice: 2800, density: 1.40 },
    'AL': { unitPrice: 7800, density: 2.71 },
    'LLDPE': { unitPrice: 2800, density: 0.92 },
    'NY': { unitPrice: 5400, density: 1.16 },
    'VMPET': { unitPrice: 3600, density: 1.40 },
    'CPP': { unitPrice: 2700, density: 0.91 }
  };

  // 韓国重量別配送料表（ウォン） - 26kgごとに包装を分け、15%加算
  private static readonly DELIVERY_COST_BY_WEIGHT_KRW: Record<number, number> = {
    0.5: 23500, 0.75: 24500, 1.0: 25500, 1.25: 27500, 1.5: 28500,
    1.75: 31000, 2.0: 33000, 2.5: 35500, 3.0: 36500, 3.5: 38000,
    4.0: 40000, 4.5: 41500, 5.0: 43000, 5.5: 45000, 6.0: 46500,
    6.5: 48500, 7.0: 50000, 7.5: 51500, 8.0: 53500, 8.5: 55000,
    9.0: 57000, 9.5: 58500, 10.0: 60000, 10.5: 62000, 11.0: 63500,
    11.5: 65500, 12.0: 67000, 12.5: 69000, 13.0: 70500, 13.5: 71500,
    14.0: 73500, 14.5: 75000, 15.0: 76500, 15.5: 78000, 16.0: 79500,
    16.5: 81000, 17.0: 82500, 17.5: 83500, 18.0: 85500, 18.5: 87000,
    19.0: 88500, 19.5: 90000, 20.0: 91500, 20.5: 93000, 21.0: 94500,
    21.5: 96000, 22.0: 97500, 22.5: 99000, 23.0: 100500, 23.5: 102000,
    24.0: 103500, 24.5: 105000, 25.0: 106500, 25.5: 108000, 26.0: 109500,
    26.5: 111000, 27.0: 112500, 27.5: 114000, 28.0: 115500, 28.5: 117000,
    29.0: 118500, 29.5: 120000, 30.0: 121500
  };

  // 包装単位（27kgごと） - ドルの最大重量制限
  private static readonly PACKAGE_WEIGHT_LIMIT = 27; // kg

  /**
   * 後加工オプション配列から乗数を計算
   * processingConfig.tsのpriceMultiplierを使用
   */
  private calculatePostProcessingMultiplier(postProcessingOptions?: string[]): number {
    if (!postProcessingOptions || postProcessingOptions.length === 0) {
      return 1.0
    }

    // 各オプションの乗数を取得して積算
    let multiplier = 1.0
    for (const optionId of postProcessingOptions) {
      const option = processingOptionsConfig.find(opt => opt.id === optionId)
      if (option) {
        multiplier *= option.priceMultiplier
      }
    }

    return multiplier
  }

  constructor() {
    // キャッシュサイズ制限
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.cache.size > 100) {
          this.cache.clear()
        }
      }, 60000) // 1分ごとにキャッシュ整理
    }
  }

  /**
   * Load system settings from database
   * 公開価格設定APIを使用してDB設定をロード（5分キャッシュ）
   *
   * 注意: /api/admin/settingsはadmin認証が必要なため、
   * 一般ユーザーが見積もりを作成する場合は /api/pricing/settings を使用
   */
  private async loadSystemSettings(): Promise<Map<string, any>> {
    // Check cache
    const now = Date.now()
    if (this.settingsCacheExpiry > now && this.settingsCache.size > 0) {
      return this.settingsCache
    }

    try {
      // 公開価格設定APIを使用（認証不要）
      const response = await fetch('/api/pricing/settings', {
        cache: 'no-store' // キャッシュを無効化して最新設定を取得
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch pricing settings: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to load pricing settings')
      }

      // APIから返されたフラットなKey-ValueマップをMapに変換
      const settings = new Map<string, any>()
      if (result.data) {
        for (const [key, value] of Object.entries(result.data)) {
          settings.set(key, value)
        }
      }

      // Update cache
      this.settingsCache = settings
      this.settingsCacheExpiry = now + this.SETTINGS_CACHE_TTL

      console.log('[UnifiedPricingEngine] Loaded pricing settings from DB:', settings.size, 'settings')
      return settings
    } catch (error) {
      console.error('[UnifiedPricingEngine] Failed to load pricing settings, using defaults:', error)
      // Return empty map on error (will use hardcoded defaults)
      return new Map()
    }
  }

  /**
   * Get a specific setting value
   * @param category Setting category (e.g., 'film_material', 'printing')
   * @param key Setting key (e.g., 'PET_unit_price', 'cost_per_m2')
   * @param defaultValue Default value if setting not found
   */
  private async getSetting(category: string, key: string, defaultValue: any): Promise<any> {
    const settings = await this.loadSystemSettings()
    const fullKey = `${category}.${key}`
    const dbValue = settings.get(fullKey)
    // S1.6: フォールバック発動を可視化。
    // defaultValue が明示的に指定（undefined でない）されており、DB に値がない場合のみ警告。
    // defaultValue=undefined の呼び出し（設定不在を許容するケース）は警告対象外。
    if (dbValue === undefined && defaultValue !== undefined) {
      console.warn(
        `[UnifiedPricingEngine][getSetting] フォールバック発動: ${fullKey} がDBに存在しません。` +
        `デフォルト値 ${defaultValue} を使用します。`
      )
    }
    return dbValue ?? defaultValue
  }

  /**
   * 統合見積計算メソッド
   * SKUモードのみ対応（일반 모드는 삭제）
   */
  async calculateQuote(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    // ADD THIS DIAGNOSTIC BLOCK
    console.log('[calculateQuote] DIAGNOSTIC ENTRY:', {
      timestamp: new Date().toISOString(),
      useSKUCalculation: params.useSKUCalculation,
      skuQuantities: params.skuQuantities,
      totalSKUQuantity: params.skuQuantities?.reduce((a, b) => a + b, 0),
      quantity: params.quantity,
      markupRate: params.markupRate,
      bagTypeId: params.bagTypeId,
    });

    // ========================================
    // Phase 2: printingType='auto' 解決（AC-9）
    // 推奨方式を決定し、実計算に流す。推奨結果は result.recommendation に格納。
    // ※ キャッシュは解決後の method ベースで行う（auto 自体はキャッシュキーに含めない）。
    // ========================================
    let recommendation: UnifiedQuoteResult['recommendation'] | undefined
    if (params.printingType === 'auto') {
      const rec = await this.recommendPrintingMethod(params)
      // 推奨方式で実計算を実行
      params = { ...params, printingType: rec.method }
      recommendation = {
        method: rec.method,
        resolvedMethod: rec.method,
        breakevenQuantity: rec.breakevenQuantity,
        digitalTotalPrice: rec.digitalTotalPrice,
        gravureTotalPrice: rec.gravureTotalPrice,
        reason: rec.reason,
      }
      console.log('[calculateQuote] AUTO resolved →', rec.method, '(breakeven:', rec.breakevenQuantity, ')')
    }

    // キャッシュキー生成
    const cacheKey = this.generateCacheKey(params)

    console.log('[calculateQuote] CACHE CHECK:', {
      cacheKey: cacheKey,
      hasCache: this.cache.has(cacheKey),
    });

    // キャッシュ確認
    if (this.cache.has(cacheKey)) {
      console.log('[calculateQuote] CACHE HIT - returning cached result');
      const cached = { ...this.cache.get(cacheKey)! }
      // auto 解決情報はキャッシュに含まれない場合があるため再付与
      if (recommendation) cached.recommendation = recommendation
      return cached
    }

    console.log('[calculateQuote] CACHE MISS - performing calculation');

    // 무조건 SKU 모드로 계산（일반 모드는 삭제됨）
    const skuResult = await this.performSKUCalculation(params)

    // auto 解決情報を付与
    if (recommendation) skuResult.recommendation = recommendation

    // キャッシュ保存（コピー保存）
    this.cache.set(cacheKey, { ...skuResult })
    return skuResult
  }

  /**
   * 実際の計算実行
   */
  private async performCalculation(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    const {
      bagTypeId,
      materialId,
      width,
      height,
      depth = 0,
      quantity,
      thicknessSelection,
      thicknessMultiplier = 1.0,
      isUVPrinting = false,
      postProcessingOptions,
      // params.postProcessingMultiplierが渡された場合はそれを優先、渡されない場合はオプションから計算
      postProcessingMultiplier: paramsPostProcessingMultiplier,
      printingType = 'digital',
      printingColors = 1,
      doubleSided = false,
      deliveryLocation = 'domestic',
      urgency = 'standard',
      markupRate = 0.0, // 判断1(b)(C-1/H-19): 顧客別調整（0=変更なし・負=割引）。基準0.25は salesMargin 計算で加算
      materialWidth,
      filmLayers,
      // スパウトパウチ専用パラメータ
      spoutSize,
      spoutPosition
    } = params

    // Phase 2: 'auto' は calculateQuote で解決済みだが、本関数へ直接流入した場合の安全弁。
    // フィルム原価計算経路ではデジタル計算を適用。
    const resolvedPrintingType: 'digital' | 'gravure' = printingType === 'gravure' ? 'gravure' : 'digital'

    // postProcessingMultiplierの決定: 渡された値を優先、なければオプションから計算
    const postProcessingMultiplier = paramsPostProcessingMultiplier ?? (
      postProcessingOptions
        ? this.calculatePostProcessingMultiplier(postProcessingOptions)
        : CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER
    )

    logPriceCalculationDetail('後加工乗数', {
      後加工オプション: postProcessingOptions || 'なし',
      適用乗数: postProcessingMultiplier.toFixed(2)
    });

    // パラメータ検証
    this.validateParams(params)

    // 1. 素材費計算（初期値）
    let materialCost = await this.calculateMaterialCost(
      materialId,
      width,
      height,
      depth,
      bagTypeId,
      thicknessSelection,
      thicknessMultiplier
    )

    // 2. 加工費計算（ロールフィルムとパウチ製品で分離）
    let processingCost = 0
    if (bagTypeId === 'roll_film') {
      // ロールフィルム専用計算：ラミネート費 + スリッター費のみ
      // ドキュメント基準：docs/reports/calcultae/04-미터수_및_원가_계산.md

      // 原反幅(m)を取得
      const materialWidthM = determineMaterialWidth(width, params.materialId) / 1000

      // 材料別ロス量計算（ロールフィルム加工）
      const getProcessingLossMeters = (layers?: typeof filmLayers): number => {
        if (!layers || layers.length === 0) return 400; // デフォルト
        const hasAL = layers.some(layer => layer.materialId === 'AL');
        const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');
        // KRAFT材料は700mのロス、AL材料は400mのロス
        if (hasKraft) return 700;
        return hasAL ? 400 : 300;
      };
      const lossMeters = getProcessingLossMeters(filmLayers);

      // 総メートル数 = 注文長さ + ロス量
      const totalMeters = quantity + lossMeters

      // AL素材の有無でラミ単価を切替（2026-06-27 改定: AL有無2段階化）
      const hasALMaterial = filmLayers?.some(layer => layer.materialId === 'AL') ?? false
      const laminationPerM = hasALMaterial
        ? CONSTANTS.ROLL_FILM_LAMINATION_COST_PER_M_WITH_AL  // 80ウォン/m
        : CONSTANTS.ROLL_FILM_LAMINATION_COST_PER_M_NO_AL    // 65ウォン/m
      // ラミネート費(ウォン) = 原反幅(m) × 総メートル数 × ラミ単価 × 3回（4層構造）
      const laminationCostKRW = materialWidthM * totalMeters * laminationPerM * 3

      // スリッター費(ウォン) = MAX(30,000ウォン, 総メートル数 × 10ウォン/m)
      const slitterCostKRW = Math.max(CONSTANTS.ROLL_FILM_SLITTER_MIN_COST, totalMeters * CONSTANTS.ROLL_FILM_SLITTER_COST_PER_M)

      // 合計加工費（円換算: AC-22 集約ヘルパー）
      processingCost = convertKRWtoJPY(laminationCostKRW + slitterCostKRW)

      console.log('[Processing Cost] Roll film: lamination + slitter only', {
        materialWidthM,
        totalMeters,
        laminationCostKRW,
        slitterCostKRW,
        processingCost
      })
    } else {
      // パウチ製品：既存のcalculatePouchProcessingCostを使用
      processingCost = await this.calculatePouchProcessingCost(
        bagTypeId,
        width,
        quantity,
        postProcessingOptions
      )
      console.log('[Processing Cost] Pouch: using calculatePouchProcessingCost')
    }

    // 4. 設定費計算（削除：版代はなし）
    const setupCost = 0

    // 사용 미터수 계산 (피치 기반)
    // 1개당 필요 필름 장 = 폭(또는 높이)
    let pitch = width;
    if (bagTypeId.includes('t_shape') || bagTypeId.includes('m_shape') || bagTypeId.includes('box')) {
      pitch = height;
    }
    const pouchesPerMeter = 1000 / pitch;
    const theoreticalMeters = quantity / pouchesPerMeter;

    // ========================================
    // 확보량 계산 (商品タイプ別ルール適用)
    // docs/reports/calcultae/00-README.md 基準
    // ========================================
    let securedMeters: number;

    if (bagTypeId === 'roll_film') {
      // ロールフィルム: 1SKU → 500m, 2+SKU → 各300m, 50m単位
      const minMetersPerSku = 500; // single SKU
      if (theoreticalMeters <= minMetersPerSku) {
        securedMeters = minMetersPerSku;
      } else {
        securedMeters = Math.ceil(theoreticalMeters / 50) * 50;
      }
    } else {
      // パウチ商品: 最小確保量なし、1m単位
      // docs/reports/calcultae/시나리오_상세/02-소량생산_시나리오.md 参照
      // 例: 500個パウチ、理論メートル60m → 確保量60m
      securedMeters = Math.ceil(theoreticalMeters);
    }

    const totalUsedMeters = (bagTypeId === 'roll_film' ? quantity : securedMeters) + 400;

    // ========================================
    // 材料費の再計算（フィルム構造に基づく正しい計算）
    // ========================================
    // 製品幅に基づいて原反幅を決定
    const determinedMaterialWidth = determineMaterialWidth(width, params.materialId);
    const widthM = determinedMaterialWidth / 1000;

    // フィルム構造レイヤー（PET/AL/PET/LLDPE 4層構造）
    const defaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 }
    ];
    const layers = filmLayers || defaultLayers;
    const adjustedLayers = this.adjustLayersForThickness(layers, thicknessSelection);

    // 各レイヤーの材料費計算（ウォン）
    let materialCostKRW = 0;
    for (const layer of adjustedLayers) {
      // DB設定から素材価格と密度を取得、ない場合は定数を使用
      const defaultMaterialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
      const unitPrice = await this.getSetting(
        'film_material',
        `${layer.materialId}_unit_price`,
        defaultMaterialInfo?.unitPrice || 0
      );
      const density = await this.getSetting(
        'film_material',
        `${layer.materialId}_density`,
        defaultMaterialInfo?.density || 1.0
      );

      if (unitPrice > 0) {
        let weight: number;
        // Kraft等のgrammage指定材料: densityを使用せずgrammageを直接使用
        if (layer.grammage !== undefined) {
          weight = (layer.grammage / 1000) * widthM * totalUsedMeters;  // g/m² → kg/m²
        } else {
          const thicknessMm = layer.thickness / 1000;
          weight = thicknessMm * widthM * totalUsedMeters * density;
        }
        const cost = weight * unitPrice;
        materialCostKRW += cost;
      }
    }

    // 円換算（AC-22: 集約ヘルパーで統一）
    materialCost = convertKRWtoJPY(materialCostKRW);

    logPriceCalculationDetail('素材費計算', {
      パウチタイプ: bagTypeId,
      サイズ: `${width}×${height}${depth ? `×${depth}` : ''}mm`,
      数量: `${quantity.toLocaleString()}個`,
      原反幅: `${determinedMaterialWidth}mm (${widthM.toFixed(2)}m)`,
      総使用メートル: `${totalUsedMeters.toFixed(0)}m`,
      理論メートル: `${theoreticalMeters.toFixed(0)}m`,
      確保メートル: `${securedMeters.toFixed(0)}m`,
      素材費_KRW: `${materialCostKRW.toLocaleString()}ウォン`,
      素材費_JPY: `¥${materialCost.toLocaleString()}`
    });

    // 3. 印刷費計算
    // ロールフィルムの場合は、メートル数とフィルム幅を使用
    // パウチの場合は、使用メートル数を使用（ドキュメント仕様準拠）
    const printingCost = await this.calculatePrintingCost(
      resolvedPrintingType,
      printingColors,
      quantity,
      doubleSided,
      isUVPrinting,
      bagTypeId === 'roll_film' ? {
        lengthInMeters: quantity,  // quantityはロールフィルムの場合は長さ(m)
        filmWidthM: determineMaterialWidth(width, params.materialId) / 1000  // 製品幅から原反幅を決定してm単位に変換
      } : undefined,
      bagTypeId === 'roll_film' ? undefined : totalUsedMeters  // パウチの場合は使用メートル数を渡す
    )

    // ========================================
    // 3.5. マット印刷追加費計算
    // ========================================
    // マット印刷追加費(ウォン) = 原反幅(m) × 40ウォン/m × 長さ(m)
    // 原反幅: 590mm または 760mm（製品幅に応じて自動決定）
    // 例: 590mm原反、500m使用 = 0.59 × 40 × 500 = 11,800ウォン追加
    let mattePrintingCost = 0
    const hasMatteFinishing = postProcessingOptions?.includes('matte') ?? false
    const hasGlossyFinishing = postProcessingOptions?.includes('glossy') ?? false

    logPriceCalculationDetail('表面仕上げ', {
      マット仕上げ: hasMatteFinishing,
      光沢仕上げ: hasGlossyFinishing,
      選択オプション: postProcessingOptions
    })

    if (hasMatteFinishing) {
      // 原反幅（m）を取得
      const materialWidthM = determineMaterialWidth(width, params.materialId) / 1000

      // マット印刷追加費(ウォン) = 原反幅(m) × 40ウォン/m × 長さ(m)
      const matteCostKRW = materialWidthM * 40 * totalUsedMeters

      // エン換算（AC-22: 集約ヘルパーで統一）
      mattePrintingCost = convertKRWtoJPY(matteCostKRW)

      logPriceCalculationDetail('マット印刷追加費', {
        原反幅_m: `${materialWidthM}m`,
        使用メートル: `${totalUsedMeters.toFixed(0)}m`,
        追加費_KRW: `${matteCostKRW.toLocaleString()}ウォン`,
        追加費_JPY: `¥${mattePrintingCost.toLocaleString()}`
      })
    } else {
      logPriceCalculationDetail('光沢仕上げ', {
        note: 'マット印刷追加費は適用されません'
      })
    }

    // 5. 小量注文手数料計算
    const surcharge = this.calculateSmallLotSurcharge(
      quantity,
      bagTypeId,
      isUVPrinting
    )

    // 6. 中間計算（マット印刷追加費は除外）
    const subtotal = materialCost + processingCost + printingCost + surcharge

    // 7. 後加工乗数適用
    const postProcessingAdjustedTotal = subtotal * postProcessingMultiplier

    // 7.5. マット印刷追加費を乗算後に追加（乗数の影響を受けない）
    const totalWithMatteCost = postProcessingAdjustedTotal + mattePrintingCost

    // 8. 配送料計算
    // パウチ製品用フィルム構造レイヤーの準備（配送料計算用）
    const pouchDefaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 }
    ];
    const pouchLayers = filmLayers || pouchDefaultLayers;
    const adjustedPouchLayers = this.adjustLayersForThickness(pouchLayers, thicknessSelection);

    // ロールフィルム用パラメータの準備
    let rollFilmDeliveryParams: {
      lengthInMeters?: number;
      filmWidthM?: number;
      totalThickness?: number;
      layers?: FilmStructureLayer[];
    } | undefined;

    if (bagTypeId === 'roll_film') {
      const lengthInMeters = quantity;
      const productWidth = width;
      const determinedMaterialWidth = determineMaterialWidth(productWidth, params.materialId);
      const filmWidthM = determinedMaterialWidth / 1000;

      // フィルム構造レイヤー
      const defaultLayers: FilmStructureLayer[] = [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'PET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 80 }
      ];
      const layers = filmLayers || defaultLayers;
      const adjustedRollFilmLayers = this.adjustLayersForThickness(layers, thicknessSelection);

      // 総厚さ計算
      const totalThickness = adjustedRollFilmLayers.reduce((sum, layer) => sum + layer.thickness, 0);

      rollFilmDeliveryParams = {
        lengthInMeters,
        filmWidthM,
        totalThickness,
        layers: adjustedRollFilmLayers
      };
    }

    const deliveryCost = await this.calculateDeliveryCost(
      deliveryLocation,
      quantity,
      width,
      height,
      depth,
      materialId,
      bagTypeId,
      params.rollCount,
      rollFilmDeliveryParams,
      // パウチ製品用パラメータ
      bagTypeId !== 'roll_film' ? {
        filmLayers: adjustedPouchLayers,
        materialWidth: materialWidth as 590 | 760
      } : undefined
    )

    // 9. 最終価格計算
    // 計算式: docs/reports/tjfrP/old/原価計算.md 基づ
    //
    // Step 1: 基礎原価 + 製造者マージン = 製造者価格
    const baseCost = totalWithMatteCost; // 材料原価 + 印刷費 + 加工費 + マット印刷追加費
    // DB設定から製造者マージン率を取得（デフォルト40%）
    const manufacturerMargin = await this.getSetting('pricing', 'manufacturer_margin', CONSTANTS.MANUFACTURER_MARGIN);
    console.log('[UnifiedPricingEngine] manufacturerMargin:', manufacturerMargin, 'baseCost:', baseCost);
    const manufacturerPrice = baseCost * (1 + manufacturerMargin);

    // Step 2: 製造者価格 × 関税 = 輸入原価
    // 判断9 (C-13): 関税率をDB駆動化（getSetting・フォールバック=PRICING_CONSTANTS.DUTY_RATE=0.05・計算結果不変）
    const dutyRate = await this.getSetting('tax', 'import_duty', PRICING_CONSTANTS.DUTY_RATE);
    const importCost = manufacturerPrice * (1 + dutyRate);

    // Step 3: 小計 = 輸入原価 + 配送料 → 最終販売価格 = 小計 × (1 + 販売マージン)
    // ガイド準拠（AC-Q1）: 配送料も販売マージン計算対象
    //   docs/reports/calcultae/06-마진_및_최종가격.md:139
    //   最終価格 = (円貨製造者価格 + 関税 + 配送料) × 1.25（販売マージン25%・判断2）
    // DB設定から販売マージン率を取得（フォールバック=CONSTANTS.SALES_MARGIN=0.25 ガイド準拠）
    // 判断1(b)(C-1/H-19): 基準マージン(DB駆動0.25) + 顧客別markupRate(調整・0=変更なし・負=割引)
    const salesMargin = (await this.getSetting('pricing', 'default_markup_rate', CONSTANTS.SALES_MARGIN)) + markupRate;

    // AC-Q6/S1.1: :1115 の既存 subtotal（中間計算）と同名衝突を避けるため別名。
    // これは最終価格計算の「輸入原価+配送料」の小計（販売マージン乗算のベース）。
    const subtotalWithDelivery = importCost + deliveryCost;
    const total = subtotalWithDelivery * (1 + salesMargin);

    logPriceCalculationDetail('最終価格計算', {
      製造者価格: `¥${manufacturerPrice.toLocaleString()}`,
      輸入原価: `¥${importCost.toLocaleString()}`,
      配送料: `¥${deliveryCost.toLocaleString()}`,
      小計: `¥${subtotalWithDelivery.toLocaleString()}`,
      販売マージン率: `${(salesMargin * 100).toFixed(0)}%`,
      販売マージン額: `¥${(subtotalWithDelivery * salesMargin).toLocaleString()}`,
      最終販売価格: `¥${total.toLocaleString()}`,
      note: 'ガイド準拠: 配送料も販売マージン計算対象'
    });

    // 12. リードタイム計算
    const leadTimeDays = this.calculateLeadTime(
      urgency,
      quantity,
      isUVPrinting,
      postProcessingMultiplier > 1.0
    )

    // 13. 結果構成
    // AC-Q5: 100円単位切り上げに統一（performFilmCostCalculation:1445 と一致）
    const roundedTotal = Math.ceil(total / 100) * 100;
    const result: UnifiedQuoteResult = {
      unitPrice: Math.ceil((roundedTotal / quantity) * 10) / 10, // 小数点第1位まで切り上げ
      totalPrice: roundedTotal,
      currency: 'JPY',
      quantity,
      filmUsage: totalUsedMeters,
      materialWidth: materialWidth as 590 | 760 | undefined,  // 原反幅情報を追加 (型キャスト)
      breakdown: {
        material: Math.round(materialCost),
        processing: Math.round(processingCost),
        printing: Math.round(printingCost),
        setup: 0,
        discount: 0,
        delivery: Math.round(deliveryCost),
        subtotal: Math.round(subtotal),
        total: Math.round(total)
      },
      leadTimeDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日有効
      minOrderQuantity: bagTypeId === 'roll_film' ? 500 : CONSTANTS.MIN_ORDER_QUANTITY,
      // スマート見積互換性
      details: {
        fixedCost: 0,
        variableCostPerUnit: (materialCost + processingCost + printingCost) / quantity,
        surcharge,
        materialRate: this.getMaterialRate(materialId),
        area: width * height
      },
      // 厚さ情報
      thicknessMultiplier: thicknessMultiplier !== 1.0 ? thicknessMultiplier : undefined,
      selectedThicknessName: this.getSelectedThicknessName(materialId, thicknessSelection),
      // 後加工情報
      postProcessingMultiplier: postProcessingMultiplier !== 1.0 ? postProcessingMultiplier : undefined,
      // 最低価格適用フラグ
      minimumPriceApplied: total <= CONSTANTS.MINIMUM_PRICE
    }

    // 最終価格サマリーを表示
    logPriceSummary({
      quantity,
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      currency: 'JPY',
      breakdown: result.breakdown
    });

    return result
  }

  /**
   * 필름 원가 기반 계산 실행 (새로운 기능 - DB 연동)
   * docs/reports/tjfrP/필름 계산.md 기반
   */
  private async performFilmCostCalculation(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    const {
      bagTypeId,
      width,
      height,
      quantity,
      markupRate = CONSTANTS.DEFAULT_MARKUP_RATE,
      filmLayers,
      lossRate = CONSTANTS.DEFAULT_LOSS_RATE,
      isUVPrinting = false,
      postProcessingOptions,
      postProcessingMultiplier = postProcessingOptions ? this.calculatePostProcessingMultiplier(postProcessingOptions) : CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      urgency = 'standard'
    } = params

    // 製品幅に基づいて原反幅を動的に決定
    const materialWidth = determineMaterialWidth(width, params.materialId)

    // 파라미터 검증
    this.validateParams(params)

    // ========================================
    // DB 설정 로드 (5분 캐시)
    // ========================================
    const settings = await this.loadSystemSettings()

    // DB 설정값을 FilmCostSettings 형태로 변환
    const filmCostSettings: import('./film-cost-calculator').FilmCostSettings = {
      PET_unit_price: await this.getSetting('film_material', 'PET_unit_price', undefined),
      AL_unit_price: await this.getSetting('film_material', 'AL_unit_price', undefined),
      LLDPE_unit_price: await this.getSetting('film_material', 'LLDPE_unit_price', undefined),
      NY_unit_price: await this.getSetting('film_material', 'NY_unit_price', undefined),
      VMPET_unit_price: await this.getSetting('film_material', 'VMPET_unit_price', undefined),
      KRAFT_unit_price: await this.getSetting('film_material', 'KRAFT_unit_price', undefined),
      PET_density: await this.getSetting('film_material', 'PET_density', undefined),
      AL_density: await this.getSetting('film_material', 'AL_density', undefined),
      LLDPE_density: await this.getSetting('film_material', 'LLDPE_density', undefined),
      NY_density: await this.getSetting('film_material', 'NY_density', undefined),
      VMPET_density: await this.getSetting('film_material', 'VMPET_density', undefined),
      KRAFT_density: await this.getSetting('film_material', 'KRAFT_density', undefined),
      printing_cost_per_m2: await this.getSetting('printing', 'cost_per_m2', undefined),
      matte_cost_per_m: await this.getSetting('printing', 'matte_cost_per_m', undefined),
      lamination_cost_per_m2: await this.getSetting('lamination', 'cost_per_m2', undefined),
      lamination_cost_per_m2_with_al: await this.getSetting('lamination', 'cost_per_m2_with_al', undefined),
      slitter_cost_per_m: await this.getSetting('slitter', 'cost_per_m', undefined),
      slitter_min_cost: await this.getSetting('slitter', 'min_cost', undefined),
      exchange_rate_krw_to_jpy: await this.getSetting('exchange_rate', 'krw_to_jpy', undefined),
      duty_rate_import_duty: await this.getSetting('tax', 'import_duty', undefined),
      delivery_cost_per_roll: await this.getSetting('delivery', 'cost_per_roll', undefined),
      delivery_kg_per_roll: await this.getSetting('delivery', 'kg_per_roll', undefined),
      production_default_loss_rate: await this.getSetting('production', 'default_loss_rate', undefined),
      pricing_default_markup_rate: await this.getSetting('pricing', 'default_markup_rate', undefined),
      pricing_manufacturer_margin: await this.getSetting('pricing', 'manufacturer_margin', CONSTANTS.MANUFACTURER_MARGIN)
    }

    // ========================================
    // 1. 필름 원가 계산 (film-cost-calculator.ts 사용 - DB 설정값 전달)
    // ========================================
    const { filmCalculator } = await import('./film-cost-calculator')

    // 기본 레이어 설정 (PET/AL/LLDPE 3중지)
    const defaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: 80 }
    ]

    // filmLayers가 있으면 사용, 없으면 기본 레이어 사용
    const baseLayers = filmLayers || defaultLayers

    // 두께 선택에 따라 레이어 조정
    const { thicknessSelection } = params
    const adjustedLayers = this.adjustLayersForThickness(baseLayers, thicknessSelection)

    // 매트 인쇄 여부 확인 (postProcessingOptions에서 'matte' 확인)
    const hasMatteFinishing = postProcessingOptions?.includes('matte') ?? false

    // 필름 원가 계산 (DB 설정값 사용)
    // 매트 인쇄가 있으면 printingType을 'matte'로 설정하여 추가 비용 계산
    const filmCostResult = filmCalculator.calculateCostWithDBSettings({
      layers: adjustedLayers,
      width,
      length: quantity, // 수량을 미터로 해석
      lossRate,
      hasPrinting: true, // 기본 인쇄 포함
      printingType: hasMatteFinishing ? 'matte' : 'basic', // 매트 인쇄 시 'matte' 타입 사용
      colors: 1,
      materialWidth,
      postProcessingOptions  // 表面処理オプションを渡す (glossy等)
    }, filmCostSettings)

    // ========================================
    // 2. 파우치 가공비 계산
    // ========================================
    const pouchProcessingCost = await this.calculatePouchProcessingCost(
      bagTypeId,
      width,
      quantity,
      postProcessingOptions
    )

    // ========================================
    // 3. 기본 원가 계산 (필름 + 파우치 가공비)
    // ========================================
    // 필름 미터당 단가 × 수량
    const filmCostTotalJPY = filmCostResult.costPerMeterJPY * quantity

    // 기본 원가 = 필름 원가 + 파우치 가공비
    const baseCost = filmCostTotalJPY + pouchProcessingCost

    // ========================================
    // 4. 後加工乗率適用
    // ========================================
    const postProcessingAdjustedBaseCost = baseCost * postProcessingMultiplier

    // ========================================
    // 5. 配送料計算
    // ========================================
    // 配送料は後で追加（マージン計算には含まない）
    // 基本配送料 (50,000円以上無料) - パウチのみ適用
    let deliveryCost = 0
    if (postProcessingAdjustedBaseCost < 50000) {
      deliveryCost = 1500 // 基本配送料
    }

    // ========================================
    // 6. 最終価格計算
    // ========================================
    // 計算式: docs/reports/tjfrP/old/原価計算.md 基づ
    //
    // Step 1: 基礎原価 + 製造者マージン = 製造者価格
    const manufacturerPrice = postProcessingAdjustedBaseCost * (1 + filmCostSettings.pricing_manufacturer_margin);

    // Step 2: 製造者価格 × 関税 = 輸入原価
    // 判断9 (C-13): filmCostSettings の関税率（DB駆動・フォールバック=PRICING_CONSTANTS.DUTY_RATE=0.05・計算結果不変）
    const dutyRate = filmCostSettings.duty_rate_import_duty ?? PRICING_CONSTANTS.DUTY_RATE;
    const importCost = manufacturerPrice * (1 + dutyRate);

    // Step 3: 小計 = 輸入原価 + 配送料 → 最終販売価格 = 小計 × (1 + 販売マージン)
    // ガイド準拠（AC-Q1）: 配送料も販売マージン計算対象
    //   docs/reports/calcultae/06-마진_및_최종가격.md:139
    //   最終価格 = (円貨製造者価格 + 関税 + 配送料) × 1.25（販売マージン25%・判断2）
    // 顧客別マークアップ率を適用（デフォルト0%、負の値は割引）
    const salesMargin = markupRate;  // 顧客別マージン率を適用

    // ガイド準拠: 配送料も販売マージン計算対象
    const subtotalFilm = importCost + deliveryCost;
    const totalPrice = subtotalFilm * (1 + salesMargin);

    // ========================================
    // 最小価格適用は無効化（ドキュメント通りの計算のみ）
    // ========================================
    // totalPrice = Math.max(totalPrice, CONSTANTS.MINIMUM_PRICE);
    let unitPrice = totalPrice / quantity

    // マークアップ適用情報を計算（顧客別マージン率を適用）
    const salesMarginRate = markupRate; // 顧客別マージン率を適用
    const markedUpPrice = postProcessingAdjustedBaseCost * (1 + salesMarginRate);
    const markupAmount = markedUpPrice - postProcessingAdjustedBaseCost;

    // ========================================
    // 9. 리드타임 계산
    // ========================================
    const leadTimeDays = this.calculateLeadTime(
      urgency,
      quantity,
      isUVPrinting,
      postProcessingMultiplier > 1.0
    )

    // ========================================
    // 10. 결과 구성
    // ========================================
    // totalPrice を先に丸めてから unitPrice を計算することで、
    // unitPrice * totalQuantity === totalPrice を保証
    // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
    // 小数点以下を含む場合: 168400.646... → 168500
    // totalPrice を先に丸めてから unitPrice を計算することで、
    // unitPrice * totalQuantity === totalPrice を保証
    // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
    // 小数点以下を含む場合: 168400.646... → 168500
    const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;

    // Security: Rounding details only logged in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[100円丸め] 丸め前 totalPrice:', totalPrice, '(型:', typeof totalPrice, ')');
      console.log('[100円丸め] 丸め後 roundedTotalPrice:', roundedTotalPrice, '(差分:', roundedTotalPrice - totalPrice, ')');
      console.log('[100円丸め] 計算式: Math.ceil(', totalPrice, '/ 100) * 100 =', Math.ceil(totalPrice / 100), '* 100 =', roundedTotalPrice);
    }
    // 単価は小数点第1位まで切り上げ（要件: 単価1桁切り上げ）。
    // 100円単位で切り上げた totalPrice から unitPrice を算出し、第1位で切り上げ。
    // ※切り上げの性質上、単価×数量が totalPrice と数円単位でズレる場合あり。
    unitPrice = Math.ceil((roundedTotalPrice / quantity) * 10) / 10;
    const result: UnifiedQuoteResult = {
      unitPrice: unitPrice,
      totalPrice: roundedTotalPrice,
      currency: 'JPY',
      quantity,
      filmUsage: filmCostResult.totalWeight > 0 ? filmCostResult.rollCount * 500 : 0, // Approx? Or totalMeters?
      filmCostDetails: filmCostResult,
      breakdown: {
        material: Math.round(filmCostTotalJPY),
        processing: Math.round(pouchProcessingCost),
        printing: 0, // 필름 원가에 포함됨
        setup: 0,
        discount: 0,
        delivery: Math.round(deliveryCost),
        subtotal: Math.round(baseCost),
        total: Math.round(totalPrice),
        // 필름 원가 계산 상세
        filmCost: Math.round(filmCostTotalJPY),
        pouchProcessingCost: Math.round(pouchProcessingCost),
        baseCost: Math.round(baseCost)
      },
      leadTimeDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      minOrderQuantity: bagTypeId === 'roll_film' ? 500 : CONSTANTS.MIN_ORDER_QUANTITY,
      details: {
        fixedCost: 0,
        variableCostPerUnit: unitPrice,
        surcharge: 0,
        materialRate: 1.4,
        area: width * height
      },
      postProcessingMultiplier: postProcessingMultiplier !== 1.0 ? postProcessingMultiplier : undefined,
      minimumPriceApplied: markedUpPrice < CONSTANTS.MINIMUM_PRICE,
      markupApplied: {
        rate: salesMarginRate, // 全製品20%で統一（ドキュメント準拠）
        baseCost: Math.round(postProcessingAdjustedBaseCost),
        markupAmount: Math.round(markupAmount)
      }
    }

    return result
  }

  /**
   * SKU別原価計算実行 (새로운 기능)
   * docs/reports/tjfrP/原価計算.md 基づ
   * ロス400m固定、最小確保量ルール適用
   */
  private async performSKUCalculation(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    console.log('[performSKUCalculation] ENTRY:', {
      markupRate_param: params.markupRate,
      markupRate_will_default_to: params.markupRate ?? 0.0,
      skuQuantities: params.skuQuantities,
    });

    const {
      bagTypeId,
      width,
      height,
      depth = 0,
      skuQuantities = [params.quantity], // デフォルトは1SKU
      thicknessSelection,
      thicknessMultiplier = 1.0,
      isUVPrinting = false,
      postProcessingOptions,
      postProcessingMultiplier = postProcessingOptions ? this.calculatePostProcessingMultiplier(postProcessingOptions) : CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      urgency = 'standard',
      markupRate = 0.0,  // デフォルトは調整なし（PouchCostCalculatorですでに販売マージン25%が含まれているため・判断2）
      materialWidth = CONSTANTS.DEFAULT_MATERIAL_WIDTH,
      filmLayers,
      // スパウトパウチ専用パラメータ
      spoutSize,
      spoutPosition
    } = params

    console.log('[performSKUCalculation] AFTER DESTRUCTURING:', {
      markupRate_used: markupRate,
      spoutSize,
      spoutSizeType: typeof spoutSize,
      spoutPosition,
      bagTypeId
    });

    // パラメータ検証
    this.validateParams(params)

    // ========================================
    // ロールフィルムの場合は通常の計算ロジックを使用
    // ========================================
    if (bagTypeId === 'roll_film') {
      // ロールフィルムの場合、totalQuantityをメートル数として使用
      const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0);

      // 通常の計算ロジックを使用
      const result = await this.performCalculation({
        ...params,
        quantity: totalQuantity,
        useSKUCalculation: false // SKU計算を無効化
      });

      return result;
    }

    // ========================================
    // グラビア印刷専用ブランチ（Phase 1c・AC-22/Critic Critical#1）
    // performCalculation には転送せず、performSKUCalculation 内で独立計算。
    // デジタル（既定）はこのブロックをスキップし、下位の pouch-cost-calculator 経路へ（後方互換）。
    // ========================================
    if (params.printingType === 'gravure') {
      return await this.performGravureSKUCalculation(params)
    }

    // ========================================
    // SKU原価計算 (pouch-cost-calculator.ts 사용)
    // ========================================
    const { pouchCostCalculator } = await import('./pouch-cost-calculator')

    // パウチ寸法
    const dimensions: PouchDimensions = {
      width,
      height,
      depth
    }

    // pouchType 매핑 (bagTypeId를 올바른 pouchType으로 변환)
    const mappedPouchType = this.mapToPouchType(bagTypeId, postProcessingOptions)

    // SKU原価計算
    const skuCostResult = await pouchCostCalculator.calculateSKUCost({
      skuQuantities,
      dimensions,
      materialId: params.materialId,
      thicknessSelection: thicknessSelection || 'medium',
      pouchType: mappedPouchType,
      filmLayers,
      postProcessingOptions,
      markupRate,  // 顧客別マークアップ率を適用
      // スパウトパウチ専用パラメータ
      spoutSize: params.spoutSize,
      spoutPosition: params.spoutPosition
    })

    // 総数量計算
    const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0)

    // 総原価（既に最終販売価格として計算済み）
    // PouchCostCalculator.calculateCostBreakdownですでに以下が適用されています：
    // - 製造者マージン40%
    // - 円貨換算（×0.12）
    // - 関税5%（円貨で計算）
    // - 配送料（円貨で計算、15,358円）
    // - 販売マージン25%（円貨で計算・判断2）
    const baseCost = skuCostResult.totalCostJPY

    // ========================================
    // 後加工乗数適用
    // ========================================
    const postProcessingAdjustedBaseCost = baseCost * postProcessingMultiplier

    // ========================================
    // 最終価格計算
    // ========================================
    // PouchCostCalculatorですでに最終販売価格が計算されています：
    // - 製造者マージン40%
    // - 円貨換算（×0.12）
    // - 関税5%
    // - 配送料（重量ベースで既に計算済み）
    // - 販売マージン25%（判断2）
    //
    // そのため、追加のマージン計算や配送料計算は不要です。
    // 後加工乗数のみ適用します。
    let totalPrice = postProcessingAdjustedBaseCost;

    // ========================================
    // マット印刷追加費計算
    // ========================================
    // マット印刷追加費(ウォン) = 原反幅 × 40ウォン/m × 長さ
    // 原反幅: 590mm または 760mm（製品幅に応じて自動決定）

    // デバッグログ: postProcessingOptionsの内容を確認
    logPriceCalculationDetail('SKU後加工オプション', {
      後加工オプション: postProcessingOptions || 'なし',
      マット仕上げ: postProcessingOptions?.includes('matte') ?? false,
      光沢仕上げ: postProcessingOptions?.includes('glossy') ?? false
    });

    const hasMatteFinishing = postProcessingOptions?.includes('matte') ?? false
    const hasGlossyFinishing = postProcessingOptions?.includes('glossy') ?? false

    if (hasMatteFinishing) {
      // 原反幅（m）を取得
      const materialWidthM = determineMaterialWidth(width, params.materialId) / 1000

      // 総使用メートル数（ロス含む）
      const totalUsedMeters = skuCostResult.summary.totalWithLossMeters

      // マット印刷追加費(ウォン) = 原反幅 × 40ウォン/m × 長さ
      const matteCostKRW = materialWidthM * 40 * totalUsedMeters

      // 円換算（AC-22: 集約ヘルパーで統一）
      const mattePrintingCostJPY = convertKRWtoJPY(matteCostKRW)

      logPriceCalculationDetail('SKUマット印刷追加費', {
        原反幅_m: `${materialWidthM}m`,
        総使用メートル: `${totalUsedMeters.toFixed(0)}m`,
        追加費_KRW: `${matteCostKRW.toLocaleString()}ウォン`,
        追加費_JPY: `¥${mattePrintingCostJPY.toLocaleString()}`
      })

      // 追加費を総価格に加算
      totalPrice += mattePrintingCostJPY
    } else {
      console.log('[SKU Calculation - Using Glossy Finish]', {
        hasGlossyFinishing,
        note: 'マット印刷追加費は適用されません'
      })
    }

    // ========================================
    // SKU数量に基づく追加料金計算
    // ========================================
    // 1 SKU: ¥0, 2 SKUs: ¥10,000, 3 SKUs: ¥20,000
    // 計算式: (skuCount - 1) × ¥10,000
    const skuCount = skuQuantities.length;
    const skuSurcharge = Math.max(0, (skuCount - 1) * 10000);

    logPriceCalculationDetail('SKU追加料金', {
      SKU数: skuCount,
      追加料金: `¥${skuSurcharge.toLocaleString()}`,
      計算式: `(${skuCount} - 1) × ¥10,000 = ¥${skuSurcharge.toLocaleString()}`
    });

    // 追加料金を総価格に加算
    totalPrice += skuSurcharge;

    // 最小価格適用は無効化（ドキュメント通りの計算のみ）
    // totalPrice = Math.max(totalPrice, CONSTANTS.MINIMUM_PRICE);

    // ========================================
    // リードタイム計算
    // ========================================
    const leadTimeDays = this.calculateLeadTime(
      urgency,
      totalQuantity,
      isUVPrinting,
      postProcessingMultiplier > 1.0
    )

    // ========================================
    // 結果構成
    // ========================================
    // totalPrice を先に丸めてから unitPrice を計算することで、
    // unitPrice * totalQuantity === totalPrice を保証
    // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
    // 小数点以下を含む場合: 168400.646... → 168500
    // totalPrice を先に丸めてから unitPrice を計算することで、
    // unitPrice * totalQuantity === totalPrice を保証
    // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
    // 小数点以下を含む場合: 168400.646... → 168500
    const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;

    // Security: Rounding details only logged in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[100円丸め] 丸め前 totalPrice:', totalPrice, '(型:', typeof totalPrice, ')');
      console.log('[100円丸め] 丸め後 roundedTotalPrice:', roundedTotalPrice, '(差分:', roundedTotalPrice - totalPrice, ')');
      console.log('[100円丸め] 計算式: Math.ceil(', totalPrice, '/ 100) * 100 =', Math.ceil(totalPrice / 100), '* 100 =', roundedTotalPrice);
    }
    // unitPriceは小数点まで保持して、API側で正確な計算ができるようにする
    // Math.round()を使用すると354.94→355になり、30円の誤差が発生するため小数点を保持
    const unitPrice = roundedTotalPrice / totalQuantity;
    // Generate filmCostDetails from skuCostResult for admin UI display
    const filmCostDetails = this.buildFilmCostDetailsFromSKUCostResult(skuCostResult);

    const result: UnifiedQuoteResult = {
      unitPrice: unitPrice,
      totalPrice: roundedTotalPrice,
      currency: 'JPY',
      quantity: totalQuantity,
      skuCount: skuQuantities.length,
      skuQuantities: skuQuantities,
      hasValidSKUData: true,
      filmUsage: skuCostResult.summary.totalWithLossMeters,
      filmCostDetails,  // Include filmCostDetails for admin UI
      breakdown: {
        // 素材費（フィルム材料費のみ）
        filmCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.materialCost, 0)),
        // ラミネーション費
        laminationCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.laminationCost, 0)),
        // スリッター費
        slitterCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.slitterCost, 0)),
        // 素材費合計（フィルム＋ラミネーション＋スリッター）
        material: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.materialCost + sku.costBreakdown.laminationCost + sku.costBreakdown.slitterCost, 0)),
        processing: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.pouchProcessingCost, 0)),
        printing: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.printingCost, 0)),
        setup: 0,
        discount: 0,
        // マージン・関税・配送料: pouch-cost-calculator が各SKU単位で正確計算した値を集計。
        // （旧実装は baseCost * 固定係数 の概算だったが、baseCost は既に最終販売価格ベースのため不正確。
        //  costPerSKU[].costBreakdown の正確値〔manufacturingMargin=製造者価格-baseCost, duty=製造者価格*0.05,
        //  delivery=重量ベース実配送費, salesMargin=小計*0.25〕を reduce で集計する）
        manufacturingMargin: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + (sku.costBreakdown.manufacturingMargin || 0), 0)),
        duty: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.duty, 0)),
        delivery: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.delivery, 0)),
        salesMargin: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + (sku.costBreakdown.salesMargin || 0), 0)),
        subtotal: Math.round(baseCost),
        total: Math.round(totalPrice),
        pouchProcessingCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.pouchProcessingCost, 0)),
        baseCost: Math.round(baseCost),
        // SKU追加料金（SKU数量に基づく追加料金）
        skuSurcharge: skuSurcharge,
        // 表面処理費（マット印刷追加費等）
        surfaceTreatmentCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + (sku.costBreakdown.surfaceTreatmentCost || 0), 0))
      },
      leadTimeDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      minOrderQuantity: bagTypeId === 'roll_film' ? 500 : CONSTANTS.MIN_ORDER_QUANTITY,
      details: {
        fixedCost: 0,
        variableCostPerUnit: unitPrice,
        surcharge: skuSurcharge,
        materialRate: 1.4,
        area: width * height
      },
      thicknessMultiplier: thicknessMultiplier !== 1.0 ? thicknessMultiplier : undefined,
      selectedThicknessName: this.getSelectedThicknessName(params.materialId, thicknessSelection),
      postProcessingMultiplier: postProcessingMultiplier !== 1.0 ? postProcessingMultiplier : undefined,
      minimumPriceApplied: totalPrice <= CONSTANTS.MINIMUM_PRICE,
      skuCostDetails: skuCostResult,
      // 필름 폭 계산 정보
      calculatedFilmWidth: skuCostResult.calculatedFilmWidth,
      materialWidth: skuCostResult.materialWidth as unknown as (590 | 760),
      theoreticalMeters: skuCostResult.costPerSKU[0]?.theoreticalMeters,
      securedMeters: skuCostResult.summary.totalSecuredMeters,
      totalMeters: skuCostResult.summary.totalWithLossMeters
    }

    return result
  }

  /**
   * グラビア印刷専用SKU計算（Phase 1c・AC-22準拠）
   *
   * 仕様: docs/gravure-pricing-calculation-formula.md §1-14
   * - 純粋計算は gravure-cost-calculator.ts が行い「ウォン」を返す
   * - 円変換・マージン・関税はデジタルと共通の集約パターン（AC-22）
   * - ロス500m固定（仕様§4）、製作長は gravureProductionMeters or STANDARD_LOT(6000m)
   * - 銅版費は別途計上（copperPlateType !== 'none' の場合のみ加算）
   *
   * 後方互換性: printingType !== 'gravure' の場合は呼出されない（performSKUCalculation でガード済み）。
   *
   * @param params printingType='gravure' を含む見積パラメータ
   */
  private async performGravureSKUCalculation(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    // 多列生産列数（グラビア 2/3/4列）。計画 multi-column-gravure-unification.md AC6/AC1
    // - 材料費(calculateGravureFilmValue)は原反幅ベースで触らない（マージン逆転防止の構造的根拠）
    // - 銅版費のみ columnCount で除算（グラビアには独立したセットアップ費項目が存在しないため除算対象外。銅版1セットでN列分印刷可能）
    const columnCount = params.columnCount && params.columnCount > 1 ? params.columnCount : 1

    const {
      bagTypeId,
      width,
      height,
      depth = 0,
      skuQuantities = [params.quantity],
      printingColors = 1,
      urgency = 'standard',
      postProcessingOptions,
      postProcessingMultiplier = postProcessingOptions ? this.calculatePostProcessingMultiplier(postProcessingOptions) : CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      deliveryLocation = 'domestic',
      markupRate = 0.0, // 判断1(b)(C-1/H-19): 顧客別調整（0=変更なし・負=割引）
    } = params

    // グラビア必須パラメータのバリデーション
    if (!params.filmLayers || params.filmLayers.length === 0) {
      throw new Error('グラビア計算には filmLayers（フィルム構造）が必須です。')
    }
    if (!params.gravureMaterialWidth || params.gravureMaterialWidth <= 0) {
      throw new Error('グラビア計算には gravureMaterialWidth（原反幅 mm）が必須です。')
    }

    const materialWidthMm = params.gravureMaterialWidth
    const colors = printingColors
    const layers = params.filmLayers

    // 製作長: gravureProductionMeters or 標準ロット6000m（仕様§4/§10.4）
    // ※ グラビアのロス500mは製作長に含まれる前提（純粋計算モジュールは製作長をそのまま使用）
    const productionMeters = params.gravureProductionMeters && params.gravureProductionMeters > 0
      ? params.gravureProductionMeters
      : GRAVURE_CONSTANTS.STANDARD_LOT_METERS

    // ========================================
    // 1. グラビア純粋計算（ウォン）— gravure-cost-calculator.ts
    // ========================================
    const filmValueKRW = calculateGravureFilmValue(
      layers,
      materialWidthMm,
      productionMeters,
      colors,
    )

    // 銅版費（別途計上・仕様§9。copperPlateType='none' でなければ加算）
    const copperPlateType = params.copperPlateType ?? 'new'
    let copperPlateCostKRW = 0
    if (copperPlateType !== 'none') {
      copperPlateCostKRW = calculateCopperPlateCost(colors, materialWidthMm, copperPlateType === 'modify')
    }

    // 多列生産: 銅版費を列数で除算（計画 AC6/AC1）
    // グラビアには独立したセットアップ費項目が存在しないため除算対象は銅版費のみ。
    // 銅版1セットでN列分印刷可能なため、固定費を列数で按分。材料費は原反幅ベースで触らない。
    const effectiveCopperPlateCostKRW = columnCount > 1 ? copperPlateCostKRW / columnCount : copperPlateCostKRW

    // グラビア基礎原価（ウォン）= 原反値 + 銅版費(列数除算済)
    const baseCostKRW = filmValueKRW.total + effectiveCopperPlateCostKRW

    // SKU数量合計（配送・単価計算で使用）
    const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0)

    // ========================================
    // 2. 円変換（AC-22: 集約ヘルパー convertKRWtoJPY で統一）
    // ========================================
    const baseCostJPY = convertKRWtoJPY(baseCostKRW)

    // ========================================
    // 3. マージン・関税・配送（デジタルと共通の集約パターン・AC-22）
    //    Step1: 基礎原価 × (1 + 製造者マージン[0.4]) = 製造者価格
    //    Step2: 製造者価格 × 1.05（関税5%）= 輸入原価
    //    Step3: (輸入原価 + 配送料) × (1 + 販売マージン[0.25]) = 最終価格（判断2）
    // ========================================
    const manufacturerMargin = await this.getSetting('pricing', 'manufacturer_margin', CONSTANTS.MANUFACTURER_MARGIN)
    const manufacturerPriceJPY = baseCostJPY * (1 + manufacturerMargin)
    // 判断9 (C-13): 関税率をDB駆動化（フォールバック=PRICING_CONSTANTS.DUTY_RATE=0.05・計算結果不変）
    const dutyRate = await this.getSetting('tax', 'import_duty', PRICING_CONSTANTS.DUTY_RATE)
    const importCostJPY = manufacturerPriceJPY * (1 + dutyRate)

    // 配送料（グラビアも既存の配送計算を利用）
    const deliveryCostJPY = await this.calculateDeliveryCost(
      deliveryLocation,
      totalQuantity,
      width,
      height,
      depth,
      params.materialId,
      bagTypeId,
    )

    // 判断1(b)(C-1/H-19): 基準マージン(DB駆動0.25) + 顧客別markupRate(調整・0=変更なし・負=割引)
    const salesMargin = (await this.getSetting('pricing', 'default_markup_rate', CONSTANTS.SALES_MARGIN)) + markupRate
    const subtotalWithDeliveryJPY = importCostJPY + deliveryCostJPY
    const totalPriceJPY = subtotalWithDeliveryJPY * (1 + salesMargin)

    // 後加工乗数（マット等）適用
    const finalTotalPriceJPY = totalPriceJPY * postProcessingMultiplier

    // ========================================
    // 4. 単価計算（SKU数量ベース・100円丸め）
    // ========================================
    // デジタル袋（performSKUCalculation L1782/L1792）と同じ100円丸め（判断1(b)/案A・経路間丸め統一）。
    // 丸め後に unitPrice を逆算し unitPrice * totalQuantity === totalPrice を保証。
    const roundedTotalPrice = Math.ceil(finalTotalPriceJPY / 100) * 100
    const unitPrice = totalQuantity > 0 ? roundedTotalPrice / totalQuantity : roundedTotalPrice

    // リードタイム
    const leadTimeDays = this.calculateLeadTime(
      urgency,
      totalQuantity,
      false,
      !!(postProcessingOptions && postProcessingOptions.length > 0),
    )

    // ========================================
    // 5. 結果構築
    // ========================================
    const result: UnifiedQuoteResult = {
      unitPrice: unitPrice,
      totalPrice: roundedTotalPrice,
      currency: 'JPY',
      breakdown: {
        filmCost: Math.round(convertKRWtoJPY(filmValueKRW.materialCost)),
        material: Math.round(convertKRWtoJPY(filmValueKRW.materialCost)),
        printing: Math.round(convertKRWtoJPY(filmValueKRW.printingCost)),
        laminationCost: Math.round(convertKRWtoJPY(filmValueKRW.laminationCost)),
        processing: 0, // グラビア原反値には加工費含まず（ロール前提）。パウチ加工は別途Phase 3
        setup: Math.round(convertKRWtoJPY(effectiveCopperPlateCostKRW)),
        // 多列割引相当額（AC3 breakdown 開示）: 1列基準の銅版費と列数除算後の差分
        discount: columnCount > 1 ? Math.round(convertKRWtoJPY(copperPlateCostKRW - effectiveCopperPlateCostKRW)) : 0,
        delivery: Math.round(deliveryCostJPY),
        manufacturingMargin: Math.round(manufacturerPriceJPY - baseCostJPY),
        duty: Math.round(importCostJPY - manufacturerPriceJPY),
        salesMargin: Math.round(subtotalWithDeliveryJPY * salesMargin),
        subtotal: Math.round(subtotalWithDeliveryJPY),
        total: roundedTotalPrice,
        baseCost: Math.round(baseCostJPY),
        // グラビア専用内訳（ウォン）
        gravureFilmValueKRW: Math.round(filmValueKRW.total),
        gravureMaterialCostKRW: Math.round(filmValueKRW.materialCost),
        gravurePrintingCostKRW: Math.round(filmValueKRW.printingCost),
        gravureLaminationCostKRW: Math.round(filmValueKRW.laminationCost),
        gravureCopperPlateCostKRW: Math.round(copperPlateCostKRW),
        gravureProductionMeters: productionMeters,
        gravureMaterialWidthMM: materialWidthMm,
      },
      leadTimeDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日有効
      minOrderQuantity: bagTypeId === 'roll_film' ? GRAVURE_CONSTANTS.LOSS_METERS : CONSTANTS.MIN_ORDER_QUANTITY,
      quantity: totalQuantity,
      details: {
        fixedCost: Math.round(convertKRWtoJPY(copperPlateCostKRW)),
        variableCostPerUnit: 0,
        surcharge: 0,
        materialRate: layers[0] ? (UnifiedPricingEngine.MATERIAL_PRICES_KRW as Record<string, { unitPrice: number }>)[layers[0].materialId]?.unitPrice ?? 0 : 0,
        area: width * height,
      },
    }

    return result
  }

  // ========================================
  // Phase 2: 印刷方式自動選択（分岐点レコメンド・AC-8/9/10）
  // SSoT: docs/gravure-pricing-calculation-formula.md §14
  // ========================================

  /**
   * 印刷方式レコメンド結果（AC-8）
   */
  async recommendPrintingMethod(
    params: UnifiedQuoteParams
  ): Promise<{
    method: 'digital' | 'gravure'
    breakevenQuantity: number
    digitalTotalPrice: number
    gravureTotalPrice: number
    reason: string
  }> {
    // グラビア計算の必須パラメータが揃っているか確認（揃わない場合はデジタル推奨）
    const gravureReady = !!(
      params.filmLayers &&
      params.filmLayers.length > 0 &&
      params.gravureMaterialWidth &&
      params.gravureMaterialWidth > 0
    )

    // デジタル価格を取得（performSKUCalculation の digital 経路）
    const digitalResult = await this.calculateMethodPrice({ ...params, printingType: 'digital' })
    const digitalTotalPrice = digitalResult.totalPrice

    // グラビア価格（必須パラメータ不足時は計算不可 → デジタル推奨）
    let gravureTotalPrice = Number.POSITIVE_INFINITY
    if (gravureReady) {
      try {
        const gravureResult = await this.calculateMethodPrice({ ...params, printingType: 'gravure' })
        gravureTotalPrice = gravureResult.totalPrice
      } catch {
        gravureTotalPrice = Number.POSITIVE_INFINITY
      }
    }

    // 分岐点探索（§14: digital総価 = gravure総価 となる数量 Q）
    const breakevenQuantity = gravureReady
      ? await this.findBreakevenQuantity(params)
      : Number.POSITIVE_INFINITY

    // 推奨決定（安い方）
    const method: 'digital' | 'gravure' = digitalTotalPrice <= gravureTotalPrice ? 'digital' : 'gravure'

    const reason = this.buildRecommendationReason({
      method,
      digitalTotalPrice,
      gravureTotalPrice,
      breakevenQuantity,
      requestQuantity: params.skuQuantities?.reduce((a, b) => a + b, 0) ?? params.quantity ?? 0,
      gravureReady,
    })

    return {
      method,
      breakevenQuantity: Number.isFinite(breakevenQuantity) ? Math.round(breakevenQuantity) : -1,
      digitalTotalPrice: Math.round(digitalTotalPrice),
      gravureTotalPrice: Number.isFinite(gravureTotalPrice) ? Math.round(gravureTotalPrice) : -1,
      reason,
    }
  }

  /**
   * 指定印刷方式で実際に価格計算を実行し totalPrice を返す。
   * printingType='digital' → performSKUCalculation の digital 経路
   * printingType='gravure' → performGravureSKUCalculation
   *
   * ※ キャッシュを経由しない（推奨計算用・一時計算）。
   */
  private async calculateMethodPrice(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    // printingType に応じて performSKUCalculation 内で分岐（gravure → performGravureSKUCalculation）
    return await this.performSKUCalculation(params)
  }

  /**
   * 分岐点数量を二分探索で求める（§14）。
   * 仕様を固定し、数量のみを変動させて digital vs gravure の totalPrice が逆転する点を探索。
   *
   * @returns 分岐点数量（個）。グラビアが常に高ければ Infinity。
   */
  private async findBreakevenQuantity(params: UnifiedQuoteParams): Promise<number> {
    const LOW = 500
    const HIGH = 100000 // validateParams の最大注文数量（10万個）に準拠
    const MAX_ITER = 24

    // 探索用に単一数量（非SKU）に正規化
    const buildParams = (quantity: number): UnifiedQuoteParams => ({
      ...params,
      quantity,
      skuQuantities: [quantity],
      useSKUCalculation: true,
    })

    const priceAt = async (quantity: number): Promise<{ d: number; g: number }> => {
      const p = buildParams(quantity)
      let d = Number.POSITIVE_INFINITY
      let g = Number.POSITIVE_INFINITY
      try {
        d = (await this.calculateMethodPrice({ ...p, printingType: 'digital' })).totalPrice
      } catch {
        d = Number.POSITIVE_INFINITY
      }
      try {
        g = (await this.calculateMethodPrice({ ...p, printingType: 'gravure' })).totalPrice
      } catch {
        g = Number.POSITIVE_INFINITY
      }
      return { d, g }
    }

    // LOW で既にグラビア有利なら分岐点は LOW 未満（最小ロット未満）
    const lowDiff = await priceAt(LOW)
    if (lowDiff.g <= lowDiff.d) {
      return LOW
    }
    // HIGH でもデジタル有利なら（実務的には稀）分岐点は HIGH 超過
    const highDiff = await priceAt(HIGH)
    if (highDiff.g >= highDiff.d) {
      return Number.POSITIVE_INFINITY
    }

    // 単調減少（数量↑でグラビア相対有利）を仮定した二分探索
    let lo = LOW
    let hi = HIGH
    for (let i = 0; i < MAX_ITER && hi - lo > 1; i++) {
      const mid = Math.floor((lo + hi) / 2)
      const midDiff = await priceAt(mid)
      // digital <= gravure → まだデジタル有利 → 分岐点はより大
      if (midDiff.d <= midDiff.g) {
        lo = mid
      } else {
        hi = mid
      }
    }
    return hi
  }

  /**
   * レコメンド理由文を構築（AC-9: 推奨表示＋理由/分岐点）。
   */
  private buildRecommendationReason(args: {
    method: 'digital' | 'gravure'
    digitalTotalPrice: number
    gravureTotalPrice: number
    breakevenQuantity: number
    requestQuantity: number
    gravureReady: boolean
  }): string {
    const {
      method,
      digitalTotalPrice,
      gravureTotalPrice,
      breakevenQuantity,
      requestQuantity,
      gravureReady,
    } = args

    if (!gravureReady) {
      return 'グラビア計算に必要な原反幅・ラミ種別・フィルム構造が未指定のため、デジタル印刷を推奨します。'
    }

    const fmt = (n: number) => (Number.isFinite(n) ? `¥${Math.round(n).toLocaleString()}` : '計算不可')
    const bqText = Number.isFinite(breakevenQuantity)
      ? `約${Math.round(breakevenQuantity).toLocaleString()}個`
      : '（現在の仕様では逆転なし）'

    if (method === 'digital') {
      const savings = gravureTotalPrice - digitalTotalPrice
      return `デジタル印刷が${fmt(savings)}安価です（デジタル${fmt(digitalTotalPrice)} / グラビア${fmt(gravureTotalPrice)}）。グラビアが有利になる分岐点は${bqText}です。現在の数量（${requestQuantity.toLocaleString()}個）は分岐点未満のためデジタル推奨。`
    }
    const savings = digitalTotalPrice - gravureTotalPrice
    return `グラビア印刷が${fmt(savings)}安価です（グラビア${fmt(gravureTotalPrice)} / デジタル${fmt(digitalTotalPrice)}）。分岐点${bqText}を超過する大ロットのためグラビア推奨。`
  }

  /**
   * 파우치 가공비 계산 (고정비용 방식)
   *
   * [평방(3방) / 스탠드 후가공비]
   * - 평방(3방): 200,000원 → 지퍼 있으면 250,000원 (+50,000원)
   * - 스탠드: 250,000원 → 지퍼 있으면 280,000원 (+30,000원)
   * - T/M방/박스: 440,000원 (지퍼 미지원)
   * - 기타: 200,000원
   *
   * @param bagTypeId 파우치 타입
   * @param width 폭 (mm)
   * @param quantity 수량
   * @param postProcessingOptions 후가공 옵션 (지퍼 등)
   * @returns 파우치 가공비 (엔)
   */
  private async calculatePouchProcessingCost(
    bagTypeId: string,
    width: number,
    quantity: number,
    postProcessingOptions?: string[]
  ): Promise<number> {
    // 기본 파우치 타입 결정
    let basePouchType: 'flat_3_side' | 'stand_up' | 't_shape' | 'm_shape' | 'box' | 'other' = 'other'

    // 合掌袋(lap_seal)はt_shapeとして判定
    if (bagTypeId.includes('lap_seal') || bagTypeId.includes('t_shape') || bagTypeId.includes('T방')) {
      basePouchType = 't_shape'
    } else if (bagTypeId.includes('3_side') || bagTypeId.includes('flat') || bagTypeId.includes('three_side')) {
      basePouchType = 'flat_3_side'
    } else if (bagTypeId.includes('stand') || bagTypeId.includes('standing')) {
      basePouchType = 'stand_up'
    } else if (bagTypeId.includes('m_shape') || bagTypeId.includes('M방')) {
      basePouchType = 'm_shape'
    } else if (bagTypeId.includes('box') || bagTypeId.includes('gusset')) {
      basePouchType = 'box'
    }

    // ジッパーがあっても基本タイプのまま計算（二重課税防止）
    const finalPouchType = basePouchType
    const hasZipper = postProcessingOptions?.includes('zipper-yes')

    // DB設定からパウチ加工費を取得
    const defaultCostConfig = CONSTANTS.POUCH_PROCESSING_COSTS[finalPouchType] || CONSTANTS.POUCH_PROCESSING_COSTS.other
    const minimumPrice = await this.getSetting(
      'pouch_processing',
      `${finalPouchType}_minimum_price`,
      defaultCostConfig.minimumPrice
    )

    // 기본 가공비 (원화) - coefficient 방식 대신 고정비용 사용
    let baseCostKRW = minimumPrice

    // 지퍼가 있는 경우 추가비용 적용
    if (hasZipper) {
      // DB設定からジッパー追加料金を取得
      const defaultSurcharge = CONSTANTS.ZIPPER_SURCHARGE[finalPouchType as keyof typeof CONSTANTS.ZIPPER_SURCHARGE] || 0
      const surcharge = await this.getSetting(
        'pouch_processing',
        `${finalPouchType}_zipper_surcharge`,
        defaultSurcharge
      )
      baseCostKRW += surcharge
    }

    console.log('[Pouch Processing Cost]', {
      bagTypeId,
      basePouchType,
      hasZipper,
      finalPouchType,
      baseMinimumPrice: minimumPrice,
      zipperSurcharge: hasZipper ? await this.getSetting(
        'pouch_processing',
        `${finalPouchType}_zipper_surcharge`,
        CONSTANTS.ZIPPER_SURCHARGE[finalPouchType as keyof typeof CONSTANTS.ZIPPER_SURCHARGE] || 0
      ) : 0,
      finalCostKRW: baseCostKRW
    })

    // 엔화 환산 (AC-22: 集約ヘルパーで統一)
    return convertKRWtoJPY(baseCostKRW)
  }

  /**
   * bagTypeId를 올바른 pouchType으로 매핑
   * @param bagTypeId 제품 유형 ID
   * @param postProcessingOptions 후가공 옵션 (지퍼 등)
   * @returns 매핑된 파우치 타입 (지퍼 없는 기본 타입)
   *
   * 注意: ジッパー追加は postProcessingMultiplier で調整するため、
   * ここでは基本タイプのみを返す（二重課税防止）
   */
  private mapToPouchType(bagTypeId: string, postProcessingOptions?: string[]): string {
    if (bagTypeId === 'pouch') {
      // 基本パウチタイプのみ返す（ジッパーなし）
      return 'flat_3_side';
    }

    // その他のタイプはそのまま返す
    return bagTypeId;
  }

  /**
   * パラメータ検証
   */
  private validateParams(params: UnifiedQuoteParams): void {
    const minOrderQty = params.bagTypeId === 'roll_film' ? 500 : CONSTANTS.MIN_ORDER_QUANTITY;
    const unit = params.bagTypeId === 'roll_film' ? 'm' : '個';

    // SKUモードの場合はskuQuantitiesの総数量をチェック
    const actualQuantity = params.useSKUCalculation && params.skuQuantities
      ? params.skuQuantities.reduce((sum, q) => sum + q, 0)
      : params.quantity;

    if (actualQuantity < minOrderQty) {
      throw new Error(`最小注文数量は${minOrderQty}${unit}です。`)
    }

    if (actualQuantity > CONSTANTS.MAX_ORDER_QUANTITY) {
      throw new Error(`最大注文数量は${CONSTANTS.MAX_ORDER_QUANTITY}個です。`)
    }

    if (params.width < 10 || params.width > 1000) {
      throw new Error('横幅は10mmから1000mmの間である必要があります。')
    }

    if (params.height < 10 || params.height > 1000) {
      throw new Error('高さは10mmから1000mmの間である必要があります。')
    }
  }

  /**
   * 素材費計算
   */
  private async calculateMaterialCost(
    materialId: string,
    width: number,
    height: number,
    depth: number,
    bagTypeId: string,
    thicknessSelection?: string,
    thicknessMultiplier: number = 1.0
  ): Promise<number> {
    // DB設定から素材単価を取得、ない場合は定数を使用
    const materialCostPerKg = await this.getSetting(
      'material_cost',
      materialId,
      (CONSTANTS.MATERIAL_COSTS as any)[materialId] || CONSTANTS.MATERIAL_COSTS.PET
    )

    // 面積計算 (mm² → m²)
    const areaMm2 = width * height
    const areaM2 = areaMm2 / 1000000

    // 体積計算（単純化）
    const thickness = thicknessSelection ? this.getThicknessInMicrons(thicknessSelection) : 80 // デフォルト厚さ80μm
    const volumeM3 = areaM2 * (thickness / 1000000)

    // 重量計算 (kg)
    const materialRate = this.getMaterialRate(materialId)
    const weightKg = volumeM3 * materialRate

    // 素材費
    const materialCost = weightKg * materialCostPerKg * thicknessMultiplier

    return materialCost
  }

  /**
   * 加工費計算
   */
  private async calculateProcessingCost(
    bagTypeId: string,
    quantity: number,
    isUVPrinting: boolean = false,
    materialId?: string,
    rollFilmParams?: {
      productWidth?: number  // 製品幅（顧客が指定する印刷幅）
      filmLayers?: FilmStructureLayer[]
      thicknessSelection?: string
    }
  ): Promise<number> {
    // ロールフィルムはM単位で計算（quantityは長さmとして扱う）
    if (bagTypeId === 'roll_film') {
      const lengthInMeters = quantity; // quantityを長さ(m)として解釈

      // 製品幅に基づいて原反幅を動的に決定
      const productWidth = rollFilmParams?.productWidth || 760;
      const determinedMaterialWidth = determineMaterialWidth(productWidth, materialId);
      const widthM = determinedMaterialWidth / 1000; // mm→m変換

      console.log('[RollFilm Cost Calculation]', {
        productWidth,
        determinedMaterialWidth,
        widthM,
        lengthInMeters,
        filmLayers: rollFilmParams?.filmLayers,
        thicknessSelection: rollFilmParams?.thicknessSelection
      });

      // フィルム構造レイヤー（デフォルト: PET12/AL7/PET12/LLDPE80）
      const defaultLayers: FilmStructureLayer[] = [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'PET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 80 }
      ];
      const layers = rollFilmParams?.filmLayers || defaultLayers;

      // 厚さ選択による調整
      const adjustedLayers = this.adjustLayersForThickness(layers, rollFilmParams?.thicknessSelection);

      // 材料別ロス量計算（ロールフィルム）
      const getLossMeters = (layers: typeof adjustedLayers): number => {
        const hasAL = layers.some(layer => layer.materialId === 'AL');
        const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');
        // KRAFT材料は700mのロス、AL材料は400mのロス
        if (hasKraft) return 700;
        return hasAL ? 400 : 300;
      };
      const lossMeters = getLossMeters(adjustedLayers);
      const totalMeters = lengthInMeters + lossMeters;

      // === ラミネートコスト計算 ===
      // ラミネート費(ウォン) = フィルム幅(m) × 使用メートル数 × ラミ単価 × ラミ回数
      // ラミ回数 = 層数 - 1
      // ラミ単価: AL素材あり 75ウォン/m, AL素材なし 65ウォン/m

      // AL素材が含まれているかチェック
      const hasALMaterial = adjustedLayers.some(layer => layer.materialId === 'AL');
      const laminationPricePerMeter = hasALMaterial ? 75 : 65; // ウォン/m
      const laminationCycles = adjustedLayers.length - 1; // 層数 - 1

      const laminateCostKRW = widthM * totalMeters * laminationPricePerMeter * laminationCycles;
      const laminateCostJPY = convertKRWtoJPY(laminateCostKRW);

      console.log('[Laminate Cost Calculation]', {
        hasALMaterial,
        laminationPricePerMeter,
        laminationCycles,
        widthM,
        totalMeters,
        laminateCostKRW,
        laminateCostJPY
      });

      // === スリッターコスト計算 ===
      // スリッター費(ウォン) = MAX(30,000ウォン, 使用メートル数 × 10ウォン)
      const slitterCostKRW = Math.max(30000, totalMeters * 10);
      const slitterCostJPY = convertKRWtoJPY(slitterCostKRW);

      console.log('[Slitter Cost Calculation]', {
        totalMeters,
        calculatedCost: totalMeters * 10,
        minCost: 30000,
        slitterCostKRW,
        slitterCostJPY
      });

      // 各レイヤーの材料費計算（ウォン）
      let materialCostKRW = 0;
      for (const layer of adjustedLayers) {
        // DB設定から素材価格と密度を取得、ない場合は定数を使用
        const defaultMaterialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
        const unitPrice = await this.getSetting(
          'film_material',
          `${layer.materialId}_unit_price`,
          defaultMaterialInfo?.unitPrice || 0
        );
        const density = await this.getSetting(
          'film_material',
          `${layer.materialId}_density`,
          defaultMaterialInfo?.density || 1.0
        );

        if (unitPrice > 0) {
          let weight: number;
          // Kraft等のgrammage指定材料: densityを使用せずgrammageを直接使用
          if (layer.grammage !== undefined) {
            weight = (layer.grammage / 1000) * widthM * totalMeters;  // g/m² → kg/m²
          } else {
            // 厚み(mm) × 幅(m) × 総長さ(m + ロス) × 比重 × 単価(ウォン/kg)
            const thicknessMm = layer.thickness / 1000; // μm→mm変換
            weight = thicknessMm * widthM * totalMeters * density; // kg
          }
          const cost = weight * unitPrice; // ウォン
          materialCostKRW += cost;
        }
      }

      // 円換算（AC-22: 集約ヘルパーで統一）
      const materialCostJPY = convertKRWtoJPY(materialCostKRW);

      console.log('[RollFilm Cost Calculation Result]', {
        materialCostKRW,
        materialCostJPY,
        lengthInMeters,
        totalMeters,
        lossMeters,
        breakdown: await Promise.all(adjustedLayers.map(async (layer) => {
          // DB設定から素材価格と密度を取得（console.log用）
          const defaultMaterialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
          const unitPrice = await this.getSetting(
            'film_material',
            `${layer.materialId}_unit_price`,
            defaultMaterialInfo?.unitPrice || 0
          );
          const density = await this.getSetting(
            'film_material',
            `${layer.materialId}_density`,
            defaultMaterialInfo?.density || 1.0
          );
          if (unitPrice > 0) {
            let weight: number;
            // Kraft等のgrammage指定材料: densityを使用せずgrammageを直接使用
            if (layer.grammage !== undefined) {
              weight = (layer.grammage / 1000) * widthM * totalMeters;  // g/m² → kg/m²
            } else {
              const thicknessMm = layer.thickness / 1000;
              weight = thicknessMm * widthM * totalMeters * density;
            }
            const cost = weight * unitPrice;
            return {
              materialId: layer.materialId,
              thickness: layer.thickness,
              weight: weight.toFixed(2),
              costKRW: cost.toFixed(0),
              costJPY: convertKRWtoJPY(cost).toFixed(0)
            };
          }
          return null;
        })).then(results => results.filter(Boolean))
      });

      // 総原価 = 材料費 + ラミネート費 + スリッター費
      const totalCostJPY = materialCostJPY + laminateCostJPY + slitterCostJPY;
      const processingCostOnlyJPY = laminateCostJPY + slitterCostJPY; // 材料費を除いた加工費のみ

      console.log('[RollFilm Total Processing Cost]', {
        materialCostJPY,
        laminateCostJPY,
        slitterCostJPY,
        processingCostOnlyJPY,
        totalCostJPY
      });

      // ロールフィルムの場合: 材料費と加工費を分離して返す
      // 戻り値は加工費のみ（材料費は呼び出し元で使用）
      return processingCostOnlyJPY;
    }

    // DB設定から加工費を取得、ない場合は定数を使用
    const baseCost = await this.getSetting(
      'processing_cost',
      bagTypeId,
      (CONSTANTS.PROCESSING_COSTS as any)[bagTypeId] || CONSTANTS.PROCESSING_COSTS['flat-pouch']
    )
    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')

    // UV印刷時加工費調整
    if (isUVPrinting) {
      return baseCost * 1.1 // 10%追加
    }

    return baseCost * quantity
  }

  /**
   * 印刷費計算
   * ドキュメント仕様: 印刷費は常に1mで計算（フィルム幅と無関係）
   * 印刷費用(ウォン) = 1m × 使用メートル数 × 475ウォン/m²
   */
  private async calculatePrintingCost(
    printingType: 'digital' | 'gravure',
    colors: number,
    quantity: number,
    doubleSided: boolean = false,
    isUVPrinting: boolean = false,
    rollFilmParams?: {
      lengthInMeters?: number    // ロールフィルムの長さ（m）
      filmWidthM?: number        // フィルム幅
    },
    pouchMeters?: number  // パウチの使用メートル数（ロス込み）
  ): Promise<number> {
    // DB設定からUV印刷固定費を取得
    const uvPrintingFixedCost = await this.getSetting(
      'printing',
      'uv_fixed_cost',
      CONSTANTS.UV_PRINTING_FIXED_COST
    )
    if (isUVPrinting) {
      return uvPrintingFixedCost
    }

    // DB設定から印刷設定を取得
    const defaultConfig = CONSTANTS.PRINTING_COSTS[printingType]
    const printingConfig = {
      setupFee: await this.getSetting('printing', `${printingType}_setup_fee`, defaultConfig.setupFee),
      perColorPerMeter: await this.getSetting('printing', `${printingType}_per_color_per_meter`, defaultConfig.perColorPerMeter),
      minCharge: await this.getSetting('printing', `${printingType}_min_charge`, defaultConfig.minCharge)
    }
    const colorMultiplier = doubleSided ? 2 : 1

    // ロールフィルムの場合：メートル数とフィルム幅を使用
    // 修正：印刷費は幅無関係、常に475元/mで計算（ドキュメント基準）
    // docs/reports/calcultae/04-미터수_및_원가_계산.md 参照
    if (rollFilmParams?.lengthInMeters && rollFilmParams?.filmWidthM) {
      // 材料別ロス量計算（ロールフィルム印刷）
      const getLossMeters = (layers?: FilmStructureLayer[]): number => {
        if (!layers || layers.length === 0) return 400; // デフォルト
        const hasAL = layers.some(layer => layer.materialId === 'AL');
        const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');
        // KRAFT材料は700mのロス、AL材料は400mのロス
        if (hasKraft) return 700;
        return hasAL ? 400 : 300;
      };
      const lossMeters = getLossMeters((rollFilmParams as any).filmLayers);
      const totalMeters = rollFilmParams.lengthInMeters + lossMeters;

      // ロールフィルム印刷費は幅無関係、常に475元/mで計算
      // ドキュメント基準：docs/reports/calcultae/04-미터수_및_원가_계산.md
      // パウチ製品の印刷費計算（1777-1794行目）には影響なし（分岐が分かれているため）
      // DB設定からロールフィルム印刷費を取得
      const rollFilmPrintingCostPerM = await this.getSetting(
        'printing',
        'roll_film_cost_per_m',
        CONSTANTS.ROLL_FILM_PRINTING_COST_PER_M
      )
      const printingCostKRW = totalMeters * rollFilmPrintingCostPerM;
      const totalCostKRW = Math.max(printingCostKRW, printingConfig.minCharge);

      // 円換算（AC-22: 集約ヘルパーで統一）
      const totalCostJPY = convertKRWtoJPY(totalCostKRW);

      console.log('[Printing Cost Roll Film]', {
        filmWidthM: rollFilmParams.filmWidthM,
        lengthInMeters: rollFilmParams.lengthInMeters,
        totalMeters,
        lossMeters,
        perColorPerMeter: rollFilmPrintingCostPerM, // DB設定から取得
        note: 'ロールフィルム印刷費は幅無関係、常に475元/m',
        printingCostKRW,
        totalCostKRW,
        totalCostJPY
      });

      return totalCostJPY;
    }

    // パウチの場合：メートル数を使用（ドキュメント仕様準拠）
    // 印刷費用(ウォン) = 1m × 使用メートル数 × 475ウォン/m²
    const totalMeters = pouchMeters || 0;
    if (totalMeters > 0) {
      const printingCostKRW = totalMeters * printingConfig.perColorPerMeter;
      const totalCostKRW = Math.max(printingCostKRW, printingConfig.minCharge);
      const totalCostJPY = convertKRWtoJPY(totalCostKRW);

      console.log('[Printing Cost Pouch]', {
        totalMeters,
        perColorPerMeter: printingConfig.perColorPerMeter,
        printingCostKRW,
        totalCostKRW,
        totalCostJPY,
        note: 'フィルム幅に関係なく1mで計算'
      });

      return totalCostJPY;
    }

    // フォールバック：従来の数量ベース計算（非推奨）
    console.warn('[Printing Cost] メートル数が指定されていないため、数量ベースで計算（非推奨）');
    const colorCost = colors * colorMultiplier * (printingConfig.perColorPerMeter || 5) * quantity;
    const totalCost = colorCost;

    return Math.max(totalCost, printingConfig.minCharge);
  }

  /**
   * 設定費計算
   */
  private calculateSetupCost(
    bagTypeId: string,
    quantity: number,
    isUVPrinting: boolean = false
  ): number {
    if (isUVPrinting) {
      return CONSTANTS.UV_PRINTING_FIXED_COST
    }

    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')
    let baseSetupCost = isFlat ? 30000 : 40000

    // 小量注文時設定費調整
    if (quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
      baseSetupCost *= 1.2
    }

    return baseSetupCost
  }

  /**
   * 小量注文手数料計算
   */
  private calculateSmallLotSurcharge(
    quantity: number,
    bagTypeId: string,
    isUVPrinting: boolean = false
  ): number {
    if (isUVPrinting && quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
      return CONSTANTS.UV_PRINTING_SURCHARGE
    }

    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')

    if (isFlat && quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
      return CONSTANTS.SMALL_LOT_SURCHARGE
    }

    return 0
  }

  /**
   * 配送料計算
   * @param bagTypeId Bag type (roll_film uses per-roll shipping)
   * @param rollCount Number of rolls (for roll_film shipping cost)
   */
  private async calculateDeliveryCost(
    deliveryLocation: 'domestic' | 'international',
    quantity: number,
    width: number,
    height: number,
    depth: number,
    materialId: string,
    bagTypeId: string = 'flat_3_side',
    rollCount?: number,
    rollFilmParams?: {
      lengthInMeters?: number    // ロールフィルムの長さ（m）
      filmWidthM?: number        // フィルム幅
      totalThickness?: number    // 総厚さ（μm）
      layers?: FilmStructureLayer[]  // 各層の情報
    },
    pouchParams?: {
      filmLayers?: FilmStructureLayer[];
      materialWidth?: 590 | 760;
    }
  ): Promise<number> {
    const DELIVERY_COST_PER_ROLL = 16800 // 롤당 배송비 (엔)

    // Roll film: 重さ基づき配送料計算（26kgごとの包装区切り、15%加算）
    if (bagTypeId === 'roll_film' && rollFilmParams) {
      // 総メートル数 = 使用メートル数 + 400mロス（素材費、印刷費、加工費用）
      const totalMeters = (rollFilmParams.lengthInMeters || 500) + 400;
      // 納品メートル数（配送料計算用 - ロスを含まない）
      const deliveryMeters = rollFilmParams.lengthInMeters || 500;
      const filmWidthM = rollFilmParams.filmWidthM || 0.59;

      // 各層の厚さと比重から重量を計算（納品数量ベース）
      let deliveryWeightKg = 0;
      if (rollFilmParams.layers && rollFilmParams.layers.length > 0) {
        for (const layer of rollFilmParams.layers) {
          // DB設定から素材密度を取得、ない場合は定数を使用
          const defaultMaterialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
          const density = await this.getSetting(
            'film_material',
            `${layer.materialId}_density`,
            defaultMaterialInfo?.density || 1.0
          );

          // Kraft等のgrammage指定材料: densityを使用せずgrammageを直接使用
        if (layer.grammage !== undefined) {
          deliveryWeightKg += (layer.grammage / 1000) * filmWidthM * deliveryMeters;  // g/m² → kg/m²
        } else {
          // 重量(kg) = 厚さ(mm) × 幅(m) × 長さ(m) × 比重
          // 配送料は納品数量（deliveryMeters）で計算
          const thicknessMm = layer.thickness / 1000; // μm→mm変換
          const weight = thicknessMm * filmWidthM * deliveryMeters * density;
          deliveryWeightKg += weight;
        }
        }
      } else {
        // レイヤー情報がない場合、簡易計算（総厚さ100μmとして）
        const totalThicknessMm = (rollFilmParams.totalThickness || 100) / 1000; // μm→mm
        const averageDensity = 1.2; // 平均比重
        deliveryWeightKg = totalThicknessMm * filmWidthM * deliveryMeters * averageDensity;
      }

      // 韓国重量別配送料計算（26kgごとの包装区切り、15%加算）
      const deliveryCostJPY = this.calculateDeliveryCostByWeight(deliveryWeightKg);

      console.log('[Delivery Cost Roll Film]', {
        totalMeters,        // 素材費等の計算用（900m）
        deliveryMeters,     // 配送費計算用（500m）
        filmWidthM,
        deliveryWeightKg: deliveryWeightKg.toFixed(2),  // 配送重量
        packageCount: Math.ceil(deliveryWeightKg / 26),
        deliveryCostJPY
      });

      return deliveryCostJPY;
    }

    // Roll film with rollCount (従来の方法) - 削除
    // パウチ製品: フィルム構造に基づく正確な重量計算
    if (pouchParams?.filmLayers && pouchParams.filmLayers.length > 0) {
      // パウチの面積（m²）
      const pouchAreaM2 = (width * height) / 1000000;

      // 各層の重量を計算
      let totalThicknessMm = 0;
      let totalWeightPerM2 = 0; // m²あたりの重量（kg）

      for (const layer of pouchParams.filmLayers) {
        // DB設定から素材密度を取得、ない場合は定数を使用
        const defaultMaterialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
        const density = await this.getSetting(
          'film_material',
          `${layer.materialId}_density`,
          defaultMaterialInfo?.density || 1.0
        );

        // 重量計算
        if (layer.grammage !== undefined) {
          totalWeightPerM2 += layer.grammage / 1000;
        } else {
          const thicknessMm = layer.thickness / 1000; // μm→mm変換
          totalThicknessMm += thicknessMm;
          // 重量(kg/m²) = 厚さ(mm) × 比重
          totalWeightPerM2 += thicknessMm * density;
        }
      }

      // 1個あたりの重量（kg）
      const weightPerPouch = pouchAreaM2 * totalWeightPerM2;

      // 総配送重量（kg）
      const totalDeliveryWeightKg = weightPerPouch * quantity;

      // 29kg/箱で箱数を計算
      const BOX_CAPACITY_KG = 29;
      const deliveryBoxes = Math.ceil(totalDeliveryWeightKg / BOX_CAPACITY_KG);

      // 配送料計算（箱数 × 1箱あたりの配送料）
      const DELIVERY_COST_PER_BOX_KRW = 127980;
      const totalDeliveryJPY = convertKRWtoJPY(deliveryBoxes * DELIVERY_COST_PER_BOX_KRW);

      console.log('[Pouch Delivery Cost]', {
        pouchAreaM2,
        totalThicknessMm,
        totalWeightPerM2,
        weightPerPouch,
        quantity,
        totalDeliveryWeightKg,
        deliveryBoxes,
        totalDeliveryJPY
      });

      return totalDeliveryJPY;
    }

    // パウチ製品でフィルム構造情報がない場合、簡易計算（従来方法）
    // DB設定から配送料設定を取得
    const defaultDeliveryConfig = CONSTANTS.DELIVERY_COSTS[deliveryLocation]
    const deliveryConfig = {
      base: await this.getSetting('delivery', `${deliveryLocation}_base`, defaultDeliveryConfig.base),
      perKg: await this.getSetting('delivery', `${deliveryLocation}_per_kg`, defaultDeliveryConfig.perKg),
      freeThreshold: await this.getSetting('delivery', `${deliveryLocation}_free_threshold`, defaultDeliveryConfig.freeThreshold)
    }

    // 想定重量計算
    const areaMm2 = width * height
    const thickness = 80 // デフォルト厚さ
    const volumeM3 = (areaMm2 / 1000000) * (thickness / 1000000)
    const materialRate = this.getMaterialRate(materialId)
    const estimatedWeight = volumeM3 * materialRate

    const weightBasedCost = estimatedWeight * deliveryConfig.perKg
    const totalCost = deliveryConfig.base + weightBasedCost

    // 無料配送閾値確認
    if (totalCost < deliveryConfig.freeThreshold) {
      return totalCost
    }

    return 0
  }

  /**
   * 重量から韓国配送料を計算（26kgごとの包装区切り、15%加算）
   * @param totalWeightKg 総重量（kg）
   * @returns 配送料（円）
   */
  private calculateDeliveryCostByWeight(totalWeightKg: number): number {
    const PACKAGE_LIMIT = UnifiedPricingEngine.PACKAGE_WEIGHT_LIMIT;
    const deliveryTable = UnifiedPricingEngine.DELIVERY_COST_BY_WEIGHT_KRW;

    // 27kgごとの包装数を計算（ロールの最大重量制限）
    const packageCount = Math.ceil(totalWeightKg / PACKAGE_LIMIT);
    let totalDeliveryCostKRW = 0;

    // 各包装の配送料を計算
    for (let i = 0; i < packageCount; i++) {
      const remainingWeight = Math.min(totalWeightKg, PACKAGE_LIMIT);
      totalWeightKg -= remainingWeight;

      // 重量に応じた配送料を表から取得（最も近い上位の重量を使用）
      const weightKey = this.findClosestWeightKey(remainingWeight, deliveryTable);
      const costKRW = deliveryTable[weightKey] || deliveryTable[30.0]; // デフォルトは30kgの料金
      totalDeliveryCostKRW += costKRW;
    }

    // 15%加算
    const totalWithSurcharge = totalDeliveryCostKRW * 1.15;

    // 円換算（AC-22: 集約ヘルパーで統一）
    const deliveryCostJPY = convertKRWtoJPY(totalWithSurcharge);

    console.log('[Delivery Cost By Weight]', {
      packageCount,
      totalDeliveryCostKRW,
      surcharge: totalDeliveryCostKRW * 0.15,
      totalWithSurcharge,
      deliveryCostJPY
    });

    return deliveryCostJPY;
  }

  /**
   * 重量に最も近い上位の重量キーを検索
   * @param weight 重量（kg）
   * @param deliveryTable 配送料表
   * @returns 最も近い重量キー
   */
  private findClosestWeightKey(weight: number, deliveryTable: Record<number, number>): number {
    const weights = Object.keys(deliveryTable).map(Number).sort((a, b) => a - b);

    // 重量以下の最大値を探す
    for (let i = weights.length - 1; i >= 0; i--) {
      if (weights[i] <= weight) {
        return weights[i];
      }
    }

    // 0.5kg未満の場合は0.5kgの料金
    return 0.5;
  }

  /**
   * リードタイム計算
   */
  private calculateLeadTime(
    urgency: 'standard' | 'express',
    quantity: number,
    isUVPrinting: boolean = false,
    hasPostProcessing: boolean = false
  ): number {
    let baseDays = 14 // デフォルト14日（2週間）

    // 緊急注文
    if (urgency === 'express') {
      baseDays = 7
    }

    // UV印刷
    if (isUVPrinting) {
      baseDays = Math.max(baseDays - 3, 5) // 最小5日
    }

    // 大量注文
    if (quantity >= 10000) {
      baseDays += 7
    } else if (quantity >= 5000) {
      baseDays += 3
    }

    // 後加工
    if (hasPostProcessing) {
      baseDays += 2
    }

    return baseDays
  }

  /**
   * 素材比率取得
   */
  private getMaterialRate(materialId: string): number {
    const rateMap: Record<string, number> = {
      'opp-alu-foil': 2.5,
      'kraft-pe': 0.85,
      'alu-vapor': 2.0,
      'pet-transparent': 1.4,
      'PET': 1.38,
      'PP': 0.90,
      'PE': 0.92,
      'ALUMINUM': 2.70,
      'PAPER_LAMINATE': 0.80
    }

    return rateMap[materialId] || rateMap.PET
  }

  /**
   * 厚さ(ミクロン)取得 - LLDPE厚さ: 50, 70, 90, 100, 110μm
   */
  private getThicknessInMicrons(thicknessSelection?: string): number {
    if (!thicknessSelection) return 90 // デフォルトはstandard (90μm)

    const thicknessMap: Record<string, number> = {
      'light': 50,
      'medium': 70,
      'standard': 90,
      'heavy': 100,
      'ultra': 110
    }

    return thicknessMap[thicknessSelection] || 90
  }

  /**
   * 選択された厚さ名取得
   */
  private getSelectedThicknessName(materialId: string, thicknessSelection?: string): string | undefined {
    if (!thicknessSelection) return undefined

    const options = MATERIAL_THICKNESS_OPTIONS[materialId]
    if (!options) return undefined

    const selected = options.find(opt => opt.id === thicknessSelection)
    return selected?.nameJa || selected?.name
  }

  /**
   * Build FilmCostDetails from SKUCostResult for admin UI display
   * Extracts film cost information from the SKU calculation result
   */
  private buildFilmCostDetailsFromSKUCostResult(skuResult: any): any {
    // Use the filmCostResult from SKUCostResult if available
    if (skuResult.filmCostResult) {
      return skuResult.filmCostResult;
    }

    // Fallback to minimal film cost details based on SKUCostResult summary
    // pouchProcessingCostを含める
    const firstSKU = skuResult.costPerSKU?.[0];
    return {
      materialLayerDetails: [],
      totalCostKRW: 0,
      costJPY: 0,
      totalWeight: skuResult.summary?.totalWeight || 0,
      totalMeters: skuResult.summary?.totalWithLossMeters || 0,
      materialWidthMM: skuResult.materialWidth || 590,
      areaM2: 0,
      // pouchProcessingCostを追加（costBreakdownから取得）
      pouchProcessingCost: firstSKU?.costBreakdown?.pouchProcessingCost || 0,
      // その他のコスト内訳も追加
      laminationCost: firstSKU?.costBreakdown?.laminationCost || 0,
      slitterCost: firstSKU?.costBreakdown?.slitterCost || 0,
      surfaceTreatmentCost: firstSKU?.costBreakdown?.surfaceTreatmentCost || 0,
      printingCost: firstSKU?.costBreakdown?.printingCost || 0,
      manufacturingMargin: firstSKU?.costBreakdown?.manufacturingMargin || 0,
      duty: firstSKU?.costBreakdown?.duty || 0,
      delivery: firstSKU?.costBreakdown?.delivery || 0,
      salesMargin: firstSKU?.costBreakdown?.salesMargin || 0,
      materialCost: firstSKU?.costBreakdown?.materialCost || 0,
    };
  }

  /**
   * 두께 선택에 따른 필름 레이어 조정
   * thicknessSelection에 따라 sealant 층(LLDPE)의 두께를 조정
   * LLDPE 두께: 50, 70, 90, 100, 110μm
   *
   * @param baseLayers 기본 필름 레이어
   * @param thicknessSelection 두께 선택 (light, medium, standard, heavy, ultra)
   * @returns 조정된 필름 레이어
   */
  private adjustLayersForThickness(
    baseLayers: FilmStructureLayer[],
    thicknessSelection?: string
  ): FilmStructureLayer[] {
    // 두께 선택이 없으면 기본 레이어 반환
    if (!thicknessSelection) return baseLayers

    // 두께별 배율 (ImprovedQuotingWizard의 material.thicknessOptions[].multiplier와 동일)
    const thicknessMultipliers: Record<string, number> = {
      'light': 0.85,
      'medium': 0.95,
      'standard': 1.0,
      'heavy': 1.1,
      'ultra': 1.2
    }

    const multiplier = thicknessMultipliers[thicknessSelection]
    if (!multiplier || multiplier === 1.0) return baseLayers

    // 레이어 복사 및 두께 조정 (주로 sealant 층인 LLDPE에 적용)
    return baseLayers.map(layer => {
      // LLDPE와 PE 층은 sealant로 두께 조정
      if (layer.materialId === 'LLDPE' || layer.materialId === 'PE') {
        return {
          ...layer,
          thickness: Math.round(layer.thickness * multiplier)
        }
      }
      // 다른 층(PET, AL, NY, VMPET)은 그대로 유지
      return layer
    })
  }

  /**
   * キャッシュキー生成
   */
  private generateCacheKey(params: UnifiedQuoteParams): string {
    const keyParts = [
      params.bagTypeId || 'unknown',
      params.materialId || 'unknown',
      params.width?.toString() || '0', // undefinedの場合は'0'を使用
      params.height?.toString() || '0', // heightがundefinedの場合（ロールフィルム等）は'0'を使用
      params.depth?.toString() || '0',
      params.quantity?.toString() || '0', // undefinedの場合は'0'を使用
      // CRITICAL: キャッシュキーにskuQuantitiesを含める - SKUモードで正しい価格を計算するため
      JSON.stringify(params.skuQuantities || []),
      params.thicknessSelection || 'default',
      params.thicknessMultiplier?.toString() || '1.0',
      params.isUVPrinting?.toString() || 'false',
      params.postProcessingMultiplier?.toString() || '1.0',
      // postProcessingOptionsをキャッシュキーに追加（マット/光沢変更対応）
      JSON.stringify(params.postProcessingOptions?.sort() || []),
      params.printingType || 'digital',
      params.printingColors?.toString() || '1',
      params.doubleSided?.toString() || 'false',
      params.deliveryLocation || 'domestic',
      params.urgency || 'standard',
      // 필름 원가 계산 관련 파라미터 (새로운 기능)
      params.useFilmCostCalculation?.toString() || 'false',
      // CRITICAL: キャッシュキーにmarkupRateを含める - 顧客別割引率を正しく反映するため
      params.markupRate?.toString() || CONSTANTS.DEFAULT_MARKUP_RATE.toString(),
      params.materialWidth?.toString() || '760', // デフォルト760mm
      params.lossRate?.toString() || CONSTANTS.DEFAULT_LOSS_RATE.toString(),
      // 필름 레이어 정보를 문자열로 변환
      params.filmLayers ? JSON.stringify(params.filmLayers) : 'default',
      // CRITICAL: 스파우트 파우치 관련 파라미터 - spoutSize가 다르면 가격이 다름
      params.spoutSize?.toString() || 'none',
      params.spoutPosition || 'none',
      // グラビア専用パラメータ（Phase 1c・AC-23: キャッシュ衝突防止）
      // 異なる原反幅・銅版種別・製作長で別結果になるため、キーに含める必須
      // ※ ラミ種別は2026-06-27廃止（AL有無は filmLayers から判定・layers構成でキャッシュ区分済み）
      params.gravureMaterialWidth?.toString() || 'none',
      params.copperPlateType || 'none',
      params.gravureProductionMeters?.toString() || 'none',
      // 多列生産列数（グラビア 2/3/4列・計画 multi-column-gravure-unification.md）。列数違いで別結果
      params.columnCount?.toString() || '1'
    ]

    return keyParts.join('|')
  }

  /**
   * キャッシュクリア
   */
  public clearCache(): void {
    this.cache.clear()
    console.log('[UnifiedPricingEngine] Cache cleared')
  }

  /**
   * 設定キャッシュをクリア
   * Clear the settings cache to force reload from database
   */
  public clearSettingsCache(): void {
    this.settingsCache.clear()
    this.settingsCacheExpiry = 0
    console.log('[UnifiedPricingEngine] Settings cache cleared')
  }

  /**
   * キャッシュサイズ取得
   */
  public getCacheSize(): number {
    return this.cache.size
  }

  /**
   * 特定数量のキャッシュをクリア（推奨更新時使用）
   * @param quantity クリアする数量
   */
  public clearCacheForQuantity(quantity: number): void {
    const keysToDelete: string[] = []

    for (const key of Array.from(this.cache.keys())) {
      // キャッシュキーに数量が含まれる場合削除
      if (key.includes(`quantity:${quantity}`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    console.log(`[UnifiedPricingEngine] Cleared ${keysToDelete.length} cache entries for quantity ${quantity}`)
  }

  /**
   * スマート見積互換性のための単純計算メソッド
   */
  async calculateSimpleQuote(params: {
    bagTypeId: string
    materialId: string
    width: number
    height: number
    quantity: number
    isUVPrinting?: boolean
    thicknessSelection?: string
    postProcessingMultiplier?: number
  }): Promise<Omit<UnifiedQuoteResult, 'breakdown' | 'validUntil' | 'minOrderQuantity'>> {
    const result = await this.calculateQuote({
      ...params,
      isUVPrinting: params.isUVPrinting || false,
      postProcessingMultiplier: params.postProcessingMultiplier || 1.0
    })

    return {
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      currency: result.currency,
      leadTimeDays: result.leadTimeDays,
      details: result.details,
      thicknessMultiplier: result.thicknessMultiplier,
      selectedThicknessName: result.selectedThicknessName,
      postProcessingMultiplier: result.postProcessingMultiplier,
      minimumPriceApplied: result.minimumPriceApplied
    }
  }
}

/**
 * Calculate pricing for each SKU individually
 * @param params Base quote parameters (common to all SKUs)
 * @param skuQuantities Array of quantities for each SKU
 * @returns Array of quote results, one per SKU
 */
export async function calculateSKUPricing(
  params: UnifiedQuoteParams,
  skuQuantities: number[]
): Promise<UnifiedQuoteResult[]> {
  const results = await Promise.all(skuQuantities.map((quantity, index) =>
    unifiedPricingEngine.calculateQuote({
      ...params,
      quantity
    })
  ));

  return results.map((result, index) => ({
    ...result,
    skuIndex: index,
    skuNumber: index + 1,
    isSKUMode: true
  }));
}

/**
 * Aggregate SKU pricing results into combined totals
 * @param skuResults Array of individual SKU quote results
 * @returns Aggregated pricing with breakdown
 */
export function aggregateSKUPricing(
  skuResults: UnifiedQuoteResult[]
): {
  totalUnitPrice: number;
  totalPrice: number;
  breakdown: Array<{
    skuNumber: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
} {
  const breakdown = skuResults.map((result, index) => ({
    skuNumber: index + 1,
    quantity: result.quantity,
    unitPrice: result.unitPrice,
    totalPrice: result.totalPrice
  }));

  const totalPrice = breakdown.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalQuantity = breakdown.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalUnitPrice: totalQuantity > 0 ? totalPrice / totalQuantity : 0,
    totalPrice,
    breakdown
  };
}

// シングルトンインスタンスエクスポート
export const unifiedPricingEngine = new UnifiedPricingEngine()
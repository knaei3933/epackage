/**
 * Unified Pricing Engine Type Definitions
 *
 * Engine-specific types (quote params, results, thickness options).
 * Core bag/printing specification types remain in pricing/types.ts.
 */

import type { FilmCostResult, FilmStructureLayer } from '../film-cost-calculator';
import type { SKUCostResult } from '../pouch-cost-calculator';

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



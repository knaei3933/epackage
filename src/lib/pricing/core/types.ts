/**
 * Pricing Engine Core Types
 * 統一価格計算エンジンの核心型定義
 */

// ========================================
// 基本型定義
// ========================================

export interface PriceBreakdown {
  /** 素材費（フィルム材料費のみ） */
  filmCost?: number
  /** ラミネーション費 */
  laminationCost?: number
  /** スリッター費 */
  slitterCost?: number
  /** 素材費合計（フィルム＋ラミネーション＋スリッター） */
  material: number
  /** 加工費 */
  processing: number
  /** 印刷費 */
  printing: number
  /** 設定費 */
  setup: number
  /** 割引額 */
  discount: number
  /** 配送料 */
  delivery: number
  /** 小計 */
  subtotal: number
  /** 総額 */
  total: number
  /** パウチ加工費 */
  pouchProcessingCost?: number
  /** 基本原価 */
  baseCost?: number
  /** SKU追加料金 */
  skuSurcharge?: number
}

export interface QuoteResult {
  /** 単価 */
  unitPrice: number
  /** 総額 */
  totalPrice: number
  /** 通貨 */
  currency: string
  /** 内訳 */
  breakdown: PriceBreakdown
  /** リードタイム（日数） */
  leadTimeDays: number
  /** 見積有効期限 */
  validUntil: Date
  /** 最小注文数量 */
  minOrderQuantity: number
  /** 数量 */
  quantity?: number
  /** フィルム使用量（メートル） */
  filmUsage?: number
  /** 原反幅（mm） */
  materialWidth?: 590 | 760
}

// ========================================
// 戦略パターンインターフェース
// ========================================

/**
 * 価格計算戦略インターフェース
 * 製品タイプごとの計算ロジックをカプセル化
 */
export interface PricingStrategy {
  /**
   * 戦略識別子
   */
  readonly strategyId: string

  /**
   * 対応製品タイプ
   */
  readonly supportedProductTypes: string[]

  /**
   * 価格計算実行
   */
  calculate(params: CalculationParams): Promise<QuoteResult>

  /**
   * パラメータ検証
   */
  validate(params: CalculationParams): ValidationResult
}

/**
 * 計算パラメータ（戦略共通）
 */
export interface CalculationParams {
  /** 製品タイプID */
  bagTypeId: string
  /** 素材ID */
  materialId: string
  /** 幅 (mm) */
  width: number
  /** 高さ (mm) */
  height: number
  /** 深さ/マチ (mm) */
  depth?: number
  /** 数量 */
  quantity: number
  /** 厚さ選択 */
  thicknessSelection?: string
  /** UV印刷有無 */
  isUVPrinting?: boolean
  /** 後加工オプション */
  postProcessingOptions?: string[]
  /** 後加工乗数 */
  postProcessingMultiplier?: number
  /** 印刷タイプ */
  printingType?: 'digital' | 'gravure'
  /** 印刷色数 */
  printingColors?: number
  /** 両面印刷 */
  doubleSided?: boolean
  /** 配送先 */
  deliveryLocation?: 'domestic' | 'international'
  /** 緊急度 */
  urgency?: 'standard' | 'express'
  /** SKU数量配列 */
  skuQuantities?: number[]
  /** フィルムレイヤー */
  filmLayers?: FilmStructureLayer[]
}

/**
 * フィルム構造レイヤー
 */
export interface FilmStructureLayer {
  materialId: string
  thickness: number // μm
}

/**
 * 検証結果
 */
export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

// ========================================
// 定数型
// ========================================

export interface MaterialCostConfig {
  /** 単価 (円/kg) */
  unitPrice: number
  /** 密度 (kg/m³) */
  density: number
}

export interface ProcessingCostConfig {
  coefficient: number
  minimumPrice: number
}

export interface PouchProcessingCosts {
  [pouchType: string]: ProcessingCostConfig
}

export interface PrintingCostConfig {
  setupFee: number
  perColorPerMeter: number
  minCharge: number
}

export interface DeliveryCostConfig {
  base: number
  perKg: number
  freeThreshold: number
}

// ========================================
// 厚さ設定型
// ========================================

export interface ThicknessOption {
  id: string
  name: string
  nameJa: string
  specification: string
  weightRange: string
  multiplier: number
}

export interface MaterialThicknessOptions {
  [materialId: string]: ThicknessOption[]
}

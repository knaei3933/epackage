/**
 * Pricing Engine Constants
 * 価格計算エンジンで使用する定数定義
 */

import { MaterialCostConfig, PouchProcessingCosts, PrintingCostConfig, DeliveryCostConfig, MaterialThicknessOptions } from './types'

// ========================================
// 基本定数
// ========================================

export const PRICING_CONSTANTS = {
  /** 最小注文数量（パウチ） */
  MIN_ORDER_QUANTITY: 100,
  /** 最大注文数量 */
  MAX_ORDER_QUANTITY: 100000,
  /** 小ロット閾値 */
  SMALL_LOT_THRESHOLD: 3000,
  /** 最小価格（無効化） */
  MINIMUM_PRICE: 0,

  /** ロールフィルム最小注文数量（m） */
  ROLL_FILM_MIN_QUANTITY: 500,
  /** ロールフィルム固定ロス（m） */
  ROLL_FILM_LOSS_METERS: 400,

  /** 製造者マージン率 */
  MANUFACTURER_MARGIN: 0.4,
  /** 販売マージン率 */
  SALES_MARGIN: 0.2,
  /** 関税率 */
  DUTY_RATE: 0.05,
  /** 為替レート（KRW→JPY） */
  EXCHANGE_RATE_KRW_TO_JPY: 0.12,

  /** デフォルトマークアップ率 */
  DEFAULT_MARKUP_RATE: 0.2,
  /** デフォルトロス率 */
  DEFAULT_LOSS_RATE: 0.4,
  /** デフォルト原反幅（mm） */
  DEFAULT_MATERIAL_WIDTH: 760,

  /** 後加工デフォルト乗数 */
  DEFAULT_POST_PROCESSING_MULTIPLIER: 1.0,
} as const

// ========================================
// 素材コスト設定（韓国原価計算ベース）
// ========================================

export const MATERIAL_PRICES_KRW: Record<string, MaterialCostConfig> = {
  'PET': { unitPrice: 2800, density: 1.40 },
  'AL': { unitPrice: 7800, density: 2.71 },
  'LLDPE': { unitPrice: 2800, density: 0.92 },
  'NY': { unitPrice: 5400, density: 1.16 },
  'VMPET': { unitPrice: 3600, density: 1.40 },
  'CPP': { unitPrice: 2700, density: 0.91 },
} as const

// ========================================
// パウチ加工費設定（韓国原価計算ベース）
// ========================================

export const POUCH_PROCESSING_COSTS_KRW: PouchProcessingCosts = {
  'flat_3_side': { coefficient: 0.4, minimumPrice: 200000 },
  'stand_up': { coefficient: 1.2, minimumPrice: 250000 },
  't_shape': { coefficient: 1.2, minimumPrice: 440000 },
  'm_shape': { coefficient: 1.2, minimumPrice: 440000 },
  'box': { coefficient: 1.2, minimumPrice: 440000 },
  'other': { coefficient: 1.0, minimumPrice: 200000 },
} as const

// ジッパー追加 surcharge（ウォン）
export const ZIPPER_SURCHARGE_KRW = {
  'flat_3_side': 50000,
  'stand_up': 30000,
  't_shape': 0,
  'm_shape': 0,
  'box': 0,
} as const

// ========================================
// 印刷コスト設定
// ========================================

export const PRINTING_COSTS: Record<string, PrintingCostConfig> = {
  'digital': {
    setupFee: 10000,
    perColorPerMeter: 475, // ウォン/m
    minCharge: 5000,
  },
  'gravure': {
    setupFee: 50000,
    perColorPerMeter: 200,
    minCharge: 20000,
  },
} as const

// ========================================
// 配送コスト設定
// ========================================

export const DELIVERY_COSTS: Record<string, DeliveryCostConfig> = {
  'domestic': {
    base: 1500,
    perKg: 150,
    freeThreshold: 50000,
  },
  'international': {
    base: 5000,
    perKg: 500,
    freeThreshold: 200000,
  },
} as const

// ========================================
// ロールフィルム加工費設定
// ========================================

export const ROLL_FILM_CONSTANTS = {
  /** ラミネート費（ウォン/m） */
  LAMINATION_COST_PER_M: 75,
  /** スリッター最小費用（ウォン） */
  SLITTER_MIN_COST: 30000,
  /** スリッター費（ウォン/m） */
  SLITTER_COST_PER_M: 10,
  /** 印刷費（ウォン/m） */
  PRINTING_COST_PER_M: 475,
  /** マット印刷追加費（ウォン/m） */
  MATTE_COST_PER_M: 40,
} as const

// ========================================
// 配送重量別料金（韓国）
// ========================================

export const DELIVERY_COST_BY_WEIGHT_KRW: Record<number, number> = {
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
  29.0: 118500, 29.5: 120000, 30.0: 121500,
} as const

/** 包装重量制限（kg） */
export const PACKAGE_WEIGHT_LIMIT_KG = 27

/** 配送 surcharge 率 */
export const DELIVERY_SURCHARGE_RATE = 0.15

// ========================================
// パウチ配送設定
// ========================================

export const POUCH_DELIVERY_CONSTANTS = {
  /** 箱容量（kg） */
  BOX_CAPACITY_KG: 29,
  /** 1箱あたり配送料（ウォン） */
  DELIVERY_COST_PER_BOX_KRW: 127980,
} as const

// ========================================
// 厚さオプション
// ========================================

export const MATERIAL_THICKNESS_OPTIONS: MaterialThicknessOptions = {
  'pet_al': [
    {
      id: 'light',
      name: '軽量タイプ (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 60μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: '標準タイプ (~500g)',
      nameJa: '標準タイプ (~500g)',
      specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ',
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
      id: 'light_medium',
      name: '中軽量タイプ (~300g)',
      nameJa: '中軽量タイプ (~300g)',
      specification: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 0.95
    },
    {
      id: 'medium',
      name: '標準タイプ (~500g)',
      nameJa: '標準タイプ (~500g)',
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
      id: 'medium',
      name: '標準タイプ (~500g)',
      nameJa: '標準タイプ (~500g)',
      specification: 'PET 12μ + LLDPE 110μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: '高耐久タイプ (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET 12μ + LLDPE 120μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: '超耐久タイプ (800g~)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET 12μ + LLDPE 130μ',
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
      id: 'light_medium',
      name: '中軽量タイプ (~300g)',
      nameJa: '中軽量タイプ (~300g)',
      specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 70μ',
      weightRange: '~300g',
      multiplier: 0.95
    },
    {
      id: 'medium',
      name: '標準タイプ (~500g)',
      nameJa: '標準タイプ (~500g)',
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
  ]
} as const

// ========================================
// 後加工乗数設定
// ========================================

export const POST_PROCESSING_MULTIPLIERS: Record<string, number> = {
  'zipper-yes': 1.25,
  'matte': 1.0, // マットは追加費で処理
  'glossy': 1.0,
  'hologram': 1.15,
  'embossing': 1.1,
} as const

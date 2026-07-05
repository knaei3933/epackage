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

  /** 製造者マージン率 40%（製造社原価に40%適用。DB system_settings.manufacturer_margin=0.4 と一致） */
  MANUFACTURER_MARGIN: 0.4,
  /** 販売マージン率 25%（小計に25%適用。DB system_settings.default_markup_rate=0.25 と一致）。
   *  2026-06-27 改定: 0.2→0.25（原価上昇に伴う販売マージン変更・ユーザー指示）。 */
  SALES_MARGIN: 0.25,
  /** 関税率 */
  DUTY_RATE: 0.05,
  /** 為替レート（KRW→JPY） */
  EXCHANGE_RATE_KRW_TO_JPY: 0.12,

  /** デフォルトマークアップ率（フォールバック専用、SALES_MARGIN に等しい=0.25。
   *  実運用値は DB system_settings.default_markup_rate=0.25） */
  DEFAULT_MARKUP_RATE: 0.25,
  /** デフォルトロス率 */
  DEFAULT_LOSS_RATE: 0.4,
  /** デフォルト原反幅（mm） */
  DEFAULT_MATERIAL_WIDTH: 760,

  /** 後加工デフォルト乗数 */
  DEFAULT_POST_PROCESSING_MULTIPLIER: 1.0,

  /** Spout Pouch 最小注文数量（個） */
  SPOUT_POUCH_MIN_QUANTITY: 5000,
  /** NY+LLDPE 最小注文数量（個） */
  NY_LLDPE_MIN_QUANTITY: 500,
  /** Kraft材料 最小注文数量（m） - ロールフィルムのみ */
  KRAFT_MIN_QUANTITY_METERS: 1000,

  /** クラフト紙原反幅オプション（mm） */
  KRAFT_MATERIAL_WIDTHS: [780, 1190] as const,

  /** クラフト紙印刷ロス（m） - ピン作業（合지） */
  KRAFT_PRINT_LOSS_METERS: 500,

  /** クラフト紙スリッターロス（m） */
  KRAFT_SLITTER_LOSS_METERS: 100,

  /** クラフト紙加工ロス（m） */
  KRAFT_PROCESSING_LOSS_METERS: 100,

  /** クラフト紙総ロス（m） - 印刷 + スリッター + 加工 */
  KRAFT_TOTAL_LOSS_METERS: 700,
} as const

// ========================================
// 素材コスト設定（韓国原価計算ベース）
// ========================================

export const MATERIAL_PRICES_KRW: Record<string, MaterialCostConfig> = {
  // 2026-06-27 改定: 原価上昇に伴う材料 kg 単価更新（ユーザー指示）
  'PET': { unitPrice: 4300, density: 1.40 },
  'AL': { unitPrice: 10500, density: 2.71 },
  'LLDPE': { unitPrice: 4500, density: 0.92 },
  'NY': { unitPrice: 7600, density: 1.16 },
  'VMPET': { unitPrice: 4000, density: 1.40 },
  'CPP': { unitPrice: 2700, density: 0.91 },
  'KRAFT': { unitPrice: 3000, density: 1.0 },
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
    perColorPerMeter: 520, // ウォン/m（2026-06-27 改定: 475→520 原価上昇）
    minCharge: 5000,
  },
  'gravure': {
    setupFee: 50000,
    perColorPerMeter: 19, // ウォン/m（仕様§6.1: 무광/유광 19₫/m）
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
  /** ラミネート費 AL素材なし（ウォン/m） - 2026-06-27 改定: AL有無2段階化 */
  LAMINATION_COST_PER_M_NO_AL: 65,
  /** ラミネート費 AL素材あり（ウォン/m） */
  LAMINATION_COST_PER_M_WITH_AL: 80,
  /** スリッター最小費用（ウォン） */
  SLITTER_MIN_COST: 30000,
  /** スリッター費（ウォン/m） */
  SLITTER_COST_PER_M: 10,
  /** 印刷費（ウォン/m） - 通常材料（2026-06-27 改定: 475→520） */
  PRINTING_COST_PER_M: 520,
  /** クラフト紙印刷費（ウォン/m） - クラフト材料専用 */
  KRAFT_PRINTING_COST_PER_M: 400,
  /** マット印刷追加費（ウォン/m） */
  MATTE_COST_PER_M: 40,
} as const

// ========================================
// グラビア印刷計算設定（仕様 gravure-pricing-calculation-formula.md §1-14 準拠）
// グラビア純粋計算モジュール（gravure-cost-calculator.ts）専用。ウォンを返す。
// 既存デジタル計算（unified-pricing-engine.ts）には無侵入。
// ========================================

export const GRAVURE_CONSTANTS = {
  /** 印刷単価（ウォン/m） - 仕様§6.1: 무광/유광 19₫/m */
  PRINTING_COST_PER_M: 19,
  /** 印刷単価は色数・原反幅に依存しない（幅×長さ×色数×19） */

  /** ロス量（m固定） - 仕様§4: 製作6,000m中にロス500m込み（顧客提供5,500m） */
  LOSS_METERS: 500,
  /** 標準製作ロット（m） - 仕様§4/§10.4: 6000m単位 */
  STANDARD_LOT_METERS: 6000,
  /** 顧客提供長（m） = 標準ロット - ロス = 5,500m */
  CUSTOMER_PROVIDED_METERS: 5500,

  /** 原反幅 範囲・刻み（仕様§3） */
  MATERIAL_WIDTH_MIN_MM: 500,   // 最小500mm
  MATERIAL_WIDTH_MAX_MM: 1100,  // 最大1,100mm
  MATERIAL_WIDTH_STEP_MM: 10,   // 10mm単位で丸め

  /** 多列生産 最大列数上限（仕様改定: 4列→7列へ拡張）
   *  列数 = floor(印刷方式最大幅 ÷ 1列フィルム幅) で算出し、この値が物理的上限。
   *  ※ 納品形態別の更なる制約は DELIVERY_MAX_COLUMN_COUNT で個別に絞る */
  MAX_COLUMN_COUNT: 7,

  /** 納品形態別の最大列数制約（物理 MAX_COLUMN_COUNT に加えて適用）
   *  - pouch(パウチ袋): 加工ライン制約で2列まで
   *  - roll(ロールフィルム): 袋加工なしなので物理上限いっぱい（7列）まで対応 */
  DELIVERY_MAX_COLUMN_COUNT: {
    pouch: 2,
    roll: 7,
  } as const,

  /** 多列生産を開始する1列基準の製作長閾値（m） - 2026-06-28 改定（C2 Followup #1）
   *  1列で製作した場合の必要フィルム長（= パウチピッチ × 数量）がこの値を超えると、
   *  物理可能な最大列数を自動適用し銅版費を按分して単価を下げる。
   *  例: ピッチ130mm×1万個=1300m > 1000m → 多列化（パウチ袋なら2列で650m相当）。
   *  1000m以下は多列化のメリットが小さいため1列を維持。 */
  MULTI_COLUMN_PRODUCTION_THRESHOLD_METERS: 1000,

  /** 最終熱シール層（LLDPE等）の幅加算 - 仕様§5: 原反幅 + 10mm */
  FINAL_LAYER_WIDTH_EXTRA_MM: 10,

  /** 銅版（동판）設定 - 仕様§9 */
  COPPER_PLATE: {
    /** 最小外径（mm） - 仕様§9.1: 機械最小外径 420mm */
    MIN_DIAMETER_MM: 420,
    /** 銅版幅の加算（mm） - 仕様§9.2: 銅版幅 = 原反幅 + 100mm */
    WIDTH_EXTRA_MM: 100,
    /** 新規製作 単価 - 仕様§9.2/§10: 신규 50 */
    PRICE_NEW: 50,
    /** 修正 単価 - 仕様§9.2/§10: 수정 30 */
    PRICE_MODIFY: 30,
  },

  /** ラミネート単価（ウォン/m） - 2026-06-27 改定: ラミ方法の種別（2液ハイ/セミ/無溶剤）を廃止し AL有無で統一。
   *  ラミ回数 = 層数 - 1 */
  LAMINATION_COST_PER_M: {
    /** AL素材なし */
    NO_AL: 65,
    /** AL素材あり */
    WITH_AL: 80,
  } as const,
} as const

// ※ GravureLaminationType 型は 2026-06-27 改定で廃止（ラミ種別→AL有無統一）。
//    AL有無は layers から判定するため、本型は不要。

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
// 国際配送 + 日本国内配送（2026-07-05 追加）
// ========================================
// 韓国→日本の国際配送は既存の 127,980ウォン/箱（=15,358円）を維持。
// これに日本国内配送 1,600円/箱 を追加で加算する。
// 箱容量（kg）は製品タイプで分岐: パウチ=19kg/箱、ロールフィルム=29kg/箱。
export const DELIVERY_CONSTANTS_JP = {
  /** パウチ製品の箱容量（kg） */
  POUCH_BOX_CAPACITY_KG: 19,
  /** ロールフィルムの箱容量（kg） */
  ROLL_FILM_BOX_CAPACITY_KG: 29,
  /** 韓国→日本 国際配送料/箱（ウォン）— 既存値と同一 */
  INTERNATIONAL_COST_PER_BOX_KRW: 127980,
  /** 日本国内 配送料/箱（円）— 2026-07-05 新規追加 */
  DOMESTIC_JP_COST_PER_BOX_JPY: 1600,
} as const

// ========================================
// 発注メール（製造社向け）
// ========================================
// 製造社発注メールの送信先。環境変数で上書き可能。
// 本番では実際の製造社アドレスを MANUFACTURER_ORDER_EMAIL に設定する。
export const MANUFACTURER_ORDER_EMAIL =
  process.env.MANUFACTURER_ORDER_EMAIL || 'info@kanei-trade.co.jp';

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
  ],
  // NY+LLDPE: 2-layer structure
  'ny_lldpe': [
    {
      id: 'light_50',
      name: 'Light (LLDPE 50μ)',
      nameJa: '軽量タイプ (LLDPE 50μ)',
      specification: 'NY 15μ + LLDPE 50μ',
      weightRange: '~70g/m²',
      multiplier: 0.85
    },
    {
      id: 'standard_70',
      name: 'Standard (LLDPE 70μ)',
      nameJa: '標準タイプ (LLDPE 70μ)',
      specification: 'NY 15μ + LLDPE 70μ',
      weightRange: '70~90g/m²',
      multiplier: 1.0
    },
    {
      id: 'heavy_90',
      name: 'Heavy (LLDPE 90μ)',
      nameJa: '高耐久タイプ (LLDPE 90μ)',
      specification: 'NY 15μ + LLDPE 90μ',
      weightRange: '90~100g/m²',
      multiplier: 1.1
    },
    {
      id: 'ultra_100',
      name: 'Ultra (LLDPE 100μ)',
      nameJa: '超耐久タイプ (LLDPE 100μ)',
      specification: 'NY 15μ + LLDPE 100μ',
      weightRange: '100~110g/m²',
      multiplier: 1.15
    },
    {
      id: 'maximum_110',
      name: 'Maximum (LLDPE 110μ)',
      nameJa: '最大耐久タイプ (LLDPE 110μ)',
      specification: 'NY 15μ + LLDPE 110μ',
      weightRange: '110g/m²~',
      multiplier: 1.2
    }
  ],
  // Kraft+VMPET+LLDPE: 3-layer structure (Kraft 80g/m² 固定)
  'kraft_vmpet_lldpe': [
    {
      id: 'light_50',
      name: 'Light (LLDPE 50μ)',
      nameJa: '軽量タイプ (LLDPE 50μ)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 50μ',
      weightRange: '140~160g/m²',
      multiplier: 0.9
    },
    {
      id: 'standard_70',
      name: 'Standard (LLDPE 70μ)',
      nameJa: '標準タイプ (LLDPE 70μ)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 70μ',
      weightRange: '160~180g/m²',
      multiplier: 1.0
    },
    {
      id: 'heavy_90',
      name: 'Heavy (LLDPE 90μ)',
      nameJa: '高耐久タイプ (LLDPE 90μ)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
      weightRange: '180~200g/m²',
      multiplier: 1.1
    },
    {
      id: 'ultra_100',
      name: 'Ultra (LLDPE 100μ)',
      nameJa: '超耐久タイプ (LLDPE 100μ)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 100μ',
      weightRange: '200~220g/m²',
      multiplier: 1.15
    },
    {
      id: 'maximum_110',
      name: 'Maximum (LLDPE 110μ)',
      nameJa: '最大耐久タイプ (LLDPE 110μ)',
      specification: 'Kraft 80g/m² + VMPET 12μ + LLDPE 110μ',
      weightRange: '220g/m²~',
      multiplier: 1.2
    }
  ],
  // Kraft+PET+LLDPE: 3-layer structure (Kraft 80g/m² 固定)
  'kraft_pet_lldpe': [
    {
      id: 'light_50',
      name: 'Light (LLDPE 50μ)',
      nameJa: '軽量タイプ (LLDPE 50μ)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 50μ',
      weightRange: '140~160g/m²',
      multiplier: 0.9
    },
    {
      id: 'standard_70',
      name: 'Standard (LLDPE 70μ)',
      nameJa: '標準タイプ (LLDPE 70μ)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
      weightRange: '160~180g/m²',
      multiplier: 1.0
    },
    {
      id: 'heavy_90',
      name: 'Heavy (LLDPE 90μ)',
      nameJa: '高耐久タイプ (LLDPE 90μ)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 90μ',
      weightRange: '180~200g/m²',
      multiplier: 1.1
    },
    {
      id: 'ultra_100',
      name: 'Ultra (LLDPE 100μ)',
      nameJa: '超耐久タイプ (LLDPE 100μ)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 100μ',
      weightRange: '200~220g/m²',
      multiplier: 1.15
    },
    {
      id: 'maximum_110',
      name: 'Maximum (LLDPE 110μ)',
      nameJa: '最大耐久タイプ (LLDPE 110μ)',
      specification: 'Kraft 80g/m² + PET 12μ + LLDPE 110μ',
      weightRange: '220g/m²~',
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

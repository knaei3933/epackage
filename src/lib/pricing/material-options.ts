/**
 * Material Thickness Options
 *
 * Per-material thickness specifications for the pricing engine.
 * Includes PRICING_CONSTANTS and PRINTING_COSTS references.
 */

import type { ThicknessOption } from './engine-types';
import { PRICING_CONSTANTS, PRINTING_COSTS } from './core/constants';

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
  MANUFACTURER_MARGIN: PRICING_CONSTANTS.MANUFACTURER_MARGIN, // 0.3（製造社原価に30%）
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



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
  printingType?: 'digital' | 'gravure'
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
}

export interface UnifiedQuoteResult {
  unitPrice: number
  totalPrice: number
  currency: string
  breakdown: {
    material: number
    processing: number
    printing: number
    setup: number
    discount: number
    delivery: number
    subtotal: number
    total: number
    // 필름 원가 계산 관련 (새로운 기능)
    filmCost?: number // 필름 원가
    pouchProcessingCost?: number // 파우치 가공비
    baseCost?: number // 기본 원가 (필름 + 가공비)
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

// 素材別厚さオプション (LLDPE厚さ: 50, 70, 90, 100, 110μm)
export const MATERIAL_THICKNESS_OPTIONS: Record<string, ThicknessOption[]> = {
  'opp-alu-foil': [
    {
      id: 'light',
      name: 'Light Weight (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE50μ',
      weightRange: '~100g',
      multiplier: 0.85
    },
    {
      id: 'medium',
      name: 'Standard (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE70μ',
      weightRange: '~300g',
      multiplier: 0.95
    },
    {
      id: 'standard',
      name: 'Regular (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: 'Ultra Heavy (800g+)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'kraft-pe': [
    {
      id: 'light',
      name: 'Light Weight (~200g)',
      nameJa: '軽量タイプ (~200g)',
      specification: 'Kraft紙70μ+PE30μ',
      weightRange: '~200g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: 'Standard (~500g)',
      nameJa: '標準タイプ (~500g)',
      specification: 'Kraft紙80μ+PE40μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'Kraft紙90μ+PE50μ',
      weightRange: '~800g',
      multiplier: 1.1
    }
  ],
  'alu-vapor': [
    {
      id: 'light',
      name: 'Light Weight (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE50μ',
      weightRange: '~100g',
      multiplier: 0.85
    },
    {
      id: 'medium',
      name: 'Standard (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE70μ',
      weightRange: '~300g',
      multiplier: 0.95
    },
    {
      id: 'standard',
      name: 'Regular (~500g)',
      nameJa: 'レギュラータイプ (~500g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE90μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE100μ',
      weightRange: '~800g',
      multiplier: 1.1
    }
  ],
  'pet-transparent': [
    {
      id: 'light',
      name: 'Thin Film (~50g)',
      nameJa: '薄肉タイプ (~50g)',
      specification: 'PET12μ+LLDPE40μ',
      weightRange: '~50g',
      multiplier: 0.85
    },
    {
      id: 'medium',
      name: 'Standard (~200g)',
      nameJa: '標準タイプ (~200g)',
      specification: 'PET12μ+LLDPE50μ',
      weightRange: '~200g',
      multiplier: 0.95
    },
    {
      id: 'standard',
      name: 'Regular (~300g)',
      nameJa: 'レギュラータイプ (~300g)',
      specification: 'PET12μ+LLDPE70μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~600g)',
      nameJa: '高耐久タイプ (~600g)',
      specification: 'PET12μ+LLDPE90μ',
      weightRange: '~600g',
      multiplier: 1.1
    }
  ]
}

// 定数定義
const CONSTANTS = {
  MIN_ORDER_QUANTITY: 100,
  MAX_ORDER_QUANTITY: 100000,
  SMALL_LOT_THRESHOLD: 3000,
  MINIMUM_PRICE: 170000, // 170,000円最低価格

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

  // 印刷設定
  PRINTING_COSTS: {
    digital: {
      setupFee: 10000,      // セットアップ費: 10,000ウォン (¥1,200)
      perColorPerMeter: 475,// 印刷費: 475ウォン/m² (¥57)
      minCharge: 5000
    },
    gravure: {
      setupFee: 50000,      // セットアップ費: 50,000ウォン (¥6,000)
      perColorPerMeter: 200,// 印刷費: 200ウォン/m² (¥24)
      minCharge: 20000
    }
  } as const,

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

  // 필름 원가 계산 설정 (새로운 기능)
  MANUFACTURER_MARGIN: 0.4, // 제조업체 마진율 40%
  SALES_MARGIN: 0.5, // 판매 마진율 50%
  DEFAULT_MARKUP_RATE: 0.5, // デフォルトマージン率 50%
  // 총 마진율 = (1 + 0.4) × (1 + 0.5) - 1 = 1.1 (110%)
  DEFAULT_LOSS_RATE: 0.4, // 기본 로스율 40%
  DEFAULT_MATERIAL_WIDTH: 760, // 기본 원단 폭 (590 또는 760)

  // 파우치 가공비 계산식 (원화/cm) - 가로CM × 계수
  // 최소단가 적용: 삼방 ₩200,000, 스탠드/지퍼 ₩250,000, 지퍼스탠드 ₩280,000, T/M방 ₩440,000
  POUCH_PROCESSING_COSTS: {
    'flat_3_side': { coefficient: 0.4, minimumPrice: 200000 }, // 3방파우치: 가로CM*0.4, 최소 ₩200,000
    'stand_up': { coefficient: 1.2, minimumPrice: 250000 }, // 스탠드파우치: 가로CM*1.2, 최소 ₩250,000
    'zipper': { coefficient: 1.2, minimumPrice: 250000 }, // 지퍼파우치: 가로CM*1.2, 최소 ₩250,000
    'zipper_stand': { coefficient: 1.7, minimumPrice: 280000 }, // 지퍼스탠드: 가로CM*1.7, 최소 ₩280,000
    't_shape': { coefficient: 1.2, minimumPrice: 440000 }, // T방파우치: 가로CM*1.2, 최소 ₩440,000
    'm_shape': { coefficient: 1.2, minimumPrice: 440000 }, // M방파우치: 가로CM*1.2, 최소 ₩440,000
    'box': { coefficient: 1.2, minimumPrice: 250000 }, // 박스형파우치 (지퍼파우치와 동일)
    'other': { coefficient: 1.0, minimumPrice: 200000 } // 기타
  } as const
} as const

export class UnifiedPricingEngine {
  private cache: Map<string, UnifiedQuoteResult> = new Map()
  private settingsCache: Map<string, any> = new Map()
  private settingsCacheExpiry: number = 0
  private readonly SETTINGS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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
   * 캐시를 사용하여 DB 설정 로드 (5분 캐시)
   */
  private async loadSystemSettings(): Promise<Map<string, any>> {
    // Check cache
    const now = Date.now()
    if (this.settingsCacheExpiry > now && this.settingsCache.size > 0) {
      return this.settingsCache
    }

    try {
      // Fetch from API
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to load settings')
      }

      // Flatten grouped settings into key-value map
      const settings = new Map<string, any>()
      if (result.data) {
        // result.data is grouped by category
        for (const [category, items] of Object.entries(result.data)) {
          if (Array.isArray(items)) {
            for (const item of items as any[]) {
              settings.set(`${category}.${item.key}`, item.value)
            }
          }
        }
      }

      // Update cache
      this.settingsCache = settings
      this.settingsCacheExpiry = now + this.SETTINGS_CACHE_TTL

      return settings
    } catch (error) {
      console.error('Failed to load system settings, using defaults:', error)
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
    return settings.get(fullKey) ?? defaultValue
  }

  /**
   * 統合見積計算メソッド
   */
  async calculateQuote(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    // キャッシュキー生成
    const cacheKey = this.generateCacheKey(params)

    // キャッシュ確認
    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)! }
    }

    // SKU計算モード確認 (새로운 기능)
    if (params.useSKUCalculation && params.skuQuantities && params.skuQuantities.length > 0) {
      const skuResult = await this.performSKUCalculation(params)
      // キャッシュ保存（コピー保存）
      this.cache.set(cacheKey, { ...skuResult })
      return skuResult
    }

    // 필름 원가 계산 사용 여부 확인 (새로운 기능)
    const result = params.useFilmCostCalculation
      ? await this.performFilmCostCalculation(params)
      : await this.performCalculation(params)

    // キャッシュ保存（コピー保存）
    this.cache.set(cacheKey, { ...result })

    return result
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
      postProcessingMultiplier = CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      postProcessingOptions,
      printingType = 'digital',
      printingColors = 1,
      doubleSided = false,
      deliveryLocation = 'domestic',
      urgency = 'standard',
      markupRate = CONSTANTS.DEFAULT_MARKUP_RATE,
      materialWidth,
      filmLayers
    } = params

    // パラメータ検証
    this.validateParams(params)

    // 1. 素材費計算
    let materialCost = this.calculateMaterialCost(
      materialId,
      width,
      height,
      depth,
      bagTypeId,
      thicknessSelection,
      thicknessMultiplier
    )

    // 2. 加工費計算
    const processingCost = this.calculateProcessingCost(
      bagTypeId,
      quantity,
      isUVPrinting,
      {
        productWidth: width,  // 製品幅（顧客が指定する印刷幅）を渡す
        filmLayers,
        thicknessSelection
      }
    )

    // ========================================
    // ロールフィルムの場合: 材料費を上書き
    // ========================================
    if (bagTypeId === 'roll_film') {
      // calculateProcessingCost内で計算された材料費と同じ計算を行う
      const lengthInMeters = quantity;
      const productWidth = width;
      const determinedMaterialWidth = determineMaterialWidth(productWidth);
      const widthM = determinedMaterialWidth / 1000;
      const totalMeters = lengthInMeters + 400;

      // フィルム構造レイヤー
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
        const materialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
        if (materialInfo) {
          const thicknessMm = layer.thickness / 1000;
          const weight = thicknessMm * widthM * totalMeters * materialInfo.density;
          const cost = weight * materialInfo.unitPrice;
          materialCostKRW += cost;
        }
      }

      // 円換算（×0.12）
      materialCost = materialCostKRW * 0.12;

      console.log('[RollFilm Material Cost Override]', {
        materialCostKRW,
        materialCostJPY: materialCost
      });
    }

    // 3. 印刷費計算
    // ロールフィルムの場合は、メートル数とフィルム幅を使用
    const printingCost = this.calculatePrintingCost(
      printingType,
      printingColors,
      quantity,
      doubleSided,
      isUVPrinting,
      bagTypeId === 'roll_film' ? {
        lengthInMeters: quantity,  // quantityはロールフィルムの場合は長さ(m)
        filmWidthM: determineMaterialWidth(width) / 1000  // 製品幅から原反幅を決定してm単位に変換
      } : undefined
    )

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
    const securedMeters = theoreticalMeters < 500
      ? 500
      : Math.ceil(theoreticalMeters / 50) * 50;
    const totalUsedMeters = (bagTypeId === 'roll_film' ? quantity : securedMeters) + 400;

    // ========================================
    // 3.5. マット印刷追加費計算
    // ========================================
    // マット印刷追加費(ウォン) = フィルム幅(m) × 20ウォン/m × 使用メートル数
    // 例: 590mm幅フィルム、500m使用 = 0.59 × 20 × 500 = 5,900ウォン追加
    let mattePrintingCost = 0
    const hasMatteFinishing = postProcessingOptions?.includes('matte') ?? false

    if (hasMatteFinishing) {
      // フィルム幅（m）を取得
      const filmWidthM = determineMaterialWidth(width) / 1000

      // マット印刷追加費(ウォン) = フィルム幅(m) × 20ウォン/m × 使用メートル数
      const matteCostKRW = filmWidthM * 20 * totalUsedMeters

      // エン換算（×0.12）
      mattePrintingCost = matteCostKRW * 0.12

      console.log('[Matte Printing Cost]', {
        hasMatteFinishing,
        bagTypeId,
        filmWidthM,
        usedMeters: totalUsedMeters,
        matteCostKRW,
        mattePrintingCost
      })
    }

    // 5. 小量注文手数料計算
    const surcharge = this.calculateSmallLotSurcharge(
      quantity,
      bagTypeId,
      isUVPrinting
    )

    // 6. 中間計算
    const subtotal = materialCost + processingCost + printingCost + mattePrintingCost + surcharge

    // 7. 後加工乗数適用
    const postProcessingAdjustedTotal = subtotal * postProcessingMultiplier

    // 8. 配送料計算
    // ロールフィルム用パラメータの準備
    let rollFilmDeliveryParams: {
      lengthInMeters?: number;
      filmWidthM?: number;
      totalThickness?: number;
      layers?: Array<{ thickness: number, materialId: string }>;
    } | undefined;

    if (bagTypeId === 'roll_film') {
      const lengthInMeters = quantity;
      const productWidth = width;
      const determinedMaterialWidth = determineMaterialWidth(productWidth);
      const filmWidthM = determinedMaterialWidth / 1000;

      // フィルム構造レイヤー
      const defaultLayers: FilmStructureLayer[] = [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'PET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 80 }
      ];
      const layers = filmLayers || defaultLayers;
      const adjustedLayers = this.adjustLayersForThickness(layers, thicknessSelection);

      // 総厚さ計算
      const totalThickness = adjustedLayers.reduce((sum, layer) => sum + layer.thickness, 0);

      rollFilmDeliveryParams = {
        lengthInMeters,
        filmWidthM,
        totalThickness,
        layers: adjustedLayers
      };
    }

    const deliveryCost = this.calculateDeliveryCost(
      deliveryLocation,
      quantity,
      width,
      height,
      depth,
      materialId,
      bagTypeId,
      params.rollCount,
      rollFilmDeliveryParams
    )

    // 9. 最終価格計算
    // 計算式: docs/reports/tjfrP/old/原価計算.md 基づ
    //
    // Step 1: 基礎原価 + 製造者マージン40% = 製造者価格
    const baseCost = postProcessingAdjustedTotal; // 材料原価 + 印刷費 + 加工費
    const manufacturerPrice = baseCost * (1 + CONSTANTS.MANUFACTURER_MARGIN);

    // Step 2: 製造者価格 × 関税1.05 = 輸入原価（配送料は含まない）
    const importCost = manufacturerPrice * 1.05;

    // Step 3: 輸入原価 + 配送費 + 販売マージン = 最終販売価格
    // フィルムロール: 25%、パウチ加工品: markupRate
    const salesMargin = bagTypeId === 'roll_film' ? 0.20 : markupRate;

    console.log('[Sales Margin Calculation]', {
      bagTypeId,
      isRollFilm: bagTypeId === 'roll_film',
      salesMargin,
      markupRate,
      importCost,
      deliveryCost,
      totalBeforeMargin: importCost,
      marginAmount: importCost * salesMargin,
      totalBeforeMinPrice: importCost * (1 + salesMargin) + deliveryCost,
      note: '配送料は販売マージン計算対象外 (ガイド準拠)'
    });

    // ガイド準拠: 配送料はマージン計算対象外
    // 最終販売価格 = (輸入原価 × 販売マージン) + 配送料
    // 輸入原価は既に製造者マージン40% + 関税5%が含まれている
    let total = importCost * (1 + salesMargin) + deliveryCost;

    // Step 4: 最小価格適用（最終段階のみ）
    total = Math.max(total, CONSTANTS.MINIMUM_PRICE);

    // 12. リードタイム計算
    const leadTimeDays = this.calculateLeadTime(
      urgency,
      quantity,
      isUVPrinting,
      postProcessingMultiplier > 1.0
    )

    // 13. 結果構成
    // totalPrice を先に丸めてから unitPrice を計算することで、
    // unitPrice * quantity === totalPrice を保証
    const roundedTotal = Math.round(total);
    const result: UnifiedQuoteResult = {
      unitPrice: Math.round(roundedTotal / quantity),
      totalPrice: roundedTotal,
      currency: 'JPY',
      quantity,
      filmUsage: totalUsedMeters,
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
      postProcessingMultiplier = CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      postProcessingOptions,
      urgency = 'standard'
    } = params

    // 製品幅に基づいて原反幅を動的に決定
    const materialWidth = determineMaterialWidth(width)

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
      PET_density: await this.getSetting('film_material', 'PET_density', undefined),
      AL_density: await this.getSetting('film_material', 'AL_density', undefined),
      LLDPE_density: await this.getSetting('film_material', 'LLDPE_density', undefined),
      NY_density: await this.getSetting('film_material', 'NY_density', undefined),
      VMPET_density: await this.getSetting('film_material', 'VMPET_density', undefined),
      printing_cost_per_m2: await this.getSetting('printing', 'cost_per_m2', undefined),
      matte_cost_per_m: await this.getSetting('printing', 'matte_cost_per_m', undefined),
      lamination_cost_per_m2: await this.getSetting('lamination', 'cost_per_m2', undefined),
      slitter_cost_per_m: await this.getSetting('slitter', 'cost_per_m', undefined),
      slitter_min_cost: await this.getSetting('slitter', 'min_cost', undefined),
      exchange_rate_krw_to_jpy: await this.getSetting('exchange_rate', 'krw_to_jpy', undefined),
      duty_rate_import_duty: await this.getSetting('duty_rate', 'import_duty', undefined),
      delivery_cost_per_roll: await this.getSetting('delivery', 'cost_per_roll', undefined),
      delivery_kg_per_roll: await this.getSetting('delivery', 'kg_per_roll', undefined),
      production_default_loss_rate: await this.getSetting('production', 'default_loss_rate', undefined),
      pricing_default_markup_rate: await this.getSetting('pricing', 'default_markup_rate', undefined)
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
      materialWidth
    }, filmCostSettings)

    // ========================================
    // 2. 파우치 가공비 계산
    // ========================================
    const pouchProcessingCost = this.calculatePouchProcessingCost(
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
    // Step 1: 基礎原価 + 製造者マージン40% = 製造者価格
    const manufacturerPrice = postProcessingAdjustedBaseCost * (1 + CONSTANTS.MANUFACTURER_MARGIN);

    // Step 2: 製造者価格 × 関税1.05 = 輸入原価（配送料は含まない）
    const importCost = manufacturerPrice * 1.05;

    // Step 3: 輸入原価 + 販売マージン = 最終販売価格
    // フィルムロール: 25%、パウチ加工品: markupRate
    const salesMargin = bagTypeId === 'roll_film' ? 0.20 : markupRate;

    // ガイド準拠: 配送料はマージン計算対象外
    // 最終販売価格 = (輸入原価 × 販売マージン) + 配送料
    let totalPrice = importCost * (1 + salesMargin) + deliveryCost;

    // ========================================
    // 7. 最小価格適用（最終段階のみ）
    // ========================================
    // すべての計算を完了した後、MINIMUM_PRICEとの比較を行う
    totalPrice = Math.max(totalPrice, CONSTANTS.MINIMUM_PRICE);
    const unitPrice = totalPrice / quantity

    // マークアップ適用情報を計算
    const markedUpPrice = postProcessingAdjustedBaseCost * (1 + markupRate);
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
    const roundedTotalPrice = Math.round(totalPrice);
    const result: UnifiedQuoteResult = {
      unitPrice: Math.round(roundedTotalPrice / quantity),
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
        rate: markupRate,
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
      postProcessingMultiplier = CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      urgency = 'standard',
      markupRate = CONSTANTS.DEFAULT_MARKUP_RATE,
      materialWidth = CONSTANTS.DEFAULT_MATERIAL_WIDTH,
      filmLayers
    } = params

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
    const skuCostResult = pouchCostCalculator.calculateSKUCost({
      skuQuantities,
      dimensions,
      materialId: params.materialId,
      thicknessSelection: thicknessSelection || 'medium',
      pouchType: mappedPouchType,
      filmLayers,
      postProcessingOptions
    })

    // 総数量計算
    const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0)

    // 総原価（マークアップ前）
    const baseCost = skuCostResult.totalCostJPY

    // ========================================
    // 後加工乗数適用
    // ========================================
    const postProcessingAdjustedBaseCost = baseCost * postProcessingMultiplier

    // ========================================
    // 配送料計算
    // ========================================
    // 配送料は後で追加（マージン計算には含まない）
    // 基本配送料 (50,000円以上無料) - パウチのみ適用
    let deliveryCost = 0
    if (postProcessingAdjustedBaseCost < 50000) {
      deliveryCost = 1500
    }

    // ========================================
    // 最終価格計算
    // ========================================
    // 計算式: docs/reports/tjfrP/old/原価計算.md 基づ
    //
    // Step 1: 基礎原価 + 製造者マージン40% = 製造者価格
    const manufacturerPrice = postProcessingAdjustedBaseCost * (1 + CONSTANTS.MANUFACTURER_MARGIN);

    // Step 2: 製造者価格 × 関税1.05 = 輸入原価（配送料は含まない）
    const importCost = manufacturerPrice * 1.05;

    // Step 3: 輸入原価 + 配送費 + 販売マージン = 最終販売価格
    // フィルムロール: 25%、パウチ加工品: markupRate
    const salesMargin = bagTypeId === 'roll_film' ? 0.20 : markupRate;

    // ガイド準拠: 配送料はマージン計算対象外
    // 最終販売価格 = (輸入原価 × 販売マージン) + 配送料
    let totalPrice = importCost * (1 + salesMargin) + deliveryCost;

    // Step 4: 最小価格適用（最終段階のみ）
    totalPrice = Math.max(totalPrice, CONSTANTS.MINIMUM_PRICE);
    const unitPrice = totalPrice / totalQuantity

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
    const roundedTotalPrice = Math.round(totalPrice);
    const result: UnifiedQuoteResult = {
      unitPrice: Math.round(roundedTotalPrice / totalQuantity),
      totalPrice: roundedTotalPrice,
      currency: 'JPY',
      quantity: totalQuantity,
      skuCount: skuQuantities.length,
      skuQuantities: skuQuantities,
      hasValidSKUData: true,
      filmUsage: skuCostResult.summary.totalWithLossMeters,
      breakdown: {
        material: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.materialCost + sku.costBreakdown.laminationCost + sku.costBreakdown.slitterCost, 0)),
        processing: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.pouchProcessingCost, 0)),
        printing: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.printingCost, 0)),
        setup: 0,
        discount: 0,
        delivery: Math.round(deliveryCost),
        subtotal: Math.round(baseCost),
        total: Math.round(totalPrice),
        filmCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.materialCost, 0)),
        pouchProcessingCost: Math.round(skuCostResult.costPerSKU.reduce((sum, sku) => sum + sku.costBreakdown.pouchProcessingCost, 0)),
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
      thicknessMultiplier: thicknessMultiplier !== 1.0 ? thicknessMultiplier : undefined,
      selectedThicknessName: this.getSelectedThicknessName(params.materialId, thicknessSelection),
      postProcessingMultiplier: postProcessingMultiplier !== 1.0 ? postProcessingMultiplier : undefined,
      minimumPriceApplied: totalPrice <= CONSTANTS.MINIMUM_PRICE,
      skuCostDetails: skuCostResult,
      // 필름 폭 계산 정보
      calculatedFilmWidth: skuCostResult.calculatedFilmWidth,
      materialWidth: skuCostResult.materialWidth,
      theoreticalMeters: skuCostResult.costPerSKU[0]?.theoreticalMeters,
      securedMeters: skuCostResult.summary.totalSecuredMeters,
      totalMeters: skuCostResult.summary.totalWithLossMeters
    }

    return result
  }

  /**
   * 파우치 가공비 계산 (가로 폭 기반)
   * 삼방파우치: 가로CM*0.4, 스탠드파우치: 가로CM*1.2
   * 지퍼파우치(삼방+지퍼): 가로CM*1.2, 지퍼스탠드(스탠드+지퍼): 가로CM*1.7
   * 최소단가 적용: 삼방 ₩200,000, 스탠드 ₩250,000, 지퍼 ₩250,000, 지퍼스탠드 ₩280,000
   *
   * @param bagTypeId 파우치 타입
   * @param width 폭 (mm)
   * @param quantity 수량
   * @param postProcessingOptions 후가공 옵션 (지퍼 등)
   * @returns 파우치 가공비 (엔)
   */
  private calculatePouchProcessingCost(
    bagTypeId: string,
    width: number,
    quantity: number,
    postProcessingOptions?: string[]
  ): number {
    // 기본 파우치 타입 결정
    let basePouchType: 'flat_3_side' | 'stand_up' | 't_shape' | 'm_shape' | 'box' | 'other' = 'other'

    if (bagTypeId.includes('3_side') || bagTypeId.includes('flat') || bagTypeId.includes('three_side')) {
      basePouchType = 'flat_3_side'
    } else if (bagTypeId.includes('stand') || bagTypeId.includes('standing')) {
      basePouchType = 'stand_up'
    } else if (bagTypeId.includes('t_shape') || bagTypeId.includes('T방')) {
      basePouchType = 't_shape'
    } else if (bagTypeId.includes('m_shape') || bagTypeId.includes('M방')) {
      basePouchType = 'm_shape'
    } else if (bagTypeId.includes('box') || bagTypeId.includes('gusset')) {
      basePouchType = 'box'
    }

    // 지퍼 여부 확인 (postProcessingOptions에서 'zipper-yes' 확인)
    const hasZipper = postProcessingOptions?.includes('zipper-yes')

    // 지퍼가 있는 경우 최종 파우치 타입 결정
    let finalPouchType: typeof basePouchType | 'zipper' | 'zipper_stand' = basePouchType

    if (hasZipper) {
      if (basePouchType === 'flat_3_side') {
        finalPouchType = 'zipper' // 삼방 + 지퍼 = 지퍼파우치
      } else if (basePouchType === 'stand_up') {
        finalPouchType = 'zipper_stand' // 스탠드 + 지퍼 = 지퍼스탠드
      }
    }

    // 파우치 가공비 계산식
    const costConfig = CONSTANTS.POUCH_PROCESSING_COSTS[finalPouchType] || CONSTANTS.POUCH_PROCESSING_COSTS.other

    // 가로 폭(cm) 변환
    const widthCM = width / 10

    // 단위당 가공비 (원화)
    const costPerUnitKRW = widthCM * costConfig.coefficient

    // 전체 가공비 (원화)
    const totalCostKRW = costPerUnitKRW * quantity

    // 최소단가 적용
    const finalCostKRW = Math.max(totalCostKRW, costConfig.minimumPrice)

    console.log('[Pouch Processing Cost]', {
      bagTypeId,
      basePouchType,
      hasZipper,
      finalPouchType,
      widthCM,
      coefficient: costConfig.coefficient,
      costPerUnitKRW,
      quantity,
      totalCostKRW,
      minimumPrice: costConfig.minimumPrice,
      finalCostKRW,
      appliedMinimum: totalCostKRW < costConfig.minimumPrice
    })

    // 엔화 환산 (0.12 고정 환율)
    return finalCostKRW * 0.12
  }

  /**
   * bagTypeId를 올바른 pouchType으로 매핑
   * @param bagTypeId 제품 유형 ID
   * @param postProcessingOptions 후가공 옵션 (지퍼 등)
   * @returns 매핑된 파우치 타입
   */
  private mapToPouchType(bagTypeId: string, postProcessingOptions?: string[]): string {
    if (bagTypeId === 'pouch') {
      // 기본 파우치 타입 - 지퍼 유무에 따라 결정
      const hasZipper = postProcessingOptions?.includes('zipper-yes');
      return hasZipper ? 'zipper' : 'flat_3_side';
    }

    // 다른 타입들은 그대로 반환
    return bagTypeId;
  }

  /**
   * パラメータ検証
   */
  private validateParams(params: UnifiedQuoteParams): void {
    const minOrderQty = params.bagTypeId === 'roll_film' ? 500 : CONSTANTS.MIN_ORDER_QUANTITY;
    const unit = params.bagTypeId === 'roll_film' ? 'm' : '個';
    if (params.quantity < minOrderQty) {
      throw new Error(`最小注文数量は${minOrderQty}${unit}です。`)
    }

    if (params.quantity > CONSTANTS.MAX_ORDER_QUANTITY) {
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
  private calculateMaterialCost(
    materialId: string,
    width: number,
    height: number,
    depth: number,
    bagTypeId: string,
    thicknessSelection?: string,
    thicknessMultiplier: number = 1.0
  ): number {
    const materialCostPerKg = (CONSTANTS.MATERIAL_COSTS as any)[materialId] || CONSTANTS.MATERIAL_COSTS.PET

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
  private calculateProcessingCost(
    bagTypeId: string,
    quantity: number,
    isUVPrinting: boolean = false,
    rollFilmParams?: {
      productWidth?: number  // 製品幅（顧客が指定する印刷幅）
      filmLayers?: FilmStructureLayer[]
      thicknessSelection?: string
    }
  ): number {
    // ロールフィルムはM単位で計算（quantityは長さmとして扱う）
    if (bagTypeId === 'roll_film') {
      const lengthInMeters = quantity; // quantityを長さ(m)として解釈

      // 製品幅に基づいて原反幅を動的に決定
      const productWidth = rollFilmParams?.productWidth || 760;
      const determinedMaterialWidth = determineMaterialWidth(productWidth);
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

      // ロス를 포함한 총 길이 (400m 고정 ロス)
      const totalMeters = lengthInMeters + 400;

      // === ラミネートコスト計算 ===
      // ラミネート費(ウォン) = フィルム幅(m) × 使用メートル数 × ラミ単価 × ラミ回数
      // ラミ回数 = 層数 - 1
      // ラミ単価: AL素材あり 75ウォン/m, AL素材なし 65ウォン/m

      // AL素材が含まれているかチェック
      const hasALMaterial = adjustedLayers.some(layer => layer.materialId === 'AL');
      const laminationPricePerMeter = hasALMaterial ? 75 : 65; // ウォン/m
      const laminationCycles = adjustedLayers.length - 1; // 層数 - 1

      const laminateCostKRW = widthM * totalMeters * laminationPricePerMeter * laminationCycles;
      const laminateCostJPY = laminateCostKRW * 0.12;

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
      const slitterCostJPY = slitterCostKRW * 0.12;

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
        const materialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
        if (materialInfo) {
          // 厚み(mm) × 幅(m) × 総長さ(m + 로스) × 比重 × 単価(ウォン/kg)
          const thicknessMm = layer.thickness / 1000; // μm→mm変換
          const weight = thicknessMm * widthM * totalMeters * materialInfo.density; // kg
          const cost = weight * materialInfo.unitPrice; // ウォン
          materialCostKRW += cost;
        }
      }

      // 円換算（×0.12）
      const materialCostJPY = materialCostKRW * 0.12;

      console.log('[RollFilm Cost Calculation Result]', {
        materialCostKRW,
        materialCostJPY,
        lengthInMeters,
        totalMeters,
        lossMeters: 400,
        breakdown: adjustedLayers.map(layer => {
          const materialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
          if (materialInfo) {
            const thicknessMm = layer.thickness / 1000;
            const weight = thicknessMm * widthM * totalMeters * materialInfo.density;
            const cost = weight * materialInfo.unitPrice;
            return {
              materialId: layer.materialId,
              thickness: layer.thickness,
              weight: weight.toFixed(2),
              costKRW: cost.toFixed(0),
              costJPY: (cost * 0.12).toFixed(0)
            };
          }
          return null;
        }).filter(Boolean)
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

    const baseCost = (CONSTANTS.PROCESSING_COSTS as any)[bagTypeId] || CONSTANTS.PROCESSING_COSTS['flat-pouch']
    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')

    // UV印刷時加工費調整
    if (isUVPrinting) {
      return baseCost * 1.1 // 10%追加
    }

    return baseCost * quantity
  }

  /**
   * 印刷費計算
   */
  private calculatePrintingCost(
    printingType: 'digital' | 'gravure',
    colors: number,
    quantity: number,
    doubleSided: boolean = false,
    isUVPrinting: boolean = false,
    rollFilmParams?: {
      lengthInMeters?: number    // ロールフィルムの長さ（m）
      filmWidthM?: number        // フィルム幅
    }
  ): number {
    if (isUVPrinting) {
      return CONSTANTS.UV_PRINTING_FIXED_COST
    }

    const printingConfig = CONSTANTS.PRINTING_COSTS[printingType]
    const colorMultiplier = doubleSided ? 2 : 1

    // ロールフィルムの場合：メートル数とフィルム幅を使用
    if (rollFilmParams?.lengthInMeters && rollFilmParams?.filmWidthM) {
      // 総メートル数 = 使用メートル数 + ロス(400m)
      const totalMeters = rollFilmParams.lengthInMeters + 400;

      // 印刷費用(ウォン) = 総メートル数 × 印刷単価(ウォン/m)
      // 注: perColorPerMeterは「ウォン/m」の単価なので、長さ(m)のみを乗算
      const printingCostKRW = totalMeters * printingConfig.perColorPerMeter;
      const totalCostKRW = Math.max(printingCostKRW, printingConfig.minCharge);

      // 円換算（×0.12）
      const totalCostJPY = totalCostKRW * 0.12;

      console.log('[Printing Cost Roll Film]', {
        filmWidthM: rollFilmParams.filmWidthM,
        lengthInMeters: rollFilmParams.lengthInMeters,
        totalMeters,
        lossMeters: 400,
        perColorPerMeter: printingConfig.perColorPerMeter,
        printingCostKRW,
        totalCostKRW,
        totalCostJPY
      });

      return totalCostJPY;
    }

    // パウチの場合：数量を使用 従来の計算方法
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
  private calculateDeliveryCost(
    deliveryLocation: 'domestic' | 'international',
    quantity: number,
    width: number,
    height: number,
    depth: number,
    materialId: string,
    bagTypeId: string = 'flat_pouch',
    rollCount?: number,
    rollFilmParams?: {
      lengthInMeters?: number    // ロールフィルムの長さ（m）
      filmWidthM?: number        // フィルム幅
      totalThickness?: number    // 総厚さ（μm）
      layers?: Array<{ thickness: number, materialId: string }>  // 各層の情報
    }
  ): number {
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
          const materialInfo = UnifiedPricingEngine.MATERIAL_PRICES_KRW[layer.materialId];
          if (materialInfo) {
            // 重量(kg) = 厚さ(mm) × 幅(m) × 長さ(m) × 比重
            // 配送料は納品数量（deliveryMeters）で計算
            const thicknessMm = layer.thickness / 1000; // μm→mm変換
            const weight = thicknessMm * filmWidthM * deliveryMeters * materialInfo.density;
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
    // 27kg制限の無視 → calculateDeliveryCostByWeightのみ使用
    // if (bagTypeId === 'roll_film' && rollCount) {
    //   return rollCount * DELIVERY_COST_PER_ROLL;
    // }

    const deliveryConfig = CONSTANTS.DELIVERY_COSTS[deliveryLocation]

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

    // 円換算（×0.12）
    const deliveryCostJPY = totalWithSurcharge * 0.12;

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
      params.bagTypeId,
      params.materialId,
      params.width.toString(),
      params.height?.toString() || '0', // heightがundefinedの場合（ロールフィルム等）は'0'を使用
      params.depth?.toString() || '0',
      params.quantity.toString(),
      params.thicknessSelection || 'default',
      params.thicknessMultiplier?.toString() || '1.0',
      params.isUVPrinting?.toString() || 'false',
      params.postProcessingMultiplier?.toString() || '1.0',
      params.printingType || 'digital',
      params.printingColors?.toString() || '1',
      params.doubleSided?.toString() || 'false',
      params.deliveryLocation || 'domestic',
      params.urgency || 'standard',
      // 필름 원가 계산 관련 파라미터 (새로운 기능)
      params.useFilmCostCalculation?.toString() || 'false',
      params.markupRate?.toString() || CONSTANTS.DEFAULT_MARKUP_RATE.toString(),
      params.materialWidth?.toString() || '760', // デフォルト760mm
      params.lossRate?.toString() || CONSTANTS.DEFAULT_LOSS_RATE.toString(),
      // 필름 레이어 정보를 문자열로 변환
      params.filmLayers ? JSON.stringify(params.filmLayers) : 'default'
    ]

    return keyParts.join('|')
  }

  /**
   * キャッシュクリア
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * キャッシュサイズ取得
   */
  public getCacheSize(): number {
    return this.cache.size
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
/**
 * Base Pricing Strategy
 * 価格計算戦略の基底クラス
 * 共通ロジックを提供し、製品タイプ固有の計算はサブクラスで実装
 */

import { PricingStrategy, CalculationParams, QuoteResult, ValidationResult, PriceBreakdown, FilmStructureLayer } from '../core/types'
import {
  PRICING_CONSTANTS,
  MATERIAL_PRICES_KRW,
  POUCH_PROCESSING_COSTS_KRW,
  ZIPPER_SURCHARGE_KRW,
  PRINTING_COSTS,
  DELIVERY_COSTS,
  ROLL_FILM_CONSTANTS,
  DELIVERY_COST_BY_WEIGHT_KRW,
  PACKAGE_WEIGHT_LIMIT_KG,
  DELIVERY_SURCHARGE_RATE,
  POUCH_DELIVERY_CONSTANTS,
  MATERIAL_THICKNESS_OPTIONS,
  POST_PROCESSING_MULTIPLIERS,
} from '../core/constants'

/**
 * 抽象戦略基底クラス
 */
export abstract class BasePricingStrategy implements PricingStrategy {
  abstract readonly strategyId: string
  abstract readonly supportedProductTypes: string[]

  /**
   * 価格計算実行（テンプレートメソッドパターン）
   */
  async calculate(params: CalculationParams): Promise<QuoteResult> {
    // 前処理
    const processedParams = this.preProcessParams(params)

    // 各種コスト計算（サブクラスでオーバーライド可能）
    const materialCost = await this.calculateMaterialCost(processedParams)
    const processingCost = await this.calculateProcessingCost(processedParams)
    const printingCost = await this.calculatePrintingCost(processedParams)
    const setupCost = await this.calculateSetupCost(processedParams)

    // 小計計算
    const subtotal = materialCost + processingCost + printingCost + setupCost

    // 後加工乗数適用
    const postProcessingMultiplier = this.calculatePostProcessingMultiplier(processedParams)
    const adjustedSubtotal = subtotal * postProcessingMultiplier

    // マット印刷追加費
    const matteCost = await this.calculateMattePrintingCost(processedParams)
    const totalWithMatte = adjustedSubtotal + matteCost

    // 最終価格計算（マージン適用）
    const totalPrice = await this.applyMarginAndCalculateFinalPrice(totalWithMatte, processedParams)

    // 配送料計算
    const deliveryCost = await this.calculateDeliveryCost(processedParams)

    // 最終総額
    const finalTotal = totalPrice + deliveryCost

    // 丸め処理（100円単位）
    const roundedTotal = Math.ceil(finalTotal / 100) * 100

    // リードタイム計算
    const leadTimeDays = this.calculateLeadTime(processedParams)

    // 結果構築
    return this.buildResult({
      unitPrice: roundedTotal / processedParams.quantity,
      totalPrice: roundedTotal,
      materialCost,
      processingCost,
      printingCost,
      setupCost,
      deliveryCost,
      postProcessingMultiplier,
      matteCost,
      leadTimeDays,
      params: processedParams,
    })
  }

  /**
   * パラメータ検証
   */
  validate(params: CalculationParams): ValidationResult {
    const errors: string[] = []

    // 共通検証
    if (params.quantity < PRICING_CONSTANTS.MIN_ORDER_QUANTITY) {
      errors.push(`Minimum order quantity is ${PRICING_CONSTANTS.MIN_ORDER_QUANTITY}`)
    }

    if (params.quantity > PRICING_CONSTANTS.MAX_ORDER_QUANTITY) {
      errors.push(`Maximum order quantity is ${PRICING_CONSTANTS.MAX_ORDER_QUANTITY}`)
    }

    if (params.width < 10 || params.width > 1000) {
      errors.push('Width must be between 10mm and 1000mm')
    }

    if (params.height < 10 || params.height > 1000) {
      errors.push('Height must be between 10mm and 1000mm')
    }

    // 製品タイプ固有検証
    const specificErrors = this.validateSpecific(params)
    errors.push(...specificErrors)

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  // ========================================
  // 抽象メソッド（サブクラスで実装必須）
  // ========================================

  /**
   * 素材費計算（サブクラスで実装）
   */
  protected abstract calculateMaterialCost(params: CalculationParams): Promise<number>

  /**
   * 加工費計算（サブクラスで実装）
   */
  protected abstract calculateProcessingCost(params: CalculationParams): Promise<number>

  /**
   * 製品タイプ固有の検証（サブクラスで実装）
   */
  protected abstract validateSpecific(params: CalculationParams): string[]

  // ========================================
  // 共通ヘルパーメソッド
  // ========================================

  /**
   * パラメータ前処理
   */
  protected preProcessParams(params: CalculationParams): CalculationParams {
    return {
      ...params,
      postProcessingMultiplier: params.postProcessingMultiplier ?? this.calculatePostProcessingMultiplier(params),
    }
  }

  /**
   * 印刷費計算（デフォルト実装）
   */
  protected async calculatePrintingCost(params: CalculationParams): Promise<number> {
    const printingType = params.printingType || 'digital'
    const config = PRINTING_COSTS[printingType]
    const meters = this.calculateMetersForPrinting(params)

    const printingCostKRW = meters * config.perColorPerMeter
    const totalCostKRW = Math.max(printingCostKRW, config.minCharge)

    return totalCostKRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 印刷用メートル数計算（サブクラスでオーバーライド）
   */
  protected calculateMetersForPrinting(params: CalculationParams): number {
    return params.quantity // デフォルト実装
  }

  /**
   * 設定費計算（デフォルト実装）
   */
  protected async calculateSetupCost(params: CalculationParams): Promise<number> {
    if (params.isUVPrinting && params.quantity < PRICING_CONSTANTS.SMALL_LOT_THRESHOLD) {
      return 15000 // UV印刷設定費
    }
    return 0 // 版代なし
  }

  /**
   * マット印刷追加費計算
   */
  protected async calculateMattePrintingCost(params: CalculationParams): Promise<number> {
    const hasMatteFinishing = params.postProcessingOptions?.includes('matte') ?? false
    if (!hasMatteFinishing) return 0

    const materialWidthM = this.determineMaterialWidth(params.width) / 1000
    const totalMeters = this.calculateTotalMetersWithLoss(params)
    const matteCostKRW = materialWidthM * ROLL_FILM_CONSTANTS.MATTE_COST_PER_M * totalMeters

    return matteCostKRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 後加工乗数計算
   */
  protected calculatePostProcessingMultiplier(params: CalculationParams): number {
    if (!params.postProcessingOptions || params.postProcessingOptions.length === 0) {
      return PRICING_CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER
    }

    let multiplier = PRICING_CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER
    for (const option of params.postProcessingOptions) {
      const optionMultiplier = POST_PROCESSING_MULTIPLIERS[option]
      if (optionMultiplier) {
        multiplier *= optionMultiplier
      }
    }

    return multiplier
  }

  /**
   * マージン適用と最終価格計算
   */
  protected async applyMarginAndCalculateFinalPrice(baseCost: number, params: CalculationParams): Promise<number> {
    // 製造者価格 = 基礎原価 + 製造者マージン40%
    const manufacturerPrice = baseCost * (1 + PRICING_CONSTANTS.MANUFACTURER_MARGIN)

    // 輸入原価 = 製造者価格 × 関税1.05
    const importCost = manufacturerPrice * (1 + PRICING_CONSTANTS.DUTY_RATE)

    // 最終販売価格 = 輸入原価 × 販売マージン20%
    const salesMargin = PRICING_CONSTANTS.SALES_MARGIN
    const finalPrice = importCost * (1 + salesMargin)

    return finalPrice
  }

  /**
   * 配送料計算（デフォルト実装 - パウチ用）
   */
  protected async calculateDeliveryCost(params: CalculationParams): Promise<number> {
    const { quantity, width, height, filmLayers } = params

    // フィルム構造から重量計算
    const defaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 },
    ]
    const layers = filmLayers || defaultLayers
    const adjustedLayers = this.adjustLayersForThickness(layers, params.thicknessSelection)

    // パウチ面積（m²）
    const pouchAreaM2 = (width * height) / 1000000

    // 各層の重量計算
    let totalWeightPerM2 = 0
    for (const layer of adjustedLayers) {
      const materialInfo = MATERIAL_PRICES_KRW[layer.materialId]
      if (materialInfo) {
        const thicknessMm = layer.thickness / 1000
        totalWeightPerM2 += thicknessMm * materialInfo.density
      }
    }

    // 1個あたりの重量
    const weightPerPouch = pouchAreaM2 * totalWeightPerM2

    // 総配送重量
    const totalWeightKg = weightPerPouch * quantity

    // 箱数計算
    const deliveryBoxes = Math.ceil(totalWeightKg / POUCH_DELIVERY_CONSTANTS.BOX_CAPACITY_KG)

    // 配送料計算
    const totalDeliveryJPY = deliveryBoxes * POUCH_DELIVERY_CONSTANTS.DELIVERY_COST_PER_BOX_KRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY

    return totalDeliveryJPY
  }

  /**
   * リードタイム計算
   */
  protected calculateLeadTime(params: CalculationParams): number {
    let baseDays = 14

    if (params.urgency === 'express') {
      baseDays = 7
    }

    if (params.isUVPrinting) {
      baseDays = Math.max(baseDays - 3, 5)
    }

    if (params.quantity >= 10000) {
      baseDays += 7
    } else if (params.quantity >= 5000) {
      baseDays += 3
    }

    const hasPostProcessing = (params.postProcessingOptions?.length ?? 0) > 0
    if (hasPostProcessing) {
      baseDays += 2
    }

    return baseDays
  }

  /**
   * 結果構築
   */
  protected buildResult(data: {
    unitPrice: number
    totalPrice: number
    materialCost: number
    processingCost: number
    printingCost: number
    setupCost: number
    deliveryCost: number
    postProcessingMultiplier: number
    matteCost: number
    leadTimeDays: number
    params: CalculationParams
  }): QuoteResult {
    return {
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      currency: 'JPY',
      quantity: data.params.quantity,
      breakdown: {
        material: Math.round(data.materialCost),
        processing: Math.round(data.processingCost),
        printing: Math.round(data.printingCost),
        setup: Math.round(data.setupCost),
        discount: 0,
        delivery: Math.round(data.deliveryCost),
        subtotal: Math.round(data.materialCost + data.processingCost + data.printingCost + data.setupCost),
        total: Math.round(data.totalPrice),
      },
      leadTimeDays: data.leadTimeDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      minOrderQuantity: PRICING_CONSTANTS.MIN_ORDER_QUANTITY,
    }
  }

  // ========================================
  // ユーティリティメソッド
  // ========================================

  /**
   * 原反幅決定
   */
  protected determineMaterialWidth(productWidth: number): 590 | 760 {
    return productWidth <= 300 ? 590 : 760
  }

  /**
   * 総メートル数（ロス含む）計算
   */
  protected calculateTotalMetersWithLoss(params: CalculationParams): number {
    return params.quantity + PRICING_CONSTANTS.ROLL_FILM_LOSS_METERS
  }

  /**
   * 厚さ選択によるレイヤー調整
   */
  protected adjustLayersForThickness(baseLayers: FilmStructureLayer[], thicknessSelection?: string): FilmStructureLayer[] {
    if (!thicknessSelection) return baseLayers

    const thicknessMultipliers: Record<string, number> = {
      'light': 0.85,
      'medium': 0.95,
      'standard': 1.0,
      'heavy': 1.1,
      'ultra': 1.2,
    }

    const multiplier = thicknessMultipliers[thicknessSelection]
    if (!multiplier || multiplier === 1.0) return baseLayers

    return baseLayers.map(layer => {
      if (layer.materialId === 'LLDPE' || layer.materialId === 'PE') {
        return { ...layer, thickness: Math.round(layer.thickness * multiplier) }
      }
      return layer
    })
  }

  /**
   * 厚さ名取得
   */
  protected getSelectedThicknessName(materialId: string, thicknessSelection?: string): string | undefined {
    if (!thicknessSelection) return undefined

    const options = MATERIAL_THICKNESS_OPTIONS[materialId]
    if (!options) return undefined

    const selected = options.find(opt => opt.id === thicknessSelection)
    return selected?.nameJa || selected?.name
  }
}

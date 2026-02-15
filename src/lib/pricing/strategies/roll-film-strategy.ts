/**
 * Roll Film Pricing Strategy
 * ロールフィルム製品の価格計算戦略
 */

import { BasePricingStrategy } from './base-strategy'
import { CalculationParams, FilmStructureLayer } from '../core/types'
import {
  PRICING_CONSTANTS,
  MATERIAL_PRICES_KRW,
  ROLL_FILM_CONSTANTS,
  DELIVERY_COST_BY_WEIGHT_KRW,
  PACKAGE_WEIGHT_LIMIT_KG,
  DELIVERY_SURCHARGE_RATE,
} from '../core/constants'

/**
 * ロールフィルム価格計算戦略
 */
export class RollFilmStrategy extends BasePricingStrategy {
  readonly strategyId = 'roll_film'
  readonly supportedProductTypes = ['roll_film']

  /**
   * 素材費計算（ロールフィルム専用）
   */
  protected async calculateMaterialCost(params: CalculationParams): Promise<number> {
    const { width, filmLayers, thicknessSelection, quantity } = params

    // 原反幅決定
    const materialWidth = this.determineMaterialWidth(width)
    const widthM = materialWidth / 1000

    // デフォルトフィルム構造
    const defaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 },
    ]
    const baseLayers = filmLayers || defaultLayers
    const adjustedLayers = this.adjustLayersForThickness(baseLayers, thicknessSelection)

    // 総メートル数（ロス含む）
    const totalMeters = quantity + PRICING_CONSTANTS.ROLL_FILM_LOSS_METERS

    // 各レイヤーの材料費計算（ウォン）
    let materialCostKRW = 0
    for (const layer of adjustedLayers) {
      const materialInfo = MATERIAL_PRICES_KRW[layer.materialId]
      if (materialInfo) {
        const thicknessMm = layer.thickness / 1000
        const weight = thicknessMm * widthM * totalMeters * materialInfo.density
        const cost = weight * materialInfo.unitPrice
        materialCostKRW += cost
      }
    }

    // 円換算
    return materialCostKRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 加工費計算（ラミネート費 + スリッター費）
   */
  protected async calculateProcessingCost(params: CalculationParams): Promise<number> {
    const { width, quantity, filmLayers, thicknessSelection } = params

    // 原反幅（m）
    const materialWidthM = this.determineMaterialWidth(width) / 1000

    // 総メートル数
    const totalMeters = quantity + PRICING_CONSTANTS.ROLL_FILM_LOSS_METERS

    // AL素材チェック
    const layers = filmLayers || []
    const hasALMaterial = layers.some(layer => layer.materialId === 'AL')
    const laminationPricePerMeter = hasALMaterial ? 75 : 65
    const laminationCycles = Math.max(0, layers.length - 1)

    // ラミネート費（ウォン）
    const laminationCostKRW = materialWidthM * totalMeters * laminationPricePerMeter * laminationCycles

    // スリッター費（ウォン）
    const slitterCostKRW = Math.max(
      ROLL_FILM_CONSTANTS.SLITTER_MIN_COST,
      totalMeters * ROLL_FILM_CONSTANTS.SLITTER_COST_PER_M
    )

    // 合計加工費（円換算）
    return (laminationCostKRW + slitterCostKRW) * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 印刷用メートル数計算
   */
  protected calculateMetersForPrinting(params: CalculationParams): number {
    // ロールフィルム: 総メートル数（ロス含む）
    return params.quantity + PRICING_CONSTANTS.ROLL_FILM_LOSS_METERS
  }

  /**
   * 総メートル数（ロス含む）計算（オーバーライド）
   */
  protected calculateTotalMetersWithLoss(params: CalculationParams): number {
    return params.quantity + PRICING_CONSTANTS.ROLL_FILM_LOSS_METERS
  }

  /**
   * 配送料計算（重量ベース）
   */
  protected async calculateDeliveryCost(params: CalculationParams): Promise<number> {
    const { quantity, width, filmLayers, thicknessSelection } = params

    // 納品メートル数（ロスなし）
    const deliveryMeters = quantity
    const filmWidthM = this.determineMaterialWidth(width) / 1000

    // デフォルトフィルム構造
    const defaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 },
    ]
    const baseLayers = filmLayers || defaultLayers
    const adjustedLayers = this.adjustLayersForThickness(baseLayers, thicknessSelection)

    // 重量計算（納品数量ベース）
    let deliveryWeightKg = 0
    for (const layer of adjustedLayers) {
      const materialInfo = MATERIAL_PRICES_KRW[layer.materialId]
      if (materialInfo) {
        const thicknessMm = layer.thickness / 1000
        const weight = thicknessMm * filmWidthM * deliveryMeters * materialInfo.density
        deliveryWeightKg += weight
      }
    }

    // 重量別配送料計算
    return this.calculateDeliveryCostByWeight(deliveryWeightKg)
  }

  /**
   * 重量から配送料計算
   */
  private calculateDeliveryCostByWeight(totalWeightKg: number): number {
    // 包装数計算
    const packageCount = Math.ceil(totalWeightKg / PACKAGE_WEIGHT_LIMIT_KG)
    let totalDeliveryCostKRW = 0

    // 各包装の配送料
    let remainingWeight = totalWeightKg
    for (let i = 0; i < packageCount; i++) {
      const packageWeight = Math.min(remainingWeight, PACKAGE_WEIGHT_LIMIT_KG)
      const weightKey = this.findClosestWeightKey(packageWeight)
      const costKRW = DELIVERY_COST_BY_WEIGHT_KRW[weightKey] || DELIVERY_COST_BY_WEIGHT_KRW[30.0]
      totalDeliveryCostKRW += costKRW
      remainingWeight -= packageWeight
    }

    // 15%加算
    const totalWithSurcharge = totalDeliveryCostKRW * (1 + DELIVERY_SURCHARGE_RATE)

    // 円換算
    return totalWithSurcharge * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 最も近い重量キーを検索
   */
  private findClosestWeightKey(weight: number): number {
    const weights = Object.keys(DELIVERY_COST_BY_WEIGHT_KRW)
      .map(Number)
      .sort((a, b) => a - b)

    for (let i = weights.length - 1; i >= 0; i--) {
      if (weights[i] <= weight) {
        return weights[i]
      }
    }

    return 0.5
  }

  /**
   * マット印刷追加費計算（オーバーライド）
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
   * 製品タイプ固有の検証
   */
  protected validateSpecific(params: CalculationParams): string[] {
    const errors: string[] = []

    // ロールフィルム固有の検証
    if (params.quantity < PRICING_CONSTANTS.ROLL_FILM_MIN_QUANTITY) {
      errors.push(`Minimum roll film quantity is ${PRICING_CONSTANTS.ROLL_FILM_MIN_QUANTITY}m`)
    }

    // ロールフィルムはheightが0でも有効（幅のみで決定）
    // height検証をスキップするため、base-strategyの検証をオーバーライド
    return errors
  }

  /**
   * パラメータ検証（オーバーライド：height検証をスキップ）
   */
  validate(params: CalculationParams): { valid: boolean; errors?: string[] } {
    const errors: string[] = []

    // 共通検証（height以外）
    if (params.quantity < PRICING_CONSTANTS.ROLL_FILM_MIN_QUANTITY) {
      errors.push(`Minimum order quantity is ${PRICING_CONSTANTS.ROLL_FILM_MIN_QUANTITY}`)
    }

    if (params.quantity > PRICING_CONSTANTS.MAX_ORDER_QUANTITY) {
      errors.push(`Maximum order quantity is ${PRICING_CONSTANTS.MAX_ORDER_QUANTITY}`)
    }

    if (params.width < 10 || params.width > 1000) {
      errors.push('Width must be between 10mm and 1000mm')
    }

    // 製品タイプ固有検証
    const specificErrors = this.validateSpecific(params)
    errors.push(...specificErrors)

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }
}

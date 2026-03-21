/**
 * Pouch Pricing Strategy
 * パウチ製品（三辺シール、スタンドアップ等）の価格計算戦略
 */

import { BasePricingStrategy } from './base-strategy'
import { CalculationParams, FilmStructureLayer } from '../core/types'
import {
  PRICING_CONSTANTS,
  MATERIAL_PRICES_KRW,
  POUCH_PROCESSING_COSTS_KRW,
  ZIPPER_SURCHARGE_KRW,
  ROLL_FILM_CONSTANTS,
} from '../core/constants'

/**
 * パウチ製品価格計算戦略
 */
export class PouchStrategy extends BasePricingStrategy {
  readonly strategyId = 'pouch'
  readonly supportedProductTypes = [
    'flat_3_side',
    'stand_up',
    't_shape',
    'm_shape',
    'box',
    'gusset',
    'pouch',
  ]

  /**
   * 素材費計算（フィルム構造に基づく正確な計算）
   */
  protected async calculateMaterialCost(params: CalculationParams): Promise<number> {
    const { width, height, filmLayers, thicknessSelection, materialId } = params

    // 原反幅決定（クラフト材料対応）
    const materialWidth = this.determineMaterialWidth(width, materialId)
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

    // 総使用メートル数（ロス含む）
    const totalMeters = this.calculateTotalMetersWithLoss(params)

    // 各レイヤーの材料費計算（ウォン）
    let materialCostKRW = 0
    for (const layer of adjustedLayers) {
      const materialInfo = MATERIAL_PRICES_KRW[layer.materialId]
      if (materialInfo) {
        let weight: number
        // Kraft等のgrammage指定材料: densityを使用せずgrammageを直接使用
        if (layer.grammage !== undefined) {
          weight = (layer.grammage / 1000) * widthM * totalMeters  // g/m² → kg/m²
        } else {
          // プラスチック材料: thickness × density
          const effectiveThickness = this.getLayerEffectiveThickness(layer)
          const thicknessMm = effectiveThickness / 1000
          weight = thicknessMm * widthM * totalMeters * materialInfo.density
        }
        const cost = weight * materialInfo.unitPrice
        materialCostKRW += cost
      }
    }

    // 円換算
    return materialCostKRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 加工費計算（パウチ加工費）
   */
  protected async calculateProcessingCost(params: CalculationParams): Promise<number> {
    const { bagTypeId, width, quantity, postProcessingOptions } = params

    // 基本パウチタイプ決定
    const basePouchType = this.mapToPouchType(bagTypeId)
    const hasZipper = postProcessingOptions?.includes('zipper-yes') ?? false

    // パウチ加工費設定取得
    const costConfig = POUCH_PROCESSING_COSTS_KRW[basePouchType] || POUCH_PROCESSING_COSTS_KRW.other

    // 基本加工費（ウォン）
    let baseCostKRW = costConfig.minimumPrice

    // ジッパー追加 surcharge
    if (hasZipper) {
      const surcharge = ZIPPER_SURCHARGE_KRW[basePouchType] || 0
      baseCostKRW += surcharge
    }

    // 円換算
    return baseCostKRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
  }

  /**
   * 印刷用メートル数計算
   */
  protected calculateMetersForPrinting(params: CalculationParams): number {
    // ピッチ計算
    let pitch = params.width
    if (this.isTB_M_or_Box(params.bagTypeId)) {
      pitch = params.height
    }

    const pouchesPerMeter = 1000 / pitch
    const theoreticalMeters = params.quantity / pouchesPerMeter

    // 確保量（最小なし、1m単位）
    const securedMeters = Math.ceil(theoreticalMeters)

    // 総メートル数（ロス含む）
    return securedMeters + PRICING_CONSTANTS.ROLL_FILM_LOSS_METERS
  }

  /**
   * 総メートル数（ロス含む）計算（オーバーライド）
   */
  protected calculateTotalMetersWithLoss(params: CalculationParams): number {
    const actualMeters = this.calculateMetersForPrinting(params)

    // Kraft材料: 最低1000mで価格計算（ユーザーが少量注文しても1000m分の価格）
    if (this.isKraftMaterial(params.materialId)) {
      return Math.max(actualMeters, PRICING_CONSTANTS.KRAFT_MIN_QUANTITY_METERS)
    }

    return actualMeters
  }

  /**
   * 製品タイプ固有の検証
   */
  protected validateSpecific(params: CalculationParams): string[] {
    const errors: string[] = []

    // パウチ固有の検証ルール
    if (params.depth !== undefined && params.depth < 0) {
      errors.push('Depth cannot be negative')
    }

    // NY+LLDPEのMOQ検証（500個）
    if (params.materialId === 'ny_lldpe' && params.quantity < PRICING_CONSTANTS.NY_LLDPE_MIN_QUANTITY) {
      errors.push(`NY+LLDPE minimum order quantity is ${PRICING_CONSTANTS.NY_LLDPE_MIN_QUANTITY} pieces`)
    }

    // クラフト材料: 1000m最低価格ルール適用（注文数は自由、価格は1000m分）
    // 検証エラーは出さない（calculateTotalMetersWithLossで最低1000mを適用）

    return errors
  }

  /**
   * クラフト材料か判定
   */
  private isKraftMaterial(materialId: string): boolean {
    return materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe'
  }

  // ========================================
  // ヘルパーメソッド
  // ========================================

  /**
   * bagTypeIdをパウチタイプにマッピング
   */
  private mapToPouchType(bagTypeId: string): string {
    if (bagTypeId.includes('lap_seal') || bagTypeId.includes('t_shape') || bagTypeId.includes('T방')) {
      return 't_shape'
    }
    if (bagTypeId.includes('3_side') || bagTypeId.includes('flat') || bagTypeId.includes('three_side')) {
      return 'flat_3_side'
    }
    if (bagTypeId.includes('stand') || bagTypeId.includes('standing')) {
      return 'stand_up'
    }
    if (bagTypeId.includes('m_shape') || bagTypeId.includes('M방')) {
      return 'm_shape'
    }
    if (bagTypeId.includes('box') || bagTypeId.includes('gusset')) {
      return 'box'
    }
    return 'other'
  }

  /**
   * T/M/Boxタイプか判定
   */
  private isTB_M_or_Box(bagTypeId: string): boolean {
    return bagTypeId.includes('t_shape') ||
           bagTypeId.includes('m_shape') ||
           bagTypeId.includes('box') ||
           bagTypeId.includes('T방') ||
           bagTypeId.includes('M방')
  }
}

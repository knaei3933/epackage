/**
 * Pricing Engine Adapter
 * 既存のunified-pricing-engine.tsから新エンジンへの移行用アダプター
 * 互換性を保ちながら段階的に移行
 */

import { pricingEngine } from './core/engine'
import type { CalculationParams } from './core/types'
import type {
  UnifiedQuoteParams,
  UnifiedQuoteResult
} from '../unified-pricing-engine'

/**
 * 新エンジンのパラメータに変換
 */
function convertToNewParams(oldParams: UnifiedQuoteParams): CalculationParams {
  return {
    bagTypeId: oldParams.bagTypeId,
    materialId: oldParams.materialId,
    width: oldParams.width,
    height: oldParams.height,
    depth: oldParams.depth,
    quantity: oldParams.quantity,
    thicknessSelection: oldParams.thicknessSelection,
    isUVPrinting: oldParams.isUVPrinting,
    postProcessingOptions: oldParams.postProcessingOptions,
    postProcessingMultiplier: oldParams.postProcessingMultiplier,
    printingType: oldParams.printingType,
    printingColors: oldParams.printingColors,
    doubleSided: oldParams.doubleSided,
    deliveryLocation: oldParams.deliveryLocation,
    urgency: oldParams.urgency,
    skuQuantities: oldParams.skuQuantities,
    filmLayers: oldParams.filmLayers,
  }
}

/**
 * 新エンジンの結果を既存形式に変換
 */
function convertToOldResult(newResult: any, originalParams: UnifiedQuoteParams): UnifiedQuoteResult {
  return {
    ...newResult,
    // 既存の追加フィールドを保持
    thicknessMultiplier: originalParams.thicknessMultiplier,
    selectedThicknessName: newResult.selectedThicknessName,
    postProcessingMultiplier: newResult.postProcessingMultiplier,
    minimumPriceApplied: newResult.minimumPriceApplied,
    // SKU関連フィールド（既存エンジンと互換）
    skuQuantities: originalParams.skuQuantities,
    skuCount: originalParams.skuQuantities?.length || 1,
    hasValidSKUData: (originalParams.skuQuantities?.length || 0) > 0,
  }
}

/**
 * 価格計算（アダプター経由）
 * 既存コードからの移行を容易にする
 */
export async function calculateQuoteAdaptive(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
  // 新エンジンを使用
  const newParams = convertToNewParams(params)
  const newResult = await pricingEngine.calculatePrice(newParams)

  return convertToOldResult(newResult, params)
}

/**
 * UnifiedPricingEngine互換クラス
 * 既存コードの置き換え用
 */
export class PricingEngineAdapter {
  private cache: Map<string, UnifiedQuoteResult> = new Map()

  async calculateQuote(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    const cacheKey = JSON.stringify(params)

    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)! }
    }

    const result = await calculateQuoteAdaptive(params)
    this.cache.set(cacheKey, { ...result })

    return result
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

// シングルトンインスタンス
export const pricingEngineAdapter = new PricingEngineAdapter()

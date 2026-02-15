/**
 * Pricing Engine - Core
 * 統一価格計算エンジンのメインクラス
 * 戦略パターンを使用して製品タイプ別の計算を委譲
 */

import { PricingStrategy, CalculationParams, QuoteResult, ValidationResult } from './types'
import { PouchStrategy } from '../strategies/pouch-strategy'
import { RollFilmStrategy } from '../strategies/roll-film-strategy'

/**
 * PricingEngineクラス
 * 戦略パターンによる製品タイプ別計算の振り分け
 */
export class PricingEngine {
  private strategies: Map<string, PricingStrategy> = new Map()
  private cache: Map<string, QuoteResult> = new Map()

  constructor() {
    // デフォルト戦略を登録
    this.registerStrategy(new PouchStrategy())
    this.registerStrategy(new RollFilmStrategy())
  }

  /**
   * 戦略を登録
   */
  registerStrategy(strategy: PricingStrategy): void {
    this.strategies.set(strategy.strategyId, strategy)
    console.log(`[PricingEngine] Registered strategy: ${strategy.strategyId}`)
  }

  /**
   * 製品タイプに対応する戦略を取得
   */
  private getStrategy(bagTypeId: string): PricingStrategy {
    // 直接戦略IDで検索
    if (this.strategies.has(bagTypeId)) {
      return this.strategies.get(bagTypeId)!
    }

    // サポートされる製品タイプを検索
    const strategies = Array.from(this.strategies.values())
    for (const strategy of strategies) {
      if (strategy.supportedProductTypes.includes(bagTypeId)) {
        return strategy
      }
    }

    // デフォルトはPouchStrategy
    return this.strategies.get('pouch')!
  }

  /**
   * 価格計算実行（メインエントリーポイント）
   */
  async calculatePrice(params: CalculationParams): Promise<QuoteResult> {
    // パラメータ検証
    const strategy = this.getStrategy(params.bagTypeId)
    const validation = strategy.validate(params)

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`)
    }

    // キャッシュキー生成
    const cacheKey = this.generateCacheKey(params)

    // キャッシュ確認
    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)! }
    }

    // 戦略で計算実行
    const result = await strategy.calculate(params)

    // キャッシュ保存
    this.cache.set(cacheKey, { ...result })

    return result
  }

  /**
   * キャッシュキー生成
   */
  private generateCacheKey(params: CalculationParams): string {
    return [
      params.bagTypeId,
      params.materialId,
      params.width.toString(),
      params.height.toString(),
      params.depth?.toString() || '0',
      params.quantity.toString(),
      params.thicknessSelection || 'default',
      params.isUVPrinting?.toString() || 'false',
      JSON.stringify(params.postProcessingOptions?.sort() || []),
      params.printingType || 'digital',
      params.deliveryLocation || 'domestic',
      params.urgency || 'standard',
      JSON.stringify(params.skuQuantities || []),
    ].join('|')
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear()
    console.log('[PricingEngine] Cache cleared')
  }

  /**
   * キャッシュサイズ取得
   */
  getCacheSize(): number {
    return this.cache.size
  }
}

// シングルトンインスタンス
export const pricingEngine = new PricingEngine()

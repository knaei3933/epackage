import {
  MultiQuantityRequest,
  MultiQuantityResult,
  QuantityComparison,
  QuantityRecommendation,
  SharedCosts,
  MultiQuantityQuoteState
} from '@/types/multi-quantity'
import { unifiedPricingEngine, UnifiedQuoteParams, UnifiedQuoteResult } from './unified-pricing-engine'

export class MultiQuantityCalculator {
  private sharedCostCache = new Map<string, SharedCosts>()
  private calculationCache = new Map<string, UnifiedQuoteResult>()
  private readonly maxCacheSize = 100
  private readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Calculate quotes for multiple quantities with optimization
   */
  async calculateMultiQuantity(request: MultiQuantityRequest): Promise<MultiQuantityResult> {
    const startTime = Date.now()

    // 1. Generate cache key for shared costs
    const sharedCostsKey = this.generateSharedCostKey(request.baseParams)

    // 2. Calculate or retrieve shared costs
    let sharedCosts = this.sharedCostCache.get(sharedCostsKey)
    if (!sharedCosts) {
      sharedCosts = await this.calculateSharedCosts(request.baseParams)
      this.sharedCostCache.set(sharedCostsKey, sharedCosts)
      this.cleanupCache()
    }

    // 3. Process quantities in optimized batches
    const calculations = new Map<number, UnifiedQuoteResult>()
    const batchSize = 4 // Process 4 quantities in parallel
    const batches = this.chunkArray(request.quantities, batchSize)

    for (const batch of batches) {
      const batchPromises = batch.map(quantity =>
        this.calculateSingleQuantity(request.baseParams, quantity, sharedCosts)
      )

      const batchResults = await Promise.all(batchPromises)
      batchResults.forEach(result => {
        calculations.set(result.quantity, result.quote)
      })
    }

    // 4. Generate comparison analysis
    const comparison = this.generateComparison(calculations, request.quantities)

    // 5. Generate recommendations if requested
    const recommendations = request.includeRecommendations
      ? this.generateRecommendations(calculations, comparison)
      : []

    // 6. Create result
    const result: MultiQuantityResult = {
      baseParams: request.baseParams,
      quantities: request.quantities,
      calculations,
      comparison,
      recommendations,
      metadata: {
        processingTime: Date.now() - startTime,
        currency: 'JPY',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    }

    return result
  }

  /**
   * Calculate shared costs that don't change with quantity
   */
  private async calculateSharedCosts(baseParams: MultiQuantityRequest['baseParams']): Promise<SharedCosts> {
    // Calculate setup fees, tooling costs, base material costs
    const mockQuote = await unifiedPricingEngine.calculateQuote({
      ...baseParams,
      quantity: 100 // Use minimum allowed quantity for base costs
    })

    return {
      setupFee: mockQuote.breakdown.setup || 0,
      toolingCosts: mockQuote.breakdown.processing * 0.2, // Estimate tooling as 20% of processing
      materialBaseCost: mockQuote.breakdown.material,
      validationResults: {
        isValid: true,
        warnings: [],
        errors: []
      }
    }
  }

  /**
   * Calculate quote for a single quantity with shared costs optimization
   */
  private async calculateSingleQuantity(
    baseParams: MultiQuantityRequest['baseParams'],
    quantity: number,
    sharedCosts: SharedCosts
  ): Promise<{ quantity: number; quote: UnifiedQuoteResult }> {
    // Check cache first
    const cacheKey = this.generateQuoteCacheKey(baseParams, quantity)
    const cachedResult = this.calculationCache.get(cacheKey)

    if (cachedResult && this.isCacheValid(cachedResult)) {
      return { quantity, quote: cachedResult }
    }

    // Calculate new quote
    const quoteParams: UnifiedQuoteParams = {
      ...baseParams,
      quantity
    }

    const quote = await unifiedPricingEngine.calculateQuote(quoteParams)

    // Optimize with shared costs (this would require engine modification)
    const optimizedQuote: UnifiedQuoteResult = {
      ...quote,
      // Apply shared cost optimization logic here
      details: {
        ...quote.details || {},
        fixedCost: sharedCosts.setupFee + sharedCosts.toolingCosts,
        variableCostPerUnit: quote.unitPrice * 0.7, // Estimate variable portion
        surcharge: quote.details?.surcharge || 0,
        materialRate: quote.details?.materialRate || 0,
        area: quote.details?.area || 0
      }
    }

    // Cache result
    this.calculationCache.set(cacheKey, optimizedQuote)

    return { quantity, quote: optimizedQuote }
  }

  /**
   * Generate comparison analysis between quantities
   */
  private generateComparison(
    calculations: Map<number, UnifiedQuoteResult>,
    quantities: number[]
  ): QuantityComparison {
    const sortedQuantities = [...quantities].sort((a, b) => a - b)
    const unitPrices = sortedQuantities.map(q => calculations.get(q)?.unitPrice || 0)

    // Find best value (lowest unit price)
    const bestQuantityIndex = unitPrices.indexOf(Math.min(...unitPrices))
    const bestQuantity = sortedQuantities[bestQuantityIndex]
    const highestPrice = Math.max(...unitPrices)
    const lowestPrice = unitPrices[bestQuantityIndex]
    const savings = highestPrice > 0 ? ((highestPrice - lowestPrice) / highestPrice) * 100 : 0

    // Generate price breaks
    const priceBreaks = sortedQuantities.map(quantity => {
      const quote = calculations.get(quantity)
      let discountRate = 0
      let priceBreak = '小ロット'

      if (quantity >= 50000) {
        discountRate = 0.4
        priceBreak = '大ロット'
      } else if (quantity >= 20000) {
        discountRate = 0.3
        priceBreak = '中ロット'
      } else if (quantity >= 10000) {
        discountRate = 0.2
        priceBreak = '標準ロット'
      } else if (quantity >= 5000) {
        discountRate = 0.1
        priceBreak = '小ロット'
      }

      return { quantity, priceBreak, discountRate }
    })

    // Calculate economies of scale
    const economiesOfScale: Record<number, any> = {}
    sortedQuantities.forEach((quantity, index) => {
      if (index === 0) {
        economiesOfScale[quantity] = {
          unitPrice: unitPrices[index],
          totalSavings: 0,
          efficiency: 100
        }
      } else {
        const baselineCost = unitPrices[0] * quantity
        const actualCost = unitPrices[index] * quantity
        const totalSavings = baselineCost - actualCost
        const efficiency = ((baselineCost - actualCost) / baselineCost) * 100 + 100

        economiesOfScale[quantity] = {
          unitPrice: unitPrices[index],
          totalSavings,
          efficiency: Math.round(efficiency)
        }
      }
    })

    // Analyze trends
    const priceTrend = this.analyzePriceTrend(unitPrices)
    const optimalQuantity = this.findOptimalQuantity(sortedQuantities, unitPrices)
    const diminishingReturns = this.calculateDiminishingReturns(sortedQuantities, unitPrices)

    return {
      bestValue: {
        quantity: bestQuantity,
        savings: Math.round(savings),
        percentage: Math.round(savings),
        reason: `最も効率的な単価`
      },
      priceBreaks,
      economiesOfScale,
      trends: {
        priceTrend,
        optimalQuantity,
        diminishingReturns
      }
    }
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    calculations: Map<number, UnifiedQuoteResult>,
    comparison: QuantityComparison
  ): QuantityRecommendation[] {
    const recommendations: QuantityRecommendation[] = []

    // Cost-optimized recommendation
    recommendations.push({
      type: 'cost-optimized',
      title: '最適コスト推奨',
      description: `${comparison.bestValue.quantity}個が最も効率的な単価です`,
      quantity: comparison.bestValue.quantity,
      reasoning: [
        `単価が最も低い (${comparison.bestValue.quantity}個)`,
        `コスト効率: ${comparison.economiesOfScale[comparison.bestValue.quantity]?.efficiency}%`,
        `${comparison.bestValue.percentage}%のコスト削減`
      ],
      estimatedSavings: comparison.bestValue.savings,
      confidence: 0.95
    })

    // Balanced recommendation
    const midQuantity = Math.floor(Object.keys(calculations).length / 2)
    const balancedQuantity = parseInt(Object.keys(calculations)[midQuantity])

    recommendations.push({
      type: 'balanced',
      title: 'バランス推奨',
      description: 'コストと在庫のバランスが取れた数量',
      quantity: balancedQuantity,
      reasoning: [
        '中間的な数量でリスクを分散',
        '適切な在庫管理が可能',
        '合理的な単価を維持'
      ],
      estimatedSavings: comparison.economiesOfScale[balancedQuantity]?.totalSavings || 0,
      confidence: 0.80
    })

    return recommendations
  }

  /**
   * Utility methods
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private generateSharedCostKey(baseParams: MultiQuantityRequest['baseParams']): string {
    return `${baseParams.bagTypeId}-${baseParams.materialId}-${baseParams.width}x${baseParams.height}x${baseParams.depth || 0}`
  }

  private generateQuoteCacheKey(baseParams: MultiQuantityRequest['baseParams'], quantity: number): string {
    return `${this.generateSharedCostKey(baseParams)}-${quantity}-${JSON.stringify(baseParams)}`
  }

  private isCacheValid(result: UnifiedQuoteResult): boolean {
    return result.validUntil > new Date()
  }

  private cleanupCache(): void {
    if (this.sharedCostCache.size > this.maxCacheSize) {
      const firstKey = this.sharedCostCache.keys().next().value
      if (firstKey) {
        this.sharedCostCache.delete(firstKey)
      }
    }

    if (this.calculationCache.size > this.maxCacheSize) {
      const firstKey = this.calculationCache.keys().next().value
      if (firstKey) {
        this.calculationCache.delete(firstKey)
      }
    }
  }

  private analyzePriceTrend(prices: number[]): 'decreasing' | 'stable' | 'increasing' {
    if (prices.length < 2) return 'stable'

    const firstHalf = prices.slice(0, Math.floor(prices.length / 2))
    const secondHalf = prices.slice(Math.floor(prices.length / 2))

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const difference = (secondAvg - firstAvg) / firstAvg

    if (difference < -0.05) return 'decreasing'
    if (difference > 0.05) return 'increasing'
    return 'stable'
  }

  private findOptimalQuantity(quantities: number[], prices: number[]): number {
    let minPricePerUnit = Infinity
    let optimalQuantity = quantities[0]

    for (let i = 0; i < quantities.length; i++) {
      const efficiency = this.calculateEfficiency(quantities, prices, i)
      if (efficiency < minPricePerUnit) {
        minPricePerUnit = efficiency
        optimalQuantity = quantities[i]
      }
    }

    return optimalQuantity
  }

  private calculateEfficiency(quantities: number[], prices: number[], index: number): number {
    const quantity = quantities[index]
    const price = prices[index]
    return price / quantity // Price efficiency ratio
  }

  private calculateDiminishingReturns(quantities: number[], prices: number[]): number {
    if (quantities.length < 3) return 0

    const lastImprovement = (prices[prices.length - 2] - prices[prices.length - 1]) / prices[prices.length - 2]
    const firstImprovement = (prices[0] - prices[1]) / prices[0]

    return Math.round((1 - lastImprovement / firstImprovement) * 100)
  }
}

// Export singleton instance
export const multiQuantityCalculator = new MultiQuantityCalculator()
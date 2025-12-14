import {
  MultiQuantityRequest,
  MultiQuantityResult,
  QuantityComparison,
  QuantityRecommendation,
  SharedCosts,
  MultiQuantityQuoteState
} from '@/types/multi-quantity'
import { unifiedPricingEngine, UnifiedQuoteParams, UnifiedQuoteResult } from './unified-pricing-engine'

// Web Worker for heavy calculations
const calculatorWorker = new Worker('/workers/calculator.worker.js', { type: 'module' })

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface OptimizedCache<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl: number): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  size(): number;
  cleanup(): void;
}

class LRUCache<T> implements OptimizedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, value: T, ttl?: number): void {
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.cache.delete(key);
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl || this.defaultTTL)
    };

    this.cache.set(key, entry);

    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== null;
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export class OptimizedMultiQuantityCalculator {
  private sharedCostCache: OptimizedCache<any>;
  private calculationCache: OptimizedCache<any>;
  private comparisonCache: OptimizedCache<any>;
  private batchQueue: Map<string, Promise<any>> = new Map();
  private readonly maxBatchSize = 8;
  private readonly batchDelay = 50; // ms

  constructor() {
    this.sharedCostCache = new LRUCache(50, 10 * 60 * 1000); // 10 minutes
    this.calculationCache = new LRUCache(200, 5 * 60 * 1000); // 5 minutes
    this.comparisonCache = new LRUCache(100, 3 * 60 * 1000); // 3 minutes

    // Cleanup expired entries every minute
    setInterval(() => {
      this.sharedCostCache.cleanup();
      this.calculationCache.cleanup();
      this.comparisonCache.cleanup();
    }, 60 * 1000);
  }

  /**
   * Calculate quotes for multiple quantities with optimization and Web Workers
   */
  async calculateMultiQuantity(request: MultiQuantityRequest): Promise<MultiQuantityResult> {
    const startTime = performance.now();

    // Generate a unique request key for caching
    const requestKey = this.generateRequestKey(request);

    // Check cache first
    const cachedResult = this.comparisonCache.get(requestKey);
    if (cachedResult) {
      return {
        ...cachedResult,
        metadata: {
          ...cachedResult.metadata,
          fromCache: true,
          processingTime: performance.now() - startTime
        }
      };
    }

    // 1. Calculate shared costs with caching
    const sharedCostsKey = this.generateSharedCostKey(request.baseParams);
    let sharedCosts = this.sharedCostCache.get(sharedCostsKey) as SharedCosts;

    if (!sharedCosts) {
      sharedCosts = await this.calculateSharedCosts(request.baseParams);
      this.sharedCostCache.set(sharedCostsKey, sharedCosts, 10 * 60 * 1000); // 10 minutes
    }

    // 2. Process quantities with optimized batching
    const calculations = await this.processQuantitiesInBatches(
      request.baseParams,
      request.quantities,
      sharedCosts
    );

    // 3. Generate comparison analysis
    const comparison = this.generateComparison(calculations, request.quantities);

    // 4. Generate recommendations if requested
    const recommendations = request.includeRecommendations
      ? await this.generateRecommendationsAsync(calculations, comparison)
      : [];

    // 5. Create result
    const result: MultiQuantityResult = {
      baseParams: request.baseParams,
      quantities: request.quantities,
      calculations,
      comparison,
      recommendations,
      metadata: {
        processingTime: performance.now() - startTime,
        currency: 'JPY',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    };

    // Cache the result
    this.comparisonCache.set(requestKey, result, 3 * 60 * 1000); // 3 minutes

    return result;
  }

  /**
   * Process quantities in optimized batches with Web Worker support
   */
  private async processQuantitiesInBatches(
    baseParams: MultiQuantityRequest['baseParams'],
    quantities: number[],
    sharedCosts: SharedCosts
  ): Promise<Map<number, UnifiedQuoteResult>> {
    const calculations = new Map<number, UnifiedQuoteResult>();
    const uncachedQuantities: number[] = [];

    // First, check cache for each quantity
    for (const quantity of quantities) {
      const cacheKey = this.generateQuoteCacheKey(baseParams, quantity);
      const cachedResult = this.calculationCache.get(cacheKey) as UnifiedQuoteResult;

      if (cachedResult && this.isCacheValid(cachedResult)) {
        calculations.set(quantity, cachedResult);
      } else {
        uncachedQuantities.push(quantity);
      }
    }

    // Process uncached quantities in batches
    if (uncachedQuantities.length > 0) {
      const batchResults = await this.processBatch(baseParams, uncachedQuantities, sharedCosts);

      // Cache and store results
      for (const { quantity, quote } of batchResults) {
        const cacheKey = this.generateQuoteCacheKey(baseParams, quantity);
        this.calculationCache.set(cacheKey, quote, 5 * 60 * 1000); // 5 minutes
        calculations.set(quantity, quote);
      }
    }

    return calculations;
  }

  /**
   * Process a batch of quantities with Web Worker or fallback
   */
  private async processBatch(
    baseParams: MultiQuantityRequest['baseParams'],
    quantities: number[],
    sharedCosts: SharedCosts
  ): Promise<Array<{ quantity: number; quote: UnifiedQuoteResult }>> {
    const batchKey = JSON.stringify({ baseParams, quantities });

    // Check if already processing
    if (this.batchQueue.has(batchKey)) {
      return this.batchQueue.get(batchKey);
    }

    const batchPromise = this.executeBatch(baseParams, quantities, sharedCosts);
    this.batchQueue.set(batchKey, batchPromise);

    try {
      const results = await batchPromise;
      return results;
    } finally {
      this.batchQueue.delete(batchKey);
    }
  }

  /**
   * Execute batch processing with Web Worker or fallback
   */
  private async executeBatch(
    baseParams: MultiQuantityRequest['baseParams'],
    quantities: number[],
    sharedCosts: SharedCosts
  ): Promise<Array<{ quantity: number; quote: UnifiedQuoteResult }>> {
    // Create batches
    const batches = this.chunkArray(quantities, this.maxBatchSize);
    const allResults: Array<{ quantity: number; quote: UnifiedQuoteResult }> = [];

    for (const batch of batches) {
      // Try Web Worker first
      try {
        const workerResults = await this.processWithWorker(baseParams, batch, sharedCosts);
        allResults.push(...workerResults);
      } catch (error) {
        console.warn('Web Worker failed, falling back to main thread:', error);

        // Fallback to main thread processing
        const mainThreadResults = await this.processOnMainThread(baseParams, batch, sharedCosts);
        allResults.push(...mainThreadResults);
      }
    }

    return allResults;
  }

  /**
   * Process batch with Web Worker
   */
  private async processWithWorker(
    baseParams: MultiQuantityRequest['baseParams'],
    quantities: number[],
    sharedCosts: SharedCosts
  ): Promise<Array<{ quantity: number; quote: UnifiedQuoteResult }>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 10000); // 10 second timeout

      const handleMessage = (event: MessageEvent) => {
        clearTimeout(timeout);
        calculatorWorker.removeEventListener('message', handleMessage);
        calculatorWorker.removeEventListener('error', handleError);

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.results);
        }
      };

      const handleError = (error: ErrorEvent) => {
        clearTimeout(timeout);
        calculatorWorker.removeEventListener('message', handleMessage);
        calculatorWorker.removeEventListener('error', handleError);
        reject(error.error);
      };

      calculatorWorker.addEventListener('message', handleMessage);
      calculatorWorker.addEventListener('error', handleError);

      // Send work to worker
      calculatorWorker.postMessage({
        type: 'CALCULATE_BATCH',
        payload: {
          baseParams,
          quantities,
          sharedCosts
        }
      });
    });
  }

  /**
   * Process batch on main thread (fallback)
   */
  private async processOnMainThread(
    baseParams: MultiQuantityRequest['baseParams'],
    quantities: number[],
    sharedCosts: SharedCosts
  ): Promise<Array<{ quantity: number; quote: UnifiedQuoteResult }>> {
    const promises = quantities.map(quantity =>
      this.calculateSingleQuantity(baseParams, quantity, sharedCosts)
    );

    return Promise.all(promises);
  }

  /**
   * Calculate shared costs that don't change with quantity
   */
  private async calculateSharedCosts(baseParams: MultiQuantityRequest['baseParams']): Promise<SharedCosts> {
    const mockQuote = await unifiedPricingEngine.calculateQuote({
      ...baseParams,
      quantity: 1
    });

    return {
      setupFee: mockQuote.breakdown.setup || 0,
      toolingCosts: mockQuote.breakdown.processing * 0.2,
      materialBaseCost: mockQuote.breakdown.material,
      validationResults: {
        isValid: true,
        warnings: [],
        errors: []
      }
    };
  }

  /**
   * Calculate quote for a single quantity
   */
  private async calculateSingleQuantity(
    baseParams: MultiQuantityRequest['baseParams'],
    quantity: number,
    sharedCosts: SharedCosts
  ): Promise<{ quantity: number; quote: UnifiedQuoteResult }> {
    const quoteParams: UnifiedQuoteParams = {
      ...baseParams,
      quantity
    };

    const quote = await unifiedPricingEngine.calculateQuote(quoteParams);

    const optimizedQuote: UnifiedQuoteResult = {
      ...quote,
      details: {
        ...quote.details || {},
        fixedCost: sharedCosts.setupFee + sharedCosts.toolingCosts,
        variableCostPerUnit: quote.unitPrice * 0.7,
        surcharge: quote.details?.surcharge || 0,
        materialRate: quote.details?.materialRate || 0,
        area: quote.details?.area || 0
      }
    };

    return { quantity, quote: optimizedQuote };
  }

  /**
   * Generate comparison analysis (optimized)
   */
  private generateComparison(
    calculations: Map<number, UnifiedQuoteResult>,
    quantities: number[]
  ): QuantityComparison {
    const sortedQuantities = [...quantities].sort((a, b) => a - b);
    const unitPrices = sortedQuantities.map(q => calculations.get(q)?.unitPrice || 0);

    // Find best value
    const bestQuantityIndex = unitPrices.indexOf(Math.min(...unitPrices));
    const bestQuantity = sortedQuantities[bestQuantityIndex];
    const highestPrice = Math.max(...unitPrices);
    const lowestPrice = unitPrices[bestQuantityIndex];
    const savings = highestPrice > 0 ? ((highestPrice - lowestPrice) / highestPrice) * 100 : 0;

    // Generate price breaks (optimized with lookup table)
    const priceBreaks = this.generatePriceBreaks(sortedQuantities, unitPrices);

    // Calculate economies of scale
    const economiesOfScale = this.calculateEconomiesOfScale(sortedQuantities, unitPrices);

    // Analyze trends
    const priceTrend = this.analyzePriceTrend(unitPrices);
    const optimalQuantity = this.findOptimalQuantity(sortedQuantities, unitPrices);
    const diminishingReturns = this.calculateDiminishingReturns(sortedQuantities, unitPrices);

    return {
      bestValue: {
        quantity: bestQuantity,
        savings: Math.round(savings * bestQuantity),
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
    };
  }

  /**
   * Generate recommendations with async processing
   */
  private async generateRecommendationsAsync(
    calculations: Map<number, UnifiedQuoteResult>,
    comparison: QuantityComparison
  ): Promise<QuantityRecommendation[]> {
    // This could be moved to a Web Worker for complex recommendation algorithms
    return new Promise(resolve => {
      const recommendations: QuantityRecommendation[] = [];

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
      });

      // Balanced recommendation
      const quantities = Object.keys(calculations).map(Number).sort((a, b) => a - b);
      const midQuantity = quantities[Math.floor(quantities.length / 2)];

      recommendations.push({
        type: 'balanced',
        title: 'バランス推奨',
        description: 'コストと在庫のバランスが取れた数量',
        quantity: midQuantity,
        reasoning: [
          '中間的な数量でリスクを分散',
          '適切な在庫管理が可能',
          '合理的な単価を維持'
        ],
        estimatedSavings: comparison.economiesOfScale[midQuantity]?.totalSavings || 0,
        confidence: 0.80
      });

      resolve(recommendations);
    });
  }

  /**
   * Optimized price break generation
   */
  private generatePriceBreaks(quantities: number[], unitPrices: number[]) {
    const priceBreakThresholds = [
      { min: 50000, discount: 0.4, label: '大ロット' },
      { min: 20000, discount: 0.3, label: '中ロット' },
      { min: 10000, discount: 0.2, label: '標準ロット' },
      { min: 5000, discount: 0.1, label: '小ロット' }
    ];

    return quantities.map((quantity, index) => {
      const priceBreak = priceBreakThresholds.find(th => quantity >= th.min) ||
                         { min: 0, discount: 0, label: '小ロット' };

      return {
        quantity,
        priceBreak: priceBreak.label,
        discountRate: Math.round(priceBreak.discount * 100)
      };
    });
  }

  /**
   * Optimized economies of scale calculation
   */
  private calculateEconomiesOfScale(quantities: number[], unitPrices: number[]) {
    const economiesOfScale: Record<number, any> = {};
    const baselinePrice = unitPrices[0];

    quantities.forEach((quantity, index) => {
      const currentPrice = unitPrices[index];
      const actualCost = currentPrice * quantity;
      const baselineCost = baselinePrice * quantity;
      const totalSavings = baselineCost - actualCost;
      const efficiency = baselineCost > 0 ? ((actualCost / baselineCost) * 100) : 100;

      economiesOfScale[quantity] = {
        unitPrice: currentPrice,
        totalSavings,
        efficiency: Math.round(efficiency)
      };
    });

    return economiesOfScale;
  }

  // Utility methods
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private generateRequestKey(request: MultiQuantityRequest): string {
    return `req_${JSON.stringify({
      baseParams: request.baseParams,
      quantities: request.quantities.sort((a, b) => a - b),
      comparisonMode: request.comparisonMode,
      includeRecommendations: request.includeRecommendations
    })}`;
  }

  private generateSharedCostKey(baseParams: MultiQuantityRequest['baseParams']): string {
    return `shared_${baseParams.bagTypeId}_${baseParams.materialId}_${baseParams.width}x${baseParams.height}x${baseParams.depth || 0}`;
  }

  private generateQuoteCacheKey(baseParams: MultiQuantityRequest['baseParams'], quantity: number): string {
    return `quote_${this.generateSharedCostKey(baseParams)}_${quantity}_${JSON.stringify({
      isUVPrinting: baseParams.isUVPrinting,
      printingType: baseParams.printingType,
      printingColors: baseParams.printingColors,
      doubleSided: baseParams.doubleSided,
      postProcessingOptions: baseParams.postProcessingOptions,
      deliveryLocation: baseParams.deliveryLocation,
      urgency: baseParams.urgency
    })}`;
  }

  private isCacheValid(result: UnifiedQuoteResult): boolean {
    return result.validUntil > new Date();
  }

  private analyzePriceTrend(prices: number[]): 'decreasing' | 'stable' | 'increasing' {
    if (prices.length < 2) return 'stable';

    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = (secondAvg - firstAvg) / firstAvg;

    if (difference < -0.05) return 'decreasing';
    if (difference > 0.05) return 'increasing';
    return 'stable';
  }

  private findOptimalQuantity(quantities: number[], prices: number[]): number {
    let minPricePerUnit = Infinity;
    let optimalQuantity = quantities[0];

    for (let i = 0; i < quantities.length; i++) {
      const efficiency = prices[i] / quantities[i];
      if (efficiency < minPricePerUnit) {
        minPricePerUnit = efficiency;
        optimalQuantity = quantities[i];
      }
    }

    return optimalQuantity;
  }

  private calculateDiminishingReturns(quantities: number[], prices: number[]): number {
    if (quantities.length < 3) return 0;

    const lastImprovement = (prices[prices.length - 2] - prices[prices.length - 1]) / prices[prices.length - 2];
    const firstImprovement = (prices[0] - prices[1]) / prices[0];

    return Math.round((1 - lastImprovement / firstImprovement) * 100);
  }

  /**
   * Preload cache with common configurations
   */
  async preloadCache(commonConfigs: MultiQuantityRequest[]): Promise<void> {
    const preloadPromises = commonConfigs.map(config =>
      this.calculateMultiQuantity(config).catch(error => {
        console.warn('Failed to preload cache for config:', error);
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.sharedCostCache.clear();
    this.calculationCache.clear();
    this.comparisonCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      sharedCosts: {
        size: this.sharedCostCache.size(),
        maxSize: 50
      },
      calculations: {
        size: this.calculationCache.size(),
        maxSize: 200
      },
      comparisons: {
        size: this.comparisonCache.size(),
        maxSize: 100
      }
    };
  }
}

// Export singleton instance
export const optimizedMultiQuantityCalculator = new OptimizedMultiQuantityCalculator();
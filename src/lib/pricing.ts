import { SimulationState, QuotationResult } from '@/types/simulation';
import { PriceCalculationEngine } from './pricing/PriceCalculationEngine';
import { QuotePatternSpecification, BagSpecifications, PrintingSpecifications, FeatureSpecifications } from './pricing/types';

export class PriceCalculator {
  private engine: PriceCalculationEngine;
  private cache: Map<string, QuotationResult[]> = new Map();

  constructor() {
    this.engine = new PriceCalculationEngine();
  }

  async calculate(state: SimulationState, delayMs: number = 0): Promise<QuotationResult[]> {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const cacheKey = JSON.stringify({
      w: state.width,
      h: state.height,
      bag: state.bagType,
      mat: state.materialGenre,
      surf: state.surfaceMaterial,
      comp: state.materialComposition,
      qty: state.quantities,
      order: state.orderType
    });

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const results = await this.calculateLogic(state);
    this.cache.set(cacheKey, results);
    return results;
  }

  calculateSync(state: SimulationState): QuotationResult[] {
    // Note: The new engine is async, so this method can't be truly sync anymore.
    // However, for compatibility, we might need to handle this.
    // Since the original code used async calculate in most places, we should prefer that.
    // If sync is strictly required, we'd need to refactor the engine to be sync or use a promise handling trick (not recommended).
    // For now, we'll log a warning and return empty or throw if used.
    console.warn('calculateSync is deprecated and may not work as expected with the new async engine.');
    return [];
  }

  private async calculateLogic(state: SimulationState): Promise<QuotationResult[]> {
    const { width, height, quantities, bagType, materialComposition, surfaceMaterial, orderType } = state;

    // Map SimulationState to QuotePatternSpecification
    const bagSpecs: BagSpecifications = {
      bagTypeId: bagType,
      materialCompositionId: materialComposition || 'comp_1', // Default if missing
      width: width,
      height: height,
      depth: 0, // Default depth
      capacity: 0 // Not used for pricing directly yet
    };

    // Default printing specs (can be enhanced if UI adds printing options)
    const printingSpecs: PrintingSpecifications = {
      printColors: { front: 0, back: 0 }, // Assume plain for now unless specified
      printCoverage: 'partial',
      printPosition: 'center',
      printQuality: 'standard'
    };

    // Default feature specs
    const featureSpecs: FeatureSpecifications = {};

    // Map bagType to features if needed (e.g. zipper)
    // Currently bagType is 'flat_3_side', 'stand_up', 'gusset'.
    // If UI adds zipper toggle, we map it here.

    const results: QuotationResult[] = [];

    for (const qty of quantities) {
      if (!qty) continue;

      const pattern: QuotePatternSpecification = {
        skuCount: 1,
        quantity: qty,
        bag: bagSpecs,
        printing: printingSpecs,
        features: featureSpecs
      };

      try {
        const calculation = await this.engine.calculatePrice({
          pattern,
          userTier: 'basic', // Default
          isRepeatOrder: orderType === 'repeat'
        });

        results.push({
          quantity: qty,
          unitPrice: calculation.priceBreakdown.unitPrice,
          totalPrice: calculation.priceBreakdown.totalPrice,
          discountFactor: calculation.priceBreakdown.volumeDiscount
        });
      } catch (error) {
        console.error(`Error calculating price for qty ${qty}:`, error);
        // Fallback or skip
        results.push({ quantity: qty, unitPrice: 0, totalPrice: 0 });
      }
    }

    return results;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const priceCalculator = new PriceCalculator();
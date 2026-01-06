/**
 * useQuoteCalculation Hook
 *
 * Extracts calculation logic from ImprovedQuotingWizard component.
 * Handles price calculations, multi-quantity comparisons, and lead time estimates.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuoteState } from '@/contexts/QuoteContext';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { unifiedPricingEngine, UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import type { MultiQuantityResult } from '@/types/multi-quantity';

export interface CalculationResult {
  currentPrice: number | null;
  quantityQuotes: QuantityQuote[];
  isCalculating: boolean;
  priceChange: 'increase' | 'decrease' | 'stable';
  error: string | null;
}

export interface QuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priceBreak: string;
  discountRate: number;
  minimumPriceApplied: boolean;
}

export interface QuoteCalculationOptions {
  quantities?: number[];
  debounceMs?: number;
}

/**
 * Hook for calculating quote prices with debouncing and multi-quantity support
 */
export function useQuoteCalculation(options: QuoteCalculationOptions = {}) {
  const { quantities: defaultQuantities = [1000, 3000, 5000, 10000], debounceMs = 300 } = options;
  const state = useQuoteState();
  const { calculateMultiQuantity, canCalculateMultiQuantity, state: multiQuantityState } = useMultiQuantityQuote();

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [quantityQuotes, setQuantityQuotes] = useState<QuantityQuote[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceChange, setPriceChange] = useState<'increase' | 'decrease' | 'stable'>('stable');
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking state without triggering re-renders
  const previousPriceRef = useRef<number | null>(null);
  const priceResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate lead time based on specifications
   */
  const calculateLeadTime = useCallback((urgency: string): number => {
    const baseDays = 14; // Standard lead time

    switch (urgency) {
      case 'express':
        return Math.max(7, baseDays - 7);
      case 'priority':
        return Math.max(10, baseDays - 4);
      case 'standard':
      default:
        return baseDays;
    }
  }, []);

  /**
   * Format price break description
   */
  const formatPriceBreak = useCallback((index: number, total: number): string => {
    const breaks = ['100〜', '1,000〜', '3,000〜', '5,000〜', '10,000〜'];
    return breaks[Math.min(index, breaks.length - 1)] + `${total.toLocaleString()}枚`;
  }, []);

  /**
   * Calculate quote for a single quantity
   */
  const calculateSingleQuote = useCallback(async (
    quantity: number
  ): Promise<UnifiedQuoteResult> => {
    return unifiedPricingEngine.calculateQuote({
      bagTypeId: state.bagTypeId,
      materialId: state.materialId,
      width: state.width,
      height: state.height,
      depth: state.depth,
      quantity,
      thicknessSelection: state.thicknessSelection,
      isUVPrinting: state.isUVPrinting,
      printingType: state.printingType,
      printingColors: state.printingColors,
      doubleSided: state.doubleSided,
      deliveryLocation: state.deliveryLocation,
      urgency: state.urgency
    });
  }, [
    state.bagTypeId,
    state.materialId,
    state.width,
    state.height,
    state.depth,
    state.thicknessSelection,
    state.isUVPrinting,
    state.printingType,
    state.printingColors,
    state.doubleSided,
    state.deliveryLocation,
    state.urgency
  ]);

  /**
   * Calculate quotes for multiple quantities
   */
  const calculateMultiQuantityQuotes = useCallback(async (): Promise<{
    recommendedQuote: UnifiedQuoteResult;
    quotes: QuantityQuote[];
  }> => {
    const quantities = state.quantities.length > 0
      ? state.quantities
      : defaultQuantities;

    // Calculate for each quantity
    const quotePromises = quantities.map(async (qty) => {
      try {
        const result = await calculateSingleQuote(qty);
        // Calculate discount rate from breakdown (if subtotal > 0)
        const discountRate = result.breakdown.subtotal > 0
          ? Math.round((result.breakdown.discount / result.breakdown.subtotal) * 100)
          : 0;
        // Check if minimum price was applied (160,000 yen minimum order price)
        const minimumPriceApplied = result.totalPrice <= 160000;
        return {
          quantity: qty,
          unitPrice: result.unitPrice,
          totalPrice: result.totalPrice,
          priceBreak: formatPriceBreak(quantities.indexOf(qty), qty),
          discountRate,
          minimumPriceApplied
        };
      } catch (err) {
        console.error(`Failed to calculate quote for quantity ${qty}:`, err);
        return null;
      }
    });

    const results = await Promise.all(quotePromises);
    const validQuotes = results.filter((q): q is QuantityQuote => q !== null);

    // Use the currently selected quantity as the "recommended" quote
    const selectedQuantity = state.quantity || quantities[0];
    const recommendedQuote = await calculateSingleQuote(selectedQuantity);

    return {
      recommendedQuote,
      quotes: validQuotes
    };
  }, [state.quantities, state.quantity, defaultQuantities, calculateSingleQuote, formatPriceBreak]);

  /**
   * Perform the calculation with debouncing
   */
  useEffect(() => {
    const calculatePrice = async () => {
      if (!state.bagTypeId || !state.materialId || state.width === 0 || state.height === 0) {
        setCurrentPrice(null);
        setQuantityQuotes([]);
        return;
      }

      setIsCalculating(true);
      setError(null);

      try {
        const { recommendedQuote, quotes } = await calculateMultiQuantityQuotes();
        const previousPrice = previousPriceRef.current;

        // Update state only if values have actually changed
        setCurrentPrice(prev => prev !== recommendedQuote.totalPrice ? recommendedQuote.totalPrice : prev);
        setQuantityQuotes(prev => {
          const quotesChanged = quotes.length !== prev.length ||
            quotes.some((q, i) =>
              q.quantity !== prev[i]?.quantity ||
              q.totalPrice !== prev[i]?.totalPrice
            );
          return quotesChanged ? quotes : prev;
        });

        // Detect price change for animation
        if (previousPrice && recommendedQuote.totalPrice > previousPrice) {
          setPriceChange('increase');
        } else if (previousPrice && recommendedQuote.totalPrice < previousPrice) {
          setPriceChange('decrease');
        } else {
          setPriceChange('stable');
        }

        // Reset animation after delay
        if (previousPrice && recommendedQuote.totalPrice !== previousPrice) {
          if (priceResetTimeoutRef.current) {
            clearTimeout(priceResetTimeoutRef.current);
          }
          priceResetTimeoutRef.current = setTimeout(() => setPriceChange('stable'), 500);
        }

        previousPriceRef.current = recommendedQuote.totalPrice;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Price calculation error:', err);
        setCurrentPrice(null);
        setQuantityQuotes([]);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculatePrice, debounceMs);
    return () => {
      clearTimeout(timeoutId);
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
        priceResetTimeoutRef.current = null;
      }
    };
  }, [
    state.bagTypeId,
    state.materialId,
    state.width,
    state.height,
    state.depth,
    state.quantity,
    state.thicknessSelection,
    state.isUVPrinting,
    state.printingType,
    state.printingColors,
    state.doubleSided,
    state.deliveryLocation,
    state.urgency,
    calculateMultiQuantityQuotes,
    debounceMs
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Trigger a full multi-quantity calculation
   */
  const triggerFullCalculation = useCallback(async (): Promise<MultiQuantityResult | null> => {
    if (!canCalculateMultiQuantity()) {
      return null;
    }

    setIsCalculating(true);
    try {
      const result = await calculateMultiQuantity();
      return result;
    } catch (err) {
      console.error('Multi-quantity calculation failed:', err);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [calculateMultiQuantity, canCalculateMultiQuantity]);

  return {
    currentPrice,
    quantityQuotes,
    isCalculating,
    priceChange,
    error,
    leadTime: calculateLeadTime(state.urgency || 'standard'),
    triggerFullCalculation,
    calculateLeadTime
  };
}

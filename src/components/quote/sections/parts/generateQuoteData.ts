/**
 * Generate QuoteData for PDF generation.
 * Extracted from ResultStep for maintainability.
 */

import type { QuoteData } from '@/lib/pdf-generator';
import type { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import type { QuoteState } from '@/contexts/QuoteContext';
import type { MultiQuantityQuote } from './types';

interface GenerateQuoteDataParams {
  state: QuoteState;
  result: UnifiedQuoteResult;
  hasValidSKUData: boolean;
  multiQuantityQuotes: MultiQuantityQuote[];
  overrideQuoteNumber?: string;
}

export function generateQuoteData({
  state,
  result,
  hasValidSKUData,
  multiQuantityQuotes,
  overrideQuoteNumber,
}: GenerateQuoteDataParams): QuoteData {
    const today = new Date();
    const issueDate = today.toISOString().split('T')[0];
    const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate total SKU quantity for PDF generation
    const totalSKUQuantity = state.skuQuantities?.reduce((sum, qty) => sum + (Number(qty) || 0), 0) || state.quantity;

    // Build items from SKU mode, multi-quantity quotes, or single quote
    const items = hasValidSKUData
      ? state.skuQuantities?.map((qty, index) => ({
          productId: 'custom',
          productName: `SKU ${index + 1}`,
          quantity: Number(qty) || 0,
          unitPrice: result.unitPrice,
          totalPrice: (Number(qty) || 0) * result.unitPrice,
        })) || []
      : multiQuantityQuotes.length > 0
      ? multiQuantityQuotes.map((quote) => ({
          productId: 'custom',
          productName: 'カスタム製品',
          quantity: quote.patternTotalQuantity ?? quote.quantity,
          unitPrice: quote.unitPrice,
          totalPrice: quote.totalPrice,
        }))
      : [
          {
            productId: 'custom',
            productName: 'カスタム製品',
            quantity: state.quantity,
            unitPrice: result.unitPrice,
            totalPrice: result.totalPrice,
          },
        ];

    // Generate quotation number if not provided
    const quotationNumber = overrideQuoteNumber || `Q-${Date.now()}`;

    return {
      quotationNumber,
      issueDate,
      expiryDate,
      customer: {
        name: 'お客様',
      },
      items,
      subtotal: result.totalPrice,
      tax: Math.floor(result.totalPrice * 0.1),
      total: Math.floor(result.totalPrice * 1.1),
      // Additional fields used by PDF generator
      bagType: state.bagTypeId,
      material: state.materialId,
      width: state.width,
      height: state.height,
      depth: state.depth,
      thickness: state.thicknessSelection,
      printingType: state.printingType,
      printingColors: state.printingColors,
      doubleSided: state.doubleSided,
      postProcessingOptions: state.postProcessingOptions,
      deliveryLocation: state.deliveryLocation,
      urgency: state.urgency,
      quantity: totalSKUQuantity,
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      leadTimeDays: result.leadTimeDays,
      // Roll film specific
      ...(state.bagTypeId === 'roll_film' && {
        materialWidth: state.materialWidth,
        totalLength: state.totalLength,
        rollCount: state.rollCount,
        pitch: state.pitch,
        filmLayers: state.filmLayers,
      }),
      // Spout pouch specific
      ...(state.bagTypeId === 'spout_pouch' && {
        spoutPosition: state.spoutPosition,
        spoutSize: state.spoutSize,
      }),
      // Side width
      sideWidth: state.sideWidth,
      // Seal width
      sealWidth: state.sealWidth,
      // Content info
      productCategory: state.productCategory,
      contentsType: state.contentsType,
      mainIngredient: state.mainIngredient,
      distributionEnvironment: state.distributionEnvironment,
    } as unknown as QuoteData;
}

/**
 * Build MultiQuantityQuoteInput array for multi-pattern PDF generation.
 */
import type { MultiQuantityQuoteInput } from '@/lib/pdf-generator';

interface BuildMultiPatternPdfInputsParams {
  state: QuoteState;
  multiQuantityQuotes: MultiQuantityQuote[];
}

export function buildMultiPatternPdfInputs({
  state,
  multiQuantityQuotes,
}: BuildMultiPatternPdfInputsParams): MultiQuantityQuoteInput[] {
    return multiQuantityQuotes.map((quote) => {
      const costPerSKU = quote.skuCostDetails?.costPerSKU;
      return {
        quantity: quote.patternTotalQuantity ?? 0,
        unitPrice: quote.unitPrice,
        totalPrice: quote.totalPrice,
        recommendation: {
          method: quote.recommendedMethod === 'gravure' ? 'gravure' : 'digital',
        },
        // SKU数≥2の時のみSKU別明細を付加（金額は按分で generateMultiQuantityHTML 側が算出）
        skuDetails: costPerSKU && costPerSKU.length >= 2
          ? costPerSKU.map((s, i) => ({ label: `SKU ${i + 1}`, quantity: s.quantity }))
          : undefined,
      } as unknown as MultiQuantityQuoteInput;
    });
}

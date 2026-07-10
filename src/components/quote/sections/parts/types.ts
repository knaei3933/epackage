/**
 * Shared types for ResultStep parts.
 */

export interface MultiQuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountRate: number;
  priceBreak: string;
  leadTimeDays: number;
  isValid: boolean;
  recommendedMethod?: string;
  patternTotalQuantity?: number;
  skuCostDetails?: any;
}

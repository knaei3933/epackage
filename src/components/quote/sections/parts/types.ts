/**
 * Shared types for ResultStep parts.
 */

export interface MultiQuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  recommendedMethod?: string;
  patternTotalQuantity?: number;
}

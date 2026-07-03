/**
 * Quote Hooks Index
 *
 * Centralized export of all quote-related hooks
 */

export { useQuoteValidation } from './useQuoteValidation';
export type { ValidationResult, StepValidation, QuoteValidationState } from './useQuoteValidation';

export { useSpecsValidation } from './useSpecsValidation';
export type { SpecsValidationResult, SizeValidation } from './useSpecsValidation';

export { useQuotePersistence } from './useQuotePersistence';

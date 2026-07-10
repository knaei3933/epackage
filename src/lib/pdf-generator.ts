/**
 * PDF Generator Library (barrel re-export)
 *
 * This file is kept for backward compatibility.
 * All implementations have been moved to src/lib/pdf/.
 */

// Types
export type {
  QuoteData,
  QuoteItem,
  InvoiceData,
  InvoiceItem,
  PdfGenerationOptions,
  PdfGenerationResult,
} from './pdf/types';

// Multi-quantity types
export type {
  MultiQuantityQuoteInput,
  MultiQuantityPdfOptions,
} from './pdf/multi-quantity-pdf';

// Constants
export { JAPANESE_CONSTANTS } from './pdf/constants';

// Format helpers
export {
  formatJapaneseDate,
  formatWesternDate,
  formatYen,
  calculateTotals,
  convertNumberToJapaneseKanji,
} from './pdf/format-helpers';

// PDF generators
export { generateQuotePDF } from './pdf/quote-pdf';
export { generateMultiQuantityPDF } from './pdf/multi-quantity-pdf';
export { generateInvoicePDF } from './pdf/invoice-pdf';

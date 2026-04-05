/**
 * Quotation Feature Types
 *
 * 見積もり機能に関連する型定義
 * 統合エンティティ型を再エクスポート
 * @module types/features/quotation
 */

// Re-export from unified entity types
export type {
  QuotationStatus,
  QuotationBase,
  Quotation,
  QuotationItem,
  QuotationItemSpecifications,
  QuotationItemInput,
  QuotationCreateInput,
  QuotationUpdateInput,
  QuotationFilters,
  QuotationPaginationParams,
  QuotationPaginatedResponse,
  SpoutPouchFields,
  CostBreakdown,
  FilmCostDetails,
} from '../entities/quotation';

export {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_VARIANTS,
  isQuotationStatus,
  isQuotationItem,
  isQuotation,
  getQuotationStatusLabel,
  getQuotationStatusVariant,
  calculateQuotationTotal,
} from '../entities/quotation';

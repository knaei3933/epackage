/**
 * Entity Types Index
 *
 * 統一エンティティ型定義のエントリーポイント
 * @module types/entities
 */

// Quotation Types
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
} from './quotation';

export {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_VARIANTS,
  isQuotationStatus,
  isQuotationItem,
  isQuotation,
  getQuotationStatusLabel,
  getQuotationStatusVariant,
  calculateQuotationTotal,
} from './quotation';

// Order Types
export type {
  OrderBase,
  Order,
  OrderItem,
  OrderCreateInput,
  OrderUpdateInput,
  OrderFilters,
  OrderPaginationParams,
  OrderPaginatedResponse,
  OrderStatusHistory,
  OrderCommentType,
  OrderComment,
  OrderCommentCreateInput,
} from './order';

export {
  isOrderItem,
  isOrder,
  calculateOrderTotal,
} from './order';

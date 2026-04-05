/**
 * Order Feature Types
 *
 * 注文機能に関連する型定義
 * 統合エンティティ型を再エクスポート
 * @module types/features/order
 */

// Re-export from unified entity types
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
} from '../entities/order';

export {
  isOrderItem,
  isOrder,
  calculateOrderTotal,
} from '../entities/order';

/**
 * Unified Type Definitions
 *
 * 統合された型定義のエクスポートポイント
 * このファイルからすべての型をインポートできます
 *
 * @example
 * import { Order, Quotation, ApiResponse } from '@/types';
 *
 * @module types/index
 */

// =====================================================
// Core Types
// =====================================================

// Common types
export * from './core/common';

// Database types (enums, base types)
export * from './core/database';

// API types (requests/responses)
export * from './core/api';

// =====================================================
// Entity Types (Unified)
// =====================================================

// Unified entity types
export * from './entities';

// =====================================================
// Feature Types
// =====================================================

// Quotation feature
export * from './features/quotation';

// Order feature
export * from './features/order';

// Shipment feature
export * from './features/shipment';

// Contract feature
export * from './features/contract';

// =====================================================
// Legacy & Specialized Types
// =====================================================
// 以下の型は既存のファイルから継承
// NOTE: 一部の型は新しい構造と重複するため、個別にエクスポート

// Order status (detailed status system)
export type {
  OrderStatus,
  OrderStatusLegacy,
  ProductionSubStatus,
} from './order-status';

export {
  ORDER_STATUS_LABELS,
  PRODUCTION_SUB_STATUS_LABELS,
  OrderStatusMapping,
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  getNextStatuses,
  isTerminalStatus,
  isActiveStatus,
  isOrderStatus,
  isOrderStatusLegacy,
  isProductionSubStatus,
  isProductionStatus,
  isContractStatus,
  isInitialPhase,
  isFulfillmentPhase,
  getStatusLabel,
  getStatusDescription,
  getStatusCategory,
  getProductionSubStatusLabel,
  getStatusProgress,
  getAllStatuses,
  getAllProductionSubStatuses,
} from './order-status';

// State machine
export * from './state-machine';

// AI extraction
export * from './ai-extraction';

// AI file
export * from './aiFile';

// Spec sheet
export * from './specsheet';

// Notification
export * from './notification';

// Order conversion
export * from './order-conversion';

// Portal
export * from './portal';

// Archives
export * from './archives';

// Product content
export * from './product-content';

// Dashboard
export * from './dashboard';

// Email
export * from './email';

// Auth
export * from './auth';

// Simulation
export * from './simulation';

// Multi-quantity
export * from './multi-quantity';

// Catalog
export * from './catalog';

// Premium content
export * from './premium-content';

// Inquiry
export * from './inquiry';

// Quote
export * from './quote';

// Cart
export * from './cart';

// Order status demo
export * from './order-status.demo';

// Admin
export * from './admin';

// Payment
export * from './payment';

// Errors
export * from './errors';

// API validation
export * from './api-validation';

// =====================================================
// Legacy Exports (重複回避のため選択的エクスポート)
// =====================================================
// 以下のファイルは新しい構造と重複するため、個別に必要な型のみエクスポート

// Shipment (original) - Enums and types that don't conflict
// task #8: DeliveryType/DeliveryDestination は ./shipment でなく ./database が正規ソース
export type { DeliveryType, DeliveryDestination } from './database';
export { CarrierType, ShipmentStatus as ShipmentStatusEnum, ShippingServiceType, DeliveryTimeSlot, CARRIER_NAMES } from './shipment';

// task #8: ./contract の QuoteData/QuoteDataWithValidation は存在せず（QuoteData は ../lib/pdf-generator に正あり）
// task #8: ./production モジュールは存在しないため参照削除

// =====================================================
// PDF Generator Types (from lib)
// =====================================================
export type {
  QuoteData,
  QuoteItem,
  InvoiceData,
  InvoiceItem,
  PdfGenerationOptions,
  PdfGenerationResult,
} from '../lib/pdf-generator';

// =====================================================
// Database Full Export
// =====================================================
export type { Database } from './database';

// =====================================================
// Re-export Labels for Backward Compatibility
// =====================================================
import { ORDER_STATUS_LABELS as _ORDER_STATUS_LABELS } from './order-status';
export const OrderStatusLabels = _ORDER_STATUS_LABELS;

// =====================================================
// task #8: 重複エクスポート解消（TS2308）
// -----------------------------------------------------
// 複数モジュールが同名メンバーを export するため、barrel の `export *` が衝突し
// TS2308「Module X has already exported a member named Y」が発生していた。
// 正規ソースから明示的に re-export することで TS が曖昧性を解決する
// （TS 仕様: 明示的 `export` は `export *` より優先される）。
//
// 正規ソース方針:
//   - entities 系（Order/Quotation/...）→ ./entities（統一エンティティ・task #7）
//   - core/common 系（基本型）         → ./core/common
//   - core/api 系                      → ./core/api
//   - core/database 系（DB enum/マスター）→ ./core/database
//   - feature 系                       → ./features/*
//   - 同名異義（User/DashboardStats 等）→ 先勝ち＝現状実質挙動を固定化（実行時不変）
//
// 実行時ロジック不変（型解決のみ）。
// =====================================================

// --- core/common 系（基本型・先勝ちと一致） ---
export type {
  Json,
  Address,
  PaginatedResponse,
  PaginationParams,
  SearchParams,
} from './core/common';

// --- core/api 系 ---
export type { FileUploadResponse } from './core/api';

// --- core/database 系（DB enum / マスター） ---
export type {
  ProductionDataType,
  SpecSheetStatus,
  NotificationType,
  InquiryStatus,
  InquiryType,
  BusinessType,
  ProductCategory,
  UserRole,
  UserStatus,
  ContractStatus,
} from './core/database';

// --- entities 系（統一エンティティ・task #7 正規） ---
// NOTE: QuotationStatus は core/database と値集合が完全一致（6種）のため entities 正規で安全
export type {
  QuotationStatus,
  Quotation,
  QuotationItem,
  Order,
  OrderItem,
  OrderFilters,
  OrderStatusHistory,
} from './entities';

// --- feature 系 ---
export type { Contract } from './features/contract';
export type { DeliveryAddress } from './features/shipment';

// --- 同名異義: 先勝ち＝現状実質挙動を固定化（実行時不変） ---
// DashboardStats: ./portal が先（./dashboard と重複）
// User: ./dashboard が先でかつ緩い型（auth User も構造的部分型で代入可能・新エラー最少）
// ValidationResult: ./aiFile が先
// ValidationError: ./multi-quantity が先
export type { DashboardStats } from './portal';
export type { User } from './dashboard';
export type { ValidationResult } from './aiFile';
export type { ValidationError } from './multi-quantity';

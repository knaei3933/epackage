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
// Feature Types
// =====================================================

// Quotation feature
export * from './features/quotation';

// Order feature
export * from './features/order';

// Inventory feature
export * from './features/inventory';

// Production feature
export * from './features/production';

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
export type { DeliveryType, DeliveryDestination } from './shipment';
export { CarrierType, ShipmentStatus as ShipmentStatusEnum, ShippingServiceType, DeliveryTimeSlot, CARRIER_NAMES } from './shipment';

// Contract (original) - 重複を回避
export type { QuoteData, QuoteDataWithValidation } from './contract';

// Production (original) - 重複を回避
export type {
  ProductionUpdate,
  ProductionLogFormData,
  ProductionImageFormData,
} from './production';

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

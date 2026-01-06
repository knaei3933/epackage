/**
 * Unified Order Status Type System
 *
 * 統一注文ステータス型システム
 *
 * This module provides a comprehensive type system for order status management
 * across the B2B order workflow, bridging database schema and UI requirements.
 *
 * ## Features
 * - Single source of truth for all order statuses
 * - Type-safe status transitions
 * - UI display labels (Japanese/Korean)
 * - Legacy status mapping for backward compatibility
 * - Type guards for status checking
 * - Status progression validation
 *
 * @module types/order-status
 */

// =====================================================
// Core Order Status Types
// =====================================================

/**
 * B2B 10-Step Order Workflow Status
 * B2B 10段階注文ワークフローステータス
 *
 * Complete workflow states from registration to delivery:
 * 1. PENDING - Registration/Authentication pending (登録待)
 * 2. QUOTATION - Quotation request/preparation (見積作成)
 * 3. DATA_RECEIVED - Data entry/AI extraction (データ入稿)
 * 4. WORK_ORDER - Work order/spec sheet creation (作業標準書作成)
 * 5. CONTRACT_SENT - Contract sent to customer (契約書送付)
 * 6. CONTRACT_SIGNED - Electronic signature completed (契約署名完了)
 * 7. PRODUCTION - Production in progress (製造中 - 9 sub-stages)
 * 8. STOCK_IN - Stock-in completed (入庫完了)
 * 9. SHIPPED - Shipment completed (出荷完了)
 * 10. DELIVERED - Delivery completed (配送完了)
 * + CANCELLED - Cancelled (キャンセル)
 */
export type OrderStatus =
  | 'PENDING'           // 登録待 - Registration pending
  | 'QUOTATION'         // 見積 - Quotation in progress
  | 'DATA_RECEIVED'     // データ入稿 - Data received/AI extraction
  | 'WORK_ORDER'        // 作業標準書 - Work order creation
  | 'CONTRACT_SENT'     // 契約書送付 - Contract sent
  | 'CONTRACT_SIGNED'   // 契約署名完了 - Contract signed
  | 'PRODUCTION'        // 製造中 - Production in progress
  | 'STOCK_IN'          // 入庫完了 - Stock-in complete
  | 'SHIPPED'           // 出荷完了 - Shipped
  | 'DELIVERED'         // 配送完了 - Delivered
  | 'CANCELLED';        // キャンセル - Cancelled

/**
 * Legacy OrderStatus for backward compatibility
 * Used in existing dashboard UI components
 * @deprecated Use OrderStatus (uppercase) instead
 */
export type OrderStatusLegacy =
  | 'pending'       // 受付待
  | 'processing'    // 処理中
  | 'manufacturing' // 製造中
  | 'ready'         // 発送待
  | 'shipped'       // 発送完了
  | 'delivered'     // 配送完了
  | 'cancelled';    // キャンセル

/**
 * Production sub-statuses (9 stages)
 * 製造サブステータス（9段階）
 *
 * Detailed breakdown of PRODUCTION status
 */
export type ProductionSubStatus =
  | 'design_received'      // デザインデータ受領
  | 'work_order_created'   // 作業指示書作成
  | 'material_prepared'    // 材料準備完了
  | 'printing'             // 印刷
  | 'lamination'           // ラミネート加工
  | 'slitting'             // スリット加工
  | 'pouch_making'         // パウチ製造
  | 'qc_passed'            // 品質検査合格
  | 'packaged';            // 包装完了

// =====================================================
// Status Display Labels (Internationalized)
// =====================================================

/**
 * Order status display labels with multilingual support
 * UI display names for all order statuses
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, {
  ja: string;       // Japanese display name
  ko: string;       // Korean display name
  en: string;       // English display name
  description: string;  // Detailed description
  category: 'initial' | 'active' | 'production' | 'final' | 'terminated';
}> = {
  PENDING: {
    ja: '登録待',
    ko: '등록 대기',
    en: 'Registration Pending',
    description: '企業会員登録・認証待ち',
    category: 'initial',
  },
  QUOTATION: {
    ja: '見積作成',
    ko: '견적 작성',
    en: 'Quotation',
    description: '見積依頼・作成中',
    category: 'active',
  },
  DATA_RECEIVED: {
    ja: 'データ入稿',
    ko: '데이터 입고',
    en: 'Data Received',
    description: 'デザインデータ入荷・AI抽出',
    category: 'active',
  },
  WORK_ORDER: {
    ja: '作業標準書',
    ko: '작업표준서',
    en: 'Work Order',
    description: '作業標準書・仕様書作成',
    category: 'active',
  },
  CONTRACT_SENT: {
    ja: '契約書送付',
    ko: '계약서 송부',
    en: 'Contract Sent',
    description: '契約書送付中',
    category: 'active',
  },
  CONTRACT_SIGNED: {
    ja: '契約署名完了',
    ko: '계약서 서명 완료',
    en: 'Contract Signed',
    description: '電子署名完了',
    category: 'active',
  },
  PRODUCTION: {
    ja: '製造中',
    ko: '생산 중',
    en: 'Production',
    description: '製造工程中（9段階）',
    category: 'production',
  },
  STOCK_IN: {
    ja: '入庫完了',
    ko: '입고 완료',
    en: 'Stock In',
    description: '製品入庫完了',
    category: 'production',
  },
  SHIPPED: {
    ja: '出荷完了',
    ko: '출하 완료',
    en: 'Shipped',
    description: '出荷完了・配送中',
    category: 'final',
  },
  DELIVERED: {
    ja: '配送完了',
    ko: '배송 완료',
    en: 'Delivered',
    description: 'お客様への配送完了',
    category: 'final',
  },
  CANCELLED: {
    ja: 'キャンセル',
    ko: '취소됨',
    en: 'Cancelled',
    description: '注文キャンセル',
    category: 'terminated',
  },
} as const;

/**
 * Production sub-status display labels
 * UI display names for production sub-stages
 */
export const PRODUCTION_SUB_STATUS_LABELS: Record<ProductionSubStatus, {
  ja: string;
  ko: string;
  en: string;
  stepNumber: number;
}> = {
  design_received: {
    ja: 'デザインデータ受領',
    ko: '디자인 데이터 수령',
    en: 'Design Data Received',
    stepNumber: 1,
  },
  work_order_created: {
    ja: '作業指示書作成',
    ko: '작업 지시서 작성',
    en: 'Work Order Created',
    stepNumber: 2,
  },
  material_prepared: {
    ja: '材料準備完了',
    ko: '자재 준비 완료',
    en: 'Material Prepared',
    stepNumber: 3,
  },
  printing: {
    ja: '印刷',
    ko: '인쇄',
    en: 'Printing',
    stepNumber: 4,
  },
  lamination: {
    ja: 'ラミネート加工',
    ko: '라미네이트 가공',
    en: 'Lamination',
    stepNumber: 5,
  },
  slitting: {
    ja: 'スリット加工',
    ko: '슬릿 가공',
    en: 'Slitting',
    stepNumber: 6,
  },
  pouch_making: {
    ja: 'パウチ製造',
    ko: '파우치 제조',
    en: 'Pouch Making',
    stepNumber: 7,
  },
  qc_passed: {
    ja: '品質検査合格',
    ko: '품질 검사 합격',
    en: 'Quality Check Passed',
    stepNumber: 8,
  },
  packaged: {
    ja: '包装完了',
    ko: '포장 완료',
    en: 'Packaged',
    stepNumber: 9,
  },
} as const;

// =====================================================
// Status Mapping (Legacy Compatibility)
// =====================================================

/**
 * Legacy status mapping utilities
 * Convert between legacy (lowercase) and new (uppercase) formats
 */
export const OrderStatusMapping = {
  /**
   * Convert legacy lowercase status to new uppercase status
   */
  toUppercase: (status: OrderStatusLegacy): OrderStatus => {
    const mapping: Record<OrderStatusLegacy, OrderStatus> = {
      pending: 'PENDING',
      processing: 'PRODUCTION',
      manufacturing: 'PRODUCTION',
      ready: 'WORK_ORDER',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
    };
    return mapping[status];
  },

  /**
   * Convert new uppercase status to legacy lowercase status
   * Maps 10-step workflow to 7-step UI display
   */
  toLowercase: (status: OrderStatus): OrderStatusLegacy => {
    const mapping: Partial<Record<OrderStatus, OrderStatusLegacy>> = {
      PENDING: 'pending',
      QUOTATION: 'processing',
      DATA_RECEIVED: 'processing',
      WORK_ORDER: 'ready',
      CONTRACT_SENT: 'processing',
      CONTRACT_SIGNED: 'processing',
      PRODUCTION: 'manufacturing',
      STOCK_IN: 'ready',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    };
    return mapping[status] || 'pending';
  },

  /**
   * Map database status to simplified UI status
   * Groups related statuses for display purposes
   */
  toUIStatus: (status: OrderStatus): 'new' | 'processing' | 'manufacturing' | 'ready' | 'shipped' | 'delivered' | 'cancelled' => {
    const mapping: Partial<Record<OrderStatus, 'new' | 'processing' | 'manufacturing' | 'ready' | 'shipped' | 'delivered' | 'cancelled'>> = {
      PENDING: 'new',
      QUOTATION: 'processing',
      DATA_RECEIVED: 'processing',
      WORK_ORDER: 'ready',
      CONTRACT_SENT: 'processing',
      CONTRACT_SIGNED: 'processing',
      PRODUCTION: 'manufacturing',
      STOCK_IN: 'ready',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    };
    return mapping[status] || 'new';
  },
} as const;

// =====================================================
// Status Progression & Validation
// =====================================================

/**
 * Valid status transitions
 * Defines allowed workflow progression paths
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['QUOTATION', 'CANCELLED'],
  QUOTATION: ['DATA_RECEIVED', 'CANCELLED'],
  DATA_RECEIVED: ['WORK_ORDER', 'CANCELLED'],
  WORK_ORDER: ['CONTRACT_SENT', 'CANCELLED'],
  CONTRACT_SENT: ['CONTRACT_SIGNED', 'CANCELLED'],
  CONTRACT_SIGNED: ['PRODUCTION', 'CANCELLED'],
  PRODUCTION: ['STOCK_IN', 'CANCELLED'],
  STOCK_IN: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [], // Terminal state
  CANCELLED: [], // Terminal state
} as const;

/**
 * Check if status transition is valid
 * @param from Current status
 * @param to Target status
 * @returns true if transition is allowed
 */
export function isValidStatusTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Get next possible statuses for current status
 * @param current Current order status
 * @returns Array of possible next statuses
 */
export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return VALID_STATUS_TRANSITIONS[current];
}

/**
 * Check if status is a terminal state
 * @param status Order status to check
 * @returns true if status is terminal (no further transitions)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'DELIVERED' || status === 'CANCELLED';
}

/**
 * Check if status is active (in workflow)
 * @param status Order status to check
 * @returns true if status is active (not terminal)
 */
export function isActiveStatus(status: OrderStatus): boolean {
  return !isTerminalStatus(status);
}

// =====================================================
// Type Guards
// =====================================================

/**
 * Type guard: Check if value is valid OrderStatus
 */
export function isOrderStatus(value: string): value is OrderStatus {
  const validStatuses: OrderStatus[] = [
    'PENDING', 'QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER',
    'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION', 'STOCK_IN',
    'SHIPPED', 'DELIVERED', 'CANCELLED',
  ];
  return validStatuses.includes(value as OrderStatus);
}

/**
 * Type guard: Check if value is valid OrderStatusLegacy
 */
export function isOrderStatusLegacy(value: string): value is OrderStatusLegacy {
  const validStatuses: OrderStatusLegacy[] = [
    'pending', 'processing', 'manufacturing',
    'ready', 'shipped', 'delivered', 'cancelled',
  ];
  return validStatuses.includes(value as OrderStatusLegacy);
}

/**
 * Type guard: Check if value is valid ProductionSubStatus
 */
export function isProductionSubStatus(value: string): value is ProductionSubStatus {
  const validStatuses: ProductionSubStatus[] = [
    'design_received', 'work_order_created', 'material_prepared',
    'printing', 'lamination', 'slitting', 'pouch_making',
    'qc_passed', 'packaged',
  ];
  return validStatuses.includes(value as ProductionSubStatus);
}

/**
 * Type guard: Check if status is in production phase
 */
export function isProductionStatus(status: OrderStatus): boolean {
  return status === 'PRODUCTION' || status === 'STOCK_IN';
}

/**
 * Type guard: Check if status is in contract phase
 */
export function isContractStatus(status: OrderStatus): boolean {
  return status === 'CONTRACT_SENT' || status === 'CONTRACT_SIGNED';
}

/**
 * Type guard: Check if status is in initial phase (before production)
 */
export function isInitialPhase(status: OrderStatus): boolean {
  return ['PENDING', 'QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER'].includes(status);
}

/**
 * Type guard: Check if status is in fulfillment phase (production onwards)
 */
export function isFulfillmentPhase(status: OrderStatus): boolean {
  return ['PRODUCTION', 'STOCK_IN', 'SHIPPED', 'DELIVERED'].includes(status);
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Get localized display label for status
 * @param status Order status
 * @param locale Language locale ('ja' | 'ko' | 'en')
 * @returns Localized display name
 */
export function getStatusLabel(
  status: OrderStatus,
  locale: 'ja' | 'ko' | 'en' = 'ja'
): string {
  return ORDER_STATUS_LABELS[status][locale];
}

/**
 * Get status description
 * @param status Order status
 * @returns Status description in Japanese
 */
export function getStatusDescription(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status].description;
}

/**
 * Get status category for UI grouping
 * @param status Order status
 * @returns Status category
 */
export function getStatusCategory(
  status: OrderStatus
): 'initial' | 'active' | 'production' | 'final' | 'terminated' {
  return ORDER_STATUS_LABELS[status].category;
}

/**
 * Get production sub-status label
 * @param subStatus Production sub-status
 * @param locale Language locale ('ja' | 'ko' | 'en')
 * @returns Localized display name
 */
export function getProductionSubStatusLabel(
  subStatus: ProductionSubStatus,
  locale: 'ja' | 'ko' | 'en' = 'ja'
): string {
  return PRODUCTION_SUB_STATUS_LABELS[subStatus][locale];
}

/**
 * Calculate progress percentage for status
 * @param status Current order status
 * @returns Progress percentage (0-100)
 */
export function getStatusProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    PENDING: 0,
    QUOTATION: 10,
    DATA_RECEIVED: 20,
    WORK_ORDER: 30,
    CONTRACT_SENT: 40,
    CONTRACT_SIGNED: 50,
    PRODUCTION: 70,
    STOCK_IN: 85,
    SHIPPED: 95,
    DELIVERED: 100,
    CANCELLED: 0,
  };
  return progressMap[status];
}

/**
 * Get all available statuses
 * @returns Array of all OrderStatus values
 */
export function getAllStatuses(): OrderStatus[] {
  return Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
}

/**
 * Get all production sub-statuses
 * @returns Array of all ProductionSubStatus values
 */
export function getAllProductionSubStatuses(): ProductionSubStatus[] {
  return Object.keys(PRODUCTION_SUB_STATUS_LABELS) as ProductionSubStatus[];
}

// =====================================================
// Default Export Object
// =====================================================

/**
 * Unified order status system exports
 * Provides all types, utilities, and helpers for order status management
 */
const OrderStatusSystem = {
  // Constants
  ORDER_STATUS_LABELS,
  PRODUCTION_SUB_STATUS_LABELS,

  // Mapping
  OrderStatusMapping,

  // Validation
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  getNextStatuses,
  isTerminalStatus,
  isActiveStatus,

  // Type Guards
  isOrderStatus,
  isOrderStatusLegacy,
  isProductionSubStatus,
  isProductionStatus,
  isContractStatus,
  isInitialPhase,
  isFulfillmentPhase,

  // Utilities
  getStatusLabel,
  getStatusDescription,
  getStatusCategory,
  getProductionSubStatusLabel,
  getStatusProgress,
  getAllStatuses,
  getAllProductionSubStatuses,
} as const;

export default OrderStatusSystem;

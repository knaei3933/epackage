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
 * Simplified 10-Step Order Workflow Status
 * 簡素化10段階注文ワークフローステータス
 *
 * Complete workflow states from quotation to delivery:
 * 1. QUOTATION_PENDING - 견적 승인 대기 (견적 작성 완료, 관리자 승인 대기)
 * 2. QUOTATION_APPROVED - 견적 승인 (관리자가 견적 승인)
 * 3. DATA_UPLOAD_PENDING - 데이터 입고 대기 (견적→주문 변환 완료)
 * 4. DATA_UPLOADED - 데이터 입고 완료 (고객이 데이터 업로드)
 * 5. MODIFICATION_REQUESTED - 【新規】管理者修正要求 (管理者が注文内容を修正し、顧客の承認待ち)
 * 6. MODIFICATION_APPROVED - 【新規】修正承認済 (顧客が管理者の修正内容を承認)
 * 7. MODIFICATION_REJECTED - 【新規】修正拒否 (顧客が管理者の修正内容を拒否)
 * 8. CORRECTION_IN_PROGRESS - 교정 작업중 (자동 전환)
 * 9. CORRECTION_COMPLETED - 교정 완료 (디자이너 교정 데이터 업로드)
 * 10. CUSTOMER_APPROVAL_PENDING - 고객 승인 대기 (디자인 확인 중)
 * 11. PRODUCTION - 제조중 (고객 승인 후 제조 시작)
 * 12. READY_TO_SHIP - 출하 예정 (관리자 출하 준비 완료)
 * 13. SHIPPED - 출하 완료 (납품 완료)
 * + CANCELLED - 취소
 */
export type OrderStatus =
  | 'QUOTATION_PENDING'        // 견적 승인 대기 - Draft quotation waiting approval
  | 'QUOTATION_APPROVED'       // 견적 승인 - Quotation approved by admin
  | 'DATA_UPLOAD_PENDING'      // 데이터 입고 대기 - Ready for data upload
  | 'DATA_UPLOADED'            // 데이터 입고 완료 - Customer uploaded data
  | 'MODIFICATION_REQUESTED'   // 【新規】管理者修正要求 - Admin requested modification, awaiting customer approval
  | 'MODIFICATION_APPROVED'    // 【新規】修正承認済 - Customer approved admin's modification
  | 'MODIFICATION_REJECTED'    // 【新規】修正拒否 - Customer rejected admin's modification
  | 'CORRECTION_IN_PROGRESS'   // 교정 작업중 - Correction in progress
  | 'CORRECTION_COMPLETED'     // 교정 완료 - Design correction uploaded
  | 'CUSTOMER_APPROVAL_PENDING'// 고객 승인 대기 - Waiting for customer approval
  | 'PRODUCTION'               // 제조중 - Production in progress
  | 'READY_TO_SHIP'            // 출하 예정 - Ready to ship
  | 'SHIPPED'                  // 출하 완료 - Shipped
  | 'CANCELLED';               // 취소 - Cancelled

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
  QUOTATION_PENDING: {
    ja: '見積承認待ち',
    ko: '견적 승인 대기',
    en: 'Quotation Pending',
    description: '견적 작성 완료, 관리자 승인 대기',
    category: 'initial',
  },
  QUOTATION_APPROVED: {
    ja: '見積承認済',
    ko: '견적 승인',
    en: 'Quotation Approved',
    description: '관리자가 견적 승인',
    category: 'active',
  },
  DATA_UPLOAD_PENDING: {
    ja: 'データ入稿待ち',
    ko: '데이터 입고 대기',
    en: 'Data Upload Pending',
    description: '견적→주문 변환 완료, 데이터 업로드 대기',
    category: 'active',
  },
  DATA_UPLOADED: {
    ja: 'データ入稿完了',
    ko: '데이터 입고 완료',
    en: 'Data Uploaded',
    description: '고객이 디자인 데이터 업로드',
    category: 'active',
  },
  MODIFICATION_REQUESTED: {
    ja: '修正承認待ち',
    ko: '수정 승인 대기',
    en: 'Modification Approval Pending',
    description: '管理者が注文内容を修正し、顧客の承認待ち',
    category: 'active',
  },
  MODIFICATION_APPROVED: {
    ja: '修正承認済',
    ko: '수정 승인 완료',
    en: 'Modification Approved',
    description: '顧客が管理者の修正内容を承認',
    category: 'active',
  },
  MODIFICATION_REJECTED: {
    ja: '修正拒否',
    ko: '수정 거부',
    en: 'Modification Rejected',
    description: '顧客が管理者の修正内容を拒否',
    category: 'active',
  },
  CORRECTION_IN_PROGRESS: {
    ja: '校正作業中',
    ko: '교정 작업중',
    en: 'Correction In Progress',
    description: '디자이너가 교정 작업 진행 중',
    category: 'active',
  },
  CORRECTION_COMPLETED: {
    ja: '校正完了',
    ko: '교정 완료',
    en: 'Correction Completed',
    description: '디자이너가 교정 데이터 업로드 완료',
    category: 'active',
  },
  CUSTOMER_APPROVAL_PENDING: {
    ja: '顧客承認待ち',
    ko: '고객 승인 대기',
    en: 'Customer Approval Pending',
    description: '교정된 디자인을 고객이 확인 중',
    category: 'active',
  },
  PRODUCTION: {
    ja: '製造中',
    ko: '생산 중',
    en: 'Production',
    description: '고객 승인 후 제조 시작',
    category: 'production',
  },
  READY_TO_SHIP: {
    ja: '出荷予定',
    ko: '출하 예정',
    en: 'Ready to Ship',
    description: '관리자가 출하 준비 완료',
    category: 'final',
  },
  SHIPPED: {
    ja: '出荷完了',
    ko: '출하 완료',
    en: 'Shipped',
    description: '납품 완료',
    category: 'final',
  },
  CANCELLED: {
    ja: 'キャンセル',
    ko: '취소',
    en: 'Cancelled',
    description: '주문 취소',
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
      pending: 'QUOTATION_PENDING',
      processing: 'PRODUCTION',
      manufacturing: 'PRODUCTION',
      ready: 'READY_TO_SHIP',
      shipped: 'SHIPPED',
      delivered: 'SHIPPED', // 10-step workflow ends at SHIPPED
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
      QUOTATION_PENDING: 'pending',
      QUOTATION_APPROVED: 'processing',
      DATA_UPLOAD_PENDING: 'processing',
      DATA_UPLOADED: 'processing',
      MODIFICATION_REQUESTED: 'processing',
      MODIFICATION_APPROVED: 'processing',
      MODIFICATION_REJECTED: 'processing',
      CORRECTION_IN_PROGRESS: 'processing',
      CORRECTION_COMPLETED: 'processing',
      CUSTOMER_APPROVAL_PENDING: 'processing',
      PRODUCTION: 'manufacturing',
      READY_TO_SHIP: 'ready',
      SHIPPED: 'shipped',
      CANCELLED: 'cancelled',
    };
    return mapping[status] || 'pending';
  },

  /**
   * Map database status to simplified UI status
   * Groups related statuses for display purposes
   */
  toUIStatus: (status: OrderStatus): 'new' | 'processing' | 'manufacturing' | 'ready' | 'shipped' | 'cancelled' => {
    const mapping: Partial<Record<OrderStatus, 'new' | 'processing' | 'manufacturing' | 'ready' | 'shipped' | 'cancelled'>> = {
      QUOTATION_PENDING: 'new',
      QUOTATION_APPROVED: 'processing',
      DATA_UPLOAD_PENDING: 'processing',
      DATA_UPLOADED: 'processing',
      MODIFICATION_REQUESTED: 'processing',
      MODIFICATION_APPROVED: 'processing',
      MODIFICATION_REJECTED: 'processing',
      CORRECTION_IN_PROGRESS: 'processing',
      CORRECTION_COMPLETED: 'processing',
      CUSTOMER_APPROVAL_PENDING: 'processing',
      PRODUCTION: 'manufacturing',
      READY_TO_SHIP: 'ready',
      SHIPPED: 'shipped',
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
 *
 * 새로운 단순화 워크플로우:
 * 1. 견적 승인 대기 → 견적 승인
 * 2. 견적 승인 → 데이터 입고 대기
 * 3. 데이터 입고 대기 → 데이터 입고 완료
 * 4. 데이터 입고 완료 → 교정 작업중 (자동)
 * 5. 교정 작업중 → 교정 완료
 * 6. 교정 완료 → 고객 승인 대기
 * 7. 고객 승인 대기 → 제조중
 * 8. 제조중 → 출하 예정
 * 9. 출하 예정 → 출하 완료
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  QUOTATION_PENDING: ['QUOTATION_APPROVED', 'CANCELLED'],
  QUOTATION_APPROVED: ['DATA_UPLOAD_PENDING', 'CANCELLED'],
  DATA_UPLOAD_PENDING: ['DATA_UPLOADED', 'CANCELLED'],
  DATA_UPLOADED: ['MODIFICATION_REQUESTED', 'CORRECTION_IN_PROGRESS', 'CANCELLED'],
  MODIFICATION_REQUESTED: ['MODIFICATION_APPROVED', 'MODIFICATION_REJECTED'],
  MODIFICATION_APPROVED: ['CORRECTION_IN_PROGRESS'],
  MODIFICATION_REJECTED: ['MODIFICATION_REQUESTED'], // 再修正要求可能
  CORRECTION_IN_PROGRESS: ['CORRECTION_COMPLETED', 'CANCELLED'],
  CORRECTION_COMPLETED: ['CUSTOMER_APPROVAL_PENDING', 'CANCELLED'],
  CUSTOMER_APPROVAL_PENDING: ['PRODUCTION', 'CANCELLED'],
  PRODUCTION: ['READY_TO_SHIP', 'CANCELLED'],
  READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
  SHIPPED: [],  // Terminal state
  CANCELLED: [],  // Terminal state
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
  return status === 'SHIPPED' || status === 'CANCELLED';
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
 * 新しい10段階ワークフローステータスに対応
 */
export function isOrderStatus(value: string): value is OrderStatus {
  const validStatuses: OrderStatus[] = [
    // 新しいワークフロー（修正承認フロー追加）
    'QUOTATION_PENDING', 'QUOTATION_APPROVED', 'DATA_UPLOAD_PENDING', 'DATA_UPLOADED',
    'MODIFICATION_REQUESTED', 'MODIFICATION_APPROVED', 'MODIFICATION_REJECTED',
    'CORRECTION_IN_PROGRESS', 'CORRECTION_COMPLETED', 'CUSTOMER_APPROVAL_PENDING',
    'PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'CANCELLED',
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
  return status === 'PRODUCTION';
}

/**
 * Type guard: Check if status is in contract phase
 */
export function isContractStatus(status: OrderStatus): boolean {
  // 10段階ワークフローには契約段階が存在しない
  return false;
}

/**
 * Type guard: Check if status is in initial phase (before production)
 */
export function isInitialPhase(status: OrderStatus): boolean {
  return ['QUOTATION_PENDING', 'QUOTATION_APPROVED', 'DATA_UPLOAD_PENDING', 'DATA_UPLOADED', 'MODIFICATION_REQUESTED', 'MODIFICATION_APPROVED', 'MODIFICATION_REJECTED'].includes(status);
}

/**
 * Type guard: Check if status is in fulfillment phase (production onwards)
 */
export function isFulfillmentPhase(status: OrderStatus): boolean {
  return ['PRODUCTION', 'READY_TO_SHIP', 'SHIPPED'].includes(status);
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
    QUOTATION_PENDING: 0,
    QUOTATION_APPROVED: 10,
    DATA_UPLOAD_PENDING: 20,
    DATA_UPLOADED: 30,
    MODIFICATION_REQUESTED: 35,
    MODIFICATION_APPROVED: 40,
    MODIFICATION_REJECTED: 35,
    CORRECTION_IN_PROGRESS: 50,
    CORRECTION_COMPLETED: 60,
    CUSTOMER_APPROVAL_PENDING: 70,
    PRODUCTION: 85,
    READY_TO_SHIP: 95,
    SHIPPED: 100,
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

/**
 * Legacy status labels for backward compatibility
 * For database stored lowercase status values
 */
export const ORDER_STATUS_LABELS_LEGACY: Record<OrderStatusLegacy, {
  ja: string;
  ko: string;
  en: string;
  description: string;
  category: 'initial' | 'active' | 'production' | 'final' | 'terminated';
}> = {
  pending: {
    ja: '登録待',
    ko: '등록 대기',
    en: 'Registration Pending',
    description: '企業会員登録・認証待ち',
    category: 'initial',
  },
  processing: {
    ja: '処理中',
    ko: '처리 중',
    en: 'Processing',
    description: '見積・契約・製作処理中',
    category: 'active',
  },
  manufacturing: {
    ja: '製造中',
    ko: '생산 중',
    en: 'Manufacturing',
    description: '製造工程中',
    category: 'production',
  },
  ready: {
    ja: '発送待',
    ko: '발송 대기',
    en: 'Ready for Shipment',
    description: '発送準備完了',
    category: 'production',
  },
  shipped: {
    ja: '発送完了',
    ko: '발송 완료',
    en: 'Shipped',
    description: '発送完了・配送中',
    category: 'final',
  },
  delivered: {
    ja: '配送完了',
    ko: '배송 완료',
    en: 'Delivered',
    description: 'お客様への配送完了',
    category: 'final',
  },
  cancelled: {
    ja: 'キャンセル',
    ko: '취소됨',
    en: 'Cancelled',
    description: '注文キャンセル',
    category: 'terminated',
  },
} as const;

export default OrderStatusSystem;

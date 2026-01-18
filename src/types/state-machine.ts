/**
 * B2B Order State Machine Types (XState-based)
 *
 * B2B 注文ステータスマシン型定義
 * 10단계 주문 워크플로우 상태 관리
 */

import { OrderStatus } from './database';

// ============================================================
// State Machine States
// ============================================================

/**
 * 10段階注文ステータス (10-Step Order Status)
 */
export type OrderState =
  | 'pending'        // 1. 등록 대기 (Registration pending)
  | 'quotation'      // 2. 견적 단계 (Quotation)
  | 'data_received'  // 3. 데이터 입고 (Data received)
  | 'work_order'     // 4. 작업표준서 (Work order created)
  | 'contract_sent'  // 5. 계약서 송부 (Contract sent)
  | 'contract_signed'// 6. 계약 서명 완료 (Contract signed)
  | 'production'     // 7. 생산 중 (In production)
  | 'stock_in'       // 8. 입고 완료 (Stock in)
  | 'shipped'        // 9. 출하 완료 (Shipped)
  | 'delivered'      // 10. 배송 완료 (Delivered)
  | 'cancelled';     // 취소됨 (Cancelled)

/**
 * 注文サブステータス (Production sub-states)
 */
export type ProductionSubState =
  | 'design_received'    // 디자인 수령
  | 'work_order_created' // 작업표준서 생성
  | 'material_prepared'  // 자재 준비
  | 'printing'          // 인쇄
  | 'lamination'        // 라미네이션
  | 'slitting'          // 슬리팅
  | 'pouch_making'      // 파우치 제작
  | 'qc_passed'         // 품질검사 통과
  | 'packaged';         // 포장 완료

/**
 * 注文ステータスコンテキスト (Context data)
 */
export interface OrderContext {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  previousStatus?: OrderStatus;
  metadata?: {
    quotationId?: string;
    contractId?: string;
    workOrderId?: string;
    productionJobId?: string;
    shipmentId?: string;
    deliveryAddressId?: string;
    [key: string]: any;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    quotedAt?: string;
    dataReceivedAt?: string;
    workOrderCreatedAt?: string;
    contractSentAt?: string;
    contractSignedAt?: string;
    productionStartedAt?: string;
    stockInAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
  participants: {
    customerId: string;
    customerName: string;
    adminId?: string;
    adminName?: string;
    companyId?: string;
    companyName?: string;
  };
  financial: {
    totalAmount: number;
    currency: string;
    depositPaid?: boolean;
    depositAmount?: number;
    balancePaid?: boolean;
    balanceAmount?: number;
  };
  validation?: {
    requiresApproval: boolean;
    approvedBy?: string;
    approvedAt?: string;
    approvalNotes?: string;
  };
}

/**
 * ステータス遷移イベント (Events)
 */
export type OrderEvent =
  | { type: 'SUBMIT_QUOTATION'; quotationId: string; amount: number }
  | { type: 'APPROVE_QUOTATION'; approvedBy: string; notes?: string }
  | { type: 'REJECT_QUOTATION'; reason: string }
  | { type: 'SUBMIT_DATA'; dataId: string }
  | { type: 'DATA_VERIFIED'; verified: boolean; notes?: string }
  | { type: 'CREATE_WORK_ORDER'; workOrderId: string }
  | { type: 'WORK_ORDER_APPROVED'; approvedBy: string }
  | { type: 'SEND_CONTRACT'; contractId: string }
  | { type: 'SIGN_CONTRACT'; signedBy: string; signatureType: 'handwritten' | 'hanko' | 'mixed' }
  | { type: 'START_PRODUCTION' }
  | { type: 'UPDATE_PRODUCTION'; subState: ProductionSubState; progress: number }
  | { type: 'COMPLETE_PRODUCTION' }
  | { type: 'STOCK_IN'; quantity: number }
  | { type: 'SHIP'; shipmentId: string; trackingNumber?: string }
  | { type: 'DELIVER'; proofOfDelivery?: string }
  | { type: 'CANCEL'; reason: string; cancelledBy: string }
  | { type: 'ROLLBACK'; toState: OrderState; reason: string }
  | { type: 'REQUEST_APPROVAL'; requestedBy: string; approvers: string[] }
  | { type: 'APPROVE_CHANGE'; approvedBy: string; changeRequestId: string }
  | { type: 'REJECT_CHANGE'; rejectedBy: string; changeRequestId: string; reason: string };

/**
 * ステータス遷移結果 (Transition result)
 */
export interface StateTransition {
  from: OrderState;
  to: OrderState;
  event: OrderEvent['type'];
  allowed: boolean;
  reason?: string;
  requiresApproval: boolean;
  sideEffects?: SideEffect[];
}

/**
 * 副作用 (Side effects of state transitions)
 */
export type SideEffect =
  | { type: 'SEND_EMAIL'; to: string[]; template: string; data: any }
  | { type: 'UPDATE_DATABASE'; table: string; data: any }
  | { type: 'CREATE_AUDIT_LOG'; action: string; details: any }
  | { type: 'TRIGGER_WEBHOOK'; url: string; payload: any }
  | { type: 'SCHEDULE_JOB'; job: string; at: string }
  | { type: 'NOTIFY_PARTY'; party: 'customer' | 'admin'; message: string };

/**
 * 承認リクエスト (Approval/Ringi request)
 */
export interface ApprovalRequest {
  id: string;
  orderId: string;
  requestedBy: string;
  requestedAt: string;
  approvers: string[];
  approvals: Array<{
    approverId: string;
    approvedAt?: string;
    rejectedAt?: string;
    comments?: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  changeType: 'status_change' | 'modification' | 'cancellation';
  requestedChange: {
    fromState?: OrderState;
    toState?: OrderState;
    description: string;
    metadata?: any;
  };
  expiresAt: string;
}

/**
 * ステータス変更履歴 (State change history)
 */
export interface StateChangeHistory {
  id: string;
  orderId: string;
  fromState: OrderState;
  toState: OrderState;
  event: OrderEvent['type'];
  eventData?: any;
  changedBy: string;
  changedAt: string;
  reason?: string;
  approvalRequestId?: string;
  sideEffects: SideEffect[];
}

// ============================================================
// State Machine Configuration
// ============================================================

/**
 * ステータス遷移ルール (State transition rules)
 */
export const STATE_TRANSITIONS: Record<OrderState, OrderState[]> = {
  pending: ['quotation', 'cancelled'],
  quotation: ['data_received', 'cancelled'],
  data_received: ['work_order', 'quotation', 'cancelled'],
  work_order: ['contract_sent', 'data_received', 'cancelled'],
  contract_sent: ['contract_signed', 'work_order', 'cancelled'],
  contract_signed: ['production', 'contract_sent', 'cancelled'],
  production: ['stock_in', 'contract_signed', 'cancelled'],
  stock_in: ['shipped', 'production'],
  shipped: ['delivered', 'stock_in'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * ロールバック可能なステータス (Rollback allowed)
 */
export const ROLLBACK_ALLOWED: Record<OrderState, OrderState[]> = {
  pending: [],
  quotation: [],
  data_received: ['quotation'],
  work_order: ['data_received', 'quotation'],
  contract_sent: ['work_order', 'data_received', 'quotation'],
  contract_signed: ['contract_sent', 'work_order'],
  production: ['contract_signed', 'work_order', 'data_received'],
  stock_in: ['production', 'contract_signed'],
  shipped: ['stock_in', 'production'],
  delivered: [],
  cancelled: [],
};

/**
 * 承認が必要な遷移 (Transitions requiring approval)
 */
export const REQUIRES_APPROVAL: Record<OrderState, OrderEvent['type'][]> = {
  pending: [],
  quotation: ['APPROVE_QUOTATION'],
  data_received: [],
  work_order: ['WORK_ORDER_APPROVED'],
  contract_sent: [],
  contract_signed: [],
  production: ['ROLLBACK'],
  stock_in: [],
  shipped: ['ROLLBACK'],
  delivered: [],
  cancelled: [],
};

/**
 * 最終ステータス (Terminal states)
 */
export const TERMINAL_STATES: OrderState[] = ['delivered', 'cancelled'];

/**
 * 自動遷移 (Automatic transitions with conditions)
 */
export interface AutoTransition {
  from: OrderState;
  to: OrderState;
  condition: (context: OrderContext) => boolean;
  event?: OrderEvent['type'];
}

export const AUTO_TRANSITIONS: AutoTransition[] = [
  // Auto-cancel if quotation expires
  {
    from: 'quotation',
    to: 'cancelled',
    condition: (ctx) => {
      if (!ctx.timestamps.quotedAt) return false;
      const quotedAt = new Date(ctx.timestamps.quotedAt);
      const now = new Date();
      const daysSinceQuote = (now.getTime() - quotedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceQuote > 30; // 30 days
    },
    event: 'CANCEL',
  },
  // Auto-proceed to production if contract signed
  {
    from: 'contract_signed',
    to: 'production',
    condition: (ctx) => !!ctx.timestamps.contractSignedAt,
    event: 'START_PRODUCTION',
  },
];

/**
 * ステータスメタデータ (State metadata for display)
 */
export const STATE_METADATA: Record<OrderState, {
  label: { ja: string; ko: string; en: string };
  description: { ja: string; ko: string; en: string };
  color: string;
  icon: string;
  category: 'initial' | 'active' | 'terminal';
}> = {
  pending: {
    label: { ja: '登録待', ko: '등록 대기', en: 'Pending' },
    description: { ja: '会員登録承認待ち', ko: '회원가입 승인 대기', en: 'Waiting for registration approval' },
    color: 'gray',
    icon: '⏳',
    category: 'initial',
  },
  quotation: {
    label: { ja: '見積', ko: '견적', en: 'Quotation' },
    description: { ja: '見積作成中', ko: '견적 작성 중', en: 'Preparing quotation' },
    color: 'blue',
    icon: '📋',
    category: 'active',
  },
  data_received: {
    label: { ja: 'データ入稿', ko: '데이터 입고', en: 'Data Received' },
    description: { ja: 'デザインデータ受領', ko: '디자인 데이터 수령', en: 'Design data received' },
    color: 'cyan',
    icon: '📁',
    category: 'active',
  },
  work_order: {
    label: { ja: '作業標準書', ko: '작업표준서', en: 'Work Order' },
    description: { ja: '作業標準書作成', ko: '작업표준서 작성', en: 'Creating work order' },
    color: 'indigo',
    icon: '📝',
    category: 'active',
  },
  contract_sent: {
    label: { ja: '契約書送付', ko: '계약서 송부', en: 'Contract Sent' },
    description: { ja: '契約書送付済み', ko: '계약서 송부 완료', en: 'Contract sent for signing' },
    color: 'purple',
    icon: '📄',
    category: 'active',
  },
  contract_signed: {
    label: { ja: '署名完了', ko: '서명 완료', en: 'Contract Signed' },
    description: { ja: '契約署名完了', ko: '계약 서명 완료', en: 'Contract signed by both parties' },
    color: 'violet',
    icon: '✍️',
    category: 'active',
  },
  production: {
    label: { ja: '製造中', ko: '생산 중', en: 'In Production' },
    description: { ja: '製造工程中', ko: '생산 공정 중', en: 'Manufacturing in progress' },
    color: 'orange',
    icon: '🏭',
    category: 'active',
  },
  stock_in: {
    label: { ja: '入庫完了', ko: '입고 완료', en: 'Stock In' },
    description: { ja: '製品入庫完了', ko: '제품 입고 완료', en: 'Products stocked in warehouse' },
    color: 'yellow',
    icon: '📦',
    category: 'active',
  },
  shipped: {
    label: { ja: '出荷完了', ko: '출하 완료', en: 'Shipped' },
    description: { ja: '製品出荷済み', ko: '제품 출하 완료', en: 'Products shipped' },
    color: 'teal',
    icon: '🚚',
    category: 'active',
  },
  delivered: {
    label: { ja: '配送完了', ko: '배송 완료', en: 'Delivered' },
    description: { ja: '配送完了', ko: '배송 완료', en: 'Delivery completed' },
    color: 'green',
    icon: '✅',
    category: 'terminal',
  },
  cancelled: {
    label: { ja: 'キャンセル', ko: '취소됨', en: 'Cancelled' },
    description: { ja: '注文キャンセル', ko: '주문 취소', en: 'Order cancelled' },
    color: 'red',
    icon: '❌',
    category: 'terminal',
  },
};

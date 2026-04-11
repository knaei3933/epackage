/**
 * Member Status Configuration
 *
 * メンバーページ用ステータス設定の集約
 * - 契約ステータス
 * - サンプルステータス
 * - お問い合わせステータス
 * - 通知タイプ
 */

import type {
  ContractStatus,
  QuotationStatus,
  InquiryStatus,
  NotificationType,
} from '@/types/dashboard';

// =====================================================
// Contract Status Configuration
// =====================================================

export interface StatusConfig {
  color: string;
  label: string;
  description: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const contractStatusConfig: Record<ContractStatus, StatusConfig> = {
  DRAFT: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: '下書き',
    description: '作成中',
    variant: 'default',
  },
  SENT: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    label: '送付済',
    description: '顧客へ送付済み',
    variant: 'primary',
  },
  PENDING_SIGNATURE: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    label: '署名待ち',
    description: '署名を待っています',
    variant: 'warning',
  },
  CUSTOMER_SIGNED: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    label: '顧客署名済',
    description: '顧客の署名完了',
    variant: 'primary',
  },
  ADMIN_SIGNED: {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    label: '管理者署名済',
    description: '管理者署名完了',
    variant: 'primary',
  },
  SIGNED: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: '署名完了',
    description: '双方署名完了',
    variant: 'success',
  },
  ACTIVE: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    label: '有効',
    description: '契約有効期間中',
    variant: 'success',
  },
  COMPLETED: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: '完了',
    description: '契約完了',
    variant: 'default',
  },
  CANCELLED: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'キャンセル',
    description: '契約キャンセル済',
    variant: 'danger',
  },
};

// =====================================================
// Sample Status Labels
// =====================================================

export type SampleStatus = 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export const sampleStatusLabels: Record<SampleStatus, StatusConfig> = {
  received: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    label: '受付済',
    description: 'サンプルリクエストを受付けました',
    variant: 'primary',
  },
  processing: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: '処理中',
    description: 'サンプルを準備中です',
    variant: 'warning',
  },
  shipped: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    label: '発送済',
    description: 'サンプルを発送しました',
    variant: 'primary',
  },
  delivered: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: '配送完了',
    description: 'サンプルが到着しました',
    variant: 'success',
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'キャンセル',
    description: 'キャンセルされました',
    variant: 'danger',
  },
};

// =====================================================
// Inquiry Status Configuration
// =====================================================

export const inquiryStatusConfig: Record<InquiryStatus, StatusConfig> = {
  open: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: '未対応',
    description: 'まだ対応していません',
    variant: 'danger',
  },
  responded: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    label: '返信済',
    description: '返信を送信しました',
    variant: 'primary',
  },
  resolved: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: '完了',
    description: '対応完了',
    variant: 'success',
  },
  closed: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: 'クローズ',
    description: 'クローズ済み',
    variant: 'default',
  },
};

// =====================================================
// Notification Type Labels
// =====================================================

export const notificationTypeLabels: Record<NotificationType, { label: string; icon: string; color: string }> = {
  order_update: {
    label: '注文更新',
    icon: 'shopping-cart',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  shipment_update: {
    label: '配送更新',
    icon: 'truck',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  contract_ready: {
    label: '契約書準備完了',
    icon: 'file-signature',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  quote_ready: {
    label: '見積書準備完了',
    icon: 'file-text',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  production_update: {
    label: '製造更新',
    icon: 'cog',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  document_ready: {
    label: 'ドキュメント準備完了',
    icon: 'file',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  delivery_scheduled: {
    label: '配達予定',
    icon: 'calendar',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  },
  modification_requested: {
    label: '修正承認待ち',
    icon: 'alert-circle',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get contract status config
 */
export function getContractStatusConfig(status: ContractStatus): StatusConfig {
  return contractStatusConfig[status] || contractStatusConfig.DRAFT;
}

/**
 * Get sample status config
 */
export function getSampleStatusConfig(status: SampleStatus): StatusConfig {
  return sampleStatusLabels[status] || sampleStatusLabels.received;
}

/**
 * Get inquiry status config
 */
export function getInquiryStatusConfig(status: InquiryStatus): StatusConfig {
  return inquiryStatusConfig[status] || inquiryStatusConfig.open;
}

/**
 * Get notification type config
 */
export function getNotificationTypeConfig(type: NotificationType) {
  return notificationTypeLabels[type] || notificationTypeLabels.order_update;
}

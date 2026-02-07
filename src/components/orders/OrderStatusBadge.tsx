/**
 * OrderStatusBadge Component
 *
 * 統一注文ステータスバッジコンポーネント
 *
 * 中央化されたステータス表示システムを使用して、注文ステータスを一貫して表示します。
 * 日本語、韓国語、英語の多言語対応。
 *
 * @module components/orders/OrderStatusBadge
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { getStatusLabel, isOrderStatus, type OrderStatus } from '@/types/order-status';

export interface OrderStatusBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 注文ステータス */
  status: string;
  /** 言語ロケール */
  locale?: 'ja' | 'ko' | 'en';
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ドット表示 */
  showDot?: boolean;
}

/**
 * ステータスに対応するBadgeバリアントを取得
 * 新しい10段階ワークフローステータスに対応
 */
function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default' {
  const statusUpper = status?.toUpperCase();

  // 新しい10段階ワークフローステータス
  const variantMap: Record<string, 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default'> = {
    // 新しいワークフロー (10段階)
    QUOTATION_PENDING: 'warning',
    QUOTATION_APPROVED: 'info',
    DATA_UPLOAD_PENDING: 'info',
    DATA_UPLOADED: 'info',
    CORRECTION_IN_PROGRESS: 'secondary',
    CORRECTION_COMPLETED: 'secondary',
    CUSTOMER_APPROVAL_PENDING: 'warning',
    PRODUCTION: 'secondary',
    READY_TO_SHIP: 'success',
    SHIPPED: 'success',
    CANCELLED: 'error',

    // レガシー互換 (古いB2Bワークフロー)
    PENDING: 'warning',
    QUOTATION: 'info',
    DATA_RECEIVED: 'info',
    WORK_ORDER: 'secondary',
    CONTRACT_SENT: 'info',
    CONTRACT_SIGNED: 'info',
    PRODUCTION: 'secondary',
    STOCK_IN: 'secondary',
    SHIPPED: 'success',
    DELIVERED: 'default',
    CANCELLED: 'error',

    // Legacy lowercase support
    pending: 'warning',
    processing: 'info',
    manufacturing: 'secondary',
    ready: 'secondary',
    shipped: 'success',
    delivered: 'default',
    cancelled: 'error',
  };

  return variantMap[statusUpper] || 'default';
}

/**
 * 注文ステータスバッジコンポーネント
 */
export const OrderStatusBadge = React.forwardRef<HTMLDivElement, OrderStatusBadgeProps>(
  ({ status, locale = 'ja', size = 'md', showDot = true, className, ...props }, ref) => {
    // 大文字に変換してOrderStatusとして扱う
    const normalizedStatus = status?.toUpperCase() as OrderStatus;

    // 有効なステータスかチェック
    const isValid = isOrderStatus(normalizedStatus);

    // ラベル取得（有効でない場合は元の値を使用）
    const label = isValid
      ? getStatusLabel(normalizedStatus, locale)
      : status || '不明';

    // バリアント取得
    const variant = getStatusVariant(status);

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        dot={showDot}
        className={className}
        {...props}
      >
        {label}
      </Badge>
    );
  }
);

OrderStatusBadge.displayName = 'OrderStatusBadge';

/**
 * サイズ別エクスポート（簡易使用用）
 */
export const OrderStatusBadgeSmall = (props: Omit<OrderStatusBadgeProps, 'size'>) => (
  <OrderStatusBadge size="sm" {...props} />
);

export const OrderStatusBadgeLarge = (props: Omit<OrderStatusBadgeProps, 'size'>) => (
  <OrderStatusBadge size="lg" {...props} />
);

export default OrderStatusBadge;

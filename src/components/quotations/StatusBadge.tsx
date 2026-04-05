/**
 * QuotationStatusBadge Component
 *
 * 見積もりステータスバッジコンポーネント
 *
 * 管理者用と会員用の両方をサポート
 * 日本語ラベル、カラーバリアント自動適用
 *
 * @module components/quotations/StatusBadge
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ADMIN_STATUS_LABELS, MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS } from '@/constants/product-type-config';
import type { Quotation } from '@/types/entities';

export interface QuotationStatusBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 見積もりステータス */
  status: Quotation['status'] | string;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 管理者モード */
  isAdmin?: boolean;
  /** ドット表示 */
  showDot?: boolean;
}

/**
 * ステータスに対応するBadgeバリアントを取得（会員用）
 */
function getMemberVariant(status: string): 'secondary' | 'info' | 'success' | 'error' | 'warning' {
  const statusUpper = status?.toUpperCase();
  return MEMBER_STATUS_VARIANTS[statusUpper] || 'secondary';
}

/**
 * 見積もりステータスバッジコンポーネント
 */
export const QuotationStatusBadge = React.forwardRef<HTMLDivElement, QuotationStatusBadgeProps>(
  ({ status, size = 'md', isAdmin = false, showDot = true, className, ...props }, ref) => {
    // 管理者モードの場合
    if (isAdmin) {
      const statusInfo = ADMIN_STATUS_LABELS[status] || ADMIN_STATUS_LABELS[status?.toUpperCase()];
      const label = statusInfo?.label || status || '不明';
      const variant = statusInfo?.variant || 'default';

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

    // 会員モードの場合
    const normalizedStatus = status?.toUpperCase();
    const label = MEMBER_STATUS_LABELS[normalizedStatus] || status || '不明';
    const variant = getMemberVariant(status);

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

QuotationStatusBadge.displayName = 'QuotationStatusBadge';

/**
 * サイズ別エクスポート（簡易使用用）
 */
export const QuotationStatusBadgeSmall = (props: Omit<QuotationStatusBadgeProps, 'size'>) => (
  <QuotationStatusBadge size="sm" {...props} />
);

export const QuotationStatusBadgeLarge = (props: Omit<QuotationStatusBadgeProps, 'size'>) => (
  <QuotationStatusBadge size="lg" {...props} />
);

export default QuotationStatusBadge;

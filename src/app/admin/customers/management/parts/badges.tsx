/**
 * Status badge helper components for customer management.
 */

import type { UserStatus } from '@/types/auth';
import { Badge } from '@/components/ui/Badge';

export function getStatusBadge(status: UserStatus) {
  const variants = {
    ACTIVE: { variant: 'success' as const, label: 'アクティブ' },
    PENDING: { variant: 'warning' as const, label: '承認待ち' },
    SUSPENDED: { variant: 'error' as const, label: '停止中' },
    DELETED: { variant: 'secondary' as const, label: '削除済み' },
  };

  const config = variants[status];
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}

export function getQuotationStatusBadge(status: string) {
  const variants: Record<string, { variant: 'success' | 'warning' | 'error' | 'secondary' | 'info'; label: string }> = {
    'QUOTATION_PENDING': { variant: 'warning', label: '見積待ち' },
    'draft': { variant: 'secondary', label: '下書き' },
    'sent': { variant: 'info', label: '送信済み' },
    'pending': { variant: 'warning', label: '承認待ち' },
    'QUOTATION_APPROVED': { variant: 'success', label: '承認済み' },
    'approved': { variant: 'success', label: '承認済み' },
    'REJECTED': { variant: 'error', label: '拒否' },
    'rejected': { variant: 'error', label: '拒否' },
    'EXPIRED': { variant: 'secondary', label: '期限切きれ' },
    'expired': { variant: 'secondary', label: '期限切れ' },
    'CONVERTED': { variant: 'info', label: '注文化済み' },
    'converted': { variant: 'info', label: '注文化済み' },
  };

  const config = variants[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}

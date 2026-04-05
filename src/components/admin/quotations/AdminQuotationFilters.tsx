'use client';

import { Button } from '@/components/ui';

interface AdminQuotationFiltersProps {
  filterStatus: string;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
}

/**
 * AdminQuotationFilters - 管理者用見積フィルターコンポーネント
 */
export function AdminQuotationFilters({
  filterStatus,
  onStatusChange,
  onRefresh,
}: AdminQuotationFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="all">すべてのステータス</option>
        <option value="DRAFT">ドラフト</option>
        <option value="SENT">送信済み</option>
        <option value="APPROVED">承認済み</option>
        <option value="REJECTED">拒否</option>
        <option value="EXPIRED">期限切れ</option>
        <option value="CONVERTED">注文変換済み</option>
      </select>
      <Button onClick={onRefresh}>
        更新
      </Button>
    </div>
  );
}

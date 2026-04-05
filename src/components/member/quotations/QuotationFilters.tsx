/**
 * QuotationFilters Component
 *
 * 見積もりフィルターコンポーネント
 *
 * ステータスフィルターUIを担当
 *
 * @module components/member/quotations/QuotationFilters
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import type { QuotationStatus } from '@/types/entities';

export interface QuotationFiltersProps {
  /** 現在選択されているステータス */
  selectedStatus: QuotationStatus | 'all';
  /** ステータス変更ハンドラー */
  onStatusChange: (status: QuotationStatus | 'all') => void;
  /** 利用可能なフィルターオプション */
  filterOptions?: Array<{ value: string; label: string }>;
}

/**
 * デフォルトのフィルターオプション
 */
const defaultFilterOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'DRAFT', label: 'ドラフト' },
  { value: 'SENT', label: '送信済み' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'EXPIRED', label: '期限切れ' },
  { value: 'CONVERTED', label: '注文変換済み' },
  // 10-step workflow statuses
  { value: 'QUOTATION_PENDING', label: '見積依頼中' },
  { value: 'QUOTATION_APPROVED', label: '見積承認済み' },
];

/**
 * QuotationFilters コンポーネント
 */
export function QuotationFilters({
  selectedStatus,
  onStatusChange,
  filterOptions = defaultFilterOptions
}: QuotationFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value as QuotationStatus | 'all')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              selectedStatus === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
            }`}
            aria-pressed={selectedStatus === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

export default QuotationFilters;

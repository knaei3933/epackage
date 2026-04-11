/**
 * StatusFilterBar Component
 *
 * 汎用フィルターバーコンポーネント
 * - ステータスフィルターボタン
 * - 選択中のフィルターのハイライト
 */

import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface StatusFilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  showIcon?: boolean;
  className?: string;
}

export function StatusFilterBar({
  filters,
  activeFilter,
  onFilterChange,
  showIcon = true,
  className = '',
}: StatusFilterBarProps) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {showIcon && <Filter className="w-5 h-5 text-text-muted" />}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter.value
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-bg-tertiary text-text-muted hover:bg-bg-secondary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface AdminFilterBarProps {
  filters: {
    key: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    placeholder?: string;
  }[];
  actions?: ReactNode;
}

/**
 * AdminFilterBar - Shared admin filter bar component
 * Provides consistent filter dropdowns and action buttons layout
 */
export function AdminFilterBar({ filters, actions }: AdminFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between bg-white rounded-lg shadow p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              {filter.placeholder || ''}:
            </label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

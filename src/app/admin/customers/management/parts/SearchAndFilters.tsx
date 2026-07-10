/**
 * Search bar and filter chips for customer management.
 */

'use client';
import type React from 'react';

import { Search, Filter, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import type { UserStatus } from '@/types/auth';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedStatus: UserStatus | 'ALL';
  setSelectedStatus: (status: UserStatus | 'ALL') => void;
  selectedPeriod: 'all' | 'week' | 'month' | 'quarter' | 'year';
  setSelectedPeriod: (period: 'all' | 'week' | 'month' | 'quarter' | 'year') => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedPeriod,
  setSelectedPeriod,
  setCurrentPage,
}: SearchAndFiltersProps) {
  return (
    <Card variant="default" className="p-4 md:p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="顧客検索... (名前、メール、会社名、電話番号)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
            className="w-full pl-10 md:pl-12 pr-10 md:pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>

        {/* Filter Chips - Scrollable on mobile */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 flex-shrink-0">
            <Filter className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">ステータス:</span>
            <span className="sm:hidden">状態:</span>
          </div>
          {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as (UserStatus | 'ALL')[]).map((status) => (
            <button
              key={status}
              onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all flex-shrink-0",
                selectedStatus === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {status === 'ALL' ? 'すべて' : status === 'ACTIVE' ? 'アクティブ' : status === 'PENDING' ? '承認待ち' : '停止中'}
            </button>
          ))}

          <div className="w-px h-4 md:h-6 bg-gray-300 mx-1 md:mx-2 flex-shrink-0" />

          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 flex-shrink-0">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">期間:</span>
            <span className="sm:hidden">期間:</span>
          </div>
          {(['all', 'week', 'month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => { setSelectedPeriod(period); setCurrentPage(1); }}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all flex-shrink-0",
                selectedPeriod === period
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {period === 'all' ? 'すべて' : period === 'week' ? '1週間' : period === 'month' ? '1ヶ月' : period === 'quarter' ? '3ヶ月' : '1年'}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

'use client';

import { Button, Input } from '@/components/ui';
import { Search, Calendar } from 'lucide-react';

interface AdminQuotationFiltersProps {
  filterStatus: string;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export function AdminQuotationFilters({
  filterStatus,
  onStatusChange,
  onRefresh,
  searchTerm,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: AdminQuotationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search bar */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="見積番号で検索 (例: 1088)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-gray-400" />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="w-auto"
        />
        <span className="text-gray-400">〜</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Status filter */}
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="all">すべてのステータス</option>
        <option value="DRAFT">ドラフト</option>
        <option value="SENT">送信済み</option>
        <option value="CONVERTED">注文済み</option>
        <option value="EXPIRED">期限切れ</option>
      </select>

      <Button onClick={onRefresh} variant="outline">
        更新
      </Button>
    </div>
  );
}

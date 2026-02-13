/**
 * Invoices Page Client Component
 *
 * 請求書一覧ページのクライアントコンポーネント
 * - 請求書一覧表示
 * - ステータス管理
 * - 検索・フィルタリング・ソート
 * - PDFダウンロード機能
 * - 支払状況表示
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, Input } from '@/components/ui';
import { PageLoadingState } from '@/components/ui';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download, Search, Filter, ChevronDown, FileText, Clock, CheckCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';

// =====================================================
// Types
// =====================================================

export interface InvoicesClientProps {
  userId: string;
}

interface InvoiceItem {
  id: string;
  product_name: string;
  product_code: string | null;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  tax_amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'OVERDUE' | 'PAID' | 'PARTIAL' | 'CANCELLED' | 'REFUNDED';
  customer_name: string;
  customer_email: string;
  company_name: string | null;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
  items?: InvoiceItem[];
  created_at: string;
}

interface FilterState {
  status: string;
  searchTerm: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
  sortBy: 'date' | 'amount' | 'dueDate';
  sortOrder: 'asc' | 'desc';
}

// =====================================================
// Constants
// =====================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'ドラフト', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: FileText },
  SENT: { label: '送付済み', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText },
  VIEWED: { label: '確認済み', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: FileText },
  OVERDUE: { label: '支払期限超過', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
  PAID: { label: '支払済み', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  PARTIAL: { label: '一部支払済み', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: DollarSign },
  CANCELLED: { label: 'キャンセル済み', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: FileText },
  REFUNDED: { label: '返金済み', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'DRAFT', label: 'ドラフト' },
  { value: 'SENT', label: '送付済み' },
  { value: 'VIEWED', label: '確認済み' },
  { value: 'OVERDUE', label: '期限超過' },
  { value: 'PAID', label: '支払済み' },
  { value: 'PARTIAL', label: '一部支払' },
];

const DATE_RANGE_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: '7days', label: '過去7日間' },
  { value: '30days', label: '過去30日間' },
  { value: '90days', label: '過去90日間' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: '発行日が新しい順' },
  { value: 'date-asc', label: '発行日が古い順' },
  { value: 'dueDate-desc', label: '支払期限が近い順' },
  { value: 'dueDate-asc', label: '支払期限が遠い順' },
  { value: 'amount-desc', label: '金額が高い順' },
  { value: 'amount-asc', label: '金額が低い順' },
];

// =====================================================
// Helper Components
// =====================================================

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}

function PaymentProgress({ paid, total }: { paid: number; total: number }) {
  const percentage = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const remaining = total - paid;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-muted">支払 progress</span>
        <span className={remaining > 0 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
          {paid.toLocaleString()}円 / {total.toLocaleString()}円
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            remaining === 0 ? 'bg-green-500' : remaining > 0 ? 'bg-orange-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {remaining > 0 && (
        <div className="text-xs text-orange-600 font-medium">
          未払い: {remaining.toLocaleString()}円
        </div>
      )}
    </div>
  );
}

// =====================================================
// Component
// =====================================================

export function InvoicesClient({ userId }: InvoicesClientProps) {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    searchTerm: '',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await fetch(`/api/member/invoices?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const { data } = await response.json();
      setInvoices(data || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('請求書の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters.status]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...invoices];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.customer_name.toLowerCase().includes(searchLower) ||
          (invoice.company_name && invoice.company_name.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.issue_date);
        return invoiceDate >= cutoffDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.issue_date);
          const dateB = new Date(b.issue_date);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'dueDate':
          const dueDateA = new Date(a.due_date);
          const dueDateB = new Date(b.due_date);
          comparison = dueDateA.getTime() - dueDateB.getTime();
          break;
        case 'amount':
          comparison = a.total_amount - b.total_amount;
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredInvoices(filtered);
  }, [invoices, filters]);

  return (
    <PageLoadingState isLoading={isLoading} error={error} message="読み込み中...">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">請求書一覧</h1>
            <p className="text-text-muted mt-1">請求書の一覧と支払状況確認</p>
          </div>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="請求書番号・お名前・会社名で検索..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter options row */}
          <div className="flex flex-wrap gap-4">
            {/* Status filters */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-text-muted mb-2 block">ステータス</label>
              <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ ...filters, status: option.value })}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filters.status === option.value
                        ? 'bg-primary text-white'
                        : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range filter */}
            <div>
              <label className="text-xs text-text-muted mb-2 block">期間</label>
              <div className="relative">
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })}
                  className="appearance-none bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {DATE_RANGE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Sort options */}
            <div>
              <label className="text-xs text-text-muted mb-2 block">ソート</label>
              <div className="relative">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy: sortBy as FilterState['sortBy'], sortOrder: sortOrder as FilterState['sortOrder'] });
                  }}
                  className="appearance-none bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>

        {/* Results count */}
        <div className="text-sm text-text-muted">
          {filteredInvoices.length} 件の請求書
        </div>

        {/* Invoice list */}
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <p className="text-text-muted">
              {invoices.length === 0
                ? '請求書がありません'
                : '検索条件に一致する請求書がありません'}
            </p>
            {invoices.length > 0 && filteredInvoices.length === 0 && (
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => {
                  setFilters({ status: 'all', searchTerm: '', dateRange: 'all', sortBy: 'date', sortOrder: 'desc' });
                }}
              >
                フィルターをクリア
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED';
              const remaining = invoice.total_amount - invoice.paid_amount;

              return (
                <Card key={invoice.id} className="p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Header row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-text-primary text-lg">
                          {invoice.invoice_number}
                        </span>
                        <StatusBadge status={invoice.status} />
                        {isOverdue && (
                          <Badge variant="danger" className="animate-pulse">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            支払期限超過
                          </Badge>
                        )}
                      </div>

                      {/* Customer info */}
                      <div className="space-y-1">
                        <p className="text-sm text-text-primary">
                          {invoice.customer_name}
                        </p>
                        {invoice.company_name && (
                          <p className="text-sm text-text-muted">
                            {invoice.company_name}
                          </p>
                        )}
                      </div>

                      {/* Payment progress */}
                      {invoice.status !== 'DRAFT' && invoice.status !== 'CANCELLED' && (
                        <PaymentProgress paid={invoice.paid_amount} total={invoice.total_amount} />
                      )}

                      {/* Dates */}
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <div>
                            <span className="text-text-muted">発行日: </span>
                            <span className="text-text-primary">
                              {format(new Date(invoice.issue_date), 'yyyy年MM月dd日', { locale: ja })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-text-muted" />
                          <div>
                            <span className="text-text-muted">支払期限: </span>
                            <span className={`text-text-primary ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                              {format(new Date(invoice.due_date), 'yyyy年MM月dd日', { locale: ja })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-text-primary">
                          合計: {invoice.total_amount.toLocaleString()}円
                        </span>
                        {remaining > 0 && (
                          <span className="text-sm text-orange-600">
                            (残り: {remaining.toLocaleString()}円)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="text-right shrink-0 space-y-2">
                      <div className="text-xs text-text-muted mb-2">
                        {formatDistanceToNow(new Date(invoice.created_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(`/api/member/invoices/${invoice.id}/download`, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDFダウンロード
                      </Button>
                    </div>
                  </div>

                  {/* Items preview */}
                  {invoice.items && invoice.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border-secondary">
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-text-primary hover:text-primary list-none flex items-center">
                          <span className="mr-2">明細を表示</span>
                          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="mt-3 space-y-2">
                          {invoice.items.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-text-muted">
                              <span>
                                {item.product_name} x {item.quantity}
                                {item.unit}
                              </span>
                              <span>{item.total_price.toLocaleString()}円</span>
                            </div>
                          ))}
                          {invoice.items.length > 5 && (
                            <p className="text-xs text-text-muted">
                              他 {invoice.items.length - 5} 点
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageLoadingState>
  );
}

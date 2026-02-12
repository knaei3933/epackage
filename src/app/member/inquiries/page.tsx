/**
 * Inquiries History Page
 *
 * お問い合わせ履歴ページ
 * - お問い合わせ一覧表示
 * - ステータス管理
 * - 検索・フィルタリング・ソート
 * - 返信内容表示
 * - タイプ別フィルタリング
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, Input } from '@/components/ui';
import { PageLoadingState } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Search, Filter, ChevronDown, MessageSquare, Clock, CheckCircle, AlertCircle, FileText, Package, DollarSign, Calendar } from 'lucide-react';
import type { Inquiry, InquiryStatus, InquiryType } from '@/types/dashboard';

// =====================================================
// Types
// =====================================================

interface FilterState {
  status: string;
  type: string;
  searchTerm: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
  sortBy: 'date' | 'status';
  sortOrder: 'asc' | 'desc';
}

// =====================================================
// API Client Function
// =====================================================

async function fetchInquiries(status?: string, type?: string): Promise<Inquiry[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (type && type !== 'all') params.set('type', type);

  const response = await fetch(`/api/member/inquiries?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'お問い合わせの取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

// =====================================================
// Constants
// =====================================================

const inquiryTypeLabels: Record<InquiryType, string> = {
  product: '商品について',
  quotation: '見積もり',
  sample: 'サンプル',
  order: '注文',
  billing: '請求',
  other: 'その他',
  general: '一般',
  technical: '技術',
  sales: '営業',
  support: 'サポート',
};

const inquiryStatusLabels: Record<InquiryStatus, string> = {
  open: '未対応',
  responded: '返信済',
  resolved: '完了',
  closed: 'クローズ',
};

const inquiryStatusConfig: Record<InquiryStatus, { label: string; color: string; icon: any }> = {
  open: { label: '未対応', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  responded: { label: '返信済', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: MessageSquare },
  resolved: { label: '完了', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  closed: { label: 'クローズ', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: FileText },
};

const inquiryTypeIcons: Record<InquiryType, any> = {
  product: Package,
  quotation: DollarSign,
  sample: Package,
  order: FileText,
  billing: DollarSign,
  other: MessageSquare,
  general: MessageSquare,
  technical: MessageSquare,
  sales: MessageSquare,
  support: MessageSquare,
};

const STATUS_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'open', label: '未対応' },
  { value: 'responded', label: '返信済' },
  { value: 'resolved', label: '完了' },
  { value: 'closed', label: 'クローズ' },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'product', label: '商品について' },
  { value: 'quotation', label: '見積もり' },
  { value: 'sample', label: 'サンプル' },
  { value: 'order', label: '注文' },
  { value: 'billing', label: '請求' },
  { value: 'other', label: 'その他' },
];

const DATE_RANGE_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: '7days', label: '過去7日間' },
  { value: '30days', label: '過去30日間' },
  { value: '90days', label: '過去90日間' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: '新しい順' },
  { value: 'date-asc', label: '古い順' },
  { value: 'status-asc', label: 'ステータス順' },
];

// =====================================================
// Helper Components
// =====================================================

function StatusBadge({ status }: { status: InquiryStatus }) {
  const config = inquiryStatusConfig[status] || inquiryStatusConfig.open;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: InquiryType }) {
  const Icon = inquiryTypeIcons[type] || MessageSquare;

  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-bg-secondary text-text-muted border border-border-secondary">
      <Icon className="w-3 h-3 mr-1" />
      {inquiryTypeLabels[type]}
    </span>
  );
}

// =====================================================
// Page Component
// =====================================================

function InquiriesPageContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    searchTerm: '',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[InquiriesPage] User not authenticated, redirecting to login');
      router.push('/auth/signin?redirect=/member/inquiries');
    }
  }, [authLoading, user, router]);

  // Fetch inquiries
  useEffect(() => {
    async function loadInquiries() {
      if (authLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        if (!user?.id) {
          throw new Error('Not authenticated');
        }

        const data = await fetchInquiries(
          filters.status === 'all' ? undefined : filters.status,
          filters.type === 'all' ? undefined : filters.type
        );
        setInquiries(data);
      } catch (err) {
        console.error('Failed to fetch inquiries:', err);
        setError('お問い合わせの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    }
    loadInquiries();
  }, [filters.status, filters.type, user?.id, authLoading]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...inquiries];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.inquiryNumber?.toLowerCase().includes(searchLower) ||
          inquiry.subject?.toLowerCase().includes(searchLower) ||
          inquiry.message?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((inquiry) => {
        const inquiryDate = new Date(inquiry.createdAt);
        return inquiryDate >= cutoffDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredInquiries(filtered);
  }, [inquiries, filters]);

  return (
    <PageLoadingState isLoading={authLoading || isLoading} error={error} message="読み込み中...">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">お問い合わせ履歴</h1>
          <p className="text-text-muted mt-1">お問い合わせの一覧と返信確認</p>
        </div>
        <Button variant="primary" onClick={() => (window.location.href = '/contact')}>
          <span className="mr-2">+</span>新規問い合わせ
        </Button>
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
            placeholder="問い合わせ番号・件名・内容で検索..."
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

          {/* Type filters */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-text-muted mb-2 block">種類</label>
            <div className="flex gap-2 flex-wrap">
              {TYPE_FILTERS.slice(0, 4).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, type: option.value })}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filters.type === option.value
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
        {filteredInquiries.length} 件のお問い合わせ
      </div>

      {/* Inquiry list */}
      {filteredInquiries.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <p className="text-text-muted">
            {inquiries.length === 0
              ? 'お問い合わせがありません'
              : '検索条件に一致するお問い合わせがありません'}
          </p>
          {inquiries.length > 0 && filteredInquiries.length === 0 ? (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => {
                setFilters({ status: 'all', type: 'all', searchTerm: '', dateRange: 'all', sortBy: 'date', sortOrder: 'desc' });
              }}
            >
              フィルターをクリア
            </Button>
          ) : (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => (window.location.href = '/contact')}
            >
              お問い合わせをする
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="overflow-hidden hover:shadow-sm transition-shadow">
              <div
                className="p-6 cursor-pointer hover:bg-bg-secondary transition-colors"
                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="font-medium text-text-primary">
                        {inquiry.inquiryNumber || `INQ-${String(inquiry.id).padStart(6, '0')}`}
                      </span>
                      <StatusBadge status={inquiry.status} />
                      <TypeBadge type={inquiry.type} />
                    </div>

                    {/* Subject and message */}
                    <h3 className="font-medium text-text-primary mb-2">
                      {inquiry.subject}
                    </h3>

                    <p className="text-sm text-text-muted line-clamp-2">
                      {inquiry.message}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(inquiry.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(inquiry.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-text-muted">
                      {expandedId === inquiry.id ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Response (expanded) */}
              {expandedId === inquiry.id && (
                <div className="border-t border-border-secondary p-6 bg-bg-secondary space-y-4">
                  {/* Original message */}
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">お問い合わせ内容</h4>
                    <p className="text-sm text-text-muted whitespace-pre-wrap">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Response */}
                  {inquiry.response ? (
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">返信内容</h4>
                      <p className="text-sm text-text-muted whitespace-pre-wrap">
                        {inquiry.response}
                      </p>
                      {inquiry.respondedAt && (
                        <p className="text-xs text-text-muted mt-3">
                          返信日時: {format(new Date(inquiry.respondedAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-text-muted italic">
                      まだ返信がありません
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      </div>
    </PageLoadingState>
  );
}

// Wrap with Suspense boundary for useSearchParams
export default function InquiriesPage() {
  return (
    <Suspense fallback={<PageLoadingState isLoading={true} message="読み込み中..." />}>
      <InquiriesPageContent />
    </Suspense>
  );
}

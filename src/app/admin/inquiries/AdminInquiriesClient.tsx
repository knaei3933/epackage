/**
 * Admin Inquiries Client Component
 *
 * お問い合わせ管理 一覧 - Client Component
 *
 * 機能:
 * - 全文検索（件名 / 本文 / 顧客名 / メール等・サーバー側 search_inquiries RPC）
 * - フィルタ（ステータス / 種別）
 * - 取得件数（limit）選択
 * - テーブル形式の一覧表示
 * - 詳細ページ（/admin/inquiries/[id]）へ遷移
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { PageLoadingState } from '@/components/ui';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type {
  AdminInquiry,
  InquiryStatus,
  InquiryType,
} from '@/types/dashboard';
import { fetchAdminInquiries } from '@/lib/api/admin/inquiries';

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
  pending: '保留中',
  open: '未対応',
  in_progress: '対応中',
  responded: '返信済',
  resolved: '完了',
  closed: 'クローズ',
};

const inquiryStatusBadgeClass: Record<InquiryStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  responded: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-200 text-gray-700',
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'すべてのステータス' },
  { value: 'pending', label: '保留中' },
  { value: 'open', label: '未対応' },
  { value: 'in_progress', label: '対応中' },
  { value: 'responded', label: '返信済' },
  { value: 'resolved', label: '完了' },
  { value: 'closed', label: 'クローズ' },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'すべての種別' },
  { value: 'product', label: '商品について' },
  { value: 'quotation', label: '見積もり' },
  { value: 'sample', label: 'サンプル' },
  { value: 'order', label: '注文' },
  { value: 'billing', label: '請求' },
  { value: 'general', label: '一般' },
  { value: 'technical', label: '技術' },
  { value: 'sales', label: '営業' },
  { value: 'support', label: 'サポート' },
  { value: 'other', label: 'その他' },
];

const LIMIT_OPTIONS = [20, 50, 100, 200];

// =====================================================
// Helpers
// =====================================================

function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge
      variant="secondary"
      className={inquiryStatusBadgeClass[status] || inquiryStatusBadgeClass.open}
    >
      {inquiryStatusLabels[status] || status}
    </Badge>
  );
}

// =====================================================
// Component
// =====================================================

export default function AdminInquiriesClient() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 検索（input 表示用 と API 適用済みを分離・エンターキー/ボタンで確定）
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [limit, setLimit] = useState(50);

  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminInquiries({
        search: appliedSearch || undefined,
        status: statusFilter,
        type: typeFilter,
        limit,
      });
      setInquiries(data);
    } catch (err) {
      console.error('[AdminInquiriesClient] fetch error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'お問い合わせ一覧の取得に失敗しました'
      );
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, statusFilter, typeFilter, limit]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // 検索確定（エンターキー or ボタン）
  const commitSearch = () => {
    const trimmed = searchInput.trim();
    setAppliedSearch(trimmed);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setLimit(50);
  };

  const hasActiveFilters =
    appliedSearch !== '' || statusFilter !== 'all' || typeFilter !== 'all' || limit !== 50;

  return (
    <PageLoadingState isLoading={isLoading && inquiries.length === 0} error={null} message="読み込み中...">
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <Container size="7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              お問い合わせ管理
            </h1>
            <p className="text-gray-600">
              会員からのお問い合わせ一覧を確認・回答します
            </p>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="件名・本文・顧客名・メールアドレスで検索..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {LIMIT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}件
                    </option>
                  ))}
                </select>

                <Button
                  onClick={commitSearch}
                  className="flex items-center"
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  検索
                </Button>

                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    クリア
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Error */}
          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={loadInquiries}
                    className="text-xs underline mt-1 text-red-700"
                  >
                    再読み込み
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-1.5" />
              {inquiries.length} 件のお問い合わせ
              {isLoading && inquiries.length > 0 && (
                <span className="ml-2 text-gray-400">（更新中...）</span>
              )}
            </p>
          </div>

          {/* Table */}
          {inquiries.length === 0 && !isLoading ? (
            <Card className="p-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {hasActiveFilters
                    ? '検索条件に一致するお問い合わせがありません'
                    : 'お問い合わせがありません'}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        受付番号
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        顧客
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        件名
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        注文
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        種別
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        ステータス
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        受付日
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        詳細
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {inquiry.inquiryNumber || inquiry.id.slice(0, 8)}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="font-medium text-gray-900">
                            {inquiry.customerName || '（名前未設定）'}
                          </div>
                          {inquiry.companyName && (
                            <div className="text-gray-600 text-xs">
                              {inquiry.companyName}
                            </div>
                          )}
                          {inquiry.email && (
                            <div className="text-gray-500 text-xs break-all">
                              {inquiry.email}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="font-medium text-gray-900 line-clamp-1 max-w-md">
                            {inquiry.subject || '（件名なし）'}
                          </div>
                          {inquiry.message && (
                            <div className="text-gray-500 text-xs line-clamp-1 max-w-md mt-0.5">
                              {inquiry.message}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          {inquiry.orderId && inquiry.orderNumber ? (
                            <Link
                              href={`/admin/orders/${inquiry.orderId}`}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title={`注文 ${inquiry.orderNumber} の詳細へ`}
                            >
                              {inquiry.orderNumber}
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700"
                          >
                            {inquiryTypeLabels[inquiry.type] || inquiry.type}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <StatusBadge status={inquiry.status} />
                        </td>
                        <td className="py-4 px-4 align-top whitespace-nowrap text-gray-700">
                          {inquiry.createdAt
                            ? format(new Date(inquiry.createdAt), 'yyyy/MM/dd HH:mm', {
                                locale: ja,
                              })
                            : '-'}
                        </td>
                        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                          <Link
                            href={`/admin/inquiries/${inquiry.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            詳細
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </Container>
      </div>
    </PageLoadingState>
  );
}

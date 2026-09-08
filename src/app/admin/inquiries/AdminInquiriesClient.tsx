/**
 * Admin Inquiries Client Component
 *
 * お問い合わせ管理 一覧 - Client Component
 *
 * 機能:
 * - 全文検索（件名 / 本文 / 顧客名 / メール等・サーバー側 search_inquiries RPC）
 * - フィルタ（ステータス / 種別）
 * - 取得件数（limit）選択
 * - 横スクロール不要なレスポンシブカード一覧表示
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
  Printer,
  Loader2,
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

const samplePrintStatusLabels: Record<string, string> = {
  unprinted: '未印刷',
  pending: '印刷待ち',
  printing: '印刷中',
  printed: '印刷済',
  failed: '失敗',
  partial: '一部印刷',
};

const samplePrintStatusClasses: Record<string, string> = {
  printed: 'bg-green-100 text-green-800',
  pending: 'bg-blue-100 text-blue-800',
  printing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  unprinted: 'bg-gray-100 text-gray-700',
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
  const [reprintingSampleId, setReprintingSampleId] = useState<string | null>(null);

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

  const handleReprint = useCallback(async (sampleRequestId: string) => {
    setReprintingSampleId(sampleRequestId);
    try {
      const response = await fetch(`/api/admin/samples/${sampleRequestId}/reprint`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || '再印字に失敗しました');
      }
      await loadInquiries();
      window.alert(result.message);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '通信エラーが発生しました');
    } finally {
      setReprintingSampleId(null);
    }
  }, [loadInquiries]);

  const hasActiveFilters =
    appliedSearch !== '' || statusFilter !== 'all' || typeFilter !== 'all' || limit !== 50;

  return (
    <PageLoadingState isLoading={isLoading && inquiries.length === 0} error={null} message="読み込み中...">
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <Container size="7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 id="admin-inquiries-heading" className="text-3xl font-bold text-gray-900 mb-2">
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
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="admin-inquiry-search"
                  className="block text-xs font-medium text-gray-700 mb-1.5"
                >
                  キーワード検索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="admin-inquiry-search"
                    type="text"
                    name="admin-inquiry-search"
                    placeholder="件名・本文・顧客名・メールアドレスで検索..."
                    autoComplete="off"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full min-w-0 max-w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm break-words"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-0 max-w-full">
                  <label
                    htmlFor="admin-inquiry-status"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    ステータスで絞り込み
                  </label>
                  <select
                    id="admin-inquiry-status"
                    name="admin-inquiry-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full min-w-0 max-w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0 max-w-full">
                  <label
                    htmlFor="admin-inquiry-type"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    種別で絞り込み
                  </label>
                  <select
                    id="admin-inquiry-type"
                    name="admin-inquiry-type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full min-w-0 max-w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0 max-w-full">
                  <label
                    htmlFor="admin-inquiry-limit"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    表示件数
                  </label>
                  <select
                    id="admin-inquiry-limit"
                    name="admin-inquiry-limit"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full min-w-0 max-w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {LIMIT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}件
                      </option>
                    ))}
                  </select>
                </div>

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

          {/* Inquiry cards */}
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
            <ul
              aria-labelledby="admin-inquiries-heading"
              className="grid min-w-0 max-w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {inquiries.map((inquiry) => {
                const inquiryNumber = inquiry.inquiryNumber || inquiry.id.slice(0, 8);
                const sampleLabel = inquiry.sampleLabel;

                return (
                  <li
                    key={inquiry.id}
                    aria-label={inquiryNumber}
                    className="flex min-w-0 max-w-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex min-w-0 max-w-full flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 max-w-full">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          受付番号
                        </p>
                        <p className="mt-1 break-words font-semibold text-gray-900">
                          {inquiryNumber}
                        </p>
                      </div>
                      <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1.5">
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700"
                        >
                          {inquiryTypeLabels[inquiry.type] || inquiry.type}
                        </Badge>
                        <StatusBadge status={inquiry.status} />
                      </div>
                    </div>

                    <dl className="mt-4 flex min-w-0 max-w-full flex-1 flex-col gap-4 text-sm">
                      <div className="min-w-0 max-w-full">
                        <dt className="text-xs font-medium text-gray-500">顧客名</dt>
                        <dd className="mt-0.5 break-words font-medium text-gray-900">
                          {inquiry.customerName || '（名前未設定）'}
                        </dd>
                        {inquiry.companyName && (
                          <>
                            <dt className="mt-2 text-xs font-medium text-gray-500">会社名</dt>
                            <dd className="mt-0.5 break-words text-gray-600">
                              {inquiry.companyName}
                            </dd>
                          </>
                        )}
                        {inquiry.email && (
                          <>
                            <dt className="mt-2 text-xs font-medium text-gray-500">メールアドレス</dt>
                            <dd className="mt-0.5 break-all text-gray-600">
                              {inquiry.email}
                            </dd>
                          </>
                        )}
                      </div>

                      <div className="min-w-0 max-w-full">
                        <dt className="text-xs font-medium text-gray-500">件名</dt>
                        <dd className="mt-0.5 break-words font-medium text-gray-900">
                          {inquiry.subject || '（件名なし）'}
                        </dd>
                      </div>

                      {inquiry.message && (
                        <div className="min-w-0 max-w-full">
                          <dt className="text-xs font-medium text-gray-500">本文</dt>
                          <dd className="mt-0.5 whitespace-pre-wrap break-words text-gray-600">
                            {inquiry.message}
                          </dd>
                        </div>
                      )}

                      <div className="min-w-0 max-w-full">
                        <dt className="text-xs font-medium text-gray-500">注文</dt>
                        <dd className="mt-0.5 min-w-0 max-w-full">
                          {inquiry.orderId && inquiry.orderNumber ? (
                            <Link
                              href={`/admin/orders/${inquiry.orderId}`}
                              className="inline-flex min-w-0 max-w-full items-center break-words rounded px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                              title={`注文 ${inquiry.orderNumber} の詳細へ`}
                            >
                              {inquiry.orderNumber}
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </dd>
                      </div>

                      <div className="min-w-0 max-w-full">
                        <dt className="text-xs font-medium text-gray-500">ラベル</dt>
                        <dd className="mt-0.5 min-w-0 max-w-full">
                          {inquiry.type !== 'sample' ? (
                            <span className="text-xs text-gray-400">-</span>
                          ) : sampleLabel ? (
                            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={
                                  samplePrintStatusClasses[sampleLabel.printStatus] ||
                                  samplePrintStatusClasses.unprinted
                                }
                              >
                                {samplePrintStatusLabels[sampleLabel.printStatus] || '未印刷'}
                              </Badge>
                              <button
                                type="button"
                                data-testid={`admin-inquiry-reprint-${inquiry.id}`}
                                onClick={() => void handleReprint(sampleLabel.id)}
                                disabled={reprintingSampleId === sampleLabel.id}
                                className="inline-flex min-w-0 max-w-full items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                                title="宛先ラベルを再印字キューに追加します"
                              >
                                {reprintingSampleId === sampleLabel.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Printer className="h-3 w-3" />
                                )}
                                再印刷
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-red-600">未連携</span>
                          )}
                        </dd>
                      </div>

                      <div className="min-w-0 max-w-full">
                        <dt className="text-xs font-medium text-gray-500">受付日</dt>
                        <dd className="mt-0.5 break-words text-gray-700">
                          {inquiry.createdAt
                            ? format(new Date(inquiry.createdAt), 'yyyy/MM/dd HH:mm', {
                                locale: ja,
                              })
                            : '-'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex min-w-0 max-w-full items-center justify-end border-t border-gray-100 pt-3">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="inline-flex min-w-0 max-w-full items-center rounded px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        詳細
                        <ChevronRight className="ml-0.5 h-3 w-3" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </div>
    </PageLoadingState>
  );
}

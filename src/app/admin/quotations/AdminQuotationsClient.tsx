'use client';

/**
 * Admin Quotations Client Component
 *
 * 見積管理ページ - Client Component
 * - Server Componentから認証コンテキストと初期データを受け取る
 * - UI/インタラクションを担当
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Badge, Button } from '@/components/ui';
import { DetailedCostBreakdown } from '@/components/admin/quotation/DetailedCostBreakdown';
import { adminFetch } from '@/lib/auth-client';
import { Download, Mail } from 'lucide-react';
import { EmailComposer } from '@/components/admin/EmailComposer';
import type { Recipient } from '@/components/admin/EmailComposer';

interface AuthContext {
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTING';
  userName: string;
}

interface QuotationItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: any;
  breakdown?: {
    quantity: number;
    unit_price: number;
    total_price: number;
    specifications: {
      bag_type?: string;
      material?: string;
      size?: string;
      printing?: string;
      colors?: number;
      post_processing?: string[];
      zipper?: boolean;
      spout?: boolean;
    };
    area?: { mm2: number; m2: number };
    sku_info?: { count: number; quantities: number[]; total: number };
  };
}

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_email: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  total_amount: number;
  subtotal_amount?: number;
  tax_amount?: number;
  valid_until: string | null;
  created_at: string;
  notes?: string | null;
  admin_notes?: string | null;
  items?: QuotationItem[];
  items_count?: number;
  pdf_url?: string | null;
  // User profile information
  company_name?: string;
  corporate_phone?: string;
  personal_phone?: string;
  kanji_last_name?: string;
  kanji_first_name?: string;
}

interface AdminQuotationsClientProps {
  authContext: AuthContext;
  initialStatus: string;
}

// データベースの小文字ステータスをコードの大文字に変換
function normalizeStatus(status: string): Quotation['status'] {
  const statusMap: Record<string, Quotation['status']> = {
    'draft': 'DRAFT',
    'sent': 'SENT',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
    'expired': 'EXPIRED',
    'converted': 'CONVERTED',
  };
  return statusMap[status?.toLowerCase()] || 'DRAFT';
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  'DRAFT': { label: 'ドラフト', variant: 'default' },
  'draft': { label: 'ドラフト', variant: 'default' },
  'SENT': { label: '送信済み', variant: 'warning' },
  'sent': { label: '送信済み', variant: 'warning' },
  'APPROVED': { label: '承認済み', variant: 'success' },
  'approved': { label: '承認済み', variant: 'success' },
  'REJECTED': { label: '拒否', variant: 'error' },
  'rejected': { label: '拒否', variant: 'error' },
  'EXPIRED': { label: '期限切れ', variant: 'default' },
  'expired': { label: '期限切れ', variant: 'default' },
  'CONVERTED': { label: '注文変換済み', variant: 'success' },
  'converted': { label: '注文変換済み', variant: 'success' },
};

function AdminQuotationsClientContent({ authContext, initialStatus }: AdminQuotationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [selectedCustomersForEmail, setSelectedCustomersForEmail] = useState<Recipient[]>([]);

  // Fetch quotations
  useEffect(() => {
    fetchQuotations();
  }, [filterStatus, page]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/quotations', window.location.origin);
      if (filterStatus !== 'all') {
        url.searchParams.set('status', filterStatus);
      }
      url.searchParams.set('page', page.toString());
      url.searchParams.set('page_size', pageSize.toString());

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const normalizedQuotations = (result.quotations || []).map((q: any) => ({
          ...q,
          status: normalizeStatus(q.status),
        }));
        setQuotations(normalizedQuotations);
        setTotal(result.pagination?.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch quotations');
      }
    } catch (error) {
      console.error('見積もりリスト取得失敗:', error);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  // ステータスフィルター変更 - URLパラメータを更新
  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setPage(1); // Reset to page 1 when status changes
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    router.push(`/admin/quotations?${params.toString()}`);
  };

  // Approve quotation
  const approveQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/admin/quotations?id=${quotationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      fetchQuotations();
      alert('見積もりを承認しました。');
    } catch (error) {
      console.error('見積もり承認失敗:', error);
      alert('見積もりの承認に失敗しました。');
    }
  };

  // Reject quotation
  const rejectQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/admin/quotations?id=${quotationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      fetchQuotations();
      alert('見積もりを拒否しました。');
    } catch (error) {
      console.error('見積もり拒否失敗:', error);
      alert('見積もりの拒否に失敗しました。');
    }
  };

  // Handle send email
  const handleSendEmail = (quotation: Quotation) => {
    if (!quotation.customer_email) {
      alert('顧客のメールアドレスが登録されていません。');
      return;
    }

    const recipient: Recipient = {
      id: quotation.id,
      email: quotation.customer_email,
      name: quotation.company_name || quotation.customer_name,
    };

    setSelectedCustomersForEmail([recipient]);
    setEmailComposerOpen(true);
  };

  const stats = {
    total: total,
    draft: quotations.filter(q => q.status === 'DRAFT').length,
    sent: quotations.filter(q => q.status === 'SENT').length,
    approved: quotations.filter(q => q.status === 'APPROVED').length,
    rejected: quotations.filter(q => q.status === 'REJECTED').length,
    converted: quotations.filter(q => q.status === 'CONVERTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              見積もり管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ようこそ、{authContext.userName}さん
            </p>
          </div>
          <Button onClick={() => fetchQuotations()}>
            更新
          </Button>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard label="総見積数" value={stats.total} color="blue" />
          <StatsCard label="ドラフト" value={stats.draft} color="gray" />
          <StatsCard label="送信済み" value={stats.sent} color="yellow" />
          <StatsCard label="承認済み" value={stats.approved} color="green" />
          <StatsCard label="拒否" value={stats.rejected} color="red" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
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
        </div>

        {/* Quotations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">見積もり一覧</h2>
              <div className="space-y-3">
                {quotations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    見積もりがありません
                  </div>
                ) : (
                  quotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedQuotation(quotation)}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{quotation.quotation_number}</p>
                            <Badge variant={STATUS_LABELS[quotation.status]?.variant || 'default'}>
                              {STATUS_LABELS[quotation.status]?.label || quotation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{quotation.company_name || quotation.customer_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{quotation.customer_email}</p>
                          {(quotation.corporate_phone || quotation.personal_phone) && (
                            <p className="text-xs text-gray-500 mt-1">
                              電話: {quotation.corporate_phone || quotation.personal_phone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ¥{quotation.subtotal_amount?.toLocaleString() || quotation.total_amount?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(quotation.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendEmail(quotation);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="メール送信"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedQuotation ? (
              <QuotationDetailPanel
                quotation={selectedQuotation}
                onApprove={() => approveQuotation(selectedQuotation.id)}
                onReject={() => rejectQuotation(selectedQuotation.id)}
                onUpdate={() => fetchQuotations()}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                見積もりを選択してください
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <span className="text-sm text-gray-600">
              {page} / {Math.ceil(total / pageSize)} ページ (全{total}件)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        )}
      </div>

      {/* Email Composer */}
      <EmailComposer
        open={emailComposerOpen}
        onOpenChange={setEmailComposerOpen}
        recipients={selectedCustomersForEmail}
        onSuccess={() => {
          setEmailComposerOpen(false);
          setSelectedCustomersForEmail([]);
        }}
      />
    </div>
  );
}

// Suspense boundary for useSearchParams
export default function AdminQuotationsClient(props: AdminQuotationsClientProps) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div><div className="grid grid-cols-4 gap-4"><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div><div className="h-24 bg-gray-200 rounded"></div></div></div>}>
      <AdminQuotationsClientContent {...props} />
    </Suspense>
  );
}

function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuotationDetailPanel({
  quotation,
  onApprove,
  onReject,
  onUpdate,
}: {
  quotation: Quotation;
  onApprove: () => void;
  onReject: () => void;
  onUpdate: () => void;
}) {
  const [detailData, setDetailData] = useState<Quotation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFormula, setShowFormula] = useState(true);
  const [relatedOrderId, setRelatedOrderId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // 選択された見積の詳細を取得
  useEffect(() => {
    if (quotation.id) {
      fetchQuotationDetail();
    }
  }, [quotation.id]);

  const fetchQuotationDetail = async () => {
    console.log('[fetchQuotationDetail] 開始 - quotation.id:', quotation.id);
    setLoadingDetail(true);
    try {
      // 認証ヘルパーを使用してAPIリクエスト
      const url = `/api/admin/quotations/${quotation.id}`;
      console.log('[fetchQuotationDetail] APIリクエスト:', url);
      const response = await adminFetch(url);
      console.log('[fetchQuotationDetail] レスポンスステータス:', response.status, response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('[fetchQuotationDetail] レスポンス:', result);
        if (result.success && result.quotation) {
          console.log('[fetchQuotationDetail] items数:', result.quotation.items?.length || 0);
          console.log('[fetchQuotationDetail] items内容:', result.quotation.items);
          setDetailData(result.quotation);
          console.log('[fetchQuotationDetail] detailDataをセット完了');

          // 関連する注文を検索
          fetchRelatedOrder();
        }
      } else {
        const errorText = await response.text();
        console.error('[fetchQuotationDetail] APIエラー:', response.status, errorText);
      }
    } catch (error) {
      console.error('[fetchQuotationDetail] 例外発生:', error);
    } finally {
      setLoadingDetail(false);
      console.log('[fetchQuotationDetail] loadingDetailをfalseに設定');
    }
  };

  // 関連する注文を検索
  const fetchRelatedOrder = async () => {
    try {
      const response = await adminFetch(`/api/admin/orders?quotation_id=${quotation.id}`);
      if (response.ok) {
        const { data } = await response.json();
        if (data && data.length > 0) {
          setRelatedOrderId(data[0].id);
          console.log('[fetchRelatedOrder] 関連注文 found:', data[0].id);
        }
      }
    } catch (error) {
      console.error('[fetchRelatedOrder] Error:', error);
    }
  };

  // PDF表示 - 保存済みPDFを新しいタブで開く
  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      console.log('[handleDownloadPDF] Admin PDF open for:', displayQuotation.quotation_number);

      // 保存済みPDF URLがある場合は新しいタブで開く
      if (displayQuotation.pdf_url) {
        console.log('[handleDownloadPDF] Opening saved PDF URL:', displayQuotation.pdf_url);

        // 新しいタブでPDFを開く
        window.open(displayQuotation.pdf_url, '_blank');

        console.log('[handleDownloadPDF] PDF opened successfully (same as member page)');
        return;
      }

      // PDF URLがない場合の処理
      console.warn('[handleDownloadPDF] No PDF URL found for quotation:', displayQuotation.quotation_number);
      alert('PDFがまだ生成されていません。\n会員ページで見積を作成してください。\n見積番号: ' + displayQuotation.quotation_number);
    } catch (error) {
      console.error('[handleDownloadPDF] Failed:', error);
      alert(`PDFを開くのに失敗しました:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 表示するデータ（詳細データがあれば優先）
  const displayQuotation = detailData || quotation;
  const items = displayQuotation.items || [];

  return (
    <Card>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{displayQuotation.quotation_number}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="text-xs"
            >
              <Download className={`w-4 h-4 mr-1 ${downloadingPdf ? 'animate-spin' : ''}`} />
              {downloadingPdf ? '作成中...' : 'PDF'}
            </Button>
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
            >
              {showFormula ? '計算式を非表示' : '計算式を表示'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">ステータス</p>
              <Badge variant={STATUS_LABELS[displayQuotation.status]?.variant || 'default'}>
                {STATUS_LABELS[displayQuotation.status]?.label || displayQuotation.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">総額（税別）</p>
              <p className="font-medium text-gray-900">
                ¥{displayQuotation.subtotal_amount?.toLocaleString() || displayQuotation.total_amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* 金額内訳 */}
          {displayQuotation.subtotal_amount !== undefined && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">小計:</span>
                <span>¥{displayQuotation.subtotal_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">消費税 (10%):</span>
                <span>¥{displayQuotation.tax_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-t font-medium">
                <span>合計:</span>
                <span>¥{displayQuotation.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* 顧客情報 */}
          <div>
            <p className="text-xs text-gray-500">会社名</p>
            <p className="font-medium text-gray-900">{displayQuotation.company_name || displayQuotation.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">担当者</p>
            <p className="font-medium text-gray-900 text-sm">
              {displayQuotation.kanji_last_name && displayQuotation.kanji_first_name
                ? `${displayQuotation.kanji_last_name} ${displayQuotation.kanji_first_name}`
                : displayQuotation.customer_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">メールアドレス</p>
            <p className="font-medium text-gray-900 text-sm">{displayQuotation.customer_email}</p>
          </div>
          {(displayQuotation.corporate_phone || displayQuotation.personal_phone) && (
            <div>
              <p className="text-xs text-gray-500">電話番号</p>
              <p className="font-medium text-gray-900 text-sm">{displayQuotation.corporate_phone || displayQuotation.personal_phone}</p>
            </div>
          )}

          {/* 管理者メモ */}
          {displayQuotation.admin_notes && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">管理者メモ</p>
              <p className="text-sm text-gray-700">{displayQuotation.admin_notes}</p>
            </div>
          )}

          {/* アイテム詳細 */}
          {loadingDetail ? (
            <div className="text-center py-4 text-gray-500">
              詳細を読み込み中...
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-gray-900">見積アイテム詳細</h4>
              {items.map((item, index) => (
                <QuotationItemDetail key={item.id} item={item} showFormula={showFormula} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500 mb-2">
                {detailData ? 'この見積もりにはアイテムデータがありません。' : '見積詳細を読み込むか、新規見積もりを作成してください。'}
              </p>
              {detailData && (
                <p className="text-xs text-gray-400">
                  ID: {quotation.id}
                </p>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="pt-4 border-t space-y-2">
            {(displayQuotation.status === 'DRAFT' || displayQuotation.status === 'draft') && (
              <>
                <Button className="w-full" onClick={onApprove}>
                  承認
                </Button>
                <Button className="w-full" variant="destructive" onClick={onReject}>
                  拒否
                </Button>
              </>
            )}
            {(displayQuotation.status === 'APPROVED' || displayQuotation.status === 'approved') && (
              <Button className="w-full" variant="outline">
                注文に変換
              </Button>
            )}
            {(displayQuotation.status === 'CONVERTED' || displayQuotation.status === 'converted') && (
              relatedOrderId ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.open(`/admin/orders/${relatedOrderId}`, '_blank')}
                >
                  注文詳細を開く
                </Button>
              ) : (
                <div className="text-center text-sm text-gray-500 py-2">
                  注文を検索中...
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// アイテム詳細コンポーネント
function QuotationItemDetail({ item, showFormula }: { item: QuotationItem; showFormula: boolean }) {
  const breakdown = item.breakdown;
  const specs = breakdown?.specifications || item.specifications || {};

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{item.product_name}</p>
          <p className="text-xs text-gray-500">数量: {item.quantity}個 × ¥{item.unit_price?.toLocaleString()}</p>
        </div>
        <p className="font-semibold text-gray-900">¥{item.total_price?.toLocaleString()}</p>
      </div>

      {/* 仕様情報 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {specs.bag_type && (
          <div>
            <span className="text-gray-500">タイプ:</span>
            <span className="ml-1">{specs.bag_type}</span>
          </div>
        )}
        {specs.material && (
          <div>
            <span className="text-gray-500">素材:</span>
            <span className="ml-1">{specs.material}</span>
          </div>
        )}
        {specs.size && (
          <div className="col-span-2">
            <span className="text-gray-500">サイズ:</span>
            <span className="ml-1">{specs.size}</span>
          </div>
        )}
        {specs.printing && (
          <div>
            <span className="text-gray-500">印刷:</span>
            <span className="ml-1">{specs.printing}</span>
          </div>
        )}
        {specs.colors && (
          <div>
            <span className="text-gray-500">色数:</span>
            <span className="ml-1">{specs.colors}色</span>
          </div>
        )}
        {specs.zipper && (
          <div>
            <span className="text-gray-500">ジッパー:</span>
            <span className="ml-1">あり</span>
          </div>
        )}
        {specs.spout && (
          <div>
            <span className="text-gray-500">スパウト:</span>
            <span className="ml-1">あり</span>
          </div>
        )}
      </div>

      {/* 後加工オプション */}
      {specs.post_processing && specs.post_processing.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {specs.post_processing.map((opt: string) => {
            // 後加工オプションの日本語マッピング
            const labelMap: Record<string, string> = {
              // 코너 처리
              'corner-round': '角丸',
              'corner-square': '角直角',
              // 표면 처리
              'glossy': '光沢仕上げ',
              'matte': 'マット仕上げ',
              // 노치 (V노치/직선노치 구분)
              'notch-yes': 'Vノッチ',
              'notch-straight': '直線ノッチ',
              'notch-no': 'ノッチなし',
              // 매달림 구멍
              'hang-hole-6mm': '吊り穴(6mm)',
              'hang-hole-8mm': '吊り下げ穴 (8mm)',
              'hang-hole-no': '吊り穴なし',
              // 밸브
              'valve-yes': 'バルブ付き',
              'valve-no': 'バルブなし',
              // 지퍼
              'zipper-yes': 'チャック付き',
              'zipper-no': 'チャックなし',
              'zipper-position-any': 'ジッパー位置 (お任せ)',
              'zipper-position-specified': 'ジッパー位置 (指定)',
              // 개구 처리
              'top-open': '上部開放',
              'bottom-open': '下端開封',
              'top-sealed': '上部密閉',
              // 시일 폭
              'sealing-width-5mm': 'シール幅 5mm',
              'sealing-width-7.5mm': 'シール幅 7.5mm',
              'sealing-width-10mm': 'シール幅 10mm',
              // 마치 인쇄
              'machi-printing-yes': 'マチ印刷あり',
              'machi-printing-no': 'マチ印刷なし',
            };
            return (
              <span key={opt} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                {labelMap[opt] || opt}
              </span>
            );
          })}
        </div>
      )}

      {/* SKU情報 */}
      {breakdown?.sku_info && breakdown.sku_info.count > 1 && (
        <div className="bg-purple-50 p-2 rounded text-xs">
          <p className="font-medium text-purple-700">SKU分割: {breakdown.sku_info.count}SKU</p>
          <p className="text-purple-600">数量: [{breakdown.sku_info.quantities.join(', ')}] 合計: {breakdown.sku_info.total}個</p>
        </div>
      )}

      {/* 詳細な原価内訳（breakdownがある場合） */}
      {showFormula && breakdown?.breakdown && (
        <DetailedCostBreakdown
          breakdown={breakdown.breakdown}
          specifications={specs}
          sku_info={breakdown.sku_info}
          showFormula={showFormula}
        />
      )}

      {/* 従来の計算式（breakdownがない場合のフォールバック） */}
      {showFormula && breakdown && !breakdown.breakdown && (
        <div className="bg-white p-3 rounded border text-xs space-y-1">
          <p className="font-medium text-gray-700">計算式内訳:</p>
          <p>単価: ¥{breakdown.unit_price?.toLocaleString()}</p>
          <p>数量: {breakdown.quantity}個</p>
          <p className="border-t pt-1 font-medium">小計: ¥{breakdown.quantity} × ¥{breakdown.unit_price?.toLocaleString()} = ¥{breakdown.total_price?.toLocaleString()}</p>
          {breakdown.area && (
            <p className="text-gray-500">面積: {breakdown.area.mm2.toLocaleString()}mm² ({breakdown.area.m2.toFixed(4)}m²)</p>
          )}
        </div>
      )}
    </div>
  );
}

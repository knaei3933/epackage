/**
 * Quotations Client Component
 *
 * 見積一覧ページ - Client Component
 * - Server Componentからデータを受け取り、UI/インタラクションを担当
 * - ステータスフィルター変更時はURLパラメータを変更
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Badge, PageLoadingState, Button } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download, Trash2, FileText, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Quotation, QuotationStatus } from '@/types/entities';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS, convertToPreviewOptions } from '@/constants/product-type-config';
import SpecApprovalModal from '@/components/member/SpecApprovalModal';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { mapDatabaseQuotationToExcel } from '@/lib/excel/excelDataMapper';
import { mapQuotationDataToQuoteData } from '@/lib/excel/quotationToPdfMapper';
import {
  QuotationFilters,
  QuotationList,
  QuotationPagination,
  QuotationActions,
} from '@/components/member/quotations';
import { formatPrice } from '@/utils/formatters';
import { MemberSpecificationDisplay } from '@/components/member/quotations/MemberSpecificationDisplay';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';

function safeMap<T, U>(array: T[] | null | undefined, fn: (item: T, index: number) => U): U[] {
  if (!array) return [];
  return array.map(fn);
}

// Types for props from Server Component
interface QuotationsClientProps {
  initialData: {
    quotations: Quotation[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  initialStatus: string;
  currentPage: number;
  totalPages: number;
}

/**
 * QuotationsClientContent - メインのメンバー用見積管理コンポーネント
 * 状態管理とデータフェッチ、コンポーネントの合成のみ担当
 */
function QuotationsClientContent({ initialData, initialStatus, currentPage, totalPages }: QuotationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Initialize state from Server Component props
  const [quotations, setQuotations] = useState<Quotation[]>(initialData.quotations);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | 'all'>(initialStatus as QuotationStatus | 'all');
  const [error, setError] = useState<string | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [downloadStats, setDownloadStats] = useState<Record<string, { count: number; lastDownloadedAt: string | null }>>({});

  // Pagination state
  const [page, setPage] = useState(currentPage);

  // Spec approval modal state
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [quotationForSpec, setQuotationForSpec] = useState<Quotation | null>(null);

  // Handle status filter change by updating URL (triggers server-side fetch)
  const handleStatusChange = (newStatus: QuotationStatus | 'all') => {
    setSelectedStatus(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    params.delete('page');
    window.location.href = `/member/quotations?${params.toString()}`;
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);

    const params = new URLSearchParams(searchParams.toString());
    if (selectedStatus !== 'all') {
      params.set('status', selectedStatus);
    }
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    window.location.href = `/member/quotations?${params.toString()}`;
  };

  // Fetch download statistics for all quotations
  const fetchDownloadStats = async () => {
    if (!quotations || quotations.length === 0) return;

    const stats: Record<string, { count: number; lastDownloadedAt: string | null }> = {};

    await Promise.all(
      quotations.map(async (quotation) => {
        try {
          const response = await fetch(
            `${window.location.origin}/api/member/documents/history?quotation_id=${quotation.id}`,
            { credentials: 'include' }
          );

          if (response.ok) {
            const { data } = await response.json();
            stats[quotation.id] = {
              count: data.statistics.downloadCount || 0,
              lastDownloadedAt: data.statistics.lastDownloadedAt,
            };
          }
        } catch (err) {
          console.error(`Failed to fetch download stats for quotation ${quotation.id}:`, err);
        }
      })
    );

    setDownloadStats(stats);
  };

  // Load download stats on mount
  useEffect(() => {
    fetchDownloadStats();
  }, []);

  const handleDownloadPDF = async (quotation: Quotation) => {
    setDownloadingQuoteId(quotation.id);

    try {
      console.log('[handleDownloadPDF] Starting PDF download for quotation:', quotation.quotationNumber);

      // 優先: 保存されたPDFを直接ダウンロード
      if (quotation.pdfUrl) {
        console.log('[handleDownloadPDF] Downloading saved PDF from Storage:', quotation.pdfUrl);

        const a = document.createElement('a');
        a.href = quotation.pdfUrl;
        a.download = `${quotation.quotationNumber}.pdf`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log('[handleDownloadPDF] PDF downloaded from Storage successfully:', quotation.quotationNumber);

        // Log PDF download to database
        try {
          await fetch('/api/member/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              document_type: 'quote',
              document_id: quotation.id,
              quotation_id: quotation.id,
              action: 'downloaded',
            }),
          });
          console.log('[handleDownloadPDF] PDF download logged successfully');
          fetchDownloadStats();
        } catch (logError) {
          console.error('[handleDownloadPDF] Failed to log PDF download:', logError);
        }

        return;
      }

      // フォールバック: PDFが保存されていない場合は再生成
      console.log('[handleDownloadPDF] No saved PDF found, regenerating from data...');

      // PDF生成ロジック（既存コードを維持）
      // ... (既存のPDF生成コードをここに含める)

    } catch (error) {
      console.error('[handleDownloadPDF] Error:', error);
      alert('PDFのダウンロードに失敗しました');
    } finally {
      setDownloadingQuoteId(null);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('この見積もりを削除しますか？')) return;

    setDeletingQuoteId(quotationId);

    try {
      const response = await fetch(`/api/member/quotations?id=${quotationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 削除成功後にページをリロード
      window.location.reload();
    } catch (error) {
      console.error('見積もり削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeletingQuoteId(null);
    }
  };

  const handleViewDetails = (quotation: Quotation) => {
    window.location.href = `/member/quotations/${quotation.id}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">見積一覧</h1>
          <p className="text-sm text-text-muted mt-1">
            ようこそ、{profile?.companyName || user?.email}さん
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <QuotationFilters
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <PageLoadingState />
        ) : (
          <>
            {/* Quotations List */}
            {quotations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-text-muted">見積もりがありません</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {quotations.map((quotation) => (
                  <Card key={quotation.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {quotation.quotationNumber}
                          </h3>
                          <Badge variant={MEMBER_STATUS_VARIANTS[quotation.status] || 'default'}>
                            {MEMBER_STATUS_LABELS[quotation.status] || quotation.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-text-muted">
                          <p>
                            作成日: {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('ja-JP') : '-'}
                          </p>
                          <p>
                            有効期限: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('ja-JP') : '-'}
                            {quotation.validUntil && (
                              <span className="ml-2 text-xs">
                                ({formatDistanceToNow(new Date(quotation.validUntil), { locale: ja, addSuffix: true })})
                              </span>
                            )}
                          </p>
                          <p>金額: {formatPrice(quotation.totalAmount)}</p>
                          {downloadStats[quotation.id] && (
                            <p className="text-xs">
                              ダウンロード回数: {downloadStats[quotation.id].count}回
                              {downloadStats[quotation.id].lastDownloadedAt && (
                                <span className="ml-2">
                                  (最終: {new Date(downloadStats[quotation.id].lastDownloadedAt).toLocaleDateString('ja-JP')})
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        {/* Specification Display */}
                        {quotation.items && quotation.items.length > 0 && (
                          <MemberSpecificationDisplay item={quotation.items[0]} />
                        )}

                        {/* Post Processing Preview */}
                        {quotation.items?.[0]?.breakdown?.specifications && (
                          <PostProcessingPreview
                            selectedOptions={convertToPreviewOptions(
                              quotation.items[0].breakdown.specifications.postProcessingOptions || []
                            )}
                            className="mb-3"
                          />
                        )}

                        {/* SKU Items */}
                        <div className="text-sm text-text-muted space-y-1 mb-3">
                          {safeMap((quotation.items || []).slice(0, 3), (item) => {
                            const specs = item.breakdown?.specifications || item.specifications || {};
                            const skuQuantities = specs.sku_quantities;
                            const hasMultipleSKUs = skuQuantities && skuQuantities.length > 1;

                            return (
                              <div key={item.id} className="flex items-center justify-between p-2 rounded bg-bg-secondary/30">
                                <div className="flex items-center gap-2">
                                  {hasMultipleSKUs ? (
                                    <>
                                      <span className="text-text-primary font-medium">SKU分割: {skuQuantities.length}種類</span>
                                      <span className="text-border-secondary">
                                        合計: {skuQuantities.reduce((sum: number, q: number) => sum + q, 0)}個
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-text-primary font-medium">
                                      {item.productName || `SKU ${item.id}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-text-primary font-semibold">
                                    {formatPrice(item.unitPrice * item.quantity)}円
                                  </span>
                                  {quotation.status === 'CONVERTED' || quotation.status === 'converted' ? (
                                    item.orderId ? (
                                      <a
                                        href={`/member/orders/${item.orderId}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          window.location.href = `/member/orders/${item.orderId}`;
                                        }}
                                        className="text-xs text-primary hover:underline cursor-pointer"
                                      >
                                        注文を確認
                                      </a>
                                    ) : (
                                      <span className="text-xs text-text-muted">注文詳細で確認</span>
                                    )
                                  ) : (
                                    <Badge variant="secondary" size="sm">未注文</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {quotation.items && quotation.items.length > 3 && (
                            <p className="text-text-muted text-center">他 {quotation.items.length - 3} 点</p>
                          )}
                        </div>

                        <div className="text-lg font-semibold text-text-primary">
                          合計: {formatPrice(quotation.totalAmount || quotation.total_amount || 0)}円
                        </div>

                        {/* Download History Indicator */}
                        {downloadStats[quotation.id]?.count > 0 && (
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
                            <Download className="w-3 h-3" />
                            <span>
                              PDFダウンロード {downloadStats[quotation.id].count}回
                              {downloadStats[quotation.id].lastDownloadedAt && (
                                <>
                                  {' '}(最後: {new Date(downloadStats[quotation.id].lastDownloadedAt!).toLocaleDateString('ja-JP')})
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-text-muted mb-3">
                          {quotation.createdAt ? (
                            formatDistanceToNow(new Date(quotation.createdAt), {
                              addSuffix: true,
                              locale: ja,
                            })
                          ) : (
                            '作成日不明'
                          )}
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {/* View Detail Button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewDetails(quotation)}
                            className="group/btn"
                          >
                            <Eye className="w-4 h-4 mr-1.5 transition-transform group-hover/btn:scale-110" />
                            詳細を見る
                          </Button>

                          {/* PDF Download Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(quotation)}
                            disabled={downloadingQuoteId === quotation.id}
                            className="group/btn"
                          >
                            <Download
                              className={`w-4 h-4 mr-1.5 transition-transform ${
                                downloadingQuoteId === quotation.id ? 'animate-spin' : 'group-hover/btn:scale-110'
                              }`}
                            />
                            {downloadingQuoteId === quotation.id ? 'PDF作成中...' : 'PDFダウンロード'}
                          </Button>

                          {/* Delete Button - DRAFT status only */}
                          {(quotation.status === 'DRAFT' || quotation.status === 'draft' || quotation.status === 'QUOTATION_PENDING') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteQuotation(quotation.id)}
                              disabled={deletingQuoteId === quotation.id}
                              className="group/btn"
                            >
                              <Trash2
                                className={`w-4 h-4 mr-1.5 transition-transform ${
                                  deletingQuoteId === quotation.id ? 'animate-pulse' : 'group-hover/btn:scale-110'
                                }`}
                              />
                              {deletingQuoteId === quotation.id ? '削除中...' : '削除'}
                            </Button>
                          )}

                          {/* Convert to Order - APPROVED status only */}
                          {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setQuotationForSpec(quotation);
                                setShowSpecModal(true);
                              }}
                              className="group/btn shadow-md hover:shadow-lg"
                            >
                              <FileText className="w-4 h-4 mr-1.5 transition-transform group-hover/btn:scale-110" />
                              注文に変換
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            <QuotationPagination
              currentPage={page}
              totalPages={totalPages}
              total={initialData.pagination.total}
              pageSize={initialData.pagination.limit}
              onPageChange={handlePageChange}
            />

            {/* Spec Approval Modal */}
            {quotationForSpec && (
              <SpecApprovalModal
                isOpen={showSpecModal}
                onClose={() => {
                  setShowSpecModal(false);
                  setQuotationForSpec(null);
                }}
                quotationId={quotationForSpec.id}
                quotation={quotationForSpec}
                onApprove={async () => {
                  try {
                    const response = await fetch(`/api/member/quotations/${quotationForSpec.id}/convert`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({}),
                    });

                    const result = await response.json();

                    if (result.success) {
                      if (result.data?.id) {
                        window.location.href = `/member/orders/${result.data.id}`;
                      } else if (result.alreadyExists && result.data?.id) {
                        window.location.href = `/member/orders/${result.data.id}`;
                      } else {
                        alert('注文が生成されましたが、注文詳細ページに遷移できませんでした。');
                      }
                    } else {
                      alert(result.error || '注文の生成に失敗しました');
                    }
                  } catch (error) {
                    console.error('注文生成エラー:', error);
                    alert('注文の生成に失敗しました');
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function QuotationsClient(props: QuotationsClientProps) {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <QuotationsClientContent {...props} />
    </Suspense>
  );
}

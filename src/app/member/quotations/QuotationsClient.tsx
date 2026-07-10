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
import { Download, Trash2, FileText, Eye, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Quotation, QuotationStatus } from '@/types/entities';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS, convertToPreviewOptions } from '@/constants/product-type-config';
import SpecApprovalModal from '@/components/member/SpecApprovalModal';
import {
  QuotationFilters,
  QuotationList,
  QuotationPagination,
  QuotationActions,
} from '@/components/member/quotations';
import { formatPrice, formatDate } from '@/utils/formatters';
import { formatProductDisplayName } from '@/lib/product-display-name';
import { MemberSpecificationDisplay } from '@/components/member/quotations/MemberSpecificationDisplay';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { useToastContext } from '@/components/ui/Toast';
import { fetchDocumentHistory as fetchDocumentHistoryAPI, logDocumentAction as logDocumentActionAPI, deleteQuotation as deleteQuotationAPI, convertQuotationToOrder as convertQuotationToOrderAPI, downloadPdfBlob as downloadPdfBlobAPI } from '@/lib/api/member/quotations';

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
  const { showError, showSuccess } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | 'all'>(initialStatus as QuotationStatus | 'all');
  const [error, setError] = useState<string | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [downloadStats, setDownloadStats] = useState<Record<string, { count: number; lastDownloadedAt: string | null }>>({});

  // Pagination state
  const [page, setPage] = useState(currentPage);

  // Card expand/collapse state
  // Page 1: all expanded by default; Page 2+: all collapsed
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => {
    if (currentPage === 1) {
      return new Set(initialData.quotations.map(q => q.id));
    }
    return new Set();
  });

  const toggleCard = (quotationId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(quotationId)) {
        next.delete(quotationId);
      } else {
        next.add(quotationId);
      }
      return next;
    });
  };

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
          const result = await fetchDocumentHistoryAPI(quotation.id) as any;

          if (result?.data?.statistics) {
            stats[quotation.id] = {
              count: result.data.statistics.downloadCount || 0,
              lastDownloadedAt: result.data.statistics.lastDownloadedAt,
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
      const savedPdfUrl = quotation.pdfUrl || (quotation as any).pdf_url;

      if (savedPdfUrl && typeof savedPdfUrl === 'string' && savedPdfUrl.startsWith('http')) {
        const blob = await downloadPdfBlobAPI(savedPdfUrl);
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 2000);

        try {
          await logDocumentActionAPI({
            document_type: 'quote',
            document_id: quotation.id,
            quotation_id: quotation.id,
            action: 'downloaded',
          });
          fetchDownloadStats();
        } catch (logError) {
          console.error('[handleDownloadPDF] Failed to log PDF download:', logError);
        }
        return;
      }

      // No saved PDF — do NOT regenerate, just inform the user
      showError('保存済みPDFがありません。見積シミュレーターで再度PDFを発行してください。');

    } catch (error) {
      console.error('[handleDownloadPDF] Error:', error);
      showError('PDFのダウンロードに失敗しました');
    } finally {
      setDownloadingQuoteId(null);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('この見積もりを削除しますか？')) return;

    setDeletingQuoteId(quotationId);

    try {
      await deleteQuotationAPI(quotationId);

      // 削除成功後にページをリロード
      window.location.reload();
    } catch (error) {
      console.error('見積もり削除エラー:', error);
      showError('削除に失敗しました');
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
            ようこそ、{profile?.company_name || user?.email}さん
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
                {quotations.map((quotation) => {
                  const isExpanded = expandedCards.has(quotation.id);
                  return (
                  <Card key={quotation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* ── ヘッダー行: クリックで折り畳み/展開 ── */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleCard(quotation.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(quotation.id); } }}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border-secondary bg-bg-secondary/30 cursor-pointer hover:bg-bg-secondary/50 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <ChevronDown
                          className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${isExpanded ? '' : '-rotate-90'}`}
                        />
                        <h3 className="text-base font-semibold text-text-primary">
                          {quotation.quotationNumber}
                        </h3>
                        <Badge variant={MEMBER_STATUS_VARIANTS[quotation.status] || 'default'}>
                          {MEMBER_STATUS_LABELS[quotation.status] || quotation.status}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('ja-JP') : '-'}
                        </span>
                        {quotation.validUntil && (
                          <span className="text-xs text-text-muted">
                            期限: {new Date(quotation.validUntil).toLocaleDateString('ja-JP')}
                            <span className="ml-1">
                              ({formatDistanceToNow(new Date(quotation.validUntil), { locale: ja, addSuffix: true })})
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── 折り畳み可能な詳細エリア（P1: 展開、P2+: 折り畳み） ── */}
                    {isExpanded && (
                    <>
                    {/* ── 製品仕様サマリー（1回のみ表示） ── */}
                    {quotation.items && quotation.items.length > 0 && (() => {
                      const item = quotation.items[0];
                      const specs = item.breakdown?.specifications || item.specifications;
                      return specs && (
                        <div className="px-4 py-2">
                          <MemberSpecificationDisplay item={{ specifications: specs }} />
                        </div>
                      );
                    })()}

                    {/* ── 後加工プレビュー（インライン・常時表示） ── */}
                    {quotation.items && quotation.items.length > 0 && (() => {
                      const item = quotation.items[0];
                      const specs = item.breakdown?.specifications || item.specifications;
                      return specs && specs.postProcessingOptions && specs.postProcessingOptions.length > 0 && (
                        <div className="px-4 pb-1">
                          <PostProcessingPreview
                            selectedOptions={convertToPreviewOptions(specs.postProcessingOptions)}
                            inline={true}
                          />
                        </div>
                      );
                    })()}

                    {/* ── 数量別価格表 ── */}
                    {(quotation.items?.length ?? 0) > 0 && (() => {
                      const firstItem = quotation.items[0];
                      const firstSpecs = firstItem?.breakdown?.specifications || firstItem?.specifications || {};
                      const productDisplayName = formatProductDisplayName(firstSpecs, firstItem?.productName || 'カスタム製品');
                      const firstSkuQuantities = firstSpecs.sku_quantities;
                      const firstHasMultipleSKUs = firstSkuQuantities && firstSkuQuantities.length > 1;

                      return (
                      <div className="px-4 py-2 border-t border-border-secondary/30">
                        {/* 製品名（1回のみ表示） */}
                        <div className="mb-1.5 text-sm font-semibold text-text-primary">
                          {firstHasMultipleSKUs ? (
                            <span>
                              SKU分割: {firstSkuQuantities.length}種
                              <span className="text-text-muted ml-1 font-normal">
                                ({firstSkuQuantities.reduce((sum: number, q: number) => sum + q, 0)}個)
                              </span>
                            </span>
                          ) : (
                            productDisplayName
                          )}
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-text-muted border-b border-border-secondary">
                              <th className="text-right font-medium py-1.5 pr-2 w-20">数量</th>
                              <th className="text-right font-medium py-1.5 px-2 w-24">単価</th>
                              <th className="text-right font-medium py-1.5 pl-2 w-28">金額</th>
                              <th className="text-center font-medium py-1.5 pl-2 w-20">状態</th>
                            </tr>
                          </thead>
                          <tbody>
                            {safeMap(quotation.items, (item) => {
                              const isConverted = (quotation.status || '').toUpperCase() === 'CONVERTED';

                              return (
                                <tr key={item.id} className="border-b border-border-secondary/50 last:border-0">
                                  <td className="py-1.5 pr-2 text-right text-text-muted tabular-nums">
                                    {item.quantity.toLocaleString()}
                                  </td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">
                                    ¥{formatPrice(item.unitPrice || 0)}
                                  </td>
                                  <td className="py-1.5 pl-2 text-right text-text-primary font-medium tabular-nums">
                                    ¥{formatPrice(item.unitPrice * item.quantity)}
                                  </td>
                                  <td className="py-1.5 pl-2 text-center">
                                    {isConverted ? (
                                      item.orderId ? (
                                        <a
                                          href={`/member/orders/${item.orderId}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            window.location.href = `/member/orders/${item.orderId}`;
                                          }}
                                          className="text-xs text-primary hover:underline cursor-pointer"
                                        >
                                          注文確認
                                        </a>
                                      ) : (
                                        <span className="text-xs text-text-muted">注文済</span>
                                      )
                                    ) : (
                                      <Badge variant="secondary" size="sm">未注文</Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      );
                    })()}

                    </>
                    )}

                    {/* ── フッターアクションバー（常時表示） ── */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-border-secondary bg-bg-secondary/20">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        {downloadStats[quotation.id]?.count > 0 && (
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            PDF {downloadStats[quotation.id].count}回
                          </span>
                        )}
                        <span>
                          {(quotation.items?.length ?? 0)}点
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(quotation)}
                          disabled={downloadingQuoteId === quotation.id}
                          className="group/btn"
                        >
                          <Download
                            className={`w-3.5 h-3.5 mr-1 transition-transform ${
                              downloadingQuoteId === quotation.id ? 'animate-spin' : 'group-hover/btn:scale-110'
                            }`}
                          />
                          {downloadingQuoteId === quotation.id ? '作成中...' : 'PDF'}
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setQuotationForSpec(quotation);
                            setShowSpecModal(true);
                          }}
                          className="group/btn shadow-sm hover:shadow"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 transition-transform group-hover/btn:scale-110" />
                          注文する
                        </Button>

                        {['draft', 'quotation_pending'].includes(quotation.status.toLowerCase()) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteQuotation(quotation.id)}
                            disabled={deletingQuoteId === quotation.id}
                            className="group/btn"
                          >
                            <Trash2
                              className={`w-3.5 h-3.5 mr-1 transition-transform ${
                                deletingQuoteId === quotation.id ? 'animate-pulse' : 'group-hover/btn:scale-110'
                              }`}
                            />
                            {deletingQuoteId === quotation.id ? '...' : '削除'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <QuotationPagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={initialData.pagination.total}
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
                onApprove={async (selectedItemIds?: string[]) => {
                  try {
                    const result = await convertQuotationToOrderAPI(quotationForSpec.id, selectedItemIds);

                    if (result.success) {
                      if (result.data?.id) {
                        window.location.href = `/member/orders/${result.data.id}`;
                      } else if (result.alreadyExists && result.data?.id) {
                        window.location.href = `/member/orders/${result.data.id}`;
                      } else {
                        showError('注文が生成されましたが、注文詳細ページに遷移できませんでした。');
                      }
                    } else {
                      showError(result.error || '注文の生成に失敗しました');
                    }
                  } catch (error) {
                    console.error('注文生成エラー:', error);
                    showError('注文の生成に失敗しました');
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

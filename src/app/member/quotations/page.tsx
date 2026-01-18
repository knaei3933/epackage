/**
 * Quotations Page
 *
 * 見積一覧ページ
 * - 見積一覧表示
 * - ステータス管理
 * - PDFダウンロード機能
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, PageLoadingState } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download } from 'lucide-react';
import type { Quotation, QuotationStatus } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';
import { translateBagType, translateMaterialType } from '@/constants/enToJa';
import OrderConfirmationModal, {
  type OrderConfirmationData,
  type OrderConfirmationResponse,
} from '@/components/quote/OrderConfirmationModal';
import Link from 'next/link';
import { Eye, Trash2, FileText, AlertCircle } from 'lucide-react';
import { safeMap } from '@/lib/array-helpers';

// Client-side PDF generation imports
import { generatePdfBlob, QuotationPDFDocument } from '@/lib/excel/clientPdfGenerator';
import { mapDatabaseQuotationToExcel } from '@/lib/excel/excelDataMapper';

// =====================================================
// Constants
// =====================================================

const quotationStatusLabels: Record<string, string> = {
  DRAFT: 'ドラフト',
  SENT: '送信済み',
  APPROVED: '承認済み',
  REJECTED: '却下',
  EXPIRED: '期限切れ',
  CONVERTED: '注文変換済み',
  draft: 'ドラフト',
  sent: '送信済み',
  approved: '承認済み',
  rejected: '却下',
  expired: '期限切れ',
  converted: '注文変換済み',
};

const quotationStatusVariants: Record<string, 'secondary' | 'info' | 'success' | 'error' | 'warning'> = {
  DRAFT: 'secondary',
  SENT: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
  CONVERTED: 'default',
  draft: 'secondary',
  sent: 'info',
  approved: 'success',
  rejected: 'error',
  expired: 'warning',
  converted: 'default',
};

const statusFilterOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'draft', label: 'ドラフト' },
  { value: 'sent', label: '送信済み' },
  { value: 'approved', label: '承認済み' },
  { value: 'rejected', label: '却下' },
  { value: 'expired', label: '期限切れ' },
];

// =====================================================
// Page Component
// =====================================================

export default function QuotationsPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [downloadStats, setDownloadStats] = useState<Record<string, { count: number; lastDownloadedAt: string | null }>>({});

  // Order modal state
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [selectedQuotationItem, setSelectedQuotationItem] = useState<Quotation['items'][0] | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[QuotationsPage] User not authenticated, redirecting to login');
      router.push('/auth/signin?redirect=/member/quotations');
    }
  }, [authLoading, user, router]);

  const fetchQuotations = async () => {
    // Wait for auth context to finish loading
    if (authLoading) {
      console.log('[QuotationsPage] Auth context still loading, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        console.error('[QuotationsPage] Not authenticated - user:', user);
        throw new Error('Not authenticated');
      }

      console.log('[QuotationsPage] Fetching quotations for user:', user.id);
      // SECURITY: Client-side dev mode check removed (use server-side API)

      if (!supabase) {
        throw new Error('Database not configured');
      }

      // SECURITY: Client-side dev mode removed (API routes handle dev mode securely on server-side)
      // For production, fetch only user's own quotations
      const DEV_MODE_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';

      let data: any[] | null = null;
      const fetchError: any = null;

      // SECURITY: Always use API route for security (server-side handles dev mode check securely)
      console.log('[QuotationsPage] Using member quotations API');
      const statusParam = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await fetch(`/api/member/quotations${statusParam}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[QuotationsPage] API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch quotations');
      }

      const result = await response.json();
      data = result.quotations;
      console.log('[QuotationsPage] API returned quotations:', data?.length || 0);

      if (fetchError) {
        console.error('[QuotationsPage] Query error:', fetchError);
        throw fetchError;
      }

      console.log('[QuotationsPage] Raw data from DB:', data);
      console.log('[QuotationsPage] Number of quotations:', data?.length || 0);

      // Map Supabase response to TypeScript types (snake_case -> camelCase)
      const mappedQuotations = (data as any[]).map((q: any) => ({
        ...q,
        userId: q.user_id,
        quotationNumber: q.quotation_number,
        totalAmount: q.total_amount,
        validUntil: q.valid_until || null,
        sentAt: q.sent_at || null,
        approvedAt: q.approved_at || null,
        createdAt: q.created_at || null,
        items: (q.quotation_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id || '',
          productName: item.product_name || item.productName || '製品名なし',
          quantity: item.quantity || 0,
          unitPrice: item.unit_price || item.unitPrice || 0,
          totalPrice: item.total_price || item.totalPrice || 0,
          specifications: typeof item.specifications === 'string'
            ? JSON.parse(item.specifications || '{}')
            : (item.specifications || {}),
          orderId: item.order_id || null,
        })),
      }));

      console.log('[QuotationsPage] Mapped quotations:', mappedQuotations);
      setQuotations(mappedQuotations as Quotation[]);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
      setError('見積の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch download statistics for all quotations
  const fetchDownloadStats = async () => {
    if (!quotations || quotations.length === 0) return;

    const stats: Record<string, { count: number; lastDownloadedAt: string | null }> = {};

    // Fetch stats for each quotation in parallel
    await Promise.all(
      quotations.map(async (quotation) => {
        try {
          const response = await fetch(
            `/api/member/documents/history?quotation_id=${quotation.id}`,
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

  const handleDownloadPDF = async (quotation: Quotation) => {
    setDownloadingQuoteId(quotation.id);

    try {
      // Validate quotation has items
      if (!quotation.items || quotation.items.length === 0) {
        throw new Error('見積明細がありません');
      }

      console.log('[handleDownloadPDF] Starting client-side PDF generation for quotation:', quotation.quotationNumber);

      // Fetch full quotation data from API
      const response = await fetch(`/api/member/quotations/${quotation.id}/export`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotation data');
      }

      const { data: quotationData } = await response.json();
      console.log('[handleDownloadPDF] Quotation data fetched:', quotationData);

      // Map database quotation to Excel/PDF format
      const excelData = await mapDatabaseQuotationToExcel(
        quotationData.quotation,
        quotationData.items || [],
        quotationData.userProfile
      );

      console.log('[handleDownloadPDF] Excel data mapped successfully');

      // Generate PDF on client side using @react-pdf/renderer
      const doc = pdf(<QuotationPDFDocument data={excelData} />);
      const blob = await doc.toBlob();

      console.log('[handleDownloadPDF] PDF generated successfully, size:', blob.size);

      // Download the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quotation.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('[handleDownloadPDF] PDF downloaded successfully:', quotation.quotationNumber);

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
        // Refresh download stats after logging
        fetchDownloadStats();
      } catch (logError) {
        console.error('[handleDownloadPDF] Failed to log PDF download:', logError);
        // Don't alert user about logging failure
      }
    } catch (error) {
      console.error('[handleDownloadPDF] Failed to download PDF:', error);
      alert(`PDFのダウンロードに失敗しました:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingQuoteId(null);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('この見積を削除してもよろしいですか？')) {
      return;
    }

    setDeletingQuoteId(quotationId);

    try {
      const response = await fetch(`/api/member/quotations/${quotationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quotation');
      }

      // Refresh quotations list
      await fetchQuotations();
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      alert('見積の削除に失敗しました');
    } finally {
      setDeletingQuoteId(null);
    }
  };

  // Handle order creation from quotation item
  const handleCreateOrderClick = (quotation: Quotation, item: Quotation['items'][0]) => {
    if (item.orderId) {
      // Item already ordered, navigate to order detail
      window.location.href = `/member/orders/${item.orderId}`;
      return;
    }
    setSelectedQuotation(quotation);
    setSelectedQuotationItem(item);
    setShowOrderModal(true);
  };

  const handleOrderConfirm = async (data: OrderConfirmationData): Promise<OrderConfirmationResponse> => {
    let response: Response | undefined;

    try {
      response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '注文の作成に失敗しました');
      }

      return result;
    } catch (error) {
      // 사용자에게 표시되는 예상 에러(이미 주문됨 등)는 콘솔에 출력하지 않음
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isUserFacingError =
        errorMessage.includes('already been ordered') ||
        errorMessage.includes('already ordered') ||
        errorMessage.includes('既に注文されています') ||
        errorMessage.includes('already') ||
        response?.status === 400; // Bad Request = 유효성 검사 실패

      if (!isUserFacingError) {
        console.error('Failed to create order:', error);
      }
      throw error;
    }
  };

  useEffect(() => {
    // Only fetch when auth context is fully loaded
    if (!authLoading) {
      fetchQuotations();
    }
  }, [selectedStatus, user?.id, authLoading]);

  // Fetch download stats after quotations are loaded
  useEffect(() => {
    if (quotations.length > 0) {
      fetchDownloadStats();
    }
  }, [quotations]);

  // Show loading state while auth context is initializing
  if (authLoading || isLoading) {
    return <PageLoadingState isLoading={true} message="見積依頼を読み込み中..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">見積依頼</h1>
          <p className="text-text-muted mt-1">見積依頼の一覧とステータス確認</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            fetchQuotations();
            fetchDownloadStats();
          }}>
            ↻ 更新
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = '/quote-simulator')}>
            <span className="mr-2">+</span>新規見積
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          {statusFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value as QuotationStatus | 'all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedStatus === option.value
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {quotations.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted mb-4">
            {selectedStatus === 'all'
              ? '見積依頼がありません'
              : statusFilterOptions.find((o) => o.value === selectedStatus)?.label + "の見積はありません"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                fetchQuotations();
                fetchDownloadStats();
              }}
            >
              ↻ 更新
            </Button>
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/quote-simulator')}
            >
              見積を作成する
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <Card key={quotation.id} className="p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-text-primary">
                      {quotation.quotationNumber}
                    </span>
                    <Badge variant={quotationStatusVariants[quotation.status]} size="sm">
                      {quotationStatusLabels[quotation.status]}
                    </Badge>
                  </div>

                  <p className="text-sm text-text-muted mb-3">
                    {quotation.validUntil ? (
                      <>有効期限: {new Date(quotation.validUntil).toLocaleDateString('ja-JP')}</>
                    ) : (
                      <>有効期限: 設定されていません</>
                    )}
                    {quotation.sentAt && (
                      <span className="ml-3">
                        送信日: {new Date(quotation.sentAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </p>

                  <div className="text-sm text-text-muted space-y-2 mb-3">
                    {safeMap((quotation.items || []).slice(0, 3), (item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-secondary transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary">{item.productName}</span>
                          <span className="text-border-secondary">x{item.quantity}</span>
                          <span className="text-text-primary">
                            {(item.unitPrice * item.quantity).toLocaleString()}円
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.orderId ? (
                            <>
                              <Badge variant="success" size="sm">注文済み</Badge>
                              <Link
                                href={`/member/orders/${item.orderId}`}
                                className="text-xs text-primary hover:underline"
                              >
                                詳細
                              </Link>
                            </>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleCreateOrderClick(quotation, item)}
                              className="text-xs px-3 py-1 shadow-sm hover:shadow-md group/btn"
                            >
                              <FileText className="w-3 h-3 mr-1 transition-transform group-hover/btn:scale-110" />
                              発注する
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {quotation.items && quotation.items.length > 3 && (
                      <p className="text-text-muted">
                        他 {quotation.items.length - 3} 点
                      </p>
                    )}
                  </div>

                  <div className="text-lg font-semibold text-text-primary">
                    合計: {quotation.totalAmount.toLocaleString()}円
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
                    {/* View Detail Button - Always visible */}
                    <Link href={`/member/quotations/${quotation.id}`} className="block">
                      <Button variant="secondary" size="sm" className="w-full group/btn">
                        <Eye className="w-4 h-4 mr-1.5 transition-transform group-hover/btn:scale-110" />
                        詳細を見る
                      </Button>
                    </Link>

                    {/* PDF Download Button - Always visible */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(quotation)}
                      disabled={downloadingQuoteId === quotation.id}
                      className="w-full group/btn"
                    >
                      <Download className={`w-4 h-4 mr-1.5 transition-transform ${downloadingQuoteId === quotation.id ? 'animate-spin' : 'group-hover/btn:scale-110'}`} />
                      {downloadingQuoteId === quotation.id ? 'PDF作成中...' : 'PDFダウンロード'}
                    </Button>


                    {/* Delete Button - DRAFT status only */}
                    {(quotation.status === 'DRAFT' || quotation.status === 'draft') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuotation(quotation.id)}
                        disabled={deletingQuoteId === quotation.id}
                        className="w-full group/btn"
                      >
                        <Trash2 className={`w-4 h-4 mr-1.5 transition-transform ${deletingQuoteId === quotation.id ? 'animate-pulse' : 'group-hover/btn:scale-110'}`} />
                        {deletingQuoteId === quotation.id ? '削除中...' : '削除'}
                      </Button>
                    )}

                    {/* Convert to Order - APPROVED status only */}
                    {(quotation.status === 'APPROVED' || quotation.status === 'approved') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/member/orders/new?quotationId=${quotation.id}`;
                        }}
                        className="w-full group/btn shadow-md hover:shadow-lg"
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

      {/* Order Confirmation Modal */}
      {selectedQuotation && selectedQuotationItem && (
        <OrderConfirmationModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          quotation={selectedQuotation}
          quotationItem={selectedQuotationItem}
          onConfirm={handleOrderConfirm}
        />
      )}
    </div>
  );
}

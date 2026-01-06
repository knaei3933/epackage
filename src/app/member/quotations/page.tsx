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
import { Card, Badge, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download } from 'lucide-react';
import type { Quotation, QuotationStatus } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';
import { generateQuotePDF, type QuoteData } from '@/lib/pdf-generator';
import { translateBagType, translateMaterialType } from '@/constants/enToJa';
import OrderConfirmationModal, {
  type OrderConfirmationData,
  type OrderConfirmationResponse,
} from '@/components/quote/OrderConfirmationModal';
import Link from 'next/link';
import { Eye, Trash2, FileText, AlertCircle } from 'lucide-react';
import { safeMap } from '@/lib/array-helpers';

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
// Helper Functions
// =====================================================

/**
 * Map database specifications to PDF template format
 * Converts English IDs to Japanese display names
 */
function mapSpecificationsToPDF(specs: Record<string, unknown> | undefined): Record<string, string | boolean | number> {
  if (!specs) return {};

  const bagTypeId = specs.bagTypeId as string | undefined;
  const materialId = specs.materialId as string | undefined;
  const postProcessingOptions = specs.postProcessingOptions as string[] | undefined;

  return {
    // Bag type (e.g., flat_3_side -> 三方シール)
    bagType: bagTypeId ? translateBagType(bagTypeId) : 'スタンドパウチ',

    // Contents (default value)
    contents: '粉体',

    // Size (dimensions)
    size: specs.dimensions as string || `${specs.width || 0}×${specs.height || 0}${(specs.depth as number || 0) > 0 ? `×${specs.depth}` : ''}`,

    // Material (e.g., pet_al -> PET+AL)
    material: materialId ? translateMaterialType(materialId) : 'PET+AL',

    // Seal specifications (defaults based on bag type)
    sealWidth: '5mm',
    sealDirection: '上',

    // Notch specifications
    notchShape: 'V',
    notchPosition: '指定位置',

    // Hanging hole
    hanging: 'なし',
    hangingPosition: '指定位置',

    // Zipper position (check if zipper is in post processing options)
    zipperPosition: postProcessingOptions?.some(opt => opt.includes('zipper') || opt.includes('zip')) ? '指定位置' : 'なし',

    // Corner R
    cornerR: 'R5',
  };
}

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
      let fetchError: any = null;

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

  const handleDownloadPDF = async (quotation: Quotation) => {
    setDownloadingQuoteId(quotation.id);

    try {
      // Validate quotation has items
      if (!quotation.items || quotation.items.length === 0) {
        throw new Error('見積明細がありません');
      }

      // Format dates as YYYY-MM-DD
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Build quote items from quotation items with validation
      const quoteItems = quotation.items
        .filter((item) => item.productName && item.quantity > 0 && item.unitPrice >= 0)
        .map((item) => {
          const specs = item.specifications as Record<string, unknown> | undefined;
          const bagTypeId = specs?.bagTypeId as string | undefined;
          const materialId = specs?.materialId as string | undefined;
          const dimensions = specs?.dimensions as string | undefined;

          return {
            id: item.id,
            name: item.productName || '製品名なし',
            description: dimensions
              ? `サイズ: ${dimensions} | ${materialId ? translateMaterialType(materialId) : '-'}`
              : '-',
            quantity: item.quantity || 0,
            unit: '個',
            unitPrice: Math.round(item.unitPrice || 0),
            amount: Math.round(item.totalPrice || item.unitPrice * item.quantity || 0),
          };
        });

      // Check if we have valid items after filtering
      if (quoteItems.length === 0) {
        throw new Error('有効な見積明細がありません');
      }

      // Prepare PDF data with Excel template format
      const pdfData = {
        quoteNumber: quotation.quotationNumber,
        issueDate: formatDate(quotation.createdAt),
        expiryDate: formatDate(quotation.validUntil),
        quoteCreator: 'EPACKAGE Lab 見積システム',

        // Customer information (from profile)
        customerName: profile?.kanji_last_name && profile?.kanji_first_name
          ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
          : (profile?.company_name || user?.email?.split('@')[0] || 'お客様'),
        customerNameKana: profile?.kana_last_name && profile?.kana_first_name
          ? `${profile.kana_last_name} ${profile.kana_first_name}`
          : '',
        companyName: profile?.company_name || '',
        postalCode: profile?.postal_code || '',
        address: (profile?.prefecture || profile?.city || profile?.street)
          ? `${profile?.prefecture || ''}${profile?.city || ''}${profile?.street || ''}`
          : '',
        contactPerson: profile?.kanji_last_name && profile?.kanji_first_name
          ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
          : '',
        phone: profile?.corporate_phone || profile?.personal_phone || '',
        email: user?.email || '',

        // Quote items
        items: quoteItems,

        // Product specifications (from first item's specifications)
        // Map database format (English IDs) to PDF template format (Japanese names)
        specifications: mapSpecificationsToPDF(quotation.items[0]?.specifications),

        // Optional processing - check postProcessingOptions array
        optionalProcessing: (() => {
          const allPostProcessingOptions = (quotation.items || []).flatMap(item =>
            (item.specifications?.postProcessingOptions as string[]) || []
          );
          return {
            zipper: allPostProcessingOptions.some(opt => opt.includes('zipper') || opt.includes('zip')),
            notch: allPostProcessingOptions.some(opt => opt.includes('notch') || opt.includes('tear')),
            hangingHole: allPostProcessingOptions.some(opt => opt.includes('hang') || opt.includes('hole')),
            cornerProcessing: allPostProcessingOptions.some(opt => opt.includes('corner') || opt.includes('r')),
          };
        })(),

        // Terms
        paymentTerms: '先払い',
        deliveryDate: '校了から約1か月',
        deliveryLocation: '指定なし',
        validityPeriod: '見積発行から3ヶ月間',
        remarks: `※製造工程上の都合により、実際の納品数量はご注文数量に対し最大10％程度の過不足が生じる場合がございます。
数量の完全保証はいたしかねますので、あらかじめご了承ください。
※不足分につきましては、実際に納品した数量に基づきご請求いたします。
前払いにてお支払いいただいた場合は、差額分を返金いたします。
※原材料価格の変動等により、見積有効期限経過後は価格が変更となる場合がございます。
再見積の際は、あらかじめご了承くださいますようお願いいたします。
※本見積金額には郵送費を含んでおります。
※お客様によるご確認の遅れ、その他やむを得ない事情により、納期が前後する場合がございます。
※年末年始等の長期休暇期間を挟む場合、通常より納期が延びる可能性がございます。
※天候不良、事故、交通事情等の影響により、やむを得ず納期が遅延する場合がございますので、あらかじめご了承ください。`,
      };

      // Generate PDF directly on client side (requires browser environment for html2canvas)
      const result = await generateQuotePDF(pdfData as QuoteData, {
        filename: `${quotation.quotationNumber}.pdf`,
      });

      if (!result.success || !result.pdfBuffer) {
        throw new Error(result.error || 'PDF generation failed');
      }

      // Convert buffer to Uint8Array for browser compatibility, then to blob and download
      const uint8Array = new Uint8Array(result.pdfBuffer);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || `${quotation.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('PDF downloaded successfully:', quotation.quotationNumber);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('PDFのダウンロードに失敗しました');
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
    try {
      const response = await fetch('/api/orders/create', {
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
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Only fetch when auth context is fully loaded
    if (!authLoading) {
      fetchQuotations();
    }
  }, [selectedStatus, user?.id, authLoading]);

  // Show loading state while auth context is initializing
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">見積依頼</h1>
          <p className="text-text-muted mt-1">見積依頼の一覧とステータス確認</p>
        </div>
        <Button variant="primary" onClick={() => (window.location.href = '/quote-simulator')}>
          <span className="mr-2">+</span>新規見積
        </Button>
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
          <p className="text-text-muted">
            {selectedStatus === 'all'
              ? '見積依頼がありません'
              : statusFilterOptions.find((o) => o.value === selectedStatus)?.label + "の見積はありません"}
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => (window.location.href = '/quote-simulator')}
          >
            見積を作成する
          </Button>
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

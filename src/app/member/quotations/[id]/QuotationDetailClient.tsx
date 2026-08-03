/**
 * Member Quotation Detail Page
 *
 * 会員見積書詳細ページ
 * - 見積情報の詳細表示
 * - 品目明細
 * - PDFダウンロード
 * - ドラフト状態の編集・削除
 * - 承認済み見積の注文変換
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Badge, Button } from '@/components/ui';
import { OrderConsentModal } from '@/components/member/OrderConsentModal';
import type { OrderAgreementInput } from '@/lib/order-consent-terms';
import type { User } from '@/types/auth';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Download,
  Trash2,
  FileText,
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Check,
} from 'lucide-react';
import { translateBagType, translateMaterialType, translatePostProcessing, BAG_TYPE_JA } from '@/constants/enToJa';
import { InvoiceDownloadButton } from '@/components/quote/shared/InvoiceDownloadButton';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';
import { formatContentsDisplay } from '@/constants/contentsData';
import { getPrintingLabelJa } from '@/lib/product-display-name';
import { getEffectiveValidUntil } from '@/lib/quotation-utils';
import type { Quotation } from '@/types/dashboard';
import type { Profile } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/utils/formatters';
import { useToastContext } from '@/components/ui/Toast';
import { CommonSpecifications } from './parts/CommonSpecifications';
import { LineItems } from './parts/LineItems';
import { DownloadHistoryAndStatus } from './parts/DownloadHistoryAndStatus';
import { fetchQuotation as fetchQuotationAPI, fetchDocumentHistory as fetchDocumentHistoryAPI, logDocumentAction as logDocumentActionAPI, deleteQuotationById as deleteQuotationByIdAPI, convertQuotationToOrderWithNotes as convertQuotationToOrderWithNotesAPI, downloadPdfBlob as downloadPdfBlobAPI } from '@/lib/api/member/quotations';

// =====================================================
// Types
// =====================================================

interface QuotationDetailPageProps {
  userId: string;
  userEmail?: string;
  userProfile?: Profile;
  quotationId: string;
}

// =====================================================
// Constants
// =====================================================

const quotationStatusLabels: Record<string, string> = {
  DRAFT: '見積依頼中',
  QUOTATION_PENDING: '見積承認待ち',
  QUOTATION_APPROVED: '見積承認済み',
  SENT: '見積依頼済み',
  APPROVED: '承認済み',
  REJECTED: '却下',
  EXPIRED: '期限切れ',
  CONVERTED: '注文変換済み',
};

const quotationStatusVariants: Record<string, 'success' | 'secondary' | 'error' | 'warning' | 'info' | 'default'> = {
  DRAFT: 'warning',
  QUOTATION_PENDING: 'warning',
  QUOTATION_APPROVED: 'success',
  SENT: 'success',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
  CONVERTED: 'default',
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * 袋タイプIDを日本語名に変換
 */

import { getBagTypeName, getMaterialName, getThicknessName, getContentsDisplay, mapSpecificationsToPDF } from './parts/specs-helpers';


// =====================================================
// Page Component
// =====================================================

export function QuotationDetailClient({ userId, userEmail, userProfile, quotationId }: QuotationDetailPageProps) {
  const router = useRouter();
  const params = useParams();
  // Use quotationId from props instead of params
  const id = quotationId || params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const { showError, showSuccess } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [downloadCount, setDownloadCount] = useState(0);
  const [lastDownloadedAt, setLastDownloadedAt] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  // Phase 2 fix: pattern (quantity) selection state. The quotation detail page
  // previously rendered items as a static list and converted ALL items at once.
  // Now the user selects exactly one quantity pattern before confirming the order.
  // Single-item quotations auto-select.
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Issue 4: order confirmation modal state. Before converting to an order,
  // the user must review a specs checklist + terms and check an agreement box.
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

  // Fetch quotation details
  const fetchQuotation = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchQuotationAPI(quotationId) as any;
      setQuotation(result);
    } catch (err) {
      console.error('Failed to fetch quotation:', err);
      setError('見積の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch download history
  const fetchDownloadHistory = async () => {
    try {
      const data = await fetchDocumentHistoryAPI(quotationId) as any;
      if (data) {
        setDownloadHistory(data.history || []);
        setDownloadCount(data.statistics?.downloadCount || 0);
        setLastDownloadedAt(data.statistics?.lastDownloadedAt);
      }
    } catch (err) {
      console.error('Failed to fetch download history:', err);
    }
  };

  useEffect(() => {
    if (userId && quotationId) {
      fetchQuotation();
      fetchDownloadHistory();
    }
  }, [userId, quotationId]);

  // Phase 2 fix: auto-select when there is exactly one item (single pattern).
  useEffect(() => {
    if (quotation?.items && quotation.items.length === 1) {
      setSelectedItemId(quotation.items[0].id);
    } else if (quotation?.items && quotation.items.length > 1 && !selectedItemId) {
      // multi-pattern: leave unselected until the user picks one
      setSelectedItemId(null);
    }
  }, [quotation?.items]);

  const handleDownloadPDF = async () => {
    if (!quotation) return;

    setDownloadingPDF(true);

    try {
      // 保存されたPDFがある場合はそれを直接使用（シミュレーターで生成したPDFを維持）
      if (quotation.pdf_url) {

        // Supabase StorageからPDFをダウンロード
        const blob = await downloadPdfBlobAPI(quotation.pdf_url!);
        const url = window.URL.createObjectURL(blob);

        // 新しいタブでPDFを開く
        window.open(url, '_blank');

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        // Log PDF download to database
        try {
          await logDocumentActionAPI({
            document_type: 'quote',
            document_id: quotation.id,
            quotation_id: quotation.id,
            action: 'downloaded',
          });
          // Refresh download history after logging
          fetchDownloadHistory();
        } catch (logError) {
          console.error('Failed to log PDF download:', logError);
          // Don't alert user about logging failure
        }

        return;
      }
      // No saved PDF — do NOT regenerate a different PDF.
      // Match QuotationsClient.tsx behavior: inform the user to re-issue via simulator.
      showError('保存済みPDFがありません。見積シミュレーターで再度PDFを発行してください。');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      showError('PDFのダウンロードに失敗しました');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('この見積を削除してもよろしいですか？この操作は取り消せません。')) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteQuotationByIdAPI(id);

      router.push('/member/quotations');
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      showError('見積の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">読込み中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quotation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-error-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error || '見積が見つかりません'}</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          戻る
        </Button>
      </div>
    );
  }

  const status = quotation?.status?.toUpperCase() || 'DRAFT';
  // ========================================
  // 価格計算: データベース保存値を優先
  // リスト表示と一致させるため、計算ではなくDB値を使用
  // ========================================
  // 税抜き価格: DB保存値を優先
  const subtotal = quotation?.subtotal || quotation?.subtotalAmount || quotation?.subtotal_amount || 0;
  // 消費税: DB保存値を優先、なければ小計の10%を四捨五入
  const taxAmount = quotation?.taxAmount || quotation?.tax_amount || Math.round(subtotal * 0.1);
  // 合計: DB保存値の total_amount を優先（100円切り上げ済みの正確な合計）
  // フォールバック: 小計 + 消費税（レガシーデータ対応）
  const displayTotalAmount = quotation?.totalAmount || quotation?.total_amount || (subtotal + taxAmount);
  // 注文変換可能か: 有効期間内の再注文を許容。canConvert は「キャンセルされていない・期限内」のみで判定。
  // 全パターン注文済（isAllOrdered）でも期限内なら再注文可能（補助メッセージで案内）。
  const rawStatus = (quotation?.status as string) || '';
  const statusUpper = rawStatus.toUpperCase();
  const isCancelled = statusUpper === 'CANCELLED';
  const isExpired = getEffectiveValidUntil(quotation) < new Date();
  const hasUnorderedItem = (quotation?.items || []).some((i: any) => !(i as any).orderId);
  const canConvert = !isCancelled && !isExpired;
  const isAllOrdered = !hasUnorderedItem;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              見積書詳細
            </h1>
            <p className="text-text-muted mt-1">
              見積番号: {quotation.quotationNumber}
            </p>
          </div>
        </div>
        <Badge variant={quotationStatusVariants[status] || 'default'} size="md">
          {quotationStatusLabels[status] || status}
        </Badge>
      </div>

      {/* Quotation Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">見積情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-text-muted">作成日</dt>
            <dd className="text-text-primary mt-1">
              {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('ja-JP') : '-'}
              {quotation.createdAt && (
                <span className="text-text-muted ml-2">
                  ({formatDistanceToNow(new Date(quotation.createdAt), { addSuffix: true, locale: ja })})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">有効期限</dt>
            <dd className="text-text-primary mt-1">
              {quotation.validUntil
                ? new Date(quotation.validUntil).toLocaleDateString('ja-JP')
                : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">お客様名</dt>
            <dd className="text-text-primary mt-1">
              {userProfile?.kanji_last_name && userProfile?.kanji_first_name
                ? `${userProfile.kanji_last_name} ${userProfile.kanji_first_name}`
                : (userProfile?.company_name || userEmail?.split('@')[0] || '-')}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">メールアドレス</dt>
            <dd className="text-text-primary mt-1">{userEmail || quotation.customer_email || '-'}</dd>
          </div>
          {quotation.customer_phone && (
            <div>
              <dt className="text-text-muted">電話番号</dt>
              <dd className="text-text-primary mt-1">{quotation.customer_phone}</dd>
            </div>
          )}
          {quotation.sentAt && (
            <div>
              <dt className="text-text-muted">送信日時</dt>
              <dd className="text-text-primary mt-1">
                {new Date(quotation.sentAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          )}
          {quotation.approvedAt && (
            <div>
              <dt className="text-text-muted">承認日時</dt>
              <dd className="text-text-primary mt-1">
                {new Date(quotation.approvedAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          )}
          {quotation.estimatedDeliveryDate && (
            <div>
              <dt className="text-text-muted">予定納期</dt>
              <dd className="text-text-primary mt-1">
                {new Date(quotation.estimatedDeliveryDate).toLocaleDateString('ja-JP')}
              </dd>
            </div>
          )}
          {quotation.salesRep && (
            <div>
              <dt className="text-text-muted">営業担当</dt>
              <dd className="text-text-primary mt-1">{quotation.salesRep}</dd>
            </div>
          )}
          {quotation.notes && (
            <div className="md:col-span-2">
              <dt className="text-text-muted">備考</dt>
              <dd className="text-text-primary mt-1">
                <p className="whitespace-pre-wrap">{quotation.notes}</p>
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Common Specifications - Display once for all items */}
      <CommonSpecifications quotation={quotation} />
      {/* Line Items */}
      <LineItems quotation={quotation} selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} canConvert={canConvert} subtotal={subtotal} taxAmount={taxAmount} displayTotalAmount={displayTotalAmount} />
      {/* Bank Information - Hidden for quotation detail page */}

      {/* Download History */}
      <DownloadHistoryAndStatus
        downloadHistory={downloadHistory}
        downloadCount={downloadCount}
        lastDownloadedAt={lastDownloadedAt}
        quotation={quotation}
      />
      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>

          {/* Right-aligned actions */}
          <div className="flex flex-wrap gap-3">
            {/* PDF Download */}
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
            >
              <Download className={`w-4 h-4 mr-2 ${downloadingPDF ? 'animate-spin' : ''}`} />
              {downloadingPDF ? 'PDF作成中...' : 'PDFダウンロード'}
            </Button>

            {/* 注文変換 - 状態に応じて表示を変える */}
            {canConvert ? (
              <>
                {/* 数量パターン選択の催促（複数パターン時・未選択） */}
                {quotation.items && quotation.items.length > 1 && !selectedItemId && (
                  <div className="text-sm text-amber-700 font-medium mr-2 self-center">
                    数量パターンを選択してください
                  </div>
                )}
                {/* 全パターン注文済でも有効期間内は再注文可能な旨を案内 */}
                {isAllOrdered && (
                  <div className="text-sm text-blue-700 font-medium mr-2 self-center">
                    すべての数量パターンは注文済みですが、有効期間内は再注文できます
                  </div>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setShowOrderConfirm(true);
                  }}
                  disabled={isConverting || (!!quotation.items && quotation.items.length > 1 && !selectedItemId)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isConverting ? '変換中...' : '注文確定'}
                </Button>
                <InvoiceDownloadButton quotationId={quotation.id} variant="outline" />
              </>
            ) : isCancelled ? (
              <Button variant="outline" size="md" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                この見積はキャンセルされています
              </Button>
            ) : isExpired ? (
              <Button variant="outline" size="md" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                有効期限が切れています
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Conversion Error Display */}
      {convertError && (
        <div className="flex items-center gap-2 text-error-500 bg-error-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{convertError}</p>
        </div>
      )}

      {/* Issue 4: Order Confirmation Modal
          Before converting to an order, the user reviews a specs checklist + terms
          and must check an agreement box. Only then does the convert API fire. */}
      {/* Phase D: 既存同意 Dialog を共通 OrderConsentModal に置換
          （5同意チェック + フルネーム入力 + サーバー証憠保存）。
          仕様サマリーは specSummary に渡し、onConfirm で agreement を付加して変換 API を呼ぶ。 */}
      <OrderConsentModal
        open={showOrderConfirm}
        onOpenChange={(o) => { if (!isConverting) setShowOrderConfirm(o); }}
        isProcessing={isConverting}
        specSummary={(() => {
          const selectedItem = quotation.items?.find(i => i.id === selectedItemId) || quotation.items?.[0];
          if (!selectedItem) return null;
          const specs = selectedItem.specifications || {};
          const pType = specs.printingType;
          const printingLabel = getPrintingLabelJa(pType as string | undefined, specs.cost_breakdown as Record<string, unknown> | null | undefined).replace('（フルカラー）', '');
          const ppOpts = (specs.postProcessingOptions || []) as string[];
          const nonePatterns = ['zipper-no','valve-no','machi-printing-no','notch-no','hang-hole-no','corner-square'];
          const isNone = (o: string) => nonePatterns.includes(o) || /-no$/.test(o);
          const activePP = ppOpts.filter(o => !o.startsWith('sealing-width-') && !isNone(o));
          const ppLabel = activePP.length === 0 ? 'なし' : activePP.map(o => translatePostProcessing(o)).join('、');
          return (
            <>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">ご注文内容</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-gray-500">商品</dt>
                <dd className="text-gray-900">{selectedItem.productName || '-'}</dd>
                <dt className="text-gray-500">数量</dt>
                <dd className="text-gray-900">{(selectedItem.quantity || 0).toLocaleString()}個</dd>
                <dt className="text-gray-500">単価</dt>
                <dd className="text-gray-900">¥{formatPrice(selectedItem.unitPrice || 0)}</dd>
                <dt className="text-gray-500">金額</dt>
                <dd className="text-gray-900 font-semibold">¥{formatPrice(selectedItem.totalPrice || (selectedItem.unitPrice * selectedItem.quantity) || 0)}</dd>
                <dt className="text-gray-500">印刷方式</dt>
                <dd className="text-gray-900">{printingLabel}</dd>
                <dt className="text-gray-500">後加工</dt>
                <dd className="text-gray-900">{ppLabel}</dd>
              </dl>
            </>
          );
        })()}
        onConfirm={async (agreement: OrderAgreementInput) => {
          setIsConverting(true);
          setConvertError(null);
          try {
            const itemsToSend = quotation.items && quotation.items.length > 1
              ? (selectedItemId ? { selectedItemIds: [selectedItemId] } : {})
              : {};
            const result = await convertQuotationToOrderWithNotesAPI(quotationId, { notes: quotation?.notes, ...itemsToSend, agreement });
            if (result.success) {
              router.push(`/member/orders/${result.data.id}`);
            } else if (result.alreadyExists) {
              router.push(`/member/orders/${result.data.id}`);
            } else {
              setConvertError(result.error || '注文作成に失敗しました');
              setShowOrderConfirm(false);
            }
          } catch (error) {
            console.error('注文作成エラー:', error);
            setConvertError('注文作成中にエラーが発生しました');
            setShowOrderConfirm(false);
          } finally {
            setIsConverting(false);
          }
        }}
      />
    </div>
  );
}

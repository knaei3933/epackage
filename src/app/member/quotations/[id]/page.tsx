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
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Download,
  Trash2,
  FileText,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { generateQuotePDF, type QuoteData } from '@/lib/pdf-generator';
import { translateBagType, translateMaterialType } from '@/constants/enToJa';
import { BankInfoCard } from '@/components/quote/BankInfoCard';
import { InvoiceDownloadButton } from '@/components/quote/InvoiceDownloadButton';
import { DataImportStatusPanel } from '@/components/quote/DataImportStatusPanel';
import Link from 'next/link';
import type { Quotation, QuotationItem } from '@/types/dashboard';

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
};

const quotationStatusVariants: Record<string, 'success' | 'secondary' | 'error' | 'warning' | 'info' | 'default'> = {
  DRAFT: 'secondary',
  SENT: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
  CONVERTED: 'default',
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Map database specifications to PDF template format
 */
function mapSpecificationsToPDF(specs: Record<string, unknown> | undefined): Record<string, string | boolean | number> {
  if (!specs) return {};

  const bagTypeId = specs.bagTypeId as string | undefined;
  const materialId = specs.materialId as string | undefined;
  const postProcessingOptions = specs.postProcessingOptions as string[] | undefined;

  return {
    bagType: bagTypeId ? translateBagType(bagTypeId) : 'スタンドパウチ',
    contents: '粉体',
    size: specs.dimensions as string || `${specs.width || 0}×${specs.height || 0}${(specs.depth as number || 0) > 0 ? `×${specs.depth}` : ''}`,
    material: materialId ? translateMaterialType(materialId) : 'PET+AL',
    sealWidth: '5mm',
    sealDirection: '上',
    notchShape: 'V',
    notchPosition: '指定位置',
    hanging: 'なし',
    hangingPosition: '指定位置',
    zipperPosition: postProcessingOptions?.some(opt => opt.includes('zipper') || opt.includes('zip')) ? '指定位置' : 'なし',
    cornerR: 'R5',
  };
}

// =====================================================
// Page Component
// =====================================================

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;
  const { user, profile } = useAuth();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/signin?redirect=/member/quotations');
    }
  }, [user, isLoading, router]);

  // Fetch quotation details
  const fetchQuotation = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/member/quotations/${quotationId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quotation');
      }

      const { quotation: quotationData } = await response.json();
      setQuotation(quotationData);
    } catch (err) {
      console.error('Failed to fetch quotation:', err);
      setError('見積の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && quotationId) {
      fetchQuotation();
    }
  }, [user?.id, quotationId]);

  const handleDownloadPDF = async () => {
    if (!quotation) return;

    setDownloadingPDF(true);

    try {
      if (!quotation.items || quotation.items.length === 0) {
        throw new Error('見積明細がありません');
      }

      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const quoteItems = quotation.items
        .filter((item) => item.productName && item.quantity > 0 && item.unitPrice >= 0)
        .map((item) => {
          const specs = item.specifications as Record<string, unknown> | undefined;
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

      if (quoteItems.length === 0) {
        throw new Error('有効な見積明細がありません');
      }

      const pdfData = {
        quoteNumber: quotation.quotationNumber,
        issueDate: formatDate(quotation.createdAt),
        expiryDate: formatDate(quotation.validUntil),
        quoteCreator: 'EPACKAGE Lab 見積システム',
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
        items: quoteItems,
        specifications: mapSpecificationsToPDF(quotation.items[0]?.specifications),
        optionalProcessing: (() => {
          const allPostProcessingOptions = quotation.items.flatMap(item =>
            (item.specifications?.postProcessingOptions as string[]) || []
          );
          return {
            zipper: allPostProcessingOptions.some(opt => opt.includes('zipper') || opt.includes('zip')),
            notch: allPostProcessingOptions.some(opt => opt.includes('notch') || opt.includes('tear')),
            hangingHole: allPostProcessingOptions.some(opt => opt.includes('hang') || opt.includes('hole')),
            cornerProcessing: allPostProcessingOptions.some(opt => opt.includes('corner') || opt.includes('r')),
          };
        })(),
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

      const result = await generateQuotePDF(pdfData as QuoteData, {
        filename: `${quotation.quotationNumber}.pdf`,
      });

      if (!result.success || !result.pdfBuffer) {
        throw new Error(result.error || 'PDF generation failed');
      }

      const uint8Array = new Uint8Array(result.pdfBuffer);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || `${quotation.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('PDFのダウンロードに失敗しました');
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
      const response = await fetch(`/api/member/quotations/${quotationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quotation');
      }

      router.push('/member/quotations');
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      alert('見積の削除に失敗しました');
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
          <p className="mt-4 text-text-muted">読み込み中...</p>
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

  const status = quotation.status.toUpperCase();
  const subtotal = quotation.subtotal || quotation.subtotalAmount || quotation.totalAmount * 0.909;
  const taxAmount = quotation.taxAmount || quotation.totalAmount - subtotal;
  const canDelete = status === 'DRAFT';
  const canConvert = status === 'APPROVED';

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
              {new Date(quotation.createdAt).toLocaleDateString('ja-JP')}
              <span className="text-text-muted ml-2">
                ({formatDistanceToNow(new Date(quotation.createdAt), { addSuffix: true, locale: ja })})
              </span>
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
            <dd className="text-text-primary mt-1">{quotation.customer_name}</dd>
          </div>
          <div>
            <dt className="text-text-muted">メールアドレス</dt>
            <dd className="text-text-primary mt-1">{quotation.customer_email}</dd>
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

      {/* Line Items */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">品目明細</h2>
        <div className="space-y-4">
          {quotation.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between py-3 border-b border-border-secondary last:border-0"
            >
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">
                  {item.productName}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  数量: {item.quantity} × {item.unitPrice.toLocaleString()}円
                </p>
                {item.specifications && typeof item.specifications === 'object' && Object.keys(item.specifications).length > 0 && (
                  <div className="mt-2 text-sm text-text-muted">
                    <p className="font-medium">仕様:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {item.specifications.size && (
                        <li>サイズ: {item.specifications.size}</li>
                      )}
                      {item.specifications.material && (
                        <li>素材: {item.specifications.material}</li>
                      )}
                      {item.specifications.printing && (
                        <li>印刷: {item.specifications.printing}</li>
                      )}
                      {item.specifications.postProcessing && (
                        <li>
                          後加工:{' '}
                          {Array.isArray(item.specifications.postProcessing)
                            ? item.specifications.postProcessing.join(', ')
                            : item.specifications.postProcessing}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">
                  {item.totalPrice.toLocaleString()}円
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border-secondary space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">小計</span>
            <span className="text-text-primary">{subtotal.toLocaleString()}円</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">消費税 (10%)</span>
            <span className="text-text-primary">{taxAmount.toLocaleString()}円</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-text-primary">合計</span>
            <span className="text-text-primary">
              {quotation.totalAmount.toLocaleString()}円
            </span>
          </div>
        </div>
      </Card>

      {/* Bank Information */}
      <BankInfoCard quotationId={quotation.id} />

      {/* Payment Confirmation & Data Import Status (Task 108, 109) */}
      <DataImportStatusPanel quotationId={quotation.id} orderId={quotation.orderId} />

      {/* Action Buttons - Enhanced with better visual hierarchy */}
      <Card className="p-6 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border-light)]">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Back Button - Secondary */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => router.back()}
            className="group/btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover/btn:-translate-x-0.5" />
            戻る
          </Button>

          <div className="flex-1" />

          {/* Right-aligned actions */}
          <div className="flex flex-wrap gap-3">
            {/* PDF Download - Outline */}
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="group/btn"
            >
              <Download className={`w-4 h-4 mr-2 transition-transform ${downloadingPDF ? 'animate-spin' : 'group-hover/btn:scale-110'}`} />
              {downloadingPDF ? 'PDF作成中...' : 'PDFダウンロード'}
            </Button>

            {/* Delete Button - Destructive */}
            {canDelete && (
              <Button
                variant="destructive"
                size="md"
                onClick={handleDelete}
                disabled={isDeleting}
                className="group/btn shadow-md hover:shadow-lg"
              >
                <Trash2 className={`w-4 h-4 mr-2 transition-transform ${isDeleting ? 'animate-pulse' : 'group-hover/btn:scale-110'}`} />
                {isDeleting ? '削除中...' : '削除'}
              </Button>
            )}

            {/* Convert to Order - Primary (CTA) */}
            {canConvert && (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    router.push(`/member/orders/new?quotationId=${quotation.id}`);
                  }}
                  className="group/btn shadow-lg hover:shadow-xl px-6"
                >
                  <FileText className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110" />
                  注文する
                </Button>
                <InvoiceDownloadButton quotationId={quotation.id} variant="outline" />
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

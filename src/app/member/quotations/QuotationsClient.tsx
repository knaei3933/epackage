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
import { translateMaterialType, translateBagType } from '@/constants/enToJa';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';
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
import { formatPrice, formatDate } from '@/utils/formatters';
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
      // 両方のフィールド名をチェック（pdfUrlとpdf_url）
      const savedPdfUrl = quotation.pdfUrl || (quotation as any).pdf_url;

      if (savedPdfUrl && typeof savedPdfUrl === 'string' && savedPdfUrl.trim() !== '' && savedPdfUrl.startsWith('http')) {
        console.log('[handleDownloadPDF] Found saved PDF URL:', savedPdfUrl);

        // 直接ダウンロードリンクを作成してクリック
        const link = document.createElement('a');
        link.href = savedPdfUrl;
        link.target = '_blank';
        link.download = `${quotation.quotationNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('[handleDownloadPDF] PDF downloaded from Storage successfully:', quotation.quotationNumber);

        // ダウンロード履歴を記録
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
      console.log('[handleDownloadPDF] No valid saved PDF found, will generate new PDF...');

      // PDF生成ロジック（既存コードを維持）
      if (!quotation.items || quotation.items.length === 0) {
        throw new Error('見積明細がありません');
      }

      const quoteItems = quotation.items
        .filter((item) => item.productName && item.quantity > 0 && item.unitPrice >= 0)
        .map((item) => {
          const specs = item?.specifications as Record<string, unknown> | undefined;
          const materialId = specs?.materialId as string | undefined;
          const dimensions = specs?.dimensions as string | undefined;
          const bagTypeId = specs?.bagTypeId as string | undefined;

          // サイズ表示を構築
          let sizeText: string;
          if (bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch') {
            const pitchVal = specs?.pitch || (specs?.specifications as any)?.pitch || 0;
            sizeText = `幅: ${specs?.width || 0}mm${pitchVal ? `、ピッチ: ${pitchVal}mm` : ''}`;
          } else {
            const itemSideWidth = specs?.sideWidth as number | undefined;
            if (dimensions) {
              if (itemSideWidth && !dimensions.includes('側面')) {
                sizeText = dimensions.replace(' mm', `${itemSideWidth ? `×側面${itemSideWidth}` : ''} mm`);
              } else {
                sizeText = dimensions;
              }
            } else {
              sizeText = `${specs?.width || 0}×${specs?.height || 0}${((specs?.depth as number || 0) > 0 && bagTypeId !== 'lap_seal') ? `×${specs?.depth}` : ''}${itemSideWidth ? `×側面${itemSideWidth}` : ''}`;
            }
          }

          return {
            id: item.id,
            name: item.productName || '製品名なし',
            description: sizeText
              ? `サイズ: ${sizeText} | ${materialId ? translateMaterialType(materialId) : '-'}`
              : '-',
            quantity: item.quantity || 0,
            unit: '個',
            unitPrice: item.unitPrice || 0,
            amount: item.totalPrice || item.unitPrice * item.quantity || 0,
          };
        });

      if (quoteItems.length === 0) {
        throw new Error('有効な見積明細がありません');
      }

      // mapSpecificationsToPDF関数を定義
      function mapSpecificationsToPDF(specs: Record<string, unknown> | undefined): Record<string, string | boolean | number> {
        if (!specs) return {};

        const bagTypeId = specs?.bagTypeId as string | undefined;
        const materialId = specs?.materialId as string | undefined;
        const postProcessingOptions = specs?.postProcessingOptions as string[] | undefined;

        const pitchValue = specs?.pitch || (specs?.specifications as any)?.pitch || 0;
        const sideWidth = specs?.sideWidth as number | undefined;
        let sizeDisplay = '';
        if (bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch') {
          sizeDisplay = `幅: ${specs?.width || 0}mm${pitchValue ? `、ピッチ: ${pitchValue}mm` : ''}`;
        } else {
          const existingDimensions = specs?.dimensions as string;
          if (existingDimensions) {
            if (sideWidth && !existingDimensions.includes('側面')) {
              sizeDisplay = existingDimensions.replace(' mm', `${sideWidth ? `×側面${sideWidth}` : ''} mm`);
            } else {
              sizeDisplay = existingDimensions;
            }
          } else {
            sizeDisplay = `${specs?.width || 0}×${specs?.height || 0}${((specs?.depth as number || 0) > 0 && bagTypeId !== 'lap_seal') ? `×${specs?.depth}` : ''}${sideWidth ? `×側面${sideWidth}` : ''}`;
          }
        }

        let notchShape = 'V';
        if (postProcessingOptions?.includes('notch-straight')) {
          notchShape = '直線';
        } else if (postProcessingOptions?.includes('notch-no')) {
          notchShape = 'なし';
        }

        let hanging = 'なし';
        let hangingPosition = '指定位置';
        if (postProcessingOptions?.includes('hang-hole-6mm')) {
          hanging = 'あり';
          hangingPosition = '6mm';
        } else if (postProcessingOptions?.includes('hang-hole-8mm')) {
          hanging = 'あり';
          hangingPosition = '8mm';
        }

        let sealWidth = '5mm';
        const sealWidthField = specs?.sealWidth as string | undefined;
        if (sealWidthField) {
          sealWidth = sealWidthField.replace('シール幅 ', '').replace('mm', '');
        } else {
          const sealWidthOption = postProcessingOptions?.find((opt: string) => opt.startsWith('sealing-width-'));
          if (sealWidthOption) {
            const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
            if (widthMatch) {
              sealWidth = widthMatch[1].replace('-', '.');
            }
          }
        }

        const sealDirection = '上';

        const thicknessSelection = specs?.thicknessSelection as string | undefined;
        let thicknessType = '-';
        if (materialId && thicknessSelection) {
          thicknessType = getMaterialSpecification(materialId, thicknessSelection);
        }
        if (thicknessType === '-' && materialId) {
          // kraft 系は仕様値（50g/80g）が未確定のため Phase 2 後退（現状維持）。
          // kraft 以外は getFilmStructureLabel（materialData.ts の specificationEn）で統合。
          const isKraft = materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe';
          if (isKraft) {
            const defaultThicknessSpec: Record<string, string> = {
              'kraft_vmpet_lldpe': 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
              'kraft_pet_lldpe': 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
            };
            thicknessType = defaultThicknessSpec[materialId] || '-';
          } else {
            const label = getFilmStructureLabel(materialId, thicknessSelection);
            thicknessType = (label && label !== materialId) ? label : '-';
          }
        }

        return {
          bagType: bagTypeId ? translateBagType(bagTypeId) : 'スタンドパウチ',
          contents: '粉体',
          size: sizeDisplay,
          material: materialId ? translateMaterialType(materialId) : 'PET+AL',
          thicknessType,
          sealWidth,
          sealDirection,
          notchShape,
          notchPosition: (postProcessingOptions?.includes('notch-yes') || postProcessingOptions?.includes('notch-straight')) ? '指定位置' : undefined,
          hanging,
          hangingPosition,
          zipperPosition: postProcessingOptions?.some(opt => opt.includes('zipper') || opt.includes('zip')) ? '指定位置' : 'なし',
          cornerR: postProcessingOptions?.includes('corner-round') ? 'R5' : postProcessingOptions?.includes('corner-square') ? 'R0' : 'R5',
          machiPrinting: postProcessingOptions?.includes('machi-printing-yes') ? 'あり' : 'なし',
        };
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
        specifications: (() => {
          const mappedSpecs = mapSpecificationsToPDF(quotation.items[0]?.specifications);
          const originalSpecs = quotation.items[0]?.specifications as Record<string, unknown> | undefined;
          const productTypeSpecificFields: Record<string, unknown> = {};

          if (originalSpecs?.spoutSize) productTypeSpecificFields.spoutSize = originalSpecs.spoutSize;
          if (originalSpecs?.spoutPosition) productTypeSpecificFields.spoutPosition = originalSpecs.spoutPosition;
          if (originalSpecs?.hasGusset !== undefined) productTypeSpecificFields.hasGusset = originalSpecs.hasGusset;
          if (originalSpecs?.rollFilmSpecs) productTypeSpecificFields.rollFilmSpecs = originalSpecs.rollFilmSpecs;
          if (originalSpecs?.sideWidth !== undefined) productTypeSpecificFields.sideWidth = originalSpecs.sideWidth;
          if (originalSpecs?.bagTypeId) productTypeSpecificFields.bagTypeId = originalSpecs.bagTypeId;

          return { ...mappedSpecs, ...productTypeSpecificFields };
        })(),
        optionalProcessing: (() => {
          const allPostProcessingOptions = quotation.items.flatMap(item =>
            (item?.specifications as Record<string, unknown>)?.postProcessingOptions as string[] || []
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
数量の完全保証はいたしかねますので、あらかじめご了承ください。`,
      };

      const result = await generateQuotePDF(pdfData as any, {
        filename: `${quotation.quotationNumber}.pdf`,
      });

      if (!result.success || !result.pdfBuffer) {
        throw new Error(result.error || 'PDF generation failed');
      }

      const uint8Array = new Uint8Array(result.pdfBuffer);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank');

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      // PDFをSupabase Storageに保存してpdf_urlを更新
      try {
        const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const base64Data = btoa(binaryString);
        const dataUrl = `data:application/pdf;base64,${base64Data}`;

        await fetch(`/api/member/quotations/${quotation.id}/save-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pdfData: dataUrl }),
        });

        console.log('[handleDownloadPDF] PDF saved to Supabase Storage, pdf_url updated');
      } catch (saveError) {
        console.error('[handleDownloadPDF] Failed to save PDF to storage:', saveError);
      }

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
        fetchDownloadStats();
      } catch (logError) {
        console.error('Failed to log PDF download:', logError);
      }

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
                {quotations.map((quotation) => (
                  <Card key={quotation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* ── ヘッダー行: 見積番号・ステータス・日付・合計 ── */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border-secondary bg-bg-secondary/30">
                      <div className="flex items-center gap-2 flex-wrap">
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
                      <div className="text-lg font-bold text-text-primary">
                        ¥{formatPrice(quotation.total_amount || ((quotation.subtotal_amount || 0) + (quotation.tax_amount || 0)))}
                        <span className="text-xs font-normal text-text-muted ml-1">(税込)</span>
                      </div>
                    </div>

                    {/* ── アイテム一覧（全件表示・コンパクト表形式） ── */}
                    {(quotation.items?.length ?? 0) > 0 && (
                      <div className="px-4 py-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-text-muted border-b border-border-secondary">
                              <th className="text-left font-medium py-1.5 pr-2">品目</th>
                              <th className="text-right font-medium py-1.5 px-2 w-20">数量</th>
                              <th className="text-right font-medium py-1.5 px-2 w-24">単価</th>
                              <th className="text-right font-medium py-1.5 pl-2 w-28">金額</th>
                              <th className="text-center font-medium py-1.5 pl-2 w-20">状態</th>
                            </tr>
                          </thead>
                          <tbody>
                            {safeMap(quotation.items, (item) => {
                              const specs = item.breakdown?.specifications || item.specifications || {};
                              const skuQuantities = specs.sku_quantities;
                              const hasMultipleSKUs = skuQuantities && skuQuantities.length > 1;
                              const isConverted = quotation.status.toLowerCase() === 'converted';

                              return (
                                <tr key={item.id} className="border-b border-border-secondary/50 last:border-0">
                                  <td className="py-1.5 pr-2 text-text-primary">
                                    {hasMultipleSKUs ? (
                                      <span>
                                        <span className="font-medium">SKU分割: {skuQuantities.length}種</span>
                                        <span className="text-text-muted ml-1">
                                          ({skuQuantities.reduce((sum: number, q: number) => sum + q, 0)}個)
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="font-medium">{item.productName || `SKU ${item.id}`}</span>
                                    )}
                                  </td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">
                                    {hasMultipleSKUs ? '—' : `${item.quantity.toLocaleString()}`}
                                  </td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">
                                    {hasMultipleSKUs ? '—' : `¥${formatPrice(item.unitPrice || 0)}`}
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
                    )}

                    {/* ── 製品仕様サマリー ── */}
                    {quotation.items && quotation.items.length > 0 && (() => {
                      const item = quotation.items[0];
                      const specs = item.breakdown?.specifications || item.specifications;
                      return specs && (
                        <div className="px-4 pb-2">
                          <MemberSpecificationDisplay item={{ specifications: specs }} />
                        </div>
                      );
                    })()}

                    {/* ── 後加工プレビュー（標準表示） ── */}
                    {quotation.items && quotation.items.length > 0 && (() => {
                      const item = quotation.items[0];
                      const specs = item.breakdown?.specifications || item.specifications;
                      return specs && specs.postProcessingOptions && specs.postProcessingOptions.length > 0 && (
                        <div className="px-4 pb-2">
                          <PostProcessingPreview
                            selectedOptions={convertToPreviewOptions(specs.postProcessingOptions)}
                            defaultExpanded={true}
                          />
                        </div>
                      );
                    })()}

                    {/* ── フッターアクションバー ── */}
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
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(quotation)}
                          className="group/btn"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 transition-transform group-hover/btn:scale-110" />
                          詳細
                        </Button>

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

                        {['approved', 'quotation_approved'].includes(quotation.status.toLowerCase()) && (
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
                        )}

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
                ))}
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
                    const response = await fetch(`/api/member/quotations/${quotationForSpec.id}/convert`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(
                        selectedItemIds && selectedItemIds.length > 0
                          ? { selectedItemIds }
                          : {}
                      ),
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

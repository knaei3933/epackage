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
import { Card, Badge, Button, PageLoadingState } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download } from 'lucide-react';
import type { Quotation, QuotationStatus } from '@/types/dashboard';
import { supabase } from '@/lib/supabase-browser';
import { translateBagType, translateMaterialType } from '@/constants/enToJa';
import { Eye, Trash2, FileText } from 'lucide-react';
import { safeMap } from '@/lib/array-helpers';
import SpecApprovalModal from '@/components/member/SpecApprovalModal';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';

// Client-side PDF generation imports
import { generateQuotePDF } from '@/lib/pdf-generator';
import { mapDatabaseQuotationToExcel } from '@/lib/excel/excelDataMapper';
import { mapQuotationDataToQuoteData } from '@/lib/excel/quotationToPdfMapper';

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

// =====================================================
// Constants
// =====================================================

const quotationStatusLabels: Record<string, string> = {
  DRAFT: '審査中',
  SENT: '送信済み',
  APPROVED: '承認済み',
  REJECTED: '却下',
  EXPIRED: '期限切れ',
  CONVERTED: '注文変換済み',
  draft: '審査中',
  sent: '送信済み',
  approved: '承認済み',
  rejected: '却下',
  expired: '期限切れ',
  converted: '注文変換済み',
  // 10-step workflow statuses
  QUOTATION_PENDING: '見積依頼中',
  QUOTATION_APPROVED: '見積承認済み',
  DATA_UPLOAD_PENDING: 'データ入待ち',
  DATA_UPLOADED: 'データ入完了',
  CORRECTION_IN_PROGRESS: '修正中',
  CORRECTION_COMPLETED: '修正完了',
  CUSTOMER_APPROVAL_PENDING: '顧客承認待ち',
  PRODUCTION: '製造中',
  READY_TO_SHIP: '出荷予定',
  SHIPPED: '出荷完了',
  CANCELLED: 'キャンセル',
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
  // 10-step workflow statuses
  QUOTATION_PENDING: 'info',
  QUOTATION_APPROVED: 'success',
  DATA_UPLOAD_PENDING: 'secondary',
  DATA_UPLOADED: 'info',
  CORRECTION_IN_PROGRESS: 'warning',
  CORRECTION_COMPLETED: 'info',
  CUSTOMER_APPROVAL_PENDING: 'warning',
  PRODUCTION: 'warning',
  READY_TO_SHIP: 'info',
  SHIPPED: 'success',
  CANCELLED: 'error',
};

const statusFilterOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'DRAFT', label: 'ドラフト' },
  { value: 'SENT', label: '送信済み' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'EXPIRED', label: '期限切れ' },
  { value: 'CONVERTED', label: '注文変換済み' },
  // 10-step workflow statuses
  { value: 'QUOTATION_PENDING', label: '見積依頼中' },
  { value: 'QUOTATION_APPROVED', label: '見積承認済み' },
];

// =====================================================
// Helper Components
// =====================================================

/**
 * 상세 사양 표시용 헬퍼 컴포넌트
 */
function SpecificationDisplay({ item }: { item: any }) {
  if (!item.specifications) return null;

  const specs = item.specifications;

  // 백타입 일본어 변환
  const bagTypeMap: Record<string, string> = {
    'flat_pouch': 'ピローパウチ',
    'flat_3_side': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'gusset': 'ガセットパウチ',
    'roll_film': 'ロールフィルム',
  };

  // 내용물 일본어 변환
  const productCategoryMap: Record<string, string> = {
    'food': '食品',
    'health_supplement': '健康補助食品',
    'cosmetic': '化粧品',
    'quasi_drug': '医薬部外品',
    'drug': '医薬品',
  };
  const contentsTypeMap: Record<string, string> = {
    'solid': '固形',
    'powder': '粉体',
    'liquid': '液体',
  };
  const mainIngredientMap: Record<string, string> = {
    'general_neutral': '一般・中性',
    'oil_surfactant': '油性・界面活性剤',
    'acidic_salty': '酸性・塩分',
    'volatile_fragrance': '揮発性・香料',
    'other': 'その他',
  };
  const distributionEnvironmentMap: Record<string, string> = {
    'general_roomTemp': '一般（常温）',
    'light_oxygen_sensitive': '光・酸素敏感',
    'refrigerated': '冷蔵',
    'high_temp_sterilized': '高温殺菌',
    'other': 'その他',
  };

  // 소재 일본어 변환
  const materialMap: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'pet_ldpe': 'PET/LLDPE',
  };

  // 후加工 일본어 변환 (enToJa.ts와 일치시킴)
  const postProcessingMap: Record<string, string> = {
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
    // 시일 폭
    'sealing-width-5mm': 'シール幅 5mm',
    'sealing-width-7.5mm': 'シール幅 7.5mm',
    'sealing-width-10mm': 'シール幅 10mm',
    // 마치 인쇄
    'machi-printing-yes': 'マチ印刷あり',
    'machi-printing-no': 'マチ印刷なし',
  };

  const bagTypeJa = bagTypeMap[specs.bagTypeId] || specs.bagTypeId || '-';
  const materialJa = materialMap[specs.materialId] || specs.materialId || '-';

  // 두께 - specification 함수 사용
  let thicknessJa = '-';
  if (specs.materialId && specs.thicknessSelection) {
    thicknessJa = getMaterialSpecification(specs.materialId, specs.thicknessSelection);
  }
  if (thicknessJa === '-') {
    // 폴백: 일본어 변환
    const thicknessMap: Record<string, string> = {
      'light': '軽量',
      'medium': '標準',
      'heavy': '高耐久',
      'ultra': '超耐久',
    };
    thicknessJa = thicknessMap[specs.thicknessSelection] || '-';
  }

  // 인쇄 정보
  const printingJa = specs.printingType === 'digital'
    ? `デジタル印刷（フルカラー）`
    : specs.printingType === 'gravure'
      ? `グラビア印刷（フルカラー）`
      : '-';

  // 후加工 리스트 - 로필름/스파우트파우치는 표면처리만 표시
  const isLimitedPostProcessing = specs.bagTypeId === 'roll_film' || specs.bagTypeId === 'spout_pouch';

  // postProcessingOptions에서 시일 폭 관련 옵션 제거 (sealWidth 필드로 표시)
  const filteredOptions = (specs.postProcessingOptions || [])
    .filter((opt: string) => !opt.startsWith('sealing-width-'));

  const filteredPostProcessingOptions = isLimitedPostProcessing
    ? filteredOptions.filter((opt: string) => opt === 'glossy' || opt === 'matte')
    : filteredOptions;

  const postProcessingList = filteredPostProcessingOptions.map((opt: string) => postProcessingMap[opt] || opt).filter(Boolean);

  // 시일 폭 표시 - sealWidth 필드 우선, 없으면 postProcessingOptions에서 추출
  let sealWidthDisplay = null;
  if (specs.sealWidth) {
    // sealWidth 필드가 있는 경우 (예: "7.5mm", "5mm")
    sealWidthDisplay = `シール幅 ${specs.sealWidth}`;
  } else {
    // postProcessingOptions에서 시일 폭 찾기
    const sealWidthOption = (specs.postProcessingOptions || []).find((opt: string) => opt.startsWith('sealing-width-'));
    if (sealWidthOption) {
      const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
      if (widthMatch) {
        const width = widthMatch[1].replace('-', '.');
        sealWidthDisplay = `シール幅 ${width}`;
      }
    }
  }

  // 시일 폭을 후가공 리스트에 추가
  if (sealWidthDisplay && !isLimitedPostProcessing) {
    postProcessingList.unshift(sealWidthDisplay);
  }

  // 납기/배송
  const deliveryJa = specs.deliveryLocation === 'domestic' ? '国内' : specs.deliveryLocation === 'international' ? '海外' : '-';
  const urgencyJa = specs.urgency === 'standard' ? '標準' : specs.urgency === 'express' ? '急ぎ' : '-';

  // 내용물 정보 (일본어 변환)
  const contentsJa = [
    specs.productCategory ? productCategoryMap[specs.productCategory] : null,
    specs.contentsType ? contentsTypeMap[specs.contentsType] : null,
    specs.mainIngredient ? mainIngredientMap[specs.mainIngredient] : null,
    specs.distributionEnvironment ? distributionEnvironmentMap[specs.distributionEnvironment] : null,
  ].filter(Boolean).join('、') || '-';

  // サイズ表示 - ロールフィルムの場合は常に「幅: ○mm、ピッチ: ○mm」
  // 旧データ（二重ネスト）と新データ（修正後）の両方に対応
  const pitchValue = specs.pitch || (specs.specifications as any)?.pitch || 0;
  const sideWidth = specs.sideWidth;
  let sizeDisplay = '';
  if (specs.bagTypeId === 'roll_film' || specs.bagTypeId === 'spout_pouch') {
    sizeDisplay = `幅: ${specs.width || 0}mm${pitchValue ? `、ピッチ: ${pitchValue}mm` : ''}`;
  } else {
    // 既存のdimensionsがある場合はそれをベースに、なければ個別フィールドから構築
    const existingDimensions = specs.dimensions;
    if (existingDimensions) {
      // 既存のdimensionsに側面が含まれていない場合、追加する
      if (sideWidth && !existingDimensions.includes('側面')) {
        // dimensionsの最後の"mm"の前に側面を追加
        sizeDisplay = existingDimensions.replace(' mm', `${sideWidth ? ` x 側面${sideWidth}` : ''} mm`);
      } else {
        sizeDisplay = existingDimensions;
      }
    } else {
      // dimensionsがない場合は個別フィールドから構築
      sizeDisplay = `${specs.width || 0} x ${specs.height || 0}${specs.depth ? ` x ${specs.depth}` : ''}${sideWidth ? ` x 側面${sideWidth}` : ''} mm`;
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border-secondary">
      <div className="text-xs font-medium text-text-primary mb-2">詳細仕様</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">内容物:</span>
          <span className="text-text-primary">{contentsJa}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">サイズ:</span>
          <span className="text-text-primary">{sizeDisplay}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">袋タイプ:</span>
          <span className="text-text-primary">{bagTypeJa}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">素材:</span>
          <span className="text-text-primary">{materialJa}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">厚さ:</span>
          <span className="text-text-primary">{thicknessJa}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">印刷:</span>
          <span className="text-text-primary">{printingJa}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">納期:</span>
          <span className="text-text-primary">{urgencyJa}</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-text-muted flex-shrink-0">配送先:</span>
          <span className="text-text-primary">{deliveryJa}</span>
        </div>
        {postProcessingList.length > 0 && (
          <div className="col-span-2 flex items-start gap-1">
            <span className="text-text-muted flex-shrink-0">後加工:</span>
            <div className="text-text-primary flex flex-wrap gap-x-2 gap-y-0.5">
              {postProcessingList.map((pp, idx) => (
                <span key={idx} className="inline-block">{pp}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Client Component
// =====================================================

function QuotationsClientContent({ initialData, initialStatus, currentPage, totalPages }: QuotationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Initialize state from Server Component props
  const [quotations, setQuotations] = useState<Quotation[]>(initialData.quotations);
  const [isLoading, setIsLoading] = useState(false); // Already loaded from server
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

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[QuotationsClient] User not authenticated, redirecting to login');
      router.push('/auth/signin?redirect=/member/quotations');
    }
  }, [authLoading, user, router]);

  // Handle status filter change by updating URL (triggers server-side fetch)
  const handleStatusChange = (newStatus: QuotationStatus | 'all') => {
    setSelectedStatus(newStatus);
    // Update URL to trigger server-side data fetch
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    // Reset to page 1 when status changes
    params.delete('page');
    // Use window.location to force page reload and trigger server-side fetch
    window.location.href = `/member/quotations?${params.toString()}`;
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);

    // Update URL to trigger server-side fetch
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

    // Fetch stats for each quotation in parallel
    await Promise.all(
      quotations.map(async (quotation) => {
        try {
          // Use absolute URL to bypass Next.js router
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

  const handleDownloadPDF = async (quotation: Quotation) => {
    setDownloadingQuoteId(quotation.id);

    try {
      console.log('[handleDownloadPDF] Starting PDF download for quotation:', quotation.quotationNumber);

      // ✅ 優先: 保存されたPDFを直接ダウンロード
      if (quotation.pdfUrl) {
        console.log('[handleDownloadPDF] Downloading saved PDF from Storage:', quotation.pdfUrl);

        // 直接ダウンロード用のリンクを作成
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

      // ✅ フォールバック: PDFが保存されていない場合は再生成
      console.log('[handleDownloadPDF] No saved PDF found, regenerating from data...');

      // Validate quotation has items
      if (!quotation.items || quotation.items.length === 0) {
        throw new Error('見積明細がありません');
      }

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

      // Convert to QuoteData format for PDF generator (same as quote-simulator)
      const quoteData = mapQuotationDataToQuoteData(excelData);
      console.log('[handleDownloadPDF] Quote data prepared for PDF generation');

      // Generate PDF using the same method as quote-simulator
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: `${quotation.quotationNumber}.pdf`
      });

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'PDF生成に失敗しました');
      }

      console.log('[handleDownloadPDF] PDF regenerated successfully, size:', pdfResult.pdfBuffer?.length);

      // Create blob and download
      if (pdfResult.pdfBuffer) {
        const pdfBlob = new Blob([pdfResult.pdfBuffer], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfResult.filename || `${quotation.quotationNumber}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

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
          fetchDownloadStats();
        } catch (logError) {
          console.error('[handleDownloadPDF] Failed to log PDF download:', logError);
        }
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

      // Refresh quotations list by reloading page (triggers Server Component fetch)
      router.refresh();
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      alert('見積の削除に失敗しました');
    } finally {
      setDeletingQuoteId(null);
    }
  };

  // Note: Data fetching is now handled by Server Component (page.tsx)
  // Client Component only handles UI interactions

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
            router.refresh();
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
              onClick={() => handleStatusChange(option.value as QuotationStatus | 'all')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedStatus === option.value
                  ? 'bg-blue-600 text-white'
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
                router.refresh();
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

                  {/* DRAFT 상태일 때 안내 메시지 */}
                  {(quotation.status === 'DRAFT' || quotation.status === 'draft') && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 text-lg">⏳</span>
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">現在、管理者による内容確認中です</p>
                          <p className="text-xs mt-1 text-blue-600">承認完了後、注文確定ボタンが表示されます</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APPROVED 상태일 때 안내 메시지 */}
                  {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <div className="text-sm">
                          <p className="font-medium text-green-800">管理者の承認が完了しました</p>
                          <p className="text-xs mt-1 text-green-600">右側の「注文に変換」ボタンをクリックして注文を確定してください</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-text-muted space-y-2 mb-3">
                    {safeMap((quotation.items || []).slice(0, 3), (item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-bg-secondary/50">
                        {/* 상품명, 수량, 가격 */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary font-medium">{item.productName}</span>
                            <span className="text-border-secondary">x{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary font-semibold">
                              {(item.unitPrice * item.quantity).toLocaleString()}円
                            </span>
                            {/* 注文済み인 경우: 注文詳細 링크 표시, 未注文인 경우: 미표시 */}
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
                              <>
                                <Badge variant="secondary" size="sm">未注文</Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 상세 사양 */}
                        <SpecificationDisplay item={item} />
                      </div>
                    ))}
                    {quotation.items && quotation.items.length > 3 && (
                      <p className="text-text-muted">
                        他 {quotation.items.length - 3} 点
                      </p>
                    )}
                  </div>

                  <div className="text-lg font-semibold text-text-primary">
                    合計: {(quotation.totalAmount || quotation.total_amount || 0).toLocaleString()}円
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
                    <a
                      href={`/member/quotations/${quotation.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/member/quotations/${quotation.id}`;
                      }}
                      className="block"
                    >
                      <Button variant="secondary" size="sm" className="w-full group/btn">
                        <Eye className="w-4 h-4 mr-1.5 transition-transform group-hover/btn:scale-110" />
                        詳細を見る
                      </Button>
                    </a>

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


                    {/* Delete Button - DRAFT status only (including new QUOTATION_PENDING) */}
                    {(quotation.status === 'DRAFT' || quotation.status === 'draft' || quotation.status === 'QUOTATION_PENDING') && (
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

                    {/* Convert to Order - APPROVED status only (including new QUOTATION_APPROVED) */}
                    {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setQuotationForSpec(quotation);
                          setShowSpecModal(true);
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              page === 1
                ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                : 'bg-bg-secondary text-text-primary hover:bg-border-secondary cursor-pointer'
            }`}
          >
            前へ
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            // Show first page, last page, current page, and pages around current page
            const showPage =
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 2 && pageNum <= page + 2);

            if (!showPage) return null;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  page === pageNum
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-bg-secondary text-text-primary hover:bg-border-secondary cursor-pointer'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              page === totalPages
                ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                : 'bg-bg-secondary text-text-primary hover:bg-border-secondary cursor-pointer'
            }`}
          >
            次へ
          </button>

          {/* Page Info */}
          <div className="text-sm text-text-muted px-4">
            {page} / {totalPages} ページ
            （全{initialData.pagination.total}件）
          </div>
        </div>
      )}

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
            // 注文作成API呼び出し
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
                // 注文が生成されたら注文詳細ページに遷移
                if (result.data?.id) {
                  window.location.href = `/member/orders/${result.data.id}`;
                } else if (result.alreadyExists && result.data?.id) {
                  // 既に注文が存在する場合
                  window.location.href = `/member/orders/${result.data.id}`;
                } else {
                  alert('注文が生成されましたが、注文詳細ページに遷移できませんでした。');
                  // 注文一覧ページにリダイレクト
                  window.location.href = '/member/orders';
                }
              } else {
                alert(`注文作成エラー: ${result.error || '不明なエラー'}`);
              }
            } catch (error) {
              console.error('Convert quotation error:', error);
              alert('注文作成中にエラーが発生しました。');
            }
          }}
        />
      )}
    </div>
  );
}

// Suspense boundary for useSearchParams
export default function QuotationsClient(props: QuotationsClientProps) {
  return (
    <Suspense fallback={<PageLoadingState isLoading={true} message="見積依頼を読み込み中..." />}>
      <QuotationsClientContent {...props} />
    </Suspense>
  );
}

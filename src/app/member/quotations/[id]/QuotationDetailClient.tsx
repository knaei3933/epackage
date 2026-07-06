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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui';
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
import type { Quotation } from '@/types/dashboard';
import type { Profile } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/utils/formatters';
import { useToastContext } from '@/components/ui/Toast';

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
  DRAFT: 'ドラフト',
  QUOTATION_PENDING: '見積承認待ち',
  QUOTATION_APPROVED: '見積承認済み',
  SENT: '送信済み',
  APPROVED: '承認済み',
  REJECTED: '却下',
  EXPIRED: '期限切れ',
  CONVERTED: '注文変換済み',
};

const quotationStatusVariants: Record<string, 'success' | 'secondary' | 'error' | 'warning' | 'info' | 'default'> = {
  DRAFT: 'secondary',
  QUOTATION_PENDING: 'warning',
  QUOTATION_APPROVED: 'success',
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
 * 袋タイプIDを日本語名に変換
 */

function getBagTypeName(bagTypeId: string): string {
  // 標準定義を優先使用し、不足分のみフォールバック
  const fallbackNames: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'three_side_seal': '三方シール平袋',
    'lap_seal': '合掌袋',
    'stand_pouch': 'スタンドパウチ',
    'gusset_pouch': 'ガセットパウチ',
    'zipper_pouch': 'ジッパーパウチ',
    'roll-film': 'ロールフィルム',
  };
  return BAG_TYPE_JA[bagTypeId as keyof typeof BAG_TYPE_JA] || fallbackNames[bagTypeId] || bagTypeId || '-';
}

/**
 * 素材IDを日本語名に変換
 */
function getMaterialName(materialId: string): string {
  // 標準定義を優先使用し、不足分のみフォールバック
  const fallbackNames: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'pet_ldpe': 'PET/LLDPE',
    'ny_lldpe': 'NY/LLDPE',
    'pet_vmpet': 'PET/VMPET',
    'kraft_vmpet_lldpe': 'クラフト/VMPET/LLDPE',
    'kraft_pet_lldpe': 'クラフト/PET/LLDPE',
    'kp': 'kraft (クラフト紙)',
    'kraft': 'クラフト紙',
    'ny_pe': 'NY/PE',
    'pet_ny': 'PET/NY',
  };
  // 標準定義のMATERIAL_TYPE_JAを優先
  return translateMaterialType(materialId) || fallbackNames[materialId] || materialId || '-';
}

/**
 * 厚さを材料構造で表示 (materialId + thicknessSelection から specification を取得)
 */
function getThicknessName(materialId: string, thicknessSelection: string, fallbackThickness?: string): string {
  // materialId と thicknessSelection の組み合わせから specification を取得
  if (materialId && thicknessSelection) {
    const spec = getMaterialSpecification(materialId, thicknessSelection);
    if (spec !== '-') return spec;
  }

  // 非標準の thicknessSelection 値（light_50, standard_70など）のフォールバック
  let normalizedThickness = thicknessSelection;
  if (thicknessSelection) {
    // light_50 -> light, standard_70 -> standard, heavy_90 -> heavy などの変換
    if (thicknessSelection.includes('_')) {
      const parts = thicknessSelection.split('_');
      normalizedThickness = parts[0]; // 'light_50' -> 'light'
    }
  }

  // 正規化された値で再試行
  if (materialId && normalizedThickness && normalizedThickness !== thicknessSelection) {
    const spec = getMaterialSpecification(materialId, normalizedThickness);
    if (spec !== '-') return spec;
  }

  // 素材別のデフォルト仕様
  // kraft 系は仕様値（50g/80g）が未確定のため Phase 2 後退（現状維持）。
  // kraft 以外は getFilmStructureLabel（materialData.ts の specificationEn）で統合。
  if (materialId) {
    const isKraft = materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe';
    if (isKraft) {
      const defaultThicknessSpec: Record<string, string> = {
        'kraft_vmpet_lldpe': 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
        'kraft_pet_lldpe': 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
      };
      const defaultSpec = defaultThicknessSpec[materialId];
      if (defaultSpec) return defaultSpec;
    } else {
      const label = getFilmStructureLabel(materialId, thicknessSelection);
      if (label && label !== materialId) return label;
    }
  }

  // フォールバック: 日本語変換
  const names: Record<string, string> = {
    'thin': '薄手',
    'standard': '標準',
    'medium': '中厚',
    'thick': '厚手',
    'extra_thick': '超厚手',
    'extra-thick': '超厚手',
    'light': '軽量',
    'light_50': '軽量 (~50g)',
    'standard_70': '標準 (~70g)',
    'heavy_90': '高耐久 (~90g)',
    'ultra_100': '超耐久 (~100g)',
    'heavy': '高耐久',
    'ultra': '超耐久',
  };
  return names[fallbackThickness || ''] || names[thicknessSelection] || names[normalizedThickness] || fallbackThickness || thicknessSelection || '-';
}

/**
 * 内容量物情報を日本語で変換
 */
function getContentsDisplay(specs: Record<string, unknown> | undefined): string {
  if (!specs) return '-';

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

  const contents = [
    specs?.productCategory ? productCategoryMap[specs.productCategory as string] : null,
    specs?.contentsType ? contentsTypeMap[specs.contentsType as string] : null,
    specs?.mainIngredient ? mainIngredientMap[specs.mainIngredient as string] : null,
    specs?.distributionEnvironment ? distributionEnvironmentMap[specs.distributionEnvironment as string] : null,
  ].filter(Boolean).join('、');

  return contents || '-';
}

/**
 * Map database specifications to PDF template format
 */
function mapSpecificationsToPDF(specs: Record<string, unknown> | undefined): Record<string, string | boolean | number> {
  if (!specs) return {};

  const bagTypeId = specs?.bagTypeId as string | undefined;
  const materialId = specs?.materialId as string | undefined;
  const postProcessingOptions = specs?.postProcessingOptions as string[] | undefined;
  const productCategory = specs?.productCategory as string | undefined;
  const contentsType = specs?.contentsType as string | undefined;
  const mainIngredient = specs?.mainIngredient as string | undefined;
  const distributionEnvironment = specs?.distributionEnvironment as string | undefined;
  const printingType = specs?.printingType as string | undefined;

  // サイズ表示 - ロールフィルムの場合は常に「幅: ○mm、ピッチ: ○mm」
  // 旧データ（二重ネスト）と新データ（修正後）の両方に対応
  const pitchValue = specs?.pitch || (specs?.specifications as any)?.pitch || 0;
  const sideWidth = specs?.sideWidth as number | undefined;
  let sizeDisplay = '';
  if (bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch') {
    sizeDisplay = `幅: ${specs?.width || 0}mm${pitchValue ? `、ピッチ: ${pitchValue}mm` : ''}`;
  } else {
    // 既存のdimensionsがある場合はそれをベースに、なければ個別フィールドから構築
    const existingDimensions = specs?.dimensions as string;
    if (existingDimensions) {
      // 既存のdimensionsに側面が含まれていない場合、追加する
      if (sideWidth && !existingDimensions.includes('側面')) {
        // dimensionsの最後の"mm"の前に側面を追加
        sizeDisplay = existingDimensions.replace(' mm', `${sideWidth ? `×側面${sideWidth}` : ''} mm`);
      } else {
        sizeDisplay = existingDimensions;
      }
    } else {
      // dimensionsがない場合は個別フィールドから構築
      sizeDisplay = `${specs?.width || 0}×${specs?.height || 0}${((specs?.depth as number || 0) > 0 && bagTypeId !== 'lap_seal') ? `×${specs?.depth}` : ''}${sideWidth ? `×側面${sideWidth}` : ''}`;
    }
  }

  // ノッチ形状: postProcessingOptionsからマッピング
  let notchShape = 'V';
  if (postProcessingOptions?.includes('notch-straight')) {
    notchShape = '直線';
  } else if (postProcessingOptions?.includes('notch-no')) {
    notchShape = 'なし';
  }

  // 吊り下げ加工: postProcessingOptionsからマッピング
  let hanging = 'なし';
  let hangingPosition = '指定位置';
  if (postProcessingOptions?.includes('hang-hole-6mm')) {
    hanging = 'あり';
    hangingPosition = '6mm';
  } else if (postProcessingOptions?.includes('hang-hole-8mm')) {
    hanging = 'あり';
    hangingPosition = '8mm';
  }

  // シール幅: sealWidthフィールドまたはpostProcessingOptionsから抽出
  let sealWidth = '5mm'; // デフォルト値
  const sealWidthField = specs?.sealWidth as string | undefined;
  if (sealWidthField) {
    sealWidth = sealWidthField.replace('シール幅 ', '').replace('mm', '');
  } else {
    // postProcessingOptionsからシール幅を見つ
    const sealWidthOption = postProcessingOptions?.find((opt: string) => opt.startsWith('sealing-width-'));
    if (sealWidthOption) {
      const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
      if (widthMatch) {
        sealWidth = widthMatch[1].replace('-', '.');
      }
    }
  }

  // シール方向 (デフォルト: 上端)
  const sealDirection = '上';

  // 厚さタイプ - thicknessSelectionを使用、なければデフォルト値
  const thicknessSelection = specs?.thicknessSelection as string | undefined;
  let thicknessType = '-';
  if (materialId && thicknessSelection) {
    thicknessType = getMaterialSpecification(materialId, thicknessSelection);
  }
  if (thicknessType === '-' && materialId) {
    // 素材別のデフォルト仕様
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

  const result = {
    bagType: bagTypeId ? translateBagType(bagTypeId) : 'スタンドパウチ',
    contents: formatContentsDisplay(productCategory as any, contentsType as any, mainIngredient as any, distributionEnvironment as any) || '指定なし',
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
    printingType: getPrintingLabelJa(printingType, undefined),
  };
  return result;
}

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Fetch quotation details
  const fetchQuotation = async () => {
    if (!userId) return;

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

  // Fetch download history
  const fetchDownloadHistory = async () => {
    try {
      const response = await fetch(`/api/member/documents/history?quotation_id=${quotationId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const { data } = await response.json();
        setDownloadHistory(data.history || []);
        setDownloadCount(data.statistics.downloadCount || 0);
        setLastDownloadedAt(data.statistics.lastDownloadedAt);
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
        const response = await fetch(quotation.pdf_url);
        if (!response.ok) {
          throw new Error('Failed to fetch saved PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // 新しいタブでPDFを開く
        window.open(url, '_blank');

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

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
      const response = await fetch(`/api/member/quotations/${id}`, {
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
  // 注文変換可能か: convert API と同じ !isTerminal ロジックに統一。
  // キャンセル済み・既に注文変換済み以外はすべて注文可能（承認ゲートは API 側で除去済み）。
  const rawStatus = (quotation?.status as string) || '';
  const statusUpper = rawStatus.toUpperCase();
  const isTerminal = statusUpper === 'CANCELLED';
  const isConverted = statusUpper === 'CONVERTED';
  const canConvert = !isTerminal && !isConverted;

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
      {quotation.items?.[0]?.specifications && typeof quotation.items[0].specifications === 'object' && Object.keys(quotation.items[0].specifications).length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">製品仕様（共通）</h2>
          <div className="bg-bg-secondary p-4 rounded-lg space-y-3">
            {/* Contents */}
            {quotation.items[0].specifications && (
              <div className="text-sm">
                <span className="text-text-muted">内容物:</span>
                <span className="ml-2 text-text-primary">
                  {getContentsDisplay(quotation.items[0].specifications)}
                </span>
              </div>
            )}

            {/* Size */}
            {quotation.items[0].specifications && (
              <div className="text-sm">
                <span className="text-text-muted">サイズ:</span>
                <span className="ml-2 text-text-primary">
                  {(() => {
                    const specs = quotation.items[0].specifications;
                    if (specs?.bagTypeId === 'roll_film' || specs?.bagTypeId === 'standup_pouch') {
                      return (
                        <>
                          幅: {specs?.width}mm
                          {specs?.pitch && `、ピッチ: ${specs.pitch}mm`}
                        </>
                      );
                    }
                    const existingDimensions = specs?.dimensions;
                    const sideWidth = specs?.sideWidth;
                    if (existingDimensions) {
                      if (sideWidth && !existingDimensions.includes('側面')) {
                        return existingDimensions.replace(' mm', `×側面${sideWidth} mm`);
                      } else {
                        return existingDimensions;
                      }
                    } else {
                      return (
                        <>
                          {specs?.width}mm × {specs?.height}mm
                          {(specs?.depth && specs?.bagTypeId !== 'lap_seal') && ` × ${specs?.depth}mm`}
                          {specs?.sideWidth && ` × 側面${specs?.sideWidth}mm`}
                        </>
                      );
                    }
                  })()}
                </span>
              </div>
            )}

            {/* Bag Type */}
            {quotation.items[0].specifications?.bagTypeId && (
              <div className="text-sm">
                <span className="text-text-muted">袋タイプ:</span>
                <span className="ml-2 text-text-primary">
                  {getBagTypeName(quotation.items[0].specifications?.bagTypeId)}
                </span>
              </div>
            )}

            {/* Material */}
            {quotation.items[0].specifications?.materialId && (
              <div className="text-sm">
                <span className="text-text-muted">素材:</span>
                <span className="ml-2 text-text-primary">
                  {getMaterialName(quotation.items[0].specifications?.materialId)}
                </span>
              </div>
            )}

            {/* Thickness */}
            {quotation.items[0].specifications?.thicknessSelection && (
              <div className="text-sm">
                <span className="text-text-muted">厚さ:</span>
                <span className="ml-2 text-text-primary">
                  {getThicknessName(
                    quotation.items[0].specifications?.materialId,
                    quotation.items[0].specifications?.thicknessSelection
                  )}
                </span>
              </div>
            )}

            {/* Printing */}
            {(quotation.items[0].specifications?.printingType || quotation.items[0].specifications?.printingColors) && (
              <div className="text-sm">
                <span className="text-text-muted">印刷:</span>
                <span className="ml-2 text-text-primary">
                  {(() => {
                    const pt = quotation.items[0].specifications?.printingType;
                    return getPrintingLabelJa(pt, quotation.items[0].specifications?.cost_breakdown);
                  })()}
                </span>
              </div>
            )}

            {/* Spout Specifications (スパウトパウチの場合のみ) */}
            {quotation.items[0].specifications?.bagTypeId === 'spout_pouch' && (() => {
              const specs = quotation.items[0].specifications;
              const hasSpoutSpecs = specs?.spoutSize || specs?.spoutPosition || specs?.hasGusset !== undefined;
              if (!hasSpoutSpecs) return null;

              return (
                <>
                  {/* スパウト仕様 */}
                  <div className="text-sm">
                    <span className="text-text-muted">スパウト仕様:</span>
                    <span className="ml-2 text-text-primary">
                      {specs?.spoutSize && `サイズ: ${specs.spoutSize}`}
                      {specs?.spoutPosition && `、位置: ${specs.spoutPosition === 'top-center' ? '上部中央' : specs.spoutPosition === 'top-left' ? '上部左側' : specs.spoutPosition === 'top-right' ? '上部右側' : specs.spoutPosition}`}
                      {specs?.hasGusset !== undefined && `、マチ: ${specs.hasGusset ? 'あり' : 'なし'}`}
                    </span>
                  </div>

                  {/* マチサイズ */}
                  {specs?.sideWidth && (
                    <div className="text-sm">
                      <span className="text-text-muted">マチサイズ:</span>
                      <span className="ml-2 text-text-primary">
                        {specs.sideWidth}mm
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Post Processing Options */}
            {quotation.items[0].specifications && (() => {
              const specs = quotation.items[0].specifications;
              const bagTypeId = specs?.bagTypeId as string;
              const isLimitedPostProcessing = bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch';

              // 시일 폭 표시 - sealWidth 필드 우선, 없으면 postProcessingOptions에서 추출
              let sealWidthDisplay = null;
              if (specs.sealWidth) {
                sealWidthDisplay = `シール幅 ${specs.sealWidth}`;
              } else {
                const sealWidthOption = (specs.postProcessingOptions || []).find((opt: string) => opt.startsWith('sealing-width-'));
                if (sealWidthOption) {
                  const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
                  if (widthMatch) {
                    sealWidthDisplay = `シール幅 ${widthMatch[1].replace('-', '.')}`;
                  }
                }
              }

              // Issue 3 fix: filter post-processing to only show ACTIVE selections.
              // "none"-type options (zipper-no, valve-no, machi-printing-no, etc.) are excluded
              // unless ALL options are "none", in which case show "なし".
              const allOptions = (specs.postProcessingOptions || []) as string[];

              // Options that represent "none / not selected" — filtered out of active display
              const noneOptionPatterns = [
                'zipper-no', 'valve-no', 'machi-printing-no', 'notch-no', 'hang-hole-no',
                'corner-square',
              ];
              const isNoneOption = (opt: string) =>
                noneOptionPatterns.includes(opt) || /-no$/.test(opt);

              // Remove sealing-width-* (handled separately) and filter out "none" options
              const otherOptions = allOptions.filter((opt: string) =>
                !opt.startsWith('sealing-width-') && !isNoneOption(opt)
              );

              // Limited post-processing (roll_film, standup_pouch): only show surface finish (glossy/matte)
              const allowedOptions = isLimitedPostProcessing
                ? otherOptions.filter((opt: string) => opt === 'glossy' || opt === 'matte')
                : otherOptions;

              const displayOptions = (!isLimitedPostProcessing && sealWidthDisplay)
                ? [{ label: sealWidthDisplay, isSealWidth: true }, ...allowedOptions.map((opt: string) => ({ label: opt, isSealWidth: false }))]
                : allowedOptions.map((opt: string) => ({ label: opt, isSealWidth: false }));

              // If nothing active and no seal width, show "なし"
              if (displayOptions.length === 0) {
                return (
                  <div className="text-sm">
                    <span className="text-text-muted">後加工:</span>
                    <span className="ml-2 text-text-primary">なし</span>
                  </div>
                );
              }

              return (
                <div className="text-sm">
                  <span className="text-text-muted">後加工:</span>
                  <div className="ml-2 mt-1 flex flex-wrap gap-2">
                    {displayOptions.map((item: { label: string; isSealWidth?: boolean }) => {
                      // 시일 폭이면 그대로 표시
                      if (item.isSealWidth) {
                        return (
                          <span
                            key="seal-width"
                            className="px-2 py-1 bg-bg-primary rounded text-xs border border-border-secondary"
                          >
                            {item.label}
                          </span>
                        );
                      }

                      // 標準定義を使用（POST_PROCESSING_JA）
                      const opt = item.label;
                      const standardTranslation = translatePostProcessing(opt);
                      // 標準定義にない項目のみフォールバック
                      const fallbackMap: Record<string, string> = {
                        'notch-straight': '直線ノッチ',
                        'top-open': '上部解放',
                        'bottom-open': '下端解放',
                        'top-sealed': '上部密封',
                        'sealing-width-5mm': 'シール幅 5mm',
                        'sealing-width-7.5mm': 'シール幅 7.5mm',
                        'sealing-width-10mm': 'シール幅 10mm',
                        'machi-printing-yes': 'マチ印刷あり',
                        'machi-printing-no': 'マチ印刷なし',
                      };
                      const label = standardTranslation !== opt ? standardTranslation : fallbackMap[opt] || opt;
                      return (
                        <span
                          key={opt}
                          className="px-2 py-1 bg-bg-primary rounded text-xs border border-border-secondary"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Delivery Location */}
            {quotation.items[0].specifications?.deliveryLocation && (
              <div className="text-sm">
                <span className="text-text-muted">配送先:</span>
                <span className="ml-2 text-text-primary">
                  {quotation.items[0].specifications?.deliveryLocation === 'domestic' && '国内'}
                  {quotation.items[0].specifications?.deliveryLocation === 'international' && '海外'}
                </span>
              </div>
            )}

            {/* Urgency */}
            {quotation.items[0].specifications?.urgency && (
              <div className="text-sm">
                <span className="text-text-muted">納期:</span>
                <span className="ml-2 text-text-primary">
                  {quotation.items[0].specifications?.urgency === 'urgent' && '急ぎ'}
                  {quotation.items[0].specifications?.urgency === 'standard' && '標準'}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Line Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">品目明細</h2>
          {/* Phase 2 fix: selection hint when multiple patterns exist */}
          {canConvert && quotation.items && quotation.items.length > 1 && (
            <span className={`text-sm font-medium ${selectedItemId ? 'text-green-700' : 'text-amber-700'}`}>
              {selectedItemId ? '✓ 注文する数量を選択済み' : '※ 注文する数量を1つ選択してください'}
            </span>
          )}
        </div>
        <div className="space-y-4">
          {quotation.items?.map((item, index) => {
            // Phase 2 fix: selectable pattern row. When the quotation is orderable (APPROVED),
            // the user must pick exactly one quantity pattern. Visual feedback is unmistakable:
            // selected = blue border + filled blue radio + check badge; unselected = neutral + outline radio.
            const isSelectable = canConvert;
            const isSelected = selectedItemId === item.id;
            const rowBase = 'rounded-xl p-5 flex items-center justify-between transition-all duration-150 relative';
            const rowState = isSelected
              ? 'border-2 border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
              : isSelectable
                ? 'border-2 border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer'
                : 'border border-border-secondary';
            return (
              <div
                key={item.id}
                role={isSelectable ? 'button' : undefined}
                tabIndex={isSelectable ? 0 : undefined}
                aria-pressed={isSelectable ? isSelected : undefined}
                onClick={isSelectable ? () => setSelectedItemId(item.id) : undefined}
                onKeyDown={isSelectable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItemId(item.id); } } : undefined}
                className={`${rowBase} ${rowState}`}
              >
                {/* Selection indicator (radio-style) - left side for clear visibility */}
                {isSelectable && (
                  <div className="flex items-center gap-3 pr-4">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}`}>
                      {isSelected && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                )}
                {/* Selected badge - top right */}
                {isSelectable && isSelected && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                      選択中
                    </span>
                  </div>
                )}
                {/* SKU Name and Quantity */}
                <div className="flex-1 pr-8">
                  <h3 className="text-base font-semibold text-text-primary">
                    {item.productName || `SKU ${index + 1}`}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    数量: {item.quantity.toLocaleString()}個 × {formatPrice(item.unitPrice || 0)}円
                  </p>
                  {item.specifications?.sku_quantities && item.specifications.sku_quantities.length > 1 && (() => {
                    // SKU別明細の計算（枚数 × 単価 = 金額）
                    const skuQuantities = item.specifications.sku_quantities;
                    const unitPrice = item.unitPrice || 0;
                    const totalQty = skuQuantities.reduce((sum: number, q: number) => sum + q, 0);
                    const totalPrice = skuQuantities.reduce(
                      (sum: number, q: number) => sum + q * unitPrice,
                      0
                    );

                    return (
                      <div className="bg-purple-50 p-3 rounded-lg mt-4">
                        <p className="font-medium text-purple-700">SKU分割: {skuQuantities.length}種類</p>
                        <div className="mt-2 space-y-1">
                          {skuQuantities.map((qty: number, idx: number) => {
                            // 各SKUの金額 = 数量 × 単価
                            const skuAmount = qty * unitPrice;
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm text-purple-600"
                              >
                                <span>SKU {idx + 1}</span>
                                <span>
                                  {qty.toLocaleString()}個 × ¥{formatPrice(unitPrice)} = ¥{formatPrice(skuAmount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-purple-700 mt-2 pt-2 border-t border-purple-200">
                          <span>合計</span>
                          <span>
                            {totalQty.toLocaleString()}個 / ¥{formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Item Total */}
                <div className="text-right pr-8">
                  <p className="text-lg font-semibold text-text-primary">
                    ¥{formatPrice(item.totalPrice || item.unitPrice * item.quantity || 0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-border-secondary space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">小計</span>
            <span className="text-text-primary">¥{formatPrice(subtotal || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">消費税 (10%)</span>
            <span className="text-text-primary">¥{formatPrice(taxAmount || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-text-primary">合計 (税込)</span>
            <span className="text-primary text-xl">
              ¥{formatPrice(displayTotalAmount)}
            </span>
          </div>
        </div>
      </Card>

      {/* Bank Information - Hidden for quotation detail page */}

      {/* Download History */}
      {downloadCount > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              PDFダウンロード履歴
            </h3>
            <Badge variant="secondary" size="sm">
              計{downloadCount}回
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">最終ダウンロード</span>
              <span className="text-text-primary">
                {lastDownloadedAt
                  ? new Date(lastDownloadedAt).toLocaleString('ja-JP')
                  : '-'}
              </span>
            </div>
            {downloadHistory.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text-primary">
                  全履歴を表示 ({downloadHistory.length}件)
                </summary>
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {downloadHistory.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="flex items-center justify-between text-sm p-2 rounded bg-bg-secondary"
                    >
                      <span className="text-text-muted">
                        {new Date(log.accessed_at).toLocaleString('ja-JP')}
                      </span>
                      <span className="text-xs text-text-muted">
                        {log.ip_address || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </Card>
      )}

      {/* Status Message - Separate Card based on quotation status */}
      {(statusUpper === 'DRAFT' || statusUpper === 'QUOTATION_PENDING') ? (
        // ⏳ ドラフト/見積承認待ち: 注文可能だが、管理者審査中の案内
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-800">
                この見積はご注文可能です
              </p>
              <p className="text-xs text-blue-600 mt-1">
                内容をご確認のうえ「注文確定」ボタンからご発注ください
              </p>
            </div>
          </div>
        </Card>
      ) : statusUpper === 'CONVERTED' ? (
        // ✓ 変換済み: 注文済みメッセージ
        <Card className="bg-green-50 border-green-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-green-800">
                この見積は既に注文に変換されています
              </p>
              <p className="text-xs text-green-600 mt-1">
                注文一覧ページからご確認いただけます
              </p>
            </div>
          </div>
        </Card>
      ) : statusUpper === 'CANCELLED' ? (
        // ✗ キャンセル: キャンセルメッセージ
        <Card className="bg-gray-50 border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">
                この見積はキャンセルされています
              </p>
            </div>
          </div>
        </Card>
      ) : statusUpper === 'REJECTED' ? (
        // ✗ 却下: 却下メッセージ
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-800">
                この見積は却下されました
              </p>
              <p className="text-xs text-red-600 mt-1">
                お問い合わせフォームよりご連絡ください
              </p>
            </div>
          </div>
        </Card>
      ) : (
        // その他の注文可能状態（APPROVED / SENT / QUOTATION_APPROVED 等）: ご注文可能
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-800">
                この見積はご注文可能です
              </p>
              <p className="text-xs text-blue-600 mt-1">
                内容をご確認のうえ「注文確定」ボタンからご発注ください
              </p>
            </div>
          </div>
        </Card>
      )}

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
                {/* Phase 2 fix: require a pattern selection before allowing order conversion */}
                {quotation.items && quotation.items.length > 1 && !selectedItemId && (
                  <div className="text-sm text-amber-700 font-medium mr-2 self-center">
                    数量パターンを選択してください
                  </div>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setShowOrderConfirm(true);
                    setAgreedToTerms(false);
                  }}
                  disabled={isConverting || (!!quotation.items && quotation.items.length > 1 && !selectedItemId)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isConverting ? '変換中...' : '注文確定'}
                </Button>
                <InvoiceDownloadButton quotationId={quotation.id} variant="outline" />
              </>
            ) : isConverted ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push('/member/orders')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                注文を確認
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
      <Dialog open={showOrderConfirm} onOpenChange={setShowOrderConfirm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ご注文内容の確認</DialogTitle>
            <DialogDescription>
              発注前に以下の内容をご確認ください。ご同意いただいた上で注文を確定してください。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Specs Checklist */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">ご注文内容</h4>
              {(() => {
                const selectedItem = quotation.items?.find(i => i.id === selectedItemId) || quotation.items?.[0];
                if (!selectedItem) return null;
                const specs = selectedItem.specifications || {};
                const pType = specs.printingType;
                const printingLabel = getPrintingLabelJa(pType, specs.cost_breakdown).replace('（フルカラー）', '');
                const ppOpts = (specs.postProcessingOptions || []) as string[];
                const nonePatterns = ['zipper-no','valve-no','machi-printing-no','notch-no','hang-hole-no','corner-square'];
                const isNone = (o: string) => nonePatterns.includes(o) || /-no$/.test(o);
                const activePP = ppOpts.filter(o => !o.startsWith('sealing-width-') && !isNone(o));
                const ppLabel = activePP.length === 0 ? 'なし' : activePP.map(o => translatePostProcessing(o)).join('、');
                return (
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
                );
              })()}
            </div>

            {/* Terms */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 text-xs text-gray-700 max-h-60 overflow-y-auto">
              <div>
                <p className="font-semibold text-gray-900 mb-1">キャンセル</p>
                <p>商品発注後の仕様変更、キャンセル等は受け付けておりません。契約成立日以降、仕様の変更が生じた場合には当社及びお客様はその都度協議し、書面をもって仕様の変更をすることが可能となります。</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">返品・交換</p>
                <p>以下の場合、当社は代替品の納品または無償での再製造を行います。<br />・商品が受入検査に合格しなかった場合<br />・受入検査から3ヶ月以内に隠れた瑕疵が判明した場合（ただし以下の場合を除く）</p>
                <p className="mt-1">【受入検査不合格の場合及び瑕疵が判明した場合でも返品・交換対象外となる場合】<br />①お客様の指示内容に起因する場合<br />②指定されたデザイン・材料・製造方法等に起因する場合<br />③上記①②の場合に、当社がその適当でないことを通知したにもかかわらず、指示変更が行われなかった場合<br />④その他、お客様に起因する理由による場合や当社の責めに帰すべき事由がない場合</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">返金</p>
                <p>当社からお客様に返金する場合、当社が適当と認める方法（原則として銀行振込）により返金いたします。返金額には、遅滞利息、法定利息、その他の利息を付さないものとします。配送商品の返金の際には、返金額から送料を差し引かせていただくことがございます。</p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-300 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-800">
                上記の仕様内容・特約条件（キャンセル・返品・交換・返金）をすべて確認・同意の上、注文を確定します。
              </span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => { setShowOrderConfirm(false); setAgreedToTerms(false); }}
              disabled={isConverting}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!agreedToTerms || isConverting}
              onClick={async () => {
                setIsConverting(true);
                setConvertError(null);
                try {
                  const itemsToSend = quotation.items && quotation.items.length > 1
                    ? (selectedItemId ? { selectedItemIds: [selectedItemId] } : {})
                    : {};
                  const response = await fetch(`/api/member/quotations/${quotationId}/convert`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ notes: quotation?.notes, ...itemsToSend }),
                  });
                  const result = await response.json();
                  if (response.ok && result.success) {
                    router.push(`/member/orders/${result.data.id}`);
                  } else if (result.alreadyExists) {
                    router.push(`/member/orders/${result.data.id}`);
                  } else {
                    setConvertError(result.error || '注文作成に失敗しました');
                  }
                } catch (error) {
                  console.error('注文作成エラー:', error);
                  setConvertError('注文作成中にエラーが発生しました');
                } finally {
                  setIsConverting(false);
                }
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isConverting ? '変換中...' : '同意して注文を確定する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

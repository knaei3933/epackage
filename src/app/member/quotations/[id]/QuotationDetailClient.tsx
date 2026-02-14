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

// @ts-nocheck - Temporarily disable type checking due to complexity
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
} from 'lucide-react';
import { generateQuotePDF, type QuoteData } from '@/lib/pdf-generator';
import { translateBagType, translateMaterialType } from '@/constants/enToJa';
import { BankInfoCard } from '@/components/quote/shared/BankInfoCard';
import { InvoiceDownloadButton } from '@/components/quote/shared/InvoiceDownloadButton';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import type { Quotation } from '@/types/dashboard';
import type { Profile } from '@/lib/supabase';

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
 * 袋タイプIDを日本語名に変換
 */
function getBagTypeName(bagTypeId: string): string {
  const names: Record<string, string> = {
    'flat_pouch': 'ピローパウチ',
    'flat_3_side': '三方シール平袋',
    'three_side_seal': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'stand_pouch': 'スタンドパウチ',
    'gusset': 'ガセットパウチ',
    'gusset_pouch': 'ガセットパウチ',
    'roll_film': 'ロールフィルム',
    'roll-film': 'ロールフィルム',
    'zipper_pouch': 'ジッパーパウチ',
  };
  return names[bagTypeId] || translateBagType(bagTypeId) || bagTypeId || '-';
}

/**
 * 素材IDを日本語名に変換
 */
function getMaterialName(materialId: string): string {
  const names: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'kp': 'kraft (クラフト紙)',
    'kraft': 'クラフト紙',
    'paper': '紙',
    'ny_pe': 'NY/PE',
    'pet_ny': 'PET/NY',
  };
  return names[materialId] || translateMaterialType(materialId) || materialId || '-';
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

  // フォールバック: 日本語変換
  const names: Record<string, string> = {
    'thin': '薄手',
    'standard': '標準',
    'medium': '中厚',
    'thick': '厚手',
    'extra_thick': '超厚手',
    'extra-thick': '超厚手',
    'light': '軽量',
    'heavy': '高耐久',
    'ultra': '超耐久',
  };
  return names[fallbackThickness || ''] || names[thicknessSelection] || fallbackThickness || thicknessSelection || '-';
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
  console.log('[mapSpecificationsToPDF] Input specs:', JSON.stringify(specs, null, 2));
  if (!specs) return {};

  const bagTypeId = specs?.bagTypeId as string | undefined;
  const materialId = specs?.materialId as string | undefined;
  const postProcessingOptions = specs?.postProcessingOptions as string[] | undefined;
  console.log('[mapSpecificationsToPDF] postProcessingOptions:', postProcessingOptions);

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
      sizeDisplay = `${specs?.width || 0}×${specs?.height || 0}${(specs?.depth as number || 0) > 0 ? `×${specs?.depth}` : ''}${sideWidth ? `×側面${sideWidth}` : ''}`;
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

  const result = {
    bagType: bagTypeId ? translateBagType(bagTypeId) : 'スタンドパウチ',
    contents: '粉体',
    size: sizeDisplay,
    material: materialId ? translateMaterialType(materialId) : 'PET+AL',
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
  console.log('[mapSpecificationsToPDF] Result:', JSON.stringify(result, null, 2));
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [downloadCount, setDownloadCount] = useState(0);
  const [lastDownloadedAt, setLastDownloadedAt] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

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

  const handleDownloadPDF = async () => {
    console.log('[handleDownloadPDF] ========== START ==========');
    if (!quotation) return;

    setDownloadingPDF(true);

    try {
      console.log('[handleDownloadPDF] quotation.items:', quotation.items);
      console.log('[handleDownloadPDF] quotation.items[0]?.specifications:', JSON.stringify(quotation.items[0]?.specifications, null, 2));
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
          const specs = item?.specifications as Record<string, unknown> | undefined;
          const materialId = specs?.materialId as string | undefined;
          const dimensions = specs?.dimensions as string | undefined;
          const bagTypeId = specs?.bagTypeId as string | undefined;

          // サイズ表示 - ロールフィルムの場合は常に「幅: ○mm、ピッチ: ○mm」
          // 旧データ（二重ネスト）と新データ（修正後）の両方に対応
          let sizeText: string;
          if (bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch') {
            const pitchVal = specs?.pitch || (specs?.specifications as any)?.pitch || 0;
            sizeText = `幅: ${specs?.width || 0}mm${pitchVal ? `、ピッチ: ${pitchVal}mm` : ''}`;
          } else {
            const itemSideWidth = specs?.sideWidth as number | undefined;
            if (dimensions) {
              // 既存のdimensionsに側面が含まれていない場合、追加する
              if (itemSideWidth && !dimensions.includes('側面')) {
                sizeText = dimensions.replace(' mm', `${itemSideWidth ? `×側面${itemSideWidth}` : ''} mm`);
              } else {
                sizeText = dimensions;
              }
            } else {
              // dimensionsがない場合は個別フィールドから構築
              sizeText = `${specs?.width || 0}×${specs?.height || 0}${(specs?.depth as number || 0) > 0 ? `×${specs?.depth}` : ''}${itemSideWidth ? `×側面${itemSideWidth}` : ''}`;
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
        customerName: userProfile?.kanji_last_name && userProfile?.kanji_first_name
          ? `${userProfile.kanji_last_name} ${userProfile.kanji_first_name}`
          : (userProfile?.company_name || userEmail?.split('@')[0] || 'お客様'),
        customerNameKana: userProfile?.kana_last_name && userProfile?.kana_first_name
          ? `${userProfile.kana_last_name} ${userProfile.kana_first_name}`
          : '',
        companyName: userProfile?.company_name || '',
        postalCode: userProfile?.postal_code || '',
        address: (userProfile?.prefecture || userProfile?.city || userProfile?.street)
          ? `${userProfile?.prefecture || ''}${userProfile?.city || ''}${userProfile?.street || ''}`
          : '',
        contactPerson: userProfile?.kanji_last_name && userProfile?.kanji_first_name
          ? `${userProfile.kanji_last_name} ${userProfile.kanji_first_name}`
          : '',
        phone: userProfile?.corporate_phone || userProfile?.personal_phone || '',
        email: userEmail || '',
        items: quoteItems,
        specifications: (() => {
          console.log('[handleDownloadPDF] Calling mapSpecificationsToPDF with:', quotation.items[0]?.specifications);
          const specs = mapSpecificationsToPDF(quotation.items[0]?.specifications);
          console.log('[handleDownloadPDF] mapSpecificationsToPDF returned:', specs);
          return specs;
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

      // 新しいタブでPDFを開く
      window.open(url, '_blank');

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      // PDFをSupabase Storageに保存してpdf_urlを更新（管理者ページで同じPDFを使用するため）
      try {
        // Uint8Arrayをbase64に変換
        const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const base64Data = btoa(binaryString);
        const dataUrl = `data:application/pdf;base64,${base64Data}`;

        await fetch(`/api/member/quotations/${quotationId}/save-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pdfData: dataUrl }),
        });

        console.log('[handleDownloadPDF] PDF saved to Supabase Storage, pdf_url updated');
      } catch (saveError) {
        console.error('[handleDownloadPDF] Failed to save PDF to storage:', saveError);
        // 保存失敗はダウンロード失敗として扱わない
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
        // Refresh download history after logging
        fetchDownloadHistory();
      } catch (logError) {
        console.error('Failed to log PDF download:', logError);
        // Don't alert user about logging failure
      }
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
  const subtotal = quotation?.subtotal || quotation?.subtotalAmount || quotation?.totalAmount * 0.909;
  const taxAmount = quotation?.taxAmount || quotation?.totalAmount - subtotal;
  // 注文変換可能か: APPROVED状態で注文未作成の場合のみ（大文字小文字を区別せずチェック）
  const canConvert = quotation?.status?.toLowerCase() === 'approved';

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

      {/* Line Items */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">品目明細</h2>
        <div className="space-y-6">
          {quotation.items?.map((item) => (
            <div
              key={item.id}
              className="border border-border-secondary rounded-lg p-4 space-y-4"
            >
              {/* Product Name */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {item.productName}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  数量: {item.quantity.toLocaleString()}個 × {(item.unitPrice || 0).toLocaleString()}円
                </p>
              </div>

              {/* Detailed Specifications */}
              {item?.specifications && typeof item?.specifications === 'object' && Object.keys(item?.specifications).length > 0 && (
                <div className="bg-bg-secondary p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-text-primary text-sm border-b border-border-secondary pb-2">
                    詳細仕様
                  </h4>

                  {/* Contents */}
                  {item?.specifications && (
                    <div className="text-sm">
                      <span className="text-text-muted">内容物:</span>
                      <span className="ml-2 text-text-primary">
                        {getContentsDisplay(item?.specifications)}
                      </span>
                    </div>
                  )}

                  {/* Size */}
                  {item?.specifications && (
                    <div className="text-sm">
                      <span className="text-text-muted">サイズ:</span>
                      <span className="ml-2 text-text-primary">
                        {(() => {
                          if (item?.specifications?.bagTypeId === 'roll_film' || item?.specifications?.bagTypeId === 'standup_pouch') {
                            return (
                              <>
                                幅: {item?.specifications?.width}mm
                                {item?.specifications?.pitch && `、ピッチ: ${item?.specifications.pitch}mm`}
                              </>
                            );
                          }
                          // 既存のdimensionsとsideWidthをチェック
                          const existingDimensions = item?.specifications?.dimensions;
                          const sideWidth = item?.specifications?.sideWidth;
                          if (existingDimensions) {
                            // dimensionsに側面が含まれていない場合、追加する
                            if (sideWidth && !existingDimensions.includes('側面')) {
                              return existingDimensions.replace(' mm', `×側面${sideWidth} mm`);
                            } else {
                              return existingDimensions;
                            }
                          } else {
                            // dimensionsがない場合は個別フィールドから構築
                            return (
                              <>
                                {item?.specifications?.width}mm × {item?.specifications?.height}mm
                                {item?.specifications?.depth && ` × ${item?.specifications?.depth}mm`}
                                {item?.specifications?.sideWidth && ` × 側面${item?.specifications?.sideWidth}mm`}
                              </>
                            );
                          }
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Bag Type */}
                  {item?.specifications?.bagTypeId && (
                    <div className="text-sm">
                      <span className="text-text-muted">袋タイプ:</span>
                      <span className="ml-2 text-text-primary">
                        {getBagTypeName(item?.specifications?.bagTypeId)}
                      </span>
                    </div>
                  )}

                  {/* Material */}
                  {item?.specifications?.materialId && (
                    <div className="text-sm">
                      <span className="text-text-muted">素材:</span>
                      <span className="ml-2 text-text-primary">
                        {getMaterialName(item?.specifications?.materialId)}
                      </span>
                    </div>
                  )}

                  {/* Thickness */}
                  {item?.specifications?.thicknessSelection && (
                    <div className="text-sm">
                      <span className="text-text-muted">厚さ:</span>
                      <span className="ml-2 text-text-primary">
                        {getThicknessName(
                          item?.specifications?.materialId,
                          item?.specifications?.thicknessSelection
                        )}
                      </span>
                    </div>
                  )}

                  {/* Printing */}
                  {(item?.specifications?.printingType || item?.specifications?.printingColors) && (
                    <div className="text-sm">
                      <span className="text-text-muted">印刷:</span>
                      <span className="ml-2 text-text-primary">
                        {item?.specifications?.printingType === 'digital' && 'デジタル印刷（フルカラー）'}
                        {item?.specifications?.printingType === 'gravure' && 'グラビア印刷（フルカラー）'}
                      </span>
                    </div>
                  )}

                  {/* Post Processing Options */}
                  {item?.specifications?.postProcessingOptions && Array.isArray(item?.specifications?.postProcessingOptions) && item?.specifications?.postProcessingOptions.length > 0 && (() => {
                    // ロールフィルム・スタンドパウチの場合は表面処理のみ表示
                    const bagTypeId = item?.specifications?.bagTypeId as string;
                    const isLimitedPostProcessing = bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch';
                    const allowedOptions = isLimitedPostProcessing
                      ? item?.specifications?.postProcessingOptions.filter((opt: string) => opt === 'glossy' || opt === 'matte')
                      : item?.specifications?.postProcessingOptions;

                    // フィルタリング後に表示するオプションがある場合のみ表示
                    if (allowedOptions.length === 0) return null;

                    return (
                      <div className="text-sm">
                        <span className="text-text-muted">後加工:</span>
                        <div className="ml-2 mt-1 flex flex-wrap gap-2">
                          {allowedOptions.map((opt: string) => {
                            const labelMap: Record<string, string> = {
                              // コーナー加工
                              'corner-round': '角丸',
                              'corner-square': '角直角',
                              // 表面処理
                              'glossy': '光沢仕上げ',
                              'matte': 'マット仕上げ',
                              // ノッチ (Vノッチ/直線ノッチ構分)
                              'notch-yes': 'Vノッチ',
                              'notch-straight': '直線ノッチ',
                              'notch-no': 'ノッチなし',
                              // 吊り下げ穴
                              'hang-hole-6mm': '吊り穴(6mm)',
                              'hang-hole-8mm': '吊り下げ穴 (8mm)',
                              'hang-hole-no': '吊り穴なし',
                              // バルブ
                              'valve-yes': 'バルブ付き',
                              'valve-no': 'バルブなし',
                              // ジッパー
                              'zipper-yes': 'ジッパー付き',
                              'zipper-no': 'ジッパーなし',
                              'zipper-position-any': 'ジッパー位置 (お任せ)',
                              'zipper-position-specified': 'ジッパー位置 (指定)',
                              // 封印処理
                              'top-open': '上部解放',
                              'bottom-open': '下端解放',
                              'top-sealed': '上部密封',
                              // シール幅
                              'sealing-width-5mm': 'シール幅 5mm',
                              'sealing-width-7.5mm': 'シール幅 7.5mm',
                              'sealing-width-10mm': 'シール幅 10mm',
                              // マチ印刷
                              'machi-printing-yes': 'マチ印刷あり',
                              'machi-printing-no': 'マチ印刷なし',
                            };
                            return (
                              <span
                                key={opt}
                                className="px-2 py-1 bg-bg-primary rounded text-xs border border-border-secondary"
                              >
                                {labelMap[opt] || opt}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Additional Info */}
              {item?.specifications?.urgency && (
                <div className="text-sm">
                  <span className="text-text-muted">納期:</span>
                  <span className="ml-2 text-text-primary">
                    {item?.specifications?.urgency === 'urgent' && '急ぎ'}
                    {item?.specifications?.urgency === 'standard' && '標準'}
                  </span>
                </div>
              )}

              {item?.specifications?.deliveryLocation && (
                <div className="text-sm">
                  <span className="text-text-muted">配送先:</span>
                  <span className="ml-2 text-text-primary">
                    {item?.specifications?.deliveryLocation === 'domestic' && '国内'}
                    {item?.specifications?.deliveryLocation === 'international' && '海外'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border-secondary space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">小計</span>
            <span className="text-text-primary">¥{(subtotal || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">消費税 (10%)</span>
            <span className="text-text-primary">¥{(taxAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-text-primary">合計</span>
            <span className="text-primary text-xl">
              ¥{(quotation?.totalAmount || quotation?.total_amount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Bank Information - Hidden for quotation detail page */}
      {/* <BankInfoCard quotationId={quotation.id} /> */}

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
      {quotation?.status?.toLowerCase() === 'draft' ? (
        // ⏳ ドラフト: 承認待ちメッセージ
        <Card className="bg-yellow-50 border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-800">
                現在、管理者の承認待ちです
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                承認完了後、注文確定ボタンが表示されます
              </p>
            </div>
          </div>
        </Card>
      ) : quotation?.status?.toLowerCase() === 'converted' ? (
        // ✓ 変換済み: 注文済みメッセージ
        <Card className="bg-green-50 border-green-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-green-800">
                この見積は既に注文に変換されています
              </p>
              <p className="text-xs text-green-600 mt-1">
                注文詳細ページからご確認いただけます
              </p>
            </div>
          </div>
        </Card>
      ) : quotation?.status?.toLowerCase() === 'rejected' ? (
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
      ) : null}

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
            {quotation?.status?.toLowerCase() === 'approved' && (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={async () => {
                    setIsConverting(true);
                    setConvertError(null);
                    try {
                      const response = await fetch(`/api/member/quotations/${quotationId}/convert`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ notes: quotation?.notes }),
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
                  disabled={isConverting}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isConverting ? '変換中...' : '注文確定'}
                </Button>
                <InvoiceDownloadButton quotationId={quotation.id} variant="outline" />
              </>
            )}
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
    </div>
  );
}

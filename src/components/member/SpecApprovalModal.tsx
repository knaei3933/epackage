/**
 * 仕様確認モーダルコンポーネント
 *
 * 見積もりから注文に変換する際に、顧客に仕様を最終確認してもらうモーダル
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { CheckCircle, X } from 'lucide-react';
import type { Quotation, QuotationItem } from '@/types/dashboard';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';

// =====================================================
// Types
// =====================================================

interface SpecApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  quotation: Quotation;
  onApprove: () => Promise<void>;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * 仕様データを解析して表示用に変換
 */
function parseSpecifications(specs: Record<string, unknown> | null | undefined) {
  if (!specs || typeof specs !== 'object') {
    return null;
  }

  // デバッグ用: specs の内容をログに出力
  console.log('[SpecApprovalModal] Raw specifications:', JSON.stringify(specs, null, 2));

  const pattern = specs as any;

  // サイズ情報 - specifications はフラット構造
  const width = pattern.width || pattern.bag?.width || pattern.size?.width ||
                pattern.dimensions?.width || pattern.quotationItem?.width || '-';
  const height = pattern.height || pattern.bag?.height || pattern.size?.height ||
                 pattern.dimensions?.height || pattern.quotationItem?.height || '-';
  const depth = pattern.depth || pattern.gusset || pattern.bag?.depth ||
                pattern.size?.depth || pattern.dimensions?.depth ||
                pattern.quotationItem?.gusset || '0';

  // 素材情報
  const material = pattern.material || pattern.materialId ||
                   pattern.materialCompositionId || pattern.bag?.materialCompositionId ||
                   pattern.bag?.material || pattern.quotationItem?.materialId || '-';

  // 素材の日本語変換（大文字・小文字を正規化）
  const materialMap: Record<string, string> = {
    'PET_LLDPE': 'PET/LLDPE',
    'pet_ldpe': 'PET/LLDPE',
    'PET_NY_AL': 'PET/NY/AL',
    'pet_ny_al': 'PET/NY/AL',
    'PET_NY_CPP': 'PET/NY/CPP',
    'pet_ny_cpp': 'PET/NY/CPP',
    'NY_LLDPE': 'NY/LLDPE',
    'ny_lldepe': 'NY/LLDPE',
    'KRAFT_LLDPE': 'クラフト/LLDPE',
    'kraft_lldepe': 'クラフト/LLDPE',
    'KRAFT_NY_AL': 'クラフト/NY/AL',
    'kraft_ny_al': 'クラフト/NY/AL',
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'PET/AL': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny': 'PET/NY (ナイロン)',
    'PET/NY': 'PET/NY (ナイロン)',
    'kp_pe': 'KP/PE (クラフト紙)',
    'KP/PE': 'KP/PE (クラフト紙)',
    'LDPE': 'LDPE',
    'LLDPE': 'LLDPE',
    'PET': 'PET',
    'NY': 'ナイロン',
    'AL': 'アルミ',
    'CPP': 'CPP',
    'Kraft': 'クラフト紙',
  };

  // キーを正規化（大文字、ハイフンをアンダースコアに変換）
  const normalizeKey = (key: string): string => {
    return key.toUpperCase().replace(/-/g, '_');
  };

  const materialJa = materialMap[normalizeKey(material)] || materialMap[material] || material;

  // 袋タイプ（bag_type を優先）
  const bagTypeMap: Record<string, string> = {
    'standup': 'スタンドアップパウチ',
    'stand_up': 'スタンドアップパウチ',
    'stand-up': 'スタンドアップパウチ',
    'standup_pouch': 'スタンドアップパウチ',
    'stand-up-pouch': 'スタンドアップパウチ',
    'pillow': 'ピローパウチ',
    'gusset': 'ガゼットパウチ',
    'flat': 'フラットパウチ',
    'flat_3_side': '三方シール平袋',
    'flat-3-side': '三方シール平袋',
    'roll_film': 'ロールフィルム',
    'roll-film': 'ロールフィルム',
    'three_side_seal': '三方シーラー',
    'three-side-seal': '三方シーラー',
  };

  // bag_type（スネークケース）を優先 - bagTypeIdを最優先
  const bagType = pattern.bagTypeId || pattern.bag_type || pattern.bagType || pattern.bag?.bagTypeId ||
                  pattern.type || pattern.productType ||
                  pattern.bag?.type || pattern.quotationItem?.bagType ||
                  pattern.bag?.productType || '-';

  const bagTypeJa = bagTypeMap[bagType] || bagTypeMap[normalizeKey(bagType)] || bagType;

  // ジッパー - より多くのパスを試す
  const zipper = pattern.zipper || pattern.zipperType ||
                 pattern.bag?.zipperType || pattern.quotationItem?.zipperType ||
                 pattern.selectedZipper || 'none';

  let zipperJa = 'なし';
  if (zipper === 'zipper' || zipper === 'zipper_top' || zipper === 'zipper-yes' || zipper === 'yes') {
    zipperJa = 'チャック付き';
  } else if (zipper === 'slider' || zipper === 'slider-yes') {
    zipperJa = 'スライダー';
  }

  // 印刷情報
  const printingType = pattern.printing?.printingType || pattern.printingType || '-';
  let printingTypeJa = '-';
  if (printingType === 'digital') {
    printingTypeJa = 'デジタル印刷';
  } else if (printingType === 'gravure') {
    printingTypeJa = 'グラビア印刷';
  } else if (printingType === 'flexographic') {
    printingTypeJa = 'フレキソ印刷';
  } else {
    printingTypeJa = printingType;
  }

  const printColors = pattern.printing?.printColors?.front || pattern.printingColors || pattern.colors || '-';
  let colorsJa = '-';
  if (typeof printColors === 'number') {
    colorsJa = `${printColors}色`;
  } else if (typeof printColors === 'object' && printColors?.front) {
    colorsJa = `${printColors.front}色`;
  } else if (printColors) {
    colorsJa = printColors;
  }

  // 厚さ - materialId と thicknessSelection から材料構造を取得
  const materialId = pattern.materialId || pattern.material || pattern.bag?.materialId || '-';
  const thicknessSelection = pattern.thicknessSelection ||
                            pattern.thickness ||
                            pattern.bag?.thickness ||
                            pattern.quotationItem?.thickness ||
                            pattern.selectedThickness || '-';

  // ソースに完全な素材構成情報が含まれている場合はそれを優先
  const fullMaterialSpec = pattern.fullMaterialSpec ||
                           pattern.material_specification ||
                           pattern.layerStructure;

  let thicknessJa: string;
  if (fullMaterialSpec && typeof fullMaterialSpec === 'string') {
    thicknessJa = fullMaterialSpec;
  } else if (materialId !== '-' && thicknessSelection !== '-') {
    // materialId と thicknessSelection の組み合わせから specification を取得
    thicknessJa = getMaterialSpecification(materialId, thicknessSelection);
  } else {
    // フォールバック: 日本語変換
    const thicknessMap: Record<string, string> = {
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
    thicknessJa = thicknessMap[thicknessSelection] || thicknessMap[normalizeKey(thicknessSelection)] || thicknessSelection || '-';
  }

  // 納期
  const delivery = pattern.delivery || pattern.deliveryTerm || '-';
  let deliveryJa = '-';
  if (delivery === 'standard' || delivery === '標準') {
    deliveryJa = '標準';
  } else if (delivery === 'domestic') {
    deliveryJa = '国内';
  } else if (delivery) {
    deliveryJa = delivery;
  }

  // 配送先
  const shipping = pattern.shipping || pattern.shippingTo || '-';
  let shippingJa = '-';
  if (shipping === 'domestic' || shipping === '国内') {
    shippingJa = '国内';
  } else if (shipping) {
    shippingJa = shipping;
  }

  // 後加工オプションの詳細解析 - post_processing を優先
  const postProcessing: string[] = [];

  // post_processing（スネークケース）または postProcessingOptions を取得
  const finishOptions = pattern.post_processing || pattern.postProcessingOptions || [];

  // 仕上げ
  const hasMatte = pattern.printing?.matteFinish ||
                   finishOptions.includes('matte') ||
                   finishOptions.includes('matte_finish');
  const hasGlossy = pattern.printing?.glossy ||
                    finishOptions.includes('glossy') ||
                    finishOptions.includes('glossy_finish');

  if (hasGlossy) {
    postProcessing.push('光沢仕上げ');
  } else if (hasMatte) {
    postProcessing.push('マット仕上げ');
  }

  // 窓付き
  if (pattern.features?.window || finishOptions.includes('window')) {
    postProcessing.push('窓付き');
  }

  // バリア機能
  if (pattern.features?.barrier?.oxygen || pattern.features?.barrier?.moisture) {
    postProcessing.push('バリア機能');
  }

  // 後加工オプションの詳細マッピング
  const optionMap: Record<string, string> = {
    // ジッパー
    'zipper': 'チャック付き',
    'zipper-yes': 'チャック付き',
    'slider': 'スライダー',

    // 仕上げ
    'glossy': '光沢仕上げ',
    'glossy_finish': '光沢仕上げ',
    'matte': 'マット仕上げ',
    'matte_finish': 'マット仕上げ',

    // 機能
    'window': '窓付き',
    'hole_punching': '穴あけ',

    // その他オプション（英語キーを日本語に変換）
    'corner_rounding': '角丸め',
    'corner-rounding': '角丸め',
    'hang_hole': '吊り穴',
    'hang-hole': '吊り穴',
    'hang-hole-6mm': '吊り穴(6mm)',
    'notch': 'ノッチあり',
    'notch-yes': 'ノッチあり',
    'top_open': '上部開放',
    'top-open': '上部開放',
    'spout': 'スパウト',
    'valve': 'バルブ',
    'valve-yes': 'バルブ',
    'valve-no': 'バルブなし',
    'easy_tear': 'イージーティア',
  };

  // ジッパー（個別処理）
  if (zipper && zipper !== 'none') {
    postProcessing.push(zipperJa);
  }

  // その他の後加工オプションを処理
  finishOptions.forEach((opt: string) => {
    // ハイフン区切りのオプションも処理
    const baseKey = opt.replace(/-/g, '_');
    const mapped = optionMap[opt] || optionMap[baseKey];

    if (mapped && !postProcessing.includes(mapped)) {
      postProcessing.push(mapped);
    } else if (!mapped && !postProcessing.includes(opt)) {
      // マッピングされていない場合はそのまま追加（英語キーの場合）
      postProcessing.push(opt);
    }
  });

  return {
    size: { width, height, depth },
    material: materialJa,
    bagType: bagTypeJa,
    zipper: zipperJa,
    printing: {
      type: printingTypeJa,
      colors: colorsJa,
    },
    thickness: thicknessJa,
    delivery: deliveryJa,
    shipping: shippingJa,
    postProcessing,
  };
}

// =====================================================
// Component
// =====================================================

export default function SpecApprovalModal({
  isOpen,
  onClose,
  quotationId,
  quotation,
  onApprove,
}: SpecApprovalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // 最初のアイテムの仕様を取得
  const firstItem = quotation.items?.[0];
  const specs = firstItem?.specifications ? parseSpecifications(firstItem.specifications) : null;

  // 商品名と単価の取得（スネークケース・キャメルケース両対応）
  const productName = firstItem?.productName || (firstItem as any)?.product_name ||
                      (firstItem as any)?.name || '商品名なし';
  const quantity = firstItem?.quantity || 0;
  const unitPrice = firstItem?.unitPrice || (firstItem as any)?.unit_price || 0;

  // 金額計算
  const subtotal = unitPrice * quantity;
  const taxRate = 0.10; // 10%
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove();
      onClose();
    } catch (error) {
      console.error('Spec approval error:', error);
      alert('注文の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border-secondary px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">
              仕様確認・注文変換
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* 説明文 */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              以下の仕様を確認し、「確認して注文に変換」ボタンをクリックしてください。
            </p>
          </div>

          {/* 商品明細 */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
              商品明細
            </h3>
            <div className="bg-bg-secondary p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">{productName}</span>
                <span className="text-text-muted">{quotation.items?.length || 1}点</span>
              </div>
              {specs?.material && (
                <div className="text-sm text-text-muted">
                  {specs.material}
                  {specs.bagType && specs.bagType !== '-' && ` - ${specs.bagType}`}
                </div>
              )}
            </div>
          </section>

          {/* 数量・金額 */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
              数量・金額
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-bg-secondary p-3 rounded-lg">
                <p className="text-xs text-text-muted mb-1">数量</p>
                <p className="font-medium text-text-primary text-lg">{quantity.toLocaleString()}枚</p>
              </div>
              <div className="bg-bg-secondary p-3 rounded-lg">
                <p className="text-xs text-text-muted mb-1">単価</p>
                <p className="font-medium text-text-primary text-lg">{unitPrice.toLocaleString()}円</p>
              </div>
              <div className="bg-bg-secondary p-3 rounded-lg">
                <p className="text-xs text-text-muted mb-1">小計</p>
                <p className="font-medium text-text-primary text-lg">{subtotal.toLocaleString()}円</p>
              </div>
            </div>
          </section>

          {/* サイズ・袋タイプ */}
          {specs && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                サイズ・袋タイプ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">サイズ</p>
                  <p className="font-medium text-text-primary">
                    {specs.size.width !== '-' ? specs.size.width : '?'} x {specs.size.height !== '-' ? specs.size.height : '?'}
                    {specs.size.depth && specs.size.depth !== '-' && specs.size.depth !== '0' ? ` x ${specs.size.depth}` : ''} mm
                  </p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">袋タイプ</p>
                  <p className="font-medium text-text-primary">{specs.bagType}</p>
                </div>
              </div>
            </section>
          )}

          {/* 素材・厚さ */}
          {specs && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                素材・厚さ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">素材</p>
                  <p className="font-medium text-text-primary">{specs.material}</p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">厚さ</p>
                  <p className="font-medium text-text-primary">{specs.thickness}</p>
                </div>
              </div>
            </section>
          )}

          {/* 印刷 */}
          {specs && specs.printing.type !== '-' && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                印刷
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">印刷方式</p>
                  <p className="font-medium text-text-primary">{specs.printing.type}</p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">色数</p>
                  <p className="font-medium text-text-primary">{specs.printing.colors}</p>
                </div>
              </div>
            </section>
          )}

          {/* 納期・配送先 */}
          {specs && (specs.delivery !== '-' || specs.shipping !== '-') && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                納期・配送先
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">納期</p>
                  <p className="font-medium text-text-primary">{specs.delivery}</p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">配送先</p>
                  <p className="font-medium text-text-primary">{specs.shipping}</p>
                </div>
              </div>
            </section>
          )}

          {/* 後加工 */}
          {specs && specs.postProcessing.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                後加工
              </h3>
              <div className="flex flex-wrap gap-2">
                {specs.postProcessing.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 合計 */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
              合計
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-text-muted">小計</span>
                <span className="font-medium text-text-primary">{subtotal.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-text-muted">消費税 (10%)</span>
                <span className="font-medium text-text-primary">{tax.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-primary/5 px-4 rounded-lg">
                <span className="font-semibold text-text-primary">合計</span>
                <span className="font-bold text-xl text-primary">{total.toLocaleString()}円</span>
              </div>
            </div>
          </section>

          {/* 複数アイテムの場合の注意 */}
          {(quotation.items?.length || 0) > 1 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                ※ この見積には {quotation.items?.length} 点のアイテムが含まれています。
                上記は最初のアイテムの仕様です。すべてのアイテムが同じ注文に含まれます。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border-secondary px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isProcessing}
            className="shadow-md hover:shadow-lg"
          >
            {isProcessing ? '処理中...' : '確認して注文に変換'}
          </Button>
        </div>
      </div>
    </div>
  );
}

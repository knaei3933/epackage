/**
 * 仕様確認モーダルコンポーネント
 *
 * 見積もりから注文に変換する際に、顧客に仕様を最終確認してもらうモーダル
 */

'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui';
import { CheckCircle, X, Check, Package } from 'lucide-react';
import type { Quotation, QuotationItem } from '@/types/dashboard';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { formatProductDisplayName } from '@/lib/product-display-name';

// =====================================================
// Types
// =====================================================

interface SpecApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  quotation: Quotation;
  onApprove: (selectedItemIds?: string[]) => Promise<void>;
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
    'ny_lldpe': 'NY/LLDPE',
    'KRAFT_LLDPE': 'クラフト/LLDPE',
        'kraft_vmpet_lldpe': 'クラフト VMPET LLDPE',
    'kraft_pet_lldpe': 'クラフト PET LLDPE',
    'KRAFT_NY_AL': 'クラフト/NY/AL',
    'kraft_ny_al': 'クラフト/NY/AL',
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'PET/AL': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny': 'PET/NY (ナイロン)',
    'PET/NY': 'PET/NY (ナイロン)',
    'kp_pe': 'KP/PE (PVDCコート)',
    'KP/PE': 'KP/PE (PVDCコート)',
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
  // 常に「フルカラー」を表示
  const colorsJa = 'フルカラー';

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
    'zipper': 'ジッパー付き',
    'zipper-yes': 'ジッパー付き',
    'slider': 'スライダー',

    // 仕上げ
    'glossy': '光沢紙',
    'glossy_finish': '光沢紙',
    'matte': 'マット紙',
    'matte_finish': 'マット紙',

    // 機能
    'window': '窓付き',
    'hole_punching': '穴あけ',

    // その他オプション（英語キーを日本語に変換）
    'corner-round': '角丸',
    'corner_rounding': '角丸',
    'corner-rounding': '角丸',
    'hang_hole': '吊り下げ穴',
    'hang-hole': '吊り下げ穴',
    'hang-hole-6mm': '吊り下げ穴 (6mm)',
    'hang-hole-8mm': '吊り下げ穴 (8mm)',
    'notch': 'ノッチ付き',
    'notch-yes': 'ノッチ付き',
    'top_open': '上端開封',
    'top-open': '上端開封',
    'bottom-open': '下端開封',
    'spout': 'スパウト',
    'valve': 'バルブ付き',
    'valve-yes': 'バルブ付き',
    'valve-no': 'バルブなし',
    'easy_tear': 'イージーティア',
    'machi-printing-yes': 'マチ印刷あり',
    'machi-printing-no': 'マチ印刷なし',
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
  const hasMultipleItems = (quotation.items?.length || 0) > 1;

  // 全選択（デフォルト）からスタート
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(quotation.items?.map((i: any) => i.id) || [])
  );

  // 選択されたアイテムから金額を再計算（フックは早期リターン前に配置）
  const selectedItems = useMemo(
    () => (quotation.items || []).filter((i: any) => selectedIds.has(i.id)),
    [quotation.items, selectedIds]
  );

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(quotation.items?.map((i: any) => i.id) || []));
  const selectNone = () => setSelectedIds(new Set());

  const calcItemTotal = (item: any) =>
    item.totalPrice || item.total_price || (item.unitPrice || item.unit_price || 0) * (item.quantity || 0);

  // 100円切り上げで再計算（quotation API と同じロジック）
  const rawSubtotal = selectedItems.reduce((sum: number, item: any) => sum + calcItemTotal(item), 0);
  const subtotal = Math.ceil(rawSubtotal / 100) * 100;
  const tax = Math.ceil(subtotal * 0.1);
  const total = Math.ceil((subtotal + tax) / 100) * 100;

  // 最初のアイテムの仕様を取得（表示用）
  const firstItem = quotation.items?.[0];
  const specs = firstItem?.specifications ? parseSpecifications(firstItem.specifications) : null;

  // 各アイテムごとの統一製品表示名（仕様から生成）
  const getItemDisplayName = (item: any): string => {
    const itemSpecs = item?.specifications;
    if (itemSpecs && typeof itemSpecs === 'object') {
      const name = formatProductDisplayName(itemSpecs, '');
      if (name) return name;
    }
    return item?.productName || (item as any)?.product_name ||
           (item as any)?.name || 'カスタム製品';
  };

  const handleApprove = async () => {
    if (selectedIds.size === 0) {
      alert('少なくとも1つのパターンを選択してください。');
      return;
    }
    setIsProcessing(true);
    try {
      const itemIds = hasMultipleItems && selectedIds.size < (quotation.items?.length || 0)
        ? Array.from(selectedIds)
        : undefined;
      await onApprove(itemIds);
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

          {/* パターン選択 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text-primary">
                注文するパターンを選択
              </h3>
              {hasMultipleItems && (
                <div className="flex items-center gap-3 text-sm">
                  <button onClick={selectAll} className="text-primary hover:underline">全選択</button>
                  <span className="text-text-muted">|</span>
                  <button onClick={selectNone} className="text-text-muted hover:underline">全解除</button>
                </div>
              )}
            </div>
            {hasMultipleItems && (
              <p className="text-sm text-text-muted mb-3">
                見積には {quotation.items?.length} つの数量パターンがあります。注文するパターンを選択してください。
              </p>
            )}

            {/* パターン一覧（カード型選択UI） */}
            <div className="space-y-2.5">
              {(quotation.items || []).map((item: any, idx: number) => {
                const isSelected = selectedIds.has(item.id);
                const itemQty = item.quantity || 0;
                const itemUnit = item.unitPrice || item.unit_price || 0;
                const itemTotal = calcItemTotal(item);
                const itemDisplayName = getItemDisplayName(item);
                const isRowClickable = hasMultipleItems;
                return (
                  <div
                    key={item.id}
                    role={isRowClickable ? 'button' : undefined}
                    onClick={isRowClickable ? () => toggleItem(item.id) : undefined}
                    className={`group relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border-medium bg-bg-primary hover:border-primary/40 hover:bg-bg-secondary/30'
                    } ${isRowClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* 選択チェック（カスタム円形） */}
                    {hasMultipleItems && (
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-border-medium text-transparent group-hover:border-primary/50'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                    )}

                    {/* パターン番号バッジ + 製品名 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {hasMultipleItems && (
                          <span className={`flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            isSelected ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-muted'
                          }`}>
                            {idx + 1}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Package className="w-4 h-4 text-text-muted flex-shrink-0" />
                          <span className="text-sm font-medium text-text-primary truncate">
                            {itemDisplayName}
                          </span>
                        </div>
                      </div>
                      {/* 価格情報 */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-8 text-xs">
                        <span className="text-text-muted">
                          数量: <span className="font-semibold text-text-primary tabular-nums">{itemQty.toLocaleString()}</span> 枚
                        </span>
                        <span className="text-text-muted">
                          単価: <span className="font-semibold text-text-primary tabular-nums">¥{itemUnit.toLocaleString()}</span>
                        </span>
                        <span className="text-primary font-bold tabular-nums sm:hidden">
                          ¥{itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 右側: 金額（sm以上で表示） */}
                    <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                      <span className="text-xs text-text-muted">金額</span>
                      <span className={`text-lg font-bold tabular-nums ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                        ¥{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 選択サマリー */}
            {hasMultipleItems && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-text-muted">
                  選択中: <span className="text-text-primary font-medium">{selectedIds.size}</span> / {quotation.items?.length} パターン
                </span>
                <span className="text-text-muted">
                  選択金額合計: <span className="text-text-primary font-semibold">¥{subtotal.toLocaleString()}</span>
                </span>
              </div>
            )}

            {specs?.material && (
              <div className="mt-3 text-sm text-text-muted bg-bg-secondary/30 p-3 rounded-lg">
                共通仕様: {specs.material}
                {specs.bagType && specs.bagType !== '-' && ` - ${specs.bagType}`}
              </div>
            )}
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

          {/* 決済金額サマリー */}
          {hasMultipleItems && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                選択した {selectedIds.size} パターンの合計金額で注文を作成します。
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

/**
 * 仕様確認モーダルコンポーネント
 *
 * 見積もりから注文に変換する際に、顧客に仕様を最終確認してもらうモーダル
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { CheckCircle, X, Check, Package, Ruler, Layers, Printer, Wrench, Receipt } from 'lucide-react';
import type { Quotation } from '@/types/dashboard';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { formatProductDisplayName } from '@/lib/product-display-name';
import { translatePostProcessing } from '@/constants/enToJa';
import { OrderConsentModal } from '@/components/member/OrderConsentModal';
import type { OrderAgreementInput } from '@/lib/order-consent-terms';

// =====================================================
// Types
// =====================================================

interface SpecApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  quotation: Quotation;
  onApprove: (selectedItemIds?: string[], agreement?: OrderAgreementInput) => Promise<void>;
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

  // 後加工オプション - 正系マップ（translatePostProcessing）で一元化。
  // 「なし」系（zipper-no 等）も日本語で明示表示（ユーザー要望）。
  // translatePostProcessing が sealing-width-* 動的処理含む全キーをカバー。
  // 未知キーはスキップ（英語を画面に吐かない = 恒久的な英語表示防止）。
  const finishOptions: string[] = (pattern.post_processing || pattern.postProcessingOptions || []) as string[];

  const seen = new Set<string>();
  const postProcessing: string[] = [];
  const addUnique = (label: string) => {
    if (!seen.has(label)) {
      seen.add(label);
      postProcessing.push(label);
    }
  };

  finishOptions.forEach((opt: string) => {
    if (typeof opt !== 'string' || !opt) return;
    // 正系マップで変換（zipper-no→「ジッパーなし」・valve-no→「バルブなし」・sealing-width-*→「シール幅 Xmm」等）
    const label = translatePostProcessing(opt);
    // 変換できた（opt と違う値）場合のみ追加。未知キーはスキップ（英語を吐かない）。
    if (label !== opt) {
      addUnique(label);
    }
  });

  // features 系（post_processing 配列に無い場合の補完）
  if (pattern.features?.window) {
    addUnique('窓付き');
  }
  if (pattern.features?.barrier?.oxygen || pattern.features?.barrier?.moisture) {
    addUnique('バリア機能');
  }

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
  // Phase C: 注文同意モーダル（2画面遷移・仕様確認→同意）
  const [showConsent, setShowConsent] = useState(false);
  const items = (quotation.items || []) as any[];
  // 有効期間内の再注文を許容: 注文済 item も選択可能（全 item を候補に）。
  const selectableItems = items;
  const hasMultipleItems = items.length > 1;

  // ラジオ式単一選択（1回の注文 = 数量パターン1つ）。
  // 初期値は最初の item。quotation が変わった時もリセットする。
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    () => selectableItems[0]?.id ?? null
  );
  useEffect(() => {
    setSelectedItemId(items[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation.items]);

  if (!isOpen) return null;

  const selectItem = (id: string) => {
    setSelectedItemId(id);
  };

  const calcItemTotal = (item: any) =>
    item.totalPrice || item.total_price || (item.unitPrice || item.unit_price || 0) * (item.quantity || 0);

  // 選択中の単一 item から金額を再計算（100円切り上げ・quotation API と同ロジック）
  const selectedItem = items.find((i) => i.id === selectedItemId) || null;
  const rawSubtotal = selectedItem ? calcItemTotal(selectedItem) : 0;
  const subtotal = Math.ceil(rawSubtotal / 100) * 100;
  const tax = Math.ceil(subtotal * 0.1);
  const total = Math.ceil((subtotal + tax) / 100) * 100;

  // 最初のアイテムの仕様を取得（表示用）
  const firstItem = items[0];
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

  const handleApprove = () => {
    if (!selectedItemId) {
      alert('数量パターンを1つ選択してください。');
      return;
    }
    // 注文済パターンの再注文は確認ダイアログで意図を明示（誤操作防止）
    if (selectedItem?.orderId) {
      const ok = window.confirm('この数量パターンは既に注文済みです。再度注文しますか？');
      if (!ok) return;
    }
    // Phase C: 同意モーダルへ遷移（2画面遷移・仕様確認→同意）。
    // 実際の変換 API 呼び出しは同意確定時（handleConsentConfirm）。
    setShowConsent(true);
  };

  // Phase C: 同意モーダル確定時の変換呼び出し。agreement を付加して親へ渡す。
  const handleConsentConfirm = async (agreement: OrderAgreementInput) => {
    if (!selectedItemId) return;
    setIsProcessing(true);
    try {
      // 常に1件送信（数量パターン1つ = 注文1つ）
      await onApprove([selectedItemId], agreement);
      onClose();
    } catch (error) {
      console.error('Spec approval error:', error);
      alert('注文の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
      setShowConsent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-border-secondary px-6 py-4 flex items-center justify-between">
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
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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
                注文する数量パターンを選択
              </h3>
            </div>
            {hasMultipleItems && (
              <p className="text-sm text-text-muted mb-3">
                数量パターンから1つを選択してください（1回の注文につき1パターン）。他のパターンは注文完了後に再度操作できます。
              </p>
            )}

            {/* パターン一覧（ラジオ式単一選択） */}
            <div className="space-y-2.5">
              {items.map((item: any, idx: number) => {
                const isOrdered = !!item.orderId;
                const isSelected = selectedItemId === item.id;
                const itemQty = item.quantity || 0;
                const itemUnit = item.unitPrice || item.unit_price || 0;
                const itemTotal = calcItemTotal(item);
                const itemDisplayName = getItemDisplayName(item);
                const handleClick = () => selectItem(item.id);
                return (
                  <div
                    key={item.id}
                    role="button"
                    onClick={handleClick}
                    className={`group relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm cursor-pointer'
                        : 'border-border-medium bg-bg-primary hover:border-primary/40 hover:bg-bg-secondary/30 cursor-pointer'
                    }`}
                  >
                    {/* ラジオ（円形インジケータ） */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-medium text-transparent group-hover:border-primary/50'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </div>

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
                        {isOrdered && (
                          <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            注文済
                          </span>
                        )}
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
                  選択中のパターン: <span className="text-text-primary font-medium">1</span> つ（1注文につき1パターン）
                </span>
                <span className="text-text-muted">
                  注文金額: <span className="text-text-primary font-semibold">¥{subtotal.toLocaleString()}</span>
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
              <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                <Ruler className="w-5 h-5 text-primary" />
                サイズ・袋タイプ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">サイズ</p>
                  <p className="font-medium text-text-primary">
                    {specs.size.width !== '-' ? specs.size.width : '?'} x {specs.size.height !== '-' ? specs.size.height : '?'}
                    {specs.size.depth && specs.size.depth !== '-' && specs.size.depth !== '0' ? ` x ${specs.size.depth}` : ''} mm
                  </p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">袋タイプ</p>
                  <p className="font-medium text-text-primary">{specs.bagType}</p>
                </div>
              </div>
            </section>
          )}

          {/* 素材・厚さ */}
          {specs && (
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                <Layers className="w-5 h-5 text-primary" />
                素材・厚さ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">素材</p>
                  <p className="font-medium text-text-primary">{specs.material}</p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">厚さ</p>
                  <p className="font-medium text-text-primary">{specs.thickness}</p>
                </div>
              </div>
            </section>
          )}

          {/* 印刷 */}
          {specs && specs.printing.type !== '-' && (
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                <Printer className="w-5 h-5 text-primary" />
                印刷
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">印刷方式</p>
                  <p className="font-medium text-text-primary">{specs.printing.type}</p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
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
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">納期</p>
                  <p className="font-medium text-text-primary">{specs.delivery}</p>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg border border-border-secondary">
                  <p className="text-xs text-text-muted mb-1">配送先</p>
                  <p className="font-medium text-text-primary">{specs.shipping}</p>
                </div>
              </div>
            </section>
          )}

          {/* 後加工 */}
          {specs && specs.postProcessing.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
                <Wrench className="w-5 h-5 text-primary" />
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
            <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-secondary">
              <Receipt className="w-5 h-5 text-primary" />
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
                選択した数量パターンで1つの注文を作成します。複数パターンを注文する場合は、注文完了後に再度ご操作ください。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t border-border-secondary px-6 py-4 flex justify-end gap-3">
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

        {/* Phase C: 注文同意モーダル（2画面遷移・仕様確認→同意） */}
        <OrderConsentModal
          open={showConsent}
          onOpenChange={(o) => {
            if (!isProcessing) setShowConsent(o);
          }}
          onConfirm={handleConsentConfirm}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

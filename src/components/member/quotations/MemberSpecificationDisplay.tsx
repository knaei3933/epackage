'use client';

import { BAG_TYPE_IMAGES } from '@/constants/product-type-config';
import { BAG_TYPE_JA, POST_PROCESSING_JA, translateMaterialType } from '@/constants/enToJa';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';

/**
 * MemberSpecificationDisplay - メンバー用仕様表示コンポーネント
 * 製品の詳細仕様を表示する
 */
export function MemberSpecificationDisplay({ item }: { item: any }) {
  // breakdown.specificationsを優先、なければitem.specificationsを使用
  const specs = item.breakdown?.specifications || item.specifications;
  if (!specs) return null;

  // 日本語変換マップ
  const bagTypeFallback: Record<string, string> = {
    'flat_3_side': 'ピローパウチ',
    'lap_seal': '合掌袋',
  };

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

  const materialFallback: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'pet_ldpe': 'PET/LLDPE',
  };

  // 日本語変換
  const bagTypeJa = BAG_TYPE_JA[specs.bagTypeId as keyof typeof BAG_TYPE_JA] ||
                    bagTypeFallback[specs.bagTypeId] ||
                    specs.bagTypeId ||
                    '-';

  const materialJa = translateMaterialType(specs.materialId) ||
                     materialFallback[specs.materialId] ||
                     specs.materialId ||
                     '-';

  // 厚さ計算
  let thicknessJa = '-';
  if (specs.materialId && specs.thicknessSelection) {
    thicknessJa = getMaterialSpecification(specs.materialId, specs.thicknessSelection);
  }

  if (thicknessJa === '-') {
    const defaultThicknessSpec: Record<string, string> = {
      'ny_lldpe': 'NY 15μ + LLDPE 70μ',
      'pet_ldpe': 'PET 12μ + LLDPE 70μ',
      'pet_al': 'PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ',
      'pet_vmpet': 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 90μ',
      'pet_ny_al': 'PET 12μ + NY 16μ + AL 7μ + LLDPE 90μ',
      'kraft_vmpet_lldpe': 'Kraft 50g/m² + VMPET 12μ + LLDPE 90μ',
      'kraft_pet_lldpe': 'Kraft 50g/m² + PET 12μ + LLDPE 70μ',
    };
    thicknessJa = defaultThicknessSpec[specs.materialId] || '-';
  }

  // 印刷情報
  const printingJa = specs.printingType === 'digital'
    ? 'デジタル印刷（フルカラー）'
    : specs.printingType === 'gravure'
      ? 'グラビア印刷（フルカラー）'
      : '-';

  // 後加工処理
  const isLimitedPostProcessing = specs.bagTypeId === 'roll_film' || specs.bagTypeId === 'spout_pouch';
  const filteredOptions = (specs.postProcessingOptions || [])
    .filter((opt: string) => !opt.startsWith('sealing-width-'));

  const filteredPostProcessingOptions = isLimitedPostProcessing
    ? filteredOptions.filter((opt: string) => opt === 'glossy' || opt === 'matte')
    : filteredOptions;

  const postProcessingList = filteredPostProcessingOptions
    .map((opt: string) => POST_PROCESSING_JA[opt as keyof typeof POST_PROCESSING_JA] || opt)
    .filter(Boolean);

  // シール幅処理
  let sealWidthDisplay = null;
  if (specs.sealWidth) {
    sealWidthDisplay = `シール幅 ${specs.sealWidth}`;
  } else {
    const sealWidthOption = (specs.postProcessingOptions || []).find((opt: string) => opt.startsWith('sealing-width-'));
    if (sealWidthOption) {
      const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
      if (widthMatch) {
        const width = widthMatch[1].replace('-', '.');
        sealWidthDisplay = `シール幅 ${width}`;
      }
    }
  }

  if (sealWidthDisplay && !isLimitedPostProcessing) {
    postProcessingList.unshift(sealWidthDisplay);
  }

  // 納期・配送
  const deliveryJa = specs.deliveryLocation === 'domestic' ? '国内' :
                     specs.deliveryLocation === 'international' ? '海外' : '-';
  const urgencyJa = specs.urgency === 'standard' ? '標準' :
                    specs.urgency === 'express' ? '急ぎ' : '-';

  // 内容物情報
  const contentsJa = [
    specs.productCategory ? productCategoryMap[specs.productCategory] : null,
    specs.contentsType ? contentsTypeMap[specs.contentsType] : null,
    specs.mainIngredient ? mainIngredientMap[specs.mainIngredient] : null,
    specs.distributionEnvironment ? distributionEnvironmentMap[specs.distributionEnvironment] : null,
  ].filter(Boolean).join('、') || '-';

  // サイズ表示
  const pitchValue = specs.pitch || (specs.specifications as any)?.pitch || 0;
  const sideWidth = specs.sideWidth;
  let sizeDisplay = '';

  if (specs.size) {
    sizeDisplay = specs.size;
  } else if (specs.bagTypeId === 'roll_film') {
    sizeDisplay = `幅: ${specs.width || 0}mm${pitchValue ? `、ピッチ: ${pitchValue}mm` : ''}`;
  } else if (specs.bagTypeId === 'spout_pouch') {
    const width = specs.width || 0;
    const height = specs.height || 0;
    const depth = specs.depth || 0;
    sizeDisplay = `幅: ${width}mm`;
    if (sideWidth) sizeDisplay += `、マチ: ${sideWidth}mm`;
    if (height > 0) sizeDisplay += `、高さ: ${height}mm`;
    if (depth > 0) sizeDisplay += `、奥行: ${depth}mm`;
  } else {
    const existingDimensions = specs.dimensions;
    if (existingDimensions) {
      if (sideWidth && !existingDimensions.includes('側面')) {
        sizeDisplay = existingDimensions.replace(' mm', `${sideWidth ? ` x 側面${sideWidth}` : ''} mm`);
      } else {
        sizeDisplay = existingDimensions;
      }
    } else {
      sizeDisplay = `${specs.width || 0} x ${specs.height || 0}${(specs.depth as number || 0) > 0 ? ` x ${specs.depth}` : ''}${sideWidth ? ` x 側面${sideWidth}` : ''} mm`;
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

        {/* 製品タイププレビュー画像 */}
        {(() => {
          // bagTypeIdを直接使用して画像を検索（より確実なマッピング）
          const bagTypeId = specs.bagTypeId || specs.bag_type || specs.type;
          let bagTypeInfo = bagTypeId ? BAG_TYPE_IMAGES[bagTypeId] : null;

          // 見つからない場合、日本語名から逆引き
          if (!bagTypeInfo && bagTypeId) {
            const entry = Object.entries(BAG_TYPE_IMAGES).find(([key, value]) => value.name === bagTypeJa);
            if (entry) {
              bagTypeInfo = entry[1];
            }
          }

          // それでも見つからない場合、デフォルト画像（三方シール）を使用
          if (!bagTypeInfo) {
            console.log('[MemberSpecificationDisplay] Bag type not found:', bagTypeId, 'bagTypeJa:', bagTypeJa);
            return (
              <div className="col-span-2 mb-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-sm text-gray-500">製品タイプ: {bagTypeJa}</div>
              </div>
            );
          }

          return (
            <div className="col-span-2 mb-2 flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-20 h-20 relative bg-white rounded-lg p-2 shadow-sm flex-shrink-0">
                <img
                  src={bagTypeInfo.image}
                  alt={bagTypeInfo.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('[MemberSpecificationDisplay] Image load error:', bagTypeInfo.image);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-blue-900">{bagTypeInfo.name}</div>
                <div className="text-xs text-blue-700">製品タイプ</div>
              </div>
            </div>
          );
        })()}

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
          <span className="text-text-primary">{specs.material_specification || thicknessJa}</span>
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

        {/* スパウトパウチ情報 */}
        {specs.bagTypeId === 'spout_pouch' && (specs.spoutSize || specs.spoutPosition) && (
          <div className="col-span-2 flex items-start gap-1">
            <span className="text-text-muted flex-shrink-0">スパウト仕様:</span>
            <span className="text-text-primary">
              サイズ: {specs.spoutSize ? `${specs.spoutSize}mm` : '-'}
              {specs.spoutPosition && `、位置: ${
                specs.spoutPosition === 'top-center' ? '上部中央' :
                specs.spoutPosition === 'top-left' ? '上部左側' :
                specs.spoutPosition === 'top-right' ? '上部右側' :
                specs.spoutPosition || '-'
              }`}
            </span>
          </div>
        )}

        {/* マチサイズ */}
        {specs.bagTypeId === 'spout_pouch' && specs.sideWidth && (
          <div className="flex items-start gap-1">
            <span className="text-text-muted flex-shrink-0">マチサイズ:</span>
            <span className="text-text-primary">{specs.sideWidth}mm</span>
          </div>
        )}

        {/* 後加工 */}
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

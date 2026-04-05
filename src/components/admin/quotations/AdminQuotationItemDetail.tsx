'use client';

import { DetailedCostBreakdown } from '@/components/admin/quotation/DetailedCostBreakdown';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { BAG_TYPE_IMAGES, convertToPreviewOptions } from './quotation-utils';
import type { QuotationItem } from '@/types/quotation';

interface AdminQuotationItemDetailProps {
  item: QuotationItem;
  showFormula: boolean;
}

/**
 * AdminQuotationItemDetail - 管理者用見積明細詳細コンポーネント
 */
export function AdminQuotationItemDetail({ item, showFormula }: AdminQuotationItemDetailProps) {
  const specs = item.breakdown?.specifications || item.specifications || {};
  const breakdown = item.breakdown;

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      {/* 基本情報 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{item.product_name}</p>
          <p className="text-xs text-gray-500">数量: {item.quantity}個 × ¥{item.unit_price?.toLocaleString()}</p>
        </div>
        <p className="font-semibold text-gray-900">¥{item.total_price?.toLocaleString()}</p>
      </div>

      {/* 仕様情報 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {specs.bag_type && (
          <div>
            <span className="text-gray-500">タイプ:</span>
            <span className="ml-1">{specs.bag_type}</span>
          </div>
        )}
        {specs.material_specification && (
          <div className="col-span-2">
            <span className="text-gray-500">素材:</span>
            <span className="ml-1 text-blue-700">{specs.material_specification}</span>
          </div>
        )}
        {specs.weight_range && (
          <div>
            <span className="text-gray-500">重量:</span>
            <span className="ml-1">{specs.weight_range}</span>
          </div>
        )}
        {specs.size && (
          <div className="col-span-2">
            <span className="text-gray-500">サイズ:</span>
            <span className="ml-1">{specs.size}</span>
          </div>
        )}
        {specs.printing_display && (
          <div>
            <span className="text-gray-500">印刷:</span>
            <span className="ml-1">{specs.printing_display}</span>
          </div>
        )}
        {specs.colors && (
          <div>
            <span className="text-gray-500">色数:</span>
            <span className="ml-1">{specs.colors}</span>
          </div>
        )}
        {specs.zipper && (
          <div>
            <span className="text-gray-500">ジッパー:</span>
            <span className="ml-1">あり</span>
          </div>
        )}

        {/* Spout Pouch Specifications */}
        {(specs.bagTypeId === 'spout_pouch' || specs.bag_type === 'spout_pouch' || specs.spoutSize || specs.spoutPosition) && (
          <>
            <div className="col-span-2 font-medium text-blue-700 mt-2 border-t pt-2">
              スパウト仕様
            </div>
            {specs.spoutSize && (
              <div>
                <span className="text-gray-500">スパウトサイズ:</span>
                <span className="ml-1">{specs.spoutSize}mm</span>
              </div>
            )}
            {specs.spoutPosition && (
              <div>
                <span className="text-gray-500">スパウト位置:</span>
                <span className="ml-1">
                  {specs.spoutPosition === 'top-left' ? '左上' :
                   specs.spoutPosition === 'top-center' ? '上部中央' :
                   specs.spoutPosition === 'top-right' ? '右上' :
                   specs.spoutPosition}
                </span>
              </div>
            )}
            {item.cost_breakdown?.pouchProcessingCost && (
              <div>
                <span className="text-gray-500">スパウト加工費:</span>
                <span className="ml-1">¥{item.cost_breakdown.pouchProcessingCost.toLocaleString()}</span>
              </div>
            )}
            {specs.hasGusset !== undefined && (
              <div>
                <span className="text-gray-500">マチ:</span>
                <span className="ml-1">{specs.hasGusset ? 'あり' : 'なし'}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Type Preview */}
      {specs.bagTypeId && (() => {
        const bagTypeInfo = BAG_TYPE_IMAGES[specs.bagTypeId];
        if (!bagTypeInfo) return null;

        // 後加工オプションを準備
        const filteredOptions = (specs.post_processing || [])
          .filter((opt: string) => !opt.startsWith('sealing-width-') && !opt.startsWith('seal-width-'));
        const postProcessingList = filteredOptions.map((opt: string) => {
          const labelMap: Record<string, string> = {
            'corner-round': '角丸',
            'corner-square': '角直角',
            'glossy': '光沢仕上げ',
            'matte': 'マット仕上げ',
            'notch-yes': 'ノッチ付き',
            'notch-straight': '直線ノッチ',
            'notch-no': 'ノッチなし',
            'hang-hole-6mm': '吊り下げ穴 (6mm)',
            'hang-hole-8mm': '吊り下げ穴 (8mm)',
            'hang-hole-no': '吊り穴なし',
            'valve-yes': 'バルブ付き',
            'valve-no': 'バルブなし',
            'zipper-yes': 'ジッパー付き',
            'zipper-no': 'ジッパーなし',
            'top-open': '上端開封',
            'bottom-open': '下端開封',
            'machi-printing-yes': 'マチ印刷あり',
            'machi-printing-no': 'マチ印刷なし',
          };
          return labelMap[opt] || opt;
        });

        // シール幅を追加
        const finalList = [...postProcessingList];
        if (specs.sealWidth) {
          finalList.unshift(`シール幅 ${specs.sealWidth}`);
        }

        return (
          <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border-2 border-blue-200 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 製品タイプ画像 */}
              <div className="flex-shrink-0">
                <div className="w-36 h-36 lg:w-44 lg:h-44 relative bg-white rounded-xl p-3 shadow-md">
                  <img
                    src={bagTypeInfo.image}
                    alt={bagTypeInfo.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 製品仕様 */}
              <div className="flex-1">
                {/* タイトル */}
                <div className="border-b border-blue-200 pb-2 mb-3">
                  <h3 className="text-lg font-bold text-blue-900">
                    {bagTypeInfo.name}
                  </h3>
                </div>

                {/* 仕様セクション */}
                <div className="space-y-3">
                  {/* 基本仕様 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {specs.bag_type && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium flex-shrink-0">タイプ:</span>
                        <span className="text-gray-900">{specs.bag_type}</span>
                      </div>
                    )}
                    {specs.material_specification && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium flex-shrink-0">素材:</span>
                        <span className="text-gray-900">{specs.material_specification}</span>
                      </div>
                    )}
                    {specs.size && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium flex-shrink-0">サイズ:</span>
                        <span className="text-gray-900">{specs.size}</span>
                      </div>
                    )}
                    {specs.printing_display && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium flex-shrink-0">印刷:</span>
                        <span className="text-gray-900">{specs.printing_display}</span>
                      </div>
                    )}
                    {(specs.material_specification || specs.thickness_display || specs.weight_range) && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium flex-shrink-0">厚さ:</span>
                        <span className="text-gray-900">{specs.material_specification || specs.thickness_display || specs.weight_range}</span>
                      </div>
                    )}
                  </div>

                  {/* 詳細仕様（後加工など） */}
                  {finalList.length > 0 && (
                    <div className="pt-3 border-t border-blue-100">
                      <div className="text-xs font-medium text-gray-600 mb-2">詳細仕様</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                        <span className="text-gray-600 font-medium">後加工:</span>
                        {finalList.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Post Processing Preview */}
      {specs.post_processing && specs.post_processing.length > 0 && (
        <PostProcessingPreview
          selectedOptions={convertToPreviewOptions(specs.post_processing || [])}
          className="mt-3"
        />
      )}

      {/* SKU情報 */}
      {breakdown?.sku_info && breakdown.sku_info.count > 1 ? (
        <div className="bg-purple-50 p-2 rounded text-xs">
          <p className="font-medium text-purple-700">SKU分割: {breakdown.sku_info.count}SKU</p>
          <p className="text-purple-600">数量: [{breakdown.sku_info.quantities.join(', ')}] 合計: {breakdown.sku_info.total}個</p>
        </div>
      ) : (
        <div className="bg-gray-100 p-2 rounded text-xs">
          <p className="text-gray-600">SKU数: 1種類</p>
          <p className="text-gray-500">数量: {item.quantity}個</p>
        </div>
      )}

      {/* 詳細な原価内訳 */}
      {showFormula && breakdown?.breakdown && (
        <DetailedCostBreakdown
          breakdown={{
            ...breakdown.breakdown,
            printing: breakdown.breakdown.printingCost || 0,
          }}
          specifications={specs}
          sku_info={breakdown.sku_info}
          filmCostDetails={breakdown.filmCostDetails}
          showFormula={showFormula}
        />
      )}

      {/* 従来の計算式（フォールバック） */}
      {showFormula && breakdown && !breakdown.breakdown && (
        <div className="bg-white p-3 rounded border text-xs space-y-1">
          <p className="font-medium text-gray-700">計算式内訳:</p>
          <p>単価: ¥{breakdown.unit_price?.toLocaleString()}</p>
          <p>数量: {breakdown.quantity}個</p>
          <p className="border-t pt-1 font-medium">小計: ¥{breakdown.quantity} × ¥{breakdown.unit_price?.toLocaleString()} = ¥{breakdown.total_price?.toLocaleString()}</p>
          {breakdown.area && (
            <p className="text-gray-500">面積: {breakdown.area.mm2.toLocaleString()}mm² ({breakdown.area.m2.toFixed(4)}m²)</p>
          )}
        </div>
      )}
    </div>
  );
}

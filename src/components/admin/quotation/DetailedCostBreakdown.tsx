'use client';

/**
 * Detailed Cost Breakdown Component
 *
 * 管理者用詳細原価内訳表示コンポーネント
 * unified-pricing-engine.ts の breakdown データを表示
 */

import { Card } from '@/components/ui';

// =====================================================
// Types
// =====================================================

export interface DetailedCostBreakdownProps {
  breakdown: {
    // フィルム材料費
    materialCost: number;
    // ラミネート費
    laminationCost: number;
    // スリッター費
    slitterCost: number;
    // 表面処理費
    surfaceTreatmentCost: number;
    // パウチ加工費
    pouchProcessingCost: number;
    // 印刷費
    printingCost: number;
    // 製造者マージン
    manufacturingMargin: number;
    // 関税
    duty: number;
    // 配送料
    delivery: number;
    // 販売マージン
    salesMargin: number;
    // 総原価
    totalCost: number;
  };
  specifications?: {
    bag_type?: string;
    material?: string;
    size?: string;
    width?: number;
    height?: number;
    depth?: number;
    printing?: string;
    colors?: number;
    post_processing?: string[];
    zipper?: boolean;
    spout?: boolean;
  };
  sku_info?: {
    count: number;
    quantities: number[];
    total: number;
  };
  filmCostDetails?: {
    materialCost?: number;
    laminationCost?: number;
    slitterCost?: number;
    surfaceTreatmentCost?: number;
  };
  showFormula?: boolean;
}

// =====================================================
// Component
// =====================================================

export function DetailedCostBreakdown({
  breakdown,
  specifications,
  sku_info,
  filmCostDetails,
  showFormula = true
}: DetailedCostBreakdownProps) {
  const {
    materialCost,
    laminationCost,
    slitterCost,
    surfaceTreatmentCost,
    pouchProcessingCost,
    printingCost,
    manufacturingMargin,
    duty,
    delivery,
    salesMargin,
    totalCost
  } = breakdown;

  // 素材費合計（フィルム＋ラミネート＋スリッター＋表面処理）
  const totalMaterialCost = (materialCost || 0) + (laminationCost || 0) + (slitterCost || 0) + (surfaceTreatmentCost || 0);

  // SKU追加料金があれば計算
  const skuSurcharge = sku_info && sku_info.count > 1 ? (sku_info.count - 1) * 10000 : 0;

  return (
    <div className="space-y-4">
      {/* 原価内訳ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">💰 原価内訳</h3>
      </div>

      {/* 素材費 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-3">📦 素材費</h4>
        <div className="space-y-2 text-sm">
          {/* フィルム材料費 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">フィルム材料費</span>
            <span className="font-medium text-gray-900">¥{(materialCost || 0).toLocaleString()}</span>
          </div>

          {/* ラミネート費 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">ラミネート費</span>
            <span className="font-medium text-gray-900">¥{(laminationCost || 0).toLocaleString()}</span>
          </div>

          {/* スリッター費 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">スリッター費</span>
            <span className="font-medium text-gray-900">¥{(slitterCost || 0).toLocaleString()}</span>
          </div>

          {/* 表面処理費 */}
          {(surfaceTreatmentCost || 0) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">表面処理費</span>
              <span className="font-medium text-gray-900">¥{(surfaceTreatmentCost || 0).toLocaleString()}</span>
            </div>
          )}

          {/* 素材費合計 */}
          <div className="flex justify-between items-center pt-2 border-t border-green-300">
            <span className="font-semibold text-gray-900">素材費合計</span>
            <span className="font-semibold text-green-700">¥{(totalMaterialCost || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 加工費 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">🔧 加工費</h4>
        <div className="space-y-2 text-sm">
          {/* パウチ加工費 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">パウチ加工費</span>
            <span className="font-medium text-gray-900">¥{(pouchProcessingCost || 0).toLocaleString()}</span>
          </div>

          {/* 後加工乗数 */}
          {showFormula && (
            <div className="text-xs text-gray-500 italic">
              基本加工費（固定）× 後加工乗数
            </div>
          )}
        </div>
      </div>

      {/* 印刷費 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-800 mb-3">🖨️ 印刷費</h4>
        <div className="space-y-2 text-sm">
          {/* 基本印刷 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">基本印刷</span>
            <span className="font-medium text-gray-900">¥{(printingCost || 0).toLocaleString()}</span>
          </div>

          {showFormula && specifications && (
            <div className="text-xs text-gray-500 space-y-1">
              {specifications.printing && (
                <div>印刷方式: {specifications.printing}</div>
              )}
              {specifications.colors && (
                <div>色数: {specifications.colors}色</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SKU情報 */}
      {sku_info && sku_info.count > 1 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-indigo-800 mb-3">📊 SKU情報</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">SKU数</span>
              <span className="font-medium text-gray-900">{sku_info.count}SKU</span>
            </div>
            <div className="text-xs text-gray-600">
              数量: [{sku_info.quantities.join(', ')}] 合計: {sku_info.total}個
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-300">
              <span className="font-semibold text-gray-900">SKU追加料金</span>
              <span className="font-semibold text-indigo-700">¥{skuSurcharge.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 配送料 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-orange-800 mb-3">📦 配送料</h4>
        <div className="text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">配送料</span>
            <span className="font-medium text-gray-900">¥{(delivery || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* マージン・関税 */}
      {showFormula && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">📊 マージン・関税</h4>
          <div className="space-y-2 text-sm">
            {/* 製造者マージン */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">製造者マージン (40%)</span>
              <span className="font-medium text-gray-900">¥{(manufacturingMargin || 0).toLocaleString()}</span>
            </div>

            {/* 関税 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">関税 (5%)</span>
              <span className="font-medium text-gray-900">¥{(duty || 0).toLocaleString()}</span>
            </div>

            {/* 販売マージン */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">販売マージン (20%)</span>
              <span className="font-medium text-gray-900">¥{(salesMargin || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 合計 */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-white">💰 合計</span>
          <span className="text-lg font-bold text-white">
            ¥{((totalCost || 0) + skuSurcharge).toLocaleString()}
          </span>
        </div>
        {skuSurcharge > 0 && (
          <div className="text-xs text-gray-300 mt-1 text-right">
            (SKU追加料金込み: +¥{skuSurcharge.toLocaleString()})
          </div>
        )}
      </div>

      {/* 仕様情報 */}
      {specifications && Object.keys(specifications).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">📋 仕様情報</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {specifications.bag_type && (
              <div>
                <span className="text-gray-500">タイプ:</span>
                <span className="ml-1">{specifications.bag_type}</span>
              </div>
            )}
            {specifications.material && (
              <div>
                <span className="text-gray-500">素材:</span>
                <span className="ml-1">{specifications.material}</span>
              </div>
            )}
            {specifications.size && (
              <div className="col-span-2">
                <span className="text-gray-500">サイズ:</span>
                <span className="ml-1">{specifications.size}</span>
              </div>
            )}
            {specifications.printing && (
              <div>
                <span className="text-gray-500">印刷:</span>
                <span className="ml-1">{specifications.printing}</span>
              </div>
            )}
            {specifications.colors && (
              <div>
                <span className="text-gray-500">色数:</span>
                <span className="ml-1">{specifications.colors}色</span>
              </div>
            )}
            {specifications.zipper && (
              <div>
                <span className="text-gray-500">ジッパー:</span>
                <span className="ml-1">あり</span>
              </div>
            )}
            {specifications.spout && (
              <div>
                <span className="text-gray-500">スパウト:</span>
                <span className="ml-1">あり</span>
              </div>
            )}
            {specifications.post_processing && specifications.post_processing.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-500">後加工:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {specifications.post_processing.map((opt: string) => (
                    <span key={opt} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Export
// =====================================================

export default DetailedCostBreakdown;

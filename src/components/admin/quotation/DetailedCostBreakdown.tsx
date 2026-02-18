'use client';

/**
 * Detailed Cost Breakdown Component
 *
 * 管理者用詳細原価内訳表示コンポーネント
 * unified-pricing-engine.ts の breakdown データを表示
 */

import { Card } from '@/components/ui';
import { useState, useEffect } from 'react';

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
    // 基本情報
    bag_type?: string;
    bag_type_display?: string;
    material?: string;
    material_display?: string;
    material_specification?: string; // 詳細な素材仕様（各層の素材と厚み）
    weight_range?: string; // 重量範囲
    thickness?: string;
    thickness_display?: string;
    // サイズ
    size?: string;
    dimensions?: string;
    width?: number;
    height?: number;
    depth?: number;
    // 印刷
    printing?: string;
    printing_display?: string;
    printing_type?: string;
    colors?: number;
    isUVPrinting?: boolean;
    // 後加工
    post_processing?: string[];
    post_processing_display?: string[];
    zipper?: boolean;
    spout?: boolean;
    // その他
    urgency?: string;
    contents?: string;
    contentsType?: string;
    productCategory?: string;
    deliveryLocation?: string;
    distributionEnvironment?: string;
    sealWidth?: string;
    doubleSided?: boolean;
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
  const [exchangeRateKRWToJPY, setExchangeRateKRWToJPY] = useState<number>(0.14); // デフォルト: 1ウォン = 0.14円

  // 為替レートを取得
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          // 為替レートを検索 (KRW to JPY)
          const krwRate = data.data?.exchange_rate?.find((s: any) => s.key === 'krw_to_jpy');
          if (krwRate) {
            setExchangeRateKRWToJPY(parseFloat(krwRate.value) || 0.14);
          }
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };
    fetchExchangeRate();
  }, []);

  // 円をウォンに変換する関数
  const jpyToKrw = (jpy: number) => Math.round(jpy / exchangeRateKRWToJPY);

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

  // 素材費合計（フィルム＋ラミネート＋スリッター＋表面処理）- 円
  const totalMaterialCostJPY = (materialCost || 0) + (laminationCost || 0) + (slitterCost || 0) + (surfaceTreatmentCost || 0);

  // 製造業者支払額の計算（ウォン）
  // 配送料と関税は除外。販売マージン（自社の利益）も除外。
  // 各費用をウォンに変換して合計
  const manufacturerPaymentKRW =
    jpyToKrw(totalMaterialCostJPY) +           // 素材費（ウォン）
    jpyToKrw(pouchProcessingCost || 0) +        // 加工費（ウォン）
    jpyToKrw(printingCost || 0) +               // 印刷費（ウォン）
    jpyToKrw(manufacturingMargin || 0);         // 製造者マージン（ウォン）

  // 円換算（表示用）
  const manufacturerPaymentJPY = Math.round(manufacturerPaymentKRW * exchangeRateKRWToJPY);

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
            <span className="font-semibold text-green-700">¥{(totalMaterialCostJPY || 0).toLocaleString()}</span>
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
              {specifications.printing_display && (
                <div>印刷方式: {specifications.printing_display}</div>
              )}
              {specifications.colors && (
                <div>色数: {specifications.colors}</div>
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

      {/* 製造業者支払額 */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-emerald-100 mb-3">🏭 製造業者支払額</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center text-white">
            <span>素材費（ウォン）</span>
            <span className="font-medium">₩{jpyToKrw(totalMaterialCostJPY).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-white">
            <span>加工費（ウォン）</span>
            <span className="font-medium">₩{jpyToKrw(pouchProcessingCost || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-white">
            <span>印刷費（ウォン）</span>
            <span className="font-medium">₩{jpyToKrw(printingCost || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-white">
            <span>製造者マージン（ウォン）</span>
            <span className="font-medium">₩{jpyToKrw(manufacturingMargin || 0).toLocaleString()}</span>
          </div>
          <div className="border-t border-emerald-400 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100 text-sm">合計（円参考）</span>
              <span className="text-lg font-bold text-emerald-100">¥{manufacturerPaymentJPY.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-white font-semibold">合計（ウォン）</span>
              <span className="text-xl font-bold text-white">₩{manufacturerPaymentKRW.toLocaleString()}</span>
            </div>
            <div className="text-xs text-emerald-200 mt-2 text-right">
              為替レート: 1ウォン = ¥{exchangeRateKRWToJPY.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-400">
          <p className="text-xs text-emerald-100">
            ※ 製造業者支払額は「素材費 + 加工費 + 印刷費 + 製造者マージン」の合計です。
            <br />
            ※ 配送料と関税は除外されています。
            <br />
            ※ 販売マージン（自社の利益）は除外されています。
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Export
// =====================================================

export default DetailedCostBreakdown;

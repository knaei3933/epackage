'use client';

/**
 * Detailed Cost Breakdown Component
 *
 * Admin detailed cost breakdown display component.
 * Displays breakdown data from unified-pricing-engine.ts.
 *
 * Features:
 * - 5-Step Korea-Friendly Cost Breakdown (1-5)
 *   1. Raw Material Cost (each layer's weight x unit price)
 *   2. Printing Cost (from breakdown.printingCost)
 *   3. Post-processing Cost (lamination + slitter + pouch)
 *   4. Base Cost (from breakdown.baseCost with triple fallback)
 *   5. Manufacturer Margin (from breakdown.manufacturingMargin)
 * - Material Layer Details (full calculation formula)
 * - Margin/Tax Breakdown
 * - Manufacturer Payment Summary (in KRW)
 *
 * IMPORTANT: All baseCost references use fiveStep.baseCost from helper.
 * The helper uses triple fallback for baseCost:
 * 1. breakdown.baseCost (preferred)
 * 2. sum of components
 * 3. materialCost / 0.4 (legacy)
 *
 * See: src/lib/cost-breakdown-helpers.ts
 */

import { Card } from '@/components/ui';
import { useState, useEffect } from 'react';
import { calculateFiveStepBreakdown } from '@/lib/cost-breakdown-helpers';

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
    // 基本原価 (Korea-friendly display)
    baseCost?: number;
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
    // 各素材レイヤーの詳細（完全な計算情報）
    materialLayerDetails?: Array<{
      materialId: string;
      name: string;
      nameJa: string;
      thicknessMicron: number;
      density: number;
      unitPriceKRW: number;
      areaM2: number;
      meters: number;
      widthM: number;
      weightKg: number;
      costKRW: number;
      costJPY: number;
    }>;
    totalCostKRW?: number; // 総原価 (ウォン)
    costJPY?: number; // 原価 (円)
    totalWeight?: number; // 総重量 (kg)
    totalMeters?: number; // 総メートル数（ロス込み）
    materialWidthMM?: number; // 原料幅（mm）
    areaM2?: number; // 総面積（m²）
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
  showFormula = true  // デフォルトで計算式を表示
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

  // Calculate 5-step breakdown using helper
  // IMPORTANT: Use fiveStep.baseCost instead of local calculation
  const fiveStep = calculateFiveStepBreakdown(breakdown, filmCostDetails);

  // SKU追加料金があれば計算
  const skuSurcharge = sku_info && sku_info.count > 1 ? (sku_info.count - 1) * 10000 : 0;

  return (
    <div className="space-y-4">
      {/* 原価内訳ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">💰 原価内訳</h3>
      </div>

      {/* 基本原価の説明 */}
      {showFormula && fiveStep.baseCost > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">📊 基本原価（Base Cost）</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">基本原価</span>
              <span className="font-bold text-amber-900">¥{fiveStep.baseCost.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              ※ 各費用は基本原価にそれぞれの比率を掛けて算出されます
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 5-Step Korea-Friendly Cost Breakdown         */}
      {/* ============================================ */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <span className="text-lg">📊</span>
          5ステップコスト内訳（韓国顧客向け表示形式）
        </h4>

        {/* Step 1: Raw Material Cost */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">原材料費</h5>
              <p className="text-xs text-gray-600">各層の重量 × 単価の合計</p>
            </div>
            {fiveStep.rawMaterialCost.details.length > 0 ? (
              <span className="font-bold text-blue-900 shrink-0">₩{fiveStep.rawMaterialCost.totalKRW.toLocaleString()}</span>
            ) : (
              <span className="font-bold text-gray-400 shrink-0">データなし</span>
            )}
          </div>
          {fiveStep.rawMaterialCost.details.length > 0 ? (
            <div className="ml-8 bg-white rounded p-3 text-xs space-y-1">
              {fiveStep.rawMaterialCost.details.map((m, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{m.nameJa} {m.thicknessMicron}μm: {m.weightKg.toFixed(2)}kg x ₩{m.unitPriceKRW.toLocaleString()}/kg</span>
                  <span className="font-medium">₩{m.costKRW.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-8 bg-yellow-50 rounded p-3 text-xs text-yellow-700">
              ⚠️ フィルム原価詳細データがありません。再計算が必要です。
            </div>
          )}
        </div>

        {/* Step 2: Printing Cost */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">印刷費</h5>
              <p className="text-xs text-gray-600">
                {fiveStep.printingCost.formulaDetails?.unitPriceKRW
                  ? `₩${fiveStep.printingCost.formulaDetails.unitPriceKRW}/m² × 1m(固定) × ${fiveStep.printingCost.formulaDetails.totalMeters.toFixed(1)}m`
                  : '印刷費'}
              </p>
            </div>
            <span className="font-bold text-blue-900 shrink-0">₩{fiveStep.printingCost.costKRW.toLocaleString()}</span>
          </div>
          {/* 詳細計算式 */}
          {fiveStep.printingCost.costKRW > 0 && (
            <div className="ml-8 bg-white rounded p-2 text-xs text-gray-600">
              計算: {fiveStep.printingCost.formulaKRW}
            </div>
          )}
        </div>

        {/* Step 3: Post-processing Cost */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">後加工費</h5>
              <p className="text-xs text-gray-600">ラミネート + スリッター + 製袋加工 + 表面処理</p>
            </div>
            <span className="font-bold text-blue-900 shrink-0">₩{fiveStep.postProcessingCost.totalKRW.toLocaleString()}</span>
          </div>
          <div className="ml-8 bg-white rounded p-3 text-xs space-y-2">
            {/* ラミネート */}
            <div>
              <div className="flex justify-between">
                <span>ラミネート</span>
                <span className="font-medium">₩{fiveStep.postProcessingCost.laminationKRW.toLocaleString()}</span>
              </div>
              {fiveStep.postProcessingCost.laminationFormulaKRW && (
                <div className="text-xs text-gray-500 mt-1 pl-2">
                  {fiveStep.postProcessingCost.laminationFormulaKRW}
                </div>
              )}
            </div>
            {/* スリッター */}
            <div>
              <div className="flex justify-between">
                <span>スリッター</span>
                <span className="font-medium">₩{fiveStep.postProcessingCost.slitterKRW.toLocaleString()}</span>
              </div>
              {fiveStep.postProcessingCost.slitterFormulaKRW && (
                <div className="text-xs text-gray-500 mt-1 pl-2">
                  {fiveStep.postProcessingCost.slitterFormulaKRW}
                </div>
              )}
            </div>
            {/* 製袋加工 */}
            <div>
              <div className="flex justify-between">
                <span>製袋加工</span>
                <span className="font-medium">₩{fiveStep.postProcessingCost.pouchKRW.toLocaleString()}</span>
              </div>
              {fiveStep.postProcessingCost.pouchFormulaKRW && (
                <div className="text-xs text-gray-500 mt-1 pl-2">
                  {fiveStep.postProcessingCost.pouchFormulaKRW}
                </div>
              )}
            </div>
            {/* 表面処理 */}
            {fiveStep.postProcessingCost.surfaceTreatmentKRW > 0 && (
              <div>
                <div className="flex justify-between">
                  <span>表面処理</span>
                  <span className="font-medium">₩{fiveStep.postProcessingCost.surfaceTreatmentKRW.toLocaleString()}</span>
                </div>
                {fiveStep.postProcessingCost.surfaceTreatmentFormulaKRW && (
                  <div className="text-xs text-gray-500 mt-1 pl-2">
                    {fiveStep.postProcessingCost.surfaceTreatmentFormulaKRW}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="font-semibold">小計</span>
              <span className="font-semibold">₩{fiveStep.postProcessingCost.totalKRW.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Step 4: Base Cost */}
        <div className="mb-4 bg-amber-100 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">4</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">基礎原価</h5>
              <p className="text-xs text-gray-600">ステップ1 + ステップ2 + ステップ3</p>
            </div>
            <span className="font-bold text-lg text-amber-900 shrink-0">₩{fiveStep.baseCostKRW.toLocaleString()}</span>
          </div>
          <div className="ml-8 mt-2 text-xs text-gray-700">
            ₩{fiveStep.rawMaterialCost.totalKRW.toLocaleString()} + ₩{fiveStep.printingCost.costKRW.toLocaleString()} + ₩{fiveStep.postProcessingCost.totalKRW.toLocaleString()} = ₩{fiveStep.baseCostKRW.toLocaleString()}
          </div>
        </div>

        {/* Step 5: Manufacturer Margin */}
        <div className="bg-red-100 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">5</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">製造者マージン</h5>
              <p className="text-xs text-gray-600">基礎原価 × 40%</p>
            </div>
            <span className="font-bold text-lg text-red-900 shrink-0">₩{fiveStep.manufacturerMarginKRW.toLocaleString()}</span>
          </div>
          <div className="ml-8 mt-2 text-xs text-gray-700">
            ₩{fiveStep.baseCostKRW.toLocaleString()} × 40% = ₩{fiveStep.manufacturerMarginKRW.toLocaleString()}
          </div>
        </div>

        {/* Step 6: Total (Base Cost + Manufacturer Margin) */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">6</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">合計</h5>
              <p className="text-xs text-gray-600">基礎原価 + 製造者マージン</p>
            </div>
            <span className="font-bold text-xl text-purple-900 shrink-0">₩{(fiveStep.baseCostKRW + fiveStep.manufacturerMarginKRW).toLocaleString()}</span>
          </div>
          <div className="ml-8 mt-2 text-xs text-gray-700">
            ₩{fiveStep.baseCostKRW.toLocaleString()} + ₩{fiveStep.manufacturerMarginKRW.toLocaleString()} = ₩{(fiveStep.baseCostKRW + fiveStep.manufacturerMarginKRW).toLocaleString()}
          </div>
        </div>
      </div>
      {/* End 6-Step Korea-Friendly Cost Breakdown */}

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

    </div>
  );
}

// =====================================================
// Export
// =====================================================

export default DetailedCostBreakdown;

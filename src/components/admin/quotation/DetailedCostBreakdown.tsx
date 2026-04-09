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
    printing: number;
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
  // 実際の見積価格（小計）- 販売価格として使用
  quotationSubtotal?: number;
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
    spoutSize?: number; // スパウトサイズ（パイ）
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
    quantity?: number; // 製造数量
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
    breakdown?: {
      materials?: Array<{
        materialId: string;
        name: string;
        cost: number;
        weight: number;
      }>;
      printing?: {
        basic: number;
        matte: number;
        total: number;
      };
      lamination?: {
        count: number;
        cost: number;
      };
      slitter?: {
        calculated: number;
        final: number;
      };
      surfaceTreatment?: {
        type: 'glossy' | 'matte' | 'none';
        cost: number;
      };
    };
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
  quotationSubtotal,  // 実際の見積価格（小計）
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
    printing,
    manufacturingMargin,
    duty,
    delivery,
    salesMargin,
    totalCost
  } = breakdown;

  // Calculate 5-step breakdown using helper
  // IMPORTANT: Use fiveStep.baseCost instead of local calculation
  const fiveStep = calculateFiveStepBreakdown(breakdown, filmCostDetails, specifications, quotationSubtotal);

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
            <div className="ml-8 bg-white rounded p-3 text-xs space-y-2">
              {fiveStep.rawMaterialCost.details.map((m, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-1.5 last:mb-0">
                  {/* 素材名と原単価（メイン表示） */}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{m.nameJa} {m.thicknessMicron}μm</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      ₩{m.unitPriceKRW.toLocaleString()}/kg
                    </span>
                  </div>

                  {/* 計算詳細の全表示 */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                    <div>面積: {m.areaM2.toFixed(2)}m²</div>
                    <div>メートル: {m.meters.toFixed(1)}m</div>
                    <div>幅: {m.widthM.toFixed(3)}m</div>
                    <div>比重（密度）: {m.density} kg/m³</div>
                  </div>

                  {/* 重量計算式 */}
                  <div className="text-gray-700 bg-gray-50 p-2 rounded text-center">
                    <div className="text-gray-500 text-[10px] mb-1">重量計算</div>
                    {m.areaM2.toFixed(2)}m² × {m.thicknessMicron}μm × {m.density} / 1,000,000 × {m.meters.toFixed(1)}m
                  </div>

                  {/* 最終重量と費用 */}
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="font-medium text-gray-900">{m.weightKg.toFixed(2)}kg × ₩{m.unitPriceKRW.toLocaleString()}/kg</span>
                    <span className="font-bold text-gray-900">= ₩{m.costKRW.toLocaleString()}</span>
                  </div>
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
            <div className="ml-8 bg-white rounded p-2 text-xs text-gray-600 space-y-1">
              <div>基本印刷費: {fiveStep.printingCost.formulaKRW}</div>
              {/* マット印刷追加費 */}
              {filmCostDetails?.breakdown?.printing?.matte && (
                <div className="border-t pt-1 mt-1">
                  <div className="flex justify-between items-center">
                    <span>マット仕上げ追加費</span>
                    <span className="font-medium">₩{filmCostDetails.breakdown.printing.matte.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    原反幅 {((filmCostDetails.materialWidthMM || 590) / 1000).toFixed(2)}m × {filmCostDetails.totalMeters?.toFixed(1)}m × ₩40/m = ₩{filmCostDetails.breakdown.printing.matte.toLocaleString()}
                  </div>
                </div>
              )}
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
              <p className="text-xs text-gray-600">基礎原価 × {fiveStep.manufacturerMarginRate}</p>
            </div>
            <span className="font-bold text-lg text-red-900 shrink-0">₩{fiveStep.manufacturerMarginKRW.toLocaleString()}</span>
          </div>
          <div className="ml-8 mt-2 text-xs text-gray-700">
            ₩{fiveStep.baseCostKRW.toLocaleString()} × {fiveStep.manufacturerMarginRate} = ₩{fiveStep.manufacturerMarginKRW.toLocaleString()}
          </div>
        </div>

        {/* Step 6: Manufacturing Cost (製造業原価) */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">6</span>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900">製造業原価</h5>
              <p className="text-xs text-gray-600">基礎原価 + 製造者マージン</p>
            </div>
            <span className="font-bold text-xl text-purple-900 shrink-0">₩{fiveStep.manufacturingCost.totalKRW.toLocaleString()}</span>
          </div>
          <div className="ml-8 mt-2 text-xs text-gray-700">
            ₩{fiveStep.baseCostKRW.toLocaleString()} + ₩{fiveStep.manufacturerMarginKRW.toLocaleString()} = ₩{fiveStep.manufacturingCost.totalKRW.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Additional Costs (追加費用)                   */}
      {/* ============================================ */}
      {(fiveStep.additionalCosts.duty > 0 || fiveStep.additionalCosts.delivery > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📦</span>
            追加費用
          </h4>
          <div className="space-y-2 text-sm">
            {fiveStep.additionalCosts.duty > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">関税</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">¥{fiveStep.additionalCosts.duty.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.additionalCosts.dutyKRW.toLocaleString()})</span>
                </div>
              </div>
            )}
            {fiveStep.additionalCosts.delivery > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">配送料</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">¥{fiveStep.additionalCosts.delivery.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.additionalCosts.deliveryKRW.toLocaleString()})</span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-orange-300">
              <span className="font-semibold text-gray-900">追加費用合計</span>
              <div className="text-right">
                <span className="font-semibold text-orange-700">¥{fiveStep.additionalCosts.totalJPY.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.additionalCosts.totalKRW.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Total Cost (総原価)                           */}
      {/* ============================================ */}
      {fiveStep.totalCost && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🏗️</span>
            総原価（製造業原価 + 追加費用）
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">製造業原価</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">₩{fiveStep.manufacturingCost?.totalKRW?.toLocaleString() || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">追加費用</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">₩{fiveStep.additionalCosts?.totalKRW?.toLocaleString() || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-300">
              <span className="font-bold text-gray-900">総原価</span>
              <div className="text-right">
                <span className="font-bold text-lg text-green-700">₩{fiveStep.totalCost?.totalKRW?.toLocaleString() || 0}</span>
                <span className="text-xs text-gray-500 ml-2">(¥{fiveStep.totalCost?.totalJPY?.toLocaleString() || 0})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Sales Price & Profit (販売価格と利益)          */}
      {/* ============================================ */}
      {fiveStep.salesAndProfit && fiveStep.salesAndProfit.salesPrice > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💰</span>
            販売価格と利益
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">総原価</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">¥{fiveStep.totalCost?.totalJPY?.toLocaleString() || 0}</span>
                <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.totalCost?.totalKRW?.toLocaleString() || 0})</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">基準販売マージン ({fiveStep.salesAndProfit?.salesMarginRate || '20%'})</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">¥{fiveStep.salesAndProfit?.salesMargin?.toLocaleString() || 0}</span>
                <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.salesAndProfit?.salesMarginKRW?.toLocaleString() || 0})</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">計算上の販売価格</span>
              <div className="text-right">
                <span className="font-medium text-gray-600">¥{fiveStep.salesAndProfit?.calculatedPrice?.toLocaleString() || 0}</span>
                <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.salesAndProfit?.calculatedPriceKRW?.toLocaleString() || 0})</span>
              </div>
            </div>
            {/* 価格調整がある場合 */}
            {(fiveStep.salesAndProfit?.priceAdjustment || 0) !== 0 && (
              <div className="flex justify-between items-center bg-amber-50 rounded p-2">
                <span className="text-amber-800">価格調整</span>
                <div className="text-right">
                  <span className={`font-medium ${(fiveStep.salesAndProfit?.priceAdjustment || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(fiveStep.salesAndProfit?.priceAdjustment || 0) > 0 ? '+' : ''}¥{(fiveStep.salesAndProfit?.priceAdjustment || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(fiveStep.salesAndProfit?.priceAdjustmentKRW || 0) > 0 ? '+' : ''}₩{(fiveStep.salesAndProfit?.priceAdjustmentKRW || 0).toLocaleString()})
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-indigo-300">
              <span className="font-bold text-gray-900">実際の販売価格</span>
              <div className="text-right">
                <span className="font-bold text-lg text-indigo-700">¥{fiveStep.salesAndProfit?.salesPrice?.toLocaleString() || 0}</span>
                <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.salesAndProfit?.salesPriceKRW?.toLocaleString() || 0})</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-indigo-300 bg-indigo-100 rounded p-2">
              <div>
                <span className="font-bold text-indigo-900">📈 利益</span>
                <span className="text-xs text-indigo-700 ml-2">(実際のマージン率: {fiveStep.salesAndProfit?.actualMarginRate || '0%'})</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg text-indigo-900">¥{fiveStep.salesAndProfit?.profit?.toLocaleString() || 0}</span>
                <span className="text-xs text-gray-500 ml-2">(₩{fiveStep.salesAndProfit?.profitKRW?.toLocaleString() || 0})</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              ※ 利益率: {fiveStep.salesAndProfit?.profitRate || '0%'} = 利益 ÷ 販売価格
            </div>
          </div>
        </div>
      )}
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

    </div>
  );
}

// =====================================================
// Export
// =====================================================

export default DetailedCostBreakdown;

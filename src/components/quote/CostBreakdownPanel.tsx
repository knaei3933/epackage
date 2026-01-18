'use client';

import React from 'react';
import { Receipt } from 'lucide-react';

/**
 * Cost breakdown data structure
 */
export interface CostBreakdownData {
  materials: number;
  processing: number;
  printing: number;
  duty: number;
  delivery: number;
}

/**
 * SKU-specific cost breakdown
 */
export interface SKUCostBreakdown {
  skuIndex: number;
  quantity: number;
  totalMeters: number;
  filmWidth: number;
  columns: 1 | 2;
  materialWeight: number;
  materialCost: number;
  printingCost: number;
  laminationCost: number;
  slitterCost: number;
  pouchProcessCost: number;
  subtotal: number;
  withDuty: number;
  costJPY: number;
}

/**
 * Full cost breakdown result from Korean cost calculator
 */
export interface KoreaCostResult {
  costPerSKU: SKUCostBreakdown[];
  totalCost: {
    materials: number;
    processing: number;
    printing: number;
    duty: number;
    subtotal: number;
    totalJPY: number;
  };
  delivery: {
    totalWeight: number;
    boxes: number;
    cost: number;
    costJPY: number;
  };
}

/**
 * Props for CostBreakdownPanel
 */
interface CostBreakdownPanelProps {
  costBreakdown: KoreaCostResult;
  markedUpPrice: number;
  marginRate?: number; // Default 0.5 (50%)
}

/**
 * Admin-only cost breakdown panel component
 *
 * IMPORTANT: This component should only be rendered for admin users!
 * It displays detailed cost information that should NOT be visible to customers.
 *
 * Features:
 * - SKU-specific cost breakdown (materials, processing, printing, etc.)
 * - Total cost aggregation
 * - Delivery cost calculation
 * - Margin display (50% default)
 * - Final price calculation
 */
export function CostBreakdownPanel({
  costBreakdown,
  markedUpPrice,
  marginRate = 0.5
}: CostBreakdownPanelProps) {
  // Calculate base cost (including delivery)
  const baseCost = costBreakdown.totalCost.totalJPY + costBreakdown.delivery.costJPY;
  const margin = markedUpPrice - baseCost;
  const actualMarginRate = margin / baseCost;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">
          ⚠️ 管理者専用: 原価詳細
        </h3>
      </div>

      {/* SKU別原価内訳 */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-gray-800">SKU別原価内訳</h4>
        <div className="space-y-3">
          {costBreakdown.costPerSKU.map((sku) => (
            <div key={sku.skuIndex} className="bg-gray-50 p-4 rounded-lg border">
              <div className="font-medium text-gray-900 mb-2">
                SKU {sku.skuIndex + 1}: {sku.quantity.toLocaleString()}個
              </div>

              {/* フィルム情報 */}
              <div className="text-xs text-gray-600 mb-2 space-y-1">
                <div>• フィルム使用量: {sku.totalMeters.toLocaleString()}m</div>
                <div>• フィルム幅: {sku.filmWidth}mm ({sku.columns}列)</div>
                <div>• 重量: {sku.materialWeight.toFixed(1)}kg</div>
              </div>

              {/* 原価内訳 */}
              <div className="text-xs space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <span>材料費:</span>
                  <span>¥{Math.round(sku.materialCost * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>印刷費:</span>
                  <span>¥{Math.round(sku.printingCost * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>加工費:</span>
                  <span>¥{Math.round((sku.laminationCost + sku.slitterCost + sku.pouchProcessCost) * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>関税5%:</span>
                  <span>¥{Math.round((sku.withDuty - sku.subtotal) * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1 mt-1">
                  <span>原価小計:</span>
                  <span>¥{Math.round(sku.costJPY).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 総原価 */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3 text-gray-800">総原価計算</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>材料費合計:</span>
            <span>¥{Math.round(costBreakdown.totalCost.materials * 0.12).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>加工費合計:</span>
            <span>¥{Math.round(costBreakdown.totalCost.processing * 0.12).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>印刷費合計:</span>
            <span>¥{Math.round(costBreakdown.totalCost.printing * 0.12).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>関税:</span>
            <span>¥{Math.round(costBreakdown.totalCost.duty * 0.12).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>配送料:</span>
            <span>¥{costBreakdown.delivery.costJPY.toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-2">
              ({costBreakdown.delivery.boxes}箱 × {costBreakdown.delivery.totalWeight.toFixed(1)}kg)
            </span>
          </div>
        </div>

        {/* マージンと最終価格 */}
        <div className="border-t mt-4 pt-4 space-y-3">
          <div className="flex justify-between font-medium text-gray-800">
            <span>原価合計:</span>
            <span>¥{Math.round(baseCost).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600 font-medium">
            <span>マージン（{(actualMarginRate * 100).toFixed(1)}%）:</span>
            <span>¥{Math.round(margin).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 mt-2 pt-2 border-t">
            <span>販売価格:</span>
            <span>¥{Math.round(markedUpPrice).toLocaleString()}</span>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <strong>注意:</strong> この情報は管理者専用です。顧客には絶対に表示しないでください。
          顧客には最終販売価格のみ表示されます。
        </div>
      </div>
    </div>
  );
}

/**
 * Export default component
 */
export default CostBreakdownPanel;

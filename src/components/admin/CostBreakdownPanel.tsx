'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

/**
 * Cost breakdown types
 */
interface SKUCostBreakdown {
  materialCost: number;
  printingCost: number;
  laminationCost: number;
  slitterCost: number;
  pouchProcessingCost: number;
  duty: number;
  delivery: number;
  totalCost: number;
}

interface SKUDetails {
  skuIndex: number;
  skuCode?: string;
  quantity: number;
  theoreticalMeters?: number;
  securedMeters?: number;
  lossMeters?: number;
  totalMeters?: number;
  costBreakdown: SKUCostBreakdown;
}

interface CostBreakdownResponse {
  quotation: {
    id: string;
    quotationNumber: string;
    skuCount: number;
    totalMeters?: number;
    lossMeters?: number;
    totalPrice: number;
  };
  totalCost: number;
  totalPrice: number;
  profit: number;
  profitMargin: number;
  skus: SKUDetails[];
  summary?: SKUCostBreakdown | null;
}

interface CostBreakdownPanelProps {
  quotationId: string;
  quotationNumber?: string;
}

/**
 * Admin Cost Breakdown Panel Component
 *
 * Displays detailed cost breakdown for a quotation including:
 * - Total cost vs. selling price
 * - Profit calculation
 * - SKU-level cost details
 * - Material, printing, processing, duty, delivery costs
 */
export function CostBreakdownPanel({ quotationId, quotationNumber }: CostBreakdownPanelProps) {
  const [breakdown, setBreakdown] = useState<CostBreakdownResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSKU, setExpandedSKU] = useState<number | null>(null);

  const fetchCostBreakdown = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/quotations/${quotationId}/cost-breakdown`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cost breakdown');
      }
      const data = await response.json();
      setBreakdown(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostBreakdown();
  }, [quotationId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <div>
            <h3 className="font-medium text-red-800">エラーが発生しました</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={fetchCostBreakdown}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600 text-center">原価データがありません</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const profitClass = breakdown.profit >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-purple-600" />
          原価内訳
        </h3>
        <button
          onClick={fetchCostBreakdown}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="更新"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">総原価</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(breakdown.totalCost)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="text-sm text-purple-700 mb-1">販売価格</div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(breakdown.totalPrice)}
          </div>
        </div>

        <div className={`bg-gradient-to-br ${breakdown.profit >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} rounded-xl p-4 border ${breakdown.profit >= 0 ? 'border-green-200' : 'border-red-200'}`}>
          <div className={`text-sm ${breakdown.profit >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>
            利益
          </div>
          <div className={`text-2xl font-bold ${profitClass}`}>
            {formatCurrency(breakdown.profit)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
          <div className="text-sm text-indigo-700 mb-1">利益率</div>
          <div className="text-2xl font-bold text-indigo-900">
            {breakdown.profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* SKU Details */}
      {breakdown.skus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-600" />
              SKU別原価詳細 ({breakdown.skus.length} SKU)
            </h4>
          </div>

          <div className="divide-y divide-gray-200">
            {breakdown.skus.map((sku) => (
              <div key={sku.skuIndex} className="p-6">
                {/* SKU Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedSKU(expandedSKU === sku.skuIndex ? null : sku.skuIndex)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="font-bold text-purple-700">{sku.skuIndex + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {sku.skuCode || `SKU #${sku.skuIndex + 1}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        数量: {sku.quantity.toLocaleString()}個
                      </div>
                    </div>
                  </div>
                  {expandedSKU === sku.skuIndex ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Expanded Content */}
                {expandedSKU === sku.skuIndex && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Meter Information */}
                    {(sku.theoreticalMeters !== undefined ||
                      sku.securedMeters !== undefined ||
                      sku.lossMeters !== undefined) && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-3">メートル計算</h5>
                        <dl className="space-y-2 text-sm">
                          {sku.theoreticalMeters !== undefined && (
                            <div className="flex justify-between">
                              <dt className="text-blue-700">理論メートル:</dt>
                              <dd className="font-medium text-blue-900">
                                {sku.theoreticalMeters.toFixed(1)}m
                              </dd>
                            </div>
                          )}
                          {sku.securedMeters !== undefined && (
                            <div className="flex justify-between">
                              <dt className="text-blue-700">確保量:</dt>
                              <dd className="font-medium text-blue-900">
                                {sku.securedMeters.toFixed(1)}m
                              </dd>
                            </div>
                          )}
                          {sku.lossMeters !== undefined && (
                            <div className="flex justify-between">
                              <dt className="text-blue-700">ロス:</dt>
                              <dd className="font-medium text-orange-900">
                                {sku.lossMeters.toFixed(1)}m
                              </dd>
                            </div>
                          )}
                          {sku.totalMeters !== undefined && (
                            <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                              <dt className="text-blue-900 font-medium">総量:</dt>
                              <dd className="font-bold text-blue-900">
                                {sku.totalMeters.toFixed(1)}m
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">費用明細</h5>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">材料費:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.materialCost)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">印刷費:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.printingCost)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">ラミネート費:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.laminationCost)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">スリッター費:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.slitterCost)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">袋加工費:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.pouchProcessingCost)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">関税:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.duty)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">配送料:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatCurrency(sku.costBreakdown.delivery)}
                          </dd>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                          <dt className="text-gray-900 font-medium">小計:</dt>
                          <dd className="font-bold text-gray-900">
                            {formatCurrency(sku.costBreakdown.totalCost)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(breakdown, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cost-breakdown-${quotationNumber || quotationId}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          JSONダウンロード
        </button>
      </div>
    </div>
  );
}

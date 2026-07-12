/**
 * Price comparison and display section for ResultStep.
 */

import type React from 'react';
import { BarChart3 } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import CostBreakdownPanel from '../../shared/CostBreakdownPanel';
import MultiQuantityComparisonTable from '../../shared/MultiQuantityComparisonTable';
import { ParallelProductionOptions } from '../../shared';
import type { ParallelProductionOption } from '../../shared';
import type { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import type { MultiQuantityResult } from '@/types/multi-quantity';

// Use the actual QuoteState type from QuoteContext for full compatibility
import type { QuoteState } from '@/contexts/QuoteContext';

interface MultiQuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  recommendedMethod?: string;
  patternTotalQuantity?: number;
}

type PatternMultiQuantityResult = {
  calculations: Map<number, UnifiedQuoteResult & {
    recommendation: {
      method: 'digital' | 'gravure';
      resolvedMethod: string;
      breakevenQuantity: number;
      digitalTotalPrice: number;
      gravureTotalPrice: number;
      reason: string;
    };
  } & {
    patternTotalQuantity: number;
  }>;
} | null;

interface PriceComparisonSectionProps {
  showPatternComparison: boolean;
  multiQuantityResult: PatternMultiQuantityResult;
  state: QuoteState;
  result: UnifiedQuoteResult;
  isAdmin: boolean;
  multiQuantityState: { comparison: MultiQuantityResult['comparison'] | null };
  setSelectedQuantity: (quantity: number) => void;
  multiQuantityQuotes: MultiQuantityQuote[];
  parallelProductionOptions: ParallelProductionOption[];
}

export function PriceComparisonSection({
  showPatternComparison,
  multiQuantityResult,
  state,
  result,
  isAdmin,
  multiQuantityState,
  setSelectedQuantity,
  multiQuantityQuotes,
  parallelProductionOptions,
}: PriceComparisonSectionProps) {
  return (
    <>
      {/* C4: 数量パターン比較表（最安ハイライト・AC-7/AC-8） */}
      {showPatternComparison && multiQuantityResult?.calculations && (() => {
        const rows = Array.from(multiQuantityResult.calculations.entries())
          .map(([patternIdx, calc]) => {
            const actualQuantity = calc.patternTotalQuantity ?? 0;
            return {
              patternIdx,
              actualQuantity,
              totalPrice: calc.totalPrice,
              unitPrice: calc.unitPrice,
              method: calc.recommendation?.method,
            };
          })
          .sort((a, b) => a.actualQuantity - b.actualQuantity);

        const minUnitPrice = Math.min(...rows.map(r => r.unitPrice));

        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">数量パターン比較表</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-600">
                    <th className="text-left py-2 px-3">数量合計</th>
                    <th className="text-right py-2 px-3">単価</th>
                    <th className="text-right py-2 px-3">総額（税別）</th>
                    <th className="text-center py-2 px-3">推奨方式</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isCheapest = row.unitPrice === minUnitPrice;
                    return (
                      <tr
                        key={row.patternIdx}
                        className={`border-b border-gray-100 ${isCheapest ? 'bg-green-50' : ''}`}
                      >
                        <td className="py-2 px-3 font-medium text-gray-900">
                          {row.actualQuantity.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '枚'}
                          {isCheapest && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              最安
                            </span>
                          )}
                        </td>
                        <td className={`text-right py-2 px-3 ${isCheapest ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                          ¥{formatPrice(row.unitPrice)}
                        </td>
                        <td className="text-right py-2 px-3 text-gray-700">
                          ¥{Math.round(row.totalPrice).toLocaleString()}
                        </td>
                        <td className="text-center py-2 px-3">
                          {row.method ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              row.method === 'gravure'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {row.method === 'gravure' ? 'グラビア' : 'デジタル'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※ 単価最安のパターンをハイライト。グラビアは分岐点以上の数量で単価が下がります。
            </p>
          </div>
        );
      })()}

      {/* Price Display（複数パターンビューでは非表示・比較表で代替） */}
      {!showPatternComparison && (
        <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-8 rounded-xl text-center">
          <div className="text-sm font-medium mb-2">合計金額（税別）</div>
          {(() => {
            const roundedTotal = Math.ceil(result.totalPrice / 100) * 100;
            return (
              <>
                <div className="text-4xl font-bold mb-4">
                  ¥{roundedTotal.toLocaleString()}
                </div>
                <div className="text-sm opacity-90">
                  単価: ¥{formatPrice(result.unitPrice)}/{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Admin-only cost breakdown */}
      {isAdmin && result.skuCostDetails && (
       <CostBreakdownPanel
         costBreakdown={result.skuCostDetails as unknown as React.ComponentProps<typeof CostBreakdownPanel>['costBreakdown']}
         markedUpPrice={result.totalPrice}
          marginRate={0.5}
          exchangeRate={result.skuCostDetails?.costPerSKU?.[0]?.costBreakdown?.exchangeRate}
       />
      )}

      {/* Multi-Quantity Comparison Results */}
      {multiQuantityState.comparison && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-navy-600" />
              数量比較分析結果
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-xs text-gray-500">最適数量</p>
                <p className="text-lg font-bold text-success-600">
                  {multiQuantityState.comparison.bestValue.quantity.toLocaleString()}個
                </p>
              </div>
              <div className="text-center p-4 bg-info-50 rounded-lg">
                <p className="text-xs text-gray-500">最大節約</p>
                <p className="text-lg font-bold text-info-600">
                  {multiQuantityState.comparison.bestValue.percentage}%
                </p>
              </div>
              <div className="text-center p-4 bg-brixa-primary-50 rounded-lg">
                <p className="text-xs text-gray-500">効率性改善</p>
                <p className="text-lg font-bold text-brixa-primary-600">
                  {multiQuantityState.comparison.trends.optimalQuantity.toLocaleString()}個
                </p>
              </div>
              <div className="text-center p-4 bg-warning-50 rounded-lg">
                <p className="text-xs text-gray-500">価格トレンド</p>
                <p className="text-lg font-bold text-warning-600">
                  {multiQuantityState.comparison.trends.priceTrend === 'decreasing' ? '低下' :
                   multiQuantityState.comparison.trends.priceTrend === 'increasing' ? '上昇' : '安定'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">数量比較詳細</h4>
              <MultiQuantityComparisonTable
                quotes={Object.entries(multiQuantityState.comparison!.economiesOfScale).map(([quantity, data]) => ({
                  quantity: parseInt(quantity),
                  unitPrice: (data as { unitPrice: number }).unitPrice,
                  totalPrice: (data as { unitPrice: number }).unitPrice * parseInt(quantity),
                  discountRate: Math.round((1 - (data as { efficiency: number }).efficiency / 100) * 100),
                  priceBreak: multiQuantityState.comparison!.priceBreaks.find(pb => pb.quantity === parseInt(quantity))?.priceBreak || '通常',
                  leadTimeDays: result.leadTimeDays,
                  isValid: true
                }))}
                comparison={multiQuantityState.comparison!}
                selectedQuantity={state.quantity}
                onQuantitySelect={(quantity) => setSelectedQuantity(quantity)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSimulation } from './SimulationContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Calculator,
  Share2,
  BarChart3,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface ComparisonData {
  bestQuantity: number;
  bestUnitPrice: number;
  economyRate: number;
  recommendations: string[];
}

interface DetailedResult {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountFactor?: number;
  isBest?: boolean;
  savingPercentage?: number;
}

interface StepThreeProps {
  onPrevious?: () => void;
  onReset?: () => void;
}

export function StepThree({ onPrevious, onReset }: StepThreeProps) {
  const {
    state,
    isLoading,
    currentStep,
    previousStep
  } = useSimulation();

  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastCalculationTime, setLastCalculationTime] = useState<number | null>(null);
  const [showDetailedComparison, setShowDetailedComparison] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // API Call
  const fetchQuotationData = useCallback(async () => {
    if (!state.width || !state.height || !state.materialGenre ||
      !state.surfaceMaterial || state.quantities.length === 0) {
      return;
    }

    try {
      setApiError(null);
      const startTime = performance.now();

      const response = await fetch('/api/quotation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state,
          deliveryDate: state.deliveryDate?.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('見積計算に失敗しました。');
      }

      const data = await response.json();
      const endTime = performance.now();

      setLastCalculationTime(Math.round(endTime - startTime));
      setFromCache(data.metadata?.fromCache || false);

      if (data.success && data.data) {
        const bestUnitPrice = data.data.comparison.bestUnitPrice;
        const detailed = data.data.results.map((result: {
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          discountFactor?: number;
          deliveryTime?: number;
        }) => {
          const isBest = result.unitPrice === bestUnitPrice;
          const highestPrice = Math.max(...data.data.results.map((r: typeof result) => r.unitPrice));
          const savingPercentage = isBest ?
            ((highestPrice - result.unitPrice) / highestPrice * 100) :
            ((highestPrice - result.unitPrice) / highestPrice * 100);

          return {
            ...result,
            isBest,
            savingPercentage: Math.round(savingPercentage * 10) / 10,
          };
        });

        setDetailedResults(detailed);
        setComparison(data.data.comparison);
      } else {
        throw new Error(data.error?.message || 'データ処理中にエラーが発生しました。');
      }
    } catch (err) {
      console.error('Quotation fetch error:', err);
      setApiError(err instanceof Error ? err.message : '見積り計算中にエラーが発生しました。');
      setDetailedResults([]);
      setComparison(null);
    }
  }, [state]);

  useEffect(() => {
    if (currentStep === 3) {
      fetchQuotationData();
    }
  }, [currentStep, fetchQuotationData]);

  const downloadPDF = useCallback(async () => {
    if (!comparison || detailedResults.length === 0) return;

    setPdfLoading(true);
    try {
      const response = await fetch('/api/quotation/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationData: state,
          results: detailedResults,
          comparison,
          customerInfo: {
            companyName: 'テスト株式会社',
            contactName: '山田 太郎',
            email: 'test@example.com',
            phone: '03-1234-5678',
          },
        }),
      });

      if (!response.ok) throw new Error('PDF生成に失敗しました。');

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `quotation_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);

    } catch (err) {
      console.error('PDF download error:', err);
      alert(err instanceof Error ? err.message : 'PDFダウンロードに失敗しました。');
    } finally {
      setPdfLoading(false);
    }
  }, [state, comparison, detailedResults]);

  const shareQuotation = useCallback(async () => {
    const shareData = {
      title: 'Epackage Lab お見積り',
      text: `最適な数量: ${comparison?.bestQuantity.toLocaleString()}個 / 最大節約率: ${comparison?.economyRate.toFixed(1)}%`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`Epackage Lab お見積り\n${shareData.text}\n${shareData.url}`);
        alert('見積り情報をクリップボードにコピーしました。');
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  }, [comparison]);

  if (isLoading && detailedResults.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">お見積り結果</h2>
        <LoadingSkeleton />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">お見積り結果</h2>
        <GlassCard className="p-4 border-red-200 bg-red-50/50">
          <div className="flex items-center space-x-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">見積り計算エラー</h3>
              <p className="text-xs mt-1">{apiError}</p>
              <Button onClick={fetchQuotationData} variant="outline" size="sm" className="mt-2 text-xs h-8">
                再試行
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (detailedResults.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">お見積り結果</h2>
        <GlassCard className="p-8 text-center text-gray-500">
          <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-base font-medium">見積り結果がありません</p>
          <p className="text-xs mt-1">前に戻って仕様を確認してください。</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <MotionWrapper className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">お見積り結果</h2>
        <div className="flex space-x-2">
          {fromCache && (
            <Badge variant="secondary" className="text-[10px] bg-navy-600 text-navy-600 border-navy-600 px-2 py-0.5">
              ⚡ キャッシュ
            </Badge>
          )}
          {comparison?.economyRate && comparison.economyRate > 10 && (
            <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-2 py-0.5">
              <TrendingUp className="h-3 w-3 mr-1" />
              最大節約率: {comparison.economyRate.toFixed(1)}%
            </Badge>
          )}
        </div>
      </div>

      {/* Best Plan Card */}
      {comparison && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="bg-gradient-to-r from-navy-700 to-indigo-700 rounded-xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-8 -mb-8 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <div className="bg-white/20 p-1.5 rounded-full mr-2">
                    <CheckCircle className="h-5 w-5 text-emerald-300" />
                  </div>
                  AI おすすめプラン
                </h3>
                <div className="space-y-3 text-navy-50">
                  <div className="flex items-baseline gap-3">
                    <span className="w-24 font-medium opacity-80 text-xs uppercase tracking-wider">最もお得な数量</span>
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {comparison.bestQuantity.toLocaleString()}
                      <span className="text-sm font-normal ml-1 opacity-70">個</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="w-24 font-medium opacity-80 text-xs uppercase tracking-wider">最適単価</span>
                    <span className="text-3xl font-bold text-emerald-300 tracking-tight">
                      ¥{comparison.bestUnitPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 shadow-inner min-w-[160px]">
                {comparison.economyRate > 0 && (
                  <div className="text-3xl font-bold text-emerald-300 mb-1">
                    {comparison.economyRate.toFixed(1)}%
                  </div>
                )}
                <p className="text-xs text-navy-600 font-medium uppercase tracking-wider">OFF (最大節約率)</p>
              </div>
            </div>

            {comparison.recommendations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                <h4 className="font-medium text-[10px] text-navy-600 mb-2 uppercase tracking-wider">おすすめポイント</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {comparison.recommendations.map((rec, index) => (
                    <li key={index} className="text-xs text-white flex items-start">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-300 mr-1.5 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Comparison Table */}
      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            価格比較表
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider bg-gray-50/30">数量</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider bg-gray-50/30">単価</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider bg-gray-50/30">合計価格</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider bg-gray-50/30">節約率</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider bg-gray-50/30">判定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailedResults.map((result, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`hover:bg-gray-50/80 transition-colors ${result.isBest ? 'bg-navy-50/30' : ''}`}
                >
                  <td className="py-3 px-4 font-medium text-slate-900 text-sm">
                    {result.quantity.toLocaleString()}個
                  </td>
                  <td className="text-right py-3 px-4 text-slate-700 text-sm">
                    ¥{result.unitPrice.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-bold text-slate-900 text-sm">
                    ¥{result.totalPrice.toLocaleString()}
                  </td>
                  <td className="text-center py-3 px-4">
                    {result.savingPercentage && result.savingPercentage > 0 ? (
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {result.savingPercentage.toFixed(1)}%
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {result.isBest && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-navy-600 text-navy-600 text-[10px] font-bold shadow-sm border border-navy-600">
                        最適プラン
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={downloadPDF}
          disabled={pdfLoading}
          variant="primary"
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-10 text-sm"
        >
          {pdfLoading ? (
            <>
              <div className="animate-spin h-3 w-3 mr-2 border-2 border-white border-t-transparent rounded-full" />
              PDF生成中...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 mr-2" />
              PDF見積書をダウンロード
            </>
          )}
        </Button>

        <Button
          onClick={shareQuotation}
          variant="outline"
          className="flex-1 h-10 text-sm hover:bg-gray-50"
        >
          <Share2 className="h-3.5 w-3.5 mr-2" />
          共有
        </Button>

        <Button
          onClick={onPrevious || previousStep}
          variant="outline"
          className="h-10 text-sm hover:bg-gray-50"
        >
          仕様を修正
        </Button>

        <Button
          onClick={onReset}
          variant="ghost"
          className="text-slate-500 hover:text-slate-700 h-10 text-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          新規
        </Button>
      </div>

      {/* Specs Summary */}
      <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200 text-xs text-slate-500">
        <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2 text-[10px]">
          <FileText className="h-3 w-3" />
          見積り条件
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-3 gap-x-6">
          <div><span className="block text-slate-400 mb-0.5 text-[10px] uppercase">袋タイプ</span><span className="font-medium text-slate-700">{state.bagType.replace('_', ' ')}</span></div>
          <div><span className="block text-slate-400 mb-0.5 text-[10px] uppercase">サイズ</span><span className="font-medium text-slate-700">{state.width}×{state.height}mm</span></div>
          <div><span className="block text-slate-400 mb-0.5 text-[10px] uppercase">素材</span><span className="font-medium text-slate-700">{state.materialGenre}</span></div>
          <div><span className="block text-slate-400 mb-0.5 text-[10px] uppercase">表面</span><span className="font-medium text-slate-700">{state.surfaceMaterial}</span></div>
          <div><span className="block text-slate-400 mb-0.5 text-[10px] uppercase">内容物</span><span className="font-medium text-slate-700">{state.contentsType}</span></div>
          <div><span className="block text-slate-400 mb-0.5 text-[10px] uppercase">注文種別</span><span className="font-medium text-slate-700">{state.orderType === 'new' ? '新規' : 'リピート'}</span></div>
        </div>
      </div>
    </MotionWrapper>
  );
}
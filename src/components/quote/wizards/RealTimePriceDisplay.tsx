import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, X } from 'lucide-react';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { unifiedPricingEngine } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';


export function RealTimePriceDisplay() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const state = useQuoteState();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'increase' | 'decrease' | 'stable'>('stable');
  const [quantityQuotes, setQuantityQuotes] = useState<Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountRate: number;
    parallelProduction?: {
      enabled?: boolean;
      optionNumber?: number;
      isRecommended: boolean;
      suggestedQuantity: number;
      savingsAmount: number;
      savingsPercentage: number;
    };
    priceBreak: string;
    minimumPriceApplied: boolean;
    // Phase 3.2: 両方式比較（推奨表示用）
    // 仕様: .omc/plans/gravure-integration-consensus.md Step 3.2 / AC-9
    // printingType='auto' の場合、各数量でデジタル/グラビア両方を計算し安い方を推奨
    digital?: { unitPrice: number; totalPrice: number };
    gravure?: { unitPrice: number; totalPrice: number };
    recommendedMethod?: 'digital' | 'gravure';
    recommendedReason?: string;
  }>>([]);

  const previousPriceRef = useRef<number | null>(null);
  const priceResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache key for all pricing-related state to prevent infinite loops
  const pricingCacheKey = useMemo(() => {
    return JSON.stringify({
      quantities: state.quantities || [],
      bagTypeId: state.bagTypeId,
      materialId: state.materialId,
      width: state.width,
      height: state.height,
      depth: state.depth,
      quantity: state.quantity,
      thicknessSelection: state.thicknessSelection,
      isUVPrinting: state.isUVPrinting,
      printingType: state.printingType,
      printingColors: state.printingColors,
      doubleSided: state.doubleSided,
      deliveryLocation: state.deliveryLocation,
      urgency: state.urgency
    });
  }, [
    state.quantities,
    state.bagTypeId,
    state.materialId,
    state.width,
    state.height,
    state.depth,
    state.quantity,
    state.thicknessSelection,
    state.isUVPrinting,
    state.printingType,
    state.printingColors,
    state.doubleSided,
    state.deliveryLocation,
    state.urgency
  ]);

  // Initialize previous price ref on mount
  useEffect(() => {
    if (currentPrice !== null && previousPriceRef.current === null) {
      previousPriceRef.current = currentPrice;
    }
  }, []);

  // Force recalculate when auth state changes from loading to ready
  useEffect(() => {
    // When auth finishes loading and we have a user, log for debugging
    if (!isAuthLoading && user?.id) {
      console.log('[RealTimePriceDisplay] Auth ready, user detected:', user.id);
      // The main useEffect will handle the recalculation via dependency array
    }
  }, [isAuthLoading, user?.id]);

  // Calculate real-time price whenever essential form data changes
  useEffect(() => {
    // user をキャプチャして、setTimeout実行時にも参照できるようにする
    const currentUser = user;

    const calculatePrice = async () => {
      // Capture quantities at effect run time
      const quantities = state.quantities;
      const currentQuantity = state.quantity;

      // CRITICAL: Wait for auth to complete before calculating price
      if (isAuthLoading) {
        console.log('[RealTimePriceDisplay] Auth loading, waiting...');
        return;
      }

      // Basic validation before calculation
      if (!state.materialId || !state.bagTypeId || quantities.length === 0) {
        // Only update state if values are actually different
        setCurrentPrice(prev => prev !== null ? null : prev);
        setQuantityQuotes(prev => prev.length !== 0 ? [] : prev);
        return;
      }

      setIsCalculating(true);
      try {
        // 顧客別マークアップ率を取得
        let customerMarkupRate = 0.0; // デフォルトは割引なし
        if (currentUser?.id) {
          try {
            const response = await fetch('/api/user/markup-rate', { cache: 'no-store' });
            if (response.ok) {
              const result = await response.json();
              customerMarkupRate = result.data?.markupRate ?? 0.0;
            }
          } catch (e) {
            console.warn('[calculatePrice] Failed to fetch markup rate:', e);
          }
        }

        // Calculate quotes for all quantities using unified pricing engine
        const quotes: Array<{
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          discountRate: number;
          priceBreak: string;
          minimumPriceApplied: boolean;
          digital?: { unitPrice: number; totalPrice: number };
          gravure?: { unitPrice: number; totalPrice: number };
          recommendedMethod?: 'digital' | 'gravure';
          recommendedReason?: string;
        }> = [];

        // Phase 3.2: 両方式ループ判定
        // printingType='auto' の場合のみデジタル/グラビア両方を計算（推奨表示用）
        // 明示指定（'digital'/'gravure'）時は後方互換でその方式のみ計算（計算コスト抑制）
        const isAutoMode = (state.printingType || 'digital') === 'auto';
        const methodsToCalculate: Array<'digital' | 'gravure'> = isAutoMode
          ? ['digital', 'gravure']
          : [((state.printingType || 'digital') === 'gravure' ? 'gravure' : 'digital')];

        for (const quantity of quantities) {
          console.log('[RealTimePriceDisplay] 計算開始 - 数量:', quantity, 'markupRate:', customerMarkupRate, 'ユーザーID:', currentUser?.id, '方式:', methodsToCalculate.join('/'));

          // 各方式の計算結果を保持
          const methodResults: Partial<Record<'digital' | 'gravure', { unitPrice: number; totalPrice: number; minimumPriceApplied: boolean }>> = {};

          for (const method of methodsToCalculate) {
            const quoteResult = await unifiedPricingEngine.calculateQuote({
              bagTypeId: state.bagTypeId,
              materialId: state.materialId,
              width: state.width,
              height: state.height,
              depth: state.depth,
              quantity: quantity,
              thicknessSelection: state.thicknessSelection,
              isUVPrinting: state.isUVPrinting,
              postProcessingOptions: state.postProcessingOptions,
              // Phase 3.2: 方式別に計算（auto時は両方式、明示時は指定方式）
              printingType: method,
              printingColors: state.printingColors,
              doubleSided: state.doubleSided,
              deliveryLocation: state.deliveryLocation,
              urgency: state.urgency,
              // 顧客別マークアップ率
              markupRate: customerMarkupRate,
              rollCount: state.rollCount, // 롤 필름 시 롤 개수
              // SKU計算を使用（handleNextと同じ計算方法）
              useSKUCalculation: true,
              skuQuantities: state.skuCount > 1 ? state.skuQuantities : [quantity],
              // Roll film specific parameters
              materialWidth: state.materialWidth,
              filmLayers: state.filmLayers,
              // 【重要】フィルム原価計算を有効化（管理画面での詳細表示用）
              useFilmCostCalculation: true,
            });
            console.log('[RealTimePriceDisplay] 計算結果 - 数量:', quantity, '方式:', method, '価格:', quoteResult.totalPrice, '円');
            methodResults[method] = {
              unitPrice: quoteResult.unitPrice,
              totalPrice: quoteResult.totalPrice,
              minimumPriceApplied: quoteResult.minimumPriceApplied || false
            };
          }

          // 推奨方式判定（auto時のみ）：安い方を推奨
          let recommendedMethod: 'digital' | 'gravure' | undefined;
          let recommendedReason: string | undefined;
          let primaryResult: { unitPrice: number; totalPrice: number; minimumPriceApplied: boolean };

          if (isAutoMode && methodResults.digital && methodResults.gravure) {
            const dTotal = methodResults.digital.totalPrice;
            const gTotal = methodResults.gravure.totalPrice;
            if (gTotal < dTotal) {
              recommendedMethod = 'gravure';
              // グラビア推奨理由：分岐点以上でグラビアが安い
              const savings = dTotal - gTotal;
              const savingsPct = dTotal > 0 ? Math.round((savings / dTotal) * 100) : 0;
              recommendedReason = `グラビア推奨（デジタル比 ${savingsPct}% 安）`;
            } else {
              recommendedMethod = 'digital';
              // デジタル推奨理由：分岐点未満でグラビア高単価
              recommendedReason = 'デジタル推奨（グラビア分岐点未満）';
            }
            primaryResult = recommendedMethod === 'gravure' ? methodResults.gravure : methodResults.digital;
          } else {
            // 明示指定時：その方式の結果を主結果に
            const soleMethod = methodsToCalculate[0];
            primaryResult = methodResults[soleMethod]!;
          }

          // Determine price break and discount rate
          let discountRate = 0;
          let priceBreak = '小ロット';

          if (quantity >= 50000) {
            discountRate = 0.4;
            priceBreak = '大ロット';
          } else if (quantity >= 20000) {
            discountRate = 0.3;
            priceBreak = '中ロット';
          } else if (quantity >= 10000) {
            discountRate = 0.2;
            priceBreak = '標準ロット';
          } else if (quantity >= 5000) {
            discountRate = 0.1;
            priceBreak = '小ロット';
          }

          quotes.push({
            quantity: quantity,
            unitPrice: primaryResult.unitPrice,
            totalPrice: primaryResult.totalPrice,
            discountRate: Math.round(discountRate * 100),
            priceBreak: priceBreak,
            minimumPriceApplied: primaryResult.minimumPriceApplied,
            // Phase 3.2: 両方式結果と推奨（auto時のみ設定）
            ...(methodResults.digital ? { digital: { unitPrice: methodResults.digital.unitPrice, totalPrice: methodResults.digital.totalPrice } } : {}),
            ...(methodResults.gravure ? { gravure: { unitPrice: methodResults.gravure.unitPrice, totalPrice: methodResults.gravure.totalPrice } } : {}),
            ...(recommendedMethod ? { recommendedMethod } : {}),
            ...(recommendedReason ? { recommendedReason } : {}),
          });
        }

        // Set current price to the first (recommended) quantity - use a ref to avoid dependency issues
        const recommendedQuote = quotes.find(q => q.quantity === currentQuantity) || quotes[0];
        const previousPrice = previousPriceRef.current;

        // CRITICAL FIX: Only update state if values have actually changed
        // This prevents infinite re-render loops
        setCurrentPrice(prev => prev !== recommendedQuote.totalPrice ? recommendedQuote.totalPrice : prev);

        // Deep comparison for quotes array to prevent unnecessary updates
        setQuantityQuotes(prev => {
          const quotesChanged = quotes.length !== prev.length ||
            quotes.some((q, i) =>
              q.quantity !== prev[i]?.quantity ||
              q.totalPrice !== prev[i]?.totalPrice
            );
          return quotesChanged ? quotes : prev;
        });

        // Detect price change for animation using ref instead of state
        if (previousPrice && recommendedQuote.totalPrice > previousPrice) {
          setPriceChange('increase');
        } else if (previousPrice && recommendedQuote.totalPrice < previousPrice) {
          setPriceChange('decrease');
        } else {
          setPriceChange('stable');
        }

        // Reset animation after delay - clean up previous timeout
        if (previousPrice && recommendedQuote.totalPrice !== previousPrice) {
          if (priceResetTimeoutRef.current) {
            clearTimeout(priceResetTimeoutRef.current);
          }
          priceResetTimeoutRef.current = setTimeout(() => setPriceChange('stable'), 500);
        }

        // Update the ref with the new price
        previousPriceRef.current = recommendedQuote.totalPrice;
      } catch (error) {
        console.error('Price calculation error:', error);
        // Only update state if values are actually different
        setCurrentPrice(prev => prev !== null ? null : prev);
        setQuantityQuotes(prev => prev.length !== 0 ? [] : prev);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculatePrice, 300); // Debounce
    return () => {
      clearTimeout(timeoutId);
      // Also clean up the price reset timeout
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
        priceResetTimeoutRef.current = null;
      }
    };
  }, [pricingCacheKey, user, isAuthLoading]); // user, isAuthLoading を依存配列に追加 - 顧客別割引率を適用

  // Cleanup price reset timeout on unmount
  useEffect(() => {
    return () => {
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
      }
    };
  }, []);

  if (!currentPrice || quantityQuotes.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl p-6 text-center">
        <div className="text-slate-600 font-medium">オプションを選択して価格を計算</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">数量別お見積もり</h3>
          {isCalculating && (
            <div className="flex items-center text-sm text-navy-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              計算中...
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {quantityQuotes.map((quote, index) => (
          <div
            key={`${quote.quantity}-${index}`}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${quote.quantity === state.quantity
              ? 'border-brixa-600 bg-brixa-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {quote.quantity.toLocaleString()}枚
                  </span>
                  {quote.quantity === state.quantity && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brixa-100 text-brixa-800">
                      現在選択
                    </span>
                  )}
                  {quote.minimumPriceApplied && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      最低価格適用
                    </span>
                  )}
                  {/* Phase 3.2: 推奨印刷方式バッジ（auto時のみ表示） */}
                  {quote.recommendedMethod && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quote.recommendedMethod === 'gravure'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      推奨: {quote.recommendedMethod === 'gravure' ? 'グラビア' : 'デジタル'}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div>単価: ¥{quote.unitPrice.toLocaleString()}（税別）</div>
                  <div>{quote.priceBreak} ({quote.discountRate}%引)</div>
                  {/* Phase 3.2: 両方式価格比較表示（auto時のみ） */}
                  {quote.digital && quote.gravure && (
                    <div className="mt-1 flex items-center space-x-3 text-xs">
                      <span className={quote.recommendedMethod === 'digital' ? 'font-semibold text-blue-700' : 'text-gray-500'}>
                        デジタル: ¥{quote.digital.totalPrice.toLocaleString()}
                      </span>
                      <span className={quote.recommendedMethod === 'gravure' ? 'font-semibold text-purple-700' : 'text-gray-500'}>
                        グラビア: ¥{quote.gravure.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {/* Phase 3.2: 推奨理由 */}
                  {quote.recommendedReason && (
                    <div className="mt-1 text-xs text-gray-500 italic">
                      {quote.recommendedReason}
                    </div>
                  )}
                </div>

                {quote.minimumPriceApplied && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                    最小注文価格（160,000円）が適用されました
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold mb-1 transition-all duration-500 ${quote.quantity === state.quantity && priceChange === 'increase' ? 'scale-105 text-success-600' :
                  quote.quantity === state.quantity && priceChange === 'decrease' ? 'scale-95 text-error-600' :
                    'text-gray-900'
                  }`}>
                  ¥{quote.totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">総費用（税別）</div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>素材: {state.materialId?.replace('_', ' ').toUpperCase()}</span>
            <span>タイプ: {state.bagTypeId?.replace('_', ' ')}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            サイズ: {state.bagTypeId === 'roll_film' ? `幅: ${state.width}mm / ピッチ: ${state.pitch}mm` : `${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}`}mm
            {state.thicknessSelection && state.materialId && ` | フィルム構成: ${getFilmStructureLabel(state.materialId, state.thicknessSelection)}`}
          </div>
        </div>

        {/* グラビア多列生産: 自動適用（C2 Followup #1・ユーザー指示 2026-06-28）
            顧客選択UIは廃止。製作数量に応じて自動判定（1列基準の製作長が1,000m超で最大列数）。 */}
        {state.printingType !== 'digital' && state.bagTypeId !== 'roll_film' && (() => {
          // bagTypeId → パウチ形状の判定（グラビア計算と同一ロジック）
          const bt = state.bagTypeId || '';
          const isPouch =
            bt.includes('lap_seal') || bt.includes('t_shape') ||
            bt.includes('3_side') || bt.includes('flat') ||
            bt.includes('stand') || bt.includes('m_shape');
          if (!isPouch) return null;
          return (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-xs text-purple-700">
                💰 多列生産で自動割引: 製作数量が多い場合（1列基準の製作長が1,000m超）は、
                物理可能な最大列数で自動計算し銅版費を按分して単価を下げます。
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Helper function to get Japanese post-processing label

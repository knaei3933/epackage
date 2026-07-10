'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Package, Layers, Calendar, Settings } from 'lucide-react';
import { useQuote, useQuoteState, useQuoteContext, checkStepComplete, createStepSummary, getPostProcessingLimitStatusForState, canAddPostProcessingOptionForState, getSpecsValidationMessages } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { unifiedPricingEngine, UnifiedQuoteResult, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import { safeMap } from '@/lib/array-helpers';
import EnvelopePreview from '../previews/EnvelopePreview';
import MultiQuantityStep from '../steps/MultiQuantityStep';
import MultiQuantityComparisonTable from '../shared/MultiQuantityComparisonTable';
import { getFilmStructureLabel, getLegendForSpecification, getPlainSpecSummary } from '@/constants/materialTypes';
import { getMaterialsByCategory, getMaterialById } from '@/constants/materialData';
import { getAvailableGussetSizes, ALL_GUSSET_SIZE_OPTIONS } from '@/lib/gusset-data';
import { getAvailableSealWidths, isGussetedBag } from '@/lib/sealing-data';
import {
  ChevronRight, ChevronLeft, Check, CheckCircle2, AlertCircle, Ticket, Printer,
  Info, Edit2, X, Phone, Mail, Clock, Calculator, RefreshCw, BarChart3, Download,
  Save, Send, Eye, Shield, Leaf, Lightbulb
} from 'lucide-react';
import { ErrorToast, useToast } from '../shared/ErrorToast';
import { useKeyboardNavigation } from '../shared/useKeyboardNavigation';
import { AuthPromptModal } from '../shared/AuthPromptModal';
import { ResponsiveStepIndicators } from '../shared/ResponsiveStepIndicators';
import { UnifiedSKUQuantityStep } from '../steps/UnifiedSKUQuantityStep';
import { ParallelProductionOptions } from '../shared/ParallelProductionOptions';
import { ResultStep } from '../sections/ResultStep';
import { OrderSummarySection } from '../shared/OrderSummarySection';
import { QuantityOptionsGrid } from '../selectors';
import { pouchCostCalculator } from '@/lib/pouch-cost-calculator';
// グラビア原反幅・製作長計算（数量パターン比較表 C3 で使用）
import {
  determineGravureMaterialWidth,
  determineGravureRollMaterialWidth,
  type GravurePouchType,
} from '@/lib/gravure-material-width';
import { calculateGravureProcessingCount } from '@/lib/gravure-cost-calculator';
import { determineAutoMultiColumnCount } from '@/lib/multi-column-auto';
import { GRAVURE_CONSTANTS } from '@/lib/pricing/core/constants';
import type { ParallelProductionOption } from '../shared/ParallelProductionOptions';
import type { QuantityOption } from '../selectors';
import { generateQuotePDF } from '@/lib/pdf-generator';
import {
  BAG_TYPE_OPTIONS,
  SPOUT_POSITION_OPTIONS,
  MATERIAL_CATEGORIES,
  getBagTypeLabel,
  getContentsDisplay,
  validateHeight,
  validateWidth,
  shouldShowGusset
} from '@/types/quote-wizard';

// Step configuration
import { SpecsStep } from './SpecsStep';
import { PostProcessingStep } from './PostProcessingStep';
import { RealTimePriceDisplay } from './RealTimePriceDisplay';

const STEPS = [
  { id: 'specs', title: '基本仕様', icon: Package, description: 'サイズ・素材・厚さ' },
  { id: 'post-processing', title: '後加工', icon: Settings, description: '追加仕様' },
  { id: 'sku-quantity', title: 'SKU・数量', icon: Layers, description: 'SKU数と数量設定' },
  { id: 'result', title: '見積結果', icon: Calendar, description: '価格詳細' }
];

// Main Wizard Component
export function ImprovedQuotingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<UnifiedQuoteResult | null>(null);
  // C2: multiQuantityResult の型を明示化（any → 具体型）
  // Map キー = パターン index (0-4)、値 = そのパターンの計算結果 + 推奨方式 + 合計数量
  // ※UnifiedQuoteResult は quantity フィールドを持たないため、patternTotalQuantity を
  //   calculations 値の追加フィールドとして保持（逆算による数量表示の正確性担保）
  const [multiQuantityResult, setMultiQuantityResult] = useState<{
    calculations: Map<number, UnifiedQuoteResult & { recommendation: { method: 'digital' | 'gravure' } } & { patternTotalQuantity: number }>;
  } | null>(null);
  // C1: 複数数量パターンの局所 state（[skuIndex][patternIndex]）
  // SKU数 <=5 時のみ使用。>5 時は空配列。QuoteContext は拡張しない（既存 skuQuantities pipeline は完全非接触）
  const [patternQuantities, setPatternQuantities] = useState<number[][]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const state = useQuoteState();
  const { dispatch, resetQuote } = useQuote();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const isStepComplete = (step: string) => checkStepComplete(state, step);

  // Toast notification system
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const currentStepId = STEPS[currentStep]?.id;

  const wizardRef = useRef<HTMLDivElement>(null);

  // 会員登録誘導モーダル
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  // ログイン成功後に見積もり計算を再開するためのフラグ
  const [pendingCalculation, setPendingCalculation] = useState(false);

  const handleNext = async () => {
    // 認証なしで全ステップを閲覧可能に変更
    // （認証チェックを削除 - 会員登録は結果ページで促す）

    // Validate contents dropdowns before proceeding
    if (!state.productCategory || !state.contentsType || !state.mainIngredient || !state.distributionEnvironment) {
      showError('内容物のすべてのドロップダウンを選択してください。');
      // Scroll to contents section
      const contentsSection = document.querySelector('[data-section="contents-dropdowns"]');
      if (contentsSection) {
        contentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (currentStep < STEPS.length - 1) {
      // Calculate quote when moving from sku-quantity or quantity step to result step
      if (currentStepId === 'sku-quantity' || currentStepId === 'quantity') {
        // 見積もり実行（結果表示）にはログインが必要。未ログインなら会員誘導モーダルを表示して中断。
        if (!isAuthLoading && !isAuthenticated) {
          setShowAuthPrompt(true);
          setPendingCalculation(true);
          return;
        }
        setIsCalculating(true);
        try {
          // Debug logging
          console.log('[handleNext] Current state:', {
            quantityMode: state.quantityMode,
            skuCount: state.skuCount,
            skuQuantities: state.skuQuantities,
            quantity: state.quantity
          });

          // Determine total quantity for calculation
          let totalQuantity: number;
          let useSKUMode = false;

          // More robust SKU mode detection: check SKU count and quantities array validity
          // For roll_film: 1 SKU is enough (min 500m for 1 SKU, 300m for 2+ SKUs)
          // For pouch products: need 2+ SKUs (min 100 pieces each)
          const isRollFilm = state.bagTypeId === 'roll_film';
          const minQuantityPerSku = isRollFilm
            ? (state.skuCount === 1 ? 500 : 300)
            : 100;

          const hasValidSKUData = state.skuCount >= 1 &&
            state.skuQuantities &&
            state.skuQuantities.length === state.skuCount &&
            state.skuQuantities.every(qty => qty && qty >= minQuantityPerSku);

          // Debug logging for SKU mode detection
          console.log('[handleNext] hasValidSKUData Check:');
          console.log('[handleNext] - skuCount > 1:', state.skuCount > 1, '(skuCount =', state.skuCount, ')');
          console.log('[handleNext] - skuQuantities exists:', !!state.skuQuantities);
          console.log('[handleNext] - skuQuantities:', state.skuQuantities);
          console.log('[handleNext] - Length check:', state.skuQuantities?.length, '===', state.skuCount, ':', state.skuQuantities?.length === state.skuCount);
          console.log('[handleNext] - Every check (all >= 100):', state.skuQuantities?.every(qty => qty && qty >= 100));
          console.log('[handleNext] - FINAL hasValidSKUData:', hasValidSKUData);

          if (currentStepId === 'sku-quantity' && hasValidSKUData) {
            // SKU mode: sum all SKU quantities
            console.log('[handleNext] SKU mode detected (via hasValidSKUData), quantities:', state.skuQuantities);

            // Ensure quantityMode is set to 'sku' for downstream components
            if (state.quantityMode !== 'sku') {
              console.log('[handleNext] Setting quantityMode to "sku"');
              dispatch({ type: 'SET_QUANTITY_MODE', payload: 'sku' });
            }

            totalQuantity = state.skuQuantities.reduce((sum, qty) => sum + (qty || 0), 0);
            console.log('[handleNext] Calculated total quantity:', totalQuantity);
            useSKUMode = true;
          } else {
            // Single quantity mode
            console.log('[handleNext] Single quantity mode (hasValidSKUData:', hasValidSKUData, ')');
            totalQuantity = state.quantity || state.quantities[0] || 1000;
            console.log('[handleNext] Single quantity mode, quantity:', totalQuantity);
          }

          console.log(`[handleNext] Calculating quote for ${useSKUMode ? 'SKU' : 'single'} mode, total quantity: ${totalQuantity}`);

          // Get customer-specific markup rate (if logged in)
          let markupRate = 0.0; // Default 0% (no discount) - 顧客別割引率のみ適用
          console.log('[handleNext] デフォルトmarkupRate:', markupRate, 'ユーザーID:', user?.id);
          // CRITICAL: Wait for auth to complete before checking user
          // 認証が完了するまで計算を待機し、正しい顧客別割引を適用する
          if (isAuthLoading) {
            console.log('[handleNext] Auth loading, WAITING for auth to complete...');
            return; // 計算を中断して認証完了を待つ
          } else if (user?.id) {
            try {
              // Fetch customer markup rate from API
              const response = await fetch('/api/user/markup-rate', { cache: 'no-store' });
              if (response.ok) {
                const result = await response.json();
                markupRate = result.data?.markupRate ?? 0.0; // デフォルトは割引なし（0%）
                console.log('[handleNext] Customer markup rate:', markupRate);
              } else {
                console.warn('[handleNext] Failed to fetch markup rate, using default 20%');
              }
            } catch (error) {
              console.warn('[handleNext] Failed to fetch markup rate, using default 20%:', error);
            }
          }

          console.log('[handleNext] DIAGNOSTIC - calculateQuote PARAMS:', {
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            skuCount: state.skuCount,
            skuQuantities: state.skuQuantities,
            totalQuantity: totalQuantity,
            markupRate: markupRate,
            deliveryLocation: state.deliveryLocation || 'domestic',
            urgency: state.urgency || 'standard',
          });

          // Calculate quote with SKU mode if applicable
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            quantity: totalQuantity,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            postProcessingOptions: state.postProcessingOptions,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            deliveryLocation: state.deliveryLocation || 'domestic',
            urgency: state.urgency || 'standard',
            // Customer-specific markup rate
            markupRate: markupRate,
            // SKU mode parameters - Always use SKU Calculation (PouchCostCalculator) for accuracy
            useSKUCalculation: true,
            skuQuantities: useSKUMode ? state.skuQuantities : [totalQuantity],
            // Roll film specific parameters (materialWidthはQuoteContextで動的に決定)
            materialWidth: state.materialWidth,
            filmLayers: state.filmLayers,
            // 【重要】フィルム原価計算を有効化（管理画面での詳細表示用）
            useFilmCostCalculation: true,
          });

          console.log('[handleNext] 価格計算完了 - 総額:', quoteResult.totalPrice, '円, markupRate:', markupRate, 'ユーザーID:', user?.id);

          // Enhance result with mode-specific information
          const enhancedResult = {
            ...quoteResult,
            ...(useSKUMode ? {
              skuMode: true,
              skuCount: state.skuCount,
              skuQuantities: state.skuQuantities,
              skuNames: (state as any).skuNames,
              totalQuantities: totalQuantity,
              hasValidSKUData: true,
              displayQuantities: state.skuQuantities
            } : {
              hasValidSKUData: false,
              displayQuantities: [state.quantity],
              quantities: state.quantities,
              skuQuantities: [state.quantity],
              totalQuantities: state.quantities?.reduce((sum, qty) => sum + qty, 0) || state.quantity
            })
          };

          console.log('[handleNext] Enhanced result:', enhancedResult);
          console.log('[handleNext] Setting result with hasValidSKUData:', enhancedResult.hasValidSKUData);
          console.log('[handleNext] Setting result with skuQuantities:', enhancedResult.skuQuantities);
          setResult(enhancedResult);

          // Phase 1.2: 複数パターン比較データを直接計算（MultiQuantityQuoteContextに依存しない）
          // C3: SKU数 <=5 時は state の patternQuantities([skuIndex][patternIndex]) を転置して
          //     各パターン（列）の全SKU数量配列を取得し、各パターン合計数量で digital/gravure 両計算。
          //     SKU数 >5 時は従来単一計算を維持、setMultiQuantityResult(null)。
          try {
            const skuCountForPattern = state.skuCount ?? 0;
            const usePatternMode = skuCountForPattern > 0 && skuCountForPattern <= 5
              && Array.isArray(patternQuantities)
              && patternQuantities.length === skuCountForPattern
              && patternQuantities.some(row => Array.isArray(row) && row.length > 0);

            if (usePatternMode) {
              // patternQuantities([skuIndex][patternIndex]) を転置 → patternQtyByPattern[patternIndex][skuIndex]
              const maxPatternCount = patternQuantities.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
              const transposed: number[][] = [];
              for (let p = 0; p < maxPatternCount; p++) {
                const patternQtyForAllSkus: number[] = [];
                for (let s = 0; s < skuCountForPattern; s++) {
                  const row = patternQuantities[s];
                  patternQtyForAllSkus.push(Array.isArray(row) && p < row.length ? (row[p] || 0) : 0);
                }
                transposed.push(patternQtyForAllSkus);
              }

              const calculations = new Map<number, UnifiedQuoteResult & { recommendation: { method: 'digital' | 'gravure' } } & { patternTotalQuantity: number }>();
              const baseQuoteParams = {
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                postProcessingOptions: state.postProcessingOptions,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                markupRate: 0,
                rollCount: state.rollCount,
                materialWidth: state.materialWidth,
                filmLayers: state.filmLayers,
                useFilmCostCalculation: true,
                useSKUCalculation: true,
              };

              // 各パターン（列）ごとに digital/gravure 両方式を計算し推奨（安い方）を格納
              for (let patternIdx = 0; patternIdx < transposed.length; patternIdx++) {
                const skuQtyArray = transposed[patternIdx];
                const patternTotal = skuQtyArray.reduce((sum, qty) => sum + (qty || 0), 0);
                // パターン合計0（未入力等）はスキップ
                if (!patternTotal || patternTotal <= 0) continue;

                // デジタル計算
                const digitalResult = await unifiedPricingEngine.calculateQuote({
                  ...baseQuoteParams, quantity: patternTotal, skuQuantities: skuQtyArray, printingType: 'digital',
                });
                // グラビア計算
                // 仕様 docs/gravure-pricing-calculation-formula.md §3/§4/§14 準拠:
                //   - 原反幅: bagTypeId/寸法から動的算出（740mm固定は誤り）
                //   - 製作長: 1ロット(6000m)あたりの加工個数から必要ロット数を算出し、
                //             総製作長 = ロット数 × 6000m で数量スケール（未指定だと常に1ロット固定になるバグを修正）
                //   - laminationType: 2026-06-27 廃止（ラミ種別→AL有無。filmLayers から自動判定）
                let gravureResult: UnifiedQuoteResult | null = null;
                try {
                  const bagTypeId = state.bagTypeId;
                  const gWidth = state.width;
                  const gHeight = state.height;
                  const gDepth = state.depth ?? 0;

                  // bagTypeId → GravurePouchType マッピング（unified-pricing-engine.ts L2244-2257 と同一ロジック）
                  let pouchType: GravurePouchType | null = null;
                  if (bagTypeId === 'roll_film') {
                    pouchType = null; // ロールフィルムは袋加工なし
                  } else if (bagTypeId.includes('lap_seal') || bagTypeId.includes('t_shape')) {
                    pouchType = 't_shape';
                  } else if (bagTypeId.includes('3_side') || bagTypeId.includes('flat')) {
                    pouchType = 'flat_3_side';
                  } else if (bagTypeId.includes('stand')) {
                    pouchType = 'stand_up';
                  } else if (bagTypeId.includes('m_shape')) {
                    pouchType = 'm_shape';
                  }

                  // 原反幅の動的算出
                  let gravureMaterialWidth: number;
                  let gravureProductionMeters: number;
                  if (bagTypeId === 'roll_film' || !pouchType) {
                    // ロールフィルム: 仕様幅ベース（state.materialWidth があればそれ、なければ最小500mm）
                    gravureMaterialWidth = determineGravureRollMaterialWidth(state.materialWidth && state.materialWidth > 0 ? state.materialWidth : 500);
                    // ロールは長さで注文されるため、製作長 = 要求数量(m) をそのまま使用（1ロット6000m未満なら6000m）
                    gravureProductionMeters = Math.max(GRAVURE_CONSTANTS.STANDARD_LOT_METERS, patternTotal);
                  } else {
                    // パウチ: 公式による原反幅算出
                    gravureMaterialWidth = determineGravureMaterialWidth(pouchType, gHeight, gWidth, gDepth);
                    // 1ロットあたり加工個数 → 必要ロット数 → 総製作長（仕様§4/§14）
                    const perLotCount = calculateGravureProcessingCount(pouchType, gHeight, gWidth, gDepth);
                    const requiredLots = perLotCount > 0 ? Math.max(1, Math.ceil(patternTotal / perLotCount)) : 1;
                    gravureProductionMeters = requiredLots * GRAVURE_CONSTANTS.STANDARD_LOT_METERS;
                  }

                  // 多列生産列数の自動決定（C2 Followup #1・ユーザー指示 2026-06-28）
                  // 顧客選択UIではなく、1列基準の製作長（パウチピッチ×数量）が1000m超で
                  // 物理可能な最大列数を自動適用（パウチ袋=2列上限）。1000m以下は1列。
                  // 例: ピッチ130mm×1万個=1300m > 1000m → 2列（650m相当）。
                  let gravureColumnCount = 1;
                  if (pouchType) {
                    gravureColumnCount = determineAutoMultiColumnCount(pouchType, gHeight, gWidth, patternTotal);
                  }

                  gravureResult = await unifiedPricingEngine.calculateQuote({
                    ...baseQuoteParams, quantity: patternTotal, skuQuantities: skuQtyArray, printingType: 'gravure',
                    gravureMaterialWidth,
                    gravureProductionMeters,
                    copperPlateType: 'new',         // 初回見積もり想定
                    columnCount: gravureColumnCount, // 多列生産列数（グラビア 2/3/4列・AC6）
                  });
                } catch (e) {
                  console.warn('[handleNext] Gravure calc failed for pattern', patternIdx, e);
                  gravureResult = null;
                }
                // 推奨判定
                const dTotal = digitalResult.totalPrice;
                const gTotal = gravureResult?.totalPrice ?? Infinity;
                const recommended: 'digital' | 'gravure' = gTotal < dTotal ? 'gravure' : 'digital';
                const recommendedResult = recommended === 'gravure' ? gravureResult! : digitalResult;
                calculations.set(patternIdx, {
                  ...recommendedResult,
                  recommendation: {
                    method: recommended,
                    resolvedMethod: recommended,
                    breakevenQuantity: -1,
                    digitalTotalPrice: dTotal,
                    gravureTotalPrice: gTotal === Infinity ? -1 : gTotal,
                    reason: recommended === 'gravure' ? `グラビア推奨（デジタル比 ${Math.round((1 - gTotal / dTotal) * 100)}% 安）` : 'デジタル推奨（分岐点未満）',
                  },
                  // そのパターンの全SKU数量合計（UnifiedQuoteResult は quantity を持たないため保持）
                  patternTotalQuantity: patternTotal,
                });
              }
              setMultiQuantityResult({ calculations });
              console.log('[handleNext] Multi-quantity result set (pattern mode):', calculations.size, 'patterns');
            } else {
              // SKU数 >5 / patternQuantities 未入力: 従来単一計算を維持、比較表非表示
              setMultiQuantityResult(null);
            }
          } catch (e) {
            console.warn('[handleNext] Multi-quantity calculation failed:', e);
            setMultiQuantityResult(null);
          }

          // Force state update before changing step
          await new Promise(resolve => setTimeout(resolve, 0));

          console.log('[handleNext] About to change step to result');
          setCurrentStep(currentStep + 1);
          // Scroll to top after showing results
          setTimeout(() => {
            wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } catch (error) {
          console.error('Quote calculation failed:', error);
          showError('見積もり計算でエラーが発生しました。もう一度お試しください。');
        } finally {
          setIsCalculating(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
        // Scroll to top of next step
        setTimeout(() => {
          wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  // ログイン成功後（isAuthenticated が true に反映された後）に見積もり計算を再開
  useEffect(() => {
    if (isAuthenticated && pendingCalculation) {
      setPendingCalculation(false);
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pendingCalculation]);

  const handleBack = () => {
    if (currentStep > 0) {
      // Clear result when going back from result step to prevent stale data
      if (currentStepId === 'result') {
        console.log('[handleBack] Clearing result cache when leaving result step');
        setResult(null);
      }

      setCurrentStep(currentStep - 1);
      // Scroll to top when going back
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleReset = () => {
    console.log('Reset button clicked - resetting quote');
    try {
      resetQuote();
      setCurrentStep(0);
      setResult(null);
      console.log('Quote reset completed');
      // Scroll to top after reset
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error during quote reset:', error);
      showError('リセット中にエラーが発生しました。もう一度お試しください。');
    }
  };

  // 複数パターンビュー（SKU 1-10）の判定
  const isMultiPatternMode =
    state.skuCount >= 1 && state.skuCount <= 10 && patternQuantities.length > 0;

  // canProceed: 複数パターンビューの場合は patternQuantities で判定
  // （パターン1・パターン2の両方の合計が最小数量500以上であることが必須）
  const canProceed = (() => {
    if (!currentStepId) return false;
    if (currentStepId === 'sku-quantity' && isMultiPatternMode) {
      const colCount = patternQuantities[0]?.length ?? 0;
      if (colCount < 2) return false;
      const minQty = 500; // 各パターンとも最低500個/m
      for (let p = 0; p < 2; p++) {
        const patternTotal = patternQuantities.reduce((sum, row) => sum + (row[p] || 0), 0);
        if (patternTotal < minQty) return false;
      }
      return true;
    }
    return isStepComplete(currentStepId);
  })();
  const isLastStep = currentStep === STEPS.length - 1;

  // SKU数量MOQエラーがある場合は進行不可
  const canProceedWithValidation = useMemo(() => {
    if (!canProceed) return false;
    if (currentStepId === 'sku-quantity' && state.skuQuantityValidationError) {
      return false;
    }
    return true;
  }, [canProceed, currentStepId, state.skuQuantityValidationError]);

  // Get validation messages for specs step
  const specsValidationErrors = useMemo(() => {
    if (currentStepId === 'specs' && !canProceed) {
      return getSpecsValidationMessages(state);
    }
    return [];
  }, [currentStepId, canProceed, state]);

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: canProceedWithValidation ? handleNext : undefined,
    onPrevious: currentStep > 0 ? handleBack : undefined,
    onDismiss: () => {
      toasts.forEach(toast => dismissToast(toast.id));
    },
    onConfirm: canProceedWithValidation ? handleNext : undefined,
    canProceed: canProceedWithValidation,
    canGoBack: currentStep > 0,
  });

  // Focus management on step change
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      // Focus the first heading or input after step change
      setTimeout(() => {
        const focusable = wizardRef.current?.querySelector('h1, h2, h3, input, button') as HTMLElement;
        if (focusable) {
          focusable.focus({ preventScroll: true });
        }
      }, 100);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" role="main">
      {/* Error Toast Notifications */}
      <ErrorToast toasts={toasts} onDismiss={dismissToast} />

      <div ref={wizardRef} className="max-w-7xl mx-auto p-4 lg:p-8" id="quote-wizard-content">

        {/* Step Indicators - Responsive (横型ステッパー + 進捗バー) */}
        <ResponsiveStepIndicators
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(index) => { if (index < currentStep) setCurrentStep(index); }}
          isStepCompleted={(index) => index < currentStep || (result && index === STEPS.length - 1)}
        />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation - Desktop */}
          <div className="xl:col-span-1 lg:block">
            <div className="sticky top-6 space-y-4">
              {/* Envelope Preview */}
              <EnvelopePreview
                bagTypeId={state.bagTypeId}
                dimensions={{
                  width: state.width,
                  height: state.height,
                  depth: state.depth,
                  pitch: state.pitch,
                  sideWidth: state.sideWidth
                }}
                productCategory={state.productCategory}
                contentsType={state.contentsType}
                mainIngredient={state.mainIngredient}
                distributionEnvironment={state.distributionEnvironment}
                materialId={state.materialId}
                thicknessSelection={state.thicknessSelection}
                postProcessingOptions={state.postProcessingOptions}
                spoutPosition={state.spoutPosition}
                sealWidth={state.sealWidth}
              />

            </div>
          </div>

          {/* Main Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8">
              {/* Step Content */}
              {currentStepId === 'specs' && <SpecsStep />}
              {currentStepId === 'post-processing' && <PostProcessingStep />}
              {currentStepId === 'sku-quantity' && <UnifiedSKUQuantityStep patternQuantities={patternQuantities} onPatternQuantitiesChange={setPatternQuantities} />}
              {currentStepId === 'result' && result && <ResultStep result={result} multiQuantityResult={multiQuantityResult} onReset={handleReset} />}

              {/* Navigation Block Error - Displayed when user cannot proceed due to validation */}
              {/* Specs step validation errors */}
              {specsValidationErrors.length > 0 && currentStepId === 'specs' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        次の項目を入力してください：
                      </p>
                      <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                        {specsValidationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              {currentStepId !== 'result' && (
                <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 font-medium rounded-lg transition-all flex items-center justify-center w-full sm:w-auto ${currentStep === 0
                      ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                      }`}
                    aria-label="前のステップに戻る"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    戻る
                  </button>

                  <motion.button
                    onClick={handleNext}
                    disabled={!canProceed || isCalculating || isAuthLoading}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center relative shadow-lg w-full sm:w-auto border-2 ${!canProceed || isCalculating || isAuthLoading
                      ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-info-700 border-info-800 hover:bg-info-800 hover:border-info-900 hover:shadow-xl'
                      }`}
                    style={!canProceed || isCalculating || isAuthLoading ? {} : {
                      backgroundColor: '#1e3a8a',
                      borderColor: '#1e40af',
                      color: '#FFFFFF !important'
                    }}
                    aria-label={isLastStep ? "見積もりを完了する" : "次のステップに進む"}
                    whileHover={canProceed && !isCalculating && !isAuthLoading ? {
                      scale: 1.02,
                      backgroundColor: '#1e40af',
                      borderColor: '#1e3a8a'
                    } : {}}
                    whileTap={canProceed && !isCalculating && !isAuthLoading ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="relative flex items-center" style={{
                      color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF',
                      fontWeight: 'bold'
                    }}>
                      {isAuthLoading ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                            style={{
                              borderColor: !canProceed || isCalculating || isAuthLoading ? 'currentColor' : '#FFFFFF',
                              borderTopColor: 'transparent'
                            }}
                          />
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            認証確認中...
                          </span>
                        </>
                      ) : isCalculating ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                            style={{
                              borderColor: !canProceed || isCalculating || isAuthLoading ? 'currentColor' : '#FFFFFF',
                              borderTopColor: 'transparent'
                            }}
                          />
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            計算中...
                          </span>
                        </>
                      ) : isLastStep ? (
                        <>
                          <Check className="w-4 h-4 mr-2" style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }} />
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            見積もりを完了
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            次へ
                          </span>
                          <ChevronRight className="w-4 h-4 ml-2" style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }} />
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content spacer for mobile bottom bar */}
        <div className="h-32 lg:hidden" aria-hidden="true" />

        {/* Bottom Action Boxes - Fixed Position */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-4">

            {/* Mobile Price Display */}
            {result && (
              <div className="lg:hidden mb-3 p-3 bg-gradient-to-r from-navy-50 to-blue-50 rounded-lg border-2 border-navy-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-700">見積もり価格</span>
                  <span className="text-xl font-bold text-navy-900">
                    ¥{result.totalPrice.toLocaleString()}
                    <span className="text-xs text-navy-600 ml-1">税込</span>
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Optimized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">

              {/* 総合見積りツール */}
              <button
                className="bg-gradient-to-r from-info-50 to-info-100 border-2 border-info-200 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 text-left"
                aria-label="総合見積りツール - すべてのオプションを網羅した詳細見積を表示"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-info-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-info-900 text-sm lg:text-base truncate">総合見積りツール</h3>
                    <p className="text-xs lg:text-sm text-info-700 hidden sm:block">すべてのオプションを網羅した詳細見積</p>
                  </div>
                </div>
              </button>

              {/* 詳細見積もり */}
              <button
                className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-300 text-left"
                aria-label="詳細見積もり - 仕様別の価格比較と分析を表示"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-900 text-sm lg:text-base truncate">詳細見積もり</h3>
                    <p className="text-xs lg:text-sm text-green-700 hidden sm:block">仕様別の価格比較と分析</p>
                  </div>
                </div>
              </button>

              {/* 即時相談 */}
              <a
                href="tel:050-1793-6500"
                className="bg-gradient-to-r from-navy-600 to-navy-700 text-white border-2 border-navy-600 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-navy-300 text-left sm:col-span-2 lg:col-span-1"
                aria-label="即時相談 - 専門家との無料相談。電話番号: 050-1793-6500"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base truncate">即時相談</h3>
                    <p className="text-xs lg:text-sm text-white/90 hidden sm:block">専門家との無料相談 050-1793-6500</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Contact Info Bar - Mobile Optimized */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-600">
                  <a
                    href="tel:050-1793-6500"
                    className="flex items-center space-x-2 hover:text-navy-700 transition-colors"
                    aria-label="電話番号: 050-1793-6500"
                  >
                    <Phone className="w-4 h-4 text-navy-600" />
                    <span className="font-medium">050-1793-6500</span>
                  </a>
                  <a
                    href="mailto:info@package-lab.com"
                    className="flex items-center space-x-2 hover:text-navy-700 transition-colors"
                    aria-label="メールアドレス: info@package-lab.com"
                  >
                    <Mail className="w-4 h-4 text-navy-600" />
                    <span className="font-medium hidden sm:inline">info@package-lab.com</span>
                    <span className="font-medium sm:hidden">メール</span>
                  </a>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-navy-600" />
                    <span className="text-xs">平日 9:00-18:00 (JST)</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center lg:text-right">
                  © 2025 Epackage Lab. 全著作権所有.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-48" />

      </div>

      {/* 会員登録誘導モーダル（ログインはモーダル内で完結し入力状態を維持、登録は別ページ） */}
      {showAuthPrompt && (
        <AuthPromptModal
          onClose={() => setShowAuthPrompt(false)}
          onSuccess={() => {
            setShowAuthPrompt(false);
            // isAuthenticated 反映後に useEffect[pendingCalculation] が handleNext で計算を再開
          }}
          onRegister={() => router.push('/auth/register?redirect=/quote-simulator')}
        />
      )}
    </div>
  );
}
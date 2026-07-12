/**
 * ResultStep Component
 *
 * Displays quote results with PDF download and save functionality
 * Extracted from ImprovedQuotingWizard for better maintainability
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'
;
import { useQuote, useQuoteState, validateProductTypeSpecificFields } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { saveGuestQuote } from '@/lib/guest-quote-storage';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import { generateQuotePDF, generateMultiQuantityPDF, QuoteData, MultiQuantityQuoteInput } from '@/lib/pdf-generator';
import { safeMap } from '@/lib/array-helpers';
import { buildQuoteFilename } from '@/lib/quote-filename';
import MultiQuantityComparisonTable from '../shared/MultiQuantityComparisonTable';
import { ParallelProductionOptions } from '../shared';
import { pouchCostCalculator } from '@/lib/pouch-cost-calculator';
import { calcDuty, calcManufacturingMargin } from '@/lib/duty-calculator';
import { formatPrice } from '@/utils/formatters';
import { MATERIAL_TYPE_LABELS_JA, getMaterialDescription, getFilmStructureLabel } from '@/constants/materialTypes';
import { RefreshCw, Download, List, BarChart3, ShoppingCart, Package, Layers, Settings, Truck, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ButtonSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import CostBreakdownPanel from '../shared/CostBreakdownPanel';
import {
  getMaterialDescriptionJa,
  getMaterialLabelJa,
  getBagTypeDescriptionJa,
  getBagTypeLabel,
  getPostProcessingLabel,
  translateSpoutPosition,
  getFilteredPostProcessingOptions,
} from './result-helpers';
import { arrayBufferToBase64 } from './parts/arrayBufferToBase64';
import { PersistenceStatusBanner } from './parts/PersistenceStatusBanner';
import { ActionButtons } from './parts/ActionButtons';
import { PrintingRecommendation } from './parts/PrintingRecommendation';
import { SpecificationsCard } from './parts/SpecificationsCard';
import { PriceComparisonSection } from './parts/PriceComparisonSection';
import { generateQuoteData as generateQuoteDataFn, buildMultiPatternPdfInputs as buildMultiPatternPdfInputsFn } from './parts/generateQuoteData';
import { saveQuotationToDatabase as saveQuotationToDatabaseFn } from './parts/saveQuotationToDatabase';
import type { MultiQuantityResult } from '@/types/multi-quantity';
import type { ParallelProductionOption } from '../shared';

// C2: 複数パターン比較結果の新型（C2契約最終型・T1実装済み）
// Mapキー = パターン index (0-4)、値 = そのパターンの計算結果 + 推奨方式 + 合計数量
// ※patternTotalQuantity は fix #16 で追加（UnifiedQuoteResult が quantity を持たないため保持）
// ImprovedQuotingWizard の state 型と同一（L2230-2232）
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

interface ResultStepProps {
  result: UnifiedQuoteResult;
  // C2: MultiQuantityResult（旧型）→ PatternMultiQuantityResult（C2新型）に変更
  multiQuantityResult: PatternMultiQuantityResult;
  onReset: () => void;
}

/**
 * Component for displaying quote results with actions
 */
export function ResultStep({ result, multiQuantityResult, onReset }: ResultStepProps) {
  const router = useRouter();
  const state = useQuoteState();
  const { setSelectedQuantity } = useQuote();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Phase 1 fix: surface persistence errors to the user (no more silent fail).
  // persistenceStatus tracks the auto-save outcome so the result page can show a banner.
  const [persistenceStatus, setPersistenceStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string; quotationNumber?: string | null }>({ status: 'idle', message: '' });

  // 経済的数量提案・並列生産オプション用のステート
  const [showOptimizationSuggestions, setShowOptimizationSuggestions] = useState(false);
  const [parallelProductionOptions, setParallelProductionOptions] = useState<ParallelProductionOption[]>([]);

  const hasAutoSaved = useRef(false);
  // Phase 1 fix: track WHICH result was saved so a fresh quote run re-saves.
  // The previous ref-only guard stayed true across a new calculation, silently skipping the save.
  const lastSavedResultSignature = useRef<string | null>(null);

  useEffect(() => {
    const signature = result && result.totalPrice > 0
      ? `${result.totalPrice}|${result.unitPrice}|${result.quantity ?? 0}`
      : null;

    if (!signature) return;
    if (lastSavedResultSignature.current === signature) return;

    lastSavedResultSignature.current = signature;
    hasAutoSaved.current = true;
    autoGenerateAndSave();
  }, [result?.totalPrice, result?.unitPrice]);

  // ブラウザの戻るボタンを無効化（強化版）
  useEffect(() => {
    const preventBack = (event: PopStateEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // 同じURLにプッシュして戻るを無効化
      window.history.pushState(null, '', window.location.href);
      window.history.pushState(null, '', window.location.href);
    };

    // 初期ロード時に履歴を追加（複数回プッシュして強化）
    window.history.pushState({ canGoBack: false }, '', window.location.href);
    window.history.pushState({ canGoBack: false }, '', window.location.href);
    window.history.pushState({ canGoBack: false }, '', window.location.href);

    // popstateイベントをリッスン（キャプチャフェーズ）
    window.addEventListener('popstate', preventBack, { capture: true });

    // キーボードショートカットも無効化
    const preventKeyboardNavigation = (event: KeyboardEvent) => {
      // Alt + Left Arrow (戻る)
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      // Backspace (入力フィールド以外)
      if (event.key === 'Backspace' &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', preventKeyboardNavigation, { capture: true });

    // クリーンアップ
    return () => {
      window.removeEventListener('popstate', preventBack, { capture: true } as any);
      window.removeEventListener('keydown', preventKeyboardNavigation, { capture: true } as any);
    };
  }, []);

  // ページ離脱時の確認ダイアログ（オプション）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Check if user is admin
  const isAdmin = (user?.role as string) === 'admin' || ((user as any)?.user_metadata?.role as string) === 'admin';

  // Get multi-quantity state at component level (before any handlers)
  const { state: multiQuantityState } = useMultiQuantityQuote();

  // C4/AC-8: SKU数バンド判定。1-10 のみ複数パターン比較表・全パターンPDFを有効化。
  // 11以上は別途見積もり依頼（multiQuantityResult は null で渡される）。
  const skuCountForBand = state.skuCount ?? 0;
  const isPatternMode = skuCountForBand > 0 && skuCountForBand <= 10;

  // Get multi-quantity calculations from prop first, then fallback to context
  // C2新型（Map<number, UnifiedQuoteResult & {recommendation}>）と旧Context（Map<number, UnifiedQuoteResult>）の和型
  const multiQuantityCalculations = multiQuantityResult?.calculations || multiQuantityState.multiQuantityResults;
  const hasMultiQuantityResults = multiQuantityCalculations && multiQuantityCalculations.size > 0;
  // C4: 比較表表示条件 = パターンモード（SKU<=10）かつ calculations 存在
  const showPatternComparison = isPatternMode && hasMultiQuantityResults;

  // Robust SKU mode detection - prioritize result data, fallback to state calculation
  const hasValidSKUData = result?.hasValidSKUData ?? (
    state.skuCount > 1 &&
    state.skuQuantities &&
    state.skuQuantities.length === state.skuCount &&
    state.skuQuantities.every(qty => qty && qty >= 100)
  );

  // Build quotes array from multi-quantity results
  // C4: ユーザー入力パターン駆動。Mapキー=パターンindex(0-4)。
  // recommendation（推奨方式・両方式価格）・patternTotalQuantity（正確な合計数量）を付加。
  const multiQuantityQuotes = hasMultiQuantityResults
    ? Array.from(multiQuantityCalculations.entries()).map(([quantity, quote]) => {
        const quoteWithExtra = quote as UnifiedQuoteResult & {
          recommendation?: { method?: 'digital' | 'gravure' };
          patternTotalQuantity?: number;
        };
        return {
          quantity: quantity,
          unitPrice: quote.unitPrice,
          totalPrice: quote.totalPrice,
          discountRate: 0,
          priceBreak: '通常',
          leadTimeDays: quote.leadTimeDays || result.leadTimeDays,
          isValid: true,
          // C2新型の推奨方式（旧Contextフォールバック時は undefined）
          recommendedMethod: quoteWithExtra.recommendation?.method,
          // fix #16: 正確なパターン合計数量（逆算不要）。旧Contextフォールバック時は undefined
          patternTotalQuantity: quoteWithExtra.patternTotalQuantity,
          // SKU別明細（複数SKU見積もり時・比較表PDFのSKU別サブ行展開用）
          skuCostDetails: quoteWithExtra.skuCostDetails,
        };
      }).sort((a, b) => a.quantity - b.quantity)
    : [];

  // 経済的数量提案・並列生産オプションを計算
  useEffect(() => {
    // roll_film, t_shape, m_shapeの場合に並列生産オプションを計算
    if (state.bagTypeId === 'roll_film' || state.bagTypeId === 't_shape' || state.bagTypeId === 'm_shape') {
      // async関数を呼び出すためのIIFE
      (async () => {
        // ロールフィルムの場合、ユーザーが入力した長さを使用
        const currentFilmUsageForCalc = state.bagTypeId === 'roll_film' ? state.quantity : (result.filmUsage || 900);

        const suggestion = await pouchCostCalculator.calculateEconomicQuantitySuggestion(
          state.quantity,
          { width: state.width, height: state.height, depth: state.depth },
          state.bagTypeId,
          currentFilmUsageForCalc,
          result.unitPrice,
          {
            filmLayers: state.filmLayers,
            materialId: state.materialId,
            thicknessSelection: state.thicknessSelection,
            postProcessingOptions: state.postProcessingOptions
          }
        );

        if (suggestion.parallelProductionOptions && suggestion.parallelProductionOptions.length > 0) {
          setParallelProductionOptions(suggestion.parallelProductionOptions as ParallelProductionOption[]);
          setShowOptimizationSuggestions(true);
        }
      })();
    } else {
    }
  }, [state.bagTypeId, state.quantity, state.width, state.height, state.depth, result.unitPrice, state.filmLayers, state.materialId, state.thicknessSelection, state.postProcessingOptions]);


  // Helper to generate PDF quote data
  const generateQuoteData = (overrideQuoteNumber?: string): QuoteData => {
    return generateQuoteDataFn({
      state: state,
      result,
      hasValidSKUData,
      hasMultiQuantityResults,
      multiQuantityQuotes,
      overrideQuoteNumber,
      user: user,
    });
  };

  const buildMultiPatternPdfInputs = (): MultiQuantityQuoteInput[] => {
    return buildMultiPatternPdfInputsFn({
      state: state,
      multiQuantityQuotes,
    });
  };

  const generateAndDownloadMultiPatternPdf = async (overrideQuoteNumber?: string, quotationId?: string): Promise<void> => {
    const inputs = buildMultiPatternPdfInputs();
    // 従来見積書と同一メタデータを使用（generateQuoteData を流用）
    const quoteData = generateQuoteData(overrideQuoteNumber);
    const blob = await generateMultiQuantityPDF(inputs, {
      filename: buildQuoteFilename(user?.companyName, quoteData.issueDate),
      header: {
        quoteNumber: quoteData.quoteNumber,
        issueDate: quoteData.issueDate,
        customerName: quoteData.customerName,
        companyName: quoteData.companyName,
        postalCode: quoteData.postalCode,
        address: quoteData.address,
        contactPerson: quoteData.contactPerson,
        validityPeriod: quoteData.validityPeriod,
        paymentTerms: quoteData.paymentTerms,
        deliveryDate: quoteData.deliveryDate,
      },
      specifications: quoteData.specifications,
      optionalProcessing: quoteData.optionalProcessing,
    });
    const objectUrl = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = objectUrl;
      a.download = buildQuoteFilename(user?.companyName, quoteData.issueDate);
      document.body.appendChild(a);
      a.click();
      if (a.parentNode) document.body.removeChild(a);
    } finally {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    }

    // Storage保存（quotationIdがある場合）
    if (quotationId) {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdfBase64 = arrayBufferToBase64(arrayBuffer);
        const saveResponse = await fetch(`/api/member/quotations/${quotationId}/save-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            pdfData: `data:application/pdf;base64,${pdfBase64}`,
          }),
        });
        if (!saveResponse.ok) {
          console.warn('[MultiPatternPDF] Failed to save PDF to Storage:', await saveResponse.text());
        }
      } catch (saveError) {
        console.warn('[MultiPatternPDF] Error saving PDF to Storage:', saveError);
      }
    }
  };

  const autoGenerateAndSave = async () => {
    try {
      // C5/AC-9: パターンモード（SKU<=5）時は全パターンPDF生成、それ以外は従来単一PDF
      if (showPatternComparison && multiQuantityQuotes.length > 0) {
        // DB保存を先に行い、正しい見積番号を取得してからPDF生成（番号整合性担保）
        const savedResult = await saveQuotationToDatabase();
        if (savedResult.id) setQuotationId(savedResult.id);
        await generateAndDownloadMultiPatternPdf(savedResult.quotationNumber || undefined, savedResult.id);
        setPdfStatus('success');
        return;
      }

      // 1. DB保存を先に行い、正しい見積番号を取得してからPDF生成（番号整合性担保）
      const savedResult = await saveQuotationToDatabase();
      if (savedResult.id) setQuotationId(savedResult.id);
      const dbQuoteNumber = savedResult.quotationNumber;

      // 2. PDF生成（DB保存済みの見積番号を使用）
      const quoteData = generateQuoteData(dbQuoteNumber || undefined);
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: buildQuoteFilename(user?.companyName, quoteData.issueDate)
      });

      if (pdfResult.success && pdfResult.pdfBuffer) {
        // 2. 自動ダウンロード（バックグラウンド）
        const blob = new Blob([pdfResult.pdfBuffer as BlobPart], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = pdfResult.filename || buildQuoteFilename(user?.companyName, quoteData.issueDate);
        document.body.appendChild(a);
        a.click();
        if (a.parentNode) document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

        // 3. Storage保存（認証済みのみ）- エラーハンドリング追加
        //    DB保存はPDF生成前に行い済み（savedResult.id 使用）
        if (savedResult.id && pdfResult.pdfBuffer) {
          try {
            const pdfBase64 = arrayBufferToBase64(pdfResult.pdfBuffer as unknown as ArrayBuffer);
            const saveResponse = await fetch(`/api/member/quotations/${savedResult.id}/save-pdf`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                pdfData: `data:application/pdf;base64,${pdfBase64}`,
              }),
            });
            if (!saveResponse.ok) {
              console.warn('[autoGenerateAndSave] Failed to save PDF to Storage:', await saveResponse.text());
            }
          } catch (saveError) {
            console.warn('[autoGenerateAndSave] Error saving PDF to Storage:', saveError);
            // PDF保存に失敗してもダウンロードは成功しているので続行
          }
        }

        setPdfStatus('success');
      }
    } catch (error) {
      console.error('[autoGenerateAndSave] error:', error);
    }
  };

  const handleDownloadPdf = async () => {
    // 製品タイプ別必須フィールドバリデーション（最新stateを参照）
    const validation = validateProductTypeSpecificFields(state);
    if (!validation.valid) {
      const errorMessage = `以下の必須項目が入力されていません:\n${validation.missingFields.join('\n')}`;
      alert(errorMessage);
      return;
    }

    setIsGeneratingPdf(true);
    setPdfStatus('idle');

    // C5/AC-9: パターンモード（SKU<=5）時は全パターンPDF生成、それ以外は従来単一PDF
    if (showPatternComparison && multiQuantityQuotes.length > 0) {
      try {
        // DB保存を先に行い、正しい見積番号を取得してからPDF生成（番号整合性担保）
        const savedResult = await saveQuotationToDatabase();
        if (savedResult.id) setQuotationId(savedResult.id);
        await generateAndDownloadMultiPatternPdf(savedResult.quotationNumber || undefined, savedResult.id);
        setPdfStatus('success');
        setTimeout(() => setPdfStatus('idle'), 3000);
      } catch (error) {
        console.error('[handleDownloadPdf] MultiPatternPDF ERROR:', error);
        setPdfStatus('error');
        setTimeout(() => setPdfStatus('idle'), 3000);
        alert(`全パターンPDF生成中にエラーが発生しました。\n${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsGeneratingPdf(false);
      }
      return;
    }

    try {
      // DB保存を先に行い、正しい見積番号を取得してからPDF生成（番号整合性担保）
      const savedResult = await saveQuotationToDatabase();
      if (savedResult.id) setQuotationId(savedResult.id);
      const dbQuoteNumber = savedResult.quotationNumber;

      const quoteData = generateQuoteData(dbQuoteNumber || undefined);
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: buildQuoteFilename(user?.companyName, quoteData.issueDate)
      });

      if (pdfResult.success) {
        if (pdfResult.pdfBuffer) {
          const blob = new Blob([pdfResult.pdfBuffer as BlobPart], { type: 'application/pdf' });

          // URL.createObjectURL을 사용하여 다운로드
          const objectUrl = URL.createObjectURL(blob);

          try {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = objectUrl;
            a.download = pdfResult.filename || buildQuoteFilename(user?.companyName, quoteData.issueDate);
            document.body.appendChild(a);

            // 클릭으로 다운로드 트리거
            a.click();

            // 즉시 정리
            if (a.parentNode) {
              document.body.removeChild(a);
            }
          } finally {
            // 메모리 누수 방지를 위해 objectUrl 해제
            setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
          }

        }

        // 2. Storage保存（ユーザー認証済みの場合）
        //    DB保存はPDF生成前に行い済み（savedResult.id 使用）
        if (savedResult.id && user?.id && pdfResult.pdfBuffer) {
          try {
            const pdfBase64 = arrayBufferToBase64(pdfResult.pdfBuffer as unknown as ArrayBuffer);

            const saveResponse = await fetch(`/api/member/quotations/${savedResult.id}/save-pdf`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                pdfData: `data:application/pdf;base64,${pdfBase64}`,
              }),
            });

            if (saveResponse.ok) {
              await saveResponse.json();
            } else {
              console.warn('[handleDownloadPdf] Failed to save PDF to Storage:', await saveResponse.text());
            }
          } catch (saveError) {
            console.warn('[handleDownloadPdf] Error saving PDF to Storage:', saveError);
            // PDF保存に失敗してもダウンロードは成功したので続行
          }
        }

        // Log PDF download to document_access_log table
        try {
          await fetch('/api/member/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              document_type: 'quote',
              document_id: quoteData.quoteNumber,
              action: 'downloaded',
            }),
          });
        } catch (logError) {
          console.error('Failed to log PDF download:', logError);
          // Don't fail the download if logging fails
        }

        setPdfStatus('success');
        setTimeout(() => setPdfStatus('idle'), 3000);
      } else {
        throw new Error(pdfResult.error || 'PDF生成に失敗しました');
      }
    } catch (error) {
      console.error('[handleDownloadPdf] ERROR:', error);
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 3000);
      alert(`PDF生成中にエラーが発生しました。\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper function to convert ArrayBuffer to Base64
  // 戻り値: 保存成功時は見積もりID、失敗時はnull
  const saveQuotationToDatabase = async (): Promise<{ id: string | null; quotationNumber: string | null }> => {
    return saveQuotationToDatabaseFn({
      user: user,
      result,
      state: state,
      hasValidSKUData,
      multiQuantityQuotes,
      hasMultiQuantityResults,
      setPersistenceStatus,
    });
  };

  const handleSave = async () => {
    if (!user?.id) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    const totalSKUQuantity = state.skuQuantities?.reduce((sum, qty) => sum + (Number(qty) || 0), 0) || state.quantity;

    try {
      // 複数数量モード: 各パターンのSKU原価からitem別cost_breakdownを生成
      const buildItemCostBreakdown = (skuDetails: any): any => {
        if (!skuDetails?.costPerSKU || skuDetails.costPerSKU.length === 0) return undefined;
        const skus = skuDetails.costPerSKU;
        const totalFinalPrice = skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.totalCost || 0), 0);
        return {
          materialCost: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.materialCost || 0), 0)),
          laminationCost: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.laminationCost || 0), 0)),
          slitterCost: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.slitterCost || 0), 0)),
          surfaceTreatmentCost: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.surfaceTreatmentCost || 0), 0)),
          pouchProcessingCost: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.pouchProcessingCost || 0), 0)),
          printingCost: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.printingCost || 0), 0)),
          manufacturingMargin: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.manufacturingMargin || 0), 0)),
          duty: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.duty || 0), 0)),
          delivery: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.delivery || 0), 0)),
          salesMargin: Math.round(skus.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.salesMargin || 0), 0)),
          totalCost: Math.round(totalFinalPrice),
          intlShippingJPY: skuDetails?.summary?.intlShippingJPY ?? 0,
          domesticShippingJPY: skuDetails?.summary?.domesticShippingJPY ?? 0,
          deliveryBoxes: skuDetails?.summary?.deliveryBoxes ?? 0,
          // G002: DB実値を転送
          exchangeRate: skus[0]?.costBreakdown?.exchangeRate,
          manufacturerMarginRate: skus[0]?.costBreakdown?.manufacturerMarginRate,
          materialMarkupRate: skus[0]?.costBreakdown?.materialMarkupRate,
          boxWeightKg: skus[0]?.costBreakdown?.boxWeightKg,
          spoutPriceKRW: skus[0]?.costBreakdown?.spoutPriceKRW,
          spoutQuantity: skus[0]?.costBreakdown?.spoutQuantity,
          spoutCostKRW: skus[0]?.costBreakdown?.spoutCostKRW,
          spoutRoundTripShippingKRW: skus[0]?.costBreakdown?.spoutRoundTripShippingKRW,
          outsourcingShippingKRW: skus[0]?.costBreakdown?.outsourcingShippingKRW,
        };
      };

      const itemsToSave = hasMultiQuantityResults && multiQuantityQuotes.length > 0
        ? multiQuantityQuotes.map((mq) => ({
            productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
            quantity: mq.patternTotalQuantity ?? mq.quantity,
            unitPrice: mq.unitPrice,
            totalPrice: mq.totalPrice,
            cost_breakdown: buildItemCostBreakdown(mq.skuCostDetails),
            specifications: {
              bagTypeId: state.bagTypeId,
              materialId: state.materialId,
              width: state.width,
              height: state.height,
              depth: state.depth,
              dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
              thicknessSelection: state.thicknessSelection,
              isUVPrinting: state.isUVPrinting,
              // Issue 2 fix: resolve 'auto' to the actual recommended printing method (digital/gravure)
              printingType: state.printingType === 'auto' ? (mq.recommendedMethod || 'digital') : state.printingType,
              printingColors: state.printingColors,
              doubleSided: state.doubleSided,
              postProcessingOptions: state.postProcessingOptions,
              // 【追加】側面幅
              sideWidth: state.sideWidth,
              // 【追加】シール幅（個別フィールド）
              sealWidth: state.sealWidth,
              // 【追加】内容量（製品タイプ・内容物）
              productCategory: state.productCategory,
              contentsType: state.contentsType,
              deliveryLocation: state.deliveryLocation,
              urgency: state.urgency,
              isMultiQuantityItem: true,
              // ロールフィルム専用フィールド
              ...(state.bagTypeId === 'roll_film' && {
                materialWidth: state.materialWidth,
                totalLength: state.totalLength,
                rollCount: state.rollCount,
                pitch: state.pitch,
                filmLayers: state.filmLayers
              }),
              // スパウトパウチ専用フィールド
              ...(state.bagTypeId === 'spout_pouch' && {
                spoutPosition: state.spoutPosition,
                spoutSize: state.spoutSize
              }),
              sku_quantities: hasValidSKUData ? state.skuQuantities : undefined
            }
          }))
        : [
            {
              productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
              quantity: totalSKUQuantity,
              unitPrice: result.unitPrice,
              specifications: {
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                // Issue 2 fix: resolve 'auto' to actual method
                printingType: state.printingType === 'auto' ? (result.recommendation?.method || 'digital') : state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                postProcessingOptions: state.postProcessingOptions,
                // 【追加】側面幅
                sideWidth: state.sideWidth,
                // 【追加】シール幅（個別フィールド）
                sealWidth: state.sealWidth,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                // ロールフィルム専用フィールド
                ...(state.bagTypeId === 'roll_film' && {
                  materialWidth: state.materialWidth,
                  totalLength: state.totalLength,
                  rollCount: state.rollCount,
                  pitch: state.pitch,
                  filmLayers: state.filmLayers
                }),
                // スパウトパウチ専用フィールド
                ...(state.bagTypeId === 'spout_pouch' && {
                  spoutPosition: state.spoutPosition,
                  spoutSize: state.spoutSize
                }),
                sku_quantities: hasValidSKUData ? state.skuQuantities : undefined
              }
            }
          ];

      // AC-Q5: unitPrice*quantity の再計算ではなく、丸め済みの totalPrice を優先（整合性確保）。
      // totalPrice は各 item 構築箇所で「100円単位切り上げ済み」の正確な合計。
      // totalPrice がない item のみ unitPrice*quantity にフォールバック。
      const totalAmountFromItems = (itemsToSave as Array<{ totalPrice?: number; unitPrice: number; quantity: number }>).reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0);

      const quotationData = {
        userId: user?.id,
        quotationNumber: `QT-${Date.now()}`,
        status: 'draft' as const,
        totalAmount: totalAmountFromItems,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: null as string | null,
        items: itemsToSave
      };

      const response = await fetch('/api/member/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: user?.kanjiLastName && user?.kanjiFirstName
            ? `${user.kanjiLastName} ${user.kanjiFirstName}`
            : user?.email?.split('@')[0] || 'Guest',
          customer_email: user?.email || 'guest@example.com',
          customer_phone: null,
          status: 'SENT',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: null,
          // 【追加】見積全体の原価内訳
          cost_breakdown: result.skuCostDetails?.costPerSKU?.[0]?.costBreakdown || result.breakdown?.baseCost ? {
            materialCost: Math.round(result.breakdown?.filmCost || (result.breakdown?.baseCost || 0) * 0.4),
            laminationCost: Math.round(result.breakdown?.laminationCost || (result.breakdown?.baseCost || 0) * 0.06),
            slitterCost: Math.round(result.breakdown?.slitterCost || (result.breakdown?.baseCost || 0) * 0.03),
            surfaceTreatmentCost: Math.round(result.breakdown?.surfaceTreatmentCost || 0),
            pouchProcessingCost: Math.round(result.breakdown?.pouchProcessingCost || (result.breakdown?.baseCost || 0) * 0.15),
            printingCost: Math.round(result.breakdown?.printing || (result.breakdown?.baseCost || 0) * 0.1),
            manufacturingMargin: Math.round(result.breakdown?.manufacturingMargin || (result.breakdown?.baseCost || 0) * 0.4),
            // M-2: duty フォールバックを calcDuty に統一（旧: baseCost*0.05 は約40%過小・L1064/L1084 と同じ正しい計算）
            duty: Math.round(result.breakdown?.duty ?? calcDuty(result.breakdown?.baseCost || 0, result.breakdown?.manufacturingMargin)),
            delivery: Math.round(result.breakdown?.delivery || (result.breakdown?.baseCost || 0) * 0.08),
            salesMargin: Math.round(result.breakdown?.salesMargin || (result.breakdown?.baseCost || 0) * 0.25),
            totalCost: Math.round(result.breakdown?.baseCost || (result.breakdown as Record<string, any>)?.totalCost || 0)
          } : {},
          items: itemsToSave.map(item => {
            const safeUnitPrice = (typeof item.unitPrice === 'number' && isFinite(item.unitPrice)) ? item.unitPrice : 0;
            const safeQty = (typeof item.quantity === 'number' && isFinite(item.quantity) && item.quantity > 0) ? item.quantity : 1;
            return {
              product_name: item.productName || 'カスタム製品',
              quantity: safeQty,
              unit_price: safeUnitPrice,
              specifications: item.specifications,
              cost_breakdown: (item as any).cost_breakdown || (result.skuCostDetails?.costPerSKU?.[0]?.costBreakdown || null)
            };
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

      setTimeout(() => {
        window.location.href = '/member/quotations';
      }, 1500);
    } catch (error) {
      console.error('Failed to save quote:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PersistenceStatusBanner
        persistenceStatus={persistenceStatus}
        userId={user?.id}
        setPersistenceStatus={setPersistenceStatus}
      />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          見積もり完了
        </h2>
        <p className="text-gray-600">
          以下の内容でお見積もりいたしました
        </p>
      </div>

      {result.recommendation && (
        <PrintingRecommendation
          recommendation={result.recommendation}
          showPatternComparison={showPatternComparison}
        />
      )}

      <SpecificationsCard
        state={state}
        result={result}
        showPatternComparison={showPatternComparison}
        multiQuantityQuotes={multiQuantityQuotes}
      />

      <PriceComparisonSection
        showPatternComparison={showPatternComparison}
        multiQuantityResult={multiQuantityResult}
        state={state}
        result={result}
        isAdmin={isAdmin}
        multiQuantityState={multiQuantityState}
        setSelectedQuantity={setSelectedQuantity}
        multiQuantityQuotes={multiQuantityQuotes}
        parallelProductionOptions={parallelProductionOptions}
      />

      {/* Price Breakdown - 非表示（内部詳細はユーザーに表示しない） */}
      {/*
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">価格内訳</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>フィルム素材費:</span>
            <span>¥{result.breakdown.filmCost?.toLocaleString() || result.breakdown.material.toLocaleString()}</span>
          </div>
          {result.breakdown.laminationCost !== undefined && result.breakdown.laminationCost > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span className="ml-4">└ ラミネーション費:</span>
              <span>¥{result.breakdown.laminationCost.toLocaleString()}</span>
            </div>
          )}
          {result.breakdown.slitterCost !== undefined && result.breakdown.slitterCost > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span className="ml-4">└ スリッター費:</span>
              <span>¥{result.breakdown.slitterCost.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>加工費:</span>
            <span>¥{result.breakdown.processing.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>印刷費:</span>
            <span>¥{result.breakdown.printing.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>セットアップ費:</span>
            <span>¥{result.breakdown.setup.toLocaleString()}</span>
          </div>
          {result.breakdown.discount > 0 && (
            <div className="flex justify-between text-sm text-success-600">
              <span>数量割引:</span>
              <span>−¥{result.breakdown.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>配送費:</span>
            <span>¥{result.breakdown.delivery.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>合計:</span>
              <span>¥{result.breakdown.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      */}

      <ActionButtons
        userId={user?.id}
        quotationId={quotationId}
        onReset={onReset}
        handleDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
        pdfStatus={pdfStatus}
        showPatternComparison={showPatternComparison}
        multiQuantityQuotesLength={multiQuantityQuotes.length}
      />
    </div>
  );
}

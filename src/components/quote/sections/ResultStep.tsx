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
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import { generateQuotePDF, QuoteData } from '@/lib/pdf-generator';
import { safeMap } from '@/lib/array-helpers';
import MultiQuantityComparisonTable from '../shared/MultiQuantityComparisonTable';
import { ParallelProductionOptions } from '../shared';
import { pouchCostCalculator } from '@/lib/pouch-cost-calculator';
import { MATERIAL_TYPE_LABELS_JA, getMaterialDescription } from '@/constants/materialTypes';
import { THICKNESS_TYPE_JA } from '@/constants/enToJa';
import { RefreshCw, Download, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ButtonSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import CostBreakdownPanel from '../shared/CostBreakdownPanel';
import type { MultiQuantityResult } from '@/types/multi-quantity';
import type { ParallelProductionOption } from '../shared';

interface ResultStepProps {
  result: UnifiedQuoteResult;
  multiQuantityResult: MultiQuantityResult | null;
  onReset: () => void;
}

/**
 * Component for displaying quote results with actions
 */
export function ResultStep({ result, multiQuantityResult, onReset }: ResultStepProps) {
  const router = useRouter();
  const state = useQuoteState();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 経済的数量提案・並列生産オプション用のステート
  const [showOptimizationSuggestions, setShowOptimizationSuggestions] = useState(false);
  const [parallelProductionOptions, setParallelProductionOptions] = useState<ParallelProductionOption[]>([]);

  // TEST: Simple console.log to verify code changes are reflected
  console.log('[ResultStep] TEST - Component rendering!');

  // Debug: Log state.bagTypeId value on mount and when it changes
  useEffect(() => {
    console.log('[ResultStep] useEffect - state.bagTypeId:', state.bagTypeId);
    console.log('[ResultStep] useEffect - is roll_film?:', state.bagTypeId === 'roll_film');
    console.log('[ResultStep] useEffect - state keys:', Object.keys(state));
  }, [state.bagTypeId]);

  // 見積結果ページ表示時に自動でPDF生成・DB保存
  const hasAutoSaved = useRef(false);

  useEffect(() => {
    console.log('[ResultStep] Auto-save useEffect triggered', { result: !!result, hasAutoSaved: hasAutoSaved.current });

    // 既に自動保存済みの場合はスキップ
    if (hasAutoSaved.current) {
      console.log('[ResultStep] Already auto-saved, skipping');
      return;
    }

    // resultが存在すれば自動保存実行（認証不要）
    if (result && result.totalPrice > 0) {
      console.log('[ResultStep] Starting auto-save with result:', result);
      hasAutoSaved.current = true;
      autoGenerateAndSave();
    } else {
      console.log('[ResultStep] Result not ready or invalid:', result);
    }
  }, [result?.totalPrice, result?.unitPrice]);

  // ブラウザの戻るボタンを無効化（強化版）
  useEffect(() => {
    console.log('[ResultStep] Setting up back button prevention');

    // 履歴を操作して戻るボタンを無効化
    const preventBack = (event: PopStateEvent) => {
      console.log('[ResultStep] Back button attempted, blocking navigation');
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
        console.log('[ResultStep] Blocking Alt+Left Arrow');
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      // Backspace (入力フィールド以外)
      if (event.key === 'Backspace' &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
        console.log('[ResultStep] Blocking Backspace outside input fields');
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', preventKeyboardNavigation, { capture: true });

    // クリーンアップ
    return () => {
      console.log('[ResultStep] Cleaning up back button prevention');
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
  const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  // Get multi-quantity state at component level (before any handlers)
  const { state: multiQuantityState } = useMultiQuantityQuote();

  // Get multi-quantity calculations from prop first, then fallback to context
  const multiQuantityCalculations = multiQuantityResult?.calculations || multiQuantityState.multiQuantityResults;
  const hasMultiQuantityResults = multiQuantityCalculations && multiQuantityCalculations.size > 0;

  // Robust SKU mode detection - prioritize result data, fallback to state calculation
  const hasValidSKUData = result?.hasValidSKUData ?? (
    state.skuCount > 1 &&
    state.skuQuantities &&
    state.skuQuantities.length === state.skuCount &&
    state.skuQuantities.every(qty => qty && qty >= 100)
  );

  // Debug logging for SKU mode detection
  console.log('[ResultStep] SKU Mode Detection Debug:');
  console.log('[ResultStep] - result?.hasValidSKUData:', result?.hasValidSKUData);
  console.log('[ResultStep] - result?.skuCount:', result?.skuCount);
  console.log('[ResultStep] - result?.skuQuantities:', result?.skuQuantities);
  console.log('[ResultStep] - state.skuCount:', state.skuCount);
  console.log('[ResultStep] - state.skuQuantities:', state.skuQuantities);
  console.log('[ResultStep] - state.skuQuantities.length:', state.skuQuantities?.length);
  console.log('[ResultStep] - Length check (=== skuCount):', state.skuQuantities?.length === state.skuCount);
  console.log('[ResultStep] - Every check (all >= 100):', state.skuQuantities?.every(qty => qty && qty >= 100));
  console.log('[ResultStep] - calculated hasValidSKUData:', hasValidSKUData);
  console.log('[ResultStep] - willShowSKU:', hasValidSKUData);
  console.log('[ResultStep] - result.skuCostDetails:', result.skuCostDetails);
  console.log('[ResultStep] ===== STATE DEBUG =====');
  console.log('[ResultStep] - state.bagTypeId:', state.bagTypeId);
  console.log('[ResultStep] - state.bagTypeId type:', typeof state.bagTypeId);
  console.log('[ResultStep] - isRollFilm (===):', state.bagTypeId === 'roll_film');
  console.log('[ResultStep] - Full state keys:', Object.keys(state));
  console.log('[ResultStep] ===== END STATE DEBUG =====');

  // Build quotes array from multi-quantity results
  const multiQuantityQuotes = hasMultiQuantityResults
    ? Array.from(multiQuantityCalculations.entries()).map(([quantity, quote]) => ({
        quantity: quantity,
        unitPrice: quote.unitPrice,
        totalPrice: quote.totalPrice,
        discountRate: 0,
        priceBreak: '通常',
        leadTimeDays: quote.leadTimeDays || result.leadTimeDays,
        isValid: true
      })).sort((a, b) => a.quantity - b.quantity)
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
          setParallelProductionOptions(suggestion.parallelProductionOptions);
          setShowOptimizationSuggestions(true);
        }
      })();
    } else {
    }
  }, [state.bagTypeId, state.quantity, state.width, state.height, state.depth, result.unitPrice, state.filmLayers, state.materialId, state.thicknessSelection, state.postProcessingOptions]);

  // Helper function to get material description in Japanese
  const getMaterialDescriptionJa = (materialId: string): string => {
    const descriptions: Record<string, string> = {
      'pet_al': 'PET+AL (高バリア)',
      'pet_vmpet': 'PET+VMPET (蒸着)',
      'pet_ldpe': 'PET+LLDPE (透明)',
      'pet_ny_al': 'PET+NY+AL (超高バリア)'
    };
    return descriptions[materialId] || materialId;
  };

  // Get material label (for PDF display)
  const getMaterialLabelJa = (materialId: string): string => {
    return MATERIAL_TYPE_LABELS_JA[materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || materialId;
  };

  // Get film structure specification from materials data (Japanese)
  // MaterialSelection.tsxの値と統一
  const getFilmStructureSpecJa = (materialId: string, thicknessId: string): string => {
    const materialSpecs: Record<string, Record<string, string>> = {
      'pet_al': {
        'light': 'PET 12μ / AL 7μ / PET 12μ / LLDPE 50μ',
        'medium': 'PET 12μ / AL 7μ / PET 12μ / LLDPE 70μ',
        'standard': 'PET 12μ / AL 7μ / PET 12μ / LLDPE 90μ',
        'heavy': 'PET 12μ / AL 7μ / PET 12μ / LLDPE 100μ',
        'ultra': 'PET 12μ / AL 7μ / PET 12μ / LLDPE 110μ'
      },
      'pet_vmpet': {
        'light': 'PET 12μ / VMPET 12μ / PET 12μ / LLDPE 50μ',
        'medium': 'PET 12μ / VMPET 12μ / PET 12μ / LLDPE 70μ',
        'standard': 'PET 12μ / VMPET 12μ / PET 12μ / LLDPE 90μ',
        'heavy': 'PET 12μ / VMPET 12μ / PET 12μ / LLDPE 100μ',
        'ultra': 'PET 12μ / VMPET 12μ / PET 12μ / LLDPE 110μ'
      },
      'pet_ldpe': {
        'light': 'PET 12μ / LLDPE 50μ',
        'medium': 'PET 12μ / LLDPE 70μ',
        'standard': 'PET 12μ / LLDPE 90μ',
        'heavy': 'PET 12μ / LLDPE 100μ',
        'ultra': 'PET 12μ / LLDPE 110μ'
      },
      'pet_ny_al': {
        'light': 'PET 12μ / NY 16μ / AL 7μ / LLDPE 50μ',
        'medium': 'PET 12μ / NY 16μ / AL 7μ / LLDPE 70μ',
        'standard': 'PET 12μ / NY 16μ / AL 7μ / LLDPE 90μ',
        'heavy': 'PET 12μ / NY 16μ / AL 7μ / LLDPE 100μ',
        'ultra': 'PET 12μ / NY 16μ / AL 7μ / LLDPE 110μ'
      },
      'ny_lldpe': {
        'light': 'NY 15μ / LLDPE 50μ',
        'medium': 'NY 15μ / LLDPE 70μ',
        'standard': 'NY 15μ / LLDPE 90μ',
        'heavy': 'NY 15μ / LLDPE 100μ',
        'ultra': 'NY 15μ / LLDPE 110μ'
      },
      'kraft_vmpet_lldpe': {
        'light_50': 'Kraft 80g/m² / VMPET 12μ / LLDPE 50μ',
        'standard_70': 'Kraft 80g/m² / VMPET 12μ / LLDPE 70μ',
        'heavy_90': 'Kraft 80g/m² / VMPET 12μ / LLDPE 90μ',
        'ultra_100': 'Kraft 80g/m² / VMPET 12μ / LLDPE 100μ',
        'maximum_110': 'Kraft 80g/m² / VMPET 12μ / LLDPE 110μ'
      },
      'kraft_pet_lldpe': {
        'light_50': 'Kraft 80g/m² / PET 12μ / LLDPE 50μ',
        'standard_70': 'Kraft 80g/m² / PET 12μ / LLDPE 70μ',
        'heavy_90': 'Kraft 80g/m² / PET 12μ / LLDPE 90μ',
        'ultra_100': 'Kraft 80g/m² / PET 12μ / LLDPE 100μ',
        'maximum_110': 'Kraft 80g/m² / PET 12μ / LLDPE 110μ'
      }
    };

    return materialSpecs[materialId]?.[thicknessId] || '指定なし';
  };

  // Helper function to get bag type description in Japanese
  const getBagTypeDescriptionJa = (bagTypeId: string): string => {
    const descriptions: Record<string, string> = {
      'flat_3_side': '三方シール平袋',
      'stand_up': 'スタンドパウチ',
      'box': 'ガゼットパウチ',
      'spout_pouch': 'スパウトパウチ',
      'roll_film': 'ロールフィルム'
    };
    return descriptions[bagTypeId] || bagTypeId;
  };

  // Helper function to get bag type label
  const getBagTypeLabel = (bagTypeId: string): string => {
    const labels: Record<string, string> = {
      'flat_3_side': '三方シール平袋',
      'stand_up': 'スタンドパウチ',
      'box': 'ガゼットパウチ',
      'spout_pouch': 'スパウトパウチ',
      'roll_film': 'ロールフィルム'
    };
    return labels[bagTypeId] || bagTypeId;
  };

  // Helper function to get post-processing label
  const getPostProcessingLabel = (optionId: string): string => {
    // DEBUG: Log the received optionId
    console.log('[getPostProcessingLabel] Received optionId:', optionId, 'type:', typeof optionId);
    const labels: Record<string, string> = {
      'zipper-yes': 'ジッパー付き',
      'zipper-no': 'ジッパーなし',
      'hanging_hole-6mm': '吊り下げ穴 (6mm)',
      'hanging_hole-8mm': '吊り下げ穴 (8mm)',
      'zipper-position-delegate': 'ジッパー位置 (お任せ)',
      'zipper-position-specify': 'ジッパー位置 (指定)',
      'zipper-position-any': 'ジッパー位置 (お任せ)',
      'zipper-position-specified': 'ジッパー位置 (指定)',
      'glossy': '光沢仕上げ',
      'matte': 'マット仕上げ',
      'notch-yes': 'Vノッチ',
      'notch-straight': '直線ノッチ',
      'notch-no': 'ノッチなし',
      'hang-hole-6mm': '吊り下げ穴 (6mm)',
      'hang-hole-8mm': '吊り下げ穴 (8mm)',
      'hang-hole-no': '吊り穴なし',
      'corner-round': '角丸',
      'corner-square': '角直角',
      'valve-yes': 'ガス抜きバルブ',
      'valve-no': 'バルブなし',
      'top-open': '上端開封',
      'bottom-open': '下端開封',
      // シール幅関連（フィルタリング対象識別用）
      'sealing-width-5mm': 'シール幅 5mm',
      'sealing-width-7.5mm': 'シール幅 7.5mm',
      'sealing-width-7-5mm': 'シール幅 7.5mm',
      'sealing-width-10mm': 'シール幅 10mm',
      'sealing width 5mm': 'シール幅 5mm',
      'sealing width 7.5mm': 'シール幅 7.5mm',
      'sealing width 10mm': 'シール幅 10mm',
      // マチ印刷関連
      'machi-printing-yes': 'マチ印刷あり',
      'machi-printing-no': 'マチ印刷なし'
    };
    const result = labels[optionId];
    console.log('[getPostProcessingLabel] labels[optionId]:', result);
    console.log('[getPostProcessingLabel] Available machi keys:', Object.keys(labels).filter(k => k.includes('machi')));
    return result || optionId.replace(/[-_]/g, ' ');
  };

  // Filter post-processing options for roll film - only show surface treatments
  const getFilteredPostProcessingOptions = (): string[] => {
    if (!state.postProcessingOptions || state.postProcessingOptions.length === 0) {
      return [];
    }

    // For roll_film and spout_pouch, only show glossy/matte surface treatments
    if (state.bagTypeId === 'roll_film' || state.bagTypeId === 'spout_pouch') {
      const allowedOptions = ['glossy', 'matte'];
      return state.postProcessingOptions.filter(opt => allowedOptions.includes(opt));
    }

    // For all other bag types, filter out seal width options since they are displayed separately
    // sealWidth is stored in state.sealWidth and displayed as a separate field
    const sealWidthOptionIds = [
      'sealing-width-5mm',
      'sealing-width-7.5mm',
      'sealing-width-7-5mm',
      'sealing-width-10mm',
      'seal-width-5mm',
      'seal-width-7.5mm',
      'seal-width-7-5mm',
      'seal-width-10mm'
    ];

    return state.postProcessingOptions.filter(opt =>
      !sealWidthOptionIds.includes(opt) &&
      !opt.includes('sealing width') &&
      !opt.includes('sealing-width') &&
      !opt.includes('seal-width') &&
      opt !== '5mm' &&
      opt !== '7.5mm' &&
      opt !== '7-5mm' &&
      opt !== '10mm'
    );
  };

  // Helper function to translate spout position to Japanese
  const translateSpoutPosition = (position: string): string => {
    const translations: Record<string, string> = {
      'top-center': '上端中央',
      'top-left': '上端左',
      'top-right': '上端右',
      'center': '中央',
      'bottom-center': '下端中央'
    };
    return translations[position] || position;
  };

  // Helper to generate PDF quote data
  const generateQuoteData = (): QuoteData => {
    const today = new Date();
    const issueDate = today.toISOString().split('T')[0];
    const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate total SKU quantity for PDF generation
    const totalSKUQuantity = state.skuQuantities?.reduce((sum, qty) => sum + (Number(qty) || 0), 0) || state.quantity;

    // Build items from SKU mode, multi-quantity quotes, or single quote
    const items = hasValidSKUData
      ? state.skuQuantities.map((qty, index) => {
          // Use SKU cost details if available from pricing engine
          const skuCost = result.skuCostDetails?.costPerSKU?.[index];

          // 総価格を各SKUの数量に按分して金額を計算
          // 後加工乗数適用後の価格（result.totalPrice）を使用することで、
          // SKU数量ステップと結果ステップで価格を統一
          const totalQuantity = state.skuQuantities.reduce((sum, q) => sum + q, 0);
          const proportion = qty / totalQuantity;

          // unitPriceは全体の単価を使用（小数点以下保持）
          let unitPrice: number;
          let amount: number;

          unitPrice = result.unitPrice;
          amount = result.totalPrice * proportion;

          return {
            id: `sku-${index + 1}`,
            name: `SKU ${index + 1}`,
            description: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
            quantity: qty,
            unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
            unitPrice,
            amount,
            // Add SKU breakdown for detailed pricing info
            skuBreakdown: skuCost ? [{
              skuNumber: index + 1,
              quantity: qty
            }] : undefined
          };
        })
      : hasMultiQuantityResults && multiQuantityQuotes.length > 0
      ? multiQuantityQuotes.map((quote, index) => ({
          id: `item-${index + 1}`,
          name: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
          description: `サイズ: ${state.width}×${state.height}${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `×${state.depth}` : ''}mm`,
          quantity: quote.quantity,
          unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
          unitPrice: quote.unitPrice,
          amount: quote.totalPrice
        }))
      : [{
          id: 'item-1',
          name: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
          description: `サイズ: ${state.width}×${state.height}${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `×${state.depth}` : ''}mm`,
          quantity: totalSKUQuantity,
          unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
          unitPrice: result.unitPrice,
          amount: result.totalPrice
        }];

    // Default remarks
    const defaultRemarks = `※製造工程上の都合により、実際の納品数量はご注文数量に対し最大10％程度の過不足が生じる場合がございます。
数量の完全保証はいたしかねますので、あらかじめご了承ください。
※不足分につきましては、実際に納品した数量に基づきご請求いたします。
前払いにてお支払いいただいた場合は、差額分を返金いたします。
※原材料価格の変動等により、見積有効期限経過後は価格が変更となる場合がございます。
再見積の際は、あらかじめご了承くださいますようお願いいたします。
※本見積金額には郵送費を含んでおります。
※お客様によるご確認の遅れ、その他やむを得ない事情により、納期が前後する場合がございます。
※年末年始等の長期休暇期間を挟む場合、通常より納期が延びる可能性がございます。
※天候不良、事故、交通事情等の影響により、やむを得ず納期が遅延する場合がございますので、あらかじめご了承ください。`;

    // Helper function to parse post-processing options
    const parseOptionalProcessing = () => {
      let options = state.postProcessingOptions || [];

      // ロールフィルム・スパウトパウチの場合、表面処理のみを抽出
      if (state.bagTypeId === 'roll_film' || state.bagTypeId === 'spout_pouch') {
        const allowedOptions = ['glossy', 'matte'];
        options = options.filter(opt => allowedOptions.includes(opt));

        // glossy/matteがない場合はデフォルトでglossyを追加
        if (options.length === 0) {
          options = ['glossy'];
        }
        console.log('[parseOptionalProcessing] Filtered for roll_film/spout_pouch. options:', options);
      }

      const parsed = {
        zipper: options.includes('zipper-yes'),
        notch: options.includes('notch-yes'),
        hangingHole: options.includes('hang-hole-6mm') || options.includes('hang-hole-8mm'),
        hangHoleSize: options.includes('hang-hole-6mm') ? '6mm' as const :
                      options.includes('hang-hole-8mm') ? '8mm' as const : undefined,
        cornerProcessing: options.includes('corner-round'),
        gasValve: options.includes('valve-yes'),
        easyCut: options.includes('top-open') || options.includes('bottom-open'),
        dieCut: false,
        // 追加: 表面処理 - マットが選択されている場合はマットを優先
        surfaceFinish: options.includes('matte') ? 'マット' as const :
                       options.includes('glossy') ? '光沢' as const : undefined,
        // 追加: ジッパー位置指定
        zipperPositionSpecified: options.includes('zipper-position-specified'),
        // 追加: 開封位置
        openingPosition: options.includes('top-open') ? '上端' as const :
                         options.includes('bottom-open') ? '下端' as const : undefined
      };
      // デバッグログ: 表面処理の抽出結果を確認
      console.log('[parseOptionalProcessing] state.postProcessingOptions:', state.postProcessingOptions);
      console.log('[parseOptionalProcessing] bagTypeId:', state.bagTypeId);
      console.log('[parseOptionalProcessing] filtered options:', options);
      console.log('[parseOptionalProcessing] parsed.surfaceFinish:', parsed.surfaceFinish);
      console.log('[parseOptionalProcessing] includes glossy?', options.includes('glossy'));
      console.log('[parseOptionalProcessing] includes matte?', options.includes('matte'));
      return parsed;
    };

    // Get printing information
    const getPrintingInfo = () => {
      const printingType = state.isUVPrinting ? 'UVデジタル印刷' : (state.printingType || 'グラビア印刷');
      const colors = state.printingColors || 1;
      const sided = state.doubleSided ? ' (両面)' : '';
      return {
        printingType,
        colors: `${colors}色${sided}`
      };
    };

    const printingInfo = getPrintingInfo();

    // 内容物ラベルマッピング（4つのフィールド対応）
    const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
      'food': '食品',
      'health_supplement': '健康食品',
      'cosmetic': '化粧品',
      'quasi_drug': '医薬部外品',
      'drug': '医薬品',
      'other': 'その他'
    };

    const CONTENTS_TYPE_LABELS: Record<string, string> = {
      'solid': '固体',
      'powder': '粉体',
      'liquid': '液体'
    };

    const MAIN_INGREDIENT_LABELS: Record<string, string> = {
      'general_neutral': '一般/中性',
      'oil_surfactant': 'オイル/界面活性剤',
      'acidic_salty': '酸性/塩分',
      'volatile_fragrance': '揮発性/香料',
      'other': 'その他'
    };

    const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
      'general_roomTemp': '一般/常温',
      'light_oxygen_sensitive': '光/酸素敏感',
      'refrigerated': '冷凍保管',
      'high_temp_sterilized': '高温殺菌',
      'other': 'その他'
    };

    // contentsフィールドを生成: 4つのフィールドから
    console.log('[ResultStep] contents fields from state:', {
      productCategory: state.productCategory,
      contentsType: state.contentsType,
      mainIngredient: state.mainIngredient,
      distributionEnvironment: state.distributionEnvironment
    });

    const categoryLabel = PRODUCT_CATEGORY_LABELS[state.productCategory || ''] || '';
    const typeLabel = CONTENTS_TYPE_LABELS[state.contentsType || ''] || '';
    const ingredientLabel = MAIN_INGREDIENT_LABELS[state.mainIngredient || ''] || '';
    const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[state.distributionEnvironment || ''] || '';

    console.log('[ResultStep] contents labels:', { categoryLabel, typeLabel, ingredientLabel, environmentLabel });

    let contents = '粉体'; // デフォルト値（後方互換性）
    if (categoryLabel && typeLabel && ingredientLabel && environmentLabel) {
      // 4つのフィールドすべてがある場合
      contents = `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`;
    } else if (categoryLabel && typeLabel) {
      // 後方互換性: productCategoryとcontentsTypeのみの場合
      contents = `${categoryLabel}（${typeLabel}）`;
    } else if (categoryLabel) {
      contents = categoryLabel;
    } else if (typeLabel) {
      contents = typeLabel;
    }

    // Build specifications with defaults
    const quoteSpecs: QuoteData['specifications'] = {
      bagType: getBagTypeDescriptionJa(state.bagTypeId) || '指定なし',
      contents,
      material: getMaterialLabelJa(state.materialId) || '指定なし',
      size: `${state.width || 0}×${state.height || 0}${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `×${state.depth}` : ''}mm`,
      thicknessType: state.thicknessSelection && state.materialId
        ? getFilmStructureSpecJa(state.materialId, state.thicknessSelection)
        : '指定なし',
      sealWidth: state.sealWidth || '5mm',
      sealDirection: '上',
      // ノッチ形状: Vノッチ、直線ノッチ、ノッチなし
      notchShape: state.postProcessingOptions?.includes('notch-yes') ? 'V' :
                  state.postProcessingOptions?.includes('notch-straight') ? '直線' :
                  state.postProcessingOptions?.includes('notch-no') ? 'なし' : undefined,
      notchPosition: (state.postProcessingOptions?.includes('notch-yes') ||
                      state.postProcessingOptions?.includes('notch-straight')) ? '指定位置' : undefined,
      // 吊り下げ穴
      hanging: (state.postProcessingOptions?.includes('hang-hole-6mm') ||
                state.postProcessingOptions?.includes('hang-hole-8mm')) ? 'あり' : 'なし',
      hangingPosition: state.postProcessingOptions?.includes('hang-hole-6mm') ? '6mm' :
                      state.postProcessingOptions?.includes('hang-hole-8mm') ? '8mm' : undefined,
      zipperPosition: state.postProcessingOptions?.includes('zipper-yes') ? '指定位置' : undefined,
      cornerR: state.postProcessingOptions?.includes('corner-round') ? 'R5' :
               state.postProcessingOptions?.includes('corner-square') ? 'R0' : undefined,
      // マチ印刷（スタンドパウチ、合掌パウチ、三方シール、ガゼットパウチのみ）
      machiPrinting: (state.bagTypeId === 'stand_up' ||
                      state.bagTypeId === 'lap_seal' ||
                      state.bagTypeId === 'flat_3_side' ||
                      state.bagTypeId === 'box') &&
                     state.depth > 0
                     ? (state.postProcessingOptions?.includes('machi-printing-yes') ? 'あり' : 'なし')
                     : undefined,
      // スパウトパウチ用: スパウト位置、スパウトサイズ、マチ有無
      spoutPosition: state.bagTypeId === 'spout_pouch' && state.spoutPosition ? translateSpoutPosition(state.spoutPosition) : undefined,
      spoutSize: state.bagTypeId === 'spout_pouch' && state.spoutSize ? `${state.spoutSize}パイ（φ${state.spoutSize}mm）` : undefined,
      hasGusset: state.bagTypeId === 'spout_pouch' && state.hasGusset !== undefined ? (state.hasGusset ? 'マチあり（スタンドパウチ準用）' : 'マチなし（平袋準用）') : undefined,
      // ロールフィルム用: 原反幅、総長さ、ロール数、ピッチ
      rollFilmSpecs: state.bagTypeId === 'roll_film' ? {
        materialWidth: state.materialWidth,
        totalLength: state.totalLength,
        rollCount: state.rollCount,
        pitch: state.pitch  // デザインの繰り返し周期
      } : undefined
    };

    // デバッグログ
    console.log('[generateQuoteData] postProcessingOptions:', state.postProcessingOptions);
    console.log('[generateQuoteData] quoteSpecs FULL:', JSON.stringify(quoteSpecs, null, 2));
    console.log('[generateQuoteData] quoteSpecs.hanging:', quoteSpecs.hanging);
    console.log('[generateQuoteData] quoteSpecs.hangingPosition:', quoteSpecs.hangingPosition);
    console.log('[generateQuoteData] quoteSpecs.notchShape:', quoteSpecs.notchShape);
    console.log('[generateQuoteData] quoteSpecs.cornerR:', quoteSpecs.cornerR);
    console.log('[generateQuoteData] quoteSpecs.machiPrinting:', quoteSpecs.machiPrinting);
    console.log('[generateQuoteData] bagTypeId:', state.bagTypeId, 'depth:', state.depth);

    return {
      quoteNumber: `QT-${Date.now()}`,
      issueDate,
      expiryDate,
      customerName: user?.kanjiLastName && user?.kanjiFirstName
        ? `${user.kanjiLastName} ${user.kanjiFirstName}`
        : user?.companyName || '有限会社加豆フーズ',
      companyName: user?.companyName || '有限会社加豆フーズ',
      postalCode: user?.postalCode || '〒379-2311',
      address: user?.prefecture && user?.city && user?.street
        ? `${user.prefecture}${user.city}${user.street}`
        : '群馬県みどり市懸町阿佐美1940',
      contactPerson: user?.kanjiLastName && user?.kanjiFirstName
        ? `${user.kanjiLastName} ${user.kanjiFirstName}`
        : '田中 太郎',
      items,
      // Add SKU data if in SKU mode
      skuData: hasValidSKUData ? {
        count: state.skuCount,
        items: state.skuQuantities.map((qty, index) => {
          // 常にresultの最終価格を使用（SKU追加料を含む）
          // SKU原価(costJPY)ではなく最終価格(result.totalPrice)を使用することで、
          // SKU追加料((skuCount - 1) × ¥10,000)が含まれた正確な価格を表示
          const totalQuantity = state.skuQuantities.reduce((sum, q) => sum + q, 0);
          const proportion = qty / totalQuantity;

          const unitPrice = result.unitPrice;
          const totalPrice = result.totalPrice * proportion;

          return {
            skuNumber: index + 1,
            quantity: qty,
            unitPrice,
            totalPrice
          };
        })
      } : undefined,
      specifications: quoteSpecs,
      optionalProcessing: parseOptionalProcessing(),
      paymentTerms: '銀行振込（前払い）',
      deliveryDate: `校了から約${result.leadTimeDays}日`,
      deliveryLocation: state.deliveryLocation === 'domestic' ? '日本国内' : '海外',
      validityPeriod: `見積日から30日間\n有効期限経過後は価格変更となる場合がございますので\n再見積の際はご相談ください`,
      remarks: defaultRemarks
    };
  };

  const autoGenerateAndSave = async () => {
    console.log('[autoGenerateAndSave] 自動PDF生成・DB保存開始');

    try {
      // 1. PDF生成
      const quoteData = generateQuoteData();
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: `見積書_${quoteData.quoteNumber}.pdf`
      });

      if (pdfResult.success && pdfResult.pdfBuffer) {
        // 2. 自動ダウンロード（バックグラウンド）
        const blob = new Blob([pdfResult.pdfBuffer], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = pdfResult.filename || `見積書_${quoteData.quoteNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        if (a.parentNode) document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

        // 3. DB保存
        const savedQuotationId = await saveQuotationToDatabase();

        // 4. Storage保存（認証済みのみ）- エラーハンドリング追加
        if (savedQuotationId && pdfResult.pdfBuffer) {
          try {
            const pdfBase64 = arrayBufferToBase64(pdfResult.pdfBuffer);
            const saveResponse = await fetch(`/api/member/quotations/${savedQuotationId}/save-pdf`, {
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
        console.log('[autoGenerateAndSave] 完了');
      }
    } catch (error) {
      console.error('[autoGenerateAndSave] エラー:', error);
      // エラーでもユーザー体験を妨げない
    }
  };

  const handleDownloadPdf = async () => {
    console.log('[handleDownloadPdf] ========== START ==========');
    console.log('[handleDownloadPdf] state.postProcessingOptions:', state.postProcessingOptions);
    console.log('[handleDownloadPdf] state.bagTypeId:', state.bagTypeId);
    console.log('[handleDownloadPdf] Includes matte?', state.postProcessingOptions?.includes('matte'));
    console.log('[handleDownloadPdf] Includes glossy?', state.postProcessingOptions?.includes('glossy'));

    // 製品タイプ別必須フィールドバリデーション
    const validation = validateProductTypeSpecificFields(state);
    if (!validation.valid) {
      const errorMessage = `以下の必須項目が入力されていません:\n${validation.missingFields.join('\n')}`;
      alert(errorMessage);
      return;
    }

    setIsGeneratingPdf(true);
    setPdfStatus('idle');

    try {
      console.log('[handleDownloadPdf] Calling generateQuoteData...');
      const quoteData = generateQuoteData();
      console.log('[handleDownloadPdf] quoteData.optionalProcessing:', quoteData.optionalProcessing);
      console.log('[handleDownloadPdf] quoteData.optionalProcessing.surfaceFinish:', quoteData.optionalProcessing.surfaceFinish);
      console.log('[handleDownloadPdf] Calling generateQuotePDF...');
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: `見積書_${quoteData.quoteNumber}.pdf`
      });
      console.log('[handleDownloadPdf] pdfResult:', pdfResult);

      if (pdfResult.success) {
        // PDF 다운로드 실행 - 브라우저 네이티브 다운로드 UI 회피
        console.log('[handleDownloadPdf] Initiating PDF download...');

        if (pdfResult.pdfBuffer) {
          const blob = new Blob([pdfResult.pdfBuffer], { type: 'application/pdf' });

          // URL.createObjectURL을 사용하여 다운로드
          const objectUrl = URL.createObjectURL(blob);

          try {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = objectUrl;
            a.download = pdfResult.filename || `見積書_${quoteData.quoteNumber}.pdf`;
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

          console.log('[handleDownloadPdf] PDF downloaded:', pdfResult.filename);
        }

        // 2. 自動的にデータベースに保存（ゲストユーザーも対応）
        console.log('[handleDownloadPdf] 自動保存開始...');
        const savedQuotationId = await saveQuotationToDatabase();

        // 3. PDFをStorageに保存（ユーザー認証済みの場合）
        if (savedQuotationId && user?.id && pdfResult.pdfBuffer) {
          try {
            console.log('[handleDownloadPdf] Saving PDF to Storage...');
            const pdfBase64 = arrayBufferToBase64(pdfResult.pdfBuffer);

            const saveResponse = await fetch(`/api/member/quotations/${savedQuotationId}/save-pdf`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                pdfData: `data:application/pdf;base64,${pdfBase64}`,
              }),
            });

            if (saveResponse.ok) {
              const saveResult = await saveResponse.json();
              console.log('[handleDownloadPdf] PDF saved to Storage:', saveResult.pdf_url);
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
      console.error('[handleDownloadPdf] ERROR name:', error instanceof Error ? error.name : 'unknown');
      console.error('[handleDownloadPdf] ERROR message:', error instanceof Error ? error.message : String(error));
      console.error('[handleDownloadPdf] ERROR stack:', error instanceof Error ? error.stack : 'no stack');
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 3000);
      alert(`PDF生成中にエラーが発生しました。\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      console.log('[handleDownloadPdf] ========== END ==========');
      setIsGeneratingPdf(false);
    }
  };

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // データベース保存関数 (handleDownloadPdfから自動呼び出し)
  // ✅ エラーハンドリング改善
  // 戻り値: 保存成功時は見積もりID、失敗時はnull
  const saveQuotationToDatabase = async (): Promise<string | null> => {
    // ✅ 認証チェック: ログインしていない場合は保存をスキップ
    if (!user?.id) {
      console.log('[saveQuotationToDatabase] User not authenticated, skipping auto-save');
      return null;
    }

    try {
      // ========================================
      // 原価内訳の計算（DB保存用）
      // ========================================

      // 🔍 デバッグ: resultオブジェクトの値を確認
      console.log('[saveQuotationToDatabase] DEBUG result:', {
        totalPrice: result.totalPrice,
        unitPrice: result.unitPrice,
        baseCost: result.breakdown?.baseCost,
        quantity: result.quantity,
        skuCostDetails: result.skuCostDetails,
        hasValidSKUData: result.hasValidSKUData
      });

      // SKUモードの場合はskuCostDetailsから、通常モードはresultから計算
      let costBreakdown: any = null;

      if (result.skuCostDetails?.costPerSKU && result.skuCostDetails.costPerSKU.length > 0) {
        // 複数SKUモード: 各SKUの原価を合計
        const firstSkuCost = result.skuCostDetails.costPerSKU[0];
        const totalBaseCost = result.skuCostDetails.costPerSKU.reduce((sum: number, sku: any) => sum + (sku.baseCost || 0), 0);

        costBreakdown = {
          materialCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.materialCost || 0), 0)),
          laminationCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.laminationCost || 0), 0)),
          slitterCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.slitterCost || 0), 0)),
          surfaceTreatmentCost: 0,
          pouchProcessingCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.pouchProcessingCost || 0), 0)),
          printingCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: any) => sum + (sku.costBreakdown?.printingCost || 0), 0)),
          // 修正: マージン・関税・配送料を適切に計算
          manufacturingMargin: Math.round(totalBaseCost * 0.4), // 製造者マージン40%
          duty: Math.round(totalBaseCost * 0.05), // 関税5%
          delivery: Math.round(totalBaseCost * 0.08), // 配送料8%
          salesMargin: Math.round(totalBaseCost * 0.2), // 販売マージン20%
          totalCost: Math.round(totalBaseCost)
        };
      } else if (result.breakdown?.baseCost || result.breakdown?.filmCost || result.breakdown?.pouchProcessingCost) {
        // 【追加】result.breakdownから直接計算（SKUモード対応）
        const breakdown = result.breakdown;
        const baseCost = breakdown.baseCost || breakdown.filmCost || 0;
        costBreakdown = {
          materialCost: Math.round(breakdown.filmCost || baseCost * 0.4),
          laminationCost: Math.round(breakdown.laminationCost || baseCost * 0.06),
          slitterCost: Math.round(breakdown.slitterCost || baseCost * 0.03),
          surfaceTreatmentCost: 0,
          pouchProcessingCost: Math.round(breakdown.pouchProcessingCost || baseCost * 0.15),
          printingCost: Math.round(breakdown.printing || baseCost * 0.1),
          // unified-pricing-engine.tsで計算された値を使用
          manufacturingMargin: Math.round(breakdown.manufacturingMargin || baseCost * 0.4),
          duty: Math.round(breakdown.duty || baseCost * 0.05),
          delivery: Math.round(breakdown.delivery || baseCost * 0.08),
          salesMargin: Math.round(breakdown.salesMargin || baseCost * 0.2),
          totalCost: Math.round(baseCost)
        };
      } else if ((result.totalPrice && result.totalPrice > 0) || (result.unitPrice && result.unitPrice > 0) || (result.breakdown?.baseCost && result.breakdown.baseCost > 0)) {
        // 通常モード・単一SKUモード: resultから計算
        // 簡易的な原価計算（正確な値ではないが、表示用としては十分）
        const baseCost = result.breakdown?.baseCost || result.totalPrice || (result.unitPrice * (result.quantity || state.quantity || 1)) || 0;
        costBreakdown = {
          materialCost: Math.round(baseCost * 0.4), // 約40%
          laminationCost: Math.round(baseCost * 0.06), // 約6%
          slitterCost: Math.round(baseCost * 0.03), // 約3%
          surfaceTreatmentCost: 0,
          pouchProcessingCost: Math.round(baseCost * 0.15), // 約15%
          printingCost: Math.round(baseCost * 0.1), // 約10%
          manufacturingMargin: 0,
          duty: 0,
          delivery: Math.round(baseCost * 0.08), // 約8%
          salesMargin: Math.round(baseCost * 0.2), // 約20%
          totalCost: Math.round(baseCost)
        };
      }

      console.log('[saveQuotationToDatabase] 原価内訳:', costBreakdown);

      // アイテムデータ変換
      // PDF表示用のquoteSpecsとは別に、DB保存用のクリーンなデータを作成
      // カスタム見積のため、productIdとproductNameは固定値を使用
      // SKU数量の合計を計算（会員見積ページでの正しい数量表示のため）
      const totalSKUQuantity = state.skuQuantities?.reduce((sum, qty) => sum + (Number(qty) || 0), 0) || state.quantity;

      const itemsToSave = hasMultiQuantityResults
        ? multiQuantityQuotes.map((quote) => {
            return {
              productId: 'custom',
              productName: 'カスタム製品',
              quantity: quote.quantity,
              unitPrice: quote.unitPrice,
              totalPrice: quote.totalPrice, // 正確な合計金額を追加（丸め誤差防止）
              specifications: {
                // 基本的な製品情報のみを保存（PDF用の変換フィールドは除外）
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                // 後加工オプションは配列としてのみ保存（個別フィールドは保存しない）
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                // 【追加】側面幅
                sideWidth: state.sideWidth,
                // 【追加】シール幅（個別フィールド）
                sealWidth: state.sealWidth,
                // 【追加】内容量（製品タイプ・内容物・主成分・流通環境）
                productCategory: state.productCategory,
                contentsType: state.contentsType,
                mainIngredient: state.mainIngredient,
                distributionEnvironment: state.distributionEnvironment,
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
                // 【追加】フィルム原価詳細（各素材レイヤーの完全な計算詳細）
                film_cost_details: result.filmCostDetails ? {
                materialLayerDetails: result.filmCostDetails.materialLayerDetails?.map(m => ({
                  materialId: m.materialId,
                  name: m.name,
                  nameJa: m.nameJa,
                  thicknessMicron: m.thicknessMicron,
                  density: m.density,
                  unitPriceKRW: m.unitPriceKRW,
                  areaM2: m.areaM2,
                  meters: m.meters,
                  widthM: m.widthM,
                  weightKg: m.weightKg,
                  costKRW: m.costKRW,
                  costJPY: m.costJPY
                })) || [],
                totalCostKRW: result.filmCostDetails.totalCostKRW,
                costJPY: result.filmCostDetails.costJPY,
                totalWeight: result.filmCostDetails.totalWeight,
                totalMeters: result.filmCostDetails.totalMeters,
                materialWidthMM: result.filmCostDetails.materialWidthMM,
                areaM2: result.filmCostDetails.areaM2
              } : null,
              sku_quantities: hasValidSKUData ? state.skuQuantities : undefined
            },
            cost_breakdown: costBreakdown
          };
        })
        : [
            {
              productId: 'custom',
              productName: 'カスタム製品',
              quantity: totalSKUQuantity,
              unitPrice: result.unitPrice,
              totalPrice: result.totalPrice, // 100円単位切り上げ済み
              specifications: {
                // 基本的な製品情報のみを保存（PDF用の変換フィールドは除外）
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                // 後加工オプションは配列としてのみ保存（個別フィールドは保存しない）
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                // 【追加】側面幅
                sideWidth: state.sideWidth,
                // 【追加】シール幅（個別フィールド）
                sealWidth: state.sealWidth,
                // 【追加】内容量（製品タイプ・内容物・主成分・流通環境）
                productCategory: state.productCategory,
                contentsType: state.contentsType,
                mainIngredient: state.mainIngredient,
                distributionEnvironment: state.distributionEnvironment,
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
                // 【追加】フィルム原価詳細（単一アイテムの場合も保存）
                film_cost_details: result.filmCostDetails ? {
                materialLayerDetails: result.filmCostDetails.materialLayerDetails?.map(m => ({
                  materialId: m.materialId,
                  name: m.name,
                  nameJa: m.nameJa,
                  thicknessMicron: m.thicknessMicron,
                  density: m.density,
                  unitPriceKRW: m.unitPriceKRW,
                  areaM2: m.areaM2,
                  meters: m.meters,
                  widthM: m.widthM,
                  weightKg: m.weightKg,
                  costKRW: m.costKRW,
                  costJPY: m.costJPY
                })) || [],
                totalCostKRW: result.filmCostDetails.totalCostKRW,
                costJPY: result.filmCostDetails.costJPY,
                totalWeight: result.filmCostDetails.totalWeight,
                totalMeters: result.filmCostDetails.totalMeters,
                materialWidthMM: result.filmCostDetails.materialWidthMM,
                areaM2: result.filmCostDetails.areaM2
              } : null,
              // 【追加】SKU数量情報（単一アイテムモード）
              sku_quantities: hasValidSKUData ? state.skuQuantities : undefined
            },
            cost_breakdown: costBreakdown
          }
        ];

      const totalAmountFromItems = itemsToSave.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      // デバッグ: stateのsideWidthとsealWidthを確認
      console.log('[saveQuotationToDatabase] DEBUG state:', {
        sideWidth: state.sideWidth,
        sealWidth: state.sealWidth,
        bagTypeId: state.bagTypeId
      });

      const quotationData = {
        userId: user.id,
        totalAmount: totalAmountFromItems,
        items: itemsToSave
      };

      console.log('[saveQuotationToDatabase] Saving quotation:', quotationData);
      console.log('[saveQuotationToDatabase] itemsToSave[0].specifications:', itemsToSave[0]?.specifications);

      // ✅ /api/member/quotations を使用（認証必須）
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
          customer_phone: user?.corporatePhone || null,
          status: 'DRAFT',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: null,
          // 【追加】見積全体の原価内訳（合計）
          cost_breakdown: costBreakdown || {},
          items: itemsToSave.map(item => ({
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            specifications: item.specifications,
            // 【追加】アイテム別原価内訳
            cost_breakdown: (item as any).cost_breakdown || {}
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', errorEn: 'Failed to save quotation' }));
        console.error('[saveQuotationToDatabase] ========================================');
        console.error('[saveQuotationToDatabase] API error status:', response.status);
        console.error('[saveQuotationToDatabase] API error data:', errorData);
        console.error('[saveQuotationToDatabase] Request data:', {
          customer_name: user?.kanjiLastName && user?.kanjiFirstName
            ? `${user.kanjiLastName} ${user.kanjiFirstName}`
            : user?.email?.split('@')[0] || 'Guest',
          customer_email: user?.email || 'guest@example.com',
          itemCount: itemsToSave.length,
        });
        console.error('[saveQuotationToDatabase] ========================================');
        throw new Error(errorData.error || errorData.errorEn || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      console.log('[saveQuotationToDatabase] 見積が自動保存されました:', savedQuotation);
      return savedQuotation.id || savedQuotation.quotation?.id || null;
    } catch (error) {
      console.error('[saveQuotationToDatabase] ========================================');
      console.error('[saveQuotationToDatabase] 保存失敗 (CATCH):');
      console.error('[saveQuotationToDatabase] Error name:', error instanceof Error ? error.name : typeof error);
      console.error('[saveQuotationToDatabase] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[saveQuotationToDatabase] Error stack:', error instanceof Error ? error.stack : 'no stack');
      console.error('[saveQuotationToDatabase] User authenticated:', !!user?.id);
      console.error('[saveQuotationToDatabase] User email:', user?.email || 'N/A');
      console.error('[saveQuotationToDatabase] ========================================');
      // ✅ ユーザー体験を妨げないためにエラーを表示しない
      // PDFダウンロードは成功したので継続
      // エラーはコンソールにのみ出力
      return null;
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const itemsToSave = hasMultiQuantityResults && multiQuantityQuotes.length > 0
        ? multiQuantityQuotes.map((mq) => ({
            productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
            quantity: mq.quantity,
            unitPrice: mq.unitPrice,
            totalPrice: mq.totalPrice, // 正確な合計金額を追加（丸め誤差防止）
            specifications: {
              bagTypeId: state.bagTypeId,
              materialId: state.materialId,
              width: state.width,
              height: state.height,
              depth: state.depth,
              dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
              thicknessSelection: state.thicknessSelection,
              isUVPrinting: state.isUVPrinting,
              printingType: state.printingType,
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
                printingType: state.printingType,
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

      const totalAmountFromItems = itemsToSave.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      const quotationData = {
        userId: user.id,
        quotationNumber: `QT-${Date.now()}`,
        status: 'draft' as const,
        totalAmount: totalAmountFromItems,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: null,
        items: itemsToSave
      };

      const response = await fetch('/api/member/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: user?.user_metadata?.kanji_last_name && user?.user_metadata?.kanji_first_name
            ? `${user.user_metadata.kanji_last_name} ${user.user_metadata.kanji_first_name}`
            : user?.email?.split('@')[0] || 'Guest',
          customer_email: user?.email || 'guest@example.com',
          customer_phone: user?.user_metadata?.phone || null,
          status: 'DRAFT',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: null,
          // 【追加】見積全体の原価内訳
          cost_breakdown: result.skuCostDetails?.costPerSKU?.[0]?.costBreakdown || result.breakdown?.baseCost ? {
            materialCost: Math.round((result.breakdown?.baseCost || 0) * 0.4),
            laminationCost: Math.round((result.breakdown?.baseCost || 0) * 0.06),
            slitterCost: Math.round((result.breakdown?.baseCost || 0) * 0.03),
            surfaceTreatmentCost: 0,
            pouchProcessingCost: Math.round((result.breakdown?.baseCost || 0) * 0.15),
            printingCost: Math.round((result.breakdown?.baseCost || 0) * 0.1),
            manufacturingMargin: Math.round((result.breakdown?.baseCost || 0) * 0.4),
            duty: Math.round((result.breakdown?.baseCost || 0) * 0.05),
            delivery: Math.round((result.breakdown?.baseCost || 0) * 0.08),
            salesMargin: Math.round((result.breakdown?.baseCost || 0) * 0.2),
            totalCost: Math.round(result.breakdown?.baseCost || 0)
          } : {},
          items: itemsToSave.map(item => ({
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            specifications: item.specifications,
            // 【追加】アイテム別原価内訳
            cost_breakdown: (item as any).cost_breakdown || (result.skuCostDetails?.costPerSKU?.[0]?.costBreakdown || null)
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      console.log('Quotation saved successfully:', savedQuotation);
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
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          見積もり完了
        </h2>
        <p className="text-gray-600">
          以下の内容でお見積もりいたしました
        </p>
      </div>

      {/* Price Display */}
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
                単価: ¥{Math.round(result.unitPrice).toLocaleString()}/{state.bagTypeId === 'roll_film' ? 'm' : '個'}
              </div>
            </>
          );
        })()}
      </div>

      {/* Admin-only cost breakdown */}
      {isAdmin && result.skuCostDetails && (
        <CostBreakdownPanel
          costBreakdown={result.skuCostDetails}
          markedUpPrice={result.totalPrice}
          marginRate={0.5}
        />
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注文内容の確認</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">基本仕様</h4>
            <div className="text-sm space-y-1 text-gray-600">
              {console.log('[ResultStep] Basic specs - bagTypeId:', state.bagTypeId, 'is roll_film:', state.bagTypeId === 'roll_film')}
              {/* 内容物 - 一番上に表示 */}
              {(() => {
                const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
                  'food': '食品',
                  'health_supplement': '健康食品',
                  'cosmetic': '化粧品',
                  'quasi_drug': '医薬部外品',
                  'drug': '医薬品',
                  'other': 'その他'
                };
                const CONTENTS_TYPE_LABELS: Record<string, string> = {
                  'solid': '固体',
                  'powder': '粉体',
                  'liquid': '液体'
                };
                const MAIN_INGREDIENT_LABELS: Record<string, string> = {
                  'general_neutral': '一般/中性',
                  'oil_surfactant': 'オイル/界面活性剤',
                  'acidic_salty': '酸性/塩分',
                  'volatile_fragrance': '揮発性/香料',
                  'other': 'その他'
                };
                const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
                  'general_roomTemp': '一般/常温',
                  'light_oxygen_sensitive': '光/酸素敏感',
                  'refrigerated': '冷凍保管',
                  'high_temp_sterilized': '高温殺菌',
                  'other': 'その他'
                };
                const categoryLabel = PRODUCT_CATEGORY_LABELS[state.productCategory || ''];
                const typeLabel = CONTENTS_TYPE_LABELS[state.contentsType || ''];
                const ingredientLabel = MAIN_INGREDIENT_LABELS[state.mainIngredient || ''];
                const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[state.distributionEnvironment || ''];
                const contentsDisplay = (categoryLabel && typeLabel && ingredientLabel && environmentLabel)
                  ? `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`
                  : '';
                return contentsDisplay ? <div>内容物: {contentsDisplay}</div> : null;
              })()}
              <div>袋のタイプ: {getBagTypeLabel(state.bagTypeId)}</div>
              <div>サイズ: {state.bagTypeId === 'roll_film'
                ? `幅: ${state.width} mm`
                : `${state.width} × ${state.height} ${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `× ${state.depth}` : ''} mm`}</div>
              <div>素材: {getMaterialDescription(state.materialId, 'ja')}</div>
              {state.thicknessSelection && <div>厚さ: {THICKNESS_TYPE_JA[state.thicknessSelection as keyof typeof THICKNESS_TYPE_JA] || state.thicknessSelection}</div>}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">数量・印刷</h4>
            <div className="text-sm space-y-1 text-gray-600">
              {hasValidSKUData ? (
                <div>
                  <div className="font-medium">SKU別数量 ({result?.skuCount || state.skuCount}種類):</div>
                  {(result?.skuQuantities || state.skuQuantities || []).map((qty, index) => (
                    <div key={index} className="ml-2">
                      • SKU {index + 1}: {qty.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                    </div>
                  ))}
                  <div className="mt-2 font-medium">
                    総数量: {(result?.skuQuantities || state.skuQuantities || []).reduce((sum, qty) => sum + (qty || 0), 0).toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                  </div>
                  <div className="mt-1">印刷: {state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</div>
                  <div>色数: {state.printingColors} {state.doubleSided && '(両面)'}</div>
                </div>
              ) : (
                <>
                  <div>数量: {
                    // ロールフィルムの場合はSKU数量を優先、それ以外はstate.quantityを使用
                    state.bagTypeId === 'roll_film' && state.skuQuantities && state.skuQuantities.length > 0
                      ? state.skuQuantities[0].toLocaleString()
                      : state.quantity.toLocaleString()
                  }{state.bagTypeId === 'roll_film' ? 'm' : '個'}</div>
                  <div>印刷: {state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</div>
                  <div>色数: {state.printingColors} {state.doubleSided && '(両面)'}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {state.postProcessingOptions && state.postProcessingOptions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">後加工</h4>
            <div className="text-sm text-gray-600">
              {safeMap(getFilteredPostProcessingOptions(), option => (
                <span key={option} className="mr-2">
                  {getPostProcessingLabel(option)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">配送・納期</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>配送先: {state.deliveryLocation === 'domestic' ? '国内' : '海外'}</div>
            <div>納期: {state.urgency === 'standard' ? '標準' : '迅速'}（{result.leadTimeDays}日）</div>
          </div>
        </div>
      </div>

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
                  unitPrice: data.unitPrice,
                  totalPrice: data.unitPrice * parseInt(quantity),
                  discountRate: Math.round((1 - data.efficiency / 100) * 100),
                  priceBreak: multiQuantityState.comparison!.priceBreaks.find(pb => pb.quantity === parseInt(quantity))?.priceBreak || '通常',
                  leadTimeDays: result.leadTimeDays,
                  isValid: true
                }))}
                comparison={multiQuantityState.comparison!}
                selectedQuantity={state.quantity}
                onQuantitySelect={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Optimization Suggestions - Parallel Production & Economic Quantity */}
      {/* 最終ページでは数量推薦UIを削除 - ユーザーが入力した数量を尊重 */}
      {/* showOptimizationSuggestions && parallelProductionOptions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-yellow-600" />
              並列生産オプションのご提案
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              複数個まとめて注文すると、同じ原反を効率的に使用でき、単価が下がります。
            </p>
            <ParallelProductionOptions
              options={parallelProductionOptions}
              currentUnitCost={result.unitPrice}
              onOptionSelect={(option) => {
                console.log('Selected parallel production option:', option);
                // TODO: Update quantity and recalculate quote
                // setState({ ...state, quantity: option.quantity });
              }}
            />
          </div>
        </div>
      ) */}

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

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <motion.button
          onClick={() => {
            if (window.confirm('新しい見積もりを作成します。現在の入力内容はリセットされます。よろしいですか？')) {
              onReset();
            }
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          新しい見積もり
        </motion.button>

        {/* 見積一覧リンク（認証済みのみ） */}
        {user?.id && (
          <Link
            href="/member/quotations"
            className="px-6 py-3 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors flex items-center"
          >
            <List className="w-4 h-4 mr-2" />
            見積一覧
          </Link>
        )}

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center ${
            isGeneratingPdf
              ? 'bg-gray-400 cursor-not-allowed'
              : pdfStatus === 'success'
              ? 'bg-info-600 hover:bg-info-700 text-white'
              : pdfStatus === 'error'
              ? 'bg-error-600 hover:bg-error-700 text-white'
              : 'bg-navy-700 hover:bg-navy-600 text-white'
          }`}
        >
          {isGeneratingPdf ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              PDF生成中...
            </>
          ) : pdfStatus === 'success' ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ダウンロード完了 (自動保存済み)
            </>
          ) : pdfStatus === 'error' ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              失敗
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              PDFダウンロード (自動保存)
            </>
          )}
        </button>

        {/* 未認証ユーザー向け会員登録促進メッセージ */}
        {!user?.id && (
          <div className="w-full mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">この見積を保存するには会員登録</p>
                <p className="text-sm text-amber-700 mt-1">
                  会員登録（無料）すると、見積履歴の保存・管理や、専任担当者からのご連絡が可能になります。
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    href="/auth/register?redirect=/quote-simulator"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    今すぐ会員登録
                  </Link>
                  <Link
                    href="/auth/signin?redirect=/quote-simulator"
                    className="px-4 py-2 border border-amber-600 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

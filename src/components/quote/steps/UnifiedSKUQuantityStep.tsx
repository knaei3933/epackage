'use client';

import React, { useState, useMemo, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2
} from 'lucide-react';
import { useQuoteState, useQuote } from '@/contexts/QuoteContext';
import { pouchCostCalculator } from '@/lib/pouch-cost-calculator';
import { unifiedPricingEngine } from '@/lib/unified-pricing-engine';
import { validateMOQ, isKraftMaterial } from '@/lib/pricing/validators/moq-validator';
import { determineMaterialWidth } from '@/lib/material-width-selector';
import { EconomicQuantityProposal } from '../shared/EconomicQuantityProposal';
import { StatusIndicator } from '../shared/StatusIndicator';
import { CurrentStateSummary } from '../shared/CurrentStateSummary';
import { useToast } from '../shared/ErrorToast';

/**
 * バリデーション関数の型定義
 */
export interface UnifiedSKUQuantityStepRef {
  validateQuantities: () => boolean;
}

/**
 * Unified SKU & Quantity Step Component
 *
 * Features:
 * 1. SKU count selection (1-100 SKUs)
 * 2. Standard view for 1-10 SKUs (Grid layout)
 * 3. Compact view for 11-100 SKUs (Table + pagination)
 * 4. Bulk operations panel
 * 5. Film usage calculation per SKU
 * 6. Real-time price calculation
 * 7. Economic quantity suggestions
 *
 * Cost calculation logic:
 * - 1 SKU: 500m minimum + 400m loss = 900m total
 * - 2+ SKUs: 300m each + 400m loss shared
 */
const UnifiedSKUQuantityStep = forwardRef<UnifiedSKUQuantityStepRef>((props, ref) => {
  const quoteState = useQuoteState();
  const {
    setSKUCount,
    setSKUQuantities,
    updateSKUQuantity,
    setQuantityMode,
    updateField,
    applyTwoColumnOption: applyTwoColumnOptionContext,
    clearAppliedOption
  } = useQuote();

  const { showSuccess, showError } = useToast();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [bulkQuantity, setBulkQuantity] = useState('');
  // 一時的な入力値を管理（バリデーション前に自由に入力できるようにする）
  const [tempQuantities, setTempQuantities] = useState<(number | string)[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  // 総数量バリデーションエラー（固定数量モード時）
  const [totalQuantityError, setTotalQuantityError] = useState<string | null>(null);

  // tempQuantitiesをquoteState.skuQuantitiesと同期
  useEffect(() => {
    setTempQuantities(quoteState.skuQuantities);
  }, [quoteState.skuQuantities]);

  // ★컴포넌트 마운트 시 항상 할인 초기화 (뒤로가기 대응)
  // 키보드 왼쪽 화살표나 뒤로가기 버튼으로 돌아올 때 할인 상태를 초기화
  useEffect(() => {
    // 既にクリア済みの場合는スキップ（オプション適用後の再レンダリング対応）
    if (didClearOnMountRef.current) {
      console.log('[UnifiedSKUQuantityStep] Skipping clear - already cleared on mount');
      return;
    }
    // マウント될 때 항상 적용된 옵션을初期化
    // ただし、2列生産オプションが適用されている場合で、かつ割引価格が設定されている場合はスキップ
    // （オプション適用直後の再マウントではクリアしない）
    const shouldClear = (
      (quoteState.twoColumnOptionApplied || quoteState.appliedOption !== null) &&
      // 2列生産オプション適用直後（割引価格が現在の単価と一致する場合）はクリアしない
      !(quoteState.twoColumnOptionApplied &&
        quoteState.discountedUnitPrice !== undefined &&
        quoteState.discountedUnitPrice === quoteState.unitPrice)
    );

    if (shouldClear) {
      console.log('[UnifiedSKUQuantityStep] Component mounted, clearing applied discount', {
        twoColumnOptionApplied: quoteState.twoColumnOptionApplied,
        appliedOption: quoteState.appliedOption,
        discountedUnitPrice: quoteState.discountedUnitPrice,
        unitPrice: quoteState.unitPrice,
        shouldClear
      });
      clearAppliedOption();
      didClearOnMountRef.current = true;
    } else {
      console.log('[UnifiedSKUQuantityStep] Skipping clear on mount - option just applied', {
        twoColumnOptionApplied: quoteState.twoColumnOptionApplied,
        discountedUnitPrice: quoteState.discountedUnitPrice,
        unitPrice: quoteState.unitPrice
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 割引が解除されたときにすべての関連状態をクリア
  useEffect(() => {
    if (!quoteState.twoColumnOptionApplied || quoteState.fixedTotalQuantity === undefined) {
      // 総数量エラーをクリア
      setTotalQuantityError(null);
      // 前の状態をクリア
      setPreviousState(null);
      // tempQuantitiesを現在のskuQuantitiesに同期
      setTempQuantities(quoteState.skuQuantities);

      console.log('[UnifiedSKUQuantityStep] Discount cleared, resetting all related states');
    }
  }, [quoteState.twoColumnOptionApplied, quoteState.fixedTotalQuantity, quoteState.skuQuantities]);

  // 2列生産オプションとSKU分割オプションの状態管理
  const [isApplying, setIsApplying] = useState(false);

  // 無限ループ防止用のref
  const isApplyingTwoColumnRef = useRef(false);
  const isClearingOptionRef = useRef(false);
  // 初回マウント時のクリア済みフラグ（二重クリア防止）
  const didClearOnMountRef = useRef(false);

  // ローカル価格計算用の状態とref（ImprovedQuotingWizardのRealTimePriceDisplayと同様のパターン）
  const [localUnitPrice, setLocalUnitPrice] = useState<number | null>(null);
  const [localTotalPrice, setLocalTotalPrice] = useState<number | null>(null);
  const previousPriceRef = useRef<number | null>(null);
  const isCalculatingPriceRef = useRef(false);

  // 2列生産オプションの状態（非同期計算用）
  const [twoColumnOptions, setTwoColumnOptions] = useState<TwoColumnProductionOptions | null>(null);

  // 元に戻すための前の状態を保存
  const [previousState, setPreviousState] = useState<{
    skuCount: number;
    quantities: number[];
    unitPrice?: number;
    totalPrice?: number;
    originalUnitPrice?: number;
  } | null>(null);

  // 総数量の計算
  const totalQuantity = quoteState.skuQuantities.reduce((sum, qty) => sum + qty, 0);

  // 表示価格の計算（2列生産オプション適用時は割引価格を表示）
  // ローカル計算価格またはQuoteContextの値を使用
  const displayUnitPrice = quoteState.twoColumnOptionApplied
    ? quoteState.discountedUnitPrice || localUnitPrice || quoteState.unitPrice || 50
    : localUnitPrice || quoteState.unitPrice || 50;

  const displayTotalPrice = quoteState.twoColumnOptionApplied
    ? quoteState.discountedTotalPrice || localTotalPrice || quoteState.totalPrice || 0
    : localTotalPrice || quoteState.totalPrice || 0;

  const displayOriginalPrice = quoteState.twoColumnOptionApplied
    ? quoteState.originalUnitPrice
    : null;

  // 2列生産オプションを非同期計算（useEffectでdbSettingsをロード）
  useEffect(() => {
    const calculateTwoColumnOptions = async () => {
      // オプション適用後も推奨変更のため計算を続ける
      // 適用済みオプションは appliedOption prop で処理する
      const isRollFilm = quoteState.bagTypeId === 'roll_film';

      // ロールフィルムの場合：幅条件なしで2〜5列生産オプションを提供
      if (isRollFilm) {
        // 数量はメートル単位で500m以上必要
        if (totalQuantity < 500) {
          setTwoColumnOptions(null);
          return;
        }

        const baseUnitPrice = localUnitPrice || quoteState.originalUnitPrice || quoteState.unitPrice || 50;
        if (baseUnitPrice <= 0) {
          setTwoColumnOptions(null);
          return;
        }

        const width = quoteState.width || 0;

        // 原反幅制約を考慮した最大列数の計算
        // 760mm原反の有効幅は740mm（両端20mmマージン考慮）
        const MAX_PRINTABLE_WIDTH = 740;
        const maxColumns = Math.floor(MAX_PRINTABLE_WIDTH / width);
        const minColumns = 2;

        // 2列未満の場合はオプションを提供しない
        if (maxColumns < minColumns) {
          console.log('[UnifiedSKUQuantityStep] Width exceeds printable area:', {
            width,
            maxColumns,
            minColumns,
            message: `${width}mm exceeds limit for ${minColumns}-column production (max: ${MAX_PRINTABLE_WIDTH}mm)`
          });
          setTwoColumnOptions(null);
          return;
        }

        const possibleMaxColumns = maxColumns;

        // ロールフィルム用多列生産オプション（2〜possibleMaxColumns）
        const multiColumnOptions: {
          columnCount: number;
          columnWidth: number;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          savingsRate: number;
        }[] = [];

        // 割引率（2026-01-30 再設計）
        const discountRates: Record<number, number> = {
          2: 0.40,   // 40% OFF
          3: 0.48,   // 48% OFF
          4: 0.55,   // 55% OFF
          5: 0.58,   // 58% OFF
          6: 0.61,   // 61% OFF
          7: 0.64    // 64% OFF - 最大割引
        };

        // 可能な列数までのみ生成
        for (let columns = minColumns; columns <= possibleMaxColumns; columns++) {
          const discountRate = discountRates[columns];
          const discountedUnitPrice = Math.round(baseUnitPrice * (1 - discountRate));
          const actualTotalLength = totalQuantity * columns;
          const totalPrice = Math.round(discountedUnitPrice * actualTotalLength);

          multiColumnOptions.push({
            columnCount: columns,
            columnWidth: width,
            quantity: actualTotalLength,
            unitPrice: discountedUnitPrice,
            totalPrice: totalPrice,
            savingsRate: Math.round(discountRate * 10000) / 100
          });
        }

        setTwoColumnOptions({
          sameQuantity: multiColumnOptions[0],
          doubleQuantity: multiColumnOptions[1],
          multiColumn: multiColumnOptions
        });
        return;
      }

      // パウチ製品：従来のロジック
      // 総数量が1000個以上の場合のみ計算
      if (totalQuantity < 1000) {
        setTwoColumnOptions(null);
        return;
      }

      // 重要：originalUnitPrice（2列生産オプション適用前の元価格）を優先的に使用
      // localUnitPriceは既に2列生産オプション適用後の割引価格の場合があるため
      const baseUnitPrice = quoteState.originalUnitPrice || quoteState.unitPrice || localUnitPrice || 50;

      // 単価が取得できなかった場合はスキップ
      if (baseUnitPrice <= 0) {
        setTwoColumnOptions(null);
        return;
      }

      // 2列生産オプションを計算
      try {
        const dimensions = {
          width: quoteState.width || 0,
          height: quoteState.height || 0,
          depth: quoteState.depth || 0
        };
        const pouchType = quoteState.bagTypeId || '';
        const materialId = quoteState.materialId;

        // パウチタイプに基づいて2列生産のフィルム幅を計算
        const { height: H = 0, width: W = 0, depth: G = 0 } = dimensions;
        let filmWidthFor2Columns = 0;

        switch (pouchType) {
          case 'roll_film':
            filmWidthFor2Columns = W * 2;
            break;
          case 'flat_3_side':
          case 'three_side':
          case 'zipper':
            filmWidthFor2Columns = (H * 4) + 71;
            break;
          case 'stand_up':
          case 'zipper_stand':
            filmWidthFor2Columns = (H * 4) + (G * 2) + 40;
            break;
          case 't_shape':
            filmWidthFor2Columns = (W * 4) + 64;
            break;
          case 'box':
            filmWidthFor2Columns = (G + W) * 4 + 84;
            break;
          default:
            filmWidthFor2Columns = (H * 4) + 71;
        }

        // 原反幅を決定（2列生産フィルム幅に基づいて）
        const materialWidth = determineMaterialWidth(filmWidthFor2Columns, materialId);

        // DB設定を非同期ロード
        const dbSettings = await pouchCostCalculator.loadFilmCostSettings();

        const options = pouchCostCalculator.calculateTwoColumnProductionOptions(
          totalQuantity,
          baseUnitPrice,
          pouchType,
          dimensions,
          materialWidth,
          quoteState.filmLayers,
          materialId,
          quoteState.thicknessSelection,
          quoteState.postProcessingOptions,
          dbSettings
        );

        console.log('[UnifiedSKUQuantityStep] Two column options calculated:', {
          baseUnitPrice,
          totalQuantity,
          options
        });

        setTwoColumnOptions(options);
      } catch (error) {
        console.error('[UnifiedSKUQuantityStep] Error calculating two column options:', error);
        setTwoColumnOptions(null);
      }
    };

    calculateTwoColumnOptions();
  }, [totalQuantity, quoteState.skuQuantities, quoteState.width, quoteState.height, quoteState.depth, quoteState.bagTypeId, localUnitPrice, quoteState.originalUnitPrice, quoteState.unitPrice, quoteState.twoColumnOptionApplied, quoteState.filmLayers, quoteState.materialId, quoteState.thicknessSelection, quoteState.postProcessingOptions]);

  const skuSplitOptions = useMemo(() => {
    // SKU分割オプションを計算
    try {
      return pouchCostCalculator.calculateSKUSplitOptions(totalQuantity);
    } catch (error) {
      console.error('[UnifiedSKUQuantityStep] Error calculating SKU split options:', error);
      return [];
    }
  }, [totalQuantity]);

  // 価格計算（ImprovedQuotingWizardのRealTimePriceDisplayと同様のパターン）
  useEffect(() => {
    // 無限ループ防止
    if (isCalculatingPriceRef.current) {
      return;
    }

    // 重要：2列生産オプション適用時は価格計算をスキップ
    //（APPLY_TWO_COLUMN_OPTIONで価格が既に設定されているため）
    if (quoteState.twoColumnOptionApplied) {
      console.log('[UnifiedSKUQuantityStep] Price calculation skipped - 2-column option applied');
      return;
    }

    // 基本的なバリデーション
    if (!quoteState.materialId || !quoteState.bagTypeId || totalQuantity === 0) {
      setLocalUnitPrice(null);
      setLocalTotalPrice(null);
      return;
    }

    // 最小数量チェック（エラー防止）
    const minOrderQty = quoteState.bagTypeId === 'roll_film' ? 500 : 100;
    if (totalQuantity < minOrderQty) {
      console.log('[UnifiedSKUQuantityStep] Total quantity below minimum, skipping calculation:', {
        totalQuantity,
        minOrderQty
      });
      setLocalUnitPrice(null);
      setLocalTotalPrice(null);
      return;
    }

    isCalculatingPriceRef.current = true;

    const calculatePrice = async () => {
      try {
        // 重要：常に基本価格（2列生産オプション未適用時の価格）を計算する
        // 2列生産オプション適用時の割引価格は、QuoteContextのdiscountedUnitPriceを使用
        console.log('[SKU Step] DIAGNOSTIC - calculateQuote PARAMS:', {
          bagTypeId: quoteState.bagTypeId,
          materialId: quoteState.materialId,
          skuCount: quoteState.skuCount,
          skuQuantities: quoteState.skuQuantities,
          totalQuantity: totalQuantity,
          markupRate: 'NOT PASSED (will use default)',
          deliveryLocation: quoteState.deliveryLocation || 'UNDEFINED',
          urgency: quoteState.urgency || 'UNDEFINED',
        });
        const quoteResult = await unifiedPricingEngine.calculateQuote({
          bagTypeId: quoteState.bagTypeId,
          materialId: quoteState.materialId,
          width: quoteState.width,
          height: quoteState.height,
          depth: quoteState.depth,
          quantity: totalQuantity,
          thicknessSelection: quoteState.thicknessSelection,
          isUVPrinting: quoteState.isUVPrinting,
          postProcessingOptions: quoteState.postProcessingOptions,
          printingType: quoteState.printingType,
          printingColors: quoteState.printingColors,
          doubleSided: quoteState.doubleSided,
          deliveryLocation: quoteState.deliveryLocation,
          urgency: quoteState.urgency,
          rollCount: quoteState.rollCount,
          // SKUモードパラメータ
          useSKUCalculation: true,
          skuQuantities: quoteState.skuQuantities,
          // Roll film specific parameters
          materialWidth: quoteState.materialWidth,
          filmLayers: quoteState.filmLayers,
          // 2列生産オプション関連パラメータは渡さない（基本価格を計算するため）
          // twoColumnOptionApplied: false, // 常にfalseで基本価格を計算
        });

        // CRITICAL FIX: Only update state if values have actually changed
        // This prevents infinite re-render loops
        const previousPrice = previousPriceRef.current;
        setLocalUnitPrice(prev => prev !== quoteResult.unitPrice ? quoteResult.unitPrice : prev);
        setLocalTotalPrice(prev => prev !== quoteResult.totalPrice ? quoteResult.totalPrice : prev);

        // Update the ref with the new price
        previousPriceRef.current = quoteResult.totalPrice;

        console.log('[UnifiedSKUQuantityStep] Price calculated:', {
          unitPrice: quoteResult.unitPrice,
          totalPrice: quoteResult.totalPrice,
          quantity: totalQuantity
        });
      } catch (error) {
        console.error('[UnifiedSKUQuantityStep] Price calculation error:', error);
      } finally {
        isCalculatingPriceRef.current = false;
      }
    };

    calculatePrice();
  }, [
    totalQuantity,
    quoteState.skuCount,
    quoteState.materialId,
    quoteState.bagTypeId,
    quoteState.width,
    quoteState.height,
    quoteState.depth,
    quoteState.thicknessSelection,
    quoteState.isUVPrinting,
    quoteState.postProcessingOptions,
    quoteState.printingType,
    quoteState.printingColors,
    quoteState.doubleSided,
    quoteState.deliveryLocation,
    quoteState.urgency,
    quoteState.rollCount,
    // SKUモードパラメータ
    quoteState.skuQuantities,
    quoteState.materialWidth,
    quoteState.filmLayers
    // 2列生産オプション関連パラメータは削除（基本価格を計算するため）
  ]);

  // 数量変更時に2列生産オプションのフラグをクリア
  useEffect(() => {
    console.log('[useEffect-skuQuantities] Triggered', {
      skuQuantities: quoteState.skuQuantities,
      twoColumnOptionApplied: quoteState.twoColumnOptionApplied,
      isApplyingTwoColumnRef: isApplyingTwoColumnRef.current,
      isClearingOptionRef: isClearingOptionRef.current
    });

    // 無限ループ防止：自動適用中ならスキップ
    if (isApplyingTwoColumnRef.current) {
      console.log('[useEffect-skuQuantities] Skipped: isApplyingTwoColumnRef is true');
      return;
    }

    // 無限ループ防止：クリア中ならスキップ
    if (isClearingOptionRef.current) {
      console.log('[useEffect-skuQuantities] Skipped: isClearingOptionRef is true');
      return;
    }

    // 2列生産オプション適用済みで数量が変更された場合、フラグをクリアして再計算
    // ただし、2列生産オプションの適用直後の数量変更（APPLY_TWO_COLUMN_OPTIONによる変更）はクリアしない
    if (quoteState.twoColumnOptionApplied) {
      // APPLY_TWO_COLUMN_OPTIONアクションによる数量変更の場合はスキップ
      // （割引価格が設定されているかをチェックして、適用直後かどうかを判断）
      const isJustApplied = (
        quoteState.discountedUnitPrice !== undefined &&  // 割引価格が設定されている
        quoteState.discountedUnitPrice === quoteState.unitPrice  // 割引価格が現在の単価と一致
      );

      console.log('[useEffect-skuQuantities] Checking isJustApplied', {
        discountedUnitPrice: quoteState.discountedUnitPrice,
        unitPrice: quoteState.unitPrice,
        isJustApplied,
        areEqual: quoteState.discountedUnitPrice === quoteState.unitPrice
      });

      if (isJustApplied) {
        console.log('[UnifiedSKUQuantityStep] Skipping clear - 2-column option just applied');
        return;
      }

      // クリア中フラグをセット
      isClearingOptionRef.current = true;

      // 数量が変更された場合はフラグをクリア
      console.log('[useEffect-skuQuantities] Clearing due to quantity change', {
        skuQuantities: quoteState.skuQuantities,
        twoColumnOptionApplied: quoteState.twoColumnOptionApplied,
        isJustApplied
      });
      clearAppliedOption();

      // クリア完了後にフラグをリセット
      setTimeout(() => {
        isClearingOptionRef.current = false;
      }, 0);
    }
  }, [quoteState.skuQuantities]);

  // 自動適用機能は無効化（無限ループ防止）
  // ユーザーが手動で2列生産オプションを適用するように変更

  // Pagination settings for compact view
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(quoteState.skuCount / ITEMS_PER_PAGE);
  const paginatedSKUs = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, quoteState.skuCount);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [currentPage, quoteState.skuCount]);

  // Determine which view to show
  const useCompactView = quoteState.skuCount > 10;

  // Check if roll film (uses meter-based calculation)
  const isRollFilm = quoteState.bagTypeId === 'roll_film';

  // Quantity patterns for quick selection
  const quantityPatterns: number[] = isRollFilm
    ? quoteState.skuCount === 1
      ? [500, 1000, 2000, 5000]
      : [300, 500, 1000, 2000, 5000]
    : [500, 1000, 2000, 5000, 10000];

  /**
   * Apply quantity pattern to all SKUs
   */
  const applyQuantityPattern = (pattern: number) => {
    // 2列生産オプション適用後は、パターン適用時に割引を解除（総数量が変わるため）
    if (quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity) {
      console.log('[applyQuantityPattern] Applying pattern will change total quantity, clearing discount');
      clearAppliedOption();
      setTotalQuantityError(null);
    }

    setQuantityMode('sku');
    const newQuantities = Array(quoteState.skuCount).fill(pattern);
    setSKUQuantities(newQuantities);
  };

  /**
   * Apply quantity to single SKU
   */
  const handleSKUQuantityChange = (index: number, value: string) => {
    const parsedValue = value === '' ? '' : parseInt(value);

    // MOQ検証: Kraft材料 + ロールフィルム (既存処理の前に追加)
    if (quoteState.bagTypeId === 'roll_film' &&
        isKraftMaterial(quoteState.materialId || '')) {

      const moqTempQuantities = [...(quoteState.skuQuantities || [])];
      moqTempQuantities[index] = typeof parsedValue === 'number' ? parsedValue : 0;
      const totalQuantity = moqTempQuantities.reduce((sum, q) => sum + (q || 0), 0);

      const validation = validateMOQ(
        quoteState.materialId || '',
        quoteState.bagTypeId || '',
        totalQuantity
      );

      if (!validation.valid) {
        showError(validation.error!);
        return; // 更新を中止
      }
    }

    const newTempQuantities = [...tempQuantities];
    newTempQuantities[index] = parsedValue;
    setTempQuantities(newTempQuantities);

    if (validationError) {
      setValidationError(null);
    }

    // 固定数量モード時の総数量チェック
    if (quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined) {
      if (typeof parsedValue === 'number' && !isNaN(parsedValue)) {
        // 100単位チェック
        if (parsedValue % 100 !== 0) {
          setTotalQuantityError(`SKU ${index + 1}の数量は100単位で入力してください`);
          return;
        }

        // 最小数量チェック
        const minQuantityPerSku = quoteState.bagTypeId === 'roll_film' ? 300 : 500;
        if (parsedValue < minQuantityPerSku) {
          setTotalQuantityError(`SKU ${index + 1}の数量は最小${minQuantityPerSku}個です`);
          return;
        }

        // 新しい総数量を計算（tempQuantitiesベースで計算 - 他のSKUの変更も反映）
        const newTotalQuantity = newTempQuantities.reduce((sum, qty) => {
          return sum + (typeof qty === 'number' ? qty : 0);
        }, 0);

        console.log('[handleSKUQuantityChange] Total quantity calculation:', {
          index,
          parsedValue,
          newTempQuantities,
          newTotalQuantity,
          fixedTotalQuantity: quoteState.fixedTotalQuantity
        });

        // 総数量が固定数量と一致するかチェック
        if (newTotalQuantity !== quoteState.fixedTotalQuantity) {
          const diff = newTotalQuantity - quoteState.fixedTotalQuantity;
          setTotalQuantityError(
            `総数量が${diff > 0 ? '+' : ''}${diff}個です。総数量${quoteState.fixedTotalQuantity.toLocaleString()}個を維持してください`
          );
          // 入力値を一時的に保存するが、SKU数量は更新しない
          return;
        }

        // すべてのチェックが通ったら更新
        setTotalQuantityError(null);
        setQuantityMode('sku');
        updateSKUQuantity(index, parsedValue);

        console.log('[handleSKUQuantityChange] Updated SKU quantity in fixed total mode:', {
          index,
          newQuantity: parsedValue,
          fixedTotalQuantity: quoteState.fixedTotalQuantity,
          newTotalQuantity,
          allQuantities: newTempQuantities
        });
      }
      return;
    }

    // 通常モード時の更新
    if (typeof parsedValue === 'number' && !isNaN(parsedValue)) {
      setQuantityMode('sku');
      updateSKUQuantity(index, parsedValue);
      if (quoteState.twoColumnOptionApplied) {
        clearAppliedOption();
      }
    }
  };

  /**
   * バリデーション関数
   */
  const validateQuantities = (): boolean => {
    const minQuantity = isRollFilm
      ? (quoteState.skuCount === 1 ? 500 : 300)
      : 500;

    for (let i = 0; i < quoteState.skuCount; i++) {
      const value = tempQuantities[i];

      if (value === '' || value === undefined || value === null) {
        const errorMsg = `SKU ${i + 1}の数量を入力してください（最小${minQuantity}${isRollFilm ? 'm' : '個'}）`;
        setValidationError(errorMsg);
        return false;
      }

      const quantity = typeof value === 'number' ? value : parseInt(value as string);

      if (isNaN(quantity) || quantity < minQuantity) {
        const errorMsg = `SKU ${i + 1}の数量は${minQuantity}${isRollFilm ? 'm' : '個'}以上である必要があります`;
        setValidationError(errorMsg);
        return false;
      }

      if (quantity > 1000000) {
        const errorMsg = `SKU ${i + 1}の数量は1,000,000${isRollFilm ? 'm' : '個'}以下である必要があります`;
        setValidationError(errorMsg);
        return false;
      }
    }

    // 2列生産オプション適用時の総数量チェック
    if (quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined) {
      const currentTotalQuantity = tempQuantities.reduce((sum, qty) => {
        return sum + (typeof qty === 'number' ? qty : 0);
      }, 0);

      if (currentTotalQuantity !== quoteState.fixedTotalQuantity) {
        const diff = currentTotalQuantity - quoteState.fixedTotalQuantity;
        const errorMsg = `総数量が${diff > 0 ? '+' : ''}${diff}個です。総数量${quoteState.fixedTotalQuantity.toLocaleString()}個を維持してください`;
        setValidationError(errorMsg);
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  useImperativeHandle(ref, () => ({
    validateQuantities
  }));

  /**
   * 2列生産オプション適用ハンドラー
   */
  const handleApplyTwoColumnOption = (optionType: 'same' | 'double' | number) => {
    console.log('[handleApplyTwoColumnOption] Called with optionType:', optionType, {
      twoColumnOptions,
      isApplying,
      quoteStateTwoColumnOptionApplied: quoteState.twoColumnOptionApplied
    });

    // 個別の条件チェックとログ出力
    if (!twoColumnOptions) {
      console.log('[handleApplyTwoColumnOption] Early return: no twoColumnOptions available');
      return;
    }

    if (isApplying) {
      console.log('[handleApplyTwoColumnOption] Early return: already applying');
      return;
    }

    // 同じオプションがクリックされた場合は何もしない
    if (quoteState.twoColumnOptionApplied === optionType) {
      return;
    }

    // 既に2列生産オプションが適用されている場合は、一旦クリアして元の数量に戻す
    if (quoteState.twoColumnOptionApplied && quoteState.originalUnitPrice) {
      console.log('[handleApplyTwoColumnOption] Clearing previous option, restoring original quantity:', quoteState.quantity);

      // 元の単価と数量を復元
      const originalQuantity = quoteState.quantity || 10000;
      updateField('unitPrice', quoteState.originalUnitPrice);
      updateField('totalPrice', quoteState.originalUnitPrice * originalQuantity);
      updateField('quantity', originalQuantity);
      setSKUQuantities([originalQuantity]);

      // 重要：オプション適用状態をクリア
      // これによりtwoColumnOptionsが再計算される
      console.log('[handleApplyTwoColumnOption] Option cleared, waiting for re-render...');

      // 一旦ここで処理を中断し、ユーザーに再度クリックさせる
      // Reactの再レンダリング後にtwoColumnOptionsが正しく再計算される
      setIsApplying(false);
      isApplyingTwoColumnRef.current = false;
      return;
    }

    console.log('[handleApplyTwoColumnOption] Proceeding with option application');
    setIsApplying(true);
    isApplyingTwoColumnRef.current = true; // refも設定してuseEffectのクリアを防止

    try {
      // ロールフィルムの場合：列数を指定
      const isRollFilm = quoteState.bagTypeId === 'roll_film';
      let option;

      if (isRollFilm && typeof optionType === 'number') {
        // 多列生産オプション（2〜5列）
        const multiColumnOptions = (twoColumnOptions as any).multiColumn;
        if (!multiColumnOptions) {
          console.error('[handleApplyTwoColumnOption] MultiColumn options not found');
          return;
        }
        option = multiColumnOptions.find((opt: any) => opt.columnCount === optionType);
        if (!option) {
          console.error('[handleApplyTwoColumnOption] Option not found for columnCount:', optionType);
          return;
        }
      } else {
        // パウチ用：2列生産オプション
        option = optionType === 'same'
          ? twoColumnOptions.sameQuantity
          : twoColumnOptions.doubleQuantity;
      }

      console.log('[handleApplyTwoColumnOption] Selected option:', option);

      setPreviousState({
        skuCount: quoteState.skuCount,
        quantities: [...quoteState.skuQuantities],
        unitPrice: quoteState.unitPrice,
        totalPrice: quoteState.totalPrice,
        originalUnitPrice: quoteState.originalUnitPrice
      });

      // 複数SKUの場合の数量計算
      const currentSKUCount = quoteState.skuCount;
      const recommendedQuantity = option.quantity;
      const quantityPerSKU = Math.floor(recommendedQuantity / currentSKUCount / 100) * 100;
      const minQuantityPerSku = quoteState.bagTypeId === 'roll_film' ? 300 : 500;
      const adjustedQuantityPerSKU = Math.max(quantityPerSKU, minQuantityPerSku);
      const adjustedTotalQuantity = adjustedQuantityPerSKU * currentSKUCount;
      const adjustedTotalPrice = Math.round(option.unitPrice * adjustedTotalQuantity);

      // 重要：元の単価（2列生産オプション適用前の価格）を取得
      // originalUnitPriceがあればそれを使い、なければ現在のunitPriceを使う
      // ただし、2列生産オプションが既に適用されている場合は、originalUnitPriceを使う
      const baseUnitPrice = quoteState.originalUnitPrice || quoteState.unitPrice || localUnitPrice || 50;

      // SKU数を維持するフラグを設定
      const preserveSKUCount = currentSKUCount > 1;

      applyTwoColumnOptionContext(
        optionType,
        option.unitPrice,
        preserveSKUCount ? adjustedTotalPrice : option.totalPrice,
        baseUnitPrice, // 元の単価を使う（割引価格でないことを保証）
        preserveSKUCount ? adjustedTotalQuantity : option.quantity,
        preserveSKUCount
      );

      const currentTotal = quoteState.totalPrice || 0;
      const newTotal = preserveSKUCount ? adjustedTotalPrice : option.totalPrice;
      const savings = currentTotal - newTotal;

      // ロールフィルムかどうかで単位を変える
      const unit = isRollFilm ? 'm' : '個';

      // 複数SKUの場合と単一SKUの場合でメッセージを分ける
      const details = preserveSKUCount ? [
        `総数量: ${totalQuantity.toLocaleString()}${unit} → ${adjustedTotalQuantity.toLocaleString()}${unit}`,
        `SKU数: ${currentSKUCount}種類（維持）`,
        `各SKU: ${adjustedQuantityPerSKU.toLocaleString()}${unit}`,
        `単価: ¥${quoteState.unitPrice || 50}/${unit} → ¥${option.unitPrice}/${unit}`,
        `合計: ¥${currentTotal.toLocaleString()} → ¥${newTotal.toLocaleString()}`,
        savings > 0 ? `節減額: ¥${savings.toLocaleString()}` : ''
      ].filter(Boolean) : [
        `SKU数: ${quoteState.skuCount} → 1種類`,
        `数量: ${totalQuantity.toLocaleString()}${unit} → ${option.quantity.toLocaleString()}${unit}`,
        `単価: ¥${quoteState.unitPrice || 50}/${unit} → ¥${option.unitPrice}/${unit}`,
        `合計: ¥${currentTotal.toLocaleString()} → ¥${newTotal.toLocaleString()}`,
        savings > 0 ? `節減額: ¥${savings.toLocaleString()}` : ''
      ].filter(Boolean);

      // オプション名
      const optionName = typeof optionType === 'number'
        ? `${optionType}列生産`
        : '2列生産';

      showSuccess(
        `${optionName}オプションを適用しました（${option.savingsRate}% OFF）`,
        0,
        {
          undoAction: {
            label: '元に戻す',
            onClick: () => {
              console.log('[UNDO ACTION] Undo button clicked!');
              if (previousState) {
                console.log('[UNDO ACTION] Restoring previous state');
                clearAppliedOption();
                setSKUCount(previousState.skuCount);
                setSKUQuantities(previousState.quantities);
                if (previousState.unitPrice !== undefined) {
                  updateField('unitPrice', previousState.unitPrice);
                }
                clearAppliedOption();
              }
            }
          },
          details,
          persistent: true
        }
      );

      console.log(`[UnifiedSKUQuantityStep] Applied 2-column ${optionType} option:`, {
        option,
        preserveSKUCount,
        adjustedQuantityPerSKU,
        adjustedTotalQuantity
      });
      console.log('[handleApplyTwoColumnOption] Option application completed successfully');
    } catch (error) {
      console.error('[handleApplyTwoColumnOption] Error applying option:', error);
    } finally {
      setIsApplying(false);
      // refも遅延してfalseに戻す（状態更新後にuseEffectが実行されるのを防ぐ）
      setTimeout(() => {
        isApplyingTwoColumnRef.current = false;
        console.log('[handleApplyTwoColumnOption] isApplyingTwoColumnRef set to false');
      }, 100);
      console.log('[handleApplyTwoColumnOption] setIsApplying(false) called');
    }
  };

  /**
   * Handle SKU removal
   */
  const handleRemoveSKU = (indexToRemove: number) => {
    if (quoteState.skuCount <= 1) {
      return;
    }

    // 2列生産オプション適用後は、SKU削除時に割引を解除（総数量が変わるため）
    if (quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity) {
      console.log('[handleRemoveSKU] Removing SKU will change total quantity, clearing discount');
      clearAppliedOption();
      setTotalQuantityError(null);
    }

    setPreviousState({
      skuCount: quoteState.skuCount,
      quantities: [...quoteState.skuQuantities],
      unitPrice: quoteState.unitPrice,
      totalPrice: quoteState.totalPrice,
      originalUnitPrice: quoteState.originalUnitPrice
    });

    const newQuantities = quoteState.skuQuantities.filter((_, idx) => idx !== indexToRemove);
    const newCount = newQuantities.length;

    setTempQuantities(newQuantities);
    setSKUCount(newCount);
    setSKUQuantities(newQuantities);
    if (quoteState.twoColumnOptionApplied) {
      clearAppliedOption();
    }

    console.log(`[handleRemoveSKU] Removed SKU at index ${indexToRemove}, new count: ${newCount}`);
  };

  /**
   * Copy current SKU to add a new SKU
   */
  const copySKUToAddNew = (sourceIndex: number) => {
    if (quoteState.skuCount >= 100) {
      return;
    }

    const newSKUCount = quoteState.skuCount + 1;

    // 2列生産オプション適用後は、総数量を維持しつつSKU数を増やす
    if (quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity) {
      // 固定総数量を新しいSKU数で均等分割（100単位に丸める）
      const quantityPerSKU = Math.floor(quoteState.fixedTotalQuantity / newSKUCount / 100) * 100;
      const minQuantityPerSku = quoteState.bagTypeId === 'roll_film' ? 300 : 500;
      const adjustedQuantityPerSKU = Math.max(quantityPerSKU, minQuantityPerSku);
      const adjustedQuantities = Array(newSKUCount).fill(adjustedQuantityPerSKU);

      // 調整後の総数量を計算
      const adjustedTotalQuantity = adjustedQuantityPerSKU * newSKUCount;

      // ★割引適用後は固定総数量を超えてSKU追加できない（追加を阻止）
      if (adjustedTotalQuantity > quoteState.fixedTotalQuantity) {
        console.log('[copySKUToAddNew] Cannot add SKU - would exceed fixed total quantity');
        // 사용자에게 알림 표시
        const minQuantityPerSku = quoteState.bagTypeId === 'roll_film' ? 300 : 500;
        const maxSKUs = Math.floor(quoteState.fixedTotalQuantity / minQuantityPerSku);
        setTotalQuantityError(
          `割引適用中は${quoteState.fixedTotalQuantity.toLocaleString()}個を超えるSKU追加はできません。現在の最小数量(${minQuantityPerSku}個)で最大${maxSKUs}個までのSKUが可能です。`
        );
        // SKU 추가를 하지 않고 종료
        return;
      }

      // 総数量を維持してSKUを追加
      setSKUQuantities(adjustedQuantities);
      setQuantityMode('sku');
      setCurrentPage(0);
      setCopiedIndex(newSKUCount - 1);
      setTempQuantities(adjustedQuantities);
      setTotalQuantityError(null);

      console.log('[copySKUToAddNew] Added SKU while maintaining fixed total quantity:', {
        fixedTotalQuantity: quoteState.fixedTotalQuantity,
        newSKUCount,
        adjustedQuantityPerSKU,
        adjustedTotalQuantity,
        adjustedQuantities
      });

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
      return;
    }

    // 通常モード時の追加
    let sourceQuantity = quoteState.skuQuantities[sourceIndex];

    if (sourceQuantity === undefined || sourceQuantity === null) {
      sourceQuantity = isRollFilm ? 500 : 500;
    }

    const newQuantities = [...quoteState.skuQuantities, sourceQuantity];

    setSKUQuantities(newQuantities);
    setQuantityMode('sku');
    setCurrentPage(0);
    setCopiedIndex(newSKUCount - 1);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  /**
   * Handle bulk quantity application
   */
  const handleApplyBulkQuantity = () => {
    const quantity = parseInt(bulkQuantity);
    const minQuantity = isRollFilm
      ? (quoteState.skuCount === 1 ? 500 : 300)
      : 500;

    if (!isNaN(quantity) && quantity >= minQuantity && quantity <= 1000000) {
      setQuantityMode('sku');
      applyQuantityPattern(quantity);
      setBulkQuantity('');
    }
  };

  /**
   * Calculate film usage for a specific SKU
   */
  const calculateFilmUsage = (skuIndex: number): number => {
    const quantity = quoteState.skuQuantities[skuIndex] || 0;
    const width = quoteState.width || 0;
    const height = quoteState.height || 0;
    const pouchType = quoteState.bagTypeId || '';

    // ロールフィルムの場合は、フィルム使用量 = 数量（メートル）
    if (pouchType === 'roll_film') {
      return quantity;
    }

    // ガイド 04-미터수_및_원가_계산.md 基準ピッチ決定（2026-03-07訂正版）
    // 横向き印刷（平袋/スタンド/スパウト）: ピッチ = W(幅)
    // 展開図基準（合掌袋T封/ガゼットM封）: ピッチ = H(高さ)
    let pitch: number;

    if (pouchType.includes('m_shape') || pouchType.includes('box')) {
      // ガゼットパウチ（M封）: ピッチ = H（高さ）
      pitch = height;
    } else if (pouchType.includes('t_shape') || pouchType.includes('center_seal')) {
      // 合掌袋（T封）: ピッチ = H（高さ）
      pitch = height;
    } else {
      // 平袋、スタンドパウチ、スパウトパウチ: ピッチ = W（幅）
      pitch = width;
    }

    const pouchesPerMeter = 1000 / pitch; // 1m当たりの個数

    // 理論メートル数 = 数量 ÷ (1m当たりの個数)
    const theoreticalMeters = quantity / pouchesPerMeter;

    // ロス（400m）を加算（概算）
    const totalWithLoss = theoreticalMeters + 400;

    return Math.ceil(totalWithLoss);
  };

  /**
   * Get secured meters calculation info
   */
  const getMeterCalculationInfo = () => {
    const skuCount = quoteState.skuCount;
    const lossMeters = 400;

    if (isRollFilm) {
      const minSecuredPerSku = skuCount === 1 ? 500 : 300;
      const totalSecured = minSecuredPerSku * skuCount;
      const totalMeters = totalSecured + lossMeters;

      return {
        minSecuredPerSku,
        totalSecured,
        lossMeters,
        totalMeters,
        isRollFilm: true
      };
    } else {
      const width = quoteState.width || 0;
      let pitch: number;

      // ガイド 04-미터수_및_원가_계산.md 基準ピッチ決定（2026-03-07訂正版）
      // 横向き印刷（平袋/スタンド/スパウト）: ピッチ = W(幅)
      // 展開図基準（合掌袋T封/ガゼットM封）: ピッチ = H(高さ)
      if (quoteState.bagTypeId?.includes('m_shape') ||
          quoteState.bagTypeId?.includes('box')) {
        // ガゼットパウチ（M封）: ピッチ = H（高さ）
        // 展開図基準で生産するため、縦方向が進行方向
        pitch = quoteState.height || 0;
      } else if (quoteState.bagTypeId?.includes('t_shape') ||
                 quoteState.bagTypeId?.includes('center_seal')) {
        // 合掌袋（T封）: ピッチ = H（高さ）
        // 展開図基準で生産するため、縦方向が進行方向
        pitch = quoteState.height || 0;
      } else {
        // 平袋、スタンドパウチ、スパウトパウチ: ピッチ = W（幅）
        // 横向き印刷、横方向が進行方向
        pitch = width;
      }

      const totalQuantity = quoteState.skuQuantities?.reduce((sum, qty) => sum + (qty || 0), 0) || 0;
      const pouchesPerMeter = pitch > 0 ? 1000 / pitch : 1;
      const theoreticalMeters = totalQuantity > 0 ? totalQuantity / pouchesPerMeter : 0;
      const totalSecured = Math.ceil(theoreticalMeters);
      const totalMeters = totalSecured + lossMeters;

      return {
        minSecuredPerSku: 0,
        totalSecured,
        lossMeters,
        totalMeters,
        isRollFilm: false,
        theoreticalMeters,
        totalQuantity
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            SKU・数量設定
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            複数のデザイン（SKU）の数量を設定してください
          </p>
        </div>
      </div>

      {/* 【新規】ステータスインジケーター - 数量が入力されている場合のみ表示 */}
      {totalQuantity > 0 && (
        <StatusIndicator
          skuCount={quoteState.skuCount}
          totalQuantity={totalQuantity}
          estimatedPrice={displayTotalPrice}
          isRollFilm={isRollFilm}
        />
      )}

      {/* 2列生産適用バッジと切り替えトグル */}
      {quoteState.twoColumnOptionApplied && quoteState.originalUnitPrice && (
        <div className="mt-4 p-4 bg-info-50 border border-info-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-info-900">
                💎 {quoteState.twoColumnOptionApplied === 'same' ? '2列生産適用 (7.5% OFF)' : '多列生産適用'}
              </p>
              <p className="text-xs text-info-700">
                ¥{displayOriginalPrice}/個 → ¥{displayUnitPrice}/個
              </p>
            </div>
            <button
              onClick={() => clearAppliedOption()}
              className="px-3 py-1 text-xs bg-info-50 hover:bg-info-100 text-info-800 rounded"
            >
              1列生産に戻す
            </button>
          </div>
        </div>
      )}

      {/* Bulk Operations Panel */}
      {quoteState.skuCount > 1 && (
        <div className="bg-info-50 p-6 rounded-lg border border-info-200">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            一括操作
          </h4>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-700 mb-2">
                {isRollFilm ? '長さパターンを全SKUに適用（メートル）' : '数量パターンを全SKUに適用'}
              </div>
              <div className="flex flex-wrap gap-2">
                {quantityPatterns.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => applyQuantityPattern(pattern)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    全SKU: {pattern.toLocaleString()}{isRollFilm ? 'm' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={isRollFilm ? (quoteState.skuCount === 1 ? "500" : "300") : "500"}
                max="1000000"
                step={isRollFilm ? "0.1" : "1"}
                value={bulkQuantity}
                onChange={(e) => setBulkQuantity(e.target.value)}
                placeholder={isRollFilm
                  ? `長さを全SKUに適用 (最小: ${quoteState.skuCount === 1 ? '500' : '300'}m)`
                  : "数量を全SKUに適用 (最小500個)"}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 ${
                  quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined
                    ? 'bg-info-50 border-info-300 focus:ring-info-500'
                    : 'border-gray-300 focus:ring-info-500'
                }`}
              />
              <button
                onClick={handleApplyBulkQuantity}
                disabled={!bulkQuantity}
                className="px-6 py-2 bg-info-600 text-white rounded-lg hover:bg-info-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                全SKUに適用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKU Quantities Input */}
      {quoteState.skuCount > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">各SKUの数量</h4>

          {/* 固定数量モード時の通知バナー */}
          {quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined && (
            <div className="mb-4 p-4 bg-info-50 border-2 border-info-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-info-600 text-lg">💎</span>
                <div className="flex-1">
                  <p className="text-info-900 font-medium mb-1">
                    2列生産割引適用中 - 総数量{quoteState.fixedTotalQuantity.toLocaleString()}{quoteState.bagTypeId === 'roll_film' ? 'm' : '個'}
                  </p>
                  <p className="text-sm text-info-700 mb-2">
                    各SKUの数量は100単位で自由に調整可能です（最小{quoteState.bagTypeId === 'roll_film' ? '500m' : '500個'}）。総数量が{quoteState.fixedTotalQuantity.toLocaleString()}{quoteState.bagTypeId === 'roll_film' ? 'm' : '個'}になるように配分してください。
                  </p>
                  <div className="text-xs text-info-600 bg-info-50 rounded p-2">
                    現在の総数量: <strong>{totalQuantity.toLocaleString()}{quoteState.bagTypeId === 'roll_film' ? 'm' : '個'}</strong>
                    {totalQuantity === quoteState.fixedTotalQuantity ? (
                      <span className="ml-2 text-green-700">✓ 割引維持</span>
                    ) : (
                      <span className="ml-2 text-error-700">✗ 総数量が一致しません</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 総数量バリデーションエラー */}
          {totalQuantityError && (
            <div className="mb-4 p-4 bg-warning-50 border-2 border-warning-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-warning-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-warning-900 font-medium">{totalQuantityError}</p>
                  <p className="text-xs text-warning-700 mt-1">
                    総数量を{quoteState.fixedTotalQuantity?.toLocaleString()}{quoteState.bagTypeId === 'roll_film' ? 'm' : '個'}に合わせると割引が維持されます
                  </p>
                </div>
                <button
                  onClick={() => setTotalQuantityError(null)}
                  className="text-warning-600 hover:text-warning-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {validationError && (
            <div className="mb-4 p-4 bg-error-50 border-2 border-error-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-error-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-error-800 font-medium">{validationError}</p>
                </div>
                <button
                  onClick={() => setValidationError(null)}
                  className="text-error-600 hover:text-error-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {quoteState.skuQuantityValidationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
              <p className="font-medium">数量エラー</p>
              <p className="text-sm">{quoteState.skuQuantityValidationError}</p>
            </div>
          )}

          {!useCompactView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: quoteState.skuCount }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-info-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">SKU {index + 1}</h5>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copySKUToAddNew(index)}
                        className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 font-medium"
                        title="このSKUをコピーして追加"
                      >
                        <Plus className="w-3 h-3" />
                        追加
                      </button>
                      {quoteState.skuCount > 1 && (
                        <button
                          onClick={() => handleRemoveSKU(index)}
                          className="text-error-600 hover:text-error-700 text-sm flex items-center gap-1 font-medium"
                          title="このSKUを削除"
                        >
                          <Trash2 className="w-3 h-3" />
                          削除
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      {isRollFilm ? '長さ（メートル）' : '数量'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={isRollFilm ? (quoteState.skuCount === 1 ? "500" : "300") : "500"}
                        max="1000000"
                        step={isRollFilm ? "0.1" : "1"}
                        value={(tempQuantities[index] ?? quoteState.skuQuantities[index]) && (tempQuantities[index] ?? quoteState.skuQuantities[index]) !== 0 ? (tempQuantities[index] ?? quoteState.skuQuantities[index]) : ''}
                        onChange={(e) => handleSKUQuantityChange(index, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                          quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined
                            ? 'bg-info-50 border-info-300 focus:ring-info-500'
                            : 'border-gray-300 focus:ring-info-500'
                        }`}
                        placeholder={isRollFilm
                          ? `ロールの長さをメートルで入力（最小: ${quoteState.skuCount === 1 ? '500' : '300'}m）`
                          : "数量を入力（最小500個）"}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {quantityPatterns.map((pattern) => (
                      <button
                        key={pattern}
                        onClick={() => updateSKUQuantity(index, pattern)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined
                            ? 'bg-info-50 text-info-700 hover:bg-info-50'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {pattern}{isRollFilm ? 'm' : ''}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs bg-gray-50 p-2 rounded text-gray-600">
                    フィルム使用量: 約{calculateFilmUsage(index)}m
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        SKU #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {isRollFilm ? '長さ（メートル）' : '数量'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        フィルム使用量
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSKUs.map((skuIndex) => (
                      <tr key={skuIndex} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          SKU {skuIndex + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            min={isRollFilm ? (quoteState.skuCount === 1 ? "500" : "300") : "500"}
                            max="1000000"
                            value={(tempQuantities[skuIndex] ?? quoteState.skuQuantities[skuIndex]) && (tempQuantities[skuIndex] ?? quoteState.skuQuantities[skuIndex]) !== 0 ? (tempQuantities[skuIndex] ?? quoteState.skuQuantities[skuIndex]) : ''}
                            onChange={(e) => handleSKUQuantityChange(skuIndex, e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-sm ${
                              quoteState.twoColumnOptionApplied && quoteState.fixedTotalQuantity !== undefined
                                ? 'bg-info-50 border-info-300'
                                : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          約{calculateFilmUsage(skuIndex)}m
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copySKUToAddNew(skuIndex)}
                              className="text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                            >
                              <Plus className="w-3 h-3" />
                              追加
                            </button>
                            {quoteState.skuCount > 1 && (
                              <button
                                onClick={() => handleRemoveSKU(skuIndex)}
                                className="text-error-600 hover:text-error-700 flex items-center gap-1 font-medium"
                              >
                                <Trash2 className="w-3 h-3" />
                                削除
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    {currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, quoteState.skuCount)} / {quoteState.skuCount} 件目
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                          px-3 py-1 rounded-lg border transition-colors
                          ${currentPage === page
                            ? 'border-info-500 bg-info-500 text-white'
                            : 'border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {page + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 【新規】経済的生産数量のご提案 - 2列生産オプションとSKU分割オプション */}
      {(() => {
        const showCondition = ((!isRollFilm && totalQuantity >= 1000) || (isRollFilm && totalQuantity >= 500)) && twoColumnOptions;
        console.log('[UnifiedSKUQuantityStep] EconomicQuantityProposal render check:', {
          isRollFilm,
          totalQuantity,
          twoColumnOptions,
          showCondition,
          pouchType: quoteState.bagTypeId,
          bagTypeId: quoteState.bagTypeId
        });
        return showCondition;
      })() && (
        <EconomicQuantityProposal
          suggestion={{
            orderQuantity: totalQuantity,
            minimumOrderQuantity: isRollFilm ? (quoteState.skuCount === 1 ? 500 : 300) : 500,
            minimumFilmUsage: getMeterCalculationInfo().totalSecured,
            pouchesPerMeter: getMeterCalculationInfo().theoreticalMeters > 0
              ? totalQuantity / getMeterCalculationInfo().theoreticalMeters
              : 0,
            economicQuantity: totalQuantity,
            economicFilmUsage: getMeterCalculationInfo().totalSecured,
            efficiencyImprovement: 0,
            unitCostAtOrderQty: quoteState.originalUnitPrice || quoteState.unitPrice || 50,
            unitCostAtEconomicQty: quoteState.originalUnitPrice || quoteState.unitPrice || 50,
            costSavings: 0,
            costSavingsRate: 0,
            recommendedQuantity: totalQuantity,
            recommendationReason: '現在の数量に基づいた最適な生産オプションを提案します',
            // 2列生産オプション
            twoColumnProductionOptions: twoColumnOptions,
            // SKU分割オプション
            skuSplitOptions: skuSplitOptions.length > 0 ? skuSplitOptions.map(opt => ({
              skuCount: opt.skuCount,
              quantityPerSKU: opt.quantityPerSKU,
              totalQuantity: opt.totalQuantity,
              description: opt.description
            })) : undefined
          }}
          appliedOption={quoteState.twoColumnOptionApplied}
          isRollFilm={isRollFilm}
          onAcceptRecommendation={() => {
            // 推奨数量を受け入れるハンドラー
            console.log('[UnifiedSKUQuantityStep] Recommendation accepted');
          }}
          onApplyTwoColumnOption={handleApplyTwoColumnOption}
        />
      )}

      {/* Copy confirmation */}
      <AnimatePresence>
        {copiedIndex !== null && (
          <motion.div
            key="copy-toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Plus className="w-4 h-4" />
            SKU {copiedIndex + 1}を追加しました
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

UnifiedSKUQuantityStep.displayName = 'UnifiedSKUQuantityStep';

export default UnifiedSKUQuantityStep;
export { UnifiedSKUQuantityStep };

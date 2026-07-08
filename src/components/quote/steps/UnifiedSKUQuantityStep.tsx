'use client';

import React, { useState, useMemo, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2,
  Copy
} from 'lucide-react';
import { useQuoteState, useQuote } from '@/contexts/QuoteContext';
import { unifiedPricingEngine } from '@/lib/unified-pricing-engine';
import { validateMOQ, isKraftMaterial } from '@/lib/pricing/validators/moq-validator';
import { StatusIndicator } from '../shared/StatusIndicator';
import { useToast } from '../shared/ErrorToast';

/**
 * バリデーション関数の型定義
 */
export interface UnifiedSKUQuantityStepRef {
  validateQuantities: () => boolean;
}

/**
 * UnifiedSKUQuantityStep の Props
 *
 * C1契約（callback prop 方式）:
 * - patternQuantities: 複数パターン数量 [skuIndex][patternIndex]。
 *   SKU数 <=5 時のみ親（ImprovedQuotingWizard）から渡される。
 *   未渡し（undefined）時は複数パターンUIを表示しない（後方互換）。
 * - onPatternQuantitiesChange: パターン数量変更のコールバック。
 */
export interface UnifiedSKUQuantityStepProps {
  patternQuantities?: number[][];
  onPatternQuantitiesChange?: (qties: number[][]) => void;
}

/**
 * 複数パターン数量の最大パターン数（spec: 最小1・最大5）
 */
const MAX_PATTERN_COLUMNS = 5;

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
 *
 * Cost calculation logic:
 * - 1 SKU: 500m minimum + 400m loss = 900m total
 * - 2+ SKUs: 300m each + 400m loss shared
 */
const UnifiedSKUQuantityStep = forwardRef<UnifiedSKUQuantityStepRef, UnifiedSKUQuantityStepProps>((props, ref) => {
  const { patternQuantities, onPatternQuantitiesChange } = props;
  const quoteState = useQuoteState();
  const {
    setSKUCount,
    setSKUQuantities,
    updateSKUQuantity,
    setQuantityMode
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

  // ローカル価格計算用の状態とref（ImprovedQuotingWizardのRealTimePriceDisplayと同様のパターン）
  const [localUnitPrice, setLocalUnitPrice] = useState<number | null>(null);
  const [localTotalPrice, setLocalTotalPrice] = useState<number | null>(null);
  const previousPriceRef = useRef<number | null>(null);
  const isCalculatingPriceRef = useRef(false);

  // 総数量の計算
  const totalQuantity = quoteState.skuQuantities.reduce((sum, qty) => sum + qty, 0);

  // 表示価格の計算（ローカル計算価格またはQuoteContextの値を使用）
  const displayUnitPrice = localUnitPrice || quoteState.unitPrice || 50;
  const displayTotalPrice = localTotalPrice || quoteState.totalPrice || 0;

  // 複数パターン入力ビュー判定（spec AC-1 / C1契約）
  // SKU数 1-10 かつ親から patternQuantities が渡された場合のみ有効。
  // SKU数11以上は別途見積もり依頼を案内（needsCustomQuote）。
  // ※価格計算useEffectより前で定義（同useEffect内で参照するため）
  const useMultiPatternView =
    quoteState.skuCount >= 1 &&
    quoteState.skuCount <= 10 &&
    patternQuantities !== undefined &&
    onPatternQuantitiesChange !== undefined;

  // 価格計算（ImprovedQuotingWizardのRealTimePriceDisplayと同様のパターン）
  useEffect(() => {
    // 無限ループ防止
    if (isCalculatingPriceRef.current) {
      return;
    }

    // 複数パターンビューでは従来 skuQuantities ベースのプレビュー計算をスキップ
    // （patternQuantities は別系統・パターンごとの計算は Step3 ResultStep で実施。
    //   パターン未入力=0 の時に誤って計算・表示させないため）
    if (useMultiPatternView) {
      setLocalUnitPrice(null);
      setLocalTotalPrice(null);
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
        });

        // CRITICAL FIX: Only update state if values have actually changed
        // This prevents infinite re-render loops
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
  ]);

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

  // SKU数11以上はウィザード対象外・別途見積もり依頼へ誘導
  const needsCustomQuote = quoteState.skuCount >= 11;

  // Check if roll film (uses meter-based calculation)
  const isRollFilm = quoteState.bagTypeId === 'roll_film';

  // 複数パターンUI用の正規化された数量（[skuIndex][patternIndex]）
  // - SKU数と一致する行数を保証
  // - 全行同じ列数を保証（jagged array 防止）
  // - 親state（patternQuantities）が空/不正時は1パターン×0で初期化
  const normalizedPatternQuantities = useMemo<number[][]>(() => {
    if (!useMultiPatternView) return [];
    const skuCount = quoteState.skuCount;
    const source = patternQuantities ?? [];
    // パターン列数: 5固定表示（Math.max(5, sourceCols) と MAX_PATTERN_COLUMNS=5 のため）。
    const sourceCols = source.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
    const colCount = Math.min(MAX_PATTERN_COLUMNS, Math.max(5, sourceCols));
    const result: number[][] = [];
    for (let s = 0; s < skuCount; s++) {
      const row = Array.isArray(source[s]) ? source[s] : [];
      const padded: number[] = [];
      for (let p = 0; p < colCount; p++) {
        const v = row[p];
        padded.push(typeof v === 'number' && !isNaN(v) ? v : 0);
      }
      result.push(padded);
    }
    return result;
  }, [useMultiPatternView, quoteState.skuCount, patternQuantities]);

  // 複数パターンUIのパターン列数（全SKU共通）
  const patternColumnCount = normalizedPatternQuantities[0]?.length ?? 0;

  // 追加ボタン列が表示されているか（最大未満で表示）
  const hasAddPatternColumn = patternColumnCount < MAX_PATTERN_COLUMNS && patternColumnCount > 0;

  // 各セルに適用する最小数量（ユーザー要望: 最低1パターン500個/m）
  // roll_film=500m / pouch系=500個 に統一
  const minQtyPerCell = 500;

  // 複数パターンのセル値変更ハンドラー（[skuIndex][patternIndex]）
  const handlePatternCellChange = (skuIndex: number, patternIndex: number, value: string) => {
    if (!onPatternQuantitiesChange) return;
    const parsed = value === '' ? 0 : parseInt(value, 10);
    const safe = isNaN(parsed) ? 0 : parsed;
    const next = normalizedPatternQuantities.map((row, s) => {
      if (s !== skuIndex) return row.slice();
      const newRow = row.slice();
      newRow[patternIndex] = safe;
      return newRow;
    });
    onPatternQuantitiesChange(next);
  };

  // 指定SKU行の5パターン数量を他の全SKU行へ一括コピー（行コピー機能）
  // ユーザー要望: SKU 1行目に入力した数量を1クリックで他行に反映。
  // コピー元行自身は保持、他行は sourceRow の数量で上書き。
  const handleCopyPatternRow = (sourceSkuIndex: number) => {
    if (!onPatternQuantitiesChange) return;
    const sourceRow = normalizedPatternQuantities[sourceSkuIndex];
    if (!sourceRow) return;
    const next = normalizedPatternQuantities.map((row, s) =>
      s === sourceSkuIndex ? row.slice() : sourceRow.slice()
    );
    onPatternQuantitiesChange(next);
    showSuccess(`SKU ${sourceSkuIndex + 1} の数量を他の全SKUにコピーしました`, 0);
  };

  // パターン列追加（全SKU一斉・min1 max5・jagged array防止）
  const handleAddPatternColumn = () => {
    if (!onPatternQuantitiesChange) return;
    if (patternColumnCount >= MAX_PATTERN_COLUMNS) return;
    const next = normalizedPatternQuantities.map(row => [...row, 0]);
    onPatternQuantitiesChange(next);
  };

  // パターン列削除（全SKU一斉・min2・最後尾列を削除）
  const handleRemovePatternColumn = () => {
    if (!onPatternQuantitiesChange) return;
    if (patternColumnCount <= 2) return;
    const next = normalizedPatternQuantities.map(row => row.slice(0, -1));
    onPatternQuantitiesChange(next);
  };

  // 複数パターンビュー用 特定SKU行削除（index指定・表の×ボタン用）
  const handleRemovePatternSKU = (indexToRemove: number) => {
    if (quoteState.skuCount <= 1) return;
    const next = normalizedPatternQuantities.filter((_, i) => i !== indexToRemove);
    setSKUCount(next.length);
    if (onPatternQuantitiesChange) onPatternQuantitiesChange(next);
  };

  // 複数パターンビュー用 SKU数変更（spec AC-1: SKU数1-5）
  // patternQuantities の行数も連動して調整（追加: [0,...] 行、削除: 最終行）
  // setSKUCount と onPatternQuantitiesChange の両方を更新
  const handlePatternSKUCountChange = (newCount: number) => {
    const safe = Math.max(1, Math.min(10, newCount));
    setSKUCount(safe);
    if (!onPatternQuantitiesChange) return;
    const current = normalizedPatternQuantities;
    const colCount = current[0]?.length ?? 1;
    let next: number[][];
    if (safe > current.length) {
      next = [...current];
      while (next.length < safe) next.push(Array(colCount).fill(0));
    } else if (safe < current.length) {
      next = current.slice(0, safe);
    } else {
      next = current;
    }
    onPatternQuantitiesChange(next);
  };


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

    // 通常モード時の更新
    if (typeof parsedValue === 'number' && !isNaN(parsedValue)) {
      setQuantityMode('sku');
      updateSKUQuantity(index, parsedValue);
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

    setValidationError(null);
    return true;
  };

  useImperativeHandle(ref, () => ({
    validateQuantities
  }));

  /**
   * Handle SKU removal
   */
  const handleRemoveSKU = (indexToRemove: number) => {
    if (quoteState.skuCount <= 1) {
      return;
    }

    const newQuantities = quoteState.skuQuantities.filter((_, idx) => idx !== indexToRemove);
    const newCount = newQuantities.length;

    setTempQuantities(newQuantities);
    setSKUCount(newCount);
    setSKUQuantities(newQuantities);

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

      {/* Bulk Operations Panel（複数パターンビューでは非表示・従来ビューのみ） */}
      {quoteState.skuCount > 1 && !useMultiPatternView && (
        <div className="bg-info-50 p-6 rounded-lg border border-info-200">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            一括操作
          </h4>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-700 mb-2">
                {isRollFilm ? '長さパターンをすべてのデザインに適用（メートル）' : '数量パターンをすべてのデザインに適用'}
              </div>
              <div className="flex flex-wrap gap-2">
                {quantityPatterns.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => applyQuantityPattern(pattern)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    全デザイン: {pattern.toLocaleString()}{isRollFilm ? 'm' : ''}
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
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 border-gray-300 focus:ring-info-500"
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

          {/* 総数量バリデーションエラー */}
          {totalQuantityError && (
            <div className="mb-4 p-4 bg-warning-50 border-2 border-warning-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-warning-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-warning-900 font-medium">{totalQuantityError}</p>
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

          {/* 複数パターン入力UI（spec AC-1〜AC-4 / C1契約）
              SKU数 <=5 かつ親から patternQuantities が渡された場合のみ表示。
              それ以外は従来単一UI（!useCompactView / useCompactView 分岐）へフォールバック。 */}
          {needsCustomQuote ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                SKU数が11個以上のため、即時見積もり対象外です
              </h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                SKU数 <strong>{quoteState.skuCount}個</strong> のカスタム見積もりは、別途お問い合わせページより承ります。<br />
                専門スタッフが詳細をヒアリングの上、最適なご提案・お見積りをいたします。
              </p>
              <a
                href="/inquiry/detailed?from=quote-simulator&type=custom-quote"
                className="inline-flex items-center gap-2 px-6 py-3 bg-info-600 text-white rounded-lg hover:bg-info-700 transition-colors font-medium shadow-sm"
              >
                別途見積もり依頼（詳細お問い合わせ）へ進む →
              </a>
              <p className="text-xs text-gray-500 mt-4">
                ※ 遷移先のテンプレート（5ステップ）に沿って必要事項を記入してください
              </p>
            </div>
          ) : useMultiPatternView ? (
            <div className="space-y-3">
              {/* 複数パターン入力の説明（デフォルト2パターン・追加ボタンで3〜5パターンに拡張） */}
              <div className="bg-info-50 p-3 rounded-lg border border-info-200">
                <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4" />
                  数量パターン比較入力
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  デフォルト2パターン。表の「+ 追加」ボタンで最大5パターンまで拡張できます（最低1パターン必須・各セル最小{minQtyPerCell}{isRollFilm ? 'm' : '個'}）。未入力のパターンは計算時にスキップされます。
                </p>
              </div>

              {/* SKU行 × パターン列 の表形式（AC-2・デフォルト2列・追加ボタンで拡張） */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200 sticky left-0 bg-gray-50">
                        SKU
                      </th>
                      {Array.from({ length: patternColumnCount }).map((_, p) => (
                        <th key={p} className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border border-gray-200 min-w-[80px] max-w-[110px] relative">
                          パターン {p + 1}
                          <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                            合計: {normalizedPatternQuantities.reduce((sum, row) => sum + (row[p] || 0), 0).toLocaleString()}{isRollFilm ? 'm' : '個'}
                          </div>
                          {p === patternColumnCount - 1 && patternColumnCount > 2 && (
                            <button
                              type="button"
                              onClick={handleRemovePatternColumn}
                              className="absolute top-1 right-1 text-gray-300 hover:text-red-500 transition-colors"
                              title="最後のパターン列を削除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </th>
                      ))}
                      {patternColumnCount < MAX_PATTERN_COLUMNS && (
                        <th className="px-2 py-1.5 text-center border border-gray-200 bg-gray-50 min-w-[60px]">
                          <button
                            type="button"
                            onClick={handleAddPatternColumn}
                            className="text-info-600 hover:text-info-700 text-xs flex items-center gap-1 font-medium justify-center"
                            title="パターン列を追加（最大5）"
                          >
                            <Plus className="w-3.5 h-3.5" />追加
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedPatternQuantities.map((row, skuIndex) => (
                      <tr key={skuIndex} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 border border-gray-200 bg-white sticky left-0">
                          <div className="flex items-center gap-1">
                            <span>SKU {skuIndex + 1}</span>
                            {normalizedPatternQuantities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleCopyPatternRow(skuIndex)}
                                className="text-info-500 hover:text-info-700 transition-colors"
                                title="この行の数量を他の全SKUにコピー"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {normalizedPatternQuantities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePatternSKU(skuIndex)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="このSKU行を削除"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        {row.map((cellValue, patternIndex) => {
                          // AC-4: 最小数量ルール（L385側: roll_film=500m / pouch=100個）
                          const belowMin = cellValue !== 0 && cellValue < minQtyPerCell;
                          return (
                            <td key={patternIndex} className="px-1 py-1 border border-gray-200 min-w-[80px] max-w-[110px]">
                              <input
                                type="number"
                                min={minQtyPerCell}
                                max="1000000"
                                step={isRollFilm ? '0.1' : '1'}
                                value={cellValue === 0 ? '' : cellValue}
                                onChange={(e) => handlePatternCellChange(skuIndex, patternIndex, e.target.value)}
                                className={`w-full px-1.5 py-1 text-xs border rounded text-center focus:ring-2 focus:ring-info-500 ${
                                  belowMin
                                    ? 'border-red-400 bg-red-50 text-red-700'
                                    : 'border-gray-300 bg-white'
                                }`}
                                placeholder={`最小${minQtyPerCell}${isRollFilm ? 'm' : '個'}`}
                              />
                              {belowMin && (
                                <p className="text-[10px] text-red-600 mt-1 text-center">
                                  最小{minQtyPerCell}{isRollFilm ? 'm' : '個'}未満
                                </p>
                              )}
                            </td>
                          );
                        })}
                        {hasAddPatternColumn && <td className="border border-gray-200" />}
                      </tr>
                    ))}
                    {quoteState.skuCount < 10 ? (
                      <tr>
                        <td colSpan={patternColumnCount + 1 + (hasAddPatternColumn ? 1 : 0)} className="border border-gray-200 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => handlePatternSKUCountChange(quoteState.skuCount + 1)}
                            className="w-full py-2 m-1 text-sm text-gray-500 hover:text-info-600 hover:bg-info-50 flex items-center justify-center gap-1 transition-colors border-2 border-dashed border-gray-300 rounded-lg"
                            title="SKU行を追加（最大10）"
                          >
                            <Plus className="w-4 h-4" />
                            SKU行を追加
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={patternColumnCount + 1 + (hasAddPatternColumn ? 1 : 0)} className="border border-gray-200 bg-amber-50">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-2 m-1 text-sm">
                            <span className="text-amber-800 font-medium">SKU数が上限（10）に達しました。11個以上は別途見積もり依頼となります。</span>
                            <a
                              href="/inquiry/detailed?from=quote-simulator&type=custom-quote"
                              className="text-info-600 hover:text-info-700 font-medium underline whitespace-nowrap"
                            >
                              別途見積もり依頼へ →
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !useCompactView ? (
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
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 border-gray-300 focus:ring-info-500"
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
                        className="px-2 py-1 rounded text-xs transition-colors bg-gray-100 hover:bg-gray-200"
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
                            className="w-full px-2 py-1 border rounded text-sm border-gray-300"
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

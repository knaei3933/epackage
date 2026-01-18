'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Info
} from 'lucide-react';
import { useQuoteState, useQuote } from '@/contexts/QuoteContext';

/**
 * Unified SKU & Quantity Step Component
 *
 * Features:
 * 1. SKU count selection (1-100 SKUs)
 * 2. Standard view for 1-10 SKUs (Grid layout)
 * 3. Compact view for 11-100 SKUs (Table + pagination)
 * 4. Bulk operations panel
 * 5. Film usage calculation per SKU
 *
 * Cost calculation logic:
 * - 1 SKU: 500m minimum + 400m loss = 900m total
 * - 2+ SKUs: 300m each + 400m loss shared
 */
function UnifiedSKUQuantityStep() {
  const quoteState = useQuoteState();
  const {
    setSKUCount,
    setSKUQuantities,
    updateSKUQuantity,
    updateSKUName,
    setQuantityMode
  } = useQuote();

  const [customQuantity, setCustomQuantity] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [bulkQuantity, setBulkQuantity] = useState('');

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

  // SKU count selection options (1-5 direct buttons, 6+ use custom input)
  const skuCountOptions = [
    { value: 1, label: '1種類', description: '1つのデザイン' },
    { value: 2, label: '2種類', description: '2つのデザイン' },
    { value: 3, label: '3種類', description: '3つのデザイン' },
    { value: 4, label: '4種類', description: '4つのデザイン' },
    { value: 5, label: '5種類', description: '5つのデザイン' }
  ];

  // Quantity patterns for quick selection (meter-based for roll film)
  const quantityPatterns: number[] = isRollFilm
    ? quoteState.skuCount === 1
      ? [500, 1000, 2000, 5000] // 1 SKU: 500mから開始
      : [300, 500, 1000, 2000, 5000] // 2+ SKU: 300mから開始
    : [100, 500, 1000, 2000, 5000, 10000]; // 個数単位

  /**
   * Handle SKU count change
   */
  const handleSKUCountChange = (count: number) => {
    console.log('[handleSKUCountChange] Changing SKU count to:', count);
    console.log('[handleSKUCountChange] Current quantities before change:', quoteState.skuQuantities);
    setSKUCount(count);
    setQuantityMode('sku');
    setCurrentPage(0); // Reset to first page
  };

  /**
   * Handle custom SKU count input
   */
  const handleCustomSKUCount = () => {
    const count = parseInt(customQuantity);
    if (!isNaN(count) && count >= 1 && count <= 100) {
      handleSKUCountChange(count);
      setCustomQuantity('');
    }
  };

  /**
   * Apply quantity pattern to all SKUs
   */
  const applyQuantityPattern = (pattern: number) => {
    console.log('[applyQuantityPattern] Applying pattern:', pattern, 'to', quoteState.skuCount, 'SKUs');
    // Enable SKU mode when applying pattern
    setQuantityMode('sku');
    const newQuantities = Array(quoteState.skuCount).fill(pattern);
    console.log('[applyQuantityPattern] New quantities:', newQuantities);
    setSKUQuantities(newQuantities);
  };

  /**
   * Apply quantity to single SKU
   */
  const handleSKUQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value);
    console.log('[handleSKUQuantityChange] Updating SKU', index, 'to quantity:', quantity);
    if (!isNaN(quantity) && quantity >= 100) {
      // Enable SKU mode when setting quantity
      setQuantityMode('sku');
      updateSKUQuantity(index, quantity);
    }
  };

  /**
   * Handle SKU name change
   */
  const handleSKUNameChange = (index: number, name: string) => {
    updateSKUName(index, name);
  };

  /**
   * Copy current SKU to add a new SKU
   * This increases SKU count by 1 and copies the source SKU's data
   *
   * IMPORTANT: Must update skuCount and skuQuantities ATOMICALLY to avoid state sync issues
   * The order matters: set quantities first, THEN update count to avoid reducer overwriting
   */
  const copySKUToAddNew = (sourceIndex: number) => {
    console.log('[copySKUToAddNew] ===== ADD NEW SKU OPERATION START =====');
    console.log('[copySKUToAddNew] Source SKU index:', sourceIndex);
    console.log('[copySKUToAddNew] Current skuCount:', quoteState.skuCount);
    console.log('[copySKUToAddNew] Current skuQuantities:', quoteState.skuQuantities);
    console.log('[copySKUToAddNew] Current skuNames:', quoteState.skuNames);

    // Check if we can add more SKUs (max 100)
    if (quoteState.skuCount >= 100) {
      console.error('[copySKUToAddNew] ERROR: Maximum SKU count (100) reached');
      return;
    }

    const sourceQuantity = quoteState.skuQuantities[sourceIndex];
    const sourceName = quoteState.skuNames?.[sourceIndex] || '';

    console.log('[copySKUToAddNew] Source quantity:', sourceQuantity);
    console.log('[copySKUToAddNew] Source name:', sourceName);

    if (sourceQuantity === undefined || sourceQuantity === null) {
      console.error('[copySKUToAddNew] ERROR: Source quantity is undefined/null');
      return;
    }

    if (!sourceQuantity || sourceQuantity < 100) {
      console.error('[copySKUToAddNew] ERROR: Source quantity is invalid (< 100):', sourceQuantity);
      return;
    }

    // Calculate new SKU count
    const newSkuCount = quoteState.skuCount + 1;
    console.log('[copySKUToAddNew] New SKU count will be:', newSkuCount);

    // Build new quantities array with the copied SKU added
    // CRITICAL: Build array of EXACTLY newSkuCount length to match new count
    const newQuantities = [...quoteState.skuQuantities, sourceQuantity];
    console.log('[copySKUToAddNew] New quantities array (length:', newQuantities.length, '):', newQuantities);

    // Build new names array with the copied name (with suffix)
    const newNames = [...(quoteState.skuNames || []), sourceName ? `${sourceName} (コピー)` : ''];

    // CRITICAL FIX: setSKUQuantities now automatically updates skuCount
    // Don't call setSKUCount separately as it will cause issues
    console.log('[copySKUToAddNew] Step 1: Setting SKU quantities to:', newQuantities);
    console.log('[copySKUToAddNew] This will automatically update skuCount to:', newSkuCount);
    setSKUQuantities(newQuantities);

    // Step 2: Update the name for the new SKU
    console.log('[copySKUToAddNew] Step 2: Updating SKU name for index:', newSkuCount - 1);
    updateSKUName(newSkuCount - 1, newNames[newSkuCount - 1]);

    // Step 3: Enable SKU mode (also set automatically by SET_SKU_QUANTITIES, but ensuring it)
    console.log('[copySKUToAddNew] Step 3: Ensuring quantity mode is SKU');
    setQuantityMode('sku');

    // Reset to first page after adding new SKU (to show the new SKU)
    setCurrentPage(0);

    // Show success toast with the new SKU number
    setCopiedIndex(newSkuCount - 1);

    console.log('[copySKUToAddNew] ===== NEW SKU ADDED: SKU', newSkuCount, '=====');
    console.log('[copySKUToAddNew] Expected final state: skuCount=', newSkuCount, ', skuQuantities=', newQuantities);
    console.log('[copySKUToAddNew] Toast should be visible for 2 seconds');

    // Clear copied index after 2 seconds
    setTimeout(() => {
      console.log('[copySKUToAddNew] Hiding toast');
      setCopiedIndex(null);
    }, 2000);
  };

  /**
   * Handle bulk quantity application
   */
  const handleApplyBulkQuantity = () => {
    const quantity = parseInt(bulkQuantity);
    console.log('[handleApplyBulkQuantity] Applying bulk quantity:', quantity, 'to', quoteState.skuCount, 'SKUs');

    if (!isNaN(quantity) && quantity >= 100 && quantity <= 1000000) {
      // Enable SKU mode when applying bulk quantity
      console.log('[handleApplyBulkQuantity] Setting quantity mode to SKU');
      setQuantityMode('sku');

      console.log('[handleApplyBulkQuantity] Applying quantity pattern:', quantity);
      applyQuantityPattern(quantity);
      setBulkQuantity('');
      console.log('[handleApplyBulkQuantity] Bulk quantity applied successfully');
    } else {
      console.error('[handleApplyBulkQuantity] Invalid quantity:', quantity);
    }
  };

  /**
   * Get total quantity across all SKUs
   */
  const getTotalQuantity = () => {
    return quoteState.skuQuantities.reduce((sum, qty) => sum + qty, 0);
  };

  /**
   * Calculate film usage for a specific SKU
   */
  const calculateFilmUsage = (skuIndex: number): number => {
    const quantity = quoteState.skuQuantities[skuIndex] || 0;
    const width = quoteState.width || 0;
    const height = quoteState.height || 0;

    // Simple calculation: (width + height) * 2 * quantity / 1000 (in meters)
    // This is a simplified version - actual calculation would use PouchCostCalculator
    const circumference = (width + height) * 2;
    const metersPerPiece = circumference / 1000;
    return Math.ceil(quantity * metersPerPiece);
  };

  /**
   * Get secured meters calculation info
   */
  const getMeterCalculationInfo = () => {
    const skuCount = quoteState.skuCount;
    const minSecuredPerSku = skuCount === 1 ? 500 : 300;
    const totalSecured = minSecuredPerSku * skuCount;
    const lossMeters = 400; // Fixed
    const totalMeters = totalSecured + lossMeters;

    return {
      minSecuredPerSku,
      totalSecured,
      lossMeters,
      totalMeters
    };
  };

  const meterInfo = getMeterCalculationInfo();

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
        {quoteState.skuCount > 1 && (
          <div className="text-right">
            <div className="text-sm text-gray-600">総数量</div>
            <div className="text-2xl font-bold text-blue-600">
              {getTotalQuantity().toLocaleString()}{quoteState.bagTypeId === 'roll_film' ? 'm' : '個'}
            </div>
          </div>
        )}
      </div>

      {/* SKU Count Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">SKU数（デザイン数）の選択</h4>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {skuCountOptions.map((option) => {
            const isSelected = quoteState.skuCount === option.value;

            return (
              <motion.button
                key={option.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSKUCountChange(option.value)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Custom SKU count input */}
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="100"
            value={customQuantity}
            onChange={(e) => setCustomQuantity(e.target.value)}
            placeholder="または直接入力 (1-100)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleCustomSKUCount}
            disabled={!customQuantity}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            設定
          </button>
        </div>

        {/* Calculation info */}
        {quoteState.skuCount > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium mb-1">フィルム使用量の計算</div>
                <div className="space-y-1">
                  <div>• 最小確保量: {meterInfo.minSecuredPerSku}m × {quoteState.skuCount}SKU = {meterInfo.totalSecured}m</div>
                  <div>• ロス（固定）: {meterInfo.lossMeters}m</div>
                  <div>• 総計: {meterInfo.totalMeters}m</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operations Panel */}
      {quoteState.skuCount > 1 && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            一括操作
          </h4>

          <div className="space-y-4">
            {/* Quick patterns */}
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

            {/* Custom bulk quantity */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={isRollFilm ? (quoteState.skuCount === 1 ? "500" : "300") : "100"}
                max="1000000"
                step={isRollFilm ? "0.1" : "1"}
                value={bulkQuantity}
                onChange={(e) => setBulkQuantity(e.target.value)}
                placeholder={isRollFilm
                  ? `長さを全SKUに適用 (最小: ${quoteState.skuCount === 1 ? '500' : '300'}m)`
                  : "数量を全SKUに適用 (100-1,000,000)"}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleApplyBulkQuantity}
                disabled={!bulkQuantity}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
          <h4 className="font-medium text-gray-900 mb-4">各SKUの数量とデザイン名</h4>

          {!useCompactView ? (
            /* Standard View (1-10 SKUs) - Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: quoteState.skuCount }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">SKU {index + 1}</h5>
                    <button
                      onClick={() => copySKUToAddNew(index)}
                      className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 font-medium"
                      title="このSKUをコピーして追加"
                    >
                      <Plus className="w-3 h-3" />
                      SKU追加
                    </button>
                  </div>

                  {/* Design Name Input */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">デザイン名（任意）</label>
                    <input
                      type="text"
                      value={quoteState.skuNames?.[index] || ''}
                      onChange={(e) => handleSKUNameChange(index, e.target.value)}
                      placeholder="例：チョコ味、ストロベリー"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Quantity Input */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      {isRollFilm ? '長さ（メートル）' : '数量'}
                    </label>
                    <input
                      type="number"
                      min={isRollFilm ? (quoteState.skuCount === 1 ? "500" : "300") : "100"}
                      max="1000000"
                      step={isRollFilm ? "0.1" : "1"}
                      value={quoteState.skuQuantities[index] || ''}
                      onChange={(e) => handleSKUQuantityChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={isRollFilm
                        ? `ロールの長さをメートルで入力（最小: ${quoteState.skuCount === 1 ? '500' : '300'}m）`
                        : "数量を入力"}
                    />
                    {isRollFilm && (
                      <div className="text-xs text-gray-500 mt-1">
                        ※ 最小注文数量: {quoteState.skuCount === 1 ? '500m (1 SKU)' : '300m/SKU (2 SKU以上)'}
                      </div>
                    )}
                  </div>

                  {/* Quick Pattern Buttons */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {quantityPatterns.map((pattern) => (
                      <button
                        key={pattern}
                        onClick={() => updateSKUQuantity(index, pattern)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                      >
                        {pattern}{isRollFilm ? 'm' : ''}
                      </button>
                    ))}
                  </div>

                  {/* Film Usage */}
                  <div className="text-xs bg-gray-50 p-2 rounded text-gray-600">
                    フィルム使用量: 約{calculateFilmUsage(index)}m
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Compact View (11-100 SKUs) - Table + Pagination */
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        SKU #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        デザイン名（任意）
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
                            type="text"
                            value={quoteState.skuNames?.[skuIndex] || ''}
                            onChange={(e) => handleSKUNameChange(skuIndex, e.target.value)}
                            placeholder="任意"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            min="100"
                            max="1000000"
                            value={quoteState.skuQuantities[skuIndex] || ''}
                            onChange={(e) => handleSKUQuantityChange(skuIndex, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          約{calculateFilmUsage(skuIndex)}m
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => copySKUToAddNew(skuIndex)}
                            className="text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                            title="このSKUをコピーして追加"
                          >
                            <Plus className="w-3 h-3" />
                            SKU追加
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                            ? 'border-blue-500 bg-blue-500 text-white'
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
}

export default UnifiedSKUQuantityStep;

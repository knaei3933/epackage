'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  X,
  Info,
  Copy,
  Check
} from 'lucide-react';
import { useQuoteState, useQuote } from '@/contexts/QuoteContext';

/**
 * SKU Selection Step Component
 *
 * This component allows users to:
 * 1. Select the number of SKUs (1-4 designs)
 * 2. Input quantities for each SKU
 * 3. Apply quantity patterns to all SKUs at once
 *
 * Based on the cost calculation logic:
 * - 1 SKU: Minimum 500m secured + 400m loss = 900m total
 * - 2+ SKUs: Each gets 300m secured + 400m loss shared (e.g., 2 SKU = 1000m total)
 */
function SKUSelectionStep() {
  const quoteState = useQuoteState();
  const { setSKUCount, setSKUQuantities, updateSKUQuantity, toggleSKUCalculation } = useQuote();

  const [customQuantity, setCustomQuantity] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // SKU count options (1-4 SKUs)
  const skuCountOptions = [
    { value: 1, label: '1種類', description: '1つのデザイン' },
    { value: 2, label: '2種類', description: '2つのデザイン' },
    { value: 3, label: '3種類', description: '3つのデザイン' },
    { value: 4, label: '4種類', description: '4つのデザイン' }
  ];

  // Quantity patterns for quick selection
  const quantityPatterns = [100, 500, 1000, 2000, 5000, 10000];

  /**
   * Apply a quantity pattern to all SKUs
   */
  const applyQuantityPattern = (pattern: number) => {
    const newQuantities = Array(quoteState.skuCount).fill(pattern);
    setSKUQuantities(newQuantities);
  };

  /**
   * Update a single SKU's quantity
   */
  const handleSKUQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 100) {
      updateSKUQuantity(index, quantity);
    }
  };

  /**
   * Copy quantity from one SKU to others
   */
  const copyQuantityToAll = (sourceIndex: number) => {
    const sourceQuantity = quoteState.skuQuantities[sourceIndex];
    const newQuantities = Array(quoteState.skuCount).fill(sourceQuantity);
    setSKUQuantities(newQuantities);
    setCopiedIndex(sourceIndex);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * Handle custom quantity input for all SKUs
   */
  const handleApplyCustomQuantity = () => {
    const quantity = parseInt(customQuantity);
    if (!isNaN(quantity) && quantity >= 100 && quantity <= 1000000) {
      applyQuantityPattern(quantity);
      setCustomQuantity('');
    }
  };

  /**
   * Get total quantity across all SKUs
   */
  const getTotalQuantity = () => {
    return quoteState.skuQuantities.reduce((sum, qty) => sum + qty, 0);
  };

  /**
   * Get secured meters calculation info for display
   * Based on: 1 SKU = 500m minimum, 2+ SKUs = 300m each
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <Layers className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold mb-1">SKU選択（デザイン数）</h2>
            <p className="text-purple-100">
              複数のデザイン（SKU）で見積もる場合、SKU数と各SKUの数量を入力してください
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">SKU（Stock Keeping Unit）とは</p>
            <p className="text-blue-700">
              各SKUは異なるデザイン/柄を表します。例えば「2種類」を選ぶと、
              2つの異なるデザイン（柄違い）のパウチを同じ数量で見積もることができます。
            </p>
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900 mb-1">フィルム原価計算ルール</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 1 SKU: 最小確保量 500m + ロス 400m = 合計 900m</li>
                <li>• 2+ SKU: 各SKU 300m確保 + ロス 400m（例: 2 SKU = 1000m総量）</li>
                <li>• 最小確保量超過時のみ50m単位で切り上げ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SKU Count Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          SKU数（デザイン数）を選択
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {skuCountOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setSKUCount(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                quoteState.skuCount === option.value
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  quoteState.skuCount === option.value ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  {option.label}
                </div>
                <div className={`text-sm ${
                  quoteState.skuCount === option.value ? 'text-purple-700' : 'text-gray-500'
                }`}>
                  {option.description}
                </div>
                {quoteState.skuCount === option.value && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-medium"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    選択中
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quantity Pattern Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          クイック数量パターン（全SKUに適用）
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quantityPatterns.map((pattern) => (
            <button
              key={pattern}
              type="button"
              onClick={() => applyQuantityPattern(pattern)}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all font-medium text-gray-700"
            >
              各{pattern.toLocaleString()}個
            </button>
          ))}
        </div>

        {/* Custom Quantity Input */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            value={customQuantity}
            onChange={(e) => setCustomQuantity(e.target.value)}
            placeholder="カスタム数量（例: 1500）"
            min="100"
            max="1000000"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <button
            type="button"
            onClick={handleApplyCustomQuantity}
            disabled={!customQuantity || parseInt(customQuantity) < 100}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            全SKUに適用
          </button>
        </div>
      </div>

      {/* SKU Quantity Inputs */}
      {quoteState.skuCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              各SKUの数量を入力
            </h3>
            <div className="text-sm text-gray-600">
              総数量: <span className="font-bold text-gray-900">{getTotalQuantity().toLocaleString()}個</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: quoteState.skuCount }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    SKU {index + 1}
                    <span className="text-sm text-gray-500 ml-2">
                      （デザイン #{index + 1}）
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyQuantityToAll(index)}
                    className={`p-2 rounded-lg transition-all ${
                      copiedIndex === index
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                    }`}
                    title="この数量を全SKUにコピー"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={quoteState.skuQuantities[index] || ''}
                    onChange={(e) => handleSKUQuantityChange(index, e.target.value)}
                    placeholder="数量"
                    min="100"
                    max="1000000"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center text-lg font-semibold"
                  />
                  <span className="text-gray-600 font-medium">個</span>
                </div>

                {/* Individual SKU calculation info */}
                <div className="mt-3 text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                  <div>最小確保量: {meterInfo.minSecuredPerSku}m</div>
                  <div>ロス配分: {Math.round(meterInfo.lossMeters / quoteState.skuCount)}m</div>
                  <div className="font-medium text-purple-700">
                    計: {Math.round(meterInfo.totalMeters / quoteState.skuCount)}m
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total Calculation Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-purple-600" />
              フィルム使用量概算
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">SKU数</div>
                <div className="text-lg font-bold text-gray-900">{quoteState.skuCount}</div>
              </div>
              <div>
                <div className="text-gray-600">最小確保量</div>
                <div className="text-lg font-bold text-blue-600">{meterInfo.totalSecured}m</div>
              </div>
              <div>
                <div className="text-gray-600">ロス（固定）</div>
                <div className="text-lg font-bold text-orange-600">{meterInfo.lossMeters}m</div>
              </div>
              <div>
                <div className="text-gray-600">総計</div>
                <div className="text-lg font-bold text-purple-600">{meterInfo.totalMeters}m</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SKUSelectionStep;

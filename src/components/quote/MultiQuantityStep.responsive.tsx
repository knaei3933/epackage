'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  TrendingUp,
  Smartphone,
  Tablet,
  Monitor,
  X
} from 'lucide-react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';

// Responsive quantity chip component
const QuantityChip = memo(({
  quantity,
  isSelected,
  isBestValue,
  onSelect,
  onRemove,
  isReadonly = false
}: {
  quantity: number;
  isSelected: boolean;
  isBestValue: boolean;
  onSelect: (quantity: number) => void;
  onRemove: (quantity: number) => void;
  isReadonly?: boolean;
}) => {
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(quantity);
  }, [quantity, onRemove]);

  return (
    <motion.button
      className={`
        relative px-3 py-2 rounded-full border-2 text-sm font-medium transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
          : isBestValue
          ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:border-yellow-500 hover:bg-yellow-100'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
        }
        touch-manipulation
      `}
      onClick={() => onSelect(quantity)}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <span className="pr-6">{quantity.toLocaleString()}</span>

      {!isReadonly && (
        <motion.button
          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-red-100 text-red-500 opacity-0 hover:opacity-100 transition-opacity"
          onClick={handleRemove}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Minus className="w-3 h-3" />
        </motion.button>
      )}

      {isBestValue && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        />
      )}
    </motion.button>
  );
});

QuantityChip.displayName = 'QuantityChip';

// Responsive quantity selector
const ResponsiveQuantitySelector = memo(({
  title,
  quantities,
  selectedQuantities,
  onAdd,
  onRemove,
  onQuantitySelect,
  maxItems = 5
}: {
  title: string;
  quantities: number[];
  selectedQuantities: number[];
  onAdd: (quantity: number) => void;
  onRemove: (quantity: number) => void;
  onQuantitySelect: (quantity: number) => void;
  maxItems?: number;
}) => {
  const [customQuantity, setCustomQuantity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddCustom = useCallback(() => {
    const quantity = parseInt(customQuantity);
    if (quantity >= 500 && quantity <= 1000000 && !selectedQuantities.includes(quantity)) {
      onAdd(quantity);
      setCustomQuantity('');
      setShowCustomInput(false);
    }
  }, [customQuantity, selectedQuantities, onAdd]);

  const commonQuantities = useMemo(() => [
    500, 1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000, 100000
  ], []);

  const filteredCommonQuantities = useMemo(() => {
    return commonQuantities.filter(q => !selectedQuantities.includes(q));
  }, [commonQuantities, selectedQuantities]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {selectedQuantities.length}/{maxItems} 個選択中
        </span>
      </div>

      {/* Selected quantities */}
      {selectedQuantities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">選択済み数量</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedQuantities.map(quantity => (
                <QuantityChip
                  key={quantity}
                  quantity={quantity}
                  isSelected={true}
                  isBestValue={false}
                  onSelect={onQuantitySelect}
                  onRemove={onRemove}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Common quantities */}
      {filteredCommonQuantities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">よく使われる数量</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredCommonQuantities.slice(0, 12).map(quantity => (
              <QuantityChip
                key={quantity}
                quantity={quantity}
                isSelected={false}
                isBestValue={false}
                onSelect={() => onAdd(quantity)}
                onRemove={() => {}}
                isReadonly={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom quantity input */}
      <div className="flex items-center gap-2">
        {!showCustomInput ? (
          <button
            onClick={() => {
              setShowCustomInput(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-700 transition-colors touch-manipulation"
            disabled={selectedQuantities.length >= maxItems}
          >
            <Plus className="w-4 h-4" />
            <span>カスタム数量</span>
          </button>
        ) : (
          <motion.div
            className="flex items-center gap-2 flex-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              ref={inputRef}
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder="数量を入力 (500-1000000)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              min={500}
              max={1000000}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customQuantity || parseInt(customQuantity) < 500 || parseInt(customQuantity) > 1000000}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              追加
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomQuantity('');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
});

ResponsiveQuantitySelector.displayName = 'ResponsiveQuantitySelector';

// Device-specific layout component
const DeviceLayout = memo(({ children }: { children: React.ReactNode }) => {
  const breakpoint = useBreakpoint();

  const layoutConfig = useMemo(() => {
    switch (breakpoint) {
      case 'mobile':
        return {
          columns: 1,
          spacing: 'space-y-4',
          padding: 'p-4',
          textSize: 'text-sm'
        };
      case 'tablet':
        return {
          columns: 2,
          spacing: 'space-y-6 gap-6',
          padding: 'p-6',
          textSize: 'text-base'
        };
      case 'desktop':
        return {
          columns: 3,
          spacing: 'grid grid-cols-3 gap-6',
          padding: 'p-8',
          textSize: 'text-base'
        };
      default:
        return {
          columns: 1,
          spacing: 'space-y-4',
          padding: 'p-4',
          textSize: 'text-sm'
        };
    }
  }, [breakpoint]);

  return (
    <div className={`${layoutConfig.padding} ${layoutConfig.spacing} ${layoutConfig.textSize}`}>
      {children}
    </div>
  );
});

DeviceLayout.displayName = 'DeviceLayout';

// Responsive chart container
const ResponsiveChartContainer = memo(({ children, title, height }: {
  children: React.ReactNode;
  title: string;
  height?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const chartHeight = useMemo(() => {
    if (containerWidth < 640) return 250; // Mobile
    if (containerWidth < 1024) return 300; // Tablet
    return height || 350; // Desktop
  }, [containerWidth, height]);

  return (
    <div ref={containerRef} className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-4 sm:p-6">
        <div style={{ width: '100%', height: chartHeight }}>
          {children}
        </div>
      </div>
    </div>
  );
});

ResponsiveChartContainer.displayName = 'ResponsiveChartContainer';

// Main MultiQuantityStep component with responsive design
export default function MultiQuantityStepResponsive() {
  const { state, setQuantities, addQuantity, removeQuantity, setSelectedQuantity, calculateMultiQuantity, isStepComplete } = useMultiQuantityQuote();
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const breakpoint = useBreakpoint();

  const handleQuantityAdd = useCallback((quantity: number) => {
    if (state.quantities.length < 10) {
      addQuantity(quantity);
    }
  }, [state.quantities.length, addQuantity]);

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      await calculateMultiQuantity();
    } finally {
      setIsCalculating(false);
    }
  }, [calculateMultiQuantity]);

  const canCalculate = useMemo(() => {
    return state.quantities.length >= 2 && isStepComplete('specs');
  }, [state.quantities.length, isStepComplete]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          数量比較設定
        </h2>
        <p className="text-gray-600">
          複数の数量を設定して、最適な発注数量を見つけましょう
        </p>
      </motion.div>

      <DeviceLayout>
        {/* Quantity Selector */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
          >
            <ResponsiveQuantitySelector
              title="比較数量の選択"
              quantities={state.quantities}
              selectedQuantities={state.quantities}
              onAdd={handleQuantityAdd}
              onRemove={removeQuantity}
              onQuantitySelect={setSelectedQuantity}
              maxItems={10}
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setQuantities([1000, 5000, 10000])}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors touch-manipulation"
              >
                小規模モデル
              </button>
              <button
                onClick={() => setQuantities([5000, 10000, 20000, 50000])}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors touch-manipulation"
              >
                中規模モデル
              </button>
              <button
                onClick={() => setQuantities([10000, 20000, 50000, 100000, 200000])}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors touch-manipulation"
              >
                大規模モデル
              </button>
              <button
                onClick={() => setQuantities([500, 1000, 2000, 5000, 10000, 20000, 50000])}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors touch-manipulation"
              >
                全体比較
              </button>
            </div>
          </motion.div>
        </div>

        {/* Calculate Button */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              onClick={handleCalculate}
              disabled={!canCalculate || isCalculating}
              className="relative px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all touch-manipulation"
            >
              {isCalculating ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="opacity-0">計算中...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  計算を実行
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Results Preview */}
        {state.comparison && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="col-span-1 sm:col-span-2 lg:col-span-3"
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  計算結果サマリー
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {showAdvanced ? '簡易表示' : '詳細表示'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {state.comparison.bestValue.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">最大節約率</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {state.comparison.bestValue.quantity.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">最適数量</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {state.quantities.length}
                  </div>
                  <div className="text-sm text-gray-600">比較数</div>
                </div>
              </div>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="text-sm text-gray-600">
                    <p>• 比較データ: {state.comparison ? '利用可能' : '利用不可'}</p>
                    <p>• 選択数量: {state.comparisonQuantities.length}件</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Device-specific tips */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 space-y-1">
                {breakpoint === 'mobile' && (
                  <>
                    <p>• スワイプして数量カードを操作できます</p>
                    <p>• 長押しで詳細オプションを表示</p>
                  </>
                )}
                {breakpoint === 'tablet' && (
                  <>
                    <p>• タッチ操作で簡単に数量を選択できます</p>
                    <p>• 2本指でピンチイン/アウトして表示を調整</p>
                  </>
                )}
                {breakpoint === 'desktop' && (
                  <>
                    <p>• ドラッグ＆ドロップで数量の並び替えができます</p>
                    <p>• Shiftキーを押しながら複数選択も可能</p>
                  </>
                )}
                <p>• 最大10個の数量を比較できます</p>
                <p>• 計算結果は自動的にキャッシュされます</p>
              </div>
            </div>
          </motion.div>
        </div>
      </DeviceLayout>
    </div>
  );
}
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
;
import {
  Package,
  Plus,
  Minus,
  Calculator,
  CheckCircle,
  Info,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';

// Smart quantity presets based on common business scenarios
const SMART_PRESETS = [
  {
    quantity: 500,
    label: '小ロット試作',
    description: 'プロトタイプ・サンプル',
    icon: '🧪',
    tier: 'trial'
  },
  {
    quantity: 1000,
    label: '小規模生産',
    description: 'スタートアップ・テスト販売',
    icon: '🚀',
    tier: 'startup'
  },
  {
    quantity: 5000,
    label: '中規模生産',
    description: '安定生産開始',
    icon: '📈',
    tier: 'growth'
  },
  {
    quantity: 10000,
    label: '大規模生産',
    description: 'コスト効率最適化',
    icon: '🏭',
    tier: 'enterprise'
  },
  {
    quantity: 50000,
    label: '大量生産',
    description: '大口割引適用',
    icon: '💎',
    tier: 'volume'
  },
  {
    quantity: 100000,
    label: '超大量生産',
    description: '最適コスト実現',
    icon: '🌟',
    tier: 'optimal'
  }
];

interface EnhancedQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  showComparison?: boolean;
  onQuickSelect?: (quantity: number) => void;
  selectedQuantities?: number[];
}

export function EnhancedQuantityInput({
  value,
  onChange,
  min = 100,
  max = 1000000,
  disabled = false,
  showComparison = false,
  onQuickSelect,
  selectedQuantities = []
}: EnhancedQuantityInputProps) {
  const [showHelp, setShowHelp] = useState(false);

  // Calculate percentage through range
  const percentage = useMemo(() => {
    const range = max - min;
    const position = (value - min) / range;
    return position * 100;
  }, [value, min, max]);

  // Determine tier based on quantity
  const currentTier = useMemo(() => {
    if (value < 1000) return 'trial';
    if (value < 5000) return 'startup';
    if (value < 10000) return 'growth';
    if (value < 50000) return 'enterprise';
    if (value < 100000) return 'volume';
    return 'optimal';
  }, [value]);

  // Get tier-specific styling
  const getTierStyles = (tier: string) => {
    const styles: Record<string, string> = {
      trial: 'from-yellow-400 to-orange-500',
      startup: 'from-blue-400 to-indigo-500',
      growth: 'from-green-400 to-teal-500',
      enterprise: 'from-purple-400 to-pink-500',
      volume: 'from-red-400 to-rose-500',
      optimal: 'from-indigo-500 to-purple-600'
    };
    return styles[tier] || styles.startup;
  };

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  }, [onChange]);

  // Handle increment/decrement
  const handleIncrement = useCallback((amount: number) => {
    const newValue = Math.max(min, Math.min(max, value + amount));
    onChange(newValue);
  }, [value, min, max, onChange]);

  // Handle preset selection
  const handlePresetSelect = useCallback((quantity: number) => {
    onChange(quantity);
    if (onQuickSelect) {
      onQuickSelect(quantity);
    }
  }, [onChange, onQuickSelect]);

  return (
    <div className="space-y-6">
      {/* Header with Range Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-navy-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-navy-600 rounded-lg flex items-center justify-center text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">数量選択</h3>
              <p className="text-gray-600">柔軟な数量設定で最適なコストを見つけましょう</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Range Visualization */}
        <div className="relative mb-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-navy-600 transition-all duration-300"
              style={{ width: `${percentage}%` }}
              initial={false}
              animate={{ width: `${percentage}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
              {min.toLocaleString()}
            </span>
            <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
              {max.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3">
            <span className="text-3xl font-bold text-gray-900">
              {value.toLocaleString()}
            </span>
            <span className="text-lg text-gray-600">個</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getTierStyles(currentTier)}`}>
              {SMART_PRESETS.find(p => p.tier === currentTier)?.label}
            </div>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">数量の柔軟性について</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• 最小数量: {min.toLocaleString()}個から対応可能</li>
                  <li>• 最大数量: {max.toLocaleString()}個まで設定可能</li>
                  <li>• 複数が多いほど単価が安くなります</li>
                  <li>• 複数比較で最適なコストを見つけられます</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Presets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          スマートプリセット
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {SMART_PRESETS.map((preset) => {
            const isSelected = selectedQuantities.includes(preset.quantity);
            const isCurrent = value === preset.quantity;

            return (
              <motion.button
                key={preset.quantity}
                type="button"
                onClick={() => handlePresetSelect(preset.quantity)}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && !isCurrent && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="text-center">
                  <div className="text-2xl mb-1">{preset.icon}</div>
                  <div className="text-xs font-semibold text-gray-900">
                    {preset.quantity.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {preset.label}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Interactive Slider */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          詳細調整
        </h3>

        {/* Slider Control */}
        <div className="space-y-4">
          <input
            type="range"
            min={min}
            max={max}
            step={100}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
            }}
          />

          {/* Increment/Decrement Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              type="button"
              onClick={() => handleIncrement(-100)}
              disabled={disabled || value <= min}
              className="p-2 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minus className="w-4 h-4" />
            </motion.button>

            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                個別調整 (±100)
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => handleIncrement(100)}
              disabled={disabled || value >= max}
              className="p-2 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Quick Jumps */}
          <div className="flex justify-center space-x-2">
            {[1000, 5000, 10000, 50000, 100000].map((jumpValue) => (
              <button
                key={jumpValue}
                type="button"
                onClick={() => handlePresetSelect(jumpValue)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50"
              >
                {(jumpValue / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Options */}
      {showComparison && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              比較分析
            </h3>
            <div className="text-sm text-gray-600">
              複数比較でコスト最適化
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            複数を追加してコスト効率を比較しましょう。異なる数量の単価と総コストを並べて表示できます。
          </p>

          {selectedQuantities.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                選択中: {selectedQuantities.length}件
              </span>
              <span className="font-semibold text-green-600">
                合計: {selectedQuantities.reduce((sum, qty) => sum + qty, 0).toLocaleString()}個
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center">
        <motion.button
          type="button"
          onClick={() => {
            // Trigger calculation if available
            console.log('Calculate with quantity:', value);
          }}
          disabled={disabled}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-navy-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-navy-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calculator className="w-5 h-5 mr-2" />
          この数量で計算
        </motion.button>
      </div>

      {/* Custom styles for slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1E40AF);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1E40AF);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: none;
        }
      `}</style>
    </div>
  );
}

export default EnhancedQuantityInput;
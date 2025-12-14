'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  X,
  Plus,
  BarChart3
} from 'lucide-react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { useQuote } from '@/contexts/QuoteContext';

function MultiQuantityStep() {
  const quoteState = useQuote(); // Get basic specs from QuoteContext
  const {
    state,
    setQuantities,
    addQuantity,
    removeQuantity,
    setComparisonQuantities,
    calculateMultiQuantity,
    saveQuantityPattern,
    loadQuantityPattern,
    canCalculateMultiQuantity,
    isStepComplete,
    updateBasicSpecs: updateMultiBasicSpecs // Add alias for easier access
  } = useMultiQuantityQuote();

    const [inputQuantity, setInputQuantity] = useState('');

  // Sync specs from QuoteContext to MultiQuantityQuoteContext
  useEffect(() => {
    // Sync basic specs from QuoteContext
    updateMultiBasicSpecs({
      bagTypeId: quoteState.state.bagTypeId,
      materialId: quoteState.state.materialId,
      width: quoteState.state.width,
      height: quoteState.state.height,
      depth: quoteState.state.depth,
      thicknessSelection: quoteState.state.thicknessSelection
    });
  }, [
    quoteState.state.bagTypeId,
    quoteState.state.materialId,
    quoteState.state.width,
    quoteState.state.height,
    quoteState.state.depth,
    quoteState.state.thicknessSelection,
    updateMultiBasicSpecs
  ]);

  // Initialize with empty quantities - no defaults
  useEffect(() => {
    // Always ensure comparison quantities are set
    if (state.comparisonQuantities.length === 0) {
      setComparisonQuantities([]);
    }
    if (state.quantities.length === 0) {
      setQuantities([]);
    }
  }, []);

  const handleAddCustomQuantity = () => {
    const quantity = parseInt(inputQuantity);
    if (!isNaN(quantity) && quantity >= 100 && quantity <= 1000000 && !state.quantities.includes(quantity)) {
      addQuantity(quantity);
      setInputQuantity('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setInputQuantity(value);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCustomQuantity();
    }
  };

  const handleRemoveQuantity = (quantity: number) => {
    removeQuantity(quantity);
  };

  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-navy-700 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Package className="w-6 h-6 mr-3" />
              数量比較システム
            </h2>
            <p className="text-blue-100 max-w-2xl">
              複数数量を比較して最適な生産プランを見つけましょう。
            </p>
          </div>
        </div>
      </div>

      {/* Custom Quantity Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Plus className="w-4 h-4 mr-2 text-blue-600" />
          数量を追加
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={inputQuantity}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              placeholder="数量を入力してください (例: 1500)"
              min="100"
              max="1000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <div className="mt-2 text-sm text-gray-500">
              最小100個から最大1,000,000個まで対応可能
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleAddCustomQuantity}
            disabled={!inputQuantity || parseInt(inputQuantity) < 100 || parseInt(inputQuantity) > 1000000}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            追加
          </motion.button>
        </div>
      </div>

      {/* Selected Quantities with Enhanced Display */}
      {state.quantities.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-navy-50 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  数量比較分析
                </h3>
                <p className="text-gray-600 text-sm">
                  {state.quantities.length}件の数量でコスト比較中
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">合計数量</div>
              <div className="text-2xl font-bold text-gray-900">
                {state.quantities.reduce((sum, qty) => sum + qty, 0).toLocaleString()}個
              </div>
            </div>
          </div>

          {/* Quantity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {state.quantities.map((quantity, index) => {
              const isLowest = index === 0;
              const isHighest = index === state.quantities.length - 1;

              return (
                <motion.div
                  key={quantity}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl p-4 border-2 ${
                    isLowest
                      ? 'border-green-500 bg-green-50'
                      : isHighest
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveQuantity(quantity)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isLowest
                        ? 'bg-green-600 text-white'
                        : isHighest
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {isLowest ? '最小' : isHighest ? '最大' : `${index + 1}番目`}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Quantity Display */}
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {quantity.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">個</div>
                  </div>

                  </motion.div>
              );
            })}
          </div>

  
            </div>
      )}
    </div>
  );
}

export default MultiQuantityStep;
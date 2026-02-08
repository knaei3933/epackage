'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion'
;
import {
  Package,
  X,
  Plus,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { useQuoteState, useQuote } from '@/contexts/QuoteContext';
import { safeMap } from '@/lib/array-helpers';
import {
  distributeLengthEvenly,
  validateRollFilmParams,
  calculateRollWeight,
  calculateRollFilmShippingCost,
  type FilmStructureLayer
} from '@/lib/roll-film-utils';

// Get film layers from MATERIAL_THICKNESS_OPTIONS in unified-pricing-engine.ts
// Patterns match the specifications for roll film weight calculation
function getFilmLayersForMaterial(
  materialId: string,
  thicknessSelection?: string
): FilmStructureLayer[] {
  // LLDPE base thickness for each thickness selection
  const lldpeBaseThickness: Record<string, number> = {
    'light': 60,
    'medium': 80,
    'heavy': 100,
    'ultra': 110
  };
  const baseLldpeThickness = lldpeBaseThickness[thicknessSelection || 'medium'] || 80;

  // Default layers for each material type - matching MATERIAL_THICKNESS_OPTIONS
  const defaultLayers: Record<string, FilmStructureLayer[]> = {
    // PET+AL+PET+LLDPE (4 layers) - matching 'opp-alu-foil' pattern
    'pet_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+VMPET+PET+LLDPE (4 layers) - VMPET 12μm
    'pet_vmpet': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+LDPE+LLDPE (3 layers)
    'pet_ldpe': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LDPE', thickness: 7 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+NY+AL+LLDPE (4 layers)
    'pet_ny_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+LLDPE (2 layers) - matching 'pet-transparent' pattern
    'pet_transparent': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // Kraft+PE (2 layers) - matching 'kraft-pe' pattern
    'kraft_pe': [
      { materialId: 'KRAFT', thickness: 80 },
      { materialId: 'PE', thickness: 40 }
    ]
  };

  // Get base layers
  const layers = defaultLayers[materialId] || defaultLayers['pet_al'];

  // Apply thickness multiplier (only affects sealant layers: LLDPE, LDPE, PE)
  const thicknessMultipliers: Record<string, number> = {
    'light': 0.9,
    'medium': 1.0,
    'heavy': 1.1,
    'ultra': 1.2
  };
  const multiplier = thicknessMultipliers[thicknessSelection || 'medium'] || 1.0;

  // Only apply multiplier if not 1.0
  if (multiplier !== 1.0) {
    return layers.map(layer => {
      // Only apply to sealant layers (LLDPE, LDPE, PE)
      if (layer.materialId === 'LLDPE' || layer.materialId === 'LDPE' || layer.materialId === 'PE') {
        if (layer.materialId === 'LLDPE' || layer.materialId === 'LDPE') {
          return { ...layer, thickness: baseLldpeThickness };
        }
      }
      return layer;
    });
  }

  return layers;
}

function MultiQuantityStep() {
  const quoteState = useQuoteState();
  const { dispatch: quoteDispatch } = useQuote();
  const isRollFilm = quoteState.bagTypeId === 'roll_film';

  const {
    state,
    dispatch: multiDispatch,
    setQuantities,
    addQuantity,
    removeQuantity,
    setComparisonQuantities,
    calculateMultiQuantity,
    saveQuantityPattern,
    loadQuantityPattern,
    canCalculateMultiQuantity,
    isStepComplete,
    updateBasicSpecs: updateMultiBasicSpecs
  } = useMultiQuantityQuote();

  const [inputQuantity, setInputQuantity] = useState('');

  // Roll film specific state
  const [totalLength, setTotalLength] = useState('');
  const [rollCount, setRollCount] = useState('1');
  const [editableQuantities, setEditableQuantities] = useState<number[]>([]);
  const [validationError, setValidationError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // Cache key for basic specs
  const basicSpecsCacheKey = useMemo(() => {
    return JSON.stringify({
      bagTypeId: quoteState.bagTypeId,
      materialId: quoteState.materialId,
      width: quoteState.width,
      height: quoteState.height,
      depth: quoteState.depth,
      thicknessSelection: quoteState.thicknessSelection
    });
  }, [
    quoteState.bagTypeId,
    quoteState.materialId,
    quoteState.width,
    quoteState.height,
    quoteState.depth,
    quoteState.thicknessSelection
  ]);

  // Sync specs from QuoteContext
  useEffect(() => {
    updateMultiBasicSpecs({
      bagTypeId: quoteState.bagTypeId,
      materialId: quoteState.materialId,
      width: quoteState.width,
      height: quoteState.height,
      depth: quoteState.depth,
      thicknessSelection: quoteState.thicknessSelection
    });
  }, [basicSpecsCacheKey, updateMultiBasicSpecs]);

  // Initialize quantities
  useEffect(() => {
    if (!isRollFilm) {
      if (state.comparisonQuantities.length === 0) {
        setComparisonQuantities([]);
      }
      if (state.quantities.length === 0) {
        setQuantities([]);
      }
    }
  }, [isRollFilm, state.comparisonQuantities.length, state.quantities.length, setComparisonQuantities, setQuantities]);

  // Regular quantity handlers
  const handleAddCustomQuantity = () => {
    const quantity = parseInt(inputQuantity);
    if (!isNaN(quantity) && quantity >= 100 && quantity <= 1000000 && !state.quantities.includes(quantity)) {
      addQuantity(quantity);
      setInputQuantity('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  // Roll film handlers
  const handleDistribute = () => {
    const length = parseInt(totalLength) || 0;
    const rolls = parseInt(rollCount) || 1;

    // Get film layers
    const layers = getFilmLayersForMaterial(quoteState.materialId, quoteState.thicknessSelection);

    // Validate
    const validation = validateRollFilmParams(length, rolls, quoteState.width, layers);
    if (!validation.isValid) {
      setValidationError(validation.error || '入力を確認してください');
      return;
    }

    // Distribute evenly
    const distributed = distributeLengthEvenly(length, rolls);
    setEditableQuantities(distributed);
    setWarnings(validation.warnings || []);
    setValidationError('');

    // Update QuoteContext state
    quoteDispatch({
      type: 'SET_ROLL_FILM_QUANTITY',
      payload: { totalLength: length, rollCount: rolls }
    });

    // Update MultiQuantityQuoteContext
    setQuantities(distributed);
  };

  const handleUpdateQuantity = (index: number, value: number) => {
    const newQuantities = [...editableQuantities];
    newQuantities[index] = value;

    // Check total sum
    const newTotal = newQuantities.reduce((sum, q) => sum + q, 0);
    const originalTotal = parseInt(totalLength) || 0;
    if (newTotal !== originalTotal) {
      setValidationError(`総延長が${newTotal}mになりました（元: ${originalTotal}m）`);
    }

    // Validate weight
    const layers = getFilmLayersForMaterial(quoteState.materialId, quoteState.thicknessSelection);
    const validation = validateRollFilmParams(value, 1, quoteState.width, layers);

    if (!validation.isValid) {
      setValidationError(`ロール#${index + 1}: ${validation.error}`);
      return;
    }

    // Clear error if validation passes
    if (newTotal === originalTotal) {
      setValidationError('');
    }

    setEditableQuantities(newQuantities);
    quoteDispatch({
      type: 'UPDATE_SINGLE_QUANTITY',
      payload: { index, value }
    });

    // Update MultiQuantityQuoteContext
    setQuantities(newQuantities);
  };

  const getRollWeight = (length: number) => {
    const layers = getFilmLayersForMaterial(quoteState.materialId, quoteState.thicknessSelection);
    return calculateRollWeight(quoteState.width, length, layers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-navy-700 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Package className="w-6 h-6 mr-3" />
              {isRollFilm ? 'ロールフィルム数量' : '数量比較システム'}
            </h2>
            <p className="text-blue-100 max-w-2xl">
              {isRollFilm
                ? 'ロールフィルムの数量とロール数を入力してください'
                : '複数数量を比較して最適な生産プランを見つけましょう。'}
            </p>
          </div>
        </div>
      </div>

      {/* Roll Film UI - 다중 수량 비교 시스템 */}
      {isRollFilm ? (
        <>
          {/* Quick Quantity Pattern Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              よく使われるパターン
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[500, 1000, 1500, 2000, 3000, 5000].map((length) => {
                const isAdded = state.quantities.includes(length);
                return (
                  <button
                    key={length}
                    type="button"
                    onClick={() => {
                      if (isAdded) {
                        // 既に追加された場合削除
                        const newQuantities = state.quantities.filter(q => q !== length);
                        setQuantities(newQuantities);
                        quoteDispatch({
                          type: 'SET_QUANTITIES',
                          payload: newQuantities
                        });
                      } else {
                        // 追加されていない場合追加 (ロールフィルム最小500m)
                        if (length >= 500 && length <= 1000000) {
                          multiDispatch({ type: 'ADD_QUANTITY', payload: length });
                        }
                      }
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      isAdded
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {length}m
                    {isAdded && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Quantity Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-2 text-blue-600" />
              カスタム長さを追加
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(e.target.value)}
                  placeholder="長さを入力してください (例: 2500)"
                  min="500"
                  max="50000"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <div className="mt-2 text-sm text-gray-500">
                  最小500mから最大50,000mまで対応可能
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const length = parseInt(inputQuantity);
                  if (length && length >= 500 && length <= 50000 && !state.quantities.includes(length)) {
                    multiDispatch({ type: 'ADD_QUANTITY', payload: length });
                    setInputQuantity('');
                  }
                }}
                disabled={!inputQuantity || parseInt(inputQuantity) < 500 || parseInt(inputQuantity) > 50000}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                追加
              </button>
            </div>
          </div>

          {/* Weight Limit Warning for Roll Film */}
          {isRollFilm && state.quantities.length > 0 && (() => {
            const hasOverWeight = state.quantities.some(length => {
              const weight = getRollWeight(length);
              return weight.totalWeight > 29000;
            });
            return hasOverWeight ? (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium mb-1">
                      重量制限超過エラー
                    </h4>
                    <p className="text-red-700 text-sm">
                      1ロールあたり29kgを超えている数量があります。
                      該当する数量を削除するか、より短い長さに分割してください。
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                      ⚠️ この状態では次のステップに進めません
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Selected Quantities Display with Roll Distribution */}
          {state.quantities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  選択した長さパターン
                </h3>
                <button
                  onClick={() => {
                    if (confirm('すべてのパターンを削除しますか？')) {
                      setQuantities([]);
                      quoteDispatch({
                        type: 'SET_QUANTITIES',
                        payload: []
                      });
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  すべて削除
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.quantities.map((length) => {
                  const weight = getRollWeight(length);
                  const isOverLimit = weight.totalWeight > 29000;
                  const isSelected = length === state.quantity;

                  return (
                    <div
                      key={length}
                      className={`p-4 rounded-lg border-2 relative transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : isOverLimit
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuantity(length);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Selectable Area */}
                      <div
                        onClick={() => {
                          quoteDispatch({
                            type: 'SET_QUANTITIES',
                            payload: state.quantities
                          });
                          quoteDispatch({
                            type: 'UPDATE_QUANTITY_OPTIONS',
                            payload: { quantity: length }
                          });
                        }}
                        className="cursor-pointer"
                      >
                        <div className="text-center mb-2">
                        <span className="text-lg font-bold text-gray-900">{length}m</span>
                        {isSelected && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            選択中
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>重量: {Math.round(weight.totalWeight / 1000)}kg</div>
                        {isOverLimit && (
                          <div className="text-red-600 font-medium">⚠️ 29kg超過</div>
                        )}
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Regular pouch quantity UI */
        <>
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
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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

          {/* Selected Quantities */}
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
                {safeMap(state.quantities, (quantity, index) => {
                  const isLowest = index === 0;
                  const isHighest = state.quantities && index === state.quantities.length - 1;

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
        </>
      )}
    </div>
  );
}

export default MultiQuantityStep;

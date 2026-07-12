import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertCircle, Check, Info, Eye, Shield, Leaf, Lightbulb } from 'lucide-react';
import { useQuote, useQuoteState, checkStepComplete, createStepSummary, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext';
import { getMaterialsByCategory, getMaterialById } from '@/constants/materialData';
import { getLegendForSpecification, getPlainSpecSummary } from '@/constants/materialTypes';
import { getAvailableGussetSizes, ALL_GUSSET_SIZE_OPTIONS } from '@/lib/gusset-data';
import {
  BAG_TYPE_OPTIONS,
  SPOUT_POSITION_OPTIONS,
  MATERIAL_CATEGORIES,
  getBagTypeLabel,
  validateHeight,
  validateWidth,
  shouldShowGusset
} from '@/types/quote-wizard';

import MultiQuantityStep from '../steps/MultiQuantityStep';

export function SpecsStep() {
  const state = useQuoteState();
  const { updateBasicSpecs, updateField, updateQuantityOptions } = useQuote();

  // Helper functions using the exported utilities
  const isStepComplete = (step: string) => checkStepComplete(state, step);
  const getStepSummary = (step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step);

  // Validation state
  const [heightError, setHeightError] = useState<string>('');
  const [widthError, setWidthError] = useState<string>('');

  // バリデーションヒント（現在選択されている製品のサイズ制限を表示）
  const validationHint = useMemo(() => {
    const hints = {
      width: '',
      height: ''
    };

    switch (state.bagTypeId) {
      case 'flat_3_side':
        hints.width = '※ 50mm以上';
        hints.height = '※ 120mm〜355mm';
        break;
      case 'stand_up':
        hints.width = '※ 80mm以上';
        hints.height = '※ 100mm以上';
        break;
      case 'box':
        hints.width = '※ 100mm以上（幅＋側面≤335mm）';
        hints.height = '※ 100mm以上';
        break;
      case 'lap_seal':
        hints.width = '※ 100mm〜350mm';
        hints.height = '※ 100mm以上';
        break;
      case 'spout_pouch':
        hints.width = '※ 80mm以上';
        hints.height = '※ 100mm以上';
        break;
      case 'roll_film':
        hints.width = '※ 80mm〜740mm';
        hints.height = '';
        break;
      default:
        hints.width = '';
        hints.height = '';
    }

    return hints;
  }, [state.bagTypeId]);


  // Calculate available gusset sizes based on current width
  const availableGussetSizes = useMemo(() => {
    const width = state.width;
    if (!width || width < 70) return [];
    return getAvailableGussetSizes(width);
  }, [state.width]);

  // スタンドパウチが選択されたときに、深さのデフォルト値を自動設定
  useEffect(() => {
    if (shouldShowGusset(state.bagTypeId) && !state.depth) {
      const defaultDepth = availableGussetSizes.length > 0 ? availableGussetSizes[0] : 30;
      updateBasicSpecs({ depth: defaultDepth });
    }
  }, [state.bagTypeId, state.width, availableGussetSizes]);

  // バリデーション: 高さ、幅、深さ、バッグタイプが変更されたときに実行
  useEffect(() => {
    if (state.height) {
      const error = validateHeight(state.height, state.bagTypeId, state.width, state.depth);
      setHeightError(error);
    } else {
      setHeightError('');
    }
  }, [state.height, state.width, state.depth, state.bagTypeId]);

  // バリデーション: 幅が変更されたときに実行
  useEffect(() => {
    if (state.width) {
      const error = validateWidth(state.width, state.bagTypeId, state.depth);
      setWidthError(error);
    } else {
      setWidthError('');
    }
  }, [state.width, state.depth, state.bagTypeId]);

  // Contents dropdown options
  const PRODUCT_CATEGORIES = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'food', label: '食品', labelJa: '食品' },
    { value: 'health_supplement', label: '健康食品', labelJa: '健康食品' },
    { value: 'cosmetic', label: '化粧品', labelJa: '化粧品' },
    { value: 'quasi_drug', label: '医薬部外品', labelJa: '医薬部外品' },
    { value: 'drug', label: '医薬品', labelJa: '医薬品' },
    { value: 'other', label: 'その他', labelJa: 'その他' },
  ] as const;

  const CONTENTS_TYPES = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'solid', label: '固体', labelJa: '固体' },
    { value: 'powder', label: '粉体', labelJa: '粉体' },
    { value: 'liquid', label: '液体', labelJa: '液体' },
  ] as const;

  const MAIN_INGREDIENTS = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'general_neutral', label: '一般/中性', labelJa: '一般/中性' },
    { value: 'oil_surfactant', label: 'オイル/界面活性剤', labelJa: 'オイル/界面活性剤' },
    { value: 'acidic_salty', label: '酸性/塩分', labelJa: '酸性/塩分' },
    { value: 'volatile_fragrance', label: '揮発性/香料', labelJa: '揮発性/香料' },
    { value: 'other', label: 'その他', labelJa: 'その他' },
  ] as const;

  const DISTRIBUTION_ENVIRONMENTS = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'general_roomTemp', label: '一般/常温', labelJa: '一般/常温' },
    { value: 'light_oxygen_sensitive', label: '光/酸素敏感', labelJa: '光/酸素敏感' },
    { value: 'refrigerated', label: '冷凍保管', labelJa: '冷凍保管' },
    { value: 'high_temp_sterilized', label: '高温殺菌', labelJa: '高温殺菌' },
    { value: 'other', label: 'その他', labelJa: 'その他' },
  ] as const;

  // Get current values - no defaults to enforce selection
  const selectedCategory = state.productCategory;
  const selectedType = state.contentsType;
  const selectedIngredient = state.mainIngredient;
  const selectedEnvironment = state.distributionEnvironment;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Package className="w-5 h-5 mr-2 text-navy-600" />
          基本仕様の選択
        </h2>

        {/* Contents Dropdowns - 4 dropdowns in a row */}
        <div className="mb-6" data-section="contents-dropdowns">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            内容物 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Product Category */}
            <div>
              <label className="block text-base text-gray-700 mb-1">製品タイプ</label>
              <select
                data-testid="product-category-select"
                value={selectedCategory}
                onChange={(e) => updateField('productCategory', e.target.value as typeof selectedCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    disabled={(cat as any).disabled}
                  >
                    {cat.labelJa}
                  </option>
                ))}
              </select>
            </div>

            {/* Contents Type */}
            <div>
              <label className="block text-base text-gray-700 mb-1">内容物の形態</label>
              <select
                value={selectedType}
                onChange={(e) => updateField('contentsType', e.target.value as typeof selectedType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {CONTENTS_TYPES.map(type => (
                  <option
                    key={type.value}
                    value={type.value}
                    disabled={(type as any).disabled}
                  >
                    {type.labelJa}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Ingredient */}
            <div>
              <label className="block text-base text-gray-700 mb-1">主成分</label>
              <select
                value={selectedIngredient}
                onChange={(e) => updateField('mainIngredient', e.target.value as typeof selectedIngredient)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {MAIN_INGREDIENTS.map(ing => (
                  <option
                    key={ing.value}
                    value={ing.value}
                    disabled={(ing as any).disabled}
                  >
                    {ing.labelJa}
                  </option>
                ))}
              </select>
            </div>

            {/* Distribution Environment */}
            <div>
              <label className="block text-base text-gray-700 mb-1">流通環境</label>
              <select
                value={selectedEnvironment}
                onChange={(e) => updateField('distributionEnvironment', e.target.value as typeof selectedEnvironment)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {DISTRIBUTION_ENVIRONMENTS.map(env => (
                  <option
                    key={env.value}
                    value={env.value}
                    disabled={(env as any).disabled}
                  >
                    {env.labelJa}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Selection Summary */}
          <div className="mt-2 text-xs text-gray-600">
            選択: {PRODUCT_CATEGORIES.find(c => c.value === selectedCategory)?.labelJa} /
            {CONTENTS_TYPES.find(t => t.value === selectedType)?.labelJa} /
            {MAIN_INGREDIENTS.find(i => i.value === selectedIngredient)?.labelJa} /
            {DISTRIBUTION_ENVIRONMENTS.find(e => e.value === selectedEnvironment)?.labelJa}
          </div>
        </div>

        {/* Form Content - Unified responsive design */}
        <div className="space-y-6">
          {/* Bag Type Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">袋のタイプ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BAG_TYPE_OPTIONS.map(type => (
                <button
                  key={type.id}
                  onClick={() => {                    updateBasicSpecs({                      bagTypeId: type.id,                      ...(type.id === 'lap_seal' ? { depth: 0 } : {})                    })                  }}
                  className={`p-2 border-2 rounded-lg text-left transition-all relative overflow-hidden ${state.bagTypeId === type.id
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                    }`}
                >
                  {state.bagTypeId === type.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-gray-200 shadow-lg">
                      <img
                        src={type.image}
                        alt={type.nameJa}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <svg class="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                              </svg>
                            `;
                            parent.classList.add('bg-white');
                          }
                        }}
                      />
                    </div>
                    <div className="font-bold text-gray-900 text-base text-center">{type.nameJa}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Spout Position Selector - Only show for spout_pouch */}
          {state.bagTypeId === 'spout_pouch' && (
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">スパウト位置</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPOUT_POSITION_OPTIONS.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => updateField('spoutPosition', position.id)}
                    className={`p-2 border-2 rounded-lg transition-all relative ${state.spoutPosition === position.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                      }`}
                  >
                    {state.spoutPosition === position.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {/* Visual box indicator showing position */}
                      <div className="relative w-16 h-16 border-2 border-gray-300 rounded">
                        {/* Position indicator dot */}
                        <div
                          className={`absolute w-3 h-3 bg-navy-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${position.id.includes('top') ? 'top-2' :
                            position.id.includes('bottom') ? 'bottom-2' :
                              'top-1/2'
                            } ${position.id.includes('left') ? 'left-2' :
                              position.id.includes('right') ? 'right-2' :
                                'left-1/2'
                            }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{position.labelJa}</span>
                    </div>
                  </button>
                ))}
              </div>
              {state.spoutPosition && (
                <div className="mt-3 p-3 bg-info-50 border border-info-200 rounded-lg">
                  <p className="text-sm text-info-800">
                    選択されたスパウト位置: <span className="font-medium">{SPOUT_POSITION_OPTIONS.find(p => p.id === state.spoutPosition)?.labelJa}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Size Input */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">サイズ (mm)</label>
            <div className={`grid grid-cols-1 gap-4 ${
              state.bagTypeId === 'roll_film' ? 'sm:grid-cols-2' :
              state.bagTypeId === 'lap_seal' || state.bagTypeId === 'box' ? 'sm:grid-cols-4' :
              'sm:grid-cols-3'
            }`}>
              <div>
                <label className="block text-base text-gray-700 mb-1">幅</label>
                <input
                  type="number"
                  min="50"
                  data-testid="width-input"
                  value={state.width ?? ''}
                  onChange={(e) => updateBasicSpecs({ width: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                    widthError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-navy-500'
                  }`}
                  placeholder={state.bagTypeId === 'roll_film' ? "300" : "200"}
                />
                {widthError ? (
                  <p className="mt-1 text-xs text-red-600">
                    {widthError}
                  </p>
                ) : validationHint.width ? (
                  <p className="mt-1 text-xs text-gray-400">
                    {validationHint.width}
                  </p>
                ) : null}
              </div>
              {/* Height input - HIDE for roll_film, SHOW pitch instead */}
              {state.bagTypeId === 'roll_film' ? (
                <div>
                  <label className="block text-base text-gray-700 mb-1">ピッチ (デザイン周期)</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    data-testid="pitch-input"
                    value={state.pitch || ''}
                    onChange={(e) => updateBasicSpecs({ pitch: parseInt(e.target.value) || undefined })}
                    className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                      !state.pitch || (state.pitch < 50 || state.pitch > 1000)
                        ? 'border-gray-300 focus:ring-navy-500'
                        : 'border-green-500 focus:ring-green-500'
                    }`}
                    placeholder="例: 200"
                  />
                  {state.pitch && state.pitch >= 50 && state.pitch <= 1000 ? (
                    <p className="mt-1 text-xs text-green-600">✓ ピッチ入力完了</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">※ 50mm以上1000mm以下で入力してください</p>
                  )}
                </div>
              ) : (
                state.bagTypeId !== 'roll_film' && (
                  <div>
                    <label className="block text-base text-gray-700 mb-1">高さ</label>
                    <input
                      type="number"
                      min="50"
                      data-testid="height-input"
                      value={state.height ?? ''}
                      onChange={(e) => {
                        const newHeight = e.target.value === '' ? undefined : parseInt(e.target.value);
                        updateBasicSpecs({ height: newHeight });
                        // バリデーション実行
                        if (newHeight !== undefined) {
                          const error = validateHeight(newHeight, state.bagTypeId, state.width, state.depth);
                          setHeightError(error);
                        } else {
                          setHeightError('');
                        }
                      }}
                      onBlur={() => {
                        // フォーカス喪失時にバリデーション再実行
                        if (state.height) {
                          const error = validateHeight(state.height, state.bagTypeId, state.width, state.depth);
                          setHeightError(error);
                        }
                      }}
                      className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        heightError
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-navy-500'
                      }`}
                      placeholder="300"
                    />
                    {heightError ? (
                      <p className="mt-1 text-xs text-red-600">
                        {heightError}
                      </p>
                    ) : validationHint.height ? (
                      <p className="mt-1 text-xs text-gray-400">
                        {validationHint.height}
                      </p>
                    ) : null}
                  </div>
                )
              )}
                {/* Spout Gusset (底) input - Only for spout_pouch with hasGusset, placed right after height */}
                {state.bagTypeId === 'spout_pouch' && state.hasGusset && (
                  <div>
                    <label className="block text-base text-gray-700 mb-1">マチ (底)</label>
                    <select
                      data-testid="gusset-depth-input"
                      value={state.depth ?? (availableGussetSizes.length > 0 ? availableGussetSizes[0] : ALL_GUSSET_SIZE_OPTIONS[0])}
                      onChange={(e) => updateBasicSpecs({ depth: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      {(state.width && availableGussetSizes.length > 0 ? availableGussetSizes : ALL_GUSSET_SIZE_OPTIONS).map((size) => (
                        <option key={size} value={size}>
                          {size}mm
                        </option>
                      ))}
                    </select>
                    {state.width && availableGussetSizes.length > 0 && (
                      <p className="mt-1 text-xs text-gray-400">
                        幅{state.width}mmで選択可能なマチサイズ
                      </p>
                    )}
                    {!state.width && (
                      <p className="mt-1 text-xs text-gray-400">
                        まず幅を入力してください
                      </p>
                    )}
                  </div>
                )}

              {/* Spout Size & Gusset Selection - Only for spout_pouch */}
              {state.bagTypeId === 'spout_pouch' && (
                <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Spout Size */}
                  <div>
                    <label className="block text-base text-gray-700 mb-1">スパウトサイズ <span className="text-red-500">*</span></label>
                    <select
                      value={state.spoutSize || ''}
                      onChange={(e) => {
                        const spoutSize = e.target.value;
                        updateField('spoutSize', spoutSize);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="">選択してください</option>
                      <option value="9">9パイ（φ9mm）- 小型</option>
                      <option value="15">15パイ（φ15mm）- 標準小型</option>
                      <option value="18">18パイ（φ18mm）- 標準</option>
                      <option value="22">22パイ（φ22mm）- 大型</option>
                      <option value="28">28パイ（φ28mm）- 特大</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      液体製品に最適な注ぎ口サイズを選択してください
                    </p>
                  </div>

                  {/* Gusset Selection */}
                  <div>
                    <label className="block text-base text-gray-700 mb-1">マチ有無</label>
                    <select
                      value={state.hasGusset ? 'has-gusset' : 'no-gusset'}
                      onChange={(e) => {
                        const hasGussetValue = e.target.value === 'has-gusset';
                        updateField('hasGusset', hasGussetValue);
                        updateBasicSpecs({
                          hasGusset: hasGussetValue,
                          depth: hasGussetValue ? (state.depth ?? availableGussetSizes[0]) : 0
                        });
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      <option value="no-gusset">マチなし（平袋準用）</option>
                      <option value="has-gusset">マチあり（スタンドパウチ準用）</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      {state.hasGusset
                        ? 'マチあり: 自立するスタンドパウチ向けの計算を適用します'
                        : 'マチなし: 平らな袋向けの計算を適用します'}
                    </p>
                  </div>
                </div>
              )}

              {shouldShowGusset(state.bagTypeId) && state.bagTypeId !== 'roll_film' && (
                <div>
                  <label className="block text-base text-gray-700 mb-1">
                    マチ（底の広がり）
                    <span className="ml-1 text-xs text-gray-400 font-normal">袋の底を広げて自立させる部分</span>
                  </label>
                  <select
                    data-testid="depth-input"
                    value={state.depth ?? (availableGussetSizes.length > 0 ? availableGussetSizes[0] : ALL_GUSSET_SIZE_OPTIONS[0])}
                    onChange={(e) => updateBasicSpecs({ depth: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                  >
                    {(state.width && availableGussetSizes.length > 0 ? availableGussetSizes : ALL_GUSSET_SIZE_OPTIONS).map((size) => (
                      <option key={size} value={size}>
                        {size}mm
                      </option>
                    ))}
                  </select>
                  {state.width && availableGussetSizes.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      幅{state.width}mmで選択可能なマチサイズ
                    </p>
                  )}
                  {!state.width && (
                    <p className="mt-1 text-xs text-gray-400">
                      まず幅を入力してください
                    </p>
                  )}
                  {/* マチ概念の図解（C3: 専門用語の平易化） */}
                  <details className="mt-1.5 text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 inline-flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      マチとは？（図で確認）
                    </summary>
                    <div className="mt-2 flex items-start gap-3 p-2 bg-gray-50 rounded">
                      {/* マチ付き袋の簡易図解: 底が広がっている様子 */}
                      <svg width="70" height="64" viewBox="0 0 70 64" className="flex-shrink-0" aria-hidden="true">
                        {/* 袋の胴体（上窄まり） */}
                        <path d="M 20 8 L 50 8 L 56 40 L 14 40 Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.5" />
                        {/* マチ（底の広がり）: 三角形で底の張りを表現 */}
                        <path d="M 14 40 L 56 40 L 50 56 L 20 56 Z" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
                        {/* マチ部の指示線 */}
                        <line x1="56" y1="48" x2="64" y2="48" stroke="#d97706" strokeWidth="1" />
                        <text x="65" y="46" fontSize="7" fill="#d97706">マチ</text>
                      </svg>
                      <p className="leading-relaxed">
                        <span className="font-semibold text-gray-700">マチ</span>とは、袋の底を内側に折り込んで広げた部分です。
                        これがあると袋が<span className="font-semibold">自立</span>し、底面積が広がって<span className="font-semibold">多く入る</span>ようになります（スタンドパウチ等）。
                        数値が大きいほど底が広く・しっかり立ちます。
                      </p>
                    </div>
                  </details>
                </div>
              )}
              {/* 側面 (よこめん) - ガゼットパウチのみ */}
              {state.bagTypeId === 'box' && (
                <div>
                  <label className="block text-base text-gray-700 mb-1">側面</label>
                  <input
                    type="number"
                    min="0"
                    value={state.sideWidth ?? ''}
                    onChange={(e) => updateBasicSpecs({ sideWidth: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="例: 50"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    '※ 側面を入力してください（オプション）'
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Material Selection by Category */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">素材</label>

            {/* Help Guide */}
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-900 font-medium">まず、包装の目的で選択してください</span>
              </div>
            </div>

            {/* Categories */}
            {MATERIAL_CATEGORIES.map(category => {
              const categoryMaterials = getMaterialsByCategory(category.id);
              if (categoryMaterials.length === 0) return null;

              return (
                <div key={category.id} className={`mb-4 rounded-lg border-2 overflow-hidden ${category.colorClass}`}>
                  {/* Category Header */}
                  <div className={`${category.headerBg} px-4 py-2 flex items-center space-x-2 text-white`}>
                    {category.id === 'transparent' && <Eye className="w-5 h-5" />}
                    {category.id === 'high_barrier' && <Shield className="w-5 h-5" />}
                    {category.id === 'kraft' && <Leaf className="w-5 h-5" />}
                    <span className="font-bold">{category.nameJa}</span>
                  </div>

                  {/* Materials in this category */}
                  <div className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryMaterials.map(material => (
                        <button
                          key={material.id}
                          data-testid="material-card"
                          onClick={() => updateBasicSpecs({ materialId: material.id })}
                          className={`p-2 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                            state.materialId === material.id
                              ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {state.materialId === material.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="flex items-start pr-8">
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <div className="font-medium text-gray-900 text-sm">{material.nameJa}</div>
                                {material.popular && (
                                  <span className="px-1 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                                    人気
                                  </span>
                                )}
                                {material.ecoFriendly && (
                                  <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                    環境
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">{material.descriptionJa}</div>
                              {material.recommendedFor && (
                                <div className="text-xs text-indigo-600 mt-1 flex items-center">
                                  <Lightbulb className="w-3 h-3 mr-0.5" />
                                  {material.recommendedFor}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Thickness Selection */}
        {(() => {
          const selectedMaterial = getMaterialById(state.materialId);
          if (!selectedMaterial?.thicknessOptions) return null;

          const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al', 'ny_lldpe', 'kraft_vmpet_lldpe', 'kraft_pet_lldpe'];
          const isRequired = materialsWithThickness.includes(state.materialId);
          const isSelected = !!state.thicknessSelection;

          return (
            <div className={`mb-6 p-4 rounded-lg border-2 ${!isSelected && isRequired ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  厚さのタイプ
                  {isRequired && (
                    <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                      必須
                    </span>
                  )}
                </label>
                {!isSelected && isRequired && (
                  <span className="text-xs text-amber-700 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    厚さを選択してください
                  </span>
                )}
              </div>
              <div>
                <select
                  value={state.thicknessSelection || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateBasicSpecs({ thicknessSelection: value });
                  }}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                >
                  <option value="">選択してください</option>
                  {selectedMaterial.thicknessOptions.map(thickness => (
                    <option key={thickness.id} value={thickness.id}>
                      {thickness.nameJa} - {thickness.specificationEn || thickness.specification}
                    </option>
                  ))}
                </select>
                {state.thicknessSelection && selectedMaterial.thicknessOptions.find(t => t.id === state.thicknessSelection) && (
                  (() => {
                    const selectedThickness = selectedMaterial.thicknessOptions.find(t => t.id === state.thicknessSelection);
                    const specText = selectedThickness?.specificationEn || selectedThickness?.specification || '';
                    const plainSummary = getPlainSpecSummary(state.materialId);
                    const legend = getLegendForSpecification(specText);
                    return (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-500">規格:</span>{' '}
                          <span className="font-medium text-gray-800">{specText}</span>
                        </p>
                        {plainSummary && (
                          <p className="text-xs text-indigo-700 flex items-start">
                            <Lightbulb className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{plainSummary}</span>
                          </p>
                        )}
                        {legend.length > 0 && (
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer hover:text-gray-700 inline-flex items-center">
                              <Info className="w-3 h-3 mr-1" />
                              略号の意味を見る
                            </summary>
                            <dl className="mt-1.5 ml-4 space-y-0.5">
                              {legend.map((item) => (
                                <div key={item.label} className="flex">
                                  <dt className="font-semibold text-gray-700 w-16 flex-shrink-0">{item.label}</dt>
                                  <dd><span className="text-gray-700">{item.name}</span> — {item.description}</dd>
                                </div>
                              ))}
                            </dl>
                          </details>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                推奨: 中間タイプで最適なバランスです
              </p>
            </div>
          );
        })()}

        {/* Printing Color Selection */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-700 mb-3 flex items-center">
            印刷色数
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
              必須
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                data-testid={`color-btn-${num}`}
                onClick={() => updateQuantityOptions({ printingColors: num })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  state.printingColors === num
                    ? 'border-navy-500 bg-navy-50 text-navy-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {num}色
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            印刷する色数を選択してください。グラビア印刷の場合、色数に応じて銅版費用が加算されます。
          </p>
        </div>

      </div>
    </div>
  );
}

// Use the new MultiQuantityStep component
// The old QuantityStep function has been replaced by MultiQuantityStep.tsx

// Sealing width options (シール幅オプション)
// Note: Sealing width does NOT affect pricing - priceMultiplier is always 1.0

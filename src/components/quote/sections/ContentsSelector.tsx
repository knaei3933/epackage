/**
 * ContentsSelector Component
 *
 * Extracted from SpecsStep in ImprovedQuotingWizard
 * Handles product category, contents type, main ingredient, and distribution environment selection
 * コンテンツ選択コンポーネント - 製品カテゴリー、内容物の形態、主成分、流通環境を選択
 */

'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { useQuoteState, useQuote } from '@/contexts/QuoteContext';
import {
  PRODUCT_CATEGORIES,
  CONTENTS_TYPES,
  MAIN_INGREDIENTS,
  DISTRIBUTION_ENVIRONMENTS,
  type ProductCategory,
  type ContentsType,
  type MainIngredient,
  type DistributionEnvironment
} from '@/constants/contentsData';

export interface ContentsSelectorProps {
  showLabel?: boolean;
  required?: boolean;
}

/**
 * Component for selecting contents specifications
 */
export function ContentsSelector({
  showLabel = true,
  required = true
}: ContentsSelectorProps) {
  const state = useQuoteState();
  const { updateField } = useQuote();

  const handleCategoryChange = (value: ProductCategory) => {
    updateField('productCategory', value);
  };

  const handleTypeChange = (value: ContentsType) => {
    updateField('contentsType', value);
  };

  const handleIngredientChange = (value: MainIngredient) => {
    updateField('mainIngredient', value);
  };

  const handleEnvironmentChange = (value: DistributionEnvironment) => {
    updateField('distributionEnvironment', value);
  };

  return (
    <div className="mb-6" data-section="contents-dropdowns">
      {showLabel && (
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          内容物 {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Product Category */}
        <div>
          <label className="block text-base text-gray-700 mb-1">製品タイプ</label>
          <select
            value={state.productCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
          >
            {PRODUCT_CATEGORIES.map(cat => (
              <option
                key={cat.value}
                value={cat.value}
                disabled={cat.disabled}
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
            value={state.contentsType || ''}
            onChange={(e) => handleTypeChange(e.target.value as ContentsType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
          >
            {CONTENTS_TYPES.map(type => (
              <option
                key={type.value}
                value={type.value}
                disabled={type.disabled}
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
            value={state.mainIngredient || ''}
            onChange={(e) => handleIngredientChange(e.target.value as MainIngredient)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
          >
            {MAIN_INGREDIENTS.map(ingredient => (
              <option
                key={ingredient.value}
                value={ingredient.value}
                disabled={ingredient.disabled}
              >
                {ingredient.labelJa}
              </option>
            ))}
          </select>
        </div>

        {/* Distribution Environment */}
        <div>
          <label className="block text-base text-gray-700 mb-1">流通環境</label>
          <select
            value={state.distributionEnvironment || ''}
            onChange={(e) => handleEnvironmentChange(e.target.value as DistributionEnvironment)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
          >
            {DISTRIBUTION_ENVIRONMENTS.map(env => (
              <option
                key={env.value}
                value={env.value}
                disabled={env.disabled}
              >
                {env.labelJa}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display current selection */}
      {(state.productCategory || state.contentsType || state.mainIngredient || state.distributionEnvironment) && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>選択中:</strong> {[
              PRODUCT_CATEGORIES.find(c => c.value === state.productCategory)?.labelJa,
              CONTENTS_TYPES.find(c => c.value === state.contentsType)?.labelJa,
              MAIN_INGREDIENTS.find(c => c.value === state.mainIngredient)?.labelJa,
              DISTRIBUTION_ENVIRONMENTS.find(c => c.value === state.distributionEnvironment)?.labelJa
            ].filter(Boolean).join(' / ')}
          </p>
        </div>
      )}
    </div>
  );
}

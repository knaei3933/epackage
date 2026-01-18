/**
 * SizeSpecification Component
 *
 * Extracted from SpecsStep - handles width, height, and depth inputs
 */

import React from 'react';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';

interface SizeSpecificationProps {
  showDepth?: boolean;
}

/**
 * Component for specifying bag dimensions
 */
export function SizeSpecification({ showDepth }: SizeSpecificationProps) {
  const state = useQuoteState();
  const { updateBasicSpecs } = useQuote();

  // Determine if gusset (マチ) should be shown based on bag type
  const shouldShowGusset = () => {
    return state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
  };

  const displayDepth = showDepth !== undefined ? showDepth : shouldShowGusset();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">サイズ (mm)</label>
      <div className={`grid grid-cols-1 gap-4 ${displayDepth ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <div>
          <label className="block text-xs text-gray-500 mb-1">幅</label>
          <input
            type="number"
            min="50"
            value={state.width || ''}
            onChange={(e) => updateBasicSpecs({ width: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            placeholder="200"
            aria-label="袋の幅 (mm)"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">高さ</label>
          <input
            type="number"
            min="50"
            value={state.height || ''}
            onChange={(e) => updateBasicSpecs({ height: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            placeholder="300"
            aria-label="袋の高さ (mm)"
          />
        </div>
        {displayDepth && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">マチ</label>
            <input
              type="number"
              min="0"
              value={state.depth || ''}
              onChange={(e) => updateBasicSpecs({ depth: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="0"
              aria-label="袋のマチ深さ (mm)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BasicInfoSection Component
 *
 * Extracted from SpecsStep - handles bag type selection
 * REFACTORED: Now uses centralized BAG_TYPE_OPTIONS from @/types/quote-wizard
 */

'use client';

import React from 'react';
import { Package, Check } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';
import { BAG_TYPE_OPTIONS } from '@/types/quote-wizard';
import type { BagTypeOption } from '@/types/quote-wizard';

export interface BasicInfoSectionProps {
  title?: string;
  showLabel?: boolean;
}

/**
 * Component for selecting bag type (basic information section)
 */
export function BasicInfoSection({
  title = '袋のタイプ',
  showLabel = true
}: BasicInfoSectionProps) {
  const state = useQuoteState();
  const { updateBasicSpecs } = useQuote();

  const handleSelectBagType = (bagTypeId: string) => {
    updateBasicSpecs({ bagTypeId });
  };

  return (
    <div className="mb-6">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {title}
        </label>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BAG_TYPE_OPTIONS.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelectBagType(type.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
              state.bagTypeId === type.id
                ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
            }`}
            aria-pressed={state.bagTypeId === type.id}
          >
            {state.bagTypeId === type.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                <img
                  src={type.image}
                  alt={type.nameJa}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = DOMPurify.sanitize(`
                        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                      `);
                      parent.classList.add('bg-gray-50');
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{type.nameJa}</div>
                <div className="text-sm text-gray-600 mt-1">{type.descriptionJa}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

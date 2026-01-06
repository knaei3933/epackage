/**
 * BasicInfoSection Component
 *
 * Extracted from SpecsStep - handles bag type selection
 */

import React from 'react';
import { Package, Check } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';

export interface BagTypeOption {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  basePrice: number;
  image: string;
}

const BAG_TYPES: BagTypeOption[] = [
  {
    id: 'flat_3_side',
    name: '三方シール平袋',
    nameJa: '三方シール平袋',
    description: '基本的な平たい袋タイプ',
    descriptionJa: '最も一般的な平袋タイプ。三方をシールし、一方は開口部',
    basePrice: 15,
    image: '/images/processing-icons/삼방.png'
  },
  {
    id: 'stand_up',
    name: 'スタンドパウチ',
    nameJa: 'スタンドパウチ',
    description: '底が広がり自立するタイプ',
    descriptionJa: '底部がガセット構造で自立可能。陳列効果に優れる',
    basePrice: 25,
    image: '/images/processing-icons/삼방스탠드.png'
  },
  {
    id: 'box',
    name: 'BOX型パウチ',
    nameJa: 'BOX型パウチ',
    description: '箱型形状で保護性に優れる',
    descriptionJa: '立体的な箱型形状で内容物を保護。高級感のあるデザイン',
    basePrice: 30,
    image: '/images/processing-icons/지퍼삼방.png'
  },
  {
    id: 'spout_pouch',
    name: 'スパウトパウチ',
    nameJa: 'スパウトパウチ',
    description: '液体製品に最適な注ぎ口付き',
    descriptionJa: '液体・粉末製品向けの注ぎ口付き。注ぎやすく再密閉可能',
    basePrice: 35,
    image: '/images/processing-icons/T방.png'
  },
  {
    id: 'roll_film',
    name: 'ロールフィルム',
    nameJa: 'ロールフィルム',
    description: '自動包装機対応のフィルム',
    descriptionJa: '自動包装機向けロール状フィルム。大量生産に最適',
    basePrice: 8,
    image: '/images/processing-icons/M방 MT방.png'
  }
];

interface BasicInfoSectionProps {
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
        {BAG_TYPES.map((type) => (
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
                <div className="text-xs text-navy-600 font-medium bg-navy-50 inline-block px-2 py-1 rounded mt-2">
                  基本価格: ¥{type.basePrice.toLocaleString()}/個
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

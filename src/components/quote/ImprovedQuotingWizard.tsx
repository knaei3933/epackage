'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuote, useQuoteState, useQuoteContext, checkStepComplete, createStepSummary, getPostProcessingLimitStatusForState, canAddPostProcessingOptionForState } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { unifiedPricingEngine, UnifiedQuoteResult, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import type { FilmStructureLayer } from '@/lib/film-cost-calculator';
import { safeMap } from '@/lib/array-helpers';
import { supabase } from '@/lib/supabase';
import EnvelopePreview from './EnvelopePreview';
import MultiQuantityStep from './MultiQuantityStep';
import MultiQuantityComparisonTable from './MultiQuantityComparisonTable';
import { PostProcessingGroups } from './PostProcessingGroups';
import {
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_LABELS_JA,
  MATERIAL_DESCRIPTIONS,
  getMaterialLabel,
  getMaterialDescription,
  getThicknessLabel,
  getWeightRange
} from '@/constants/materialTypes';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Package,
  Layers,
  Printer,
  Calendar,
  Settings,
  Info,
  Edit2,
  X,
  Phone,
  Mail,
  Clock,
  Calculator,
  RefreshCw,
  BarChart3,
  Download,
  Save,
  Send
} from 'lucide-react';
import { ErrorToast, useToast } from './ErrorToast';
import { KeyboardShortcutsHint } from './KeyboardShortcutsHint';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { ResponsiveStepIndicators } from './ResponsiveStepIndicators';
import { UnifiedSKUQuantityStep } from './index';
import { ParallelProductionOptions, EconomicQuantityProposal } from './index';
import { OrderSummarySection, QuantityOptionsGrid } from './index';
import { pouchCostCalculator } from '@/lib/pouch-cost-calculator';
import type { ParallelProductionOption, EconomicQuantitySuggestionData, QuantityOption } from './index';

/**
 * Fetch customer-specific markup rate from Supabase
 * @param userId User ID to fetch markup rate for
 * @returns Markup rate (default 0.5 = 50% if not set or error)
 */
async function getCustomerMarkupRate(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('markup_rate')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[getCustomerMarkupRate] Error fetching markup rate:', error);
      return 0.5; // Default 50%
    }

    // Return markup_rate if set, otherwise default to 0.5
    return data?.markup_rate ?? 0.5;
  } catch (error) {
    console.warn('[getCustomerMarkupRate] Exception:', error);
    return 0.5; // Default 50%
  }
}

// Step configuration
const STEPS = [
  { id: 'specs', title: '基本仕様', icon: Package, description: 'サイズ・素材・厚さ' },
  { id: 'post-processing', title: '後加工', icon: Settings, description: '追加仕様' },
  { id: 'sku-quantity', title: 'SKU・数量', icon: Layers, description: 'SKU数と数量設定' },
  { id: 'result', title: '見積結果', icon: Calendar, description: '価格詳細' }
];

// Component for each step
function SpecsStep() {
  const state = useQuoteState();
  const { updateBasicSpecs, updateField } = useQuote();

  // Helper functions using the exported utilities
  const isStepComplete = (step: string) => checkStepComplete(state, step);
  const getStepSummary = (step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step);

  // Determine if gusset (マチ) should be shown based on bag type
  const shouldShowGusset = () => {
    // Don't show gusset for flat_3_side and roll_film
    return state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
  };

  // Enhanced bag type options with images
  const bagTypes = [
    {
      id: 'flat_3_side',
      name: '平袋',
      nameJa: '平袋',
      description: '基本的な平たい袋タイプ',
      descriptionJa: '最も一般的な平袋タイプ。三方をシールし、一方は開口部',
      basePrice: 15,
      image: '/images/processing-icons/三方.png'
    },
    {
      id: 'stand_up',
      name: 'スタンドパウチ',
      nameJa: 'スタンドパウチ',
      description: '底が広がり自立するタイプ',
      descriptionJa: '底部がガセット構造で自立可能。陳列効果に優れる',
      basePrice: 25,
      image: '/images/processing-icons/三方スタンド.png'
    },
    {
      id: 'lap_seal',
      name: '合掌袋',
      nameJa: '合掌袋',
      description: '両サイドを合掌シールした袋',
      descriptionJa: '両サイドを合掌状にシールし、底部は平らな構造',
      basePrice: 17,
      image: '/images/processing-icons/合掌.png'
    },
    {
      id: 'box',
      name: 'ボックス型パウチ',
      nameJa: 'ボックス型パウチ',
      description: '箱型形状で保護性に優れる',
      descriptionJa: '立体的な箱型形状で内容物を保護。高級感のあるデザイン',
      basePrice: 30,
      image: '/images/processing-icons/ボックス型パウチ.png'
    },
    {
      id: 'spout_pouch',
      name: 'スパウトパウチ',
      nameJa: 'スパウトパウチ',
      description: '液体製品に最適な注ぎ口付き',
      descriptionJa: '液体・粉末製品向けの注ぎ口付き。注ぎやすく再密閉可能',
      basePrice: 35,
      image: '/images/processing-icons/スパウト.png'
    },
    {
      id: 'roll_film',
      name: 'ロールフィルム',
      nameJa: 'ロールフィルム',
      description: '自動包装機対応のフィルム',
      descriptionJa: '自動包装機向けロール状フィルム。大量生産に最適',
      basePrice: 8,
      image: '/images/processing-icons/ロールフィルム.png'
    }
  ];

  // Spout position options for spout_pouch
  const spoutPositions = [
    { id: 'top-left', label: '左上', labelJa: '左上' },
    { id: 'top-center', label: '上中央', labelJa: '上中央' },
    { id: 'top-right', label: '右上', labelJa: '右上' }
  ];

  // Enhanced material options with rich details
  const materials = [
    {
      id: 'pet_al',
      name: MATERIAL_TYPE_LABELS.pet_al,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_al,
      description: MATERIAL_DESCRIPTIONS.pet_al.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_al.ja,
      multiplier: 1.5,
      features: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
      featuresJa: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
      popular: true,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 50μ',
          weightRange: '~100g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~300g)',
          nameJa: '標準タイプ (~300g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ',
          weightRange: '~300g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'standard',
          name: 'レギュラータイプ (~500g)',
          nameJa: 'レギュラータイプ (~500g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'pet_vmpet',
      name: MATERIAL_TYPE_LABELS.pet_vmpet,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_vmpet,
      description: MATERIAL_DESCRIPTIONS.pet_vmpet.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_vmpet.ja,
      multiplier: 1.4,
      features: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
      featuresJa: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 50μ',
          weightRange: '~100g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~300g)',
          nameJa: '標準タイプ (~300g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 70μ',
          weightRange: '~300g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'standard',
          name: 'レギュラータイプ (~500g)',
          nameJa: 'レギュラータイプ (~500g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        }
      ]
    },
    {
      id: 'pet_ldpe',
      name: MATERIAL_TYPE_LABELS.pet_ldpe,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_ldpe,
      description: MATERIAL_DESCRIPTIONS.pet_ldpe.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_ldpe.ja,
      multiplier: 1.0,
      features: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
      featuresJa: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン50μ',
          specificationEn: 'PET 12μ + LLDPE 50μ',
          weightRange: '~100g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~300g)',
          nameJa: '標準タイプ (~300g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン70μ',
          specificationEn: 'PET 12μ + LLDPE 70μ',
          weightRange: '~300g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'standard',
          name: 'レギュラータイプ (~500g)',
          nameJa: 'レギュラータイプ (~500g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン90μ',
          specificationEn: 'PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン100μ',
          specificationEn: 'PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+直押出ポリエチレン110μ',
          specificationEn: 'PET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'pet_ny_al',
      name: MATERIAL_TYPE_LABELS.pet_ny_al,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_ny_al,
      description: MATERIAL_DESCRIPTIONS.pet_ny_al.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_ny_al.ja,
      multiplier: 1.6,
      features: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
      featuresJa: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン60μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 60μ',
          weightRange: '~100g',
          multiplier: 0.9,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 60 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~500g)',
          nameJa: '標準タイプ (~500g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン80μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 80μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 80 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Package className="w-5 h-5 mr-2 text-navy-600" />
          基本仕様の選択
        </h2>


        {/* Form Content - Unified responsive design */}
        <div className="space-y-6">
          {/* Bag Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">袋のタイプ</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bagTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => updateBasicSpecs({ bagTypeId: type.id })}
                  className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${state.bagTypeId === type.id
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
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                      <img
                        src={type.image}
                        alt={type.nameJa}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            // Create fallback icon
                            parent.innerHTML = `
                              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                              </svg>
                            `;
                            parent.classList.add('bg-gray-50');
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{type.nameJa}</div>
                      <span className="text-gray-500 text-xs">{(type as any).description || ''}</span>
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

          {/* Spout Position Selector - Only show for spout_pouch */}
          {state.bagTypeId === 'spout_pouch' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">スパウト位置</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {spoutPositions.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => updateField('spoutPosition', position.id)}
                    className={`p-4 border-2 rounded-lg transition-all relative ${state.spoutPosition === position.id
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
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    選択されたスパウト位置: <span className="font-medium">{spoutPositions.find(p => p.id === state.spoutPosition)?.labelJa}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Size Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">サイズ (mm)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">幅</label>
                <input
                  type="number"
                  min="50"
                  value={state.width}
                  onChange={(e) => updateBasicSpecs({ width: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder={state.bagTypeId === 'roll_film' ? "300" : "200"}
                />
              </div>
              {/* Height input - HIDE for roll_film */}
              {state.bagTypeId !== 'roll_film' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">高さ</label>
                  <input
                    type="number"
                    min="50"
                    value={state.height}
                    onChange={(e) => updateBasicSpecs({ height: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="300"
                  />
                </div>
              )}
              {shouldShowGusset() && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">マチ</label>
                  <input
                    type="number"
                    min="0"
                    value={state.depth}
                    onChange={(e) => updateBasicSpecs({ depth: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
            {/* Info message for roll_film */}
            {state.bagTypeId === 'roll_film' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  ロールフィルム: 幅のみ入力してください。長さは次のステップで入力します。
                </p>
              </div>
            )}
          </div>

          {/* Material Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">素材</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(material => (
                <button
                  key={material.id}
                  onClick={() => updateBasicSpecs({ materialId: material.id })}
                  className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${state.materialId === material.id
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
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
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900">{material.nameJa}</div>
                        {material.popular && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                            人気
                          </span>
                        )}
                        {material.ecoFriendly && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            環境友好
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{material.descriptionJa}</div>

                      {/* Features */}
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {material.featuresJa.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Thickness Selection */}
        {(() => {
          const selectedMaterial = materials.find(m => m.id === state.materialId);
          if (!selectedMaterial?.thicknessOptions) return null;

          const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al'];
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
              <div className="space-y-3">
                {selectedMaterial.thicknessOptions.map(thickness => (
                  <button
                    key={thickness.id}
                    onClick={() => updateBasicSpecs({ thicknessSelection: thickness.id })}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${state.thicknessSelection === thickness.id
                      ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                      : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                      }`}
                  >
                    {state.thicknessSelection === thickness.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 pr-8">{thickness.nameJa}</div>
                        <div className="font-medium text-gray-900 mt-1">{thickness.specificationEn || thickness.specification}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            重量: {thickness.weightRange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                推奨: 中間タイプで最適なバランスです
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Use the new MultiQuantityStep component
// The old QuantityStep function has been replaced by MultiQuantityStep.tsx

function PostProcessingStep() {
  const state = useQuoteState();
  const { updatePostProcessing } = useQuote();
  const getStepSummary = (step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step);

  // Define post-processing groups
  const groups = [
    {
      id: 'zipper',
      name: 'ジッパー',
      icon: '🔒',
      options: [
        { id: 'zipper-yes', name: 'ジッパー付き', multiplier: 1.15, previewImage: '/images/post-processing/1.ジッパーあり.png' },
        { id: 'zipper-no', name: 'ジッパーなし', multiplier: 1.0, previewImage: '/images/post-processing/1.ジッパーなし.png' }
      ]
    },
    {
      id: 'finish',
      name: '表面処理',
      icon: '✨',
      options: [
        { id: 'glossy', name: '光沢仕上げ', multiplier: 1.08, previewImage: '/images/post-processing/2.光沢.png' },
        { id: 'matte', name: 'マット仕上げ', multiplier: 1.05, previewImage: '/images/post-processing/2.マット.png' }
      ]
    },
    {
      id: 'notch',
      name: 'ノッチ',
      icon: '✂️',
      options: [
        { id: 'notch-yes', name: 'ノッチ付き', multiplier: 1.03, previewImage: '/images/post-processing/3.ノッチあり.png' },
        { id: 'notch-no', name: 'ノッチなし', multiplier: 1.0, previewImage: '/images/post-processing/3.ノッチなし.png' }
      ]
    },
    {
      id: 'hang-hole',
      name: '吊り穴',
      icon: '⭕',
      options: [
        { id: 'hang-hole-6mm', name: '吊り下げ穴 (6mm)', multiplier: 1.03, previewImage: '/images/post-processing/4.吊り穴あり.png' },
        { id: 'hang-hole-8mm', name: '吊り下げ穴 (8mm)', multiplier: 1.04, previewImage: '/images/post-processing/4.吊り穴あり.png' },
        { id: 'hang-hole-no', name: '吊り穴なし', multiplier: 1.0, previewImage: '/images/post-processing/4.吊り穴なし.png' }
      ]
    },
    {
      id: 'corner',
      name: '角形状',
      icon: '📐',
      options: [
        { id: 'corner-round', name: '角丸', multiplier: 1.06, previewImage: '/images/post-processing/5.角丸.png' },
        { id: 'corner-square', name: '角直角', multiplier: 1.0, previewImage: '/images/post-processing/5.角直.png' }
      ]
    },
    {
      id: 'valve',
      name: 'バルブ',
      icon: '⚙️',
      options: [
        { id: 'valve-yes', name: 'バルブ付き', multiplier: 1.08, previewImage: '/images/post-processing/バルブあり.png' },
        { id: 'valve-no', name: 'バルブなし', multiplier: 1.0, previewImage: '/images/post-processing/バルブなし.png' }
      ]
    },
    {
      id: 'opening',
      name: '開封位置',
      icon: '📍',
      options: [
        { id: 'top-open', name: '上端開封', multiplier: 1.02, previewImage: '/images/post-processing/6.上端オープン.png' },
        { id: 'bottom-open', name: '下端開封', multiplier: 1.03, previewImage: '/images/post-processing/6.下端オープン.png' }
      ]
    }
  ];

  // Zipper position options (shown conditionally)
  const zipperPositionOptions = [
    { id: 'zipper-position-any', name: 'ジッパー位置: お任せ', multiplier: 0 },
    { id: 'zipper-position-specified', name: 'ジッパー位置: 指定', multiplier: 1.05 }
  ];

  const handleToggleOption = (optionId: string, multiplier: number) => {
    const currentOptions = state.postProcessingOptions || [];

    // Mutually exclusive groups are handled by PostProcessingGroups component
    let newOptions: string[];

    if (currentOptions.includes(optionId)) {
      newOptions = currentOptions.filter(id => id !== optionId);
    } else {
      newOptions = [...currentOptions, optionId];
    }

    // Calculate total multiplier
    const allOptions = [...zipperPositionOptions, ...groups.flatMap(g => g.options)];
    const totalMultiplier = newOptions.reduce((acc, id) => {
      const option = allOptions.find(opt => opt.id === id);
      return acc + (option ? option.multiplier - 1 : 0);
    }, 1.0);

    updatePostProcessing(newOptions, totalMultiplier);
  };

  // Show zipper position selector only when zipper-yes is selected
  const showZipperPosition = state.postProcessingOptions?.includes('zipper-yes');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Settings className="w-5 h-5 mr-2 text-navy-600" />
          後加工オプション
        </h2>

        {/* Previous Steps Summary */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">基本仕様</h3>
            </div>
            {getStepSummary('specs')}
          </div>
        </div>

        {/* Post-processing groups */}
        <PostProcessingGroups
          groups={groups}
          selectedOptions={state.postProcessingOptions || []}
          onToggleOption={handleToggleOption}
          totalMultiplier={state.postProcessingMultiplier || 1.0}
          bagTypeId={state.bagTypeId}
        />

        {/* Zipper position selector (conditional) */}
        {showZipperPosition && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              ジッパー位置の選択
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zipperPositionOptions.map((position) => (
                <button
                  key={position.id}
                  type="button"
                  onClick={() => handleToggleOption(position.id, position.multiplier)}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${state.postProcessingOptions?.includes(position.id)
                    ? 'border-blue-500 bg-blue-100 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-900 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  <div className="font-medium text-sm">{position.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{position.description}</div>
                  {position.multiplier > 0 && (
                    <div className="text-xs text-blue-600 font-medium mt-2">
                      追加倍率: ×{position.multiplier}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get Japanese bag type name
function getBagTypeLabel(bagTypeId: string): string {
  const bagTypeLabels: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'box': 'BOX型パウチ',
    'spout_pouch': 'スパウトパウチ',
    'roll_film': 'ロールフィルム'
  };
  return bagTypeLabels[bagTypeId] || bagTypeId;
}

// Helper function to get Japanese post-processing label
function getPostProcessingLabel(optionId: string): string {
  const postProcessingLabels: Record<string, string> = {
    'zipper-yes': 'ジッパー付き',
    'zipper-no': 'ジッパーなし',
    'zipper-position-any': 'ジッパー位置 (お任せ)',
    'zipper-position-specified': 'ジッパー位置 (指定)',
    'glossy': '光沢仕上げ',
    'matte': 'マット仕上げ',
    'notch-yes': 'ノッチ付き',
    'notch-no': 'ノッチなし',
    'hang-hole-6mm': '吊り下げ穴 (6mm)',
    'hang-hole-8mm': '吊り下げ穴 (8mm)',
    'hang-hole-no': '吊り穴なし',
    'corner-round': '角丸',
    'corner-square': '角直角',
    'valve-yes': 'バルブ付き',
    'valve-no': 'バルブなし',
    'top-open': '上端開封',
    'bottom-open': '下端開封'
  };
  return postProcessingLabels[optionId] || optionId.replace(/-/g, ' ');
}

function ResultStep({ result, onReset, onResultUpdate }: { result: UnifiedQuoteResult; onReset: () => void; onResultUpdate: (result: UnifiedQuoteResult) => void }) {
  const state = useQuoteState();
  const { updateQuantityOptions, updateField } = useQuote();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [downloadStatusPDF, setDownloadStatusPDF] = useState<'idle' | 'success' | 'error'>('idle');

  // クーポン関連状態
  const [couponCode, setCouponCode] = useState('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    name: string;
    nameJa: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [adjustedPrice, setAdjustedPrice] = useState(result.totalPrice);

  // Optimization suggestions state
  const [showOptimizationSuggestions, setShowOptimizationSuggestions] = useState(false);
  const [parallelProductionOptions, setParallelProductionOptions] = useState<ParallelProductionOption[]>([]);
  const [economicQuantitySuggestion, setEconomicQuantitySuggestion] = useState<EconomicQuantitySuggestionData | null>(null);

  // 初期数量を記憶（並列生産オプションはこの数量に基づいて計算される）
  const [initialQuantity] = useState(result.quantity || state.quantity);
  // 初期結果を記憶（現在の選択カードは常にこの初期結果を表示）
  const [initialResult] = useState(result);

  // Calculate optimization suggestions
  useEffect(() => {
    // roll_film, t_shape, m_shapeの場合に並列生産オプションを計算
    if (state.bagTypeId === 'roll_film' || state.bagTypeId === 't_shape' || state.bagTypeId === 'm_shape') {
      // ロールフィルムの場合、ユーザーが入力した長さを使用
      // パウチの場合、result.filmUsageを使用
      const currentFilmUsageForCalc = state.bagTypeId === 'roll_film' ? state.quantity : (result.filmUsage || 900);

      const suggestion = pouchCostCalculator.calculateEconomicQuantitySuggestion(
        state.quantity,
        { width: state.width, height: state.height, depth: state.depth },
        state.bagTypeId,
        currentFilmUsageForCalc,
        result.unitPrice,
        {
          filmLayers: state.filmLayers,
          materialId: state.materialId,
          thicknessSelection: state.thicknessSelection,
          postProcessingOptions: state.postProcessingOptions
        }
      );

      if (suggestion.parallelProductionOptions && suggestion.parallelProductionOptions.length > 0) {
        setParallelProductionOptions(suggestion.parallelProductionOptions);
        setShowOptimizationSuggestions(true);
      }

      // 経済的数量提案もセット
      setEconomicQuantitySuggestion({
        orderQuantity: suggestion.orderQuantity,
        minimumOrderQuantity: suggestion.minimumOrderQuantity,
        minimumFilmUsage: suggestion.minimumFilmUsage,
        pouchesPerMeter: suggestion.pouchesPerMeter,
        economicQuantity: suggestion.economicQuantity,
        economicFilmUsage: suggestion.economicFilmUsage,
        efficiencyImprovement: suggestion.efficiencyImprovement,
        unitCostAtOrderQty: suggestion.unitCostAtOrderQty,
        unitCostAtEconomicQty: suggestion.unitCostAtEconomicQty,
        costSavings: suggestion.costSavings,
        costSavingsRate: suggestion.costSavingsRate,
        recommendedQuantity: suggestion.recommendedQuantity,
        recommendationReason: suggestion.recommendationReason
      });
    } else {
      // パウチ製品（平袋・スタンド）の場合も経済的数量提案を計算
      const currentFilmUsageForCalc = result.filmUsage || 900;

      const suggestion = pouchCostCalculator.calculateEconomicQuantitySuggestion(
        state.quantity,
        { width: state.width, height: state.height, depth: state.depth },
        state.bagTypeId,
        currentFilmUsageForCalc,
        result.unitPrice,
        {
          filmLayers: state.filmLayers,
          materialId: state.materialId,
          thicknessSelection: state.thicknessSelection,
          postProcessingOptions: state.postProcessingOptions
        }
      );

      setEconomicQuantitySuggestion({
        orderQuantity: suggestion.orderQuantity,
        minimumOrderQuantity: suggestion.minimumOrderQuantity,
        minimumFilmUsage: suggestion.minimumFilmUsage,
        pouchesPerMeter: suggestion.pouchesPerMeter,
        economicQuantity: suggestion.economicQuantity,
        economicFilmUsage: suggestion.economicFilmUsage,
        efficiencyImprovement: suggestion.efficiencyImprovement,
        unitCostAtOrderQty: suggestion.unitCostAtOrderQty,
        unitCostAtEconomicQty: suggestion.unitCostAtEconomicQty,
        costSavings: suggestion.costSavings,
        costSavingsRate: suggestion.costSavingsRate,
        recommendedQuantity: suggestion.recommendedQuantity,
        recommendationReason: suggestion.recommendationReason
      });
    }
  }, [state.bagTypeId, state.quantity, state.width, state.height, state.depth, result.unitPrice, state.filmLayers, state.materialId, state.thicknessSelection, state.postProcessingOptions]);

  // 数量オプションを生成
  const quantityOptions: QuantityOption[] = useMemo(() => {
    const options: QuantityOption[] = []

    // 現在の選択を最初に追加
    options.push({
      id: 'current',
      quantity: state.quantity,
      label: '現在の選択',
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      isCurrent: true,
      isRecommended: false,
      reason: 'お客様が選択した数量',
      details: [],
      result: result  // 現在の結果も保存
    })

    // 並列生産オプションから最大2つ追加（節約率順にソート）
    if (parallelProductionOptions.length > 0) {
      // 節約率順にソートして上位2つを選択
      const sortedOptions = [...parallelProductionOptions].sort((a, b) =>
        b.savingsRate - a.savingsRate
      )

      const bestOptions = sortedOptions.slice(0, 2)

      bestOptions.forEach((bestOption, index) => {
        // 並列生産オプションは初期数量(initialQuantity)に基づいて計算
        // オプション選択後も推奨内容は固定されたままにする
        const totalQuantity = initialQuantity * bestOption.quantity
        const totalPrice = bestOption.estimatedUnitCost * totalQuantity

        // 事前計算された結果を作成（並行生産の最適化を含む）
        const preCalculatedResult: UnifiedQuoteResult = {
          ...result,
          quantity: totalQuantity,
          unitPrice: bestOption.estimatedUnitCost,
          totalPrice: totalPrice,
          parallelProduction: {
            enabled: true,
            optionNumber: bestOption.optionNumber,
            quantity: bestOption.quantity,
            materialWidth: bestOption.materialWidth,
            filmWidthUtilization: bestOption.filmWidthUtilization,
            estimatedUnitCost: bestOption.estimatedUnitCost,
            estimatedTotalCost: totalPrice,
            reason: bestOption.reason
          }
        }

        options.push({
          id: `parallel-${bestOption.optionNumber}`,
          quantity: totalQuantity,
          label: bestOption.reason,
          unitPrice: bestOption.estimatedUnitCost,
          totalPrice: totalPrice,
          savings: {
            amount: (result.unitPrice - bestOption.estimatedUnitCost) * totalQuantity,  // 総節約額
            rate: bestOption.savingsRate
          },
          isCurrent: false,
          isRecommended: index === 0,  // 最初のオプションのみ推奨マーク
          reason: bestOption.reason,
          details: [
            `${bestOption.quantity}本注文`,
            `原反効率: ${bestOption.filmWidthUtilization.toFixed(1)}%`,
            `${bestOption.materialWidth}mm原反使用`
          ],
          result: preCalculatedResult  // 事前計算された結果を保存
        })
      })
    }

    // 経済的数量提案があれば追加（まだ並列生産オプションがない場合のみ）
    if (economicQuantitySuggestion &&
      economicQuantitySuggestion.recommendedQuantity !== state.quantity &&
      parallelProductionOptions.length === 0) {
      const totalPrice = economicQuantitySuggestion.unitCostAtEconomicQty * economicQuantitySuggestion.recommendedQuantity

      options.push({
        id: 'economic',
        quantity: economicQuantitySuggestion.recommendedQuantity,
        label: economicQuantitySuggestion.recommendationReason,
        unitPrice: economicQuantitySuggestion.unitCostAtEconomicQty,
        totalPrice: totalPrice,
        savings: {
          amount: economicQuantitySuggestion.costSavings,
          rate: economicQuantitySuggestion.costSavingsRate
        },
        isCurrent: false,
        isRecommended: true,
        reason: economicQuantitySuggestion.recommendationReason,
        details: [
          `最小発注量: ${economicQuantitySuggestion.economicQuantity.toLocaleString()}${state.bagTypeId === 'roll_film' ? 'm' : '個'}`,
          `効率改善: ${economicQuantitySuggestion.efficiencyImprovement.toFixed(1)}%`
        ]
      })
    }

    return options
  }, [state.quantity, state.bagTypeId, result.unitPrice, result.totalPrice, parallelProductionOptions, economicQuantitySuggestion])

  // 数量変更ハンドラー
  const handleQuantityChange = async (option: QuantityOption) => {
    try {
      const newQuantity = option.quantity

      // 数量が同じなら何もしない
      if (newQuantity === state.quantity) return

      // 事前計算された結果があればそれを使用（並行生産などの最適化を含む）
      // なければ標準計算を実行
      let newResult: UnifiedQuoteResult

      if (option.result) {
        // 事前計算された結果を使用（推奨オプションなど）
        newResult = option.result

        // 結果を更新して画面に反映
        onResultUpdate(newResult)

        // SKU数量も更新（注文内容の確認セクションで正しい数量を表示するため）
        // 重要: updateQuantityOptionsはskuQuantitiesをサポートしていないため、updateFieldを使用
        await new Promise(resolve => setTimeout(resolve, 0)) // resultの更新を待つ
        updateField('skuQuantities', [newQuantity])
      } else {
        // 新しい見積もりを計算（標準計算）
        newResult = await unifiedPricingEngine.calculateQuote({
          bagTypeId: state.bagTypeId,
          materialId: state.materialId,
          width: state.width,
          height: state.height,
          depth: state.depth,
          thicknessSelection: state.thicknessSelection,
          quantity: newQuantity,
          isUVPrinting: state.isUVPrinting,
          printingType: state.printingType,
          printingColors: state.printingColors,
          doubleSided: state.doubleSided,
          postProcessingOptions: state.postProcessingOptions,
          deliveryLocation: state.deliveryLocation,
          urgency: state.urgency,
          skuQuantities: state.skuQuantities
        })

        // 結果を更新して画面に反映
        onResultUpdate(newResult)

        // Contextの状態も更新（結果を反映するため）
        // 重要: updateQuantityOptionsを先に呼ぶと、useEffectがトリガーされて再計算される
        // そのため、onResultUpdate（setResult）を先に呼んで、結果を固定してからContextを更新する
        await new Promise(resolve => setTimeout(resolve, 0)) // resultの更新を待つ
        updateQuantityOptions({ quantity: newQuantity })
      }

      // ページをトップにスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  // Get film structure specification from materials data
  const getFilmStructureSpec = (materialId: string, thicknessId: string): string => {
    const materials = [
      {
        id: 'pet_al',
        thicknessOptions: [
          { id: 'light', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 60μ' },
          { id: 'medium', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 100μ' },
          { id: 'ultra', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 110μ' }
        ]
      },
      {
        id: 'pet_vmpet',
        thicknessOptions: [
          { id: 'light', specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + LLDPE 60μ' },
          { id: 'medium', specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + LLDPE 80μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + LLDPE 100μ' }
        ]
      },
      {
        id: 'pet_ldpe',
        thicknessOptions: [
          { id: 'medium', specificationEn: 'PET 12μ + LLDPE 110μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + LLDPE 120μ' },
          { id: 'ultra', specificationEn: 'PET 12μ + LLDPE 130μ' }
        ]
      },
      {
        id: 'pet_ny_al',
        thicknessOptions: [
          { id: 'light', specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 60μ' },
          { id: 'medium', specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 80μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 100μ' }
        ]
      }
    ];

    const material = materials.find(m => m.id === materialId);
    if (material) {
      const thickness = material.thicknessOptions.find(t => t.id === thicknessId);
      if (thickness) {
        return thickness.specificationEn;
      }
    }
    return '指定なし';
  };

  const handleSave = async () => {
    if (!user?.id) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Prepare quotation data for saving
      const quotationData = {
        userId: user.id,
        quotationNumber: `QT-${Date.now()}`,
        status: 'draft' as const,
        totalAmount: result.totalPrice,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        notes: null,
        items: [
          {
            productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
            quantity: state.quantity,
            unitPrice: result.unitPrice,
            specifications: {
              bagTypeId: state.bagTypeId,
              materialId: state.materialId,
              width: state.width,
              height: state.height,
              depth: state.depth,
              thicknessSelection: state.thicknessSelection,
              isUVPrinting: state.isUVPrinting,
              printingType: state.printingType,
              printingColors: state.printingColors,
              doubleSided: state.doubleSided,
              postProcessingOptions: state.postProcessingOptions,
              deliveryLocation: state.deliveryLocation,
              urgency: state.urgency,
              dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
            }
          }
        ]
      };

      // Call API to save quotation
      const response = await fetch('/api/quotations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();

      console.log('Quotation saved successfully:', savedQuotation);

      // Store the quotation ID for potential submission
      if (savedQuotation.quotation?.id) {
        setSavedQuotationId(savedQuotation.quotation.id);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save quote:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // If we don't have a saved quotation, save it first
      let quotationId = savedQuotationId;

      if (!quotationId) {
        // Prepare and save quotation first
        const quotationData = {
          userId: user.id,
          quotationNumber: `QT-${Date.now()}`,
          status: 'draft' as const,
          totalAmount: result.totalPrice,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: null,
          items: [
            {
              productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
              quantity: state.quantity,
              unitPrice: result.unitPrice,
              specifications: {
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
              }
            }
          ]
        };

        const saveResponse = await fetch('/api/quotations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotationData),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save quotation');
        }

        const savedQuotation = await saveResponse.json();
        quotationId = savedQuotation.quotation?.id;

        if (!quotationId) {
          throw new Error('No quotation ID returned');
        }

        setSavedQuotationId(quotationId);
      }

      // Submit the quotation
      const submitResponse = await fetch('/api/quotations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          customerInfo: {
            name: user.user_metadata?.kanji_last_name && user.user_metadata?.kanji_first_name
              ? `${user.user_metadata.kanji_last_name} ${user.user_metadata.kanji_first_name}`
              : user.email?.split('@')[0] || 'Customer',
            email: user.email || 'customer@example.com',
            phone: user.user_metadata?.phone || null,
          }
        }),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit quotation');
      }

      const submitResult = await submitResponse.json();

      console.log('Quotation submitted successfully:', submitResult);
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to submit quotation:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    setDownloadStatus('idle');

    try {
      // Generate quotation number
      const quoteNumber = `QT-${Date.now()}`;
      const today = new Date();
      const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Build quote item data
      const quoteItem = {
        id: 'ITEM-001',
        name: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
        description: `サイズ: ${state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width} x ${state.height}${state.depth > 0 ? ` x ${state.depth}` : ''}`} mm | ${MATERIAL_TYPE_LABELS_JA[state.materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || getMaterialLabel(state.materialId)}`,
        quantity: state.quantity,
        unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
        unitPrice: Math.round(result.unitPrice),
        amount: Math.round(result.totalPrice),
      };

      // Build specifications for Excel
      const specifications = {
        bagType: getBagTypeLabel(state.bagTypeId),
        contents: '粉体',
        size: state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}`,
        material: MATERIAL_TYPE_LABELS_JA[state.materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || getMaterialLabel(state.materialId),
        sealWidth: '5mm',
        sealDirection: '上',
        notchShape: 'V',
        notchPosition: '指定位置',
        hanging: 'なし',
        hangingPosition: '指定位置',
        zipperPosition: state.postProcessingOptions.some((opt: string) => opt.includes('zipper') || opt.includes('zip')) ? '指定位置' : 'なし',
        cornerR: 'R5',
      };

      // Build optional processing
      const optionalProcessing = {
        zipper: state.postProcessingOptions.some((opt: string) => opt.includes('zipper') || opt.includes('zip')),
        notch: state.postProcessingOptions.some((opt: string) => opt.includes('notch')),
        hangingHole: state.postProcessingOptions.some((opt: string) => opt.includes('hanging')),
        cornerProcessing: state.postProcessingOptions.some((opt: string) => opt.includes('corner')),
        gasValve: state.postProcessingOptions.some((opt: string) => opt.includes('valve') || opt.includes('gas')),
        easyCut: state.postProcessingOptions.some((opt: string) => opt.includes('easy') || opt.includes('cut')),
        dieCut: state.postProcessingOptions.some((opt: string) => opt.includes('die')),
      };

      // Prepare Excel data
      const excelData = {
        quoteNumber,
        issueDate: formatDate(today),
        expiryDate: formatDate(expiryDate),
        quoteCreator: 'EPACKAGE Lab 自動見積もりシステム',

        // Customer information (from auth or defaults)
        customerName: user?.companyName || user?.email?.split('@')[0] || 'お客様',
        customerNameKana: '',
        companyName: user?.companyName || '',
        postalCode: user?.postalCode || '',
        address: user?.city || user?.street
          ? `${user?.prefecture || ''}${user?.city || ''}${user?.street || ''}`
          : '',
        contactPerson: user?.kanjiLastName && user?.kanjiFirstName
          ? `${user.kanjiLastName} ${user.kanjiFirstName}`
          : '',
        phone: user?.corporatePhone || user?.personalPhone || '',
        email: user?.email || '',

        // Quote items
        items: [quoteItem],

        // Specifications for Excel template
        specifications,

        // Optional processing
        optionalProcessing,
      };

      // Call Excel generation API
      const response = await fetch('/api/quotes/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: excelData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Excel generation failed' }));
        throw new Error(errorData.error || 'Excel generation failed');
      }

      // Get the Excel blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quoteNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Excel downloaded successfully:', quoteNumber);
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to download Excel:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!user?.id) {
      setDownloadStatusPDF('error');
      setTimeout(() => setDownloadStatusPDF('idle'), 3000);
      return;
    }

    setIsDownloadingPDF(true);
    setDownloadStatusPDF('idle');

    try {
      // Generate quotation number (same for PDF and DB)
      const quoteNumber = `QT-${Date.now()}`;
      const today = new Date();
      const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // =====================================================
      // Step 1: Generate PDF
      // =====================================================
      const { generateQuotePDF } = await import('@/lib/pdf-generator');

      // =====================================================
      // SKU Mode Detection
      // =====================================================
      const hasValidSKUData = result?.hasValidSKUData ?? (
        state.skuCount > 1 &&
        state.skuQuantities &&
        state.skuQuantities.length === state.skuCount &&
        state.skuQuantities.every(qty => qty && qty >= 100)
      );

      // Build quote items data (support SKU mode, multi-quantity patterns)
      const quoteItems = hasValidSKUData
        ? state.skuQuantities.map((qty, index) => ({
          id: `SKU-${String(index + 1).padStart(3, '0')}`,
          name: `SKU ${index + 1}${state.skuNames?.[index] ? `: ${state.skuNames[index]}` : ''} - ${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
          description: `サイズ: ${state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width} x ${state.height}${state.depth > 0 ? ` x ${state.depth}` : ''}`} mm | ${MATERIAL_TYPE_LABELS_JA[state.materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || getMaterialLabel(state.materialId)}`,
          quantity: qty,
          unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
          unitPrice: Math.round(result.unitPrice),
          amount: Math.round(result.unitPrice * qty),
        }))
        : hasMultiQuantityResults && multiQuantityQuotes.length > 0
          ? multiQuantityQuotes.map((mq, index) => ({
            id: `ITEM-${String(index + 1).padStart(3, '0')}`,
            name: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')} (${mq.quantity.toLocaleString()}${state.bagTypeId === 'roll_film' ? 'm' : '個'})`,
            description: `サイズ: ${state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width} x ${state.height}${state.depth > 0 ? ` x ${state.depth}` : ''}`} mm | ${MATERIAL_TYPE_LABELS_JA[state.materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || getMaterialLabel(state.materialId)}`,
            quantity: mq.quantity,
            unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
            unitPrice: Math.round(mq.unitPrice),
            amount: Math.round(mq.totalPrice),
          }))
          : [{
            id: 'ITEM-001',
            name: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
            description: `サイズ: ${state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width} x ${state.height}${state.depth > 0 ? ` x ${state.depth}` : ''}`} mm | ${MATERIAL_TYPE_LABELS_JA[state.materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || getMaterialLabel(state.materialId)}`,
            quantity: state.quantity,
            unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
            unitPrice: Math.round(result.unitPrice),
            amount: Math.round(result.totalPrice),
          }];

      // Build specifications for PDF
      const specifications = {
        bagType: getBagTypeLabel(state.bagTypeId),
        contents: '粉体',
        size: state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}`,
        material: MATERIAL_TYPE_LABELS_JA[state.materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || getMaterialLabel(state.materialId),
        thicknessType: state.thicknessSelection ? getFilmStructureSpec(state.materialId, state.thicknessSelection) : '指定なし',
        sealWidth: '5mm',
        sealDirection: '上',
        notchShape: 'V',
        notchPosition: '指定位置',
        hanging: 'なし',
        hangingPosition: '指定位置',
        zipperPosition: state.postProcessingOptions.some((opt: string) => opt.includes('zipper') || opt.includes('zip')) ? '指定位置' : 'なし',
        cornerR: 'R5',
      };

      // Build optional processing
      const optionalProcessing = {
        zipper: state.postProcessingOptions.some((opt: string) => opt.includes('zipper') || opt.includes('zip')),
        notch: state.postProcessingOptions.some((opt: string) => opt.includes('notch')),
        hangingHole: state.postProcessingOptions.some((opt: string) => opt.includes('hanging')),
        cornerProcessing: state.postProcessingOptions.some((opt: string) => opt.includes('corner')),
        gasValve: state.postProcessingOptions.some((opt: string) => opt.includes('valve') || opt.includes('gas')),
        easyCut: state.postProcessingOptions.some((opt: string) => opt.includes('easy') || opt.includes('cut')),
        dieCut: state.postProcessingOptions.some((opt: string) => opt.includes('die')),
      };

      // Prepare PDF data
      const pdfData = {
        quoteNumber,
        issueDate: formatDate(today),
        expiryDate: formatDate(expiryDate),
        quoteCreator: 'EPACKAGE Lab 自動見積もりシステム',

        // Customer information (from auth or defaults)
        customerName: user?.companyName || user?.email?.split('@')[0] || 'お客様',
        customerNameKana: '',
        companyName: user?.companyName || '',
        postalCode: user?.postalCode || '',
        address: user?.city || user?.street
          ? `${user?.prefecture || ''}${user?.city || ''}${user?.street || ''}`
          : '',
        contactPerson: user?.kanjiLastName && user?.kanjiFirstName
          ? `${user.kanjiLastName} ${user.kanjiFirstName}`
          : '',
        phone: user?.corporatePhone || user?.personalPhone || '',
        email: user?.email || '',

        // Quote items
        items: quoteItems,

        // Specifications for PDF template
        specifications,

        // Optional processing
        optionalProcessing,

        // SKU data (if SKU mode is active)
        ...(hasValidSKUData && {
          skuData: {
            count: state.skuCount,
            items: state.skuQuantities.map((qty, index) => ({
              skuNumber: index + 1,
              designName: state.skuNames?.[index] || '',
              quantity: qty,
              unitPrice: Math.round(result.unitPrice),
              totalPrice: Math.round(result.unitPrice * qty),
            })),
          },
        }),

        // Terms and conditions
        paymentTerms: '受注後 100% 前払い',
        deliveryDate: 'デザイン確定後、約 3〜4 週間',
        deliveryLocation: state.deliveryLocation === 'international' ? '日本国内指定場所' : '国内指定場所',
        validityPeriod: '発行日より 30 日間',
      };

      // Generate PDF directly in browser (client-side)
      const pdfResult = await generateQuotePDF(pdfData, { filename: `${quoteNumber}.pdf` });

      if (!pdfResult.success || !pdfResult.pdfBuffer) {
        throw new Error(pdfResult.error || 'PDF generation failed');
      }

      // Create blob and download
      const blob = new Blob([pdfResult.pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('PDF downloaded successfully:', quoteNumber);

      // Log PDF download to document_access_log table
      try {
        // Try to get quotation_id from saved quotation response
        const logResponse = await fetch('/api/member/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            document_type: 'quote',
            document_id: quoteNumber, // Use quote number as document_id
            action: 'downloaded',
          }),
        });
        if (logResponse.ok) {
          console.log('PDF download logged successfully');
        }
      } catch (logError) {
        console.error('Failed to log PDF download:', logError);
        // Don't fail the download if logging fails
      }

      // =====================================================
      // Step 2: Save to Database (Log)
      // =====================================================
      const quotationData = {
        userId: user.id,
        quotationNumber: quoteNumber, // Use same quote number
        status: 'draft' as const,
        totalAmount: hasMultiQuantityResults && multiQuantityQuotes.length > 0
          ? multiQuantityQuotes[multiQuantityQuotes.length - 1].totalPrice  // Use largest quantity total
          : result.totalPrice,
        validUntil: expiryDate.toISOString(),
        notes: null,
        items: hasMultiQuantityResults && multiQuantityQuotes.length > 0
          ? multiQuantityQuotes.map((mq) => ({
            productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')} (${mq.quantity.toLocaleString()}${state.bagTypeId === 'roll_film' ? 'm' : '個'})`,
            quantity: mq.quantity,
            unitPrice: mq.unitPrice,
            specifications: {
              bagTypeId: state.bagTypeId,
              materialId: state.materialId,
              width: state.width,
              height: state.height,
              depth: state.depth,
              thicknessSelection: state.thicknessSelection,
              isUVPrinting: state.isUVPrinting,
              printingType: state.printingType,
              printingColors: state.printingColors,
              doubleSided: state.doubleSided,
              postProcessingOptions: state.postProcessingOptions,
              deliveryLocation: state.deliveryLocation,
              urgency: state.urgency,
              dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
            }
          }))
          : [
            {
              productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
              quantity: state.quantity,
              unitPrice: result.unitPrice,
              specifications: {
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
              }
            }
          ]
      };

      // Call API to save quotation (log the PDF generation)
      const response = await fetch('/api/quotations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('Failed to save quotation to database:', errorData.error);
        // Don't throw error - PDF download was successful
        // Just log the save failure
      } else {
        const savedQuotation = await response.json();
        console.log('Quotation saved successfully (logged):', savedQuotation);
      }

      setDownloadStatusPDF('success');
      setTimeout(() => setDownloadStatusPDF('idle'), 3000);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setDownloadStatusPDF('error');
      setTimeout(() => setDownloadStatusPDF('idle'), 3000);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // クーポン適用ハンドラー
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('クーポンコードを入力してください。');
      return;
    }

    setIsVerifyingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderAmount: result.totalPrice,
          userId: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'クーポン検証に失敗しました。' }));
        throw new Error(errorData.error || 'クーポン検証に失敗しました。');
      }

      const data = await response.json();

      if (!data.valid) {
        setCouponError(data.message || '無効なクーポンです。');
        return;
      }

      // クーポン割引計算
      const orderAmount = result.totalPrice;
      let discountAmount = 0;

      if (data.coupon.type === 'percentage') {
        discountAmount = Math.round(orderAmount * (data.coupon.value / 100));
        // 最大割引金額適用
        if (data.coupon.maximum_discount_amount) {
          discountAmount = Math.min(discountAmount, data.coupon.maximum_discount_amount);
        }
      } else if (data.coupon.type === 'fixed_amount') {
        discountAmount = data.coupon.value;
      } else if (data.coupon.type === 'free_shipping') {
        discountAmount = result.breakdown.delivery;
      }

      // 適用された価格計算
      const newPrice = Math.max(0, orderAmount - discountAmount);
      setAdjustedPrice(newPrice);

      // クーポン情報保存
      setAppliedCoupon({
        code: data.coupon.code,
        name: data.coupon.name,
        nameJa: data.coupon.name_ja || data.coupon.name,
        type: data.coupon.type,
        value: data.coupon.value,
        discountAmount
      });

    } catch (error) {
      console.error('Coupon validation failed:', error);
      setCouponError(error instanceof Error ? error.message : 'クーポン検証中にエラーが発生しました。');
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  // クーポン削除ハンドラー
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setAdjustedPrice(result.totalPrice);
  };

  const { state: multiQuantityState } = useMultiQuantityQuote();

  // Get multi-quantity calculations if available
  const multiQuantityCalculations = multiQuantityState.multiQuantityResults;
  const hasMultiQuantityResults = multiQuantityCalculations && multiQuantityCalculations.size > 0;

  // Build quotes array from multi-quantity results
  const multiQuantityQuotes = hasMultiQuantityResults
    ? Array.from(multiQuantityCalculations.entries()).map(([quantity, quote]) => ({
      quantity: quantity,
      unitPrice: quote.unitPrice,
      totalPrice: quote.totalPrice,
      discountRate: 0, // Calculate based on comparison if needed
      priceBreak: '通常',
      leadTimeDays: quote.leadTimeDays || result.leadTimeDays,
      isValid: true
    })).sort((a, b) => a.quantity - b.quantity)
    : [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {hasMultiQuantityResults ? '数量比較見積もり' : '見積もり完了'}
        </h2>
        <p className="text-gray-600">
          {hasMultiQuantityResults
            ? `${multiQuantityQuotes.length}件の数量で比較しました`
            : '以下の内容でお見積もりいたしました'
          }
        </p>
      </div>

      {/* Price Display - Show multi-quantity or single quantity */}
      {hasMultiQuantityResults && multiQuantityQuotes.length > 0 ? (
        // Multi-quantity summary display
        <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-8 rounded-xl">
          <div className="text-sm font-medium mb-4">数量別見積もり</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeMap(multiQuantityQuotes, (quote) => (
              <div key={quote.quantity} className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-sm font-medium mb-1">{quote.quantity.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}</div>
                <div className="text-xl font-bold">¥{quote.totalPrice.toLocaleString()}</div>
                <div className="text-xs opacity-90 mt-1">
                  単価: ¥{quote.unitPrice.toLocaleString()}/{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                </div>
              </div>
            ))}
          </div>
          {multiQuantityState.comparison && (
            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <div className="text-sm opacity-90">
                最適数量: <span className="font-bold">{multiQuantityState.comparison.bestValue.quantity.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}</span>
                （{multiQuantityState.comparison.bestValue.percentage}%節約）
              </div>
            </div>
          )}
        </div>
      ) : (
        // Single quantity display (fallback)
        <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-8 rounded-xl text-center">
          <div className="text-sm font-medium mb-2">合計金額（税別）</div>
          <div className="text-4xl font-bold mb-4">
            ¥{result.totalPrice.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">
            単価: ¥{result.unitPrice.toLocaleString()}/{state.bagTypeId === 'roll_film' ? 'm' : '個'} / 最小注文数: {result.minOrderQuantity.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}
          </div>
        </div>
      )}

      {/* SKU mode detection - prioritize result data */}
      {(() => {
        const hasValidSKUData = result?.hasValidSKUData ?? (
          state.skuCount > 1 &&
          state.skuQuantities &&
          state.skuQuantities.length === state.skuCount &&
          state.skuQuantities.every(qty => qty && qty >= 100)
        );

        console.log('[ResultStep] Debug:', {
          resultHasValidSKUData: result?.hasValidSKUData,
          resultSkuQuantities: result?.skuQuantities,
          resultSkuCount: result?.skuCount,
          stateSkuCount: state.skuCount,
          stateSkuQuantities: state.skuQuantities,
          calculatedHasValidSKUData: hasValidSKUData
        });

        return null;
      })()}

      {/* Order Summary - 新しいコンポーネント */}
      <OrderSummarySection
        state={state}
        result={result}
        initialQuantity={initialQuantity}
        initialSkuQuantities={state.skuQuantities}
      />

      {/* Multi-Quantity Comparison Results */}
      {multiQuantityState.comparison && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-navy-600" />
              数量比較分析結果
            </h3>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">最適数量</p>
                <p className="text-lg font-bold text-green-600">
                  {multiQuantityState.comparison.bestValue.quantity.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">最大節約</p>
                <p className="text-lg font-bold text-blue-600">
                  {multiQuantityState.comparison.bestValue.percentage}%
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-500">効率性改善</p>
                <p className="text-lg font-bold text-purple-600">
                  {multiQuantityState.comparison.trends.optimalQuantity.toLocaleString()}{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-500">価格トレンド</p>
                <p className="text-lg font-bold text-yellow-600">
                  {multiQuantityState.comparison.trends.priceTrend === 'decreasing' ? '低下' :
                    multiQuantityState.comparison.trends.priceTrend === 'increasing' ? '上昇' : '安定'}
                </p>
              </div>
            </div>

            {/* Quantity Comparison Table */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">数量比較詳細</h4>
              <MultiQuantityComparisonTable
                quotes={Object.entries(multiQuantityState.comparison!.economiesOfScale).map(([quantity, data]) => ({
                  quantity: parseInt(quantity),
                  unitPrice: data.unitPrice,
                  totalPrice: data.unitPrice * parseInt(quantity),
                  discountRate: Math.round((1 - data.efficiency / 100) * 100),
                  priceBreak: multiQuantityState.comparison!.priceBreaks.find(pb => pb.quantity === parseInt(quantity))?.priceBreak || '通常',
                  leadTimeDays: result.leadTimeDays,
                  isValid: true
                }))}
                comparison={multiQuantityState.comparison!}
                selectedQuantity={state.quantity}
                onQuantitySelect={(quantity) => {
                  // Optional: Update selected quantity
                }}
              />
            </div>

          </div>
        </div>
      )}

      {/* Quantity Options Grid - 統合オプション選択UI */}
      <QuantityOptionsGrid
        options={quantityOptions}
        currentQuantity={state.quantity}
        currentUnitPrice={result.unitPrice}
        bagTypeId={state.bagTypeId}
        onSelectOption={handleQuantityChange}
      />


      {/* Price Breakdown */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">価格内訳</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>素材費:</span>
            <span>¥{result.breakdown.material.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>加工費:</span>
            <span>¥{result.breakdown.processing.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>印刷費:</span>
            <span>¥{result.breakdown.printing.toLocaleString()}</span>
          </div>
          {/* 配送費非表示 - ユーザーリクエストによりコメントアウト */}
          {/* <div className="flex justify-between text-sm">
            <span>配送費:</span>
            <span>¥{result.breakdown.delivery.toLocaleString()}</span>
          </div> */}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>合計:</span>
              <span>¥{result.breakdown.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* クーポン入力セクション */}
      <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Ticket className="w-5 h-5 mr-2 text-orange-600" />
          クーポン割引
        </h3>

        {!appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                placeholder="クーポンコード入力 (例: WELCOME5)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 uppercase"
                disabled={isVerifyingCoupon}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isVerifyingCoupon || !couponCode.trim()}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifyingCoupon ? '検証中...' : '適用'}
              </button>
            </div>
            {couponError && (
              <div className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {couponError}
              </div>
            )}
            <p className="text-xs text-gray-500">
              サンプルクーポン: WELCOME5 (5%割引), VIP10 (10%割引), FREESHIP (無料配送)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">{appliedCoupon.nameJa || appliedCoupon.name}</div>
                  <div className="text-sm text-green-700">
                    {appliedCoupon.type === 'percentage' && `${appliedCoupon.value}%割引`}
                    {appliedCoupon.type === 'fixed_amount' && `¥${appliedCoupon.value.toLocaleString()}割引`}
                    {appliedCoupon.type === 'free_shipping' && '無料配送'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-900">
                  -¥{appliedCoupon.discountAmount.toLocaleString()}
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-600 hover:text-red-700 underline mt-1"
                >
                  削除
                </button>
              </div>
            </div>
            {appliedCoupon.discountAmount > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="font-semibold text-gray-900">クーポン適用後金額:</span>
                <span className="font-bold text-lg text-green-600">¥{adjustedPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <motion.button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          新しい見積もり
        </motion.button>

        {/* PDF Download Button (Auto-saves to database) */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloadingPDF}
          className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center ${isDownloadingPDF
            ? 'bg-gray-400 cursor-not-allowed'
            : downloadStatusPDF === 'success'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : downloadStatusPDF === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-navy-700 hover:bg-navy-600 text-white'
            }`}
        >
          {isDownloadingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              PDF作成中...
            </>
          ) : downloadStatusPDF === 'success' ? (
            <>
              <Download className="w-4 h-4 mr-2" />
              PDF完了 (自動保存済み)
            </>
          ) : downloadStatusPDF === 'error' ? (
            <>
              <Download className="w-4 h-4 mr-2" />
              PDF失敗
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              PDFダウンロード (自動保存)
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
          見積を下書きとして保存しました。後でマイページから続きを行えます。
        </div>
      )}
      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
          見積を提出しました。管理者が確認次第、ご連絡いたします。
        </div>
      )}
    </div>
  );
}

// Real-time price display component
function RealTimePriceDisplay() {
  const state = useQuoteState();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'increase' | 'decrease' | 'stable'>('stable');
  const [quantityQuotes, setQuantityQuotes] = useState<Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountRate: number;
    parallelProduction?: {
      enabled?: boolean;
      optionNumber?: number;
      isRecommended: boolean;
      suggestedQuantity: number;
      savingsAmount: number;
      savingsPercentage: number;
    };
    priceBreak: string;
    minimumPriceApplied: boolean;
  }>>([]);

  const previousPriceRef = useRef<number | null>(null);
  const priceResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache key for all pricing-related state to prevent infinite loops
  const pricingCacheKey = useMemo(() => {
    return JSON.stringify({
      quantities: state.quantities || [],
      bagTypeId: state.bagTypeId,
      materialId: state.materialId,
      width: state.width,
      height: state.height,
      depth: state.depth,
      quantity: state.quantity,
      thicknessSelection: state.thicknessSelection,
      isUVPrinting: state.isUVPrinting,
      printingType: state.printingType,
      printingColors: state.printingColors,
      doubleSided: state.doubleSided,
      deliveryLocation: state.deliveryLocation,
      urgency: state.urgency
    });
  }, [
    state.quantities,
    state.bagTypeId,
    state.materialId,
    state.width,
    state.height,
    state.depth,
    state.quantity,
    state.thicknessSelection,
    state.isUVPrinting,
    state.printingType,
    state.printingColors,
    state.doubleSided,
    state.deliveryLocation,
    state.urgency
  ]);

  // Initialize previous price ref on mount
  useEffect(() => {
    if (currentPrice !== null && previousPriceRef.current === null) {
      previousPriceRef.current = currentPrice;
    }
  }, []);

  // Calculate real-time price whenever essential form data changes
  useEffect(() => {
    const calculatePrice = async () => {
      // Capture quantities at effect run time
      const quantities = state.quantities;
      const currentQuantity = state.quantity;

      // Basic validation before calculation
      if (!state.materialId || !state.bagTypeId || quantities.length === 0) {
        // Only update state if values are actually different
        setCurrentPrice(prev => prev !== null ? null : prev);
        setQuantityQuotes(prev => prev.length !== 0 ? [] : prev);
        return;
      }

      setIsCalculating(true);
      try {
        // Calculate quotes for all quantities using unified pricing engine
        const quotes: Array<{
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          discountRate: number;
          priceBreak: string;
          minimumPriceApplied: boolean;
        }> = [];

        for (const quantity of quantities) {
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            quantity: quantity,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            postProcessingOptions: state.postProcessingOptions,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            deliveryLocation: state.deliveryLocation,
            urgency: state.urgency,
            rollCount: state.rollCount // 롤 필름 시 롤 개수
          });

          // Determine price break and discount rate
          let discountRate = 0;
          let priceBreak = '小ロット';

          if (quantity >= 50000) {
            discountRate = 0.4;
            priceBreak = '大ロット';
          } else if (quantity >= 20000) {
            discountRate = 0.3;
            priceBreak = '中ロット';
          } else if (quantity >= 10000) {
            discountRate = 0.2;
            priceBreak = '標準ロット';
          } else if (quantity >= 5000) {
            discountRate = 0.1;
            priceBreak = '小ロット';
          }

          quotes.push({
            quantity: quantity,
            unitPrice: quoteResult.unitPrice,
            totalPrice: quoteResult.totalPrice,
            discountRate: Math.round(discountRate * 100),
            priceBreak: priceBreak,
            minimumPriceApplied: quoteResult.minimumPriceApplied || false
          });
        }

        // Set current price to the first (recommended) quantity - use a ref to avoid dependency issues
        const recommendedQuote = quotes.find(q => q.quantity === currentQuantity) || quotes[0];
        const previousPrice = previousPriceRef.current;

        // CRITICAL FIX: Only update state if values have actually changed
        // This prevents infinite re-render loops
        setCurrentPrice(prev => prev !== recommendedQuote.totalPrice ? recommendedQuote.totalPrice : prev);

        // Deep comparison for quotes array to prevent unnecessary updates
        setQuantityQuotes(prev => {
          const quotesChanged = quotes.length !== prev.length ||
            quotes.some((q, i) =>
              q.quantity !== prev[i]?.quantity ||
              q.totalPrice !== prev[i]?.totalPrice
            );
          return quotesChanged ? quotes : prev;
        });

        // Detect price change for animation using ref instead of state
        if (previousPrice && recommendedQuote.totalPrice > previousPrice) {
          setPriceChange('increase');
        } else if (previousPrice && recommendedQuote.totalPrice < previousPrice) {
          setPriceChange('decrease');
        } else {
          setPriceChange('stable');
        }

        // Reset animation after delay - clean up previous timeout
        if (previousPrice && recommendedQuote.totalPrice !== previousPrice) {
          if (priceResetTimeoutRef.current) {
            clearTimeout(priceResetTimeoutRef.current);
          }
          priceResetTimeoutRef.current = setTimeout(() => setPriceChange('stable'), 500);
        }

        // Update the ref with the new price
        previousPriceRef.current = recommendedQuote.totalPrice;
      } catch (error) {
        console.error('Price calculation error:', error);
        // Only update state if values are actually different
        setCurrentPrice(prev => prev !== null ? null : prev);
        setQuantityQuotes(prev => prev.length !== 0 ? [] : prev);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculatePrice, 300); // Debounce
    return () => {
      clearTimeout(timeoutId);
      // Also clean up the price reset timeout
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
        priceResetTimeoutRef.current = null;
      }
    };
  }, [pricingCacheKey]); // Single stable dependency - cache key includes all relevant state including quantities

  // Cleanup price reset timeout on unmount
  useEffect(() => {
    return () => {
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
      }
    };
  }, []);

  if (!currentPrice || quantityQuotes.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl p-6 text-center">
        <div className="text-slate-600 font-medium">オプションを選択して価格を計算</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">数量別お見積もり</h3>
          {isCalculating && (
            <div className="flex items-center text-sm text-navy-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              計算中...
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {quantityQuotes.map((quote, index) => (
          <div
            key={`${quote.quantity}-${index}`}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${quote.quantity === state.quantity
              ? 'border-brixa-600 bg-brixa-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {quote.quantity.toLocaleString()}枚
                  </span>
                  {quote.quantity === state.quantity && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brixa-100 text-brixa-800">
                      現在選択
                    </span>
                  )}
                  {quote.minimumPriceApplied && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      最低価格適用
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div>単価: ¥{quote.unitPrice.toLocaleString()}（税別）</div>
                  <div>{quote.priceBreak} ({quote.discountRate}%引)</div>
                </div>

                {quote.minimumPriceApplied && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                    最小注文価格（160,000円）が適用されました
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold mb-1 transition-all duration-500 ${quote.quantity === state.quantity && priceChange === 'increase' ? 'scale-105 text-green-600' :
                  quote.quantity === state.quantity && priceChange === 'decrease' ? 'scale-95 text-red-600' :
                    'text-gray-900'
                  }`}>
                  ¥{quote.totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">総費用（税別）</div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>素材: {state.materialId?.replace('_', ' ').toUpperCase()}</span>
            <span>タイプ: {state.bagTypeId?.replace('_', ' ')}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            サイズ: {state.bagTypeId === 'roll_film' ? `幅: ${state.width}` : `${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}`}mm
            {state.thicknessSelection && ` | 厚さ: ${getThicknessLabel(state.thicknessSelection)}`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Wizard Component
export function ImprovedQuotingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<UnifiedQuoteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const state = useQuoteState();
  const { dispatch, resetQuote } = useQuote();
  const { user } = useAuth();
  const isStepComplete = (step: string) => checkStepComplete(state, step);
  const { calculateMultiQuantity, canCalculateMultiQuantity } = useMultiQuantityQuote();

  // Toast notification system
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const currentStepId = STEPS[currentStep]?.id;

  const wizardRef = useRef<HTMLDivElement>(null);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // Calculate quote when moving from sku-quantity or quantity step to result step
      if (currentStepId === 'sku-quantity' || currentStepId === 'quantity') {
        setIsCalculating(true);
        try {
          // Debug logging
          console.log('[handleNext] Current state:', {
            quantityMode: state.quantityMode,
            skuCount: state.skuCount,
            skuQuantities: state.skuQuantities,
            quantity: state.quantity
          });

          // Determine total quantity for calculation
          let totalQuantity: number;
          let useSKUMode = false;

          // More robust SKU mode detection: check SKU count and quantities array validity
          // For roll_film: 1 SKU is enough (min 500m for 1 SKU, 300m for 2+ SKUs)
          // For pouch products: need 2+ SKUs (min 100 pieces each)
          const isRollFilm = state.bagTypeId === 'roll_film';
          const minQuantityPerSku = isRollFilm
            ? (state.skuCount === 1 ? 500 : 300)
            : 100;

          const hasValidSKUData = state.skuCount >= 1 &&
            state.skuQuantities &&
            state.skuQuantities.length === state.skuCount &&
            state.skuQuantities.every(qty => qty && qty >= minQuantityPerSku);

          // Debug logging for SKU mode detection
          console.log('[handleNext] hasValidSKUData Check:');
          console.log('[handleNext] - skuCount > 1:', state.skuCount > 1, '(skuCount =', state.skuCount, ')');
          console.log('[handleNext] - skuQuantities exists:', !!state.skuQuantities);
          console.log('[handleNext] - skuQuantities:', state.skuQuantities);
          console.log('[handleNext] - Length check:', state.skuQuantities?.length, '===', state.skuCount, ':', state.skuQuantities?.length === state.skuCount);
          console.log('[handleNext] - Every check (all >= 100):', state.skuQuantities?.every(qty => qty && qty >= 100));
          console.log('[handleNext] - FINAL hasValidSKUData:', hasValidSKUData);

          if (currentStepId === 'sku-quantity' && hasValidSKUData) {
            // SKU mode: sum all SKU quantities
            console.log('[handleNext] SKU mode detected (via hasValidSKUData), quantities:', state.skuQuantities);

            // Ensure quantityMode is set to 'sku' for downstream components
            if (state.quantityMode !== 'sku') {
              console.log('[handleNext] Setting quantityMode to "sku"');
              dispatch({ type: 'SET_QUANTITY_MODE', payload: 'sku' });
            }

            totalQuantity = state.skuQuantities.reduce((sum, qty) => sum + (qty || 0), 0);
            console.log('[handleNext] Calculated total quantity:', totalQuantity);
            useSKUMode = true;
          } else {
            // Single quantity mode
            console.log('[handleNext] Single quantity mode (hasValidSKUData:', hasValidSKUData, ')');
            totalQuantity = state.quantity || state.quantities[0] || 1000;
            console.log('[handleNext] Single quantity mode, quantity:', totalQuantity);
          }

          console.log(`[handleNext] Calculating quote for ${useSKUMode ? 'SKU' : 'single'} mode, total quantity: ${totalQuantity}`);

          // Get customer-specific markup rate (if logged in)
          let markupRate = 0.5; // Default 50%
          if (user?.id) {
            try {
              markupRate = await getCustomerMarkupRate(user.id);
              console.log('[handleNext] Customer markup rate:', markupRate);
            } catch (error) {
              console.warn('[handleNext] Failed to fetch markup rate, using default 50%:', error);
            }
          }

          // Calculate quote with SKU mode if applicable
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            quantity: totalQuantity,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            postProcessingOptions: state.postProcessingOptions,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            deliveryLocation: state.deliveryLocation || 'domestic',
            urgency: state.urgency || 'standard',
            // Customer-specific markup rate
            markupRate: markupRate,
            // SKU mode parameters - Always use SKU Calculation (PouchCostCalculator) for accuracy
            useSKUCalculation: true,
            skuQuantities: useSKUMode ? state.skuQuantities : [totalQuantity],
            // Roll film specific parameters (materialWidthはQuoteContextで動的に決定)
            materialWidth: state.materialWidth,
            filmLayers: state.filmLayers
          });

          console.log('[handleNext] Quote calculation result:', quoteResult);

          // Enhance result with mode-specific information
          const enhancedResult = {
            ...quoteResult,
            ...(useSKUMode ? {
              skuMode: true,
              skuCount: state.skuCount,
              skuQuantities: state.skuQuantities,
              skuNames: state.skuNames,
              totalQuantities: totalQuantity,
              hasValidSKUData: true,
              displayQuantities: state.skuQuantities
            } : {
              hasValidSKUData: false,
              displayQuantities: [state.quantity],
              quantities: state.quantities,
              skuQuantities: [state.quantity],
              totalQuantities: state.quantities?.reduce((sum, qty) => sum + qty, 0) || state.quantity
            })
          };

          console.log('[handleNext] Enhanced result:', enhancedResult);
          console.log('[handleNext] Setting result with hasValidSKUData:', enhancedResult.hasValidSKUData);
          console.log('[handleNext] Setting result with skuQuantities:', enhancedResult.skuQuantities);
          setResult(enhancedResult);

          // Force state update before changing step
          await new Promise(resolve => setTimeout(resolve, 0));

          console.log('[handleNext] About to change step to result');
          setCurrentStep(currentStep + 1);
          // Scroll to top after showing results
          setTimeout(() => {
            wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } catch (error) {
          console.error('Quote calculation failed:', error);
          showError('見積もり計算でエラーが発生しました。もう一度お試しください。');
        } finally {
          setIsCalculating(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
        // Scroll to top of next step
        setTimeout(() => {
          wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when going back
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleReset = () => {
    console.log('Reset button clicked - resetting quote');
    try {
      resetQuote();
      setCurrentStep(0);
      setResult(null);
      console.log('Quote reset completed');
      // Scroll to top after reset
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error during quote reset:', error);
      showError('リセット中にエラーが発生しました。もう一度お試しください。');
    }
  };

  const canProceed = currentStepId ? isStepComplete(currentStepId) : false;
  const isLastStep = currentStep === STEPS.length - 1;

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: canProceed ? handleNext : undefined,
    onPrevious: currentStep > 0 ? handleBack : undefined,
    onDismiss: () => {
      toasts.forEach(toast => dismissToast(toast.id));
    },
    onConfirm: canProceed ? handleNext : undefined,
    canProceed,
    canGoBack: currentStep > 0,
  });

  // Focus management on step change
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      // Focus the first heading or input after step change
      setTimeout(() => {
        const focusable = wizardRef.current?.querySelector('h1, h2, h3, input, button') as HTMLElement;
        if (focusable) {
          focusable.focus({ preventScroll: true });
        }
      }, 100);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" role="main">
      {/* Error Toast Notifications */}
      <ErrorToast toasts={toasts} onDismiss={dismissToast} />

      <div ref={wizardRef} className="max-w-7xl mx-auto p-4 lg:p-8" id="quote-wizard-content">

        {/* Enhanced Progress Bar - Removed duplicate header title */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div role="progressbar" aria-valuenow={Math.round(((currentStep + 1) / STEPS.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="見積もり作成の進捗状況">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">進捗状況</span>
              <span className="text-sm font-bold text-navy-700" aria-live="polite">
                {Math.round(((currentStep + 1) / STEPS.length) * 100)}% 完了
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-navy-600 to-navy-700 h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Keyboard Shortcuts Hint - Desktop only */}
            <KeyboardShortcutsHint className="mb-4" />

            {/* Step Indicators - Responsive */}
            <ResponsiveStepIndicators
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={(index) => {
                if (index < currentStep) setCurrentStep(index);
              }}
              isStepCompleted={(index) => index < currentStep || (result && index === STEPS.length - 1)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation - Desktop */}
          <div className="xl:col-span-1 lg:block">
            <div className="sticky top-6 space-y-4">
              {/* Envelope Preview */}
              <EnvelopePreview
                bagTypeId={state.bagTypeId}
                dimensions={{
                  width: state.width,
                  height: state.height,
                  depth: state.depth
                }}
              />

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">手順</h2>
                <nav className="space-y-3">
                  {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep || (result && index === STEPS.length - 1);
                    const StepIcon = step.icon;

                    return (
                      <button
                        key={step.id}
                        onClick={() => index < currentStep && setCurrentStep(index)}
                        disabled={index > currentStep}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${isActive
                          ? 'bg-navy-100 border-2 border-navy-600 shadow-md'
                          : isCompleted
                            ? 'bg-green-50 border-2 border-green-300 text-green-800 hover:bg-green-100'
                            : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isActive
                          ? 'bg-navy-600 text-white'
                          : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-500'
                          }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${isActive ? 'text-navy-900' : isCompleted ? 'text-green-800' : 'text-gray-400'}`}>
                            {step.title}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-navy-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {step.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

            </div>
          </div>

          {/* Main Step Content */}
          <div className="lg:col-span-3">
            {/* Mobile Real-time Price Display */}
            <div className="lg:hidden mb-6">
              <RealTimePriceDisplay />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8">
              {/* Step Content */}
              {currentStepId === 'specs' && <SpecsStep />}
              {currentStepId === 'post-processing' && <PostProcessingStep />}
              {currentStepId === 'sku-quantity' && <UnifiedSKUQuantityStep />}
              {currentStepId === 'result' && result && <ResultStep result={result} onReset={handleReset} onResultUpdate={setResult} />}

              {/* Navigation Buttons */}
              {currentStepId !== 'result' && (
                <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 font-medium rounded-lg transition-all flex items-center justify-center w-full sm:w-auto ${currentStep === 0
                      ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                      }`}
                    aria-label="前のステップに戻る"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    戻る
                  </button>

                  <motion.button
                    onClick={handleNext}
                    disabled={!canProceed || isCalculating}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center relative shadow-lg w-full sm:w-auto border-2 ${!canProceed || isCalculating
                      ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-blue-700 border-blue-800 hover:bg-blue-800 hover:border-blue-900 hover:shadow-xl'
                      }`}
                    style={!canProceed || isCalculating ? {} : {
                      backgroundColor: '#1e3a8a',
                      borderColor: '#1e40af',
                      color: '#FFFFFF !important'
                    }}
                    aria-label={isLastStep ? "見積もりを完了する" : "次のステップに進む"}
                    whileHover={canProceed && !isCalculating ? {
                      scale: 1.02,
                      backgroundColor: '#1e40af',
                      borderColor: '#1e3a8a'
                    } : {}}
                    whileTap={canProceed && !isCalculating ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="relative flex items-center" style={{
                      color: !canProceed || isCalculating ? 'inherit' : '#FFFFFF',
                      fontWeight: 'bold'
                    }}>
                      {isCalculating ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                            style={{
                              borderColor: !canProceed || isCalculating ? 'currentColor' : '#FFFFFF',
                              borderTopColor: 'transparent'
                            }}
                          />
                          <span style={{ color: !canProceed || isCalculating ? 'inherit' : '#FFFFFF' }}>
                            計算中...
                          </span>
                        </>
                      ) : isLastStep ? (
                        <>
                          <Check className="w-4 h-4 mr-2" style={{ color: !canProceed || isCalculating ? 'inherit' : '#FFFFFF' }} />
                          <span style={{ color: !canProceed || isCalculating ? 'inherit' : '#FFFFFF' }}>
                            見積もりを完了
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ color: !canProceed || isCalculating ? 'inherit' : '#FFFFFF' }}>
                            次へ
                          </span>
                          <ChevronRight className="w-4 h-4 ml-2" style={{ color: !canProceed || isCalculating ? 'inherit' : '#FFFFFF' }} />
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content spacer for mobile bottom bar */}
        <div className="h-32 lg:hidden" aria-hidden="true" />

        {/* Bottom Action Boxes - Fixed Position */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-4">

            {/* Mobile Price Display */}
            {result && (
              <div className="lg:hidden mb-3 p-3 bg-gradient-to-r from-navy-50 to-blue-50 rounded-lg border-2 border-navy-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-700">見積もり価格</span>
                  <span className="text-xl font-bold text-navy-900">
                    ¥{result.totalPrice.toLocaleString()}
                    <span className="text-xs text-navy-600 ml-1">税込</span>
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Optimized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">

              {/* 総合見積りツール */}
              <button
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 text-left"
                aria-label="総合見積りツール - すべてのオプションを網羅した詳細見積を表示"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-900 text-sm lg:text-base truncate">総合見積りツール</h3>
                    <p className="text-xs lg:text-sm text-blue-700 hidden sm:block">すべてのオプションを網羅した詳細見積</p>
                  </div>
                </div>
              </button>

              {/* 詳細見積もり */}
              <button
                className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-300 text-left"
                aria-label="詳細見積もり - 仕様別の価格比較と分析を表示"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-900 text-sm lg:text-base truncate">詳細見積もり</h3>
                    <p className="text-xs lg:text-sm text-green-700 hidden sm:block">仕様別の価格比較と分析</p>
                  </div>
                </div>
              </button>

              {/* 即時相談 */}
              <a
                href="tel:+81-80-6942-7235"
                className="bg-gradient-to-r from-navy-600 to-navy-700 text-white border-2 border-navy-600 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-navy-300 text-left sm:col-span-2 lg:col-span-1"
                aria-label="即時相談 - 専門家との無料相談。電話番号: +81-80-6942-7235"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base truncate">即時相談</h3>
                    <p className="text-xs lg:text-sm text-white/90 hidden sm:block">専門家との無料相談 +81-80-6942-7235</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Contact Info Bar - Mobile Optimized */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-600">
                  <a
                    href="tel:+81-80-6942-7235"
                    className="flex items-center space-x-2 hover:text-navy-700 transition-colors"
                    aria-label="電話番号: +81-80-6942-7235"
                  >
                    <Phone className="w-4 h-4 text-navy-600" />
                    <span className="font-medium">+81-80-6942-7235</span>
                  </a>
                  <a
                    href="mailto:info@epackage-lab.com"
                    className="flex items-center space-x-2 hover:text-navy-700 transition-colors"
                    aria-label="メールアドレス: info@epackage-lab.com"
                  >
                    <Mail className="w-4 h-4 text-navy-600" />
                    <span className="font-medium hidden sm:inline">info@epackage-lab.com</span>
                    <span className="font-medium sm:hidden">メール</span>
                  </a>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-navy-600" />
                    <span className="text-xs">平日 9:00-18:00 (JST)</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center lg:text-right">
                  © 2025 Epackage Lab. 全著作権所有.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-48" />

      </div>
    </div>
  );
}
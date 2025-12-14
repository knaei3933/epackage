'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuote } from '@/contexts/QuoteContext';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { unifiedPricingEngine, UnifiedQuoteResult, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import EnvelopePreview from './EnvelopePreview';
import MultiQuantityStep from './MultiQuantityStep';
import MultiQuantityComparisonTable from './MultiQuantityComparisonTable';
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
  AlertCircle,
  Package,
  Layers,
  Printer,
  Calendar,
  Settings,
  Truck,
  Info,
  Edit2,
  X,
  Phone,
  Mail,
  Clock,
  Calculator,
  RefreshCw,
  BarChart3
} from 'lucide-react';

// Step configuration
const STEPS = [
  { id: 'specs', title: '基本仕様', icon: Package, description: 'サイズ・素材・厚さ' },
  { id: 'quantity', title: '数量・印刷', icon: Layers, description: '数量と印刷オプション' },
  { id: 'post-processing', title: '後加工', icon: Settings, description: '追加仕様' },
  { id: 'delivery', title: '配送・納期', icon: Truck, description: '配送方法と納期' },
  { id: 'result', title: '見積結果', icon: Calendar, description: '価格詳細' }
];

// Component for each step
function SpecsStep() {
  const { state, updateBasicSpecs, getStepSummary, isStepComplete } = useQuote();

  // Determine if gusset (マチ) should be shown based on bag type
  const shouldShowGusset = () => {
    // Don't show gusset for flat_3_side and roll_film
    return state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
  };

  // Enhanced bag type options with images
  const bagTypes = [
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
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+ポリエチレン60μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 60μ',
          weightRange: '~100g',
          multiplier: 0.9
        },
        {
          id: 'medium',
          name: '標準タイプ (~500g)',
          nameJa: '標準タイプ (~500g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+ポリエチレン80μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 80μ',
          weightRange: '~500g',
          multiplier: 1.0
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+ポリエチレン100μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 100μ',
          weightRange: '~800g',
          multiplier: 1.1
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+ポリエチレン110μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 110μ',
          weightRange: '800g~',
          multiplier: 1.2
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
          specification: 'ポリエステル12μ+アルミ蒸着7μ+ポリエステル12μ+ポリエチレン60μ',
          specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + PE 60μ',
          weightRange: '~100g',
          multiplier: 0.9
        },
        {
          id: 'medium',
          name: '標準タイプ (~500g)',
          nameJa: '標準タイプ (~500g)',
          specification: 'ポリエステル12μ+アルミ蒸着7μ+ポリエステル12μ+ポリエチレン80μ',
          specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + PE 80μ',
          weightRange: '~500g',
          multiplier: 1.0
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+アルミ蒸着7μ+ポリエステル12μ+ポリエチレン100μ',
          specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + PE 100μ',
          weightRange: '~800g',
          multiplier: 1.1
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
          id: 'medium',
          name: '標準タイプ (~500g)',
          nameJa: '標準タイプ (~500g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン110μ',
          specificationEn: 'PET 12μ + LLDPE 110μ',
          weightRange: '~500g',
          multiplier: 1.0
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン120μ',
          specificationEn: 'PET 12μ + LLDPE 120μ',
          weightRange: '~800g',
          multiplier: 1.1
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+直押出ポリエチレン130μ',
          specificationEn: 'PET 12μ + LLDPE 130μ',
          weightRange: '800g~',
          multiplier: 1.2
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
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+ポリエチレン60μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + PE 60μ',
          weightRange: '~100g',
          multiplier: 0.9
        },
        {
          id: 'medium',
          name: '標準タイプ (~500g)',
          nameJa: '標準タイプ (~500g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+ポリエチレン80μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + PE 80μ',
          weightRange: '~500g',
          multiplier: 1.0
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+ポリエチレン100μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + PE 100μ',
          weightRange: '~800g',
          multiplier: 1.1
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
                  className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                    state.bagTypeId === type.id
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
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                      <img
                        src={type.image}
                        alt={type.nameJa}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            // Create fallback icon
                            parent.innerHTML = `
                              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">高さ</label>
                <input
                  type="number"
                  min="50"
                  value={state.height}
                  onChange={(e) => updateBasicSpecs({ height: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="300"
                />
              </div>
              {shouldShowGusset() && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">マチ</label>
                  <input
                    type="number"
                    min="0"
                    value={state.depth}
                    onChange={(e) => updateBasicSpecs({ depth: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Material Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">素材</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(material => (
                <button
                  key={material.id}
                  onClick={() => updateBasicSpecs({ materialId: material.id })}
                  className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                    state.materialId === material.id
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
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              !isSelected && isRequired ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
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
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                      state.thicknessSelection === thickness.id
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
  const { state, updatePostProcessing, getStepSummary } = useQuote();

  const postProcessingOptions = [
    {
      id: 'zipper-yes',
      name: 'ジッパー付き',
      multiplier: 1.15,
      description: '再利用可能なジッパー付き',
      detailedDescription: '開閉が容易なジッパーを装着。内容物の新鮮度保持と再利用性を向上させます。',
      previewImage: '/images/post-processing/1.지퍼 있음.png',
      features: ['再利用可能', '気密性維持', '開閉簡単']
    },
    {
      id: 'zipper-no',
      name: 'ジッパーなし',
      multiplier: 1.0,
      description: '一回使用のシールトップ',
      detailedDescription: 'シンプルなシール構造でコスト効率に優れています。',
      previewImage: '/images/post-processing/1.지퍼 없음.png',
      features: ['コスト効率', 'シンプル構造', '安全閉鎖']
    },
    {
      id: 'glossy',
      name: '光沢仕上げ',
      multiplier: 1.08,
      description: '高光沢のプレミアム仕上げ',
      detailedDescription: '高光沢表面処理で視覚的な魅力と色彩の鮮やかさを高めます。',
      previewImage: '/images/post-processing/2.유광.png',
      features: ['プレミアム外観', '色彩強化', 'プロの見た目']
    },
    {
      id: 'matte',
      name: 'マット仕上げ',
      multiplier: 1.05,
      description: '光沢のないエレガントな表面',
      detailedDescription: '高級感のあるマット調表面処理。光沢を抑え、指紋が目立ちにくくなります。',
      previewImage: '/images/post-processing/2.무광.png',
      features: ['エレガント外観', 'グレア軽減', '指紋防止']
    },
    {
      id: 'notch-yes',
      name: 'ノッチ付き',
      multiplier: 1.03,
      description: '開封しやすいノッチ付き',
      detailedDescription: '手で簡単に開封できるノッチ加工。スナック包装に適しています。',
      previewImage: '/images/post-processing/3.노치 있음.png',
      features: ['手で簡単開封', '清潔な切断', '工具不要']
    },
    {
      id: 'notch-no',
      name: 'ノッチなし',
      multiplier: 1.0,
      description: 'ノッチなしのクリーンエッジ',
      detailedDescription: 'ノッチなしのクリーンなエッジデザイン。',
      previewImage: '/images/post-processing/3.노치 없음.png',
      features: ['クリーンデザイン', 'シンプルエッジ', '標準仕上げ']
    },
    {
      id: 'hang-hole-6mm',
      name: '吊り下げ穴 (6mm)',
      multiplier: 1.03,
      description: '軽量製品用の6mm小さな吊り穴',
      detailedDescription: '店舗での吊り下げ陳列に最適な6mm穴加工。軽量製品に適しています。',
      previewImage: '/images/post-processing/4.걸이타공 있음.png',
      features: ['陳列効率UP', '省スペース', '小さいサイズ']
    },
    {
      id: 'hang-hole-8mm',
      name: '吊り下げ穴 (8mm)',
      multiplier: 1.04,
      description: '標準製品用の8mm大きな吊り穴',
      detailedDescription: 'やや大きめの8mm穴加工。太い吊り下げ器具にも対応可能です。',
      previewImage: '/images/post-processing/4.걸이타공 있음.png',
      features: ['陳列効率UP', '多用途', '標準サイズ']
    },
    {
      id: 'hang-hole-no',
      name: '吊り穴なし',
      multiplier: 1.0,
      description: '吊り穴なしのクリーンなデザイン',
      detailedDescription: '吊り穴なしのクリーンなデザイン。',
      previewImage: '/images/post-processing/4.걸이타공 없음.png',
      features: ['クリーン外観', 'シンプルデザイン', '標準仕上げ']
    },
    {
      id: 'corner-round',
      name: '角丸',
      multiplier: 1.06,
      description: '安全でモダンな角丸加工',
      detailedDescription: 'パッケージの角を丸く加工。安全性を高め、モダンな印象を与えます。',
      previewImage: '/images/post-processing/5.모서리_둥근.png',
      features: ['安全性向上', 'モダン外観', '手当たり良好']
    },
    {
      id: 'corner-square',
      name: '角直角',
      multiplier: 1.0,
      description: '伝統的な直角デザイン',
      detailedDescription: '伝統的な直角デザインで最大スペースを確保できます。',
      previewImage: '/images/post-processing/5.모서리_직각.png',
      features: ['伝統外観', '最大スペース', 'クラシックデザイン']
    },
    {
      id: 'valve-yes',
      name: 'バルブ付き',
      multiplier: 1.08,
      description: 'コーヒー製品用の一方弁付き',
      detailedDescription: '空気を逃がす一方通行バルブ。コーヒー豆などの脱ガスが必要な製品に最適です。',
      previewImage: '/images/post-processing/밸브 있음.png',
      features: ['脱ガス機能', '湿気防止', '鮮度保持']
    },
    {
      id: 'valve-no',
      name: 'バルブなし',
      multiplier: 1.0,
      description: 'バルブなしの標準パウチ',
      detailedDescription: 'バルブなしの標準パウチ構造。',
      previewImage: '/images/post-processing/밸브 없음.png',
      features: ['シンプル構造', 'コスト効率', '標準デザイン']
    },
    {
      id: 'top-open',
      name: '上端開封',
      multiplier: 1.02,
      description: '使いやすい上端開封シール',
      detailedDescription: '開封しやすい上端デザイン。使いやすさを重視した製品に適しています。',
      previewImage: '/images/post-processing/6.상단 오픈.png',
      features: ['アクセス容易', '便利分配', 'ユーザーフレンドリー']
    },
    {
      id: 'bottom-open',
      name: '下端開封',
      multiplier: 1.03,
      description: '製品を完全に排出する下端開封',
      detailedDescription: '製品を完全に排出できる下端開封。産業用途に適しています。',
      previewImage: '/images/post-processing/6.하단 오픈.png',
      features: ['完全空にする', '無駄なし', '産業用途']
    }
  ];

  // ジッパー位置選択肢
  const zipperPositionOptions = [
    {
      id: 'zipper-position-any',
      name: 'ジッパー位置: お任せ',
      multiplier: 0,
      description: 'メーカーが最適な位置を決定',
      detailedDescription: '専門家が製造工程に最適なジッパー位置を決定します。',
      previewImage: '/images/post-processing/1.지퍼 있음.png'
    },
    {
      id: 'zipper-position-specified',
      name: 'ジッパー位置: 指定',
      multiplier: 1.05,
      description: 'お客様が位置を指定',
      detailedDescription: 'お客様のご指定位置にジッパーを配置します。追加費用がかかります。',
      previewImage: '/images/post-processing/1.지퍼 있음.png'
    }
  ];

  const toggleOption = (optionId: string, multiplier: number) => {
    const currentOptions = state.postProcessingOptions || [];

    // Define mutually exclusive option groups
    const exclusiveGroups: Record<string, string[]> = {
      'zipper-yes': ['zipper-no'],
      'zipper-no': ['zipper-yes'],
      'glossy': ['matte'],
      'matte': ['glossy'],
      'notch-yes': ['notch-no'],
      'notch-no': ['notch-yes'],
      'hang-hole-6mm': ['hang-hole-8mm', 'hang-hole-no'],
      'hang-hole-8mm': ['hang-hole-6mm', 'hang-hole-no'],
      'hang-hole-no': ['hang-hole-6mm', 'hang-hole-8mm'],
      'corner-round': ['corner-square'],
      'corner-square': ['corner-round'],
      'valve-yes': ['valve-no'],
      'valve-no': ['valve-yes'],
      'top-open': ['bottom-open'],
      'bottom-open': ['top-open']
    };

    let newOptions: string[];

    if (currentOptions.includes(optionId)) {
      // If deselecting, simply remove the option
      newOptions = currentOptions.filter(id => id !== optionId);
    } else {
      // If selecting, remove mutually exclusive options first
      const exclusiveOptions = exclusiveGroups[optionId] || [];
      newOptions = [
        ...currentOptions.filter(id => !exclusiveOptions.includes(id)),
        optionId
      ];
    }

    // Calculate total multiplier (including zipper position options)
    const allOptions = [...zipperPositionOptions, ...postProcessingOptions];
    const totalMultiplier = newOptions.reduce((acc, id) => {
      const option = allOptions.find(opt => opt.id === id);
      return acc + (option ? option.multiplier - 1 : 0);
    }, 1.0);

    updatePostProcessing(newOptions, totalMultiplier);
  };

  // Helper function to check for conflicts
  const getConflictingOptions = (optionId: string): string[] => {
    const exclusiveGroups: Record<string, string[]> = {
      'zipper-yes': ['zipper-no'],
      'zipper-no': ['zipper-yes'],
      'glossy': ['matte'],
      'matte': ['glossy'],
      'notch-yes': ['notch-no'],
      'notch-no': ['notch-yes'],
      'hang-hole-6mm': ['hang-hole-8mm', 'hang-hole-no'],
      'hang-hole-8mm': ['hang-hole-6mm', 'hang-hole-no'],
      'hang-hole-no': ['hang-hole-6mm', 'hang-hole-8mm'],
      'corner-round': ['corner-square'],
      'corner-square': ['corner-round'],
      'valve-yes': ['valve-no'],
      'valve-no': ['valve-yes'],
      'top-open': ['bottom-open'],
      'bottom-open': ['top-open']
    };

    const currentOptions = state.postProcessingOptions || [];
    return (exclusiveGroups[optionId] || []).filter(opt => currentOptions.includes(opt));
  };

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
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">数量・印刷</h3>
            </div>
            {getStepSummary('quantity')}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            追加の後加工オプションを選択してください（オプション）
          </p>

          <div className="space-y-4">
            {postProcessingOptions.map(option => {
              const conflictingOptions = getConflictingOptions(option.id);

              return (
              <div
                key={option.id}
                className={`border-2 rounded-lg overflow-hidden transition-all relative ${
                  state.postProcessingOptions?.includes(option.id)
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                    : conflictingOptions.length > 0
                    ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                }`}
              >
                {state.postProcessingOptions?.includes(option.id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                {conflictingOptions.length > 0 && !state.postProcessingOptions?.includes(option.id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toggleOption(option.id, option.multiplier)}
                  className="w-full text-left"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{option.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>

                        {/* Conflict Warning */}
                        {conflictingOptions.length > 0 && !state.postProcessingOptions?.includes(option.id) && (
                          <div className="mb-2 p-2 bg-amber-100 border border-amber-200 rounded">
                            <div className="text-xs text-amber-800 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="font-medium">競合オプション:</span> {conflictingOptions.map(id => {
                                const conflictOption = postProcessingOptions.find(opt => opt.id === id);
                                return conflictOption ? conflictOption.name : id;
                              }).join(', ')}
                            </div>
                            <div className="text-xs text-amber-700 mt-1">
                              選択すると現在のオプションは除外されます
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {option.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs text-navy-600 font-medium">
                          倍率: ×{option.multiplier}
                        </div>
                      </div>

                      {/* Preview Image */}
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={option.previewImage}
                            alt={option.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/pouch.png';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Description (shown when selected) */}
                  {state.postProcessingOptions?.includes(option.id) && (
                    <div className="px-4 pb-4 border-t border-navy-200">
                      <div className="pt-3 text-sm text-gray-700 bg-white rounded p-3">
                        <Info className="w-4 h-4 text-navy-600 mr-1 inline mb-1" />
                        {option.detailedDescription}
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )
            })}
          </div>
        </div>

        {/* ジッパー位置選択 */}
        {state.postProcessingOptions?.includes('zipper-yes') && (
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
                  onClick={() => toggleOption(position.id, position.multiplier)}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                    state.postProcessingOptions?.includes(position.id)
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

        {state.postProcessingMultiplier > 1.0 && (
          <div className="p-3 bg-navy-50 rounded-lg border border-navy-200">
            <div className="text-sm text-navy-700">
              <span className="font-medium">後加工倍率:</span> ×{state.postProcessingMultiplier.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeliveryStep() {
  const { state, updateDelivery, getStepSummary } = useQuote();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Truck className="w-5 h-5 mr-2 text-navy-600" />
          配送と納期
        </h2>

        {/* Previous Steps Summary */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">基本仕様</h3>
            </div>
            {getStepSummary('specs')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">数量・印刷</h3>
            </div>
            {getStepSummary('quantity')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">後加工</h3>
            </div>
            {getStepSummary('post-processing')}
          </div>
        </div>

        {/* Delivery Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">配送先</label>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => updateDelivery('domestic', state.urgency || 'standard')}
              className={`p-4 border-2 rounded-lg text-center transition-all relative overflow-hidden ${
                state.deliveryLocation === 'domestic'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {state.deliveryLocation === 'domestic' && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div className="font-medium text-gray-900">国内配送</div>
              <div className="text-sm text-gray-500 mt-1">日本国内</div>
            </motion.button>
            <motion.button
              onClick={() => updateDelivery('international', state.urgency || 'standard')}
              className={`p-4 border-2 rounded-lg text-center transition-all relative overflow-hidden ${
                state.deliveryLocation === 'international'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {state.deliveryLocation === 'international' && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div className="font-medium text-gray-900">国際配送</div>
              <div className="text-sm text-gray-500 mt-1">海外配送</div>
            </motion.button>
          </div>
        </div>

        {/* Urgency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">納期の希望</label>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => updateDelivery(state.deliveryLocation || 'domestic', 'standard')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                state.urgency === 'standard'
                  ? 'border-navy-700 bg-navy-50'
                  : 'border-gray-200 hover:border-navy-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="font-medium text-gray-900">標準</div>
              <div className="text-sm text-gray-500 mt-1">最短4〜5週間</div>
            </motion.button>
            <motion.button
              onClick={() => updateDelivery(state.deliveryLocation || 'domestic', 'express')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                state.urgency === 'express'
                  ? 'border-navy-700 bg-navy-50'
                  : 'border-gray-200 hover:border-navy-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="font-medium text-gray-900">特急</div>
              <div className="text-sm text-gray-500 mt-1">最短3週間</div>
            </motion.button>
          </div>
        </div>
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
    'hanging_hole-6mm': '吊り下げ穴 (6mm)',
    'hanging_hole-8mm': '吊り下げ穴 (8mm)',
    'zipper-position-delegate': 'ジッパー位置 (お任せ)',
    'zipper-position-specify': 'ジッパー位置 (指定)'
  };
  return postProcessingLabels[optionId] || optionId.replace('_', ' ');
}

function ResultStep({ result, onReset }: { result: UnifiedQuoteResult; onReset: () => void }) {
  const { state } = useQuote();
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
            {multiQuantityQuotes.map((quote) => (
              <div key={quote.quantity} className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-sm font-medium mb-1">{quote.quantity.toLocaleString()}個</div>
                <div className="text-xl font-bold">¥{quote.totalPrice.toLocaleString()}</div>
                <div className="text-xs opacity-90 mt-1">
                  単価: ¥{quote.unitPrice.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          {multiQuantityState.comparison && (
            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <div className="text-sm opacity-90">
                最適数量: <span className="font-bold">{multiQuantityState.comparison.bestValue.quantity.toLocaleString()}個</span>
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
            単価: ¥{result.unitPrice.toLocaleString()} / 最小注文数: {result.minOrderQuantity.toLocaleString()}個
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注文内容の確認</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">基本仕様</h4>
            <div className="text-sm space-y-1 text-gray-600">
              <div>タイプ: {getBagTypeLabel(state.bagTypeId)}</div>
              <div>素材: {getMaterialDescription(state.materialId, 'ja')}</div>
              <div>サイズ: {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`} mm</div>
              {state.thicknessSelection && <div>厚さ: {state.thicknessSelection}</div>}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">数量・印刷</h4>
            <div className="text-sm space-y-1 text-gray-600">
              <div>数量: {state.quantity.toLocaleString()}個</div>
              <div>印刷: {state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</div>
              <div>色数: {state.printingColors} {state.doubleSided && '(両面)'}</div>
            </div>
          </div>
        </div>

        {state.postProcessingOptions && state.postProcessingOptions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">後加工</h4>
            <div className="text-sm text-gray-600">
              {state.postProcessingOptions.map(option => (
                <span key={option} className="mr-2">
                  {getPostProcessingLabel(option)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">配送・納期</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>配送先: {state.deliveryLocation === 'domestic' ? '国内' : '海外'}</div>
            <div>納期: {state.urgency === 'standard' ? '標準' : '迅速'}（{result.leadTimeDays}日）</div>
          </div>
        </div>
      </div>

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
                  {multiQuantityState.comparison.bestValue.quantity.toLocaleString()}個
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
                  {multiQuantityState.comparison.trends.optimalQuantity.toLocaleString()}個
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
          <div className="flex justify-between text-sm">
            <span>セットアップ費:</span>
            <span>¥{result.breakdown.setup.toLocaleString()}</span>
          </div>
          {result.breakdown.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>数量割引:</span>
              <span>−¥{result.breakdown.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>配送費:</span>
            <span>¥{result.breakdown.delivery.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>合計:</span>
              <span>¥{result.breakdown.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
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
        <button className="px-8 py-3 bg-navy-700 text-white rounded-lg font-medium hover:bg-navy-600 transition-colors">
          見積もりを保存
        </button>
      </div>
    </div>
  );
}

// Real-time price display component
function RealTimePriceDisplay() {
  const { state } = useQuote();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'increase' | 'decrease' | 'stable'>('stable');
  const [quantityQuotes, setQuantityQuotes] = useState<Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountRate: number;
    priceBreak: string;
    minimumPriceApplied: boolean;
  }>>([]);

  const previousPriceRef = useRef<number | null>(null);

  // Initialize previous price ref on mount
  useEffect(() => {
    if (currentPrice !== null && previousPriceRef.current === null) {
      previousPriceRef.current = currentPrice;
    }
  }, []);

  // Create a stable key for quantities to prevent unnecessary re-calculations
  const quantitiesKey = useMemo(() => {
    return JSON.stringify(state.quantities.slice().sort());
  }, [state.quantities]);

  // Memoize calculation dependencies to prevent unnecessary re-calculations
  const calculationDependencies = useMemo(() => ({
    bagTypeId: state.bagTypeId,
    materialId: state.materialId,
    width: state.width,
    height: state.height,
    depth: state.depth,
    quantities: state.quantities,
    quantitiesKey,
    thicknessSelection: state.thicknessSelection,
    isUVPrinting: state.isUVPrinting,
    printingType: state.printingType,
    printingColors: state.printingColors,
    doubleSided: state.doubleSided,
    deliveryLocation: state.deliveryLocation,
    urgency: state.urgency
  }), [
    state.bagTypeId,
    state.materialId,
    state.width,
    state.height,
    state.depth,
    quantitiesKey,
    state.thicknessSelection,
    state.isUVPrinting,
    state.printingType,
    state.printingColors,
    state.doubleSided,
    state.deliveryLocation,
    state.urgency
  ]);

  // Calculate real-time price whenever essential form data changes
  useEffect(() => {
    const calculatePrice = async () => {
      // Basic validation before calculation
      if (!calculationDependencies.materialId ||
          !calculationDependencies.bagTypeId ||
          calculationDependencies.quantities.length === 0) {
        setCurrentPrice(null);
        setQuantityQuotes([]);
        return;
      }

      setIsCalculating(true);
      try {
        // Calculate quotes for all quantities using unified pricing engine
        const quotes = [];

        for (const quantity of calculationDependencies.quantities) {
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: calculationDependencies.bagTypeId,
            materialId: calculationDependencies.materialId,
            width: calculationDependencies.width,
            height: calculationDependencies.height,
            depth: calculationDependencies.depth,
            quantity: quantity,
            thicknessSelection: calculationDependencies.thicknessSelection,
            isUVPrinting: calculationDependencies.isUVPrinting,
            printingType: calculationDependencies.printingType,
            printingColors: calculationDependencies.printingColors,
            doubleSided: calculationDependencies.doubleSided,
            deliveryLocation: calculationDependencies.deliveryLocation,
            urgency: calculationDependencies.urgency
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
        const currentQuantityRef = state.quantity;
        const recommendedQuote = quotes.find(q => q.quantity === currentQuantityRef) || quotes[0];
        const previousPrice = previousPriceRef.current;

        setCurrentPrice(recommendedQuote.totalPrice);
        setQuantityQuotes(quotes);

        // Detect price change for animation using ref instead of state
        if (previousPrice && recommendedQuote.totalPrice > previousPrice) {
          setPriceChange('increase');
        } else if (previousPrice && recommendedQuote.totalPrice < previousPrice) {
          setPriceChange('decrease');
        } else {
          setPriceChange('stable');
        }

        // Reset animation after delay
        if (previousPrice && recommendedQuote.totalPrice !== previousPrice) {
          setTimeout(() => setPriceChange('stable'), 500);
        }

        // Update the ref with the new price
        previousPriceRef.current = recommendedQuote.totalPrice;
      } catch (error) {
        console.error('Price calculation error:', error);
        setCurrentPrice(null);
        setQuantityQuotes([]);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculatePrice, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [calculationDependencies]); // Remove state.quantity from dependencies to prevent circular dependency

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
            key={quote.quantity}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              quote.quantity === state.quantity
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
                <div className={`text-2xl font-bold mb-1 transition-all duration-500 ${
                  quote.quantity === state.quantity && priceChange === 'increase' ? 'scale-105 text-green-600' :
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
            サイズ: {state.width}×{state.height}{state.depth > 0 && `×${state.depth}`}mm
            {state.thicknessSelection && ` | 厚さ: ${state.thicknessSelection}`}
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
  const { state, isStepComplete, resetQuote } = useQuote();
  const { calculateMultiQuantity, canCalculateMultiQuantity } = useMultiQuantityQuote();

  const currentStepId = STEPS[currentStep]?.id;

  const wizardRef = useRef<HTMLDivElement>(null);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      if (currentStepId === 'delivery') {
        // Calculate quote when moving to result step
        setIsCalculating(true);
        try {
          // First, trigger multi-quantity calculations if possible
          if (canCalculateMultiQuantity()) {
            console.log('Triggering multi-quantity calculations...');
            await calculateMultiQuantity();
          }

          // Use the first/most relevant quantity for the final quote result
          const selectedQuantity = state.quantities[0] || 1000;
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            quantity: selectedQuantity,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            deliveryLocation: state.deliveryLocation,
            urgency: state.urgency
          });

          // Enhance result with all quantities information
          const enhancedResult = {
            ...quoteResult,
            quantities: state.quantities,
            totalQuantities: state.quantities.reduce((sum, qty) => sum + qty, 0)
          };

          setResult(enhancedResult);
          setCurrentStep(currentStep + 1);
          // Scroll to top after showing results
          setTimeout(() => {
            wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } catch (error) {
          console.error('Quote calculation failed:', error);
          alert('見積もり計算でエラーが発生しました。もう一度お試しください。');
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
      alert('リセット中にエラーが発生しました。もう一度お試しください。');
    }
  };

  const canProceed = currentStepId ? isStepComplete(currentStepId) : false;
  const isLastStep = currentStep === STEPS.length - 1;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" role="main">
      <div ref={wizardRef} className="max-w-7xl mx-auto p-4 lg:p-8" id="quote-wizard-content">

        {/* Enhanced Header with Progress */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            見積もりシミュレーター
          </h1>
          <p className="text-gray-600 mb-6">
            専門的な包装ソリューションのためのカスタマイズされたお見積もり
          </p>

          {/* Enhanced Progress Bar */}
          <div className="max-w-2xl mx-auto" role="progressbar" aria-valuenow={Math.round(((currentStep + 1) / STEPS.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="見積もり作成の進捗状況">
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

            {/* Step Indicators */}
            <nav className="flex justify-between mt-4 max-w-2xl mx-auto" aria-label="見積もり作成のステップ">
              {STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep || (result && index === STEPS.length - 1);
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center relative ${
                      index < STEPS.length - 1 ? 'flex-1' : ''
                    }`}
                  >
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ${
                        isActive
                          ? 'bg-navy-700 text-white shadow-lg scale-110 ring-4 ring-navy-200 focus:ring-navy-400'
                          : isCompleted
                          ? 'bg-green-600 text-white shadow-md focus:ring-green-400'
                          : 'bg-gray-300 text-gray-600 focus:ring-gray-400'
                      }`}
                      onClick={() => isCompleted && setCurrentStep(index)}
                      disabled={!isCompleted}
                      aria-label={`${step.title} - ${isCompleted ? '完了' : isActive ? '現在のステップ' : '利用できません'}`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </button>
                    <span className={`text-xs mt-2 text-center transition-colors ${
                      isActive
                        ? 'text-navy-700 font-semibold'
                        : isCompleted
                        ? 'text-green-700 font-medium'
                        : 'text-gray-500'
                    }`} aria-hidden="true">
                      {step.title}
                    </span>

                    {/* Connector Line */}
                    {index < STEPS.length - 1 && (
                      <div
                        className={`absolute top-5 left-10 w-full h-0.5 -ml-5 transition-colors duration-300 ${
                          isCompleted ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                        style={{ width: 'calc(100% - 40px)' }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </nav>
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
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-navy-100 border-2 border-navy-600 shadow-md'
                            : isCompleted
                            ? 'bg-green-50 border-2 border-green-300 text-green-800 hover:bg-green-100'
                            : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          isActive
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
              {currentStepId === 'quantity' && <MultiQuantityStep />}
              {currentStepId === 'post-processing' && <PostProcessingStep />}
              {currentStepId === 'delivery' && <DeliveryStep />}
              {currentStepId === 'result' && result && <ResultStep result={result} onReset={handleReset} />}

              {/* Navigation Buttons */}
              {currentStepId !== 'result' && (
                <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 font-medium rounded-lg transition-all flex items-center justify-center w-full sm:w-auto ${
                      currentStep === 0
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
                    className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center relative shadow-lg w-full sm:w-auto border-2 ${
                      !canProceed || isCalculating
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

        {/* Bottom Action Boxes - Fixed Position */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-4">
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
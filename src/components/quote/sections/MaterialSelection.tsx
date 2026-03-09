/**
 * MaterialSelection Component
 *
 * Extracted from SpecsStep - handles material selection with thickness options
 */

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';
import {
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_LABELS_JA,
  MATERIAL_DESCRIPTIONS
} from '@/constants/materialTypes';

// All materials including Kraft (roll film only)
const ALL_MATERIALS = [
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
    rollFilmOnly: false,
    thicknessOptions: [
      { id: 'light', name: '軽量タイプ (~100g)', nameJa: '軽量タイプ (~100g)', specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 60μ', weightRange: '~100g', multiplier: 0.9 },
      { id: 'medium', name: '標準タイプ (~500g)', nameJa: '標準タイプ (~500g)', specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ (~800g)', nameJa: '高耐久タイプ (~800g)', specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 100μ', weightRange: '~800g', multiplier: 1.1 },
      { id: 'ultra', name: '超耐久タイプ (800g~)', nameJa: '超耐久タイプ (800g~)', specification: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 110μ', weightRange: '800g~', multiplier: 1.2 }
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
    rollFilmOnly: false,
    thicknessOptions: [
      { id: 'light', name: '軽量タイプ (~100g)', nameJa: '軽量タイプ (~100g)', specification: 'PET 12μ + AL VMPET 7μ + PET 12μ + LLDPE 60μ', weightRange: '~100g', multiplier: 0.9 },
      { id: 'medium', name: '標準タイプ (~500g)', nameJa: '標準タイプ (~500g)', specification: 'PET 12μ + AL VMPET 7μ + PET 12μ + LLDPE 80μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ (~800g)', nameJa: '高耐久タイプ (~800g)', specification: 'PET 12μ + AL VMPET 7μ + PET 12μ + LLDPE 100μ', weightRange: '~800g', multiplier: 1.1 }
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
    rollFilmOnly: false,
    thicknessOptions: [
      { id: 'medium', name: '標準タイプ (~500g)', nameJa: '標準タイプ (~500g)', specification: 'PET 12μ + LLDPE 110μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ (~800g)', nameJa: '高耐久タイプ (~800g)', specification: 'PET 12μ + LLDPE 120μ', weightRange: '~800g', multiplier: 1.1 },
      { id: 'ultra', name: '超耐久タイプ (800g~)', nameJa: '超耐久タイプ (800g~)', specification: 'PET 12μ + LLDPE 130μ', weightRange: '800g~', multiplier: 1.2 }
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
    rollFilmOnly: false,
    thicknessOptions: [
      { id: 'light', name: '軽量タイプ (~100g)', nameJa: '軽量タイプ (~100g)', specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 60μ', weightRange: '~100g', multiplier: 0.9 },
      { id: 'medium', name: '標準タイプ (~500g)', nameJa: '標準タイプ (~500g)', specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 80μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ (~800g)', nameJa: '高耐久タイプ (~800g)', specification: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 100μ', weightRange: '~800g', multiplier: 1.1 }
    ]
  },
  {
    id: 'ny_lldpe',
    name: MATERIAL_TYPE_LABELS.ny_lldpe,
    nameJa: MATERIAL_TYPE_LABELS_JA.ny_lldpe,
    description: MATERIAL_DESCRIPTIONS.ny_lldpe.en,
    descriptionJa: MATERIAL_DESCRIPTIONS.ny_lldpe.ja,
    multiplier: 1.1,
    features: ['電子レンジ解凍可能', '透明窓表現可能', '2層構造で経済的', '軽量設計'],
    featuresJa: ['電子レンジ解凍可能', '透明窓表現可能', '2層構造で経済的', '軽量設計'],
    popular: false,
    ecoFriendly: false,
    rollFilmOnly: false,
    thicknessOptions: [
      { id: 'light_50', name: 'Light (LLDPE 50μ)', nameJa: '軽量タイプ (LLDPE 50μ)', specification: 'NY 15μ + LLDPE 50μ', weightRange: '~70g/m²', multiplier: 0.85 },
      { id: 'standard_70', name: 'Standard (LLDPE 70μ)', nameJa: '標準タイプ (LLDPE 70μ)', specification: 'NY 15μ + LLDPE 70μ', weightRange: '70~90g/m²', multiplier: 1.0 },
      { id: 'heavy_90', name: 'Heavy (LLDPE 90μ)', nameJa: '高耐久タイプ (LLDPE 90μ)', specification: 'NY 15μ + LLDPE 90μ', weightRange: '90~100g/m²', multiplier: 1.1 },
      { id: 'ultra_100', name: 'Ultra (LLDPE 100μ)', nameJa: '超耐久タイプ (LLDPE 100μ)', specification: 'NY 15μ + LLDPE 100μ', weightRange: '100~110g/m²', multiplier: 1.15 },
      { id: 'maximum_110', name: 'Maximum (LLDPE 110μ)', nameJa: '最大耐久タイプ (LLDPE 110μ)', specification: 'NY 15μ + LLDPE 110μ', weightRange: '110g/m²~', multiplier: 1.2 }
    ]
  },
  {
    id: 'kraft_vmpet_lldpe',
    name: MATERIAL_TYPE_LABELS.kraft_vmpet_lldpe,
    nameJa: MATERIAL_TYPE_LABELS_JA.kraft_vmpet_lldpe,
    description: MATERIAL_DESCRIPTIONS.kraft_vmpet_lldpe.en,
    descriptionJa: MATERIAL_DESCRIPTIONS.kraft_vmpet_lldpe.ja,
    multiplier: 1.3,
    features: ['自然素材風の外観', 'アルミ蒸着による優れたバリア性能', '環境に優しいイメージ', 'ロールフィルムのみ'],
    featuresJa: ['自然素材風の外観', 'アルミ蒸着による優れたバリア性能', '環境に優しいイメージ', 'ロールフィルムのみ'],
    popular: false,
    ecoFriendly: true,
    rollFilmOnly: true,
    minQuantityMeters: 1000,
    thicknessOptions: [
      { id: 'light_50', name: 'Light (LLDPE 50μ)', nameJa: '軽量タイプ (LLDPE 50μ)', specification: 'Kraft 50g/m² + VMPET 12μ + LLDPE 50μ', weightRange: '110~130g/m²', multiplier: 0.9 },
      { id: 'standard_70', name: 'Standard (LLDPE 70μ)', nameJa: '標準タイプ (LLDPE 70μ)', specification: 'Kraft 50g/m² + VMPET 12μ + LLDPE 70μ', weightRange: '130~150g/m²', multiplier: 1.0 },
      { id: 'heavy_90', name: 'Heavy (LLDPE 90μ)', nameJa: '高耐久タイプ (LLDPE 90μ)', specification: 'Kraft 50g/m² + VMPET 12μ + LLDPE 90μ', weightRange: '150~170g/m²', multiplier: 1.1 },
      { id: 'ultra_100', name: 'Ultra (LLDPE 100μ)', nameJa: '超耐久タイプ (LLDPE 100μ)', specification: 'Kraft 50g/m² + VMPET 12μ + LLDPE 100μ', weightRange: '170~190g/m²', multiplier: 1.15 },
      { id: 'maximum_110', name: 'Maximum (LLDPE 110μ)', nameJa: '最大耐久タイプ (LLDPE 110μ)', specification: 'Kraft 50g/m² + VMPET 12μ + LLDPE 110μ', weightRange: '190g/m²~', multiplier: 1.2 }
    ]
  },
  {
    id: 'kraft_pet_lldpe',
    name: MATERIAL_TYPE_LABELS.kraft_pet_lldpe,
    nameJa: MATERIAL_TYPE_LABELS_JA.kraft_pet_lldpe,
    description: MATERIAL_DESCRIPTIONS.kraft_pet_lldpe.en,
    descriptionJa: MATERIAL_DESCRIPTIONS.kraft_pet_lldpe.ja,
    multiplier: 1.2,
    features: ['自然素材風の外観', '短期バリア性能', '環境に優しいイメージ', 'ロールフィルムのみ'],
    featuresJa: ['自然素材風の外観', '短期バリア性能', '環境に優しいイメージ', 'ロールフィルムのみ'],
    popular: false,
    ecoFriendly: true,
    rollFilmOnly: true,
    minQuantityMeters: 1000,
    thicknessOptions: [
      { id: 'light_50', name: 'Light (LLDPE 50μ)', nameJa: '軽量タイプ (LLDPE 50μ)', specification: 'Kraft 50g/m² + PET 12μ + LLDPE 50μ', weightRange: '100~120g/m²', multiplier: 0.9 },
      { id: 'standard_70', name: 'Standard (LLDPE 70μ)', nameJa: '標準タイプ (LLDPE 70μ)', specification: 'Kraft 50g/m² + PET 12μ + LLDPE 70μ', weightRange: '120~140g/m²', multiplier: 1.0 },
      { id: 'heavy_90', name: 'Heavy (LLDPE 90μ)', nameJa: '高耐久タイプ (LLDPE 90μ)', specification: 'Kraft 50g/m² + PET 12μ + LLDPE 90μ', weightRange: '140~160g/m²', multiplier: 1.1 },
      { id: 'ultra_100', name: 'Ultra (LLDPE 100μ)', nameJa: '超耐久タイプ (LLDPE 100μ)', specification: 'Kraft 50g/m² + PET 12μ + LLDPE 100μ', weightRange: '160~180g/m²', multiplier: 1.15 },
      { id: 'maximum_110', name: 'Maximum (LLDPE 110μ)', nameJa: '最大耐久タイプ (LLDPE 110μ)', specification: 'Kraft 50g/m² + PET 12μ + LLDPE 110μ', weightRange: '180g/m²~', multiplier: 1.2 }
    ]
  }
];

interface MaterialSelectionProps {
  showThicknessOptions?: boolean;
}

/**
 * Component for selecting material type
 */
export function MaterialSelection({ showThicknessOptions = true }: MaterialSelectionProps) {
  const state = useQuoteState();
  const { updateBasicSpecs } = useQuote();

  // Filter materials based on bag type
  // Kraft materials only available for roll film
  const isRollFilm = state.bagTypeId === 'roll_film';
  const availableMaterials = ALL_MATERIALS.filter(m =>
    isRollFilm ? true : !m.rollFilmOnly
  );

  const selectedMaterial = ALL_MATERIALS.find(m => m.id === state.materialId);
  const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al', 'ny_lldpe', 'kraft_vmpet_lldpe', 'kraft_pet_lldpe'];
  const isThicknessRequired = materialsWithThickness.includes(state.materialId);

  const handleSelectMaterial = (materialId: string) => {
    updateBasicSpecs({ materialId });
  };

  const handleSelectThickness = (thicknessId: string) => {
    updateBasicSpecs({ thicknessSelection: thicknessId });
  };

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">素材</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableMaterials.map((material) => (
            <button
              key={material.id}
              onClick={() => handleSelectMaterial(material.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                state.materialId === material.id
                  ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                  : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
              }`}
              aria-pressed={state.materialId === material.id}
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
                    {material.rollFilmOnly && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        ロールフィルムのみ
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{material.descriptionJa}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {material.featuresJa.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                  {material.minQuantityMeters && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      最小注文数量: {material.minQuantityMeters}m
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thickness Selection */}
      {showThicknessOptions && selectedMaterial?.thicknessOptions && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          !state.thicknessSelection && isThicknessRequired ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              厚さのタイプ
              {isThicknessRequired && (
                <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                  必須
                </span>
              )}
            </label>
            {!state.thicknessSelection && isThicknessRequired && (
              <span className="text-xs text-amber-700 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                厚さを選択してください
              </span>
            )}
          </div>
          <div className="space-y-3">
            {selectedMaterial.thicknessOptions.map((thickness) => (
              <button
                key={thickness.id}
                onClick={() => handleSelectThickness(thickness.id)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                  state.thicknessSelection === thickness.id
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                }`}
                aria-pressed={state.thicknessSelection === thickness.id}
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
                    <div className="font-medium text-gray-900 mt-1">{thickness.specification}</div>
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
      )}
    </div>
  );
}

/**
 * MaterialSelection Component
 *
 * Extracted from SpecsStep - handles material selection with thickness options
 * 素材をカテゴリー別に分類して表示（透明タイプ、高バリアタイプ、クラフトタイプ）
 *
 * REFACTORED: Now uses centralized material data from @/constants/materialData
 */

'use client';

import React from 'react';
import { Check, AlertCircle, Eye, Shield, Leaf, Lightbulb } from 'lucide-react';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';
import { MATERIALS_DATA, getMaterialsByCategory, getMaterialById } from '@/constants/materialData';
import type { MaterialCategory as MaterialCategoryType } from '@/types/quote-components';

// 素材カテゴリー定義 (アイコン付き)
const MATERIAL_CATEGORIES: MaterialCategoryType[] = [
  {
    id: 'transparent',
    name: 'Transparent',
    nameJa: '透明タイプ',
    description: 'Contents visible, window display possible',
    descriptionJa: '中身が見える、窓付き表現可能',
    colorClass: 'from-sky-50 to-blue-50 border-sky-200',
    headerBg: 'bg-gradient-to-r from-sky-500 to-blue-500',
    textColor: 'text-sky-700',
    badgeColor: 'bg-sky-100 text-sky-700'
  },
  {
    id: 'high_barrier',
    name: 'High Barrier',
    nameJa: '高バリアタイプ',
    description: 'Long-term storage, maximum protection',
    descriptionJa: '長期保存に最適、最高の遮断性',
    colorClass: 'from-amber-50 to-orange-50 border-amber-200',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  {
    id: 'kraft',
    name: 'Kraft',
    nameJa: 'クラフトタイプ',
    description: 'Natural material appearance, eco-friendly',
    descriptionJa: '自然素材風、環境に優しい',
    colorClass: 'from-emerald-50 to-green-50 border-emerald-200',
    headerBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700'
  }
];

// Category icons map
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  transparent: <Eye className="w-6 h-6" />,
  high_barrier: <Shield className="w-6 h-6" />,
  kraft: <Leaf className="w-6 h-6" />
};

export interface MaterialSelectionProps {
  showThicknessOptions?: boolean;
}

/**
 * Component for selecting material type with category grouping
 */
export function MaterialSelection({ showThicknessOptions = true }: MaterialSelectionProps) {
  const state = useQuoteState();
  const { updateBasicSpecs } = useQuote();

  // Filter materials based on bag type
  const isRollFilm = state.bagTypeId === 'roll_film';
  const isSpoutPouch = state.bagTypeId === 'spout_pouch';
  const availableMaterials = MATERIALS_DATA.filter(m =>
    isRollFilm ? true : (isSpoutPouch ? !m.ecoFriendly : !m.rollFilmOnly)
  );

  // Group materials by category
  const materialsByCategory = MATERIAL_CATEGORIES.map(category => ({
    ...category,
    icon: CATEGORY_ICONS[category.id],
    materials: getMaterialsByCategory(category.id).filter(m =>
      availableMaterials.some(am => am.id === m.id)
    )
  })).filter(cat => cat.materials.length > 0);

  const selectedMaterial = getMaterialById(state.materialId);
  const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al', 'ny_lldpe', 'kraft_vmpet_lldpe', 'kraft_pet_lldpe'];
  const isThicknessRequired = materialsWithThickness.includes(state.materialId);

  const handleSelectMaterial = (materialId: string) => {
    // 素材変更時に最初の厚さオプションを自動選択
    const material = getMaterialById(materialId);
    const defaultThickness = material?.thicknessOptions?.[0]?.id;
    updateBasicSpecs({
      materialId,
      thicknessSelection: defaultThickness
    });
  };

  const handleSelectThickness = (thicknessId: string) => {
    updateBasicSpecs({ thicknessSelection: thicknessId });
  };

  return (
    <div className="space-y-6">
      {/* ヘルプガイド */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-indigo-900 mb-1">まず、包装の目的で選択してください</h3>
            <p className="text-sm text-indigo-700">
              各カテゴリーの特徴と推奨用途を確認して、最適な素材を選べます
            </p>
          </div>
        </div>
      </div>

      {/* Material Categories */}
      {materialsByCategory.map((category) => (
        <div key={category.id} className={`mb-6 rounded-lg border-2 overflow-hidden ${category.colorClass}`}>
          {/* Category Header */}
          <div className={`${category.headerBg} px-4 py-3 flex items-center space-x-3 text-white`}>
            <div className="bg-white/20 p-2 rounded-lg">
              {category.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{category.nameJa}</h3>
              <p className="text-sm opacity-90">{category.descriptionJa}</p>
            </div>
          </div>

          {/* Materials in this category */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.materials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => handleSelectMaterial(material.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                    state.materialId === material.id
                      ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
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
                            🔥 人気
                          </span>
                        )}
                        {material.ecoFriendly && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            🌱 環境友好
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
                      {material.recommendedFor && (
                        <div className={`mt-2 text-xs ${category.textColor} font-medium flex items-center`}>
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {material.recommendedFor}
                        </div>
                      )}
                      {material.minQuantityMeters && (
                        <div className="mt-1 text-xs text-blue-600 font-medium">
                          ⚠️ 最小注文数量: {material.minQuantityMeters}m
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Thickness Selection */}
      {showThicknessOptions && selectedMaterial?.thicknessOptions && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          !state.thicknessSelection && isThicknessRequired ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
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
            💡 推奨: 中間タイプで最適なバランスです
          </p>
        </div>
      )}
    </div>
  );
}

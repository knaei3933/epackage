/**
 * Material Data Constants
 *
 * Complete material definitions for quote wizard
 * 素材データ定数 - ImprovedQuotingWizardから抽出
 */

import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

export interface MaterialThicknessOption {
  id: string;
  name: string;
  nameJa: string;
  specification: string;
  specificationEn: string;
  weightRange: string;
  multiplier: number;
  filmLayers: FilmStructureLayer[];
}

export interface MaterialData {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  multiplier: number;
  features: string[];
  featuresJa: string[];
  recommendedFor: string;
  category: 'transparent' | 'high_barrier' | 'kraft';
  popular: boolean;
  ecoFriendly: boolean;
  thicknessOptions: MaterialThicknessOption[];
}

export const MATERIALS_DATA: MaterialData[] = [
  {
    id: 'pet_ldpe',
    name: 'PET/LLDPE',
    nameJa: 'PET/LLDPE',
    description: 'Transparent with good sealability',
    descriptionJa: '透明性に優れる、シール性良好',
    multiplier: 1.0,
    features: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
    featuresJa: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
    recommendedFor: 'お菓子、乾物、パン、小物包装',
    category: 'transparent',
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
    id: 'pet_al',
    name: 'PET/AL/PET/LLDPE',
    nameJa: 'PET/AL/PET/LLDPE',
    description: 'High barrier with aluminum foil',
    descriptionJa: 'アルミ箔による高バリア性能',
    multiplier: 1.5,
    features: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
    featuresJa: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
    recommendedFor: 'コーヒー豆、茶葉、ナッツ、スパイス、漬物',
    category: 'high_barrier',
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
    name: 'PET/VMPET/PET/LLDPE',
    nameJa: 'PET/VMPET/PET/LLDPE',
    description: 'High barrier with vapor deposited aluminum',
    descriptionJa: 'アルミ蒸着による高バリア性能',
    multiplier: 1.4,
    features: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
    featuresJa: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
    recommendedFor: 'スナック菓子、クッキー、煎餅',
    category: 'high_barrier',
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
      },
      {
        id: 'ultra',
        name: '超耐久タイプ (800g~)',
        nameJa: '超耐久タイプ (800g~)',
        specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
        specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 110μ',
        weightRange: '800g~',
        multiplier: 1.2,
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 110 }
        ]
      }
    ]
  },
  {
    id: 'pet_ny_al',
    name: 'PET/NY/AL/LLDPE',
    nameJa: 'PET/NY/AL/LLDPE',
    description: 'High strength high barrier with nylon',
    descriptionJa: 'ナイロン補強による高強度高バリア',
    multiplier: 1.6,
    features: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
    featuresJa: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
    recommendedFor: '米、穀物、ペットフード、重包装',
    category: 'high_barrier',
    popular: false,
    ecoFriendly: false,
    thicknessOptions: [
      {
        id: 'light',
        name: '軽量タイプ (~50g)',
        nameJa: '軽量タイプ (~50g)',
        specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン50μ',
        specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 50μ',
        weightRange: '~50g',
        multiplier: 0.85,
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'NY', thickness: 16 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'LLDPE', thickness: 50 }
        ]
      },
      {
        id: 'light_medium',
        name: '軽量タイプ (~200g)',
        nameJa: '軽量タイプ (~200g)',
        specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン70μ',
        specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 70μ',
        weightRange: '~200g',
        multiplier: 0.95,
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'NY', thickness: 16 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'LLDPE', thickness: 70 }
        ]
      },
      {
        id: 'medium',
        name: '標準タイプ (~500g)',
        nameJa: '標準タイプ (~500g)',
        specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン90μ',
        specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 90μ',
        weightRange: '~500g',
        multiplier: 1.0,
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'NY', thickness: 16 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'LLDPE', thickness: 90 }
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
      },
      {
        id: 'ultra',
        name: '超耐久タイプ (800g~)',
        nameJa: '超耐久タイプ (800g~)',
        specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン110μ',
        specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 110μ',
        weightRange: '800g~',
        multiplier: 1.2,
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'NY', thickness: 16 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'LLDPE', thickness: 110 }
        ]
      }
    ]
  },
  {
    id: 'ny_lldpe',
    name: 'NY/LLDPE',
    nameJa: 'NY/LLDPE',
    description: 'Microwaveable transparent film',
    descriptionJa: '電子レンジ対応透明フィルム',
    multiplier: 1.1,
    features: ['電子レンジ解凍可能', '透明窓表現可能', 'コストパフォーマンス良好', '軽量化に最適'],
    featuresJa: ['電子レンジ解凍可能', '透明窓表現可能', 'コストパフォーマンス良好', '軽量化に最適'],
    recommendedFor: '冷凍食品、惣菜、電子レンジ調理品',
    category: 'transparent',
    popular: false,
    ecoFriendly: false,
    thicknessOptions: [
      {
        id: 'light_50',
        name: '軽量タイプ (~50g)',
        nameJa: '軽量タイプ (~50g)',
        specification: 'ナイロン15μ+直鎖状低密度ポリエチレン50μ',
        specificationEn: 'NY 15μ + LLDPE 50μ',
        weightRange: '~50g',
        multiplier: 0.85,
        filmLayers: [
          { materialId: 'NY', thickness: 15 },
          { materialId: 'LLDPE', thickness: 50 }
        ]
      },
      {
        id: 'standard_70',
        name: '標準タイプ (~200g)',
        nameJa: '標準タイプ (~200g)',
        specification: 'ナイロン15μ+直鎖状低密度ポリエチレン70μ',
        specificationEn: 'NY 15μ + LLDPE 70μ',
        weightRange: '~200g',
        multiplier: 0.95,
        filmLayers: [
          { materialId: 'NY', thickness: 15 },
          { materialId: 'LLDPE', thickness: 70 }
        ]
      },
      {
        id: 'heavy_90',
        name: '高耐久タイプ (~500g)',
        nameJa: '高耐久タイプ (~500g)',
        specification: 'ナイロン15μ+直鎖状低密度ポリエチレン90μ',
        specificationEn: 'NY 15μ + LLDPE 90μ',
        weightRange: '~500g',
        multiplier: 1.0,
        filmLayers: [
          { materialId: 'NY', thickness: 15 },
          { materialId: 'LLDPE', thickness: 90 }
        ]
      },
      {
        id: 'ultra_100',
        name: '超耐久タイプ (~800g)',
        nameJa: '超耐久タイプ (~800g)',
        specification: 'ナイロン15μ+直鎖状低密度ポリエチレン100μ',
        specificationEn: 'NY 15μ + LLDPE 100μ',
        weightRange: '~800g',
        multiplier: 1.1,
        filmLayers: [
          { materialId: 'NY', thickness: 15 },
          { materialId: 'LLDPE', thickness: 100 }
        ]
      },
      {
        id: 'maximum_110',
        name: 'マキシマムタイプ (800g~)',
        nameJa: 'マキシマムタイプ (800g~)',
        specification: 'ナイロン15μ+直鎖状低密度ポリエチレン110μ',
        specificationEn: 'NY 15μ + LLDPE 110μ',
        weightRange: '800g~',
        multiplier: 1.2,
        filmLayers: [
          { materialId: 'NY', thickness: 15 },
          { materialId: 'LLDPE', thickness: 110 }
        ]
      }
    ]
  },
  {
    id: 'kraft_vmpet_lldpe',
    name: 'Kraft/VMPET/LLDPE',
    nameJa: 'クラフト/VMPET/LLDPE',
    description: 'Eco-friendly kraft with aluminum deposition',
    descriptionJa: '環境配慮型クラフト紙＋アルミ蒸着',
    multiplier: 1.4,
    features: ['自然素材風の外観', 'アルミ蒸着による優れたバリア性能', '環境に優しい', '透明窓表現可能'],
    featuresJa: ['自然素材風の外観', 'アルミ蒸着による優れたバリア性能', '環境に優しい', '透明窓表現可能'],
    recommendedFor: 'ナッツ、ドライフルーツ、コーヒー豆、スパイス',
    category: 'kraft',
    popular: false,
    ecoFriendly: true,
    thicknessOptions: [
      {
        id: 'light_50',
        name: '軽量タイプ (~50g)',
        nameJa: '軽量タイプ (~50g)',
        specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
        specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 50μ',
        weightRange: '~50g',
        multiplier: 0.85,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 50 }
        ]
      },
      {
        id: 'standard_70',
        name: '標準タイプ (~200g)',
        nameJa: '標準タイプ (~200g)',
        specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
        specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 70μ',
        weightRange: '~200g',
        multiplier: 0.95,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 70 }
        ]
      },
      {
        id: 'heavy_90',
        name: '高耐久タイプ (~500g)',
        nameJa: '高耐久タイプ (~500g)',
        specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
        specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
        weightRange: '~500g',
        multiplier: 1.0,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 90 }
        ]
      },
      {
        id: 'ultra_100',
        name: '超耐久タイプ (~800g)',
        nameJa: '超耐久タイプ (~800g)',
        specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
        specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 100μ',
        weightRange: '~800g',
        multiplier: 1.1,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 100 }
        ]
      },
      {
        id: 'maximum_110',
        name: 'マキシマムタイプ (800g~)',
        nameJa: 'マキシマムタイプ (800g~)',
        specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
        specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 110μ',
        weightRange: '800g~',
        multiplier: 1.2,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 110 }
        ]
      }
    ]
  },
  {
    id: 'kraft_pet_lldpe',
    name: 'Kraft/PET/LLDPE',
    nameJa: 'クラフト/PET/LLDPE',
    description: 'Eco-friendly kraft with short-term barrier',
    descriptionJa: '環境配慮型クラフト紙＋短期バリア',
    multiplier: 1.3,
    features: ['自然素材風の外観', '短期バリア性能', 'コストパフォーマンス良好', '環境に優しい'],
    featuresJa: ['自然素材風の外観', '短期バリア性能', 'コストパフォーマンス良好', '環境に優しい'],
    recommendedFor: 'パン、菓子、クッキー、短期保存品',
    category: 'kraft',
    popular: false,
    ecoFriendly: true,
    thicknessOptions: [
      {
        id: 'light_50',
        name: '軽量タイプ (~50g)',
        nameJa: '軽量タイプ (~50g)',
        specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
        specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 50μ',
        weightRange: '~50g',
        multiplier: 0.85,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 50 }
        ]
      },
      {
        id: 'standard_70',
        name: '標準タイプ (~200g)',
        nameJa: '標準タイプ (~200g)',
        specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
        specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
        weightRange: '~200g',
        multiplier: 0.95,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 70 }
        ]
      },
      {
        id: 'heavy_90',
        name: '高耐久タイプ (~500g)',
        nameJa: '高耐久タイプ (~500g)',
        specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
        specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 90μ',
        weightRange: '~500g',
        multiplier: 1.0,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 90 }
        ]
      },
      {
        id: 'ultra_100',
        name: '超耐久タイプ (~800g)',
        nameJa: '超耐久タイプ (~800g)',
        specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
        specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 100μ',
        weightRange: '~800g',
        multiplier: 1.1,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 100 }
        ]
      },
      {
        id: 'maximum_110',
        name: 'マキシマムタイプ (800g~)',
        nameJa: 'マキシマムタイプ (800g~)',
        specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
        specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 110μ',
        weightRange: '800g~',
        multiplier: 1.2,
        filmLayers: [
          { materialId: 'KRAFT', grammage: 80 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 110 }
        ]
      }
    ]
  }
];

/**
 * Helper function to get material by ID
 */
export function getMaterialById(id: string): MaterialData | undefined {
  return MATERIALS_DATA.find(m => m.id === id);
}

/**
 * Helper function to get materials by category
 */
export function getMaterialsByCategory(category: string): MaterialData[] {
  return MATERIALS_DATA.filter(m => m.category === category);
}

/**
 * Helper function to get popular materials
 */
export function getPopularMaterials(): MaterialData[] {
  return MATERIALS_DATA.filter(m => m.popular);
}

/**
 * Helper function to get eco-friendly materials
 */
export function getEcoFriendlyMaterials(): MaterialData[] {
  return MATERIALS_DATA.filter(m => m.ecoFriendly);
}

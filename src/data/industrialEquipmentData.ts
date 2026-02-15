export interface IndustrialEquipment {
  id: string
  name: string // Japanese with English
  nameJa: string // Japanese only
  nameEn: string // English only
  category: string
  description: string
  features: string[]
  specifications: {
    capacity: string
    power: string
    dimensions: string
    weight: string
  }
  applications: string[]
  image: string
  deliveryTime: string // Will be consolidated later
  isNew?: boolean
  isFeatured?: boolean
}

export const industrialEquipment: IndustrialEquipment[] = [
  {
    id: 'eq-001',
    name: '真空乳化撹拌機 (Vacuum Emulsifying Mixer)',
    nameJa: '真空乳化撹拌機',
    nameEn: 'Vacuum Emulsifying Mixer',
    category: '化粧品・食品製造設備',
    description: '最高品質の乳化・撹拌プロセスを実現。真空状態での均一な混合が可能で、化粧品、食品、医薬品の製造に最適です。',
    features: [
      '真空脱気機能',
      '温度制御システム',
      'ステンレス製容器',
      '自動クリーニング機能',
      '多段階撹拌パターン'
    ],
    specifications: {
      capacity: '50L - 2000L',
      power: '5.5kW - 45kW',
      dimensions: '1500 × 1200 × 2000mm',
      weight: '850kg - 3200kg'
    },
    applications: [
      '化粧品クリーム・ローション',
      '食品ソース・ドレッシング',
      '医薬品製剤',
      '塗料・インク製造'
    ],
    image: '/images/equipment/vacuum-emulsifier.jpg',
    deliveryTime: '迅速な納期対応',
    isFeatured: true
  },
  {
    id: 'eq-002',
    name: 'チューブ充填シーリング機 (Tube Filling & Sealing Machine)',
    nameJa: 'チューブ充填シーリング機',
    nameEn: 'Tube Filling & Sealing Machine',
    category: '充填・包装設備',
    description: '高精度なチューブ充填とシーリングを自動化。多種多様なチューブサイズと素材に対応し、高い生産性を実現します。',
    features: [
      'サーボモーター制御',
      '自動ノズル交換システム',
      '品質検査機能',
      'ステンレス構造',
      'タッチパネル操作'
    ],
    specifications: {
      capacity: '30 - 120本/分',
      power: '3.5kW - 7.5kW',
      dimensions: '2800 × 1500 × 1800mm',
      weight: '1200kg - 2100kg'
    },
    applications: [
      '化粧品（クリーム、ジェル）',
      '医薬品（軟膏、ゲル）',
      '食品（ソース、ジャム）',
      '工業製品（グリス、接着剤）'
    ],
    image: '/images/equipment/tube-filling-machine.jpg',
    deliveryTime: '短期での導入可能',
    isFeatured: true
  },
  {
    id: 'eq-003',
    name: '自動箱詰め機 (Automatic Cartoner)',
    nameJa: '自動箱詰め機',
    nameEn: 'Automatic Cartoner',
    category: '包装・梱包設備',
    description: '高速かつ正確な自動箱詰めプロセス。多様な製品サイズと箱タイプに対応し、生産ラインの効率を大幅向上させます。',
    features: [
      '高速処理能力',
      '自動サイズ調整',
      '品質チェック機能',
      '簡単な操作インターフェース',
      '低メンテナンス設計'
    ],
    specifications: {
      capacity: '20 - 150箱/分',
      power: '2.5kW - 8.0kW',
      dimensions: '3500 × 2000 × 2200mm',
      weight: '1800kg - 3500kg'
    },
    applications: [
      '医薬品包装',
      '食品包装',
      '化粧品包装',
      '日用品包装'
    ],
    image: '/images/equipment/automatic-cartoner.jpg',
    deliveryTime: '柔軟な納期設定',
    isNew: true
  },
  {
    id: 'eq-004',
    name: '液体充填機 (Liquid Filling Machine)',
    nameJa: '液体充填機',
    nameEn: 'Liquid Filling Machine',
    category: '充填・包装設備',
    description: '高精度な液体充填システム。粘度の異なる様々な液体に対応し、衛生的で高速な充填を実現します。',
    features: [
      '重量式・容積式選択可能',
      '衛生設計',
      '自動洗浄機能',
      '高性能ポンプ',
      '精度管理システム'
    ],
    specifications: {
      capacity: '10ml - 20L',
      power: '2.0kW - 15kW',
      dimensions: '2000 × 1500 × 2000mm',
      weight: '800kg - 2500kg'
    },
    applications: [
      '飲料',
      '化粧品',
      '医薬品',
      '化学製品'
    ],
    image: '/images/equipment/liquid-filling.jpg',
    deliveryTime: 'お客様のニーズに応じた柔軟対応'
  },
  {
    id: 'eq-005',
    name: 'ラベリング機 (Labeling Machine)',
    nameJa: 'ラベリング機',
    nameEn: 'Labeling Machine',
    category: '包装・検査設備',
    description: '高精度の自動ラベリングシステム。様々な容器形状とラベルサイズに対応し、美しい仕上がりを保証します。',
    features: [
      '高精度位置決め',
      '多彩なラベル対応',
      '高速処理',
      '簡単な設定変更',
      '品質検査機能'
    ],
    specifications: {
      capacity: '50 - 400個/分',
      power: '1.5kW - 5.0kW',
      dimensions: '1800 × 1200 × 1600mm',
      weight: '600kg - 1200kg'
    },
    applications: [
      'ボトルラベリング',
      '箱ラベリング',
      'シール貼付',
      'バーコード印刷'
    ],
    image: '/images/equipment/labeling-machine.jpg',
    deliveryTime: '短期納期対応可能',
    isNew: true
  },
  {
    id: 'eq-006',
    name: '錠剤包装機 (Tablet Packaging Machine)',
    nameJa: '錠剤包装機',
    nameEn: 'Tablet Packaging Machine',
    category: '医薬品専用設備',
    description: 'GMP基準対応の錠剤包装システム。正確な計数と衛生的な包装プロセスを提供します。',
    features: [
      'GMP準拠設計',
      '正確な計数機能',
      'アルミ包装対応',
      '品質管理システム',
      '簡単なオペレーション'
    ],
    specifications: {
      capacity: '60 - 200錠/分',
      power: '3.0kW - 8.0kW',
      dimensions: '2500 × 1800 × 1900mm',
      weight: '1500kg - 2800kg'
    },
    applications: [
      '医薬品錠剤',
      '健康食品',
      'サプリメント',
      'キャンディー'
    ],
    image: '/images/equipment/tablet-packaging.jpg',
    deliveryTime: 'お客様の生産スケジュールに柔軟対応',
    isFeatured: true
  }
]

export function getEquipmentByCategory(category: string): IndustrialEquipment[] {
  return industrialEquipment.filter(equipment => equipment.category === category)
}

export function getFeaturedEquipment(): IndustrialEquipment[] {
  return industrialEquipment.filter(equipment => equipment.isFeatured)
}

export function getNewEquipment(): IndustrialEquipment[] {
  return industrialEquipment.filter(equipment => equipment.isNew)
}

export function getEquipmentById(id: string): IndustrialEquipment | undefined {
  return industrialEquipment.find(equipment => equipment.id === id)
}

export function getAllCategories(): string[] {
  const categories = new Set<string>()
  industrialEquipment.forEach(equipment => {
    categories.add(equipment.category)
  })
  return Array.from(categories)
}
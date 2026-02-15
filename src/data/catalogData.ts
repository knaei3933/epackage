import type { PackageProduct } from '@/types/catalog'

// Product categories mapped to pouch types according to requirements
// 1. Three-side seal pouch (三方シール袋)
// 2. Stand pouch (スタンドパウチ)
// 3. Box pouch (BOX型パウチ)
// 4. Spout pouch (スパウトパウチ)
// 5. Roll film (ロールフィルム)

export const catalogProducts: PackageProduct[] = [
  // 1. Three-side seal pouch - 三方シール袋
  {
    id: 'three-seal-pouch-001',
    name: '三方シール袋',
    nameEn: 'Three-Side Seal Pouch',
    nameKo: '三方シール袋',
    type: 'standard', // Mapped to standard for compatibility
    category: {
      type: '三方シール袋',
      material: ['PE', 'PP', 'PET', 'アルミニウム'],
      size: ['小型', '中型', '大型'],
      industry: ['食品', '医薬品', '化粧品', '電子部品']
    },
    description: '3面シールのシンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
    descriptionEn: 'Simple three-side seal packaging with excellent cost performance. Ideal for small items, samples, and trial products.',
    descriptionKo: '3面シールのシンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
    specs: {
      dimensions: {
        length: 200,
        width: 150,
        height: 300,
        unit: 'mm'
      },
      weight: {
        min: 10,
        max: 500,
        unit: 'g'
      },
      capacity: {
        volume: 9000,
        unit: 'ml'
      }
    },
    features: {
      waterproof: true,
      tamperProof: true,
      recyclable: false,
      customDesign: true,
      barcodeCompatible: true,
      uvProtection: false,
      temperatureControl: false,
      childSafe: false
    },
    applications: [
      {
        industry: '食品',
        useCase: '試供品・サンプル',
        productExamples: ['スナック', '調味料', '試供品']
      },
      {
        industry: '医薬品',
        useCase: '医療サンプル',
        productExamples: ['試薬', '医療サンプル', '小袋包装']
      }
    ],
    images: [
      {
        id: 'three-seal-001-1',
        url: '/images/real-products/3sealpouch.png',
        alt: '三方シール袋 - Three-side seal pouch',
        isPrimary: true,
        width: 800,
        height: 600
      }
    ],
    pricing: {
      basePrice: 80,
      currency: 'JPY',
      unit: 'piece',
      discountTiers: [
        { quantity: 500, discountPercent: 5 },
        { quantity: 1000, discountPercent: 10 },
        { quantity: 5000, discountPercent: 15 }
      ]
    },
    leadTime: {
      min: 5,
      max: 7,
      unit: 'days'
    },
    minOrder: {
      quantity: 500,
      unit: 'pieces'
    },
    popularity: 95,
    tags: ['低コスト', 'シンプル', '試供品向け', '大量生産対応'],
    isFeatured: true,
    sortOrder: 3 // Three-side seal should be 3rd in main page
  },

  // 2. Stand pouch - スタンドパウチ
  {
    id: 'stand-pouch-001',
    name: 'スタンドパウチ',
    nameEn: 'Stand Pouch',
    nameKo: 'スタンドパウチ',
    type: 'premium', // Mapped to premium for features
    category: {
      type: 'スタンドパウチ',
      material: ['PET', 'アルミニウム', 'PE', 'PP'],
      size: ['小型', '中型', '大型'],
      industry: ['食品', '健康食品', '化粧品', 'ペットフード']
    },
    description: '自立型で陳列性に優れ、チャック付きで再封可能。食品・健康食品・化粧品まで幅広く対応。',
    descriptionEn: 'Self-standing with excellent display properties, resealable with zipper. Wide support for food, health products, and cosmetics.',
    descriptionKo: '自立型で陳列性に優れ、ジッパーで再密封可能。食品、健康食品、化粧品まで幅広く対応。',
    specs: {
      dimensions: {
        length: 180,
        width: 120,
        height: 250,
        unit: 'mm'
      },
      weight: {
        min: 20,
        max: 800,
        unit: 'g'
      },
      capacity: {
        volume: 5400,
        unit: 'ml'
      }
    },
    features: {
      waterproof: true,
      tamperProof: true,
      recyclable: false,
      customDesign: true,
      barcodeCompatible: true,
      uvProtection: true,
      temperatureControl: false,
      childSafe: true
    },
    applications: [
      {
        industry: '食品',
        useCase: '自立包装',
        productExamples: ['スナック', 'コーヒー豆', '健康食品']
      },
      {
        industry: '化粧品',
        useCase: '化粧品包装',
        productExamples: ['化粧水', 'クリーム', '美容液']
      }
    ],
    images: [
      {
        id: 'stand-pouch-001-1',
        url: '/images/portfolio/granola-standpouch-real.jpg',
        alt: 'スタンドパウチ - 自立型パッケージ',
        isPrimary: true,
        width: 800,
        height: 600
      }
    ],
    pricing: {
      basePrice: 180,
      currency: 'JPY',
      unit: 'piece',
      discountTiers: [
        { quantity: 500, discountPercent: 5 },
        { quantity: 1000, discountPercent: 10 },
        { quantity: 3000, discountPercent: 15 }
      ]
    },
    leadTime: {
      min: 7,
      max: 10,
      unit: 'days'
    },
    minOrder: {
      quantity: 500,
      unit: 'pieces'
    },
    popularity: 98,
    tags: ['人気No.1', '自立型', '再封可能', '陳列性に優れる'],
    isFeatured: true,
    sortOrder: 1 // Stand pouch should be 1st in main page
  },

  // 3. Box pouch - BOX型パウチ
  {
    id: 'box-pouch-001',
    name: 'BOX型パウチ',
    nameEn: 'Box Pouch',
    nameKo: 'ボックス型パウチ',
    type: 'luxury', // Mapped to luxury for premium feel
    category: {
      type: 'BOX型パウチ',
      material: ['PET', 'アルミニウム', 'PE', 'ナイロン'],
      size: ['中型', '大型'],
      industry: ['高級食品', 'プレミアム製品', 'ギフト包装', '化粧品']
    },
    description: '箱型形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
    descriptionEn: 'Box-shaped pouch with excellent self-standing properties and superior protection for contents.',
    descriptionKo: 'ボックス形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
    specs: {
      dimensions: {
        length: 200,
        width: 150,
        height: 80,
        unit: 'mm'
      },
      weight: {
        min: 50,
        max: 1000,
        unit: 'g'
      },
      capacity: {
        volume: 2400,
        unit: 'ml'
      }
    },
    features: {
      waterproof: true,
      tamperProof: true,
      recyclable: false,
      customDesign: true,
      barcodeCompatible: true,
      uvProtection: true,
      temperatureControl: true,
      childSafe: true
    },
    applications: [
      {
        industry: '高級食品',
        useCase: 'プレミアム食品包装',
        productExamples: ['高級コーヒー', 'スイーツ', 'ギフト食品']
      },
      {
        industry: '化粧品',
        useCase: '高級化粧品',
        productExamples: ['高級化粧品セット', '香水', 'スキンケア']
      }
    ],
    images: [
      {
        id: 'box-pouch-001-1',
        url: '/images/products/gusset-bag-coffee.webp',
        alt: 'BOX型パウチ - 箱型立体パッケージ',
        isPrimary: true,
        width: 800,
        height: 600
      }
    ],
    pricing: {
      basePrice: 280,
      currency: 'JPY',
      unit: 'piece',
      discountTiers: [
        { quantity: 800, discountPercent: 5 },
        { quantity: 2000, discountPercent: 10 },
        { quantity: 5000, discountPercent: 15 }
      ]
    },
    leadTime: {
      min: 10,
      max: 14,
      unit: 'days'
    },
    minOrder: {
      quantity: 800,
      unit: 'pieces'
    },
    popularity: 88,
    tags: ['高級感', '自立性', '保護性', '立体設計'],
    isFeatured: true,
    sortOrder: 4 // Box pouch should be 4th in main page
  },

  // 4. Spout pouch - スパウトパウチ
  {
    id: 'spout-pouch-001',
    name: 'スパウトパウチ',
    nameEn: 'Spout Pouch',
    nameKo: 'スパウトパウチ',
    type: 'premium', // Custom type for spout functionality
    category: {
      type: 'スパウトパウチ',
      material: ['PET', 'アルミニウム', 'PE', 'ナイロン'],
      size: ['中型', '大型'],
      industry: ['液体食品', '化粧品', '健康食品', '飲料', 'ソース']
    },
    description: '液体食品・化粧品・健康食品に最適なスパウト付きパウチ。軽量で持ち運びやすく、使いやすいスパウトで注ぎやすさを実現。',
    descriptionEn: 'Spout pouch optimal for liquid foods, cosmetics, and health products. Lightweight and portable with easy-to-use spout for pouring.',
    descriptionKo: '液体食品、化粧品、健康食品に最適化されたスパウトパウチ。軽量で携帯性に優れ、使いやすいスパウトで注ぎやすい。',
    specs: {
      dimensions: {
        length: 220,
        width: 160,
        height: 300,
        unit: 'mm'
      },
      weight: {
        min: 40,
        max: 1200,
        unit: 'g'
      },
      capacity: {
        volume: 10560,
        unit: 'ml'
      }
    },
    features: {
      waterproof: true,
      tamperProof: true,
      recyclable: false,
      customDesign: true,
      barcodeCompatible: true,
      uvProtection: true,
      temperatureControl: true,
      childSafe: true
    },
    applications: [
      {
        industry: '飲料',
        useCase: '液体飲料',
        productExamples: ['ジュース', 'スポーツドリンク', '液体調味料']
      },
      {
        industry: '化粧品',
        useCase: '液体化粧品',
        productExamples: ['化粧水', 'シャンプー', 'リンス']
      }
    ],
    images: [
      {
        id: 'spout-pouch-001-1',
        url: '/images/products/spout-pouch-1.png',
        alt: 'スパウトパウチ - 液体対応パッケージ',
        isPrimary: true,
        width: 800,
        height: 600
      }
    ],
    pricing: {
      basePrice: 300,
      currency: 'JPY',
      unit: 'piece',
      discountTiers: [
        { quantity: 1000, discountPercent: 5 },
        { quantity: 3000, discountPercent: 10 },
        { quantity: 8000, discountPercent: 15 }
      ]
    },
    leadTime: {
      min: 12,
      max: 16,
      unit: 'days'
    },
    minOrder: {
      quantity: 1000,
      unit: 'pieces'
    },
    popularity: 82,
    tags: ['NEW', '液体対応', '注ぎやすさ', '持ち運び便利'],
    isNew: true,
    isFeatured: true,
    sortOrder: 5 // Spout pouch should be 5th in main page
  },

  // 5. Roll film - ロールフィルム
  {
    id: 'roll-film-001',
    name: 'ロールフィルム',
    nameEn: 'Roll Film',
    nameKo: 'ロールフィルム',
    type: 'industrial', // Industrial for mass production
    category: {
      type: 'ロールフィルム',
      material: ['PE', 'PP', 'PET', 'アルミニウム'],
      size: ['大型', '超大型'],
      industry: ['自動包装', '大量生産', '食品工場', '包装機械']
    },
    description: '自動包装機に対応。大量生産に最適で、コスト削減を実現します。',
    descriptionEn: 'Compatible with automatic packaging machines. Optimal for mass production, achieving cost reduction.',
    descriptionKo: '自動包装機対応。大量生産に最適化され、コスト削減を実現。',
    specs: {
      dimensions: {
        length: 1000,
        width: 600,
        height: 0.15,
        unit: 'mm'
      },
      weight: {
        min: 5000,
        max: 50000,
        unit: 'g'
      },
      capacity: {
        volume: 90,
        unit: 'm²'
      }
    },
    features: {
      waterproof: true,
      tamperProof: false,
      recyclable: true,
      customDesign: true,
      barcodeCompatible: true,
      uvProtection: false,
      temperatureControl: false,
      childSafe: false
    },
    applications: [
      {
        industry: '食品工場',
        useCase: '自動包装',
        productExamples: ['スナック包装', '食品包装', '大量生産包装']
      },
      {
        industry: '包装機械',
        useCase: '機械対応フィルム',
        productExamples: ['包装機械用', '自動包装機', '充填機']
      }
    ],
    images: [
      {
        id: 'roll-film-001-1',
        url: '/images/auto-roll-real.jpg',
        alt: 'ロールフィルム - 自動包装機対応',
        isPrimary: true,
        width: 800,
        height: 600
      }
    ],
    pricing: {
      basePrice: 50,
      currency: 'JPY',
      unit: 'meter',
      discountTiers: [
        { quantity: 1000, discountPercent: 5 },
        { quantity: 5000, discountPercent: 10 },
        { quantity: 10000, discountPercent: 15 }
      ]
    },
    leadTime: {
      min: 7,
      max: 10,
      unit: 'days'
    },
    minOrder: {
      quantity: 1000,
      unit: 'meters'
    },
    popularity: 75,
    tags: ['大量生産対応', '必要分だけ', '在庫リスクゼロ', '自動包装機対応'],
    sortOrder: 2 // Roll film should be 2nd in main page
  }
]

export function getAllMaterials(): string[] {
  const materials = new Set<string>()
  catalogProducts.forEach(product => {
    product.category.material.forEach(material => materials.add(material))
  })
  return Array.from(materials).sort()
}

export function getAllSizes(): string[] {
  const sizes = new Set<string>()
  catalogProducts.forEach(product => {
    product.category.size.forEach(size => sizes.add(size))
  })
  return Array.from(sizes).sort()
}

export function getAllIndustries(): string[] {
  const industries = new Set<string>()
  catalogProducts.forEach(product => {
    product.category.industry.forEach(industry => industries.add(industry))
  })
  return Array.from(industries).sort()
}

export function getProductById(id: string): PackageProduct | undefined {
  return catalogProducts.find(product => product.id === id)
}

export function getProductsByType(type: string): PackageProduct[] {
  return catalogProducts.filter(product => product.type === type)
}

export function getFeaturedProducts(): PackageProduct[] {
  return catalogProducts.filter(product => product.isFeatured)
}

export function getNewProducts(): PackageProduct[] {
  return catalogProducts.filter(product => product.isNew)
}
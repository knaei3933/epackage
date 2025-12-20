import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'
import { PRODUCT_CATEGORIES } from '@/app/api/products/route'

// Mock data for static generation - in production, this would come from your API
const mockProducts = [
  {
    id: 'flat-3-side-001',
    category: 'flat_3_side',
    name_ja: '三方シール平袋',
    name_en: '3-Side Seal Flat Bag',
    description_ja: '優れた密封性で化粧品や乾燥菓子などで活用可能',
    description_en: 'Excellent sealing performance, suitable for cosmetics and dry snacks',
    specifications: {
      width_range: '50-300mm',
      height_range: '80-500mm',
      thickness_range: '50-150μm',
      materials: ['PE', 'PP', 'PET', 'アルミラミネート']
    },
    materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
    pricing_formula: {
      base_cost: 15000,
      per_unit_cost: 5,
      min_quantity: 1000
    },
    min_order_quantity: 1000,
    lead_time_days: 14,
    sort_order: 1,
    is_active: true,
    tags: ['健康食品', 'サプリメント', 'ドリップパック', 'フェイスパック'],
    applications: ['食品包装', '化粧品', '医薬品', '電子部品'],
    features: ['優れた密封性', 'コスト競争力', '多用途対応']
  },
  {
    id: 'stand-up-001',
    category: 'stand_up',
    name_ja: 'チャック付きスタンド袋',
    name_en: 'Stand-Up Bag with Zip',
    description_ja: '高い汎用性で自立しやすい食品から日用品まで活用可能',
    description_en: 'High versatility, self-standing design for food and daily necessities',
    specifications: {
      width_range: '80-250mm',
      height_range: '120-350mm',
      thickness_range: '60-180μm',
      materials: ['PE', 'PP', 'PET', 'アルミラミネート']
    },
    materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
    pricing_formula: {
      base_cost: 18000,
      per_unit_cost: 8,
      min_quantity: 1000
    },
    min_order_quantity: 1000,
    lead_time_days: 16,
    sort_order: 2,
    is_active: true,
    tags: ['健康食品', 'サプリメント', 'お菓子', '日用品', '雑貨', 'マスク', '化粧品'],
    applications: ['食品包装', '化粧品', 'ペットフード', '調味料'],
    features: ['自立設計', '再封可能', '棚陳列に最適']
  },
  {
    id: 'gusset-001',
    category: 'gusset',
    name_ja: 'ガゼット袋',
    name_en: 'Gusset Bag',
    description_ja: '豊富なサイズ展開で大容量にも対応可能',
    description_en: 'Rich size variations, supports large capacity requirements',
    specifications: {
      width_range: '100-300mm',
      height_range: '200-600mm',
      gusset_depth: '50-150mm',
      thickness_range: '70-200μm',
      materials: ['PE', 'PP', 'アルミラミネート']
    },
    materials: ['PE', 'PP', 'ALUMINUM'],
    pricing_formula: {
      base_cost: 20000,
      per_unit_cost: 10,
      min_quantity: 1000
    },
    min_order_quantity: 1000,
    lead_time_days: 18,
    sort_order: 3,
    is_active: true,
    tags: ['コーヒー', 'お茶', '抹茶', 'お菓子'],
    applications: ['飲料包装', '食品包装', '粉末製品'],
    features: ['大容量対応', '底部拡張', '安定した形状']
  },
  {
    id: 'box-001',
    category: 'box',
    name_ja: 'BOX型',
    name_en: 'Box Type',
    description_ja: '自立しやすく内部空間が広い大容量の包装に最適',
    description_en: 'Easy to stand with spacious interior, ideal for large-capacity packaging',
    specifications: {
      width_range: '150-400mm',
      height_range: '200-500mm',
      depth_range: '50-200mm',
      thickness_range: '80-250μm',
      materials: ['PET', 'PP', 'PE', 'アルミラミネート']
    },
    materials: ['PET', 'PP', 'PE', 'ALUMINUM'],
    pricing_formula: {
      base_cost: 25000,
      per_unit_cost: 12,
      min_quantity: 500
    },
    min_order_quantity: 500,
    lead_time_days: 20,
    sort_order: 4,
    is_active: true,
    tags: ['プロテイン', 'ペットフード', 'お菓子', 'サプリメント', 'コーヒー', '化粧品'],
    applications: ['健康食品', 'ペット用品', '化粧品', '電子部品'],
    features: ['立方体形状', 'スペース効率', '高級感']
  },
  {
    id: 'flat-zip-001',
    category: 'flat_with_zip',
    name_ja: 'チャック付き平袋',
    name_en: 'Flat Bag with Zip',
    description_ja: 'かさばらない上に高い汎用性食品から日用品まで活用可能',
    description_en: 'Compact design with high versatility for food and daily necessities',
    specifications: {
      width_range: '60-250mm',
      height_range: '100-400mm',
      thickness_range: '50-150μm',
      materials: ['PE', 'PP', 'PET', 'アルミラミネート']
    },
    materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
    pricing_formula: {
      base_cost: 16000,
      per_unit_cost: 6,
      min_quantity: 1000
    },
    min_order_quantity: 1000,
    lead_time_days: 15,
    sort_order: 5,
    is_active: true,
    tags: ['健康食品', 'サプリメント', 'お菓子', '日用品', '雑貨', 'マスク', '化粧品'],
    applications: ['食品包装', '医薬品', '電子部品', '文具'],
    features: ['コンパクト', '再封可能', '保管に便利']
  },
  {
    id: 'special-001',
    category: 'special',
    name_ja: '特殊仕様カスタム',
    name_en: 'Special Specifications Custom',
    description_ja: '特殊機能やカスタム仕様に対応した特殊包装',
    description_en: 'Special packaging with custom features and specifications',
    specifications: {
      custom_dimensions: true,
      custom_materials: true,
      special_features: ['UVコーティング', 'エンボス加工', '静電気防止', 'ガスバリアー'],
      thickness_range: '30-300μm'
    },
    materials: ['PE', 'PP', 'PET', 'ALUMINUM', 'PAPER_LAMINATE', '特殊素材'],
    pricing_formula: {
      base_cost: 50000,
      per_unit_cost: 15,
      min_quantity: 500,
      setup_fee: 100000
    },
    min_order_quantity: 500,
    lead_time_days: 30,
    sort_order: 6,
    is_active: true,
    tags: ['特殊用途', '産業用途', '試作品', '研究開発'],
    applications: ['医療機器', '工業部品', '試作品', '特殊用途'],
    features: ['カスタマイズ', '特殊機能', '要相談']
  }
]

// Generate static params for all products
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.id,
  }))
}

// Generate metadata for each product
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = mockProducts.find(p => p.id === params.slug)

  if (!product) {
    return {
      title: '製品が見つかりません | Epackage Lab',
    }
  }

  const categoryInfo = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return {
    title: `${product.name_ja} | Epackage Lab`,
    description: product.description_ja,
    keywords: [...product.tags, 'Epackage Lab', 'パッケージング', '包装', product.name_ja],
    openGraph: {
      title: `${product.name_ja} | Epackage Lab`,
      description: product.description_ja,
      images: [
        {
          url: `/images/products/${product.id}.jpg`,
          width: 1200,
          height: 630,
          alt: product.name_ja,
        }
      ]
    }
  }
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = mockProducts.find(p => p.id === params.slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
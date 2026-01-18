import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * GET /api/products/categories
 * Get all product categories with metadata
 *
 * Query Parameters:
 * - locale: Locale for category names (default: 'ja')
 * - activeOnly: Only return categories with active products (default: true)
 *
 * @returns {Object} Response with success status, categories, and metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'ja'
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured')
    }

    const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

    // Get all unique categories with active products
    let query = supabase
      .from('products')
      .select('category')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: productsData, error: productsError } = await query

    if (productsError) {
      console.error('Supabase query error:', productsError)
      throw productsError
    }

    // Extract unique categories
    const uniqueCategories = Array.from(
      new Set(productsData?.map(p => p.category) || [])
    )

    // Category metadata (this will be moved to a categories table in future)
    const categoryMetadata: Record<string, any> = {
      flat_3_side: {
        id: 'flat_3_side',
        name_ja: '平袋',
        name_en: 'Three-Side Seal Bag',
        name_ko: '三方シールパウチ',
        description_ja: 'シンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
        description_en: 'Simple and cost-effective standard packaging. Ideal for small items, samples, and trial products.',
        icon: 'package',
        features: ['低コスト', 'シンプル設計', '多用途対応']
      },
      stand_up: {
        id: 'stand_up',
        name_ja: 'スタンドパウチ',
        name_en: 'Stand Pouch',
        name_ko: 'スタンドパウチ',
        description_ja: '自立型で陳列性に優れ、チャック付きで再封可能。食品・健康食品・化粧品まで幅広く対応。',
        description_en: 'Self-standing with excellent display properties, resealable with zipper. Wide support for food, health products, and cosmetics.',
        icon: 'shopping-bag',
        features: ['自立設計', '再封可能', '陳列性に優れる']
      },
      box: {
        id: 'box',
        name_ja: 'BOX型パウチ',
        name_en: 'Box Pouch',
        name_ko: 'ボックスパウチ',
        description_ja: '箱型形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
        description_en: 'Box-shaped pouch with excellent self-standing properties and superior protection for contents.',
        icon: 'package',
        features: ['自立性', '保護性', '立体設計']
      },
      spout_pouch: {
        id: 'spout_pouch',
        name_ja: 'スパウトパウチ',
        name_en: 'Spout Pouch',
        name_ko: 'スパウトパウチ',
        description_ja: '液体食品・化粧品・健康食品に最適なスパウト付きパウチ。軽量で持ち運びやすく、使いやすいスパウトで注ぎやすさを実現。',
        description_en: 'Spout pouch optimal for liquid foods, cosmetics, and health products. Lightweight and portable with easy-to-use spout for pouring.',
        icon: 'package-2',
        features: ['液体対応', '注ぎやすさ', '持ち運び便利']
      },
      roll_film: {
        id: 'roll_film',
        name_ja: 'ロールフィルム',
        name_en: 'Roll Film',
        name_ko: 'ロールフィルム',
        description_ja: '自動包装機に対応。大量生産に最適で、コスト削減を実現します。',
        description_en: 'Compatible with automatic packaging machines. Optimal for mass production, achieving cost reduction.',
        icon: 'archive',
        features: ['大量生産対応', '自動包装機対応', 'コスト削減']
      },
      flat_with_zip: {
        id: 'flat_with_zip',
        name_ja: 'チャック付き平袋',
        name_en: 'Flat Bag with Zip',
        description_ja: 'チャック付きで再封可能なフラットタイプのパウチ。保管効率が良く、省スペース設計。',
        description_en: 'Flat pouch with zipper for resealability. Space-efficient design with excellent storage properties.',
        icon: 'file',
        features: ['再封可能', '省スペース', 'チャック付き']
      },
      gusset: {
        id: 'gusset',
        name_ja: 'ガゼット袋',
        name_en: 'Gusset Bag',
        description_ja: 'マチ付きで容量たっぷり。コーヒー豆や茶葉、プレミアム商品の包装に最適な高級パッケージ。',
        description_en: 'Generous capacity with gusset bottom. Premium packaging ideal for coffee beans, tea leaves, and premium products.',
        icon: 'box',
        features: ['大容量対応', '高級感', '底部拡張']
      },
      soft_pouch: {
        id: 'soft_pouch',
        name_ja: 'ソフトパウチ',
        name_en: 'Soft Pouch',
        description_ja: '柔らかな素材で作られたソフトな質感のパウチ。高級感と優れた触感を実現。',
        description_en: 'Soft pouch made from flexible materials for a soft texture. Premium feel and excellent tactile experience.',
        icon: 'shopping-bag',
        features: ['柔らかな質感', '高級感', '優れた触感']
      },
      special: {
        id: 'special',
        name_ja: '特殊仕様パウチ',
        name_en: 'Special Specification Pouch',
        description_ja: '特殊な機能や仕様を備えたカスタマイズパッケージ。お客様のニーズに合わせて設計可能。',
        description_en: 'Custom packaging with special features and specifications. Design available to meet customer requirements.',
        icon: 'settings',
        features: ['カスタマイズ', '特殊機能', '設計対応']
      }
    }

    // Combine categories with metadata
    const categoriesWithMetadata = uniqueCategories.map(categoryId => {
      const metadata = categoryMetadata[categoryId] || {
        id: categoryId,
        name_ja: categoryId,
        name_en: categoryId,
        description_ja: '',
        description_en: '',
        icon: 'package',
        features: []
      }

      // Get product count for this category
      const categoryProducts = productsData?.filter(p => p.category === categoryId) || []

      return {
        ...metadata,
        productCount: categoryProducts.length
      }
    })

    // Sort categories by product count (descending) and then by ID
    const sortedCategories = categoriesWithMetadata.sort((a, b) => {
      if (b.productCount !== a.productCount) {
        return b.productCount - a.productCount
      }
      return a.id.localeCompare(b.id)
    })

    return NextResponse.json({
      success: true,
      data: sortedCategories,
      count: sortedCategories.length,
      timestamp: new Date().toISOString(),
      locale
    })
  } catch (error) {
    console.error('Error fetching categories:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}

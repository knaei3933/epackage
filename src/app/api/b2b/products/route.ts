/**
 * B2B Product Catalog API
 *
 * B2B製品カタログAPI
 * - GET: 製品リスト取得 (検索、フィルタリング対応)
 * - POST: 製品登録 (管理者用)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Product } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface ProductListQuery {
  category?: string;
  search?: string;
  material_type?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'price' | 'created_at' | 'sort_order';
  sort_order?: 'asc' | 'desc';
}

interface ProductListResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductCreateRequest {
  product_code: string;
  name_ja: string;
  name_en: string;
  description_ja?: string;
  description_en?: string;
  category: Product['category'];
  material_type: string; // Using string instead of non-existent Product['material_type']
  specifications: Record<string, any>;
  base_price: number;
  currency?: string;
  pricing_formula?: Record<string, any>;
  min_order_quantity: number;
  lead_time_days: number;
  sort_order?: number;
  image_url?: string;
  meta_keywords?: string[];
  meta_description?: string;
}

// ============================================================
// Mock Product Data (Development)
// ============================================================

const mockProducts: Product[] = [
  {
    id: 'prd-001',
    category: 'stand_up',
    name_ja: 'スタンドアップパウチ',
    name_en: 'Stand-Up Pouch',
    description_ja: '底部が広がる自立式パウチ。ディスプレイ効果が高く、 Variousサイズ対応可能。',
    description_en: 'Self-standing pouch with expanded bottom. High display effect, various sizes available.',
    specifications: {
      pouch_type: 'stand_up',
      available_sizes: ['W100×H150', 'W120×H180', 'W150×H200', 'W180×H250', 'W200×H300'],
      features: ['ジッパー対応', 'ノッチ対応', '吊り穴対応', 'エンボス加工'],
    },
    materials: ['PET', 'AL', 'PE', 'CPP'],
    pricing_formula: {
      base_price: 150,
      material_multiplier: 1.0,
      size_complexity: 1.2,
    },
    min_order_quantity: 1000,
    lead_time_days: 14,
    sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prd-002',
    category: 'flat_3_side',
    name_ja: '三方シール袋',
    name_en: 'Three-Side Seal Pouch',
    description_ja: 'コストパフォーマンスに優れた基本的なパウチ形状。',
    description_en: 'Basic pouch shape with excellent cost performance.',
    specifications: {
      pouch_type: 'flat_3_side',
      available_sizes: ['W80×H120', 'W100×H150', 'W120×H180', 'W150×H200'],
      features: ['ノッチ対応', '吊り穴対応'],
    },
    materials: ['PET', 'PE', 'CPP', 'NY'],
    pricing_formula: {
      base_price: 100,
      material_multiplier: 0.9,
      size_complexity: 1.0,
    },
    min_order_quantity: 500,
    lead_time_days: 10,
    sort_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prd-003',
    category: 'gusset',
    name_ja: 'ガゼット袋',
    name_en: 'Gusset Pouch',
    description_ja: '底面にマチがあり、内容物の容量を確保できるパウチ。',
    description_en: 'Pouch with bottom gusset for increased capacity.',
    specifications: {
      pouch_type: 'gusset',
      available_sizes: ['W120×H180×G40', 'W150×H200×G50', 'W180×H250×G60'],
      features: ['底マチ', 'ジッパー対応', 'ノッチ対応'],
    },
    materials: ['PET', 'AL', 'PE', 'NY'],
    pricing_formula: {
      base_price: 130,
      material_multiplier: 1.1,
      size_complexity: 1.15,
    },
    min_order_quantity: 1000,
    lead_time_days: 12,
    sort_order: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prd-004',
    category: 'flat_with_zip',
    name_ja: 'チャック付き平袋',
    name_en: 'Flat Pouch with Zipper',
    description_ja: '再封可能なジッパー付きの平袋。',
    description_en: 'Flat pouch with resealable zipper.',
    specifications: {
      pouch_type: 'flat_with_zip',
      available_sizes: ['W100×H150', 'W120×H180', 'W150×H200'],
      features: ['ジッパー標準', 'ノッチ対応', '吊り穴対応'],
    },
    materials: ['PET', 'PE', 'CPP'],
    pricing_formula: {
      base_price: 120,
      material_multiplier: 1.0,
      size_complexity: 1.05,
    },
    min_order_quantity: 500,
    lead_time_days: 10,
    sort_order: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prd-005',
    category: 'spout_pouch',
    name_ja: 'スパウトパウチ',
    name_en: 'Spout Pouch',
    description_ja: '飲料や液体製品向けの注ぎ口付きパウチ。',
    description_en: 'Pouch with spout for beverages and liquid products.',
    specifications: {
      pouch_type: 'spout_pouch',
      available_sizes: ['W120×H200', 'W150×H250', 'W180×H300'],
      spout_types: ['キャップタイプ', 'プッシュプルタイプ', 'スポットタイプ'],
      features: ['注ぎ口', 'ジッパー対応', 'キャップ'],
    },
    materials: ['PET', 'AL', 'PE'],
    pricing_formula: {
      base_price: 180,
      material_multiplier: 1.2,
      size_complexity: 1.3,
    },
    min_order_quantity: 2000,
    lead_time_days: 18,
    sort_order: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prd-006',
    category: 'roll_film',
    name_ja: 'ロールフィルム',
    name_en: 'Roll Film',
    description_ja: '自動充填機用のロール状フィルム。',
    description_en: 'Roll film for automatic filling machines.',
    specifications: {
      pouch_type: 'roll_film',
      available_widths: ['200mm', '250mm', '300mm', '350mm', '400mm'],
      roll_diameter: '最大600mm',
      core_diameter: '3インチ',
      features: ['スリット加工済み', 'テープ補強'],
    },
    materials: ['PET', 'AL', 'PE', 'CPP', 'NY'],
    pricing_formula: {
      base_price: 80,
      material_multiplier: 0.85,
      size_complexity: 0.9,
    },
    min_order_quantity: 100,
    lead_time_days: 7,
    sort_order: 6,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prd-007',
    category: 'special',
    name_ja: '特形状パウチ',
    name_en: 'Special Shape Pouch',
    description_ja: '特殊な形状のカスタムパウチ。お問い合わせください。',
    description_en: 'Custom shaped pouch. Please contact us.',
    specifications: {
      pouch_type: 'special',
      available_shapes: ['台形', '円形', '異形'],
      features: ['完全カスタム', '金型製作必要'],
    },
    materials: ['PET', 'AL', 'PE', 'CPP', 'NY', 'PAPER'],
    pricing_formula: {
      base_price: 200,
      material_multiplier: 1.5,
      size_complexity: 1.8,
    },
    min_order_quantity: 3000,
    lead_time_days: 30,
    sort_order: 7,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// GET Handler - List Products
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: ProductListQuery = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      material_type: searchParams.get('material_type') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sort_by: (searchParams.get('sort_by') as any) || 'sort_order',
      sort_order: (searchParams.get('sort_order') as any) || 'asc',
    };

    // In development, use mock data
    // In production, query from database
    let filteredProducts = [...mockProducts];

    // Apply filters
    if (query.category) {
      filteredProducts = filteredProducts.filter(p => p.category === query.category);
    }
    if (query.material_type) {
      filteredProducts = filteredProducts.filter(p =>
        p.materials.includes(query.material_type as any)
      );
    }
    if (query.is_active !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.is_active === query.is_active);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name_ja.toLowerCase().includes(searchLower) ||
        p.name_en.toLowerCase().includes(searchLower) ||
        p.description_ja?.toLowerCase().includes(searchLower) ||
        p.description_en?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      const aVal = (a as any)[query.sort_by!];
      const bVal = (b as any)[query.sort_by!];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return query.sort_order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return query.sort_order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    // Apply pagination
    const total = filteredProducts.length;
    const limit = query.limit || 20;
    const page = query.page || 1;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    } as ProductListResponse);
  } catch (error) {
    console.error('Products API error:', error);

    return NextResponse.json(
      {
        error: '製品リストの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Create Product (Admin Only)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as ProductCreateRequest;

    // Validate required fields
    const requiredFields = [
      'product_code',
      'name_ja',
      'name_en',
      'category',
      'material_type',
      'specifications',
      'base_price',
      'min_order_quantity',
      'lead_time_days',
    ] as const;

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `${field} は必須です`,
            code: 'MISSING_REQUIRED_FIELD',
          },
          { status: 400 }
        );
      }
    }

    // Generate product ID
    const productId = `prd-${Date.now()}`;

    // Create product
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        id: productId,
        product_code: body.product_code,
        name_ja: body.name_ja,
        name_en: body.name_en,
        description_ja: body.description_ja || null,
        description_en: body.description_en || null,
        category: body.category,
        material_type: body.material_type,
        specifications: body.specifications,
        base_price: body.base_price,
        currency: body.currency || 'JPY',
        pricing_formula: body.pricing_formula || null,
        stock_quantity: 0,
        reorder_level: 100,
        min_order_quantity: body.min_order_quantity,
        lead_time_days: body.lead_time_days,
        is_active: true,
        sort_order: body.sort_order || 999,
        image_url: body.image_url || null,
        meta_keywords: body.meta_keywords || null,
        meta_description: body.meta_description || null,
        version: 1,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
    }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);

    return NextResponse.json(
      {
        error: '製品登録に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

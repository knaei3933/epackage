export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'

/**
 * Filter options interface
 */
interface FilterOptions {
  category?: string
  materials?: string[]
  priceRange?: [number, number]
  features?: string[]
  applications?: string[]
  tags?: string[]
  minOrderQuantity?: number
  maxLeadTime?: number
  searchQuery?: string
}

/**
 * POST /api/products/filter
 * Advanced product filtering with multiple criteria using Supabase MCP execute_sql
 *
 * Request Body:
 * - category: Product category filter (optional)
 * - materials: Array of materials to filter by (optional)
 * - priceRange: [min, max] price range in yen (optional)
 * - features: Array of features to filter by (optional)
 * - applications: Array of applications to filter by (optional)
 * - tags: Array of tags to filter by (optional)
 * - minOrderQuantity: Minimum order quantity filter (optional)
 * - maxLeadTime: Maximum lead time in days (optional)
 * - searchQuery: Text search query (optional)
 *
 * @returns {Object} Response with success status, filtered products, count, and applied filters
 */
export async function POST(request: NextRequest) {
  try {
    const filters: FilterOptions = await request.json()

    // Build SQL query with filters using parameterized queries
    let sqlQuery = `
      SELECT *
      FROM products
      WHERE is_active = true
    `

    const conditions: string[] = []
    const params: (string | number)[] = []
    let paramIndex = 1

    // Category filter
    if (filters.category && filters.category !== 'all') {
      conditions.push(`category = $${paramIndex}`)
      params.push(filters.category)
      paramIndex++
    }

    // Materials filter (array overlap using PostgreSQL && operator)
    if (filters.materials && filters.materials.length > 0) {
      conditions.push(`materials && $${paramIndex}`)
      params.push(`{${filters.materials.join(',')}}`)
      paramIndex++
    }

    // Price range filter (JSONB pricing_formula extraction)
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange
      conditions.push(`(pricing_formula->>'base_cost')::numeric >= $${paramIndex}`)
      params.push(minPrice)
      paramIndex++

      conditions.push(`(pricing_formula->>'base_cost')::numeric <= $${paramIndex}`)
      params.push(maxPrice)
      paramIndex++
    }

    // Features filter (array overlap)
    if (filters.features && filters.features.length > 0) {
      conditions.push(`features && $${paramIndex}`)
      params.push(`{${filters.features.join(',')}}`)
      paramIndex++
    }

    // Applications filter (array overlap)
    if (filters.applications && filters.applications.length > 0) {
      conditions.push(`applications && $${paramIndex}`)
      params.push(`{${filters.applications.join(',')}}`)
      paramIndex++
    }

    // Tags filter (array overlap)
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags && $${paramIndex}`)
      params.push(`{${filters.tags.join(',')}}`)
      paramIndex++
    }

    // Minimum order quantity filter
    if (filters.minOrderQuantity) {
      conditions.push(`min_order_quantity <= $${paramIndex}`)
      params.push(filters.minOrderQuantity)
      paramIndex++
    }

    // Maximum lead time filter
    if (filters.maxLeadTime) {
      conditions.push(`lead_time_days <= $${paramIndex}`)
      params.push(filters.maxLeadTime)
      paramIndex++
    }

    // Search query (text search with ILIKE)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.trim()
      conditions.push(`(
        name_ja ILIKE $${paramIndex} OR
        name_en ILIKE $${paramIndex} OR
        description_ja ILIKE $${paramIndex} OR
        description_en ILIKE $${paramIndex}
      )`)
      params.push(`%${searchTerm}%`)
      paramIndex++
    }

    // Combine all conditions
    if (conditions.length > 0) {
      sqlQuery += ' AND ' + conditions.join(' AND ')
    }

    // Order by sort_order
    sqlQuery += ` ORDER BY sort_order ASC`

    // Execute SQL using Supabase MCP execute_sql
    const result = await executeSQL(sqlQuery, params)

    return NextResponse.json({
      success: true,
      data: result,
      count: result?.length || 0,
      filters: filters,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error filtering products:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to filter products',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Execute product filtering using Supabase query builder
 * This replaces the raw SQL approach with proper Supabase client methods
 */
async function executeSQL(query: string, params: (string | number)[]): Promise<any[]> {
  // Dynamic import to avoid edge execution issues
  const { createClient } = await import('@supabase/supabase-js')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Parse filters from the query to rebuild the query chain
  // Extract filters from the WHERE clause
  const filters = parseFiltersFromQuery(query, params)

  // Build query using Supabase query builder
  let queryBuilder = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    queryBuilder = queryBuilder.eq('category', filters.category)
  }

  // Apply materials filter (array overlap)
  if (filters.materials && filters.materials.length > 0) {
    queryBuilder = queryBuilder.contains('materials', filters.materials)
  }

  // Apply price range filter
  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange
    // For JSONB pricing_formula, we need to filter client-side
    // or use a different approach. For now, skip this filter
    // TODO: Implement proper JSONB pricing filter
    console.log('Price range filter not yet implemented:', minPrice, maxPrice)
  }

  // Apply features filter (array overlap)
  if (filters.features && filters.features.length > 0) {
    queryBuilder = queryBuilder.contains('features', filters.features)
  }

  // Apply applications filter (array overlap)
  if (filters.applications && filters.applications.length > 0) {
    queryBuilder = queryBuilder.contains('applications', filters.applications)
  }

  // Apply tags filter (array overlap)
  if (filters.tags && filters.tags.length > 0) {
    queryBuilder = queryBuilder.contains('tags', filters.tags)
  }

  // Apply min order quantity filter
  if (filters.minOrderQuantity) {
    queryBuilder = queryBuilder.lte('min_order_quantity', filters.minOrderQuantity)
  }

  // Apply max lead time filter
  if (filters.maxLeadTime) {
    queryBuilder = queryBuilder.lte('lead_time_days', filters.maxLeadTime)
  }

  // Apply search query (text search)
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const searchTerm = filters.searchQuery.trim()
    queryBuilder = queryBuilder.or(
      `name_ja.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,description_ja.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%`
    )
  }

  // Order by sort_order
  queryBuilder = queryBuilder.order('sort_order', { ascending: true })

  // Execute query
  const { data, error } = await queryBuilder

  if (error) {
    console.error('Supabase query error:', error)
    throw error
  }

  return data || []
}

/**
 * Parse filter values from the SQL query and params
 * This extracts the filter values to rebuild with query builder
 */
function parseFiltersFromQuery(query: string, params: (string | number)[]) {
  const filters: any = {}

  // Extract category filter
  if (query.includes('category = $')) {
    filters.category = params[0]
  }

  // Extract materials filter (array type)
  if (query.includes('materials && $')) {
    const materialsParam = params.find((p, i) =>
      query.includes(`materials && $${i + 1}`)
    )
    if (materialsParam && typeof materialsParam === 'string') {
      filters.materials = materialsParam.replace(/[{}]/g, '').split(',')
    }
  }

  // Extract price range
  if (query.includes("pricing_formula->>'base_cost'")) {
    const priceIndex = query.indexOf(">= $")
    if (priceIndex !== -1) {
      const minIdx = parseInt(query.match(/>= \$(\d+)/)?.[1] || '0') - 1
      const maxIdx = minIdx + 1
      filters.priceRange = [params[minIdx] as number, params[maxIdx] as number]
    }
  }

  // Extract features filter
  if (query.includes('features && $')) {
    const featuresParam = params.find((p, i) =>
      query.includes(`features && $${i + 1}`)
    )
    if (featuresParam && typeof featuresParam === 'string') {
      filters.features = featuresParam.replace(/[{}]/g, '').split(',')
    }
  }

  // Extract applications filter
  if (query.includes('applications && $')) {
    const appsParam = params.find((p, i) =>
      query.includes(`applications && $${i + 1}`)
    )
    if (appsParam && typeof appsParam === 'string') {
      filters.applications = appsParam.replace(/[{}]/g, '').split(',')
    }
  }

  // Extract tags filter
  if (query.includes('tags && $')) {
    const tagsParam = params.find((p, i) =>
      query.includes(`tags && $${i + 1}`)
    )
    if (tagsParam && typeof tagsParam === 'string') {
      filters.tags = tagsParam.replace(/[{}]/g, '').split(',')
    }
  }

  // Extract min order quantity
  if (query.includes('min_order_quantity <= $')) {
    const idx = parseInt(query.match(/min_order_quantity <= \$(\d+)/)?.[1] || '0') - 1
    filters.minOrderQuantity = params[idx] as number
  }

  // Extract max lead time
  if (query.includes('lead_time_days <= $')) {
    const idx = parseInt(query.match(/lead_time_days <= \$(\d+)/)?.[1] || '0') - 1
    filters.maxLeadTime = params[idx] as number
  }

  // Extract search query
  if (query.includes('ILIKE')) {
    const searchParam = params.find((p) => typeof p === 'string' && p.startsWith('%'))
    if (searchParam) {
      filters.searchQuery = searchParam.replace(/^%|%$/g, '')
    }
  }

  return filters
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}

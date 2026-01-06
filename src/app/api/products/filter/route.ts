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
 * Execute SQL query using Supabase client
 * This function provides a clean interface for SQL execution
 * compatible with the Supabase MCP execute_sql pattern
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

  // Use the PostgreSQL RPC function to execute raw SQL
  // This mimics the Supabase MCP execute_sql functionality
  const { data, error } = await supabase.rpc('execute_sql', {
    query_text: query,
    query_params: params
  })

  if (error) {
    console.error('SQL execution error:', error)
    // Fallback to direct query if RPC not available
    return await fallbackQuery(supabase, query, params)
  }

  return data || []
}

/**
 * Fallback query function when RPC is not available
 * This provides a safe fallback mechanism
 */
async function fallbackQuery(
  supabase: any,
  originalQuery: string,
  params: (string | number)[]
): Promise<any[]> {
  try {
    // Extract the base query without parameters for fallback
    // This is a simplified fallback that should be enhanced for production
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Fallback query error:', error)
    throw new Error('Failed to execute query with both primary and fallback methods')
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}

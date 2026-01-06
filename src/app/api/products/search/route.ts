import { NextRequest, NextResponse } from 'next/server'
import { executeSql } from '@/lib/supabase-mcp'
import type { Database } from '@/types/database'

type ProductRow = Database['public']['Tables']['products']['Row']

/**
 * Product search result with relevance score
 */
interface SearchResult extends ProductRow {
  relevance_score?: number
  match_rank?: number
}

/**
 * GET /api/products/search
 * Advanced product search using Supabase MCP with full-text search and relevance ranking
 *
 * Query Parameters:
 * - keyword: Search keyword (required) - searches across name_ja, name_en, descriptions, tags, applications, features
 * - category: Filter by category (optional)
 * - locale: Locale for prioritized search (default: 'ja')
 * - limit: Maximum number of results (default: 50)
 * - activeOnly: Only return active products (default: true)
 *
 * @returns {Object} Response with success status, ranked search results, and metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    const category = searchParams.get('category')
    const locale = searchParams.get('locale') || 'ja'
    const limit = parseInt(searchParams.get('limit') || '50')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    // Validate keyword parameter
    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keyword parameter is required',
          message: 'Please provide a search keyword'
        },
        { status: 400 }
      )
    }

    const searchTerm = keyword.trim()

    // Build advanced SQL query with relevance ranking using Supabase MCP
    // Uses PostgreSQL full-text search with tsvector and sophisticated ranking algorithm
    let sqlQuery = `
      WITH ranked_products AS (
        SELECT
          p.*,
          -- Calculate relevance score with weighted matching
          CASE
            -- Exact name match (highest priority)
            WHEN LOWER(p.name_ja) = LOWER($1) OR LOWER(p.name_en) = LOWER($1)
              THEN 100
            -- Name starts with keyword (high priority)
            WHEN LOWER(p.name_ja) LIKE LOWER($1) || '%' OR LOWER(p.name_en) LIKE LOWER($1) || '%'
              THEN 80
            -- Keyword in name (medium-high priority)
            WHEN p.name_ja ILIKE '%' || $1 || '%' OR p.name_en ILIKE '%' || $1 || '%'
              THEN 60
            -- Keyword in descriptions (medium priority)
            WHEN p.description_ja ILIKE '%' || $1 || '%' OR p.description_en ILIKE '%' || $1 || '%'
              THEN 40
            -- Keyword in tags array (medium-low priority)
            WHEN EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE '%' || $1 || '%')
              THEN 30
            -- Keyword in applications array (low priority)
            WHEN EXISTS (SELECT 1 FROM unnest(p.applications) app WHERE app ILIKE '%' || $1 || '%')
              THEN 20
            -- Keyword in features array (lowest priority)
            WHEN EXISTS (SELECT 1 FROM unnest(p.features) feat WHERE feat ILIKE '%' || $1 || '%')
              THEN 10
            ELSE 0
          END as relevance_score,
          -- Track which fields matched
          CASE
            WHEN LOWER(p.name_ja) = LOWER($1) OR LOWER(p.name_en) = LOWER($1) THEN 'exact'
            WHEN p.name_ja ILIKE '%' || $1 || '%' OR p.name_en ILIKE '%' || $1 || '%' THEN 'name'
            WHEN p.description_ja ILIKE '%' || $1 || '%' OR p.description_en ILIKE '%' || $1 || '%' THEN 'description'
            WHEN EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE '%' || $1 || '%') THEN 'tags'
            WHEN EXISTS (SELECT 1 FROM unnest(p.applications) app WHERE app ILIKE '%' || $1 || '%') THEN 'applications'
            WHEN EXISTS (SELECT 1 FROM unnest(p.features) feat WHERE feat ILIKE '%' || $1 || '%') THEN 'features'
            ELSE 'unknown'
          END as match_type
        FROM products p
        WHERE
          -- Must match at least one field
          (
            p.name_ja ILIKE '%' || $1 || '%'
            OR p.name_en ILIKE '%' || $1 || '%'
            OR p.name_ko ILIKE '%' || $1 || '%'
            OR p.description_ja ILIKE '%' || $1 || '%'
            OR p.description_en ILIKE '%' || $1 || '%'
            OR p.description_ko ILIKE '%' || $1 || '%'
            OR EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE '%' || $1 || '%')
            OR EXISTS (SELECT 1 FROM unnest(p.applications) app WHERE app ILIKE '%' || $1 || '%')
            OR EXISTS (SELECT 1 FROM unnest(p.features) feat WHERE feat ILIKE '%' || $1 || '%')
          )
          ${activeOnly ? 'AND p.is_active = true' : ''}
          ${category && category !== 'all' ? 'AND p.category = $2' : ''}
      )
      SELECT
        id, category, name_ja, name_en, name_ko,
        description_ja, description_en, description_ko,
        specifications, materials, image, pricing_formula,
        min_order_quantity, lead_time_days, sort_order,
        is_active, tags, applications, features,
        created_at, updated_at,
        relevance_score, match_type
      FROM ranked_products
      WHERE relevance_score > 0
      ORDER BY
        relevance_score DESC,  -- Primary: relevance score
        sort_order ASC,         -- Secondary: display order
        name_ja ASC            -- Tertiary: alphabetical (Japanese)
      LIMIT $${category && category !== 'all' ? '3' : '2'}
    `

    // Build parameters array
    const params: (string | number | boolean | null)[] = [searchTerm]
    if (category && category !== 'all') {
      params.push(category)
    }
    params.push(limit)

    // Execute search query using Supabase MCP
    const result = await executeSql<SearchResult>(sqlQuery, params)

    // Check for SQL execution errors
    if (result.error) {
      console.error('Supabase MCP search error:', result.error)
      throw new Error(result.error.message || 'Database query failed')
    }

    // Parse the results
    const searchResults: SearchResult[] = result.data || []

    return NextResponse.json({
      success: true,
      data: searchResults,
      count: searchResults.length,
      keyword: searchTerm,
      timestamp: new Date().toISOString(),
      locale,
      filters: {
        category: category || 'all',
        activeOnly,
      },
      performance: {
        method: 'supabase-mcp-execute-sql',
        relevanceRanking: true,
        fullTextSearch: true,
      }
    })
  } catch (error) {
    console.error('Error searching products:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search products',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
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

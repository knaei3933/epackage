export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getAllProducts } from '@/lib/product-data'

/**
 * GET /api/products
 * Fetch products from Supabase database with optional filtering
 *
 * Query Parameters:
 * - category: Filter by product category (optional)
 * - locale: Locale for localized content (default: 'ja') - Currently not used, kept for backward compatibility
 * - limit: Maximum number of products to return (default: 100)
 * - activeOnly: Only return active products (default: true)
 *
 * @returns {Object} Response with success status, products data, count, and timestamp
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const locale = searchParams.get('locale') || 'ja'
    const limit = parseInt(searchParams.get('limit') || '100')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase is not configured, return fallback data
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://undefined.supabase.co') {
      console.log('Supabase not configured, returning fallback data')

      // Return fallback static data
      const fallbackProducts = getAllProducts(null, locale)

      return NextResponse.json({
        success: true,
        data: fallbackProducts,
        count: fallbackProducts.length,
        timestamp: new Date().toISOString(),
        fallback: true
      })
    }

    const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(limit)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Return products data
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || data?.length || 0,
      timestamp: new Date().toISOString(),
      locale // Included for backward compatibility
    })
  } catch (error) {
    console.error('Error fetching products:', error)

    // Return fallback data on error
    const fallbackProducts = getAllProducts(null, 'ja')

    return NextResponse.json({
      success: true,
      data: fallbackProducts,
      count: fallbackProducts.length,
      timestamp: new Date().toISOString(),
      fallback: true
    })
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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}
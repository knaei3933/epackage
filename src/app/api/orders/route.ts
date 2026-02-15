/**
 * Orders API Route (Supabase)
 *
 * 注文APIエンドポイント
 * - GET: 現在のユーザーの注文一覧を取得
 *
 * Features:
 * - Status filtering (PENDING, QUOTATION, DATA_RECEIVED, etc.)
 * - Pagination support
 * - Customer-only authentication
 * - Join with order_items to prevent N+1 queries
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { OrderStatus } from '@/types/order-status';

// ============================================================
// GET: ユーザーの注文一覧取得
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // 現在のユーザー確認 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as OrderStatus | 'all' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `, { count: 'exact' }) // Get total count for pagination
      .eq('user_id', user.id);

    // Apply status filter (if not 'all')
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply sorting
    const orderColumn = sortBy === 'total_amount' ? 'total_amount' : 'created_at';
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: orders, error, count } = await query;

    if (error) {
      // テーブルがない場合は空の配列を返す
      if (error.code === '42P01') {
        return NextResponse.json({
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }
      throw error;
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);

    return NextResponse.json(
      {
        error: '注文履歴の取得に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

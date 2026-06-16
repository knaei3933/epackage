/**
 * Admin Shipments API
 *
 * 管理者用配送一覧取得API
 * - ページネーション対応
 * - フィルタリング対応
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromHeaders } from '@/lib/supabase-ssr';

export async function GET(request: NextRequest) {
  try {
    // Check for DEV_MODE mock auth first
    const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

    if (isDevMode) {
      // In DEV_MODE, use headers set by middleware
      const userRole = request.headers.get('x-user-role');

      console.log('[API] Admin shipments: DEV_MODE active, role from header:', userRole);

      // Check admin role from header
      const adminRoles = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];
      if (!userRole || !adminRoles.includes(userRole)) {
        console.error('[API] Admin shipments: Forbidden in DEV_MODE. Role:', userRole);
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      // Get service role client for RLS bypass
      const { createClient: createServiceClient } = await import('@supabase/supabase-js');
      const supabaseService = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Get query parameters
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('page_size') || '10');
      const status = searchParams.get('status');

      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Build query for shipments
      let query = supabaseService
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Get total count for pagination
      const { count } = await query;

      // Get paginated data
      query = query.range(start, end);

      const { data, error } = await query;

      console.log('[API] Admin shipments: Shipments count:', data?.length || 0, 'Total:', count);

      if (error) {
        console.error('[API] Admin shipments: Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch shipments' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: data || [],
        pagination: {
          page,
          page_size: pageSize,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / pageSize),
        },
      });
    }

    // Task #27: getAuthenticatedUserFromHeaders trusts middleware-verified x-user-*
    // headers (DB-verified upstream), skipping the redundant getUser() RTT.
    // 認証結果（誰が認証されるか）は不変。検証経路の最適化のみ。
    const authUser = await getAuthenticatedUserFromHeaders(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get service role client for RLS bypass
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Task #28: 認可強度の均一化（orders route L101-123 と同一パターン）。
    // getAuthenticatedUserFromHeaders は authUser.id を取得（header 経由で 0 RTT、
    // fallback で getUser）。role 認可は service client で profiles を再SELECT して検証
    // （service_role は RLS バイパスで確実な最新 role を取得）。
    // 注: profiles RLS は自己行のみ許可（uid=id）のため Task #27 実装でも安全だったが、
    // orders と認可ロジックを均一化し認証経路への依存を明示的に排除（security-reviewer HIGH #1）。
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    const adminRoles = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];
    if (!profile || !adminRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const status = searchParams.get('status');

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Build query for shipments
    let query = supabaseService
      .from('shipments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    const { count } = await query;

    // Get paginated data
    query = query.range(start, end);

    const { data, error } = await query;

    console.log('[API] Admin shipments: Shipments count:', data?.length || 0, 'Total:', count);

    if (error) {
      console.error('[API] Admin shipments: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        page_size: pageSize,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('[API] Admin shipments: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

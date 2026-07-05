/**
 * Admin Orders API
 *
 * 管理者用注文一覧取得API
 * - SSR/CSR両対応、DEV_MODE対応
 * - Cookie-based authentication for client-side navigation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAuthenticatedUserFromHeaders } from '@/lib/supabase-ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check for DEV_MODE mock auth first
    const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

    if (isDevMode) {
      // In DEV_MODE, use headers set by middleware
      const userRole = request.headers.get('x-user-role');

      console.log('[API] Admin orders: DEV_MODE active, role from header:', userRole);

      // Check admin role from header (ADMIN厳格 — 全 admin ルートと統一)
      if (userRole !== 'ADMIN') {
        console.error('[API] Admin orders: Forbidden in DEV_MODE. Role:', userRole);
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      // Get service role client for RLS bypass
      const supabaseService = createServiceClient();

      // Get query parameters
      const searchParams = request.nextUrl.searchParams;
      const statusParam = searchParams.get('status');
      const quotationId = searchParams.get('quotation_id');
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const pageSize = parseInt(searchParams.get('page_size') || '10', 10);
      const offset = (page - 1) * pageSize;

      // Build query with pagination
      let query = supabaseService
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Handle multiple statuses (comma-separated)
      if (statusParam && statusParam !== 'all') {
        const statuses = statusParam.split(',').map(s => s.trim());
        if (statuses.length === 1) {
          query = query.eq('status', statuses[0]);
        } else {
          query = query.in('status', statuses);
        }
      }

      if (quotationId) {
        query = query.eq('quotation_id', quotationId);
        console.log('[API] Admin orders: Filtering by quotation_id:', quotationId);
      }

      // Issue 4: search by order_number or customer name/email (supports tail-7 lookup)
      if (search && search.trim()) {
        const s = search.trim();
        query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`);
      }

      const { data, error, count } = await query;

      console.log('[API] Admin orders: Orders count:', data?.length || 0, 'Total:', count);

      if (error) {
        console.error('[API] Admin orders: Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: data || [], total: count || 0 });
    }

    // Task #27: getAuthenticatedUserFromHeaders trusts middleware-verified x-user-*
    // headers (DB-verified upstream: ADMIN+ACTIVE), skipping the redundant getUser() RTT.
    // 認証結果（誰が認証されるか）は不変。検証経路の最適化のみ。
    // NOTE: role 認可は引き続き下の profiles SELECT で検証（認可ロジック不変）。
    const authUser = await getAuthenticatedUserFromHeaders(request);

    if (!authUser) {
      console.warn('[API] Admin orders: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get service role client for RLS bypass
    const supabaseService = createServiceClient();

    // Fetch user profile to check admin role
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    // Check admin role (ADMIN厳格 — 全 admin ルートと統一)
    if (!profile || profile.role !== 'ADMIN') {
      console.error('[API] Admin orders: Forbidden for user:', authUser.id, 'Role:', profile?.role);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const quotationId = searchParams.get('quotation_id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '10', 10);
    const offset = (page - 1) * pageSize;

    // Build query with pagination
    let query = supabaseService
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Handle multiple statuses (comma-separated)
    if (statusParam && statusParam !== 'all') {
      const statuses = statusParam.split(',').map(s => s.trim());
      if (statuses.length === 1) {
        query = query.eq('status', statuses[0]);
      } else {
        query = query.in('status', statuses);
      }
    }

    if (quotationId) {
      query = query.eq('quotation_id', quotationId);
      console.log('[API] Admin orders: Filtering by quotation_id:', quotationId);
    }

    // Issue 4: search by order_number or customer name/email
    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`);
    }

    const { data, error, count } = await query;

    console.log('[API] Admin orders: Orders count:', data?.length || 0, 'Total:', count);

    if (error) {
      console.error('[API] Admin orders: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [], total: count || 0 });
  } catch (error) {
    console.error('[API] Admin orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

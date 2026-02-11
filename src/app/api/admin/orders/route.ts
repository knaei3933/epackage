/**
 * Admin Orders API
 *
 * 管理者用注文一覧取得API
 * - SSR/CSR両対応、DEV_MODE対応
 * - Cookie-based authentication for client-side navigation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check for DEV_MODE mock auth first
    const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

    if (isDevMode) {
      // In DEV_MODE, use headers set by middleware
      const userRole = request.headers.get('x-user-role');

      console.log('[API] Admin orders: DEV_MODE active, role from header:', userRole);

      // Check admin role from header
      const adminRoles = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];
      if (!userRole || !adminRoles.includes(userRole)) {
        console.error('[API] Admin orders: Forbidden in DEV_MODE. Role:', userRole);
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
      const status = searchParams.get('status');
      const quotationId = searchParams.get('quotation_id');

      // Build query
      let query = supabaseService
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (quotationId) {
        query = query.eq('quotation_id', quotationId);
        console.log('[API] Admin orders: Filtering by quotation_id:', quotationId);
      }

      const { data, error } = await query;

      console.log('[API] Admin orders: Orders count:', data?.length || 0);

      if (error) {
        console.error('[API] Admin orders: Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: data || [] });
    }

    // Standard authentication flow
    const authUser = await getAuthenticatedUser(request);

    if (!authUser || !authUser.id) {
      console.warn('[API] Admin orders: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] Admin orders: User authenticated:', authUser.id);

    // Get service role client for RLS bypass
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch user profile to check admin role
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    // Check admin role
    const adminRoles = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];
    if (!profile || !adminRoles.includes(profile.role)) {
      console.error('[API] Admin orders: Forbidden for user:', authUser.id, 'Role:', profile?.role);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const quotationId = searchParams.get('quotation_id');

    // Build query
    let query = supabaseService
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (quotationId) {
      query = query.eq('quotation_id', quotationId);
      console.log('[API] Admin orders: Filtering by quotation_id:', quotationId);
    }

    const { data, error } = await query;

    console.log('[API] Admin orders: Orders count:', data?.length || 0);

    if (error) {
      console.error('[API] Admin orders: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('[API] Admin orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

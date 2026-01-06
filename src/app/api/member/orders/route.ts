/**
 * Member Orders API
 * GET /api/member/orders - List authenticated member's orders with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
  quotations?: {
    id: string;
    quotation_number: string;
    pdf_url: string | null;
  } | null;
  order_items?: Database['public']['Tables']['order_items']['Row'][];
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });

    // Check for DEV_MODE header from middleware
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Orders API] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: '認証されていません' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query - fetch only authenticated user's orders
    let query = supabase
      .from('orders')
      .select(`
        *,
        quotations (
          id,
          quotation_number,
          pdf_url
        ),
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply search filter (order_number, customer_name)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', new Date(endDate).toISOString());
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: '注文一覧の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
    });

  } catch (error) {
    console.error('Member Orders API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

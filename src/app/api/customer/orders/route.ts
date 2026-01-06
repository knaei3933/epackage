/**
 * Customer Orders API
 * GET /api/customer/orders - List customer's orders with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { OrderFilters, PortalOrder, OrderStatus } from '@/types/portal';
import { buildSafeIlikeQuery, isValidSortDirection } from '@/lib/sql-helpers';

const STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
  'WORK_ORDER',
  'CONTRACT_SENT',
  'CONTRACT_SIGNED',
  'PRODUCTION',
  'STOCK_IN',
  'SHIPPED',
  'DELIVERED',
];

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const sortField = searchParams.get('sort_field') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - only fetch customer's own orders
    let query = supabase
      .from('orders')
      .select(`
        *,
        companies (
          id,
          name,
          name_kana
        ),
        quotations (
          id,
          quotation_number,
          pdf_url
        ),
        order_items (*)
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }

    // Apply search filter (search in order_number or customer_name)
    if (search) {
      // Safe SQL query with proper escaping to prevent injection
      const safeQuery = buildSafeIlikeQuery(['order_number', 'customer_name'], search);
      query = query.or(safeQuery);
    }

    // Apply sorting with validation
    const ALLOWED_SORT_FIELDS = ['created_at', 'updated_at', 'total_amount'];
    const validatedSortField = ALLOWED_SORT_FIELDS.includes(sortField) ? sortField : 'created_at';
    const ascending = isValidSortDirection(sortOrder) ? sortOrder === 'asc' : false;
    query = query.order(validatedSortField, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: '注文一覧の取得中にエラーが発生しました。', error_code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Enhance orders with portal-specific data
    const enhancedOrders: PortalOrder[] = (orders || []).map((order: any) => {
      // Calculate progress percentage
      const currentIndex = STATUS_ORDER.indexOf(order.status as OrderStatus);
      const progressPercentage = currentIndex >= 0
        ? Math.round(((currentIndex + 1) / STATUS_ORDER.length) * 100)
        : 0;

      // Determine current production stage
      const stageMap: Record<string, string> = {
        'DATA_RECEIVED': 'design_received',
        'WORK_ORDER': 'work_order_created',
        'PRODUCTION': 'printing',
      };
      const currentStageKey = stageMap[order.status] || null;

      return {
        ...order,
        progress_percentage: progressPercentage,
        current_stage: currentStageKey ? {
          id: `${order.id}-${currentStageKey}`,
          key: currentStageKey,
          name: currentStageKey,
          name_ja: currentStageKey,
          status: order.status === 'DELIVERED' ? 'completed' : 'in_progress',
          completed_at: null,
          notes: null,
          photo_url: null,
        } : null,
        production_stages: [], // Will be populated on detail view
        shipment_info: null, // Will be populated on detail view
        can_request_changes: ['PENDING', 'QUOTATION', 'DATA_RECEIVED'].includes(order.status),
        available_documents: [], // Will be populated based on status
        notes: [], // Will be populated on detail view
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: enhancedOrders,
        total: enhancedOrders.length,
      },
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    console.error('Customer Orders API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

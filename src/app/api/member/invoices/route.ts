/**
 * Member Invoices API
 * GET /api/member/invoices - List authenticated member's invoices with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

type InvoiceWithItems = Database['public']['Tables']['invoices']['Row'] & {
  invoice_items?: Database['public']['Tables']['invoice_items']['Row'][];
};

/**
 * Get user ID from middleware headers (cookie-based auth or DEV_MODE header)
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    // Log DEV_MODE usage for debugging
    const isDevMode = headersList.get('x-dev-mode') === 'true';
    if (isDevMode && userId) {
      console.log('[Invoices API] DEV_MODE: Using x-user-id header:', userId);
    }

    return userId;
  } catch (error) {
    console.error('[getUserIdFromRequest] Error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createServiceClient();

    // Build query - fetch only authenticated user's invoices
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter (invoice_number, customer_name, company_name)
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,customer_name.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('issue_date', startDate);
    }
    if (endDate) {
      query = query.lte('issue_date', endDate);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: '請求書一覧の取得中にエラーが発生しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoices || [],
    });

  } catch (error) {
    console.error('Member Invoices API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

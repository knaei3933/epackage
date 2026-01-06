import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/quotations/list
 *
 * Dev Mode API route that bypasses RLS using service role client.
 * This allows mock users to view quotations with placeholder UUID.
 */
export async function GET(request: NextRequest) {
  try {
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    // Security: Only allow in Dev Mode (SECURE: server-side only)
    if (!isDevMode) {
      return NextResponse.json(
        { error: 'This endpoint is for development mode only' },
        { status: 403 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();
    const DEV_MODE_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';

    // Get status filter and search from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    console.log('[API /quotations/list] Dev Mode: Fetching quotations with placeholder UUID');

    // Build query (service role bypasses RLS)
    let query = supabase
      .from('quotations')
      .select('*, quotation_items (id, product_id, product_name, quantity, unit_price, total_price, specifications, order_id)')
      .eq('user_id', DEV_MODE_PLACEHOLDER_USER_ID)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter (quotation_number, customer_name)
    if (search) {
      query = query.or(`quotation_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API /quotations/list] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quotations from database' },
        { status: 500 }
      );
    }

    console.log('[API /quotations/list] Success: Found', data?.length || 0, 'quotations');

    return NextResponse.json({
      success: true,
      quotations: data || [],
    });
  } catch (error) {
    console.error('[API /quotations/list] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

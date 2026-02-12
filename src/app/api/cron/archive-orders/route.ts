/**
 * Cron Job: Auto-Archive Completed Orders
 *
 * 3ヶ月後完了注文を自動アーカイブするcron job
 * - 毎日深夜0時に実行
 * - delivered_atが3ヶ月以上前のDELIVERED注文をアーカイブ
 *
 * @route /api/cron/archive-orders
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Helper function to create service role client
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface ArchiveResponse {
  success: boolean;
  archivedCount?: number;
  message?: string;
  error?: string;
}

/**
 * POST /api/cron/archive-orders
 * Auto-archive orders delivered 3+ months ago
 *
 * Cron schedule: 0 0 * * * (daily at midnight)
 */
export async function POST(request: NextRequest) {
  try {
    // =====================================================
    // Environment Variables & Cron Secret Verification
    // =====================================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const CRON_SECRET = process.env.CRON_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // =====================================================
    // Cron Secret Verification
    // =====================================================
    const authHeader = request.headers.get('authorization');
    const expectedAuth = CRON_SECRET ? `Bearer ${CRON_SECRET}` : null;

    // If CRON_SECRET is set, always verify it (both dev and production)
    if (CRON_SECRET) {
      if (!authHeader || authHeader !== expectedAuth) {
        console.warn('[Cron] ⚠️ Unauthorized access attempt - Invalid or missing auth header');
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            message: 'Valid CRON_SECRET authorization header required'
          },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      // Production requires CRON_SECRET
      console.warn('[Cron] ⚠️ CRON_SECRET not set in production');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error',
          message: 'CRON_SECRET environment variable is required'
        },
        { status: 500 }
      );
    } else {
      console.log('[Cron] ⚠️ Running in dev mode without CRON_SECRET (for testing only)');
    }

    // Use service role client for cron jobs (no user context)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    console.log('[Archive Orders] Starting archival for orders delivered before:', threeMonthsAgo.toISOString());

    // Get delivered orders older than 3 months
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, delivered_at, status')
      .eq('status', 'delivered')  // Use lowercase status
      .lt('delivered_at', threeMonthsAgo.toISOString())
      .is('archived_at', null);

    if (fetchError) {
      console.error('[Archive Orders] Fetch error:', fetchError);
      throw new Error(fetchError.message);
    }

    if (!orders || orders.length === 0) {
      console.log('[Archive Orders] No orders to archive');
      const response: ArchiveResponse = {
        success: true,
        archivedCount: 0,
        message: 'アーカイブ対象の注文はありませんでした。',
      };
      return NextResponse.json(response, { status: 200 });
    }

    console.log(`[Archive Orders] Found ${orders.length} orders to archive`);

    // Archive each order
    let archivedCount = 0;
    for (const order of orders) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (!updateError) {
        archivedCount++;
        console.log(`[Archive Orders] Archived order: ${order.order_number}`);
      } else {
        console.error(`[Archive Orders] Failed to archive order ${order.order_number}:`, updateError);
      }
    }

    console.log(`[Archive Orders] Successfully archived ${archivedCount}/${orders.length} orders`);

    const response: ArchiveResponse = {
      success: true,
      archivedCount,
      message: `${archivedCount}件の注文をアーカイブしました。`,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Archive Orders] Error:', error);

    return NextResponse.json(
      {
        error: 'アーカイブ処理でエラーが発生しました。',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/archive-orders
 * Manual trigger for testing (requires cron secret in header)
 */
export async function GET(request: NextRequest) {
  // Forward to POST for manual testing
  return POST(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

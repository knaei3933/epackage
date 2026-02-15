/**
 * Korea Send Status API Endpoint
 *
 * 韓国送信ステータスAPI
 * - 韓国パートナーへの送信状況を取得
 * - 注文のデータ入稿状態に基づいて送信状況を判断
 *
 * @route GET /api/admin/orders/[id]/korea-send-status
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET - Get Korea send status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Create service client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if files exist for this order
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('id, uploaded_at')
      .eq('order_id', orderId)
      .limit(1);

    if (filesError) {
      console.error('Failed to check files:', filesError);
    }

    const hasFiles = files && files.length > 0;

    // Check order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, updated_at')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Failed to get order:', orderError);
    }

    // Determine if "sent" based on order status and file presence
    // Order statuses that might indicate Korea has been contacted
    const sentStatuses = ['in_production', 'ready', 'completed', 'shipped', 'delivered'];
    const isSent = order && sentStatuses.includes(order.status);

    return NextResponse.json({
      success: true,
      status: {
        sent: isSent || false,
        sent_at: order?.updated_at || null,
        sent_by: null,
        message_sent: null,
        has_files: hasFiles,
      }
    });

  } catch (error) {
    console.error('Get status error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

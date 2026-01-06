/**
 * B2B 대시보드 통계 API (B2B Dashboard Stats API)
 * GET /api/b2b/dashboard/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile && ['ADMIN', 'OPERATOR'].includes(profile.role);

    // N+1 FIX: Use single RPC call instead of 7 separate count queries
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats', {
        p_user_id: isAdmin ? null : user.id,
        p_is_admin: isAdmin || false
      });

    if (statsError || !stats || stats.length === 0) {
      console.error('Dashboard stats error:', statsError);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const s = stats[0];
    const statsResponse = {
      totalOrders: s.total_orders || 0,
      pendingOrders: s.pending_orders || 0,
      completedOrders: s.completed_orders || 0,
      totalQuotations: s.total_quotations || 0,
      pendingQuotations: s.pending_quotations || 0,
      totalSamples: s.total_samples || 0,
      processingSamples: s.processing_samples || 0
    };

    return NextResponse.json({
      success: true,
      data: statsResponse
    });

  } catch (error) {
    console.error('Dashboard Stats API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

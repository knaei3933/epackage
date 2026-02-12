/**
 * Member Dashboard Stats API
 * GET /api/member/dashboard/stats - Get dashboard statistics
 *
 * Migrated from /api/b2b/dashboard/stats
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    let userId: string;

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Dashboard Stats API] Using user ID from middleware:', userId);
    } else {
      // Fallback to SSR client auth
      const response = NextResponse.json({ success: false });
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.delete({ name, ...options });
          },
        },
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('[Dashboard Stats API] Auth error:', authError);
        return NextResponse.json(
          { error: '認証されていません。' },
          { status: 401 }
        );
      }
      userId = user.id;
      console.log('[Dashboard Stats API] Authenticated user:', userId);
    }

    // Create Supabase client for database queries
    const response = NextResponse.json({ success: false });
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    });

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile && ['ADMIN', 'OPERATOR'].includes(profile.role);

    // N+1 FIX: Use single RPC call instead of 7 separate count queries
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats', {
        p_user_id: isAdmin ? null : userId,
        p_is_admin: isAdmin || false
      });

    if (statsError || !stats || stats.length === 0) {
      console.error('Dashboard stats error:', statsError);
      return NextResponse.json(
        { error: 'サーバーエラーが発生しました。' },
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
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

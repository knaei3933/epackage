/**
 * B2B 샘플 요청 목록 API (B2B Samples List API)
 * GET /api/b2b/samples - Get customer sample requests
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('sample_requests')
      .select(`
        id,
        sample_number,
        status,
        created_at,
        sample_items (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by customer if not admin
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: samples, error, count } = await query;

    if (error) {
      throw error;
    }

    // Format data with product count
    const samplesWithCount = (samples || []).map((sample: any) => ({
      id: sample.id,
      sample_number: sample.sample_number,
      status: sample.status,
      created_at: sample.created_at,
      product_count: Array.isArray(sample.sample_items)
        ? sample.sample_items.length
        : (sample.sample_items || 0)
    }));

    return NextResponse.json({
      success: true,
      data: {
        samples: samplesWithCount,
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Samples List API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

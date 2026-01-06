/**
 * B2B 생산 로그 API (B2B Production Logs API)
 * POST /api/b2b/production-logs - Create production log entry
 * GET /api/b2b/production-logs - List production logs
 * GET /api/b2b/orders/[id]/production-logs - Get production logs for order
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/b2b/production-logs - Create production log
export async function POST(request: NextRequest) {
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

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Parse form data (for photo upload)
    const formData = await request.formData();
    const orderId = formData.get('order_id') as string;
    const subStatus = formData.get('sub_status') as string;
    const progressPercentage = parseInt(formData.get('progress_percentage') as string);
    const notes = formData.get('notes') as string | null;
    const photo = formData.get('photo') as File | null;

    if (!orderId || !subStatus) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Handle photo upload if provided
    let photoUrl: string | null = null;
    if (photo) {
      try {
        // Upload to Supabase Storage
        const fileName = `${orderId}-${Date.now()}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('production-photos')
          .upload(fileName, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('production-photos')
            .getPublicUrl(fileName);

          photoUrl = publicUrl;
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        // Continue without photo
      }
    }

    // Create production log
    const { data: log, error: logError } = await supabase
      .from('production_logs')
      .insert({
        order_id: orderId,
        sub_status: subStatus,
        progress_percentage: progressPercentage || 0,
        assigned_to: user.id,
        photo_url: photoUrl,
        notes: notes
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating production log:', logError);
      return NextResponse.json(
        { error: '생산 로그 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Update order current_state
    await supabase
      .from('orders')
      .update({
        current_state: subStatus,
        status: 'PRODUCTION'
      })
      .eq('id', orderId);

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        to_status: 'PRODUCTION',
        changed_by: user.id,
        reason: `생산 진척: ${subStatus} (${progressPercentage}%)`
      });

    return NextResponse.json({
      success: true,
      data: log,
      message: '생산 로그가 저장되었습니다.'
    });

  } catch (error) {
    console.error('Production Logs API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/b2b/orders/[id]/production-logs - Get production logs for order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id: orderId } = await context.params;

    // Get production logs for this order
    const { data: logs, error } = await supabase
      .from('production_logs')
      .select(`
        *,
        profiles (
          kanji_last_name,
          kanji_first_name
        )
      `)
      .eq('order_id', orderId)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching production logs:', error);
      return NextResponse.json(
        { error: '생산 로그를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Production Logs API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

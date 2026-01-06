/**
 * B2B 입고 API (B2B Stock In API)
 * POST /api/b2b/stock-in - Process stock in
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Parse form data
    const formData = await request.formData();
    const orderId = formData.get('order_id') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const warehouseLocation = formData.get('warehouse_location') as string;
    const qualityStatus = formData.get('quality_status') as 'PASSED' | 'FAILED' | 'REWORK';
    const notes = formData.get('notes') as string | null;
    const photo = formData.get('photo') as File | null;

    if (!orderId || !quantity || !warehouseLocation) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Handle photo upload
    let photoUrl: string | null = null;
    if (photo) {
      const fileName = `${orderId}-stockin-${Date.now()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from('stock-in-photos')
        .upload(fileName, photo);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('stock-in-photos')
          .getPublicUrl(fileName);
        photoUrl = publicUrl;
      }
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'STOCK_IN',
        current_state: 'stocked_in',
        state_metadata: {
          quantity,
          warehouse_location: warehouseLocation,
          quality_status: qualityStatus,
          photo_url: photoUrl
        }
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Log stock in
    await supabase
      .from('production_logs')
      .insert({
        order_id: orderId,
        sub_status: 'packaged', // Assuming stock in means packaging is complete
        progress_percentage: 100,
        assigned_to: user.id,
        photo_url: photoUrl,
        notes: `입고 완료 - ${quantity}매, 창고: ${warehouseLocation}, QC: ${qualityStatus}${notes ? ', ' + notes : ''}`
      });

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: 'PRODUCTION',
        to_status: 'STOCK_IN',
        changed_by: user.id,
        reason: `입고 완료: ${quantity}매 (${qualityStatus})`
      });

    return NextResponse.json({
      success: true,
      message: '입고 처리가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Stock In API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

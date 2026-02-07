import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

/**
 * ============================================================
 * Admin Order Cancellation Approval API
 * ============================================================
 *
 * POST /api/admin/orders/[id]/cancellation
 *
 * 관리자가 주문 취소 요청을 승인 또는 거부합니다.
 * admin_order_notes 테이블을 활용합니다.
 */

// ============================================================
// Validation Schema
// ============================================================

const cancellationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get admin user from request
 */
async function getAdminUserId(request: NextRequest): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) return null;

    // Verify user is admin
    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return null;
    }

    return userId;
  } catch (error) {
    console.error('[getAdminUserId] Error:', error);
    return null;
  }
}

// ============================================================
// POST Handler - Approve/Reject Cancellation
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const adminUserId = await getAdminUserId(request);
    if (!adminUserId) {
      return NextResponse.json(
        { error: '管理者権限が必要です', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const validationResult = cancellationActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '無効なデータです',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { action, adminNote } = validationResult.data;
    const supabase = createServiceClient();

    // Get cancellation request note
    const { data: cancellationNote, error: noteError } = await supabase
      .from('admin_order_notes')
      .select('*')
      .eq('order_id', orderId)
      .ilike('notes', '%キャンセルリクエスト%')
      .maybeSingle();

    if (noteError || !cancellationNote) {
      return NextResponse.json(
        { error: 'キャンセルリクエストが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Approve cancellation: change status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Cancellation approval error:', updateError);
        return NextResponse.json(
          { error: 'キャンセル承認に失敗しました', code: 'UPDATE_ERROR' },
          { status: 500 }
        );
      }

      // Update the note to mark as approved
      await supabase
        .from('admin_order_notes')
        .update({
          notes: `${cancellationNote.notes}\n\n管理者: ${adminNote || '承認'} (承認日時: ${new Date().toISOString()})`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cancellationNote.id);

      return NextResponse.json({
        success: true,
        message: 'キャンセルを承認しました',
        orderStatus: 'CANCELLED',
      });
    } else {
      // Reject cancellation: delete the request note
      const { error: deleteError } = await supabase
        .from('admin_order_notes')
        .delete()
        .eq('id', cancellationNote.id);

      if (deleteError) {
        console.error('Cancellation rejection error:', deleteError);
        return NextResponse.json(
          { error: 'キャンセル拒否に失敗しました', code: 'DELETE_ERROR' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'キャンセルリクエストを拒否しました',
        orderStatus: order.status,
      });
    }
  } catch (error) {
    console.error('Cancellation approval API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Cancellation Request Details
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const adminUserId = await getAdminUserId(request);
    if (!adminUserId) {
      return NextResponse.json(
        { error: '管理者権限が必要です', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const supabase = createServiceClient();

    // Get order and cancellation request
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        user_id,
        created_at
      `)
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get cancellation request note
    const { data: cancellationNote } = await supabase
      .from('admin_order_notes')
      .select('*')
      .eq('order_id', orderId)
      .ilike('notes', '%キャンセルリクエスト%')
      .maybeSingle();

    // Get user info
    let requesterInfo = null;
    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, kanji_last_name, kanji_first_name')
        .eq('id', order.user_id)
        .maybeSingle();
      requesterInfo = profile;
    }

    return NextResponse.json({
      success: true,
      data: {
        order,
        cancellationNote,
        requester: requesterInfo,
      },
    });
  } catch (error) {
    console.error('Get cancellation request error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

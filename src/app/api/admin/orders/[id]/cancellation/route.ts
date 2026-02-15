/**
 * Admin Order Cancellation Approval API
 * ============================================================
 * POST /api/admin/orders/[id]/cancellation
 *
 * 관리자가 주문 취소 요청을 승인 또는 거부합니다.
 * admin_order_notes 테이블을 활용합니다.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/api-auth';

// ============================================================
// Constants
// ============================================================

// Admin roles that can access this endpoint
const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// ============================================================
// Validation Schema
// ============================================================

const cancellationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});

// ============================================================
// POST Handler - Approve/Reject Cancellation
// ============================================================

export const POST = withAdminAuth(async (
  request: NextRequest,
  auth
) => {
  // Access params without await for Next.js 16 compatibility
  const params = (request as any).params;
  const orderId = params?.id;

  if (!orderId) {
    return NextResponse.json(
      { error: '注文IDが指定されていません。', code: 'INVALID_PARAMS' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const validationResult = cancellationActionSchema.safeParse(body);

  // Use service client to bypass RLS
  const supabase = createServiceClient();

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

    // Update note to mark as approved
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
    // Reject cancellation: delete request note
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
});

// ============================================================
// GET Handler - Get Cancellation Request Details
// ============================================================

export const GET = withAdminAuth(async (
  request: NextRequest,
  auth
) => {
  // Access params without await for Next.js 16 compatibility
  const params = (request as any).params;
  const orderId = params?.id;

  if (!orderId) {
    return NextResponse.json(
      { error: '注文IDが指定されていません。', code: 'INVALID_PARAMS' },
      { status: 400 }
    );
  }

  // Use service client to bypass RLS
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
});

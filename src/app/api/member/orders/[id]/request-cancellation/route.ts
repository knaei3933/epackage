export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/dashboard';

/**
 * ============================================================
 * Order Cancellation Request API
 * ============================================================
 *
 * POST /api/member/orders/[id]/request-cancellation
 *
 * 회원이 주문 취소를 요청합니다.
 * 관리자 승인이 필요합니다 (admin_order_notes 테이블 활용)
 */

// ============================================================
// Validation Schema
// ============================================================

const cancellationRequestSchema = z.object({
  reason: z.string().optional(),
});

// ============================================================
// POST Handler - Request Cancellation
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const validationResult = cancellationRequestSchema.safeParse(body);

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

    const { reason } = validationResult.data;
    const supabase = createServiceClient();

    // Check if order exists and belongs to user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, user_id, order_number')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    const cancellableStatuses = [
      'pending',
      'quotation',
      'data_received',
      'work_order',
      'contract_sent',
    ];

    // Case-insensitive comparison
    const normalizedStatus = order.status?.toLowerCase() || '';
    if (!cancellableStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          error: '現在のステータスではキャンセルリクエストできません',
          code: 'INVALID_STATUS',
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // Check if cancellation request already exists
    const { data: existingNote } = await supabase
      .from('admin_order_notes')
      .select('id')
      .eq('order_id', orderId)
      .ilike('notes', '%キャンセルリクエスト%')
      .maybeSingle();

    if (existingNote) {
      return NextResponse.json(
        {
          error: 'すでにキャンセルリクエストが存在します',
          code: 'ALREADY_REQUESTED',
        },
        { status: 400 }
      );
    }

    // Create cancellation request in admin_order_notes table
    const cancellationReason = reason || 'なし';
    const noteContent = `キャンセルリクエスト\n理由: ${cancellationReason}\nリクエスト日時: ${new Date().toISOString()}`;

    const { error: noteError } = await supabase
      .from('admin_order_notes')
      .insert({
        order_id: orderId,
        admin_id: userId,
        notes: noteContent,
      });

    if (noteError) {
      console.error('Cancellation request note error:', noteError);
      return NextResponse.json(
        { error: 'キャンセルリクエストの登録に失敗しました', code: 'INSERT_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'キャンセルリクエストを送信しました。管理者の承認をお待ちください。',
    });
  } catch (error) {
    console.error('Cancellation request API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Delete Order Comment API Route
 *
 * 注文コメント削除API
 * - DELETE: コメントの削除（作成から24時間以内のみ可能）
 *
 * @route /api/member/orders/[id]/comments/[commentId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';
import { createApiRateLimiter, checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';
import { getAuditLogger } from '@/lib/audit-logger';

// ============================================================
// Types
// ============================================================

interface DeleteCommentResponse {
  success: boolean;
  error?: string;
  errorEn?: string;
  message?: string;
}

// ============================================================
// Constants
// ============================================================

const DELETE_TIME_LIMIT_HOURS = 24; // 24時間以内のみ削除可能

// ============================================================
// Rate Limiter
// ============================================================

const deleteRateLimiter = createApiRateLimiter();

// ============================================================
// DELETE Handler - Delete Comment
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  console.log('[Delete Comment] ===== START =====');

  // Check rate limit
  const rateLimitResult = checkRateLimit(request, deleteRateLimiter);
  if (!rateLimitResult.allowed) {
    console.log('[Delete Comment] Rate limit exceeded');
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId, commentId } = await params;
    console.log('[Delete Comment] Order ID:', orderId);
    console.log('[Delete Comment] Comment ID:', commentId);

    const { client: supabase } = createSupabaseSSRClient(request);

    // Get current user
    console.log('[Delete Comment] Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile && profile.role === 'ADMIN';

    // For admins, use service role client to bypass RLS
    const dataClient = isAdmin ? createServiceClient() : (supabase as any);

    // Fetch the comment to verify ownership and time limit
    const { data: comment, error: commentError } = await dataClient
      .from('order_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { success: false, error: 'コメントが見つかりません。', errorEn: 'Comment not found' },
        { status: 404 }
      );
    }

    // Verify comment belongs to the specified order
    if (comment.order_id !== orderId) {
      return NextResponse.json(
        { success: false, error: 'このコメントは指定された注文のものではありません。', errorEn: 'Comment does not belong to this order' },
        { status: 400 }
      );
    }

    // Check ownership: only comment author or admin can delete
    const isAuthor = comment.author_id === user.id;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'このコメントを削除する権限がありません。', errorEn: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }

    // Check time limit: only delete if within 24 hours of creation
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    console.log('[Delete Comment] Hours since creation:', hoursSinceCreation);

    if (hoursSinceCreation > DELETE_TIME_LIMIT_HOURS) {
      return NextResponse.json(
        {
          success: false,
          error: `作成から${DELETE_TIME_LIMIT_HOURS}時間を経過したコメントは削除できません。`,
          errorEn: `Comments cannot be deleted after ${DELETE_TIME_LIMIT_HOURS} hours.`
        },
        { status: 403 }
      );
    }

    // Soft delete: set deleted_at timestamp
    const { error: deleteError } = await dataClient
      .from('order_comments')
      .update({ deleted_at: now.toISOString() })
      .eq('id', commentId);

    if (deleteError) {
      console.error('[Delete Comment] Error:', deleteError);
      console.error('[Delete Comment] Error Code:', deleteError.code);
      console.error('[Delete Comment] Error Message:', deleteError.message);

      // Log audit for failed deletion
      const auditLogger = getAuditLogger();
      await auditLogger.log({
        event_type: 'error_occurred',
        resource_type: 'other',
        resource_id: commentId,
        user_id: user.id,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        outcome: 'failure',
        error_message: deleteError.message,
        details: {
          action: 'delete_comment',
          order_id: orderId,
          comment_id: commentId,
        },
      }).catch(err => console.error('[Audit Log] Failed to log error:', err));

      return NextResponse.json(
        { success: false, error: 'コメントの削除に失敗しました。', errorEn: 'Failed to delete comment', details: deleteError.message },
        { status: 500 }
      );
    }

    // Log audit for successful deletion
    const auditLogger = getAuditLogger();
    await auditLogger.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: commentId,
      user_id: user.id,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                 request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      outcome: 'success',
      details: {
        action: 'delete_comment',
        order_id: orderId,
        comment_id: commentId,
        hours_since_creation: Math.round(hoursSinceCreation * 100) / 100,
        is_admin: isAdmin,
      },
    }).catch(err => console.error('[Audit Log] Failed to log success:', err));

    const response: DeleteCommentResponse = {
      success: true,
      message: 'コメントを削除しました。',
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    return addRateLimitHeaders(nextResponse, rateLimitResult);

  } catch (error: any) {
    console.error('[Delete Comment] Unexpected error:', error);
    console.error('[Delete Comment] Error stack:', error?.stack);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error?.message
      },
      { status: 500 }
    );
  }
}

/**
 * Member Approval Request Response API Route (Integrated from /api/customer/orders/[id]/approvals/[requestId])
 *
 * 会員承認リクエスト応答API
 * - PATCH: 承認/拒否応答の送信
 *
 * @route /api/member/orders/[id]/approvals/[requestId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { Database } from '@/types/database';
import { createApiRateLimiter, checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';
import { updateApprovalSchema, safeParseRequestBody } from '@/types/api-validation';
import { getAuditLogger } from '@/lib/audit-logger';

// ============================================================
// Types
// ============================================================

interface UpdateApprovalRequest {
  status: 'approved' | 'rejected';
  response_notes?: string;
}

interface UpdateApprovalResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    response_notes: string | null;
    responded_at: string;
  };
  error?: string;
  errorEn?: string;
}

// ============================================================
// Rate Limiter
// ============================================================

const approvalResponseRateLimiter = createApiRateLimiter();

// ============================================================
// PATCH Handler - Respond to Approval Request
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request, approvalResponseRateLimiter);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId, requestId } = await params;
    const { client: supabase } = createSupabaseSSRClient(request);

    // Get current user
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

    // Verify user has access to this order
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order || !order.user_id) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // Check access: admin or order owner
    if (!isAdmin && order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch the approval request with version for optimistic locking
    const { data: approval, error: approvalError } = await (supabase as any)
      .from('customer_approval_requests')
      .select('id, status, version, expires_at')
      .eq('id', requestId)
      .eq('order_id', orderId)
      .single();

    if (approvalError || !approval) {
      return NextResponse.json(
        { success: false, error: '承認リクエストが見つかりません。', errorEn: 'Approval request not found' },
        { status: 404 }
      );
    }

    // Check if request is still pending
    if (approval.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '既に応答済みのリクエストです。', errorEn: 'Request already responded' },
        { status: 409 } // Conflict - already responded
      );
    }

    // Check if request has expired
    if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: '有効期限が切れているリクエストです。', errorEn: 'Request has expired' },
        { status: 400 }
      );
    }

    // Parse and validate request body using Zod
    const body = await request.json();
    const validationResult = safeParseRequestBody(updateApprovalSchema, body);

    if (validationResult.error) {
      return NextResponse.json(validationResult.error, { status: 400 });
    }

    const { status, response_notes } = validationResult.data;

    // Update approval request with optimistic locking
    // The version check ensures the record hasn't been modified since we fetched it
    const currentVersion = approval.version || 1;
    const { data: updatedApproval, error: updateError } = await (supabase as any)
      .from('customer_approval_requests')
      .update({
        status,
        response_notes: response_notes || null,
        responded_at: new Date().toISOString(),
        responded_by: user.id,
        // version will be auto-incremented by the database trigger
      })
      .eq('id', requestId)
      .eq('version', currentVersion) // Optimistic lock: only update if version matches
      .select('id, status, response_notes, responded_at')
      .single();

    // Check if update failed due to version mismatch (race condition)
    if (updateError || !updatedApproval) {
      // If no rows were affected, it means the version didn't match (race condition)
      const { count } = await (supabase as any)
        .from('customer_approval_requests')
        .select('*', { count: 'exact', head: true })
        .eq('id', requestId);

      if (count !== null && count > 0) {
        // Record exists but version mismatch - race condition detected
        console.warn('[Member Approval Response PATCH] Race condition detected - version mismatch');
        return NextResponse.json(
          {
            success: false,
            error: '他のユーザーが先に応答しました。ページを更新してください。',
            errorEn: 'This request was already responded to by another user. Please refresh the page.'
          },
          { status: 409 } // Conflict
        );
      }

      console.error('[Member Approval Response PATCH] Error:', updateError);

      // Log audit for failed approval response
      const auditLogger = getAuditLogger();
      await auditLogger.log({
        event_type: 'error_occurred',
        resource_type: 'other',
        resource_id: requestId,
        user_id: user.id,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        outcome: 'failure',
        error_message: updateError.message,
        details: {
          action: 'respond_approval',
          order_id: orderId,
          approval_request_id: requestId,
          attempted_status: status,
        },
      }).catch(err => console.error('[Audit Log] Failed to log error:', err));

      return NextResponse.json(
        { success: false, error: '応答の保存に失敗しました。', errorEn: 'Failed to save response' },
        { status: 500 }
      );
    }

    // Log audit for successful approval response
    const auditLogger2 = getAuditLogger();
    await auditLogger2.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: requestId,
      user_id: user.id,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                 request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      outcome: 'success',
      details: {
        action: 'respond_approval',
        order_id: orderId,
        approval_request_id: requestId,
        response_status: status,
        has_notes: !!response_notes,
      },
    }).catch(err => console.error('[Audit Log] Failed to log success:', err));

    const response: UpdateApprovalResponse = {
      success: true,
      data: updatedApproval as { id: string; status: string; response_notes: string | null; responded_at: string },
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    return addRateLimitHeaders(nextResponse, rateLimitResult);

  } catch (error) {
    console.error('[Member Approval Response PATCH] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Order Comments API Routes
 *
 * 注文コメントAPI
 * - GET: 注文コメントリストの取得
 * - POST: 新しいコメントの作成
 *
 * @route /api/member/orders/[id]/comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createApiRateLimiter, checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';
import { createCommentSchema, safeParseRequestBody } from '@/types/api-validation';
import { getAuditLogger } from '@/lib/audit-logger';

// ============================================================
// Types
// ============================================================

interface OrderComment {
  id: string;
  order_id: string;
  content: string;
  comment_type: string;
  author_id: string;
  author_role: string;
  is_internal: boolean;
  attachments: string[];
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface CreateCommentRequest {
  content: string;
  comment_type?: 'general' | 'production' | 'shipping' | 'billing' | 'correction' | 'internal';
  parent_comment_id?: string;
  attachments?: string[];
}

interface CreateCommentResponse {
  success: boolean;
  data?: OrderComment;
  error?: string;
  errorEn?: string;
}

interface GetCommentsResponse {
  success: boolean;
  data?: OrderComment[];
  error?: string;
  errorEn?: string;
}

// ============================================================
// Rate Limiter
// ============================================================

const commentsRateLimiter = createApiRateLimiter();

// ============================================================
// GET Handler - List Order Comments
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request, commentsRateLimiter);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId } = await params;
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

    // Build query - non-admin users only see non-internal comments
    let query = (supabase as any)
      .from('order_comments')
      .select(`
        *,
        author:author_id(id, full_name, email, avatar_url)
      `)
      .eq('order_id', orderId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    // Non-admin users don't see internal comments
    if (!isAdmin) {
      query = query.eq('is_internal', false);
    }

    const { data: comments, error: commentsError } = await query;

    if (commentsError) {
      console.error('[Order Comments GET] Error:', commentsError);
      return NextResponse.json(
        { success: false, error: 'コメントの取得に失敗しました。', errorEn: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    const response: GetCommentsResponse = {
      success: true,
      data: comments as OrderComment[],
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    return addRateLimitHeaders(nextResponse, rateLimitResult);

  } catch (error) {
    console.error('[Order Comments GET] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Create New Comment
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request, commentsRateLimiter);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId } = await params;
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

    // Parse and validate request body using Zod
    const body = await request.json();
    const validationResult = safeParseRequestBody(createCommentSchema, body);

    if (validationResult.error) {
      return NextResponse.json(validationResult.error, { status: 400 });
    }

    const { content, comment_type = 'general', parent_comment_id, attachments = [] } = validationResult.data;

    // Determine author role based on profile
    const authorRole = isAdmin ? 'admin' : 'customer';

    // For non-admin users, prevent creating internal comments
    const isInternal = comment_type === 'internal';
    if (!isAdmin && isInternal) {
      return NextResponse.json(
        { success: false, error: '内部コメントを作成する権限がありません。', errorEn: 'Cannot create internal comments' },
        { status: 403 }
      );
    }

    // Verify parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await (supabase as any)
        .from('order_comments')
        .select('id')
        .eq('id', parent_comment_id)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json(
          { success: false, error: '親コメントが見つかりません。', errorEn: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create comment
    const { data: newComment, error: createError } = await (supabase as any)
      .from('order_comments')
      .insert({
        order_id: orderId,
        content: content.trim(),
        comment_type,
        author_id: user.id,
        author_role: authorRole,
        is_internal: isInternal,
        attachments,
        parent_comment_id: parent_comment_id || null,
        metadata: {},
      })
      .select(`
        *,
        author:author_id(id, full_name, email, avatar_url)
      `)
      .single();

    if (createError) {
      console.error('[Order Comments POST] Error:', createError);

      // Log audit for failed comment creation
      const auditLogger = getAuditLogger();
      await auditLogger.log({
        event_type: 'error_occurred',
        resource_type: 'other',
        resource_id: orderId,
        user_id: user.id,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        outcome: 'failure',
        error_message: createError.message,
        details: {
          action: 'create_comment',
          order_id: orderId,
          comment_type,
        },
      }).catch(err => console.error('[Audit Log] Failed to log error:', err));

      return NextResponse.json(
        { success: false, error: 'コメントの作成に失敗しました。', errorEn: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Log audit for successful comment creation
    const auditLogger = getAuditLogger();
    await auditLogger.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: newComment?.id,
      user_id: user.id,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                 request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      outcome: 'success',
      details: {
        action: 'create_comment',
        order_id: orderId,
        comment_type,
        is_internal,
        has_parent_comment: !!parent_comment_id,
        has_attachments: attachments && attachments.length > 0,
      },
    }).catch(err => console.error('[Audit Log] Failed to log success:', err));

    const response: CreateCommentResponse = {
      success: true,
      data: newComment as OrderComment,
    };

    const nextResponse = NextResponse.json(response, { status: 201 });
    return addRateLimitHeaders(nextResponse, rateLimitResult);

  } catch (error) {
    console.error('[Order Comments POST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

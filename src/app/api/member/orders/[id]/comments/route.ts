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
import { createServiceClient } from '@/lib/supabase';
import { createApiRateLimiter, checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';
import { createCommentSchema, safeParseRequestBody } from '@/types/api-validation';
import { getAuditLogger } from '@/lib/audit-logger';

// ============================================================
// Constants
// ============================================================

// Admin roles that can access any order
const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// Korean member and production roles
const INTERNAL_ROLES = ['KOREAN_MEMBER', 'PRODUCTION'];

// All internal roles (admin + korean_member + production)
const ALL_INTERNAL_ROLES = [...ADMIN_ROLES, ...INTERNAL_ROLES];

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
  console.log('[Order Comments GET] ===== START =====');

  // Check rate limit
  const rateLimitResult = checkRateLimit(request, commentsRateLimiter);
  if (!rateLimitResult.allowed) {
    console.log('[Order Comments GET] Rate limit exceeded');
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId } = await params;
    console.log('[Order Comments GET] Order ID:', orderId);

    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Normal auth: Use cookie-based auth with getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user profile to check role
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Check if user has admin role
    const isAdmin = profile && profile.role && ADMIN_ROLES.includes(profile.role);

    // Check if user is Korean member or production staff
    const isKoreanMember = profile && profile.role === 'KOREAN_MEMBER';
    const isProduction = profile && profile.role === 'PRODUCTION';

    // For admins and internal staff, use service role client to bypass RLS
    const dataClient = (isAdmin || isKoreanMember || isProduction) ? createServiceClient() : (supabase as any);

    // Verify user has access to this order
    const { data: order, error: orderError } = await dataClient
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

    // Check access: admin/internal staff or order owner
    if (!isAdmin && !isKoreanMember && !isProduction && order.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Build query - first get comments without author join
    let query = dataClient
      .from('order_comments')
      .select('*')
      .eq('order_id', orderId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }); // 最新が一番上

    // Role-based filtering
    if (isAdmin) {
      // Admin: See all comments (no filtering)
    } else if (isKoreanMember || isProduction) {
      // Korean members and production: Only see admin/korean_member/production comments
      query = query.in('author_role', ['admin', 'korean_member', 'production']);
    } else {
      // Customer: Only see non-internal comments (customer + admin)
      query = query.eq('is_internal', false).in('author_role', ['customer', 'admin']);
    }

    const { data: comments, error: commentsError } = await query;

    if (commentsError) {
      console.error('[Order Comments GET] DB Error:', JSON.stringify(commentsError, null, 2));
      console.error('[Order Comments GET] Error Code:', commentsError.code);
      console.error('[Order Comments GET] Error Message:', commentsError.message);
      console.error('[Order Comments GET] Error Details:', commentsError.details);
      console.error('[Order Comments GET] Error Hint:', commentsError.hint);

      // Check if table doesn't exist - return empty array instead of error
      if (commentsError.code === '42P01' || commentsError.message?.includes('does not exist')) {
        console.log('[Order Comments GET] Table does not exist, returning empty array');
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'コメントの取得に失敗しました。',
          errorEn: 'Failed to fetch comments',
          details: commentsError.message,
          code: commentsError.code
        },
        { status: 500 }
      );
    }

    // If there are comments, fetch author information separately
    if (comments && comments.length > 0) {
      const authorIds = [...new Set(comments.map((c: any) => c.author_id))];
      const { data: authors } = await dataClient
        .from('profiles')
        .select('id, kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, email, company_name, role')
        .in('id', authorIds);

      const authorMap = new Map((authors || []).map((a: any) => {
        // Construct display name from available fields
        const displayName = a.kanji_last_name && a.kanji_first_name
          ? `${a.kanji_last_name} ${a.kanji_first_name}`
          : a.company_name || a.email || '不明';

        return [a.id, {
          id: a.id,
          full_name: displayName,
          email: a.email,
          avatar_url: null,
          role: a.role
        }];
      }));

      // Attach author info to each comment
      (comments as any[]).forEach((comment) => {
        comment.author = authorMap.get(comment.author_id);
      });
    }

    const response: GetCommentsResponse = {
      success: true,
      data: comments as OrderComment[],
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    return addRateLimitHeaders(nextResponse, rateLimitResult);

  } catch (error: any) {
    console.error('[Order Comments GET] Unexpected error:', error);
    console.error('[Order Comments GET] Error stack:', error?.stack);

    // Check if it's a "table does not exist" error
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      console.log('[Order Comments GET] Table does not exist (caught), returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

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

// ============================================================
// POST Handler - Create New Comment
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[Order Comments POST] ===== START =====');

  // Check rate limit
  const rateLimitResult = checkRateLimit(request, commentsRateLimiter);
  if (!rateLimitResult.allowed) {
    console.log('[Order Comments POST] Rate limit exceeded');
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId } = await params;
    console.log('[Order Comments POST] Order ID:', orderId);

    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get current user
    console.log('[Order Comments POST] Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Normal auth: Use cookie-based auth with getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user profile to check role
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Check if user has admin role
    const isAdmin = profile && profile.role && ADMIN_ROLES.includes(profile.role);

    // Check if user is Korean member or production staff
    const isKoreanMember = profile && profile.role === 'KOREAN_MEMBER';
    const isProduction = profile && profile.role === 'PRODUCTION';

    // For admins and internal staff, use service role client to bypass RLS
    const dataClient = (isAdmin || isKoreanMember || isProduction) ? createServiceClient() : (supabase as any);

    // Verify user has access to this order
    const { data: order, error: orderError } = await dataClient
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

    // Check access: admin/internal staff or order owner
    if (!isAdmin && !isKoreanMember && !isProduction && order.user_id !== userId) {
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
    let authorRole: 'customer' | 'admin' | 'korean_member' | 'production';
    if (isAdmin) {
      authorRole = 'admin';
    } else if (isKoreanMember) {
      authorRole = 'korean_member';
    } else if (isProduction) {
      authorRole = 'production';
    } else {
      authorRole = 'customer';
    }

    // For customer users, prevent creating internal comments
    const isInternal = comment_type === 'internal';
    if (!isAdmin && !isKoreanMember && !isProduction && isInternal) {
      return NextResponse.json(
        { success: false, error: '内部コメントを作成する権限がありません。', errorEn: 'Cannot create internal comments' },
        { status: 403 }
      );
    }

    // Korean member and production comments are always internal
    const shouldMarkInternal = isInternal || isKoreanMember || isProduction;

    // Verify parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await dataClient
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
    const { data: newComment, error: createError } = await dataClient
      .from('order_comments')
      .insert({
        order_id: orderId,
        content: content.trim(),
        comment_type,
        author_id: userId,
        author_role: authorRole,
        is_internal: shouldMarkInternal,
        attachments,
        parent_comment_id: parent_comment_id || null,
        metadata: {},
      })
      .select('*')
      .single();

    if (createError) {
      console.error('[Order Comments POST] Error:', createError);
      console.error('[Order Comments POST] Error Code:', createError.code);
      console.error('[Order Comments POST] Error Message:', createError.message);

      // Check if table doesn't exist
      if (createError.code === '42P01' || createError.message?.includes('does not exist') || createError.message?.includes('relation') && createError.message?.includes('does not exist')) {
        console.log('[Order Comments POST] Table does not exist, returning helpful error');
        return NextResponse.json(
          {
            success: false,
            error: 'コメント機能は現在準備中です。管理者にお問い合わせください。',
            errorEn: 'Comments feature is currently being set up. Please contact the administrator.',
            details: 'order_comments table does not exist'
          },
          { status: 503 }  // Service Unavailable
        );
      }

      // Log audit for failed comment creation
      const auditLogger = getAuditLogger();
      await auditLogger.log({
        event_type: 'error_occurred',
        resource_type: 'other',
        resource_id: orderId,
        user_id: userId,
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
        { success: false, error: 'コメントの作成に失敗しました。', errorEn: 'Failed to create comment', details: createError.message },
        { status: 500 }
      );
    }

    // Fetch author information separately
    if (newComment) {
      const { data: authorData } = await dataClient
        .from('profiles')
        .select('id, kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, email, company_name, role')
        .eq('id', newComment.author_id)
        .single();

      if (authorData) {
        // Construct display name from available fields
        const displayName = authorData.kanji_last_name && authorData.kanji_first_name
          ? `${authorData.kanji_last_name} ${authorData.kanji_first_name}`
          : authorData.company_name || authorData.email || '不明';

        (newComment as any).author = {
          id: authorData.id,
          full_name: displayName,
          email: authorData.email,
          avatar_url: null,
          role: authorData.role
        };
      }
    }

    // Log audit for successful comment creation
    const auditLogger = getAuditLogger();
    await auditLogger.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: newComment?.id,
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                 request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      outcome: 'success',
      details: {
        action: 'create_comment',
        order_id: orderId,
        comment_type,
        author_role: authorRole,
        is_internal: shouldMarkInternal,
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

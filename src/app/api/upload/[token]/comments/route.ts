/**
 * Token-Based Designer Comments API
 *
 * トークンベースデザイナーコメントAPI
 * - GET: Get comments for token holder (Korean designer)
 * - POST: Post comment from token holder with Korean→Japanese translation
 *
 * @route /api/upload/[token]/comments
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createCommentSchema, safeParseRequestBody } from '@/types/api-validation';
import { translateKoreanToJapanese } from '@/lib/translation';
import * as crypto from 'crypto';

// ============================================================
// Constants
// ============================================================

// Helper to hash token (SHA-256)
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================
// Types
// ============================================================

interface TokenComment {
  id: string;
  order_id: string;
  content: string;
  content_translated: string | null;
  original_language: string | null;
  translation_status: string | null;
  comment_type: string;
  author_id: string | null;
  author_name_display: string | null;
  author_role: string;
  visibility: string;
  attachments: string[];
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateTokenCommentRequest {
  content: string;
  comment_type?: string;
  visibility?: string;
  parent_comment_id?: string;
  attachments?: string[];
}

interface CreateTokenCommentResponse {
  success: boolean;
  comment?: TokenComment;
  error?: string;
  errorEn?: string;
}

interface GetTokenCommentsResponse {
  success: boolean;
  data?: TokenComment[];
  error?: string;
  errorEn?: string;
}

// ============================================================
// Token Validation Helper
// ============================================================

/**
 * Validate token and return token info
 */
async function validateToken(supabase: any, tokenHash: string) {
  const { data: tokenData, error: tokenError } = await supabase
    .from('designer_upload_tokens')
    .select('id, order_id, designer_id, designer_name, designer_email, status, expires_at')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !tokenData) {
    return { valid: false, error: 'Invalid token' };
  }

  // Check status
  if (tokenData.status !== 'active') {
    return { valid: false, error: `Token is ${tokenData.status}` };
  }

  // Check expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    // Auto-expire
    await supabase
      .from('designer_upload_tokens')
      .update({ status: 'expired' })
      .eq('id', tokenData.id);
    return { valid: false, error: 'Token has expired' };
  }

  return { valid: true, token: tokenData };
}

// ============================================================
// GET Handler - List Comments for Token Holder
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  console.log('[Token Comments GET] ===== START =====');

  try {
    const { token } = await params;
    const tokenHash = hashToken(token);
    console.log('[Token Comments GET] Token hash:', tokenHash.substring(0, 16) + '...');

    const supabase = createServiceClient();

    // Validate token
    const validationResult = await validateToken(supabase, tokenHash);
    if (!validationResult.valid) {
      console.log('[Token Comments GET] Token validation failed:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'トークンが無効です。',
          errorEn: validationResult.error
        },
        { status: 401 }
      );
    }

    const tokenData = validationResult.token!;
    console.log('[Token Comments GET] Token valid for order:', tokenData.order_id);

    // Update last_accessed_at
    await supabase
      .from('designer_upload_tokens')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Fetch comments for the order
    // Token holders see: all comments (admin, customer, other token-based comments)
    const { data: comments, error: commentsError } = await supabase
      .from('order_comments')
      .select('*')
      .eq('order_id', tokenData.order_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('[Token Comments GET] DB Error:', commentsError);

      // Check if table doesn't exist
      if (commentsError.code === '42P01' || commentsError.message?.includes('does not exist')) {
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
        },
        { status: 500 }
      );
    }

    const response: GetTokenCommentsResponse = {
      success: true,
      data: comments as TokenComment[],
    };

    console.log('[Token Comments GET] Returning', comments?.length || 0, 'comments');
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('[Token Comments GET] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Create Comment from Token Holder
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  console.log('[Token Comments POST] ===== START =====');

  try {
    const { token } = await params;
    const tokenHash = hashToken(token);
    console.log('[Token Comments POST] Token hash:', tokenHash.substring(0, 16) + '...');

    const supabase = createServiceClient();

    // Validate token
    const validationResult = await validateToken(supabase, tokenHash);
    if (!validationResult.valid) {
      console.log('[Token Comments POST] Token validation failed:', validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'トークンが無効です。',
          errorEn: validationResult.error
        },
        { status: 401 }
      );
    }

    const tokenData = validationResult.token!;
    console.log('[Token Comments POST] Token valid for order:', tokenData.order_id);

    // Parse and validate request body
    const body = await request.json();
    const parseResult = safeParseRequestBody(createCommentSchema, body);

    if (parseResult.error) {
      return NextResponse.json(parseResult.error, { status: 400 });
    }

    const {
      content,
      comment_type = 'correction',
      visibility = 'all',
      parent_comment_id,
      attachments = [],
    } = parseResult.data as CreateTokenCommentRequest;

    // Verify parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentComment } = await supabase
        .from('order_comments')
        .select('id')
        .eq('id', parent_comment_id)
        .eq('order_id', tokenData.order_id)
        .maybeSingle();

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            error: '親コメントが見つかりません。',
            errorEn: 'Parent comment not found',
          },
          { status: 404 }
        );
      }
    }

    // ============================================================
    // Translate Korean to Japanese
    // ============================================================
    let contentTranslated: string | null = null;
    let translationStatus: 'pending' | 'translated' | 'failed' = 'translated';

    console.log('[Token Comments POST] Translating Korean to Japanese...');
    try {
      const translationResult = await translateKoreanToJapanese(content);
      contentTranslated = translationResult.translatedText;
      translationStatus = 'translated';
      console.log('[Token Comments POST] Translation successful');
    } catch (translationError) {
      console.error('[Token Comments POST] Translation failed:', translationError);
      translationStatus = 'failed';
      // Continue without translation - admin can manually translate later
    }

    // Get designer name for display
    const displayName = tokenData.designer_name || 'Designer';

    // Create comment with NULL author_id (token-based)
    const { data: newComment, error: createError } = await supabase
      .from('order_comments')
      .insert({
        order_id: tokenData.order_id,
        content: content.trim(),
        content_translated: contentTranslated,
        original_language: 'ko',
        translation_status: translationStatus,
        comment_type,
        author_id: null, // NULL for token-based comments
        author_name_display: displayName,
        author_role: 'korean_designer',
        is_internal: false,
        visibility,
        attachments,
        parent_comment_id: parent_comment_id || null,
        metadata: {
          token_id: tokenData.id,
          designer_email: tokenData.designer_email,
        },
      })
      .select('*')
      .single();

    if (createError) {
      console.error('[Token Comments POST] Error:', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'コメントの作成に失敗しました。',
          errorEn: 'Failed to create comment',
        },
        { status: 500 }
      );
    }

    // Update token upload count
    await supabase
      .from('designer_upload_tokens')
      .update({
        upload_count: (tokenData.upload_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', tokenData.id);

    console.log('[Token Comments POST] Comment created:', newComment.id);

    const response: CreateTokenCommentResponse = {
      success: true,
      comment: newComment as TokenComment,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('[Token Comments POST] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

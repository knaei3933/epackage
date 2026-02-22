/**
 * API Route: Comments for Token-Based Upload
 *
 * トークンベースアップロード用コメントAPI
 * - GET: コメント一覧取得
 * - POST: コメント投稿
 *
 * /api/upload/[token]/comments
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Create Supabase client lazily to avoid build-time environment variable check
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// GET: Fetch comments
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token format
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Hash the token with SHA-256
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Get designer upload token record
    const { data: tokenData, error: tokenError } = await supabase
      .from('designer_upload_tokens')
      .select('order_id, status, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check token status
    if (tokenData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: `Token is ${tokenData.status}` },
        { status: 401 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Get comments for this order
    const { data: comments, error: commentsError } = await supabase
      .from('order_comments')
      .select('*')
      .eq('order_id', tokenData.order_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('[Token Comments] GET error:', commentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
    });
  } catch (error: any) {
    console.error('[Token Comments] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Create comment
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token format
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Hash the token with SHA-256
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Get designer upload token record with order user_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('designer_upload_tokens')
      .select(`
        order_id,
        status,
        expires_at,
        orders!inner (
          user_id
        )
      `)
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check token status
    if (tokenData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: `Token is ${tokenData.status}` },
        { status: 401 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Content exceeds maximum length of 5000 characters' },
        { status: 400 }
      );
    }

    // Translate Korean comment to Japanese
    let contentTranslated = '';
    try {
      if (process.env.DEEPL_API_KEY) {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: [content],
            target_lang: 'JA',
            source_lang: 'KO',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          contentTranslated = data.translations?.[0]?.text || '';
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
    }

    // Insert comment
    const { data: comment, error: insertError } = await supabase
      .from('order_comments')
      .insert({
        order_id: tokenData.order_id,
        content: content.trim(),
        comment_type: 'correction',
        author_id: (tokenData as any).orders?.user_id || null, // Use order's user_id for now
        author_role: 'admin', // Using admin as fallback (TODO: update schema to support korea_designer)
        is_internal: false,
        metadata: {
          original_language: 'ko',
          content_translated: contentTranslated || null,
          translation_status: contentTranslated ? 'translated' : 'not_needed',
          token_based: true,
          author_name_display: 'Korean Designer',
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Token Comments] POST insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error: any) {
    console.error('[Token Comments] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

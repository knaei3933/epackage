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
import { createServiceClient } from '@/lib/supabase';
import { hashToken, isTokenExpired } from '@/lib/designer-tokens';

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

    // Get service client
    const supabase = createServiceClient();
    const tokenHash = hashToken(token);

    // Get Korea correction record
    const { data: correction, error: correctionError } = await supabase
      .from('korea_corrections')
      .select('id')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (correctionError || !correction) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(new Date(correction.token_expires_at))) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from('korea_correction_comments')
      .select('*')
      .eq('korea_correction_id', correction.id)
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

    // Get service client
    const supabase = createServiceClient();
    const tokenHash = hashToken(token);

    // Get Korea correction record
    const { data: correction, error: correctionError } = await supabase
      .from('korea_corrections')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (correctionError || !correction) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(new Date(correction.token_expires_at))) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Check if correction is cancelled
    if (correction.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Correction cancelled' },
        { status: 403 }
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

    // Insert comment
    const { data: comment, error: insertError } = await supabase
      .from('korea_correction_comments')
      .insert({
        korea_correction_id: correction.id,
        author_name: 'デザイナー',
        content: content.trim(),
        content_translated: null, // Will be translated asynchronously
        original_language: 'ko',
        is_designer: true,
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

    // Trigger translation (async, don't wait)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/internal/translate-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentId: comment.id,
        content: content.trim(),
        sourceLanguage: 'ko',
        targetLanguage: 'ja',
      }),
    }).catch(err => {
      console.error('[Token Comments] Translation trigger error:', err);
    });

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

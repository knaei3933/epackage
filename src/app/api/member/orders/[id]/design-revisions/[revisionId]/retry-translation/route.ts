/**
 * Retry Translation API
 *
 * 翻訳リトライAPI
 * - POST: 失敗した翻訳を再試行
 *
 * @route /api/member/orders/[id]/design-revisions/[revisionId]/retry-translation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { translateKoreanToJapanese } from '@/lib/translation';

// Env vars checked at runtime in handler function
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl(), supabaseServiceKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// POST Handler - Retry Translation
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl(),
      supabaseAnonKey(),
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const { id: orderId, revisionId } = await params;

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Verify revision belongs to this order
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select('*')
      .eq('id', revisionId)
      .eq('order_id', orderId)
      .single();

    if (revisionError || !revision) {
      return NextResponse.json(
        { success: false, error: 'デザイン改訂が見つかりません。' },
        { status: 404 }
      );
    }

    // Check if translation status is 'failed'
    if (revision.translation_status !== 'failed') {
      return NextResponse.json(
        { success: false, error: '翻訳の再試行は失敗した場合のみ可能です。' },
        { status: 400 }
      );
    }

    // Check if there's Korean text to translate
    const koreanText = revision.comment_ko || revision.partner_comment;
    if (!koreanText || koreanText.trim() === '') {
      return NextResponse.json(
        { success: false, error: '翻訳する韓国語テキストがありません。' },
        { status: 400 }
      );
    }

    console.log('[Retry Translation] Starting translation retry for revision:', revisionId);

    // Retry translation
    let translatedText: string;
    let translationSuccess = false;

    try {
      const result = await translateKoreanToJapanese(koreanText);
      translatedText = result.translatedText;
      translationSuccess = true;
      console.log('[Retry Translation] Translation successful');
    } catch (translationError) {
      console.error('[Retry Translation] Translation failed:', translationError);
      translatedText = koreanText; // Fallback to original text
      translationSuccess = false;
    }

    // Update design_revisions table
    const updateData: Record<string, unknown> = {
      korean_designer_comment_ja: translatedText,
      translation_status: translationSuccess ? 'translated' : 'failed',
      translation_completed_at: new Date().toISOString(),
    };

    const { data: updatedRevision, error: updateError } = await supabase
      .from('design_revisions')
      .update(updateData)
      .eq('id', revisionId)
      .select()
      .single();

    if (updateError) {
      console.error('[Retry Translation] Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: '翻訳結果の保存に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('[Retry Translation] Success:', revisionId, 'status:', translationSuccess ? 'translated' : 'failed');

    return NextResponse.json({
      success: true,
      revision: updatedRevision,
      translationSuccess,
      translatedText: translationSuccess ? translatedText : null,
    });

  } catch (error) {
    console.error('[Retry Translation] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

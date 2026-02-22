/**
 * API Route: Internal - Translate Comment
 *
 * 内部API: コメント翻訳
 * - POST: 韓国語コメントを日本語に翻訳
 *
 * /api/internal/translate-comment
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// POST: Translate comment
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify internal request (you can add additional security checks here)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commentId, content, sourceLanguage = 'ko', targetLanguage = 'ja' } = body;

    if (!commentId || !content) {
      return NextResponse.json(
        { success: false, error: 'commentId and content are required' },
        { status: 400 }
      );
    }

    // Call Google Translate API
    const translationResult = await translateText(content, sourceLanguage, targetLanguage);

    if (!translationResult) {
      return NextResponse.json(
        { success: false, error: 'Translation failed' },
        { status: 500 }
      );
    }

    // Update comment with translation
    const supabase = createServiceClient();
    const { error: updateError } = await supabase
      .from('korea_correction_comments')
      .update({
        content_translated: translationResult,
        translation_status: 'translated',
        translation_completed_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (updateError) {
      console.error('[Translate Comment] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update comment' },
        { status: 500 }
      );
    }

    // Also update translation cache
    await supabase
      .from('translation_cache')
      .upsert({
        source_text: content,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        translated_text: translationResult,
        translation_provider: 'google',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }, {
        onConflict: 'source_text,source_language,target_language',
      });

    return NextResponse.json({
      success: true,
      translated: translationResult,
    });
  } catch (error: any) {
    console.error('[Translate Comment] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// Helper: Translate text using Google Translate API
// ============================================================

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.error('[Translate Comment] Google Translate API key not configured');
      return null;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Translate Comment] Google API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('[Translate Comment] Translation error:', error);
    return null;
  }
}

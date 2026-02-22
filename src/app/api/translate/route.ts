/**
 * Translation API Route
 *
 * POST /api/translate
 * Translates text between supported languages (ko, ja, en)
 *
 * Request body:
 * {
 *   text: string | string[],       // Text(s) to translate
 *   source: 'ko' | 'ja' | 'en',    // Source language
 *   target: 'ko' | 'ja' | 'en',    // Target language
 *   skipCache?: boolean            // Skip cache lookup (optional)
 * }
 *
 * @module app/api/translate/route
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  translateText,
  batchTranslate,
  SupportedLanguage,
  isTranslationConfigured,
} from '@/lib/translation';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';

// =====================================================
// Schema Validation
// =====================================================

const translateRequestSchema = z.object({
  text: z.union([
    z.string().min(1, 'Text to translate is required'),
    z.array(z.string()).min(1, 'At least one text item is required'),
  ]),
  source: z.enum(['ko', 'ja', 'en'], {
    errorMap: () => ({ message: 'Source language must be ko, ja, or en' }),
  }),
  target: z.enum(['ko', 'ja', 'en'], {
    errorMap: () => ({ message: 'Target language must be ko, ja, or en' }),
  }),
  skipCache: z.boolean().optional(),
});

type TranslateRequest = z.infer<typeof translateRequestSchema>;

// =====================================================
// API Route Handler
// =====================================================

/**
 * POST /api/translate
 * Translate text between supported languages
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log('[Translate API] Request received:', {
    requestId,
    timestamp: new Date().toISOString(),
  });

  try {
    // Check if translation service is configured
    if (!isTranslationConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Translation service not configured',
          message: 'GOOGLE_TRANSLATION_API_KEY environment variable is not set',
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = translateRequestSchema.parse(body) as TranslateRequest;

    const { text, source, target, skipCache = false } = validatedData;

    // Handle batch translation
    if (Array.isArray(text)) {
      console.log('[Translate API] Batch translation:', {
        requestId,
        count: text.length,
        source,
        target,
        skipCache,
      });

      const result = await batchTranslate(text, source as SupportedLanguage, target as SupportedLanguage, {
        skipCache,
      });

      return NextResponse.json({
        success: true,
        data: {
          translations: result.translations,
          sourceLanguage: result.sourceLanguage,
          targetLanguage: result.targetLanguage,
          cachedCount: result.cached.filter(Boolean).length,
          totalCount: result.translations.length,
        },
        requestId,
      });
    }

    // Single text translation
    console.log('[Translate API] Single translation:', {
      requestId,
      textLength: text.length,
      source,
      target,
      skipCache,
    });

    const result = await translateText(text, source as SupportedLanguage, target as SupportedLanguage, {
      skipCache,
    });

    return NextResponse.json({
      success: true,
      data: {
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        cached: result.cached,
      },
      requestId,
    });

  } catch (error) {
    console.error('[Translate API] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle API errors
    return handleApiError(error);
  }
}

/**
 * GET /api/translate
 * API status check
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Translation API is available',
    endpoints: {
      'POST /api/translate': 'Translate text',
      'GET /api/translate/status': 'Check service status',
    },
    supportedLanguages: ['ko', 'ja', 'en'],
    timestamp: new Date().toISOString(),
  });
}

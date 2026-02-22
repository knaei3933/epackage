/**
 * Translation Status API Route
 *
 * GET /api/translate/status
 * Returns the current status of the translation service
 *
 * @module app/api/translate/status/route
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  checkTranslationServiceStatus,
  getTranslationCacheStats,
  isTranslationConfigured,
} from '@/lib/translation';

// =====================================================
// API Route Handler
// =====================================================

/**
 * GET /api/translate/status
 * Check translation service status
 */
export async function GET(): Promise<NextResponse> {
  console.log('[Translate Status API] Status check requested');

  try {
    // Get service status (with actual API test)
    const serviceStatus = await checkTranslationServiceStatus();

    // Get cache statistics
    const cacheStats = getTranslationCacheStats();

    return NextResponse.json({
      success: true,
      data: {
        service: {
          available: serviceStatus.available,
          configured: serviceStatus.configured,
          lastChecked: serviceStatus.lastChecked,
          error: serviceStatus.error,
        },
        cache: {
          size: cacheStats.size,
          maxSize: cacheStats.maxSize,
          utilizationPercent: Math.round((cacheStats.size / cacheStats.maxSize) * 100),
        },
        supportedLanguages: {
          source: ['ko', 'ja', 'en'],
          target: ['ko', 'ja', 'en'],
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Translate Status API] Error:', error);

    // Return partial status on error
    return NextResponse.json({
      success: false,
      data: {
        service: {
          available: false,
          configured: isTranslationConfigured(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        cache: getTranslationCacheStats(),
      },
      timestamp: new Date().toISOString(),
    });
  }
}

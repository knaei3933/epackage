import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Cache Invalidation API
 * キャッシュ無効化 API
 *
 * POST /api/admin/settings/cache/invalidate - Clear pricing engine settings cache
 *
 * This endpoint clears the settings cache in the UnifiedPricingEngine,
 * forcing it to reload settings from the database on the next calculation.
 * This ensures that when an admin changes a setting, the pricing engine
 * immediately uses the new value instead of waiting 5 minutes for cache expiry.
 */

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    // Import the pricing engine
    const { unifiedPricingEngine } = await import('@/lib/unified-pricing-engine');

    // Clear the settings cache
    unifiedPricingEngine.clearSettingsCache();

    return NextResponse.json({
      success: true,
      message: 'Settings cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear settings cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Google OAuth Authorization URL Generator
 *
 * Generates OAuth 2.0 authorization URL for Google Drive access
 *
 * @route /api/auth/google/url
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/google/url
 * Get Google OAuth authorization URL
 *
 * Query Parameters:
 * - state: Optional state parameter for CSRF protection
 * - redirect: Optional redirect path after OAuth completion
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
 *     "state": "..."
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Generate state for CSRF protection
    const searchParams = request.nextUrl.searchParams;
    const redirectPath = searchParams.get('redirect') || '/member/orders';
    const timestamp = Date.now();
    const state = Buffer.from(JSON.stringify({
      timestamp,
      redirect: redirectPath,
    })).toString('base64');

    // Generate auth URL
    const authUrl = getAuthUrl(state);

    return NextResponse.json(
      {
        success: true,
        data: {
          authUrl,
          state,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Google Auth URL] Error:', error);

    return NextResponse.json(
      {
        error: '認証URLの生成に失敗しました。',
        errorEn: 'Failed to generate authorization URL',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Sign Out API Route
 *
 * ログアウト API エンドポイント
 * - Supabase セッションのクリア
 * - 開発モックデータのクリア
 * - クッキーの削除
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// =====================================================
// POST /api/auth/signout
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevMode) {
      console.log('[DEV MODE] Mock logout');

      // DEV MODE: Clear dev mock data
      const response = NextResponse.json({
        success: true,
        message: 'ログアウトしました',
      });

      // Clear all auth-related cookies
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      response.cookies.delete('dev-mock-user-id');

      return response;
    }

    // PRODUCTION: Invalidate session and delete cookies
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Get all Supabase cookies from the request to know what to delete
    const requestCookies = request.cookies.getAll();
    const supabaseCookies = requestCookies.filter(c => c.name.startsWith('sb-'));

    console.log('[Signout] Found Supabase cookies:', supabaseCookies.map(c => c.name));

    // Invalidate the session using service role key
    if (SUPABASE_SERVICE_ROLE_KEY && supabaseCookies.length > 0) {
      try {
        // Get the access token from cookies
        const accessTokenCookie = supabaseCookies.find(c => c.name.includes('access-token'));
        if (accessTokenCookie) {
          // Invalidate the session using Supabase admin API
          await fetch(`${SUPABASE_URL}/rest/v1/auth/admin/logout`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: accessTokenCookie.value }),
          });
          console.log('[Signout] Session invalidated via service role');
        }
      } catch (error) {
        console.error('[Signout] Failed to invalidate session:', error);
        // Continue anyway - cookie deletion is more important
      }
    }

    // Create response with cookie deletion headers
    const cookieDeletionHeaders = [];

    // Build Set-Cookie headers to delete each Supabase cookie
    for (const cookie of supabaseCookies) {
      const name = cookie.name;

      // Delete with domain .package-lab.com
      cookieDeletionHeaders.push(
        `${name}=; Path=/; Domain=.package-lab.com; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
      );

      // Delete without domain (fallback)
      cookieDeletionHeaders.push(
        `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
      );

      console.log('[Signout] Deleting cookie:', name);
    }

    // Create Headers object and append all Set-Cookie headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Append each Set-Cookie header separately
    for (const cookieHeader of cookieDeletionHeaders) {
      headers.append('set-cookie', cookieHeader);
    }

    // Create response with proper headers
    const finalResponse = new Response(JSON.stringify({ success: true, message: 'ログアウトしました' }), {
      status: 200,
      headers: headers,
    });

    console.log('[Signout] All cookies deleted, sending', cookieDeletionHeaders.length, 'Set-Cookie headers');

    return finalResponse;
  } catch (error) {
    console.error('Signout API error:', error);

    return NextResponse.json(
      { error: 'ログアウト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler - CORS preflight
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

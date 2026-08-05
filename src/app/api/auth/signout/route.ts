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

    // PRODUCTION: Delete cookies to end the session locally.
    // Cookie deletion is the effective logout mechanism. Supabase access tokens
    // expire naturally (typically ~1h). The previous service-role admin logout
    // call targeted a non-standard endpoint and did not function; removing it
    // eliminates SERVICE_ROLE_KEY exposure from this route.

    // Get all Supabase cookies from the request to know what to delete
    const requestCookies = request.cookies.getAll();
    const supabaseCookies = requestCookies.filter(c => c.name.startsWith('sb-'));

    console.log('[Signout] Found Supabase cookies:', supabaseCookies.map(c => c.name));

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

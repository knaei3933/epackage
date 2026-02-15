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
import { createSupabaseClient } from '@/lib/supabase';

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

    // PRODUCTION: Clear all Supabase auth cookies
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    });

    // Get all cookies from the request
    const requestCookies = request.cookies.getAll();

    // Delete ALL Supabase auth cookies
    // Supabase uses cookies with names like: sb-{ref}-auth-token, sb-access-token, sb-refresh-token
    for (const cookie of requestCookies) {
      const name = cookie.name;
      // Delete any cookie that starts with 'sb-' (Supabase cookies)
      if (name.startsWith('sb-')) {
        response.cookies.delete(name);
        console.log(`[Signout] Deleting cookie: ${name}`);
      }
    }

    // Also explicitly delete the common cookie names for safety
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    response.cookies.delete('dev-mock-user-id');

    console.log('[Signout] All Supabase cookies cleared');

    return response;
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

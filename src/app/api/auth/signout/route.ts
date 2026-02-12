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

    // PRODUCTION: Real Supabase logout
    const supabase = createSupabaseClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase signout error:', error);
      return NextResponse.json(
        { error: 'ログアウトに失敗しました' },
        { status: 500 }
      );
    }

    // Clear cookies and redirect
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    });

    // Clear Supabase session cookies
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

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

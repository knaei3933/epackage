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

    // PRODUCTION: Use Supabase SSR to properly clear session and cookies
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create response object first
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    });

    // Create Supabase client with proper cookie handling
    const supabase = createServerClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          // Read cookies from the request
          getAll() {
            return request.cookies.getAll();
          },
          // Set cookies on the response
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              // When setting a cookie with maxAge=0 or expired date, it deletes it
              if (value === '' || (options?.maxAge && options.maxAge <= 0)) {
                response.cookies.delete(name);
              } else {
                response.cookies.set(name, value, options);
              }
            }
          },
        },
      }
    );

    // Sign out from Supabase - this will trigger setAll with deletion cookies
    await supabase.auth.signOut();

    console.log('[Signout] Supabase session cleared');

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

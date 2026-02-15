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

    // Get all Supabase cookies from the request to know what to delete
    const requestCookies = request.cookies.getAll();
    const supabaseCookieNames = requestCookies
      .filter(c => c.name.startsWith('sb-'))
      .map(c => c.name);

    console.log('[Signout] Found Supabase cookies:', supabaseCookieNames);

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
              console.log('[Signout] Cookie update:', name, 'value:', value ? 'present' : 'empty', 'maxAge:', options?.maxAge);

              // When Supabase sends a deletion cookie (maxAge=0 or empty value),
              // we must set it with the same attributes to properly delete it
              if (value === '' || (options?.maxAge !== undefined && options.maxAge <= 0)) {
                // Set cookie with expires in the past to delete it
                // This preserves domain, path, and other attributes
                response.cookies.set(name, '', {
                  ...options,
                  expires: new Date(0),
                  maxAge: 0,
                });
                console.log('[Signout] Deleting cookie:', name);
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

    // Fallback: Explicitly delete any remaining Supabase cookies
    // This ensures cookies are deleted even if Supabase's signOut doesn't trigger setAll
    for (const cookieName of supabaseCookieNames) {
      console.log('[Signout] Fallback: deleting cookie', cookieName);
      // Delete with all possible domain variations
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
        domain: '.package-lab.com',
      });
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
      });
    }

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

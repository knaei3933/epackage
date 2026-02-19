/**
 * Google OAuth Callback API
 *
 * 구글 OAuth 콜백 처리
 * - 인증 코드를 액세스 토큰으로 교환
 * - 리프레시 토큰을 데이터베이스에 저장
 * - 관리자 페이지로 리디렉션
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, saveRefreshToken } from '@/lib/google-drive';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /api/auth/google/callback
 * Google OAuth 리디렉션 URI
 *
 * Query Parameters:
 * - code: 인증 코드
 * - state: 상태 토큰 (user_{userId})
 * - error: 에러 (있는 경우)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // 에러 처리
    if (error) {
      console.error('[Google OAuth Callback] Error from Google:', error);
      return NextResponse.redirect(
        new URL('/admin?google_auth_error=' + encodeURIComponent(error), request.url)
      );
    }

    // 코드가 없는 경우
    if (!code) {
      console.error('[Google OAuth Callback] No code provided');
      return NextResponse.redirect(
        new URL('/admin?google_auth_error=no_code', request.url)
      );
    }

    console.log('[Google OAuth Callback] Received code, exchanging for token...');

    // 인증 코드를 액세스 토큰으로 교환
    const tokenResponse = await exchangeCodeForToken(code);

    console.log('[Google OAuth Callback] Token exchange successful');
    console.log('[Google OAuth Callback] Has refresh token:', !!tokenResponse.refresh_token);

    // state에서 userId 추출 (user_{userId} 형식)
    let userId = '';
    if (state?.startsWith('user_')) {
      userId = state.substring(5);
    } else {
      // state가 없는 경우, 현재 로그인한 사용자 사용
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '';

      if (!userId) {
        throw new Error('사용자를 식별할 수 없습니다.');
      }
    }

    // 리프레시 토큰이 있는 경우에만 저장
    if (tokenResponse.refresh_token && userId) {
      console.log('[Google OAuth Callback] Saving refresh token for user:', userId);
      await saveRefreshToken(userId, tokenResponse.refresh_token);
      console.log('[Google OAuth Callback] Refresh token saved successfully');
    } else if (!tokenResponse.refresh_token) {
      console.warn('[Google OAuth Callback] No refresh token in response. This is expected if token was already issued.');
      console.warn('[Google OAuth Callback] You may need to revoke previous access in Google Account settings.');
    }

    // 성공 페이지로 리디렉션
    return NextResponse.redirect(
      new URL('/admin?google_auth=success', request.url)
    );

  } catch (error) {
    console.error('[Google OAuth Callback] Error:', error);

    // 에러 페이지로 리디렉션
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(
      new URL('/admin?google_auth_error=' + encodeURIComponent(errorMessage), request.url)
    );
  }
}

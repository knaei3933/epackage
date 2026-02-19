/**
 * Google OAuth Callback API
 *
 * 구글 OAuth 콜백 처리
 * - 액세스 토큰 및 리프레시 토큰 받기
 * - 데이터베이스에 토큰 저장
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, saveRefreshToken } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // 에러 처리
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_error=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_error=no_code`
      );
    }

    // 인증 코드로 토큰 교환
    let tokenResponse;
    try {
      tokenResponse = await exchangeCodeForToken(code);
    } catch (tokenError) {
      console.error('Failed to exchange code for token:', tokenError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_error=token_exchange_failed`
      );
    }

    // 관리자 사용자 ID 확인 (현재 로그인한 사용자)
    // 이 부분은 세션에서 사용자 ID를 가져와야 합니다
    const { createServiceClient } = await import('@/lib/supabase');
    const { createSupabaseSSRClient } = await import('@/lib/supabase-ssr');

    const { client: supabase } = await createSupabaseSSRClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_error=not_authenticated`
      );
    }

    const userId = user.id;

    // 리프레시 토큰 저장
    if (tokenResponse.refresh_token) {
      try {
        await saveRefreshToken(userId, tokenResponse.refresh_token);
      } catch (saveError) {
        console.error('Failed to save refresh token:', saveError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_error=save_failed`
        );
      }
    }

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_success=true`
    );

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings?google_oauth_error=unknown`
    );
  }
}

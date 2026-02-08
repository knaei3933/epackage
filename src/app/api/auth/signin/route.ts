/**
 * Sign In API Route
 *
 * ログインAPIエンドポイント
 * - Supabase Authentication with @supabase/ssr
 * - サーバーサイドクッキー設定
 * - 開発モードモック対応
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { generateUUID } from '@/lib/utils';
import { z } from 'zod';
import { withRateLimit, createAuthRateLimiter } from '@/lib/rate-limiter';
import { createServiceClient } from '@/lib/supabase';

// =====================================================
// Rate Limiter
// =====================================================

const signinRateLimiter = createAuthRateLimiter();

// =====================================================
// Schema
// =====================================================

const signinSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  remember: z.boolean().optional(),
});

// =====================================================
// POST /api/auth/signin
// =====================================================

async function handleSignInPost(request: NextRequest) {
  console.log('[Signin API] Received signin request');

  try {
    // Get Supabase URL for cookie naming
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Signin API] Supabase not configured');
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('[Signin API] Invalid JSON in request body:', jsonError);
      return NextResponse.json(
        { error: '無効なリクエスト形式です。JSONを確認してください。' },
        { status: 400 }
      );
    }

    const validatedData = signinSchema.parse(body);

    console.log('[Signin API] Login attempt for:', validatedData.email);

    // =====================================================
    // DEV MODE: Mock login for testing (SECURE: server-side only)
    // =====================================================
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevMode) {
      console.log('[DEV MODE] Mock login for:', validatedData.email);

      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUserId = generateUUID();
      const mockRole = validatedData.email.includes('admin') ? 'ADMIN' : 'MEMBER';

      const mockProfile = {
        id: mockUserId,
        email: validatedData.email,
        kanji_last_name: 'テスト',
        kanji_first_name: 'ユーザー',
        kana_last_name: 'テスト',
        kana_first_name: 'ユーザー',
        corporate_phone: '03-1234-5678',
        personal_phone: '090-1234-5678',
        business_type: 'CORPORATION' as const,
        company_name: 'テスト会社',
        legal_entity_number: '1234567890123',
        position: '担当者',
        department: '営業',
        company_url: 'https://example.com',
        product_category: 'OTHER' as const,
        acquisition_channel: 'web_search',
        postal_code: '123-4567',
        prefecture: '東京都',
        city: '渋谷区',
        street: '1-2-3',
        role: mockRole,
        status: 'ACTIVE' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      const mockUser = {
        id: mockUserId,
        email: validatedData.email,
        kanjiLastName: 'テスト',
        kanjiFirstName: 'ユーザー',
        kanaLastName: 'テスト',
        kanaFirstName: 'ユーザー',
        role: mockRole,
        status: 'ACTIVE' as const,
      };

      const response = NextResponse.json({
        success: true,
        message: 'ログインしました',
        session: {
          user: {
            id: mockUserId,
            email: validatedData.email,
            user_metadata: {
              kanji_last_name: 'テスト',
              kanji_first_name: 'ユーザー',
              kana_last_name: 'テスト',
              kana_first_name: 'ユーザー',
            },
          },
        },
        profile: mockProfile,
        user: mockUser,
      });

      // Set mock cookies with 24-hour session (matching production)
      response.cookies.set('sb-access-token', 'mock-access-token-' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,  // ✅ 24時間セッション維持
        path: '/',
      });

      response.cookies.set('sb-refresh-token', 'mock-refresh-token-' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2592000,  // 30日
        path: '/',
      });

      response.cookies.set('dev-mock-user-id', mockUserId, {
        httpOnly: true,  // ✅ httpOnly設定（JavaScriptアクセス禁止）
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,  // ✅ 24時間セッション維持
        path: '/',
      });

      return response;
    }

    // =====================================================
    // PRODUCTION: Real Supabase login with SSR
    // =====================================================

    // Create SSR client that can read/write cookies
    // IMPORTANT: createSupabaseSSRClient creates a response object that @supabase/ssr
    // uses to set cookies via the cookies.set callback
    console.log('[Signin API] Creating SSR client...');
    const { client: supabase, response: initialResponse } = createSupabaseSSRClient(request);

    // Attempt login
    // When signInWithPassword succeeds, @supabase/ssr automatically sets session cookies
    // via the cookies.set callback in createSupabaseSSRClient
    console.log('[Signin API] Attempting signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error('[Signin API] Supabase login error:', error);
      return NextResponse.json(
        { error: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。' },
        { status: 401 }
      );
    }

    console.log('[Signin API] Login successful, user ID:', data.user.id);

    // Get user profile using SERVICE ROLE client
    // CRITICAL: Use service role to bypass RLS policies that block anon key access
    // after login, as auth.uid() may not be immediately available in the same request
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Check user status
    const profileWithStatus = profile as { status?: string; role?: string } | null;
    if (profileWithStatus && profileWithStatus.status === 'PENDING') {
      return NextResponse.json(
        { error: '管理者の承認が必要です。承認待ちです。' },
        { status: 403 }
      );
    }

    // Create response data
    const responseData = {
      success: true,
      message: 'ログインしました',
      session: {
        user: data.user,
      },
      profile: profile || {
        id: data.user.id,
        email: data.user.email || '',
        kanji_last_name: data.user.user_metadata?.kanji_last_name || '',
        kanji_first_name: data.user.user_metadata?.kanji_first_name || '',
        kana_last_name: data.user.user_metadata?.kana_last_name || '',
        kana_first_name: data.user.user_metadata?.kana_first_name || '',
        role: (profile as any)?.role || 'MEMBER',
        status: profileWithStatus?.status || 'ACTIVE',
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        kanjiLastName: (profile as any)?.kanji_last_name || data.user.user_metadata?.kanji_last_name || '',
        kanjiFirstName: (profile as any)?.kanji_first_name || data.user.user_metadata?.kanji_first_name || '',
        kanaLastName: (profile as any)?.kana_last_name || data.user.user_metadata?.kana_last_name || '',
        kanaFirstName: (profile as any)?.kana_first_name || data.user.user_metadata?.kana_first_name || '',
        status: profileWithStatus?.status || 'ACTIVE',
        role: (profile as any)?.role || 'MEMBER',
      },
    };

    // Check if redirect URL is provided (from client)
    const redirectUrl = request.nextUrl.searchParams.get('redirect') ||
                       request.nextUrl.searchParams.get('callbackUrl') ||
                       '/member/dashboard';

    // Determine redirect based on user role
    const userRole = (profile as any)?.role || 'MEMBER';
    const finalRedirect = userRole.toLowerCase() === 'admin'
      ? '/admin/dashboard'
      : redirectUrl;

    console.log('[Signin API] Redirecting to:', finalRedirect, '(role:', userRole, ')');

    // Add redirectUrl to response data
    // IMPORTANT: Return JSON response instead of redirect
    // Let client-side handle navigation to avoid cookie timing issues
    (responseData as any).redirectUrl = finalRedirect;

    // =====================================================
    // CRITICAL FIX: Copy all cookies from initialResponse to JSON response
    // =====================================================
    // @supabase/ssr signInWithPassword() sets cookies via the callback
    // These cookies are stored in initialResponse.cookies
    // We MUST copy them to finalResponse to maintain session
    //
    // IMPORTANT: Supabase uses project-specific cookie names like:
    // - sb-<project-ref>-auth-token
    // - sb-<project-ref>-auth-token.0, .1, .2, etc.

    const cookies = initialResponse.cookies.getAll();
    console.log('[Signin API] Cookies from initialResponse:', cookies.length, cookies.map(c => c.name));

    // Create JSON response
    const finalResponse = NextResponse.json(responseData, {
      status: 200,
    });

    // CRITICAL: Copy ALL cookies from initialResponse to finalResponse
    // This preserves the auth tokens set by @supabase/ssr
    let copiedCount = 0;
    cookies.forEach(cookie => {
      if (cookie.name && cookie.value) {
        const cookieOptions: any = {
          httpOnly: cookie.httpOnly ?? true,
          secure: cookie.secure ?? (process.env.NODE_ENV === 'production'),
          sameSite: cookie.sameSite ?? 'lax',
          path: cookie.path ?? '/',
        };

        // Preserve maxAge if set
        if (cookie.maxAge) {
          cookieOptions.maxAge = cookie.maxAge;
        } else {
          cookieOptions.maxAge = 86400; // Default: 24 hours
        }

        // Preserve expires if set
        if (cookie.expires) {
          cookieOptions.expires = cookie.expires;
        }

        // Preserve domain if set (but don't set domain for localhost)
        if (cookie.domain) {
          cookieOptions.domain = cookie.domain;
        } else if (process.env.NODE_ENV === 'production') {
          cookieOptions.domain = '.epackage-lab.com';
        }

        finalResponse.cookies.set(cookie.name, cookie.value, cookieOptions);
        copiedCount++;
      }
    });

    console.log('[Signin API] Copied', copiedCount, 'cookies to finalResponse');
    console.log('[Signin API] Login successful, cookies set for:', data.user.email);

    // Return the response with cookies
    return finalResponse;
  } catch (error) {
    console.error('[Signin API] Error during signin:', error);

    if (error instanceof z.ZodError) {
      console.error('[Signin API] Validation error:', error.errors);
      return NextResponse.json(
        { error: '無効な入力データです', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('[Signin API] JSON parse error:', error);
      return NextResponse.json(
        { error: '無効なリクエスト形式です。JSONを確認してください。' },
        { status: 400 }
      );
    }

    console.error('[Signin API] Unknown error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}

// TEMPORARY: Bypass rate limiter to debug login issue
// export const POST = withRateLimit(handleSignInPost, signinRateLimiter);
export const POST = handleSignInPost as any;

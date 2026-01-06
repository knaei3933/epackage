/**
 * Sign In API Route
 *
 * 로그인 API 엔드포인트
 * - Supabase Authentication with @supabase/ssr
 * - 서버 사이드 쿠키 설정
 * - 개발 모드 Mock 지원
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { generateUUID } from '@/lib/utils';
import { z } from 'zod';
import { withRateLimit, createAuthRateLimiter } from '@/lib/rate-limiter';

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
// Helper: Create Supabase SSR Client for API Routes
// =====================================================

function createSupabaseSSRClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create a response object that we'll use to set cookies
  const response = NextResponse.json({ success: false });

  return {
    client: createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }),
    response, // Return the response so we can modify it later
  };
}

// =====================================================
// POST /api/auth/signin
// =====================================================

async function handleSignInPost(request: NextRequest) {
  // Get Supabase URL for cookie naming
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = signinSchema.parse(body);

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

      // Set mock cookies
      response.cookies.set('sb-access-token', 'mock-access-token-' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', 'mock-refresh-token-' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2592000,
        path: '/',
      });

      response.cookies.set('dev-mock-user-id', mockUserId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600,
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
    const { client: supabase, response: initialResponse } = createSupabaseSSRClient(request);

    // Attempt login
    // When signInWithPassword succeeds, @supabase/ssr automatically sets session cookies
    // via the cookies.set callback in createSupabaseSSRClient
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      return NextResponse.json(
        { error: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
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

    // Create a NEW response to return user data
    // Note: initialResponse contains cookies set by signInWithPassword via the callback,
    // but we need to create a JSON response. We'll copy the cookies.
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

    // Create response and copy cookies from initialResponse
    const response = NextResponse.json(responseData);

    // Copy all cookies from initialResponse to the final response
    // @supabase/ssr sets cookies via the callback, which stores them in initialResponse.cookies
    // Explicitly preserve all cookie attributes (domain, path, httpOnly, secure, sameSite, etc.)
    initialResponse.cookies.getAll().forEach(cookie => {
      const { name, value, ...options } = cookie;
      response.cookies.set(name, value, options);
    });

    console.log('[Signin API] Login successful, cookies copied for:', data.user.email);

    return response;
  } catch (error) {
    console.error('Signin API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '無効な入力データです', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleSignInPost, signinRateLimiter);

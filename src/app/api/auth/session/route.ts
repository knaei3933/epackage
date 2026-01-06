/**
 * Session API Route
 *
 * 현재 세션 정보를 반환하는 API 엔드포인트
 * - Server-side에서 쿠키를 읽어 세션 확인
 * - Client-side AuthContext에서 호출하여 사용자 정보 가져오기
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { auth } from '@/lib/supabase';

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
    response,
  };
}

// =====================================================
// GET /api/auth/session
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // =====================================================
    // DEV MODE: Mock session for testing (SECURE: server-side only)
    // =====================================================
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevMode) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        console.log('[Session API] DEV_MODE: Returning mock session for:', devMockUserId);

        return NextResponse.json({
          session: {
            user: {
              id: devMockUserId,
              email: 'test@epackage-lab.com',
              user_metadata: {
                name_kanji: 'テスト',
                name_kana: 'テスト',
              },
            },
          },
          profile: {
            id: devMockUserId,
            email: 'test@epackage-lab.com',
            name_kanji: 'テスト',
            name_kana: 'テスト',
            role: devMockUserId.includes('admin') ? 'ADMIN' : 'MEMBER',
            status: 'ACTIVE',
          },
        });
      }
    }

    // =====================================================
    // PRODUCTION: Get real session from Supabase
    // =====================================================

    // Create SSR client that can read cookies
    const { client: supabase } = createSupabaseSSRClient(request);

    // Get current user (SECURE: getUser() validates JWT on every request)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[Session API] No valid user found');
      return NextResponse.json({
        session: null,
        profile: null,
      });
    }

    // Get user profile using the SAME supabase client (important!)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[Session API] Profile fetch error:', profileError);
    }

    console.log('[Session API] User found for:', user.email, 'Profile:', profile ? 'Found' : 'Not found');

    return NextResponse.json({
      session: {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
      },
      profile,
    });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json(
      { error: '세션 확인 중 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

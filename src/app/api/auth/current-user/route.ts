/**
 * Session API Route
 *
 * 現在のセッション情報を返すAPIエンドポイント
 * - Server-sideでクッキーを読みセッション確認
 * - Client-side AuthContextから呼び出しユーザー情報取得
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { auth, createServiceClient } from '@/lib/supabase';

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
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Debug: Log available cookies
    if (process.env.NODE_ENV === 'development') {
      const allCookies = request.cookies.getAll();
      console.log('[Session API] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));

      // Log Supabase auth cookies specifically
      const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'));
      console.log('[Session API] Supabase cookies:', sbCookies.map(c => c.name));
      console.log('[Session API] URL:', request.url);
      console.log('[Session API] Referer:', request.headers.get('referer'));
    }

    // Get current session (includes access_token)
    // getSession() retrieves the full session including access_token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('[Session API] getSession result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: sessionError?.message,
    });

    if (sessionError || !session?.user) {
      console.log('[Session API] No valid session found', sessionError?.message);
      return NextResponse.json({
        session: null,
        profile: null,
      });
    }

    const user = session.user;

    // Get user profile using SERVICE ROLE client
    // CRITICAL: Use service role to bypass RLS policies that may block anon key access
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
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
        access_token: session.access_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
      },
      profile,
    });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json(
      { error: 'セッション確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

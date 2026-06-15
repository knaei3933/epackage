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
import { createServiceClient } from '@/lib/supabase';

// Auth レスポンスは絶対に CDN/ブラウザキャッシュさせてはならない
// （セッショントークン更新レスポンスのキャッシュ = セッション漏洩）。
// S2.3: @supabase/ssr@0.8.0 は cacheHeaders を扱わないため、ここで直接担保する。
const AUTH_RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function authJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: AUTH_RESPONSE_HEADERS });
}

// =====================================================
// GET /api/auth/session
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return authJson({ error: 'Supabase not configured' }, 500);
    }

    // =====================================================
    // PRIORITY 1: Check middleware headers (most reliable)
    // =====================================================
    // Middleware has already validated the session and set x-user-id.
    // role/status は middleware ヘッダから読まず、DB profile から取得する
    // （境界防御: 最新 profile で ACTIVE を再確認）。
    const userIdFromHeader = request.headers.get('x-user-id');

    if (userIdFromHeader) {
      // SECURITY (S2.0): middleware headers are the source of truth for id/role/status.
      // They are set exclusively by middleware AFTER getUser() + DB profile lookup,
      // and middleware strips inbound x-user-* headers (see middleware.ts).
      // We MUST NOT synthesize a profile with MEMBER/ACTIVE defaults on DB lookup
      // failure — that created a privilege-escalation vector. On lookup failure return 401.

      // Fetch complete profile from database (display fields only)
      const serviceClient = createServiceClient();
      const { data: profile, error: profileError } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('id', userIdFromHeader)
        .maybeSingle();

      if (profileError) {
        console.warn('[Session API] Profile fetch error from headers:', profileError.message);
      }

      // SECURITY: profile lookup failure = reject. No synthesized fallback.
      if (!profile) {
        return authJson(
          { error: 'プロファイルが見つかりません', session: null, profile: null },
          401,
        );
      }

      // Reject non-ACTIVE users at the session boundary (defense in depth).
      // role/status come from the middleware header (DB-verified upstream),
      // but we re-check the freshly fetched profile to catch concurrent status changes.
      if (profile.status !== 'ACTIVE') {
        return authJson(
          { error: 'アカウントが無効です', session: null, profile: null },
          401,
        );
      }

      // Construct session object from header data + verified profile
      return authJson({
        session: {
          user: {
            id: userIdFromHeader,
            email: profile.email || 'user@epackage-lab.com',
            user_metadata: {
              name_kanji: profile.kanji_last_name && profile.kanji_first_name
                ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
                : 'ユーザー',
              name_kana: profile.kana_last_name && profile.kana_first_name
                ? `${profile.kana_last_name} ${profile.kana_first_name}`
                : 'ユーザー',
            },
          },
          access_token: 'middleware-managed', // Session managed by middleware
          expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
          expires_in: 1800,
          token_type: 'bearer',
        },
        // role/status sourced from verified profile, not from injectable headers
        profile,
      });
    }

    // =====================================================
    // PRIORITY 2: DEV MODE: Mock session for testing (SECURE: server-side only)
    // =====================================================
    const isDevModeEnv = process.env.NODE_ENV === 'development' &&
                         process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevModeEnv) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Session API] DEV_MODE: Returning mock session for:', devMockUserId);
        }

        return authJson({
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
            kanji_last_name: 'テスト',
            kanji_first_name: 'ユーザー',
            kana_last_name: 'テスト',
            kana_first_name: 'ユーザー',
            corporate_phone: '03-1234-5678',
            personal_phone: '090-1234-5678',
            business_type: 'CORPORATION',
            company_name: 'テスト会社',
            legal_entity_number: '1234567890123',
            position: '担当者',
            department: '営業',
            company_url: 'https://example.com',
            product_category: 'OTHER',
            acquisition_channel: 'web_search',
            postal_code: '123-4567',
            prefecture: '東京都',
            city: '渋谷区',
            street: '1-2-3',
            role: devMockUserId.includes('admin') ? 'ADMIN' : 'MEMBER',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          },
        });
      }
    }

    // =====================================================
    // PRIORITY 3: PRODUCTION: Get real session from Supabase
    // =====================================================

    // Create SSR client that can read cookies
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Debug: Log available cookies and headers
    if (process.env.NODE_ENV === 'development') {
      const allCookies = request.cookies.getAll();
      console.log('[Session API] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
      console.log('[Session API] Headers:', {
        'x-user-id': request.headers.get('x-user-id'),
        'x-user-role': request.headers.get('x-user-role'),
        'x-user-status': request.headers.get('x-user-status'),
      });
    }

    // Get current session (includes access_token)
    // getSession() retrieves the full session including access_token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      // 未認証は正常状態（public page からの呼び出し）。warn ログ不要。
      return authJson({
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
      console.warn('[Session API] Profile fetch error:', profileError.message);
    }

    return authJson({
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
    return authJson(
      { error: 'セッション確認中にエラーが発生しました' },
      500,
    );
  }
}

/**
 * Current User API Route
 *
 * 現在の認証ユーザー情報を返すAPIエンドポイント。
 * Client-side AuthContext から呼び出される（httpOnly cookie は client JS から読めないため）。
 *
 * S2.1: session/route.ts:41-101 の S2.0 修正済みパターンに統合。
 *   - PRIORITY 1: middleware ヘッダ（x-user-id/role/status）を信頼して profile を DB 検証
 *     （middleware が inbound x-user-* を strip するため、ここにあるヘッダは全て
 *      middleware が getUser()+profiles lookup 後に設定した DB 検証済み値）
 *   - PRIORITY 2: DEV_MODE モック（server-side only）
 *   - PRIORITY 3: getUser() フォールバック（middleware 未経由経路）
 *
 * SECURITY (S2.0): profile lookup 失敗時の MEMBER/ACTIVE フォールバックは廃止。
 *   失敗時は 401。ヘッダの role/status は検証済み profile で再確認（境界防御）。
 *
 * S2.3/S2.4: @supabase/ssr@0.8.0 は cacheHeaders を扱わないため、CDN キャッシュ防止は
 *   このハンドラが NextResponse に直接 Cache-Control を付与して担保する。
 *   本番ログは security/audit に必須なもの以外は全て development ゲート化（AC-A6）。
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';

// Auth レスポンスは絶対に CDN/ブラウザキャッシュさせてはならない
// （セッショントークン更新レスポンスのキャッシュ = セッション漏洩）。
const AUTH_RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function authJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: AUTH_RESPONSE_HEADERS });
}

// =====================================================
// GET /api/auth/current-user
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return authJson({ error: 'Supabase not configured' }, 500);
    }

    // =====================================================
    // PRIORITY 1: Middleware headers (DB-verified upstream)
    // =====================================================
    const userIdFromHeader = request.headers.get('x-user-id');

    if (userIdFromHeader) {
      // Fetch complete profile from database using service role (bypass RLS).
      // role/status は middleware ヘッダ由来（DB 検証済み）だが、同時変更を捕捉するため
      // 最新 profile を再取得して status を境界防御で再チェックする。
      const serviceClient = createServiceClient();
      const { data: profile, error: profileError } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('id', userIdFromHeader)
        .maybeSingle();

      if (profileError) {
        console.warn('[current-user] Profile fetch error:', profileError.message);
      }

      // SECURITY: profile lookup 失敗 = 拒否。合成フォールバックなし。
      if (!profile) {
        return authJson(
          { error: 'プロファイルが見つかりません', session: null, profile: null },
          401,
        );
      }

      // 境界防御: ヘッダは検証済みだが、DB の最新 status で ACTIVE を再確認。
      if (profile.status !== 'ACTIVE') {
        return authJson(
          { error: 'アカウントが無効です', session: null, profile: null },
          401,
        );
      }

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
          // access_token は公開しない（server-side のみ）。Client は cookie 経由で認証。
          access_token: 'server-managed',
          token_type: 'bearer',
        },
        // role/status は検証済み profile 由来（ヘッダ注入不可）
        profile,
      });
    }

    // =====================================================
    // PRIORITY 2: DEV MODE mock (server-side only)
    // =====================================================
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevMode) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[current-user] DEV_MODE mock for:', devMockUserId);
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
            name_kanji: 'テスト',
            name_kana: 'テスト',
            role: devMockUserId.includes('admin') ? 'ADMIN' : 'MEMBER',
            status: 'ACTIVE',
          },
        });
      }
    }

    // =====================================================
    // PRIORITY 3: getUser() fallback (middleware 未経由経路)
    // =====================================================
    const { client: supabase } = await createSupabaseSSRClient(request);

    if (process.env.NODE_ENV === 'development') {
      const allCookies = request.cookies.getAll();
      console.log('[current-user] Fallback path. Cookies:', allCookies.map(c => c.name));
    }

    // getUser() は JWT を Supabase Auth サーバーで検証する（getSession より安全）。
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // 未認証は正常状態（public page からの呼び出し）。warn ログ不要。
      return authJson({ session: null, profile: null });
    }

    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('[current-user] Profile fetch error (fallback):', profileError.message);
    }

    if (!profile) {
      return authJson(
        { error: 'プロファイルが見つかりません', session: null, profile: null },
        401,
      );
    }

    if (profile.status !== 'ACTIVE') {
      return authJson(
        { error: 'アカウントが無効です', session: null, profile: null },
        401,
      );
    }

    return authJson({
      session: {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        access_token: 'server-managed',
        token_type: 'bearer',
      },
      profile,
    });
  } catch (error) {
    console.error('[current-user] Error:', error);
    return authJson({ error: 'セッション確認中にエラーが発生しました' }, 500);
  }
}

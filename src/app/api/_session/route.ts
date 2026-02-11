/**
 * Session API Route
 *
 * 現在のセッション情報を返すAPIエンドポイント
 * - Server-sideでSupabase httpOnlyクッキーからセッション確認
 * - Client-side AuthContextから呼び出しユーザー情報取得
 * - SECURITY: Only uses Supabase httpOnly cookies, no insecure cookie fallback
 * - Moved to /api/_session to avoid redirect loop with /api/auth/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        session: null,
        profile: null,
      });
    }

    // Create Supabase client for server-side
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {
          // No-op - we only read cookies server-side
        },
      },
    });

    // Get session from Supabase httpOnly cookies
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({
        session: null,
        profile: null,
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[Session API] Profile fetch error:', profileError);
      return NextResponse.json({
        session: null,
        profile: null,
      });
    }

    // Return session and profile data
    return NextResponse.json({
      session: {
        user: {
          id: profile.id,
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
        access_token: 'cookie-managed',
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        expires_in: 1800,
        token_type: 'bearer',
      },
      profile,
    });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({
      session: null,
      profile: null,
    });
  }
}

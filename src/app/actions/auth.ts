'use server';

/**
 * Server Actions for Authentication
 *
 * Attempt 26: Direct cookie setting in Server Actions
 * - Bypass Supabase setAll callback
 * - Manually extract tokens and set via cookies().set()
 *
 * CRITICAL FIX FOR NEXT.JS 16 + TURBOPACK:
 * - cookies() is a dynamic API that MUST be imported lazily
 * - Top-level imports cause build hangs during static analysis
 *
 * @version 2026-02-09-attempt26
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { SESSION_MAX_AGE, COOKIE_DOMAIN } from '@/lib/auth-constants';

// =====================================================
// Schema
// =====================================================

const signinSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  remember: z.boolean().optional(),
});

// =====================================================
// Sign In Action
// =====================================================

export interface SigninResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    kanjiLastName?: string;
    kanjiFirstName?: string;
    role?: string;
    status?: string;
  };
  redirectUrl?: string;
}

export async function signInAction(formData: FormData): Promise<SigninResult> {
  try {
    // Validate form data
    const validatedData = signinSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember') === 'true',
    });

    console.log('[signInAction] Attempt 26: Direct cookie setting');
    console.log('[signInAction] Login attempt for:', validatedData.email);

    // =====================================================
    // CRITICAL FIX for Attempt 26: Create Supabase client WITHOUT cookies
    // to prevent setAll callback from running
    // Then manually set cookies after successful login
    // =====================================================

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a client that doesn't use cookies (for login only)
    const tempClient = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // CRITICAL: Do NOT set cookies here - we'll do it manually below
          console.log('[signInAction] setAll called, but ignoring');
        },
      },
    });

    // Attempt login
    const { data, error } = await tempClient.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error('[signInAction] Supabase login error:', error);
      return {
        success: false,
        error: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      };
    }

    console.log('[signInAction] Login successful, user ID:', data.user.id);
    console.log('[signInAction] Session data:', {
      access_token_length: data.session.access_token.length,
      refresh_token_length: data.session.refresh_token.length,
      expires_at: data.session.expires_at,
    });

    // =====================================================
    // CRITICAL: Manually set cookies via cookies() API
    // =====================================================
    // Dynamic import to avoid build-time hang
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    // Extract Supabase project reference from URL
    const supabaseProjectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

    // Cookie names
    const accessTokenCookie = `sb-${supabaseProjectRef}-auth-token.0`;
    const refreshTokenCookie = `sb-${supabaseProjectRef}-auth-token.1`;

    // Build cookie values in Supabase format
    // Format: base64(JSON.stringify({ access_token, refresh_token, ... }))
    const tokenData = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      token_type: data.session.token_type,
      user: data.user,
    };

    const tokenValue = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // Set access token cookie
    const accessCookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    };

    if (process.env.NODE_ENV === 'production' && COOKIE_DOMAIN) {
      accessCookieOptions.domain = COOKIE_DOMAIN;
    }

    cookieStore.set(accessTokenCookie, tokenValue, accessCookieOptions);
    console.log('[signInAction] Set access token cookie:', accessTokenCookie, 'value length:', tokenValue.length);

    // Set refresh token cookie (just the refresh token)
    const refreshCookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    };

    if (process.env.NODE_ENV === 'production' && COOKIE_DOMAIN) {
      refreshCookieOptions.domain = COOKIE_DOMAIN;
    }

    cookieStore.set(refreshTokenCookie, data.session.refresh_token, refreshCookieOptions);
    console.log('[signInAction] Set refresh token cookie:', refreshTokenCookie);

    // Get user profile using service role (bypass RLS)
    const { data: profile } = await tempClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Check user status
    if (profile && (profile as any).status === 'PENDING') {
      return {
        success: false,
        error: '管理者の承認が必要です。承認待ちです。',
      };
    }

    // Determine redirect based on user role
    const userRole = (profile as any)?.role || 'MEMBER';
    const redirectUrl = userRole.toLowerCase() === 'admin'
      ? '/admin/dashboard'
      : '/member/dashboard';

    console.log('[signInAction] Login successful, returning redirectUrl:', redirectUrl, '(role:', userRole, ')');

    // Revalidate cache
    revalidatePath('/', 'layout');

    // Return success with redirect URL instead of calling redirect()
    // This allows the client to handle navigation
    return {
      success: true,
      redirectUrl,
      user: {
        id: data.user.id,
        email: data.user.email,
        kanjiLastName: (profile as any)?.kanji_last_name,
        kanjiFirstName: (profile as any)?.kanji_first_name,
        role: userRole,
        status: (profile as any)?.status || 'ACTIVE',
      },
    };
  } catch (error) {
    console.error('[signInAction] Error during signin:', error);

    // Handle redirect errors (expected when redirect() is called)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // This is expected - redirect was successful
      throw error; // Re-throw to let Next.js handle the redirect
    }

    if (error instanceof z.ZodError) {
      console.error('[signInAction] Validation error:', error.errors);
      return {
        success: false,
        error: '無効な入力データです',
      };
    }

    return {
      success: false,
      error: 'ログイン処理中にエラーが発生しました',
    };
  }
}

// =====================================================
// Sign Out Action
// =====================================================

export interface SignoutResult {
  success: boolean;
  error?: string;
}

export async function signOutAction(): Promise<SignoutResult> {
  try {
    console.log('[signOutAction] Signing out user');

    // Create Supabase client
    const supabase = await createClient();

    // Sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[signOutAction] Sign out error:', error);
      return {
        success: false,
        error: 'ログアウトに失敗しました',
      };
    }

    console.log('[signOutAction] Sign out successful');

    // Revalidate cache
    revalidatePath('/', 'layout');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[signOutAction] Error during signout:', error);
    return {
      success: false,
      error: 'ログアウト処理中にエラーが発生しました',
    };
  }
}

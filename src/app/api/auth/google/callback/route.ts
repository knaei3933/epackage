/**
 * Google OAuth Callback Handler
 *
 * Handles OAuth 2.0 callback from Google Drive authorization
 * Stores access/refresh tokens in database for user
 *
 * @route /api/auth/google/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getTokens } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

// =====================================================
// Helper: Get Supabase client
// =====================================================

async function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(_name: string, _value: string, _options: unknown) {
        // Cookie handling if needed
      },
      remove(_name: string, _options: unknown) {
        // Cookie removal if needed
      },
    },
  });
}

// =====================================================
// GET Handler - OAuth Callback
// =====================================================

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback from Google
 *
 * Query Parameters:
 * - code: Authorization code from Google
 * - state: State parameter for CSRF protection
 * - error: Error code if authorization failed
 *
 * Success Response: Redirect to member orders page
 * Error Response: Redirect with error message
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle authorization error
    if (error) {
      console.error('[Google OAuth Callback] Authorization error:', error);
      return NextResponse.redirect(
        new URL('/member/orders?google_auth_error=' + encodeURIComponent(error), request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('[Google OAuth Callback] Missing code or state');
      return NextResponse.redirect(
        new URL('/member/orders?google_auth_error=missing_params', request.url)
      );
    }

    // Authenticate user
    const supabase = await getSupabaseClient(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.error('[Google OAuth Callback] Auth error:', userError?.message);
      return NextResponse.redirect(
        new URL('/auth/signin?google_auth_error=unauthorized', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await getTokens(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('[Google OAuth Callback] Missing tokens in response');
      return NextResponse.redirect(
        new URL('/member/orders?google_auth_error=invalid_tokens', request.url)
      );
    }

    // Store tokens in user metadata (or create a separate table)
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        google_drive_tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          token_type: tokens.token_type,
          scope: tokens.scope,
        },
      },
    });

    if (updateError) {
      console.error('[Google OAuth Callback] Failed to store tokens:', updateError);
      return NextResponse.redirect(
        new URL('/member/orders?google_auth_error=storage_failed', request.url)
      );
    }

    // Parse state for redirect path
    let redirectPath = '/member/orders';
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      redirectPath = stateData.redirect || redirectPath;
    } catch (e) {
      console.warn('[Google OAuth Callback] Failed to parse state, using default redirect');
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(redirectPath + '?google_auth=success', request.url)
    );

  } catch (error) {
    console.error('[Google OAuth Callback] Unexpected error:', error);

    return NextResponse.redirect(
      new URL('/member/orders?google_auth_error=unknown', request.url)
    );
  }
}

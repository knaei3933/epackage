/**
 * Supabase SSR Client Utilities for API Routes
 *
 * Next.js 16対応Supabase SSRクライアントヘルパー関数群
 * - @supabase/auth-helpers-nextjs (deprecated) → @supabase/ssr (modern)
 * - クッキーアダプターパターンを提供
 *
 * CRITICAL FIX FOR NEXT.JS 16 + TURBOPACK:
 * - cookies() is a dynamic API that MUST be imported lazily
 * - Top-level imports of this API cause build hangs during static analysis
 * - All imports of next/headers are now dynamic (await import())
 *
 * @module lib/supabase-ssr
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SESSION_MAX_AGE, COOKIE_DOMAIN } from './auth-constants';

// task #8 (never型根本解消): @supabase/ssr の createServerClient<Database> の戻り値型は、
// postgrest-js の select-query-parser と組み合わせた際、select の行型を `never` に短絡させる
// （TS2339 連鎖、約204件）。一方 supabase-js の createClient<Database> の戻り値型は never に
// ならない（検証済み）。両者は同じ SupabaseClient 構造のため、戻り値の型だけ supabase-js 側に
// 固定し、実行時は引き続き createServerClient（SSR cookie 連携）を使用する。
type SupabaseDatabaseClient = ReturnType<typeof createClient<Database>>;

// ============================================================
// Type Definitions
// ============================================================

interface SupabaseSSRClientResult {
  client: SupabaseDatabaseClient;
  response: NextResponse;
}

// ============================================================
// Environment Variables
// ============================================================

// Lazy environment variable access - only validate when functions are called
// This prevents build-time errors when env vars are not available during build
const getSupabaseConfig = () => {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/\s/g, '');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY };
};

// ============================================================
// Cookie Options for Localhost Development
// ============================================================

/**
 * CRITICAL FIX: Localhost cookie handling
 *
 * Localhost browsers REJECT cookies with explicit domain attributes.
 * - development: NO domain (browser auto-handles localhost)
 * - production: .epackage-lab.com for cross-subdomain
 */

// ============================================================
// Helper: Create Supabase SSR Client for API Routes
// ============================================================

/**
 * Create a Supabase SSR client for API routes with proper cookie handling
 *
 * This replaces the deprecated `createRouteHandlerClient` from @supabase/auth-helpers-nextjs
 *
 * @param request - NextRequest object
 * @returns Object containing Supabase client and NextResponse for cookie modification
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const { client: supabase, response } = await createSupabaseSSRClient(request);
 *
 *   const { data } = await supabase.from('table').select('*');
 *
 *   // Modify response if needed (sets cookies automatically)
 *   return NextResponse.json({ data }, { status: 200 });
 * }
 * ```
 */
export async function createSupabaseSSRClient(request: NextRequest): Promise<SupabaseSSRClientResult> {
  // Create a response object that we'll use to set cookies
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Lazy load config to avoid build-time errors
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseConfig();

  const ssrClient = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      // ✅ Use getAll() pattern recommended by Supabase SSR
      getAll() {
        return request.cookies.getAll();
      },
      // ✅ S2.3: Standard @supabase/ssr setAll pattern.
      // Uses response.cookies.set() (Next.js cookie API) instead of manually
      // building Set-Cookie headers. @supabase/ssr@0.8.0's SetAllCookies type
      // takes a single `cookies` argument (no cacheHeaders — that arrived in
      // 0.10+). CDN cache-prevention for auth responses is therefore handled
      // by the route handler itself setting Cache-Control on its NextResponse,
      // not via @supabase/ssr.
      setAll(cookiesToSet) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[supabase-ssr] setAll called with', cookiesToSet.length, 'cookies');
        }
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Merge @supabase/ssr-provided options with our security defaults.
            const cookieOptions = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              path: '/',
              maxAge: SESSION_MAX_AGE,
              domain: process.env.NODE_ENV === 'production' ? COOKIE_DOMAIN : undefined,
            };

            // Update request cookies for immediate downstream reads in this request
            request.cookies.set({ name, value, ...cookieOptions });
            // Set on the response so the browser receives the updated session cookie
            response.cookies.set({ name, value, ...cookieOptions });
          });
        } catch (error) {
          console.error('[supabase-ssr] Error in setAll:', error);
        }
      },
    },
  });

  // 型だけ supabase-js 側に固定（実行時は createServerClient のまま、SSR cookie 連携を維持）
  const client = ssrClient as unknown as SupabaseDatabaseClient;

  return { client, response };
}

// ============================================================
// Helper: Get Authenticated User from Request
// ============================================================

/**
 * Get the authenticated user from the request
 *
 * @param request - NextRequest object
 * @returns User object or null if not authenticated
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const user = await getAuthenticatedUser(request);
 *
 *   if (!user) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   // Proceed with authenticated request
 * }
 * ```
 */
export async function getAuthenticatedUser(request: NextRequest) {
  // Try cookie-based authentication first (works for both SSR and client-side navigation)
  const { client: supabase } = await createSupabaseSSRClient(request);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Fallback: try headers (set by middleware for SSR pages)
    const userId = request.headers.get('x-user-id');
    if (userId) {
      console.log('[getAuthenticatedUser] Using header-based auth as fallback');
      return {
        id: userId,
        supabase,
      };
    }
    console.log('[getAuthenticatedUser] No authenticated user found');
    return null;
  }

  console.log('[getAuthenticatedUser] Found user via cookie auth:', user.id);
  return {
    id: user.id,
    supabase,
  };
}

// ============================================================
// Helper: Get Authenticated User from Middleware Headers (S2.1/S2.5)
// ============================================================

/**
 * Lightweight auth context derived from middleware-verified headers.
 *
 * SECURITY (S2.0): middleware strips inbound x-user-* headers on EVERY request
 * before setting its own DB-verified values. Therefore any header present here
 * was produced by this app's middleware after getUser() + profiles lookup —
 * it is NOT attacker-injectable. This is the foundation that lets us skip the
 * redundant getUser()/getSession() RTT on every API call.
 *
 * Fallback: when headers are absent (Server Action / middleware-not-run path /
 * misconfigured matcher), we fall back to getUser() so we NEVER trust absence
 * as "anonymous-admin". Absent headers => re-authenticate, not assume.
 *
 * @returns AuthContext (id/role/status) + reusable supabase client, or null.
 */
export interface AuthContext {
  id: string;
  role: string;
  status: string;
  /** Reusable anon SSR client bound to the request cookies (RLS-aware). */
  supabase: SupabaseDatabaseClient;
}

export async function getAuthenticatedUserFromHeaders(
  request: NextRequest,
): Promise<AuthContext | null> {
  const { client: supabase } = await createSupabaseSSRClient(request);

  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const userStatus = request.headers.get('x-user-status');

  if (userId && userRole && userStatus) {
    // Headers present = middleware verified this request.
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAuthenticatedUserFromHeaders] Using middleware headers:', userId, userRole, userStatus);
    }
    return { id: userId, role: userRole, status: userStatus, supabase };
  }

  // Fallback for middleware-not-run paths (Server Actions, internal calls).
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAuthenticatedUserFromHeaders] No headers and no valid user');
    }
    return null;
  }

  // Headers missing but user authenticated — must verify role/status from DB
  // before granting (we cannot infer role/status from getUser() alone).
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAuthenticatedUserFromHeaders] Authenticated user has no profile');
    }
    return null;
  }

  return {
    id: user.id,
    role: (profile as { role: string }).role,
    status: (profile as { status: string }).status,
    supabase,
  };
}

// ============================================================
// Helper: Check if User has Admin Role
// ============================================================

/**
 * Check if the authenticated user has admin role
 *
 * @param request - NextRequest object
 * @returns true if user is admin, false otherwise
 */
export async function isAdminUser(request: NextRequest): Promise<boolean> {
  const { client: supabase } = await createSupabaseSSRClient(request);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile as { role?: string } | null)?.role;
  return role?.toLowerCase() === 'admin';
}

// ============================================================
// Migration Guide
// ============================================================

/**
 * MIGRATION GUIDE: @supabase/auth-helpers-nextjs → @supabase/ssr
 *
 * ❌ OLD (Deprecated):
 * ```ts
 * import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
 * import { cookies } from 'next/headers';
 *
 * const cookieStore = await cookies();
 * const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
 * ```
 *
 * ✅ NEW (Recommended):
 * ```ts
 * import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
 *
 * const { client: supabase } = await createSupabaseSSRClient(request);
 * ```
 *
 * Benefits:
 * - No more awaiting cookies()
 * - Cleaner syntax
 * - Better TypeScript support
 * - Compatible with Next.js 16+
 * - Custom cookie handling
 */

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
import type { Database } from '@/types/database';
import { SESSION_MAX_AGE, COOKIE_DOMAIN } from './auth-constants';

// ============================================================
// Type Definitions
// ============================================================

interface SupabaseSSRClientResult {
  client: ReturnType<typeof createServerClient<Database>>;
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

  const client = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      // ✅ Use getAll() pattern recommended by Supabase SSR
      getAll() {
        return request.cookies.getAll();
      },
      // ✅ CRITICAL: Use setAll() pattern for proper cookie handling in Next.js 15/16
      setAll(cookiesToSet) {
        console.log('[supabase-ssr] setAll called with', cookiesToSet.length, 'cookies');
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log('[supabase-ssr] Setting cookie:', name, 'value length:', value?.length || 0);

            // Build cookie options with proper domain handling
            const cookieOptions: any = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: SESSION_MAX_AGE,
            };

            // CRITICAL: Handle domain attribute
            if (process.env.NODE_ENV === 'production' && COOKIE_DOMAIN) {
              cookieOptions.domain = COOKIE_DOMAIN;
            } else {
              delete cookieOptions.domain;
            }

            // ✅ CRITICAL: Construct Set-Cookie header manually
            // This is the ONLY reliable way to set cookies in Next.js 16 API Route Handlers
            const cookieParts = [`${name}=${value}`];
            cookieParts.push(`HttpOnly`);
            if (process.env.NODE_ENV === 'production') {
              cookieParts.push(`Secure`);
            }
            cookieParts.push(`SameSite=${cookieOptions.sameSite}`);
            cookieParts.push(`Path=${cookieOptions.path}`);
            cookieParts.push(`Max-Age=${cookieOptions.maxAge}`);
            if (cookieOptions.domain) {
              cookieParts.push(`Domain=${cookieOptions.domain}`);
            }

            const setCookieHeader = cookieParts.join('; ');
            response.headers.append('Set-Cookie', setCookieHeader);

            console.log('[supabase-ssr] Set-Cookie header set for:', name);
          });

          const finalSetCookieHeaders = response.headers.getSetCookie();
          console.log('[supabase-ssr] Final response has', finalSetCookieHeaders.length, 'Set-Cookie headers');
        } catch (error) {
          console.error('[supabase-ssr] Error in setAll:', error);
        }
      },
    },
  });

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
    .single();

  return profile?.role?.toLowerCase() === 'admin';
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

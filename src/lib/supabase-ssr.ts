/**
 * Supabase SSR Client Utilities for API Routes
 *
 * Next.js 16対応Supabase SSRクライアントヘルパー関数群
 * - @supabase/auth-helpers-nextjs (deprecated) → @supabase/ssr (modern)
 * - クッキーアダプターパターンを提供
 *
 * @module lib/supabase-ssr
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

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
 *   const { client: supabase, response } = createSupabaseSSRClient(request);
 *
 *   const { data } = await supabase.from('table').select('*');
 *
 *   // Modify response if needed (sets cookies automatically)
 *   return NextResponse.json({ data }, { status: 200 });
 * }
 * ```
 */
export function createSupabaseSSRClient(request: NextRequest): SupabaseSSRClientResult {
  // Create a response object that we'll use to set cookies
  // IMPORTANT: This response object must be used as the base for the final response
  // to preserve any cookie changes made by Supabase during auth operations
  const response = NextResponse.next();

  const client = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: Record<string, unknown>) {
        response.cookies.delete({
          name,
          ...options,
        });
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
  const { client: supabase } = createSupabaseSSRClient(request);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
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
  const { client: supabase } = createSupabaseSSRClient(request);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'ADMIN';
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
 * const { client: supabase } = createSupabaseSSRClient(request);
 * ```
 *
 * Benefits:
 * - No more awaiting cookies()
 * - Cleaner syntax
 * - Better TypeScript support
 * - Compatible with Next.js 16+
 * - Custom cookie handling
 */

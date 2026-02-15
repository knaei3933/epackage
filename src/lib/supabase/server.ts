/**
 * Supabase Server Component Client
 *
 * This file provides a Supabase client specifically designed for Server Components
 * and Server Actions. It uses cookies() from 'next/headers' to properly handle
 * authentication cookies in Next.js 15/16.
 *
 * CRITICAL FIX FOR NEXT.JS 16 + TURBOPACK:
 * - cookies() is a dynamic API that MUST be imported lazily
 * - Top-level imports cause build hangs during static analysis
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase client for Server Components and Server Actions
 *
 * This function uses cookies() from 'next/headers' which properly handles
 * cookie persistence in Next.js 15/16 App Router.
 *
 * @example
 * ```ts
 * // In Server Component or Server Action
 * const supabase = await createClient();
 * const { data } = await supabase.from('table').select('*');
 * ```
 */
export async function createClient() {
  // CRITICAL: Dynamic import to avoid build-time hang
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        // ✅ Use getAll() pattern recommended by Supabase SSR
        getAll() {
          return cookieStore.getAll();
        },
        // ✅ CRITICAL: Server Components/Actions CANNOT set cookies in Next.js 15/16
        // Only middleware can set cookies. This is a read-only implementation.
        // When signInWithPassword is called, it will try to set cookies, but this will be a no-op.
        // The redirect() call will trigger middleware, which will set the cookies properly.
        setAll(cookiesToSet) {
          // NO-OP: Server Components/Actions cannot set cookies
          // The middleware will handle cookie setting via getSession()
          console.log('[createClient] setAll called in Server Component/Action (no-op, middleware will handle)');
        },
      },
    }
  );
}

/**
 * Get authenticated user from request
 *
 * @returns User object or null if not authenticated
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return user;
}

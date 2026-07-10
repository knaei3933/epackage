/**
 * Middleware Supabase Client
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Helper: Create Supabase Client for Middleware
// =====================================================

/**
 * Create Supabase client for middleware with proper cookie handling
 *
 * CRITICAL FIX: Use getAll/setAll pattern for @supabase/ssr compatibility
 * - Old get/set/remove pattern is deprecated
 * - New getAll/setAll pattern required for @supabase/ssr v0.4.0+
 */
export function createMiddlewareClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/\s/g, '');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Debug: Log all available cookies
  if (process.env.NODE_ENV === 'development') {
    const allCookies = request.cookies.getAll();
    console.log('[Middleware] All cookies:', allCookies.map(c => ({ name: c.name, value: c.value ? 'set' : 'empty' })));
    const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'));
    console.log('[Middleware] Supabase cookies:', sbCookies.map(c => c.name));
  }

  // Create response object for cookie setting
  const response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // ✅ CRITICAL: Use getAll() pattern required by @supabase/ssr
      getAll() {
        return request.cookies.getAll();
      },
      // ✅ CRITICAL: Use setAll() pattern required by @supabase/ssr
      setAll(cookiesToSet) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] setAll called with', cookiesToSet.length, 'cookies');
        }
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Middleware] Setting cookie:', name);
            }

            // Update request cookies for immediate use
            request.cookies.set({
              name,
              value,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 86400, // 24 hours
              ...options,
            });

            // Update response cookies to send to client
            response.cookies.set({
              name,
              value,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 86400, // 24 hours
              ...options,
            });
          });
        } catch (error) {
          console.error('[Middleware] Error in setAll:', error);
        }
      },
    },
  });

  return { supabase, response };
}


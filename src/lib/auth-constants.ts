/**
 * Authentication Constants
 *
 * Centralized constants for authentication configuration.
 * Used across middleware, SSR client, and auth components to ensure consistency.
 */

// ============================================================
// Supabase Project Configuration
// ============================================================

/**
 * Extract Supabase project reference from URL
 * Format: https://[project-ref].supabase.co
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

/**
 * Supabase auth cookie name pattern
 * Format: sb-[project-ref]-auth-token.[index]
 */
export const SUPABASE_ACCESS_TOKEN_COOKIE = `sb-${SUPABASE_PROJECT_REF}-auth-token.0`;
export const SUPABASE_REFRESH_TOKEN_COOKIE = `sb-${SUPABASE_PROJECT_REF}-auth-token.1`;

// ============================================================
// Session Configuration
// ============================================================

/**
 * Session maximum age in seconds (24 hours)
 * - Used for cookie maxAge in middleware and SSR client
 * - Ensures consistent session timeout across all auth components
 * - 86400 seconds = 24 hours
 */
export const SESSION_MAX_AGE = 86400;

/**
 * Session max age in milliseconds (for JavaScript Date operations)
 */
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE * 1000;

// ============================================================
// Cookie Configuration
// ============================================================

/**
 * Cookie domain for production
 * - Set to '.epackage-lab.com' for cross-subdomain cookies
 * - Development: undefined to let browser handle automatically (localhost compatible)
 */
export const COOKIE_DOMAIN = process.env.NODE_ENV === 'production'
  ? '.epackage-lab.com'
  : undefined;

/**
 * Standard cookie options for auth cookies
 * - httpOnly: ALWAYS true for security (prevents XSS attacks)
 * - secure: HTTPS only in production
 * - sameSite: 'lax' for CSRF protection
 * - path: '/' for site-wide availability
 * - maxAge: 24 hours from SESSION_MAX_AGE
 *
 * SECURITY NOTES:
 * - httpOnly is always true regardless of environment for security
 * - Supabase httpOnly cookies work correctly in both development and production
 * - Never use localStorage for sensitive authentication tokens
 */
export const STANDARD_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
  domain: COOKIE_DOMAIN,
} as const;

// ============================================================
// Redirect URLs
// ============================================================

/**
 * Default redirect URLs after login based on user role
 */
export const DEFAULT_REDIRECTS = {
  ADMIN: '/admin/dashboard',
  MEMBER: '/member/dashboard',
} as const;

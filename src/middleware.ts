import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight middleware for security headers and redirects.
 * No DB queries or Supabase client creation - defers auth to API routes.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // =====================================================
  // Security Headers
  // =====================================================
  const securityHeaders = new Headers(res.headers);

  // Content Security Policy - restricts sources of content
  securityHeaders.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ')
  );

  // Prevent XSS attacks
  securityHeaders.set('X-Content-Type-Options', 'nosniff');
  securityHeaders.set('X-Frame-Options', 'DENY');
  securityHeaders.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  securityHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    securityHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Apply security headers to response
  Object.entries(Object.fromEntries(securityHeaders)).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // =====================================================
  // Redirects
  // =====================================================
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.headers.get('x-forwarded-proto') !== 'https') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Canonical domain redirect (www to non-www)
  const canonicalHost = process.env.NEXT_PUBLIC_CANONICAL_HOST;
  if (canonicalHost && hostname !== canonicalHost) {
    url.host = canonicalHost;
    return NextResponse.redirect(url, 301);
  }

  // Trailing slash normalization
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  return res;
}

/**
 * Middleware matcher configuration
 * Defines which routes the middleware should run on
 *
 * IMPORTANT: This middleware is for public pages (ads, landing pages, homepage).
 * Protected routes (member, admin, designer) use API-level authentication.
 */
export const config = {
  matcher: [
    /*
     * Match only public pages - NOT member/admin/protected routes
     * Exclude:
     * - api routes (handled separately)
     * - member routes (use API authentication)
     * - admin routes (use API authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|member|admin|designer|auth|api/|member/|admin/|designer/|auth/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

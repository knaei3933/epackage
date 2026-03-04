import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight middleware for redirects only.
 * Security headers moved to next.config.ts to reduce CPU usage.
 */
export async function middleware(req: NextRequest) {
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

  // Add CSP headers for Google Analytics/Ads (only for matched routes)
  const res = NextResponse.next();
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://www.google.com https://www.google.co.jp https://www.google.co.kr https://www.google.adservicemse.com https://adservice.google.com https://adservice.google.co.jp https://googleads.g.doubleclick.net https://*.g.doubleclick.net",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.co.jp https://www.google.co.kr https://adservice.google.com https://adservice.google.co.jp https://googleads.g.doubleclick.net https://*.g.doubleclick.net",
      "frame-src 'self' https://www.googletagmanager.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ')
  );

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
     * Match only public pages - minimize middleware execution
     * Exclude all API, protected routes, and static assets
     */
    // Positive matches - only these paths run middleware
    '/',
    '/about',
    '/contact',
    '/catalog/:path*',
    '/blog/:path*',
    '/guide/:path*',
    '/industry/:path*',
    '/pricing',
    '/cart',
    '/compare/:path*',
    '/quote-simulator',
    '/samples',
    '/service',
    '/inquiry/:path*',
    '/data-templates',
    '/flow',
    '/print',
    '/design-system',
    '/robots.txt',
    '/sitemap.xml',
  ],
};

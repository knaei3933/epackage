/**
 * Supabase Authentication Middleware
 *
 * Supabase認証を使用して会員専用ページを保護します。
 * - 認証されていないユーザーをログインページにリダイレクト
 * - ロールベースアクセス制御 (ADMIN専用ページ)
 * - /admin/customers/* はADMINとACTIVE MEMBERの両方がアクセス可能
 * - /portal/* → /admin/customers/* への301リダイレクト
 * - CSRF保護 (Origin/Refererヘッダー検証)
 * - セキュリティヘッダー追加
 */

import { NextResponse, type NextRequest } from 'next/server';

// Extracted middleware modules
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  ALLOWED_ORIGINS,
  CSRF_PROTECTED_API_PATHS,
  CSRF_EXEMPT_API_PATHS,
} from './lib/middleware/config';
import { createMiddlewareClient } from './lib/middleware/client';
import { getUserProfile, checkDesignerEmailList } from './lib/middleware/auth-utils';
import { validateCSRFRequest, isValidOrigin, isCSRFProtectedPath } from './lib/middleware/csrf';
import { addSecurityHeaders } from './lib/middleware/security-headers';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');

  // DEV_MODE configuration - defined early; used by auth-route + dev bypass blocks
  const isNonProduction = process.env.NODE_ENV !== 'production';
  const isDevMode = isNonProduction && process.env.ENABLE_DEV_MOCK_AUTH === 'true';

  // =====================================================
  // SECURITY (S2.0): Strip inbound x-user-* / x-dev-mode headers
  // =====================================================
  // These headers are an INTERNAL contract set ONLY by this middleware after
  // getUser() + DB profile lookup. Any inbound value is untrusted (attacker-
  // injectable) and MUST be removed before we decide what (if anything) to set.
  // This is the single defense against header-spoofing privilege escalation.
  const USER_HEADERS = ['x-user-id', 'x-user-role', 'x-user-status', 'x-dev-mode'];
  const inboundUserHeaders: Record<string, string | null> = {};
  let hadInboundUserHeaders = false;
  for (const h of USER_HEADERS) {
    const v = request.headers.get(h);
    if (v !== null) {
      inboundUserHeaders[h] = v;
      hadInboundUserHeaders = true;
    }
    request.headers.delete(h);
  }
  // SECURITY AUDIT (S2.4 AC-A6 保持分類): header-spoofing 検知は本番監視必須。
  // development ゲートを外し、production でも必ず記録する。
  if (hadInboundUserHeaders) {
    console.warn('[Middleware][SECURITY] Stripped inbound user headers (possible privilege-escalation attempt):', Object.keys(inboundUserHeaders));
  }

  // =====================================================
  // EARLY RETURN: Static Assets (BEFORE any Supabase client creation)
  // =====================================================
  const STATIC_PATHS = [
    '/_next',
    '/static',
    '/favicon',
    '/images',
    '/fonts',
    '/api/static',
  ];

  const isStaticPath = STATIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2)$/);

  if (isStaticPath) {
    // Static assets don't need security headers - prevents CSP on static chunks
    return NextResponse.next();
  }

  // =====================================================
  // SECURITY (S2.0): Auth API routes — authenticate + set x-user-* headers
  // =====================================================
  // Previously /api/auth/* bypassed middleware entirely, which meant
  // /api/auth/session NEVER received x-user-* headers (its header branch was
  // dead code) AND any inbound spoofed headers passed through unstripped.
  // Now: we strip above, authenticate here, and set DB-verified headers so
  // session/route.ts can trust them (its fallback was removed in S2.0).
  // We do NOT redirect auth routes to /auth/signin — they handle 401/null
  // session themselves.
  if (pathname.startsWith('/api/auth')) {
    // Public auth endpoints that must work without a session
    const PUBLIC_AUTH_PATHS = [
      '/api/auth/signin',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/signout',
      '/api/auth/verify-email',
      '/api/auth/google',       // OAuth callback
      '/api/auth/pending',
      '/api/auth/suspended',
    ];
    const isPublicAuthPath = PUBLIC_AUTH_PATHS.some(p => pathname.startsWith(p));

    // DEV_MODE short-circuit (sets headers from mock cookie)
    if (isDevMode) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;
      if (devMockUserId) {
        const response = NextResponse.next();
        response.headers.set('x-user-id', devMockUserId);
        response.headers.set('x-user-role', 'MEMBER');
        response.headers.set('x-user-status', 'ACTIVE');
        response.headers.set('x-dev-mode', 'true');
        return addSecurityHeaders(response);
      }
    }

    if (isPublicAuthPath) {
      return addSecurityHeaders(NextResponse.next());
    }

    // Protected auth endpoints (e.g. /api/auth/session, /api/auth/current-user):
    // authenticate and set verified headers.
    try {
      const { supabase, response: authResponse } = createMiddlewareClient(request);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user && !error) {
        const profile = await getUserProfile(supabase, user.id);
        // Only set headers when we have a verified ACTIVE profile.
        // Missing/inactive profile => no headers => downstream returns 401.
        if (profile) {
          authResponse.headers.set('x-user-id', user.id);
          authResponse.headers.set('x-user-role', profile.role);
          authResponse.headers.set('x-user-status', profile.status);
        }
      }
      return addSecurityHeaders(authResponse);
    } catch (err) {
      console.error('[Middleware] Auth-route authentication error:', err);
      return addSecurityHeaders(NextResponse.next());
    }
  }

  // =====================================================
  // Domain Redirect: www → non-www (一時無効化)
  // =====================================================
  // TODO: Vercel側のドメイン設定が修正されたら有効化する
  /*
  if (hostname === 'www.package-lab.com') {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'package-lab.com';
    return NextResponse.redirect(url, 308);
  }
  */

  // Debug: Always log middleware execution
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] EXECUTING for path:', pathname);
  }

  // DEV_MODE configuration - isNonProduction/isDevMode are defined at the top
  // of this function (before header stripping) so all route handlers can use them.

  // =====================================================
  // B2B Routes - Return 404 (Deleted Routes)
  // =====================================================
  // These routes have been removed and should return 404
  // Explicitly handle them in middleware to ensure proper 404 status
  if (pathname.startsWith('/b2b') && !pathname.startsWith('/api/b2b')) {
    // Skip /api/b2b routes as they may still be used
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] B2B route deleted, returning 404:', pathname);
    }

    // Return 404 Not Found with HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - ページが見つかりません</title>
      </head>
      <body>
        <h1>404</h1>
        <p>Not Found</p>
        <p>見つかりません</p>
      </body>
      </html>
    `;

    const notFoundResponse = new NextResponse(htmlContent, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    return addSecurityHeaders(notFoundResponse);
  }

  // =====================================================
  // /login → /auth/signin 301 Redirect
  // =====================================================
  // Redirect legacy /login to /auth/signin
  if (pathname === '/login') {
    const url = new URL('/auth/signin', request.url);
    url.search = request.nextUrl.search; // Preserve query parameters

    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] 301 Redirect: /login → /auth/signin');
    }

    const response = NextResponse.redirect(url, 301);
    return addSecurityHeaders(response);
  }

  // =====================================================
  // Portal → Admin/Customers 301 Permanent Redirect
  // =====================================================
  // Redirect old Portal routes to new Admin/Customers routes
  if (pathname.startsWith('/portal')) {
    const newPath = pathname.replace('/portal', '/admin/customers');
    const url = new URL(newPath, request.url);
    url.search = request.nextUrl.search; // Preserve query parameters

    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] 301 Redirect: /portal → /admin/customers', pathname, '→', newPath);
    }

    // Return 301 Permanent Redirect for SEO
    const response = NextResponse.redirect(url, 301);
    return addSecurityHeaders(response);
  }

  // =====================================================
  // CRITICAL: API Route Exemptions - MUST BE FIRST CHECK
  // =====================================================
  // NOTE: /api/auth/* is handled above (S2.0) — it authenticates and sets
  // x-user-* headers; it is NOT exempted. Removing the old early-exemption was
  // the S2.0 fix that lets session/route.ts trust the headers.
  // /api/debug routes for debugging (no auth required)
  if (pathname.startsWith('/api/debug')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] EARLY EXEMPTION for /api/debug route:', pathname);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // /api/admin routes handle their own authentication in each route
  // But we still need to add auth headers for the API to use
  if (pathname.startsWith('/api/admin')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Processing /api/admin route:', pathname);
    }

    const response = NextResponse.next();

    // DEV_MODE: Check for mock user cookie first
    if (isDevMode) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        console.log('[Middleware] DEV_MODE: Setting headers for /api/admin:', devMockUserId);
        response.headers.set('x-dev-mode', 'true');
        response.headers.set('x-user-id', devMockUserId);
        response.headers.set('x-user-role', 'ADMIN');
        response.headers.set('x-user-status', 'ACTIVE');

        return addSecurityHeaders(response);
      }
    }

    // Normal auth: extract user info and add to headers for the API route to use
    const { supabase, response: authResponse } = createMiddlewareClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && !error) {
      // Get user profile for role and status
      const profile = await getUserProfile(supabase, user.id);

      // Only add headers for ACTIVE admin users
      // SECURITY (S2.0): require explicit ACTIVE status; no 'ACTIVE' fallback.
      if (profile?.role === 'ADMIN' && profile.status === 'ACTIVE') {
        authResponse.headers.set('x-user-id', user.id);
        authResponse.headers.set('x-user-role', profile.role);
        authResponse.headers.set('x-user-status', profile.status);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] Added auth headers for /api/admin:', user.id, profile.role, profile.status);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] User is not admin, not adding headers for /api/admin');
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] No auth for /api/admin - API will handle auth check');
      }
    }

    return addSecurityHeaders(authResponse);
  }

  // =====================================================
  // /api/designer routes - Designer role required
  // =====================================================
  // Phase 3: Korean Designer Correction Workflow
  //
  // NOTE: These endpoints use token-based auth and handle their own authentication:
  // - /api/designer/orders/[id]/correction
  // - /api/designer/orders/[id]/revisions
  // Skip middleware auth for token-based endpoints.
  if (pathname.startsWith('/api/designer')) {
    // Skip middleware for token-based endpoints
    if (pathname.match(/^\/api\/designer\/orders\/[^\/]+\/(correction|revisions|data-receipt\/[^\/]+)/)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Skipping auth for token-based endpoint:', pathname);
      }
      return addSecurityHeaders(NextResponse.next());
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Processing /api/designer route:', pathname);
    }

    const response = NextResponse.next();

    // Normal auth: extract user info and add to headers
    const { supabase, response: authResponse } = createMiddlewareClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && !error) {
      const profile = await getUserProfile(supabase, user.id);

      // Only add headers for ACTIVE designer users
      // SECURITY (S2.0): require explicit ACTIVE status; no 'ACTIVE' fallback.
      if (profile?.role === 'KOREA_DESIGNER' && profile.status === 'ACTIVE') {
        authResponse.headers.set('x-user-id', user.id);
        authResponse.headers.set('x-user-role', profile.role);
        authResponse.headers.set('x-user-status', profile.status);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] Added auth headers for /api/designer:', user.id, profile.role, profile.status);
        }
      } else {
        // Not a designer - return 403
        return addSecurityHeaders(
          NextResponse.json({ error: 'Forbidden', message: 'Designer access required' }, { status: 403 })
        );
      }
    } else {
      // No auth - return 401
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 })
      );
    }

    return addSecurityHeaders(authResponse);
  }

  // /admin/* page routes - DEV_MODE support for testing
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Processing /admin page route:', pathname);
    }

    const response = NextResponse.next();

    // DEV_MODE: Check for mock user cookie first
    if (isDevMode) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        console.log('[Middleware] DEV_MODE: Setting headers for /admin page:', devMockUserId);
        response.headers.set('x-dev-mode', 'true');
        response.headers.set('x-user-id', devMockUserId);
        response.headers.set('x-user-role', 'ADMIN');
        response.headers.set('x-user-status', 'ACTIVE');

        return addSecurityHeaders(response);
      }
      // DEV_MODE but no mock cookie - DO NOT allow access without authentication
      // SECURITY FIX: Remove lenient dev mode access - proceed to normal auth check
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] DEV_MODE: No mock cookie for /admin, proceeding to normal auth check');
      }
      // Fall through to main authentication check
    }
  }

  // /api/cron routes handle their own authentication via CRON_SECRET
  // Must exempt here to allow cron jobs to run
  if (pathname.startsWith('/api/cron')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] EARLY EXEMPTION for /api/cron route:', pathname);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // /api/member routes - pass through with authentication headers for API to use
  // Also handle DEV_MODE for /api/member routes
  if (pathname.startsWith('/api/member')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Processing /api/member route:', pathname);
      // Debug logging for save-pdf route
      if (pathname.includes('/save-pdf')) {
        console.log('[Middleware] save-pdf route detected, path:', pathname);
      }
    }

    const response = NextResponse.next();

    // DEV_MODE: Check for mock user cookie first
    if (isDevMode) {
      const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        console.log('[Middleware] DEV_MODE: Setting headers for /api/member:', devMockUserId);
        response.headers.set('x-dev-mode', 'true');
        response.headers.set('x-user-id', devMockUserId);
        response.headers.set('x-user-role', 'MEMBER');
        response.headers.set('x-user-status', 'ACTIVE');

        return addSecurityHeaders(response);
      }
    }

    // Normal auth: extract user info and add to headers for the API route to use
    const { supabase, response: authResponse } = createMiddlewareClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && !error) {
      // SECURITY (S2.0): only set headers when we have a VERIFIED profile from DB.
      // Previously fell back to role:'MEMBER'/status:'ACTIVE' on lookup failure,
      // which let a user with no/empty profile reach member APIs as ACTIVE.
      const profile = await getUserProfile(supabase, user.id);
      if (profile) {
        authResponse.headers.set('x-user-id', user.id);
        authResponse.headers.set('x-user-role', profile.role);
        authResponse.headers.set('x-user-status', profile.status);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] Added auth headers for /api/member:', user.id, profile.role, profile.status);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] No profile for /api/member - no headers set, API will 401');
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] No auth for /api/member - API will handle 401');
      }
    }

    return addSecurityHeaders(authResponse);
  }

  // =====================================================
  // DEV_MODE: Bypass authentication for testing (SECURE: server-side only)
  // =====================================================
  // Check for dev mode - enabled when ENABLE_DEV_MOCK_AUTH is true in non-production environments
  // This allows E2E tests to run without real authentication
  // Note: isDevMode is now defined at the top of middleware function for early access

  if (isDevMode) {
    // DEV_MODE: Check for mock user cookie
    const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;

    if (devMockUserId) {
      console.log('[DEV_MODE] Mock authentication bypass for user:', devMockUserId);

      // Add mock user info to headers for server components
      const response = NextResponse.next();
      response.headers.set('x-user-id', devMockUserId);
      response.headers.set('x-user-role', 'MEMBER'); // Default role for DEV_MODE
      response.headers.set('x-user-status', 'ACTIVE');
      response.headers.set('x-dev-mode', 'true');

      return addSecurityHeaders(response);
    }

    // DEV_MODE but no mock cookie - DO NOT allow access without authentication
    // SECURITY FIX: Remove lenient dev mode access - always require proper auth
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV_MODE] No mock cookie found, proceeding to normal auth check');
    }
  }

  // =====================================================
  // CSRF Protection for API Routes
  // =====================================================
  if (pathname.startsWith('/api')) {
    // 認証が不要な公開APIは通過
    if (CSRF_EXEMPT_API_PATHS.some(exempt => pathname.startsWith(exempt))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Exempting CSRF-exempt API route:', pathname);
      }
      return addSecurityHeaders(NextResponse.next());
    }

    // 認証が必要なAPIの場合セッション検証
    // (ただし、/api/contact、/api/samples等は認証なしでも許可)
    const publicAPIs = ['/api/contact', '/api/samples', '/api/quotation', '/api/registry'];
    if (publicAPIs.some(api => pathname.startsWith(api))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Exempting public API route:', pathname);
      }
      return addSecurityHeaders(NextResponse.next());
    }

    // CSRF検証実行 (only for remaining API routes that need protection)
    const csrfValidation = validateCSRFRequest(request);

    if (!csrfValidation.valid) {
      console.error('CSRF Validation Failed:', csrfValidation.reason);

      // 403 Forbiddenレスポンス返却
      const errorResponse = NextResponse.json(
        {
          error: 'Forbidden',
          message: 'CSRF validation failed',
          reason: process.env.NODE_ENV === 'development' ? csrfValidation.reason : undefined
        },
        { status: 403 }
      );

      return addSecurityHeaders(errorResponse);
    }

    // CSRF検証通過後継続
    // 静的ファイルとNext.js内部パスは通過
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') // favicon, images, etc.
    ) {
      // Static assets don't need security headers
      return NextResponse.next();
    }
  }

  // Public routes - no authentication required
  // Special case: homepage (/) is public
  const isHomepage = pathname === '/';
  const isPublicRoute = isHomepage || PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Public route, allowing access');
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Check authentication (SECURE: using getUser() instead of getSession())
  const { supabase, response: authResponse } = createMiddlewareClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Path:', pathname);
    console.log('[Middleware] User found:', !!user);
    console.log('[Middleware] User error:', error?.message);
    if (user) {
      console.log('[Middleware] User email:', user.email);
    }
    // Log cookie presence for debugging
    const allCookies = request.cookies.getAll();
    const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'));
    console.log('[Middleware] Supabase cookies found:', sbCookies.map(c => c.name));
  }

  // No user - redirect to login
  if (!user || error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] No user or error, redirecting to signin. Error:', error?.message);
      console.log('[Middleware] Pathname:', pathname);
    }
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return addSecurityHeaders(NextResponse.redirect(url));
  }

  // PERFORMANCE: 認証成功ログは development 限定（本番で全認証リクエスト実行を回避）
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] User authenticated:', user.id);
  }

  // Get user profile for role and status check
  const profile = await getUserProfile(supabase, user.id);

  if (!profile) {
    // Profile not found - redirect to pending/registration
    return addSecurityHeaders(
      NextResponse.redirect(new URL('/auth/pending', request.url))
    );
  }

  // Check user status
  if (profile.status === 'PENDING') {
    return addSecurityHeaders(
      NextResponse.redirect(new URL('/auth/pending', request.url))
    );
  }

  if (profile.status === 'SUSPENDED') {
    return addSecurityHeaders(
      NextResponse.redirect(new URL('/auth/suspended', request.url))
    );
  }

  if (profile.status === 'DELETED') {
    // Deleted users should be logged out
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('error', 'account_deleted');
    return addSecurityHeaders(NextResponse.redirect(url));
  }

  // Admin routes - require admin role (normalized to lowercase), EXCEPT /admin/customers which allows ACTIVE MEMBER too
  const isAdminRoute = PROTECTED_ROUTES.admin.some((route) =>
    pathname.startsWith(route)
  );
  const isCustomerPortalRoute = pathname.startsWith('/admin/customers');

  // Normalize role from database (uppercase) to lowercase for comparison
  const normalizedRole = profile.role?.toLowerCase();

  // Internal admin routes require admin role only
  if (isAdminRoute && !isCustomerPortalRoute) {
    if (normalizedRole !== 'admin') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
      );
    }
  }

  // /admin/customers allows both ADMIN and ACTIVE MEMBER
  if (isCustomerPortalRoute) {
    if (normalizedRole !== 'admin' && profile.status !== 'ACTIVE') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/auth/signin', request.url))
      );
    }
  }

  // =====================================================
  // Designer Routes - KOREA_DESIGNER role required
  // =====================================================
  // Phase 3: Korean Designer Correction Workflow
  const isDesignerRoute = PROTECTED_ROUTES.designer?.some((route) =>
    pathname.startsWith(route)
  );

  if (isDesignerRoute && !pathname.startsWith('/designer/login')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Processing /designer route:', pathname);
    }

    // Check for KOREA_DESIGNER role OR being in the korea_designer_emails list
    // Designers with the role OR admins/designers in the email whitelist can access
    const isInDesignerEmailList = await checkDesignerEmailList(supabase, user.email);

    if (normalizedRole !== 'korea_designer' && !isInDesignerEmailList) {
      // Not a designer and not in the whitelist - redirect based on their actual role
      if (normalizedRole === 'admin') {
        // Admins can also access designer routes for management purposes
        if (process.env.NODE_ENV === 'development') console.log('[Middleware] Admin accessing designer route - allowing access');
        // Continue to set headers below
      } else {
        // Members and others - redirect to designer login
        return addSecurityHeaders(
          NextResponse.redirect(new URL('/designer/login', request.url))
        );
      }
    }

    // Check designer status (must be ACTIVE)
    if (profile.status !== 'ACTIVE') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/designer/login?error=account_inactive', request.url))
      );
    }

    // Designer is authenticated and active - allow access
    authResponse.headers.set('x-user-id', user.id);
    authResponse.headers.set('x-user-role', profile.role);
    authResponse.headers.set('x-user-status', profile.status);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Designer authenticated and active, allowing access');
    }

    return addSecurityHeaders(authResponse);
  }

  // Member routes - require ACTIVE status
  const isMemberRoute = PROTECTED_ROUTES.member.some((route) =>
    pathname.startsWith(route)
  );
  if (isMemberRoute) {
    if (profile.status !== 'ACTIVE') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/auth/pending', request.url))
      );
    }
  }

  // Add user info to headers for server components
  // ✅ authResponseを使用してクッキー設定を保持
  authResponse.headers.set('x-user-id', user.id);
  authResponse.headers.set('x-user-role', profile.role);
  authResponse.headers.set('x-user-status', profile.status);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Setting auth headers for server components:', {
      'x-user-id': user.id,
      'x-user-role': profile.role,
      'x-user-status': profile.status,
    });
  }

  const finalResponse = addSecurityHeaders(authResponse, pathname);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Final response headers (auth):', {
      hasUserId: finalResponse.headers.has('x-user-id'),
      hasUserRole: finalResponse.headers.has('x-user-role'),
      hasUserStatus: finalResponse.headers.has('x-user-status'),
      userId: finalResponse.headers.get('x-user-id'),
      userRole: finalResponse.headers.get('x-user-role'),
      userStatus: finalResponse.headers.get('x-user-status'),
    });
  }

  return finalResponse;
}



export const matcher = [
  /*
   * Match all paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder files (images, etc.)
   * - static asset extensions (.js, .mjs, .css, .woff, .woff2, etc.)
   *   so auth middleware does not run on static asset requests.
  */
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|js|mjs|css|woff|woff2|ttf|eot|map)$).*)',
];

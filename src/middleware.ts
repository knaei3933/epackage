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

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// =====================================================
// CSRF Protection Configuration
// =====================================================

// 許可されたオリジンリスト (本番環境では実際のドメインで設定)
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004', // Dev server might use port 3004
  'http://localhost:3005', // Dev server might use port 3005
  'https://www.package-lab.com',
  'https://package-lab.com',
  // 本番環境で実際のドメイン追加
  // ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
];

// CSRF検証が必要なAPIパス
const CSRF_PROTECTED_API_PATHS = [
  '/api/contact',
  '/api/samples',
  '/api/b2b',
  '/api/quotation',
];

// CSRF検証から除外するAPIパス (公開API)
const CSRF_EXEMPT_API_PATHS = [
  '/api/robots',
  '/api/sitemap',
  '/api/auth',
  '/api/auth/session', // Explicitly exempt session endpoint
  '/api/products', // Public catalog API
  '/api/categories', // Public categories API
  '/api/member', // Member API - handles its own auth via SSR
  '/api/comparison', // Comparison API - handles client-side data
];

// =====================================================
// Protected Routes Configuration
// =====================================================

const PROTECTED_ROUTES = {
  member: ['/member', '/quote-simulator'],
  admin: ['/admin'],
};

const PUBLIC_ROUTES = [
  '/about',
  '/contact',
  '/catalog',
  '/samples',
  '/print',
  '/guide',
  '/smart-quote',
  '/industry',
  '/news',
  '/premium-content',
  '/archives',
  '/inquiry',
  '/compare',
  '/service',
  '/cart',
  '/pricing',
  '/legal',
  '/csr',
  '/privacy',
  '/terms',
  '/design-system',
  '/auth/signin',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/pending', // Public page shown after registration
  '/auth/suspended', // Public page for suspended accounts
];

// =====================================================
// Helper: Create Supabase Client for Middleware
// =====================================================

/**
 * Create Supabase client for middleware with proper cookie handling
 *
 * CRITICAL FIX: Use getAll/setAll pattern for @supabase/ssr compatibility
 * - Old get/set/remove pattern is deprecated
 * - New getAll/setAll pattern required for @supabase/ssr v0.4.0+
 */
function createMiddlewareClient(request: NextRequest) {
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

// =====================================================
// Helper: Check User Status from Profile
// =====================================================

async function getUserProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// =====================================================
// Helper: Validate Origin Header for CSRF Protection
// =====================================================

function isValidOrigin(origin: string | null): boolean {
  if (!origin) {
    return false; // Originヘッダーがない場合は拒否
  }

  // 許可されたオリジンリストと比較
  return ALLOWED_ORIGINS.some(allowed => {
    // 完全一致または同じドメインのサブパス
    return origin === allowed || origin.startsWith(allowed);
  });
}

function isCSRFProtectedPath(pathname: string): boolean {
  // 除外パス確認
  if (CSRF_EXEMPT_API_PATHS.some(exempt => pathname.startsWith(exempt))) {
    return false;
  }

  // 保護されたAPIパス確認
  return CSRF_PROTECTED_API_PATHS.some((path) =>
    pathname.startsWith(path)
  );
}

function validateCSRFRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const { pathname } = request.nextUrl;

  // APIパスでない場合はCSRF検証をスキップ
  if (!pathname.startsWith('/api')) {
    return { valid: true };
  }

  // CSRF保護が不要なAPIパス
  if (!isCSRFProtectedPath(pathname)) {
    return { valid: true };
  }

  // GET, HEAD, OPTIONSリクエストはCSRF脆弱性なし
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true };
  }

  // POST, PUT, DELETE, PATCHリクエストについて検証
  // Originヘッダー確認 (最も信頼できる方法)
  if (origin) {
    if (!isValidOrigin(origin)) {
      return {
        valid: false,
        reason: `Invalid Origin header: ${origin}. Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`
      };
    }
    return { valid: true };
  }

  // Originがない場合 (同じサイトリクエストの可能性)
  // Refererヘッダーでフォールバック
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

      if (!isValidOrigin(refererOrigin)) {
        return {
          valid: false,
          reason: `Invalid Referer header: ${referer}`
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        reason: 'Invalid Referer header format'
      };
    }
  }

  // OriginとRefererの両方がないリクエストを拒否
  // (ただし、開発環境では許可可能)
  if (process.env.NODE_ENV === 'development') {
    // 開発環境では警告のみ出力して許可
    console.warn('CSRF: Request without Origin or Referer header in development mode');
    return { valid: true };
  }

  return {
    valid: false,
    reason: 'Missing Origin and Referer headers'
  };
}

// =====================================================
// Middleware Main Function
// =====================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug: Always log middleware execution
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] EXECUTING for path:', pathname);
  }

  // DEV_MODE configuration - must be defined early for use in route handlers
  const isNonProduction = process.env.NODE_ENV !== 'production';
  const isDevMode = isNonProduction && process.env.ENABLE_DEV_MOCK_AUTH === 'true';

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
  // These routes handle their own authentication and must bypass ALL middleware logic
  // Check this BEFORE any other logic to prevent redirect loops
  if (pathname.startsWith('/api/auth')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] EARLY EXEMPTION for /api/auth route:', pathname);
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

      // Only add headers for admin users
      if (profile?.role === 'ADMIN') {
        authResponse.headers.set('x-user-id', user.id);
        authResponse.headers.set('x-user-role', profile.role);
        authResponse.headers.set('x-user-status', profile.status || 'ACTIVE');

        if (process.env.NODE_ENV === 'development') {
          console.log('[Middleware] Added auth headers for /api/admin:', user.id, profile?.role, profile?.status);
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
      console.log('[Middleware] DEV_MODE: No mock cookie for /admin, proceeding to normal auth check');
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
      // Get user profile for role and status
      const profile = await getUserProfile(supabase, user.id);
      authResponse.headers.set('x-user-id', user.id);
      authResponse.headers.set('x-user-role', profile?.role || 'MEMBER');
      authResponse.headers.set('x-user-status', profile?.status || 'ACTIVE');

      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Added auth headers for /api/member:', user.id, profile?.role, profile?.status);
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
    console.log('[DEV_MODE] No mock cookie found, proceeding to normal auth check');
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
      return addSecurityHeaders(NextResponse.next());
    }
  }

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // favicon, images, etc.
  ) {
    return addSecurityHeaders(NextResponse.next());
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

  console.log('[Middleware] User authenticated:', user.id);

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

  const finalResponse = addSecurityHeaders(authResponse);

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

// =====================================================
// Security Headers
// =====================================================

function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking - DENYはすべてのフレームをブロック
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy - より厳格なポリシー
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy - 強化されたバージョン
  const isDev = process.env.NODE_ENV === 'development';

  const cspDirectives = [
    "default-src 'self' blob:",
    // React 19 and Framer Motion require unsafe-inline for hydration and animations
    // Both dev and production need 'unsafe-inline' for client-side rendering
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com",
    isDev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: blob:",
    "connect-src 'self' blob: https://api.sendgrid.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'none'",
    // form-actionを'self'に制限してCSRF防御
    "form-action 'self'",
    // base-uriも制限
    "base-uri 'self'",
    // object-srcをブロック
    "object-src 'none'",
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // HSTS (HTTP Strict Transport Security) - production only
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions policy - より制限的なポリシー
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );

  // Cross-Origin Opener Policy
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin Resource Policy
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
}

// =====================================================
// Middleware Configuration
// =====================================================

// Modern Next.js 15+ matcher configuration
export const matcher = [
  /*
   * Match all paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder files (images, etc.)
   */
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
];

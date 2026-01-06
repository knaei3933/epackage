/**
 * Supabase Authentication Middleware
 *
 * Supabase 인증을 사용하여 회원 전용 페이지를 보호합니다.
 * - 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 * - 역할 기반 접근 제어 (ADMIN 전용 페이지)
 * - CSRF 보호 (Origin/Referer 헤더 검증)
 * - 보안 헤더 추가
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// =====================================================
// CSRF Protection Configuration
// =====================================================

// 허용된 오리진 리스트 (프로덕션 환경에서는 실제 도메인으로 설정)
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004', // Dev server might use port 3004
  'http://localhost:3005', // Dev server might use port 3005
  // 프로덕션 환경에서 실제 도메인 추가
  // ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
];

// CSRF 검증이 필요한 API 경로
const CSRF_PROTECTED_API_PATHS = [
  '/api/contact',
  '/api/samples',
  '/api/b2b',
  '/api/quotation',
];

// CSRF 검증에서 제외할 API 경로 (공개 API)
const CSRF_EXEMPT_API_PATHS = [
  '/api/robots',
  '/api/sitemap',
  '/api/auth',
  '/api/products', // Public catalog API
  '/api/categories', // Public categories API
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
  '/auth/signin',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// =====================================================
// Helper: Create Supabase Client for Middleware
// =====================================================

function createMiddlewareClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Debug: Log all available cookies
  if (process.env.NODE_ENV === 'development') {
    const allCookies = request.cookies.getAll();
    console.log('[Middleware] All cookies:', allCookies.map(c => ({ name: c.name, value: c.value ? 'set' : 'empty' })));
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = request.cookies.get(name);
        if (process.env.NODE_ENV === 'development' && name.includes('sb-')) {
          console.log('[Middleware] Getting cookie:', name, 'found:', !!cookie);
        }
        return cookie?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        request.cookies.delete({ name, ...options });
      },
    },
  });
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
    return false; // Origin 헤더가 없으면 거부
  }

  // 허용된 오리진 목록과 비교
  return ALLOWED_ORIGINS.some(allowed => {
    // 정확히 일치하거나 같은 도메인의 하위 경로
    return origin === allowed || origin.startsWith(allowed);
  });
}

function isCSRFProtectedPath(pathname: string): boolean {
  // 제외 경로 확인
  if (CSRF_EXEMPT_API_PATHS.some(exempt => pathname.startsWith(exempt))) {
    return false;
  }

  // 보호된 API 경로 확인
  return CSRF_PROTECTED_API_PATHS.some((path) =>
    pathname.startsWith(path)
  );
}

function validateCSRFRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const { pathname } = request.nextUrl;

  // API 경로가 아니면 CSRF 검증 스킵
  if (!pathname.startsWith('/api')) {
    return { valid: true };
  }

  // CSRF 보호가 필요 없는 API 경로
  if (!isCSRFProtectedPath(pathname)) {
    return { valid: true };
  }

  // GET, HEAD, OPTIONS 요청은 CSRF 취약하지 않음
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true };
  }

  // POST, PUT, DELETE, PATCH 요청에 대해 검증
  // Origin 헤더 확인 (가장 신뢰할 수 있는 방법)
  if (origin) {
    if (!isValidOrigin(origin)) {
      return {
        valid: false,
        reason: `Invalid Origin header: ${origin}. Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`
      };
    }
    return { valid: true };
  }

  // Origin이 없는 경우 (같은 사이트 요청일 수 있음)
  // Referer 헤더로 폴백
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

  // Origin과 Referer가 모두 없는 요청은 거부
  // (단, 개발 환경에서는 허용할 수 있음)
  if (process.env.NODE_ENV === 'development') {
    // 개발 환경에서는 경고만 출력하고 허용
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

  // =====================================================
  // DEV_MODE: Bypass authentication for testing (SECURE: server-side only)
  // =====================================================
  const isDevMode = process.env.NODE_ENV === 'development' &&
                    process.env.ENABLE_DEV_MOCK_AUTH === 'true';

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

    // DEV_MODE but no mock cookie - still allow access to member pages
    // The signin flow should set the cookie, but we'll be lenient in dev mode
    if (pathname.startsWith('/member') || pathname.startsWith('/admin')) {
      console.log('[DEV_MODE] Allowing access without authentication (dev mode)');

      const response = NextResponse.next();
      response.headers.set('x-dev-mode', 'true');
      response.headers.set('x-user-id', '00000000-0000-0000-0000-000000000000');
      response.headers.set('x-user-role', pathname.startsWith('/admin') ? 'ADMIN' : 'MEMBER');
      response.headers.set('x-user-status', 'ACTIVE');

      return addSecurityHeaders(response);
    }
  }

  // =====================================================
  // CSRF Protection for API Routes
  // =====================================================
  if (pathname.startsWith('/api')) {
    // CSRF 검증 수행
    const csrfValidation = validateCSRFRequest(request);

    if (!csrfValidation.valid) {
      console.error('CSRF Validation Failed:', csrfValidation.reason);

      // 403 Forbidden 응답 반환
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

    // CSRF 검증 통과 후 계속 진행
    // 정적 파일과 Next.js 내부 경로는 통과
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') // favicon, images, etc.
    ) {
      return addSecurityHeaders(NextResponse.next());
    }

    // 인증이 필요 없는 공개 API는 통과
    if (CSRF_EXEMPT_API_PATHS.some(exempt => pathname.startsWith(exempt))) {
      return addSecurityHeaders(NextResponse.next());
    }

    // 인증이 필요한 API의 경우 세션 검증
    // (단, /api/contact, /api/samples 등은 인증 없이도 허용)
    const publicAPIs = ['/api/contact', '/api/samples', '/api/quotation'];
    if (publicAPIs.some(api => pathname.startsWith(api))) {
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
  const supabase = createMiddlewareClient(request);
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
  }

  // No user - redirect to login
  if (!user || error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] No user, redirecting to signin');
    }
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return addSecurityHeaders(NextResponse.redirect(url));
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

  // Admin routes - require ADMIN role
  const isAdminRoute = PROTECTED_ROUTES.admin.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute) {
    if (profile.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
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
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-role', profile.role);
  response.headers.set('x-user-status', profile.status);

  return addSecurityHeaders(response);
}

// =====================================================
// Security Headers
// =====================================================

function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking - DENY는 모든 프레임 차단
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy - 더 엄격한 정책
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy - 강화된 버전
  const isDev = process.env.NODE_ENV === 'development';

  const cspDirectives = [
    "default-src 'self'",
    // 개발 환경에서는 unsafe-inline/eval 허용
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com"
      : "script-src 'self' https://js.sendgrid.com",
    isDev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.sendgrid.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'none'",
    // form-action을 'self'로 제한하여 CSRF 방어
    "form-action 'self'",
    // base-uri도 제한
    "base-uri 'self'",
    // object-src 차단
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

  // Permissions policy - 더 제한적인 정책
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

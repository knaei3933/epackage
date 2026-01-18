/**
 * Rate Limiter
 *
 * APIエンドポイントのレート制限を実装します。
 * メモリベースの簡易実装（本番環境ではRedis使用を推奨）
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

// In-memory storage (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// =====================================================
// Rate Limit Configuration
// =====================================================

export const RATE_LIMIT_CONFIG = {
  // Auth endpoints - stricter limits
  auth: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5, // 5 requests per window
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
  },

  // API endpoints - moderate limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },

  // Public endpoints - lenient limits
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per window
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
};

// =====================================================
// Rate Limiter Class
// =====================================================

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private blockDurationMs: number;

  constructor(
    config: typeof RATE_LIMIT_CONFIG[keyof typeof RATE_LIMIT_CONFIG]
  ) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.blockDurationMs = config.blockDurationMs;
  }

  /**
   * Check if request should be rate limited
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // If no entry exists, allow the request
    if (!entry) {
      const resetTime = now + this.windowMs;
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime,
      });

      // Auto-cleanup after window expires
      setTimeout(() => rateLimitStore.delete(identifier), this.windowMs);

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      };
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      entry.count = 1;
      entry.resetTime = resetTime;
      entry.blockedUntil = undefined;

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      // Block the identifier
      entry.blockedUntil = now + this.blockDurationMs;

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil(this.blockDurationMs / 1000),
      };
    }

    // Increment count and allow request
    entry.count++;

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    rateLimitStore.delete(identifier);
  }

  /**
   * Get current rate limit status without incrementing
   */
  getStatus(identifier: string): {
    count: number;
    remaining: number;
    resetTime: number;
    blocked?: boolean;
  } | null {
    const entry = rateLimitStore.get(identifier);
    if (!entry) return null;

    const now = Date.now();
    const blocked = !!(entry.blockedUntil && now < entry.blockedUntil);

    return {
      count: entry.count,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked,
    };
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get client identifier from request
 * Uses IP address with fallback to user agent
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const headers = request.headers;
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown';

  // Add user agent to prevent IP spoofing
  const userAgent = headers.get('user-agent') || 'unknown';

  // Create unique identifier
  return `${ip}:${userAgent}`;
}

/**
 * Create rate limiter for auth endpoints
 */
export const createAuthRateLimiter = () =>
  new RateLimiter(RATE_LIMIT_CONFIG.auth);

/**
 * Create rate limiter for API endpoints
 */
export const createApiRateLimiter = () =>
  new RateLimiter(RATE_LIMIT_CONFIG.api);

/**
 * Create rate limiter for public endpoints
 */
export const createPublicRateLimiter = () =>
  new RateLimiter(RATE_LIMIT_CONFIG.public);

// =====================================================
// Next.js Middleware Helper
// =====================================================

/**
 * Rate limit middleware for Next.js API routes
 * Supports both Request (Pages Router) and NextRequest (App Router)
 */
export function withRateLimit(
  handler: (req: Request | NextRequest) => Promise<Response | NextResponse>,
  rateLimiter: RateLimiter
) {
  return async (req: Request | NextRequest) => {
    // DEV MODE: Bypass rate limiting for testing
    const disableRateLimit = process.env.NODE_ENV === 'development' &&
                              process.env.DISABLE_RATE_LIMIT === 'true';

    if (disableRateLimit) {
      return handler(req);
    }

    const identifier = getClientIdentifier(req);
    const result = rateLimiter.check(identifier);

    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', rateLimiter['maxRequests'].toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      headers.set('Retry-After', result.retryAfter?.toString() || '60');

      // Return Response for both Pages Router and App Router
      return new Response(
        JSON.stringify({
          error: 'リクエスト回数が上限を超えました。しばらく待ってから再度お試しください。',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    // Call the original handler
    return handler(req);
  };
}

// =====================================================
// Next.js App Router Helper
// =====================================================

/**
 * Rate limit result for Next.js App Router
 */
export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit for Next.js App Router routes
 * Returns the rate limit result and adds rate limit headers to the response
 */
export function checkRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter
): RateLimitCheckResult {
  // DEV MODE: Bypass rate limiting for testing
  const disableRateLimit = process.env.NODE_ENV === 'development' &&
                            process.env.DISABLE_RATE_LIMIT === 'true';

  if (disableRateLimit) {
    return {
      allowed: true,
      remaining: rateLimiter['maxRequests'],
      resetTime: Date.now() + rateLimiter['windowMs'],
    };
  }

  const identifier = getClientIdentifier(request);
  return rateLimiter.check(identifier);
}

/**
 * Create a 429 Too Many Requests response with rate limit headers
 */
export function createRateLimitResponse(result: RateLimitCheckResult): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: 'リクエスト回数が上限を超えました。しばらく待ってから再度お試しください。',
      errorEn: 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  );

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', '100'); // Default API limit
  response.headers.set('X-RateLimit-Remaining', '0');
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitCheckResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', '100'); // Default API limit
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
  return response;
}

// =====================================================
// Cleanup Function (call periodically)
// =====================================================

/**
 * Clean up expired entries from rate limit store
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove if window expired and not blocked
    if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

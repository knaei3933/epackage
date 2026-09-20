import { LRUCache } from 'lru-cache';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitPolicy {
  readonly maxRequests: number;
  readonly windowMs: number;
}

export const RATE_LIMIT_POLICIES = {
  'human-handoff': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  chat: { maxRequests: 20, windowMs: 15 * 60 * 1000 },
  suggestions: { maxRequests: 60, windowMs: 15 * 60 * 1000 },
} as const satisfies Record<string, RateLimitPolicy>;

export type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES;

const caches = new Map<RateLimitPolicyName, LRUCache<string, RateLimitEntry>>();

/**
 * Clear in-memory request windows. Intended for isolated tests only.
 */
export function resetRateLimitCachesForTests(): void {
  caches.clear();
}

function getCache(policyName: RateLimitPolicyName) {
  let cache = caches.get(policyName);
  if (!cache) {
    cache = new LRUCache<string, RateLimitEntry>({
      max: 500,
      ttl: RATE_LIMIT_POLICIES[policyName].windowMs,
    });
    caches.set(policyName, cache);
  }
  return cache;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

export function getRateLimitHeaders(
  result: RateLimitResult,
  now = Date.now(),
): Record<string, string> {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.resetAt.getTime() - now) / 1000),
  );

  return {
    'Retry-After': String(retryAfterSeconds),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

export async function checkRateLimit(
  identifier: string,
  policyName: RateLimitPolicyName = 'human-handoff',
): Promise<RateLimitResult> {
  const policy = RATE_LIMIT_POLICIES[policyName];
  const cache = getCache(policyName);
  const now = Date.now();
  const entry = cache.get(identifier);

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + policy.windowMs };
    cache.set(identifier, newEntry);
    return {
      success: true,
      remaining: policy.maxRequests - 1,
      resetAt: new Date(newEntry.resetAt),
      limit: policy.maxRequests,
    };
  }

  if (entry.count >= policy.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      limit: policy.maxRequests,
    };
  }

  entry.count += 1;
  cache.set(identifier, entry);
  return {
    success: true,
    remaining: policy.maxRequests - entry.count,
    resetAt: new Date(entry.resetAt),
    limit: policy.maxRequests,
  };
}

export function getClientIdentifier(request: Request): string {
  // Prefer the hosting platform's client identity before generic proxy headers.
  const headerNames = [
    'x-vercel-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-forwarded-for',
  ] as const;

  for (const headerName of headerNames) {
    const value = request.headers.get(headerName)?.trim();
    if (value) {
      return headerName === 'x-forwarded-for'
        ? value.split(',')[0]?.trim() || 'unknown'
        : value;
    }
  }

  return 'unknown';
}

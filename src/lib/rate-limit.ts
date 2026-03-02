import { LRUCache } from 'lru-cache';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1時間TTL
});

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1時間

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    rateLimitCache.set(identifier, newEntry);

    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: new Date(newEntry.resetAt),
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
    };
  }

  entry.count++;
  rateLimitCache.set(identifier, entry);

  return {
    success: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

import {
  RATE_LIMIT_POLICIES,
  checkRateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
  resetRateLimitCachesForTests,
} from '@/lib/rate-limit';

describe('chat and human-handoff rate policies', () => {
  beforeEach(() => {
    resetRateLimitCachesForTests();
  });

  it('rate limits chat at 20 requests per 15 minutes', async () => {
    const identifier = `chat-test-${crypto.randomUUID()}`;

    for (let index = 1; index < 20; index += 1) {
      const result = await checkRateLimit(identifier, 'chat');
      expect(result).toMatchObject({
        success: true,
        limit: 20,
        remaining: 20 - index,
      });
    }

    const twentieth = await checkRateLimit(identifier, 'chat');
    expect(twentieth).toMatchObject({ success: true, limit: 20, remaining: 0 });

    const twentyFirst = await checkRateLimit(identifier, 'chat');
    expect(twentyFirst.success).toBe(false);
    expect(twentyFirst.remaining).toBe(0);
    expect(twentyFirst.limit).toBe(20);
  });

  it('keeps the human-handoff default at 5 requests per hour', async () => {
    const identifier = `handoff-test-${crypto.randomUUID()}`;

    for (let index = 1; index <= 5; index += 1) {
      const result = await checkRateLimit(identifier);
      expect(result).toMatchObject({
        success: true,
        limit: 5,
        remaining: 5 - index,
      });
    }

    const sixth = await checkRateLimit(identifier);
    expect(sixth).toMatchObject({ success: false, limit: 5, remaining: 0 });
  });

  it('exposes distinct policy windows without sharing identity state', async () => {
    expect(RATE_LIMIT_POLICIES.chat).toEqual({
      maxRequests: 20,
      windowMs: 15 * 60 * 1000,
    });
    expect(RATE_LIMIT_POLICIES['human-handoff']).toEqual({
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    const identifier = `shared-test-${crypto.randomUUID()}`;
    await expect(checkRateLimit(identifier, 'chat')).resolves.toMatchObject({
      limit: 20,
      remaining: 19,
    });
    await expect(checkRateLimit(identifier)).resolves.toMatchObject({
      limit: 5,
      remaining: 4,
    });
  });
});

describe('client identity and response headers', () => {
  beforeEach(() => {
    resetRateLimitCachesForTests();
  });

  it('prefers platform identity before generic forwarded data', () => {
    const request = new Request('https://package-lab.test/api/chat', {
      headers: {
        'x-vercel-forwarded-for': '203.0.113.10',
        'x-real-ip': '203.0.113.11',
        'x-forwarded-for': '203.0.113.12, 203.0.113.13',
      },
    });

    expect(getClientIdentifier(request)).toBe('203.0.113.10');
  });

  it('uses only the first generic forwarded address when necessary', () => {
    const request = new Request('https://package-lab.test/api/chat', {
      headers: {'x-forwarded-for': '203.0.113.20, 203.0.113.21'},
    });

    expect(getClientIdentifier(request)).toBe('203.0.113.20');
  });

  it('builds bounded retry and rate-limit headers without exposing identity', () => {
    const resetAt = new Date(Date.now() + 30_000);
    const headers = getRateLimitHeaders({
      success: false,
      remaining: 0,
      resetAt,
      limit: 20,
    });

    expect(headers).toEqual({
      'Retry-After': '30',
      'X-RateLimit-Limit': '20',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': resetAt.toISOString(),
    });
  });
});

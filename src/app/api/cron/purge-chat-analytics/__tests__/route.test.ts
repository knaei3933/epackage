/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { purgeExpiredChatAnalytics } from '@/lib/chat/chat-analytics';

jest.mock('@/lib/chat/chat-analytics', () => ({
  purgeExpiredChatAnalytics: jest.fn(),
}));

const mockedPurge = purgeExpiredChatAnalytics as jest.Mock;

const createRequest = (authorization?: string) => new NextRequest(
  'https://www.package-lab.com/api/cron/purge-chat-analytics',
  { headers: authorization ? { authorization } : {} },
);

describe('/api/cron/purge-chat-analytics', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: undefined, NODE_ENV: 'test' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects an invalid cron secret without invoking retention', async () => {
    process.env.CRON_SECRET = 'cron-secret';
    const response = await GET(createRequest('Bearer wrong'));

    expect(response.status).toBe(401);
    expect(mockedPurge).not.toHaveBeenCalled();
  });

  it('purges expired non-PII analytics through GET and POST', async () => {
    process.env.CRON_SECRET = 'cron-secret';
    mockedPurge.mockResolvedValue({
      deletedEvents: 2,
      deletedSessions: 1,
      cutoff: '2026-03-24T00:00:00.000Z',
    });

    for (const response of [
      await GET(createRequest('Bearer cron-secret')),
      await POST(createRequest('Bearer cron-secret')),
    ]) {
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toContain('no-store');
      await expect(response.json()).resolves.toMatchObject({
        success: true,
        deletedEvents: 2,
        deletedSessions: 1,
      });
    }
  });

  it('returns a stable service unavailable response when retention fails', async () => {
    process.env.CRON_SECRET = 'cron-secret';
    mockedPurge.mockResolvedValue(null);

    const response = await GET(createRequest('Bearer cron-secret'));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ success: false });
  });
});

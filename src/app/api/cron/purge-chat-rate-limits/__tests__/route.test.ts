/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

const mockedCreateClient = createAuthenticatedServiceClient as jest.Mock;
const rpcMock = jest.fn();

const createRequest = (authorization?: string) => new NextRequest(
  'https://www.package-lab.com/api/cron/purge-chat-rate-limits',
  { headers: authorization ? { authorization } : {} },
);

describe('/api/cron/purge-chat-rate-limits', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetAllMocks();
    mockedCreateClient.mockReturnValue({ rpc: rpcMock });
    process.env = { ...originalEnv, CRON_SECRET: undefined, NODE_ENV: 'test' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects invalid cron authorization without invoking cleanup', async () => {
    process.env.CRON_SECRET = 'cron-secret';
    const response = await GET(createRequest('Bearer wrong'));

    expect(response.status).toBe(401);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('runs bounded cleanup through GET and POST', async () => {
    process.env.CRON_SECRET = 'cron-secret';
    rpcMock.mockResolvedValue({
      data: [{
        deleted_expired: 2,
        deleted_overflow: 1,
        remaining_rows: 3,
      }],
      error: null,
    });

    for (const response of [
      await GET(createRequest('Bearer cron-secret')),
      await POST(createRequest('Bearer cron-secret')),
    ]) {
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toContain('no-store');
      await expect(response.json()).resolves.toEqual({
        success: true,
        deletedExpired: 2,
        deletedOverflow: 1,
        remainingRows: 3,
        moreWorkRemaining: false,
      });
    }
  });

  it('fails closed when cleanup RPC fails', async () => {
    process.env.CRON_SECRET = 'cron-secret';
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'cleanup failed' } });

    const response = await GET(createRequest('Bearer cron-secret'));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      error: 'Rate limit cleanup failed',
    });
  });
});

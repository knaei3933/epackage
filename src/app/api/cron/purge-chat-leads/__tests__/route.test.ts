/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { purgeExpiredChatLeadData } from '@/lib/chat/lead-purge';

jest.mock('@/lib/chat/lead-purge', () => ({
  purgeExpiredChatLeadData: jest.fn(),
}));

const mockedPurge = purgeExpiredChatLeadData as jest.Mock;

const createRequest = (auth?: string) => new NextRequest(
  'https://www.package-lab.com/api/cron/purge-chat-leads',
  {
    method: 'GET',
    headers: auth ? { authorization: auth } : {},
  },
);

describe('/api/cron/purge-chat-leads', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: 'test-secret', NODE_ENV: 'production' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects unauthenticated request in production', async () => {
    const response = await GET(createRequest());
    expect(response.status).toBe(401);
    expect(mockedPurge).not.toHaveBeenCalled();
  });

  it('accepts valid CRON_SECRET', async () => {
    mockedPurge.mockResolvedValueOnce({ redactedContacts: 1, deletedLeads: 2, deletedAuditEvents: 0 });
    const response = await GET(createRequest('Bearer test-secret'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.redactedContacts).toBe(1);
    expect(payload.deletedLeads).toBe(2);
  });

  it('returns 503 on purge failure', async () => {
    mockedPurge.mockResolvedValueOnce(null);
    const response = await GET(createRequest('Bearer test-secret'));
    expect(response.status).toBe(503);
  });
});

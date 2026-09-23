/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { resolveChatParticipantStrict } from '@/lib/chat/participant-context';
import { getChatLeadMemberStatus } from '@/lib/chat/lead-member';

jest.mock('@/lib/chat/participant-context', () => ({
  resolveChatParticipantStrict: jest.fn(),
}));

jest.mock('@/lib/chat/lead-member', () => ({
  getChatLeadMemberStatus: jest.fn(),
}));

const mockedResolve = resolveChatParticipantStrict as jest.Mock;
const mockedGetStatus = getChatLeadMemberStatus as jest.Mock;

const createRequest = (body?: Record<string, unknown>) => new NextRequest(
  'https://www.package-lab.com/api/chat/lead/status',
  {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  },
);

describe('/api/chat/lead/status', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('rejects anonymous user', async () => {
    mockedResolve.mockResolvedValueOnce({ status: 'anonymous' });
    const response = await POST(createRequest({ leadId: '123e4567-e89b-42d3-a456-426614174000' }));
    expect(response.status).toBe(403);
    expect(mockedGetStatus).not.toHaveBeenCalled();
  });

  it('rejects staff role', async () => {
    mockedResolve.mockResolvedValueOnce({ status: 'active', userId: 'u1', role: 'ADMIN' });
    const response = await POST(createRequest({ leadId: '123e4567-e89b-42d3-a456-426614174000' }));
    expect(response.status).toBe(403);
  });

  it('rejects invalid leadId', async () => {
    mockedResolve.mockResolvedValueOnce({ status: 'active', userId: '123e4567-e89b-42d3-a456-426614174001', role: 'MEMBER' });
    const response = await POST(createRequest({ leadId: 'bad' }));
    expect(response.status).toBe(400);
    expect(mockedGetStatus).not.toHaveBeenCalled();
  });

  it('returns safe status for valid member lead', async () => {
    mockedResolve.mockResolvedValueOnce({ status: 'active', userId: '123e4567-e89b-42d3-a456-426614174001', role: 'MEMBER' });
    mockedGetStatus.mockResolvedValueOnce({
      id: '123e4567-e89b-42d3-a456-426614174000',
      status: 'new',
      outcome: 'pending',
      handoffState: 'none',
      updatedAt: '2026-01-01',
    });

    const response = await POST(createRequest({ leadId: '123e4567-e89b-42d3-a456-426614174000' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.status).toBe('new');
    expect(payload.data).not.toHaveProperty('email');
    expect(payload.data).not.toHaveProperty('phone');
  });
});

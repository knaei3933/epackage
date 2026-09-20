/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { checkRateLimit } from '@/lib/rate-limit';
import { resolveChatParticipant } from '@/lib/chat/participant-context';

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  getClientIdentifier: jest.fn(() => 'test-client'),
  getRateLimitHeaders: jest.fn(() => ({})),
}));

jest.mock('@/lib/chat/participant-context', () => ({
  resolveChatParticipant: jest.fn(),
}));

const mockedCheckRateLimit = checkRateLimit as jest.Mock;
const mockedResolveParticipant = resolveChatParticipant as jest.Mock;

const createRequest = (pathname: string) => new NextRequest(
  'https://www.package-lab.com/api/chat/suggestions',
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://www.package-lab.com',
    },
    body: JSON.stringify({ pathname, locale: 'ja' }),
  },
);

describe('/api/chat/suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 59,
      resetAt: new Date(),
      limit: 60,
    });
  });

  it.each([
    ['anonymous', null],
    ['inactive member', { userId: 'user-1', role: 'MEMBER', status: 'SUSPENDED' }],
  ])('returns only public suggestions for %s', async (_name, participant) => {
    mockedResolveParticipant.mockResolvedValue(participant);

    const response = await POST(createRequest('/member'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(payload.suggestions.length).toBeGreaterThan(0);
    expect(payload.suggestions.every((suggestion: { audience: string }) =>
      suggestion.audience === 'public')).toBe(true);
  });

  it.each([
    ['member', 'MEMBER', 'member.dashboard.overview'],
    ['admin', 'ADMIN', 'staff.workflow.escalation'],
    ['operator', 'OPERATOR', 'staff.workflow.escalation'],
    ['sales', 'SALES', 'staff.workflow.escalation'],
    ['Korea designer', 'KOREA_DESIGNER', 'designer.data.submit'],
  ])('returns the exact allowed audience for %s', async (_name, role, expectedId) => {
    const audience = role === 'MEMBER'
      ? 'member'
      : role === 'KOREA_DESIGNER'
        ? 'designer'
        : 'staff';
    mockedResolveParticipant.mockResolvedValue({
      userId: `user-${role}`,
      role,
      status: 'ACTIVE',
      audience,
    });

    const pathname = audience === 'member'
      ? '/member'
      : audience === 'designer'
        ? '/designer'
        : '/admin';
    const response = await POST(createRequest(pathname));
    const payload = await response.json();
    const ids = payload.suggestions.map((suggestion: { id: string }) => suggestion.id);

    expect(response.status).toBe(200);
    expect(ids).toContain(expectedId);
    expect(payload.suggestions.every((suggestion: { audience: string }) =>
      ['public', suggestion.audience].includes(suggestion.audience))).toBe(true);
  });

  it('returns a stable bad request for malformed context', async () => {
    mockedResolveParticipant.mockResolvedValue(null);
    const request = new NextRequest(
      'https://www.package-lab.com/api/chat/suggestions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://www.package-lab.com',
        },
        body: JSON.stringify({ pathname: 'member', locale: 'ja' }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error: 'リクエスト形式が正しくありません',
      reasonCode: 'invalid-page-context',
    });
    expect(JSON.stringify(payload)).not.toContain('member');
  });

  it('rejects a cross-origin request before parsing or context resolution', async () => {
    mockedResolveParticipant.mockResolvedValue(null);
    const request = new NextRequest(
      'https://www.package-lab.com/api/chat/suggestions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://attacker.example',
        },
        body: JSON.stringify({ pathname: '/', locale: 'ja' }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'リクエスト元が不正です' });
  });

  it('normalizes tokenized paths without echoing the token', async () => {
    mockedResolveParticipant.mockResolvedValue(null);

    const response = await POST(createRequest('/upload/secret-designer-token'));
    const serialized = await response.text();

    expect(response.status).toBe(200);
    expect(serialized).not.toContain('secret-designer-token');
  });
});

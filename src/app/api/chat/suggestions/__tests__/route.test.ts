/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { checkRateLimit } from '@/lib/rate-limit';
import { resolveChatParticipant } from '@/lib/chat/participant-context';
import { ensureChatSession } from '@/lib/chat/chat-analytics';
import {
  getChatLeadCapability,
  isLegacyHumanHandoffEnabled,
} from '@/lib/chat/lead-capture';

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  getClientIdentifier: jest.fn(() => 'test-client'),
  getRateLimitHeaders: jest.fn(() => ({})),
}));

jest.mock('@/lib/chat/participant-context', () => ({
  resolveChatParticipant: jest.fn(),
}));

jest.mock('@/lib/chat/chat-analytics', () => ({
  ensureChatSession: jest.fn(),
}));

jest.mock('@/lib/chat/lead-capture', () => ({
  getChatLeadCapability: jest.fn(),
  isLegacyHumanHandoffEnabled: jest.fn(),
}));

const mockedCheckRateLimit = checkRateLimit as jest.Mock;
const mockedResolveParticipant = resolveChatParticipant as jest.Mock;
const mockedEnsureSession = ensureChatSession as jest.Mock;
const mockedCapability = getChatLeadCapability as jest.Mock;
const mockedLegacyHandoff = isLegacyHumanHandoffEnabled as jest.Mock;
const sessionId = '123e4567-e89b-42d3-a456-426614174000';

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
    mockedCapability.mockResolvedValue({
      enabled: false,
      leadIntents: [],
      consentVersion: null,
      privacyPolicyVersion: null,
    });
    mockedLegacyHandoff.mockReturnValue(false);
    mockedEnsureSession.mockResolvedValue(sessionId);
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
    expect(payload.sessionId).toBe(sessionId);
    expect(payload.leadCaptureEnabled).toBe(false);
    expect(payload.legacyHandoffEnabled).toBe(false);
    expect(payload.memberLinkageAvailable).toBe(false);
    expect(payload.leadIntents).toBeUndefined();
    expect(payload.consentVersion).toBeUndefined();
    expect(payload.privacyPolicyVersion).toBeUndefined();
    expect(payload.suggestions.every((suggestion: { audience: string }) =>
      suggestion.audience === 'public')).toBe(true);
  });

  it('reuses a valid tab-scoped session and sends only normalized route family', async () => {
    mockedResolveParticipant.mockResolvedValue(null);
    mockedEnsureSession.mockResolvedValue(sessionId);

    const response = await POST(new NextRequest(
      'https://www.package-lab.com/api/chat/suggestions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://www.package-lab.com',
        },
        body: JSON.stringify({
          pathname: '/catalog/product-token',
          locale: 'ja',
          sessionId,
        }),
      },
    ));
    const serialized = await response.text();

    expect(response.status).toBe(200);
    expect(serialized).not.toContain('product-token');
    expect(mockedEnsureSession).toHaveBeenCalledWith(expect.objectContaining({
      routeFamily: 'catalog',
      existingSessionId: sessionId,
    }));
  });

  it('returns full lead capability only when server readiness accepts it', async () => {
    mockedCapability.mockResolvedValueOnce({
      enabled: true,
      leadIntents: ['quote', 'sample', 'technical', 'human'],
      consentVersion: 1,
      privacyPolicyVersion: 1,
    });
    mockedResolveParticipant.mockResolvedValueOnce({
      userId: 'member-user',
      role: 'MEMBER',
      status: 'ACTIVE',
      audience: 'member',
    });

    const response = await POST(createRequest('/member'));
    const payload = await response.json();

    expect(payload.leadCaptureEnabled).toBe(true);
    expect(payload.memberLinkageAvailable).toBe(true);
    expect(payload.leadIntents).toEqual(['quote', 'sample', 'technical', 'human']);
    expect(payload.consentVersion).toBe(1);
    expect(payload.privacyPolicyVersion).toBe(1);
    expect(JSON.stringify(payload)).not.toContain('privacy_approval');
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

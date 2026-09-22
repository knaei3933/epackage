/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getChatLeadCapability } from '@/lib/chat/lead-capture';
import { resolveChatParticipantStrict } from '@/lib/chat/participant-context';
import {
  checkChatLeadRateLimit,
  submitChatLead,
} from '@/lib/chat/lead-server';
import { recordChatFunnelEvents } from '@/lib/chat/chat-analytics';

jest.mock('@/lib/chat/lead-capture', () => ({
  getChatLeadCapability: jest.fn(),
}));

jest.mock('@/lib/chat/participant-context', () => ({
  resolveChatParticipantStrict: jest.fn(),
}));

jest.mock('@/lib/chat/lead-server', () => ({
  checkChatLeadRateLimit: jest.fn(),
  submitChatLead: jest.fn(),
}));

jest.mock('@/lib/chat/chat-analytics', () => ({
  recordChatFunnelEvents: jest.fn(),
}));

const mockedCapability = getChatLeadCapability as jest.Mock;
const mockedResolveParticipant = resolveChatParticipantStrict as jest.Mock;
const mockedCheckRateLimit = checkChatLeadRateLimit as jest.Mock;
const mockedSubmitLead = submitChatLead as jest.Mock;
const mockedRecordEvents = recordChatFunnelEvents as jest.Mock;

class RequestWithBodySpy extends NextRequest {
  readonly jsonSpy = jest.fn(() => Promise.resolve({}));

  constructor(url: string, init?: RequestInit) {
    super(url, init);
  }

  json(): Promise<unknown> {
    return this.jsonSpy();
  }
}

const createRequest = (
  origin = 'https://www.package-lab.com',
) => new RequestWithBodySpy(
  'https://www.package-lab.com/api/chat/lead',
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify({ secret: 'do-not-parse' }),
  },
);

const createEnabledRequest = (
  origin = 'https://www.package-lab.com',
) => new RequestWithBodySpy(
  'https://www.package-lab.com/api/chat/lead',
  {
    method: 'POST',
    headers: {
      'content-length': '1000',
      'content-type': 'application/json',
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify({
      sessionId: '123e4567-e89b-42d3-a456-426614174000',
      intent: 'quote',
      requirements: { contentsDescription: '包装材の選定相談' },
      contact: {
        channel: 'email',
        email: 'customer@example.jp',
        preferredChannel: 'email',
        contactWindow: 'unspecified',
      },
      consent: {
        contact: true,
        privacy: true,
        marketing: false,
        memberLinkage: false,
      },
      memberLinkage: false,
      pageContext: { pathname: '/quote-simulator', locale: 'ja' },
    }),
  },
);

describe('/api/chat/lead privacy gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  mockedCapability.mockResolvedValue({ enabled: false });
  mockedCheckRateLimit.mockResolvedValue({ allowed: false });
  mockedSubmitLead.mockResolvedValue({ accepted: false });
  mockedRecordEvents.mockResolvedValue(true);
  });

  it('returns a stable disabled response without parsing the body', async () => {
    const request = createRequest();
    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(payload).toEqual({
      error: 'この機能は現在利用できません。',
      reasonCode: 'lead_capture_disabled',
    });
    expect(request.jsonSpy).not.toHaveBeenCalled();
    expect(mockedResolveParticipant).not.toHaveBeenCalled();
  });

  it('rejects cross-origin requests before identity or body work', async () => {
    const request = createRequest('https://attacker.example');
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(request.jsonSpy).not.toHaveBeenCalled();
    expect(mockedResolveParticipant).not.toHaveBeenCalled();
  });

  it('keeps the capability hidden and separate from public suggestion text', async () => {
    expect((await mockedCapability()).enabled).toBe(false);
  });

  it.each([
    ['admin', 'ADMIN'],
    ['operator', 'OPERATOR'],
    ['sales', 'SALES'],
    ['Korea designer', 'KOREA_DESIGNER'],
  ])('rejects an active %s before body parsing when internal testing unlocks capability', async (
    _name,
    role,
  ) => {
    mockedCapability.mockResolvedValueOnce({ enabled: true });
    mockedResolveParticipant.mockResolvedValueOnce({
      status: 'active',
      userId: `user-${role.toLowerCase()}`,
      role,
    });
    const request = createRequest();

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(request.jsonSpy).not.toHaveBeenCalled();
  });

  it('returns 503 without body parsing on participant infrastructure failure', async () => {
    mockedCapability.mockResolvedValueOnce({ enabled: true });
    mockedResolveParticipant.mockResolvedValueOnce({
      status: 'infrastructure-error',
    });
    const request = createRequest();

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(request.jsonSpy).not.toHaveBeenCalled();
  });

  it('validates and stores a lead only after durable rate limiting succeeds', async () => {
    mockedCapability.mockResolvedValueOnce({
      enabled: true,
      leadIntents: ['quote', 'sample', 'technical', 'human'],
      consentVersion: 1,
      privacyPolicyVersion: 1,
    });
    mockedResolveParticipant.mockResolvedValueOnce({ status: 'anonymous' });
    mockedCheckRateLimit.mockResolvedValueOnce({ allowed: true });
    mockedSubmitLead.mockResolvedValueOnce({ accepted: true, leadId: 'lead-id' });
    const request = createEnabledRequest();

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(payload).toEqual({ accepted: true });
    expect(mockedCheckRateLimit).toHaveBeenCalledWith({
      memberUserId: undefined,
      sessionId: 'pending-request',
      forwardedFor: '',
    });
    expect(mockedSubmitLead).toHaveBeenCalledWith(expect.objectContaining({
      memberUserId: undefined,
    }));
    expect((mockedSubmitLead.mock.calls[0]?.[0].lead.contact as { email?: string }).email)
      .toBe('customer@example.jp');
    expect(mockedRecordEvents).toHaveBeenCalledWith(
      '123e4567-e89b-42d3-a456-426614174000',
      [{ eventType: 'contact_submitted' }],
    );
    expect(request.jsonSpy).not.toHaveBeenCalled();
  });

  it('does not read lead values when durable rate limiting fails closed', async () => {
    mockedCapability.mockResolvedValueOnce({
      enabled: true,
      leadIntents: ['quote', 'sample', 'technical', 'human'],
      consentVersion: 1,
      privacyPolicyVersion: 1,
    });
    mockedResolveParticipant.mockResolvedValueOnce({ status: 'anonymous' });
    mockedCheckRateLimit.mockResolvedValueOnce({ allowed: false });
    const request = createEnabledRequest();

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(mockedSubmitLead).not.toHaveBeenCalled();
    expect(mockedRecordEvents).not.toHaveBeenCalled();
  });
});

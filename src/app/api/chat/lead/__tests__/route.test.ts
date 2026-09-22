/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getChatLeadCapability } from '@/lib/chat/lead-capture';
import { resolveChatParticipantStrict } from '@/lib/chat/participant-context';

jest.mock('@/lib/chat/lead-capture', () => ({
  getChatLeadCapability: jest.fn(),
}));

jest.mock('@/lib/chat/participant-context', () => ({
  resolveChatParticipantStrict: jest.fn(),
}));

const mockedCapability = getChatLeadCapability as jest.Mock;
const mockedResolveParticipant = resolveChatParticipantStrict as jest.Mock;

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

describe('/api/chat/lead privacy gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCapability.mockResolvedValue({ enabled: false });
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
});

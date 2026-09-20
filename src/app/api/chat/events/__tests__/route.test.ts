/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { checkRateLimit } from '@/lib/rate-limit';
import { recordChatFunnelEvents } from '@/lib/chat/chat-analytics';

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  getClientIdentifier: jest.fn(() => 'test-client'),
  getRateLimitHeaders: jest.fn(() => ({})),
}));

jest.mock('@/lib/chat/chat-analytics', () => ({
  recordChatFunnelEvents: jest.fn(),
  isValidChatFunnelEvent: jest.requireActual('@/lib/chat/chat-analytics').isValidChatFunnelEvent,
}));

const mockedCheckRateLimit = checkRateLimit as jest.Mock;
const mockedRecord = recordChatFunnelEvents as jest.Mock;
const sessionId = '123e4567-e89b-42d3-a456-426614174000';

const createRequest = (
  body: unknown,
  origin = 'https://www.package-lab.com',
) => new NextRequest('https://www.package-lab.com/api/chat/events', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(origin ? { origin } : {}),
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

describe('/api/chat/events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 119,
      resetAt: new Date(),
      limit: 120,
    });
  });

  it('rejects cross-origin requests before parsing or analytics writes', async () => {
    const response = await POST(createRequest({
      sessionId,
      events: [{ eventType: 'chat_closed' }],
    }, 'https://attacker.example'));

    expect(response.status).toBe(403);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it('accepts a bounded enum-only batch', async () => {
    mockedRecord.mockResolvedValue(true);
    const response = await POST(createRequest({
      sessionId,
      events: [{
        eventType: 'suggestion_selected',
        suggestionId: 'public.home.selection',
      }],
    }));
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(payload).toEqual({ accepted: true });
    expect(mockedRecord).toHaveBeenCalledWith(sessionId, [{
      eventType: 'suggestion_selected',
      suggestionId: 'public.home.selection',
    }]);
  });

  it('rejects message/contact/form fields without calling analytics', async () => {
    const response = await POST(createRequest({
      sessionId,
      events: [{
        eventType: 'answer_completed',
        message: 'SECRET',
        email: 'attacker@example.com',
      }],
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ reasonCode: 'invalid-events' });
    expect(mockedRecord).not.toHaveBeenCalled();
    expect(JSON.stringify(response.body)).not.toContain('SECRET');
  });

  it('rejects malformed JSON and unknown top-level keys', async () => {
    const malformed = await POST(createRequest('not-json'));
    expect(malformed.status).toBe(400);

    const extra = await POST(createRequest({
      sessionId,
      events: [{ eventType: 'chat_closed' }],
      userAgent: 'SECRET',
    }));
    expect(extra.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });
});

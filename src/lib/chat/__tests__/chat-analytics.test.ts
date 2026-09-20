/**
 * @jest-environment node
 */

import {
  ensureChatSession,
  isValidChatFunnelEvent,
  recordChatFunnelEvents,
} from '@/lib/chat/chat-analytics';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

const mockedCreateClient = createAuthenticatedServiceClient as jest.Mock;
const fromMock = jest.fn();

const selectMock = jest.fn();
const insertMock = jest.fn();
const updateMock = jest.fn();
const eqMock = jest.fn();
const gtMock = jest.fn();
const isMock = jest.fn();
const maybeSingleMock = jest.fn();
const singleMock = jest.fn();

describe('chat analytics contract', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedCreateClient.mockReturnValue({ from: fromMock });

    selectMock.mockReturnValue({ maybeSingle: maybeSingleMock });
    insertMock.mockReturnValue({ select: selectMock });
    updateMock.mockReturnValue({ eq: eqMock });
    eqMock.mockReturnValue({ gt: gtMock });
    gtMock.mockReturnValue({ is: isMock });
    isMock.mockReturnValue({ select: selectMock });
  });

  it('accepts only enum events with bounded suggestion IDs', () => {
    expect(isValidChatFunnelEvent({ eventType: 'suggestion_selected' })).toBe(true);
    expect(isValidChatFunnelEvent({
      eventType: 'suggestion_selected',
      suggestionId: 'public.home.selection',
    })).toBe(true);
    expect(isValidChatFunnelEvent({ eventType: 'raw_message' })).toBe(false);
    expect(isValidChatFunnelEvent({
      eventType: 'chat_closed',
      message: 'SECRET',
    })).toBe(false);
    expect(isValidChatFunnelEvent({
      eventType: 'chat_closed',
      suggestionId: 'INVALID',
    })).toBe(false);
  });

  it('creates a non-PII server session', async () => {
    selectMock.mockReturnValueOnce({ single: singleMock });
    singleMock.mockResolvedValueOnce({
      data: { id: 'session-1' },
      error: null,
    });
    fromMock.mockReturnValueOnce({ insert: insertMock });

    await expect(ensureChatSession({
      audience: 'public',
      routeFamily: 'home',
    })).resolves.toBe('session-1');

    expect(fromMock).toHaveBeenCalledWith('chat_sessions');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      audience: 'public',
      initial_route_family: 'home',
      last_route_family: 'home',
    }));
    expect(JSON.stringify(insertMock.mock.calls[0][0])).not.toContain('user_id');
    expect(JSON.stringify(insertMock.mock.calls[0][0])).not.toContain('pathname');
  });

  it('rejects event batches that are empty, oversized, or invalid', async () => {
    await expect(recordChatFunnelEvents('session-1', [])).resolves.toBe(false);
    await expect(recordChatFunnelEvents(
      'session-1',
      Array.from({ length: 21 }, () => ({ eventType: 'chat_closed' as const })),
    )).resolves.toBe(false);
    await expect(recordChatFunnelEvents('session-1', [
      { eventType: 'answer_completed', message: 'SECRET' } as never,
    ])).resolves.toBe(false);
    expect(mockedCreateClient).not.toHaveBeenCalled();
  });
});

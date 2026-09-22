import { act, fireEvent, render, screen } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatWidget } from '../ChatWidget';
import { PUBLIC_CHAT_FALLBACK_SUGGESTIONS } from '@/lib/chat/public-chat-suggestions';

const mockUseChat = jest.fn();
const mockUsePathname = jest.fn();
const sendMessageMock = jest.fn();
const stableMessages: UIMessage[] = [];
const transports: Array<{
  prepareSendMessagesRequest: (options: unknown) => { body: unknown };
}> = [];

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn((...args: unknown[]) => mockUseChat(...args)),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/lib/markdown-renderer', () => ({
  markdownToHtml: async (value: string) => value,
}));

const fetchMock = jest.fn((input: RequestInfo | URL) => {
  const url = String(input);
  if (url === '/api/config') {
    return Promise.resolve(new Response(JSON.stringify({
      success: true,
      data: { maintenance_mode: { enabled: false } },
    }), { headers: { 'content-type': 'application/json' } }));
  }
  if (url === '/api/chat/suggestions') {
    return Promise.resolve(new Response(JSON.stringify({
      sessionId: '123e4567-e89b-42d3-a456-426614174000',
      suggestions: [{
        id: 'public.home.selection',
        labelJa: '製品選択',
        questionJa: '包装材の種類はどう選べばよいですか？',
      }],
      leadCaptureEnabled: false,
    }), { headers: { 'content-type': 'application/json' } }));
  }
  return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'content-type': 'application/json' },
  }));
});

describe('ChatWidget suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stableMessages.length = 0;
    global.fetch = fetchMock as unknown as typeof fetch;
    mockUsePathname.mockReturnValue('/');
    mockUseChat.mockImplementation((options: {
      transport: { prepareSendMessagesRequest: (value: unknown) => { body: unknown } };
    }) => {
      transports.push(options.transport as typeof transports[number]);
      return {
        messages: stableMessages,
        sendMessage: sendMessageMock,
        status: 'ready',
        error: undefined,
      };
    });
  });

  it('fetches page suggestions only after opening and sends a chip as a normal message', async () => {
    const view = render(
      <LanguageProvider>
        <ChatWidget />
      </LanguageProvider>,
    );
    await act(async () => {});
    expect(fetchMock.mock.calls.some(([input]) => String(input).startsWith('/api/chat/suggestions'))).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
    await act(async () => {});
    expect(fetchMock.mock.calls.some(([input]) => String(input).startsWith('/api/chat/suggestions'))).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '包装材の種類はどう選べばよいですか？' }));
    await act(async () => {});
    expect(sendMessageMock).toHaveBeenCalledWith({
      text: '包装材の種類はどう選べばよいですか？',
    });

    const body = transports.at(-1)!.prepareSendMessagesRequest({
      id: 'chat-1',
      messages: [],
      trigger: 'submit-message',
      messageId: undefined,
      abortSignal: new AbortController().signal,
    }).body as Record<string, unknown>;
    expect(body.suggestionId).toBe('public.home.selection');
    expect(fetchMock.mock.calls.some(([input, init]) =>
      String(input) === '/api/chat/events' &&
      String((init as RequestInit | undefined)?.body).includes('"eventType":"suggestion_selected"')
    )).toBe(true);
    expect(screen.getByTestId('chat-input')).toBeVisible();
    expect(screen.queryByTestId('chat-lead-form')).toBeNull();
    view.unmount();
  });

  it('uses only the generic fallback when detailed suggestions cannot be loaded', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/config') {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: { maintenance_mode: { enabled: false } },
        }), { headers: { 'content-type': 'application/json' } }));
      }
      if (url === '/api/chat/suggestions') {
        return Promise.reject(new Error('offline'));
      }
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok' })));
    });

    const view = render(
      <LanguageProvider>
        <ChatWidget />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
    await act(async () => {});

    for (const suggestion of PUBLIC_CHAT_FALLBACK_SUGGESTIONS.slice(0, 3)) {
      expect(screen.getByRole('button', { name: suggestion.questionJa })).toBeInTheDocument();
    }
    expect(view.container.querySelector('[data-lead-capture-enabled]'))
      .toHaveAttribute('data-lead-capture-enabled', 'false');
  });

  it('sends structured lead data with the current page context and no transcript', async () => {
    const sessionId = '123e4567-e89b-42d3-a456-426614174000';
    let leadBody: Record<string, unknown> | undefined;
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/config') {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: { maintenance_mode: { enabled: false } },
        }), { headers: { 'content-type': 'application/json' } }));
      }
      if (url === '/api/chat/suggestions') {
        return Promise.resolve(new Response(JSON.stringify({
          sessionId,
          leadCaptureEnabled: true,
          legacyHandoffEnabled: false,
          memberLinkageAvailable: false,
          leadIntents: ['quote', 'sample', 'technical', 'human'],
          consentVersion: 1,
          privacyPolicyVersion: 1,
          suggestions: [{
            id: 'public.home.consultation',
            labelJa: '相談',
            questionJa: '要件を整理して相談したいです。',
            audience: 'public',
            leadIntent: 'human',
          }],
        }), { headers: { 'content-type': 'application/json' } }));
      }
      if (url === '/api/chat/lead') {
        leadBody = JSON.parse(String(init?.body));
        return Promise.resolve(new Response(JSON.stringify({ accepted: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }));
      }
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'content-type': 'application/json' },
      }));
    });

    render(
      <LanguageProvider>
        <ChatWidget />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: '要件を整理して相談したいです。' }));
    await act(async () => {});

    fireEvent.change(screen.getByLabelText('内容・用途'), {
      target: { value: '包装材の選定について相談したい' },
    });
    fireEvent.change(screen.getByPlaceholderText('example@example.com'), {
      target: { value: 'customer@example.jp' },
    });
    for (const checkbox of screen.getAllByRole('checkbox').slice(0, 3)) {
      fireEvent.click(checkbox);
    }
    fireEvent.click(screen.getByRole('button', { name: '内容を保存する' }));
    await act(async () => {});

    expect(leadBody).toMatchObject({
      sessionId,
      intent: 'human',
      requirements: { contentsDescription: '包装材の選定について相談したい' },
      contact: { email: 'customer@example.jp' },
      consent: { contact: true, privacy: true, marketing: true },
      memberLinkage: false,
      pageContext: { pathname: '/', locale: 'ja' },
    });
    expect(Object.keys(leadBody ?? {})).not.toContain('messages');
    expect(screen.getByText('承知いたしました。担当者より確認いたします。')).toBeVisible();
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatWidget } from '../ChatWidget';

const mockUseChat = jest.fn();
const mockUsePathname = jest.fn();
const sendMessageMock = jest.fn();
const parseChatPageContextMock = jest.fn();
const actualPageContext = jest.requireActual('@/lib/chat/page-context') as
  typeof import('@/lib/chat/page-context');
const stableMessages: UIMessage[] = [];

type TransportConfig = {
  sendMessages: (options: {
    trigger: 'submit-message';
    chatId: string;
    messageId: string | undefined;
    messages: UIMessage[];
    abortSignal: AbortSignal;
  }) => Promise<unknown>;
};

const transports: TransportConfig[] = [];

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn((...args: unknown[]) => mockUseChat(...args)),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/lib/markdown-renderer', () => ({
  markdownToHtml: async (value: string) => value,
}));

jest.mock('@/lib/chat/page-context', () => ({
  parseChatPageContext: (...args: unknown[]) => parseChatPageContextMock(...args),
}));

const jsonFetch = jest.fn((input: RequestInfo | URL) => {
  const url = String(input);
  if (url === '/api/config') {
    return Promise.resolve(new Response(JSON.stringify({
      success: true,
      data: { maintenance_mode: { enabled: false } },
    }), { headers: { 'content-type': 'application/json' } }));
  }

  return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'content-type': 'application/json' },
  }));
});

const chatFetch = jest.fn(() => Promise.resolve(new Response('', {
  headers: { 'content-type': 'text/event-stream' },
})));

const setQuotePage = (step: string) => {
  document.querySelector('[data-quote-step]')?.setAttribute('data-quote-step', step);
};

const renderWidget = () => render(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>
  );

const renderOpenWidget = async () => {
  const view = renderWidget();
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
  await act(async () => {});
  return view;
};

const sendCurrentRequest = async () => {
  const transport = transports[transports.length - 1]!;
  const lifecycleFetch = global.fetch;
  global.fetch = chatFetch as unknown as typeof fetch;
  try {
    await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'chat-1',
      messageId: 'message-1',
      messages: [{
        id: 'message-1',
        role: 'user',
        parts: [{ type: 'text', text: 'hello' }],
      }],
      abortSignal: new AbortController().signal,
    });
  } finally {
    global.fetch = lifecycleFetch;
  }
};

const lastChatBody = () => {
  const request = chatFetch.mock.calls.at(-1)!;
  return JSON.parse(String(request[1]?.body)) as {
    id: string;
    messages: UIMessage[];
    trigger: string;
    messageId?: string;
    pageContext: Record<string, unknown>;
  };
};

describe('ChatWidget page context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    transports.length = 0;
    stableMessages.length = 0;
    global.fetch = jsonFetch as unknown as typeof fetch;
    mockUsePathname.mockReturnValue('/');
    parseChatPageContextMock.mockImplementation(
      (input: unknown) => actualPageContext.parseChatPageContext(input)
    );
    mockUseChat.mockImplementation((options: { transport: TransportConfig }) => {
      transports.push(options.transport);
      return { messages: stableMessages, sendMessage: sendMessageMock, status: 'ready', error: undefined };
    });
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves route, step, and focused field at request time without values', async () => {
    document.body.insertAdjacentHTML('beforeend', `
      <div data-quote-step="specs">
        <input id="fixture-width" data-chat-field="width" value="SECRET-WIDTH" />
        <select id="fixture-post-processing" data-chat-field="post-processing"><option>SECRET-POST-PROCESSING</option></select>
      </div>
    `);
    const view = await renderOpenWidget();

    await sendCurrentRequest();
    expect(lastChatBody().pageContext).toEqual({ pathname: '/', locale: 'ja' });

    mockUsePathname.mockReturnValue('/quote-simulator');
    setQuotePage('specs');
    fireEvent.focusIn(screen.getByTestId('chat-input'));
    fireEvent.focusIn(document.getElementById('fixture-width')!);
    await act(async () => { view.rerender(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>
  ); });
    fireEvent.focusIn(screen.getByTestId('chat-input'));
    fireEvent.focusIn(document.getElementById('fixture-width')!);
    await sendCurrentRequest();
    expect(lastChatBody().pageContext).toEqual({
      pathname: '/quote-simulator',
      locale: 'ja',
      quoteStep: 'specs',
      fieldId: 'width',
    });
    expect(JSON.stringify(lastChatBody().pageContext)).not.toContain('SECRET-WIDTH');
    expect(Object.keys(lastChatBody().pageContext).sort()).toEqual([
      'fieldId', 'locale', 'pathname', 'quoteStep',
    ]);

    setQuotePage('post-processing');
    fireEvent.focusIn(document.getElementById('fixture-post-processing')!);
    await sendCurrentRequest();
    expect(lastChatBody().pageContext).toEqual({
      pathname: '/quote-simulator',
      locale: 'ja',
      quoteStep: 'post-processing',
      fieldId: 'post-processing',
    });

    mockUsePathname.mockReturnValue('/contact');
    await act(async () => { view.rerender(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>
  ); });
    await sendCurrentRequest();
    expect(lastChatBody().pageContext).toEqual({ pathname: '/contact', locale: 'ja' });
  });

  it('keeps submitted messages online while useChat errors still downgrade', async () => {
    document.body.insertAdjacentHTML('beforeend', `
      <div data-quote-step="specs">
        <input data-chat-field="width" value="120" />
      </div>
    `);
    const view = await renderOpenWidget();
    mockUsePathname.mockReturnValue('/quote-simulator');
    await act(async () => { view.rerender(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>
  ); });
    fireEvent.focusIn(document.querySelector('[data-chat-field="width"]')!);

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '幅を相談したい' } });
    fireEvent.submit(screen.getByTestId('chat-form'));

    expect(sendMessageMock).toHaveBeenCalledWith({ text: '幅を相談したい' });
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オンライン');

    mockUseChat.mockReturnValue({
      messages: stableMessages,
      sendMessage: sendMessageMock,
      status: 'ready',
      error: new Error('send failed'),
    });
    await act(async () => { view.rerender(
      <LanguageProvider>
        <ChatWidget />
      </LanguageProvider>
    ); });
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オフライン');
  });

  it('falls back to a safe page context when the parser fails unexpectedly', async () => {
    await renderOpenWidget();
    parseChatPageContextMock.mockReturnValue({
      success: false,
      reason: 'malformed',
    });

    await sendCurrentRequest();
    expect(lastChatBody().pageContext).toEqual({ pathname: '/', locale: 'ja' });
  });

  it('sends pageContext alongside normal chat fields', async () => {
    document.body.insertAdjacentHTML('beforeend', `
      <div data-quote-step="specs">
        <input data-chat-field="width" value="120" />
      </div>
    `);
    const view = await renderOpenWidget();
    mockUsePathname.mockReturnValue('/quote-simulator');
    await act(async () => { view.rerender(
      <LanguageProvider>
        <ChatWidget />
      </LanguageProvider>
    ); });
    fireEvent.focusIn(document.querySelector('[data-chat-field="width"]')!);

    await sendCurrentRequest();
    const body = lastChatBody();
    expect(body).toEqual({
      id: 'chat-1',
      messages: [{
        id: 'message-1',
        role: 'user',
        parts: [{ type: 'text', text: 'hello' }],
      }],
      trigger: 'submit-message',
      messageId: 'message-1',
      pageContext: {
        pathname: '/quote-simulator',
        locale: 'ja',
        quoteStep: 'specs',
        fieldId: 'width',
      },
    });
    expect(body.pageContext).not.toHaveProperty('widthValue');
    expect(JSON.stringify(body.pageContext)).not.toContain('120');
  });
});

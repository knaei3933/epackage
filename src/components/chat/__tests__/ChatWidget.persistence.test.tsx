import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatWidget } from '../ChatWidget';

const mockUsePathname = jest.fn();
const chatOptions: Array<{ id?: string; messages?: UIMessage[] }> = [];
const sendMessageMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/lib/markdown-renderer', () => ({
  markdownToHtml: async (value: string) => value,
}));

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn((options: { id?: string; messages?: UIMessage[] }) => {
    chatOptions.push(options);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react') as typeof import('react');
    const [messages, setMessages] = React.useState<UIMessage[]>(options.messages ?? []);

    return {
      id: options.id ?? 'mock-chat',
      messages,
      setMessages,
      sendMessage: sendMessageMock,
      status: 'ready',
      error: undefined,
    };
  }),
}));

const jsonFetch = jest.fn((input: RequestInfo | URL) => {
  const url = String(input);
  const body = url === '/api/config'
    ? { success: true, data: { maintenance_mode: { enabled: false } } }
    : { status: 'ok' };

  return Promise.resolve(new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  }));
});

const storedMessage: UIMessage = {
  id: 'stored-message',
  role: 'user',
  parts: [{ type: 'text', text: 'ページ移動後も残る会話' }],
};

const renderOpenWidget = async () => {
  const view = render(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>
  );
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
  await act(async () => {});
  return view;
};

describe('ChatWidget conversation persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chatOptions.length = 0;
    sendMessageMock.mockClear();
    window.sessionStorage.clear();
    Element.prototype.scrollIntoView = jest.fn();
    global.fetch = jsonFetch as unknown as typeof fetch;
    mockUsePathname.mockReturnValue('/');
  });

  it('restores the current tab conversation after the widget remounts', async () => {
    window.sessionStorage.setItem(
      'epackage-lab-chat-history-v1',
      JSON.stringify([storedMessage])
    );

    const firstView = await renderOpenWidget();
    expect(screen.getByText('ページ移動後も残る会話')).toBeInTheDocument();
    expect(chatOptions.at(-1)).toMatchObject({
      id: 'epackage-lab-site-chat',
      messages: [storedMessage],
    });

    firstView.unmount();
    await renderOpenWidget();

    expect(screen.getByText('ページ移動後も残る会話')).toBeInTheDocument();
    expect(window.sessionStorage.getItem('epackage-lab-chat-history-v1')).toBe(
      JSON.stringify([storedMessage])
    );
  });

  it('can clear a restored conversation and its session storage', async () => {
    window.sessionStorage.setItem(
      'epackage-lab-chat-history-v1',
      JSON.stringify([storedMessage])
    );
    await renderOpenWidget();

    fireEvent.click(screen.getByRole('button', { name: '会話を削除' }));

    await waitFor(() => {
      expect(screen.getByText('こんにちは！Epackage Labです。')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(window.sessionStorage.getItem('epackage-lab-chat-history-v1')).toBeNull();
    });
    expect(screen.queryByRole('button', { name: '会話を削除' })).not.toBeInTheDocument();
  });
});

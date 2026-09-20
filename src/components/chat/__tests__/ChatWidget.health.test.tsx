import { act, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatWidget } from '../ChatWidget';

const mockUseChat = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn((...args: unknown[]) => mockUseChat(...args)),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/lib/markdown-renderer', () => ({
  markdownToHtml: async (value: string) => value,
}));

const fetchMock = jest.fn();

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), {
  headers: { 'content-type': 'application/json' },
});

const advanceOnePoll = async () => {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(60000);
  });
};

const healthCallCount = () =>
  fetchMock.mock.calls.filter(([input]) => String(input) === '/api/health').length;

const renderOpenWidget = () => {
  const view = render(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>
  );
  return { open: async () => {
    fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
    await act(async () => {});
  }, view };
};

describe('ChatWidget health lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === '/api/config') return Promise.resolve(jsonResponse({
        success: true,
        data: { maintenance_mode: { enabled: false } },
      }));
      return Promise.resolve(jsonResponse({ status: 'ok' }));
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    mockUsePathname.mockReturnValue('/');
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      status: 'ready',
      error: undefined,
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    console.error.mockRestore();
  });

  it('recovers online after a failed poll and keeps maintenance authoritative', async () => {
    const { open } = renderOpenWidget();
    await open();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オンライン');

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === '/api/config') return Promise.resolve(jsonResponse({
        success: true,
        data: { maintenance_mode: { enabled: false } },
      }));
      return Promise.reject(new Error('health unavailable'));
    });
    await advanceOnePoll();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オフライン');
    expect(screen.getByRole('link', { name: 'お問い合わせフォーム' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /お電話/ })).toHaveAttribute('href', 'tel:050-1793-6500');

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === '/api/config') return Promise.resolve(jsonResponse({
        success: true,
        data: { maintenance_mode: { enabled: true } },
      }));
      return Promise.resolve(jsonResponse({ status: 'ok' }));
    });
    await advanceOnePoll();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('メンテナンス中');
  });

  it('recovers from offline to online and stops polling after cleanup', async () => {
    const { open, view } = renderOpenWidget();
    await open();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オンライン');
    expect(healthCallCount()).toBe(1);

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === '/api/config') return Promise.resolve(jsonResponse({
        success: true,
        data: { maintenance_mode: { enabled: false } },
      }));
      return Promise.reject(new Error('health unavailable'));
    });
    await advanceOnePoll();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オフライン');
    expect(healthCallCount()).toBe(2);

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === '/api/config') return Promise.resolve(jsonResponse({
        success: true,
        data: { maintenance_mode: { enabled: false } },
      }));
      return Promise.resolve(jsonResponse({ status: 'ok' }));
    });
    await advanceOnePoll();
    expect(screen.getByTestId('connection-status')).toHaveTextContent('オンライン');
    expect(healthCallCount()).toBe(3);

    view.unmount();
    const fetchCallsAtCleanup = fetchMock.mock.calls.length;
    await advanceOnePoll();
    expect(fetchMock.mock.calls.length).toBe(fetchCallsAtCleanup);
  });
});

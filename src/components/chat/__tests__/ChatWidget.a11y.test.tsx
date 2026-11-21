import { act, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatDrawerProvider } from '@/contexts/ChatDrawerContext';
import { ChatWidget } from '../ChatWidget';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('@/lib/markdown-renderer', () => ({ markdownToHtml: async (v: string) => v }));
// useChat の戻り値は毎回同じ物にする（新しい配列を返すと、メッセージ更新の effect が止まらなくなる）
jest.mock('@ai-sdk/react', () => {
  const result = { id: 'mock', messages: [], setMessages: () => {}, sendMessage: () => {}, status: 'ready', error: undefined };
  return { useChat: () => result };
});

const okFetch = jest.fn((input: RequestInfo | URL) => {
  const body = String(input) === '/api/config'
    ? { success: true, data: { maintenance_mode: { enabled: false } } }
    : { status: 'ok' };
  return Promise.resolve(new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } }));
});

describe('ChatWidget アクセシビリティ', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    Element.prototype.scrollIntoView = jest.fn();
    global.fetch = okFetch as unknown as typeof fetch;
  });

  it('開くと dialog になり、フォーカスが中に入り、Esc で閉じてボタンに戻る', async () => {
    render(<ChatDrawerProvider><LanguageProvider><ChatWidget /></LanguageProvider></ChatDrawerProvider>);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'チャットを開く' }));
    await act(async () => {});

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(screen.getByText(/自動応答/)).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    await act(async () => {});
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'チャットを開く' }));
  });

  it('閉じているとき、「確認中」の文言を出さない', async () => {
    render(<ChatDrawerProvider><LanguageProvider><ChatWidget /></LanguageProvider></ChatDrawerProvider>);
    await act(async () => {});
    expect(screen.queryByLabelText('確認中...')).toBeNull();
  });
});

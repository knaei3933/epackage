/**
 * @jest-environment jsdom
 *
 * 見積もりウィザードを開けること（モジュールを読み込む時点の例外・描画の例外がないこと）、
 * 入力の保存と復元（sessionStorage）、数量が足りないときの「次へ」の理由を確かめる。
 * 本物の API は呼ばない（fetch はモック）。
 */
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ variable: 'font-heading-var', className: '', style: {} }),
  Noto_Sans_JP: () => ({ variable: 'font-body-var', className: '', style: {} }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/quote-simulator',
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false }),
}));

import { QuoteProvider } from '@/contexts/QuoteContext';
import { MultiQuantityQuoteProvider } from '@/contexts/MultiQuantityQuoteContext';
import { ImprovedQuotingWizard } from '../wizards/ImprovedQuotingWizard';
import { QUOTE_SESSION_KEY, saveQuoteSession, loadQuoteSession } from '../wizards/quoteSessionStorage';
import { TermHelp } from '../shared/TermHelp';

const fetchMock = jest.fn();

function renderWizard() {
  return render(
    <QuoteProvider>
      <MultiQuantityQuoteProvider>
        <ImprovedQuotingWizard />
      </MultiQuantityQuoteProvider>
    </QuoteProvider>,
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: {} }) });
  (global as any).fetch = fetchMock;
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/quote-simulator');
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('ImprovedQuotingWizard', () => {
  it('開ける（読み込み・描画で例外が出ない）', async () => {
    await act(async () => {
      renderWizard();
    });
    expect(document.getElementById('quote-wizard-content')).not.toBeNull();
    expect(screen.getByRole('button', { name: '次のステップに進む' })).toBeInTheDocument();
  });

  it('見出しの下に、シミュレーター内の年は今年で出る（2025 の固定ではない）', async () => {
    await act(async () => {
      renderWizard();
    });
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Epackage Lab`))).toBeInTheDocument();
  });

  it('最初の画面では、?step=1 が履歴に入る', async () => {
    await act(async () => {
      renderWizard();
    });
    expect(new URLSearchParams(window.location.search).get('step')).toBe('1');
  });

  it('入力が変わると sessionStorage に保存される', async () => {
    await act(async () => {
      renderWizard();
    });
    const saved = loadQuoteSession();
    expect(saved).not.toBeNull();
    expect(saved?.fields.bagTypeId).toBeDefined();
    expect(window.sessionStorage.getItem(QUOTE_SESSION_KEY)).toContain('bagTypeId');
  });

  it('保存した入力と画面の番号を、開いたときに復元する', async () => {
    saveQuoteSession(
      { bagTypeId: 'stand_up', materialId: 'pet_al', width: 123, height: 234, depth: 45 },
      1,
      [[600, 900]],
    );
    await act(async () => {
      renderWizard();
    });
    // 2 番目の画面（後加工）に戻っている
    expect(document.getElementById('quote-wizard-content')?.getAttribute('data-quote-step')).toBe('post-processing');
    const restored = loadQuoteSession();
    expect(restored?.fields.width).toBe(123);
    expect(restored?.fields.bagTypeId).toBe('stand_up');
    expect(new URLSearchParams(window.location.search).get('step')).toBe('2');
  });

  it('結果の画面の番号が保存されていても、1 つ前の画面までにとどめる', async () => {
    saveQuoteSession({ bagTypeId: 'flat_3_side' }, 3, []);
    await act(async () => {
      renderWizard();
    });
    expect(document.getElementById('quote-wizard-content')?.getAttribute('data-quote-step')).toBe('sku-quantity');
  });

  it('こわれた保存データは捨てて、開ける', async () => {
    window.sessionStorage.setItem(QUOTE_SESSION_KEY, '{not json');
    await act(async () => {
      renderWizard();
    });
    expect(document.getElementById('quote-wizard-content')?.getAttribute('data-quote-step')).toBe('specs');
  });

  it('数量が 0 のとき「次へ」は押せず、すぐ近くに理由が出る', async () => {
    saveQuoteSession(
      { bagTypeId: 'flat_3_side', skuCount: 1, skuQuantities: [0], quantity: 0, quantityMode: 'single' },
      2,
      [],
    );
    await act(async () => {
      renderWizard();
    });
    const next = screen.getByRole('button', { name: '次のステップに進む' });
    expect(next).toBeDisabled();
    const reason = document.getElementById('quote-next-reason');
    expect(reason).not.toBeNull();
    expect(reason?.textContent).toMatch(/数量は/);
    expect(next.getAttribute('aria-describedby')).toBe('quote-next-reason');
  });

  it('ブラウザの「戻る」で、外に出ずにステップが戻る', async () => {
    saveQuoteSession({ bagTypeId: 'flat_3_side' }, 1, []);
    await act(async () => {
      renderWizard();
    });
    expect(document.getElementById('quote-wizard-content')?.getAttribute('data-quote-step')).toBe('post-processing');
    await act(async () => {
      window.history.replaceState(window.history.state, '', '/quote-simulator?step=1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(document.getElementById('quote-wizard-content')?.getAttribute('data-quote-step')).toBe('specs');
  });
});

describe('TermHelp', () => {
  it('aria-label つきの「?」で開閉でき、Esc で閉じる', () => {
    render(<TermHelp term="sealWidth" />);
    const button = screen.getByRole('button', { name: 'シール幅の説明' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('note')).toHaveTextContent('貼り合わせ');
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('note')).toBeNull();
  });
});

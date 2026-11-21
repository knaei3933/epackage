/**
 * Cookie 同意バナー: 開けること（render）、小さな帯の約束（print:hidden / 44px）、
 * 同意の動き（許可・拒否・設定）が変わっていないこと。
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const grantAll = jest.fn();
const denyAll = jest.fn();
const savePreferences = jest.fn();
let consented = false;

jest.mock('@/lib/analytics/consent', () => ({
  hasConsent: () => consented,
  grantAll: () => grantAll(),
  denyAll: () => denyAll(),
  savePreferences: (p: unknown) => savePreferences(p),
  applyStoredConsent: jest.fn(),
}));

import { CookieConsentBanner } from '../CookieConsentBanner';

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    consented = false;
    jest.clearAllMocks();
  });

  it('未同意なら開き、印刷では隠す（print:hidden）', () => {
    render(<CookieConsentBanner />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('print:hidden');
  });

  it('同意済みなら出さない', () => {
    consented = true;
    render(<CookieConsentBanner />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('ボタンはすべて min-h-11（44px 以上）', () => {
    render(<CookieConsentBanner />);
    for (const name of ['詳細設定', 'すべて拒否', 'すべて許可']) {
      expect(screen.getByRole('button', { name }).className).toContain('min-h-11');
    }
  });

  it('すべて許可 → grantAll を呼んで閉じる', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'すべて許可' }));
    expect(grantAll).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('すべて拒否 → denyAll を呼んで閉じる', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'すべて拒否' }));
    expect(denyAll).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('詳細設定 → 分析だけ入れて保存できる', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: '詳細設定' }));
    expect(screen.getByRole('link', { name: 'プライバシーポリシー' }).className).toContain('min-h-11');
    fireEvent.click(screen.getByRole('switch', { name: '分析 Cookie' }));
    fireEvent.click(screen.getByRole('button', { name: '選択を保存' }));
    expect(savePreferences).toHaveBeenCalledWith({ analytics: true, marketing: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('開いている間だけ、body の下に余白を足す', () => {
    const { unmount } = render(<CookieConsentBanner />);
    expect(document.body.style.paddingBottom).not.toBe('');
    unmount();
    expect(document.body.style.paddingBottom).toBe('');
  });
});

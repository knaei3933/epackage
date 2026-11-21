import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/' }));
jest.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, isLoading: false }) }));
jest.mock('@/components/auth', () => ({ UserMenu: () => null, AuthModal: () => null }));
jest.mock('@/lib/analytics', () => ({ trackPhoneClick: jest.fn() }));

import { Header } from '../Header';
import { Footer } from '../Footer';

describe('Header', () => {
  it('開ける。nav に名前があり、「今すぐ相談」は a の中に button がない', () => {
    const { container } = render(<Header />);
    container.querySelectorAll('nav').forEach((n) => expect(n).toHaveAttribute('aria-label'));
    const cta = screen.getByRole('link', { name: '今すぐ相談' });
    expect(cta.querySelector('button')).toBeNull();
    expect(container.querySelectorAll('a button')).toHaveLength(0);
  });

  it('サービスのメニューは Esc で閉じ、フォーカスがボタンに戻る', () => {
    render(<Header />);
    const btn = screen.getAllByRole('button', { name: /サービス/ })[0];
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(btn);
  });
});

describe('Footer', () => {
  it('開ける。リンクは 44px 以上の高さを求める', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: '製造工程' });
    expect(link.className).toMatch(/min-h-11/);
    expect(link.className).not.toMatch(/lg:min-h-0/);
  });
});

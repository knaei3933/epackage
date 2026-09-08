import { render, screen } from '@testing-library/react';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

import { AdminNavigation } from '../AdminNavigation';

describe('AdminNavigation responsive wrap layout', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin/inquiries');
  });

  it('wraps every admin link without a horizontal scrolling tab strip', () => {
    render(<AdminNavigation />);

    const nav = screen.getByRole('navigation', { name: '管理者ナビゲーション' });
    const strip = nav.firstElementChild?.firstElementChild as HTMLElement;

    expect(strip).toHaveClass('flex-wrap');
    expect(strip).toHaveClass('min-w-0');
    expect(strip).not.toHaveClass('overflow-x-auto');
    expect(strip).not.toHaveClass('space-x-1');

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(13);
    for (const link of links) {
      expect(link).toHaveClass('max-w-full');
      expect(link).not.toHaveClass('whitespace-nowrap');
    }
  });

  it('marks the active administration page for assistive technology', () => {
    render(<AdminNavigation />);

    const active = screen.getByRole('link', { name: /お問い合わせ/ });
    expect(active).toHaveAttribute('aria-current', 'page');
  });
});

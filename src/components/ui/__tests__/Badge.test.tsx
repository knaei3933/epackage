import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge, CurrencyBadge, TagBadge } from '../Badge';

describe('Badge (Epackage UI 基準 v1)', () => {
  it('四角（rounded-inner）で、ピル型にならない', () => {
    render(<Badge>新着</Badge>);
    const badge = screen.getByText('新着').closest('div') as HTMLElement;
    expect(badge).toHaveClass('rounded-inner', 'text-[13px]', 'font-medium');
    expect(badge).not.toHaveClass('rounded-full');
  });

  it('default はブランドの淡い塗り、success は状態の淡い塗り', () => {
    const { rerender } = render(<Badge>A</Badge>);
    expect(screen.getByText('A').closest('div')).toHaveClass('bg-brand-muted', 'text-on-brand-muted');
    rerender(<Badge variant="success">A</Badge>);
    expect(screen.getByText('A').closest('div')).toHaveClass('bg-success-muted', 'text-on-success-muted');
  });

  it('metallic / CurrencyBadge / TagBadge にグラデーションがない', () => {
    render(
      <>
        <Badge variant="metallic">M</Badge>
        <CurrencyBadge amount={1000} />
        <TagBadge>T</TagBadge>
      </>
    );
    document.querySelectorAll('div').forEach((el) => {
      expect(el.className).not.toContain('gradient');
      expect(el.className).not.toContain('rounded-full');
    });
  });
});

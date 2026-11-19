/* global describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

const VARIANTS = [
  'primary', 'secondary', 'outline', 'ghost', 'link',
  'destructive', 'success', 'warning', 'info', 'metallic', 'brixa-gradient',
] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'icon', 'icon-sm', 'icon-lg'] as const;
const FORBIDDEN = ['bg-gradient', 'shadow-', 'scale-', 'before:', 'backdrop-blur'];

describe('Button (Epackage UI 基準 v1)', () => {
  it('既定（primary / md）は bg-brand と text-on-brand を持つ', () => {
    render(<Button>送信</Button>);
    const button = screen.getByRole('button', { name: '送信' });
    expect(button).toHaveClass('bg-brand', 'text-on-brand', 'hover:bg-brand-hover', 'active:bg-brand-pressed');
  });

  it.each(VARIANTS)('variant=%s は 禁止クラスを含まない', (variant) => {
    SIZES.forEach((size) => {
      const { unmount } = render(<Button variant={variant} size={size}>テスト</Button>);
      const className = screen.getByRole('button').className;
      FORBIDDEN.forEach((token) => {
        expect(className).not.toContain(token);
      });
      unmount();
    });
  });

  it.each(['metallic', 'brixa-gradient'] as const)('%s は primary と同じクラスになる', (variant) => {
    const { unmount } = render(<Button variant="primary">A</Button>);
    const primaryClass = screen.getByRole('button').className;
    unmount();
    render(<Button variant={variant}>A</Button>);
    expect(screen.getByRole('button').className).toBe(primaryClass);
  });

  it('loading のとき aria-busy="true" で disabled になる', () => {
    render(<Button loading>送信</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('loading でないとき aria-busy を付けない', () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('size="md" は h-10 と max-sm:h-11 を持つ', () => {
    render(<Button size="md">送信</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'max-sm:h-11');
  });

  it('size の高さは xs=h-8 / sm=h-9 / lg=h-12', () => {
    const { rerender } = render(<Button size="xs">A</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
    rerender(<Button size="sm">A</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');
    rerender(<Button size="lg">A</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('link は size の高さ・余白より h-auto px-0 が勝つ', () => {
    render(<Button variant="link">詳しく見る</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-auto', 'px-0');
    expect(button).not.toHaveClass('h-10');
    expect(button).not.toHaveClass('px-4');
  });

  it('badge は overflow-hidden に切られない', () => {
    render(<Button badge={<span>3</span>}>カート</Button>);
    expect(screen.getByRole('button').className).not.toContain('overflow-hidden');
  });
});

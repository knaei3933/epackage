/* global describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';
import { GlassCard } from '../GlassCard';

const FORBIDDEN = ['bg-gradient', 'backdrop-blur', 'shadow-xl', 'shadow-2xl', 'scale-', 'translate-y'];

describe('Card (Epackage UI 基準 v1)', () => {
  it('既定は不透明 + 細い枠線 + rounded-container で、影なし', () => {
    render(<Card data-testid="c">x</Card>);
    const card = screen.getByTestId('c');
    expect(card).toHaveClass('bg-bg-primary', 'border', 'border-border-medium', 'rounded-container');
    expect(card.className).not.toMatch(/(^|\s)shadow-(?!none)/);
  });

  it('interactive はホバーで border-dark + shadow-low', () => {
    render(<Card variant="interactive" data-testid="c">x</Card>);
    expect(screen.getByTestId('c')).toHaveClass('hover:border-border-dark', 'hover:shadow-low');
  });

  it.each(['default', 'elevated', 'outlined', 'ghost', 'metallic', 'interactive', 'brixa', 'glass'] as const)(
    'variant=%s は禁止クラスを含まない',
    (variant) => {
      render(<Card variant={variant} data-testid="c">x</Card>);
      const className = screen.getByTestId('c').className;
      FORBIDDEN.forEach((token) => expect(className).not.toContain(token));
    }
  );

  it('GlassCard は半透明・ぼかしを使わない', () => {
    const { container } = render(<GlassCard hoverEffect>x</GlassCard>);
    const className = (container.firstChild as HTMLElement).className;
    expect(className).not.toContain('backdrop-blur');
    expect(className).not.toContain('white/');
    expect(className).toContain('rounded-container');
  });
});

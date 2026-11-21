import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TermHelp } from '../TermHelp';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

function Harness({ onConfirm, onSubmit }: { onConfirm: () => void; onSubmit: () => void }) {
  useKeyboardNavigation({ onConfirm, canProceed: true });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <TermHelp term="gravure" />
      <input aria-label="qty" />
    </form>
  );
}

describe('TermHelp と Enter キー', () => {
  it('「?」ボタンで Enter を押すと説明が開き、「次へ」(onConfirm) も送信も呼ばれない', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onSubmit = jest.fn();
    render(<Harness onConfirm={onConfirm} onSubmit={onSubmit} />);
    const btn = screen.getByRole('button', { name: 'グラビア印刷の説明' });
    btn.focus();
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('ボタン以外（body）での Enter は、これまでどおり onConfirm を呼ぶ', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(<Harness onConfirm={onConfirm} onSubmit={jest.fn()} />);
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

import { render, screen, act } from '@testing-library/react';
import { ChatDrawerProvider, useChatDrawer } from '../ChatDrawerContext';

function TestConsumer() {
  const { isOpen, open, close, toggle } = useChatDrawer();
  return (
    <div>
      <span data-testid="is-open">{String(isOpen)}</span>
      <button onClick={open} data-testid="open-btn">open</button>
      <button onClick={close} data-testid="close-btn">close</button>
      <button onClick={toggle} data-testid="toggle-btn">toggle</button>
    </div>
  );
}

describe('ChatDrawerContext', () => {
  it('starts closed', () => {
    render(
      <ChatDrawerProvider>
        <TestConsumer />
      </ChatDrawerProvider>,
    );
    expect(screen.getByTestId('is-open').textContent).toBe('false');
  });

  it('opens with open()', () => {
    render(
      <ChatDrawerProvider>
        <TestConsumer />
      </ChatDrawerProvider>,
    );
    act(() => { screen.getByTestId('open-btn').click(); });
    expect(screen.getByTestId('is-open').textContent).toBe('true');
  });

  it('closes with close()', () => {
    render(
      <ChatDrawerProvider>
        <TestConsumer />
      </ChatDrawerProvider>,
    );
    act(() => { screen.getByTestId('open-btn').click(); });
    act(() => { screen.getByTestId('close-btn').click(); });
    expect(screen.getByTestId('is-open').textContent).toBe('false');
  });

  it('toggles with toggle()', () => {
    render(
      <ChatDrawerProvider>
        <TestConsumer />
      </ChatDrawerProvider>,
    );
    act(() => { screen.getByTestId('toggle-btn').click(); });
    expect(screen.getByTestId('is-open').textContent).toBe('true');
    act(() => { screen.getByTestId('toggle-btn').click(); });
    expect(screen.getByTestId('is-open').textContent).toBe('false');
  });
});

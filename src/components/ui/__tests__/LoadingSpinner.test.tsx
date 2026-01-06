import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { LoadingSpinner } from '../LoadingSpinner';

// Mock CSS animations for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Test wrapper with context provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LoadingProvider>
    {children}
  </LoadingProvider>
);

describe('LoadingSpinner', () => {
  it('renders default spinner', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );

    // Check if the spinner SVG is rendered
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(
      <TestWrapper>
        <LoadingSpinner size="xl" />
      </TestWrapper>
    );

    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('renders with variant dots', () => {
    render(
      <TestWrapper>
        <LoadingSpinner variant="dots" />
      </TestWrapper>
    );

    // Check if dots container is rendered
    const dotsContainer = screen.getByText('', { selector: '.flex.space-x-1' });
    expect(dotsContainer).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <TestWrapper>
        <LoadingSpinner label="Loading data..." />
      </TestWrapper>
    );

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with centered layout', () => {
    render(
      <TestWrapper>
        <LoadingSpinner center />
      </TestWrapper>
    );

    const container = screen.getByText('', { selector: '.flex.items-center.justify-center' });
    expect(container).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <LoadingSpinner className="custom-class" />
      </TestWrapper>
    );

    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('custom-class');
  });
});
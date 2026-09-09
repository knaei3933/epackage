import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { UnifiedDashboardClient } from '../UnifiedDashboardClient';
import { fetcher } from '@/hooks/use-optimized-fetch';
import type { UnifiedDashboardStats } from '@/lib/dashboard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-optimized-fetch', () => ({
  fetcher: jest.fn(),
}));

const mockFetcher = jest.mocked(fetcher);

function stats(totalOrders: number, pendingOrders: number): UnifiedDashboardStats {
  return {
    totalOrders,
    pendingOrders,
    totalRevenue: 12345,
    activeUsers: 4,
    nextActions: [],
    announcements: [],
  };
}

async function renderClient(initialStatsPromise: Promise<unknown>) {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <UnifiedDashboardClient
        initialStatsPromise={initialStatsPromise as never}
        userId="user-1"
        userName="Taro"
        initialPeriod={30}
      />
    </SWRConfig>,
    );
  });
  return view;
}

describe('UnifiedDashboardClient runtime boundary', () => {
  beforeEach(() => {
    mockFetcher.mockReset();
  });

  it('renders the successful initial payload and does not duplicate it with a mount fetch', async () => {
    mockFetcher.mockResolvedValue(stats(99, 9));

    await renderClient(Promise.resolve({
      status: 'success',
      stats: stats(12, 3),
    }));

    expect(await screen.findByText('合計: 12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('fetches exactly once from the changed SWR key when the period changes', async () => {
    mockFetcher.mockImplementation(async (input) => {
      const url = String(input);
      return stats(url.includes('period=7') ? 7 : 30, 2);
    });

    await renderClient(Promise.resolve({
      status: 'success',
      stats: stats(12, 3),
    }));
    await screen.findByText('合計: 12');

    await act(async () => {
    await act(async () => {
      await userEvent.selectOptions(screen.getByLabelText('期間:'), '7');
    });
      await Promise.resolve();
    });

    expect(await screen.findByText('合計: 7')).toBeInTheDocument();
    await waitFor(() => expect(mockFetcher).toHaveBeenCalledTimes(1));
    expect(String(mockFetcher.mock.calls[0]?.[0])).toBe(
      '/api/member/dashboard/unified-stats?period=7&userId=user-1',
    );
  });

  it('renders retry UI for an initial error result and never presents zero stats', async () => {
    mockFetcher.mockResolvedValue(stats(99, 9));

    await renderClient(Promise.resolve({
      status: 'error',
      message: 'DASHBOARD_DATA_UNAVAILABLE',
    }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('DASHBOARD_DATA_UNAVAILABLE');
    expect(alert).not.toHaveTextContent('database unavailable');
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
    expect(mockFetcher).not.toHaveBeenCalled();
    expect(screen.queryByText('合計: 0')).not.toBeInTheDocument();
  });

  it('recovers from an initial failure when the retry button performs one bounded fetch', async () => {
    mockFetcher.mockResolvedValueOnce(stats(99, 9));

    await renderClient(Promise.resolve({
      status: 'error',
      message: 'DASHBOARD_DATA_UNAVAILABLE',
    }));

    const retryButton = await screen.findByRole('button', { name: '再試行' });
    expect(mockFetcher).not.toHaveBeenCalled();

    await userEvent.click(retryButton);

    expect(await screen.findByText('合計: 99')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(String(mockFetcher.mock.calls[0]?.[0])).toBe(
      '/api/member/dashboard/unified-stats?period=30&userId=user-1',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import AdminDashboardClient from '../AdminDashboardClient';
import { fetcher } from '@/hooks/use-optimized-fetch';
import type { AdminDashboardStats, AdminAuthContext } from '@/types/admin';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: function MockNextDynamic() {
    return function MockOrderStatisticsWidget({
      statistics,
    }: {
      statistics?: AdminDashboardStats;
    }) {
      return <div data-testid="order-statistics">{JSON.stringify(statistics)}</div>;
    };
  },
}));

jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag: string) => {
      if (tag === 'button') {
        return function MockMotionButton({
          children,
          disabled,
          onClick,
          className,
        }: {
          children?: React.ReactNode;
          disabled?: boolean;
          onClick?: () => void;
          className?: string;
        }) {
          return (
            <button type="button" disabled={disabled} onClick={onClick} className={className}>
              {children}
            </button>
          );
        }
      }
      return function MockMotionDiv(props: React.HTMLAttributes<HTMLDivElement>) {
        return <div {...props} />;
      };
    },
  }),
}));

jest.mock('@/lib/supabase-browser', () => ({ supabase: null }));
jest.mock('@/hooks/use-optimized-fetch', () => ({ fetcher: jest.fn() }));
jest.mock('@/components/admin/dashboard-widgets/RecentActivityWidget', () => ({
  RecentActivityWidget: () => <div data-testid="recent-activity" />,
}));
jest.mock('@/components/admin/dashboard-widgets/QuickActionsWidget', () => ({
  QuickActionsWidget: () => <div data-testid="quick-actions" />,
}));
jest.mock('@/components/admin/dashboard-widgets/AlertsWidget', () => ({
  AlertsWidget: () => <div data-testid="alerts" />,
}));

const mockFetcher = jest.mocked(fetcher);

function stats(totalOrders: number): AdminDashboardStats {
  return {
    totalOrders,
    pendingOrders: 2,
    totalRevenue: 50000,
    activeUsers: 8,
    ordersByStatus: [{ status: 'QUOTATION_PENDING', count: 5 }],
    pendingQuotations: 4,
    todayShipments: 1,
    monthlyRevenue: [{ month: '2026-09', revenue: 50000 }],
    activeCustomers: 8,
    quotations: { total: 10, approved: 6, conversionRate: 60 },
  };
}

const authContext: AdminAuthContext = {
  userId: 'admin-1',
  role: 'admin',
  userName: 'Hanako',
  permissions: [],
  isDevMode: false,
};

async function renderClient(initialStatsPromise: Promise<unknown>) {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <AdminDashboardClient
        authContext={authContext}
        initialStatsPromise={initialStatsPromise as never}
        initialPeriod={30}
      />
    </SWRConfig>,
    );
  });
  return view;
}

describe('AdminDashboardClient runtime boundary', () => {
  beforeEach(() => {
    mockFetcher.mockReset();
  });

  it('renders successful initial values and does not duplicate the server payload on mount', async () => {
    mockFetcher.mockResolvedValue(stats(99));

    await renderClient(Promise.resolve({ status: 'success', stats: stats(12) }));

    expect(await screen.findByTestId('order-statistics')).toHaveTextContent('"totalOrders":12');
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('fetches exactly once from the changed key when the period changes', async () => {
    mockFetcher.mockImplementation(async () => stats(7));

    await renderClient(Promise.resolve({ status: 'success', stats: stats(12) }));
    await screen.findByTestId('order-statistics');

    await act(async () => {
      await userEvent.selectOptions(screen.getByRole('combobox'), '7');
    });
    await waitFor(() => expect(mockFetcher).toHaveBeenCalledTimes(1));
    expect(String(mockFetcher.mock.calls[0]?.[0])).toBe(
      '/api/admin/dashboard/unified-stats?period=7',
    );
    expect(await screen.findByTestId('order-statistics')).toHaveTextContent('"totalOrders":7');
  });

  it('renders error/retry for a failure result and renders no zero-filled stats', async () => {
    mockFetcher.mockResolvedValue(stats(99));

    await renderClient(Promise.resolve({
      status: 'error',
      message: 'database unavailable',
    }));

    expect(await screen.findByText('database unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
    expect(screen.queryByTestId('order-statistics')).not.toBeInTheDocument();
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('recovers from an initial failure when retry performs one bounded mutation', async () => {
    mockFetcher.mockResolvedValueOnce(stats(99));

    await renderClient(Promise.resolve({
      status: 'error',
      message: 'database unavailable',
    }));

    const retryButton = await screen.findByRole('button', { name: '再試行' });
    expect(mockFetcher).not.toHaveBeenCalled();

    await userEvent.click(retryButton);

    expect(await screen.findByTestId('order-statistics')).toHaveTextContent(
      '"totalOrders":99',
    );
    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(String(mockFetcher.mock.calls[0]?.[0])).toBe(
      '/api/admin/dashboard/unified-stats?period=30',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

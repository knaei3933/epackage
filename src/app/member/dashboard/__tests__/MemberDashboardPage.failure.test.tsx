import { buildInitialStatsPromise } from '../page';
import { requireAuth, getUnifiedDashboardStats } from '@/lib/dashboard';
import { fetcher } from '@/hooks/use-optimized-fetch';

jest.mock('@/lib/dashboard', () => ({
  requireAuth: jest.fn(),
  AuthRequiredError: class AuthRequiredError extends Error {},
  getUnifiedDashboardStats: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock('@/hooks/use-optimized-fetch', () => ({ fetcher: jest.fn() }));

const mockRequireAuth = jest.mocked(requireAuth);
const mockGetStats = jest.mocked(getUnifiedDashboardStats);
const mockFetcher = jest.mocked(fetcher);

describe('member dashboard route failure boundary', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes a failure result to the client and renders retry UI instead of zeros', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRequireAuth.mockResolvedValue({
      id: 'user-1',
      user_metadata: { kanji_last_name: 'Yamada' },
    } as never);
    mockGetStats.mockRejectedValue(new Error('database unavailable'));
    mockFetcher.mockReset();

    const result = await buildInitialStatsPromise('user-1');
    expect(result).toEqual({
      status: 'error',
      message: 'DASHBOARD_DATA_UNAVAILABLE',
    });
    expect(result.message).not.toContain('database unavailable');
    expect(consoleError).toHaveBeenCalledWith(
      '[Dashboard] Failed to fetch unified stats:',
      expect.any(Error),
    );
    expect(mockFetcher).not.toHaveBeenCalled();
  });
});

import { buildInitialStatsPromise } from '../page';
import { getAdminAuth } from '@/app/admin/loader';
import { fetchOrderStats, fetchQuotationStats } from '../data';

jest.mock('@/app/admin/loader', () => ({
  getAdminAuth: jest.fn(),
}));

jest.mock('../data', () => ({
  fetchOrderStats: jest.fn(),
  fetchQuotationStats: jest.fn(),
  normalizeAdminInitialStats: jest.requireActual('../data').normalizeAdminInitialStats,
}));

const mockGetAdminAuth = jest.mocked(getAdminAuth);
const mockFetchOrderStats = jest.mocked(fetchOrderStats);
const mockFetchQuotationStats = jest.mocked(fetchQuotationStats);

describe('admin dashboard initial stats normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminAuth.mockResolvedValue({
      userId: 'admin-1',
      role: 'admin',
      userName: 'Hanako',
      permissions: [],
      isDevMode: false,
    });
  });

  it('maps raw order and quotation fields explicitly and skips initial SWR fetch', async () => {
    mockFetchOrderStats.mockResolvedValue({
      total: 12,
      pending: 3,
      processing: 4,
      completed: 5,
      totalRevenue: 67890,
      ordersByStatus: [{ status: 'PENDING', count: 3 }],
      monthlyRevenue: [{ month: '2026-09', revenue: 67890 }],
    });
    mockFetchQuotationStats.mockResolvedValue({
      total: 10,
      draft: 4,
      sent: 2,
      approved: 6,
      rejected: 0,
      converted: 0,
      totalAmount: 10000,
    });

    const result = await buildInitialStatsPromise();

    expect(result).toEqual({
      status: 'success',
      stats: {
        totalOrders: 12,
        pendingOrders: 3,
        processingOrders: 4,
        completedOrders: 5,
        totalRevenue: 67890,
        activeUsers: 0,
        todayShipments: 0,
        ordersByStatus: [{ status: 'PENDING', count: 3 }],
        monthlyRevenue: [{ month: '2026-09', revenue: 67890 }],
        activeCustomers: 0,
        pendingQuotations: 6,
        quotations: { total: 10, approved: 6, conversionRate: 60 },
      },
    });
    expect(mockFetchOrderStats).toHaveBeenCalledWith(30);
    expect(mockFetchQuotationStats).toHaveBeenCalledWith(30);
  });

  it('turns a null source result into visible failure UI instead of zero stats', async () => {
    mockFetchOrderStats.mockResolvedValue(null);
    mockFetchQuotationStats.mockResolvedValue({
      total: 10,
      draft: 4,
      sent: 2,
      approved: 6,
      rejected: 0,
      converted: 0,
      totalAmount: 10000,
    });

    await expect(buildInitialStatsPromise()).resolves.toEqual({
      status: 'error',
      message: 'ダッシュボードデータの取得に失敗しました',
    });
  });
});

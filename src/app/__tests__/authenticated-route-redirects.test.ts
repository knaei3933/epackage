const redirect = jest.fn(() => {
  throw new Error('NEXT_REDIRECT');
});
const requireAuth = jest.fn();
const getAdminAuth = jest.fn();

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirect(...args as []),
}));

jest.mock('@/lib/dashboard', () => {
  class AuthRequiredError extends Error {
    constructor() {
      super('Authentication required');
      this.name = 'AuthRequiredError';
    }
  }
  return {
    AuthRequiredError,
    requireAuth: (...args: unknown[]) => requireAuth(...args as []),
    getUnifiedDashboardStats: jest.fn(),
  };
});

jest.mock('@/app/member/dashboard/UnifiedDashboardClient', () => ({
  UnifiedDashboardClient: () => null,
}));
jest.mock('@/app/member/quotations/loader', () => ({
  fetchQuotationsServerSide: jest.fn(),
}));
jest.mock('@/app/member/quotations/QuotationsClient', () => (() => null));
jest.mock('@/app/member/orders/OrdersClient', () => ({
  OrdersClient: () => null,
}));
jest.mock('@/lib/auth/request-context', () => ({
  getRequestRBACContext: jest.fn(),
}));
jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));
jest.mock('@/types/order-status', () => ({
  isOrderStatus: jest.fn(() => true),
  getStatusProgress: jest.fn(() => 100),
}));
jest.mock('@/app/admin/loader', () => ({
  getAdminAuth: (...args: unknown[]) => getAdminAuth(...args as []),
}));
jest.mock('@/app/admin/dashboard/data', () => ({
  fetchOrderStats: jest.fn(),
  fetchQuotationStats: jest.fn(),
}));
jest.mock('@/app/admin/dashboard/AdminDashboardClient', () => (() => null));

import DashboardPage from '@/app/member/dashboard/page';
import QuotationsPage from '@/app/member/quotations/page';
import OrdersPage from '@/app/member/orders/page';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import { AuthRequiredError } from '@/lib/dashboard';

describe('authenticated streaming route redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    requireAuth.mockRejectedValue(new AuthRequiredError());
  });

  it('redirects the member dashboard before starting or exposing dashboard data', async () => {
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/signin?redirect=/member/dashboard');
  });

  it('redirects member quotations before resolving search params or quotation data', async () => {
    await expect(QuotationsPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/signin?redirect=/member/quotations');
  });

  it('redirects member orders before RBAC resolution or order loading', async () => {
    await expect(OrdersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/signin?redirect=/member/orders');
  });

  it('keeps the existing admin dashboard RBAC redirect', async () => {
    getAdminAuth.mockRejectedValue(new Error('NEXT_REDIRECT'));
    await expect(AdminDashboardPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow('NEXT_REDIRECT');
    expect(getAdminAuth).toHaveBeenCalledWith(
      ['order:read', 'quotation:read'],
      '/auth/signin?redirect=/admin/dashboard',
    );
  });
});

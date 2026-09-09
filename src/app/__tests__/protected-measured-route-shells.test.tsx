import { Suspense, use } from 'react';
import type { ReactElement } from 'react';
import { act, render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import AdminOrdersPage from '@/app/admin/orders/page';
import AdminQuotationsPage from '@/app/admin/quotations/page';
import MemberDashboardPage from '@/app/member/dashboard/page';
import MemberOrdersPage from '@/app/member/orders/page';
import MemberQuotationsPage from '@/app/member/quotations/page';
import { getAdminAuth } from '@/app/admin/loader';
import {
  AuthRequiredError,
  getUnifiedDashboardStats,
  requireAuth,
} from '@/lib/dashboard';
import { createServiceClient } from '@/lib/supabase';
import {
  fetchOrderStats,
  fetchQuotationStats,
} from '@/app/admin/dashboard/data';
import { getInitialAdminQuotations } from '@/app/admin/quotations/loader';
import { fetchQuotationsServerSide } from '@/app/member/quotations/loader';
import { getRequestRBACContext } from '@/lib/auth/request-context';
import AdminOrdersClient from '@/app/admin/orders/AdminOrdersClient';
import { OrdersClient } from '@/app/member/orders/OrdersClient';
import QuotationsClient from '@/app/member/quotations/QuotationsClient';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/app/admin/loader', () => ({
  getAdminAuth: jest.fn(),
}));

jest.mock('@/lib/dashboard', () => ({
  requireAuth: jest.fn(),
  AuthRequiredError: class AuthRequiredError extends Error {},
  getUnifiedDashboardStats: jest.fn(),
}));

jest.mock('@/app/admin/dashboard/data', () => ({
  fetchOrderStats: jest.fn(),
  fetchQuotationStats: jest.fn(),
  normalizeAdminInitialStats: jest.requireActual(
    '../admin/dashboard/data',
  ).normalizeAdminInitialStats,
}));

jest.mock('@/app/admin/quotations/loader', () => ({
  getInitialAdminQuotations: jest.fn(),
}));

jest.mock('@/app/member/quotations/loader', () => ({
  fetchQuotationsServerSide: jest.fn(),
}));

jest.mock('@/lib/auth/request-context', () => ({
  getRequestRBACContext: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/app/admin/dashboard/AdminDashboardClient', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="admin-dashboard-content" />),
}));

jest.mock('@/app/admin/orders/AdminOrdersClient', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="admin-orders-content" />),
}));

jest.mock('@/app/admin/quotations/AdminQuotationsClient', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="admin-quotations-content" />),
}));

jest.mock('@/app/member/dashboard/UnifiedDashboardClient', () => ({
  UnifiedDashboardClient: jest.fn(() => (
    <div data-testid="member-dashboard-content" />
  )),
}));

jest.mock('@/app/member/orders/OrdersClient', () => ({
  __esModule: true,
  OrdersClient: jest.fn(() => <div data-testid="member-orders-content" />),
  default: jest.fn(() => <div data-testid="member-orders-content" />),
}));

jest.mock('@/app/member/quotations/QuotationsClient', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="member-quotations-content" />),
}));

const mockGetAdminAuth = jest.mocked(getAdminAuth);
const mockRequireAuth = jest.mocked(requireAuth);
const mockCreateServiceClient = jest.mocked(createServiceClient);
const mockFetchOrderStats = jest.mocked(fetchOrderStats);
const mockFetchQuotationStats = jest.mocked(fetchQuotationStats);
const mockGetInitialAdminQuotations = jest.mocked(getInitialAdminQuotations);
const mockGetUnifiedDashboardStats = jest.mocked(getUnifiedDashboardStats);
const mockFetchQuotationsServerSide = jest.mocked(fetchQuotationsServerSide);
const mockGetRequestRBACContext = jest.mocked(getRequestRBACContext);

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((givenResolve, givenReject) => {
    resolve = givenResolve;
    reject = givenReject;
  });
  return { promise, resolve, reject };
}

function authenticatedUser() {
  return {
    id: 'user-a',
    email: 'a@example.com',
    user_metadata: { kanji_last_name: '山田' },
  } as Awaited<ReturnType<typeof requireAuth>>;
}

function adminAuthContext() {
  return {
    userId: 'admin-a',
    role: 'admin',
    userName: '管理者',
    permissions: [],
    isDevMode: false,
  } as Awaited<ReturnType<typeof getAdminAuth>>;
}

type DatabaseQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  range: jest.Mock;
};

function mockOrderDatabase(result: { data: unknown[]; count?: number }) {
  const query: any = Promise.resolve({
    data: result.data,
    count: result.count ?? 0,
  });
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.order = jest.fn(() => query);
  query.range = jest.fn(() => query);
  mockCreateServiceClient.mockReturnValue({
    from: jest.fn(() => query),
  } as unknown as ReturnType<typeof createServiceClient>);
  return query as DatabaseQuery;
}

function ServerChild({ promise }: { promise: Promise<ReactElement> }) {
  return use(promise);
}

async function renderProtectedPage(page: ReactElement) {
  expect(page.type).toBe(Suspense);
  expect(page.props.children).toBeDefined();

  const child = page.props.children as ReactElement;
  // RSC unwraps an async server child before client Suspense observes its
  // value. Reproduce that boundary so the route's real fallback is exercised
  // through suspension rather than rendered manually.
  let mounted!: ReturnType<typeof render>;
  await act(async () => {
    mounted = render(
      <Suspense fallback={page.props.fallback}>
        <ServerChild promise={Promise.resolve(child.type(child.props))} />
      </Suspense>,
    );
  });
  return mounted;
}

describe('protected measured route shells', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderDatabase({ data: [] });
    mockGetRequestRBACContext.mockResolvedValue({
      userId: 'user-a',
      role: 'member',
      status: 'ACTIVE',
      permissions: [],
      isDevMode: false,
    } as Awaited<ReturnType<typeof getRequestRBACContext>>);
    mockFetchOrderStats.mockResolvedValue({} as never);
    mockFetchQuotationStats.mockResolvedValue({} as never);
    mockGetUnifiedDashboardStats.mockResolvedValue({} as never);
    mockGetInitialAdminQuotations.mockResolvedValue({
      quotations: [],
      pagination: { total: 0 },
    } as never);
    mockFetchQuotationsServerSide.mockResolvedValue({
      quotations: [],
      pagination: { total: 0 },
    } as never);
  });

  it('suspends the admin dashboard shell while its child waits for authorization', async () => {
    const auth = deferred<ReturnType<typeof adminAuthContext>>();
    mockGetAdminAuth.mockReturnValue(auth.promise as never);

    await renderProtectedPage(
      AdminDashboardPage({ searchParams: Promise.resolve({}) }),
    );
    expect(screen.getByText('読み込み中です。')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard-content')).not.toBeInTheDocument();
    expect(mockGetAdminAuth).toHaveBeenCalledTimes(1);
    expect(mockFetchOrderStats).not.toHaveBeenCalled();
    expect(mockFetchQuotationStats).not.toHaveBeenCalled();

    await act(async () => {
      auth.resolve(adminAuthContext());
    });
    await screen.findByTestId('admin-dashboard-content');
    expect(mockGetAdminAuth).toHaveBeenCalledWith(
      ['order:read', 'quotation:read'],
      '/auth/signin?redirect=/admin/dashboard',
    );
  });

  it('suspends admin orders until authorization, then loads filtered admin data', async () => {
    const auth = deferred<ReturnType<typeof adminAuthContext>>();
    const order = { id: 'order-a' };
    const query = mockOrderDatabase({ data: [order], count: 1 });
    mockGetAdminAuth.mockReturnValue(auth.promise as never);

    await renderProtectedPage(
      AdminOrdersPage({
        searchParams: Promise.resolve({ status: 'PENDING', quotation: 'q-1' }),
      }),
    );
    expect(screen.getByTestId('admin-orders-list-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-orders-content')).not.toBeInTheDocument();
    expect(mockCreateServiceClient).not.toHaveBeenCalled();

    await act(async () => {
      auth.resolve(adminAuthContext());
    });
    await screen.findByTestId('admin-orders-content');
    expect(query.select).toHaveBeenCalledWith(
      'id, order_number, customer_name, customer_email, status, total_amount, created_at',
      { count: 'exact' },
    );
    expect(query.eq).toHaveBeenCalledWith('status', 'PENDING');
    expect(query.eq).toHaveBeenCalledWith('quotation_id', 'q-1');
    expect(AdminOrdersClient.mock.lastCall![0]).toMatchObject({
      initialOrders: [order],
      initialTotal: 1,
    });
  });

  it('suspends admin quotations until authorization, then renders its child', async () => {
    const auth = deferred<ReturnType<typeof adminAuthContext>>();
    mockGetAdminAuth.mockReturnValue(auth.promise as never);

    await renderProtectedPage(
      AdminQuotationsPage({
        searchParams: Promise.resolve({ status: 'SENT' }),
      }),
    );
    expect(screen.getByTestId('admin-quotations-list-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-quotations-content')).not.toBeInTheDocument();
    expect(mockGetInitialAdminQuotations).not.toHaveBeenCalled();

    await act(async () => {
      auth.resolve(adminAuthContext());
    });
    await screen.findByTestId('admin-quotations-content');
    expect(mockGetInitialAdminQuotations).toHaveBeenCalledWith({ status: 'SENT' });
  });

  it('suspends member dashboard until authentication, then starts scoped stats', async () => {
    const auth = deferred<ReturnType<typeof authenticatedUser>>();
    mockRequireAuth.mockReturnValue(auth.promise as never);

    await renderProtectedPage(MemberDashboardPage());
    expect(screen.getByText('読み込み中です。')).toBeInTheDocument();
    expect(screen.queryByTestId('member-dashboard-content')).not.toBeInTheDocument();
    expect(mockGetUnifiedDashboardStats).not.toHaveBeenCalled();

    await act(async () => {
      auth.resolve(authenticatedUser());
    });
    await screen.findByTestId('member-dashboard-content');
    expect(mockGetUnifiedDashboardStats).toHaveBeenCalledWith('user-a', 'MEMBER', 30);
  });

  it('suspends member orders, then passes the verified identity to a scoped query', async () => {
    const auth = deferred<ReturnType<typeof authenticatedUser>>();
    const order = { id: 'order-a', status: 'PRODUCTION', order_items: [] };
    const query = mockOrderDatabase({ data: [order] });
    mockRequireAuth.mockReturnValue(auth.promise as never);

    await renderProtectedPage(MemberOrdersPage());
    expect(screen.getByTestId('member-orders-list-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('member-orders-content')).not.toBeInTheDocument();
    expect(mockGetRequestRBACContext).not.toHaveBeenCalled();
    expect(mockCreateServiceClient).not.toHaveBeenCalled();

    await act(async () => {
      auth.resolve(authenticatedUser());
    });
    await screen.findByTestId('member-orders-content');
    expect(mockGetRequestRBACContext).toHaveBeenCalledTimes(1);
    expect(query.eq).toHaveBeenCalledWith('user_id', 'user-a');
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(query.range).toHaveBeenCalledWith(0, 19);
    expect(OrdersClient.mock.lastCall![0]).toMatchObject({
      userId: 'user-a',
      userEmail: 'a@example.com',
      userProfile: { kanji_last_name: '山田' },
    });
    await expect(
      OrdersClient.mock.lastCall![0].initialOrdersPromise,
    ).resolves.toMatchObject([{ id: 'order-a' }]);
  });

  it('suspends member quotations and normalizes non-positive pagination to page one', async () => {
    const auth = deferred<ReturnType<typeof authenticatedUser>>();
    mockRequireAuth.mockReturnValue(auth.promise as never);

    await renderProtectedPage(
      MemberQuotationsPage({
        searchParams: Promise.resolve({ status: 'SENT', page: '-2' }),
      }),
    );
    expect(screen.getByTestId('member-quotations-list-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('member-quotations-content')).not.toBeInTheDocument();
    expect(mockFetchQuotationsServerSide).not.toHaveBeenCalled();

    await act(async () => {
      auth.resolve(authenticatedUser());
    });
    await screen.findByTestId('member-quotations-content');
    expect(mockFetchQuotationsServerSide).toHaveBeenCalledWith(
      'user-a',
      'SENT',
      5,
      0,
    );
    expect(QuotationsClient.mock.lastCall![0]).toMatchObject({
      currentPage: 1,
    });
  });

  it('preserves every admin redirect target when server authorization rejects', async () => {
    const redirectError = new Error('admin redirect');
    const redirect = jest.mocked(jest.requireMock('next/navigation').redirect);
    redirect.mockImplementation(() => {
      throw redirectError;
    });
    mockGetAdminAuth.mockImplementation(async (_permissions, redirectPath) => {
      redirect(redirectPath);
      throw redirectError;
    });

    const dashboardPage = AdminDashboardPage({
      searchParams: Promise.resolve({}),
    });
    await expect(
      dashboardPage.props.children.type(dashboardPage.props.children.props),
    ).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenLastCalledWith(
      '/auth/signin?redirect=/admin/dashboard',
    );

    const ordersPage = AdminOrdersPage({ searchParams: Promise.resolve({}) });
    await expect(
      ordersPage.props.children.type(ordersPage.props.children.props),
    ).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenLastCalledWith('/auth/signin?redirect=/admin/orders');

    const quotationsPage = AdminQuotationsPage({
      searchParams: Promise.resolve({}),
    });
    await expect(
      quotationsPage.props.children.type(quotationsPage.props.children.props),
    ).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenLastCalledWith(
      '/auth/signin?redirect=/admin/quotations',
    );
  });

  it('preserves every member redirect target when server authentication rejects', async () => {
    const authError = new AuthRequiredError('auth required');
    const redirectError = new Error('member redirect');
    const redirect = jest.mocked(jest.requireMock('next/navigation').redirect);
    redirect.mockImplementation(() => {
      throw redirectError;
    });
    mockRequireAuth.mockRejectedValue(authError);

    const dashboardPage = MemberDashboardPage();
    await expect(
      dashboardPage.props.children.type(dashboardPage.props.children.props),
    ).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenLastCalledWith(
      '/auth/signin?redirect=/member/dashboard',
    );

    const ordersPage = MemberOrdersPage();
    await expect(
      ordersPage.props.children.type(ordersPage.props.children.props),
    ).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenLastCalledWith(
      '/auth/signin?redirect=/member/orders',
    );

    const quotationsPage = MemberQuotationsPage({
      searchParams: Promise.resolve({}),
    });
    await expect(
      quotationsPage.props.children.type(quotationsPage.props.children.props),
    ).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenLastCalledWith(
      '/auth/signin?redirect=/member/quotations',
    );
  });
});

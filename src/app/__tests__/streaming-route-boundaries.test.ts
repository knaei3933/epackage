import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const dashboardPage = read('src/app/member/dashboard/page.tsx');
const dashboardClient = read('src/app/member/dashboard/UnifiedDashboardClient.tsx');
const quotationsPage = read('src/app/member/quotations/page.tsx');
const quotationsClient = read('src/app/member/quotations/QuotationsClient.tsx');
const ordersPage = read('src/app/member/orders/page.tsx');
const ordersClient = read('src/app/member/orders/OrdersClient.tsx');
const adminPage = read('src/app/admin/dashboard/page.tsx');
const adminClient = read('src/app/admin/dashboard/AdminDashboardClient.tsx');

describe('bounded authenticated streaming boundaries', () => {
  it('starts member dashboard data only after auth and keeps its header/selector outside Suspense', () => {
    expect(dashboardPage.indexOf('await requireAuth()')).toBeGreaterThan(-1);
    expect(dashboardPage.indexOf('await getUnifiedDashboardStats')).toBe(-1);
    expect(dashboardPage).toContain('initialStatsPromise={initialStatsPromise}');

    const shell = dashboardClient.indexOf('export function UnifiedDashboardClient');
    expect(dashboardClient.slice(shell)).toContain('initialStatsPromise');
    expect(dashboardClient.slice(shell)).toContain('<h1');
    expect(dashboardClient.slice(shell)).toContain('member-dashboard-period');
    expect(dashboardClient.slice(shell).indexOf('<Suspense')).toBeGreaterThan(
      dashboardClient.slice(shell).indexOf('member-dashboard-period'),
    );
    expect(dashboardClient).toContain('revalidateOnMount: period !== initialPeriod');
  });

  it('keeps the quotation h1/filter shell outside the server-data boundary', () => {
    expect(quotationsPage.indexOf('await requireAuth()')).toBeGreaterThan(-1);
    expect(quotationsPage).toContain('const initialDataPromise = fetchQuotationsServerSide');

    const shell = quotationsClient.indexOf('export default function QuotationsClient');
    const source = quotationsClient.slice(shell);
    expect(source).toContain('見積一覧</h1>');
    expect(source).toContain('<QuotationFilters');
    expect(source).toContain('initialDataPromise={initialDataPromise}');
    expect(source.lastIndexOf('<Suspense')).toBeGreaterThan(source.indexOf('見積一覧</h1>'));
  });

  it('streams the orders URL-derived header while the list selector stays in Suspense', () => {
    const authIndex = ordersPage.indexOf('await requireAuth()');
    const rbacIndex = ordersPage.indexOf('await getRequestRBACContext()');
    const fetchIndex = ordersPage.indexOf('const initialOrdersPromise = getInitialOrders');
    expect(authIndex).toBeGreaterThan(-1);
    expect(rbacIndex).toBeGreaterThan(authIndex);
    expect(fetchIndex).toBeGreaterThan(rbacIndex);

    const shell = ordersClient.indexOf('export function OrdersClient');
    const source = ordersClient.slice(shell);
    expect(source).toContain('<Suspense fallback={<OrdersHeader />}>');
    expect(source.indexOf('<Suspense fallback={<OrdersListSkeleton />}>')).toBeGreaterThan(
      source.indexOf('<Suspense fallback={<OrdersHeader />}>'),
    );
    expect(read('src/app/member/orders/parts/OrderListSection.tsx'))
      .toContain('data-testid="member-orders-list"');
  });

  it('streams the admin h1/KPI heading and dynamically loads Recharts after auth', () => {
    const authIndex = adminPage.indexOf('await getAdminAuth');
    const childIndex = adminPage.indexOf('<DashboardContent authContext={authContext}');
    expect(authIndex).toBeGreaterThan(-1);
    expect(childIndex).toBeGreaterThan(authIndex);
    expect(adminPage).toContain('const initialStatsPromise = buildInitialStatsPromise(period);');

    const shell = adminClient.indexOf('export default function AdminDashboardClient');
    const source = adminClient.slice(shell);
    expect(source).toContain('管理ダッシュボード');
    expect(source).toContain('ステータス別 KPI');
    expect(source.indexOf('ステータス別 KPI')).toBeLessThan(source.indexOf('<Suspense'));
    expect(source).toContain('initialStatsPromise={initialStatsPromise}');
    expect(adminClient).toMatch(/ssr:\s*false/);
    expect(adminClient).toContain("import('@/components/admin/dashboard-widgets/OrderStatisticsWidget')");
  });

  it('prevents duplicate initial SWR requests on dashboard routes', () => {
    for (const source of [dashboardClient, adminClient]) {
      expect(source).toMatch(/fallbackData: (initialResult|initialStats)\.status === 'success' \? \1\.stats : undefined/);
      expect(source).toContain('revalidateIfStale: period !== initialPeriod');
      expect(source).toContain('revalidateOnMount: period !== initialPeriod');
    }
    expect(quotationsPage).not.toContain('fetchQuotationsServerSide(user.id, status, ITEMS_PER_PAGE, offset); await');
    expect(ordersClient).toContain('initialOrdersPromise');
    expect(ordersClient).not.toContain('initialOrders={initialOrders}');
  });
});

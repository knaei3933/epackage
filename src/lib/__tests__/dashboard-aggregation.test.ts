import { jest } from '@jest/globals';
import type { UnifiedDashboardStats } from '../dashboard';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

type Row = Record<string, unknown>;
type Filter = { type: 'eq' | 'in' | 'gte'; column: string; value: unknown };
type QuerySpec = {
  table: string;
  selected: string;
  options: { count?: 'exact'; head?: boolean } | undefined;
  filters: Filter[];
  limit: number | null;
};

const daysAgo = (days: number, hours = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const isoHoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

// Production aggregates Date getters in the server's local timezone; derive expected
// month keys through the same boundary-safe representation instead of slicing UTC ISO text.
const localMonthKey = (value: string): string => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const quoteOneCreatedAt = daysAgo(4);
const quoteOldCreatedAt = daysAgo(70);
const announcementPublishedAt = daysAgo(1);
const orderPendingCreatedAt = daysAgo(7);
const sampleTwoCreatedAt = daysAgo(3);
const sampleOneCreatedAt = daysAgo(2);
const notificationCreatedAt = daysAgo(1);
const contractOneCreatedAt = daysAgo(1);
const memberSampleProjection = 'id, user_id, status, request_number, created_at, sample_items(id, sample_request_id, product_id, product_name, category, quantity)';

const draftQuotationItem = {
  id: 'quote-item-1',
  quotation_id: 'quote-draft',
  product_id: 'product-1',
  product_name: 'Sample Pouch',
  category: 'pouch',
  quantity: 2,
  unit_price: 400,
  total_price: 800,
  specifications: { size: '100x150' },
  notes: null,
  display_order: 1,
  created_at: daysAgo(4),
};

const oldQuotationItem = {
  ...draftQuotationItem,
  id: 'quote-item-old',
  quotation_id: 'quote-old-sent',
  product_name: 'Legacy Pouch',
  total_price: 900,
};

const sampleOneItem = {
  id: 'sample-item-1',
  sample_request_id: 'sample-1',
  product_id: 'product-1',
  product_name: 'Sample Pouch',
  category: 'pouch',
  quantity: 10,
};

const sampleTwoItem = {
  ...sampleOneItem,
  id: 'sample-item-2',
  sample_request_id: 'sample-2',
};

const dbRows: Record<string, Row[]> = {
  orders: [
    { id: 'order-old-pending', user_id: 'member-1', status: 'QUOTATION_PENDING', total_amount: 100, created_at: daysAgo(5), updated_at: daysAgo(4), shipped_at: null },
    { id: 'order-pending', user_id: 'member-1', status: 'PENDING', order_number: 'O-1', total_amount: 300, created_at: orderPendingCreatedAt, updated_at: daysAgo(7), shipped_at: null },
    { id: 'order-active', user_id: 'member-1', status: 'ACTIVE', total_amount: 200, created_at: daysAgo(6), updated_at: daysAgo(1), shipped_at: null },
    { id: 'order-shipped-recent', user_id: 'member-2', status: 'SHIPPED', total_amount: 400, created_at: daysAgo(10), updated_at: daysAgo(3), shipped_at: isoHoursAgo(1) },
    { id: 'order-shipped-old', user_id: 'member-2', status: 'SHIPPED', total_amount: 800, created_at: daysAgo(300), updated_at: daysAgo(280), shipped_at: daysAgo(280) },
  ],
  profiles: [
    { id: 'member-1', status: 'ACTIVE' },
    { id: 'member-2', status: 'ACTIVE' },
    { id: 'inactive', status: 'SUSPENDED' },
  ],
  quotations: [
    { id: 'quote-draft', user_id: 'member-1', status: 'DRAFT', quotation_number: 'Q-1', customer_name: 'One', customer_email: 'one@example.test', total_amount: 1000, created_at: quoteOneCreatedAt, quotation_items: [draftQuotationItem] },
    { id: 'quote-approved', user_id: 'member-1', status: 'APPROVED', quotation_number: 'Q-2', customer_name: 'One', customer_email: 'one@example.test', total_amount: 1200, created_at: daysAgo(8) },
    { id: 'quote-old-sent', user_id: 'member-1', status: 'SENT', quotation_number: 'Q-old', customer_name: 'One', customer_email: 'one@example.test', total_amount: 900, created_at: quoteOldCreatedAt, quotation_items: [oldQuotationItem] },
  ],
  sample_requests: [
    { id: 'sample-1', user_id: 'member-1', status: 'received', request_number: 'S-1', created_at: sampleOneCreatedAt, sample_items: [sampleOneItem] },
    { id: 'sample-2', user_id: 'member-1', status: 'processing', request_number: 'S-2', created_at: sampleTwoCreatedAt, sample_items: [sampleTwoItem] },
    { id: 'sample-old-shipped', user_id: 'member-1', status: 'shipped', request_number: 'S-old', created_at: daysAgo(80) },
  ],
  inquiries: [
    { id: 'inquiry-1', user_id: 'member-1', status: 'responded', created_at: daysAgo(2) },
    { id: 'inquiry-2', user_id: 'member-1', status: 'open', created_at: daysAgo(3) },
  ],
  admin_notifications: [
    { id: 'notification-1', user_id: 'member-1', title: 'Update', message: 'Check', is_read: false, created_at: notificationCreatedAt },
    { id: 'notification-other', user_id: 'member-2', title: 'Other', message: 'No', is_read: false, created_at: daysAgo(1) },
  ],
  contracts: [
    { id: 'contract-1', user_id: 'member-1', contract_number: 'C-1', status: 'DRAFT', total_amount: 500, created_at: contractOneCreatedAt },
    { id: 'contract-2', user_id: 'member-1', contract_number: 'C-2', status: 'ACTIVE', total_amount: 700, created_at: daysAgo(10) },
  ],
  announcements: [
    { id: 'announcement-1', title: 'News', content: 'Body', category: 'notice', priority: 'medium', is_published: true, published_at: announcementPublishedAt, created_at: announcementPublishedAt },
  ],
};

let queries: QuerySpec[];
let rejectSelectors: string[];
let fulfilledErrorSelectors: string[];
const cacheCalls: Array<{ keys: string[]; options: unknown }> = [];

const matches = (row: Row, filters: Filter[]) =>
  filters.every(({ type, column, value }) => {
    const actual = row[column];
    if (type === 'eq') return actual === value;
    if (type === 'in') return Array.isArray(value) && value.includes(actual as never);
    return type !== 'gte' || new Date(String(actual)).getTime() >= new Date(String(value)).getTime();
  });

const makeQuery = (spec: QuerySpec) => {
  // Project like PostgREST so tests verify exact output contracts, not incidental
  // fields left behind by fixture objects. Parentheses keep embedded collections
  // (for example quotation_items(...)) as one top-level projection.
  const projectRow = (row: Row): Row => {
    const keys: string[] = [];
    let depth = 0;
    let key = '';
    for (const character of spec.selected) {
      if (character === '(') depth += 1;
      if (character === ')') depth -= 1;
      if (character === ',' && depth === 0) {
        keys.push(key.trim());
        key = '';
      } else {
        key += character;
      }
    }
    if (key.trim()) keys.push(key.trim());
    return Object.fromEntries(keys.map((rawField) => {
      const embeddedField = rawField.match(/^([A-Za-z0-9_]+)\s*\(/);
      const field = embeddedField ? embeddedField[1] : rawField;
      return [field, row[field]];
    }));
  };
  const query = {
    select(selected: string, options?: { count?: 'exact'; head?: boolean }) {
      spec.selected = selected;
      spec.options = options;
      return query;
    },
    eq(column: string, value: unknown) {
      spec.filters.push({ type: 'eq', column, value });
      return query;
    },
    in(column: string, value: unknown[]) {
      spec.filters.push({ type: 'in', column, value });
      return query;
    },
    gte(column: string, value: string) {
      spec.filters.push({ type: 'gte', column, value });
      return query;
    },
    order() { return query; },
    limit(value: number) {
      spec.limit = value;
      return query;
    },
    then(resolve: (value: unknown) => void, reject: (reason?: unknown) => void) {
      if (rejectSelectors.includes(spec.selected)) {
        reject(new Error(`database unavailable: ${spec.table}`));
        return;
      }
      if (fulfilledErrorSelectors.includes(spec.selected)) {
        resolve({ data: null, count: null, error: { message: `database error: ${spec.table}` } });
        return;
      }
      const rows = (dbRows[spec.table] ?? []).filter((row) => matches(row, spec.filters));
      const count = spec.options?.count === 'exact' ? rows.length : null;
      const data = spec.options?.head ? null : rows.slice(0, spec.limit ?? rows.length).map(projectRow);
      resolve({ data, count, error: null });
    },
  };
  return query;
};

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn: () => Promise<unknown>, keys: string[], options: unknown) => {
    cacheCalls.push({ keys, options });
    return fn;
  }),
}));

jest.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from(table: string) {
      const spec: QuerySpec = { table, selected: '', options: undefined, filters: [], limit: null };
      queries.push(spec);
      return makeQuery(spec);
    },
  }),
}));

const loadDashboard = async () => {
  jest.resetModules();
  queries = [];
  rejectSelectors = [];
  fulfilledErrorSelectors = [];
  cacheCalls.length = 0;
  return import('../dashboard');
};

describe('G004 dashboard aggregation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('admin output preserves every returned field with one period row query for revenue and status', async () => {
    const dashboard = await loadDashboard();
    const result = await dashboard.getUnifiedDashboardStats('admin-1', 'ADMIN', 30);

    expect(result).toMatchObject({
      totalOrders: 5,
      pendingOrders: 1,
      totalRevenue: 1000,
      activeUsers: 2,
      activeCustomers: 2,
      pendingQuotations: 1,
      quotations: { total: 2, approved: 1, conversionRate: 50 },
      todayShipments: 1,
      shipments: { today: 1, inTransit: 2 },
      samples: { total: 2, processing: 2 },
      production: { avgDays: 7, completed: 1 },
      period: 30,
    });
    expect(result.ordersByStatus).toEqual([
      { status: 'QUOTATION_PENDING', count: 1 },
      { status: 'PENDING', count: 1 },
      { status: 'ACTIVE', count: 1 },
      { status: 'SHIPPED', count: 1 },
    ]);
    expect(result.recentQuotations).toHaveLength(2);
    expect(result.recentQuotations?.[0]).toEqual({
      quotation_number: 'Q-1',
      customer_name: 'One',
      customer_email: 'one@example.test',
      status: 'DRAFT',
      total_amount: 1000,
      created_at: quoteOneCreatedAt,
    });
    expect(result.recentQuotations?.[0]).not.toHaveProperty('id');
    expect(result.monthlyRevenue).toEqual([
      { month: localMonthKey(daysAgo(300)), revenue: 800 },
      { month: localMonthKey(daysAgo(10)), revenue: 400 },
    ]);

    const adminQueries = queries;
    expect(adminQueries).toHaveLength(14);
    expect(adminQueries.filter((query) => query.table === 'orders' && !query.options?.head)).toHaveLength(3);
    expect(adminQueries.filter((query) => query.selected.includes('*'))).toHaveLength(0);
    expect(adminQueries.some((query) => query.selected === 'status, total_amount' && query.filters.some(({ type, column }) => type === 'gte' && column === 'created_at'))).toBe(true);
    expect(cacheCalls[0]).toEqual({
      keys: ['dashboard_ADMIN_admin-1_30'],
      options: { revalidate: 30, tags: ['admin-dashboard'] },
    });
  });

  it('member output preserves displayed fields, uses retained-query count, and remains user scoped', async () => {
    const dashboard = await loadDashboard();
    const result: UnifiedDashboardStats = await dashboard.getUnifiedDashboardStats('member-1', 'MEMBER', 30);

    expect(result).toMatchObject({
      totalOrders: 3,
      pendingOrders: 1,
      pendingQuotations: 1,
      samples: { total: 2, processing: 2 },
      inquiries: { total: 2, responded: 1 },
      quotations: { total: 2, approved: 1, conversionRate: 50 },
      contracts: { total: 2, signed: 1, pending: 1 },
      period: 30,
    });
    expect(result.recentOrders).toEqual([
      {
        id: 'order-pending',
        user_id: 'member-1',
        status: 'PENDING',
        order_number: 'O-1',
        total_amount: 300,
        created_at: orderPendingCreatedAt,
        orderNumber: 'O-1',
        totalAmount: 300,
        createdAt: orderPendingCreatedAt,
      },
    ]);
    expect(result.recentQuotations).toEqual([
      {
        id: 'quote-draft',
        user_id: 'member-1',
        status: 'DRAFT',
        quotation_number: 'Q-1',
        total_amount: 1000,
        created_at: quoteOneCreatedAt,
        quotation_items: [draftQuotationItem],
        createdAt: quoteOneCreatedAt,
        quotationNumber: 'Q-1',
        totalAmount: 1000,
        items: [draftQuotationItem],
      },
      {
        id: 'quote-old-sent',
        user_id: 'member-1',
        status: 'SENT',
        quotation_number: 'Q-old',
        total_amount: 900,
        created_at: quoteOldCreatedAt,
        quotation_items: [oldQuotationItem],
        createdAt: quoteOldCreatedAt,
        quotationNumber: 'Q-old',
        totalAmount: 900,
        items: [oldQuotationItem],
      },
    ]);
    expect(result.recentSamples).toEqual([
      {
        id: 'sample-1',
        user_id: 'member-1',
        status: 'received',
        request_number: 'S-1',
        created_at: sampleOneCreatedAt,
        sample_items: [sampleOneItem],
        createdAt: sampleOneCreatedAt,
        requestNumber: 'S-1',
        samples: [{
          id: 'sample-item-1',
          sampleRequestId: 'sample-1',
          productId: 'product-1',
          productName: 'Sample Pouch',
          category: 'pouch',
          quantity: 10,
        }],
      },
      {
        id: 'sample-2',
        user_id: 'member-1',
        status: 'processing',
        request_number: 'S-2',
        created_at: sampleTwoCreatedAt,
        sample_items: [sampleTwoItem],
        createdAt: sampleTwoCreatedAt,
        requestNumber: 'S-2',
        samples: [{
          id: 'sample-item-2',
          sampleRequestId: 'sample-2',
          productId: 'product-1',
          productName: 'Sample Pouch',
          category: 'pouch',
          quantity: 10,
        }],
      },
    ]);
    expect(result.notifications).toEqual([
      {
        id: 'notification-1',
        title: 'Update',
        message: 'Check',
        created_at: notificationCreatedAt,
      },
    ]);
    expect(result.recentContracts).toEqual([
      {
        id: 'contract-1',
        contract_number: 'C-1',
        status: 'DRAFT',
        total_amount: 500,
        created_at: contractOneCreatedAt,
      },
    ]);
    expect(result.announcements).toEqual([
      {
        id: 'announcement-1',
        title: 'News',
        content: 'Body',
        category: 'notice',
        priority: 'medium',
        isPublished: true,
        publishedAt: announcementPublishedAt,
        createdAt: announcementPublishedAt,
      },
    ]);
    expect(result.nextActions?.map(({ type }) => type)).toEqual(['quotation', 'quotation', 'order', 'contract', 'notification', 'sample', 'sample']);
    expect(result.pinnedNextAction).toMatchObject({ type: 'quotation', title: '見積もりの確認: Q-old' });
    expect(result.nextActions).toMatchObject([
      {
        id: 'quotation-quote-old-sent',
        title: '見積もりの確認: Q-old',
        description: '900円',
        href: '/member/quotations',
        statusLabel: 'SENT',
      },
      {
        id: 'quotation-quote-draft',
        title: '見積もりの確認: Q-1',
        description: '1,000円',
        href: '/member/quotations',
        statusLabel: 'DRAFT',
      },
      {
        id: 'order-order-pending',
        title: '注文の確認: O-1',
        description: '300円',
        href: '/member/orders',
        statusLabel: 'PENDING',
      },
      {
        id: 'contract-contract-1',
        title: '契約の確認: C-1',
        description: '500円',
        href: '/member/contracts',
        statusLabel: 'DRAFT',
      },
      {
        id: 'notification-notification-1',
        title: 'Update',
        description: 'Check',
        href: '/member/notifications',
      },
      {
        id: 'sample-sample-2',
        title: 'サンプル依頼の確認: S-2',
        href: '/member/samples',
        statusLabel: 'processing',
      },
      {
        id: 'sample-sample-1',
        title: 'サンプル依頼の確認: S-1',
        href: '/member/samples',
        statusLabel: 'received',
      },
    ]);

    const memberQueries = queries.filter((query) => query.table !== 'announcements');
    expect(memberQueries).toHaveLength(15);
    expect(memberQueries.filter(({ table }) => table === 'orders')).toHaveLength(3);
    expect(memberQueries.filter(({ table }) => table === 'quotations')).toHaveLength(4);
    expect(memberQueries.filter(({ table }) => table === 'sample_requests')).toHaveLength(2);
    expect(memberQueries.filter(({ table }) => table === 'inquiries')).toHaveLength(2);
    expect(memberQueries.filter(({ table }) => table === 'admin_notifications')).toHaveLength(1);
    expect(memberQueries.filter(({ table }) => table === 'contracts')).toHaveLength(3);
    const sampleQuery = memberQueries.find((query) => query.table === 'sample_requests' && query.options?.count === 'exact' && query.limit === 5);
    expect(sampleQuery).toMatchObject({ selected: memberSampleProjection, limit: 5 });
    expect(memberQueries.filter((query) => query.selected.includes('*'))).toHaveLength(0);
    expect(memberQueries.every((query) => query.filters.some(({ type, column, value }) => type === 'eq' && column === 'user_id' && value === 'member-1'))).toBe(true);
    expect(cacheCalls[0]).toEqual({
      keys: ['dashboard_MEMBER_member-1_30'],
      options: { revalidate: 30, tags: ['admin-dashboard'] },
    });
  });

  it('optional source failures degrade independently without losing other member outputs', async () => {
    const dashboard = await loadDashboard();
    rejectSelectors = ['id, user_id, status, order_number, total_amount, created_at'];

    const result = await dashboard.getUnifiedDashboardStats('member-1', 'MEMBER', 30);

    expect(result.totalOrders).toBe(3);
    expect(result.pendingOrders).toBe(1);
    expect(result.recentOrders).toEqual([]);
    expect(result.nextActions?.map(({ type }) => type)).not.toContain('order');
    expect(result.samples).toEqual({ total: 2, processing: 2 });
    expect(queries).toHaveLength(16);
  });

  it('retains exactly five member sample rows while the retained query counts all six matches', async () => {
    const dashboard = await loadDashboard();
    const originalSamples = dbRows.sample_requests;
    const additionalSamples = Array.from({ length: 4 }, (_, index) => ({
      id: `sample-extra-${index + 1}`,
      user_id: 'member-1',
      status: 'processing',
      request_number: `S-extra-${index + 1}`,
      created_at: daysAgo(1, index + 1),
      sample_items: [{ ...sampleOneItem, id: `sample-extra-item-${index + 1}`, sample_request_id: `sample-extra-${index + 1}` }],
    }));
    dbRows.sample_requests = [...originalSamples, ...additionalSamples];

    try {
      const result: UnifiedDashboardStats = await dashboard.getUnifiedDashboardStats('member-1', 'MEMBER', 30);

      expect(result.samples).toEqual({ total: 6, processing: 6 });
      expect(result.recentSamples).toHaveLength(5);
      expect(result.recentSamples?.every(({ samples }) => samples.length > 0)).toBe(true);
      const sampleQuery = queries.find((query) => query.selected === memberSampleProjection);
      expect(sampleQuery).toMatchObject({ options: { count: 'exact' }, limit: 5 });
    } finally {
      dbRows.sample_requests = originalSamples;
    }
  });

  it('an admin fulfilled query error falls back without losing unrelated admin outputs', async () => {
    const dashboard = await loadDashboard();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fulfilledErrorSelectors = ['created_at, total_amount'];

    try {
      const result = await dashboard.getUnifiedDashboardStats('admin-1', 'ADMIN', 30);

      expect(result.monthlyRevenue).toEqual([]);
      expect(result.totalOrders).toBe(5);
      expect(result.samples).toEqual({ total: 2, processing: 2 });
      expect(result.recentQuotations).toHaveLength(2);
      expect(errorSpy).toHaveBeenCalledWith(
        '[getUnifiedDashboardStats:ADMIN] monthlyRevenue query failed:',
        expect.objectContaining({ message: 'database error: orders' }),
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('a member fulfilled query error falls back without losing unrelated member outputs', async () => {
    const dashboard = await loadDashboard();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fulfilledErrorSelectors = [memberSampleProjection];

    try {
      const result: UnifiedDashboardStats = await dashboard.getUnifiedDashboardStats('member-1', 'MEMBER', 30);

      expect(result.samples).toEqual({ total: 2, processing: 0 });
      expect(result.recentSamples).toEqual([]);
      expect(result.recentQuotations).toHaveLength(2);
      expect(result.nextActions?.map(({ type }) => type)).not.toContain('sample');
      expect(errorSpy).toHaveBeenCalledWith(
        '[getUnifiedDashboardStats:MEMBER] recentSamples/processingCount query failed:',
        expect.objectContaining({ message: 'database error: sample_requests' }),
      );
      expect(queries).toHaveLength(16);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('unauthenticated callers keep the safe empty cache boundary', async () => {
    const dashboard = await loadDashboard();
    const result = await dashboard.getUnifiedDashboardStats(undefined, 'MEMBER', 30);

    expect(result.totalOrders).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(queries).toHaveLength(0);
    expect(cacheCalls).toHaveLength(0);
  });
});

'use client';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminOrdersClient from '@/app/admin/orders/AdminOrdersClient';
import AdminQuotationsClient from '@/app/admin/quotations/AdminQuotationsClient';
import { OrdersClient } from '@/app/member/orders/OrdersClient';
import { fetchQuotations } from '@/lib/api/admin/quotations';
import { fetchOrders } from '@/lib/api/member/orders';

const mockAdminFetch = jest.fn();
const mockFetchQuotations = jest.mocked(fetchQuotations);
const mockFetchOrders = jest.mocked(fetchOrders);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/lib/supabase-browser', () => ({ supabase: null }));
jest.mock('@/lib/auth-client', () => ({ adminFetch: (...args: unknown[]) => mockAdminFetch(...args) }));
jest.mock('@/lib/api/admin/quotations', () => ({
  fetchQuotations: jest.fn(),
}));
jest.mock('@/lib/api/member/orders', () => ({
  fetchOrders: jest.fn(),
}));

const adminOrder = {
  id: 'order-1',
  order_number: 'ORD-001',
  customer_name: 'Yamada Taro',
  customer_email: 'yamada@example.com',
  status: 'QUOTATION_PENDING',
  total_amount: 12345,
  created_at: '2026-01-01T00:00:00.000Z',
};

const adminQuotation = {
  id: 'quotation-1',
  quotation_number: 'Q-001',
  customer_name: 'Yamada Taro',
  customer_email: 'yamada@example.com',
  status: 'DRAFT',
  total_amount: 20000,
  subtotal_amount: 20000,
  total_price: 20000,
  unit_price: 20000,
  quantity: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  quotation_items: [],
  items: [],
} as any;

const memberOrder = {
  id: 'member-order-1',
  order_number: 'MEM-001',
  quotation_number: 'MQ-001',
  status: 'PRODUCTION',
  total_amount: 5000,
  created_at: '2026-01-01T00:00:00.000Z',
  progress_percentage: 70,
  items: [],
};

function listResponse(data: unknown[], total = data.length) {
  return {
    ok: true,
    json: async () => ({ data, total }),
  };
}

describe('bounded hydration fetch waterfalls', () => {
  it('renders server admin orders immediately, skips the initial API fetch, and refetches on filter/action changes', async () => {
    mockAdminFetch.mockReset();
    mockAdminFetch.mockImplementation(async (input: unknown) => {
      const url = String(input);
      if (url.includes('/status')) {
        return { ok: true, json: async () => ({}) };
      }
      return listResponse([{ ...adminOrder, order_number: 'ORD-RETURNED' }], 12);
    });

    render(
      <AdminOrdersClient
        initialStatus="all"
        initialOrders={[adminOrder]}
        initialTotal={12}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('注文管理');
    expect(screen.getAllByText('ORD-001')).toHaveLength(2);
    expect(screen.getByText(/全12件/)).toBeInTheDocument();
    expect(mockAdminFetch).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('ステータスで絞り込み'), {
      target: { value: 'PRODUCTION' },
    });
    await waitFor(() => {
      expect(String(mockAdminFetch.mock.calls[0][0])).toContain('status=PRODUCTION');
    });
    await screen.findAllByText('ORD-RETURNED');

    const row = screen.getAllByTestId('admin-order-row')[0];
    fireEvent.change(row.querySelector('select') as HTMLSelectElement, {
      target: { value: 'PRODUCTION' },
    });

    await waitFor(() => {
      const urls = mockAdminFetch.mock.calls.map(([input]) => String(input));
      expect(urls.some((url) => url.includes('/order-1/status'))).toBe(true);
      expect(urls.filter((url) => url.includes('/api/admin/orders?')).length).toBeGreaterThan(1);
    });
  });

  it('hydrates admin quotations from server data without an initial client data fetch and refetches filters', async () => {
    mockFetchQuotations.mockReset().mockResolvedValue({
      quotations: [{ ...adminQuotation, quotation_number: 'Q-RETURNED' }],
      pagination: { page: 1, limit: 10, total: 11, totalPages: 2 },
    } as any);

    render(
      <AdminQuotationsClient
        authContext={{ userId: 'admin-1', userName: 'Admin', role: 'admin', status: 'ACTIVE' } as any}
        initialStatus="all"
        initialQuotations={[adminQuotation]}
        initialTotal={11}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('見積もり管理');
    expect(screen.getByText('Q-001')).toBeInTheDocument();
    expect(screen.getByText('総見積数').parentElement).toHaveTextContent('11');
    expect(mockFetchQuotations).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('見積ステータスで絞り込み'), {
      target: { value: 'SENT' },
    });
    await waitFor(() => {
      expect(mockFetchQuotations).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10, status: 'SENT' }),
      );
    });
  });

  it('hydrates member orders from server data without a duplicate initial fetch and keeps client filters local', async () => {
    mockFetchOrders.mockReset();
    render(
      <OrdersClient
        userId="member-1"
        initialOrders={[memberOrder]}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('処理中の注文');
    expect(screen.getByText('MEM-001')).toBeInTheDocument();
    expect(mockFetchOrders).not.toHaveBeenCalled();

    const searchInput = screen.getByPlaceholderText('注文番号・見積番号で検索...');
    fireEvent.change(searchInput, { target: { value: 'does-not-match' } });
    expect(screen.getByText('0 件の注文')).toBeInTheDocument();
    expect(mockFetchOrders).not.toHaveBeenCalled();
  });

  it('wires the server loaders into the three route clients', () => {
    const repoRoot = resolve(__dirname, '../../..');
    const adminOrdersPage = readFileSync(resolve(repoRoot, 'src/app/admin/orders/page.tsx'), 'utf8');
    const adminQuotationsPage = readFileSync(resolve(repoRoot, 'src/app/admin/quotations/page.tsx'), 'utf8');
    const memberOrdersPage = readFileSync(resolve(repoRoot, 'src/app/member/orders/page.tsx'), 'utf8');

    expect(adminOrdersPage).toMatch(
      /\.select\(\s*['"]id, order_number, customer_name, customer_email, status, total_amount, created_at['"],\s*\{\s*count:\s*'exact'\s*,?\s*\}\s*,?\s*\)/,
    );
    expect(adminOrdersPage).toContain('initialTotal={count ?? 0}');
    expect(adminQuotationsPage).toContain('getInitialAdminQuotations');
    expect(adminQuotationsPage).toContain('initialQuotations={initialQuotationData.quotations}');
    expect(memberOrdersPage).toMatch(/rbacContext\?\.role === '(?:admin|operator|sales)'/);
    expect(memberOrdersPage).toMatch(/if\s*\(!canViewAllOrders\)\s*\{\s*query\s*=\s*query\.eq\('user_id',\s*user\.id\);/);
    expect(memberOrdersPage).toContain('initialOrders={initialOrders}');
  });
});

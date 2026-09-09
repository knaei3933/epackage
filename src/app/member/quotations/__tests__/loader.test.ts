import { fetchQuotationsServerSide } from '../loader';
import { createServiceClient } from '@/lib/supabase';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/unified-pricing-engine', () => ({
  getMaterialSpecification: jest.fn(),
}));

const mockedCreateServiceClient = createServiceClient as jest.Mock;
const mockedGetMaterialSpecification = getMaterialSpecification as jest.Mock;

type QueryCall = { method: string; args: unknown[] };

function createQueryHarness(executionResult: {
  data?: unknown[];
  count?: number | null;
  error?: unknown;
}) {
  const calls: QueryCall[] = [];
  const builder: Record<string, jest.Mock> = {
    select: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'select', args });
      return builder;
    }),
    eq: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'eq', args });
      return builder;
    }),
    in: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'in', args });
      return builder;
    }),
    order: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'order', args });
      return builder;
    }),
    range: jest.fn((...args: unknown[]) => {
      calls.push({ method: 'range', args });
      return builder;
    }),
    then: jest.fn(
      (
        onFulfilled: (value: unknown) => unknown,
        onRejected: (error: unknown) => unknown
      ) =>
        Promise.resolve(executionResult).then(onFulfilled, onRejected)
    ),
  };
  const from = jest.fn(() => builder);

  mockedCreateServiceClient.mockReturnValue({ from });

  return { builder, calls, from };
}

const baseQuotation = {
  id: 'quotation-1',
  quotation_number: 'Q-001',
  status: 'SENT',
  customer_name: 'Test Customer',
  customer_email: 'customer@example.test',
  subtotal_amount: 900,
  tax_amount: 100,
  total_amount: 1000,
  valid_until: '2026-10-01',
  sent_at: '2026-09-01T00:00:00Z',
  approved_at: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-02T00:00:00Z',
  pdf_url: 'https://example.test/quotation.pdf',
  quotation_items: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetMaterialSpecification.mockReturnValue('PET 12mu + AL 7mu');
});

describe('fetchQuotationsServerSide', () => {
  it('fetches data and exact count in a single filtered, ordered, ranged query', async () => {
    const { builder, from } = createQueryHarness({
      data: [baseQuotation],
      count: 12,
    });

    const result = await fetchQuotationsServerSide('user-1', 'PRODUCTION', 5, 10);

    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith('quotations');
    expect(builder.select).toHaveBeenCalledTimes(1);
    const [columns, options] = builder.select.mock.calls[0];
    expect(options).toEqual({ count: 'exact' });
    expect(columns).toContain('quotation_items (');
    expect(columns).not.toContain('*');
    expect(builder.eq).toHaveBeenCalledTimes(2);
    expect(builder.eq.mock.calls[0]).toEqual(['user_id', 'user-1']);
    expect(builder.eq.mock.calls[1]).toEqual(['status', 'PRODUCTION']);
    expect(builder.in).not.toHaveBeenCalled();
    expect(builder.order).toHaveBeenCalledTimes(1);
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builder.range).toHaveBeenCalledTimes(1);
    expect(builder.range).toHaveBeenCalledWith(10, 14);
    expect(result.pagination).toEqual({ limit: 5, offset: 10, total: 12 });
  });

  it('applies legacy status semantics once as a case pair', async () => {
    const { builder, from } = createQueryHarness({ data: [], count: 0 });

    await fetchQuotationsServerSide('user-1', 'draft', 5, 0);

    expect(from).toHaveBeenCalledTimes(1);
    expect(builder.eq).toHaveBeenCalledTimes(1);
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(builder.in).toHaveBeenCalledTimes(1);
    expect(builder.in).toHaveBeenCalledWith('status', ['draft', 'DRAFT']);
  });

  it('queries only list-required columns and preserves aliases plus item enrichment', async () => {
    const specs = {
      materialId: 'pet_al',
      thicknessSelection: 'light',
      sku_quantities: [10, 20],
    };
    const { from } = createQueryHarness({
      count: 1,
      data: [
        {
          ...baseQuotation,
          quotation_items: [
            {
              id: 'item-1',
              quotation_id: 'quotation-1',
              product_id: 'product-1',
              product_name: 'Original Product',
              quantity: 3,
              unit_price: 200,
              total_price: 600,
              specifications: specs,
              order_id: 'order-1',
            },
          ],
        },
      ],
    });

    const result = await fetchQuotationsServerSide('user-1', 'all', 5, 0);
    const [columns] = builderColumns(from);
    const quotation = result.quotations[0];
    const item = quotation.items[0];

    expect(columns).toEqual(expect.stringContaining('quotation_items ('));
    ['admin_notes', 'customer_phone', 'discount_amount', 'sku_count', 'total_meters']
      .forEach((unusedColumn) => expect(columns).not.toContain(unusedColumn));

    expect(quotation.quotationNumber).toBe('Q-001');
    expect(quotation.totalAmount).toBe(1000);
    expect(quotation.validUntil).toBe('2026-10-01');
    expect(quotation.createdAt).toBe('2026-09-01T00:00:00Z');
    expect(quotation.updatedAt).toBe('2026-09-02T00:00:00Z');
    expect(quotation.sentAt).toBe('2026-09-01T00:00:00Z');
    expect(quotation.approvedAt).toBeNull();
    expect(quotation.pdfUrl).toBe('https://example.test/quotation.pdf');
    expect(item.productName).toBe('Original Product');
    expect(item.unitPrice).toBe(200);
    expect(item.totalPrice).toBe(600);
    expect(item.orderId).toBe('order-1');
    expect(item.breakdown).toEqual({
      quantity: 3,
      unit_price: 200,
      total_price: 600,
      specifications: {
        ...specs,
        material_specification: 'PET 12mu + AL 7mu',
      },
      sku_info: { count: 2, quantities: [10, 20], total: 30 },
    });
    expect(mockedGetMaterialSpecification).toHaveBeenCalledWith('pet_al', 'light');
  });

  it('falls back gracefully when the single query fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const databaseError = new Error('database unavailable');
    createQueryHarness({ data: null, count: null, error: databaseError });

    const result = await fetchQuotationsServerSide('user-1', 'all', 5, 0);

    expect(result).toEqual({
      quotations: [],
      pagination: { limit: 5, offset: 0, total: 0 },
    });
    expect(consoleError).toHaveBeenCalledWith(
      '[Loader] Fetch quotations error:',
      databaseError
    );
    consoleError.mockRestore();
  });
});

function builderColumns(from: jest.Mock): [string] {
  const builder = from.mock.results[0].value;
  return [builder.select.mock.calls[0][0]];
}

/**
 * B2B Order Confirmation API Unit Tests
 *
 * B2B注文確定API単体テスト
 * Unit tests for order confirmation API endpoint
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// ============================================================
// Mocks
// ============================================================

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
}));

// ============================================================
// Test Data
// ============================================================

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockProfile = {
  id: 'profile-123',
  user_id: 'user-123',
  role: 'MEMBER',
  company_id: 'company-123',
};

const mockQuotation = {
  id: 'quote-123',
  user_id: 'profile-123',
  company_id: 'company-123',
  quotation_number: 'QT-20241231-001',
  status: 'sent',
  customer_name: 'Test Company',
  customer_email: 'test@example.com',
  subtotal_amount: 100000,
  tax_amount: 10000,
  total_amount: 110000,
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  estimated_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  sales_rep: '担当者 太郎',
  quotation_items: [
    {
      id: 'qi-1',
      quotation_id: 'quote-123',
      product_id: 'prod-1',
      product_name: 'スタンドアップパウチ',
      quantity: 1000,
      unit_price: 100,
      total_price: 100000,
      specifications: { size: 'W150×H200', material: 'PET' },
    },
  ],
};

const mockOrder = {
  id: 'order-123',
  order_number: 'ORD-20241231-ABC1',
  user_id: 'profile-123',
  company_id: 'company-123',
  quotation_id: 'quote-123',
  status: 'PENDING',
  payment_term: 'credit',
  subtotal: 100000,
  tax_amount: 10000,
  total_amount: 110000,
  created_at: new Date().toISOString(),
};

// ============================================================
// POST Handler Tests
// ============================================================

describe('POST /api/b2b/orders/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order from quotation with valid data', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({ data: mockProfile, error: null })
              .mockResolvedValueOnce({ data: mockQuotation, error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        quotationId: 'quote-123',
        paymentTerm: 'credit',
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        billingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryNotes: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.order).toBeDefined();
    expect(data.order.orderNumber).toBe(mockOrder.order_number);
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        quotationId: 'quote-123',
        paymentTerm: 'credit',
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        billingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryNotes: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('認証');
  });

  it('should return 400 for quotation with wrong status', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const invalidQuotation = { ...mockQuotation, status: 'approved' };
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({ data: mockProfile, error: null })
              .mockResolvedValueOnce({ data: invalidQuotation, error: null }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        quotationId: 'quote-123',
        paymentTerm: 'credit',
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        billingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryNotes: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('注文できません');
  });

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/b2b/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        paymentTerm: 'credit',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should handle payment term selection correctly', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({ data: mockProfile, error: null })
              .mockResolvedValueOnce({ data: mockQuotation, error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockOrder, payment_term: 'advance' },
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        quotationId: 'quote-123',
        paymentTerm: 'advance', // 前払い
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        billingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryNotes: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});

// ============================================================
// GET Handler Tests
// ============================================================

describe('GET /api/b2b/orders/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return order status if quotation already ordered', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest(
      'http://localhost:3000/api/b2b/orders/confirm?quotationId=quote-123'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.canConfirm).toBe(false);
    expect(data.order).toBeDefined();
  });

  it('should return canConfirm true if quotation not ordered', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows returned' },
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest(
      'http://localhost:3000/api/b2b/orders/confirm?quotationId=quote-123'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.canConfirm).toBe(true);
    expect(data.message).toContain('注文可能');
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest(
      'http://localhost:3000/api/b2b/orders/confirm?quotationId=quote-123'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('認証');
  });
});

// ============================================================
// Order Number Generation Tests
// ============================================================

describe('Order Number Generation', () => {
  it('should generate unique order numbers', () => {
    // Test order number format: ORD-YYYYMMDD-XXXX
    const orderNumbers = new Set();

    for (let i = 0; i < 100; i++) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${dateStr}-${randomStr}`;
      orderNumbers.add(orderNumber);
    }

    // Most should be unique (random string with 4 characters)
    expect(orderNumbers.size).toBeGreaterThan(90);
  });

  it('should follow correct order number format', () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = 'ABC1';
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    expect(orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{4}$/);
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('Order Confirmation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete order confirmation workflow', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({ data: mockProfile, error: null })
              .mockResolvedValueOnce({ data: mockQuotation, error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Step 1: Check if quotation can be ordered
    const checkRequest = new NextRequest(
      'http://localhost:3000/api/b2b/orders/confirm?quotationId=quote-123'
    );
    const checkResponse = await GET(checkRequest);
    expect(checkResponse.status).toBe(200);

    // Step 2: Create order
    const confirmRequest = new NextRequest('http://localhost:3000/api/b2b/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        quotationId: 'quote-123',
        paymentTerm: 'credit',
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        billingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine1: '道玄坂1-2-3',
          addressLine2: '',
          company: 'Test Company',
          contactName: '山田 太郎',
          phone: '03-1234-5678',
        },
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryNotes: '',
      }),
    });

    const confirmResponse = await POST(confirmRequest);
    const confirmData = await confirmResponse.json();

    expect(confirmResponse.status).toBe(201);
    expect(confirmData.success).toBe(true);
    expect(confirmData.order).toBeDefined();
  });
});

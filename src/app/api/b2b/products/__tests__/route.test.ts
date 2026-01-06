/**
 * B2B Product Catalog API Unit Tests
 *
 * B2B製品カタログAPI単体テスト
 * Unit tests for product catalog API endpoints
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { GET, POST } from '../route';
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

const mockAdminProfile = {
  id: 'user-123',
  role: 'ADMIN',
};

const mockMemberProfile = {
  id: 'user-123',
  role: 'MEMBER',
};

// ============================================================
// GET Handler Tests
// ============================================================

describe('GET /api/b2b/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all active products by default', async () => {
    const request = new NextRequest('http://localhost:3000/api/b2b/products');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toBeDefined();
    expect(data.products.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBeGreaterThan(0);
  });

  it('should filter products by category', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?category=stand_up'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.products.forEach((product: any) => {
      expect(product.category).toBe('stand_up');
    });
  });

  it('should filter products by material type', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?material_type=PET'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.products.forEach((product: any) => {
      expect(product.materials).toContain('PET');
    });
  });

  it('should search products by name', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?search=スタンドアップ'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products.length).toBeGreaterThan(0);
  });

  it('should support pagination', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?page=1&limit=3'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products.length).toBeLessThanOrEqual(3);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(3);
    expect(data.pagination.totalPages).toBeGreaterThan(0);
  });

  it('should support sorting', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?sort_by=name&sort_order=asc'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Verify sorting by name
    const names = data.products.map((p: any) => p.name_ja);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b, 'ja'));
    expect(names).toEqual(sortedNames);
  });

  it('should return empty array for non-matching search', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?search=NonExistentProductXYZ'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(0);
  });

  it('should handle invalid query parameters gracefully', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?page=invalid&limit=invalid'
    );
    const response = await GET(request);
    const data = await response.json();

    // Should still return 200 with default pagination
    expect(response.status).toBe(200);
    expect(data.products).toBeDefined();
  });
});

// ============================================================
// POST Handler Tests (Admin Only)
// ============================================================

describe('POST /api/b2b/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create product when user is admin', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAdminProfile,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Mock insert to return created product
    mockClient.from = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'prd-new-001',
              product_code: 'PRD-TEST-001',
              name_ja: 'テスト製品',
              name_en: 'Test Product',
            },
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/b2b/products', {
      method: 'POST',
      body: JSON.stringify({
        product_code: 'PRD-TEST-001',
        name_ja: 'テスト製品',
        name_en: 'Test Product',
        category: 'stand_up',
        material_type: 'PET',
        specifications: { pouch_type: 'stand_up' },
        base_price: 150,
        min_order_quantity: 1000,
        lead_time_days: 14,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.product).toBeDefined();
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/products', {
      method: 'POST',
      body: JSON.stringify({
        product_code: 'PRD-TEST-001',
        name_ja: 'テスト製品',
        name_en: 'Test Product',
        category: 'stand_up',
        material_type: 'PET',
        specifications: {},
        base_price: 150,
        min_order_quantity: 1000,
        lead_time_days: 14,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('認証');
  });

  it('should return 403 for non-admin user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockMemberProfile,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/products', {
      method: 'POST',
      body: JSON.stringify({
        product_code: 'PRD-TEST-001',
        name_ja: 'テスト製品',
        name_en: 'Test Product',
        category: 'stand_up',
        material_type: 'PET',
        specifications: {},
        base_price: 150,
        min_order_quantity: 1000,
        lead_time_days: 14,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('管理者');
  });

  it('should validate required fields', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAdminProfile,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/products', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        name_ja: 'テスト製品',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('should handle server errors gracefully', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockRejectedValue(new Error('Database connection failed')) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/products', {
      method: 'POST',
      body: JSON.stringify({
        product_code: 'PRD-TEST-001',
        name_ja: 'テスト製品',
        name_en: 'Test Product',
        category: 'stand_up',
        material_type: 'PET',
        specifications: {},
        base_price: 150,
        min_order_quantity: 1000,
        lead_time_days: 14,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('Product Catalog API Integration', () => {
  it('should handle complete product listing workflow', async () => {
    // List all products
    const listRequest = new NextRequest('http://localhost:3000/api/b2b/products');
    const listResponse = await GET(listRequest);
    const listData = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listData.products.length).toBeGreaterThan(0);

    // Search for specific product
    const searchRequest = new NextRequest(
      `http://localhost:3000/api/b2b/products?search=${listData.products[0].name_ja}`
    );
    const searchResponse = await GET(searchRequest);
    const searchData = await searchResponse.json();

    expect(searchResponse.status).toBe(200);
    expect(searchData.products.length).toBeGreaterThan(0);
  });

  it('should support filtering and pagination together', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/b2b/products?category=stand_up&page=1&limit=2'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products.length).toBeLessThanOrEqual(2);
    data.products.forEach((product: any) => {
      expect(product.category).toBe('stand_up');
    });
  });
});

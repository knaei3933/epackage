/**
 * Unit tests for POST /api/quotations/submit
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('POST /api/quotations/submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    };

    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    const { cookies } = require('next/headers');
    cookies.mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/quotations/submit', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            product_name: 'Test Product',
            quantity: 100,
            unit_price: 100,
            total_price: 10000,
          },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('認証されていません。');
  });

  it('should validate items array', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    };

    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    const { cookies } = require('next/headers');
    cookies.mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/quotations/submit', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('最少でも1つの商品が必要です。');
  });

  it('should validate item fields', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    };

    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue(mockSupabase);

    const { cookies } = require('next/headers');
    cookies.mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/quotations/submit', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            product_name: '',
            quantity: 100,
            unit_price: 100,
            total_price: 10000,
          },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('商品 1: 商品名は必須です。');
  });
});

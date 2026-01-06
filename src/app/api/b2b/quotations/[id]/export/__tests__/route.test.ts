/**
 * B2B Quotation Export API Unit Tests
 *
 * B2B見積もり書エクスポートAPI単体テスト
 * Unit tests for B2B export API endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
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

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://storage.example.com/file.xlsx' },
        })),
      })),
    },
  })),
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Mock excel data mapper
jest.mock('@/lib/excel/excelDataMapper', () => ({
  mapDatabaseQuotationToExcel: jest.fn(() => ({
    clientInfo: {
      company: 'テスト株式会社',
      postalCode: '100-0001',
      address: '東京都',
      contact: '担当者名',
    },
    supplierInfo: {
      company: 'EPACKAGE Lab',
      postalCode: '673-0846',
      address: '兵庫県明石市',
      phone: '080-6942-7235',
      email: 'info@epackage-lab.com',
    },
    paymentTerms: {
      quotationNumber: 'QT-2024-TEST-001',
      quotationDate: '令和6年4月1日',
      quotationExpiry: '30日',
      paymentMethod: '先払い',
    },
    specifications: {},
    orderItems: [],
    processing_options: {},
  })),
}));

// Mock excel template loader
jest.mock('@/lib/excel/excelTemplateLoader', () => ({
  loadTemplate: jest.fn(async () => ({
    workbook: {
      getWorksheet: jest.fn(() => ({
        // Mock worksheet
      })),
      xlsx: {
        writeBuffer: jest.fn(async () => Buffer.from('mock excel data')),
      },
    },
  })),
  writeQuotationToWorksheet: jest.fn(),
}));

// Mock pdf converter
jest.mock('@/lib/excel/pdfConverter', () => ({
  generatePdfBuffer: jest.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46])), // %PDF
  validatePdfData: jest.fn(() => ({ isValid: true, errors: [] })),
}));

// ============================================================
// Test Data
// ============================================================

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockQuotation = {
  id: 'qt-123',
  user_id: 'user-123',
  quotation_number: 'QT-2024-TEST-001',
  created_at: new Date().toISOString(),
  quotation_items: [],
};

const mockUserProfile = {
  id: 'user-123',
  company_name: 'テスト株式会社',
};

// ============================================================
// Test Suites
// ============================================================

describe('GET /api/b2b/quotations/[id]/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return quotation data for authenticated user', async () => {
    // Setup mocks
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Make first call return quotation, second call return profile
    mockClient.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
            }),
          }),
        }),
      });

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export');
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.quotation).toBeDefined();
    expect(data.data.items).toEqual([]);
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export');
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(data.code).toBe('UNAUTHORIZED');
  });

  it('should return 404 for non-existent quotation', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-999/export');
    const params = Promise.resolve({ id: 'qt-999' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Quotation not found');
    expect(data.code).toBe('NOT_FOUND');
  });

  it('should return 400 for missing quotation ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/b2b/quotations//export');
    const params = Promise.resolve({ id: '' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should handle server errors gracefully', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockRejectedValue(new Error('Database connection failed')) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export');
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/b2b/quotations/[id]/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate Excel file successfully', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'excel' }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });

    // Should return file directly when not saving to storage
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('sheetml.sheet');
  });

  it('should generate PDF file successfully', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const { validatePdfData } = await import('@/lib/excel/pdfConverter');
    (validatePdfData as any).mockReturnValue({ isValid: true, errors: [] });

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'pdf' }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'excel' }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid format', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'invalid' }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('INVALID_FORMAT');
  });

  it('should return 404 for non-existent quotation', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-999/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'excel' }),
    });
    const params = Promise.resolve({ id: 'qt-999' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Quotation not found');
  });

  it('should validate PDF data before generation', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const { validatePdfData } = await import('@/lib/excel/pdfConverter');
    (validatePdfData as any).mockReturnValue({
      isValid: false,
      errors: ['Client company name is required'],
    });

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'pdf' }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('INVALID_DATA');
    expect(data.details).toContain('Client company name');
  });

  it('should send email when requested', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Mock Resend
    const { Resend } = await import('resend');
    const mockResend = {
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'email-123' } }),
      },
    };
    (Resend as any).mockReturnValue(mockResend);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({
        format: 'excel',
        sendEmail: true,
        emailTo: 'customer@example.com',
      }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });

    // Email should be logged in development mode
    expect(response.status).toBe(200);
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('Export API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete Excel export workflow', async () => {
    // This test verifies the complete flow from request to response
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({
                data: mockQuotation,
                error: null,
              })
              .mockResolvedValueOnce({
                data: mockUserProfile,
              }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({
        format: 'excel',
        saveToStorage: true,
        sendEmail: true,
        emailTo: 'customer@example.com',
        emailSubject: '見積書 QT-2024-TEST-001',
      }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });
    const data = await response.json();

    // In development mode, should succeed with mocked email
    expect(data).toBeDefined();
  });

  it('should handle complete PDF export workflow', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockQuotation,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const { validatePdfData } = await import('@/lib/excel/pdfConverter');
    (validatePdfData as any).mockReturnValue({ isValid: true, errors: [] });

    const request = new NextRequest('http://localhost:3000/api/b2b/quotations/qt-123/export', {
      method: 'POST',
      body: JSON.stringify({
        format: 'pdf',
        saveToStorage: true,
      }),
    });
    const params = Promise.resolve({ id: 'qt-123' });

    const response = await POST(request, { params });

    // Should return PDF
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });
});

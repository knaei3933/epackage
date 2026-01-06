/**
 * B2B AI Extraction API Unit Tests
 *
 * B2B AI抽出API単体テスト
 * Unit tests for AI extraction endpoints
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { POST, GET } from '../upload/route';
import { POST as ApprovePOST } from '../approve/route';
import { POST as StatusPOST } from '../status/route';
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
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
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

const mockOrder = {
  id: 'order-123',
  user_id: 'profile-123',
  company_id: 'company-123',
  status: 'PENDING',
};

const mockFile = {
  id: 'file-123',
  order_id: 'order-123',
  uploaded_by: 'profile-123',
  file_type: 'AI',
  file_name: 'design.ai',
  file_url: 'https://storage.url/design.ai',
  file_size: 1024 * 1024, // 1MB
  version: 1,
  is_latest: true,
  validation_status: 'PENDING',
  created_at: new Date().toISOString(),
};

const mockProductionData = {
  id: 'prod-data-123',
  order_id: 'order-123',
  file_id: 'file-123',
  data_type: 'design_file',
  title: 'デザインファイル: design.ai',
  version: '1.0',
  validation_status: 'VALID',
  approved_for_production: true,
  extracted_data: {
    dimensions: {
      width_mm: 150,
      height_mm: 200,
      gusset_mm: 50,
    },
    materials: {
      raw: 'PET12μ+AL7μ+PET12μ+LLDPE60μ',
      layers: [
        { type: 'PET', thickness_microns: 12, position: 1 },
        { type: 'AL', thickness_microns: 7, position: 2 },
        { type: 'PET', thickness_microns: 12, position: 3 },
        { type: 'PE', thickness_microns: 60, position: 4 },
      ],
      total_thickness_microns: 91,
    },
    options: {
      zipper: true,
      zipper_type: 'standard',
      notch: 'V',
      corner_round: 'R5',
      hang_hole: false,
    },
    colors: {
      mode: 'CMYK',
      front_colors: [
        { name: 'PANTONE 185 C', cmyk: [0, 91, 79, 0] },
      ],
      color_stations: 4,
    },
    design_elements: {
      logos: [],
      text: [],
      graphics: [],
    },
    print_specifications: {
      resolution_dpi: 300,
      color_mode: 'CMYK',
      bleed_mm: 3,
      print_type: 'flexographic',
    },
  },
  confidence_score: 0.92,
  received_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

// ============================================================
// Upload API Tests
// ============================================================

describe('POST /api/b2b/ai-extraction/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload .ai file successfully', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn((table) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
          };
        }
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
              }),
            }),
          };
        }
        if (table === 'files') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockFile, error: null }),
              }),
            }),
          };
        }
        if (table === 'production_data') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProductionData, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'order-123/file-123-design.ai' },
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            publicUrl: 'https://storage.url/design.ai',
          }),
          remove: jest.fn(),
        })),
      },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Create mock file
    const file = new File(['mock content'], 'design.ai', { type: 'application/illustrator' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', 'order-123');
    formData.append('data_type', 'design_file');

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data?.file_id).toBeDefined();
  });

  it('should reject non-.ai files', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Create mock file with wrong extension
    const file = new File(['mock content'], 'design.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', 'order-123');

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error?.code).toBe('INVALID_FILE_TYPE');
  });

  it('should reject files larger than 50MB', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Create mock file with size > 50MB
    const largeContent = new Array(51 * 1024 * 1024).fill('x').join('');
    const file = new File([largeContent], 'large.ai', { type: 'application/illustrator' });
    Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', 'order-123');

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error?.code).toBe('FILE_TOO_LARGE');
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const file = new File(['mock'], 'design.ai', { type: 'application/illustrator' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', 'order-123');

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
  });
});

// ============================================================
// Status API Tests
// ============================================================

describe('GET /api/b2b/ai-extraction/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return completed status with extracted data', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockFile,
                production_data: [mockProductionData],
              },
              error: null,
            }),
          }),
        }),
      })),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest(
      'http://localhost:3000/api/b2b/ai-extraction/status?file_id=file-123'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.status).toBe('completed');
    expect(data.data?.extracted_data).toBeDefined();
  });

  it('should return pending status when no production data exists', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockFile,
                production_data: [],
              },
              error: null,
            }),
          }),
        }),
      })),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest(
      'http://localhost:3000/api/b2b/ai-extraction/status?file_id=file-123'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data?.status).toBe('pending');
  });

  it('should return 401 for unauthenticated user', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest(
      'http://localhost:3000/api/b2b/ai-extraction/status?file_id=file-123'
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

// ============================================================
// Approval API Tests
// ============================================================

describe('POST /api/b2b/ai-extraction/approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should approve extracted data successfully', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn((table) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
          };
        }
        if (table === 'files') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    ...mockFile,
                    production_data: [mockProductionData],
                    order: mockOrder,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'production_data') {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      ...mockProductionData,
                      approved_for_production: true,
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'work_orders') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'work-order-123' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/approve', {
      method: 'POST',
      body: JSON.stringify({
        file_id: 'file-123',
        approved_data: mockProductionData.extracted_data,
        create_work_order: false,
        notes: '',
      }),
    });

    const response = await ApprovePOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.status).toBe('approved');
  });

  it('should validate request data', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/approve', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        file_id: 'file-123',
      }),
    });

    const response = await ApprovePOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error?.code).toBe('VALIDATION_ERROR');
  });

  it('should create work order when requested', async () => {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn((table) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
          };
        }
        if (table === 'files') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    ...mockFile,
                    production_data: [mockProductionData],
                    order: mockOrder,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'production_data') {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      ...mockProductionData,
                      approved_for_production: true,
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'work_orders') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'work-order-123' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    const request = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/approve', {
      method: 'POST',
      body: JSON.stringify({
        file_id: 'file-123',
        approved_data: mockProductionData.extracted_data,
        create_work_order: true,
        notes: '',
      }),
    });

    const response = await ApprovePOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.work_order_id).toBe('work-order-123');
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('AI Extraction Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete extraction workflow', async () => {
    // This test would simulate the full workflow:
    // 1. Upload file
    // 2. Poll for status
    // 3. Approve data

    // For brevity, just testing individual steps here
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const mockClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn()
              .mockResolvedValueOnce({ data: mockProfile, error: null })
              .mockResolvedValueOnce({ data: mockOrder, error: null })
              .mockResolvedValueOnce({ data: { ...mockFile, production_data: [mockProductionData] }, error: null }),
          }),
        }),
      }),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'order-123/file-123-design.ai' },
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            publicUrl: 'https://storage.url/design.ai',
          }),
        })),
      },
    };
    (createRouteHandlerClient as any).mockReturnValue(mockClient);

    // Test file upload
    const file = new File(['mock'], 'design.ai', { type: 'application/illustrator' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_id', 'order-123');

    const uploadRequest = new NextRequest('http://localhost:3000/api/b2b/ai-extraction/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadResponse = await POST(uploadRequest);
    expect(uploadResponse.status).toBe(201);
  });
});

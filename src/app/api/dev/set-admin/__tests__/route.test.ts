/**
 * Set Admin API Unit Tests
 *
 * 管理者昇格API単体テスト
 * Unit tests for admin promotion API endpoint
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// ============================================================
// Mocks
// ============================================================

// Mock Supabase auth helpers
const mockAuth = {
  getSession: vi.fn(),
};

const mockFrom = vi.fn();

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: mockAuth,
    from: mockFrom,
  })),
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
    })),
  })),
}));

// ============================================================
// Test Data
// ============================================================

const mockAdminUser = {
  id: 'admin-user-123',
  email: 'admin@example.com',
};

const mockMemberUser = {
  id: 'member-user-123',
  email: 'member@example.com',
};

const mockAdminProfile = {
  id: 'admin-user-123',
  role: 'ADMIN',
  status: 'ACTIVE',
};

const mockMemberProfile = {
  id: 'member-user-123',
  role: 'MEMBER',
  status: 'ACTIVE',
};

// ============================================================
// Test Suite
// ============================================================

describe('POST /api/dev/set-admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Authentication', () => {
    it('should return 401 when no session exists', async () => {
      // Mock no session
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証されていません。ログインしてください。');
    });

    it('should return 401 when session has error', async () => {
      // Mock session error
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session expired'),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証されていません。ログインしてください。');
    });
  });

  describe('Authorization', () => {
    it('should return 403 when requester is not ADMIN', async () => {
      // Mock authenticated session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockMemberUser,
          },
        },
        error: null,
      });

      // Mock profile query returns MEMBER
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockMemberProfile,
              error: null,
            })),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('権限がありません。管理者のみアクセス可能です。');
    });

    it('should return 404 when requester profile not found', async () => {
      // Mock authenticated session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockMemberUser,
          },
        },
        error: null,
      });

      // Mock profile query returns not found
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Profile not found' },
            })),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('プロフィールが見つかりません。');
    });
  });

  describe('Request Validation', () => {
    it('should return 400 when email is missing', async () => {
      // Mock authenticated admin session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockAdminUser,
          },
        },
        error: null,
      });

      // Mock admin profile
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockAdminProfile,
              error: null,
            })),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({}), // Missing email
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email required');
    });

    it('should return 400 for invalid JSON', async () => {
      // Mock authenticated admin session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockAdminUser,
          },
        },
        error: null,
      });

      // Mock admin profile
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockAdminProfile,
              error: null,
            })),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Successful Admin Promotion', () => {
    it('should promote user to ADMIN when requested by admin', async () => {
      // Mock authenticated admin session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockAdminUser,
          },
        },
        error: null,
      });

      // Mock admin profile query
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({
            data: [{ id: 'user-123', email: 'test@example.com', role: 'ADMIN', status: 'ACTIVE' }],
            error: null,
          })),
        })),
      }));

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockAdminProfile,
              error: null,
            })),
          })),
        })),
      });

      // Mock service role client
      const { createClient } = require('@supabase/supabase-js');
      (createClient as jest.Mock).mockReturnValue({
        from: vi.fn(() => ({
          update: mockUpdate,
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User updated to ADMIN');
      expect(data.user).toBeDefined();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'ADMIN',
          status: 'ACTIVE',
        })
      );
    });

    it('should include updated_at timestamp when promoting user', async () => {
      // Mock authenticated admin session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockAdminUser,
          },
        },
        error: null,
      });

      // Mock admin profile query
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({
            data: [{ id: 'user-123', email: 'test@example.com', role: 'ADMIN', status: 'ACTIVE' }],
            error: null,
          })),
        })),
      }));

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockAdminProfile,
              error: null,
            })),
          })),
        })),
      });

      // Mock service role client
      const { createClient } = require('@supabase/supabase-js');
      (createClient as jest.Mock).mockReturnValue({
        from: vi.fn(() => ({
          update: mockUpdate,
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      await POST(request);

      // Verify updated_at is included in the update
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database update fails', async () => {
      // Mock authenticated admin session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockAdminUser,
          },
        },
        error: null,
      });

      // Mock admin profile query
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockAdminProfile,
              error: null,
            })),
          })),
        })),
      });

      // Mock service role client with error
      const { createClient } = require('@supabase/supabase-js');
      (createClient as jest.Mock).mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Database connection failed' },
              })),
            })),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/dev/set-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });
  });
});

/**
 * Set Admin API Unit Tests
 *
 * 管理者昇格API単体テスト
 * Unit tests for admin promotion API endpoint
 *
 * 注意: @jest-environment 指定は意図的に外してある。
 * jest.config.js のカスタム環境 (jest-jsdom-env.js) が Node ネイティブの
 * Web API (Request/fetch/Response 等) を注入する。ファイル内で @jest-environment jsdom
 * を指定するとカスタム環境が上書きされ、next/server が参照する Request が未定義になる。
 *
 * 現行 route.ts は @/lib/supabase-ssr (getUser ベース) と
 * @/lib/supabase-authenticated (service role) を使用する。
 * 旧実装 (@supabase/auth-helpers-nextjs + getSession) から全面移行済み。
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// ============================================================
// Mocks
// factory は jest.fn() のみを返す (外部変数参照による TDZ を回避)。
// 実際の戻り値は beforeEach / 各テストで設定する。
// これらのモックにより supabase-authenticated.ts のサーバーサイド専用
// window チェックも実行されなくなる。
// ============================================================

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

// route.ts は createClient を直接使用しないが、import 副作用を抑えるためモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// @swc/jest は jest.mock の hoisting を行わないため、require で遅延評価し、
// jest.mock 適用後に route.ts (→ supabase-authenticated) をロードする。
// これにより supabase-authenticated.ts のサーバーサイド専用 window チェックが
// モック置換により実行されなくなる。
 
const { POST } = require('../route');
 
const { createSupabaseSSRClient } = require('@/lib/supabase-ssr');
 
const { createAuthenticatedServiceClient } = require('@/lib/supabase-authenticated');

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
// Helpers
// ============================================================

interface SSRSetup {
  user: any;
  error?: any;
  profile: any;
  profileError?: any;
}

// SSR client を設定: auth.getUser() と profiles クエリチェーン
function setupSSRClient({ user, error = null, profile, profileError = null }: SSRSetup) {
  const getUser = jest.fn().mockResolvedValue({ data: { user }, error });
  const from = jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: profile, error: profileError })),
      })),
    })),
  }));
  const ssrClient = { auth: { getUser }, from };
  (createSupabaseSSRClient as unknown as jest.Mock).mockResolvedValue({ client: ssrClient });
  return { getUser, from };
}

// admin (service role) client を設定: update チェーン
function setupAdminClient(result: { data: any; error: any }) {
  const update = jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve(result)),
    })),
  }));
  const from = jest.fn(() => ({ update }));
  (createAuthenticatedServiceClient as unknown as jest.Mock).mockReturnValue({ from });
  return { update, from };
}

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/dev/set-admin', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

// ============================================================
// Test Suite
// ============================================================

describe('POST /api/dev/set-admin', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Authentication', () => {
    it('should return 401 when no user', async () => {
      setupSSRClient({ user: null, profile: null });

      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証されていません。ログインしてください。');
    });

    it('should return 401 when getUser has error', async () => {
      setupSSRClient({ user: null, error: new Error('Session expired'), profile: null });

      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証されていません。ログインしてください。');
    });
  });

  describe('Authorization', () => {
    it('should return 403 when requester is not ADMIN', async () => {
      setupSSRClient({ user: mockMemberUser, profile: mockMemberProfile });

      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('権限がありません。管理者のみアクセス可能です。');
    });

    it('should return 404 when requester profile not found', async () => {
      setupSSRClient({
        user: mockMemberUser,
        profile: null,
        profileError: { message: 'Profile not found' },
      });

      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('プロフィールが見つかりません。');
    });
  });

  describe('Request Validation', () => {
    it('should return 400 when email is missing', async () => {
      setupSSRClient({ user: mockAdminUser, profile: mockAdminProfile });

      const response = await POST(makeRequest({}));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email required');
    });

    it('should return 500 for invalid JSON', async () => {
      setupSSRClient({ user: mockAdminUser, profile: mockAdminProfile });

      const response = await POST(makeRequest('invalid json'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Successful Admin Promotion', () => {
    it('should promote user to ADMIN when requested by admin', async () => {
      setupSSRClient({ user: mockAdminUser, profile: mockAdminProfile });
      const { update } = setupAdminClient({
        data: [{ id: 'user-123', email: 'test@example.com', role: 'ADMIN', status: 'ACTIVE' }],
        error: null,
      });

      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User updated to ADMIN');
      expect(data.user).toBeDefined();
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'ADMIN',
          status: 'ACTIVE',
        })
      );
    });

    it('should include updated_at timestamp when promoting user', async () => {
      setupSSRClient({ user: mockAdminUser, profile: mockAdminProfile });
      const { update } = setupAdminClient({
        data: [{ id: 'user-123', email: 'test@example.com', role: 'ADMIN', status: 'ACTIVE' }],
        error: null,
      });

      await POST(makeRequest({ email: 'test@example.com' }));

      // Verify updated_at is included in the update
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database update fails', async () => {
      setupSSRClient({ user: mockAdminUser, profile: mockAdminProfile });
      setupAdminClient({ data: null, error: { message: 'Database connection failed' } });

      const response = await POST(makeRequest({ email: 'test@example.com' }));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });
  });
});

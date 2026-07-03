/**
 * Supabase Utilities Unit Tests
 *
 * Supabaseユニティリティユニットテスト
 *
 * 【是正方針】
 * - 実装 src/lib/supabase.ts の現行振る舞いにテスト期待値を合わせる。
 * - createServiceClient / createSupabaseWithCookies はクレデンシャル不足時に
 *   例外を投げず mock クライアントを返す（warn のみ）。よって「例外を投げる」
 *   期待は「mock クライアントを返す」に是正。
 * - db.createQuote / createInquiry / createSampleRequest は DEPRECATED であり
 *   常に例外を投げる。よって「成功」期待は「例外」に是正。
 * - createServiceClient は _serviceClient シングルトンキャッシュを持つため、
 *   モックは createClient 呼出の都度「現在の mockSupabaseInstance」を参照する
 *   遅延評価設計とし、beforeEach でキャッシュ（_serviceClient）ごとリセットする。
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Set environment variables BEFORE importing the module
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// モッククライアントの「現在の実体」。createServiceClient のシングルトンキャッシュと
// 競合しないよう、createClient factory は毎回この変数を遅延参照する。
let mockSupabaseInstance: any = null

// jest.mock は @swc/jest では hoisting されないため、factory 内で完結させる。
// factory 内で createClient を定義し、呼び出しの都度 mockSupabaseInstance を
// 遅延参照してクライアントを構築する。
jest.mock('@supabase/supabase-js', () => {
  const createClient = jest.fn(() => {
    // 呼び出し時に現在の mockSupabaseInstance を参照（遅延評価）
    return mockSupabaseInstance
  })
  return { createClient }
})

// jest.resetModules で実装側の _serviceClient シングルトンを都度リセットするため、
// 各テストでモジュールを再取得するヘルパー。
async function loadModule() {
  jest.resetModules()
  return await import('../supabase')
}

// 1回だけ初期インポート（型取得用）。各テストでは loadModule で再取得する。
import type { Profile } from '../supabase'

// ============================================================
// モックビルダー
// ============================================================

/**
 * モッククライアント。
 *
 * 【重要】クライアントを thenable にはしないこと。
 * 実装 db.getProducts は `const client = await getServerClient()` と
 * クライアントを await するため、クライアントが thenable だと
 * await の解決値で client が上書きされ `client.from is not a function` になる。
 * よってクライアントは非 thenable とし、`await query`（チェーン末尾）で
 * 取得される { data, error } は client の data/error プロパティで表現する。
 * （非 thenable なオブジェクトを await すると値がそのまま返るため）
 *
 * 単一行取得は single()/maybeSingle() で Promise<{data,error}> を返す。
 */
function createMockSupabaseClient() {
  const client: any = {
    // await query で取り出される結果（デフォルトは空）
    data: null,
    error: null,
    from: jest.fn(() => client),
    select: jest.fn(() => client),
    insert: jest.fn(() => client),
    update: jest.fn(() => client),
    delete: jest.fn(() => client),
    eq: jest.fn(() => client),
    neq: jest.fn(() => client),
    lt: jest.fn(() => client),
    lte: jest.fn(() => client),
    gte: jest.fn(() => client),
    in: jest.fn(() => client),
    order: jest.fn(() => client),
    limit: jest.fn(() => client),
    range: jest.fn(() => client),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    auth: {
      getSession: jest.fn(),
    },
  }

  // single / maybeSingle はデフォルトで { data: null, error: null }
  client.single.mockResolvedValue({ data: null, error: null })
  client.maybeSingle.mockResolvedValue({ data: null, error: null })

  return client
}

// ============================================================
// Test Setup
// ============================================================

const originalEnv = { ...process.env }

describe('Supabase Utilities', () => {
  let mod: any
  let createServiceClient: any
  let createSupabaseClient: any
  let isSupabaseConfigured: any
  let auth: any
  let db: any
  let getUserEmail: any
  let createSupabaseWithCookies: any
  let mockClient: any

  beforeEach(async () => {
    jest.clearAllMocks()

    // 環境変数を毎テストで確実に設定（isSupabaseConfigured のため）
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    // フレッシュなモッククライアントを生成し、factory 遅延参照先へセット
    mockClient = createMockSupabaseClient()
    mockSupabaseInstance = mockClient

    // 実装の _serviceClient シングルトンキャッシュをリセットするため再 import
    mod = await loadModule()
    createServiceClient = mod.createServiceClient
    createSupabaseClient = mod.createSupabaseClient
    isSupabaseConfigured = mod.isSupabaseConfigured
    auth = mod.auth
    db = mod.db
    getUserEmail = mod.getUserEmail
    createSupabaseWithCookies = mod.createSupabaseWithCookies
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  // ============================================================
  // Configuration Tests
  // ============================================================

  describe('isSupabaseConfigured', () => {
    it('should return true when all credentials are set', () => {
      // モジュール読み込み時に環境変数が設定済みであることを検証
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      // 再 import してモジュールスコープ変数を再評価
      return loadModule().then((m: any) => {
        expect(m.isSupabaseConfigured()).toBe(true)
      })
    })

    it('should return false for placeholder URL', () => {
      // placeholder URL のモジュールを別ロードで検証
      const prev = process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co'
      return loadModule()
        .then((m: any) => {
          expect(m.isSupabaseConfigured()).toBe(false)
        })
        .finally(() => {
          process.env.NEXT_PUBLIC_SUPABASE_URL = prev
        })
    })
  })

  // ============================================================
  // Client Creation Tests
  // ============================================================

  describe('createServiceClient', () => {
    it('should create a service client', () => {
      const client = createServiceClient()
      expect(client).toBeDefined()
      expect(client).toBe(mockClient)
    })

    it('should return mock client (not throw) when credentials are missing', async () => {
      // 実装仕様: クレデンシャル不足時は例外ではなく mock クライアントを返す
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''

      const m = await loadModule()
      // 例外を投げず、定義済みのクライアントを返すことを検証
      expect(() => m.createServiceClient()).not.toThrow()
      const client = m.createServiceClient()
      expect(client).toBeDefined()
      // mock クライアントは from/select などのメソッドを持つ
      expect(typeof client.from).toBe('function')
      expect(typeof client.select).toBe('function')
    })
  })

  describe('createSupabaseClient', () => {
    it('should be an alias for createServiceClient', () => {
      expect(createSupabaseClient).toBe(createServiceClient)
    })
  })

  // ============================================================
  // Auth Utilities Tests
  // ============================================================

  describe('auth.getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'test@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        corporate_phone: '03-1234-5678',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await auth.getProfile('user-001')

      expect(result).toEqual(mockProfile)
      expect(mockClient.from).toHaveBeenCalledWith('profiles')
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'user-001')
    })

    it('should return null when profile not found', async () => {
      mockClient.maybeSingle.mockResolvedValue({ data: null, error: null })

      const result = await auth.getProfile('user-001')

      expect(result).toBeNull()
    })

    it('should return null on database error', async () => {
      mockClient.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await auth.getProfile('user-001')

      expect(result).toBeNull()
    })
  })

  describe('auth.isAdmin', () => {
    it('should return true for admin users', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'admin@example.com',
        kanji_last_name: '管理',
        kanji_first_name: '者',
        kana_last_name: 'カンリ',
        kana_first_name: 'シャ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await auth.isAdmin('user-001')

      expect(result).toBe(true)
    })

    it('should return false for non-admin users', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await auth.isAdmin('user-001')

      expect(result).toBe(false)
    })

    it('should return false for inactive admin users', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'admin@example.com',
        kanji_last_name: '管理',
        kanji_first_name: '者',
        kana_last_name: 'カンリ',
        kana_first_name: 'シャ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'ADMIN',
        status: 'SUSPENDED',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await auth.isAdmin('user-001')

      expect(result).toBe(false)
    })
  })

  describe('auth.isActive', () => {
    it('should return true for active users', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await auth.isActive('user-001')

      expect(result).toBe(true)
    })

    it('should return false for pending users', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'PENDING',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await auth.isActive('user-001')

      expect(result).toBe(false)
    })
  })

  describe('auth.getDisplayName', () => {
    it('should return kanji display name', () => {
      const profile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = auth.getDisplayName(profile)

      expect(result).toBe('山田 太郎')
    })
  })

  describe('auth.getDisplayNameKana', () => {
    it('should return kana display name', () => {
      const profile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = auth.getDisplayNameKana(profile)

      expect(result).toBe('ヤマダ タロウ')
    })
  })

  describe('auth.updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      // updateLastLogin は await query で解決する。
      // クライアントの data/error を使う（非 thenable）。
      mockClient.data = null
      mockClient.error = null

      await auth.updateLastLogin('user-001')

      expect(mockClient.from).toHaveBeenCalledWith('profiles')
      expect(mockClient.update).toHaveBeenCalled()
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'user-001')
    })
  })

  describe('auth.updateProfile', () => {
    it('should update user profile fields', async () => {
      const updatedProfile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        corporate_phone: '03-9999-9999',
      }

      // updateProfile は .update().eq().select().single() を呼ぶ
      mockClient.single.mockResolvedValue({ data: updatedProfile, error: null })

      const result = await auth.updateProfile('user-001', {
        corporate_phone: '03-9999-9999',
      })

      expect(result?.corporate_phone).toBe('03-9999-9999')
      expect(mockClient.from).toHaveBeenCalledWith('profiles')
    })
  })

  describe('auth.getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers: Profile[] = [
        {
          id: 'user-001',
          email: 'user1@example.com',
          kanji_last_name: '山田',
          kanji_first_name: '太郎',
          kana_last_name: 'ヤマダ',
          kana_first_name: 'タロウ',
          business_type: 'CORPORATION',
          product_category: 'COSMETICS',
          role: 'MEMBER',
          status: 'ACTIVE',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      // getAllUsers は await query で解決する。クライアントの data/error を使う。
      mockClient.data = mockUsers
      mockClient.error = null

      const result = await auth.getAllUsers()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('user-001')
    })

    it('should filter users by status', async () => {
      const mockUsers: Profile[] = [
        {
          id: 'user-001',
          email: 'user@example.com',
          kanji_last_name: '山田',
          kanji_first_name: '太郎',
          kana_last_name: 'ヤマダ',
          kana_first_name: 'タロウ',
          business_type: 'CORPORATION',
          product_category: 'COSMETICS',
          role: 'MEMBER',
          status: 'ACTIVE',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockClient.data = mockUsers
      mockClient.error = null

      await auth.getAllUsers({ status: 'ACTIVE' })

      expect(mockClient.eq).toHaveBeenCalledWith('status', 'ACTIVE')
    })

    it('should filter users by role', async () => {
      const mockUsers: Profile[] = [
        {
          id: 'user-001',
          email: 'admin@example.com',
          kanji_last_name: '管理',
          kanji_first_name: '者',
          kana_last_name: 'カンリ',
          kana_first_name: 'シャ',
          business_type: 'CORPORATION',
          product_category: 'COSMETICS',
          role: 'ADMIN',
          status: 'ACTIVE',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockClient.data = mockUsers
      mockClient.error = null

      await auth.getAllUsers({ role: 'ADMIN' })

      expect(mockClient.eq).toHaveBeenCalledWith('role', 'ADMIN')
    })
  })

  describe('auth.updateUserStatus', () => {
    it('should update user status', async () => {
      const updatedProfile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'SUSPENDED',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.single.mockResolvedValue({ data: updatedProfile, error: null })

      const result = await auth.updateUserStatus('user-001', 'SUSPENDED')

      expect(result?.status).toBe('SUSPENDED')
      expect(mockClient.update).toHaveBeenCalledWith({ status: 'SUSPENDED' })
    })

    it('should return null on error', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await auth.updateUserStatus('user-001', 'SUSPENDED')

      expect(result).toBeNull()
    })
  })

  describe('auth.updateUserRole', () => {
    it('should update user role', async () => {
      const updatedProfile: Profile = {
        id: 'user-001',
        email: 'user@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.single.mockResolvedValue({ data: updatedProfile, error: null })

      const result = await auth.updateUserRole('user-001', 'ADMIN')

      expect(result?.role).toBe('ADMIN')
      expect(mockClient.update).toHaveBeenCalledWith({ role: 'ADMIN' })
    })

    it('should return null on error', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await auth.updateUserRole('user-001', 'ADMIN')

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // Helper Functions Tests
  // ============================================================

  describe('getUserEmail', () => {
    it('should return user email', async () => {
      const mockProfile: Profile = {
        id: 'user-001',
        email: 'test@example.com',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        business_type: 'CORPORATION',
        product_category: 'COSMETICS',
        role: 'MEMBER',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockClient.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const result = await getUserEmail('user-001')

      expect(result).toBe('test@example.com')
    })

    it('should return null when profile not found', async () => {
      mockClient.maybeSingle.mockResolvedValue({ data: null, error: null })

      const result = await getUserEmail('user-001')

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // Database Helpers Tests
  // ============================================================

  describe('db.getProducts', () => {
    it('should return all active products', async () => {
      const mockProducts = [
        { id: 'prod-001', name: 'Product 1', is_active: true },
        { id: 'prod-002', name: 'Product 2', is_active: true },
      ]

      // getProducts は await query で解決する。クライアントの data/error を使う。
      mockClient.data = mockProducts
      mockClient.error = null

      const result = await db.getProducts()

      expect(result).toHaveLength(2)
      expect(mockClient.from).toHaveBeenCalledWith('products')
    })

    it('should filter products by category', async () => {
      const mockProducts = [
        { id: 'prod-001', name: 'Product 1', category: 'COSMETICS', is_active: true },
      ]

      mockClient.data = mockProducts
      mockClient.error = null

      const result = await db.getProducts('COSMETICS')

      expect(result).toHaveLength(1)
    })
  })

  // ============================================================
  // Deprecated Write Helpers (always throw per current implementation)
  // ============================================================

  describe('db.createQuote (DEPRECATED)', () => {
    it('should always throw because client-side writes are disabled', async () => {
      // 実装仕様: DEPRECATED。常に例外を投げる。
      await expect(db.createQuote({ id: 'quote-001' } as any)).rejects.toThrow(
        'Client-side database writes are disabled'
      )
      // DB 書き込みが行われないことを検証
      expect(mockClient.from).not.toHaveBeenCalled()
    })
  })

  describe('db.createInquiry (DEPRECATED)', () => {
    it('should always throw because client-side writes are disabled', async () => {
      await expect(db.createInquiry({ id: 'inquiry-001' } as any)).rejects.toThrow(
        'Client-side database writes are disabled'
      )
      expect(mockClient.from).not.toHaveBeenCalled()
    })
  })

  describe('db.createSampleRequest (DEPRECATED)', () => {
    it('should always throw because client-side writes are disabled', async () => {
      await expect(db.createSampleRequest({ id: 'sample-001' } as any)).rejects.toThrow(
        'Client-side database writes are disabled'
      )
      expect(mockClient.from).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // Cookie-based Client Tests
  // ============================================================

  describe('createSupabaseWithCookies', () => {
    it('should create client with cookie storage', async () => {
      const mockCookieStore = {
        get: jest.fn(() => ({ value: 'test-value' })),
        set: jest.fn(),
        delete: jest.fn(),
      }

      const result = await createSupabaseWithCookies(mockCookieStore as any)

      // クレデンシャル設定済みなので createClient (モック) が呼ばれ、
      // mockSupabaseInstance が返る
      expect(result).toBeDefined()
    })

    it('should return mock client (not throw) when credentials are missing', async () => {
      // 実装仕様: クレデンシャル不足時は例外ではなく mock クライアントを返す
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      try {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const m = await loadModule()

        const mockCookieStore = {
          get: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        }

        // 例外を投げず、mock クライアントを返すことを検証
        const result = await m.createSupabaseWithCookies(mockCookieStore as any)
        expect(result).toBeDefined()
        expect(typeof result.from).toBe('function')
      } finally {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
      }
    })
  })
})

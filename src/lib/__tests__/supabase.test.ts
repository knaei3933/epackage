/**
 * Supabase Utilities Unit Tests
 *
 * Supabaseユーティリティユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'

// Set environment variables BEFORE importing the module
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// Mock createClient before importing supabase module
const mockCreateClient = jest.fn()

// Setup mock return value BEFORE the module imports it
let mockSupabaseInstance: any = null

const createMockSupabaseClient = () => ({
  from: jest.fn((table: string) => mockSupabaseInstance),
  select: jest.fn(() => mockSupabaseInstance),
  insert: jest.fn(() => mockSupabaseInstance),
  update: jest.fn(() => mockSupabaseInstance),
  delete: jest.fn(() => mockSupabaseInstance),
  eq: jest.fn(() => mockSupabaseInstance),
  single: jest.fn(() => mockSupabaseInstance),
  maybeSingle: jest.fn(() => mockSupabaseInstance),
  limit: jest.fn(() => mockSupabaseInstance),
  order: jest.fn(() => mockSupabaseInstance),
  range: jest.fn(() => mockSupabaseInstance),
  gte: jest.fn(() => mockSupabaseInstance),
  lte: jest.fn(() => mockSupabaseInstance),
  in: jest.fn(() => mockSupabaseInstance),
  neq: jest.fn(() => mockSupabaseInstance),
  lt: jest.fn(() => mockSupabaseInstance),
  auth: {
    getSession: jest.fn(),
  },
})

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}))

// Now import the module after mocking
import {
  createServiceClient,
  createSupabaseClient,
  isSupabaseConfigured,
  auth,
  db,
  getUserEmail,
  createSupabaseWithCookies,
} from '../supabase'
import type { Profile } from '../supabase'

// ============================================================
// Test Setup
// ============================================================

const originalEnv = process.env

describe('Supabase Utilities', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    // Create fresh mock client for each test
    mockClient = createMockSupabaseClient()
    mockSupabaseInstance = mockClient

    // Reset default mock return values
    mockClient.single.mockResolvedValue({ data: null, error: null })
    mockClient.maybeSingle.mockResolvedValue({ data: null, error: null })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // ============================================================
  // Configuration Tests
  // ============================================================

  describe('isSupabaseConfigured', () => {
    it('should return true when all credentials are set', () => {
      const result = isSupabaseConfigured()
      expect(result).toBe(true)
    })

    it('should return false for placeholder URL', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co'
      const result = isSupabaseConfigured()
      expect(result).toBe(false)
    })
  })

  // ============================================================
  // Client Creation Tests
  // ============================================================

  describe('createServiceClient', () => {
    it('should create a service client', () => {
      const client = createServiceClient()
      expect(client).toBeDefined()
    })

    it('should throw error when credentials are missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''

      expect(() => createServiceClient()).toThrow('Supabase service credentials not configured')
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
      mockClient.single.mockResolvedValue({ data: { id: 'user-001' }, error: null })

      await auth.updateLastLogin('user-001')

      expect(mockClient.from).toHaveBeenCalledWith('profiles')
      expect(mockClient.update).toHaveBeenCalled()
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'user-001')
    })
  })

  describe('auth.updateProfile', () => {
    it('should update user profile fields', async () => {
      const existingProfile: Profile = {
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
        corporate_phone: '03-1234-5678',
      }

      const updatedProfile = {
        ...existingProfile,
        corporate_phone: '03-9999-9999',
      }

      mockClient.single
        .mockResolvedValueOnce({ data: existingProfile, error: null })
        .mockResolvedValueOnce({ data: updatedProfile, error: null })

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

      mockClient.single.mockResolvedValue({ data: mockUsers, error: null })

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

      mockClient.single.mockResolvedValue({ data: mockUsers, error: null })

      const result = await auth.getAllUsers({ status: 'ACTIVE' })

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

      mockClient.single.mockResolvedValue({ data: mockUsers, error: null })

      const result = await auth.getAllUsers({ role: 'ADMIN' })

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

      mockClient.single.mockResolvedValue({ data: mockProducts, error: null })

      const result = await db.getProducts()

      expect(result).toHaveLength(2)
      expect(mockClient.from).toHaveBeenCalledWith('products')
    })

    it('should filter products by category', async () => {
      const mockProducts = [
        { id: 'prod-001', name: 'Product 1', category: 'COSMETICS', is_active: true },
      ]

      mockClient.single.mockResolvedValue({ data: mockProducts, error: null })

      const result = await db.getProducts('COSMETICS')

      expect(result).toHaveLength(1)
    })
  })

  describe('db.createQuote', () => {
    it('should create a new quote', async () => {
      const quoteData = {
        id: 'quote-001',
        customer_name: 'Test Customer',
        total_amount: 1000,
      }

      mockClient.single.mockResolvedValue({ data: quoteData, error: null })

      const result = await db.createQuote(quoteData as any)

      expect(result).toEqual(quoteData)
      expect(mockClient.from).toHaveBeenCalledWith('quotations')
    })

    it('should throw error on database error', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Database error' },
      })

      await expect(db.createQuote({ id: 'quote-001' } as any)).rejects.toThrow()
    })
  })

  describe('db.createInquiry', () => {
    it('should create a new inquiry', async () => {
      const inquiryData = {
        id: 'inquiry-001',
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test inquiry',
      }

      mockClient.single.mockResolvedValue({ data: inquiryData, error: null })

      const result = await db.createInquiry(inquiryData as any)

      expect(result).toEqual(inquiryData)
      expect(mockClient.from).toHaveBeenCalledWith('inquiries')
    })

    it('should throw error on database error', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Database error' },
      })

      await expect(db.createInquiry({ id: 'inquiry-001' } as any)).rejects.toThrow()
    })
  })

  describe('db.createSampleRequest', () => {
    it('should create a new sample request', async () => {
      const sampleData = {
        id: 'sample-001',
        customer_name: 'Test Customer',
        product_id: 'prod-001',
      }

      mockClient.single.mockResolvedValue({ data: sampleData, error: null })

      const result = await db.createSampleRequest(sampleData as any)

      expect(result).toEqual(sampleData)
      expect(mockClient.from).toHaveBeenCalledWith('sample_requests')
    })

    it('should throw error on database error', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Database error' },
      })

      await expect(db.createSampleRequest({ id: 'sample-001' } as any)).rejects.toThrow()
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

      expect(result).toBeDefined()
    })

    it('should throw error when credentials are missing', async () => {
      // This test verifies error handling, but we need to preserve env for other tests
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      try {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const mockCookieStore = {
          get: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
        }

        await expect(
          createSupabaseWithCookies(mockCookieStore as any)
        ).rejects.toThrow('Supabase credentials not configured')
      } finally {
        // Restore env vars
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
      }
    })
  })
})

/**
 * Dashboard Library Unit Tests
 *
 * 会員ダッシュボードユニットテスト
 */

// Set environment variables BEFORE importing the module
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'

// IMPORTANT: Use var (not const) so these are hoisted and available in jest.mock factory
// jest.mock() is hoisted to the top, so factory runs before const declarations would be evaluated
const mockAuthGetUser = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockEq = jest.fn()
const mockIn = jest.fn()
const mockSingle = jest.fn()
const mockRange = jest.fn()
const mockLimit = jest.fn()
const mockOrder = jest.fn()
const mockGte = jest.fn()
const mockLte = jest.fn()
const mockIlike = jest.fn()
const mockNeq = jest.fn()

// Variables to hold mock return values for terminal methods (single, range)
let mockSingleValue: any = { data: null, error: null }
let mockRangeValue: any = { data: [], error: null, count: 0 }

// Mock the @/lib/supabase module - create client inline to ensure it's captured at hoist time
jest.mock('@/lib/supabase', () => {
  // Create the inline mock client
  const client: any = {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    in: mockIn,
    single: mockSingle,
    range: mockRange,
    limit: mockLimit,
    order: mockOrder,
    gte: mockGte,
    lte: mockLte,
    ilike: mockIlike,
    neq: mockNeq,
    auth: {
      getUser: mockAuthGetUser,
    },
    // Make client thenable so it can be awaited directly (for queries like `await query`)
    then: function(resolve: any, reject: any) {
      // When awaited, resolve with the range value (most common use case)
      resolve(mockRangeValue)
    },
  }

  // Make all query methods chainable by returning the client
  // Note: mockSingle and mockRange are NOT in this array - they are terminal methods
  const chainableMethods = [
    mockFrom, mockSelect, mockInsert, mockUpdate,
    mockDelete, mockEq, mockIn, mockOrder,
    mockGte, mockLte, mockIlike, mockNeq, mockLimit
  ]

  chainableMethods.forEach(fn => {
    fn.mockReturnValue(client)
  })

  // Terminal methods (single, range) return promises with their values
  // These use mockImplementation to read from the current value of the variables
  mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))
  mockRange.mockImplementation(() => Promise.resolve(mockRangeValue))

  return {
    supabase: client,
    createSupabaseWithCookies: jest.fn(() => client),
    createClient: jest.fn(() => client),
    createServiceClient: jest.fn(() => client),
    createSupabaseClient: jest.fn(() => client),
    isSupabaseConfigured: jest.fn(() => true),
  }
})

// Mock next/headers for server-side cookie access
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'test-mock-user-id' })),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

// ============================================================
// Test Setup
// ============================================================

const originalEnv = process.env

// Helper to get fresh dashboard module (isolated from cache)
async function getDashboardModule() {
  jest.resetModules()
  const dashboard = await import('../dashboard')
  return dashboard
}

describe('Dashboard Library', () => {
  let dashboard: any

  beforeEach(async () => {
    jest.clearAllMocks()

    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    // Default authenticated user
    mockAuthGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-001',
          email: 'test@example.com',
          user_metadata: {
            kanji_last_name: 'テスト',
            kanji_first_name: 'ユーザー',
          },
        },
      },
    })

    // Reset terminal mock values to defaults
    mockSingleValue = { data: null, error: null }
    mockRangeValue = { data: [], error: null, count: 0 }

    // Get fresh module with mocks applied
    dashboard = await getDashboardModule()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // ============================================================
  // AuthRequiredError Tests
  // ============================================================

  describe('AuthRequiredError', () => {
    it('should create an error with correct name and message', () => {
      const error = new dashboard.AuthRequiredError()

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('AuthRequiredError')
      expect(error.message).toBe('Authentication required')
    })
  })

  // ============================================================
  // Auth Functions Tests
  // ============================================================

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-001',
            email: 'user@example.com',
            user_metadata: {
              kanji_last_name: '山田',
              kanji_first_name: '太郎',
            },
          },
        },
      })

      const result = await dashboard.getCurrentUser()

      expect(result).toEqual({
        id: 'user-001',
        email: 'user@example.com',
        user_metadata: {
          kanji_last_name: '山田',
          kanji_first_name: '太郎',
        },
      })
    })

    it('should return null when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await dashboard.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-001',
            email: 'user@example.com',
          },
        },
      })

      const result = await dashboard.requireAuth()

      expect(result).toEqual({
        id: 'user-001',
        email: 'user@example.com',
      })
    })

    it('should throw AuthRequiredError when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      await expect(dashboard.requireAuth()).rejects.toThrow(dashboard.AuthRequiredError)
      await expect(dashboard.requireAuth()).rejects.toThrow('Authentication required')
    })
  })

  describe('getCurrentUserId', () => {
    it('should return user ID when authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-001',
          },
        },
      })

      const result = await dashboard.getCurrentUserId()

      expect(result).toBe('user-001')
    })

    it('should return null when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await dashboard.getCurrentUserId()

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // Order Functions Tests
  // ============================================================

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockOrders = [
        { id: 'order-001', order_number: 'ORD-001', user_id: 'user-001' },
        { id: 'order-002', order_number: 'ORD-002', user_id: 'user-001' },
      ]

      mockRange.mockResolvedValue({
        data: mockOrders,
        error: null,
        count: 2,
      })

      const result = await dashboard.getOrders({}, { page: 1, limit: 10 })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it('should throw error when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      await expect(dashboard.getOrders()).rejects.toThrow('Not authenticated')
    })
  })

  describe('getOrderById', () => {
    it('should return order by ID', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockOrder = {
        id: 'order-001',
        order_number: 'ORD-001',
        user_id: 'user-001',
      }

      mockSingle.mockResolvedValue({
        data: mockOrder,
        error: null,
      })

      const result = await dashboard.getOrderById('order-001')

      expect(result).toEqual(mockOrder)
    })

    it('should return null when order not found', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const result = await dashboard.getOrderById('order-001')

      expect(result).toBeNull()
    })

    it('should throw error when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      await expect(dashboard.getOrderById('order-001')).rejects.toThrow('Not authenticated')
    })
  })

  describe('getOrderStats', () => {
    it('should return order stats by status', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockOrders = [
        { status: 'pending' },
        { status: 'PENDING' },
        { status: 'PRODUCTION' },
      ]

      // Set mock value for await query (uses then() which returns mockRangeValue)
      mockRangeValue = {
        data: mockOrders,
        error: null,
        count: 3,
      }

      const result = await dashboard.getOrderStats()

      expect(result.PENDING).toBe(2)
      expect(result.PRODUCTION).toBe(1)
      expect(result.SHIPPED).toBe(0)
    })

    it('should throw error when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      await expect(dashboard.getOrderStats()).rejects.toThrow('Not authenticated')
    })
  })

  // ============================================================
  // Delivery Address Functions Tests
  // ============================================================

  describe('getDeliveryAddresses', () => {
    it('should return delivery addresses', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockAddresses = [
        { id: 'addr-001', name: 'Office', user_id: 'user-001' },
        { id: 'addr-002', name: 'Home', user_id: 'user-001' },
      ]

      // Set mock value for await query (uses then() which returns mockRangeValue)
      mockRangeValue = {
        data: mockAddresses,
        error: null,
        count: 2,
      }

      const result = await dashboard.getDeliveryAddresses()

      expect(result).toHaveLength(2)
    })

    it('should throw error when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      await expect(dashboard.getDeliveryAddresses()).rejects.toThrow('Not authenticated')
    })
  })

  describe('createDeliveryAddress', () => {
    it('should create delivery address', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const newAddress = {
        id: 'addr-001',
        name: 'Office',
        postal_code: '100-0001',
        prefecture: 'Tokyo',
        city: 'Chiyoda-ku',
        address: '1-1-1',
        is_default: false,
      }

      mockSingleValue = {
        data: newAddress,
        error: null,
      }

      const result = await dashboard.createDeliveryAddress({
        name: 'Office',
        postalCode: '100-0001',
        prefecture: 'Tokyo',
        city: 'Chiyoda-ku',
        address: '1-1-1',
        isDefault: false,
      } as any)

      expect(result).toEqual(newAddress)
    })

    it('should unset other defaults when setting new default', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      mockSingleValue = {
        data: { id: 'addr-001' },
        error: null,
      }

      await dashboard.createDeliveryAddress({
        name: 'Office',
        postalCode: '100-0001',
        prefecture: 'Tokyo',
        city: 'Chiyoda-ku',
        address: '1-1-1',
        isDefault: true,
      } as any)

      // Should call update to unset other defaults
      expect(mockUpdate).toHaveBeenCalledWith({
        is_default: false,
      })
    })
  })

  describe('updateDeliveryAddress', () => {
    it('should update delivery address', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const updatedAddress = {
        id: 'addr-001',
        name: 'Office Updated',
      }

      mockSingleValue = {
        data: updatedAddress,
        error: null,
      }

      const result = await dashboard.updateDeliveryAddress('addr-001', {
        name: 'Office Updated',
      } as any)

      expect(result).toEqual(updatedAddress)
    })
  })

  describe('deleteDeliveryAddress', () => {
    it('should delete delivery address', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      mockSingleValue = {
        error: null,
      }

      await dashboard.deleteDeliveryAddress('addr-001')

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'addr-001')
    })
  })

  // ============================================================
  // Billing Address Functions Tests
  // ============================================================

  describe('getBillingAddresses', () => {
    it('should return billing addresses', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockAddresses = [
        { id: 'bill-001', company_name: 'Company Inc', user_id: 'user-001' },
      ]

      // Set mock value for await query (uses then() which returns mockRangeValue)
      mockRangeValue = {
        data: mockAddresses,
        error: null,
        count: 1,
      }

      const result = await dashboard.getBillingAddresses()

      expect(result).toHaveLength(1)
    })

    it('should throw error when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      await expect(dashboard.getBillingAddresses()).rejects.toThrow('Not authenticated')
    })
  })

  describe('createBillingAddress', () => {
    it('should create billing address', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const newAddress = {
        id: 'bill-001',
        company_name: 'Company Inc',
        postal_code: '100-0001',
        is_default: false,
      }

      mockSingleValue = {
        data: newAddress,
        error: null,
      }

      const result = await dashboard.createBillingAddress({
        companyName: 'Company Inc',
        postalCode: '100-0001',
        isDefault: false,
      } as any)

      expect(result).toEqual(newAddress)
    })
  })

  // ============================================================
  // Quotation Functions Tests
  // ============================================================

  describe('getQuotations', () => {
    it('should return quotations', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockQuotations = [
        { id: 'quote-001', quote_number: 'QT-001', user_id: 'user-001' },
      ]

      // Set mock value for await query (uses then() which returns mockRangeValue)
      mockRangeValue = {
        data: mockQuotations,
        error: null,
        count: 1,
      }

      const result = await dashboard.getQuotations()

      expect(result).toHaveLength(1)
    })

    it('should filter quotations by status', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      mockRangeValue = {
        data: [],
        error: null,
        count: 0,
      }

      await dashboard.getQuotations('draft')

      expect(mockEq).toHaveBeenCalledWith('status', 'draft')
    })
  })

  describe('getQuotationById', () => {
    it('should return quotation by ID', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockQuotation = {
        id: 'quote-001',
        quote_number: 'QT-001',
        user_id: 'user-001',
      }

      mockSingleValue = {
        data: mockQuotation,
        error: null,
      }

      const result = await dashboard.getQuotationById('quote-001')

      expect(result).toEqual(mockQuotation)
    })

    it('should return null when quotation not found', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      mockSingleValue = {
        data: null,
        error: { code: 'PGRST116' },
      }

      const result = await dashboard.getQuotationById('quote-001')

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // Sample Request Functions Tests
  // ============================================================

  describe('getSampleRequests', () => {
    it('should return sample requests', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockSamples = [
        { id: 'sample-001', status: 'pending', user_id: 'user-001' },
      ]

      // Set mock value for await query (uses then() which returns mockRangeValue)
      mockRangeValue = {
        data: mockSamples,
        error: null,
        count: 1,
      }

      const result = await dashboard.getSampleRequests()

      expect(result).toHaveLength(1)
    })
  })

  // ============================================================
  // Inquiry Functions Tests
  // ============================================================

  describe('getInquiries', () => {
    it('should return inquiries', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      const mockInquiries = [
        { id: 'inquiry-001', type: 'general', status: 'pending', user_id: 'user-001' },
      ]

      // Set mock value for await query (uses then() which returns mockRangeValue)
      mockRangeValue = {
        data: mockInquiries,
        error: null,
        count: 1,
      }

      const result = await dashboard.getInquiries()

      expect(result).toHaveLength(1)
    })

    it('should filter by status and type', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      mockRangeValue = {
        data: [],
        error: null,
        count: 0,
      }

      await dashboard.getInquiries('pending', 'product')

      expect(mockEq).toHaveBeenCalledWith('status', 'pending')
      expect(mockEq).toHaveBeenCalledWith('type', 'product')
    })
  })

  // ============================================================
  // Announcement Functions Tests
  // ============================================================

  describe('getAnnouncements', () => {
    it('should return announcements', async () => {
      const mockAnnouncements = [
        { id: 'announce-001', title: 'News', is_published: true },
      ]

      mockRangeValue = {
        data: mockAnnouncements,
        error: null,
      }

      const result = await dashboard.getAnnouncements(5)

      expect(result).toHaveLength(1)
    })

    it('should return empty array on error', async () => {
      mockRangeValue = {
        data: null,
        error: { message: 'Error' },
      }

      const result = await dashboard.getAnnouncements()

      expect(result).toEqual([])
    })
  })

  // ============================================================
  // Dashboard Stats Tests
  // ============================================================

  describe('getDashboardStats', () => {
    it('should return dashboard stats', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      // Mock various queries
      mockSingle.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await dashboard.getDashboardStats()

      expect(result).toHaveProperty('orders')
      expect(result).toHaveProperty('quotations')
      expect(result).toHaveProperty('samples')
      expect(result).toHaveProperty('inquiries')
    })

    it('should return empty stats when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await dashboard.getDashboardStats()

      expect(result).toEqual({
        orders: { new: [], processing: [], total: 0 },
        quotations: { pending: [], total: 0 },
        samples: { pending: [], total: 0 },
        inquiries: { unread: [], total: 0 },
        announcements: [],
      })
    })
  })

  describe('getNotificationBadge', () => {
    it('should return notification badge counts', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: { id: 'user-001' } },
      })

      // Mock count queries
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await dashboard.getNotificationBadge()

      expect(result).toHaveProperty('quotations')
      expect(result).toHaveProperty('samples')
      expect(result).toHaveProperty('inquiries')
      expect(result).toHaveProperty('orders')
      expect(result).toHaveProperty('total')
    })

    it('should return zero counts when not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await dashboard.getNotificationBadge()

      expect(result).toEqual({
        quotations: 0,
        samples: 0,
        inquiries: 0,
        orders: 0,
        total: 0,
      })
    })
  })
})

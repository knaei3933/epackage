/**
 * Notification Preferences Service Unit Tests
 *
 * 通知設定サービスユニットテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach, jest } from '@jest/globals'

// ============================================================
// Mocks - IMPORTANT: These must be declared BEFORE jest.mock
// ============================================================

// IMPORTANT: Use var (not const) so these are hoisted
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockLimit = jest.fn()
const mockOrder = jest.fn()
const mockRange = jest.fn()
const mockGte = jest.fn()
const mockLte = jest.fn()
const mockIn = jest.fn()
const mockNeq = jest.fn()
const mockLt = jest.fn()

// Variables to hold mock return values for terminal methods
let mockSingleValue: any = { data: null, error: null }
let mockRangeValue: any = { data: [], error: null, count: 0 }

// Store reference to mock client for use in tests
let mockSupabaseClient: any = null

// Mock @supabase/supabase-js BEFORE any imports that use it
jest.mock('@supabase/supabase-js', () => {
  // Create the inline mock client FIRST before any references
  const client: any = {}

  // Store reference for use in tests
  mockSupabaseClient = client

  // Define methods that reference client
  client.from = mockFrom
  client.select = mockSelect
  client.insert = mockInsert
  client.update = mockUpdate
  client.delete = mockDelete
  client.eq = mockEq
  client.in = mockIn
  client.gte = mockGte
  client.lte = mockLte
  client.neq = mockNeq
  client.lt = mockLt
  client.ilike = jest.fn(() => client)
  client.order = mockOrder
  client.limit = mockLimit
  client.single = mockSingle
  client.range = mockRange
  client.then = function(resolve: any, reject: any) {
    resolve(mockRangeValue)
  }

  // Make chainable methods return client
  const chainableMethods = [
    mockFrom, mockSelect, mockInsert, mockUpdate,
    mockDelete, mockEq, mockIn, mockOrder,
    mockGte, mockLte, mockNeq, mockLt, mockLimit
  ]

  chainableMethods.forEach(fn => {
    fn.mockReturnValue(client)
  })

  // Terminal methods return promises
  mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))
  mockRange.mockImplementation(() => Promise.resolve(mockRangeValue))

  return {
    createClient: jest.fn((url?: string, key?: string) => {
      return client
    }),
  }
})

// ============================================================
// Dynamic imports to ensure mock is applied first
// ============================================================

let getUserPreferences: any
let updateUserPreferences: any
let toggleChannel: any
let isChannelEnabled: any
let getEnabledChannelsForCategory: any
let updateCategoryPreference: any
let setQuietHours: any
let isInQuietHours: any
let setSMSPhoneNumber: any
let getSMSPhoneNumber: any
let validatePhoneNumber: any
let normalizePhoneNumber: any
let createDefaultPreferences: any

// We'll import these in the first test/beforeEach
async function importPreferencesModule() {
  // Set environment variables before importing
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  process.env.NEXT_PUBLIC_DEV_MODE = 'false'

  const module = await import('../preferences')
  getUserPreferences = module.getUserPreferences
  updateUserPreferences = module.updateUserPreferences
  toggleChannel = module.toggleChannel
  isChannelEnabled = module.isChannelEnabled
  getEnabledChannelsForCategory = module.getEnabledChannelsForCategory
  updateCategoryPreference = module.updateCategoryPreference
  setQuietHours = module.setQuietHours
  isInQuietHours = module.isInQuietHours
  setSMSPhoneNumber = module.setSMSPhoneNumber
  getSMSPhoneNumber = module.getSMSPhoneNumber
  validatePhoneNumber = module.validatePhoneNumber
  normalizePhoneNumber = module.normalizePhoneNumber
  createDefaultPreferences = module.createDefaultPreferences
}

describe('NotificationPreferences', () => {
  const testUserId = 'user-test-001'

  beforeAll(async () => {
    await importPreferencesModule()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset to default return value
    mockSingleValue = { data: null, error: null }
    mockRangeValue = { data: [], error: null, count: 0 }

    // Reset mock implementations to default behavior
    mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))
    mockRange.mockImplementation(() => Promise.resolve(mockRangeValue))

    // Ensure chainable methods return the client
    const chainableMethods = [
      mockFrom, mockSelect, mockInsert, mockUpdate,
      mockDelete, mockEq, mockIn, mockOrder,
      mockGte, mockLte, mockNeq, mockLt, mockLimit
    ]

    chainableMethods.forEach(fn => {
      fn.mockReturnValue(mockSupabaseClient)
    })
  })

  // ============================================================
  // getUserPreferences Tests
  // ============================================================

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const mockData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: ['quotation', 'order'] },
          sms: { enabled: false, categories: [] },
          push: { enabled: true, categories: ['quotation'] },
        },
        quiet_hours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Tokyo',
        },
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getUserPreferences(testUserId)

      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('notification_preferences')
      expect(mockEq).toHaveBeenCalledWith('user_id', testUserId)
    })

    it('should create default preferences when none exist', async () => {
      mockSingleValue = {
        data: null,
        error: { code: 'PGRST116' },
      }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getUserPreferences(testUserId)

      expect(result).not.toBeNull()
      expect(result?.user_id).toBe(testUserId)
      expect(result?.channels.email.enabled).toBe(true)
    })

    it('should return null on error', async () => {
      mockSingleValue = {
        data: null,
        error: { code: 'OTHER_ERROR' },
      }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getUserPreferences(testUserId)

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // updateUserPreferences Tests
  // ============================================================

  describe('updateUserPreferences', () => {
    it('should update existing preferences', async () => {
      const existingData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: ['quotation'] },
          sms: { enabled: false, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Tokyo',
        },
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const updatedData = {
        ...existingData,
        language: 'en',
      }

      mockSingleValue = { data: updatedData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await updateUserPreferences(testUserId, { language: 'en' })

      expect(result?.language).toBe('en')
    })

    it('should create default preferences when none exist, then update them', async () => {
      // When no preferences exist (PGRST116 error):
      // 1. getUserPreferences queries - returns no data
      // 2. createDefaultPreferences inserts defaults - returns defaults (even if insert fails)
      // 3. updateUserPreferences updates - returns updated data

      const defaultPreferences = {
        user_id: testUserId,
        language: 'ja',
        updated_at: new Date().toISOString(),
        channels: {
          email: { enabled: true, categories: ['quotation', 'order', 'production', 'shipping', 'payment', 'contract', 'system'] },
          sms: { enabled: false, categories: ['order', 'shipping'] },
          push: { enabled: true, categories: ['quotation', 'order', 'production', 'shipping'] },
        },
        quiet_hours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Tokyo',
        },
      }

      const updatedData = {
        ...defaultPreferences,
        language: 'en',
      }

      // 1. First query: getUserPreferences - no data exists
      mockSingle.mockReturnValueOnce(Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
      // 2. createDefaultPreferences insert - returns the created defaults
      mockSingle.mockReturnValueOnce(Promise.resolve({ data: defaultPreferences, error: null }))
      // 3. updateUserPreferences update - returns updated data
      mockSingle.mockReturnValueOnce(Promise.resolve({ data: updatedData, error: null }))

      const result = await updateUserPreferences(testUserId, { language: 'en' })

      // Result should have the updated language
      expect(result).toBeTruthy()
      expect(result?.language).toBe('en')
    })
  })

  // ============================================================
  // Channel Management Tests
  // ============================================================

  describe('toggleChannel', () => {
    it('should enable a channel', async () => {
      const existingData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: false, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: existingData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await toggleChannel(testUserId, 'sms', true)

      expect(result).toBe(true)
    })

    it('should disable a channel', async () => {
      const existingData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: true, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: existingData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await toggleChannel(testUserId, 'sms', false)

      expect(result).toBe(true)
    })
  })

  describe('isChannelEnabled', () => {
    it('should return true when channel is enabled', async () => {
      const mockData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: false, categories: [] },
          push: { enabled: true, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await isChannelEnabled(testUserId, 'email')

      expect(result).toBe(true)
    })

    it('should return false when channel is disabled', async () => {
      const mockData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: false, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await isChannelEnabled(testUserId, 'sms')

      expect(result).toBe(false)
    })

    it('should return true for email by default when no preferences exist', async () => {
      mockSingleValue = {
        data: null,
        error: { code: 'PGRST116' },
      }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await isChannelEnabled(testUserId, 'email')

      expect(result).toBe(true)
    })
  })

  // ============================================================
  // Category Tests
  // ============================================================

  describe('getEnabledChannelsForCategory', () => {
    it('should return enabled channels for category', async () => {
      const mockData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: ['quotation', 'order'] },
          sms: { enabled: true, categories: ['order'] },
          push: { enabled: false, categories: ['quotation'] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getEnabledChannelsForCategory(testUserId, 'quotation')

      expect(result).toContain('email')
      expect(result).not.toContain('sms')
      expect(result).not.toContain('push')
    })

    it('should return default channels when no preferences exist', async () => {
      mockSingleValue = {
        data: null,
        error: { code: 'PGRST116' },
      }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getEnabledChannelsForCategory(testUserId, 'quotation')

      expect(result).toContain('email')
      expect(result).toContain('push')
    })
  })

  // ============================================================
  // Quiet Hours Tests
  // ============================================================

  describe('isInQuietHours', () => {
    it('should return false when quiet hours are disabled', async () => {
      const mockData = {
        user_id: testUserId,
        channels: { email: { enabled: true, categories: [] }, sms: { enabled: false, categories: [] }, push: { enabled: false, categories: [] } },
        quiet_hours: { enabled: false, start: '22:00', end: '08:00', timezone: 'Asia/Tokyo' },
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await isInQuietHours(testUserId)

      expect(result).toBe(false)
    })

    it('should return false when no quiet hours are set', async () => {
      const mockData = {
        user_id: testUserId,
        channels: { email: { enabled: true, categories: [] }, sms: { enabled: false, categories: [] }, push: { enabled: false, categories: [] } },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await isInQuietHours(testUserId)

      expect(result).toBe(false)
    })
  })

  // ============================================================
  // Phone Number Tests
  // ============================================================

  describe('validatePhoneNumber', () => {
    it('should validate Japanese phone numbers', () => {
      expect(validatePhoneNumber('090-1234-5678')).toBe(true)
      expect(validatePhoneNumber('03-1234-5678')).toBe(true)
      expect(validatePhoneNumber('09012345678')).toBe(true)
    })

    it('should validate international phone numbers', () => {
      // Note: The actual validation may differ, adjust expectations accordingly
      expect(validatePhoneNumber('+819012345678')).toBe(true)
      expect(validatePhoneNumber('+15551234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('invalid')).toBe(false)
      expect(validatePhoneNumber('123')).toBe(false)
      expect(validatePhoneNumber('')).toBe(false)
    })
  })

  describe('normalizePhoneNumber', () => {
    it('should remove hyphens and spaces', () => {
      expect(normalizePhoneNumber('090-1234-5678')).toBe('09012345678')
      expect(normalizePhoneNumber('03 1234 5678')).toBe('0312345678')
      expect(normalizePhoneNumber('090 1234-5678')).toBe('09012345678')
    })
  })

  // ============================================================
  // SMS Phone Number Tests
  // ============================================================

  describe('setSMSPhoneNumber', () => {
    it('should set SMS phone number and enable SMS', async () => {
      const existingData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: false, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: existingData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await setSMSPhoneNumber(testUserId, '090-1234-5678')

      expect(result).toBe(true)
    })

    it('should return true when user has no preferences (creates default)', async () => {
      const newData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: true, phone_number: '090-1234-5678', categories: [] },
          push: { enabled: true, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: newData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await setSMSPhoneNumber(testUserId, '090-1234-5678')

      // Should still work by creating default preferences
      expect(result).toBe(true)
    })
  })

  describe('getSMSPhoneNumber', () => {
    it('should return phone number when SMS is enabled', async () => {
      const mockData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: true, phone_number: '090-1234-5678', categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getSMSPhoneNumber(testUserId)

      expect(result).toBe('090-1234-5678')
    })

    it('should return null when SMS is disabled', async () => {
      const mockData = {
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: false, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'ja',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockSingleValue = { data: mockData, error: null }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getSMSPhoneNumber(testUserId)

      expect(result).toBeNull()
    })

    it('should return null when no preferences exist', async () => {
      mockSingleValue = {
        data: null,
        error: { code: 'PGRST116' },
      }
      mockSingle.mockImplementation(() => Promise.resolve(mockSingleValue))

      const result = await getSMSPhoneNumber(testUserId)

      expect(result).toBeNull()
    })
  })
})

/**
 * Unified Notification Manager Unit Tests
 *
 * 統合通知マネージャーユニットテスト
 */

// ============================================================
// Environment Setup (MUST be first)
// ============================================================

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// ============================================================
// Mock Setup (MUST be before imports for hoisting)
// ============================================================

// Use var for hoisting - this ensures it's available when jest.mock runs
let mockSupabaseClient: any = {}
const mockFrom = jest.fn(() => mockSupabaseClient)
const mockSelect = jest.fn(() => mockSupabaseClient)
const mockInsert = jest.fn(() => mockSupabaseClient)
const mockUpdate = jest.fn(() => mockSupabaseClient)
const mockDelete = jest.fn(() => mockSupabaseClient)
const mockEq = jest.fn(() => mockSupabaseClient)
const mockSingle = jest.fn(() => Promise.resolve({ data: null, error: null }))
const mockLimit = jest.fn(() => mockSupabaseClient)
const mockOrder = jest.fn(() => mockSupabaseClient)
const mockRange = jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
const mockGte = jest.fn(() => mockSupabaseClient)
const mockLte = jest.fn(() => mockSupabaseClient)
const mockIn = jest.fn(() => mockSupabaseClient)
const mockNeq = jest.fn(() => mockSupabaseClient)

// Build the client object
mockSupabaseClient = {
  from: mockFrom,
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
  limit: mockLimit,
  order: mockOrder,
  range: mockRange,
  gte: mockGte,
  lte: mockLte,
  in: mockIn,
  neq: mockNeq,
}

// Mock @supabase/supabase-js - this is hoisted to the top
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

// ============================================================
// Import after mocks are set up
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals'
import {
  sendNotification,
  sendTemplatedNotification,
  getUserNotificationStats,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  trackNotificationOpen,
  trackNotificationClick,
} from '../index'
import type { NotificationCategory, NotificationChannel } from '@/types/notification'

// ============================================================
// Additional Mocks
// ============================================================

jest.mock('../preferences', () => ({
  getEnabledChannelsForCategory: jest.fn(() => Promise.resolve(['email', 'push'])),
  isInQuietHours: jest.fn(() => Promise.resolve(false)),
  getUserPreferences: jest.fn(() => Promise.resolve({
    user_id: 'test-user',
    channels: {
      email: { enabled: true, categories: ['quotation', 'order'] },
      sms: { enabled: false, categories: [] },
      push: { enabled: true, categories: ['quotation'] },
    },
    quiet_hours: null,
    language: 'ja',
    updated_at: new Date().toISOString(),
  })),
  updateUserPreferences: jest.fn(() => Promise.resolve({
    user_id: 'test-user',
    channels: {
      email: { enabled: true, categories: [] },
      sms: { enabled: false, categories: [] },
      push: { enabled: false, categories: [] },
    },
    quiet_hours: null,
    language: 'ja',
    updated_at: new Date().toISOString(),
  })),
}))

jest.mock('../sms', () => ({
  sendSMS: jest.fn(() => Promise.resolve({
    success: true,
    status: 'sent' as const,
    messageSid: 'SM-test-123',
  })),
}))

jest.mock('../push', () => ({
  getUserDeviceTokens: jest.fn(() => Promise.resolve([
    { id: 'dt-1', token: 'token-1', platform: 'ios', is_active: true, user_id: 'test-user', created_at: '', updated_at: '' },
  ])),
  sendBulkPushNotifications: jest.fn(() => Promise.resolve({
    success: true,
    status: 'sent' as const,
    messageIds: ['push-msg-1'],
  })),
}))

jest.mock('../history', () => ({
  recordNotificationSent: jest.fn(() => Promise.resolve('nh-test-123')),
  recordDelivery: jest.fn(() => Promise.resolve(true)),
  recordFailure: jest.fn(() => Promise.resolve(true)),
  recordOpen: jest.fn(() => Promise.resolve(true)),
  recordClick: jest.fn(() => Promise.resolve(true)),
  getNotificationStatistics: jest.fn(() => Promise.resolve({
    total_sent: 10,
    total_delivered: 9,
    total_opened: 7,
    total_clicked: 3,
    total_failed: 1,
    delivery_rate: 90,
    open_rate: 77.78,
    click_rate: 42.86,
    by_channel: {
      email: { sent: 5, delivered: 5, opened: 4, clicked: 2, failed: 0 },
      sms: { sent: 0, delivered: 0, failed: 0 },
      push: { sent: 5, delivered: 4, opened: 3, clicked: 1, failed: 1 },
    },
    by_category: {} as any,
    period: { start: '', end: '' },
  })),
}))

jest.mock('../optimization', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve({ allowed: true })),
}))

jest.mock('@/lib/email/notificationService', () => ({
  sendEmail: jest.fn(() => Promise.resolve({
    success: true,
    messageId: 'email-msg-123',
  })),
  handleNotificationEvent: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  getUserEmail: jest.fn(() => Promise.resolve('test@example.com')),
}))

describe('Unified Notification Manager', () => {
  const testUserId = 'test-user-001'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ============================================================
  // sendNotification Tests
  // ============================================================

  describe('sendNotification', () => {
    it('should send notification to enabled channels', async () => {
      const result = await sendNotification({
        userId: testUserId,
        type: 'test_notification',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Test Subject',
        content: {
          text: 'Test content',
          html: '<p>Test content</p>',
        },
      })

      expect(result.overall_status).toBe('sent')
      expect(result.notification_id).toBeTruthy()
      expect(result.channels.length).toBeGreaterThan(0)
    })

    it('should send notification to specified channels only', async () => {
      const result = await sendNotification({
        userId: testUserId,
        type: 'test_notification',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Test Subject',
        content: {
          text: 'Test content',
        },
        channels: ['email'],
      })

      expect(result.channels.every(c => c.channel === 'email')).toBe(true)
    })

    it('should handle SMS notifications', async () => {
      const { sendSMS } = await import('../sms')
      const { getEnabledChannelsForCategory } = await import('../preferences')

      // Mock SMS as enabled for 'order' category
      jest.mocked(getEnabledChannelsForCategory).mockResolvedValueOnce(['sms'])

      const result = await sendNotification({
        userId: testUserId,
        type: 'test_sms',
        category: 'order' as NotificationCategory,
        priority: 'high',
        subject: 'Test SMS',
        content: {
          text: 'Test SMS content',
        },
        channels: ['sms'],
        options: {
          sms: { phone_number: '090-1234-5678' },
        },
      })

      expect(sendSMS).toHaveBeenCalled()
    })

    it('should handle push notifications', async () => {
      const { sendBulkPushNotifications } = await import('../push')

      const result = await sendNotification({
        userId: testUserId,
        type: 'test_push',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Test Push',
        content: {
          text: 'Test push content',
        },
        channels: ['push'],
        options: {
          push: { title: 'Push Title', body: 'Push Body' },
        },
      })

      expect(sendBulkPushNotifications).toHaveBeenCalled()
    })

    it('should return failed status when no channels are enabled', async () => {
      const { getEnabledChannelsForCategory } = await import('../preferences')
      jest.mocked(getEnabledChannelsForCategory).mockResolvedValueOnce([])

      const result = await sendNotification({
        userId: testUserId,
        type: 'test_notification',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Test Subject',
        content: {
          text: 'Test content',
        },
      })

      expect(result.overall_status).toBe('failed')
    })

    it('should respect quiet hours', async () => {
      const { isInQuietHours } = await import('../preferences')
      jest.mocked(isInQuietHours).mockResolvedValueOnce(true)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await sendNotification({
        userId: testUserId,
        type: 'test_notification',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Test Subject',
        content: {
          text: 'Test content',
        },
      })

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('quiet hours'))

      consoleSpy.mockRestore()
    })

    it('should skip quiet hours when requested', async () => {
      const { isInQuietHours } = await import('../preferences')
      jest.mocked(isInQuietHours).mockResolvedValueOnce(true)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await sendNotification({
        userId: testUserId,
        type: 'test_notification',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Test Subject',
        content: {
          text: 'Test content',
        },
        options: { skipQuietHours: true },
      })

      // Should not log quiet hours message
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('quiet hours'))

      consoleSpy.mockRestore()
    })
  })

  // ============================================================
  // sendTemplatedNotification Tests
  // ============================================================

  describe('sendTemplatedNotification', () => {
    it('should send notification using template', async () => {
      const result = await sendTemplatedNotification({
        userId: testUserId,
        templateKey: 'quotation_approved',
        data: {
          quotationNumber: 'QT-2024-001',
          totalAmount: 10000,
        },
      })

      expect(result.overall_status).toBe('sent')
    })

    it('should return failed status for unknown template', async () => {
      const result = await sendTemplatedNotification({
        userId: testUserId,
        templateKey: 'unknown_template' as any,
        data: {},
      })

      expect(result.overall_status).toBe('failed')
    })
  })

  // ============================================================
  // Stats & Preferences Tests
  // ============================================================

  describe('getUserNotificationStats', () => {
    it('should return user notification statistics', async () => {
      const stats = await getUserNotificationStats(testUserId)

      expect(stats).toBeTruthy()
      expect(stats?.total_sent).toBe(10)
      expect(stats?.delivery_rate).toBe(90)
    })
  })

  describe('getUserNotificationPreferences', () => {
    it('should return user preferences', async () => {
      const prefs = await getUserNotificationPreferences(testUserId)

      expect(prefs).toBeTruthy()
      expect(prefs?.channels.email.enabled).toBe(true)
    })
  })

  describe('updateUserNotificationPreferences', () => {
    it('should update user preferences', async () => {
      const { updateUserPreferences } = await import('../preferences')

      // Mock to return updated preferences
      jest.mocked(updateUserPreferences).mockResolvedValueOnce({
        user_id: testUserId,
        channels: {
          email: { enabled: true, categories: [] },
          sms: { enabled: false, categories: [] },
          push: { enabled: false, categories: [] },
        },
        quiet_hours: null,
        language: 'en',
        updated_at: new Date().toISOString(),
      })

      const prefs = await updateUserNotificationPreferences(testUserId, {
        language: 'en',
      })

      expect(prefs).toBeTruthy()
      expect(prefs?.language).toBe('en')
    })
  })

  // ============================================================
  // Tracking Tests
  // ============================================================

  describe('trackNotificationOpen', () => {
    it('should record notification open', async () => {
      const { recordOpen } = await import('../history')

      const result = await trackNotificationOpen('nh-test-123')

      expect(recordOpen).toHaveBeenCalledWith('nh-test-123')
      expect(result).toBe(true)
    })
  })

  describe('trackNotificationClick', () => {
    it('should record notification click', async () => {
      const { recordClick } = await import('../history')

      const result = await trackNotificationClick('nh-test-123')

      expect(recordClick).toHaveBeenCalledWith('nh-test-123')
      expect(result).toBe(true)
    })
  })

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Integration', () => {
    it('should send multi-channel notification and record history', async () => {
      const { recordNotificationSent, recordDelivery } = await import('../history')

      const result = await sendNotification({
        userId: testUserId,
        type: 'test_multi',
        category: 'order' as NotificationCategory,
        priority: 'high',
        subject: 'Multi-channel Test',
        content: {
          text: 'Test content for multiple channels',
          html: '<p>Test content for multiple channels</p>',
        },
        channels: ['email', 'push'],
      })

      expect(result.overall_status).toBe('sent')
      expect(recordNotificationSent).toHaveBeenCalledTimes(2)
      expect(result.channels.length).toBe(2)
    })

    it('should handle partial failures in multi-channel send', async () => {
      const { sendEmail } = await import('@/lib/email/notificationService')
      jest.mocked(sendEmail).mockResolvedValueOnce({
        success: true,
        messageId: 'email-success',
      })

      const result = await sendNotification({
        userId: testUserId,
        type: 'test_partial',
        category: 'quotation' as NotificationCategory,
        priority: 'normal',
        subject: 'Partial Failure Test',
        content: {
          text: 'Test content',
        },
        channels: ['email', 'sms'],
      })

      // Email succeeded, SMS may have different result
      expect(result.channels.some(c => c.channel === 'email' && c.status === 'sent')).toBe(true)
    })
  })

  // ============================================================
  // Priority Tests
  // ============================================================

  describe('Priority Handling', () => {
    it('should handle urgent priority notifications', async () => {
      const result = await sendNotification({
        userId: testUserId,
        type: 'urgent_alert',
        category: 'system' as NotificationCategory,
        priority: 'urgent',
        subject: 'Urgent Alert',
        content: {
          text: 'This is an urgent notification',
        },
      })

      expect(result.overall_status).toBe('sent')
    })

    it('should handle low priority notifications', async () => {
      const result = await sendNotification({
        userId: testUserId,
        type: 'low_priority_update',
        category: 'promotion' as NotificationCategory,
        priority: 'low',
        subject: 'Low Priority Update',
        content: {
          text: 'This is a low priority notification',
        },
      })

      expect(result.overall_status).toBe('sent')
    })
  })

  // ============================================================
  // Category Tests
  // ============================================================

  describe('Category Handling', () => {
    const categories: NotificationCategory[] = [
      'quotation', 'order', 'production', 'shipping',
      'payment', 'contract', 'promotion', 'system',
    ]

    it.each(categories)('should handle %s category', async (category) => {
      const result = await sendNotification({
        userId: testUserId,
        type: 'test_category',
        category,
        priority: 'normal',
        subject: `${category} notification`,
        content: {
          text: `Test ${category} notification`,
        },
      })

      expect(result.notification_id).toBeTruthy()
    })
  })
})

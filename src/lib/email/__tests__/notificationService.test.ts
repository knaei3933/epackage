/**
 * Notification Service Unit Tests
 *
 * 通知サービスユニットテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals'
import {
  sendEmail,
  sendQuoteCreatedAdminEmail,
  sendQuoteApprovedCustomerEmail,
  sendContractSentEmail,
  sendContractSignedAdminEmail,
  sendProductionUpdateEmail,
  sendShippedEmail,
  handleNotificationEvent,
  isBouncedEmail,
  recordBounce,
  handleBounceWebhook,
  isValidEmail,
  supportsJapaneseEmail,
  logDeliveryStatus,
  sendTestEmail,
} from '../notificationService'
import type { NotificationEvent, BounceEvent } from '@/types/email'

// ============================================================
// Mocks
// ============================================================

// SendGridのモック - use var for hoisting
const mockSendGridSend = jest.fn()
const mockSendGridSetApiKey = jest.fn()

jest.mock('@sendgrid/mail', () => {
  const defaultExport = {
    setApiKey: mockSendGridSetApiKey,
    send: mockSendGridSend,
  }
  return {
    __esModule: true,
    default: defaultExport,
  }
})

import SGMail from '@sendgrid/mail'

// 環境変数のモック
const originalEnv = process.env

describe('NotificationService', () => {
  beforeEach(() => {
    // 環境変数をリセット
    process.env = { ...originalEnv }
    process.env.SENDGRID_API_KEY = 'test-api-key'
    process.env.FROM_EMAIL = 'noreply@epackage-lab.com'
    process.env.ADMIN_EMAIL = 'admin@epackage-lab.com'
    process.env.REPLY_TO_EMAIL = 'support@epackage-lab.com'

    // モックをリセット
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // ============================================================
  // sendEmail Tests
  // ============================================================

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSendGridSend.mockResolvedValue([{ headers: { 'x-message-id': 'test-message-id' } }])

      const result = await sendEmail({
        to: { email: 'test@example.com', name: 'Test User', type: 'customer' },
        templateId: 'quote_approved_customer',
        data: {
          quotation_id: 'qt-001',
          quotation_number: 'QT-2024-001',
          customer_name: 'テストユーザー',
          total_amount: 10000,
          valid_until: '2025-12-31',
          confirm_url: 'https://example.com/confirm',
          approved_at: '2024-01-01 00:00:00',
        },
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
      expect(mockSendGridSend).toHaveBeenCalledTimes(1)
    })

    it('should return error when SendGrid is not configured', async () => {
      delete process.env.SENDGRID_API_KEY

      const result = await sendEmail({
        to: { email: 'test@example.com', name: 'Test User', type: 'customer' },
        templateId: 'quote_approved_customer',
        data: {
          quotation_id: 'qt-001',
          quotation_number: 'QT-2024-001',
          customer_name: 'テストユーザー',
          total_amount: 10000,
          valid_until: '2025-12-31',
          confirm_url: 'https://example.com/confirm',
          approved_at: '2024-01-01 00:00:00',
        },
      })

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('CONFIG_ERROR')
    })

    it('should handle multiple recipients', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-message-id' } }])

      const result = await sendEmail({
        to: [
          { email: 'test1@example.com', name: 'Test User 1', type: 'customer' },
          { email: 'test2@example.com', name: 'Test User 2', type: 'admin' },
        ],
        templateId: 'quote_created_admin',
        data: {
          quotation_id: 'qt-001',
          quotation_number: 'QT-2024-001',
          customer_name: 'テストユーザー',
          company_name: 'テスト会社',
          total_amount: 10000,
          valid_until: '2025-12-31',
          view_url: 'https://example.com/view',
          submitted_at: '2024-01-01 00:00:00',
        },
      })

      expect(result.success).toBe(true)
      expect(sendMock).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================
  // Template-Specific Functions Tests
  // ============================================================

  describe('sendQuoteCreatedAdminEmail', () => {
    it('should send quote created email to admin', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendQuoteCreatedAdminEmail({
        quotation_id: 'qt-001',
        quotation_number: 'QT-2024-001',
        customer_name: 'テストユーザー',
        company_name: 'テスト会社',
        total_amount: 10000,
        valid_until: '2025-12-31',
        view_url: 'https://example.com/view',
      })

      expect(result.success).toBe(true)
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [{ email: 'admin@epackage-lab.com', name: 'EPackage Lab 管理者' }],
        })
      )
    })
  })

  describe('sendQuoteApprovedCustomerEmail', () => {
    it('should send quote approved email to customer', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendQuoteApprovedCustomerEmail({
        quotation_id: 'qt-001',
        quotation_number: 'QT-2024-001',
        customer_name: 'テストユーザー',
        customer_email: 'customer@example.com',
        total_amount: 10000,
        valid_until: '2025-12-31',
        confirm_url: 'https://example.com/confirm',
      })

      expect(result.success).toBe(true)
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [{ email: 'customer@example.com', name: 'テストユーザー' }],
        })
      )
    })
  })

  describe('sendContractSentEmail', () => {
    it('should send contract sent email to customer', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendContractSentEmail({
        order_id: 'ord-001',
        order_number: 'ORD-2024-001',
        customer_name: 'テストユーザー',
        customer_email: 'customer@example.com',
        contract_url: 'https://example.com/contract',
        due_date: '2025-01-31',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('sendContractSignedAdminEmail', () => {
    it('should send contract signed email to admin', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendContractSignedAdminEmail({
        order_id: 'ord-001',
        order_number: 'ORD-2024-001',
        customer_name: 'テストユーザー',
        company_name: 'テスト会社',
        contract_url: 'https://example.com/contract',
        view_url: 'https://example.com/view',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('sendProductionUpdateEmail', () => {
    it('should send production update email to customer', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendProductionUpdateEmail({
        order_id: 'ord-001',
        order_number: 'ORD-2024-001',
        customer_name: 'テストユーザー',
        customer_email: 'customer@example.com',
        product_name: '包装袋 A',
        status: 'PRODUCTION',
        status_label: '製造中',
        estimated_completion: '2025-02-28',
        progress_percentage: 45,
        view_url: 'https://example.com/view',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('sendShippedEmail', () => {
    it('should send shipped email to customer with tracking', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendShippedEmail({
        order_id: 'ord-001',
        order_number: 'ORD-2024-001',
        customer_name: 'テストユーザー',
        customer_email: 'customer@example.com',
        product_name: '包装袋 A',
        tracking_number: 'JP123456789',
        carrier: 'ヤマト運輸',
        estimated_delivery: '2025-03-01',
        tracking_url: 'https://example.com/track',
        view_url: 'https://example.com/view',
      })

      expect(result.success).toBe(true)
    })

    it('should send shipped email without tracking info', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendShippedEmail({
        order_id: 'ord-001',
        order_number: 'ORD-2024-001',
        customer_name: 'テストユーザー',
        customer_email: 'customer@example.com',
        product_name: '包装袋 A',
        estimated_delivery: '2025-03-01',
        view_url: 'https://example.com/view',
      })

      expect(result.success).toBe(true)
    })
  })

  // ============================================================
  // Event Handling Tests
  // ============================================================

  describe('handleNotificationEvent', () => {
    it('should handle quotation_created event', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const event: NotificationEvent = {
        type: 'quotation_created',
        recipientType: 'admin',
        data: {
          quotation_id: 'qt-001',
          quotation_number: 'QT-2024-001',
          customer_name: 'テストユーザー',
          company_name: 'テスト会社',
          total_amount: 10000,
          valid_until: '2025-12-31',
          view_url: 'https://example.com/view',
        },
      }

      const result = await handleNotificationEvent(event)

      expect(result.success).toBe(true)
      expect(sendMock).toHaveBeenCalledTimes(1)
    })

    it('should handle quotation_approved event', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const event: NotificationEvent = {
        type: 'quotation_approved',
        recipientType: 'customer',
        data: {
          quotation_id: 'qt-001',
          quotation_number: 'QT-2024-001',
          customer_name: 'テストユーザー',
          customer_email: 'customer@example.com',
          total_amount: 10000,
          valid_until: '2025-12-31',
          confirm_url: 'https://example.com/confirm',
        },
      }

      const result = await handleNotificationEvent(event)

      expect(result.success).toBe(true)
    })

    it('should return error for unknown event type', async () => {
      const event = {
        type: 'unknown_event' as any,
        recipientType: 'admin' as const,
        data: {},
      }

      const result = await handleNotificationEvent(event)

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('NO_TEMPLATE')
    })
  })

  // ============================================================
  // Bounce Handling Tests
  // ============================================================

  describe('isBouncedEmail', () => {
    it('should return false for valid email', async () => {
      const result = await isBouncedEmail('test@example.com')
      expect(result).toBe(false)
    })
  })

  describe('recordBounce', () => {
    it('should record bounce event', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const bounce: BounceEvent = {
        email: 'bounced@example.com',
        type: 'hard',
        reason: 'Mailbox not found',
        occurredAt: '2024-01-01T00:00:00Z',
        eventId: 'evt-001',
        messageId: 'msg-001',
      }

      await recordBounce(bounce)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[NotificationService] Bounce recorded for bounced@example.com: Mailbox not found'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('handleBounceWebhook', () => {
    it('should process bounce events from webhook', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const events = [
        {
          event: 'bounce',
          email: 'bounced@example.com',
          status: '5xx',
          reason: 'Mailbox not found',
          timestamp: 1704067200,
          sg_message_id: 'msg-001',
        },
        {
          event: 'dropped',
          email: 'dropped@example.com',
          reason: 'Invalid sender',
          timestamp: 1704067200,
          sg_message_id: 'msg-002',
        },
      ]

      await handleBounceWebhook(events)

      expect(consoleSpy).toHaveBeenCalledTimes(2)

      consoleSpy.mockRestore()
    })
  })

  // ============================================================
  // Utility Function Tests
  // ============================================================

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.jp')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('supportsJapaneseEmail', () => {
    it('should return true for Japanese email support', () => {
      expect(supportsJapaneseEmail()).toBe(true)
    })
  })

  describe('logDeliveryStatus', () => {
    it('should log delivery status', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await logDeliveryStatus('msg-001', 'test@example.com', 'delivered')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[NotificationService] Delivery status: msg-001 -> test@example.com: delivered'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('sendTestEmail', () => {
    it('should send test email', async () => {
      const sendMock = mockSendGridSend
      sendMock.mockResolvedValue([{ headers: { 'x-message-id': 'test-id' } }])

      const result = await sendTestEmail('test@example.com')

      expect(result.success).toBe(true)
      expect(sendMock).toHaveBeenCalled()
    })
  })
})

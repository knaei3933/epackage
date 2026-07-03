/**
 * Notification Service Unit Tests
 *
 * 通知サービスユニットテスト
 *
 * 現行実装は nodemailer (Xserver SMTP) を使用している。
 * モジュールロード時に transporter が固定されるため、テストからは
 * __setTransporterForTesting で transporter を注入し、実装の動作仕様
 * （成功 / CONFIG_ERROR / UNKNOWN_EVENT 等）を検証する。
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  sendEmail,
  handleNotificationEvent,
  isValidEmail,
  __setTransporterForTesting,
} from '../notificationService'
import type { NotificationEvent } from '@/types/email'

describe('NotificationService', () => {
  const mockSendMail = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Xserver SMTP transporter をモック注入（成功状態をデフォルトとする）
    __setTransporterForTesting({ sendMail: mockSendMail } as any, 'xserver')
  })

  // ============================================================
  // sendEmail Tests
  // ============================================================

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' })

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
      expect(mockSendMail).toHaveBeenCalledTimes(1)
    })

    it('should return CONFIG_ERROR when SMTP is not configured', async () => {
      // console fallback (transporter 未設定) を再現
      __setTransporterForTesting(null, 'console')

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
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' })

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
      expect(mockSendMail).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================
  // handleNotificationEvent Tests
  // ============================================================

  describe('handleNotificationEvent', () => {
    it('should handle quotation_created event', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-id' })

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
      expect(mockSendMail).toHaveBeenCalledTimes(1)
    })

    it('should handle quotation_approved event', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-id' })

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

    it('should return UNKNOWN_EVENT for unknown event type', async () => {
      const event = {
        type: 'unknown_event' as any,
        recipientType: 'admin' as const,
        data: {},
      }

      const result = await handleNotificationEvent(event)

      expect(result.success).toBe(false)
      // 現行実装（notificationService.ts L220）は UNKNOWN_EVENT を返す
      expect(result.errorCode).toBe('UNKNOWN_EVENT')
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
})

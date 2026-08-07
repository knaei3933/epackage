/**
 * Notification Preferences Service Unit Tests
 *
 * 通知設定サービスユニットテスト
 *
 * NOTE (C2 drift 対応・TECH DEBT):
 * preferences.ts は `notification_preferences` テーブルが実DBに存在しないため
 * neutralize 済み（DB 依存の各関数はシグネチャを維持しつつ安全なデフォルト値を返す）。
 *   - 取得系（getUserPreferences / getSMSPhoneNumber）   → null
 *   - 更新系（updateUserPreferences / toggleChannel /
 *             setSMSPhoneNumber / setQuietHours 等）       → false
 *   - isChannelEnabled                                      → email のみ true
 *   - getEnabledChannelsForCategory                        → defaultCategoryChannels[category]
 *   - 純粋関数（validatePhoneNumber / normalizePhoneNumber/
 *               createDefaultPreferences）                 → 変更なく動作
 * 本テストは neutralize 後の挙動を検証する。将来テーブルを新設して機能を
 * 有効化する場合は、本テストを DB CRUD の検証へ戻し、jest.mock も復元すること。
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

// ============================================================
// Dynamic imports（preferences.ts は supabase 非依存のため mock 不要）
// ============================================================

let getUserPreferences: any
let updateUserPreferences: any
let toggleChannel: any
let isChannelEnabled: any
let getEnabledChannelsForCategory: any
let setQuietHours: any
let isInQuietHours: any
let setSMSPhoneNumber: any
let getSMSPhoneNumber: any
let validatePhoneNumber: any
let normalizePhoneNumber: any
let createDefaultPreferences: any

beforeAll(async () => {
  const module = await import('../preferences')
  getUserPreferences = module.getUserPreferences
  updateUserPreferences = module.updateUserPreferences
  toggleChannel = module.toggleChannel
  isChannelEnabled = module.isChannelEnabled
  getEnabledChannelsForCategory = module.getEnabledChannelsForCategory
  setQuietHours = module.setQuietHours
  isInQuietHours = module.isInQuietHours
  setSMSPhoneNumber = module.setSMSPhoneNumber
  getSMSPhoneNumber = module.getSMSPhoneNumber
  validatePhoneNumber = module.validatePhoneNumber
  normalizePhoneNumber = module.normalizePhoneNumber
  createDefaultPreferences = module.createDefaultPreferences
})

describe('NotificationPreferences', () => {
  const testUserId = 'user-test-001'

  // ============================================================
  // getUserPreferences（neutralized: 常に null）
  // ============================================================
  describe('getUserPreferences', () => {
    it('should return null (notification_preferences table does not exist)', async () => {
      const result = await getUserPreferences(testUserId)
      expect(result).toBeNull()
    })

    it('should return null regardless of userId (no persistence target)', async () => {
      const result = await getUserPreferences('different-user-id')
      expect(result).toBeNull()
    })

    it('should always return null in neutralized state', async () => {
      const result = await getUserPreferences('')
      expect(result).toBeNull()
    })
  })

  // ============================================================
  // updateUserPreferences（neutralized: 常に null）
  // ============================================================
  describe('updateUserPreferences', () => {
    it('should return null (no persistence target)', async () => {
      const result = await updateUserPreferences(testUserId, { language: 'en' })
      expect(result).toBeNull()
    })

    it('should return null for any update payload (neutralized)', async () => {
      const result = await updateUserPreferences(testUserId, {
        channels: { email: { enabled: false, categories: [] } },
      })
      expect(result).toBeNull()
    })
  })

  // ============================================================
  // Channel Management
  // ============================================================
  describe('toggleChannel', () => {
    it('should return false when enabling a channel (neutralized)', async () => {
      const result = await toggleChannel(testUserId, 'sms', true)
      expect(result).toBe(false)
    })

    it('should return false when disabling a channel (neutralized)', async () => {
      const result = await toggleChannel(testUserId, 'sms', false)
      expect(result).toBe(false)
    })
  })

  describe('isChannelEnabled', () => {
    it('should return true for email (default enabled channel)', async () => {
      const result = await isChannelEnabled(testUserId, 'email')
      expect(result).toBe(true)
    })

    it('should return false for sms (neutralized default)', async () => {
      const result = await isChannelEnabled(testUserId, 'sms')
      expect(result).toBe(false)
    })

    it('should return true for email when no preferences exist', async () => {
      const result = await isChannelEnabled(testUserId, 'email')
      expect(result).toBe(true)
    })
  })

  // ============================================================
  // Category（neutralized: defaultCategoryChannels へフォールバック）
  // ============================================================
  describe('getEnabledChannelsForCategory', () => {
    it('should return default channels for quotation category', async () => {
      const result = await getEnabledChannelsForCategory(testUserId, 'quotation')
      // defaultCategoryChannels.quotation = ['email', 'push']
      expect(result).toContain('email')
      expect(result).toContain('push')
    })

    it('should return default channels when no preferences exist', async () => {
      const result = await getEnabledChannelsForCategory(testUserId, 'order')
      // defaultCategoryChannels.order = ['email', 'sms', 'push']
      expect(result).toContain('email')
      expect(result).toContain('sms')
      expect(result).toContain('push')
    })
  })

  // ============================================================
  // Quiet Hours（neutralized: 常に false）
  // ============================================================
  describe('isInQuietHours', () => {
    it('should return false (no preferences, neutralized)', async () => {
      const result = await isInQuietHours(testUserId)
      expect(result).toBe(false)
    })

    it('should return false for any user (neutralized)', async () => {
      const result = await isInQuietHours('any-other-user')
      expect(result).toBe(false)
    })
  })

  // ============================================================
  // Phone Number Validation（純粋関数・変更なし）
  // ============================================================
  describe('validatePhoneNumber', () => {
    it('should validate Japanese phone numbers', () => {
      expect(validatePhoneNumber('090-1234-5678')).toBe(true)
      expect(validatePhoneNumber('03-1234-5678')).toBe(true)
      expect(validatePhoneNumber('09012345678')).toBe(true)
    })

    it('should validate international phone numbers', () => {
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
  // SMS Phone Number（neutralized）
  // ============================================================
  describe('setSMSPhoneNumber', () => {
    it('should return false (no persistence target)', async () => {
      const result = await setSMSPhoneNumber(testUserId, '090-1234-5678')
      expect(result).toBe(false)
    })

    it('should return false even for a valid phone number (neutralized)', async () => {
      const result = await setSMSPhoneNumber(testUserId, '090-9876-5432')
      expect(result).toBe(false)
    })
  })

  describe('getSMSPhoneNumber', () => {
    it('should return null (no preferences, neutralized)', async () => {
      const result = await getSMSPhoneNumber(testUserId)
      expect(result).toBeNull()
    })

    it('should return null for any user (neutralized)', async () => {
      const result = await getSMSPhoneNumber('any-other-user')
      expect(result).toBeNull()
    })

    it('should return null when no preferences exist', async () => {
      const result = await getSMSPhoneNumber('')
      expect(result).toBeNull()
    })
  })

  // ============================================================
  // createDefaultPreferences（メモリ上デフォルト・動作する）
  // ============================================================
  describe('createDefaultPreferences', () => {
    it('should return in-memory default preferences with userId', async () => {
      const result = await createDefaultPreferences(testUserId)
      expect(result).not.toBeNull()
      expect(result.user_id).toBe(testUserId)
      expect(result.channels.email.enabled).toBe(true)
      expect(result.language).toBe('ja')
    })
  })

  // ============================================================
  // setQuietHours（neutralized: 常に false）
  // ============================================================
  describe('setQuietHours', () => {
    it('should return false (no persistence target)', async () => {
      const result = await setQuietHours(testUserId, true, '23:00', '07:00', 'Asia/Tokyo')
      expect(result).toBe(false)
    })
  })
})

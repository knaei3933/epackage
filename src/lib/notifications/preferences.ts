/**
 * Notification Preferences Service
 *
 * 通知設定管理サービス
 * ユーザーの通知チャンネル設定・カテゴリ設定を管理
 *
 * @module lib/notifications/preferences
 */

import { createClient } from '@supabase/supabase-js'
import type {
  NotificationPreferences,
  NotificationChannel,
  NotificationCategory,
  CategoryPreference,
} from '@/types/notification'

// ============================================================
// Configuration
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const TABLE_NAME = 'notification_preferences'

// ============================================================
// Default Preferences
// ============================================================

/**
 * デフォルトの通知設定
 */
export const defaultPreferences: Omit<NotificationPreferences, 'user_id' | 'updated_at'> = {
  channels: {
    email: {
      enabled: true,
      categories: ['quotation', 'order', 'production', 'shipping', 'payment', 'contract', 'system'],
    },
    sms: {
      enabled: false,
      categories: ['order', 'shipping'],  // SMSは重要な通知のみ
    },
    push: {
      enabled: true,
      categories: ['quotation', 'order', 'production', 'shipping'],
    },
  },
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'Asia/Tokyo',
  },
  language: 'ja',
}

/**
 * カテゴリごとのデフォルトチャンネル
 */
export const defaultCategoryChannels: Record<NotificationCategory, NotificationChannel[]> = {
  quotation: ['email', 'push'],
  order: ['email', 'sms', 'push'],
  production: ['email', 'push'],
  shipping: ['email', 'sms', 'push'],
  payment: ['email', 'sms'],
  contract: ['email'],
  promotion: ['email'],
  system: ['email', 'push'],
}

// ============================================================
// CRUD Operations
// ============================================================

/**
 * ユーザーの通知設定を取得
 */
export async function getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 設定が存在しない場合はデフォルト設定を返す
        return createDefaultPreferences(userId)
      }
      throw error
    }

    return data as NotificationPreferences
  } catch (error) {
    console.error('[NotificationPreferences] Failed to get user preferences:', error)
    return null
  }
}

/**
 * 通知設定を更新
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences | null> {
  try {
    const existing = await getUserPreferences(userId)

    if (!existing) {
      // 新規作成
      const newPreferences = {
        ...defaultPreferences,
        ...preferences,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as NotificationPreferences

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(newPreferences)
        .select()
        .single()

      if (error) throw error
      return data as NotificationPreferences
    }

    // 更新
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...existing,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as NotificationPreferences
  } catch (error) {
    console.error('[NotificationPreferences] Failed to update preferences:', error)
    return null
  }
}

/**
 * デフォルト設定を作成
 */
export async function createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
  const preferences: NotificationPreferences = {
    ...defaultPreferences,
    user_id: userId,
    updated_at: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(preferences)
      .select()
      .single()

    if (error) {
      console.error('[NotificationPreferences] Failed to create default preferences:', error)
      return preferences
    }

    return data as NotificationPreferences
  } catch (error) {
    console.error('[NotificationPreferences] Failed to create default preferences:', error)
    return preferences
  }
}

// ============================================================
// Channel Management
// ============================================================

/**
 * チャンネルの有効/無効を切り替え
 */
export async function toggleChannel(
  userId: string,
  channel: NotificationChannel,
  enabled: boolean
): Promise<boolean> {
  try {
    const preferences = await getUserPreferences(userId)
    if (!preferences) return false

    const updated = await updateUserPreferences(userId, {
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel as keyof typeof preferences.channels],
          enabled,
        },
      },
    })

    return updated !== null
  } catch (error) {
    console.error(`[NotificationPreferences] Failed to toggle ${channel}:`, error)
    return false
  }
}

/**
 * チャンネルが有効かどうかを確認
 */
export async function isChannelEnabled(
  userId: string,
  channel: NotificationChannel
): Promise<boolean> {
  const preferences = await getUserPreferences(userId)
  if (!preferences) return channel === 'email' // デフォルトはemailのみ有効

  return preferences.channels[channel as keyof typeof preferences.channels]?.enabled || false
}

/**
 * カテゴリに対する有効なチャンネルを取得
 */
export async function getEnabledChannelsForCategory(
  userId: string,
  category: NotificationCategory
): Promise<NotificationChannel[]> {
  const preferences = await getUserPreferences(userId)
  if (!preferences) return defaultCategoryChannels[category]

  const enabledChannels: NotificationChannel[] = []

  for (const channel of defaultCategoryChannels[category]) {
    const channelPref = preferences.channels[channel as keyof typeof preferences.channels]
    if (channelPref?.enabled &&
        channelPref?.categories.includes(category)) {
      enabledChannels.push(channel)
    }
  }

  return enabledChannels
}

// ============================================================
// Category Management
// ============================================================

/**
 * カテゴリ設定を更新
 */
export async function updateCategoryPreference(
  userId: string,
  channel: NotificationChannel,
  category: NotificationCategory,
  enabled: boolean
): Promise<boolean> {
  try {
    const preferences = await getUserPreferences(userId)
    if (!preferences) return false

    const channelKey = channel as keyof typeof preferences.channels
    const currentCategories = preferences.channels[channelKey]?.categories || []

    let newCategories: NotificationCategory[]
    if (enabled) {
      // Convert Set to Array for compatibility
      const categorySet = new Set<NotificationCategory>([...currentCategories, category])
      newCategories = Array.from(categorySet)
    } else {
      newCategories = currentCategories.filter((c: NotificationCategory) => c !== category)
    }

    const updated = await updateUserPreferences(userId, {
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channelKey],
          categories: newCategories,
        },
      },
    })

    return updated !== null
  } catch (error) {
    console.error(`[NotificationPreferences] Failed to update category preference:`, error)
    return false
  }
}

/**
 * 複数のカテゴリ設定を一括更新
 */
export async function updateCategoryPreferences(
  userId: string,
  channel: NotificationChannel,
  categories: NotificationCategory[]
): Promise<boolean> {
  try {
    const preferences = await getUserPreferences(userId)
    if (!preferences) return false

    const channelKey = channel as keyof typeof preferences.channels
    const updated = await updateUserPreferences(userId, {
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channelKey],
          categories,
        },
      },
    })

    return updated !== null
  } catch (error) {
    console.error(`[NotificationPreferences] Failed to update category preferences:`, error)
    return false
  }
}

// ============================================================
// Quiet Hours Management
// ============================================================

/**
 * 通知停止時間帯を設定
 */
export async function setQuietHours(
  userId: string,
  enabled: boolean,
  start?: string,
  end?: string,
  timezone?: string
): Promise<boolean> {
  try {
    const preferences = await getUserPreferences(userId)
    if (!preferences) return false

    const updated = await updateUserPreferences(userId, {
      quiet_hours: {
        enabled,
        start: start || preferences.quiet_hours?.start || '22:00',
        end: end || preferences.quiet_hours?.end || '08:00',
        timezone: timezone || preferences.quiet_hours?.timezone || 'Asia/Tokyo',
      },
    })

    return updated !== null
  } catch (error) {
    console.error('[NotificationPreferences] Failed to set quiet hours:', error)
    return false
  }
}

/**
 * 現在が通知停止時間帯かどうかを確認
 */
export async function isInQuietHours(userId: string): Promise<boolean> {
  const preferences = await getUserPreferences(userId)
  if (!preferences?.quiet_hours?.enabled) return false

  const { start, end, timezone } = preferences.quiet_hours

  // 現在の時刻を取得
  const now = new Date()
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const currentHour = userTime.getHours()
  const currentMinute = userTime.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  // 開始・終了時刻を分単位に変換
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  // 深夜をまたぐ場合の処理
  if (startTime > endTime) {
    // 22:00 - 08:00 のような場合
    return currentTime >= startTime || currentTime < endTime
  } else {
    // 08:00 - 22:00 のような場合
    return currentTime >= startTime && currentTime < endTime
  }
}

// ============================================================
// SMS Phone Number Management
// ============================================================

/**
 * SMS電話番号を設定
 */
export async function setSMSPhoneNumber(userId: string, phoneNumber: string): Promise<boolean> {
  try {
    const preferences = await getUserPreferences(userId)
    if (!preferences) return false

    const updated = await updateUserPreferences(userId, {
      channels: {
        ...preferences.channels,
        sms: {
          ...preferences.channels.sms,
          phone_number: phoneNumber,
          enabled: true,  // 電話番号設定時にSMSを有効化
        },
      },
    })

    return updated !== null
  } catch (error) {
    console.error('[NotificationPreferences] Failed to set SMS phone number:', error)
    return false
  }
}

/**
 * SMS電話番号を取得
 */
export async function getSMSPhoneNumber(userId: string): Promise<string | null> {
  const preferences = await getUserPreferences(userId)
  if (!preferences?.channels.sms?.enabled) return null

  return preferences.channels.sms.phone_number || null
}

// ============================================================
// Validation
// ============================================================

/**
 * 電話番号のフォーマット検証
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // 日本の電話番号フォーマット
  const jpPhoneRegex = /^(0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{4}|0\d{9,10})$/
  // 国際フォーマット
  const intlPhoneRegex = /^\+\d{1,4}[-\s]?\d{1,4}[-\s]?\d{4,}$/

  return jpPhoneRegex.test(phoneNumber) || intlPhoneRegex.test(phoneNumber)
}

/**
 * 電話番号を正規化（ハイフン除去）
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[-\s]/g, '')
}

// ============================================================
// Migration & Setup
// ============================================================

/**
 * 既存ユーザーにデフォルト設定を作成
 */
export async function createDefaultPreferencesForExistingUsers(): Promise<number> {
  try {
    // user_profilesテーブルからすべてのユーザーを取得
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id')

    if (error) throw error
    if (!users) return 0

    let created = 0
    for (const user of users) {
      const existing = await getUserPreferences(user.id)
      if (!existing) {
        await createDefaultPreferences(user.id)
        created++
      }
    }

    return created
  } catch (error) {
    console.error('[NotificationPreferences] Failed to create defaults for existing users:', error)
    return 0
  }
}

/**
 * 通知設定をリセット（デフォルトに戻す）
 */
export async function resetPreferences(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)

    if (error) throw error

    await createDefaultPreferences(userId)
    return true
  } catch (error) {
    console.error('[NotificationPreferences] Failed to reset preferences:', error)
    return false
  }
}

// ============================================================
// Export / Import
// ============================================================

/**
 * 通知設定をエクスポート
 */
export function exportPreferences(preferences: NotificationPreferences): string {
  return JSON.stringify(preferences, null, 2)
}

/**
 * 通知設定をインポート
 */
export function importPreferences(userId: string, data: string): boolean {
  try {
    const preferences = JSON.parse(data) as Partial<NotificationPreferences>
    updateUserPreferences(userId, preferences)
    return true
  } catch (error) {
    console.error('[NotificationPreferences] Failed to import preferences:', error)
    return false
  }
}

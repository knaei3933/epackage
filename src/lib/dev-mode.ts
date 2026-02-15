/**
 * Development Mode Utilities
 *
 * Centralized utilities for development mode checks and mock data generation.
 * Consolidates NEXT_PUBLIC_DEV_MODE logic from 30+ files into a single source of truth.
 *
 * @module lib/dev-mode
 */

import type { User, RegistrationFormData } from '@/types/auth';
import type { Database } from '@/types/database';
import type { OrderStatus } from '@/types/order-status';

/**
 * Profile type from database schema
 */
export type Profile = Database['public']['Tables']['profiles']['Row'];

// =====================================================
// Constants
// =====================================================

/**
 * Reserved user ID for development mode testing
 * Matches pattern: 00000000-0000-0000-0000-000000000000
 */
export const DEV_MODE_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * localStorage key for storing mock user data
 */
const MOCK_USER_STORAGE_KEY = 'dev_mock_user';

/**
 * Cookie key for storing dev mode mock user ID
 */
const DEV_MOCK_USER_ID_COOKIE = 'dev_mock_user_id';

// =====================================================
// DEV_MODE Detection (SECURE - Server-side only)
// =====================================================

/**
 * DEVELOPMENT MODE IS PERMANENTLY DISABLED
 * Dev Mode is no longer supported - always returns false
 */
const SECURE_DEV_MODE_ENABLED = false;

/**
 * DEVELOPMENT MODE IS PERMANENTLY DISABLED.
 * This function always returns false.
 *
 * @returns {boolean} Always returns false (Dev Mode disabled)
 */
export function isDevMode(): boolean {
  // Dev Mode is permanently disabled
  return false;
}

// =====================================================
// Mock Data Generators
// =====================================================

/**
 * Creates a mock user object for development testing
 *
 * @param {Partial<User>} overrides - Optional properties to override defaults
 * @returns {User} Mock user object
 *
 * @example
 * ```typescript
 * const mockUser = createMockUser({
 *   email: 'test@example.com',
 *   role: UserRole.ADMIN
 * });
 * ```
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  const { UserRole, UserStatus } = require('@/types/auth');

  const defaultUser: User = {
    id: DEV_MODE_USER_ID,
    email: 'dev@example.com',
    emailVerified: new Date(),
    kanjiLastName: '開発',
    kanjiFirstName: '太郎',
    kanaLastName: 'カイハツ',
    kanaFirstName: 'タロウ',
    corporatePhone: '03-1234-5678',
    personalPhone: '090-1234-5678',
    businessType: 'CORPORATION',
    companyName: '開発株式会社',
    legalEntityNumber: '1234567890123',
    position: '開発担当',
    department: '技術部',
    companyUrl: 'https://dev-example.com',
    productCategory: 'COSMETICS',
    acquisitionChannel: 'Web',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '丸の内1-1-1',
    role: UserRole.MEMBER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };

  return { ...defaultUser, ...overrides };
}

/**
 * Creates a mock profile object for development testing
 *
 * @param {Partial<Profile>} overrides - Optional properties to override defaults
 * @returns {Profile} Mock profile object
 *
 * @example
 * ```typescript
 * const mockProfile = createMockProfile({
 *   company_name: 'Test Company',
 *   role: 'ADMIN'
 * });
 * ```
 */
export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  const defaultProfile: Profile = {
    id: DEV_MODE_USER_ID,
    email: 'dev@example.com',
    kanji_last_name: '開発',
    kanji_first_name: '太郎',
    kana_last_name: 'カイハツ',
    kana_first_name: 'タロウ',
    corporate_phone: '03-1234-5678',
    personal_phone: '090-1234-5678',
    business_type: 'CORPORATION',
    user_type: 'B2B',
    company_name: '開発株式会社',
    legal_entity_number: '1234567890123',
    corporate_number: '1234567890123',
    position: '開発担当',
    department: '技術部',
    company_url: 'https://dev-example.com',
    product_category: 'COSMETICS',
    acquisition_channel: 'Web',
    postal_code: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '丸の内1-1-1',
    building: '東京駅前ビル10F',
    role: 'MEMBER',
    status: 'ACTIVE',
    founded_year: '2020',
    capital: '10,000,000円',
    representative_name: '開発 次郎',
    business_document_path: '/dev/business.pdf',
    verification_token: null,
    verification_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  };

  return { ...defaultProfile, ...overrides };
}

/**
 * Creates mock registration form data for development testing
 *
 * @param {Partial<RegistrationFormData>} overrides - Optional properties to override defaults
 * @returns {RegistrationFormData} Mock registration data
 *
 * @example
 * ```typescript
 * const mockData = createMockRegistrationData({
 *   email: 'newuser@example.com',
 *   password: 'TestPass123'
 * });
 * ```
 */
export function createMockRegistrationData(
  overrides: Partial<RegistrationFormData> = {}
): RegistrationFormData {
  const defaultData: RegistrationFormData = {
    // Authentication
    email: 'dev@example.com',
    password: 'DevPass123',
    passwordConfirm: 'DevPass123',

    // Japanese name (kanji + kana)
    kanjiLastName: '開発',
    kanjiFirstName: '太郎',
    kanaLastName: 'カイハツ',
    kanaFirstName: 'タロウ',

    // Phone numbers
    corporatePhone: '03-1234-5678',
    personalPhone: '090-1234-5678',

    // Business type
    businessType: 'CORPORATION',

    // Company information
    companyName: '開発株式会社',
    legalEntityNumber: '1234567890123',
    position: '開発担当',
    department: '技術部',
    companyUrl: 'https://dev-example.com',

    // Product category
    productCategory: 'COSMETICS',

    // Acquisition channel
    acquisitionChannel: 'Web',

    // Address
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '丸の内1-1-1',

    // Privacy consent
    privacyConsent: true,
  };

  return { ...defaultData, ...overrides };
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Checks if current user is a development mode mock user
 *
 * @param {User | Profile | string} userOrId - User object, profile, or user ID
 * @returns {boolean} True if the user is a mock user
 *
 * @example
 * ```typescript
 * const user = getCurrentUser();
 * if (isMockUser(user)) {
 *   console.log('Using mock user in development');
 * }
 * ```
 */
export function isMockUser(userOrId: User | Profile | string): boolean {
  if (!isDevMode()) {
    return false;
  }

  const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
  return userId === DEV_MODE_USER_ID;
}

/**
 * Gets a development mode warning message for UI display
 *
 * @returns {string | null} Warning message or null if not in dev mode
 *
 * @example
 * ```typescript
 * const warning = getDevModeWarning();
 * if (warning) {
 *   showWarningBanner(warning);
 * }
 * ```
 */
export function getDevModeWarning(): string | null {
  if (!isDevMode()) {
    return null;
  }

  return '⚠️ 開発モード: 実際のデータベースは使用されず、テストデータが表示されます。';
}

/**
 * Logs a development mode message to console
 * Only logs when development mode is active
 *
 * @param {string} message - Message to log
 * @param {unknown} [data] - Optional data to log
 *
 * @example
 * ```typescript
 * devLog('User loaded', user);
 * ```
 */
export function devLog(message: string, data?: unknown): void {
  if (isDevMode()) {
    console.log(`[DEV_MODE] ${message}`, data ?? '');
  }
}

/**
 * Executes a callback function only in development mode
 *
 * @param {() => void} callback - Function to execute in dev mode
 *
 * @example
 * ```typescript
 * devOnly(() => {
 *   setupMockData();
 *   enableDevTools();
 * });
 * ```
 */
export function devOnly(callback: () => void): void {
  if (isDevMode()) {
    callback();
  }
}

// =====================================================
// DEV_MODE Environment Variable Check (SECURE)
// =====================================================

/**
 * DEVELOPMENT MODE IS PERMANENTLY DISABLED
 *
 * @deprecated Dev Mode is no longer supported
 */
export const DEV_MODE = false;

// =====================================================
// 統合システム用DEV_MODE拡張
// =====================================================

/**
 * ダッシュボード用DEV_MODEチェック
 */
export function isDashboardDevMode(): boolean {
  return isDevMode();
}

/**
 * 統合通知用の型定義
 */
export interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: 'member' | 'admin';
  type: string;
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  created_at: string;
}

/**
 * 統合ダッシュボード統計型定義
 */
export interface UnifiedDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeUsers: number;
  period?: number;
  ordersByStatus?: Array<{ status: string; count: number }>;
  recentOrders?: any[];
  pendingQuotations?: number;
  quotations?: {
    total: number;
    approved: number;
    conversionRate: number;
  };
  samples?: {
    total: number;
    processing: number;
  };
  activeProduction?: number;
  production?: {
    avgDays: number;
    completed: number;
  };
  todayShipments?: number;
  shipments?: {
    today: number;
    inTransit: number;
  };
  contracts?: {
    pending: number;
    signed: number;
    total: number;
  };
  announcements?: any[];
  notifications?: Notification[];
}

/**
 * DEV_MODE用統合通知モックデータ生成
 */
export function createMockUnifiedNotification(type: string): Notification {
  return {
    id: `mock-notif-${Date.now()}`,
    recipient_id: 'dev-mock-user',
    recipient_type: 'member',
    type,
    title: 'テスト通知',
    message: 'これはDEV_MODEのテスト通知です。',
    priority: 'normal' as const,
    metadata: {},
    is_read: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * DEV_MODE用統合ダッシュボード統計データ生成
 */
export function createMockDashboardStats(
  userRole: 'ADMIN' | 'MEMBER',
  period: number
): UnifiedDashboardStats {
  if (userRole === 'ADMIN') {
    return {
      totalOrders: Math.floor(Math.random() * 100) + 50,
      pendingOrders: Math.floor(Math.random() * 20) + 5,
      totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      period,
      ordersByStatus: [
        { status: 'PENDING', count: Math.floor(Math.random() * 10) + 1 },
        { status: 'PRODUCTION', count: Math.floor(Math.random() * 20) + 5 },
        { status: 'SHIPPED', count: Math.floor(Math.random() * 15) + 3 },
      ],
      quotations: {
        total: Math.floor(Math.random() * 50) + 20,
        approved: Math.floor(Math.random() * 30) + 10,
        conversionRate: Math.floor(Math.random() * 30) + 50,
      },
      samples: {
        total: Math.floor(Math.random() * 30) + 10,
        processing: Math.floor(Math.random() * 10) + 2,
      },
      production: {
        avgDays: Math.floor(Math.random() * 10) + 5,
        completed: Math.floor(Math.random() * 100) + 50,
      },
      shipments: {
        today: Math.floor(Math.random() * 20) + 5,
        inTransit: Math.floor(Math.random() * 30) + 10,
      },
      activeProduction: Math.floor(Math.random() * 15) + 3,
      todayShipments: Math.floor(Math.random() * 10) + 2,
    };
  } else {
    return {
      totalOrders: Math.floor(Math.random() * 10) + 1,
      pendingOrders: Math.floor(Math.random() * 5) + 1,
      totalRevenue: 0,
      activeUsers: 0,
      period,
      pendingQuotations: Math.floor(Math.random() * 5) + 1,
      samples: {
        total: Math.floor(Math.random() * 20) + 5,
        processing: Math.floor(Math.random() * 5) + 1,
      },
      contracts: {
        pending: Math.floor(Math.random() * 3) + 1,
        signed: Math.floor(Math.random() * 5) + 1,
        total: Math.floor(Math.random() * 10) + 2,
      },
    };
  }
}

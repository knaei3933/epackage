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
 * SECURE: Server-side only environment variable for development mode
 * Uses ENABLE_DEV_MOCK_AUTH (without NEXT_PUBLIC_ prefix) to prevent client exposure
 *
 * SECURITY: This prevents accidental dev mode activation in production
 */
const SECURE_DEV_MODE_ENABLED =
  process.env.NODE_ENV === 'development' &&
  process.env.ENABLE_DEV_MOCK_AUTH === 'true';

/**
 * Production safety check - warns if dev mode is enabled in production build
 *
 * SECURITY: This check warns during build but allows local development builds
 * Actual production safety is enforced at runtime via isDevMode() checks
 */
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_MOCK_AUTH === 'true') {
  // Only warn, don't throw - this allows local dev builds with production mode
  if (typeof window === 'undefined') {
    // Server-side build: warn but don't fail (allows next build)
    console.warn(
      '⚠️ WARNING: Dev mode (ENABLE_DEV_MOCK_AUTH) is enabled during PRODUCTION build.\n' +
      'This is fine for local development testing, but should NOT be deployed to actual production.\n' +
      'Make sure ENABLE_DEV_MOCK_AUTH is NOT set in your production environment.'
    );
  }
}

/**
 * Checks if the application is running in SECURE development mode
 *
 * Development mode is ONLY enabled when:
 * 1. NODE_ENV === 'development'
 * 2. ENABLE_DEV_MOCK_AUTH === 'true' (server-side env var, not client-exposed)
 *
 * SECURITY: This prevents:
 * - Client-side manipulation of dev mode
 * - Accidental dev mode activation in production
 * - Information leakage through client-side env vars
 *
 * @returns {boolean} True if SECURE development mode is active
 *
 * @example
 * ```typescript
 * if (isDevMode()) {
 *   console.log('Secure development mode detected');
 * }
 * ```
 */
export function isDevMode(): boolean {
  // Server-side: check secure env var
  if (typeof window === 'undefined') {
    return SECURE_DEV_MODE_ENABLED;
  }

  // Client-side: NEVER enable dev mode (security)
  // Dev mode is only for server-side API routes, not client components
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
// localStorage Helpers
// =====================================================

/**
 * Saves mock user data to localStorage for development testing
 *
 * @param {User} user - User object to save
 * @throws {Error} If not in development mode or localStorage is unavailable
 *
 * @example
 * ```typescript
 * const mockUser = createMockUser();
 * saveMockUserToLocalStorage(mockUser);
 * ```
 */
export function saveMockUserToLocalStorage(user: User): void {
  if (!isDevMode()) {
    throw new Error('Mock user storage is only available in development mode');
  }

  if (typeof window === 'undefined') {
    throw new Error('localStorage is only available in the browser');
  }

  try {
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save mock user to localStorage:', error);
    throw error;
  }
}

/**
 * Retrieves mock user data from localStorage
 *
 * @returns {User | null} Mock user object or null if not found
 * @throws {Error} If not in development mode or localStorage is unavailable
 *
 * @example
 * ```typescript
 * const mockUser = getMockUserFromLocalStorage();
 * if (mockUser) {
 *   console.log('Mock user loaded:', mockUser.email);
 * }
 * ```
 */
export function getMockUserFromLocalStorage(): User | null {
  if (!isDevMode()) {
    throw new Error('Mock user storage is only available in development mode');
  }

  if (typeof window === 'undefined') {
    throw new Error('localStorage is only available in the browser');
  }

  try {
    const data = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data) as User;
  } catch (error) {
    console.error('Failed to get mock user from localStorage:', error);
    return null;
  }
}

/**
 * Clears mock user data from localStorage
 *
 * @throws {Error} If not in development mode or localStorage is unavailable
 *
 * @example
 * ```typescript
 * clearMockUserFromLocalStorage();
 * ```
 */
export function clearMockUserFromLocalStorage(): void {
  if (!isDevMode()) {
    throw new Error('Mock user storage is only available in development mode');
  }

  if (typeof window === 'undefined') {
    throw new Error('localStorage is only available in the browser');
  }

  try {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear mock user from localStorage:', error);
    throw error;
  }
}

// =====================================================
// Cookie Helpers
// =====================================================

/**
 * Sets a development mode mock user ID cookie
 *
 * @param {string} userId - User ID to store in cookie
 * @throws {Error} If not in development mode
 *
 * @example
 * ```typescript
 * setDevMockUserIdCookie('custom-user-id');
 * ```
 */
export function setDevMockUserIdCookie(userId: string): void {
  if (!isDevMode()) {
    throw new Error('Mock user cookie is only available in development mode');
  }

  if (typeof document === 'undefined') {
    throw new Error('Cookies are only available in the browser');
  }

  // Set cookie with 30-day expiration
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);

  document.cookie = `${DEV_MOCK_USER_ID_COOKIE}=${userId}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Gets the development mode mock user ID from cookie
 *
 * @returns {string | null} Mock user ID or null if not found
 * @throws {Error} If not in development mode
 *
 * @example
 * ```typescript
 * const userId = getDevMockUserIdCookie();
 * if (userId) {
 *   console.log('Mock user ID:', userId);
 * }
 * ```
 */
export function getDevMockUserIdCookie(): string | null {
  if (!isDevMode()) {
    throw new Error('Mock user cookie is only available in development mode');
  }

  if (typeof document === 'undefined') {
    throw new Error('Cookies are only available in the browser');
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === DEV_MOCK_USER_ID_COOKIE) {
      return value || null;
    }
  }

  return null;
}

/**
 * Clears the development mode mock user ID cookie
 *
 * @throws {Error} If not in development mode
 *
 * @example
 * ```typescript
 * clearDevMockUserIdCookie();
 * ```
 */
export function clearDevMockUserIdCookie(): void {
  if (!isDevMode()) {
    throw new Error('Mock user cookie is only available in development mode');
  }

  if (typeof document === 'undefined') {
    throw new Error('Cookies are only available in the browser');
  }

  // Clear cookie by setting expiration to past date
  document.cookie = `${DEV_MOCK_USER_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
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
 * SECURE: Development mode constant
 * Uses server-side only environment variable
 *
 * @deprecated Use isDevMode() function instead for better consistency
 */
export const DEV_MODE = SECURE_DEV_MODE_ENABLED;

// =====================================================
// Mock Data Generators for Business Entities
// =====================================================

/**
 * Mock quotation data matching the database schema
 */
export type MockQuotation = Database['public']['Tables']['quotations']['Row'] & {
  items?: Database['public']['Tables']['quotation_items']['Row'][];
};

/**
 * Mock order data matching the database schema
 */
export type MockOrder = Database['public']['Tables']['orders']['Row'] & {
  items?: Database['public']['Tables']['order_items']['Row'][];
};

/**
 * Mock sample request data matching the database schema
 */
export type MockSampleRequest = Database['public']['Tables']['sample_requests']['Row'] & {
  sample_items?: Database['public']['Tables']['sample_items']['Row'][];
};

/**
 * Generates mock quotation data for development testing
 *
 * @param {number} count - Number of quotations to generate (default: 7)
 * @returns {MockQuotation[]} Array of mock quotations
 *
 * @example
 * ```typescript
 * const quotations = getMockQuotations();
 * console.log('Generated', quotations.length, 'quotations');
 * ```
 */
export function getMockQuotations(count: number = 7): MockQuotation[] {
  const quotations: MockQuotation[] = [];
  const statuses: Array<'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'> =
    ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'];

  const customerNames = [
    '東京商事株式会社',
    '大阪物産有限会社',
    '名古屋テクノロジー',
    '横浜包装工業',
    '神戸流通システム',
    '福岡食品サプライ',
    '札幌エコパッケージ',
    '広島商事',
    '京都ファインケミカル',
    '仙台東北工業'
  ];

  for (let i = 0; i < count; i++) {
    const quotationNumber = `QT-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const subtotal = Math.floor(Math.random() * 500000) + 10000;
    const taxAmount = Math.floor(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;

    const quotation: MockQuotation = {
      id: `quote-${i + 1}`,
      user_id: DEV_MODE_USER_ID,
      company_id: `company-${i + 1}`,
      quotation_number: quotationNumber,
      status,
      customer_name: customerNames[i % customerNames.length],
      customer_email: `contact${i + 1}@${customerNames[i % customerNames.length].replace(/株式会社|有限会社/g, '').toLowerCase()}.co.jp`,
      customer_phone: `03-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      subtotal_amount: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      subtotal,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `見積書番号 ${quotationNumber} のご検討ありがとうございます。`,
      pdf_url: i < 3 ? `/pdf/quotations/${quotationNumber}.pdf` : null,
      admin_notes: i === 0 ? '高優先度案件、追跡が必要' : i === 1 ? '価格交渉中' : null,
      sales_rep: i % 2 === 0 ? '佐藤 太郎' : '鈴木 花子',
      estimated_delivery_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: status === 'SENT' || status === 'APPROVED' ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() : null,
      approved_at: status === 'APPROVED' || status === 'CONVERTED' ? new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString() : null,
      rejected_at: status === 'REJECTED' ? new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString() : null,
      items: [
        {
          id: `quote-item-${i}-1`,
          quotation_id: `quote-${i + 1}`,
          product_id: `product-${(i % 5) + 1}`,
          product_name: i % 2 === 0 ? '3辺シール 100mm×50mm' : 'スタンドパウチ 200mm×150mm',
          product_code: `PRD-2024${String((i % 5) + 1).padStart(4, '0')}`,
          category: i % 2 === 0 ? 'flat_3_side' : 'stand_up',
          quantity: Math.floor(Math.random() * 10000) + 1000,
          unit_price: Math.floor(Math.random() * 100) + 10,
          total_price: Math.floor(Math.random() * 100000) + 10000,
          specifications: {
            material: 'PET',
            thickness: '12μm',
            printing: '4色印刷',
            finish: 'マット',
            delivery_method: '通常納期'
          },
          notes: null,
          display_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: `quote-item-${i}-2`,
          quotation_id: `quote-${i + 1}`,
          product_id: `product-${((i + 1) % 5) + 1}`,
          product_name: 'ギャザー付きパウチ 100mm×200mm',
          product_code: `PRD-2024${String(((i + 1) % 5) + 1).padStart(4, '0')}`,
          category: 'soft_pouch',
          quantity: Math.floor(Math.random() * 5000) + 500,
          unit_price: Math.floor(Math.random() * 150) + 20,
          total_price: Math.floor(Math.random() * 75000) + 10000,
          specifications: {
            material: 'AL/PE',
            thickness: '70μm',
            printing: '6色印刷',
            zip_type: '金属製',
            sterilization: 'EOガス滅菌対応'
          },
          notes: '無菌対応が必要です',
          display_order: 2,
          created_at: new Date().toISOString()
        }
      ]
    };

    quotations.push(quotation);
  }

  return quotations;
}

/**
 * Generates mock order data for development testing
 *
 * @param {number} count - Number of orders to generate (default: 8)
 * @returns {MockOrder[]} Array of mock orders
 *
 * @example
 * ```typescript
 * const orders = getMockOrders();
 * console.log('Generated', orders.length, 'orders');
 * ```
 */
export function getMockOrders(count: number = 8): MockOrder[] {
  const orders: MockOrder[] = [];
  const statuses: OrderStatus[] = [
    'PENDING', 'QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER',
    'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION',
    'STOCK_IN', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  ];

  const currentStates = [
    'customer_registration',
    'quotation_request',
    'data_received',
    'design_approval',
    'contract_preparation',
    'contract_signature',
    'production_start',
    'quality_check',
    'packaging',
    'shipping_preparation',
    'in_transit',
    'delivery_complete'
  ];

  for (let i = 0; i < count; i++) {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const current_state = currentStates[Math.floor(Math.random() * currentStates.length)];

    const subtotal = Math.floor(Math.random() * 1000000) + 50000;
    const taxAmount = Math.floor(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;

    const order: MockOrder = {
      id: `order-${i + 1}`,
      user_id: DEV_MODE_USER_ID,
      company_id: `company-${i + 1}`,
      quotation_id: i % 3 === 0 ? `quote-${Math.floor(i / 3) + 1}` : null,
      order_number: orderNumber,
      current_state,
      state_metadata: {
        progress_percentage: Math.floor(Math.random() * 100),
        last_updated: new Date().toISOString(),
        next_step: currentStates[Math.floor(Math.random() * currentStates.length)]
      },
      status,
      total_amount: totalAmount,
      subtotal,
      tax_amount: taxAmount,
      customer_name: '東京商事株式会社',
      customer_email: 'order@tokyo-shoji.co.jp',
      notes: i === 0 ? '急ぎ案件です' : i === 1 ? 'デザイン変更が必要' : null,
      payment_term: i % 2 === 0 ? 'credit' : 'advance',
      shipping_address: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine1: '丸の内1-1-1',
        addressLine2: '東京駅前ビル',
        company: '東京商事株式会社',
        contactName: '田中 次郎',
        phone: '03-1234-5678'
      },
      billing_address: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine1: '丸の内1-1-1',
        addressLine2: '東京駅前ビル',
        company: '東京商事株式会社',
        contactName: '田中 次郎',
        phone: '03-1234-5678'
      },
      requested_delivery_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_notes: i % 2 === 0 ? '午前中に配信をお願いします' : null,
      estimated_delivery_date: status === 'DELIVERED' ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() :
        new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      shipped_at: status === 'SHIPPED' || status === 'DELIVERED' ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() : null,
      delivered_at: status === 'DELIVERED' ? new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString() : null,
      items: [
        {
          id: `order-item-${i}-1`,
          order_id: `order-${i + 1}`,
          product_id: `product-${(i % 5) + 1}`,
          product_name: i % 3 === 0 ? '3辺シール 100mm×50mm' :
                         i % 3 === 1 ? 'スタンドパウチ 200mm×150mm' : 'ギャザー付きパウチ',
          quantity: Math.floor(Math.random() * 20000) + 2000,
          unit_price: Math.floor(Math.random() * 100) + 10,
          total_price: Math.floor(Math.random() * 200000) + 20000,
          specifications: {
            material: i % 3 === 0 ? 'PET' : i % 3 === 1 ? 'PE' : 'AL/PE',
            thickness: i % 3 === 0 ? '12μm' : i % 3 === 1 ? '50μm' : '70μm',
            printing: '4色印刷',
            finish: i % 2 === 0 ? '光沢' : 'マット'
          },
          notes: i === 0 ? 'サンプルで承認済み' : null,
          created_at: new Date().toISOString()
        }
      ]
    };

    orders.push(order);
  }

  return orders;
}

/**
 * Generates mock sample request data for development testing
 *
 * @param {number} count - Number of sample requests to generate (default: 4)
 * @returns {MockSampleRequest[]} Array of mock sample requests
 *
 * @example
 * ```typescript
 * const sampleRequests = getMockSampleRequests();
 * console.log('Generated', sampleRequests.length, 'sample requests');
 * ```
 */
export function getMockSampleRequests(count: number = 4): MockSampleRequest[] {
  const requests: MockSampleRequest[] = [];
  const statuses: Array<'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> =
    ['received', 'processing', 'shipped', 'delivered', 'cancelled'];

  const requestNumbers = [
    `SMP-${new Date().getFullYear()}-0001`,
    `SMP-${new Date().getFullYear()}-0002`,
    `SMP-${new Date().getFullYear()}-0003`,
    `SMP-${new Date().getFullYear()}-0004`
  ];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const request: MockSampleRequest = {
      id: `sample-${i + 1}`,
      user_id: i % 2 === 0 ? DEV_MODE_USER_ID : null,
      request_number: requestNumbers[i],
      status,
      delivery_address_id: `address-${i + 1}`,
      tracking_number: status === 'shipped' || status === 'delivered' ? `YTO${Math.floor(Math.random() * 1000000000)}` : null,
      notes: i === 0 ? 'デザイン確認のためのサンプルです' : i === 1 ? '品質検証が必要です' : null,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      shipped_at: status === 'shipped' || status === 'delivered' ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() : null,
      sample_items: [
        {
          id: `sample-item-${i}-1`,
          sample_request_id: `sample-${i + 1}`,
          product_id: `product-${(i % 3) + 1}`,
          product_name: i % 3 === 0 ? '3辺シール 100mm×50mm' :
                         i % 3 === 1 ? 'スタンドパウチ 200mm×150mm' : 'ギャザー付きパウチ',
          category: i % 3 === 0 ? 'flat_3_side' : i % 3 === 1 ? 'stand_up' : 'soft_pouch',
          quantity: 3,
          created_at: new Date().toISOString()
        },
        {
          id: `sample-item-${i}-2`,
          sample_request_id: `sample-${i + 1}`,
          product_id: `product-${((i + 1) % 3) + 1}`,
          product_name: i % 3 === 0 ? 'スタンドパウチ 200mm×150mm' :
                         i % 3 === 1 ? 'ギャザー付きパウチ' : '3辺シール 100mm×50mm',
          category: i % 3 === 0 ? 'stand_up' : i % 3 === 1 ? 'soft_pouch' : 'flat_3_side',
          quantity: 2,
          created_at: new Date().toISOString()
        }
      ]
    };

    requests.push(request);
  }

  return requests;
}

/**
 * Generates mock user profiles for development testing
 *
 * @param {number} count - Number of profiles to generate (default: 5)
 * @returns {Profile[]} Array of mock profiles
 *
 * @example
 * ```typescript
 * const profiles = getMockUserProfiles();
 * console.log('Generated', profiles.length, 'profiles');
 * ```
 */
export function getMockUserProfiles(count: number = 5): Profile[] {
  const profiles: Profile[] = [];
  const companies = [
    '東京商事株式会社',
    '大阪物産有限会社',
    '名古屋テクノロジー',
    '横浜包装工業',
    '神戸流通システム'
  ];

  const roles: Array<'ADMIN' | 'MEMBER'> = ['ADMIN', 'MEMBER'];
  const statuses: Array<'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'> = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING'];

  for (let i = 0; i < count; i++) {
    const profile: Profile = {
      id: `user-${i + 1}`,
      email: `user${i + 1}@${companies[i].replace(/株式会社|有限会社/g, '').toLowerCase()}.co.jp`,
      kanji_last_name: ['田中', '佐藤', '鈴木', '高橋', '伊藤'][i],
      kanji_first_name: ['一郎', '次郎', '花子', '三郎', '真由美'][i],
      kana_last_name: ['タナカ', 'サトウ', 'スズキ', 'タカハシ', 'イトウ'][i],
      kana_first_name: ['イチロウ', 'ジロウ', 'ハナコ', 'サブロウ', 'マユミ'][i],
      corporate_phone: `03-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      personal_phone: `090-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      business_type: i % 2 === 0 ? 'CORPORATION' : 'SOLE_PROPRIETOR',
      user_type: 'B2B',
      company_name: companies[i],
      legal_entity_number: `${Math.floor(Math.random() * 900000000 + 100000000)}${Math.floor(Math.random() * 9 + 1)}`,
      corporate_number: `${Math.floor(Math.random() * 900000000 + 100000000)}${Math.floor(Math.random() * 9 + 1)}`,
      position: ['営業担当', '部長', '課長', '開発者', '購買担当'][i],
      department: ['営業部', '管理部', '技術部', '購買部', '経理部'][i],
      company_url: `https://company${i + 1}.example.com`,
      product_category: ['COSMETICS', 'CLOTHING', 'ELECTRONICS', 'KITCHEN', 'FURNITURE'][i],
      acquisition_channel: ['Web', 'Referral', 'Exhibition', 'Advertisement', 'Partner'][i],
      postal_code: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}`,
      prefecture: ['東京都', '大阪府', '愛知県', '神奈川県', '兵庫県'][i],
      city: ['千代田区', '中央区', '名古屋市', '横浜市', '神戸市'][i],
      street: `${Math.floor(Math.random() * 10 + 1)}-${Math.floor(Math.random() * 10 + 1)}-${Math.floor(Math.random() * 10 + 1)}`,
      building: `${['〇〇ビル', '△△マンション', '□□アパート', '▲▲ハイツ', '■■タワーズ'][i]}${Math.floor(Math.random() * 30) + 1}F`,
      role: roles[i % 2],
      status: statuses[i % 4],
      founded_year: `${Math.floor(Math.random() * 30) + 1990}`,
      capital: `${Math.floor(Math.random() * 9900000000 + 100000000)}円`,
      representative_name: ['田中 次郎', '佐藤 花子', '鈴木 三郎', '高橋 真由美', '伊藤 健太'][i],
      business_document_path: `/documents/company${i + 1}.pdf`,
      verification_token: i < 3 ? `token-${i + 1}` : null,
      verification_expires_at: i < 3 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: i < 3 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() : null,
    };

    profiles.push(profile);
  }

  return profiles;
}

/**
 * Test Data Constants and Helpers
 *
 * Provides reusable test data for E2E tests
 */

// =====================================================
// User Credentials
// =====================================================

export const TEST_USERS = {
  admin: {
    email: 'admin@epackage-lab.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin',
  },
  member: {
    email: 'member@test.com',
    password: 'Member1234!',
    name: 'Test Member',
    role: 'member',
  },
  koreaTeam: {
    email: 'korea@package-lab.com',
    password: 'Korea1234!',
    name: 'Korea Team',
    role: 'korea',
  },
} as const;

// =====================================================
// Test Addresses
// =====================================================

export const TEST_ADDRESSES = {
  delivery: {
    name: 'テスト配送先',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内1-1-1',
    building: 'テストビル10F',
    phone: '03-1234-5678',
    contactPerson: 'テスト担当者',
  },
  billing: {
    companyName: 'テスト株式会社',
    postalCode: '100-0002',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内2-2-2',
    building: 'テストビル5F',
    taxNumber: '1234567890123',
    email: 'billing@test.co.jp',
    phone: '03-9876-5432',
  },
} as const;

// =====================================================
// Quotation Test Data
// =====================================================

export const QUOTATION_DATA = {
  standard: {
    productType: 'stand-up-pouch',
    material: 'pet-al',
    width: 200,
    height: 300,
    depth: 80,
    quantity: 5000,
    postProcessing: ['zipper', 'notch'],
  },
  large: {
    productType: 'stand-up-pouch',
    material: 'pet-al',
    width: 300,
    height: 400,
    depth: 100,
    quantity: 10000,
    postProcessing: ['zipper', 'notch', 'hanging-hole'],
  },
  small: {
    productType: 'flat-pouch',
    material: 'pet-pe',
    width: 100,
    height: 150,
    depth: 0,
    quantity: 1000,
    postProcessing: [],
  },
} as const;

// =====================================================
// Order Status Constants
// =====================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  DATA_RECEIVED: 'data_received',
  PROCESSING: 'processing',
  MANUFACTURING: 'manufacturing',
  QUALITY_CHECK: 'quality_check',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
} as const;

export const ORDER_STATUS_LABELS = {
  pending: '登録待',
  data_received: 'データ入稿',
  processing: '処理中',
  manufacturing: '製造中',
  quality_check: '品質検査',
  shipped: '発送済み',
  delivered: '納品完了',
  cancelled: 'キャンセル',
  on_hold: '一時停止',
  completed: '完了',
} as const;

// =====================================================
// Quotation Status Constants
// =====================================================

export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
} as const;

export const QUOTATION_STATUS_LABELS = {
  draft: 'ドラフト',
  sent: '送信済み',
  approved: '承認済み',
  rejected: '却下',
  expired: '期限切れ',
  converted: '注文変換済み',
} as const;

// =====================================================
// Shipment Data
// =====================================================

export const SHIPMENT_DATA = {
  yamato: {
    carrier: 'ヤマト運輸',
    trackingNumber: '1234567890123',
    shippingDate: new Date().toISOString().split('T')[0],
  },
  sagawa: {
    carrier: '佐川急便',
    trackingNumber: '9876543210987',
    shippingDate: new Date().toISOString().split('T')[0],
  },
  japanPost: {
    carrier: '日本郵便',
    trackingNumber: '555566667777',
    shippingDate: new Date().toISOString().split('T')[0],
  },
} as const;

// =====================================================
// File Paths for Testing
// =====================================================

export const TEST_FILES = {
  valid: {
    pdf: 'test-files/samples/design.pdf',
    ai: 'test-files/samples/design.ai',
    psd: 'test-files/samples/design.psd',
  },
  invalid: {
    executable: 'test-files/invalid/test.exe',
    script: 'test-files/invalid/test.bat',
    virus: 'test-files/invalid/eicar.com',
  },
  large: {
    oversized: 'test-files/large/oversized.pdf', // >50MB
  },
} as const;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate a unique test identifier
 */
export function generateTestId(prefix: string = 'TEST'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a unique quotation number for testing
 */
export function generateTestQuotationNumber(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 90000) + 10000;
  return `TEST-${year}-${sequence}`;
}

/**
 * Generate a unique order number for testing
 */
export function generateTestOrderNumber(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 90000) + 10000;
  return `TEST-ORD-${year}-${sequence}`;
}

/**
 * Get current date in Japanese format
 */
export function getJapaneseDate(date: Date = new Date()): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get current datetime in Japanese format
 */
export function getJapaneseDateTime(date: Date = new Date()): string {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate expected delivery date (approx. 1 month from now)
 */
export function getExpectedDeliveryDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return getJapaneseDate(date);
}

/**
 * Calculate quotation expiry date (3 months from now)
 */
export function getQuotationExpiryDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return getJapaneseDate(date);
}

/**
 * Format currency amount in Japanese yen
 */
export function formatYen(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Validate quotation number format
 */
export function isValidQuotationNumber(number: string): boolean {
  return /^QUO-\d{4}-\d{5}$/.test(number);
}

/**
 * Validate order number format
 */
export function isValidOrderNumber(number: string): boolean {
  return /^ORD-\d{4}-\d{5}$/.test(number);
}

/**
 * Wait for a specific status change
 */
export async function waitForStatusChange(
  currentStatus: string,
  expectedStatus: string,
  timeout: number = 10000
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    // In real implementation, this would poll the API
    // For now, just wait
    await new Promise(resolve => setTimeout(resolve, 500));
    if (currentStatus === expectedStatus) {
      return true;
    }
  }
  return false;
}

/**
 * Create test file if it doesn't exist
 */
export function ensureTestFile(filePath: string, content: string = 'Test content'): void {
  // This would typically use fs module
  // Implementation depends on Node.js environment
  console.log(`Ensuring test file exists: ${filePath}`);
}

/**
 * Cleanup test data from database
 */
export async function cleanupTestData(testId: string): Promise<void> {
  // TODO: Implement database cleanup
  console.log(`Cleaning up test data for: ${testId}`);
}

/**
 * Retry failed operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Generate random test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}

/**
 * Generate random phone number
 */
export function generateTestPhoneNumber(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 9000) + 1000;
  const subscriber = Math.floor(Math.random() * 9000) + 1000;
  return `${area}-${exchange}-${subscriber}`;
}

/**
 * Generate random postal code
 */
export function generateTestPostalCode(): string {
  const first = Math.floor(Math.random() * 900) + 100;
  const second = Math.floor(Math.random() * 9000) + 1000;
  return `${first}-${second}`;
}

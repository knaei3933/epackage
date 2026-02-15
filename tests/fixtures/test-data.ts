/**
 * Test Data Fixtures for E2E Tests
 * E2E 테스트를 위한 테스트 데이터 픽스처
 */

import { Page } from '@playwright/test';

// =====================================================
// Test Users (테스트 사용자)
// =====================================================

export const testUsers = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234',
    role: 'ADMIN',
  },

  member: {
    email: `test-member-${Date.now()}@example.com`,
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    role: 'MEMBER',
  },

  // Japanese member with complete data
  japaneseMember: () => ({
    email: `test-${Date.now()}@testmail.cc`,
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    kanjiLastName: '田中',
    kanjiFirstName: '太郎',
    kanaLastName: 'たなか',
    kanaFirstName: 'たろう',
    corporatePhone: '03-1234-5678',
    personalPhone: '090-1234-5678',
    businessType: 'CORPORATION',
    companyName: `テスト株式会社${Date.now()}`,
    legalEntityNumber: '1234567890123',
    position: '部長',
    department: '営業部',
    companyUrl: 'https://test-example.com',
    productCategory: 'COSMETICS',
    acquisitionChannel: 'web_search',
    postalCode: '123-4567',
    prefecture: '東京都',
    city: '渋谷区',
    street: '道玄坂1-2-3',
    building: 'テストビル5F',
    privacyConsent: true,
  }),
};

// =====================================================
// Test Order Data (테스트 주문 데이터)
// =====================================================

export const testOrder = {
  basic: {
    productName: 'テストパウチ',
    quantity: 1000,
    unitPrice: 100,
  },

  // Complete order with all fields
  fullOrder: () => ({
    productName: '化粧品サンプルパウチ',
    quantity: 5000,
    width: 100,
    length: 150,
    material: 'PET_AL_PE',
    thickness: 0.1,
    printingMethod: 'GRAVURE',
    colors: 4,
    postProcessing: ['ZIPPER', 'NOTCH'],
    deliveryDate: '2025-02-01',
    deliveryAddress: {
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '丸の内1-1-1',
      building: 'テストビル',
      company: 'テスト株式会社',
      contactName: '田中 太郎',
      phone: '03-1234-5678',
    },
    specialRequirements: 'テスト用特別仕様',
  }),
};

// =====================================================
// Test Production Data (테스트 생산 데이터)
// =====================================================

export const testProduction = {
  stages: [
    'DESIGN',
    'PROOFING',
    'PLATE_MAKING',
    'PRINTING',
    'LAMINATION',
    'SLITTING',
    'BAG_MAKING',
    'QC',
    'PACKAGING',
  ],

  stageNames: {
    DESIGN: 'デザイン',
    PROOFING: '色校正',
    PLATE_MAKING: '版作成',
    PRINTING: '印刷',
    LAMINATION: 'ラミネート',
    SLITTING: 'スリット',
    BAG_MAKING: '製袋',
    QC: '品質検査',
    PACKAGING: '梱包',
  },

  // Production note template
  productionNote: (stage: string, content: string) => ({
    stage,
    content,
    createdAt: new Date().toISOString(),
    createdBy: 'test-admin',
  }),

  // Stage progress percentage
  getStageProgress: (currentStageIndex: number) => {
    return Math.round((currentStageIndex / 9) * 100);
  },
};

// =====================================================
// Test Shipment Data (테스트 배송 데이터)
// =====================================================

export const testShipment = {
  yamato: {
    carrier: 'YAMATO',
    carrierName: 'ヤマト運輸',
    serviceType: 'クロネコDM便',
    trackingNumber: '123456789012',
    pickupDate: '2025-01-15',
    pickupTimeSlot: '14-16',
  },

  sagawa: {
    carrier: 'SAGAWA',
    carrierName: '佐川急便',
    serviceType: '飛脚宅配便',
    trackingNumber: '987654321098',
    pickupDate: '2025-01-15',
    pickupTimeSlot: '12-14',
  },

  // Warehouse address (default sender)
  warehouseAddress: {
    name: 'Epackage Lab',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '丸の内1-1-1',
    building: '〇〇ビル 5F',
    phone: '03-1234-5678',
  },
};

// =====================================================
// Test File Data (테스트 파일 데이터)
// =====================================================

export const testFiles = {
  validAI: {
    name: 'test-design.ai',
    type: 'application/pdf', // Illustrator files are detected as PDF
    size: 1024 * 1024, // 1MB
    path: './tests/fixtures/files/test-design.pdf',
  },

  validPDF: {
    name: 'test-design.pdf',
    type: 'application/pdf',
    size: 1024 * 1024, // 1MB
    path: './tests/fixtures/files/test-design.pdf',
  },

  validPSD: {
    name: 'test-design.psd',
    type: 'image/vnd.adobe.photoshop',
    size: 5 * 1024 * 1024, // 5MB
    path: './tests/fixtures/files/test-design.psd',
  },

  invalidType: {
    name: 'test.txt',
    type: 'text/plain',
    size: 1024,
    path: './tests/fixtures/files/test.txt',
  },

  tooLarge: {
    name: 'huge-file.pdf',
    type: 'application/pdf',
    size: 11 * 1024 * 1024, // 11MB (exceeds 10MB limit)
    path: './tests/fixtures/files/huge-file.pdf',
  },
};

// =====================================================
// Test Quote Data (테스트 견적 데이터)
// =====================================================

export const testQuote = {
  simpleQuote: () => ({
    items: [
      {
        productName: 'スタンダードパウチ',
        quantity: 1000,
        unitPrice: 150,
        postProcessing: [],
      },
    ],
  }),

  complexQuote: () => ({
    items: [
      {
        productName: '化粧品用パウチ',
        quantity: 5000,
        unitPrice: 120,
        postProcessing: ['ZIPPER', 'NOTCH', 'HANG_HOLE'],
      },
      {
        productName: '食品用パウチ',
        quantity: 10000,
        unitPrice: 80,
        postProcessing: ['ZIPPER'],
      },
    ],
  }),

  // Expected order number format
  orderNumberFormat: /^ord-\d{4}-\d{4}$/,
  quoteNumberFormat: /^quote-\d{4}-\d{4}$/,
};

// =====================================================
// Authentication Helpers (인증 헬퍼)
// =====================================================

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login as admin
   * 관리자로 로그인
   */
  async loginAsAdmin() {
    await this.page.goto('/auth/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the form to be visible
    await this.page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });

    await this.page.fill('input[name="email"]', testUsers.admin.email);
    await this.page.fill('input[name="password"]', testUsers.admin.password);
    await this.page.click('button[type="submit"]');

    // Wait for navigation to admin dashboard
    await this.page.waitForURL('**/admin/dashboard', { timeout: 15000 }).catch(() => {
      // If no redirect, wait for potential error message
      return this.page.waitForTimeout(2000);
    });
  }

  /**
   * Login as member
   * 회원으로 로그인
   */
  async loginAsMember(email: string, password: string) {
    await this.page.goto('/auth/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the form to be visible
    await this.page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });

    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');

    // Wait for navigation to member dashboard
    await this.page.waitForURL('**/member/dashboard', { timeout: 15000 }).catch(() => {
      // If no redirect, wait for potential error message
      return this.page.waitForTimeout(2000);
    });
  }

  /**
   * Logout
   * 로그아웃
   */
  async logout() {
    await this.page.goto('/auth/signout');
    await this.page.waitForURL('**/auth/signin', { timeout: 5000 });
  }

  /**
   * Register new user
   * 신규 회원 가입
   */
  async register(userData: ReturnType<typeof testUsers.japaneseMember>) {
    await this.page.goto('/auth/register', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the form to be visible
    await this.page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });

    // Authentication info
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="passwordConfirm"]', userData.password);

    // Name fields
    await this.page.fill('input[placeholder="山田"]', userData.kanjiLastName);
    await this.page.fill('input[placeholder="太郎"]', userData.kanjiFirstName);
    await this.page.fill('input[placeholder="やまだ"]', userData.kanaLastName);
    await this.page.fill('input[placeholder="たろう"]', userData.kanaFirstName);

    // Phone numbers
    await this.page.fill('input[name="corporatePhone"]', userData.corporatePhone);
    await this.page.fill('input[name="personalPhone"]', userData.personalPhone);

    // Business type - use label text to click
    if (userData.businessType === 'CORPORATION') {
      await this.page.click('label:has-text("法人") input[type="radio"]');
      // Wait for corporation fields to appear
      await this.page.waitForSelector('input[name="companyName"]', { state: 'visible', timeout: 5000 }).catch(() => {
        console.log('Company name field not visible, checking if form is using individual mode');
      });

      // Only fill company fields if they are visible
      const companyNameVisible = await this.page.locator('input[name="companyName"]').isVisible().catch(() => false);
      if (companyNameVisible) {
        await this.page.fill('input[name="companyName"]', userData.companyName);
        await this.page.fill('input[name="legalEntityNumber"]', userData.legalEntityNumber);
        await this.page.fill('input[name="position"]', userData.position);
        await this.page.fill('input[name="department"]', userData.department);
        await this.page.fill('input[name="companyUrl"]', userData.companyUrl);
      }
    } else {
      await this.page.click('label:has-text("個人") input[type="radio"]');
    }

    // Address
    await this.page.fill('input[name="postalCode"]', userData.postalCode);
    await this.page.selectOption('select[name="prefecture"]', userData.prefecture);
    await this.page.fill('input[name="city"]', userData.city);

    // Combine street and building for the "番地・建物名" field
    const streetAndBuilding = userData.building
      ? `${userData.street} ${userData.building}`
      : userData.street;
    await this.page.fill('input[name="street"]', streetAndBuilding);

    // Product category
    await this.page.selectOption('select[name="productCategory"]', userData.productCategory);

    // Acquisition channel
    await this.page.selectOption('select[name="acquisitionChannel"]', userData.acquisitionChannel);

    // Privacy consent
    await this.page.check('input[name="privacyConsent"]');

    // Submit
    await this.page.click('button[type="submit"]');

    // Wait for navigation or response
    await this.page.waitForURL(/\/auth\/pending/, { timeout: 10000 }).catch(() => {
      // If no redirect, at least wait a bit for the API call
      return this.page.waitForTimeout(3000);
    });
  }
}

// =====================================================
// Database Cleanup Helpers (데이터베이스 정리 헬퍼)
// =====================================================

export class TestDataManager {
  private static testEmails: string[] = [];

  /**
   * Register test email for cleanup
   * 정리를 위해 테스트 이메일 등록
   */
  static registerTestEmail(email: string) {
    this.testEmails.push(email);
  }

  /**
   * Get all test emails
   * 모든 테스트 이메일 가져오기
   */
  static getTestEmails(): string[] {
    return [...this.testEmails];
  }

  /**
   * Clear test emails list
   * 테스트 이메일 목록 지우기
   */
  static clearTestEmails() {
    this.testEmails = [];
  }
}

// =====================================================
// Common Test Assertions (공통 테스트 어설션)
// =====================================================

export const assertJapaneseMessage = async (page: Page, message: string) => {
  await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
};

export const assertUrlContains = async (page: Page, path: string) => {
  const url = page.url();
  expect(url).toContain(path);
};

export const assertElementVisible = async (page: Page, selector: string) => {
  await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
};

export const assertElementHidden = async (page: Page, selector: string) => {
  await expect(page.locator(selector)).not.toBeVisible({ timeout: 5000 });
};

// =====================================================
// Wait Helpers (대기 헬퍼)
// =====================================================

export const waitForLoading = async (page: Page) => {
  await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
};

export const waitForModal = async (page: Page) => {
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
};

export const waitForToast = async (page: Page) => {
  await page.waitForSelector('[role="alert"]', { timeout: 5000 });
};

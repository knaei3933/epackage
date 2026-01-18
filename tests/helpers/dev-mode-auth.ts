import { Page } from '@playwright/test';

/**
 * DEV_MODE Authentication Helper
 *
 * Provides utility functions for handling authentication in DEV_MODE environment.
 * When DEV_MODE is enabled, the application bypasses real authentication and
 * allows direct access to member/admin pages.
 */

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.ENABLE_DEV_MOCK_AUTH === 'true';
const MEMBER_CREDENTIALS = {
  email: process.env.TEST_MEMBER_EMAIL || 'test@epackage-lab.com',
  password: process.env.TEST_MEMBER_PASSWORD || 'Test1234!'
};

/**
 * Check if the application is running in DEV_MODE
 * Checks both NEXT_PUBLIC_DEV_MODE (client-side) and ENABLE_DEV_MOCK_AUTH (server-side)
 */
export function isDevMode(): boolean {
  return IS_DEV_MODE;
}

/**
 * Authenticate and navigate to a member page
 * In DEV_MODE: Skip login and navigate directly
 * In normal mode: Perform full login flow
 */
export async function authenticateAndNavigate(
  page: Page,
  targetPath: string = '/member/dashboard'
): Promise<void> {
  if (IS_DEV_MODE) {
    // DEV_MODE: Navigate directly to the page
    await page.goto(targetPath, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    // Additional wait for list pages to load data
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
  } else {
    // Normal mode: Perform login
    await performLogin(page, targetPath);
  }
}

/**
 * Perform standard login flow
 * Uses name attribute instead of type to avoid strict mode violations
 */
async function performLogin(page: Page, targetPath: string): Promise<void> {
  await page.goto('/auth/signin', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Email input - use getByLabel for better accessibility
  await page.getByLabel('メールアドレス').fill(MEMBER_CREDENTIALS.email);

  // Password input - use name attribute to avoid strict mode violation
  await page.locator('input[name="password"]').fill(MEMBER_CREDENTIALS.password);

  // Submit button
  await page.getByRole('button', { name: 'ログイン' }).click();

  // Wait for navigation with proper error handling
  try {
    await page.waitForURL(/\/member\//, { timeout: 15000 });
  } catch {
    // If waitForURL fails, navigate manually
    await page.goto(targetPath, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  }

  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

/**
 * Navigate to a member page with proper timeout handling
 */
export async function navigateToMemberPage(
  page: Page,
  path: string,
  options: { timeout?: number; waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' } = {}
): Promise<void> {
  const { timeout = 60000, waitUntil = 'domcontentloaded' } = options;

  await page.goto(path, {
    waitUntil,
    timeout
  });

  // Additional wait for list pages
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

/**
 * Wait for page to be ready with proper error handling
 */
export async function waitForPageReady(page: Page, timeout: number = 10000): Promise<void> {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout });
  } catch (error) {
    // If domcontentloaded fails, try waiting for networkidle
    try {
      await page.waitForLoadState('networkidle', { timeout });
    } catch {
      // If both fail, just wait a fixed time
      await page.waitForTimeout(2000);
    }
  }
}

/**
 * Check if current page is a member page
 */
export function isMemberPage(url: string): boolean {
  return url.includes('/member/');
}

/**
 * Get test credentials
 */
export function getTestCredentials() {
  return MEMBER_CREDENTIALS;
}

/**
 * Setup DEV_MODE authentication for E2E tests
 * This sets the required cookie that the middleware checks for DEV_MODE bypass
 * and also sets localStorage data that the AuthContext needs
 */
export async function setupDevModeAuth(page: Page, userId: string = '00000000-0000-0001-0001-000000000001'): Promise<void> {
  if (!IS_DEV_MODE) {
    throw new Error('DEV_MODE is not enabled. Set ENABLE_DEV_MOCK_AUTH=true in environment.');
  }

  // Set the dev-mock-user-id cookie that the middleware checks
  // The cookie must be set on the base URL domain
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  await page.context().addCookies([
    {
      name: 'dev-mock-user-id',
      value: userId,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax' as const,
    }
  ]);

  console.log(`[DEV_MODE] Set dev-mock-user-id cookie: ${userId}`);

  // Create mock user data for localStorage
  const mockUserData = {
    id: userId,
    email: 'test@example.com',
    kanjiLastName: 'テスト',
    kanjiFirstName: 'ユーザー',
    kanaLastName: 'テスト',
    kanaFirstName: 'ユーザー',
    corporatePhone: '03-1234-5678',
    personalPhone: '090-1234-5678',
    businessType: 'CORPORATION',
    companyName: 'テスト会社',
    legalEntityNumber: '1234567890123',
    position: '担当者',
    department: '営業',
    companyUrl: 'https://example.com',
    productCategory: 'OTHER',
    acquisitionChannel: 'web_search',
    postalCode: '123-4567',
    prefecture: '東京都',
    city: '渋谷区',
    street: '1-2-3',
    role: 'MEMBER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    // Add a readable name for debugging
    readableName: 'test-member-001',
  };

  // Navigate to the app first to initialize localStorage context
  // Use a simple route that doesn't require auth
  await page.goto(baseURL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  // Set localStorage item using addInitScript to ensure it's set before page loads
  await page.evaluate((data) => {
    localStorage.setItem('dev-mock-user', JSON.stringify(data));
  }, mockUserData);

  console.log(`[DEV_MODE] Set dev-mock-user localStorage data`);
}

/**
 * Create an authenticated page for DEV_MODE testing
 * This is a convenience function for test.beforeAll hooks
 */
export async function createAuthenticatedPage(browser: any, userId: string = 'test-member-001'): Promise<any> {
  const page = await browser.newPage();
  await setupDevModeAuth(page, userId);
  return page;
}

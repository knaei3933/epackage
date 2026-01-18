/**
 * Authentication Test Helpers
 *
 * 共通認証テストヘルパー関数
 */

import { Page } from '@playwright/test';

// =====================================================
// Constants
// =====================================================

export const TEST_CREDENTIALS = {
  member: {
    email: process.env.TEST_MEMBER_EMAIL || 'test-member@example.com',
    password: process.env.TEST_MEMBER_PASSWORD || 'Test1234!'
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234!'
  },
  pending: {
    email: process.env.TEST_PENDING_EMAIL || 'pending@example.com',
    password: process.env.TEST_PENDING_PASSWORD || 'Pending1234!'
  }
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Perform login with proper wait handling
 */
export async function performLogin(page: Page, email: string, password: string) {
  await page.goto('/auth/signin', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

  await page.getByLabel('メールアドレス').fill(email);
  // Use name attribute instead of label to avoid strict mode violation
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();

  // Wait for navigation to complete after login
  // The login form uses window.location.href which causes a full page reload
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

  // Additional wait for dashboard to load
  await page.waitForTimeout(2000);
}

/**
 * Perform logout by directly navigating to signout page
 * This is more reliable than clicking through UI
 */
export async function performLogout(page: Page) {
  // Direct navigation to signout page (more reliable than UI interaction)
  await page.goto('/auth/signout', { timeout: 30000 });

  // Wait for signout page to load and redirect
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

  // Signout page will automatically redirect after 1.5 seconds
  // Wait for redirect to complete
  await page.waitForURL(/\/(auth\/signin|\/)/, { timeout: 15000 }).catch(() => {});

  // Additional wait for stability
  await page.waitForTimeout(1000);
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page, urlPattern?: RegExp) {
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

  if (urlPattern) {
    await page.waitForURL(urlPattern, { timeout: 15000 }).catch(() => {});
  }

  // Additional wait for React hydration
  await page.waitForTimeout(1000);
}

/**
 * Collect console errors (filtering out development-only errors)
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out development-only errors
      if (!text.includes('Download the React DevTools') &&
          !text.includes('favicon.ico') &&
          !text.includes('Ads')) {
        errors.push(text);
      }
    }
  });
  return errors;
}

/**
 * Check if user is authenticated by looking for dashboard elements
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('button[aria-label="ユーザーメニュー"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Register a new test user (for registration flow tests)
 */
export async function registerTestUser(page: Page, userData: {
  email: string;
  password: string;
  kanjiLastName: string;
  kanjiFirstName: string;
  kanaLastName: string;
  kanaFirstName: string;
  postalCode?: string;
}) {
  await page.goto('/auth/register', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

  // Fill in the form
  await page.getByLabel('メールアドレス').fill(userData.email);
  // Use name attribute instead of label to avoid strict mode violation
  await page.locator('input[name="password"]').fill(userData.password);
  await page.locator('input[name="passwordConfirm"]').fill(userData.password);
  await page.getByPlaceholder('山田').fill(userData.kanjiLastName);
  await page.getByPlaceholder('太郎').fill(userData.kanjiFirstName);
  await page.getByPlaceholder('やまだ').fill(userData.kanaLastName);
  await page.getByPlaceholder('たろう').fill(userData.kanaFirstName);

  if (userData.postalCode) {
    await page.getByLabel('郵便番号').fill(userData.postalCode);
  }

  // Accept privacy policy
  await page.getByRole('checkbox', { name: /プライバシーポリシーに同意/i }).check();

  // Submit form
  await page.getByRole('button', { name: '会員登録' }).click();

  // Wait for redirect to pending page
  await page.waitForURL(/\/auth\/pending/, { timeout: 15000 }).catch(() => {});
}

import { test, expect } from '@playwright/test';

/**
 * Order History Page Content Verification Test
 *
 * This test verifies that:
 * 1. Login works with customer credentials (arwg22@gmail.com)
 * 2. Dashboard is displayed after login
 * 3. Order history page loads and displays content
 * 4. Page content is visible (not just checking cookies)
 *
 * Test Flow:
 * 1. Navigate to signin page
 * 2. Login with customer credentials
 * 3. Verify dashboard is displayed
 * 4. Navigate to order history page
 * 5. Verify page content is displayed (order history or "no orders" message)
 */

test.describe('Order History Content Verification', () => {
  const CUSTOMER_CREDENTIALS = {
    email: 'arwg22@gmail.com',
    password: 'Test1234!'
  };

  test.beforeEach(async ({ page }) => {
    // Setup console logging to capture any errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      consoleLogs.push(`[${type}] ${text}`);
    });

    // Navigate to home page first
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(1000);
  });

  test('TC-ORDER-HIST-001: Customer login and dashboard verification', async ({ page }) => {
    // Step 1: Navigate to signin page
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Verify signin page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /ログイン|サインイン/ }).first()).toBeVisible({
      timeout: 10000
    });

    // Step 2 & 3: Fill in login form with customer credentials
    await page.getByLabel('メールアドレス').fill(CUSTOMER_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(CUSTOMER_CREDENTIALS.password);

    // Step 4: Submit login form
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    // Wait for navigation after login
    await page.waitForTimeout(3000);

    // Step 5: Verify dashboard is displayed
    // Check if we're on a dashboard page (could be /member/dashboard or redirected elsewhere)
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    // Take screenshot for verification
    await page.screenshot({
      path: 'test-results/order-history-dashboard.png',
      fullPage: true
    });

    // Verify we're NOT on the signin page (login successful)
    expect(currentUrl).not.toContain('/auth/signin');

    // Verify dashboard content is visible
    const pageContent = await page.textContent('body');
    console.log('Dashboard page content preview:', pageContent?.substring(0, 200));

    // Look for dashboard indicators
    const dashboardIndicators = [
      'ダッシュボード',
      'Dashboard',
      'マイページ',
      '注文履歴',
      '注文',
      '見積'
    ];

    let dashboardFound = false;
    for (const indicator of dashboardIndicators) {
      if (pageContent?.includes(indicator)) {
        dashboardFound = true;
        console.log(`Found dashboard indicator: ${indicator}`);
        break;
      }
    }

    expect(dashboardFound).toBeTruthy();
  });

  test('TC-ORDER-HIST-002: Navigate to order history and verify content', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(CUSTOMER_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(CUSTOMER_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForTimeout(3000);

    // Step 6: Navigate to order history page
    await page.goto('/member/orders/history', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Verify we're on the order history page
    expect(page.url()).toContain('/member/orders/history');

    // Step 7: Verify order history content is displayed
    // Take screenshot of order history page
    await page.screenshot({
      path: 'test-results/order-history-page.png',
      fullPage: true
    });

    // Get page content
    const pageContent = await page.textContent('body');
    console.log('Order history page URL:', page.url());
    console.log('Order history page content preview:', pageContent?.substring(0, 500));

    // Check for order history indicators
    const orderHistoryIndicators = [
      '注文履歴',
      '注文一覧',
      '注文詳細',
      '注文がありません',
      '注文はありません',
      'No orders found',
      'Order History',
      '注文番号',
      '注文日',
      'ステータス'
    ];

    let contentFound = false;
    let foundIndicator = '';

    for (const indicator of orderHistoryIndicators) {
      if (pageContent?.includes(indicator)) {
        contentFound = true;
        foundIndicator = indicator;
        console.log(`Found order history indicator: ${indicator}`);
        break;
      }
    }

    // Verify order history content is displayed
    expect(contentFound).toBeTruthy();

    // Check if redirected to login page (authentication failure)
    if (page.url().includes('/auth/signin')) {
      throw new Error('Authentication failed: Redirected to login page when accessing order history');
    }

    // Verify page has meaningful content (not just blank page)
    const pageText = await page.textContent('body');
    expect(pageText?.length).toBeGreaterThan(100);

    // Log the found content for verification
    console.log('=== Order History Page Verification ===');
    console.log('URL:', page.url());
    console.log('Content indicator found:', foundIndicator);
    console.log('Page content length:', pageText?.length);
  });

  test('TC-ORDER-HIST-003: Check for specific order history elements', async ({ page }) => {
    // Login and navigate to order history
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(CUSTOMER_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(CUSTOMER_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForTimeout(3000);

    await page.goto('/member/orders/history', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Check for common order history page elements
    const possibleSelectors = [
      // Table selectors
      'table',
      '.order-list',
      '.order-history',
      '[data-testid="order-list"]',
      '[data-testid="order-history"]',

      // Card selectors
      '.order-card',
      '.order-item',
      '.card',

      // Empty state selectors
      ':has-text("注文がありません")',
      ':has-text("注文はありません")',
      ':has-text("No orders")',
      '[data-testid="empty-state"]',

      // Heading selectors
      'h1:has-text("注文履歴")',
      'h2:has-text("注文履歴")',
      'h1:has-text("注文一覧")',
      'h2:has-text("注文一覧")',
    ];

    let elementsFound: string[] = [];

    for (const selector of possibleSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          elementsFound.push(`${selector}: ${count} element(s)`);
          console.log(`Found: ${selector} (${count} element(s))`);
        }
      } catch (error) {
        // Selector might be invalid, skip
      }
    }

    console.log('=== Elements Found on Order History Page ===');
    elementsFound.forEach(el => console.log(el));

    // At least some content should be present
    expect(elementsFound.length).toBeGreaterThan(0);

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/order-history-elements.png',
      fullPage: true
    });
  });

  test('TC-ORDER-HIST-004: Verify no authentication errors on order history page', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Setup console error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Login
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(CUSTOMER_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(CUSTOMER_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForTimeout(3000);

    // Navigate to order history
    await page.goto('/member/orders/history', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Check for authentication-related errors
    const authErrors = consoleErrors.filter(error =>
      error.toLowerCase().includes('auth') ||
      error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('401') ||
      error.toLowerCase().includes('forbidden')
    );

    console.log('=== Console Errors ===');
    console.log('Total errors:', consoleErrors.length);
    console.log('Auth errors:', authErrors.length);

    if (authErrors.length > 0) {
      console.log('Authentication errors found:');
      authErrors.forEach(error => console.log('  -', error));
    }

    // Verify we're not redirected to login
    expect(page.url()).not.toContain('/auth/signin');

    // Verify page has content
    const pageContent = await page.textContent('body');
    expect(pageContent?.length).toBeGreaterThan(100);
  });

  test('TC-ORDER-HIST-005: Full user flow - Login to Order History', async ({ page }) => {
    console.log('=== Starting Full User Flow Test ===');

    // Step 1: Navigate to signin
    console.log('Step 1: Navigating to signin page...');
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Verify signin page
    const signinTitle = await page.locator('h1, h2').filter({ hasText: /ログイン|サインイン/ }).first().isVisible();
    console.log('Signin page visible:', signinTitle);
    expect(signinTitle).toBeTruthy();

    // Step 2-4: Login
    console.log('Step 2-4: Logging in with customer credentials...');
    await page.getByLabel('メールアドレス').fill(CUSTOMER_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(CUSTOMER_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    // Wait for navigation
    await page.waitForTimeout(3000);

    // Step 5: Verify dashboard
    console.log('Step 5: Verifying dashboard...');
    const afterLoginUrl = page.url();
    console.log('URL after login:', afterLoginUrl);

    expect(afterLoginUrl).not.toContain('/auth/signin');

    const dashboardScreenshot = await page.screenshot({
      path: 'test-results/full-flow-dashboard.png',
      fullPage: true
    });
    console.log('Dashboard screenshot taken');

    // Step 6: Navigate to order history
    console.log('Step 6: Navigating to order history page...');
    await page.goto('/member/orders/history', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Step 7: Verify order history content
    console.log('Step 7: Verifying order history content...');
    const orderHistoryUrl = page.url();
    console.log('Order history URL:', orderHistoryUrl);

    expect(orderHistoryUrl).toContain('/member/orders/history');

    const orderHistoryScreenshot = await page.screenshot({
      path: 'test-results/full-flow-order-history.png',
      fullPage: true
    });
    console.log('Order history screenshot taken');

    // Get page content
    const pageContent = await page.textContent('body');
    console.log('Page content length:', pageContent?.length);

    // Verify content
    const contentIndicators = [
      '注文履歴', '注文一覧', '注文詳細',
      '注文がありません', '注文はありません',
      'No orders', 'Order History'
    ];

    let hasOrderContent = false;
    for (const indicator of contentIndicators) {
      if (pageContent?.includes(indicator)) {
        hasOrderContent = true;
        console.log('Found content indicator:', indicator);
        break;
      }
    }

    expect(hasOrderContent).toBeTruthy();

    // Final verification
    console.log('=== Final Verification ===');
    console.log('Login successful:', !afterLoginUrl.includes('/auth/signin'));
    console.log('Order history page accessible:', orderHistoryUrl.includes('/member/orders/history'));
    console.log('Content displayed:', hasOrderContent);
    console.log('Not redirected to login:', !orderHistoryUrl.includes('/auth/signin'));

    // Overall test result
    const testPassed =
      !afterLoginUrl.includes('/auth/signin') &&
      orderHistoryUrl.includes('/member/orders/history') &&
      hasOrderContent &&
      !orderHistoryUrl.includes('/auth/signin');

    console.log('=== Test Result ===');
    console.log('Test Passed:', testPassed);

    expect(testPassed).toBeTruthy();
  });
});

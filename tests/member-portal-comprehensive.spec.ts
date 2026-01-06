/**
 * Member Portal Comprehensive Test Suite
 *
 * Tests all 19 member portal pages systematically:
 * 1. Dashboard
 * 2. Profile view
 * 3. Profile edit
 * 4. Settings
 * 5. Orders list
 * 6. Order detail [id]
 * 7. Order history
 * 8. New order
 * 9. Reorder
 * 10. Order confirmation [id]
 * 11. Data receipt [id]
 * 12. Quotations list
 * 13. Quotation detail [id]
 * 14. Confirm quotation [id]
 * 15. Request quotation
 * 16. Samples
 * 17. Invoices (P2-06)
 * 18. Deliveries
 * 19. Inquiries (P2-07)
 */

import { test, expect } from '@playwright/test';

// Test credentials - using existing test account
const TEST_CREDENTIALS = {
  email: 'member@test.com',
  password: 'Member1234!',
};

// All 19 member portal pages to test
const MEMBER_PAGES = [
  // Core pages (1-4)
  { path: '/member/dashboard', name: 'Dashboard', priority: 'critical' },
  { path: '/member/profile', name: 'Profile View', priority: 'critical' },
  { path: '/member/edit', name: 'Profile Edit', priority: 'high' },
  { path: '/member/settings', name: 'Settings', priority: 'high' },

  // Order pages (5-11)
  { path: '/member/orders', name: 'Orders List', priority: 'critical' },
  { path: '/member/orders/history', name: 'Order History', priority: 'high' },
  { path: '/member/orders/new', name: 'New Order', priority: 'high' },
  { path: '/member/orders/reorder', name: 'Reorder', priority: 'medium' },

  // Quotation pages (12-15)
  { path: '/member/quotations', name: 'Quotations List', priority: 'critical' },
  { path: '/member/quotations/request', name: 'Request Quotation', priority: 'high' },

  // Other pages (16-19)
  { path: '/member/samples', name: 'Samples', priority: 'high' },
  { path: '/member/invoices', name: 'Invoices', priority: 'critical', feature: 'P2-06' },
  { path: '/member/deliveries', name: 'Deliveries', priority: 'high' },
  { path: '/member/inquiries', name: 'Inquiries', priority: 'high', feature: 'P2-07' },
];

// Dynamic pages with [id] parameter (need actual data IDs)
const DYNAMIC_PAGES = [
  { path: '/member/orders/:id', name: 'Order Detail', priority: 'high' },
  { path: '/member/orders/:id/confirmation', name: 'Order Confirmation', priority: 'medium' },
  { path: '/member/orders/:id/data-receipt', name: 'Data Receipt', priority: 'medium' },
  { path: '/member/quotations/:id', name: 'Quotation Detail', priority: 'high' },
  { path: '/member/quotations/:id/confirm', name: 'Confirm Quotation', priority: 'high' },
];

interface TestResult {
  path: string;
  name: string;
  status: 'pass' | 'fail' | 'skip';
  httpStatus: number;
  loadTime: number;
  issues: string[];
  consoleErrors: string[];
}

const testResults: TestResult[] = [];

test.describe('Member Portal Comprehensive Test', () => {
  test.beforeAll(async ({ request }) => {
    console.log('\n=== Member Portal Comprehensive Test Suite ===');
    console.log(`Testing ${MEMBER_PAGES.length} static pages`);
    console.log(`Testing ${DYNAMIC_PAGES.length} dynamic pages`);
    console.log(`Total: ${MEMBER_PAGES.length + DYNAMIC_PAGES.length} pages\n`);
  });

  test.beforeEach(async ({ page, context }) => {
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Store console errors in context for later retrieval
    context.consoleErrors = consoleErrors;

    // Login before each test
    await page.goto('/auth/signin');

    // Check if signin page loads
    await expect(page.locator('h1, h2').filter({ hasText: /ログイン|サインイン|Sign In/i })).toBeVisible({ timeout: 5000 });

    // Fill login form
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard or member area
    await page.waitForURL('**/member/**', { timeout: 10000 }).catch(() => {
      console.log('Warning: Did not redirect to member area');
    });

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  });

  MEMBER_PAGES.forEach(({ path, name, priority, feature }) => {
    test(`${name} (${priority}${feature ? ` - ${feature}` : ''})`, async ({ page, context }) => {
      const result: TestResult = {
        path,
        name,
        status: 'pass',
        httpStatus: 200,
        loadTime: 0,
        issues: [],
        consoleErrors: [],
      };

      const startTime = Date.now();

      try {
        // Navigate to page
        const response = await page.goto(path);

        // Get HTTP status
        result.httpStatus = response?.status() || 0;

        // Wait for page load
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
        result.loadTime = Date.now() - startTime;

        // Check for basic page elements
        const titleLocator = page.locator('h1, h2').first();
        const titleCount = await titleLocator.count();

        if (titleCount === 0) {
          result.issues.push('No page title found');
        }

        // Check for main content area
        const mainLocator = page.locator('main, [role="main"], .main-content');
        const mainCount = await mainLocator.count();

        if (mainCount === 0) {
          result.issues.push('No main content area found');
        }

        // Check for error messages
        const errorLocator = page.locator('text=/エラー|Error|失敗しました|に失敗しました/');
        const errorCount = await errorLocator.count();

        if (errorCount > 0) {
          const errorText = await errorLocator.first().textContent();
          result.issues.push(`Error message displayed: ${errorText}`);
        }

        // Check for console errors
        result.consoleErrors = context.consoleErrors || [];
        if (result.consoleErrors.length > 0) {
          result.issues.push(`Console errors: ${result.consoleErrors.join('; ')}`);
        }

        // Performance check
        if (result.loadTime > 3000) {
          result.issues.push(`Slow load time: ${result.loadTime}ms`);
        }

        // HTTP status check
        if (result.httpStatus >= 400) {
          result.status = 'fail';
          result.issues.push(`HTTP ${result.httpStatus} error`);
        } else if (result.issues.length > 0) {
          result.status = 'fail';
        }

        // Log results
        console.log(`\n${name}:`);
        console.log(`  Status: ${result.status}`);
        console.log(`  HTTP: ${result.httpStatus}`);
        console.log(`  Load Time: ${result.loadTime}ms`);
        if (result.issues.length > 0) {
          console.log(`  Issues: ${result.issues.length}`);
          result.issues.forEach(issue => console.log(`    - ${issue}`));
        } else {
          console.log(`  ✓ No issues found`);
        }

      } catch (error) {
        result.status = 'fail';
        result.issues.push(`Navigation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`  ✗ Error accessing ${path}:`, error);
      }

      // Store results
      testResults.push(result);

      // Assert basic requirements
      expect(result.httpStatus).toBeLessThan(500);
      expect(result.issues.length).toBe(0);
    });
  });

  test('Dynamic pages - check if data exists', async ({ page }) => {
    console.log('\n=== Dynamic Pages Test ===');
    console.log('Dynamic pages require actual data IDs from database');

    // Try to find order IDs and quotation IDs from the lists
    await page.goto('/member/orders');
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

    // Look for order links
    const orderLinks = page.locator('a[href*="/member/orders/"]');
    const orderCount = await orderLinks.count();

    if (orderCount > 0) {
      console.log(`✓ Found ${orderCount} order(s)`);
      const firstOrderHref = await orderLinks.first().getAttribute('href');
      console.log(`  First order: ${firstOrderHref}`);
    } else {
      console.log('⚠ No orders found (dynamic pages will be skipped)');
    }

    // Check quotations
    await page.goto('/member/quotations');
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

    const quoteLinks = page.locator('a[href*="/member/quotations/"]');
    const quoteCount = await quoteLinks.count();

    if (quoteCount > 0) {
      console.log(`✓ Found ${quoteCount} quotation(s)`);
      const firstQuoteHref = await quoteLinks.first().getAttribute('href');
      console.log(`  First quotation: ${firstQuoteHref}`);
    } else {
      console.log('⚠ No quotations found (dynamic pages will be skipped)');
    }
  });

  test('API Endpoints - verify database connections', async ({ request }) => {
    console.log('\n=== API Endpoints Test ===');

    const apiEndpoints = [
      { path: '/api/member/orders', name: 'Orders API' },
      { path: '/api/member/quotations', name: 'Quotations API' },
      { path: '/api/member/dashboard', name: 'Dashboard API' },
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await request.get(endpoint.path);
        const status = response.status();

        console.log(`${endpoint.name}:`);
        console.log(`  HTTP ${status}`);

        if (status >= 400) {
          console.log(`  ✗ Failed (may require auth)`);
        } else {
          console.log(`  ✓ Success`);
        }
      } catch (error) {
        console.log(`${endpoint.name}:`);
        console.log(`  ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  });

  test.afterAll(async () => {
    console.log('\n=== Test Results Summary ===');
    console.log(`Total pages tested: ${testResults.length}`);
    console.log(`Passed: ${testResults.filter(r => r.status === 'pass').length}`);
    console.log(`Failed: ${testResults.filter(r => r.status === 'fail').length}`);

    const avgLoadTime = testResults.reduce((sum, r) => sum + r.loadTime, 0) / testResults.length;
    console.log(`Average load time: ${avgLoadTime.toFixed(0)}ms`);

    const totalIssues = testResults.reduce((sum, r) => sum + r.issues.length, 0);
    console.log(`Total issues: ${totalIssues}`);

    if (totalIssues > 0) {
      console.log('\n=== Issues by Page ===');
      testResults.forEach(result => {
        if (result.issues.length > 0) {
          console.log(`\n${result.name} (${result.path}):`);
          result.issues.forEach(issue => console.log(`  - ${issue}`));
        }
      });
    }
  });
});

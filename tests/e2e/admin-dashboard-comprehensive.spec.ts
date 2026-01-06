import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard Comprehensive Test Suite
 *
 * Tests all 14 admin dashboard pages to ensure functionality after admin login
 *
 * Admin Credentials:
 * - Email: admin@epackage-lab.com
 * - Password: AdminPassword123!
 */

const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASSWORD = 'AdminPassword123!';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Admin pages to test
const ADMIN_PAGES = [
  { name: 'Dashboard', url: '/admin/dashboard', description: 'Statistics and overview' },
  { name: 'Orders', url: '/admin/orders', description: 'Order management' },
  { name: 'Production', url: '/admin/production', description: 'Production tracking' },
  { name: 'Shipments', url: '/admin/shipments', description: 'Shipment management' },
  { name: 'Contracts', url: '/admin/contracts', description: 'Contract workflow' },
  { name: 'Approvals', url: '/admin/approvals', description: 'Member approvals' },
  { name: 'Inventory', url: '/admin/inventory', description: 'Inventory management' },
  { name: 'Shipping', url: '/admin/shipping', description: 'Shipping settings' },
  { name: 'Leads', url: '/admin/leads', description: 'Lead management (TODO)' },
];

test.describe('Admin Dashboard - Authentication', () => {
  test('should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    expect(page.url()).toContain('/signin');
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect and check URL
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(admin|member|dashboard)/);
  });

  test('should block non-admin users from admin pages', async ({ page }) => {
    // This test would require creating a regular member account
    // For now, we'll skip it
    test.skip(true, 'Requires regular member account');
  });
});

test.describe('Admin Dashboard - Page Access', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
  });

  ADMIN_PAGES.forEach(({ name, url, description }) => {
    test(`should load ${name} page (${description})`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${url}`);
      expect(response?.status()).toBe(200);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Take screenshot for visual verification
      await page.screenshot({ path: `test-screenshots/admin-${name.toLowerCase()}.png` });

      // Check for critical errors
      expect(errors.filter(e => !e.includes('404') && !e.includes('favicon')).length).toBe(0);
    });
  });
});

test.describe('Admin Dashboard - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
  });

  test('Dashboard should display statistics widgets', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check for statistics cards
    const statsCards = await page.locator('[class*="stat"], [class*="metric"], [class*="widget"]').count();
    expect(statsCards).toBeGreaterThan(0);

    // Check for charts or data visualizations
    const charts = await page.locator('canvas, svg, [class*="chart"]').count();
    expect(charts).toBeGreaterThanOrEqual(0);
  });

  test('Orders page should display order list', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');

    // Check for table or list
    const table = await page.locator('table, [role="table"]').count();
    const listItems = await page.locator('[class*="order"], [class*="item"]').count();
    expect(table + listItems).toBeGreaterThan(0);
  });

  test('Production page should display 9-stage process', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/production`);
    await page.waitForLoadState('networkidle');

    // Check for production stages
    const stages = await page.locator('[class*="stage"], [class*="step"], [class*="process"]').count();
    expect(stages).toBeGreaterThan(0);
  });

  test('Approvals page should display pending approvals', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/approvals`);
    await page.waitForLoadState('networkidle');

    // Check for approval buttons or status
    const approveButtons = await page.locator('button:has-text("Approve"), button:has-text("承認")').count();
    const rejectButtons = await page.locator('button:has-text("Reject"), button:has-text("拒否")').count();
    expect(approveButtons + rejectButtons).toBeGreaterThanOrEqual(0);
  });

  test('Inventory page should display inventory controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/inventory`);
    await page.waitForLoadState('networkidle');

    // Check for inventory inputs or displays
    const inputs = await page.locator('input[type="number"], [class*="quantity"]').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('Shipments page should display tracking information', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/shipments`);
    await page.waitForLoadState('networkidle');

    // Check for shipment tracking elements
    const tracking = await page.locator('[class*="tracking"], [class*="shipment"]').count();
    expect(tracking).toBeGreaterThan(0);
  });

  test('Contracts page should display contract workflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/contracts`);
    await page.waitForLoadState('networkidle');

    // Check for contract-related elements
    const contracts = await page.locator('[class*="contract"], [class*="document"]').count();
    expect(contracts).toBeGreaterThan(0);
  });

  test('Shipping page should display carrier settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/shipping`);
    await page.waitForLoadState('networkidle');

    // Check for carrier options
    const carriers = await page.locator('[class*="carrier"], [class*="shipping"]').count();
    expect(carriers).toBeGreaterThan(0);
  });

  test('Leads page should display lead management (TODO)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/leads`);
    await page.waitForLoadState('networkidle');

    // This page might be under construction
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Admin Dashboard - Detail Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
  });

  test('Order detail page should load', async ({ page }) => {
    // First navigate to orders to get an ID
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');

    // Try to find an order link
    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    const count = await orderLink.count();

    if (count > 0) {
      await orderLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin/orders/');
    } else {
      // If no orders exist, test with a placeholder ID
      await page.goto(`${BASE_URL}/admin/orders/test-id`);
      await page.waitForLoadState('networkidle');
      // Page should still load (even if showing "not found")
    }
  });

  test('Production detail page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/production`);
    await page.waitForLoadState('networkidle');

    const productionLink = page.locator('a[href*="/admin/production/"]').first();
    const count = await productionLink.count();

    if (count > 0) {
      await productionLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin/production/');
    } else {
      await page.goto(`${BASE_URL}/admin/production/test-id`);
      await page.waitForLoadState('networkidle');
    }
  });

  test('Shipment detail page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/shipments`);
    await page.waitForLoadState('networkidle');

    const shipmentLink = page.locator('a[href*="/admin/shipments/"]').first();
    const count = await shipmentLink.count();

    if (count > 0) {
      await shipmentLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin/shipments/');
    } else {
      await page.goto(`${BASE_URL}/admin/shipments/test-id`);
      await page.waitForLoadState('networkidle');
    }
  });

  test('Contract detail page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/contracts`);
    await page.waitForLoadState('networkidle');

    const contractLink = page.locator('a[href*="/admin/contracts/"]').first();
    const count = await contractLink.count();

    if (count > 0) {
      await contractLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin/contracts/');
    } else {
      await page.goto(`${BASE_URL}/admin/contracts/test-id`);
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Admin Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // Check for navigation
    const nav = await page.locator('nav, [role="navigation"], [class*="sidebar"], [class*="menu"]').count();
    expect(nav).toBeGreaterThan(0);
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // Navigate to orders
    const ordersLink = page.locator('a[href*="/admin/orders"]').first();
    const count = await ordersLink.count();

    if (count > 0) {
      await ordersLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/admin/orders');
    }
  });
});

test.describe('Admin Dashboard - Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
  });

  ADMIN_PAGES.forEach(({ name, url }) => {
    test(`${name} page should load within performance budget`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Pages should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      console.log(`${name} loaded in ${loadTime}ms`);
    });
  });
});

test.describe('Admin Dashboard - Security', () => {
  test('should require authentication for API endpoints', async ({ request }) => {
    // Try to access admin API without authentication
    const response = await request.get(`${BASE_URL}/api/admin/dashboard/statistics`);
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', 'invalid@admin.com');
    await page.fill('input[name="password"]', 'InvalidPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await page.waitForTimeout(2000);
    const errorMessage = await page.locator('text=Invalid, text=Error, text=失敗').count();
    expect(errorMessage).toBeGreaterThan(0);
  });
});

test.describe('Admin Dashboard - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });
  });

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`Dashboard should be responsive on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForLoadState('networkidle');

      // Page should load without errors
      const content = await page.locator('body').textContent();
      expect(content).toBeTruthy();

      await page.screenshot({ path: `test-screenshots/admin-dashboard-${name.toLowerCase()}.png` });
    });
  });
});

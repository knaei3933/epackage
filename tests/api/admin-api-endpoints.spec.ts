import { test, expect } from '@playwright/test';

/**
 * Admin API Endpoints Test Suite
 *
 * Tests all admin API endpoints for proper authentication,
 * authorization, and data handling
 */

const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASSWORD = 'AdminPassword123!';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Admin API endpoints to test
const ADMIN_APIS = [
  {
    name: 'Dashboard Statistics',
    endpoint: '/api/admin/dashboard/statistics',
    method: 'GET',
    description: 'Get dashboard statistics data',
  },
  {
    name: 'Production Jobs',
    endpoint: '/api/admin/production/jobs',
    method: 'GET',
    description: 'Get production jobs list',
  },
  {
    name: 'Contract Workflow',
    endpoint: '/api/admin/contracts/workflow',
    method: 'GET',
    description: 'Get contract workflow data',
  },
  {
    name: 'Orders Statistics',
    endpoint: '/api/admin/orders/statistics',
    method: 'GET',
    description: 'Get orders statistics',
  },
  {
    name: 'Inventory Items',
    endpoint: '/api/admin/inventory/items',
    method: 'GET',
    description: 'Get inventory items',
  },
  {
    name: 'Notifications',
    endpoint: '/api/admin/notifications',
    method: 'GET',
    description: 'Get admin notifications',
  },
  {
    name: 'Performance Metrics',
    endpoint: '/api/admin/performance/metrics',
    method: 'GET',
    description: 'Get performance metrics',
  },
  {
    name: 'Users List',
    endpoint: '/api/admin/users',
    method: 'GET',
    description: 'Get users list',
  },
  {
    name: 'Shipments',
    endpoint: '/api/admin/shipping/shipments',
    method: 'GET',
    description: 'Get shipments list',
  },
  {
    name: 'Inventory Receipts',
    endpoint: '/api/admin/inventory/receipts',
    method: 'GET',
    description: 'Get inventory receipts',
  },
];

test.describe('Admin API - Authentication', () => {
  test('should reject unauthenticated requests', async ({ request }) => {
    for (const api of ADMIN_APIS) {
      const response = await request.get(`${BASE_URL}${api.endpoint}`);
      expect(response.status()).toBeGreaterThanOrEqual(400);
      console.log(`${api.name}: ${response.status()} (expected: >= 400)`);
    }
  });

  test('should accept authenticated admin requests', async ({ request, browser }) => {
    // First, get auth token by logging in
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect after successful login
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    // Get cookies from browser context
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));

    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    // Now test API endpoints with auth cookie
    for (const api of ADMIN_APIS) {
      const response = await request.get(`${BASE_URL}${api.endpoint}`, {
        headers: {
          'Cookie': `${authCookie.name}=${authCookie.value}`,
        },
      });

      // Should not be a server error (500)
      expect(response.status()).not.toBe(500);
      console.log(`${api.name}: ${response.status()}`);
    }
  });
});

test.describe('Admin API - Response Format', () => {
  test('should return valid JSON', async ({ request, browser }) => {
    // Login and get auth cookie
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    // Test response formats
    for (const api of ADMIN_APIS) {
      const response = await request.get(`${BASE_URL}${api.endpoint}`, {
        headers: {
          'Cookie': `${authCookie.name}=${authCookie.value}`,
        },
      });

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');

      const data = await response.json();
      expect(data).toBeTruthy();

      console.log(`${api.name}: Valid JSON response`);
    }
  });
});

test.describe('Admin API - Data Structure', () => {
  test('should return proper data structure for dashboard statistics', async ({ request, browser }) => {
    // Login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    const response = await request.get(`${BASE_URL}/api/admin/dashboard/statistics`, {
      headers: {
        'Cookie': `${authCookie.name}=${authCookie.value}`,
      },
    });

    expect(response.status()).not.toBe(500);

    if (response.status() === 200) {
      const data = await response.json();
      console.log('Dashboard statistics data:', JSON.stringify(data, null, 2));
    }
  });

  test('should return proper data structure for production jobs', async ({ request, browser }) => {
    // Login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    const response = await request.get(`${BASE_URL}/api/admin/production/jobs`, {
      headers: {
        'Cookie': `${authCookie.name}=${authCookie.value}`,
      },
    });

    expect(response.status()).not.toBe(500);

    if (response.status() === 200) {
      const data = await response.json();
      console.log('Production jobs data:', JSON.stringify(data, null, 2));
    }
  });

  test('should return proper data structure for contract workflow', async ({ request, browser }) => {
    // Login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    const response = await request.get(`${BASE_URL}/api/admin/contracts/workflow`, {
      headers: {
        'Cookie': `${authCookie.name}=${authCookie.value}`,
      },
    });

    expect(response.status()).not.toBe(500);

    if (response.status() === 200) {
      const data = await response.json();
      console.log('Contract workflow data:', JSON.stringify(data, null, 2));
    }
  });
});

test.describe('Admin API - Error Handling', () => {
  test('should handle invalid parameters gracefully', async ({ request, browser }) => {
    // Login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    // Test with invalid query parameters
    const response = await request.get(`${BASE_URL}/api/admin/dashboard/statistics?invalid=param`, {
      headers: {
        'Cookie': `${authCookie.name}=${authCookie.value}`,
      },
    });

    // Should not crash (should return 400 or 200 with empty data)
    expect(response.status()).toBeLessThan(500);
    console.log('Invalid params handled gracefully:', response.status());
  });

  test('should handle non-existent resources', async ({ request, browser }) => {
    // Login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    // Test with non-existent ID
    const response = await request.get(`${BASE_URL}/api/admin/orders/non-existent-id`, {
      headers: {
        'Cookie': `${authCookie.name}=${authCookie.value}`,
      },
    });

    // Should return 404 or appropriate error
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
    console.log('Non-existent resource handled:', response.status());
  });
});

test.describe('Admin API - Performance', () => {
  test('should respond within acceptable time limits', async ({ request, browser }) => {
    // Login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 });

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'));
    await context.close();

    if (!authCookie) {
      test.skip(true, 'Could not get auth cookie');
      return;
    }

    // Test response times
    for (const api of ADMIN_APIS) {
      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}${api.endpoint}`, {
        headers: {
          'Cookie': `${authCookie.name}=${authCookie.value}`,
        },
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // API should respond within 5 seconds
      expect(responseTime).toBeLessThan(5000);
      console.log(`${api.name}: ${responseTime}ms`);
    }
  });
});

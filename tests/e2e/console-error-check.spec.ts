import { test, expect } from '@playwright/test';

/**
 * Console Error Check Test
 *
 * This test visits all pages and checks for console errors
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/catalog', name: 'Catalog' },
  { path: '/quote-simulator', name: 'Quote Simulator' },
  { path: '/samples', name: 'Samples' },
  { path: '/contact', name: 'Contact' },
  { path: '/b2b/login', name: 'B2B Login' },
  { path: '/b2b/register', name: 'B2B Register' },
  { path: '/b2b/dashboard', name: 'B2B Dashboard' },
  { path: '/member/dashboard', name: 'Member Dashboard' },
  { path: '/member/quotations', name: 'Member Quotations' },
  { path: '/member/orders', name: 'Member Orders' },
  { path: '/member/edit', name: 'Member Edit' },
  { path: '/admin/dashboard', name: 'Admin Dashboard' },
  { path: '/admin/orders', name: 'Admin Orders' },
  { path: '/admin/quotations', name: 'Admin Quotations' },
  { path: '/admin/shipments', name: 'Admin Shipments' },
];

test.describe('Console Error Check', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name}: No console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // Listen for console errors and warnings
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      // Listen for page errors
      page.on('pageerror', error => {
        consoleErrors.push(`Page Error: ${error.message}`);
      });

      // Navigate to the page
      const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Wait a bit for any async errors
      await page.waitForTimeout(2000);

      // Log results
      console.log(`\n=== ${pageInfo.name} (${pageInfo.path}) ===`);
      console.log(`Status: ${response?.status()}`);

      if (consoleErrors.length > 0) {
        console.log(`❌ Console Errors (${consoleErrors.length}):`);
        consoleErrors.forEach(err => console.log(`  - ${err}`));
      } else {
        console.log(`✅ No console errors`);
      }

      if (consoleWarnings.length > 0) {
        console.log(`⚠️  Console Warnings (${consoleWarnings.length}):`);
        consoleWarnings.forEach(warn => console.log(`  - ${warn}`));
      } else {
        console.log(`✅ No console warnings`);
      }

      // Assert no console errors
      expect(consoleErrors.length).toBe(0);

      // Page should load without crashing
      expect(response?.status()).toBeLessThan(600);
    });
  }
});

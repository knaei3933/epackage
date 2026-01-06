import { test, expect } from '@playwright/test';

test('Admin login test', async ({ page }) => {
  console.log('Starting admin login test...');

  // Navigate to login page
  await page.goto('http://localhost:3000/signin');
  await page.waitForLoadState('networkidle');
  console.log('✅ Login page loaded');

  // Fill login form
  await page.fill('input[placeholder="example@company.com"]', 'admin@epackage-lab.com');
  await page.fill('input[placeholder="••••••••"]', 'Admin1234');
  console.log('✅ Login form filled');

  // Take screenshot
  await page.screenshot({ path: 'screenshots/05-login-test.png', fullPage: true });
  console.log('📸 Screenshot: 05-login-test.png');

  // Submit login
  await page.click('button[type="submit"]');
  console.log('✅ Login submitted');

  // Wait for navigation
  await page.waitForTimeout(5000);

  // Take screenshot after login
  await page.screenshot({ path: 'screenshots/06-after-login-test.png', fullPage: true });
  console.log('📸 Screenshot: 06-after-login-test.png');

  // Check current URL
  console.log('Current URL:', page.url());

  // Keep page open for viewing
  await page.waitForTimeout(60000);

  console.log('\n✅ Test completed!');
});

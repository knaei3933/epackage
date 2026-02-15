/**
 * Debug test for cookie verification
 *
 * This test uses Playwright's CDP to inspect cookies
 * that are not accessible via JavaScript (httpOnly cookies)
 */

import { test, expect } from '@playwright/test';

test.describe('Cookie Debug Test', () => {
  test('should verify cookies are set using CDP', async ({ page, context }) => {
    // Enable CDP
    const client = await context.newCDPSession(page);

    // Navigate to signin page
    await page.goto('http://localhost:3005/auth/signin');

    // Fill in login credentials
    await page.fill('input[name="email"]', 'arwg22@gmail.com');
    await page.fill('input[name="password"]', 'Test1234!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/member\/dashboard/, { timeout: 15000 });

    // Wait for cookies to be set
    await page.waitForTimeout(3000);

    // Use CDP to get all cookies (including httpOnly)
    const cookiesResult = await client.send('Network.getAllCookies');
    const cookies = cookiesResult.cookies || [];

    console.log('All cookies from CDP:', cookies.length);
    console.log('Supabase cookies:', cookies.filter((c: any) => c.name.includes('sb-')).map((c: any) => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite,
      value: c.value ? 'set' : 'empty',
    })));

    // Verify Supabase cookies exist
    const sbCookies = cookies.filter((c: any) => c.name.includes('sb-'));
    expect(sbCookies.length).toBeGreaterThan(0);

    // Try to navigate to quotations page
    await page.goto('http://localhost:3005/member/quotations');

    // Check if we're still authenticated
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);

    // If we're on quotations page, cookies are working
    // If we're redirected to signin, cookies are not being sent
    if (currentUrl.includes('/member/quotations')) {
      console.log('SUCCESS: Cookies are being sent with requests');
    } else {
      console.log('FAILURE: Cookies are NOT being sent with requests');
      console.log('Expected URL to include /member/quotations');
      console.log('Actual URL:', currentUrl);
    }
  });
});

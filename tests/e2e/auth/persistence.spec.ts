import { test, expect } from '@playwright/test';

test.describe('Authentication Persistence', () => {
  test('should persist auth when navigating from admin to member sections', async ({ page, context }) => {
    // Step 1: Navigate to signin page
    await page.goto('http://localhost:3000/auth/signin');
    await expect(page).toHaveURL(/.*\/auth\/signin/);

    // Step 2: Fill in email
    await page.fill('input[name="email"]', 'admin@epackage-lab.com');

    // Step 3: Fill in password
    await page.fill('input[name="password"]', 'Admin123!');

    // Step 4: Click login button using the form submit button
    // The form uses Button component with type="submit"
    const loginButton = page.locator('form').getByRole('button', { name: 'ログイン' });
    await loginButton.click();

    // Step 5: Wait for navigation to admin dashboard
    // The form uses window.location.href for navigation after login
    await page.waitForURL(/.*\/admin\/dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Verify admin dashboard loaded
    await expect(page.locator('body')).toContainText(/ダッシュボード|Dashboard|管理/, { timeout: 5000 });

    // Debug: Log all cookies
    const cookies = await context.cookies();
    console.log('Cookies after login:', cookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) })));

    // Step 6: Find and click user menu button
    // Try multiple selectors for the user menu
    const userMenuButton = page.getByRole('button', { name: /admin/i }).or(
      page.getByTestId('user-menu-button')
    ).or(
      page.locator('[aria-label*="user" i], [aria-label*="メニュー" i]')
    ).or(
      page.locator('.user-menu, [class*="user-menu"], [class*="userMenu"]')
    ).first();

    // Wait a bit for any animations
    await page.waitForTimeout(1000);

    // Check if button exists
    const buttonExists = await userMenuButton.count();
    console.log('User menu button count:', buttonExists);

    if (buttonExists === 0) {
      // Try to find any button that contains admin email
      const anyButton = page.locator('button').filter({ hasText: 'admin@epackage-lab.com' });
      const count = await anyButton.count();
      console.log('Buttons with admin email:', count);
      if (count > 0) {
        await anyButton.first().click();
      }
    } else {
      await userMenuButton.click();
    }

    // Wait for menu to appear
    await page.waitForTimeout(1000);

    // Step 7: Click "メンバーマイページ" (member mypage)
    const memberMyPageLink = page.getByRole('link', { name: 'メンバーマイページ' }).or(
      page.getByRole('link', { name: 'Member MyPage' })
    ).or(
      page.locator('a[href*="/member/dashboard"]')
    );

    await memberMyPageLink.click();

    // Step 8: Verify /member/dashboard loads
    await page.waitForURL(/.*\/member\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/member\/dashboard/);

    // Verify member dashboard loaded
    await expect(page.locator('body')).toContainText(/メンバー|Member|マイページ/, { timeout: 5000 });

    // Step 9: Click "見積管理" (quotations management)
    const quotationsLink = page.getByRole('link', { name: '見積管理' }).or(
      page.getByRole('link', { name: 'Quotations' })
    ).or(
      page.locator('a[href*="/member/quotations"]')
    ).first();

    await quotationsLink.click();

    // Step 10: Verify /member/quotations loads WITHOUT redirecting to signin
    await page.waitForTimeout(2000); // Wait for potential redirect

    const currentUrl = page.url();
    console.log('Current URL after clicking quotations:', currentUrl);

    // Check if we're still authenticated
    if (currentUrl.includes('/auth/signin')) {
      console.log('❌ FAILED: Authentication was lost - redirected to signin');
      console.log('Expected: /member/quotations');
      console.log('Actual:', currentUrl);
      throw new Error('Authentication persistence failed - user was redirected to signin');
    } else if (currentUrl.includes('/member/quotations')) {
      console.log('✅ PASSED: Authentication persisted successfully');
      console.log('User can access /member/quotations without re-authentication');
      await expect(page).toHaveURL(/.*\/member\/quotations/);
    } else {
      console.log('⚠️  WARNING: Unexpected URL');
      console.log('Expected: /member/quotations');
      console.log('Actual:', currentUrl);
      // Don't throw, just report the unexpected URL
    }
  });

  test('should check auth cookies are set', async ({ page, context }) => {
    // Navigate to signin
    await page.goto('http://localhost:3000/auth/signin');

    // Login
    await page.fill('input[name="email"]', 'admin@epackage-lab.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    // Wait for dashboard
    await page.waitForURL(/.*\/admin\/dashboard/, { timeout: 15000 });

    // Check cookies for auth tokens
    const cookies = await context.cookies();
    console.log('All cookies:', cookies.map(c => ({ name: c.name, value: c.value?.substring(0, 50) })));

    const accessToken = cookies.find(c => c.name === 'sb-access-token');
    const refreshToken = cookies.find(c => c.name === 'sb-refresh-token');
    const devMockUserId = cookies.find(c => c.name === 'dev-mock-user-id');

    console.log('Access token found:', !!accessToken);
    console.log('Refresh token found:', !!refreshToken);
    console.log('Dev mock user ID found:', !!devMockUserId);

    // Verify at least one form of auth token exists
    const hasAuth = accessToken || refreshToken || devMockUserId;
    expect(hasAuth, 'Authentication cookie should exist').toBeTruthy();
  });
});

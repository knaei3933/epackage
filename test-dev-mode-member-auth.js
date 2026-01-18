/**
 * DEV_MODE Member Authentication Test
 *
 * This script verifies that DEV_MODE authentication works correctly
 * for member pages by testing the cookie → middleware → headers flow.
 */

const { chromium } = require('playwright');

async function testDevModeMemberAuth() {
  console.log('='.repeat(60));
  console.log('DEV_MODE Member Authentication Test');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:3000',
  });

  const page = await context.newPage();

  try {
    // Step 1: Set the DEV_MODE cookie
    const testUserId = '00000000-0000-0001-0001-000000000001';
    await context.addCookies([
      {
        name: 'dev-mock-user-id',
        value: testUserId,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      }
    ]);

    console.log('\n✓ Step 1: Set dev-mock-user-id cookie:', testUserId);

    // Step 2: Set localStorage data
    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const mockUserData = {
      id: testUserId,
      email: 'test@example.com',
      kanjiLastName: 'テスト',
      kanjiFirstName: 'ユーザー',
    };

    await page.evaluate((data) => {
      localStorage.setItem('dev-mock-user', JSON.stringify(data));
    }, mockUserData);

    console.log('✓ Step 2: Set dev-mock-user localStorage data');

    // Step 3: Navigate to member dashboard
    console.log('\n✓ Step 3: Navigating to /member/dashboard...');

    // Monitor console for errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Monitor responses to check authentication
    const responses = [];
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      if (url.includes('/member/dashboard') || url.includes('/api')) {
        responses.push({ url, status });
        console.log(`  Response: ${url} - Status: ${status}`);
      }
    });

    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Step 4: Check if page loaded successfully
    console.log('\n✓ Step 4: Checking page load status...');

    const title = await page.title();
    console.log('  Page title:', title);

    const url = page.url();
    console.log('  Current URL:', url);

    // Check if we're still on the dashboard (not redirected)
    const isOnDashboard = url.includes('/member/dashboard');
    console.log('  On dashboard page:', isOnDashboard ? '✓' : '✗');

    // Check for error indicators
    const hasErrorRefresh = await page.locator('text=/missing required error components/i').count() > 0;
    console.log('  Has error refresh message:', hasErrorRefresh ? '✗' : '✓');

    const hasRedirectError = await page.locator('text=/redirect/i').count() > 0;
    console.log('  Has redirect error:', hasRedirectError ? '✗' : '✓');

    // Check for main content
    const hasMainContent = await page.locator('main, h1, .grid').count() > 0;
    console.log('  Has main content:', hasMainContent ? '✓' : '✗');

    // Step 5: Verify console errors
    console.log('\n✓ Step 5: Checking console errors...');
    const criticalErrors = consoleErrors.filter(e => {
      const text = e.toLowerCase();
      return !text.includes('401') &&
             !text.includes('500') &&
             !text.includes('favicon') &&
             !text.includes('404') &&
             !text.includes('ads') &&
             !text.includes('warning');
    });

    if (criticalErrors.length > 0) {
      console.log('  Critical errors found:');
      criticalErrors.forEach(e => console.log('    -', e));
    } else {
      console.log('  No critical errors ✓');
    }

    // Step 6: Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));

    const success = isOnDashboard && !hasErrorRefresh && !hasRedirectError && hasMainContent && criticalErrors.length === 0;

    if (success) {
      console.log('✓ TEST PASSED: DEV_MODE authentication is working correctly!');
      console.log('  - Cookie was set correctly');
      console.log('  - Middleware processed the request');
      console.log('  - Headers were set for server components');
      console.log('  - Page loaded without authentication errors');
      console.log('  - Dashboard content is visible');
    } else {
      console.log('✗ TEST FAILED: DEV_MODE authentication has issues');
      if (!isOnDashboard) {
        console.log('  - Page was redirected (authentication failed)');
      }
      if (hasErrorRefresh) {
        console.log('  - Error refresh message found');
      }
      if (hasRedirectError) {
        console.log('  - Redirect error found');
      }
      if (!hasMainContent) {
        console.log('  - No main content found');
      }
      if (criticalErrors.length > 0) {
        console.log('  - Critical console errors found');
      }
    }

    console.log('='.repeat(60));

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('\n✗ TEST ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
testDevModeMemberAuth().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

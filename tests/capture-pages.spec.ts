import { test, expect } from '@playwright/test';

test('Capture login and member pages', async ({ page }) => {
  console.log('Capturing pages...\n');

  // 1. Login page screenshot
  await page.goto('http://localhost:3000/signin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/1-signin-page.png', fullPage: true });
  console.log('✅ 1-signin-page.png');

  // Try to find email input by different selectors
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.fill('admin@epackage-lab.com');
    console.log('✅ Email filled');
  } else {
    console.log('❌ Email input not found');
  }

  // Try password inputs
  const passwordInputs = await page.$$('input[type="password"]');
  console.log(`Found ${passwordInputs.length} password inputs`);

  if (passwordInputs.length > 0) {
    await passwordInputs[0].fill('Admin1234');
    console.log('✅ Password filled');
  }

  await page.screenshot({ path: 'screenshots/2-signin-filled.png', fullPage: true });
  console.log('✅ 2-signin-filled.png');

  // Try to submit
  const submitButton = await page.$('button[type="submit"]');
  if (submitButton) {
    await submitButton.click();
    console.log('✅ Login clicked');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/3-after-login.png', fullPage: true });
    console.log('✅ 3-after-login.png');
    console.log('Current URL:', page.url());
  }

  // 4. Member profile page (try direct access)
  await page.goto('http://localhost:3000/member/profile');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/4-member-profile.png', fullPage: true });
  console.log('✅ 4-member-profile.png');

  // 5. Quotations page
  await page.goto('http://localhost:3000/member/quotations');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/5-member-quotations.png', fullPage: true });
  console.log('✅ 5-member-quotations.png');

  // 6. Settings page
  await page.goto('http://localhost:3000/member/settings');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/6-member-settings.png', fullPage: true });
  console.log('✅ 6-member-settings.png');

  console.log('\n✅ All screenshots captured!');
  console.log('Check screenshots/ folder');

  // Keep browser open for 30 seconds
  await page.waitForTimeout(30000);
});

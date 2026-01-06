import { test, expect } from '@playwright/test';

test('Create admin account and login', async ({ page }) => {
  console.log('Starting admin account creation...');

  // Step 1: Navigate to register page
  await page.goto('http://localhost:3000/auth/register');
  await page.waitForLoadState('networkidle');
  console.log('✅ Register page loaded');
  await page.waitForTimeout(1000);

  // Step 2: Fill registration form using label-based selectors

  // Email
  await page.fill('input[type="email"]', 'admin@epackage-lab.com');
  console.log('✅ Email filled');

  // Password
  await page.fill('input[type="password"]', 'Admin1234');
  console.log('✅ Password filled');

  // Japanese Name - Kanji fields (using placeholder)
  await page.fill('input[placeholder="山田"]', '管理');
  await page.fill('input[placeholder="太郎"]', '者');
  console.log('✅ Kanji name filled');

  // Japanese Name - Kana fields (using placeholder)
  await page.fill('input[placeholder="やまだ"]', 'かんり');
  await page.fill('input[placeholder="たろう"]', 'しゃ');
  console.log('✅ Kana name filled');

  // Phone
  await page.fill('input[placeholder="090-1234-5678"]', '09012345678');
  console.log('✅ Phone filled');

  // Business Type - Select CORPORATION
  await page.click('input[value="CORPORATION"]');
  console.log('✅ Business type selected');

  // Wait for form to be ready
  await page.waitForTimeout(500);

  // Product Category - Select OTHER using text
  await page.selectOption('select[name="productCategory"]', 'OTHER');
  console.log('✅ Product category selected');

  // Privacy Consent
  await page.check('input[type="checkbox"]');
  console.log('✅ Privacy consent checked');

  // Take screenshot before submit
  await page.screenshot({ path: 'screenshots/01-register-form.png', fullPage: true });
  console.log('📸 Screenshot: 01-register-form.png');

  // Step 3: Submit form
  await page.click('button[type="submit"]');
  console.log('✅ Form submitted');

  // Wait for response
  await page.waitForTimeout(5000);

  // Take screenshot after registration
  await page.screenshot({ path: 'screenshots/02-after-register.png', fullPage: true });
  console.log('📸 Screenshot: 02-after-register.png');

  console.log('\n========================================');
  console.log('✅ Registration completed!');
  console.log('========================================');
  console.log('📧 Email: admin@epackage-lab.com');
  console.log('🔑 Password: Admin1234');
  console.log('\n⚠️  NOW RUN THIS SQL IN SUPABASE DASHBOARD:');
  console.log('https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp/sql');
  console.log('\nUPDATE profiles');
  console.log("SET role = 'ADMIN', status = 'ACTIVE'");
  console.log("WHERE email = 'admin@epackage-lab.com';");
  console.log('\nWaiting 10 seconds before continuing...');
  console.log('========================================\n');

  // Wait for user to run SQL
  await page.waitForTimeout(10000);

  // Step 4: Navigate to login
  await page.goto('http://localhost:3000/signin');
  await page.waitForLoadState('networkidle');
  console.log('✅ Login page loaded');

  // Step 5: Fill login form
  await page.fill('input[placeholder="example@company.com"]', 'admin@epackage-lab.com');
  await page.fill('input[placeholder="••••••••"]', 'Admin1234');
  await page.screenshot({ path: 'screenshots/03-login-form.png', fullPage: true });
  console.log('📸 Screenshot: 03-login-form.png');

  // Step 6: Submit login
  await page.click('button[type="submit"]');
  console.log('✅ Login submitted');

  // Wait for navigation
  await page.waitForTimeout(5000);

  // Take screenshot after login
  await page.screenshot({ path: 'screenshots/04-after-login.png', fullPage: true });
  console.log('📸 Screenshot: 04-after-login.png');

  console.log('\n========================================');
  console.log('✅ Login completed!');
  console.log('========================================');
  console.log('Check screenshots in screenshots/ folder:');
  console.log('- 01-register-form.png');
  console.log('- 02-after-register.png');
  console.log('- 03-login-form.png');
  console.log('- 04-after-login.png');
  console.log('========================================\n');

  // Keep page open for viewing
  await page.waitForTimeout(60000);
});

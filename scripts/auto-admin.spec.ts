import { test, expect } from '@playwright/test';

test('Create admin account and login', async ({ page, context }) => {
  console.log('Starting admin account creation...');

  // Step 1: Navigate to register page
  await page.goto('http://localhost:3000/auth/register');
  await page.waitForLoadState('networkidle');
  console.log('✅ Register page loaded');

  // Wait for form to be ready
  await page.waitForTimeout(1000);

  // Step 2: Fill registration form
  await page.fill('input[name="email"]', 'admin@epackage-lab.com');
  await page.fill('input[name="password"]', 'Admin1234');
  await page.fill('input[name="kanjiLastName"]', '管理');
  await page.fill('input[name="kanjiFirstName"]', '者');
  await page.fill('input[name="kanaLastName"]', 'かんり');
  await page.fill('input[name="kanaFirstName"]', 'しゃ');
  await page.fill('input[name="personalPhone"]', '09012345678');

  // Select business type - wait and click
  await page.waitForSelector('select[name="businessType"]', { timeout: 5000 });
  await page.selectOption('select[name="businessType"]', 'CORPORATION');

  // Select product category
  await page.waitForSelector('select[name="productCategory"]', { timeout: 5000 });
  await page.selectOption('select[name="productCategory"]', 'OTHER');

  console.log('✅ Form filled');

  // Take screenshot before submit
  await page.screenshot({ path: 'screenshots/01-register-form.png' });
  console.log('📸 Screenshot: 01-register-form.png');

  // Step 3: Submit form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Check result
  const currentUrl = page.url();
  console.log('Current URL after registration:', currentUrl);

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
  console.log('\nThen press ENTER to continue to login...');
  console.log('========================================\n');

  // Wait for user to run SQL
  await page.waitForTimeout(10000);

  // Step 4: Navigate to login
  await page.goto('http://localhost:3000/signin');
  await page.waitForLoadState('networkidle');
  console.log('✅ Login page loaded');

  // Step 5: Fill login form
  await page.fill('input[name="email"]', 'admin@epackage-lab.com');
  await page.fill('input[name="password"]', 'Admin1234');
  await page.screenshot({ path: 'screenshots/03-login-form.png' });
  console.log('📸 Screenshot: 03-login-form.png');

  // Step 6: Submit login
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

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

  // Keep page open for 30 seconds
  await page.waitForTimeout(30000);
});

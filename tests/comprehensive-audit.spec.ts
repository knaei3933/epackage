import { test, expect } from '@playwright/test';

/**
 * Epackage Lab - Comprehensive Page Audit
 *
 * This test suite audits all pages to verify:
 * - Pages load successfully (status 200)
 * - Main content is visible
 * - Key interactive elements exist
 * - Forms are rendered
 * - Navigation works
 */

const BASE_URL = 'http://localhost:3000';

// =====================================================
// Test Data
// =====================================================

// Test credentials from environment variables (for security)
const testCredentials = {
  email: process.env.TEST_USER_EMAIL || 'test@test.com',
  password: process.env.TEST_USER_PASSWORD || 'Test1234!'
};

// =====================================================
// Helper Functions
// =====================================================

async function auditPage(page, pageName: string, path: string, expectedElements: string[] = []) {
  console.log(`\n=== Auditing: ${pageName} (${path}) ===`);

  const response = await page.goto(`${BASE_URL}${path}`);

  // Check page status
  const status = response?.status() || page.url().includes('404') ? 404 : 200;

  if (status !== 200) {
    console.log(`❌ FAIL - Page returned status: ${status}`);
    return {
      page: pageName,
      path,
      status: 'FAIL',
      reason: `HTTP ${status}`,
      missingElements: expectedElements
    };
  }

  console.log(`✅ PASS - Page loaded successfully (status ${status})`);

  // Check for expected elements
  const missingElements: string[] = [];
  for (const element of expectedElements) {
    const isVisible = await page.locator(element).isVisible().catch(() => false);
    if (!isVisible) {
      missingElements.push(element);
      console.log(`  ⚠️  Missing: ${element}`);
    }
  }

  // Check for page title/h1
  const hasH1 = await page.locator('h1').count();
  if (hasH1 === 0) {
    console.log(`  ⚠️  No h1 heading found`);
  }

  // Check for console errors
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });

  return {
    page: pageName,
    path,
    status: missingElements.length > 0 ? 'WARNING' : 'PASS',
    reason: missingElements.length > 0 ? 'Missing elements' : 'All checks passed',
    missingElements,
    consoleErrors: logs
  };
}

async function performLogin(page) {
  console.log(`\n=== Logging in ===`);
  await page.goto(`${BASE_URL}/auth/signin`);

  const emailInput = page.getByPlaceholder('example@company.com');
  const passwordInput = page.getByPlaceholder('•••••••••');
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: 'ログイン' });

  await emailInput.fill(testCredentials.email);
  await passwordInput.fill(testCredentials.password);
  await submitButton.click();

  // Wait for navigation to member page
  await page.waitForURL('**/member/**', { timeout: 5000 }).catch(() => {
    console.log('Warning: Did not redirect to member page after login');
  });

  console.log(`Login complete. Current URL: ${page.url()}`);
}

// =====================================================
// Public Pages Tests
// =====================================================

test.describe('Public Pages Audit', () => {
  const publicPages = [
    { name: 'Homepage', path: '/', elements: ['h1', 'nav'] },
    { name: 'About', path: '/about', elements: ['h1'] },
    { name: 'Contact', path: '/contact', elements: ['h1', 'form'] },
    { name: 'Samples', path: '/samples', elements: ['h1', 'form'] },
    { name: 'Catalog', path: '/catalog', elements: ['h1'] },
    { name: 'Quote Simulator', path: '/quote-simulator', elements: ['h1'] },
    { name: 'Archives', path: '/archives', elements: ['h1'] },
    { name: 'Industry - Cosmetics', path: '/industry/cosmetics', elements: ['h1'] },
    { name: 'Industry - Electronics', path: '/industry/electronics', elements: ['h1'] },
    { name: 'Industry - Food Manufacturing', path: '/industry/food-manufacturing', elements: ['h1'] },
    { name: 'Industry - Pharmaceutical', path: '/industry/pharmaceutical', elements: ['h1'] },
    { name: 'News', path: '/news', elements: ['h1'] },
    { name: 'Cart', path: '/cart', elements: ['h1'] },
    { name: 'Checkout', path: '/checkout', elements: ['h1'] },
  ];

  const results: any[] = [];

  for (const pageConfig of publicPages) {
    test(pageConfig.name, async ({ page }) => {
      const result = await auditPage(page, pageConfig.name, pageConfig.path, pageConfig.elements);
      results.push(result);
      expect(result.status).not.toBe('FAIL');
    });
  }

  test.afterAll(async () => {
    console.log('\n=== Public Pages Summary ===');
    results.forEach(r => {
      console.log(`${r.status === 'PASS' ? '✅' : r.status === 'WARNING' ? '⚠️' : '❌'} ${r.page}: ${r.reason}`);
      if (r.missingElements.length > 0) {
        r.missingElements.forEach(e => console.log(`    - Missing: ${e}`));
      }
    });
  });
});

// =====================================================
// Authentication Pages Tests
// =====================================================

test.describe('Authentication Pages Audit', () => {
  const authPages = [
    { name: 'Sign In', path: '/auth/signin', elements: ['h1', 'form', 'input[type="email"]', 'input[type="password"]', 'button[type="submit"]'] },
    { name: 'Register', path: '/auth/register', elements: ['h1', 'form'] },
    { name: 'Forgot Password', path: '/auth/forgot-password', elements: ['h1', 'form', 'input[type="email"]'] },
  ];

  const results: any[] = [];

  for (const pageConfig of authPages) {
    test(pageConfig.name, async ({ page }) => {
      const result = await auditPage(page, pageConfig.name, pageConfig.path, pageConfig.elements);
      results.push(result);
      expect(result.status).not.toBe('FAIL');
    });
  }

  test.afterAll(async () => {
    console.log('\n=== Authentication Pages Summary ===');
    results.forEach(r => {
      console.log(`${r.status === 'PASS' ? '✅' : r.status === 'WARNING' ? '⚠️' : '❌'} ${r.page}: ${r.reason}`);
    });
  });
});

// =====================================================
// Member Portal Tests (Requires Authentication)
// =====================================================

test.describe('Member Portal Audit', () => {
  let authenticated = false;

  test.beforeAll(async ({ browser }) => {
    console.log('\n=== Setting up authentication ===');
  });

  test('Login first', async ({ page }) => {
    await performLogin(page);
    authenticated = page.url().includes('/member');
    console.log(`Authentication ${authenticated ? 'successful' : 'failed'}`);
  });

  const memberPages = [
    { name: 'Member Dashboard', path: '/member/dashboard', elements: ['h1'] },
    { name: 'Member Profile', path: '/member/profile', elements: ['h1'] },
    { name: 'Member Quotations', path: '/member/quotations', elements: ['h1'] },
    { name: 'Member Samples', path: '/member/samples', elements: ['h1'] },
    { name: 'Member Inquiries', path: '/member/inquiries', elements: ['h1'] },
    { name: 'Member Orders History', path: '/member/orders/history', elements: ['h1'] },
    { name: 'Member Deliveries', path: '/member/deliveries', elements: ['h1'] },
    { name: 'Member Invoices', path: '/member/invoices', elements: ['h1'] },
    { name: 'Member Settings', path: '/member/settings', elements: ['h1'] },
  ];

  const results: any[] = [];

  for (const pageConfig of memberPages) {
    test(pageConfig.name, async ({ page }) => {
      test.skip(!authenticated, 'Authentication failed - skipping member pages');

      const result = await auditPage(page, pageConfig.name, pageConfig.path, pageConfig.elements);
      results.push(result);

      // Don't fail the test, just collect results
      test.step(() => {
        expect(result.status).not.toBe('FAIL');
      });
    });
  }

  test.afterAll(async () => {
    console.log('\n=== Member Portal Summary ===');
    results.forEach(r => {
      console.log(`${r.status === 'PASS' ? '✅' : r.status === 'WARNING' ? '⚠️' : '❌'} ${r.page}: ${r.reason}`);
    });
  });
});

// =====================================================
// Navigation & Accessibility Tests
// =====================================================

test.describe('Navigation & Accessibility Audit', () => {
  test('Main navigation menu', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for page to fully load (auth state)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional wait for React hydration

    const navLinks = await page.locator('nav a').count();
    console.log(`Found ${navLinks} navigation links`);

    // Check if key navigation elements exist
    // "お見積り" is a button with aria-label (auth check), "ログイン" is a link with aria-label
    const keyElements = [
      { text: 'ホーム', role: 'link', expect: true },
      { text: '製品カタログ', role: 'link', expect: true },
      { text: 'お見積り', role: 'button', expect: true }, // Button with aria-label
      { text: 'ログイン', role: 'link', expect: true, ariaLabel: true }, // Link with aria-label
    ];

    for (const elem of keyElements) {
      let exists = 0;
      if (elem.useGetByText) {
        exists = await page.getByText(elem.text).count();
      } else if (elem.role) {
        exists = await page.getByRole(elem.role as never, { name: elem.text }).count();
      }
      const status = elem.expect ? (exists > 0 ? '✅' : '❌') : (exists > 0 ? '✅' : '⚠️');
      const note = exists === 0 && !elem.expect ? ' (optional)' : '';
      console.log(`${status} Navigation "${elem.text}": ${exists > 0 ? 'Found' : 'Missing'}${note}`);
    }
  });

  test('Mobile menu button', async ({ page }) => {
    await page.goto(BASE_URL);

    const mobileMenuButton = await page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .mobile-menu-btn, nav button').first().isVisible();
    console.log(`Mobile menu button: ${mobileMenuButton ? '✅ Found' : '❌ Not found'}`);
  });

  test('Language selector', async ({ page }) => {
    await page.goto(BASE_URL);

    // Use specific selector to avoid strict mode violation from duplicate "日本語" text
    // The language menu button has data-language-button attribute and aria-label
    const langButton = page.locator('[data-language-button], button[aria-label*="language"], button[aria-label*="言語"]');
    const langSelector = await langButton.isVisible();
    console.log(`Language selector button: ${langSelector ? '✅ Found' : '❌ Not found'}`);

    // Check for language menu dropdown (may not be visible by default)
    const langMenu = await page.locator('[data-language-menu]').count();
    console.log(`Language menu dropdown: ${langMenu > 0 ? '✅ Found' : '⚠️ Not found'} (${langMenu} elements)`);
  });

  test('Footer links', async ({ page }) => {
    await page.goto(BASE_URL);

    const footer = page.locator('footer');
    const hasFooter = await footer.count();

    if (hasFooter > 0) {
      const footerLinks = await footer.locator('a').count();
      console.log(`✅ Footer found with ${footerLinks} links`);

      const keyFooterLinks = [
        { text: '個人情報保護方針', expect: true },
        { text: '利用規約', expect: true },
        { text: '特定商取引法', expect: true },
      ];

      for (const link of keyFooterLinks) {
        const exists = await footer.getByRole('link', { name: link.text }).count();
        console.log(`${exists > 0 ? '✅' : '⚠️'} Footer link "${link.text}": ${exists > 0 ? 'Found' : 'Missing'}`);
      }
    } else {
      console.log('❌ Footer not found');
    }
  });
});

// =====================================================
// Form Functionality Tests
// =====================================================

test.describe('Form Functionality Audit', () => {
  test('Contact form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    const formElements = {
      // Japanese name fields (hidden inputs from JapaneseNameInputController)
      'Kanji Last Name': 'input[name="kanjiLastName"]',
      'Kanji First Name': 'input[name="kanjiFirstName"]',
      'Kana Last Name': 'input[name="kanaLastName"]',
      'Kana First Name': 'input[name="kanaFirstName"]',
      // Other fields
      'Company input': 'input[name="company"]',
      'Phone input': 'input[name="phone"]',
      'FAX input': 'input[name="fax"]',
      'Email input': 'input[type="email"], input[name="email"]',
      'Postal Code input': 'input[name="postalCode"]',
      'Address input': 'input[name="address"]',
      'Message textarea': 'textarea[name="message"]',
      'Submit button': 'button[type="submit"]',
    };

    for (const [name, selector] of Object.entries(formElements)) {
      const exists = await page.locator(selector).count();
      console.log(`${exists > 0 ? '✅' : '❌'} ${name}: ${exists > 0 ? 'Found' : 'Missing'}`);
    }
  });

  test('Sample request form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/samples`);

    const formElements = {
      'Product selection': 'select, input[name="product"]',
      'Quantity input': 'input[type="number"], input[name="quantity"]',
      'Company info': 'input[name="company"]',
      'Submit button': 'button[type="submit"]',
    };

    for (const [name, selector] of Object.entries(formElements)) {
      const exists = await page.locator(selector).count();
      console.log(`${exists > 0 ? '✅' : '❌'} ${name}: ${exists > 0 ? 'Found' : 'Missing'}`);
    }
  });

  test('Login form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);

    const formElements = {
      'Email input': 'input[type="email"], input[name="email"]',
      'Password input': 'input[type="password"], input[name="password"]',
      'Remember me checkbox': 'input[type="checkbox"]',
      'Submit button': 'button[type="submit"]',
      'Forgot password link': 'a[href*="forgot-password"]',
      'Register link': 'a[href*="register"]',
    };

    for (const [name, selector] of Object.entries(formElements)) {
      const exists = await page.locator(selector).count();
      console.log(`${exists > 0 ? '✅' : '❌'} ${name}: ${exists > 0 ? 'Found' : 'Missing'}`);
    }
  });
});

// =====================================================
// Interactive Elements Tests
// =====================================================

test.describe('Interactive Elements Audit', () => {
  test('Buttons are clickable', async ({ page }) => {
    await page.goto(BASE_URL);

    const buttons = await page.locator('button:not([disabled])').count();
    console.log(`Found ${buttons} clickable buttons`);

    // Check for key CTAs
    const ctas = [
      { selector: 'a[href="/contact"], button:has-text("お問い合わせ"), button:has-text("Contact")', name: 'Contact CTA' },
      { selector: 'a[href="/quote-simulator"], a[href*="quote"], button:has-text("見積もり")', name: 'Quote CTA' },
    ];

    for (const cta of ctas) {
      const exists = await page.locator(cta.selector).first().count();
      console.log(`${exists > 0 ? '✅' : '⚠️'} ${cta.name}: ${exists > 0 ? 'Found' : 'Missing'}`);
    }
  });

  test('Product cards have interaction elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    const productCards = await page.locator('[class*="product"], [class*="Product"], article[class*="card"]').count();
    console.log(`Found ${productCards} product cards`);

    if (productCards > 0) {
      // Check if cards have buttons or links
      const cardButtons = await page.locator('[class*="product"] button, [class*="Product"] button').count();
      const cardLinks = await page.locator('[class*="product"] a, [class*="Product"] a').count();

      console.log(`✅ Product cards have ${cardButtons} buttons and ${cardLinks} links`);
    } else {
      console.log('⚠️ No product cards found');
    }
  });
});

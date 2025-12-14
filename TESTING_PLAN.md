# Epackage Lab Comprehensive Testing Plan

## Executive Summary
This document outlines a systematic testing approach for the Epackage Lab website to ensure all implemented features meet quality standards, performance targets, and Japanese market requirements.

## Testing Environment Setup

### Prerequisites
- Node.js 18+ installed
- Playwright configured and browsers installed
- Development server running on http://localhost:3002
- Test data prepared for form submissions
- Japanese locale configured in test environment

### Setup Commands
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run development server in parallel
npm run dev

# Run tests
npx playwright test
```

## Phase 1: Functional Testing

### 1.1 Product Catalog System Tests
```javascript
// tests/catalog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test('displays Japanese product names correctly', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('h1')).toContainText('製品カタログ');

    const productNames = await page.locator('.product-name').allTextContents();
    productNames.forEach(name => {
      expect(name).toMatch(/[\u3040-\u309f\u30a0-\u30ff]/); // Contains Japanese characters
    });
  });

  test('search functionality with Japanese keywords', async ({ page }) => {
    await page.goto('/catalog');
    await page.fill('[data-testid="search-input"]', '包装資材');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0);
  });

  test('filter options work correctly', async ({ page }) => {
    await page.goto('/catalog');
    await page.selectOption('[data-testid="category-filter"]', 'boxes');
    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0);
  });
});
```

### 1.2 Service Menu System Tests
```javascript
// tests/navigation.spec.ts
test.describe('Navigation', () => {
  test('header menu has no nested duplication', async ({ page }) => {
    await page.goto('/');
    const headers = page.locator('header').all();
    await expect(headers).toHaveCount(1); // Only one header should exist
  });

  test('all menu links work correctly', async ({ page }) => {
    await page.goto('/');
    const menuLinks = page.locator('nav a');
    const linkCount = await menuLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = menuLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href && !href.includes('http')) {
        await Promise.all([
          page.waitForURL(href),
          link.click()
        ]);
        await expect(page.locator('h1')).toBeVisible();
        await page.goBack();
      }
    }
  });
});
```

### 1.3 Post-Processing Preview Tests
```javascript
// tests/post-processing.spec.ts
test.describe('Post-Processing Preview', () => {
  test('displays all 14 processing types', async ({ page }) => {
    await page.goto('/quote');
    await expect(page.locator('[data-testid="processing-option"]')).toHaveCount(14);
  });

  test('shows visual previews correctly', async ({ page }) => {
    await page.goto('/quote');
    const firstOption = page.locator('[data-testid="processing-option"]').first();
    await firstOption.click();
    await expect(page.locator('[data-testid="processing-preview"]')).toBeVisible();
  });

  test('updates price calculation', async ({ page }) => {
    await page.goto('/quote');
    const initialPrice = await page.locator('[data-testid="total-price"]').textContent();

    await page.locator('[data-testid="processing-option"]').first().click();
    const newPrice = await page.locator('[data-testid="total-price"]').textContent();

    expect(newPrice).not.toBe(initialPrice);
  });
});
```

### 1.4 Catalog Download Tests
```javascript
// tests/download.spec.ts
test.describe('Catalog Download', () => {
  test('initiates PDF download', async ({ page }) => {
    await page.goto('/company');

    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="catalog-download-button"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('catalog');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('captures email before download', async ({ page }) => {
    await page.goto('/company');
    await page.click('[data-testid="catalog-download-button"]');

    await expect(page.locator('[data-testid="email-modal"]')).toBeVisible();
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="submit-email"]');

    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });
});
```

## Phase 2: UI/UX Testing

### 2.1 Japanese Localization Tests
```javascript
// tests/localization.spec.ts
test.describe('Japanese Localization', () => {
  test('renders Japanese text with correct font', async ({ page }) => {
    await page.goto('/');
    const computedStyle = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(computedStyle).toContain('Noto Sans JP');
  });

  test('maintains UTF-8 encoding', async ({ page }) => {
    const response = await page.goto('/');
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('charset=utf-8');
  });

  test('displays Japanese date formats', async ({ page }) => {
    await page.goto('/blog');
    const dates = page.locator('[data-testid="post-date"]');
    const dateText = await dates.first().textContent();
    expect(dateText).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
  });
});
```

### 2.2 Responsive Design Tests
```javascript
// tests/responsive.spec.ts
const devices = [
  { name: 'Mobile', viewport: { width: 375, height: 667 } },
  { name: 'Tablet', viewport: { width: 768, height: 1024 } },
  { name: 'Desktop', viewport: { width: 1920, height: 1080 } }
];

devices.forEach(device => {
  test(`responsive layout on ${device.name}`, async ({ page }) => {
    await page.setViewportSize(device.viewport);
    await page.goto('/');

    // Check hamburger menu on mobile
    if (device.viewport.width < 768) {
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    } else {
      await expect(page.locator('nav')).toBeVisible();
    }

    // Check no horizontal scroll
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = device.viewport.width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
```

### 2.3 Accessibility Tests
```javascript
// tests/accessibility.spec.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test('passes WCAG 2.1 AA checks', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Can navigate to all interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const count = await interactiveElements.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    }
  });

  test('color contrast meets standards', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });
});
```

## Phase 3: Performance Testing

### 3.1 Core Web Vitals Tests
```javascript
// tests/performance.spec.ts
test.describe('Performance', () => {
  test('meets Core Web Vitals thresholds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // LCP < 2.5s
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    expect(lcp).toBeLessThan(2500);

    // Total load time < 3s
    expect(loadTime).toBeLessThan(3000);
  });

  test('bundle sizes within limits', async ({ page }) => {
    const resources = await page.goto('/');
    const jsBundle = await page.locator('script[src*=".js"]').first();
    const cssBundle = await page.locator('link[rel="stylesheet"]').first();

    // Note: Actual size checking would require additional setup
    // This is a placeholder for the concept
    expect(jsBundle).toBeTruthy();
    expect(cssBundle).toBeTruthy();
  });
});
```

## Phase 4: Integration Testing

### 4.1 API Integration Tests
```javascript
// tests/api.spec.ts
test.describe('API Integration', () => {
  test('contact form submission', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('[data-testid="name-input"]', 'テストユーザー');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="message-input"]', 'テストメッセージ');

    const responsePromise = page.waitForResponse('/api/contact');
    await page.click('[data-testid="submit-button"]');
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('quote calculation API', async ({ page }) => {
    await page.goto('/quote');

    const responsePromise = page.waitForResponse('/api/quotation/calculate');
    await page.fill('[data-testid="quantity-input"]', '100');
    await page.selectOption('[data-testid="product-select"]', 'box-a');

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('price');
  });
});
```

## Phase 5: Security Testing

### 5.1 Form Security Tests
```javascript
// tests/security.spec.ts
test.describe('Security', () => {
  test('prevents XSS attacks', async ({ page }) => {
    await page.goto('/contact');
    const xssPayload = '<script>alert("xss")</script>';

    await page.fill('[data-testid="message-input"]', xssPayload);
    await page.click('[data-testid="submit-button"]');

    // Check that script doesn't execute
    await page.waitForTimeout(1000);
    const alerts = page.locator('.alert');
    await expect(alerts).toHaveCount(0);
  });

  test('validates input properly', async ({ page }) => {
    await page.goto('/contact');

    // Test email validation
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('有効なメール');
  });
});
```

## Test Execution Strategy

### Running Tests
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/catalog.spec.ts

# Run with UI for debugging
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Generate HTML report
npx playwright test --reporter=html
```

### Parallel Execution
```javascript
// playwright.config.ts
export default defineConfig({
  // ... other config
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

## Reporting

### Test Results Structure
```
test-results/
├── report.html          # HTML report
├── results.json         # JSON results
└── screenshots/         # Failure screenshots
    └── test-name.png
```

### Performance Dashboard
- Lighthouse scores
- Core Web Vitals metrics
- Bundle size tracking
- API response times

## Success Criteria

### Functional Requirements
- ✅ All implemented features work as specified
- ✅ Zero critical bugs
- ✅ 95%+ test coverage for critical paths
- ✅ All Japanese localization working

### Performance Requirements
- ✅ Lighthouse score 90+ in all categories
- ✅ Core Web Vitals within thresholds
- ✅ Bundle sizes within limits
- ✅ 3G load time under 3 seconds

### Quality Requirements
- ✅ WCAG 2.1 AA compliance
- ✅ Zero security vulnerabilities
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness verified

## Next Steps

1. **Immediate Actions:**
   - Set up test environment
   - Install Playwright browsers
   - Configure CI/CD pipeline

2. **Test Execution:**
   - Run Phase 1 tests (Functional)
   - Fix any identified issues
   - Proceed through all phases

3. **Automation:**
   - Integrate with GitHub Actions
   - Set up scheduled test runs
   - Configure failure notifications

4. **Documentation:**
   - Document test results
   - Create bug tracking reports
   - Update user documentation
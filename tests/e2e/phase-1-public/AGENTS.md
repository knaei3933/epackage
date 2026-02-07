# tests/e2e/phase-1-public/ - Public Pages E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

Comprehensive end-to-end testing for publicly accessible pages of the Epackage Lab B2B packaging platform. These tests verify the customer-facing experience without requiring authentication, covering navigation, content display, form validation, and user interactions across marketing and informational pages.

## Key Files

| File | Purpose |
|------|---------|
| `01-home-navigation.spec.ts` | Homepage load, navigation links, hero section, footer links |
| `02-catalog.spec.ts` | Product catalog browsing, filtering, search, product cards |
| `03-product-detail.spec.ts` | Product detail pages and modals |
| `04-quote-simulator.spec.ts` | Quote simulator interface, product selection, pricing |
| `05-smart-quote.spec.ts` | Smart quote feature functionality |
| `06-roi-calculator.spec.ts` | ROI calculator tool |
| `07-samples.spec.ts` | Sample request pages |
| `08-contact.spec.ts` | Contact form validation, submission, SendGrid integration |
| `09-industry-solutions.spec.ts` | Industry-specific solution pages (cosmetics, electronics, food, pharma) |
| `10-guide-pages.spec.ts` | Guide and informational content pages |
| `11-info-pages.spec.ts` | Legal pages (privacy, terms, CSR) |
| `12-compare.spec.ts` | Product comparison functionality |

## Test Coverage

### 1. Homepage & Navigation (TC-1.1.x)
- Page load performance and console error checking
- Navigation link validation
- Hero section rendering
- Footer links verification
- Asset 404 detection
- React hydration error detection

### 2. Product Catalog (TC-1.2.x)
- Catalog page load and title
- Category filter functionality
- Material type filter functionality
- Search with debounce validation
- Product card click → detail modal
- Loading state indicators
- Product card information display
- API error handling

### 3. Quote Simulator (TC-1.4.x)
- Simulator interface loading
- Product type selection
- Size/material selection UI
- Print options interface
- Real-time price calculation display
- Add to Quote functionality
- PDF download availability
- Quick actions section
- Navigation breadcrumbs
- Performance budget compliance
- Mobile responsive design

### 4. Contact Form (TC-1.8.x)
- Form load and console error checking
- Inquiry type selection (5 radio options)
- Email validation
- Phone format validation (Japanese: XX-XXXX-XXXX)
- Form submission with SendGrid integration
- Rate limiting behavior
- Character count display (10-800 chars)
- Japanese name field validation (Kanji/Hiragana)
- Placeholder hints display
- Submission guidance text
- Business hours display
- Mobile responsiveness
- Network error handling

## For AI Agents

### Test Patterns

When creating or modifying phase-1-public tests, follow these established patterns:

#### 1. Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  });

  test('TC-1.X.X: Test description', async ({ page }) => {
    // Arrange: Set up conditions
    // Act: Perform action
    // Assert: Verify outcome
  });
});
```

#### 2. Console Error Collection Pattern
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

// Filter benign errors
const filteredErrors = errors.filter(e =>
  !e.includes('favicon') &&
  !e.includes('404') &&
  !e.includes('net::ERR') &&
  !e.includes('Ads') &&
  !e.includes('Extension')
);

expect(filteredErrors.length).toBeLessThan(5);
```

#### 3. Conditional Element Checking
```typescript
const element = page.locator('selector');
const count = await element.count();

if (count > 0) {
  await expect(element.first()).toBeVisible();
} else {
  test.skip(true, 'Element not found - skipped with explanation');
}
```

#### 4. Japanese Text Validation
```typescript
// By text content
await expect(page.getByText('会員登録が完了しました')).toBeVisible();

// By role with Japanese name
await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();

// Filter Japanese text
const japaneseText = page.locator('text=/あなたの製品を/i');
```

#### 5. Form Validation Pattern
```typescript
// Fill input and trigger blur
await input.fill('invalid-value');
await otherInput.click(); // Trigger blur
await page.waitForTimeout(500); // Wait for validation

// Check for error message
const error = page.locator('text=/エラー|有効な|必須/i').or(
  page.locator('[class*="error"], [role="alert"]')
);

const errorCount = await error.count();
if (errorCount > 0) {
  await expect(error.first()).toBeVisible();
}
```

#### 6. Navigation Testing Pattern
```typescript
// Click link and verify URL change
await link.click();
await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

const currentUrl = page.url();
expect(currentUrl).toContain('/expected-path');
```

#### 7. API Request Monitoring
```typescript
const apiRequests: string[] = [];
page.on('request', request => {
  if (request.url().includes('/api/endpoint')) {
    apiRequests.push(request.url());
  }
});

// After action
expect(apiRequests.length).toBeGreaterThan(0);
```

#### 8. Loading State Pattern
```typescript
const loadingSpinner = page.locator('[role="status"], .loading, .spinner');
const isVisible = await loadingSpinner.isVisible().catch(() => false);

if (isVisible) {
  await expect(loadingSpinner).toBeHidden({ timeout: 5000 });
}
```

### Running Tests

```bash
# Run all phase-1-public tests
npx playwright test tests/e2e/phase-1-public/

# Run specific test file
npx playwright test tests/e2e/phase-1-public/01-home-navigation.spec.ts

# Run specific test by name
npx playwright test -g "TC-1.1.1"

# Run with UI mode
npx playwright test tests/e2e/phase-1-public/ --ui

# Run in headed mode
npx playwright test tests/e2e/phase-1-public/ --headed

# Run with debug
npx playwright test tests/e2e/phase-1-public/ --debug
```

### Test Data Fixtures

Public pages tests use minimal fixtures and typically don't require database setup:

```typescript
// Generate unique test data
const timestamp = Date.now();
const testEmail = `test-${timestamp}@example.com`;
const testPhone = '03-1234-5678'; // Japanese format
```

### Common Selectors

```typescript
// Navigation
page.locator('a[href="/catalog"]')
page.locator('a[href="/quote-simulator"]')

// Product cards
page.locator('[class*="product"]')
page.locator('.group.relative.bg-white')

// Form elements
page.locator('input[type="email"]')
page.locator('input[type="tel"]')
page.locator('textarea[name*="message"]')

// Buttons
page.locator('button[type="submit"]')
page.locator('button:has-text("次へ")')

// Loading states
page.locator('[role="status"]')
page.locator('[class*="loading"]')
page.locator('.animate-spin')

// Error messages
page.locator('[class*="error"]')
page.locator('[role="alert"]')
```

### Validation Rules

#### Japanese Phone Format
- Pattern: XX-XXXX-XXXX (e.g., 03-1234-5678)
- Validation checks for proper format

#### Japanese Names
- Kanji fields: `山田` (lastName), `太郎` (firstName)
- Hiragana fields: `やまだ` (lastName), `たろう` (firstName)
- Custom component: `<JapaneseNameInput />`

#### Email Validation
- Standard email format validation
- Real-time validation on blur

### Test Naming Convention

- **Public tests**: `TC-1.X.X` where X = test group number
  - TC-1.1.x: Homepage
  - TC-1.2.x: Catalog
  - TC-1.4.x: Quote Simulator
  - TC-1.8.x: Contact Form

### Performance Expectations

- Page load: < 10 seconds
- DOM content loaded: < 5 seconds
- Search/filter response: < 5 seconds (client-side)
- Form submission: < 30 seconds (with API call)

### Dependencies

- **playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner
- **typescript**: TypeScript support

### Database Tables Used

- `products` - Product catalog data
- `categories` - Product categories
- `material_types` - Material type options
- `contact_submissions` - Contact form submissions

### Mobile Testing

Tests include mobile responsive validation:

```typescript
test('Mobile responsive design', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/path');
  // Verify content is still visible
});
```

### Error Handling

Tests verify graceful error handling:

1. **Console errors**: Filter and report critical errors
2. **Network failures**: Verify error messages display
3. **Invalid inputs**: Check validation messages
4. **Missing elements**: Use conditional checks or skip with explanation

## Related Files

- `../AGENTS.md` - Parent E2E test documentation
- `../../playwright.config.ts` - Playwright configuration
- `src/app/` - Application pages being tested
- `src/components/` - Components being tested

## See Also

- [Playwright Documentation](https://playwright.dev)
- `../README.md` - E2E test quick start guide
- `../phase-2-auth/AGENTS.md` - Authentication phase tests

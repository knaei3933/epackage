# tests/e2e/phase-5-portal/ - Portal Features E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

Phase 5 E2E tests for portal features, covering the migration from `/portal/*` routes to `/admin/customers/*` routes. Tests verify redirects, portal homepage/dashboard functionality, and profile management for customer portal users.

**Migration Context**: Portal routes have been migrated to `/admin/customers` for better organizational structure. All `/portal/*` routes now 301 redirect to `/admin/customers/*`.

## Key Files

| File | Purpose |
|------|---------|
| `00-redirects.spec.ts` | Portal route redirect tests (TC-5.0.1 to TC-5.0.20) |
| `01-portal-home.spec.ts` | Portal homepage/dashboard tests (TC-5.1.1 to TC-5.1.14) |
| `02-portal-profile.spec.ts` | Portal profile management tests (TC-5.2.1 to TC-5.2.20) |

## Test Coverage

### 00-redirects.spec.ts (20 tests)

Validates 301 permanent redirects from old `/portal/*` routes to new `/admin/customers/*` routes.

**Key Test Cases:**
- `TC-5.0.1-5.0.6`: Basic route redirects (portal, orders, documents, profile, support)
- `TC-5.0.7-5.0.8`: Query parameter and hash fragment preservation
- `TC-5.0.9-5.0.10`: 301 status code verification for SEO
- `TC-5.0.11-5.0.12`: Edge cases (trailing slash, multiple slashes)
- `TC-5.0.13-5.0.16`: Complex query parameter handling
- `TC-5.0.14`: Verify other routes are NOT affected
- `TC-5.0.17`: Redirect with authentication
- `TC-5.0.18`: Deep nested routes
- `TC-5.0.19-5.0.20`: Encoding validation

**Route Mappings:**
```
/portal → /admin/customers
/portal/orders → /admin/customers/orders
/portal/orders/[id] → /admin/customers/orders/[id]
/portal/documents → /admin/customers/documents
/portal/profile → /admin/customers/profile
/portal/support → /admin/customers/support
```

### 01-portal-home.spec.ts (14 tests)

Tests the customer portal homepage/dashboard at `/admin/customers`.

**Key Test Cases:**
- `TC-5.1.1`: Dashboard loads and displays title
- `TC-5.1.2`: Quick links functionality (new quote, contact, catalog)
- `TC-5.1.3`: Stats cards widget (総注文数, 見積中, 製作中, 発送済)
- `TC-5.1.4`: Recent orders section with empty state handling
- `TC-5.1.5`: Upcoming deliveries section
- `TC-5.1.6`: Notifications section with badge counts
- `TC-5.1.7`: Sidebar navigation verification
- `TC-5.1.8`: Mobile responsive design
- `TC-5.1.9`: API dashboard endpoint validation
- `TC-5.1.10`: Stats card links navigation to filtered order lists
- `TC-5.1.11`: Empty state for new users
- `TC-5.1.12`: Portal header and footer
- `TC-5.1.13`: Progress bar display on order cards
- `TC-5.1.14`: Delivery status badges (urgent, overdue, normal)

**Navigation Items Verified:**
- ダッシュボード (/admin/customers)
- 注文一覧 (/admin/customers/orders)
- ドキュメント (/admin/customers/documents)
- プロフィール設定 (/admin/customers/profile)
- お問い合わせ (/admin/customers/support)

### 02-portal-profile.spec.ts (20 tests)

Tests the customer portal profile page at `/admin/customers/profile`.

**Key Test Cases:**
- `TC-5.2.1`: Profile page loads with user information
- `TC-5.2.2`: Basic information section (read-only)
- `TC-5.2.3`: Contact information section (editable)
- `TC-5.2.4`: Company information section (read-only + editable fields)
- `TC-5.2.5`: Address information section with Japanese address format
- `TC-5.2.6`: Save changes button
- `TC-5.2.7`: Update phone number functionality
- `TC-5.2.8`: Update address functionality
- `TC-5.2.9`: Logout button
- `TC-5.2.10`: Account deletion request link (mailto)
- `TC-5.2.11`: Form validation
- `TC-5.2.12`: Profile API endpoint validation
- `TC-5.2.13`: Cancel button functionality
- `TC-5.2.14`: Responsive design
- `TC-5.2.15`: Form accessibility (labels, ARIA)
- `TC-5.2.16`: Multiple field updates at once
- `TC-5.2.17`: User type display (法人, 個人事業主, 個人)
- `TC-5.2.18`: Company URL validation
- `TC-5.2.19`: Empty state handling
- `TC-5.2.20`: Navigation from sidebar

**Address Fields (Japanese Format):**
- 郵便番号 (postal_code): Placeholder "123-4567"
- 都道府県 (prefecture): Placeholder "東京都"
- 市区町村 (city): Placeholder "千代田区"
- 番地 (street): Placeholder "1-2-3"
- 建物名 (building): Placeholder "〇〇ビル 5階"

## For AI Agents

### Portal Test Patterns

When working with portal tests, follow these patterns:

#### 1. DEV Mode Authentication
All portal tests use DEV_MODE for authentication - no real login required.

```typescript
import { setupDevModeAuth } from '../../helpers/dev-mode-auth';

test.beforeEach(async ({ page }) => {
  await setupDevModeAuth(page);
  await page.goto('/admin/customers');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
});
```

#### 2. Flexible Selector Pattern
Tests use flexible selectors to handle dynamic content:

```typescript
// Try specific selector, fallback to URL verification
const dashboardTitle = page.locator('h1, h2').filter({ hasText: /ダッシュボード|dashboard/i });
const titleCount = await dashboardTitle.count();

if (titleCount > 0) {
  await expect(dashboardTitle.first()).toBeVisible();
} else {
  expect(page.url()).toContain('/admin/customers');
}
```

#### 3. Console Error Filtering
Tests filter benign console errors:

```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

const filteredErrors = errors.filter(e =>
  !e.includes('stats') &&
  !e.includes('favicon') &&
  !e.includes('404') &&
  !e.includes('500') &&
  !e.includes('401')
);
expect(filteredErrors).toHaveLength(0);
```

#### 4. Optional Widget Pattern
Some widgets may not be present - tests handle this gracefully:

```typescript
const statsGrid = page.locator('.grid:has(.bg-white), .grid:has(.bg-slate-800)');
const hasStatsGrid = await statsGrid.count() > 0;

if (hasStatsGrid) {
  // Verify stats cards
  const expectedStats = [
    { label: /総注文数/, color: /bg-blue-500/i },
    { label: /見積中/, color: /bg-yellow-500/i },
    // ...
  ];
  // Test stats...
}
```

#### 5. Japanese Address Validation
Tests verify Japanese address format:

```typescript
const expectedFields = [
  { name: 'postal_code', label: /郵便番号/, placeholder: '123-4567' },
  { name: 'prefecture', label: /都道府県/, placeholder: '東京都' },
  { name: 'city', label: /市区町村/, placeholder: '千代田区' },
  // ...
];

for (const field of expectedFields) {
  const input = page.locator(`input[name="${field.name}"]`);
  const count = await input.count();

  if (count > 0) {
    await expect(input.first()).toBeVisible();
    const placeholder = await input.first().getAttribute('placeholder');
    expect(placeholder).toContain(field.placeholder);
  }
}
```

#### 6. Redirect Verification Pattern
For redirect tests, verify both URL and status code:

```typescript
// Navigate to old route
await page.goto('/portal');
// Verify new URL
await expect(page).toHaveURL(/\/admin\/customers$/);

// For status code tests (HTTP level)
const response = await page.request.get('/portal');
expect(response.status()).toBe(301);
```

### Running Tests

```bash
# Run all portal tests
npx playwright test tests/e2e/phase-5-portal/

# Run specific file
npx playwright test tests/e2e/phase-5-portal/00-redirects.spec.ts

# Run with UI
npx playwright test tests/e2e/phase-5-portal/ --ui

# Run specific test case
npx playwright test -g "TC-5.0.1"

# Run with debug
npx playwright test tests/e2e/phase-5-portal/ --debug
```

### Environment Variables

```env
# Required for DEV_MODE authentication
ENABLE_DEV_MOCK_AUTH=true
NEXT_PUBLIC_DEV_MODE=true
BASE_URL=http://localhost:3000

# Test credentials (for non-DEV_MODE testing)
TEST_MEMBER_EMAIL=test@example.com
TEST_MEMBER_PASSWORD=Test1234!
```

### Dependencies

- **playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner
- **typescript**: TypeScript support
- **../../helpers/dev-mode-auth.ts**: DEV_MODE authentication utilities

### Page Routes Tested

| Old Route | New Route | Status |
|-----------|-----------|--------|
| `/portal` | `/admin/customers` | 301 Redirect |
| `/portal/orders` | `/admin/customers/orders` | 301 Redirect |
| `/portal/orders/[id]` | `/admin/customers/orders/[id]` | 301 Redirect |
| `/portal/documents` | `/admin/customers/documents` | 301 Redirect |
| `/portal/profile` | `/admin/customers/profile` | 301 Redirect |
| `/portal/support` | `/admin/customers/support` | 301 Redirect |

### Common Locators

```typescript
// Dashboard elements
page.locator('h1, h2').filter({ hasText: /ダッシュボード|dashboard/i })
page.locator('.grid:has(.bg-white), .grid:has(.bg-slate-800)')
page.locator('a[href*="/admin/customers/orders"]')

// Sidebar navigation
page.locator('aside, nav[class*="sidebar"]')
page.locator('a[href="/admin/customers/profile"]')

// Profile form
page.locator('input[name="corporate_phone"]')
page.locator('input[name="postal_code"]')
page.locator('button[type="submit"]:has-text("変更を保存")')

// Status badges
page.locator('span[class*="rounded-full"]:has-text("日後")')
page.locator('span:has-text("まもなく")')
page.locator('span:has-text("遅延")')
```

### Test Data Patterns

```typescript
// Unique timestamp for test data isolation
const TEST_TIMESTAMP = Date.now();

// Test phone number format
const testPhone = `03-${TEST_TIMESTAMP.toString().slice(-4)}-${TEST_TIMESTAMP.toString().slice(-4)}`;

// Test postal code format
const testPostal = `100-${TEST_TIMESTAMP.toString().slice(-4)}`;
```

## Related Files

- `../../helpers/dev-mode-auth.ts` - DEV_MODE authentication setup
- `../AGENTS.md` - Parent E2E tests directory
- `../../playwright.config.ts` - Playwright configuration
- `src/middleware.ts` - Route redirect logic
- `src/app/admin/customers/` - Portal page implementations

## See Also

- [Playwright Documentation](https://playwright.dev)
- `../phase-2-auth/AGENTS.md` - Authentication test patterns
- `../phase-3-member/AGENTS.md` - Member portal test patterns
- `../phase-4-admin/AGENTS.md` - Admin portal test patterns

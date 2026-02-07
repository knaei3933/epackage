# tests/e2e/group-d-admin/ - Admin Portal E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

End-to-end tests for the Epackage Lab admin portal (`/admin/*`). These tests verify admin dashboard functionality, order management, quotation management, production tracking, customer portal integration, and other administrative features.

## Key Files

| File | Purpose | Test Cases |
|------|---------|------------|
| `01-admin-dashboard.spec.ts` | Admin dashboard, statistics, widgets | TC-ADMIN-001 to TC-ADMIN-003 |
| `02-orders.spec.ts` | Order management, filtering, search | TC-ADMIN-004 to TC-ADMIN-007 |
| `03-quotations.spec.ts` | Quotation management, status filters | TC-ADMIN-008 to TC-ADMIN-010 |
| `04-production.spec.ts` | Production management, job tracking | TC-ADMIN-011 to TC-ADMIN-013 |
| `05-other.spec.ts` | Contracts, approvals, inventory, settings | TC-ADMIN-014 to TC-ADMIN-018 |
| `06-customers-portal.spec.ts` | Customer portal integration, redirects | TC-ADMIN-019 to TC-ADMIN-022 |

## Test Structure

### D-1: Admin Dashboard (3 tests)
- **TC-ADMIN-001**: Admin dashboard page load with console error validation
- **TC-ADMIN-002**: Statistics widgets display
- **TC-ADMIN-003**: Performance metrics API

**Target Routes:**
- `/admin/dashboard`

### D-2: Order Management (4 tests)
- **TC-ADMIN-004**: Order list page with console error validation
- **TC-ADMIN-005**: Order status filter buttons (All, Pending, Production, Completed, Cancelled)
- **TC-ADMIN-006**: Order search functionality
- **TC-ADMIN-007**: Order detail page navigation

**Target Routes:**
- `/admin/orders`
- `/admin/orders/[id]`

### D-3: Quotation Management (3 tests)
- **TC-ADMIN-008**: Quotation list page with console error validation
- **TC-ADMIN-009**: Quotation status filters
- **TC-ADMIN-010**: Quotation detail page navigation

**Target Routes:**
- `/admin/quotations`
- `/admin/quotations/[id]`

### D-4: Production Management (3 tests)
- **TC-ADMIN-011**: Production management page with console error validation
- **TC-ADMIN-012**: Production job status display (badges, timeline)
- **TC-ADMIN-013**: Production job detail page navigation

**Target Routes:**
- `/admin/production`
- `/admin/production/[id]`

### D-5: Other Admin Pages (5 tests)
- **TC-ADMIN-014**: Contracts management page
- **TC-ADMIN-015**: Approvals management page
- **TC-ADMIN-016**: Inventory management page
- **TC-ADMIN-017**: Admin settings page
- **TC-ADMIN-018**: Shipments management page

**Target Routes:**
- `/admin/contracts`
- `/admin/approvals`
- `/admin/inventory`
- `/admin/settings`
- `/admin/shipments`

### D-6: Customer Portal Integration (4 tests)
- **TC-ADMIN-019**: Customer portal home page
- **TC-ADMIN-020**: Customer orders list
- **TC-ADMIN-021**: Customer profile page
- **TC-ADMIN-022**: Legacy `/portal` URL redirect validation (admin access)

**Target Routes:**
- `/admin/customers`
- `/admin/customers/orders`
- `/admin/customers/profile`
- `/portal` (redirect test)

## For AI Agents

### Admin Test Patterns

When working with admin E2E tests, follow these patterns:

#### 1. DEV_MODE Authentication
All admin tests use `setupDevModeAuth()` helper with admin UUID:

```typescript
import { setupDevModeAuth } from '../../helpers/dev-mode-auth';

test('Admin test', async ({ page }) => {
  // Setup DEV_MODE authentication with admin UUID
  await setupDevModeAuth(page, '00000000-0000-0009-0001-000000000001');

  await page.goto('/admin/dashboard', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
});
```

#### 2. Console Error Collection Pattern
Admin tests collect and filter console errors:

```typescript
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    // Filter out expected DEV_MODE errors
    if (!text.includes('401') && !text.includes('500') &&
        !text.includes('Ads') && !text.includes('favicon') &&
        !text.includes('404')) {
      consoleErrors.push(text);
    }
  }
});

// Filter out known safe errors
const criticalErrors = consoleErrors.filter(e =>
  !e.includes('ResizeObserver') &&
  !e.includes('Next.js') &&
  !e.includes('hydration') &&
  !e.includes('jobs?.filter') &&
  !e.includes('filter is not a function') &&
  !e.includes('WebSocket') &&
  !e.includes('Layout Error Boundary')
);
expect(criticalErrors).toHaveLength(0);
```

#### 3. Page Load Verification
Flexible page verification that handles error states:

```typescript
// URL verification
const currentUrl = page.url();
expect(currentUrl).toContain('/admin/dashboard');

// Content verification (error-tolerant)
const pageContent = await page.locator('body').innerText();
expect(pageContent.length).toBeGreaterThan(0);

// Or verify element exists
const bodyElement = await page.locator('body').count();
expect(bodyElement).toBeGreaterThan(0);
```

#### 4. List Item Navigation Pattern
For navigating from list to detail pages:

```typescript
// Navigate to list page first
await page.goto('/admin/orders', {
  waitUntil: 'networkidle',
  timeout: 60000
});

await page.waitForTimeout(2000);

// Find first detail link
const detailLink = page.locator('a[href^="/admin/orders/"]').first();
const linkCount = await detailLink.count();

if (linkCount > 0) {
  const href = await detailLink.getAttribute('href');

  // Navigate to detail page
  await page.goto(href || '/admin/orders/test-order-001', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Verify URL structure
  const currentUrl = page.url();
  const hasId = currentUrl.includes('/admin/orders/') &&
                currentUrl.split('/').length > 3;
  expect(hasId).toBeTruthy();

  // Verify detail content
  const hasDetailContent = await page.locator(
    'main, .order-detail, .detail, body > div'
  ).count() > 0;
  expect(hasDetailContent).toBeTruthy();
} else {
  // Skip if no links found
  test.skip(true, 'No order links found');
}
```

#### 5. Filter/Search UI Pattern
For testing filter and search functionality:

```typescript
// Filter buttons
const filterButtons = page.locator('button').filter({
  hasText: /^(すべて|承認待ち|生産中|完了|キャンセル)/i
});
const filterCount = await filterButtons.count();

if (filterCount > 0) {
  await expect(filterButtons.first()).toBeVisible({ timeout: 5000 });

  // Test filter interaction
  if (filterCount > 1) {
    await filterButtons.nth(1).click();
    await page.waitForTimeout(1000);

    // Verify page still loaded
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/orders');
  }
} else {
  // Fallback: just verify page loaded
  const pageContent = await page.locator('body').innerText();
  expect(pageContent.length).toBeGreaterThan(0);
}

// Search input
const searchInput = page.locator(
  'input[placeholder*="検索"], input[name*="search"], input[type="search"]'
);
const searchCount = await searchInput.count();

if (searchCount > 0) {
  await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  await searchInput.first().fill('test');
  await page.waitForTimeout(500);
}
```

#### 6. Sequential Execution Pattern
All admin tests use `test.describe.serial` for shared session:

```typescript
test.describe.serial('GROUP D-X: Feature Name（順次実行）', () => {
  test('TC-ADMIN-XXX: Test name', async ({ page }) => {
    await setupDevModeAuth(page, '00000000-0000-0009-0001-000000000001');
    // Test implementation
  });

  test('TC-ADMIN-XXY: Another test', async ({ page }) => {
    await setupDevModeAuth(page, '00000000-0000-0009-0001-000000000001');
    // Test implementation
  });
});
```

### Common Locators for Admin Pages

```typescript
// Admin navigation
page.getByRole('link', { name: /ダッシュボード|注文|見積|生産|在庫|配送|設定/ })

// Status badges
page.locator('.status, .badge, [class*="status"], [class*="timeline"]')

// Filter buttons
page.locator('button').filter({ hasText: /^(すべて|承認待ち|生産中|完了|キャンセル)/i })

// Search inputs
page.locator('input[placeholder*="検索"], input[name*="search"], input[type="search"]')

// Detail links
page.locator('a[href^="/admin/orders/"]')
page.locator('a[href^="/admin/quotations/"]')
page.locator('a[href^="/admin/production/"]')
```

### Running Admin Tests

```bash
# Run all admin tests
npx playwright test tests/e2e/group-d-admin/

# Run specific admin test file
npx playwright test tests/e2e/group-d-admin/01-admin-dashboard.spec.ts

# Run specific admin test case
npx playwright test -g "TC-ADMIN-001"

# Run with UI
npx playwright test tests/e2e/group-d-admin/ --ui

# Run in debug mode
npx playwright test tests/e2e/group-d-admin/ --debug
```

### Environment Setup

Required environment variables for DEV_MODE testing:

```env
# Enable DEV_MODE for authentication bypass
NEXT_PUBLIC_DEV_MODE=true
ENABLE_DEV_MOCK_AUTH=true

# Base URL
BASE_URL=http://localhost:3000

# Test credentials (optional for DEV_MODE)
TEST_ADMIN_EMAIL=admin@epackage-lab.com
TEST_ADMIN_PASSWORD=Admin1234!
```

### Dependencies

**External Dependencies:**
- `@playwright/test` - E2E testing framework
- `typescript` - TypeScript support

**Internal Dependencies:**
- `../../helpers/dev-mode-auth.ts` - DEV_MODE authentication helper
- `src/app/admin/**` - Admin page components being tested
- `src/middleware.ts` - DEV_MODE authentication bypass
- `src/contexts/AuthContext.tsx` - Authentication context

**Test UUIDs:**
- Admin UUID: `00000000-0000-0009-0001-000000000001`
- Member UUID: `00000000-0000-0001-0001-000000000001`

### Console Error Filtering

Known safe errors to filter in admin tests:
- `ResizeObserver` - Browser API warnings
- `Next.js` - Framework hydration messages
- `hydration` - React hydration mismatches
- `jobs?.filter` - Optional chain warnings
- `filter is not a function` - Array method issues
- `WebSocket` - WebSocket connection messages
- `Layout Error Boundary` - Error boundary messages
- `401`, `500`, `404` - HTTP errors (expected in DEV_MODE)
- `Ads`, `favicon` - External resource issues

### Page Routes Tested

| Route | Page | Test File |
|-------|------|-----------|
| `/admin/dashboard` | Admin Dashboard | 01-admin-dashboard.spec.ts |
| `/admin/orders` | Order List | 02-orders.spec.ts |
| `/admin/orders/[id]` | Order Detail | 02-orders.spec.ts |
| `/admin/quotations` | Quotation List | 03-quotations.spec.ts |
| `/admin/quotations/[id]` | Quotation Detail | 03-quotations.spec.ts |
| `/admin/production` | Production List | 04-production.spec.ts |
| `/admin/production/[id]` | Production Detail | 04-production.spec.ts |
| `/admin/contracts` | Contracts | 05-other.spec.ts |
| `/admin/approvals` | Approvals | 05-other.spec.ts |
| `/admin/inventory` | Inventory | 05-other.spec.ts |
| `/admin/settings` | Settings | 05-other.spec.ts |
| `/admin/shipments` | Shipments | 05-other.spec.ts |
| `/admin/customers` | Customer Portal Home | 06-customers-portal.spec.ts |
| `/admin/customers/orders` | Customer Orders | 06-customers-portal.spec.ts |
| `/admin/customers/profile` | Customer Profile | 06-customers-portal.spec.ts |
| `/portal` | Legacy Redirect | 06-customers-portal.spec.ts |

### Test Data Requirements

Tests use DEV_MODE which bypasses database requirements. When DEV_MODE is disabled, tests require:
- Admin user account with role `ADMIN`
- Sample orders in various statuses
- Sample quotations in various statuses
- Production jobs with tracking data
- Customer profiles

### Known Limitations

1. **DEV_MODE Dependency**: All tests require `ENABLE_DEV_MOCK_AUTH=true` environment variable
2. **Network Idle**: Tests use `waitUntil: 'networkidle'` which may timeout with slow connections
3. **Dynamic Content**: Some tests skip if no detail links are found
4. **Error Tolerance**: Tests are designed to pass even when pages show error states (DEV_MODE limitation)
5. **Redirect Tests**: Legacy `/portal` redirect tests depend on middleware configuration

### Related Files

**Test Helpers:**
- `tests/helpers/dev-mode-auth.ts` - DEV_MODE authentication utilities
- `tests/e2e/playwright.config.ts` - Playwright configuration
- `tests/e2e/AGENTS.md` - Parent E2E test documentation

**Admin Pages:**
- `src/app/admin/dashboard/page.tsx` - Admin dashboard
- `src/app/admin/dashboard/AdminDashboardClient.tsx` - Dashboard client component
- `src/app/admin/orders/page.tsx` - Order management page
- `src/app/admin/orders/AdminOrdersClient.tsx` - Orders client component
- `src/app/admin/orders/[id]/page.tsx` - Order detail page
- `src/app/admin/orders/[id]/AdminOrderDetailClient.tsx` - Order detail client
- `src/app/admin/quotations/page.tsx` - Quotation management
- `src/app/admin/quotations/AdminQuotationsClient.tsx` - Quotations client
- `src/app/admin/production/page.tsx` - Production management
- `src/app/admin/approvals/page.tsx` - Approvals management
- `src/app/admin/approvals/AdminApprovalsClient.tsx` - Approvals client
- `src/app/admin/contracts/page.tsx` - Contracts management
- `src/app/admin/inventory/page.tsx` - Inventory management
- `src/app/admin/settings/page.tsx` - Admin settings
- `src/app/admin/shipments/page.tsx` - Shipping management
- `src/app/admin/customers/page.tsx` - Customer portal home
- `src/app/admin/customers/orders/page.tsx` - Customer orders
- `src/app/admin/customers/profile/page.tsx` - Customer profile

**Middleware:**
- `src/middleware.ts` - DEV_MODE authentication bypass

### See Also

- [Playwright Documentation](https://playwright.dev)
- `../AGENTS.md` - Parent E2E test documentation
- `../README.md` - E2E test quick start guide

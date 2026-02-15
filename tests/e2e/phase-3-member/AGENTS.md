# tests/e2e/phase-3-member/ - Member Portal E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

Phase 3 member portal end-to-end tests using Playwright. Tests cover the complete member-facing functionality including dashboard, orders, quotations, profile, settings, documents, notifications, samples, support, and invoices.

## Key Files

| File | Purpose | Test Cases |
|------|---------|------------|
| `01-dashboard.spec.ts` | Member dashboard, stats cards, quick actions | 9 tests (TC-3.1.1 to TC-3.1.9) |
| `02-orders.spec.ts` | Order list, detail, tracking, status | 16 tests (TC-3.2.1 to TC-3.2.16) |
| `03-quotations.spec.ts` | Quotation list, detail, approval, PDF | 12 tests (TC-3.3.1 to TC-3.3.12) |
| `04-profile.spec.ts` | Profile management, edit, validation | 21 tests (TC-3.4.1 to TC-3.4.21) |
| `05-settings.spec.ts` | Settings, notifications, security | 21 tests (TC-3.5.1 to TC-3.5.21) |
| `06-documents.spec.ts` | Documents list, download, filter | 18 tests (TC-3.6.1 to TC-3.6.18) |
| `07-notifications.spec.ts` | Notification center, mark read, delete | 9 tests (TC-3.7.1 to TC-3.7.9) |
| `07-samples.spec.ts` | Sample requests, status, creation | 8 tests (TC-3.7.1 to TC-3.7.8) |
| `08-support.spec.ts` | Inquiries, contact form, validation | 17 tests (TC-3.8.1 to TC-3.8.17) |
| `10-invoices.spec.ts` | Invoices list, payment status, PDF | 16 tests (TC-3.10.1 to TC-3.10.16) |

## Test Structure

### Test Naming Convention

- **Format**: `TC-3.X.Y` where X = feature number, Y = test sequence
- Example: `TC-3.1.1` = Phase 3, Feature 1 (Dashboard), Test 1

### Test Categories

1. **Dashboard (3.1)**: Main member dashboard with stats and quick actions
2. **Orders (3.2)**: Order management, tracking, detail views
3. **Quotations (3.3)**: Quote requests, approval, conversion to orders
4. **Profile (3.4)**: User profile editing, avatar, account info
5. **Settings (3.5)**: Account settings, notifications, security
6. **Documents (3.6)**: Document downloads, filtering by type
7. **Notifications (3.7)**: Notification center, read/unread status
8. **Samples (3.7)**: Sample request management
9. **Support (3.8)**: Customer inquiries and contact form
10. **Invoices (3.10)**: Invoice viewing and payment tracking

## For AI Agents

### Member Portal Test Patterns

When working with member portal tests, follow these patterns:

#### 1. Authentication Helper
```typescript
import { authenticateAndNavigate, waitForPageReady } from '../../helpers/dev-mode-auth';

test.beforeEach(async ({ page }) => {
  await authenticateAndNavigate(page, '/member/dashboard');
  await waitForPageReady(page);
});
```

#### 2. Page Load Verification
```typescript
test('TC-3.X.X: Page loads successfully', async ({ page }) => {
  // Wait for load state
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

  // Check URL
  expect(page.url()).toContain('/member/feature');

  // Verify heading (Japanese)
  const heading = page.locator('h1').filter({ hasText: /日本語タイトル/ });
  await expect(heading.first()).toBeVisible();
});
```

#### 3. Empty State Handling
```typescript
// Check for data or empty state
const dataCards = page.locator('div[class*="card"]');
const emptyState = page.locator('text=/データがありません/');

const hasData = await dataCards.count() > 0;
if (hasData) {
  await expect(dataCards.first()).toBeVisible();
} else {
  await expect(emptyState).toBeVisible();
}
```

#### 4. Console Error Collection
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    // Filter out known safe errors
    if (!text.includes('favicon') && !text.includes('DevTools')) {
      errors.push(text);
    }
  }
});
```

#### 5. Japanese Text Assertions
```typescript
// Use Japanese text for assertions
await expect(page.getByText('ダッシュボード')).toBeVisible();
await expect(page.getByRole('heading', { name: '注文一覧' })).toBeVisible();
```

#### 6. Filter/Action Buttons
```typescript
// Status filter buttons
const filterButtons = page.locator('button').filter({
  hasText: /^(すべて|未読|注文済)$/
});
await filterButtons.first().click();
```

### DEV Mode Support

Tests support `ENABLE_DEV_MOCK_AUTH=true` for development:

```typescript
import { isDevMode } from '../../helpers/dev-mode-auth';

if (isDevMode()) {
  // Skip login, access pages directly
  await page.goto('/member/dashboard');
} else {
  // Standard login flow
  await performLogin(page, email, password);
}
```

### Page Routes Tested

| Route | Description | Test File |
|-------|-------------|-----------|
| `/member/dashboard` | Dashboard with stats and quick actions | `01-dashboard.spec.ts` |
| `/member/orders` | Order list with filters and search | `02-orders.spec.ts` |
| `/member/orders/[id]` | Order detail page | `02-orders.spec.ts` |
| `/member/quotations` | Quotation list | `03-quotations.spec.ts` |
| `/member/quotations/[id]` | Quotation detail | `03-quotations.spec.ts` |
| `/member/profile` | User profile display | `04-profile.spec.ts` |
| `/member/edit` | Profile editing | `04-profile.spec.ts` |
| `/member/settings` | Account settings | `05-settings.spec.ts` |
| `/admin/customers/documents` | Document downloads | `06-documents.spec.ts` |
| `/member/notifications` | Notification center | `07-notifications.spec.ts` |
| `/member/samples` | Sample requests | `07-samples.spec.ts` |
| `/member/inquiries` | Support inquiries | `08-support.spec.ts` |
| `/contact` | Contact form | `08-support.spec.ts` |
| `/member/invoices` | Invoice list | `10-invoices.spec.ts` |

### Common Locators

```typescript
// Navigation
page.locator('nav a[href^="/member/"]')
page.locator('a[href="/member/dashboard"]')

// Japanese headings
page.locator('h1').filter({ hasText: /ダッシュボード/ })
page.getByRole('heading', { name: '注文一覧' })

// Status badges
page.locator('span[class*="badge"]')
page.locator('text=/未読|既読|完了/')

// Action buttons
page.getByRole('button', { name: '保存' })
page.locator('button:has-text("更新")')

// Empty states
page.locator('text=/データがありません/')
page.locator('text=/一致する項目がありません/')
```

### Test Data Helpers

```typescript
import { getTestCredentials } from '../../helpers/dev-mode-auth';

const credentials = getTestCredentials();
// Returns: { email, password } for test member
```

### Common Wait Strategies

```typescript
// Wait for page load
await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

// Wait for loading state to disappear
await page.waitForSelector('text=/読み込み中/', { state: 'hidden', timeout: 15000 });

// Wait for specific element
await page.waitForSelector('h1', { timeout: 10000 });

// Additional wait for dynamic content
await page.waitForTimeout(2000);
```

### Mobile Responsive Testing

```typescript
test('Mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await authenticateAndNavigate(page, '/member/feature');

  // Verify content is visible on mobile
  const heading = page.locator('h1');
  await expect(heading.first()).toBeVisible();
});
```

### Dependencies

- **playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner
- **typescript**: TypeScript support
- **../../helpers/dev-mode-auth**: Auth helper functions
  - `authenticateAndNavigate()`: Login and navigate to page
  - `waitForPageReady()`: Wait for page stabilization
  - `isDevMode()`: Check if DEV_MODE is enabled
  - `getTestCredentials()`: Get test user credentials

### Database Tables Used

- `users` - User accounts
- `profiles` - User profile data
- `orders` - Orders
- `order_items` - Order line items
- `quotations` - Quotations
- `quotation_items` - Quotation line items
- `documents` - File attachments
- `customer_notifications` - User notifications
- `sample_requests` - Sample requests
- `sample_items` - Sample line items
- `invoices` - Invoice data

### Running Tests

```bash
# Run all phase-3 member tests
npx playwright test tests/e2e/phase-3-member/

# Run specific test file
npx playwright test tests/e2e/phase-3-member/01-dashboard.spec.ts

# Run with UI
npx playwright test tests/e2e/phase-3-member/ --ui

# Run specific test
npx playwright test tests/e2e/phase-3-member/ --grep "TC-3.1.1"

# Run in headed mode
npx playwright test tests/e2e/phase-3-member/ --headed
```

## See Also

- [../AGENTS.md](../AGENTS.md) - Parent E2E tests directory
- [../phase-2-auth/auth-helpers.ts](../phase-2-auth/auth-helpers.ts) - Authentication helpers
- [../../helpers/dev-mode-auth.ts](../../helpers/dev-mode-auth.ts) - DEV mode auth helpers

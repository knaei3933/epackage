# tests/e2e/ - End-to-End Playwright Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

Comprehensive end-to-end testing suite using Playwright for the Epackage Lab B2B packaging platform. Tests cover public pages, authentication flows, member portal, admin dashboard, production tracking, and business workflows.

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Quick start guide and common patterns |
| `playwright.config.ts` | Playwright configuration (root) |
| `global-setup.ts` | Global test setup (browser, auth) |
| `global-teardown.ts` | Global cleanup |
| `test-data.ts` | Test fixtures and data helpers |
| `auth-helpers.ts` | Authentication helper functions |

### Root-Level Test Specs (Workflow Tests)

| File | Description |
|------|-------------|
| `admin-approval-flow.spec.ts` | Admin user registration approval workflow |
| `admin-dashboard-comprehensive.spec.ts` | Admin dashboard comprehensive tests |
| `contact-flow.spec.ts` | Contact form submission flow |
| `customer-portal.spec.ts` | Customer portal features |
| `file-validation.spec.ts` | Design file upload validation (AI/PDF/PSD) |
| `homepage-comprehensive.spec.ts` | Homepage comprehensive validation |
| `member-flow.spec.ts` | Member authentication and dashboard flow |
| `order-comments.spec.ts` | Order comment system |
| `production-tracking.spec.ts` | Production stage progression (9 stages) |
| `quote-to-order.spec.ts` | Quote to order conversion workflow |
| `shipment-workflow.spec.ts` | Shipping carrier selection and tracking |
| `sku-calculation-verification.spec.ts` | SKU pricing calculation verification |
| `sample-request-flow.spec.ts` | Sample request workflow |
| `specification-change-workflow.spec.ts` | Spec change request/approval flow |
| `quotation-order-workflow.spec.ts` | End-to-end quotation to order workflow |

## Subdirectories

### `group-a-public/` - Public Pages (No Auth)

Independent tests for publicly accessible pages. Can run in full parallel.

```
01-home.spec.ts         - Homepage (/), About (/about), News (/news)
02-catalog.spec.ts      - Product catalog pages
03-quote-tools.spec.ts  - Quote simulator tools
04-contact.spec.ts      - Contact page
05-other.spec.ts        - Other public pages (CSR, legal, etc.)
```

**Parallel Strategy:** Full parallel execution (`fullyParallel: true`)

### `group-b-auth/` - Authentication Flows

Authentication and registration tests with Japanese business rule validation.

```
01-signin.spec.ts        - Login/logout flows
02-register.spec.ts      - Registration with validation (postal code, phone, kanji/kana)
03-password-reset.spec.ts - Password reset functionality
04-after-auth.spec.ts    - Post-authentication redirects
```

**Key Validations:**
- Postal Code: XXX-XXXX format
- Phone: XX-XXXX-XXXX format
- Kanji/Hiragana name validation
- Corporate Number: 13 digits for corporations

### `group-c-member/` - Member Portal (Sequential)

Member dashboard and features. Uses shared auth session (`test.describe.serial`).

```
01-dashboard.spec.ts   - Member dashboard, stats cards, quick actions
02-orders.spec.ts      - Order list, detail, tracking
03-quotations.spec.ts  - Quotation list, detail, approval
04-profile.spec.ts     - Profile management, address book
05-other.spec.ts       - Samples, documents, notifications
```

**Parallel Strategy:** Sequential execution with shared auth session

### `group-d-admin/` - Admin Portal (Sequential)

Admin dashboard and management features.

```
01-admin-dashboard.spec.ts    - Admin dashboard, statistics
02-orders.spec.ts              - Order management
03-quotations.spec.ts          - Quotation management
04-production.spec.ts          - Production management
05-other.spec.ts               - Inventory, shipping, settings
06-customers-portal.spec.ts    - Customer management and approvals
```

**Parallel Strategy:** Sequential execution with shared admin auth

### `group-e-redirects/` - Redirect Tests

URL redirect and routing tests.

```
01-portal-redirects.spec.ts  - Portal-specific redirects
02-b2b-redirects.spec.ts     - B2B workflow redirects
03-other-redirects.spec.ts   - Other redirect scenarios
```

### `group-f-database/` - Database Connection Tests

Database connectivity and query tests.

```
01-correct-connection.spec.ts    - Valid database connection
02-incorrect-connection.spec.ts  - Error handling for invalid connections
```

### `phase-1-public/` - Public Pages (Phase 1)

Detailed public page tests (12 files).

```
01-home-navigation.spec.ts     - Homepage navigation
02-catalog.spec.ts              - Product catalog
03-product-detail.spec.ts       - Product detail pages
04-quote-simulator.spec.ts      - Quote simulator
05-smart-quote.spec.ts          - Smart quote feature
06-roi-calculator.spec.ts       - ROI calculator
07-samples.spec.ts              - Sample requests
08-contact.spec.ts              - Contact form
09-industry-solutions.spec.ts   - Industry solution pages
10-guide-pages.spec.ts          - Guide/informational pages
11-info-pages.spec.ts           - Legal, privacy, terms
12-compare.spec.ts              - Product comparison
```

### `phase-2-auth/` - Authentication (Phase 2)

Comprehensive authentication flow tests with helper utilities.

```
01-registration-flow.spec.ts  - Full registration flow (24 test cases)
02-login-flow.spec.ts          - Login flows
03-logout-flow.spec.ts         - Logout functionality
04-forgot-password.spec.ts     - Password recovery
05-status-pages.spec.ts        - Auth status pages
auth-helpers.ts                - Helper functions (performLogin, performLogout, etc.)
```

**Key Test Cases:**
- B-REG-01 to B-REG-24: Registration validation
- Japanese text validation (Kanji, Hiragana)
- Corporate vs Individual registration
- Password strength and confirmation matching

### `phase-3-member/` - Member Portal (Phase 3)

Member functionality tests (10 files).

```
01-dashboard.spec.ts    - Member dashboard
02-orders.spec.ts       - Order management
03-quotations.spec.ts   - Quotation management
04-profile.spec.ts      - Profile settings
05-settings.spec.ts     - Account settings
06-documents.spec.ts    - Document management
07-notifications.spec.ts - Notification center
07-samples.spec.ts      - Sample requests
08-support.spec.ts      - Customer support
10-invoices.spec.ts     - Invoice management
```

### `phase-4-admin/` - Admin Portal (Phase 4)

Admin management features (9 files).

```
01-dashboard.spec.ts         - Admin dashboard
02-member-approval.spec.ts   - Member approval workflow
03-orders.spec.ts            - Order management
04-quotations.spec.ts        - Quotation management
05-contracts.spec.ts         - Contract management
06-production.spec.ts        - Production tracking
07-inventory.spec.ts         - Inventory management
08-shipping.spec.ts          - Shipping configuration
09-leads.spec.ts             - Lead management
admin-pages-quick-check.spec.ts - Quick admin page validation
```

### `phase-5-portal/` - Portal Features

Portal-specific tests.

```
00-redirects.spec.ts      - Portal redirects
01-portal-home.spec.ts    - Portal homepage
02-portal-profile.spec.ts - Portal profile management
```

## For AI Agents

### E2E Test Patterns

When working with E2E tests, follow these patterns:

#### 1. Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigation, authentication
  });

  test('TC-XXX-001: Test description', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });

  test.afterEach(async () => {
    // Cleanup: database records, cookies
  });
});
```

#### 2. Authentication Pattern
```typescript
import { performLogin, performLogout } from './auth-helpers';

// Login
await performLogin(page, email, password);

// Logout
await performLogout(page);
```

#### 3. Console Error Collection
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    // Filter out known safe errors
    if (!text.includes('favicon') && !text.includes('404')) {
      errors.push(text);
    }
  }
});
expect(errors.length).toBe(0);
```

#### 4. Japanese Text Assertions
```typescript
await expect(page.getByText('会員登録が完了しました')).toBeVisible();
await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
```

#### 5. DEV Mode Support
```typescript
const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true';

if (isDevMode) {
  // Skip login, access pages directly
  await page.goto('/admin/dashboard');
} else {
  // Standard login flow
  await performLogin(page, email, password);
}
```

#### 6. Wait Strategies
```typescript
// Wait for load state
await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

// Wait for URL
await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

// Wait for selector (with fallback)
const element = page.locator('h1');
const count = await element.count();
if (count > 0) {
  await expect(element.first()).toBeVisible();
}
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/group-a-public/01-home.spec.ts

# Run specific test by name
npx playwright test -g "TC-PUBLIC-001"

# Run in headed mode
npx playwright test --headed

# Generate report
npx playwright test --reporter=html
```

### Test Credentials

Environment variables (`.env.test`):
```env
BASE_URL=http://localhost:3000
TEST_MEMBER_EMAIL=test-member@example.com
TEST_MEMBER_PASSWORD=Test1234!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=Admin1234!
ENABLE_DEV_MOCK_AUTH=true
```

### Dependencies

- **playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner
- **typescript**: TypeScript support
- **@types/node**: Node.js types

### Database Tables Used

- `users` - User accounts
- `profiles` - User profiles
- `orders` - Orders
- `quotations` - Quotations
- `quotation_items` - Line items
- `production_logs` - Production tracking
- `shipments` - Shipping info
- `admin_notifications` - Admin notifications
- `documents` - File attachments

### Common Locators

```typescript
// By role
page.getByRole('button', { name: 'ログイン' })
page.getByRole('heading', { name: 'ダッシュボード' })

// By label
page.getByLabel('メールアドレス')
page.getByLabel('郵便番号')

// By placeholder
page.getByPlaceholder('山田')
page.getByPlaceholder('やまだ')

// By text
page.getByText('会員登録')

// By attribute
page.locator('input[name="password"]')
page.locator('select[name="prefecture"]')
```

### Test Naming Convention

- **Public tests**: `TC-PUBLIC-XXX`
- **Auth tests**: `B-REG-XX` (Registration), `B-AUTH-XX` (Login)
- **Member tests**: `TC-C-X-XX`
- **Admin tests**: `TC-4.X.X`

## Related Files

- `tests/fixtures/` - Test fixtures and data
- `playwright.config.ts` - Playwright configuration (root)
- `package.json` - Test scripts
- `.env.test` - Test environment variables

## See Also

- [Playwright Documentation](https://playwright.dev)
- `../AGENTS.md` - Parent tests directory
- `tests/README.md` - Overall testing guide

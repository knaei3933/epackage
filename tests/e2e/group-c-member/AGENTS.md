<!-- Parent: ../AGENTS.md -->

# tests/e2e/group-c-member/ - Member Portal E2E Tests

**Purpose**: End-to-end tests for authenticated member portal pages using Playwright. Tests cover dashboard, orders, quotations, profile, and other member-specific features.

---

## Directory Structure

```
group-c-member/
├── 01-dashboard.spec.ts      # Member dashboard tests
├── 02-orders.spec.ts         # Order management tests
├── 03-quotations.spec.ts     # Quotation management tests
├── 04-profile.spec.ts        # Profile and settings tests
├── 05-other.spec.ts          # Other member pages (samples, contracts, etc.)
└── AGENTS.md                 # This file
```

---

## Key Files

| File | Purpose | Test Cases |
|------|---------|------------|
| `01-dashboard.spec.ts` | Member dashboard page | TC-C-1-1 to TC-C-1-3 |
| `02-orders.spec.ts` | Order management pages | TC-C-2-1 to TC-C-2-8 |
| `03-quotations.spec.ts` | Quotation management pages | TC-C-3-1 to TC-C-3-5 |
| `04-profile.spec.ts` | Profile and settings pages | TC-C-4-1 to TC-C-4-4 |
| `05-other.spec.ts` | Other member pages | TC-C-5-1 to TC-C-5-6 |

---

## Test Coverage

### 01-dashboard.spec.ts (GROUP C-1)
- TC-C-1-1: Dashboard page loading and basic elements display
- TC-C-1-2: Dashboard statistics cards and API response verification
- TC-C-1-3: Quick actions and sidebar navigation

### 02-orders.spec.ts (GROUP C-2)
- TC-C-2-1: Orders list page loading and display
- TC-C-2-2: Order cards or empty state display
- TC-C-2-3: Status filter functionality
- TC-C-2-4: Order search functionality
- TC-C-2-5: Navigation to order detail pages
- TC-C-2-6: 404 handling for non-existent order IDs
- TC-C-2-7: API endpoint `/api/member/orders` response verification
- TC-C-2-8: Navigation from new quotation

### 03-quotations.spec.ts (GROUP C-3)
- TC-C-3-1: Quotations list page loading and display
- TC-C-3-2: Quotation status filters
- TC-C-3-3: Navigation to quotation detail pages
- TC-C-3-4: 404 handling for non-existent quotation IDs
- TC-C-3-5: API endpoint `/api/member/quotations` response verification

### 04-profile.spec.ts (GROUP C-4)
- TC-C-4-1: Profile page loading and display
- TC-C-4-2: Profile edit page
- TC-C-4-3: Settings page loading
- TC-C-4-4: API endpoint `/api/member/settings` response verification

### 05-other.spec.ts (GROUP C-5)
- TC-C-5-1: Samples page loading
- TC-C-5-2: Contracts page loading
- TC-C-5-3: Deliveries page loading
- TC-C-5-4: Inquiries page loading
- TC-C-5-5: Invoices page loading
- TC-C-5-6: Notifications page loading

---

## For AI Agents Section

### For AI Agents Working on Member Portal Tests

#### Test Execution Patterns

**Run all member portal tests:**
```bash
npx playwright tests/e2e/group-c-member/
```

**Run specific test suite:**
```bash
npx playwright test 01-dashboard.spec.ts
npx playwright test 02-orders.spec.ts
npx playwright test 03-quotations.spec.ts
npx playwright test 04-profile.spec.ts
npx playwright test 05-other.spec.ts
```

**Run with UI/debug mode:**
```bash
npx playwright test group-c-member --ui
npx playwright test group-c-member --debug
npx playwright test group-c-member --headed
```

#### Member Test Patterns

**Authentication Setup:**
All tests use DEV_MODE authentication via `setupDevModeAuth()` from `../../helpers/dev-mode-auth`:
- Sets `dev-mock-user-id` cookie
- Sets `dev-mock-user` localStorage
- Allows testing without real authentication

**Test Structure:**
- Uses `test.describe.serial()` for sequential execution
- Shares authenticated page instance across tests in suite
- Uses `test.beforeAll()` for one-time authentication setup
- Uses `test.afterAll()` for cleanup

**Error Handling:**
- Filters out expected 401/500 errors in DEV_MODE
- Ignores ResizeObserver, Next.js, hydration warnings
- Provides fallback checks when UI elements may not render

**Navigation Patterns:**
- Uses `waitUntil: 'domcontentloaded'` for page loads
- Adds `waitForTimeout()` for dynamic content rendering
- Checks URL containment for navigation verification
- Handles both successful loads and error states

**Selector Strategies:**
- Uses text filters: `.filter({ hasText: /pattern/ })`
- Provides fallback selectors for different UI patterns
- Handles empty states vs. content states
- Uses scrollIntoViewIfNeeded() for mobile elements

**API Verification:**
- Monitors API responses using `page.on('response')`
- Filters out expected 401/500 errors in DEV_MODE
- Verifies status codes are less than 500
- Checks API endpoints are called correctly

#### Writing New Member Portal Tests

1. **Import authentication helper:**
```typescript
import { setupDevModeAuth } from '../../helpers/dev-mode-auth';
```

2. **Use serial describe block:**
```typescript
test.describe.serial('GROUP C-X: Description', () => {
  let authenticatedPage: any;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await setupDevModeAuth(page);
    authenticatedPage = page;
  });

  test.afterAll(async () => {
    if (authenticatedPage) await authenticatedPage.close();
  });
});
```

3. **Follow naming convention:**
- Test cases: `TC-C-X-Y` format
- Files: `##-description.spec.ts` format

4. **Handle DEV_MODE limitations:**
- Filter 401/500 errors
- Provide fallback checks for API-dependent UI
- Use timeout delays for dynamic content

5. **Test both content and empty states:**
```typescript
const contentCount = await contentLocator.count();
if (contentCount > 0) {
  await expect(contentLocator.first()).toBeVisible();
} else {
  // Check for empty state or fallback
  const pageContent = await page.locator('body').innerText();
  expect(pageContent.length).toBeGreaterThan(0);
}
```

#### Known Limitations

- **DEV_MODE**: Tests run in development mode with mock data
- **No Real Database**: API calls may return 401/500 errors
- **Mobile Performance**: Extra timeouts added for slower mobile rendering
- **Dynamic Content**: Uses delays instead of explicit waits for some content

---

## Dependencies

### Helper Dependencies
- `../../helpers/dev-mode-auth` - DEV_MODE authentication setup

### Pages Tested
- `/member/dashboard` - Member dashboard
- `/member/orders` - Orders list
- `/member/orders/[id]` - Order detail
- `/member/quotations` - Quotations list
- `/member/quotations/[id]` - Quotation detail
- `/member/profile` - Profile page
- `/member/edit` - Profile edit
- `/member/settings` - Settings page
- `/member/samples` - Samples page
- `/member/contracts` - Contracts page
- `/member/deliveries` - Deliveries page
- `/member/inquiries` - Inquiries page
- `/member/invoices` - Invoices page
- `/member/notifications` - Notifications page

### API Endpoints Tested
- `/api/member/dashboard` - Dashboard data
- `/api/member/orders` - Orders data
- `/api/member/quotations` - Quotations data
- `/api/member/settings` - Settings data

### Related Documentation
- `../AGENTS.md` - Parent test documentation
- `../../AGENTS.md` - Root test documentation
- `docs/TEST_GROUPING_PARALLEL_EXECUTION.md` - Test grouping specification

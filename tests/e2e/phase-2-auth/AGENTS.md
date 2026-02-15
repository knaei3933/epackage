# tests/e2e/phase-2-auth/ - Authentication E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

Comprehensive authentication flow tests for the Epackage Lab B2B platform. Tests cover registration, login, logout, password recovery, and authentication status pages with Japanese business rule validation.

## Key Files

| File | Purpose |
|------|---------|
| `auth-helpers.ts` | Shared authentication helper functions and test credentials |
| `01-registration-flow.spec.ts` | Full registration flow (24 test cases) |
| `02-login-flow.spec.ts` | Login/authentication flows (25 test cases) |
| `03-logout-flow.spec.ts` | Logout and session cleanup (18 test cases) |
| `04-forgot-password.spec.ts` | Password recovery and reset (25 test cases) |
| `05-status-pages.spec.ts` | Auth status pages (28 test cases) |

## Test Coverage

### 01-registration-flow.spec.ts (24 tests)
- Page load and console error checks
- Form element validation (email, password, names, address)
- Japanese text validation (Kanji, Hiragana)
- Corporate vs Individual registration
- Password strength and confirmation matching
- Postal code (XXX-XXXX) and phone (XX-XXXX-XXXX) format validation
- Corporate number (13 digits) validation for法人
- Privacy policy consent requirements
- Success scenarios and error handling
- UX features (password toggle, mobile responsive)

### 02-login-flow.spec.ts (25 tests)
- Page load and form validation
- Login failure scenarios (invalid credentials, wrong password)
- Role-based login (MEMBER, ADMIN, PENDING)
- Redirect behavior (query parameter, role-based)
- Session management (localStorage, cookies)
- UX features (password toggle, Remember Me, loading states)
- Mobile responsive and keyboard navigation
- Error handling (network errors, server errors, timeout)

### 03-logout-flow.spec.ts (18 tests)
- Logout from MEMBER/ADMIN dashboards
- Session cleanup (localStorage, sessionStorage, cookies)
- Post-logout redirect behavior
- Token invalidation and session hijacking prevention
- Multi-tab logout synchronization
- User data preservation (non-auth data)
- Security features (logout logging, CSRF cleanup)

### 04-forgot-password.spec.ts (25 tests)
- Password reset request flow
- Email validation and error handling
- Reset token validation (valid, invalid, expired)
- New password form and strength validation
- Password confirmation matching
- User experience (password toggle, loading states)
- Rate limiting and security (email enumeration prevention)
- Error handling (network, server errors)

### 05-status-pages.spec.ts (28 tests)
- Pending approval page (/auth/pending)
- Suspended account page (/auth/suspended)
- Error pages (404, generic error)
- Unauthorized/Forbidden access (401/403)
- Navigation and UX features
- Security (sensitive info prevention, error logging)
- Accessibility (headings, keyboard nav, color contrast)

## For AI Agents

### Auth Test Patterns

#### 1. Test Structure with Console Error Collection
```typescript
const collectConsoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('Download the React DevTools') &&
          !text.includes('favicon.ico')) {
        errors.push(text);
      }
    }
  });
  return errors;
};

test('example test', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  // ... test actions
  expect(errors.length).toBe(0);
});
```

#### 2. Using Auth Helpers
```typescript
import { performLogin, performLogout, TEST_CREDENTIALS } from './auth-helpers';

// Login
await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

// Logout
await performLogout(page);

// Wait for page load
await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
```

#### 3. Japanese Text Assertions
```typescript
// Kanji name validation
const kanjiLastName = page.getByPlaceholder('山田');
await kanjiLastName.fill('山田');

// Hiragana name validation
const kanaLastName = page.getByPlaceholder('やまだ');
await kanaLastName.fill('やまだ');

// Error messages in Japanese
await expect(page.getByText('有効なメールアドレス')).toBeVisible();
```

#### 4. Corporate vs Individual Registration
```typescript
// Switch to corporation
await page.getByRole('radio', { name: '法人' }).click();

// Check corporate-specific fields appear
const companyNameInput = page.getByLabel('会社名');
await expect(companyNameInput).toBeVisible();

const legalEntityNumberInput = page.getByLabel('法人番号');
await expect(legalEntityNumberInput).toBeVisible();
```

#### 5. Password Toggle Test
```typescript
const passwordInput = page.locator('input[name="password"]');
const toggleButton = page.locator('button').filter({ hasText: '👁️' }).first();

// Check initial type
let inputType = await passwordInput.getAttribute('type');
expect(inputType).toBe('password');

// Click toggle
await toggleButton.click();
inputType = await passwordInput.getAttribute('type');
expect(inputType).toBe('text');
```

#### 6. Network Error Simulation
```typescript
// Block API request
await page.route('**/api/auth/signin/', route => {
  route.abort('failed');
});

// Or return custom error
await page.route('**/api/auth/signin/', route => {
  route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Internal server error' })
  });
});
```

#### 7. Role-Based Login Testing
```typescript
// Test MEMBER login
await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);
await expect(page).toHaveURL(/\/member\/dashboard/);

// Test ADMIN login
await performLogin(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
await expect(page).toHaveURL(/\/admin\/dashboard/);

// Test PENDING redirect
await performLogin(page, TEST_CREDENTIALS.pending.email, TEST_CREDENTIALS.pending.password);
await expect(page).toHaveURL(/\/auth\/pending/);
```

### Running Tests

```bash
# Run all phase-2 auth tests
npx playwright test tests/e2e/phase-2-auth/

# Run specific test file
npx playwright test tests/e2e/phase-2-auth/01-registration-flow.spec.ts

# Run specific test by name
npx playwright test tests/e2e/phase-2-auth/ -g "B-REG-01"

# Run with UI
npx playwright test tests/e2e/phase-2-auth/ --ui

# Run in headed mode
npx playwright test tests/e2e/phase-2-auth/ --headed
```

### Test Credentials

Configure via environment variables (`.env.test`):

```env
BASE_URL=http://localhost:3000
TEST_MEMBER_EMAIL=test-member@example.com
TEST_MEMBER_PASSWORD=Test1234!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=Admin1234!
TEST_PENDING_EMAIL=pending@example.com
TEST_PENDING_PASSWORD=Pending1234!
```

### Japanese Business Rules Validated

| Rule | Format | Validation |
|------|--------|------------|
| Postal Code | XXX-XXXX | Hyphenated 7 digits |
| Phone Number | XX-XXXX-XXXX | Hyphenated format |
| Kanji Name | 漢字 | Japanese characters only |
| Hiragana Name | ひらがな | Hiragana characters only |
| Corporate Number | 13 digits | For法人 entities |

### Helper Functions

| Function | Purpose |
|----------|---------|
| `performLogin(page, email, password)` | Execute login with proper wait handling |
| `performLogout(page)` | Execute logout via direct navigation |
| `waitForPageLoad(page, urlPattern?)` | Wait for page load and optional URL pattern |
| `collectConsoleErrors(page)` | Collect and filter console errors |
| `isAuthenticated(page)` | Check if user is authenticated |
| `registerTestUser(page, userData)` | Register a new test user |

### Dependencies

- **@playwright/test**: E2E testing framework
- **playwright**: Browser automation
- **typescript**: TypeScript support

### Database Tables Used

- `users` - User accounts and credentials
- `profiles` - User profile data (names, addresses)
- `auth.users` - Supabase auth users
- `password_reset_tokens` - Password recovery tokens

### Test Naming Convention

- **Registration**: `B-REG-XX`
- **Login**: `B-LOGIN-XX`
- **Logout**: `B-LOGOUT-XX`
- **Forgot Password**: `B-FORGOT-XX`
- **Status Pages**: `B-STATUS-XX`

### Common Locators

```typescript
// By role
page.getByRole('button', { name: 'ログイン' })
page.getByRole('radio', { name: '法人' })

// By label
page.getByLabel('メールアドレス')
page.getByLabel('郵便番号')
page.getByLabel('会社名')

// By placeholder
page.getByPlaceholder('山田')   // Kanji last name
page.getByPlaceholder('やまだ') // Hiragana last name

// By name attribute
page.locator('input[name="password"]')
page.locator('select[name="prefecture"]')

// By text
page.getByText('会員登録')
page.getByText(/有効なメールアドレス/)
```

## Related Files

- `../auth-helpers.ts` - Parent directory auth helpers
- `../AGENTS.md` - Parent E2E test documentation
- `../../playwright.config.ts` - Playwright configuration
- `src/app/auth/` - Authentication pages being tested
- `src/components/auth/` - Authentication components

## See Also

- [Playwright Documentation](https://playwright.dev)
- `../AGENTS.md` - Parent tests directory guide
- `../../README.md` - Project overview

# tests/e2e/group-b-auth/ - Authentication E2E Tests (Group B)

<!-- Parent: ../AGENTS.md -->

## Purpose

Authentication and registration flow tests for the Epackage Lab B2B platform. Tests cover login, registration with Japanese business rules, password reset, and post-authentication redirects. These tests validate authentication functionality with proper validation for postal codes, phone numbers, corporate numbers, and Kanji/Kana name inputs.

## Key Files

| File | Purpose | Test Cases |
|------|---------|------------|
| `01-signin.spec.ts` | Login/logout flows | TC-AUTH-001 to TC-AUTH-004 |
| `02-register.spec.ts` | Registration with validation | TC-AUTH-005 to TC-AUTH-007 |
| `03-password-reset.spec.ts` | Password reset functionality | TC-AUTH-008 to TC-AUTH-009 |
| `04-after-auth.spec.ts` | Post-authentication redirects | TC-AUTH-010 to TC-AUTH-013 |

## Test Coverage

### B-1: Login Page (4 tests)

- **TC-AUTH-001**: Login form display and validation
- **TC-AUTH-002**: Validation error handling
- **TC-AUTH-003**: Invalid credentials error handling
- **TC-AUTH-004**: Password visibility toggle

### B-2: Registration (3 tests)

- **TC-AUTH-005**: Registration form display
- **TC-AUTH-006**: Password validation (8+ chars, uppercase, lowercase, numbers)
- **TC-AUTH-007**: Business type form variations (Individual vs Corporation)

### B-3: Password Reset (2 tests)

- **TC-AUTH-008**: Forgot password page display
- **TC-AUTH-009**: Password reset email submission

### B-4: After Auth (4 tests)

- **TC-AUTH-010**: Logout functionality
- **TC-AUTH-011**: Pending user page display
- **TC-AUTH-012**: Authentication error page
- **TC-AUTH-013**: Session management

## For AI Agents

### Auth Test Patterns

#### 1. DEV Mode Handling
```typescript
import { isDevMode } from '../../helpers/dev-mode-auth';

test.skip(isDevMode(), 'Feature not available in DEV_MODE');
```

#### 2. Console Error Collection (Filtered)
```typescript
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    if (!text.includes('favicon') && !text.includes('404')) {
      consoleErrors.push(text);
    }
  }
});

const criticalErrors = consoleErrors.filter(e =>
  !e.includes('ResizeObserver') &&
  !e.includes('Next.js') &&
  !e.includes('hydration') &&
  !e.includes('MIME type') &&
  !e.includes('text/plain')
);
expect(criticalErrors).toHaveLength(0);
```

#### 3. Japanese Business Rule Validation
```typescript
// Postal Code: XXX-XXXX format
const postalCodeInput = page.locator('input[name="postalCode"]');
await postalCodeInput.fill('123-4567');

// Phone: XX-XXXX-XXXX format
const phoneInput = page.locator('input[name="phone"]');
await phoneInput.fill('03-1234-5678');

// Corporate Number: 13 digits (for corporations)
const legalEntityInput = page.locator('input[name="legalEntityNumber"]');
await legalEntityInput.fill('1234567890123');
```

#### 4. Kanji/Kana Name Input
```typescript
// Japanese name input with separate Kanji and Kana fields
const lastNameKanji = page.getByPlaceholder('山田');
const lastNameKana = page.getByPlaceholder('やまだ');

await lastNameKanji.fill('田中');
await lastNameKana.fill('たなか');
```

#### 5. Business Type Radio Selection
```typescript
const individualRadio = page.getByRole('radio', { name: '個人' });
const corporationRadio = page.getByRole('radio', { name: '法人' });

// Individual is default
await expect(individualRadio).toBeChecked();

// Switch to corporation
await corporationRadio.check();

// Wait for React state update
await page.waitForTimeout(500);

// Corporate fields appear
const companyNameField = page.locator('input[name="companyName"]');
await expect(companyNameField).toBeVisible();
```

#### 6. Password Visibility Toggle
```typescript
const passwordInput = page.locator('input[name="password"]');
const toggleButton = page.locator('input[name="password"]')
  .locator('xpath=../../..')
  .locator('button')
  .filter({ hasText: /👁/ });

const toggleCount = await toggleButton.count();
if (toggleCount > 0) {
  await toggleButton.first().click();
  await page.waitForTimeout(500);
  const type = await passwordInput.first().getAttribute('type');
  expect(type).toBe('text');
}
```

#### 7. Wait Strategy for Dynamic Fields
```typescript
// Poll for field appearance after state change
let field = null;
const timeoutMs = 5000;
const startTime = Date.now();

while (Date.now() - startTime < timeoutMs && !field) {
  const isVisible = await page.locator(selector).first().isVisible().catch(() => false);
  if (isVisible) {
    field = page.locator(selector).first();
    break;
  }
  await page.waitForTimeout(200);
}

expect(field).not.toBeNull();
```

### Running Tests

```bash
# Run all auth tests
npx playwright test tests/e2e/group-b-auth/

# Run specific file
npx playwright test tests/e2e/group-b-auth/01-signin.spec.ts

# Run specific test
npx playwright test -g "TC-AUTH-001"

# Run with UI
npx playwright test tests/e2e/group-b-auth/ --ui
```

### Parallel Strategy

All tests in this group can run in **full parallel** (`fullyParallel: true`) as they:
- Test authentication pages (no auth required)
- Use independent test data
- Don't modify shared state
- Clean up after themselves

### Dependencies

- **playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner
- **helpers/dev-mode-auth**: DEV_MODE detection helper

### Pages Tested

| Route | Purpose |
|-------|---------|
| `/auth/signin` | Login page |
| `/auth/register` | Registration page |
| `/auth/forgot-password` | Password reset request |
| `/auth/pending` | Pending approval page |
| `/auth/error` | Authentication error page |
| `/member/dashboard` | Member dashboard (post-auth redirect) |

### Test Credentials

Tests use mock credentials in DEV_MODE:
```env
ENABLE_DEV_MOCK_AUTH=true
```

## Related Files

- `../../helpers/dev-mode-auth.ts` - DEV_MODE helper
- `../../AGENTS.md` - Parent E2E test directory
- `../group-c-member/AGENTS.md` - Member portal tests (require auth)
- `../group-d-admin/AGENTS.md` - Admin portal tests (require auth)
- `src/app/auth/` - Authentication page components
- `src/components/auth/` - Auth form components (LoginForm, RegistrationForm)

## See Also

- [Playwright Documentation](https://playwright.dev)
- `../../helpers/` - Test helper functions

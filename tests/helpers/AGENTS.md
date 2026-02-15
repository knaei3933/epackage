<!-- Parent: ../AGENTS.md -->

# tests/helpers/ - Test Helper Utilities Directory

**Purpose**: Reusable helper functions and utilities for E2E and integration tests, providing authentication, email testing, and common test operations.

---

## Directory Purpose

This directory contains utility modules that simplify test setup, authentication flows, and external service interactions (email, database). These helpers abstract complex operations into reusable functions used across multiple test suites.

---

## Key Files

| File | Purpose | Exports |
|------|---------|---------|
| `dev-mode-auth.ts` | DEV_MODE authentication utilities | `isDevMode()`, `authenticateAndNavigate()`, `setupDevModeAuth()`, `createAuthenticatedPage()` |
| `email-tester.ts` | Email testing for verification flows | `EmailTester`, `SupabaseEmailTester`, `EmailMessage` interface |

---

## File Details

### dev-mode-auth.ts

**Purpose**: Handle authentication in DEV_MODE environment where real authentication is bypassed.

**Key Functions**:
- `isDevMode()` - Check if application is running in DEV_MODE
- `authenticateAndNavigate(page, targetPath)` - Auth and navigate to member pages
- `setupDevModeAuth(page, userId)` - Set DEV_MODE auth cookies and localStorage
- `createAuthenticatedPage(browser, userId)` - Create pre-authenticated page context
- `navigateToMemberPage(page, path, options)` - Navigate with timeout handling
- `waitForPageReady(page, timeout)` - Wait for page load state
- `getTestCredentials()` - Get test user credentials

**Environment Variables**:
- `NEXT_PUBLIC_DEV_MODE` - Client-side dev mode flag
- `ENABLE_DEV_MOCK_AUTH` - Server-side mock auth flag
- `TEST_MEMBER_EMAIL` - Test member email (default: `test@epackage-lab.com`)
- `TEST_MEMBER_PASSWORD` - Test member password (default: `Test1234!`)
- `BASE_URL` - Application base URL (default: `http://localhost:3000`)

**Usage Example**:
```typescript
import { setupDevModeAuth, authenticateAndNavigate } from './helpers/dev-mode-auth'

// In test setup
test.beforeAll(async () => {
  await setupDevModeAuth(page, 'test-member-001')
})

// In tests
test('should access member dashboard', async ({ page }) => {
  await authenticateAndNavigate(page, '/member/dashboard')
  await expect(page).toHaveURL(/.*\/member\/dashboard/)
})
```

### email-tester.ts

**Purpose**: Email testing utilities for automated email verification in E2E tests.

**Key Classes**:
- `EmailTester` - Generic email testing with multiple provider support
- `SupabaseEmailTester` - Specialized for Supabase Auth email flows

**Supported Providers**:
- `gmail` - Gmail API with OAuth2
- `imap` - Generic IMAP protocol (Gmail, Outlook, Yahoo)
- `mailosaur` - Mailosaur testing service
- `test` - Mock provider for development

**Key Methods**:
- `waitForEmail(options)` - Wait for email matching criteria
- `waitForConfirmationEmail()` - Wait for Supabase confirmation email
- `waitForPasswordResetEmail()` - Wait for password reset email
- `waitForEmailChangeConfirmation()` - Wait for email change confirmation
- `cleanup()` - Clean up test emails

**EmailMessage Interface**:
- `from`, `to`, `subject`, `text`, `html`, `date`
- `extractLink()` - Extract URLs from email body
- `extractCode()` - Extract verification codes
- `getText()` - Get plain text content

**Usage Example**:
```typescript
import { SupabaseEmailTester } from './helpers/email-tester'

const emailTester = new SupabaseEmailTester({
  provider: 'test',
  email: 'test@example.com'
})

test('should verify email', async ({ page }) => {
  // Trigger email send
  await page.click('button[type="submit"]')

  // Wait for and extract confirmation link
  const confirmationLink = await emailTester.waitForConfirmationEmail()
  await page.goto(confirmationLink)

  // Verify email confirmed
  await expect(page).toHaveURL(/.*\/auth\/confirmed/)
})
```

**Provider Configurations**:

```typescript
// Gmail with IMAP
const tester = new EmailTester({
  provider: 'imap',
  email: 'test@gmail.com',
  password: 'app-specific-password',
  imapHost: 'imap.gmail.com',
  imapPort: 993
})

// Mailosaur
const tester = new EmailTester({
  provider: 'mailosaur',
  email: 'test@mailosaur.io',
  apiKey: 'your-api-key'
})

// Development mock
const tester = new EmailTester({
  provider: 'test',
  email: 'test@example.com'
})
```

---

## For AI Agents Section

### Test Helper Patterns

#### Authentication Setup

**Before test suite (recommended)**:
```typescript
import { setupDevModeAuth } from './helpers/dev-mode-auth'

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await setupDevModeAuth(page)
  await page.close()
})
```

**Per-test authentication**:
```typescript
test.beforeEach(async ({ page }) => {
  await authenticateAndNavigate(page, '/member/quotations')
})
```

#### Email Testing Flow

**Standard email verification**:
```typescript
test('should send confirmation email', async ({ page }) => {
  // 1. Trigger email send
  await page.getByLabel('メールアドレス').fill('test@example.com')
  await page.getByRole('button', { name: '送信' }).click()

  // 2. Wait for email
  const email = await emailTester.waitForEmail({
    subject: /メールアドレスのご確認/,
    timeout: 60000
  })

  // 3. Extract link/code
  const link = email.extractLink()
  expect(link).toBeTruthy()

  // 4. Navigate to link
  await page.goto(link)
})
```

#### Page Navigation Patterns

**With proper timeout handling**:
```typescript
import { navigateToMemberPage, waitForPageReady } from './helpers/dev-mode-auth'

test('should load member quotations', async ({ page }) => {
  await navigateToMemberPage(page, '/member/quotations', {
    timeout: 60000,
    waitUntil: 'domcontentloaded'
  })
  await waitForPageReady(page)

  // Continue with assertions
})
```

#### Conditional Logic for DEV_MODE

```typescript
import { isDevMode } from './helpers/dev-mode-auth'

test('conditional test', async ({ page }) => {
  if (isDevMode()) {
    // Skip auth steps
    await page.goto('/member/dashboard')
  } else {
    // Full auth flow
    await page.goto('/auth/signin')
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByRole('button', { name: 'ログイン' }).click()
  }
})
```

### Helper Import Paths

From tests in `tests/e2e/`:
```typescript
import { setupDevModeAuth, authenticateAndNavigate } from '../helpers/dev-mode-auth'
import { SupabaseEmailTester } from '../helpers/email-tester'
```

From tests in `tests/` (root level):
```typescript
import { setupDevModeAuth } from './helpers/dev-mode-auth'
import { EmailTester } from './helpers/email-tester'
```

### Best Practices

1. **Use DEV_MODE helpers** for faster test execution in development
2. **Set appropriate timeouts** for list pages (data loading takes time)
3. **Wait for page ready state** before making assertions
4. **Use email tester for async flows** instead of manual verification
5. **Clean up test emails** to avoid polluting test inbox
6. **Mock email provider** for CI/CD environments (use `provider: 'test'`)

---

## Dependencies

### External Dependencies

| Package | Purpose |
|---------|---------|
| `@playwright/test` | Playwright Page type, browser context |
| `imapflow` | IMAP protocol for email testing |
| `googleapis` | Gmail API access |

### Internal Dependencies

| Dependency | Purpose |
|------------|---------|
| `playwright.config.ts` | Base URL configuration |
| `.env.test` | Test environment variables |

### Environment Variables Required

For `dev-mode-auth.ts`:
- `NEXT_PUBLIC_DEV_MODE` or `ENABLE_DEV_MOCK_AUTH` - Enable dev mode
- `BASE_URL` - Application URL (default: `http://localhost:3000`)
- `TEST_MEMBER_EMAIL` - Test user email
- `TEST_MEMBER_PASSWORD` - Test user password

For `email-tester.ts`:
- `GMAIL_CLIENT_ID` - Gmail OAuth client ID (for Gmail provider)
- `GMAIL_CLIENT_SECRET` - Gmail OAuth secret
- `GMAIL_REDIRECT_URI` - OAuth redirect URI
- `MAILOSAUR_API_KEY` - Mailosaur API key (for Mailosaur provider)

---

## Related Documentation

- `../AGENTS.md` - Parent tests directory documentation
- `../e2e/AGENTS.md` - E2E test patterns and Page Objects
- `../playwright.config.ts` - Playwright configuration
- `../../src/middleware.ts` - DEV_MODE authentication bypass logic
- `../../src/contexts/AuthContext.tsx` - Client-side auth context

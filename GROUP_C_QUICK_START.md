# Group C (Member) Tests - Quick Start Guide

## Overview
This guide helps you quickly run and debug the Group C (Member Portal) E2E tests after the DEV_MODE authentication fixes.

## Test Files
- `01-dashboard.spec.ts` - Dashboard tests (3 tests)
- `02-orders.spec.ts` - Order management tests (8 tests)
- `03-quotations.spec.ts` - Quotation management tests (5 tests)
- `04-profile.spec.ts` - Profile tests (4 tests)
- `05-other.spec.ts` - Other member pages tests (6 tests)

**Total**: 26 tests across 5 files

## Prerequisites

### 1. Environment Setup
Ensure `.env.local` has these variables:
```bash
ENABLE_DEV_MOCK_AUTH=true
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Start Dev Server
The tests require the dev server to be running:
```bash
npm run dev
```

Server should be running on `http://localhost:3000`

### 3. Install Dependencies
```bash
npm install
```

## Running Tests

### Run All Group C Tests
```bash
npx playwright test tests/e2e/group-c-member/
```

### Run Specific Test File
```bash
# Dashboard tests
npx playwright test tests/e2e/group-c-member/01-dashboard.spec.ts

# Orders tests
npx playwright test tests/e2e/group-c-member/02-orders.spec.ts

# Quotations tests
npx playwright test tests/e2e/group-c-member/03-quotations.spec.ts

# Profile tests
npx playwright test tests/e2e/group-c-member/04-profile.spec.ts

# Other pages tests
npx playwright test tests/e2e/group-c-member/05-other.spec.ts
```

### Run with UI Mode (Recommended for Debugging)
```bash
npx playwright test --ui tests/e2e/group-c-member/
```

### Run with Debug Mode
```bash
npx playwright test --debug tests/e2e/group-c-member/
```

### Run Specific Test
```bash
npx playwright test --grep "TC-C-2-1"
```

## What the Fix Does

The `setupDevModeAuth()` helper function in `tests/helpers/dev-mode-auth.ts`:

1. **Sets the DEV_MODE cookie** (`dev-mock-user-id`) that the middleware checks
2. **Sets localStorage mock user data** (`dev-mock-user`) that AuthContext loads
3. **Initializes the page** by navigating to the base URL first

This ensures both server-side (middleware) and client-side (AuthContext) authentication bypass work correctly.

## Test Structure

Each test file follows this pattern:

```typescript
test.describe.serial('GROUP C-X: Description', () => {
  let authenticatedPage: any;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    // Setup DEV_MODE authentication
    await setupDevModeAuth(page, 'test-member-001');
    authenticatedPage = page;
  });

  test.afterAll(async () => {
    if (authenticatedPage) {
      await authenticatedPage.close();
    }
  });

  test('Test Name', async () => {
    await authenticatedPage.goto('/member/...');
    // Test assertions...
  });
});
```

## Common Issues

### Issue: Tests still fail with ERR_ABORTED
**Solution**: Make sure the dev server is running on port 3000

### Issue: Tests redirect to signin page
**Solution**: Check that `ENABLE_DEV_MOCK_AUTH=true` is set in `.env.local`

### Issue: Mock user data not loading
**Solution**: Verify the test is using `setupDevModeAuth()` and not the old localStorage approach

### Issue: Timeout errors
**Solution**: Increase timeout in test config or ensure dev server is responsive

## Debugging Tips

1. **Check Console Output**: Tests log `[DEV_MODE]` messages when setting up auth
2. **Use UI Mode**: `--ui` flag shows browser interaction in real-time
3. **Screenshot**: Screenshots are saved on failure to `test-screenshots/`
4. **Trace Files**: Enable traces with `trace: 'on-first-retry'` in playwright.config.ts

## Verification

To verify the fixes are working:

1. Run a single test file:
   ```bash
   npx playwright test tests/e2e/group-c-member/04-profile.spec.ts
   ```

2. Check for success message:
   ```
   ✓ 04-profile.spec.ts:13:3 › TC-C-4-1: プロフィールページの読み込みと表示 (5.2s)
   ```

3. No `net::ERR_ABORTED` errors should appear

## Next Steps

After verifying Group C tests pass:

1. Run other test groups:
   - Group A: `tests/e2e/group-a-public/`
   - Group B: `tests/e2e/group-b-auth/`
   - Group D: `tests/e2e/group-d-admin/`
   - Group E: `tests/e2e/group-e-flows/`

2. Run all E2E tests:
   ```bash
   npm run test:e2e
   ```

## Summary of Changes

- **Helper Function**: Added `setupDevModeAuth()` to `tests/helpers/dev-mode-auth.ts`
- **AuthContext Fix**: Updated `loadUserFromLocalStorage()` to detect DEV_MODE via cookie/localStorage presence
- **Test Files**: Updated all 5 Group C test files to use the new helper function
- **Documentation**: Created this guide and complete fix summary

---

**Last Updated**: 2026-01-16
**Status**: Ready for Testing

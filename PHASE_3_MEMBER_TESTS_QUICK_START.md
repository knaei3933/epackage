# Phase 3 Member Portal Tests - Quick Start Guide

## Prerequisites

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Server must be running on `http://localhost:3000`

2. **Verify Environment Configuration**:
   - `.env.test` should have `ENABLE_DEV_MOCK_AUTH=true`
   - This enables mock authentication for faster testing

## Test Credentials

The tests use these credentials (configured in `.env.test`):

```bash
TEST_MEMBER_EMAIL=test@epackage-lab.com
TEST_MEMBER_PASSWORD=Test1234!
```

## Running Tests

### Run All Phase 3 Tests
```bash
npx playwright test tests/e2e/phase-3-member/
```

### Run Specific Test Groups
```bash
# Dashboard tests
npx playwright test tests/e2e/phase-3-member/01-dashboard.spec.ts

# Orders tests
npx playwright test tests/e2e/phase-3-member/02-orders.spec.ts

# Quotations tests
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts

# Profile tests
npx playwright test tests/e2e/phase-3-member/04-profile.spec.ts

# Settings tests
npx playwright test tests/e2e/phase-3-member/05-settings.spec.ts

# Documents tests
npx playwright test tests/e2e/phase-3-member/06-documents.spec.ts

# Notifications tests
npx playwright test tests/e2e/phase-3-member/07-notifications.spec.ts

# Support tests
npx playwright test tests/e2e/phase-3-member/08-support.spec.ts
```

### Run with UI (Interactive Mode)
```bash
npx playwright test tests/e2e/phase-3-member/ --ui
```

### Run with Debugging
```bash
npx playwright test tests/e2e/phase-3-member/ --debug
```

## Expected Test Results

### With DEV_MODE Enabled
- ✅ Tests should authenticate successfully
- ✅ Pages should load within timeout (20s)
- ⚠️ Some tests may show empty states (no test data in database)

### Empty State Behavior
Tests are designed to handle both scenarios:
1. **With Data**: Verify data displays correctly
2. **Without Data**: Verify empty state messages appear

Example:
```typescript
if (orderCount > 0) {
  // Verify order data
  await expect(orderCards.first()).toBeVisible();
} else {
  // Verify empty state
  const emptyState = page.locator('text=/注文がありません/i');
  await expect(emptyState).toBeVisible();
}
```

## Troubleshooting

### Tests Fail with Timeout
**Problem**: Tests timeout waiting for page load

**Solutions**:
1. Check dev server is running: `npm run dev`
2. Verify `.env.test` has `ENABLE_DEV_MOCK_AUTH=true`
3. Check browser console for JavaScript errors
4. Try running with `--debug` flag to see what's happening

### Authentication Fails
**Problem**: Login doesn't work, tests can't access member pages

**Solutions**:
1. Verify `NODE_ENV=development` in `.env.test`
2. Check signin API is accessible: `curl http://localhost:3000/api/auth/signin`
3. Look for localStorage data after login (browser DevTools > Application > Local Storage)
4. Check for cookie `dev-mock-user-id`

### All Tests Show Empty States
**Problem**: No orders, quotations, or other data in database

**Solutions**:
1. This is expected with DEV_MODE mock authentication
2. Tests should still pass (they verify empty state UI)
3. To add test data, run: `npm run ts-node scripts/setup-test-users.ts`

### Tests Pass But Show Warnings
**Problem**: Tests pass but console shows warnings

**Common Warnings**:
- `favicon.ico` 404: Ignore (not critical)
- `Download the React DevTools`: Ignore (development only)
- `Ads` related: Ignore (third-party scripts)

## Test Configuration

### Playwright Config
- **Timeout**: 20 seconds per test
- **Retry**: 0 (development), 2 (CI)
- **Workers**: 4 (development), 2 (CI)
- **Base URL**: `http://localhost:3000`

### Environment Variables
```bash
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true
ENABLE_DEV_MOCK_AUTH=true
TEST_MEMBER_EMAIL=test@epackage-lab.com
TEST_MEMBER_PASSWORD=Test1234!
```

## Test Reports

After running tests, view detailed reports:

```bash
# HTML Report
npx playwright show-report playwright-report

# JSON Results
cat test-results/results.json

# JUnit Results (CI)
cat test-results/results.xml
```

## Common Test Patterns

### Pattern 1: Conditional Assertions
```typescript
const elementCount = await element.count();
if (elementCount > 0) {
  await expect(element.first()).toBeVisible();
}
```

### Pattern 2: Wait for Navigation
```typescript
try {
  await page.waitForURL(/\/member\//, { timeout: 10000 });
} catch {
  // Fallback to manual navigation
  await page.goto('/member/dashboard');
}
```

### Pattern 3: Console Error Filtering
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

// Filter out non-critical errors
const criticalErrors = errors.filter(e =>
  !e.includes('Ads') &&
  !e.includes('favicon') &&
  !e.includes('DevTools')
);
```

## Test Data Strategy

### Current: DEV_MODE (Mock Auth)
- ✅ Fast execution
- ✅ No database dependency
- ✅ Reliable authentication
- ❌ Limited real data testing

### Alternative: Real Test Users
Create real test users in database:

```bash
npm run ts-node scripts/setup-test-users.ts
```

Then update `.env.test`:
```bash
ENABLE_DEV_MOCK_AUTH=false  # Use real auth
```

## Next Steps

1. **Run Tests**: Execute all Phase 3 tests
2. **Review Results**: Check HTML report for failures
3. **Address Issues**: Fix any remaining test failures
4. **Add Test Data** (optional): Create realistic test scenarios

## Support

For issues or questions:
- Check `PHASE_3_MEMBER_TESTS_FIX_SUMMARY.md` for detailed fix information
- Review test file comments for specific test scenarios
- Use `--debug` flag to investigate failures
- Check Playwright docs: https://playwright.dev/docs/intro

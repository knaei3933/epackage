# Phase 2 Authentication E2E Tests - Quick Start Guide

## Prerequisites

1. **Development server must be running** on port 3000:
   ```bash
   npm run dev
   ```

2. **Test users must exist in the database**:
   ```bash
   # Create test users
   ts-node scripts/setup-auth-test-users.ts
   ```

3. **Environment variables configured** in `.env.local`:
   ```bash
   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Optional: Custom test credentials (defaults will be used if not set)
   TEST_MEMBER_EMAIL=test-member@example.com
   TEST_MEMBER_PASSWORD=Test1234!
   TEST_ADMIN_EMAIL=admin@example.com
   TEST_ADMIN_PASSWORD=Admin1234!
   TEST_PENDING_EMAIL=pending@example.com
   TEST_PENDING_PASSWORD=Pending1234!
   ```

## Running the Tests

### Run All Phase 2 Auth Tests
```bash
npx playwright test tests/e2e/phase-2-auth/
```

### Run Individual Test Suites
```bash
# Registration flow tests
npx playwright test tests/e2e/phase-2-auth/01-registration-flow.spec.ts

# Login flow tests
npx playwright test tests/e2e/phase-2-auth/02-login-flow.spec.ts

# Logout flow tests
npx playwright test tests/e2e/phase-2-auth/03-logout-flow.spec.ts
```

### Run with UI (Recommended for Debugging)
```bash
npx playwright test tests/e2e/phase-2-auth/ --ui
```

### Run in Debug Mode (Step-by-Step)
```bash
npx playwright test tests/e2e/phase-2-auth/ --debug
```

### Run Specific Test
```bash
# Run a single test by test ID
npx playwright test tests/e2e/phase-2-auth/01-registration-flow.spec.ts -g "B-REG-01"
```

## Test Structure

### 01-registration-flow.spec.ts (24 tests)
- **B-REG-01 to B-REG-07**: Page load and form element validation
- **B-REG-08 to B-REG-17**: Form validation (email, password, Japanese names, phone, postal code)
- **B-REG-18 to B-REG-19**: Success scenarios (individual/corporation registration)
- **B-REG-20 to B-REG-21**: Error scenarios (duplicate email, network error)
- **B-REG-22 to B-REG-24**: UX tests (password toggle, mobile layout, cancel button)

### 02-login-flow.spec.ts (25 tests)
- **B-LOGIN-01 to B-LOGIN-04**: Page load and form validation
- **B-LOGIN-05 to B-LOGIN-06**: Client-side validation
- **B-LOGIN-07 to B-LOGIN-09**: Failure scenarios (invalid credentials, wrong password)
- **B-LOGIN-10 to B-LOGIN-12**: Success scenarios (MEMBER, ADMIN, PENDING users)
- **B-LOGIN-13 to B-LOGIN-15**: Redirect behavior tests
- **B-LOGIN-16 to B-LOGIN-20**: UX tests (password toggle, remember me, keyboard navigation)
- **B-LOGIN-21 to B-LOGIN-22**: Session management tests
- **B-LOGIN-23 to B-LOGIN-25**: Error handling tests

### 03-logout-flow.spec.ts (18 tests)
- **B-LOGOUT-01 to B-LOGOUT-03**: Logout functionality tests
- **B-LOGOUT-04 to B-LOGOUT-06**: Session cleanup tests
- **B-LOGOUT-07 to B-LOGOUT-09**: Post-logout redirect behavior
- **B-LOGOUT-10 to B-LOGOUT-11**: Token invalidation tests
- **B-LOGOUT-12 to B-LOGOUT-13**: Error handling tests
- **B-LOGOUT-14 to B-LOGOUT-16**: UX tests (loading state, multi-tab sync)
- **B-LOGOUT-17 to B-LOGOUT-18**: Security tests (event logging, CSRF cleanup)

## Common Issues and Solutions

### Issue: Tests timeout at 25-30 seconds
**Solution**: This was the original issue - now fixed with:
- 30-second navigation timeout
- Proper wait states after page loads
- React hydration waits

### Issue: "Test user not found" errors
**Solution**: Run the test user setup script:
```bash
ts-node scripts/setup-auth-test-users.ts
```

### Issue: Tests fail in CI but pass locally
**Solution**: Ensure:
1. CI has access to Supabase (use test database, not production)
2. Environment variables are set in CI configuration
3. Development server is running before tests execute

### Issue: Logout tests fail with "element not found"
**Solution**: Logout tests now use direct navigation to `/auth/signout` instead of UI interactions, making them more reliable.

### Issue: Login redirect doesn't work
**Solution**: The login form uses `window.location.href` which causes a full page reload. Tests now wait for:
1. `domcontentloaded` event
2. Additional 2-second wait for React hydration
3. Dashboard elements to be visible

## Test Data

### Default Test Users

| Role | Email | Password | Status |
|------|-------|----------|--------|
| MEMBER | test-member@example.com | Test1234! | Approved |
| ADMIN | admin@example.com | Admin1234! | Approved |
| PENDING | pending@example.com | Pending1234! | Pending Approval |

### Custom Test Users

Set environment variables to use custom test users:
```bash
export TEST_MEMBER_EMAIL="custom@example.com"
export TEST_MEMBER_PASSWORD="CustomPass123!"
```

## Viewing Test Results

### HTML Report
```bash
npx playwright test tests/e2e/phase-2-auth/ --reporter=html
# Report opens at: playwright-report/index.html
```

### JSON Report
```bash
npx playwright test tests/e2e/phase-2-auth/ --reporter=json
# Report saved at: test-results/results.json
```

### JUnit Report (for CI)
```bash
npx playwright test tests/e2e/phase-2-auth/ --reporter=junit
# Report saved at: test-results/results.xml
```

## Debugging Tips

1. **Use Playwright Inspector**: Run with `--debug` flag to step through tests
2. **Take Screenshots**: Screenshots are automatically captured on failure
3. **Trace Viewer**: Run with `--trace on` to capture traces for debugging
4. **Console Logs**: Check browser console for JavaScript errors
5. **Network Tab**: Inspect network requests to API endpoints

## Continuous Integration

### GitHub Actions Example
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'

- name: Install dependencies
  run: npm ci

- name: Start development server
  run: npm run dev &
  env:
    PORT: 3000

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Setup test users
  run: ts-node scripts/setup-auth-test-users.ts
  env:
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

- name: Run auth tests
  run: npx playwright test tests/e2e/phase-2-auth/
```

## Maintenance

### Updating Test Credentials
1. Update `scripts/setup-auth-test-users.ts` with new user definitions
2. Run the setup script to create new users in database
3. Update environment variables if using custom credentials

### Adding New Tests
1. Use shared helpers from `auth-helpers.ts`
2. Follow naming convention: B-[FEATURE]-[NUMBER]
3. Add descriptive comments in Japanese and English
4. Include proper wait states and timeouts

### Cleaning Up Test Data
```bash
# Delete test users (manual operation via Supabase dashboard)
# Or create a cleanup script similar to setup script
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Project Test Documentation](./PHASE_2_AUTH_TEST_FIXES_SUMMARY.md)

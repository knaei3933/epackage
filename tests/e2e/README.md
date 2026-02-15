# E2E Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Copy `.env.local.example` to `.env.test` and configure:
```bash
cp .env.local.example .env.test
```

Edit `.env.test` with your test values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_test_service_key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=AdminPassword123!
```

### 3. Start Development Server
```bash
npm run dev
```

Server should run on `http://localhost:3000`

### 4. Run Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run with UI (recommended for development):
```bash
npm run test:e2e:ui
```

Run specific test file:
```bash
npx playwright test tests/e2e/admin-approval-flow.spec.ts
```

Run specific test:
```bash
npx playwright test -g "should approve user"
```

## Test Structure

### New E2E Tests (6 files)

1. **admin-approval-flow.spec.ts** - Admin approval workflow
   - User registration and approval
   - Admin views pending users
   - Approve/reject functionality
   - Email notifications

2. **quote-to-order.spec.ts** - Quote to order conversion
   - Create quote via simulator
   - Admin converts quote to order
   - Order number generation
   - Customer views order

3. **production-tracking.spec.ts** - Production workflow
   - Create production order
   - Advance through 9 stages
   - Progress tracking
   - Notes and photos

4. **customer-portal.spec.ts** - Customer features
   - Dashboard navigation
   - View order details
   - Download documents
   - Update profile
   - Add order notes

5. **shipment-workflow.spec.ts** - Shipping process
   - Create shipment
   - Select carrier (Yamato/Sagawa)
   - Generate labels
   - Track shipments

6. **file-validation.spec.ts** - Design file validation
   - Upload AI/PDF/PSD files
   - Validate file types
   - Check size limits
   - Admin approve/reject

### Test Fixtures

All test data and helpers are in `tests/fixtures/test-data.ts`:
- Test users (admin, member, Japanese member)
- Test orders (basic, full)
- Production stages (9 stages)
- Shipment data (Yamato, Sagawa)
- File types (AI, PDF, PSD)

## Common Patterns

### Authentication Helper
```typescript
import { AuthHelper } from '../fixtures/test-data';

const authHelper = new AuthHelper(page);
await authHelper.loginAsAdmin();
await authHelper.loginAsMember(email, password);
await authHelper.register(userData);
```

### Database Cleanup
```typescript
test.afterEach(async () => {
  const supabase = getSupabaseClient();
  await supabase.from('orders').delete().eq('id', orderId);
  await supabase.from('profiles').delete().eq('email', testUser.email);
});
```

### Japanese Text Assertions
```typescript
await expect(page.locator('text=会員登録が完了しました')).toBeVisible();
await expect(page.locator('text=承認しました')).toBeVisible();
```

### Wait for Loading
```typescript
import { waitForLoading } from '../fixtures/test-data';
await waitForLoading(page);
```

## Troubleshooting

### "Cannot find module 'axe-playwright'"
```bash
npm install --save-dev axe-playwright
```

### "Supabase credentials not configured"
- Check `.env.test` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Tests timeout
- Ensure dev server is running on port 3000
- Check `playwright.config.ts` timeout settings
- Increase timeout if network is slow

### File upload tests fail
- Create test files in `tests/fixtures/files/`
- Check file paths are correct

## Best Practices

1. **Always clean up** - Use `afterEach` to clean database
2. **Use unique data** - Add timestamps to avoid conflicts
3. **Wait properly** - Use `waitForSelector`, not `waitForTimeout`
4. **Test both paths** - Success and failure cases
5. **Japanese text** - Include Japanese assertions for UI
6. **Isolate tests** - Each test should be independent

## Coverage Goals

- ✅ Critical user flows: 90%+
- ✅ Admin workflows: 85%+
- ✅ File validation: 100%
- ✅ Production tracking: 90%+
- ✅ Shipment process: 90%+

## Getting Help

Check `tests/TEST_SUMMARY.md` for detailed documentation.

For specific test issues:
1. Look at similar existing tests
2. Check test fixtures for reusable components
3. Review Playwright documentation: https://playwright.dev

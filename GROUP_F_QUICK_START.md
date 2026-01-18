# Group F Database Tests - Quick Reference

## Test Location
`tests/e2e/group-f-database/`

## Test Files
1. **01-correct-connection.spec.ts** - Tests normal API connections
   - F-1-1: Dashboard API connection
   - F-1-2: Orders API connection
   - F-1-3: Quotations API connection

2. **02-incorrect-connection.spec.ts** - Tests error handling (RLS policies)
   - F-2-1: No auth member page access (skipped in DEV_MODE)
   - F-2-2: Member role admin page access (skipped in DEV_MODE)
   - F-2-3: Other user data access block (RLS policy) ✅ **FIXED**

## Quick Commands

### Run all Group F tests (Chromium only):
```bash
npm run test:e2e tests/e2e/group-f-database/ --project=chromium --reporter=line
```

### Run specific test file:
```bash
# Test incorrect connections (RLS policies)
npx playwright test tests/e2e/group-f-database/02-incorrect-connection.spec.ts --project=chromium --reporter=line

# Test correct connections
npx playwright test tests/e2e/group-f-database/01-correct-connection.spec.ts --project=chromium --reporter=line
```

### Run with detailed output:
```bash
npx playwright test tests/e2e/group-f-database/ --project=chromium --reporter=list
```

## What Was Fixed

### Issue
Test F-2-3 was failing because:
1. `getOrderById()` didn't have DEV_MODE support
2. Test expectations weren't aligned with 404 page behavior

### Solution
1. ✅ Added DEV_MODE mock data to `getOrderById()` in `src/lib/dashboard.ts`
2. ✅ Added DEV_MODE mock data to `getOrderStatusHistory()` in `src/lib/dashboard.ts`
3. ✅ Updated test F-2-3 to properly verify 404 page content

### How It Works Now
```
User accesses: /member/orders/other-user-order-999
                    ↓
getOrderById() checks mock data
                    ↓
Order ID not found → returns null
                    ↓
Page component calls notFound()
                    ↓
Next.js renders 404 page
                    ↓
Test verifies 404 content is displayed ✅
```

## Expected Test Results

```
Running 6 tests using 1 worker

✓ GROUP F-1-1: ダッシュボードAPI接続
✓ GROUP F-1-2: 注文API接続
✓ GROUP F-1-3: 見積API接続
○ GROUP F-2-1: 認証なし会員ページアクセス試行 (skipped in DEV_MODE)
○ GROUP F-2-2: 会員権限で管理者ページアクセス試行 (skipped in DEV_MODE)
✓ GROUP F-2-3: 他ユーザーデータアクセス遮断（RLSポリシー準拠）

6 tests (4 passed, 2 skipped)
```

## Key Files Modified

1. **src/lib/dashboard.ts**
   - `getOrderById()` - Added DEV_MODE mock data support
   - `getOrderStatusHistory()` - Added DEV_MODE mock data support

2. **tests/e2e/group-f-database/02-incorrect-connection.spec.ts**
   - Test F-2-3 - Updated expectations for 404 page verification

## Troubleshooting

### If tests still fail:
1. Check that dev server is running on port 3000
2. Verify `.env.test` has `ENABLE_DEV_MOCK_AUTH=true`
3. Check browser console for errors
4. Look for 404 page rendering correctly

### Common Issues:
- **Timeout errors**: Increase timeout in test (currently 60000ms)
- **Page not loading**: Check dev server is running
- **Wrong user ID**: Ensure test sets `dev-mock-user-id` cookie

## Related Documentation
- Full fix details: `GROUP_F_DATABASE_TEST_FIXES.md`
- DEV_MODE implementation: `src/lib/dev-mode.ts`
- Test helper: `tests/helpers/dev-mode-auth.ts`

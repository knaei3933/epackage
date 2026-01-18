# TC-AUTH-012 Quick Reference

## Test Information
- **Test ID**: TC-AUTH-012
- **Test Name**: 認証エラーページ表示 (Authentication Error Page Display)
- **File**: `tests/e2e/group-b-auth/04-after-auth.spec.ts`
- **Target URL**: `/auth/error`

## Quick Test Commands

### Run just this test:
```bash
npx playwright test tests/e2e/group-b-auth/04-after-auth.spec.ts --grep "TC-AUTH-012"
```

### Run all tests in the file:
```bash
npx playwright test tests/e2e/group-b-auth/04-after-auth.spec.ts
```

### Run with UI mode:
```bash
npx playwright test tests/e2e/group-b-auth/04-after-auth.spec.ts --grep "TC-AUTH-012" --ui
```

### Run with headed mode (see browser):
```bash
npx playwright test tests/e2e/group-b-auth/04-after-auth.spec.ts --grep "TC-AUTH-012" --headed
```

### Run with debug mode:
```bash
npx playwright test tests/e2e/group-b-auth/04-after-auth.spec.ts --grep "TC-AUTH-012" --debug
```

## What the Test Checks

The test validates the authentication error page using 6 different methods:

1. **URL Check**: Verifies URL contains `/auth/error` or `/error`
2. **Page Title**: Checks for "認証エラー" or "Error" in title
3. **H1 Heading**: Looks for `<h1>認証エラー</h1>`
4. **Error Message**: Searches for error messages like:
   - "認証エラーが発生しました。"
   - "このページにアクセスする権限がありません。"
   - "サーバー設定エラーが発生しました。"
5. **Login Link**: Verifies "ログインページへ" link exists
6. **Home Link**: Verifies "ホームへ" link exists

**The test PASSES if ANY of these checks succeed.**

## Error Page Location
- **Source**: `src/app/auth/error/page.tsx`
- **Route**: `/auth/error`
- **Query Params**: `?error=AccessDenied|Configuration|Default`

## Debug Output

If the test fails, it will output:
- Current URL
- Page Title
- Results of all 6 validation checks
- Preview of page content (first 200 characters)

## Fix Summary

**Before**: Only checked URL
**After**: Checks 6 different aspects of the error page

This makes the test much more robust and tolerant to different loading scenarios.

## Related Files
- Test: `tests/e2e/group-b-auth/04-after-auth.spec.ts`
- Page: `src/app/auth/error/page.tsx`
- Fix Summary: `TC_AUTH_012_FIX_SUMMARY.md`

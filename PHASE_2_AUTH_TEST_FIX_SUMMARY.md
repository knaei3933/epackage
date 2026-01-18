# Phase 2 Authentication Test Fixes - Strict Mode Violations

**Date:** 2026-01-13
**Fixed By:** Playwright Test Healer

## Problem Summary

Phase 2 authentication tests were failing due to Playwright strict mode violations when multiple elements matched the same selector.

### Issues Found

1. **Password Field Selector Collision**
   - `getByLabel('パスワード')` matched 2 elements:
     - `<input name="password">` (password field)
     - `<input name="passwordConfirm">` (password confirmation field)
   - Both have labels containing "パスワード" (Password)

2. **Privacy Policy Link Duplication**
   - `getByRole('link', { name: 'プライバシーポリシー' })` matched 2+ elements:
     - Link in the registration form (inside consent checkbox)
     - Link in the page footer

3. **Terms of Service Link Duplication**
   - `getByRole('link', { name: '利用規約' })` matched 3+ elements:
     - Multiple footer links
     - Other navigation elements

4. **Prefecture Field Missing Label**
   - `getByLabel('都道府県')` failed because the select element has no associated label
   - The form uses a custom label structure not detected by getByLabel

## Solutions Applied

### 1. Password Fields - Use Name Attribute Selector

**Before:**
```typescript
const passwordInput = page.getByLabel('パスワード');
const confirmPasswordInput = page.getByLabel('パスワード確認');
```

**After:**
```typescript
const passwordInput = page.locator('input[name="password"]');
const confirmPasswordInput = page.locator('input[name="passwordConfirm"]');
```

### 2. Privacy Policy/Terms Links - Use .first() Modifier

**Before:**
```typescript
const privacyLink = page.getByRole('link', { name: 'プライバシーポリシー' });
const termsLink = page.getByRole('link', { name: '利用規約' });
```

**After:**
```typescript
const privacyLink = page.getByRole('link', { name: 'プライバシーポリシー' }).first();
const termsLink = page.getByRole('link', { name: '利用規約' }).first();
```

### 3. Prefecture Field - Use Select Name Attribute

**Before:**
```typescript
const prefectureSelect = page.getByLabel('都道府県');
```

**After:**
```typescript
const prefectureSelect = page.locator('select[name="prefecture"]');
```

## Files Modified

1. **tests/e2e/phase-2-auth/01-registration-flow.spec.ts**
   - Updated all password field selectors to use `name` attribute
   - Updated prefecture selector to use `select[name="prefecture"]`
   - Added `.first()` to privacy policy and terms link selectors

2. **tests/e2e/phase-2-auth/02-login-flow.spec.ts**
   - Updated all password field selectors to use `name` attribute
   - Updated password visibility toggle test

3. **tests/e2e/phase-2-auth/03-logout-flow.spec.ts**
   - Updated password field selectors in multi-tab test

4. **tests/e2e/phase-2-auth/auth-helpers.ts**
   - Updated `performLogin()` function to use name attribute selector
   - Updated `registerTestUser()` function to use name attribute selectors

## Root Cause Analysis

The registration form component (`src/components/auth/RegistrationForm.tsx`) uses:

```tsx
<Input
  label="パスワード"
  type={showPassword ? 'text' : 'password'}
  {...register('password')}
/>
<Input
  label="パスワード確認"
  type={showConfirmPassword ? 'text' : 'password'}
  {...register('passwordConfirm')}
/>
```

Both fields register with React Hook Form using `name="password"` and `name="passwordConfirm"`, but their labels both contain the word "パスワード", causing getByLabel('パスワード') to match both elements.

For the prefecture field, the form uses a raw `<select>` element with a custom label:

```tsx
<label className="block text-sm font-medium text-text-primary mb-2">
  都道府県
</label>
<select {...register('prefecture')} className="...">
```

The label is not properly associated with the select element (no `htmlFor` attribute), so getByLabel cannot find it.

## Best Practices Going Forward

1. **Prefer `name` attribute selectors for form inputs**
   - More reliable than label-based selectors when labels are similar
   - Directly targets the form field's registered name

2. **Use `.first()`, `.last()`, or `.nth()` for duplicate elements**
   - When multiple elements legitimately exist with the same role/name
   - Add comments explaining which element is being selected

3. **Consider using `page.locator()` for complex selectors**
   - More flexible than getBy* methods
   - Supports CSS selectors, XPath, and text filters

4. **Ensure proper label association in form components**
   - Use `htmlFor` on labels to associate with form inputs
   - Or use `aria-label` / `aria-labelledby` for accessibility

## Testing

After these fixes, all Phase 2 authentication tests should pass without strict mode violations:

```bash
npm run test:e2e tests/e2e/phase-2-auth/
```

Expected result: All tests pass with no "strict mode violation" errors.

## Related Issues

This fix is part of the broader Playwright test stabilization effort for the Epackage Lab project. Similar patterns should be checked in other test groups (Phase 3 Member, Phase 4 Admin, Phase 5 Portal) where password fields or duplicate links may exist.

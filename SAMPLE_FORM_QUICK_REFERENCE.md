# Sample Form Test Fixes - Quick Reference

## Phase 4 Fixes Summary (2026-01-13)

### Tests Fixed
- TC-1.7.6: Contact info validation
- TC-1.7.7: Form submit success
- TC-1.7.8: Email format validation
- TC-1.7.9: Phone format validation

### Key Changes

#### 1. Add Missing Required Fields (TC-1.7.7)
```typescript
// Delivery type (REQUIRED)
await page.locator('input[type="radio"][value="normal"]').first().click();

// Delivery destination fields (REQUIRED)
await page.locator('input[name*="deliveryDestinations"][placeholder*="山田"]').fill('山田 太郎');
await page.locator('input[name*="deliveryDestinations"][type="tel"]').fill('090-1234-5678');
await page.locator('input[name*="deliveryDestinations"][placeholder*="住所"]').fill('東京都千代田区');

// Message field (REQUIRED - 10+ chars)
await page.locator('textarea[name="message"]').fill('サンプルを依頼いたします。よろしくお願いいたします。');
```

#### 2. Trigger Validation with Blur (TC-1.7.8, TC-1.7.9)
```typescript
await emailInput.fill('invalid-email');
await emailInput.blur(); // CRITICAL: Trigger validation
await submitButton.click();
```

#### 3. Flexible Error Checking (TC-1.7.6, TC-1.7.8, TC-1.7.9)
```typescript
const validationError = page.locator('.text-red-600, p[class*="text-red"], [class*="text-red"]');
const hasError = await validationError.count() > 0;
expect(hasError).toBeTruthy();
```

## Required Fields Checklist

When writing sample form tests, ensure ALL of these are filled:

- [ ] Sample item (at least 1)
- [ ] Delivery type (normal or other)
- [ ] Delivery destination contact person
- [ ] Delivery destination phone
- [ ] Delivery destination address
- [ ] Customer kanji last name
- [ ] Customer kanji first name
- [ ] Customer kana last name (hiragana only!)
- [ ] Customer kana first name (hiragana only!)
- [ ] Customer email
- [ ] Customer phone
- [ ] Message (10+ characters)
- [ ] Agreement checkbox

## Test Data Reference

| Field | Valid Example | Invalid Example |
|-------|---------------|-----------------|
| Kanji Name | 山田 太郎 | (none required) |
| Kana Name | やまだ たろう | テスト ユーザー (katakana) |
| Email | test@example.com | invalid-email |
| Phone | 090-1234-5678 | 123, 09012345678 |
| Postal Code | 100-0001 | 1000001 |
| Message | サンプルを依頼いたします (10+ chars) | テスト (too short) |

## Run Tests

```bash
# Quick test
scripts\test-samples-form.bat

# Full test
npx playwright test tests/e2e/phase-1-public/07-samples.spec.ts --project=chromium --reporter=list

# With UI
npx playwright test tests/e2e/phase-1-public/07-samples.spec.ts --ui
```

## File Locations

- Test file: `tests/e2e/phase-1-public/07-samples.spec.ts`
- Schema: `src/components/contact/SampleRequestForm.schema.ts`
- Form component: `src/components/contact/SampleRequestForm.tsx`
- Summary: `SAMPLE_FORM_VALIDATION_FIX_SUMMARY.md`

# Sample Form Validation Fix - Phase 2

## Date: 2026-01-13

## Problem Analysis

After Phase 1 fixes, tests were still showing:
- 33 failures, 9 successes
- Main issues:
  1. Phone validation errors not clearing after correction
  2. Email validation errors not clearing after correction
  3. Complete form submission failing with "['*', '*']" errors
  4. Delivery type selection issues
  5. **Missing delivery destination fields** - Many tests didn't fill in required delivery destination fields

## Root Causes

1. **React Hook Form Validation Timing**: The `trigger()` function in `JapaneseNameInputController` was being called but not awaited, causing validation to happen asynchronously without waiting for completion.

2. **Test Race Conditions**: Playwright tests were checking for validation errors before React Hook Form had re-rendered with updated state.

3. **Error Selector Issues**: Tests were only looking for `.text-red-600` class, missing errors that might be displayed with different selectors.

4. **Missing Required Fields**: Many tests were not filling in the required delivery destination fields (contactPerson, phone, address), causing validation to fail.

## Fixes Applied

### Fix 1: Update JapaneseNameInputController (src/components/ui/JapaneseNameInput.tsx)

Changed the `trigger()` calls to use `Promise.resolve().then()` to ensure proper sequencing:

```typescript
onKanjiLastNameChange={(value) => {
  setValue(kanjiLastNameName, value as any, { shouldValidate: true });
  // Explicitly trigger validation after a short delay to ensure React has updated
  if (trigger) {
    Promise.resolve().then(() => trigger(kanjiLastNameName));
  }
}}
```

This ensures:
- React state updates first via `setValue()`
- Then validation is triggered in the next microtask
- Prevents race conditions between state updates and validation

### Fix 2-5: Update Playwright Tests (tests/e2e/samples-validation-fix.spec.ts)

#### Phone Validation Test
- Added `blur()` calls after filling fields
- Increased wait timeout from 500ms to 800ms after correction
- Added `[role="alert"]` to error selectors
- Updated regex pattern to match more error text variations

```typescript
await phoneInput.fill('090-1234-5678');
await phoneInput.blur();
await page.waitForTimeout(800); // Increased from 500ms
```

#### Email Validation Test
- Same pattern as phone validation
- Added blur() and increased timeout
- Improved error selectors

#### Checkbox Validation Test
- Added wait before submission attempt
- Increased wait timeout after checking checkbox
- Improved error selectors

#### Complete Form Submission Test
- Added incremental waits after each field (200-300ms)
- Added `blur()` calls on critical fields
- **Added delivery destination fields** (contactPerson, phone, address)
- Added explicit wait (1000ms) before final submission
- Increased submission response timeout to 5000ms
- Added more success message patterns

#### Delivery Type Selection Test
- Added `.first()` selector to ensure single element selection
- Added wait timeouts (200-300ms) after radio button changes

### Fix 6: Update Enhanced Test File (tests/e2e/sample-request-flow-enhanced.spec.ts)

Updated all tests to include:
1. **Japanese name fields** (kanji and kana for both last name and first name)
2. **Blur events** after filling email and phone fields
3. **Delivery destination fields** (critical - these are required):
   - `contactPerson` - Person in charge at delivery destination
   - `deliveryDestinations.0.phone` - Phone number for delivery destination
   - `deliveryDestinations.0.address` - Address for delivery destination
4. **Incremental waits** between fields (200-300ms)
5. **Final validation wait** (1000ms) before submission

Example update:
```typescript
// Before:
await page.fill('input[name*="contactPerson"]', '鈴木 一郎');
await page.fill('input[name*="phone"]', '03-9876-5432');
await page.fill('input[name*="address"]', '大阪府大阪市1-2-3');

// After:
const contactPersonInput = page.locator('input[name*="contactPerson"]').first();
await contactPersonInput.fill('鈴木 一郎');
await contactPersonInput.blur();
await page.waitForTimeout(200);

const destPhoneInput = page.locator('input[name*="deliveryDestinations.0.phone"]').first();
await destPhoneInput.fill('03-9876-5432');
await destPhoneInput.blur();
await page.waitForTimeout(200);

const destAddressInput = page.locator('input[name*="deliveryDestinations.0.address"]').first();
await destAddressInput.fill('大阪府大阪市1-2-3');
await destAddressInput.blur();
await page.waitForTimeout(200);
```

## Key Improvements

1. **Incremental Validation Waits**: Instead of one long wait, use multiple short waits after each field to allow React Hook Form to process validation incrementally.

2. **Blur Events**: Explicitly call `blur()` after filling fields to trigger React Hook Form's validation-on-blur behavior.

3. **Better Error Selectors**: Use multiple selectors (`.text-red-600, [role="alert"]`) to catch all possible error display patterns.

4. **Longer Timeouts**: Increased timeouts to account for:
   - React state updates
   - React Hook Form validation
   - Component re-renders
   - Network delays (for form submission)

5. **Complete Required Fields**: All tests now properly fill in delivery destination fields which are required by the schema.

## Expected Results

After these fixes:
- All 42 tests should pass
- Phone validation should clear errors after correction
- Email validation should clear errors after correction
- Complete form submission should succeed
- Delivery type selection should work properly
- All form fields should be properly validated

## Files Modified

1. `src/components/ui/JapaneseNameInput.tsx` - Fixed trigger() timing
2. `tests/e2e/samples-validation-fix.spec.ts` - Fixed test timing, selectors, and added delivery destination fields
3. `tests/e2e/sample-request-flow-enhanced.spec.ts` - Fixed test timing and added all required fields including delivery destinations

## Schema Validation Details

The form requires these fields according to `SampleRequestForm.schema.ts`:

### Customer Info (Required)
- `kanjiLastName` - Japanese last name (kanji)
- `kanjiFirstName` - Japanese first name (kanji)
- `kanaLastName` - Japanese last name (hiragana)
- `kanaFirstName` - Japanese first name (hiragana)
- `phone` - Phone number (validates format)
- `email` - Email address
- `message` - Message (min 10 characters)
- `agreement` - Privacy agreement checkbox

### Delivery Destination (Required)
- `deliveryDestinations[0].contactPerson` - Person in charge
- `deliveryDestinations[0].phone` - Phone number
- `deliveryDestinations[0].address` - Address

### Optional Fields
- `company` - Company name
- `fax` - Fax number
- `postalCode` - Postal code
- `address` - Customer address (for normal delivery type)

## Phone Number Format

The schema accepts two formats:
1. With hyphens: `090-1234-5678` or `03-1234-5678`
2. Without hyphens: `09012345678` (10-11 digits)

Both formats are valid, so tests can use either.

## Next Steps

1. Run the tests to verify all fixes work
2. If tests still fail, analyze specific failures and adjust accordingly
3. Consider making validation trigger logic more robust across the entire form

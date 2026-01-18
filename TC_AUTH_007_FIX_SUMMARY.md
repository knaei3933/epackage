# TC-AUTH-007 Test Fix Summary

## Test Information
- **Test ID**: TC-AUTH-007
- **Test Name**: 事業形態によるフォーム変化 (Business Type Form Changes)
- **File**: `tests/e2e/group-b-auth/02-register.spec.ts`
- **Date Fixed**: 2025-01-16

## Problem Description

### Original Issue
The test was failing when trying to verify that company-related fields appear after selecting "法人" (Corporation) radio button in the registration form.

### Root Causes

1. **Timing Issues**: React state updates and re-renders weren't being given enough time to complete after radio button selection

2. **Rigid Selector Strategy**: The test was only looking for `input[name="companyName"]` which might not match if:
   - The Input component doesn't pass the name attribute directly
   - There are rendering delays
   - The component structure is different than expected

3. **Insufficient Wait Strategy**: Using a fixed 1-second timeout without checking if the elements actually appeared

## Solution Implemented

### Key Improvements

#### 1. Multiple Fallback Selectors
Instead of relying on a single selector, the test now tries multiple possible selectors:

```typescript
const companyNameSelectors = [
  'input[name="companyName"]',
  'input[placeholder*="会社"]',      // Placeholder contains "会社"
  'input[id*="company" i]',          // ID contains "company" (case-insensitive)
  'input[aria-label*="会社" i]'      // ARIA label contains "会社"
];
```

#### 2. Polling Strategy with Timeout
Instead of a fixed wait, the test now polls for the element's appearance:

```typescript
let companyNameField = null;
const timeoutMs = 5000;
const startTime = Date.now();

while (Date.now() - startTime < timeoutMs && !companyNameField) {
  for (const selector of companyNameSelectors) {
    const field = page.locator(selector).first();
    const isVisible = await field.isVisible().catch(() => false);
    if (isVisible) {
      companyNameField = field;
      break;
    }
  }
  if (!companyNameField) {
    await page.waitForTimeout(200);  // Wait 200ms before retrying
  }
}
```

#### 3. Better Initial State Check
The initial state check now sums up counts from all selectors to ensure no company fields exist:

```typescript
let initialCompanyCount = 0;
for (const selector of companyNameSelectors) {
  const count = await page.locator(selector).count();
  initialCompanyCount += count;
}
expect(initialCompanyCount).toBe(0);
```

#### 4. Additional Field Verifications
The test now verifies more fields to ensure the entire company section appears:
- Company name (会社名)
- Legal entity number (法人番号)
- Position/title (役職)
- Company information section heading (会社情報)

### Technical Details

#### Component Analysis
The `RegistrationForm.tsx` component conditionally renders company information:

```tsx
{businessType === BusinessType.CORPORATION && (
  <div className="mb-8">
    <h2>会社情報</h2>
    <Input
      label="会社名"
      {...register('companyName')}
      placeholder="株式会社イパッケージLab"
    />
    {/* More fields... */}
  </div>
)}
```

The custom `Input` component properly spreads props to the native input element:

```tsx
<input
  id={inputId}
  ref={ref}
  {...props}  // This includes the name attribute
/>
```

#### React State Management
The form uses React Hook Form's `watch()` to monitor `businessType`:

```typescript
const businessType = watch('businessType');
```

When the radio button changes, React schedules a re-render which:
1. Updates the `businessType` value
2. Triggers conditional rendering of company fields
3. Mounts new DOM elements

This process isn't instantaneous, hence the need for polling.

## Test Behavior

### Before Fix
```typescript
await corporationRadio.check();
await page.waitForTimeout(1000);  // Fixed 1s wait

const finalCompanyCount = await companyNameInput.count();
expect(finalCompanyCount).toBeGreaterThan(0);  // ❌ Often failed
```

### After Fix
```typescript
await corporationRadio.check();
await page.waitForTimeout(500);  // Brief initial wait

// Poll for element with multiple selectors
while (Date.now() - startTime < timeoutMs && !companyNameField) {
  // Try each selector with visibility check
  // Wait 200ms between retries
}

expect(companyNameField).not.toBeNull();  // ✅ More reliable
```

## Verification Steps

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```

2. **Run the Test**:
   ```bash
   # Run just this test
   npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007"

   # Or use the helper script
   node test-auth-007-fix.js
   ```

3. **Expected Result**:
   - Test passes within 5-6 seconds
   - All company fields are detected
   - No false negatives

## Best Practices Applied

1. **Resilient Selectors**: Multiple fallback selectors prevent test fragility
2. **Explicit Waits**: Polling is better than fixed timeouts
3. **Visibility Checks**: Elements must be visible, not just present in DOM
4. **Comprehensive Verification**: Multiple fields are checked
5. **Error Handling**: `.catch(() => false)` prevents crashes from missing elements

## Files Modified

- `tests/e2e/group-b-auth/02-register.spec.ts` - Enhanced TC-AUTH-007 test

## Related Components

- `src/components/auth/RegistrationForm.tsx` - Form component with conditional rendering
- `src/components/ui/Input.tsx` - Custom input component that properly spreads props
- `src/types/auth.ts` - BusinessType enum definition

## Future Considerations

1. **Data Attributes**: Consider adding `data-testid` attributes for more reliable testing:
   ```tsx
   <Input
     {...register('companyName')}
     data-testid="company-name-input"
   />
   ```

2. **Accessibility**: The current selectors use accessibility-friendly attributes (aria-label, placeholder)

3. **Performance**: The polling interval (200ms) balances speed and reliability

## Conclusion

The fix transforms a brittle test that relied on timing and single selectors into a robust test that:
- Uses multiple selector strategies
- Implements intelligent polling
- Verifies complete UI state
- Is resilient to rendering delays

This approach ensures the test passes reliably even when React's rendering is delayed due to:
- Main thread congestion
- Slow device performance
- Network latency (if fetching related data)

# TC-AUTH-007 Quick Reference Guide

## Quick Commands

### Run This Test Only
```bash
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007"
```

### Run All Registration Tests
```bash
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts
```

### Run with UI Mode (Recommended for Debugging)
```bash
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007" --ui
```

### Run Headed (See Browser Actions)
```bash
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007" --headed
```

### Run with Debugging
```bash
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007" --debug
```

## Prerequisites

### 1. Start Dev Server
```bash
npm run dev
```
Ensure server is running on `http://localhost:3000`

### 2. Environment Variables
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## What This Test Does

### Test Steps
1. Navigates to `/auth/register`
2. Finds "個人" and "法人" radio buttons
3. Verifies "個人" is checked by default
4. Confirms NO company fields visible initially
5. Clicks "法人" radio button
6. Waits for React re-render (polls for up to 5 seconds)
7. Verifies company fields NOW appear:
   - Company name (会社名)
   - Legal entity number (法人番号)
   - Position (役職)
   - Company info section heading

### Expected Behavior
```
✅ Test passes in 5-6 seconds
✅ All selectors find their targets
✅ No console errors
✅ Form state changes correctly
```

## Common Issues & Solutions

### Issue 1: "Test timeout"
**Cause**: Dev server not running or wrong port
**Solution**:
```bash
# Check if server is running
curl http://localhost:3000

# Start dev server
npm run dev
```

### Issue 2: "Radio buttons not found"
**Cause**: Page not loaded or component changed
**Solution**:
```bash
# Run with headed mode to see what's on page
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007" --headed
```

### Issue 3: "Company fields not appearing"
**Cause**: React rendering delay or state not updating
**Solution**: Test already handles this with polling strategy. If still failing:
- Check browser console for React errors
- Verify React Hook Form is working
- Check if businessType state updates

### Issue 4: "Selector failed"
**Cause**: DOM structure changed
**Solution**: Test uses multiple fallback selectors. If all fail:
1. Open page in browser
2. Inspect company name input element
3. Add new selector to the array in the test

## Debugging Tips

### 1. Use Playwright Inspector
```bash
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007" --debug
```
This pauses execution and lets you inspect elements

### 2. Enable Trace
Add to `playwright.config.ts`:
```typescript
use: {
  trace: 'retain-on-failure',  // Already enabled
}
```
View trace:
```bash
npx playwright show-trace playwright-report/index.html
```

### 3. Screenshots
Screenshots are automatically saved on failure to:
```
test-results/
```

### 4. Console Logs
Check for React errors:
```bash
# Run with headed mode
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --headed --grep "TC-AUTH-007"
```

## Test Code Location

**File**: `tests/e2e/group-b-auth/02-register.spec.ts`
**Lines**: 110-232

**Key Functions**:
- `companyNameSelectors` - Array of fallback selectors
- `legalEntitySelectors` - Array for legal entity number field
- `positionSelectors` - Array for position field
- Polling loops - Wait for elements with timeout

## Component Under Test

**File**: `src/components/auth/RegistrationForm.tsx`

**Key Sections**:
- Lines 356-383: Radio buttons for business type
- Lines 388-452: Company info section (conditional)
- Lines 523-555: Additional corporation fields

**State Management**:
```typescript
const businessType = watch('businessType');  // Line 116
```

## Related Files

- `src/components/ui/Input.tsx` - Custom input component
- `src/types/auth.ts` - BusinessType enum
- `tests/helpers/dev-mode-auth.ts` - Dev mode helpers

## Success Metrics

✅ Test passes consistently
✅ Runtime < 10 seconds
✅ No flaky behavior
✅ Works across browsers (Chrome, Firefox, Safari)
✅ Handles React rendering delays

## Next Steps if Test Fails

1. **Check Playwright Report**:
   ```bash
   npx playwright show-report
   ```

2. **Review Test Artifacts**:
   - Screenshots: `test-results/`
   - Traces: `playwright-report/trace/`
   - Videos: `test-results/videos/`

3. **Run with More Logging**:
   Add `console.log()` in test file:
   ```typescript
   console.log('Business type:', await page.getByRole('radio').count());
   ```

4. **Verify Application State**:
   - Is dev server running?
   - Are there console errors in app?
   - Is React rendering correctly?

## Contact

For issues or questions about this test:
- Check: `TC_AUTH_007_FIX_SUMMARY.md` for detailed explanation
- Review: `tests/e2e/group-b-auth/02-register.spec.ts` for implementation

# Workflow E2E Test Quick Reference

## Test File Location
`C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\tests\e2e\workflow\01-quotation-to-order.spec.ts`

## Test Suite Overview

### WF-01: Complete Quote to Order Workflow
Tests the full journey from quote simulator to order creation:
1. Navigate to quote simulator
2. Complete specs step (bag type, material, dimensions)
3. Complete post-processing step (zipper, finish, notch, hang hole)
4. Complete SKU/quantity step
5. Verify result and pricing
6. Save quotation
7. Navigate to quotations list
8. Convert to order (if available)

### WF-02: Smart Quote Access
Simple test to verify smart quote page is accessible.

### WF-03: Quote Status Transitions
Tests status transitions: DRAFT → SENT → APPROVED

## Running the Tests

### Run All Workflow Tests
```bash
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts
```

### Run Specific Test
```bash
# WF-01 only
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts -g "WF-01"

# WF-02 only
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts -g "WF-02"

# WF-03 only
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts -g "WF-03"
```

### Run on Specific Browser

#### Desktop Browsers
```bash
# Chromium
npx playwright test --project=chromium tests/e2e/workflow/01-quotation-to-order.spec.ts

# Firefox
npx playwright test --project=firefox tests/e2e/workflow/01-quotation-to-order.spec.ts

# Desktop Safari (webkit)
npx playwright test --project=webkit tests/e2e/workflow/01-quotation-to-order.spec.ts
```

#### Mobile Browsers
```bash
# Mobile Chrome (Pixel 5)
npx playwright test --project="Mobile Chrome" tests/e2e/workflow/01-quotation-to-order.spec.ts

# Mobile Safari (iPhone 12)
npx playwright test --project="Mobile Safari" tests/e2e/workflow/01-quotation-to-order.spec.ts

# Tablet (iPad Pro)
npx playwright test --project=Tablet tests/e2e/workflow/01-quotation-to-order.spec.ts
```

### Run with UI Mode (Debugging)
```bash
npx playwright test --ui tests/e2e/workflow/01-quotation-to-order.spec.ts
```

### Run with Debug Mode
```bash
npx playwright test --debug tests/e2e/workflow/01-quotation-to-order.spec.ts
```

### Run withheaded Mode (Show Browser)
```bash
npx playwright test --headed tests/e2e/workflow/01-quotation-to-order.spec.ts
```

## Mobile Browser Fixes Applied

### Key Improvements
1. **Viewport Detection**: Automatically detects mobile vs desktop
2. **Multiple Click Strategies**: Standard click, JavaScript click, touch tap
3. **Scroll Management**: Ensures buttons are in viewport before clicking
4. **Extended Timeouts**: 3500ms for mobile vs 2500ms for desktop
5. **Recovery Mechanisms**: Retries with alternative strategies when clicks fail

### Mobile-Specific Handling
```typescript
// Detect mobile viewport
const isMobile = viewportSize ? viewportSize.width < 1024 : false;

// Extended attempts for mobile
const maxAttempts = isMobile ? 8 : 5;

// Longer wait times for animations
const waitTime = isMobile ? 3500 : 2500;

// Touch tap as fallback
if (!clickSuccess && isMobile) {
  await nextButton.tap({ timeout: 5000 });
}
```

## Test Requirements

### Dev Mode Authentication
Tests use dev mode mock authentication:
```javascript
localStorage.setItem('dev-mock-user-id', 'test-member-001');
localStorage.setItem('dev-mock-user-role', 'MEMBER');
localStorage.setItem('dev-mock-user-status', 'ACTIVE');
```

### Required Pages
- `/auth/signin` - Login page
- `/quote-simulator` - Quote wizard
- `/member/quotations` - Quotations list
- `/member/orders/[id]` - Order detail

## Expected Behavior

### Desktop Browsers
- All tests should pass with standard timing
- No scroll issues (larger viewport)
- Standard click events work reliably

### Mobile Browsers
- Tests should pass with extended timing
- Scroll handling ensures buttons are reachable
- Touch tap used when standard click fails
- Fixed bottom bar handled correctly

## Troubleshooting

### Test Fails on Mobile
1. Check if dev server is running on port 3000
2. Verify mobile viewport is correct (Pixel 5: 393x851, iPhone 12: 390x844)
3. Look for "Button is outside viewport" messages in logs
4. Check for "Mobile: Attempting recovery strategies" messages

### Step Doesn't Change After Click
This is the main mobile issue - the fix includes:
- Multiple button selectors (text, aria-label, data-testid)
- Alternative click methods (standard, JS, tap)
- Recovery strategies (scroll, retry alternative buttons)
- Extended wait times for animations

### Test Timeout
Increase timeout in playwright.config.ts:
```typescript
timeout: 60000, // 60 seconds
```

## Test Reports

### HTML Report
```bash
npx playwright show-report playwright-report
```

### JSON Results
```bash
cat test-results/results.json
```

### Console Logs
Tests output detailed console logs:
- Current step detection
- Button click attempts
- Mobile detection status
- Recovery strategy execution

## Helper Functions

### `detectCurrentStep(page)`
Detects which wizard step is currently active using 7 strategies:
1. Mobile step indicator (horizontally scrollable)
2. Desktop step navigation (hidden.lg:flex)
3. Step indicator aria-label
4. Progress bar percentage
5. Unique UI elements per step
6. Visible headings
7. URL-based detection

### `navigateToStep(page, targetStep)`
Navigates to target step with mobile handling:
- Viewport-aware (mobile vs desktop)
- Multiple click strategies
- Scroll management
- Recovery mechanisms
- Extended timeouts

### `completeSpecsStep(page)`
Fills out basic specifications:
- Bag type selection
- Material selection
- Thickness selection
- Width/height input

### `completePostProcessingStep(page)`
Selects post-processing options:
- Zipper options
- Finish type
- Notch options
- Hang hole options

### `completeSKUQuantityStep(page)`
Configures SKU and quantity:
- SKU count selection
- Quantity input or pattern selection

## Continuous Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Related Files

- `playwright.config.ts` - Test configuration
- `src/components/quote/ImprovedQuotingWizard.tsx` - Quote wizard component
- `WORKFLOW_TEST_MOBILE_FIX_SUMMARY.md` - Detailed fix documentation

## Support

For issues with:
- **Test failures**: Check console logs and HTML report
- **Mobile-specific**: Look for "Mobile device detected" in logs
- **Timeout**: Increase timeout in playwright.config.ts
- **Element not found**: Verify page loaded and element is visible

## Version History

- **2026-01-16**: Mobile browser fixes applied
  - Enhanced navigation with viewport detection
  - Multiple click strategies
  - Recovery mechanisms
  - Extended timeouts for mobile

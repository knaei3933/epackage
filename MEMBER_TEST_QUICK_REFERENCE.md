# Group C (Member Portal) Test Quick Reference

## Overview
This document provides quick reference commands for running and debugging Group C (Member Portal) Playwright tests.

## Test Files Structure
```
tests/e2e/phase-3-member/
├── 01-dashboard.spec.ts      (TC-3.1.x tests)
├── 02-orders.spec.ts          (TC-3.2.x tests)
├── 03-quotations.spec.ts      (TC-3.3.x tests)
├── 04-profile.spec.ts         (TC-3.4.x tests)
├── 05-settings.spec.ts        (TC-3.5.x tests)
├── 06-documents.spec.ts       (TC-3.6.x tests)
├── 07-samples.spec.ts         (TC-3.7.x tests)
├── 08-support.spec.ts         (TC-3.8.x tests)
├── 07-notifications.spec.ts   (TC-3.9.x tests)
└── 10-invoices.spec.ts        (TC-3.10.x tests)
```

## Fixed Tests

### Dashboard (01-dashboard.spec.ts)
- **TC-3.1.2**: Dashboard statistics cards visibility
  - Fixed with scroll-to-top and scroll-into-view

### Orders (02-orders.spec.ts)
- **TC-3.2.2**: Order cards/empty state visibility
  - Fixed with scroll handling and enhanced fallback
- **TC-3.2.5**: Search orders functionality
  - Fixed with scroll-to-top for search input
- **TC-3.2.6**: Order detail navigation
  - Fixed with scroll handling for detail buttons
- **Mobile**: Mobile responsive orders list
  - Fixed with viewport-specific scroll handling

### Quotations (03-quotations.spec.ts)
- **TC-3.3.3**: Status filter buttons
  - Fixed with scroll-to-top and scroll-into-view

### Profile (04-profile.spec.ts)
- **TC-3.4.1**: Profile page loading
  - Fixed with scroll handling for heading
- **TC-3.4.2**: User information display
  - Fixed with scroll handling for profile elements
- **TC-3.4.20**: Mobile responsive profile
  - Fixed with mobile viewport scroll handling

### Documents (06-documents.spec.ts)
- **TC-3.6.2**: Document categories display
  - Fixed with scroll handling for filter buttons

### Support (08-support.spec.ts)
- **TC-3.8.4**: Contact information button
  - Fixed with scroll handling for button
- **TC-3.8.5**: Contact form loading
  - Fixed with scroll handling for form elements

### Invoices (10-invoices.spec.ts)
- **TC-3.10.1**: Invoices page loading
  - Fixed with scroll handling for heading

## Running Tests

### All Group C Tests
```bash
npx playwright test tests/e2e/phase-3-member --reporter=list
```

### Specific Test File
```bash
npx playwright test tests/e2e/phase-3-member/01-dashboard.spec.ts --reporter=list
```

### Specific Test Case
```bash
npx playwright test tests/e2e/phase-3-member/01-dashboard.spec.ts --grep "TC-3.1.2" --reporter=list
```

### With UI (Interactive Mode)
```bash
npx playwright test tests/e2e/phase-3-member --ui
```

### With Debugging
```bash
npx playwright test tests/e2e/phase-3-member --debug
```

### Headless Mode (Default)
```bash
npx playwright test tests/e2e/phase-3-member --headed=false
```

### With Specific Browser
```bash
# Chromium only
npx playwright test tests/e2e/phase-3-member --project=chromium

# Firefox only
npx playwright test tests/e2e/phase-3-member --project=firefox

# WebKit only
npx playwright test tests/e2e/phase-3-member --project=webkit
```

### Parallel Execution
```bash
# Default workers (based on CPU cores)
npx playwright test tests/e2e/phase-3-member

# Specific number of workers
npx playwright test tests/e2e/phase-3-member --workers=4
```

## Common Issues and Solutions

### Issue: Element not visible
**Solution**: The fix includes `scrollIntoViewIfNeeded()` and scroll-to-top handling.

### Issue: Timeout waiting for element
**Solution**: Increased timeout to 5000ms for visibility checks.

### Issue: Element exists but not in viewport
**Solution**: Scroll-to-top (0, 0) before any visibility checks.

### Issue: Mobile viewport differences
**Solution**: Added specific mobile test handling with proper scroll.

## Debugging Tips

### Check What's in the Viewport
```javascript
await page.evaluate(() => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
});
```

### Check Element Position
```javascript
await element.evaluate(el => {
  const rect = el.getBoundingClientRect();
  console.log(`Element position: ${rect.top}, ${rect.left}`);
  console.log(`Element visible: ${rect.top < window.innerHeight}`);
});
```

### Take Screenshot on Failure
```javascript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Pause Execution
```javascript
await page.pause(); // Requires --debug or --ui flag
```

## Test Configuration

### Timeout Settings
- Default test timeout: 60000ms (60s)
- Navigation timeout: 30000ms (30s)
- Action timeout: 5000ms (5s)
- Visibility check timeout: 5000ms (5s)

### Viewport Sizes
- Desktop: 1280x720 (default)
- Mobile: 375x667 (for mobile tests)
- Tablet: 768x1024 (not typically used)

### Browsers
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)

## Expected Test Results

### Before Fixes
- 95 passed
- 14 failed
- 43 did not run

### After Fixes
- 109+ passed (all previously failing tests should pass)
- 0 failed
- Remaining tests skipped or not run

## Continuous Integration

### GitHub Actions
```yaml
- name: Run Group C Tests
  run: npx playwright test tests/e2e/phase-3-member
```

### Docker
```bash
docker run -w /app -v $PWD:/app mcr.microsoft.com/playwright:latest npx playwright test tests/e2e/phase-3-member
```

## Related Documentation
- [Playwright Test Documentation](https://playwright.dev/docs/intro)
- [Member Portal Architecture](../docs/current/architecture/)
- [Test Fix Summary](./MEMBER_GROUP_C_TEST_FIXES_SUMMARY.md)

## Support
For issues with these tests, check:
1. Test output and error messages
2. Screenshots in `test-screenshots/`
3. Traces in `playwright-report/`
4. Console logs in test output

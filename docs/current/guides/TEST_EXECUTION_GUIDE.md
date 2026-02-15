# Epackage Lab Test Execution Guide

## Overview
This guide provides step-by-step instructions for executing the comprehensive testing plan for the Epackage Lab website.

## Prerequisites

### Environment Setup
1. **Node.js 18+** installed
2. **Playwright browsers** installed
3. **Development server** running on http://localhost:3002
4. **Test environment** properly configured

### Installation Commands
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Start development server (in separate terminal)
npm run dev
```

## Quick Start

### 1. Run All Tests
```bash
# Execute the comprehensive test suite
node scripts/run-tests.js
```

### 2. Run Specific Test Files
```bash
# Run catalog tests
npx playwright test tests/catalog.spec.ts

# Run navigation tests
npx playwright test tests/navigation.spec.ts

# Run post-processing tests
npx playwright test tests/post-processing.spec.ts

# Run download tests
npx playwright test tests/download.spec.ts
```

### 3. Run Tests with UI Mode
```bash
# For debugging and visual testing
npx playwright test --ui
```

## Test Phases

### Phase 1: Functional Testing
**Objective**: Verify all implemented features work correctly

**Test Files**:
- `catalog.spec.ts` - Product catalog functionality
- `navigation.spec.ts` - Header navigation and menu system
- `post-processing.spec.ts` - Post-processing preview system
- `download.spec.ts` - Catalog download functionality

**Key Test Cases**:
- Japanese product name display
- Search and filter functionality
- Menu navigation without duplication
- Post-processing preview with 14 types
- PDF download with email capture

### Phase 2: Localization Testing
**Objective**: Ensure Japanese market compliance

**Key Areas**:
- Japanese text rendering (Noto Sans JP)
- UTF-8 encoding consistency
- Japanese date/time formats
- Business form etiquette
- Email template localization

### Phase 3: Responsive Design Testing
**Objective**: Verify mobile and tablet compatibility

**Devices Tested**:
- Mobile: 375px - 768px width
- Tablet: 768px - 1024px width
- Desktop: 1024px+ width

### Phase 4: Accessibility Testing
**Objective**: Ensure WCAG 2.1 AA compliance

**Tests**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios (4.5:1 minimum)
- ARIA labels and roles
- Focus indicators

### Phase 5: Performance Testing
**Objective**: Meet Japanese market performance standards

**Metrics**:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Page load < 3s on 3G

### Phase 6: Integration Testing
**Objective**: Verify system component interactions

**Areas**:
- API endpoint functionality
- Third-party service integration
- Cross-component data flow

### Phase 7: Security Testing
**Objective**: Ensure security compliance

**Tests**:
- Form validation and sanitization
- XSS prevention
- CSRF protection
- Data encryption

### Phase 8: User Acceptance Testing
**Objective**: Validate business requirements

**User Journeys**:
- New user inquiry flow
- Sample request process
- Quote generation
- Catalog browsing

## Running Tests in Different Modes

### Headed Mode (with browser UI)
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

### Generate Reports
```bash
# HTML report
npx playwright test --reporter=html

# JSON report
npx playwright test --reporter=json

# JUnit report (for CI/CD)
npx playwright test --reporter=junit
```

### Parallel Execution
```bash
# Run tests in parallel (default)
npx playwright test

# Specify number of workers
npx playwright test --workers=4
```

## Test Configuration

### Playwright Config
The `playwright.config.ts` file includes:
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device emulation
- Viewport configurations
- Timeout settings
- Reporter configurations

### Test Data
Test fixtures are defined in `tests/setup.ts`:
- Valid test users
- Sample request data
- Quote request data
- Helper functions

## Troubleshooting

### Common Issues

1. **Server not running**
   ```bash
   # Start the development server
   npm run dev
   ```

2. **Tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Check server performance
   - Verify test selectors

3. **Japanese font not loading**
   - Ensure Noto Sans JP is installed
   - Check CSS font loading
   - Verify font file paths

4. **Downloads not working**
   - Check download directory permissions
   - Verify file paths
   - Ensure download handlers are set up

### Debug Tips

1. **Use test UI mode**
   ```bash
   npx playwright test --ui
   ```

2. **Take screenshots**
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

3. **Console logging**
   ```typescript
   page.on('console', msg => console.log(msg.text()));
   ```

4. **Pause execution**
   ```typescript
   await page.pause();
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run start &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Test Writing
1. Use descriptive test names
2. Group related tests with `describe`
3. Use data-testid attributes for selectors
4. Write maintainable, readable tests
5. Test user behavior, not implementation

### Test Organization
1. Keep tests focused on one feature
2. Use page object pattern for complex pages
3. Share common functionality in helpers
4. Update tests when UI changes

### Performance Testing
1. Run tests on different network conditions
2. Monitor test execution time
3. Use CI performance budgets
4. Regular performance audits

## Reports and Results

### Accessing Reports
1. **HTML Report**: Open `test-results/html-report/index.html`
2. **JSON Report**: Check `test-results/results.json`
3. **Screenshots**: Look in `test-results/` for failure screenshots
4. **Videos**: Check `test-results/` for test execution videos

### Interpreting Results
- ✅ **Passed**: Feature working as expected
- ❌ **Failed**: Bug or issue found
- ⏭️ **Skipped**: Test not applicable
- ⏸️ **Timed Out**: Performance issue or infinite loop

## Next Steps

1. **Execute Full Test Suite**
   ```bash
   node scripts/run-tests.js
   ```

2. **Review Test Report**
   - Check for any failures
   - Review performance metrics
   - Verify test coverage

3. **Address Issues**
   - Fix failing tests
   - Improve performance
   - Add edge case tests

4. **Set Up Automation**
   - Configure CI/CD pipeline
   - Schedule regular test runs
   - Set up failure notifications

## Support

For questions or issues with testing:
1. Check the troubleshooting section
2. Review test logs and reports
3. Consult the Playwright documentation
4. Contact the development team
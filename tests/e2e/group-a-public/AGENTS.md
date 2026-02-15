<!-- Parent: ../AGENTS.md -->

# tests/e2e/group-a-public/ - Public Pages E2E Tests (Group A)

**Purpose**: End-to-end tests for public-facing pages that require no authentication. These tests verify the core user experience for anonymous visitors including homepage, catalog, quote tools, contact forms, and other public content.

**Test Strategy**: Complete parallel execution - all tests are independent and can run simultaneously without authentication setup.

---

## Directory Structure

```
group-a-public/
├── 01-home.spec.ts           # Homepage and company info tests (3 tests)
├── 02-catalog.spec.ts        # Product catalog tests (5 tests)
├── 03-quote-tools.spec.ts    # Quote simulator and ROI calculator tests (4 tests)
├── 04-contact.spec.ts        # Contact and inquiry forms tests (3 tests)
├── 05-other.spec.ts          # Other public pages and SEO tests (22 tests)
└── AGENTS.md                 # This file
```

---

## Key Files

| File | Tests | Purpose |
|------|-------|---------|
| `01-home.spec.ts` | 3 | Homepage, about page, news page |
| `02-catalog.spec.ts` | 5 | Catalog listing, product details, filtering, search, 404 handling |
| `03-quote-tools.spec.ts` | 4 | Quote simulator, ROI calculator redirect, smart quote, step UI |
| `04-contact.spec.ts` | 3 | Contact form, validation, detailed inquiry |
| `05-other.spec.ts` | 22 | Samples, guides, premium content, archives, redirects, SEO, accessibility |

**Total**: 37 tests across 5 spec files

---

## Test Coverage Matrix

### A-1: Homepage (01-home.spec.ts)
| Test ID | Test Name | Target |
|---------|-----------|--------|
| TC-PUBLIC-001 | Top page loading | `/` |
| TC-PUBLIC-002 | Company about page | `/about` |
| TC-PUBLIC-003 | News page | `/news` |

### A-2: Catalog (02-catalog.spec.ts)
| Test ID | Test Name | Target |
|---------|-----------|--------|
| TC-PUBLIC-004 | Catalog page loading | `/catalog` |
| TC-PUBLIC-005 | Product detail page (dynamic routing) | `/catalog/[slug]` |
| TC-PUBLIC-006 | Catalog filter functionality | `/catalog` |
| TC-PUBLIC-007 | Catalog search functionality | `/catalog` |
| TC-PUBLIC-008 | Non-existent product slug 404 handling | `/catalog/non-existent-product-xyz` |

### A-3: Quote Tools (03-quote-tools.spec.ts)
| Test ID | Test Name | Target |
|---------|-----------|--------|
| TC-PUBLIC-009 | Quote simulator page loading | `/quote-simulator` |
| TC-PUBLIC-010 | ROI calculator redirect to quote simulator | `/roi-calculator` → `/quote-simulator` |
| TC-PUBLIC-011 | Smart quote page | `/smart-quote` |
| TC-PUBLIC-012 | Quote step UI confirmation | `/quote-simulator` |

### A-4: Contact (04-contact.spec.ts)
| Test ID | Test Name | Target |
|---------|-----------|--------|
| TC-PUBLIC-013 | Contact form operation | `/contact` |
| TC-PUBLIC-014 | Contact form validation | `/contact` |
| TC-PUBLIC-015 | Detailed inquiry page | `/inquiry/detailed` |

### A-5: Other Public Pages (05-other.spec.ts)
| Test ID | Test Name | Target |
|---------|-----------|--------|
| TC-PUBLIC-016 | Sample request page | `/samples` |
| TC-PUBLIC-017 | Size guide page | `/guide/size` |
| TC-PUBLIC-018 | Premium content page | `/premium-content` |
| TC-PUBLIC-019 | Archives page | `/archives` |
| TC-PUBLIC-020 | 404 page handling | `/non-existent-page` |
| TC-PUBLIC-021 | `/portal` → `/admin/customers` redirect | `/portal` |
| TC-PUBLIC-022 | Main navigation links | `/` |
| TC-PUBLIC-023 | Footer links | `/` |
| TC-PUBLIC-024 | Sample request form max 5 items limit | `/samples` |
| TC-PUBLIC-025 | Contact inquiry type selection | `/contact` |
| TC-PUBLIC-026 | Page metadata SEO | `/` |
| TC-PUBLIC-027 | Responsive design | `/` |
| TC-PUBLIC-028 | Accessibility | `/` |
| TC-PUBLIC-029 | Japanese font display | `/` |
| TC-PUBLIC-030 | External links security | `/` |
| TC-PUBLIC-031 | Image optimization | `/catalog` |
| TC-PUBLIC-032 | Product detail dynamic routing params | `/catalog/[slug]` |
| TC-PUBLIC-033 | Contact form error handling | `/contact` |
| TC-PUBLIC-034 | Quote tool initial state | `/quote-simulator` |
| TC-PUBLIC-035 | Quote tool product selection | `/quote-simulator` |
| TC-PUBLIC-036 | Quote tool next button | `/quote-simulator` |
| TC-PUBLIC-037 | Overall page load performance | `/` |

---

## AI Agents Section

### For AI Agents Working on Public Page Tests

#### Test Execution Patterns

**Run all Group A public tests:**
```bash
npx playwright test tests/e2e/group-a-public/
```

**Run specific spec file:**
```bash
npx playwright test tests/e2e/group-a-public/01-home.spec.ts
npx playwright test tests/e2e/group-a-public/02-catalog.spec.ts
```

**Run with UI/debug mode:**
```bash
npx playwright test tests/e2e/group-a-public/ --ui
npx playwright test tests/e2e/group-a-public/ --debug
npx playwright test tests/e2e/group-a-public/ --headed
```

**Run specific test by name:**
```bash
npx playwright test --grep "TC-PUBLIC-001"
npx playwright test --grep "カタログフィルター"
```

#### Public Test Patterns

All public page tests follow this structure:

1. **Console Error Monitoring**
   ```typescript
   const consoleErrors: string[] = [];
   page.on('console', msg => {
     if (msg.type() === 'error') {
       const text = msg.text();
       if (!text.includes('favicon') && !text.includes('404')) {
         consoleErrors.push(text);
       }
     }
   });
   ```

2. **Page Navigation**
   ```typescript
   await page.goto('/path', {
     waitUntil: 'domcontentloaded',
     timeout: 60000
   });
   await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
   ```

3. **Error Validation**
   ```typescript
   const criticalErrors = consoleErrors.filter(e =>
     !e.includes('ResizeObserver') &&
     !e.includes('Next.js') &&
     !e.includes('hydration')
   );
   expect(criticalErrors).toHaveLength(0);
   ```

4. **Element Existence Checks**
   ```typescript
   const element = page.locator('selector');
   const count = await element.count();

   if (count > 0) {
     await expect(element.first()).toBeVisible({ timeout: 5000 });
   }
   ```

#### Console Error Filtering

Tests filter out known benign errors:
- `favicon` - Missing favicon.ico requests
- `404` - General 404 responses (handled separately)
- `ResizeObserver` - Browser resize observer warnings
- `Next.js` - Next.js development warnings
- `hydration` - React hydration mismatches (development only)
- `Ads` - Ad-related errors

#### Writing New Public Page Tests

When adding new tests for public pages:

1. **Use descriptive test IDs**: Follow `TC-PUBLIC-XXX` pattern
2. **Add console error monitoring**: Copy the standard error monitoring pattern
3. **Use conditional assertions**: Check element count before asserting visibility
4. **Add Japanese comments**: Tests include Japanese documentation
5. **Follow the 5-file structure**: Place in appropriate spec file (01-05)

Example template:
```typescript
test('TC-PUBLIC-XXX: Test description', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404')) {
        consoleErrors.push(text);
      }
    }
  });

  await page.goto('/path', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

  // Validate no critical errors
  const criticalErrors = consoleErrors.filter(e =>
    !e.includes('ResizeObserver') &&
    !e.includes('Next.js')
  );
  expect(criticalErrors).toHaveLength(0);

  // Add test-specific assertions
});
```

#### Test Independence

All Group A tests are designed to be:
- **Independent**: No test depends on another test's state
- **Parallelizable**: All tests can run simultaneously
- **Authentication-free**: No login/setup required
- **Isolated**: Each test cleans up after itself

#### Common Selectors Used

| Purpose | Selector Pattern |
|---------|-----------------|
| Headings | `h1`, `h2`, `h1, h2` |
| Product cards | `[data-testid="product-card"]`, `.product-card`, `article` |
| Forms | `form`, `input[name="email"]`, `textarea[name*="message"]` |
| Buttons | `button[type="submit"]`, `button:has-text("text")` |
| Navigation | `nav a`, `[role="navigation"] a` |
| Footer | `footer a`, `[class*="footer"] a` |
| Main content | `main`, `article` |

#### Known Test Flakes and Mitigations

- **Dynamic content loading**: Uses `waitForTimeout()` for content that loads asynchronously
- **Element race conditions**: Checks element count before asserting visibility
- **Network delays**: 60s timeout for page navigation, 10s for load state
- **Conditional elements**: Many UI elements are optional (footer, mobile menu, etc.)

---

## Dependencies

### Required Pages

These tests expect the following public routes to exist:
- `/` - Homepage
- `/about` - Company information
- `/news` - News/announcements
- `/catalog` - Product catalog
- `/catalog/[slug]` - Product detail pages (dynamic routing)
- `/quote-simulator` - Quote calculation tool
- `/roi-calculator` - Redirects to quote simulator
- `/smart-quote` - Smart quote interface
- `/contact` - Contact form
- `/inquiry/detailed` - Detailed inquiry form
- `/samples` - Sample request form
- `/guide/size` - Size guide
- `/premium-content` - Premium content area
- `/archives` - Content archives
- `/portal` - Redirects to `/admin/customers` (301)

### Console Error Behavior

Expected console errors (filtered out):
- Missing favicon.ico
- ResizeObserver loop limit exceeded
- Next.js development warnings
- React hydration mismatches (dev only)

### Test Timeouts

- **Page navigation**: 60 seconds
- **Load state**: 10 seconds
- **Element visibility**: 5 seconds
- **Artificial delays**: 500-3000ms for dynamic content

### Browser Support

Tests run on all Playwright browsers:
- Chromium
- Firefox
- WebKit

---

## Related Documentation

- `../AGENTS.md` - Parent test directory documentation
- `../../AGENTS.md` - Root test suite documentation
- `../../playwright.config.ts` - Playwright configuration
- `../../README.md` - Testing guide (Japanese)

---

## Quick Reference

### Test Counts by Category
- Homepage: 3 tests
- Catalog: 5 tests
- Quote Tools: 4 tests
- Contact: 3 tests
- Other: 22 tests
- **Total: 37 tests**

### Execution Commands
```bash
# All public tests
npx playwright test tests/e2e/group-a-public/

# Specific category
npx playwright test tests/e2e/group-a-public/01-home.spec.ts

# With UI
npx playwright test tests/e2e/group-a-public/ --ui

# Specific test
npx playwright test --grep "TC-PUBLIC-001"
```

### Key Patterns
- Console error monitoring with filtering
- Conditional element existence checks
- 60s navigation timeout
- DOM content load waiting
- Parallel execution safe
- No authentication required

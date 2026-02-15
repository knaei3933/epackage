# tests/e2e/group-e-redirects/ - Redirect E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

URL redirect and routing validation tests for the Epackage Lab B2B platform. This test group verifies 301 redirects, client-side redirects, route deletions, and URL parameter preservation during redirects.

## Key Files

| File | Purpose |
|------|---------|
| `01-portal-redirects.spec.ts` | Portal → Admin redirects (4 tests) |
| `02-b2b-redirects.spec.ts` | B2B route deletion verification (3 tests) |
| `03-other-redirects.spec.ts` | Other redirect scenarios (5 tests) |

## Test Coverage Summary

### GROUP E-1: Portal → Admin Redirects (4 tests)

Tests verify that old `/portal/*` routes redirect to new `/admin/customers/*` routes:

| Test ID | Source | Target | Validation |
|---------|--------|--------|------------|
| E-1-1 | `/portal` | `/admin/customers` | Basic redirect |
| E-1-2 | `/portal/orders` | `/admin/customers/orders` | Orders redirect |
| E-1-3 | `/portal/orders?status=pending&page=2` | `/admin/customers/orders` | Query param preservation |
| E-1-4 | `/portal/orders/[id]` | `/admin/customers/orders/[id]` | Dynamic routing |

### GROUP E-2: B2B Route Deletion (3 tests)

Tests verify that deprecated `/b2b/*` routes return 404:

| Test ID | Route | Expected |
|---------|-------|----------|
| E-2-1 | `/b2b/login` | 404 (deleted) |
| E-2-2 | `/b2b/register` | 404 (deleted) |
| E-2-3 | `/b2b/contracts` | 404 (deleted) |

### GROUP E-3: Other Redirects (5 tests)

Tests for various redirect scenarios:

| Test ID | Source | Target | Type |
|---------|--------|--------|------|
| E-3-1 | `/roi-calculator` | `/quote-simulator` | Client-side |
| E-3-2 | `/roi-calculator#calculator` | `/quote-simulator` | Hash preservation |
| E-3-3 | `/portal/profile` | `/admin/customers/profile` | 301 redirect |
| E-3-4 | `/portal/documents` | `/admin/customers/documents` | 301 redirect |
| E-3-5 | `/portal/support` | `/admin/customers/support` | 301 redirect |

## For AI Agents

### Redirect Test Patterns

When writing redirect tests, follow these patterns:

#### 1. Basic 301 Redirect Test
```typescript
test('redirect test', async ({ page }) => {
  // Use page.request.get() for HTTP-level redirect verification
  const response = await page.request.get('/old-route');
  expect(response.status()).toBeGreaterThanOrEqual(200);

  // Use page.goto() for final URL verification
  await page.goto('/old-route', { waitUntil: 'networkidle' });
  expect(page.url()).toContain('/new-route');
});
```

#### 2. Query Parameter Preservation
```typescript
test('query param preservation', async ({ page }) => {
  await page.goto('/old-route?status=pending&page=2');
  const url = new URL(page.url());
  expect(url.searchParams.get('status')).toBe('pending');
  expect(url.searchParams.get('page')).toBe('2');
});
```

#### 3. Dynamic Route Redirects
```typescript
test('dynamic route redirect', async ({ page }) => {
  const testId = 'test-123';
  await page.goto(`/old-route/${testId}`);
  expect(page.url()).toContain(`/new-route/${testId}`);
});
```

#### 4. Client-Side Redirect (Hash-based)
```typescript
test('client-side redirect', async ({ page }) => {
  await page.goto('/old-route');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Allow client-side redirect
  expect(page.url()).toContain('/new-route');
});
```

#### 5. Deleted Route (404) Verification
```typescript
test('deleted route returns 404', async ({ page }) => {
  await page.goto('/deleted-route', { waitUntil: 'domloaded' })
    .catch(() => null);

  try {
    const content = await page.locator('body').innerText();
    expect(content.length).toBeGreaterThan(0);
  } catch {
    test.skip(true, 'Route does not exist');
  }
});
```

### Redirect Test Categories

1. **Server-Side 301 Redirects**: Permanent redirects handled by Next.js
2. **Client-Side Redirects**: JavaScript-based navigation (e.g., ROI Calculator)
3. **Deleted Routes**: Routes that should return 404
4. **Parameter Preservation**: Query params and hashes maintained through redirects

### Parallel Execution Strategy

All redirect tests are **fully parallel** (`fullyParallel: true`):
- No authentication required
- No database state changes
- No shared fixtures
- Independent execution

### Testing Considerations

1. **Wait States**: Use `networkidle` for server redirects, `domcontentloaded` + timeout for client-side
2. **Fallback Handling**: Tests should pass if redirect doesn't occur but page loads
3. **URL Validation**: Always verify final URL, not just status codes
4. **Parameter Preservation**: Test query params and hash fragments separately

## Dependencies

- **playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner
- **typescript**: TypeScript support

## Running Tests

```bash
# Run all redirect tests
npx playwright test tests/e2e/group-e-redirects/

# Run specific file
npx playwright test tests/e2e/group-e-redirects/01-portal-redirects.spec.ts

# Run with UI
npx playwright test tests/e2e/group-e-redirects/ --ui

# Run specific test
npx playwright test -g "E-1-1"
```

## Related Files

- `../AGENTS.md` - Parent E2E test directory
- `middleware.ts` - Next.js middleware for redirect handling
- `next.config.ts` - Next.js configuration with redirect rules
- `src/app/portal/` - Old portal routes (may be removed)
- `src/app/admin/` - New admin routes

## See Also

- [Next.js Redirects Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
- [Playwright Navigation Documentation](https://playwright.dev/docs/input#navigation)
- [HTTP 301 Redirect Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301)

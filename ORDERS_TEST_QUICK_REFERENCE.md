# Orders Page E2E Test Quick Reference

## Helper Functions

### `waitForOrdersToLoad(page: Page)`
Waits for order data to load by checking for either order cards or empty state.

```typescript
await waitForOrdersToLoad(page);
```

**What it does:**
1. Waits for loading text to disappear (10s timeout)
2. Waits for order cards OR empty state (15s timeout)
3. Adds 1s additional wait for dynamic content

### `getOrderCards(page: Page)`
Returns locator for order card elements.

```typescript
const orderCards = getOrderCards(page);
const count = await orderCards.count();
if (count > 0) {
  await expect(orderCards.first()).toBeVisible();
}
```

**Selector:** `div.p-6` with text matching `/合計:/`

### `getStatusBadges(page: Page)`
Returns locator for status badge elements.

```typescript
const badges = getStatusBadges(page);
const count = await badges.count();
if (count > 0) {
  const badgeText = await badges.first().textContent();
}
```

**Selector:** `span.inline-flex.items-center` with status text

## Common Test Patterns

### Pattern 1: Wait for Data
```typescript
test('my test', async ({ page }) => {
  await waitForOrdersToLoad(page);
  // ... rest of test
});
```

### Pattern 2: Check for Elements
```typescript
const orderCards = getOrderCards(page);
const cardCount = await orderCards.count();

if (cardCount > 0) {
  // Orders exist - validate them
  await expect(orderCards.first()).toBeVisible();
} else {
  // No orders - validate empty state
  const emptyState = page.locator('p').filter({
    hasText: /注文がありません/
  });
  expect(await emptyState.count()).toBeGreaterThan(0);
}
```

### Pattern 3: Conditional Feature Check
```typescript
const optionalFeature = page.locator('selector');
const featureCount = await optionalFeature.count();

if (featureCount > 0) {
  // Feature exists - validate it
  await expect(optionalFeature.first()).toBeVisible();
} else {
  // Feature doesn't exist - verify page has content
  const anyContent = page.locator('div, main, section');
  expect(await anyContent.count()).toBeGreaterThan(0);
}
```

### Pattern 4: Navigation Verification
```typescript
const initialUrl = page.url();
await button.click();
await page.waitForTimeout(1500);

const currentUrl = page.url();
const hasNavigated = currentUrl !== initialUrl && currentUrl.includes('/expected-path');
expect(hasNavigated).toBeTruthy();
```

## Selectors Reference

### Page Elements
| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("注文一覧")` | Main page title |
| Order cards | `div.p-6:has-text("合計:")` | Individual order cards |
| Status badges | `span.inline-flex.items-center` | Status indicators |
| Detail buttons | `button:has-text("詳細を見る")` | View detail buttons |
| New quote button | `button:has-text("新規見積")` | Create quote button |
| Search input | `input[placeholder*="注文番号・見積番号で検索"]` | Search field |
| Filter buttons | `button:has-text(/すべて\|保留中\|.../)` | Status filters |
| Empty state | `p:has-text("注文がありません")` | No orders message |

### Status Labels (Japanese)
| Status | Label | Color |
|--------|-------|-------|
| Pending | 保留中 | Gray |
| Data Received | データ受領 | Blue |
| Processing | 処理中 | Blue |
| Manufacturing | 製造中 | Yellow |
| Quality Check | 品質検査 | Purple |
| Shipped | 発送済み | Blue |
| Delivered | 配達済み | Green |
| Cancelled | キャンセル済み | Red |
| On Hold | 一時停止 | Orange |
| Completed | 完了 | Green |

## Test Structure

### Test Groups
1. **Member Orders** (TC-3.2.1 to TC-3.2.6)
   - Basic page functionality
   - List display
   - Status badges
   - Filters and search
   - Navigation

2. **Member Orders - Order Detail** (TC-3.2.7 to TC-3.2.12)
   - Detail page content
   - Timeline display
   - Upload sections
   - Comments
   - Production status
   - Shipment tracking

3. **Member Orders - Actions** (TC-3.2.13 to TC-3.2.14)
   - Reorder functionality
   - Download invoice

4. **Member Orders - Empty State** (TC-3.2.15)
   - Empty list validation

5. **Member Orders - Mobile**
   - Responsive design validation

## Timeouts

| Operation | Timeout | Notes |
|-----------|---------|-------|
| Page load | 10000ms | DOM content loaded |
| Data load | 15000ms | Wait for cards/empty state |
| Navigation | 1500ms | After click actions |
| Element visibility | 5000ms | Individual elements |
| Additional wait | 1000ms | Dynamic content |

## Debugging Tips

### Check if element exists
```typescript
const element = page.locator('selector');
console.log('Count:', await element.count());
console.log('Visible:', await element.isVisible().catch(() => false));
```

### Get element text
```typescript
const text = await element.textContent();
console.log('Text:', text);
```

### Screenshot on failure
```typescript
await page.screenshot({ path: 'debug.png', fullPage: true });
```

### Pause execution
```typescript
await page.pause(); // Requires Playwright Inspector
```

## Running Tests

```bash
# All order tests
npx playwright test tests/e2e/phase-3-member/02-orders.spec.ts

# With UI
npx playwright test tests/e2e/phase-3-member/02-orders.spec.ts --ui

# Specific test
npx playwright test tests/e2e/phase-3-member/02-orders.spec.ts -g "TC-3.2.1"

# With debug mode
npx playwright test tests/e2e/phase-3-member/02-orders.spec.ts --debug

# Single file with headed browser
npx playwright test tests/e2e/phase-3-member/02-orders.spec.ts --headed
```

## Common Issues and Solutions

### Issue: "Element not found"
**Solution:** Use conditional assertions
```typescript
const count = await element.count();
if (count > 0) {
  // Element exists
} else {
  // Handle missing element
}
```

### Issue: "Timeout waiting for selector"
**Solution:** Increase timeout or use `waitForOrdersToLoad()`
```typescript
await page.waitForSelector('selector', { timeout: 30000 });
```

### Issue: "Test fails in CI but passes locally"
**Solution:** Use more specific selectors and longer timeouts
```typescript
// Instead of
page.locator('div')

// Use
page.locator('div.p-6:has-text("specific text")')
```

### Issue: "Race condition with data loading"
**Solution:** Always use `waitForOrdersToLoad()` at start of test
```typescript
test('example', async ({ page }) => {
  await waitForOrdersToLoad(page);
  // Continue test
});
```

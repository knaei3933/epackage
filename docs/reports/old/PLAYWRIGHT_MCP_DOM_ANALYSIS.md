# DOM Structure Analysis & Testability Guide

**Generated**: 2026-01-11
**Purpose**: Help developers improve automated testing reliability

---

## Current DOM Structure

### Product Catalog Page (`/catalog`)

#### Found Selectors

| Element Type | Selector | Count | Notes |
|--------------|----------|-------|-------|
| Grid container | `.grid` | 1+ | Main layout container |
| Headings | `h2, h3` | Multiple | Product titles, section headers |
| Product cards | `.product-card` | 0+ | May have dynamic classes |
| Any product element | `[class*="product"]` | Multiple | Pattern-based selector |

#### Current Structure

```html
<div class="grid">
  <!-- Product cards with dynamic classes -->
  <div class="enhanced-product-card ...">
    <h3>製品名</h3>
    <span class="price">¥100</span>
  </div>
</div>
```

#### Issues

1. **No stable identifiers**: Classes may change with CSS refactoring
2. **No `data-testid` attributes**: Hard to target specific elements
3. **Dynamic class names**: `enhanced-product-card` may vary

---

### Contact Form (`/contact`)

#### Found Selectors

| Field Type | Selector | Found |
|------------|----------|-------|
| Text inputs | `input[type="text"]` | 20 fields |
| Email inputs | `input[type="email"]` | Multiple |
| Textareas | `textarea` | 1 |
| Submit buttons | `button[type="submit"]` | Yes |

#### Current Structure

```html
<form>
  <input type="text" placeholder="お名前" />
  <input type="email" placeholder="メールアドレス" />
  <textarea placeholder="お問い合わせ内容"></textarea>
  <button type="submit">送信</button>
</form>
```

#### Issues

1. **No `name` or `id` attributes**: Hard to identify specific fields
2. **Japanese placeholders**: May not work well in all test environments
3. **No `data-testid`**: Brittle selectors

---

### Category Filters (`/catalog`)

#### Found Selectors

| Element | Selector | Status |
|---------|----------|--------|
| Sidebar | `[class*="sidebar"], aside` | ✅ Found |
| Category filters | Various | ✅ Detected |
| AdvancedFilters | `[class*="AdvancedFilters"]` | ✅ Found |

#### Current Structure

```html
<div class="sidebar-or-aside">
  <div class="AdvancedFilters">
    <!-- Filter controls -->
  </div>
</div>
```

#### Issues

1. **No stable identifiers**: Component class names may change
2. **No category labels**: Hard to test specific category selection
3. **No `data-testid`**: Brittle selectors

---

## Recommended Improvements

### 1. Product Cards

**Before**:
```typescript
<div className="product-card">
  <h3>{product.name_ja}</h3>
  <span>{product.price}</span>
</div>
```

**After**:
```typescript
<div
  className="product-card"
  data-testid="product-card"
  data-product-id={product.id}
  data-category={product.category}
>
  <h3 data-testid="product-name">{product.name_ja}</h3>
  <span data-testid="product-price">{product.price}</span>
  <span data-testid="product-category">{product.category}</span>
</div>
```

**Testing**:
```typescript
// Before (brittle):
await page.locator('.product-card').first().click()

// After (reliable):
await page.locator('[data-testid="product-card"][data-product-id="123"]').click()
await page.locator('[data-testid="product-card"][data-category="pouch"]')
```

---

### 2. Contact Form

**Before**:
```typescript
<input type="text" placeholder="お名前" />
<input type="email" placeholder="メールアドレス" />
<textarea placeholder="お問い合わせ内容"></textarea>
<button type="submit">送信</button>
```

**After**:
```typescript
<form data-testid="contact-form">
  <input
    data-testid="contact-name-input"
    id="contact-name"
    name="name"
    type="text"
    placeholder="お名前"
    required
  />
  <input
    data-testid="contact-email-input"
    id="contact-email"
    name="email"
    type="email"
    placeholder="メールアドレス"
    required
  />
  <textarea
    data-testid="contact-message-textarea"
    id="contact-message"
    name="message"
    placeholder="お問い合わせ内容"
    rows={5}
    required
  />
  <button
    data-testid="contact-submit-button"
    type="submit"
  >
    送信
  </button>
</form>
```

**Testing**:
```typescript
// Before (brittle):
await page.locator('input[type="text"]').first().fill('Test User')

// After (reliable):
await page.locator('[data-testid="contact-name-input"]').fill('Test User')
await page.locator('[data-testid="contact-email-input"]').fill('test@example.com')
await page.locator('[data-testid="contact-message-textarea"]').fill('Test message')
await page.locator('[data-testid="contact-submit-button"]').click()
```

---

### 3. Category Filters

**Before**:
```typescript
<div className="category-filter">
  <button onClick={() => setCategory('pouch')}>パウチ</button>
  <button onClick={() => setCategory('standup')}>スタンドパウチ</button>
</div>
```

**After**:
```typescript
<div data-testid="category-sidebar">
  <button
    data-testid="category-filter"
    data-category="all"
    aria-label="すべての製品"
  >
    すべて
  </button>
  <button
    data-testid="category-filter"
    data-category="pouch"
    aria-label="パウチ製品"
  >
    パウチ
  </button>
  <button
    data-testid="category-filter"
    data-category="standup"
    aria-label="スタンドパウチ製品"
  >
    スタンドパウチ
  </button>
</div>
```

**Testing**:
```typescript
// Before (brittle):
await page.locator('button:has-text("パウチ")').click()

// After (reliable):
await page.locator('[data-testid="category-filter"][data-category="pouch"]').click()

// Verify selection
await expect(page.locator('[data-testid="category-filter"][data-category="pouch"]'))
  .toHaveAttribute('aria-pressed', 'true')
```

---

## Implementation Strategy

### Phase 1: High-Priority Components (Week 1)

1. **Product Cards** (`EnhancedProductCard.tsx`)
   - Add `data-testid="product-card"`
   - Add `data-product-id`
   - Add `data-category`

2. **Contact Form** (`ContactForm.tsx` or similar)
   - Add `data-testid="contact-form"`
   - Add `data-testid` to all inputs
   - Add `id` and `name` attributes

3. **Category Filters** (`AdvancedFilters.tsx`)
   - Add `data-testid="category-sidebar"`
   - Add `data-category` to filter buttons
   - Add ARIA attributes

### Phase 2: Medium-Priority Components (Week 2)

4. **Search Input**
   - Add `data-testid="search-input"`
   - Add `data-testid="search-button"`

5. **Filter Controls**
   - Add `data-testid` to all filter inputs
   - Add `data-testid` to apply/reset buttons

6. **Cart Components**
   - Add `data-testid="cart-item"`
   - Add `data-product-id`

### Phase 3: Low-Priority Components (Week 3)

7. **Navigation**
   - Add `data-testid` to nav links
   - Add `data-testid` to menu toggles

8. **Modal/Dialog**
   - Add `data-testid` to modals
   - Add `data-testid` to close buttons

---

## Testing Best Practices

### 1. Prefer `data-testid` Over CSS Selectors

```typescript
// ❌ Brittle - CSS classes may change
await page.locator('.product-card.enhanced').first().click()

// ✅ Reliable - testid is stable
await page.locator('[data-testid="product-card"]').first().click()
```

### 2. Use Semantic HTML Attributes

```typescript
// ✅ Good - uses semantic attributes
<input
  data-testid="email-input"
  type="email"
  name="email"
  id="email"
  required
/>

// Can be tested multiple ways:
await page.locator('[data-testid="email-input"]').fill('test@example.com')
// OR
await page.locator('#email').fill('test@example.com')
// OR
await page.locator('input[name="email"]').fill('test@example.com')
```

### 3. Add Accessibility Attributes

```typescript
<button
  data-testid="submit-button"
  type="submit"
  aria-label="フォームを送信"
  aria-busy={isLoading}
>
  {isLoading ? '送信中...' : '送信'}
</button>

// Test accessibility:
await expect(page.locator('[data-testid="submit-button"]'))
  .toHaveAttribute('aria-label', 'フォームを送信')
```

### 4. Group Related Elements

```typescript
<div data-testid="product-card" data-product-id="123">
  <h3 data-testid="product-name">製品名</h3>
  <span data-testid="product-price">¥100</span>
  <button data-testid="add-to-cart">カートに追加</button>
</div>

// Test entire card:
const card = page.locator('[data-testid="product-card"][data-product-id="123"]')
await expect(card.locator('[data-testid="product-name"]')).toHaveText('製品名')
await expect(card.locator('[data-testid="product-price"]')).toHaveText('¥100')
```

---

## Component Template

Use this template for new components:

```typescript
interface ComponentProps {
  testId?: string;
  // ... other props
}

export function MyComponent({ testId = 'my-component', ...props }: ComponentProps) {
  return (
    <div
      data-testid={testId}
      id={testId} // for accessibility
    >
      <h2 data-testid={`${testId}-title`}>Title</h2>
      <button
        data-testid={`${testId}-button`}
        aria-label={`${testId} action`}
      >
        Action
      </button>
    </div>
  )
}
```

**Usage**:
```typescript
// With custom testId
<MyComponent testId="special-component" />

// Tests
await page.locator('[data-testid="special-component-title"]')
await page.locator('[data-testid="special-component-button"]')
```

---

## Automated Testing Benefits

### With `data-testid` Attributes

1. **Reduced Flakiness**: Tests don't break when CSS changes
2. **Faster Debugging**: Clear which element failed
3. **Better Documentation**: Test code is self-documenting
4. **Easier Maintenance**: One source of truth for test selectors

### Without `data-testid` Attributes

1. **Brittle Tests**: Break with any CSS refactor
2. **Complex Selectors**: Hard to read and maintain
3. **False Positives**: Tests pass but wrong element clicked
4. **Slow Development**: Constant test updates needed

---

## Summary

### Current State

| Component | Testability | Score |
|-----------|-------------|-------|
| Product Cards | ⚠️ Partial | 6/10 |
| Contact Form | ⚠️ Partial | 5/10 |
| Category Filters | ⚠️ Partial | 6/10 |
| Overall | ⚠️ Needs Work | 5.5/10 |

### Target State (After Implementation)

| Component | Testability | Score |
|-----------|-------------|-------|
| Product Cards | ✅ Excellent | 10/10 |
| Contact Form | ✅ Excellent | 10/10 |
| Category Filters | ✅ Excellent | 10/10 |
| Overall | ✅ Production-Ready | 10/10 |

---

**Next Steps**:
1. Review this guide with development team
2. Create implementation plan (3 phases above)
3. Start with Phase 1 components
4. Update tests as attributes are added
5. Document progress in project board

**Resources**:
- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Testing Library Guidelines: https://testing-library.com/docs/guiding-principles
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

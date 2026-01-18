# Group A Public Tests - Quick Reference

## Test Command

```bash
# Run all Group A public tests (Chromium only)
npm run test:e2e tests/e2e/group-a-public/ --project=chromium --reporter=line

# Run with UI for debugging
npm run test:e2e tests/e2e/group-a-public/ --project=chromium --ui

# Run specific test file
npm run test:e2e tests/e2e/group-a-public/01-home.spec.ts --project=chromium
```

## Test Structure

```
tests/e2e/group-a-public/
├── 01-home.spec.ts          (3 tests) - Homepage, About, News
├── 02-catalog.spec.ts       (5 tests) - Catalog, Product Details, Filters, Search, 404
├── 03-quote-tools.spec.ts   (4 tests) - Quote Simulator, ROI Calculator, Smart Quote
├── 04-contact.spec.ts       (3 tests) - Contact Form, Validation, Detailed Inquiry
└── 05-other.spec.ts         (22 tests) - Samples, Guide, Premium, Archives, 404, etc.
```

## Public Routes Fixed

Added to `src/middleware.ts` PUBLIC_ROUTES array:
- `/smart-quote`
- `/news`
- `/premium-content`
- `/archives`
- `/inquiry`
- `/compare`
- `/service`

## Key Test Scenarios

### Homepage Tests (01-home.spec.ts)
- ✅ Top page loads without errors
- ✅ About page displays company information
- ✅ News page shows content or empty state

### Catalog Tests (02-catalog.spec.ts)
- ✅ Catalog page loads with products
- ✅ Product detail pages work with dynamic routing
- ✅ Filter functionality works
- ✅ Search functionality works
- ✅ 404 page shows for non-existent products

### Quote Tools Tests (03-quote-tools.spec.ts)
- ✅ Quote simulator page loads
- ✅ ROI calculator redirects to quote simulator
- ✅ Smart quote page is accessible
- ✅ Quote step UI displays correctly

### Contact Tests (04-contact.spec.ts)
- ✅ Contact form displays and works
- ✅ Form validation works
- ✅ Detailed inquiry page is accessible

### Other Tests (05-other.spec.ts)
- ✅ Sample request page
- ✅ Size guide page
- ✅ Premium content page
- ✅ Archives page
- ✅ 404 page handling
- ✅ Portal redirects
- ✅ Navigation links
- ✅ Footer links
- ✅ Responsive design
- ✅ Accessibility
- ✅ Japanese font display
- ✅ External links security
- ✅ Image optimization
- ✅ SEO metadata
- ✅ Performance

## Common Issues and Solutions

### Issue: Test Fails with Authentication Redirect
**Solution**: Add the route to `PUBLIC_ROUTES` in `src/middleware.ts`

### Issue: Page Returns 404
**Solution**: Verify the page exists in `src/app/` directory structure

### Issue: Console Errors
**Solution**: Tests filter out non-critical errors (favicon, ResizeObserver, Next.js hydration)

### Issue: Timeout Errors
**Solution**: Tests use `domcontentloaded` wait strategy with 60s timeout

## Verification Checklist

Before running tests:
- [ ] Dev server is running on port 3000 (or BASE_URL is set)
- [ ] Environment variables are configured (.env.local or .env.test)
- [ ] Middleware changes are saved
- [ ] All page files exist in src/app/

After running tests:
- [ ] All 37 tests pass
- [ ] No unexpected console errors
- [ ] No authentication redirects for public pages
- [ ] 404 handling works correctly

## Expected Test Results

```
Running 37 tests using 1 worker

  ✓ [chromium] › 01-home.spec.ts: TC-PUBLIC-001: トップページ読み込み
  ✓ [chromium] › 01-home.spec.ts: TC-PUBLIC-002: 会社概要ページ
  ✓ [chromium] › 01-home.spec.ts: TC-PUBLIC-003: ニュースページ
  ✓ [chromium] › 02-catalog.spec.ts: TC-PUBLIC-004: カタログページ読み込み
  ✓ [chromium] › 02-catalog.spec.ts: TC-PUBLIC-005: 製品詳細ページ（動的ルーティング）
  ✓ [chromium] › 02-catalog.spec.ts: TC-PUBLIC-006: カタログフィルター機能
  ✓ [chromium] › 02-catalog.spec.ts: TC-PUBLIC-007: カタログ検索機能
  ✓ [chromium] › 02-catalog.spec.ts: TC-PUBLIC-008: 存在しない製品slugでの404ハンドリング
  ✓ [chromium] › 03-quote-tools.spec.ts: TC-PUBLIC-009: 見積シミュレーターページ読み込み
  ✓ [chromium] › 03-quote-tools.spec.ts: TC-PUBLIC-010: ROI計算機から見積シミュレーターへのリダイレクト
  ✓ [chromium] › 03-quote-tools.spec.ts: TC-PUBLIC-011: スマート見積ページ
  ✓ [chromium] › 03-quote-tools.spec.ts: TC-PUBLIC-012: 見積ステップUI確認
  ... (all 37 tests should pass)

  37 passed (Xs)
```

## Related Files

- `src/middleware.ts` - PUBLIC_ROUTES configuration
- `src/app/not-found.tsx` - Custom 404 page
- `playwright.config.ts` - Test configuration
- `tests/e2e/group-a-public/*.spec.ts` - Test files

## Support

If tests still fail after applying these fixes:
1. Check the dev server console for errors
2. Verify the page exists in the correct location
3. Check middleware logs (in development mode)
4. Use Playwright UI mode to debug: `npm run test:e2e:ui`

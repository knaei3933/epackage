# Member Quotations Test Quick Start Guide

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   # Server should be running on http://localhost:3000
   ```

2. **Environment Variables** (`.env.local`)
   ```
   NEXT_PUBLIC_DEV_MODE=true
   # Or set ENABLE_DEV_MOCK_AUTH=true
   ```

## Running the Tests

### Run All Quotations Tests
```bash
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts
```

### Run Specific Test Case
```bash
# Run specific test by name
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts -g "TC-3.3.1"
```

### Run with UI (Interactive Mode)
```bash
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts --ui
```

### Run Headed (See Browser)
```bash
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts --headed
```

### Run with Debugging
```bash
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts --debug
```

## Test Cases

| TC ID | Description | Group |
|-------|-------------|-------|
| TC-3.3.1 | Quotations list loads and renders | List View |
| TC-3.3.2 | Quotation cards or empty state display | List View |
| TC-3.3.3 | Status filter buttons are available | List View |
| TC-3.3.4 | Create new quotation button exists | List View |
| TC-3.3.5 | Navigate to quotation detail page | Detail View |
| TC-3.3.6 | Download PDF button exists | Actions |
| TC-3.3.7 | Delete button exists for draft quotations | Actions |
| TC-3.3.8 | Order button exists for approved quotations | Actions |
| TC-3.3.9 | New quotation button navigates to quote simulator | Navigation |
| TC-3.3.10 | Refresh button reloads the page | Navigation |
| TC-3.3.11 | Empty state displays correctly | Empty State |
| TC-3.3.12 | Status badges display correctly | Status Display |

## Expected Results

### Scenario 1: No Quotations in Database (Empty State)
```
✓ TC-3.3.1 (PASS) - Page loads, empty state is shown
✓ TC-3.3.2 (PASS) - Empty state is displayed correctly
✓ TC-3.3.3 (PASS) - Filter buttons are visible
✓ TC-3.3.4 (PASS) - Create button is visible
⊘ TC-3.3.5 (SKIP) - No quotations to navigate to
⊘ TC-3.3.6 (SKIP) - No quotations to download
⊘ TC-3.3.7 (SKIP) - No draft quotations
⊘ TC-3.3.8 (SKIP) - No approved quotations
✓ TC-3.3.9 (PASS) - Create button works
✓ TC-3.3.10 (PASS) - Refresh button works
✓ TC-3.3.11 (PASS) - Empty state is correct
⊘ TC-3.3.12 (SKIP) - No status badges without data
```

### Scenario 2: Quotations Exist in Database
```
✓ TC-3.3.1 (PASS) - Page loads, quotations shown
✓ TC-3.3.2 (PASS) - Quotation cards are displayed
✓ TC-3.3.3 (PASS) - Filter buttons are visible
✓ TC-3.3.4 (PASS) - Create button is visible
✓ TC-3.3.5 (PASS) - Can navigate to detail page
✓ TC-3.3.6 (PASS) - PDF download button exists
✓/⊘ TC-3.3.7 - Depends on draft status
✓/⊘ TC-3.3.8 - Depends on approved status
✓ TC-3.3.9 (PASS) - Create button works
✓ TC-3.3.10 (PASS) - Refresh button works
✓ TC-3.3.11 (PASS) - Handles both empty and populated
✓ TC-3.3.12 (PASS) - Status badges shown
```

## Troubleshooting

### Test Times Out
- Increase timeout: `test.use({ timeout: 120000 })`
- Check dev server is running: `curl http://localhost:3000`
- Check API endpoint: `curl http://localhost:3000/api/member/quotations`

### Tests Skip Unexpectedly
- Check DEV_MODE is set: `echo $NEXT_PUBLIC_DEV_MODE`
- Verify auth helper is working
- Check browser console for errors

### Page Not Loading
```bash
# Check if dev server is running
curl http://localhost:3000/member/quotations

# Check playwright config
cat playwright.config.ts | grep baseURL
```

### Selectors Not Found
```bash
# Run with headed mode to see what's on the page
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts --headed

# Use Playwright Inspector
npx playwright test tests/e2e/phase-3-member/03-quotations.spec.ts --debug
```

## Key Selectors Used

| Element | Selector | Notes |
|---------|----------|-------|
| Page Title | `h1:has-text("見積依頼")` | Main heading |
| Empty State | `text=/見積依頼がありません/i` | Empty message |
| Quotation Card | `.space-y-4 > div, [class*="Card"]` | Card container |
| Filter Buttons | `button:has-text("すべて")` | Status filters |
| New Quote Button | `button:has-text("新規見積")` | Create button |
| Refresh Button | `button:has-text("更新")` | Reload button |
| PDF Download | `button:has-text("PDFダウンロード")` | Download button |
| Delete Button | `button:has-text("削除")` | Delete (draft only) |
| Order Button | `button:has-text("発注する")` | Order (approved only) |
| Detail Link | `a[href*="/member/quotations/"]` | Detail page link |
| Loading State | `text=/読み込み中|Loading/i` | Page loading |

## Test Data Requirements

### For Full Coverage
- At least 1 quotation in DRAFT status (for delete button test)
- At least 1 quotation in APPROVED status (for order button test)
- At least 1 quotation in any status (for most tests)

### Create Test Data via API
```bash
# Create a draft quotation
curl -X POST http://localhost:3000/api/member/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DRAFT",
    "items": [...]
  }'
```

## Related Documentation

- [Playwright Test Documentation](https://playwright.dev/docs/intro)
- [Phase 3 Test Plan](../docs/COMPREHENSIVE_TEST_SCENARIOS_PHASE3_ADMIN.md)
- [Member Portal Architecture](../CLAUDE.md#member-portal)
- [Dev Mode Auth Helper](../tests/helpers/dev-mode-auth.ts)

## File Locations

- Test file: `tests/e2e/phase-3-member/03-quotations.spec.ts`
- Page component: `src/app/member/quotations/page.tsx`
- API route: `src/app/api/member/quotations/route.ts`
- Auth helper: `tests/helpers/dev-mode-auth.ts`

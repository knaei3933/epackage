# tests/e2e/phase-4-admin/ - Admin Portal E2E Tests

<!-- Parent: ../AGENTS.md -->

## Purpose

Phase 4 end-to-end tests for the Epackage Lab B2B admin portal. These tests verify admin functionality including dashboard, member approvals, order management, quotations, production tracking, inventory, shipping, contracts, and leads management.

## Key Files

| File | Purpose | Tests |
|------|---------|-------|
| `01-dashboard.spec.ts` | Admin dashboard validation | 10 tests - stats, navigation, quick actions |
| `02-member-approval.spec.ts` | Member registration approval | 10 tests - approval/rejection workflow |
| `03-orders.spec.ts` | Order management | 12 tests - status changes, filtering, details |
| `04-quotations.spec.ts` | Quotation management | 13 tests - pricing, approval, conversion |
| `05-contracts.spec.ts` | Contract workflow management | 13 tests - creation, signatures, versions |
| `06-production.spec.ts` | Production tracking (9-stage) | 13 tests - stage progression, job creation |
| `07-inventory.spec.ts` | Inventory management | 13 tests - stock in/out, adjustments |
| `08-shipping.spec.ts` | Shipping management | 15 tests - tracking, carriers, delivery |
| `09-leads.spec.ts` | Lead management | 16 tests - status, assignment, conversion |
| `admin-pages-quick-check.spec.ts` | Smoke test for all admin pages | 8 tests - page accessibility validation |

## Test Organization

### Group 4.1: Dashboard (01-dashboard.spec.ts)
- **Purpose**: Validate admin dashboard loads and displays key metrics
- **Key Tests**: Statistics widgets, recent orders, pending approvals, navigation
- **Japanese Labels**: 総注文数, 保留中見積もり, 生産ジョブ, 総売上, 最近のアクティビティ, アラート

### Group 4.2: Member Approval (02-member-approval.spec.ts)
- **Purpose**: Test member registration approval workflow
- **Key Tests**: List pending members, approve/reject, business document review
- **Japanese Labels**: 会員承認待ち, 承認, 拒否, 更新
- **API**: `/api/admin/approve-member`, `/api/admin/users`

### Group 4.3: Orders (03-orders.spec.ts)
- **Purpose**: Order management and status tracking
- **Key Tests**: Status changes, filtering, batch updates, search, export
- **Japanese Labels**: 注文管理, 注文番号, 顧客, 合計
- **API**: `/api/admin/orders`

### Group 4.4: Quotations (04-quotations.spec.ts)
- **Purpose**: Quotation management and pricing
- **Key Tests**: Price modification, approval, conversion to order, PDF export
- **Japanese Labels**: 見積もり管理, 承認, 拒否, 税込
- **API**: `/api/admin/quotations`

### Group 4.5: Contracts (05-contracts.spec.ts)
- **Purpose**: Contract workflow and electronic signature
- **Key Tests**: Contract creation, workflow actions, version history, attachments
- **Japanese Labels**: 契約ワークフロー管理, 契約番号, 署名, 履歴
- **API**: `/api/admin/contracts`, `/api/contract/workflow`

### Group 4.6: Production (06-production.spec.ts)
- **Purpose**: 9-stage production process tracking
- **Key Tests**: Stage progression, job creation, staff assignment, batch updates
- **9 Stages**: データ受領 → 検品 → 設計 → 版下作成 → 印刷 → 表面加工 → 抜き加工 → ラミネート → 最終検査
- **Japanese Labels**: 生産管理, 生産プロセス（9段階）
- **API**: `/api/admin/production`

### Group 4.7: Inventory (07-inventory.spec.ts)
- **Purpose**: Inventory stock management
- **Key Tests**: Stock in/out, adjustments, low stock alerts, bulk updates
- **Japanese Labels**: 在庫管理, 総製品数, 倉庫数, 発注必要, 入庫, 出庫
- **API**: `/api/admin/inventory`, `/api/stock`

### Group 4.8: Shipping (08-shipping.spec.ts)
- **Purpose**: Shipping and delivery management
- **Key Tests**: Create shipment, tracking updates, carrier selection, bulk status
- **Japanese Labels**: 配送管理, 追跡, 未発送, 配送完了
- **API**: `/api/admin/shipping`, `/api/shipments`

### Group 4.9: Leads (09-leads.spec.ts)
- **Purpose**: Lead management and conversion
- **Key Tests**: Status changes, assignment, notes, conversion to opportunity
- **Page Title**: Lead Management Dashboard
- **API**: `/api/admin/leads`

### Quick Check (admin-pages-quick-check.spec.ts)
- **Purpose**: Smoke test verifying all admin pages are accessible
- **Pages Checked**: dashboard, orders, quotations, production, shipping, contracts, approvals, inventory, leads, settings, coupons

## For AI Agents

### Admin Test Patterns

When working with admin portal tests, follow these patterns:

#### 1. DEV Mode Support
All admin tests support DEV_MODE for development:
```typescript
const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' ||
                   process.env.NEXT_PUBLIC_DEV_MODE === 'true';

if (isDevMode) {
  console.log('[DEV_MODE] Skipping login, accessing admin pages directly');
  await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
  return;
}
```

#### 2. Admin Login Helper
```typescript
async function performAdminLogin(page: any, email: string, password: string) {
  if (isDevMode) {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    return;
  }

  await page.goto('/auth/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL(/\/admin\//, { timeout: 10000 });
}
```

#### 3. Console Error Filtering
Filter out expected development errors:
```typescript
function filterDevErrors(errors: string[]): string[] {
  return errors.filter(err =>
    !err.includes('Failed to fetch') &&
    !err.includes('<!DOCTYPE') &&
    !err.includes('404') &&
    !err.includes('favicon.ico') &&
    !err.includes('Download the React DevTools')
  );
}
```

#### 4. Japanese Text Assertions
```typescript
// Page titles
await expect(page.getByRole('heading', { name: '管理ダッシュボード' })).toBeVisible();

// Button labels
const approveButton = page.getByRole('button', { name: '承認' });
const rejectButton = page.getByRole('button', { name: '拒否' });

// Form labels
await expect(page.getByText('総注文数')).toBeVisible();
```

#### 5. Flexible Element Locators
Handle dynamic content gracefully:
```typescript
// Check if element exists before acting
const element = page.locator('tbody tr');
const count = await element.count();

if (count > 0) {
  await element.first().click();
} else {
  console.log('No items found - skipping test');
  test.skip();
}
```

#### 6. Production Stage Constants
```typescript
const PRODUCTION_STAGES = [
  { key: 'data_received', label: 'データ受領' },
  { key: 'inspection', label: '検品' },
  { key: 'design', label: '設計' },
  { key: 'plate_making', label: '版下作成' },
  { key: 'printing', label: '印刷' },
  { key: 'surface_finishing', label: '表面加工' },
  { key: 'die_cutting', label: '抜き加工' },
  { key: 'lamination', label: 'ラミネート' },
  { key: 'final_inspection', label: '最終検査' }
];
```

#### 7. Dialog Handling
```typescript
// Handle confirmation dialogs
page.on('dialog', dialog => dialog.accept());

// Or for rejection confirmation
page.on('dialog', dialog => {
  if (dialog.message().includes('拒否の確認')) {
    // Verify modal appears
  }
  dialog.accept();
});
```

### Test Naming Convention

- **Format**: `TC-4.X.X` where X is group and test number
- **Examples**:
  - `TC-4.1.1`: Dashboard loads
  - `TC-4.2.3`: Member approval
  - `TC-4.6.3`: 9-step process verification

### Running Tests

```bash
# Run all phase-4 admin tests
npx playwright test tests/e2e/phase-4-admin/

# Run specific test file
npx playwright test tests/e2e/phase-4-admin/01-dashboard.spec.ts

# Run with DEV_MODE
ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/phase-4-admin/

# Run specific test by name
npx playwright test -g "TC-4.2.3"

# Run with UI
npx playwright test tests/e2e/phase-4-admin/ --ui
```

### Environment Variables

```env
# Test credentials
TEST_ADMIN_EMAIL=admin@epackage-lab.com
TEST_ADMIN_PASSWORD=Admin1234

# DEV_MODE for development (skip login)
ENABLE_DEV_MOCK_AUTH=true
NEXT_PUBLIC_DEV_MODE=true
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Auth 401 errors | Tests filter these out or use DEV_MODE |
| Slow page loads | Use `test.slow()` or increase timeout |
| Empty data states | Tests skip gracefully when no data exists |
| API not implemented | Tests marked as `test.fixme()` with explanation |
| Japanese text encoding | Use proper UTF-8 encoding in test files |

### Dependencies

- **@playwright/test**: E2E testing framework
- **typescript**: Type definitions
- **Database tables**: users, profiles, orders, quotations, production_orders, inventory, shipments, contracts, leads, admin_notifications
- **Auth system**: Supabase authentication with DEV_MODE bypass

### Database Tables Used

- `users` - Admin accounts
- `profiles` - User profiles with business info
- `orders` - Order records
- `order_items` - Order line items
- `quotations` - Quotations
- `quotation_items` - Quotation line items
- `production_orders` - Production jobs
- `production_logs` - Stage progression
- `inventory` - Stock levels
- `inventory_movements` - Stock history
- `shipments` - Shipping records
- `shipping_tracking` - Tracking info
- `contracts` - Contract records
- `contract_versions` - Version history
- `leads` - Lead records
- `lead_activities` - Lead history
- `admin_notifications` - Admin alerts

## Related Files

- `../AGENTS.md` - Parent E2E tests directory
- `../../playwright.config.ts` - Playwright configuration
- `../global-setup.ts` - Test setup
- `../auth-helpers.ts` - Authentication utilities
- `../../fixtures/` - Test data fixtures

## See Also

- [Playwright Documentation](https://playwright.dev)
- `../phase-3-member/AGENTS.md` - Member portal tests
- `../phase-2-auth/AGENTS.md` - Authentication tests

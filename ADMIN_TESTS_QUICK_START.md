# Admin Tests Quick Start Guide

## Admin Credentials

**Email**: `admin@epackage-lab.com`
**Password**: `Admin1234`

These are set in `.env.test` and used as defaults in all test files.

## Setup Admin User (if not exists)

```bash
# Option 1: Reset existing admin password
npx tsx scripts/reset-admin-password.ts

# Option 2: Create new admin user
npx tsx scripts/create-admin.ts admin@epackage-lab.com Admin1234
```

## Running Admin Tests

### All Phase 4 Admin Tests
```bash
npx playwright test tests/e2e/phase-4-admin/
```

### Individual Test Files
```bash
# Dashboard
npx playwright test tests/e2e/phase-4-admin/01-dashboard.spec.ts

# Member Approvals
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts

# Orders
npx playwright test tests/e2e/phase-4-admin/03-orders.spec.ts

# Quotations (NEW)
npx playwright test tests/e2e/phase-4-admin/04-quotations.spec.ts

# Contracts
npx playwright test tests/e2e/phase-4-admin/05-contracts.spec.ts

# Production
npx playwright test tests/e2e/phase-4-admin/06-production.spec.ts

# Inventory
npx playwright test tests/e2e/phase-4-admin/07-inventory.spec.ts

# Shipping
npx playwright test tests/e2e/phase-4-admin/08-shipping.spec.ts

# Leads
npx playwright test tests/e2e/phase-4-admin/09-leads.spec.ts
```

### With UI Mode
```bash
npx playwright test tests/e2e/phase-4-admin/ --ui
```

### With Debug Mode
```bash
npx playwright test tests/e2e/phase-4-admin/ --debug
```

## Admin Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin/dashboard` | Main dashboard with statistics |
| Orders | `/admin/orders` | Order management |
| Quotations | `/admin/quotations` | Quotation management (NEW) |
| Production | `/admin/production` | Production tracking |
| Shipments | `/admin/shipments` | Shipping management |
| Contracts | `/admin/contracts` | Contract management |
| Approvals | `/admin/approvals` | Member approval queue |
| Inventory | `/admin/inventory` | Inventory management |
| Leads | `/admin/leads` | Lead management |
| Settings | `/admin/settings` | System settings |

## Common Issues

### Authentication Failures
**Problem**: Tests fail with 401 Unauthorized
**Solution**: Ensure admin user exists with correct credentials
```bash
npx tsx scripts/reset-admin-password.ts
```

### Page Not Found
**Problem**: Tests fail with 404 for `/admin/quotations`
**Solution**: The page was created, ensure build is up to date
```bash
npm run build
npm run dev
```

### Data Not Loading
**Problem**: API calls return errors
**Solution**:
1. Check database connection in `.env.local`
2. Verify RLS policies allow admin access
3. Check Supabase service role key

### Navigation Items Missing
**Problem**: Tests can't find navigation links
**Solution**: AdminNavigation component was updated, ensure it's deployed
```bash
# Check navigation has all required links
grep -r "見積管理" src/components/admin/
```

## Test Data

### Current Test Admin
- Email: `admin@epackage-lab.com`
- Password: `Admin1234`
- Role: `ADMIN`
- Status: `ACTIVE`

### Creating Test Data
```bash
# Create comprehensive test data
npx tsx scripts/create-test-data.ts

# Create test users
npx tsx scripts/setup-test-users.ts
```

## Debugging

### Enable Detailed Logs
Add to test file:
```typescript
test.beforeEach(async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  page.on('pageerror', err => console.log(err));
});
```

### Check Network Requests
```typescript
test('example', async ({ page }) => {
  page.on('response', response => {
    if (response.url().includes('/api/admin')) {
      console.log(`API: ${response.url()} -> ${response.status()}`);
    }
  });
});
```

### Screenshot on Failure
```bash
npx playwright test tests/e2e/phase-4-admin/ --screenshot=only-on-failure
```

## Verification

### Quick Health Check
```bash
# Check all admin pages load (manual)
for page in dashboard orders quotations production shipments; do
  echo "Checking /admin/$page"
  curl -I http://localhost:3000/admin/$page 2>/dev/null | head -1
done
```

### Check Admin APIs
```bash
# Test dashboard statistics API
curl -H "Cookie: <admin-session-cookie>" \
  http://localhost:3000/api/admin/dashboard/statistics
```

## Files Changed

### New Files
- `src/app/admin/quotations/page.tsx` - Admin quotations page
- `ADMIN_PAGES_TEST_FIX_SUMMARY.md` - Detailed fix summary
- `ADMIN_TESTS_QUICK_START.md` - This file

### Modified Files
- `src/components/admin/AdminNavigation.tsx` - Added quotations link
- `.env.test` - Updated admin credentials
- `tests/e2e/phase-4-admin/*.spec.ts` - Updated credentials (5 files)
- `tests/fixtures/test-data.ts` - Updated admin defaults

## Support

For issues:
1. Check `ADMIN_PAGES_TEST_FIX_SUMMARY.md` for detailed information
2. Review Playwright report at `playwright-report/index.html`
3. Check test results in `test-results/results.json`
4. Review console logs and network requests in test output

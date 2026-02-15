<!-- Parent: ../AGENTS.md -->

# tests/ - Test Suites Directory

**Purpose**: Comprehensive test suites covering E2E, unit, integration, accessibility, performance, and security testing.

---

## Directory Structure

```
tests/
├── e2e/                    # End-to-end Playwright tests
├── unit/                   # Unit tests (Jest)
├── api/                    # API route integration tests
├── integration/            # Integration tests
├── accessibility/          # Accessibility tests
├── performance/            # Performance and load tests
├── security/               # Security tests
├── b2b/                    # B2B workflow tests
├── database/               # Database/integration tests
├── fixtures/               # Test fixtures and data
├── helpers/                # Test helper utilities
├── *.spec.ts               # Root-level E2E tests
├── playwright.config.ts    # Playwright configuration
├── package-scripts.json    # Test script definitions
├── TEST_SUMMARY.md         # Test coverage summary
└── README.md               # Testing guide (Japanese)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright E2E test configuration |
| `package-scripts.json` | NPM script definitions for testing |
| `TEST_SUMMARY.md` | Comprehensive test coverage summary |
| `README.md` | Testing execution guide (Japanese) |
| `setup.ts` | Global test setup |
| `quotation-order-workflow-test-plan.md` | Detailed test plan document |

---

## Subdirectories

### e2e/
**End-to-end tests using Playwright**

Main E2E test suites:
- `quotation-order-workflow.spec.ts` - Complete B2B workflow
- `admin-dashboard-comprehensive.spec.ts` - Admin dashboard tests
- `member-flow-enhanced.spec.ts` - Member portal workflows
- `b2b-workflow-e2e.spec.ts` - B2B transaction workflows
- `specification-change-workflow.spec.ts` - Spec change feature tests
- `production-tracking-enhanced.spec.ts` - Production tracking tests
- `global-setup.ts` / `global-teardown.ts` - Test lifecycle hooks

Grouped test directories:
- `group-a-public/` - Public page tests
- `group-b-auth/` - Authentication tests
- `group-c-member/` - Member portal tests
- `group-d-admin/` - Admin panel tests
- `group-e-redirects/` - Redirect tests
- `group-f-database/` - Database tests
- `phase-1-public/` through `phase-5-portal/` - Phase-based test suites

### unit/
**Unit tests using Jest**

Test files:
- `env-validation.test.ts` - Environment variable validation
- `mcp-api-security.test.ts` - MCP API security tests
- `sql-injection.test.ts` - SQL injection prevention tests

### api/
**API route integration tests**

Test files:
- `admin-api-endpoints.spec.ts` - Admin API endpoint tests
- `api-routes-integration.spec.ts` - API route integration tests
- `multi-quantity.test.ts` - Multi-quantity calculation tests

### integration/
**Integration test suites**

Test files:
- `transaction-race.spec.ts` - Transaction race condition tests

### accessibility/
**Accessibility tests using axe-core**

Test files:
- `multi-quantity-accessibility.test.ts` - Multi-quantity accessibility tests

### performance/
**Performance and load testing**

Test files:
- `load-testing.test.ts` - Load testing scenarios

### security/
**Security testing**

Test files:
- `csrf.spec.ts` - CSRF protection tests
- `csrf-attack.spec.ts` - CSRF attack simulation tests
- `file-upload-security.spec.ts` - File upload security tests

### b2b/
**B2B workflow tests**

Test files:
- `multi-quantity-workflow.test.tsx` - Multi-quantity workflow tests
- `sample-request-transaction.spec.ts` - Sample request transaction tests

### database/
**Database/integration tests**

Contains nested `integration/` subdirectory for database integration tests.

### fixtures/
**Test fixtures and data**

Reusable test data and mock objects.

### helpers/
**Test helper utilities**

Helper files:
- `dev-mode-auth.ts` - Dev mode authentication helpers
- `email-tester.ts` - Email testing utilities
- `supabase-helper.ts` - Supabase test helpers
- `test-data.ts` - Test data constants

---

## Root-Level Test Files

| File | Description |
|------|-------------|
| `about.spec.ts` | About page tests |
| `auth-email.spec.ts` | Authentication email tests |
| `catalog.spec.ts` | Catalog page tests |
| `contact-form.spec.ts` | Contact form tests |
| `dashboard-menu.spec.ts` | Dashboard menu tests |
| `login-flow.spec.ts` | Login flow tests |
| `member-pages.spec.ts` | Member pages tests |
| `member-pages-selectors-test.spec.ts` | Selector tests for member pages |
| `navigation.spec.ts` | Navigation tests |
| `post-processing.spec.ts` | Post-processing feature tests |
| `registration.spec.ts` | Registration flow tests |
| `roll-film-cost-verification.spec.ts` | Roll film cost calculation tests |
| `pdf-verification.spec.ts` | PDF generation tests |
| `admin-dashboard-error-handling.spec.ts` | Admin error handling tests |
| `comprehensive-audit.spec.ts` | Comprehensive audit tests |
| `implementation-validation.spec.ts` | Implementation validation tests |
| `member-portal-comprehensive.spec.ts` | Member portal comprehensive tests |

---

## AI Agents Section

### For AI Agents Working on Tests

#### Test Execution

**Run all E2E tests:**
```bash
npx playwright test
```

**Run specific test suite:**
```bash
npx playwright test e2e/quotation-order-workflow.spec.ts
npx playwright test --grep "Authentication"
npx playwright test --project=chromium
```

**Run with UI/debug mode:**
```bash
npx playwright test --ui
npx playwright test --debug
npx playwright test --headed
```

**Run unit tests:**
```bash
npm run test:unit
npm run test:coverage
```

**Run specific test categories:**
```bash
npm run test:accessibility
npm run test:api
npm run test:multi-quantity
```

#### Test Configuration

- **Playwright config**: `playwright.config.ts`
- **Base URL**: Defaults to `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Test directory**: `./tests/e2e`
- **Timeout**: 60 seconds default
- **Retries**: 2 on CI, 0 locally

#### Test Data

Test users defined in `e2e/test-data.ts`:
- Admin: `admin@example.com` / `Admin1234!`
- Member: `member@test.com` / `Member1234!`
- Korea Team: `korea@package-lab.com` / `Korea1234!`

#### Writing New Tests

1. **E2E Tests**: Place in `e2e/` directory, use `.spec.ts` suffix
2. **Unit Tests**: Place in `unit/` directory, use `.test.ts` suffix
3. **Page Objects**: Create in dedicated `pages/` subdirectory if needed
4. **Test Data**: Add to `helpers/test-data.ts`
5. **Fixtures**: Place in `fixtures/` directory

#### Test Guidelines

- Use descriptive test names following pattern: `should [expected behavior] when [condition]`
- Group related tests using `test.describe()`
- Use `test.beforeEach()` for setup, `test.afterEach()` for cleanup
- Use `page.pause()` for debugging
- Add comments for complex test logic
- Follow Page Object Model pattern for reusable elements

#### Coverage Areas

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | ✅ Complete | Login, registration, pending approval |
| Quotations | ✅ Complete | Create, view, approve, convert to order |
| Orders | ✅ Complete | CRUD, status updates, tracking |
| Admin Panel | ✅ Complete | Dashboard, quotations, orders, customers |
| Member Portal | ✅ Complete | Quotations, orders, profile, deliveries |
| B2B Workflow | ✅ Complete | Multi-SKU, specification changes |
| Production Tracking | ✅ Complete | Status updates, logs, data receipt |
| Accessibility | 🟡 Partial | Multi-quantity tested |
| Security | ✅ Complete | CSRF, file upload, SQL injection |
| Performance | 🟡 Partial | Load testing basic coverage |

---

## Dependencies

### NPM Scripts (from package.json)

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:unit": "jest --testPathPattern='src.*\\\\.(test|spec)\\\\.[jt]s(x?)$'",
  "test:integration": "jest --testPathPattern='tests.*\\\\.(test|spec)\\\\.[jt]s(x?)$'",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:multi-quantity": "jest --testPathPattern='multi-quantity'",
  "test:accessibility": "jest --testPathPattern='accessibility'",
  "test:api": "jest --testPathPattern='api'",
  "test:all": "npm run lint && npm run test:unit && npm run test:e2e && npm run test:performance",
  "test:ci": "jest --ci --coverage --watchAll=false"
}
```

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | ^1.56.1 | E2E testing framework |
| `jest` | ^30.2.0 | Unit/integration testing |
| `@testing-library/react` | ^16.3.0 | React component testing |
| `jest-axe` | ^10.0.0 | Accessibility testing |
| `axe-playwright` | ^2.2.2 | Playwright accessibility |
| `supertest` | ^7.1.4 | API endpoint testing |
| `@mswjs/data` | ^0.16.2 | Mock data generation |
| `msw` | ^2.12.4 | API mocking |

### Environment Setup

Required for E2E tests:
- Node.js >= 18.0.0
- Application server running on `http://localhost:3000`
- Supabase/PostgreSQL database connection
- Test users created in database

Install Playwright browsers:
```bash
npx playwright install
npx playwright install --with-deps
```

---

## Related Documentation

- `../AGENTS.md` - Parent project documentation
- `README.md` - Detailed testing guide (Japanese)
- `TEST_SUMMARY.md` - Test coverage summary
- `e2e/quotation-order-workflow-test-plan.md` - Detailed test plan
- `e2e/README.specification-change-tests.md` - Spec change test documentation

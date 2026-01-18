# Member Approval Tests - Quick Start

## Test File Location
`C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\tests\e2e\phase-4-admin\02-member-approval.spec.ts`

## Prerequisites

### Environment Setup
Ensure DEV_MODE is enabled in your environment:

```bash
# Windows (Command Prompt)
set NEXT_PUBLIC_DEV_MODE=true
set ENABLE_DEV_MOCK_AUTH=true

# Windows (PowerShell)
$env:NEXT_PUBLIC_DEV_MODE="true"
$env:ENABLE_DEV_MOCK_AUTH="true"

# Linux/Mac
export NEXT_PUBLIC_DEV_MODE=true
export ENABLE_DEV_MOCK_AUTH=true
```

### Dev Server
Start the development server on port 3000:
```bash
npm run dev
```

## Running the Tests

### Run All Member Approval Tests
```bash
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts
```

### Run Specific Test Case
```bash
# Test TC-4.2.1 only
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts -g "TC-4.2.1"

# Test approval functionality
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts -g "TC-4.2.3"
```

### Run with Interactive UI
```bash
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts --ui
```

### Run with Debug Mode
```bash
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts --debug
```

### Run in Specific Browser
```bash
# Chrome
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts --project=chromium

# Firefox
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts --project=firefox

# Safari
npx playwright test tests/e2e/phase-4-admin/02-member-approval.spec.ts --project=webkit
```

## Test Cases Overview

| Test ID | Description | Key Validations |
|---------|-------------|-----------------|
| TC-4.2.1 | Page loads correctly | Japanese title "会員承認待ち", count display |
| TC-4.2.2 | Member details visible | Email, company name, member info in cards |
| TC-4.2.3 | Member approval works | "承認" button, success message "承認しました" |
| TC-4.2.4 | Member rejection modal | "拒否" button, confirmation dialog "拒否の確認" |
| TC-4.2.5 | API call tracking | `/api/admin/approve-member` endpoint called |
| TC-4.2.6 | User type badges | "法人会員" or "個人会員" visible |
| TC-4.2.7 | Refresh functionality | "更新" button works |
| TC-4.2.8 | Business info display | Company type, rep name, corporate number |
| TC-4.2.9 | Individual approval | Approval buttons exist (no batch feature) |
| TC-4.2.10 | Statistics display | Count format "X件の承認待ちがあります" |

## Expected Page Structure

```
/admin/approvals
├── h1: "会員承認待ち" (Pending Member Approvals)
├── p: "X件の承認待ちがあります" (X pending approvals)
├── Button: "更新" (Refresh)
└── Cards Grid (when pending members exist)
    └── Each Card contains:
        ├── Company/Member Name
        ├── Email
        ├── Badge: "法人会員" or "個人会員"
        ├── Badge: "承認待ち" (Pending)
        ├── Business Details (種別, 代表者名, etc.)
        └── Actions:
            ├── Button: "承認" (Approve)
            └── Button: "拒否" (Reject)
                └── Opens Modal: "拒否の確認"
```

## Common Issues & Solutions

### Issue: "Cannot find h1:has-text('会員承認待ち')"
**Solution**: Ensure dev server is running on port 3000 with DEV_MODE=true

### Issue: "Test timeout"
**Solution**: Tests use `test.slow()` for 3x timeout. If still timing out, check server performance

### Issue: "No approve buttons found"
**Expected**: Tests handle empty state gracefully. If no pending members exist, tests pass without action

### Issue: "Console errors detected"
**Note**: Tests filter out NEXT_PUBLIC warnings. Only actual errors are reported

## After Test Runs

### View HTML Report
```bash
npx playwright show-report playwright-report
```

### View Test Results
```bash
# JSON
cat test-results/results.json

# XML
cat test-results/results.xml
```

### View Screenshots (on failure)
```bash
# Screenshots saved to:
test-results/[test-name]/[browser]/screenshot.png
```

## Next Steps

After tests pass successfully:
1. Review test coverage in HTML report
2. Check for any console warnings
3. Verify all 10 test cases pass
4. Run full Phase 4 admin test suite:
   ```bash
   npx playwright test tests/e2e/phase-4-admin/
   ```

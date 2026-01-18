@echo off
REM GROUP F: Validation & Security - Fully Parallel Execution
REM 11 files, 6 workers, ~6 minutes

echo =========================================
echo GROUP F: Validation & Security (Chromium Only)
echo =========================================
echo Files: 11
echo Workers: 6
echo Estimated time: ~6 minutes
echo.

npx playwright test all-pages-validation.spec.ts comprehensive-page-validation.spec.ts comprehensive-page-validation-fixed.spec.ts admin-dashboard-comprehensive.spec.ts comprehensive-console-check.spec.ts security-fixes.spec.ts customer-approvals.spec.ts order-comments.spec.ts task-verification.spec.ts console-error-check.spec.ts file-validation.spec.ts --project=chromium --workers=6

if errorlevel 1 (
    echo.
    echo ERROR: Group F tests failed!
    exit /b 1
)

echo.
echo =========================================
echo GROUP F Complete!
echo =========================================
exit /b 0

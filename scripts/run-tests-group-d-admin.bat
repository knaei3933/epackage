@echo off
REM GROUP D: Admin Portal - Parallel After Auth
REM 10 files, 5 workers, ~6 minutes

echo =========================================
echo GROUP D: Admin Portal (Chromium Only)
echo =========================================
echo Files: 10
echo Workers: 5
echo Estimated time: ~6 minutes
echo Requires: ADMIN authentication
echo.

npx playwright test tests/e2e/phase-4-admin/ admin-approval-flow.spec.ts --project=chromium --workers=5

if errorlevel 1 (
    echo.
    echo ERROR: Group D tests failed!
    exit /b 1
)

echo.
echo =========================================
echo GROUP D Complete!
echo =========================================
exit /b 0
